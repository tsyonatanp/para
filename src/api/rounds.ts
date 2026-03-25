import { supabase } from '../lib/supabase';
import { SlaughterRound, MeatPart } from '../types';
import { activeRound, meatParts as mockParts } from '../data/mockData';

// ============================================
// ROUNDS API
// ============================================

/** Fetch the currently active (open) round with its parts */
export async function fetchActiveRound(): Promise<{ round: SlaughterRound; parts: MeatPart[] } | null> {
  if (!supabase) {
    // Fallback to mock data
    return { round: activeRound, parts: [...mockParts] };
  }

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !rounds || rounds.length === 0) {
    console.warn('No active round found, using mock data:', error?.message);
    return { round: activeRound, parts: [...mockParts] };
  }

  const round = mapRoundFromDb(rounds[0]);

  const { data: parts, error: partsError } = await supabase
    .from('parts')
    .select('*')
    .eq('round_id', round.id);

  if (partsError || !parts) {
    console.warn('Failed to fetch parts:', partsError?.message);
    return { round, parts: [...mockParts] };
  }

  return { round, parts: parts.map(mapPartFromDb) };
}

/** Create a new round (butcher only) */
export async function createRound(round: Partial<SlaughterRound>): Promise<SlaughterRound | null> {
  if (!supabase) {
    console.warn('Supabase not configured – cannot create round');
    return null;
  }

  const { data, error } = await supabase
    .from('rounds')
    .insert({
      butcher_name: round.butcherName,
      animal_type: round.animalType,
      slaughter_date: round.slaughterDate,
      order_close_date: round.orderCloseDate,
      total_weight_kg: round.totalWeightKg,
      status: 'open',
      visibility: round.visibility || 'public',
      location: round.location,
    })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create round:', error?.message);
    return null;
  }

  return mapRoundFromDb(data);
}

/** Subscribe to real-time part updates for a round */
export function subscribeToPartsUpdates(
  roundId: string,
  onUpdate: (parts: MeatPart[]) => void
) {
  if (!supabase) return null;

  const channel = supabase!
    .channel(`parts-${roundId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'parts',
        filter: `round_id=eq.${roundId}`,
      },
      async () => {
        // Refetch all parts for this round on any change
        const { data } = await supabase!
          .from('parts')
          .select('*')
          .eq('round_id', roundId);
        if (data) {
          onUpdate(data.map(mapPartFromDb));
        }
      }
    )
    .subscribe();

  return () => {
    supabase!.removeChannel(channel);
  };
}

// ============================================
// DB MAPPERS
// ============================================

function mapRoundFromDb(row: any): SlaughterRound {
  return {
    id: row.id,
    butcherId: row.butcher_id || '',
    butcherName: row.butcher_name,
    animalType: row.animal_type,
    slaughterDate: row.slaughter_date,
    orderCloseDate: row.order_close_date,
    totalWeightKg: row.total_weight_kg,
    bufferPercent: row.buffer_percent,
    status: row.status,
    visibility: row.visibility,
    location: row.location,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapPartFromDb(row: any): MeatPart {
  return {
    id: row.id,
    roundId: row.round_id || '',
    nameHe: row.name_he,
    nameEn: row.name_en,
    description: row.description || '',
    cookingSuggestions: row.cooking_suggestions || [],
    svgPathId: row.svg_path_id || row.id,
    totalKg: Number(row.total_kg),
    soldKg: Number(row.sold_kg),
    bufferKg: Number(row.buffer_kg),
    pricePerKg: Number(row.price_per_kg),
    processingOptions: row.processing_options || ['whole'],
    defaultPercent: Number(row.default_percent),
    emoji: row.emoji || '🥩',
  };
}
