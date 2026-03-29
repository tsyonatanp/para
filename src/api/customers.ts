import { supabase } from '../lib/supabase';
import type { CustomerEntry, CustomerStatus, ButcherEntry } from '../stores/authStore';

// ============================================
// CUSTOMERS API (Supabase)
// ============================================

interface DbCustomer {
  id: string;
  phone: string;
  name: string;
  role: string;
  password_hash: string | null;
  city: string | null;
  status: string;
  created_at: string;
}

function mapCustomerFromDb(row: DbCustomer): CustomerEntry {
  return {
    phone: row.phone,
    name: row.name,
    password: row.password_hash || '',
    city: row.city || undefined,
    status: (row.status || 'approved') as CustomerStatus,
    registeredAt: new Date(row.created_at).getTime(),
  };
}

function mapButcherFromDb(row: DbCustomer): ButcherEntry {
  return {
    phone: row.phone,
    name: row.name,
    password: row.password_hash || '',
    addedAt: new Date(row.created_at).getTime(),
  };
}

// ---- Fetch ----

export async function fetchCustomers(): Promise<CustomerEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Failed to fetch customers:', error?.message);
    return [];
  }
  return data.map(mapCustomerFromDb);
}

export async function fetchButchers(): Promise<ButcherEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('role', 'butcher')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.warn('Failed to fetch butchers:', error?.message);
    return [];
  }
  return data.map(mapButcherFromDb);
}

// ---- Register customer ----

export async function registerCustomerDb(
  phone: string, name: string, password: string, city?: string
): Promise<{ success: boolean; reason?: string }> {
  if (!supabase) return { success: false, reason: 'DB not configured' };

  // Check if phone already exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id, password_hash')
    .eq('phone', phone)
    .limit(1);

  if (existing && existing.length > 0) {
    const entry = existing[0];
    if (entry.password_hash) {
      return { success: false, reason: 'מספר כבר רשום' };
    }
    // Migrated customer with empty password — update with new password
    const { error } = await supabase
      .from('customers')
      .update({ password_hash: password, name, city: city || null })
      .eq('id', entry.id);
    if (error) return { success: false, reason: error.message };
    return { success: true };
  }

  const { error } = await supabase
    .from('customers')
    .insert({
      phone, name, password_hash: password,
      role: 'customer', city: city || null, status: 'pending',
    });

  if (error) {
    if (error.code === '23505') return { success: false, reason: 'מספר כבר רשום' };
    return { success: false, reason: error.message };
  }
  return { success: true };
}

// ---- Approve / Reject / Block / Delete ----

export async function approveCustomerDb(phone: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .update({ status: 'approved' })
    .eq('phone', phone);
  return !error;
}

export async function rejectCustomerDb(phone: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('phone', phone);
  return !error;
}

export async function blockCustomerDb(phone: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .update({ status: 'rejected' })
    .eq('phone', phone);
  return !error;
}

export async function deleteCustomerDb(phone: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('phone', phone);
  return !error;
}

export async function resetCustomerPasswordDb(phone: string, newPassword: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .update({ password_hash: newPassword })
    .eq('phone', phone);
  return !error;
}

// ---- Find customer (for login) ----

export async function findCustomerDb(phone: string): Promise<CustomerEntry | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('phone', phone)
    .eq('role', 'customer')
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return mapCustomerFromDb(data[0]);
}

// ---- Butcher management ----

export async function addButcherDb(phone: string, name: string, password: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .insert({
      phone, name, password_hash: password,
      role: 'butcher', status: 'approved',
    });
  return !error;
}

export async function removeButcherDb(phone: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('phone', phone)
    .eq('role', 'butcher');
  return !error;
}

// ---- Realtime subscription ----

export function subscribeToCustomers(callback: (customers: CustomerEntry[]) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('customers-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'customers' },
      () => {
        // Re-fetch all customers on any change
        fetchCustomers().then(callback);
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}
