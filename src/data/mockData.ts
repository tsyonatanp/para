import { SlaughterRound, MeatPart, Order } from '../types';

// Active round: Angus cow, slaughter Thursday
const now = new Date('2026-03-18T10:00:00+02:00');
const slaughterDate = new Date('2026-03-20T08:00:00+02:00');
const closeDate = new Date('2026-03-19T20:00:00+02:00');

export const MOCK_ROUND: SlaughterRound = {
  id: 'round-001',
  butcherId: 'butcher-001',
  butcherName: 'מוחמד אל-עמר',
  animalType: 'cow',
  slaughterDate: slaughterDate.toISOString(),
  orderCloseDate: closeDate.toISOString(),
  totalWeightKg: 250,
  bufferPercent: 10,
  status: 'open',
  visibility: 'public',
  createdAt: now.toISOString(),
  location: 'כפר קרע, ישראל',
};

export const MOCK_PARTS: MeatPart[] = [
  { id: 'entrecote', roundId: 'round-001', nameHe: 'אנטריקוט', nameEn: 'Entrecote', description: 'חלק פרימיום ריחני ועסיסי.', cookingSuggestions: ['סטייק על הגריל', 'צלייה בתנור'], svgPathId: 'part-entrecote', totalKg: 20, soldKg: 14, bufferKg: 2, pricePerKg: 120, processingOptions: ['whole', 'sliced'], defaultPercent: 8, emoji: '🥩' },
  { id: 'ribs', roundId: 'round-001', nameHe: 'צלעות', nameEn: 'Ribs', description: 'צלעות עסיסיות מתאימות לבישול ארוך.', cookingSuggestions: ['BBQ', 'בישול איטי'], svgPathId: 'part-ribs', totalKg: 30, soldKg: 15, bufferKg: 3, pricePerKg: 80, processingOptions: ['whole', 'sliced'], defaultPercent: 12, emoji: '🍖' },
  { id: 'brisket', roundId: 'round-001', nameHe: 'חזה', nameEn: 'Brisket', description: 'חלק עשיר בשומן מתאים לעישון או בישול ארוך.', cookingSuggestions: ['עישון', 'קדירה'], svgPathId: 'part-brisket', totalKg: 18, soldKg: 5, bufferKg: 1, pricePerKg: 70, processingOptions: ['whole', 'cubed'], defaultPercent: 5, emoji: '🥩' },
  { id: 'shoulder_center', roundId: 'round-001', nameHe: 'כתף מרכזי', nameEn: 'Shoulder Center', description: 'חלק שרירי לבישול איטי.', cookingSuggestions: ['נסיבות', 'קציצות'], svgPathId: 'part-shoulder_center', totalKg: 15, soldKg: 8, bufferKg: 2, pricePerKg: 65, processingOptions: ['whole', 'sliced', 'cubed', 'ground'], defaultPercent: 6, emoji: '🥩' },
  { id: 'shoulder_roast', roundId: 'round-001', nameHe: 'צלי כתף', nameEn: 'Shoulder Roast', description: 'נתח מצוין לצלי קדירה קלאסי.', cookingSuggestions: ['צלי מסורתי'], svgPathId: 'part-shoulder_roast', totalKg: 12, soldKg: 10, bufferKg: 1, pricePerKg: 75, processingOptions: ['whole', 'sliced'], defaultPercent: 4, emoji: '🥩' },
  { id: 'mock_fillet', roundId: 'round-001', nameHe: 'פילה מדומה', nameEn: 'Mock Fillet', description: 'נתח רזה המזכיר בצורתו פילה, מצוין לבישול ברוטב.', cookingSuggestions: ['בישול ארוך ברוטב'], svgPathId: 'part-mock_fillet', totalKg: 8, soldKg: 4, bufferKg: 1, pricePerKg: 85, processingOptions: ['whole', 'sliced'], defaultPercent: 3, emoji: '🥩' },
  { id: 'rib_cover', roundId: 'round-001', nameHe: 'מכסה הצלע', nameEn: 'Rib Cover', description: 'שכבת השומן והבשר המכסה את האנטריקוט.', cookingSuggestions: ['טחינה', 'תבשיל'], svgPathId: 'part-rib_cover', totalKg: 10, soldKg: 2, bufferKg: 1, pricePerKg: 55, processingOptions: ['ground', 'cubed'], defaultPercent: 3, emoji: '🍖' },
  { id: 'front_shank', roundId: 'round-001', nameHe: 'זרוע', nameEn: 'Front Shank', description: 'שוק קדמית, עשירה בקולגן.', cookingSuggestions: ['מרק', 'אוסובוקו קדמי'], svgPathId: 'part-front_shank', totalKg: 15, soldKg: 5, bufferKg: 1, pricePerKg: 50, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🍖' },
  { id: 'asado', roundId: 'round-001', nameHe: 'אסדו', nameEn: 'Asado', description: 'קשתות צלעות (שפונדרה) מושלמות לעישון ואפייה ארוכה.', cookingSuggestions: ['עישון', 'אסדו בתנור'], svgPathId: 'part-asado', totalKg: 25, soldKg: 25, bufferKg: 0, pricePerKg: 90, processingOptions: ['whole', 'sliced'], defaultPercent: 8, emoji: '🍖' },
  { id: 'neck', roundId: 'round-001', nameHe: 'צוואר', nameEn: 'Neck', description: 'בשר מתקתק ושרירי, מצוין לתבשילים ארוכים וטחינה.', cookingSuggestions: ['גולאש', 'טחינה'], svgPathId: 'part-neck', totalKg: 20, soldKg: 4, bufferKg: 2, pricePerKg: 45, processingOptions: ['whole', 'cubed'], defaultPercent: 8, emoji: '🍖' },
  { id: 'sirloin', roundId: 'round-001', nameHe: 'סינטה', nameEn: 'Sirloin', description: 'רזה ואיכותי, אידיאלי לצלייה קצרה.', cookingSuggestions: ['סטייק', 'רוסטביף'], svgPathId: 'part-sirloin', totalKg: 15, soldKg: 12, bufferKg: 1.5, pricePerKg: 110, processingOptions: ['whole', 'sliced', 'cubed'], defaultPercent: 6, emoji: '🥩' },
  { id: 'fillet', roundId: 'round-001', nameHe: 'פילה', nameEn: 'Tenderloin', description: 'הנתח הרך והיקר ביותר בקר.', cookingSuggestions: ['סטייק', 'קרפצ׳ו'], svgPathId: 'part-fillet', totalKg: 10, soldKg: 10, bufferKg: 1, pricePerKg: 165, processingOptions: ['whole', 'sliced'], defaultPercent: 4, emoji: '🥩' },
  { id: 'shaitel', roundId: 'round-001', nameHe: 'שייטל', nameEn: 'Rumpsteak', description: 'בשר רזה וטעים להפליא, מעולה לשניצל או הקפצה.', cookingSuggestions: ['מנות מוקפצות', 'שניצל עגל', 'סטייק'], svgPathId: 'part-shaitel', totalKg: 14, soldKg: 6, bufferKg: 1, pricePerKg: 95, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🥩' },
  { id: 'avasit', roundId: 'round-001', nameHe: 'אווזית', nameEn: 'Silverside', description: 'בשר רזה המצוי ברגל האחורית.', cookingSuggestions: ['צלי עדין', 'גולאש'], svgPathId: 'part-avasit', totalKg: 16, soldKg: 3, bufferKg: 1, pricePerKg: 75, processingOptions: ['whole', 'cubed'], defaultPercent: 5, emoji: '🥩' },
  { id: 'chach', roundId: 'round-001', nameHe: "צ'אך", nameEn: 'Outside Meat', description: 'חלק נהדר לבישול בקדירה וצלי.', cookingSuggestions: ['צלי בקדירה'], svgPathId: 'part-chach', totalKg: 12, soldKg: 2, bufferKg: 1, pricePerKg: 70, processingOptions: ['whole', 'cubed'], defaultPercent: 4, emoji: '🥩' },
  { id: 'kaf', roundId: 'round-001', nameHe: 'כף', nameEn: 'Topside', description: 'חלק רזה מהירך הפנימית.', cookingSuggestions: ['שניצל בקר', 'אסקלופ'], svgPathId: 'part-kaf', totalKg: 15, soldKg: 8, bufferKg: 1, pricePerKg: 85, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🥩' },
  { id: 'flank', roundId: 'round-001', nameHe: 'פלדה', nameEn: 'Flank', description: 'בשר בטן, אידיאלי גם לטחינה.', cookingSuggestions: ['המבורגר', 'תבשיל בטן'], svgPathId: 'part-flank', totalKg: 25, soldKg: 10, bufferKg: 2, pricePerKg: 55, processingOptions: ['ground', 'whole'], defaultPercent: 8, emoji: '🫙' },
  { id: 'rear_shank', roundId: 'round-001', nameHe: 'שריר אחורי', nameEn: 'Rear Shank', description: 'שוק אחורית ארוכה, מלאה קולגן לבישול ממושך.', cookingSuggestions: ['אוסובוקו', 'מרק'], svgPathId: 'part-rear_shank', totalKg: 15, soldKg: 4, bufferKg: 1, pricePerKg: 55, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🍖' },
  { id: 'weissbraten', roundId: 'round-001', nameHe: 'ויסבראטן', nameEn: 'Weissbraten', description: 'נתח רזה ובהיר, טוב לבישול ברוטב לחות.', cookingSuggestions: ['צלי ברוטב'], svgPathId: 'part-weissbraten', totalKg: 10, soldKg: 1, bufferKg: 1, pricePerKg: 80, processingOptions: ['whole', 'sliced'], defaultPercent: 3, emoji: '🥩' },
  { id: 'bones', roundId: 'round-001', nameHe: 'עצמות / ציר', nameEn: 'Bones / Stock', description: 'עצמות למרק או ציר בריא ועשיר.', cookingSuggestions: ['ציר עצמות', 'מרק', 'רמן'], svgPathId: 'part-bones', totalKg: 25, soldKg: 5, bufferKg: 2.5, pricePerKg: 20, processingOptions: ['whole'], defaultPercent: 5, emoji: '🦴' },
  { id: 'other', roundId: 'round-001', nameHe: 'כבד / לב / לשון', nameEn: 'Offal', description: 'פנים התרת בקר', cookingSuggestions: ['קבב כבד', 'כבד מטוגן'], svgPathId: 'part-other', totalKg: 18, soldKg: 2, bufferKg: 1.8, pricePerKg: 40, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🫀' },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    roundId: 'round-001',
    userId: 'user-001',
    userName: 'יוסי כהן',
    userPhone: '050-1234567',
    items: [
      { partId: 'entrecote', partNameHe: 'אנטריקוט', partEmoji: '🥩', kg: 1.5, processing: 'sliced', notes: 'פרוס דק', pricePerKg: 120, subtotal: 180 },
      { partId: 'ribs', partNameHe: 'צלעות', partEmoji: '🍖', kg: 2.0, processing: 'whole', notes: '', pricePerKg: 80, subtotal: 160 },
    ],
    deliveryType: 'delivery',
    deliveryAddress: 'רחוב הרצל 12, תל אביב',
    paymentType: 'full',
    amountPaid: 340,
    totalPrice: 340,
    status: 'confirmed',
    createdAt: '2026-03-17T14:30:00+02:00',
  },
  {
    id: 'ord-002',
    roundId: 'round-001',
    userId: 'user-002',
    userName: 'רחל מזרחי',
    userPhone: '052-9876543',
    items: [
      { partId: 'shoulder', partNameHe: 'כתף', partEmoji: '🥩', kg: 2.0, processing: 'cubed', notes: 'לנסיבות', pricePerKg: 65, subtotal: 130 },
      { partId: 'ground', partNameHe: 'טחון', partEmoji: '🫙', kg: 2.0, processing: 'ground', notes: '20% שומן', pricePerKg: 55, subtotal: 110 },
    ],
    deliveryType: 'pickup',
    paymentType: 'deposit',
    amountPaid: 72,
    totalPrice: 240,
    status: 'pending',
    createdAt: '2026-03-17T16:00:00+02:00',
  },
  {
    id: 'ord-003',
    roundId: 'round-001',
    userId: 'user-003',
    userName: 'אחמד חסן',
    userPhone: '054-5551234',
    items: [
      { partId: 'sirloin', partNameHe: 'סינטה', partEmoji: '🥩', kg: 1.5, processing: 'sliced', notes: '', pricePerKg: 110, subtotal: 165 },
      { partId: 'bones', partNameHe: 'עצמות / ציר', partEmoji: '🦴', kg: 3.0, processing: 'whole', notes: 'לציר', pricePerKg: 20, subtotal: 60 },
    ],
    deliveryType: 'pickup',
    paymentType: 'full',
    amountPaid: 225,
    totalPrice: 225,
    status: 'confirmed',
    createdAt: '2026-03-17T17:15:00+02:00',
  },
  {
    id: 'ord-004',
    roundId: 'round-001',
    userId: 'user-004',
    userName: 'שרה לוי',
    userPhone: '058-7773456',
    items: [
      { partId: 'neck', partNameHe: 'צוואר', partEmoji: '🍖', kg: 2.5, processing: 'cubed', notes: '', pricePerKg: 45, subtotal: 112.5 },
      { partId: 'other', partNameHe: 'כבד / לב / לשון', partEmoji: '🫀', kg: 1.0, processing: 'whole', notes: '', pricePerKg: 40, subtotal: 40 },
    ],
    deliveryType: 'delivery',
    deliveryAddress: 'שדרות ירושלים 5, יפו',
    paymentType: 'deposit',
    amountPaid: 45,
    totalPrice: 152.5,
    status: 'pending',
    createdAt: '2026-03-18T08:00:00+02:00',
  },
  {
    id: 'ord-005',
    roundId: 'round-001',
    userId: 'user-005',
    userName: 'מנחם בן דוד',
    userPhone: '050-2223344',
    items: [
      { partId: 'entrecote', partNameHe: 'אנטריקוט', partEmoji: '🥩', kg: 2.0, processing: 'whole', notes: 'T-bone אם אפשר', pricePerKg: 120, subtotal: 240 },
      { partId: 'ground', partNameHe: 'טחון', partEmoji: '🫙', kg: 1.5, processing: 'ground', notes: '', pricePerKg: 55, subtotal: 82.5 },
    ],
    deliveryType: 'pickup',
    paymentType: 'full',
    amountPaid: 322.5,
    totalPrice: 322.5,
    status: 'prepared',
    createdAt: '2026-03-17T20:00:00+02:00',
  },
];

// Compute derived stats
export function getRoundStats(parts: MeatPart[]) {
  const totalSold = parts.reduce((sum, p) => sum + p.soldKg, 0);
  const totalAvailable = parts.reduce((sum, p) => sum + (p.totalKg - p.soldKg - p.bufferKg), 0);
  const totalKg = parts.reduce((sum, p) => sum + p.totalKg, 0);
  const soldPercent = Math.round((totalSold / totalKg) * 100);
  const expectedRevenue = parts.reduce((sum, p) => sum + p.soldKg * p.pricePerKg, 0);
  return { totalSold, totalAvailable, totalKg, soldPercent, expectedRevenue };
}

export function getPartAvailability(part: MeatPart): number {
  const available = part.totalKg - part.soldKg - part.bufferKg;
  const pct = (available / part.totalKg) * 100;
  return Math.max(0, pct);
}

export function getPartColor(pct: number, isSelected = false): string {
  if (isSelected) return '#3b82f6';
  if (pct <= 0) return '#4b5563';
  if (pct < 10) return '#ef4444';
  if (pct < 30) return '#f97316';
  if (pct < 60) return '#eab308';
  return '#22c55e';
}

export function getAvailabilityLabel(pct: number): string {
  if (pct <= 0) return 'אזל';
  if (pct < 10) return '🔥 אחרון!';
  if (pct < 30) return '⚡ ממהרים!';
  if (pct < 60) return 'זמינות בינונית';
  return 'זמין';
}

// Short aliases for cleaner imports
export const activeRound = MOCK_ROUND;
export const meatParts = MOCK_PARTS;
export const mockOrders = MOCK_ORDERS;

