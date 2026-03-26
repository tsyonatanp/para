import { SlaughterRound, MeatPart, Order } from '../types';

// Active round: Angus cow, slaughter Thursday
const now = new Date('2026-03-18T10:00:00+02:00');
const slaughterDate = new Date('2026-03-20T08:00:00+02:00');
const closeDate = new Date('2026-03-19T20:00:00+02:00');

export const MOCK_ROUND: SlaughterRound = {
  id: 'round-001',
  butcherId: 'butcher-001',
  butcherName: 'דביר ישראלי',
  animalType: 'cow',
  slaughterDate: slaughterDate.toISOString(),
  orderCloseDate: closeDate.toISOString(),
  totalWeightKg: 250,
  bufferPercent: 10,
  status: 'open',
  visibility: 'public',
  createdAt: now.toISOString(),
  location: 'רחובות, ישראל',
};

export const MOCK_PARTS: MeatPart[] = [
  { id: 'entrecote', roundId: 'round-001', nameHe: 'אנטריקוט', nameEn: 'Entrecote', description: 'חלק פרימיום ריחני ועסיסי.', cookingSuggestions: ['סטייק על הגריל', 'צלייה בתנור'], svgPathId: 'part-entrecote', totalKg: 20, soldKg: 0, bufferKg: 2, pricePerKg: 120, processingOptions: ['whole', 'sliced'], defaultPercent: 8, emoji: '🥩' },
  { id: 'ribs', roundId: 'round-001', nameHe: 'צלעות', nameEn: 'Ribs', description: 'צלעות עסיסיות מתאימות לבישול ארוך.', cookingSuggestions: ['BBQ', 'בישול איטי'], svgPathId: 'part-ribs', totalKg: 30, soldKg: 0, bufferKg: 3, pricePerKg: 80, processingOptions: ['whole', 'sliced'], defaultPercent: 12, emoji: '🍖' },
  { id: 'brisket', roundId: 'round-001', nameHe: 'חזה', nameEn: 'Brisket', description: 'חלק עשיר בשומן מתאים לעישון או בישול ארוך.', cookingSuggestions: ['עישון', 'קדירה'], svgPathId: 'part-brisket', totalKg: 18, soldKg: 0, bufferKg: 1, pricePerKg: 70, processingOptions: ['whole', 'cubed'], defaultPercent: 5, emoji: '🥩' },
  { id: 'shoulder_center', roundId: 'round-001', nameHe: 'כתף מרכזי', nameEn: 'Shoulder Center', description: 'חלק שרירי לבישול איטי.', cookingSuggestions: ['נסיבות', 'קציצות'], svgPathId: 'part-shoulder_center', totalKg: 15, soldKg: 0, bufferKg: 2, pricePerKg: 65, processingOptions: ['whole', 'sliced', 'cubed', 'ground'], defaultPercent: 6, emoji: '🥩' },
  { id: 'shoulder_roast', roundId: 'round-001', nameHe: 'צלי כתף', nameEn: 'Shoulder Roast', description: 'נתח מצוין לצלי קדירה קלאסי.', cookingSuggestions: ['צלי מסורתי'], svgPathId: 'part-shoulder_roast', totalKg: 12, soldKg: 0, bufferKg: 1, pricePerKg: 75, processingOptions: ['whole', 'sliced'], defaultPercent: 4, emoji: '🥩' },
  { id: 'mock_fillet', roundId: 'round-001', nameHe: 'פילה מדומה', nameEn: 'Mock Fillet', description: 'נתח רזה המזכיר בצורתו פילה, מצוין לבישול ברוטב.', cookingSuggestions: ['בישול ארוך ברוטב'], svgPathId: 'part-mock_fillet', totalKg: 8, soldKg: 0, bufferKg: 1, pricePerKg: 85, processingOptions: ['whole', 'sliced'], defaultPercent: 3, emoji: '🥩' },
  { id: 'rib_cover', roundId: 'round-001', nameHe: 'מכסה הצלע', nameEn: 'Rib Cover', description: 'שכבת השומן והבשר המכסה את האנטריקוט.', cookingSuggestions: ['טחינה', 'תבשיל'], svgPathId: 'part-rib_cover', totalKg: 10, soldKg: 0, bufferKg: 1, pricePerKg: 55, processingOptions: ['ground', 'cubed'], defaultPercent: 3, emoji: '🍖' },
  { id: 'front_shank', roundId: 'round-001', nameHe: 'זרוע', nameEn: 'Front Shank', description: 'שוק קדמית, עשירה בקולגן.', cookingSuggestions: ['מרק', 'אוסובוקו קדמי'], svgPathId: 'part-front_shank', totalKg: 15, soldKg: 0, bufferKg: 1, pricePerKg: 50, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🍖' },
  { id: 'asado', roundId: 'round-001', nameHe: 'אסדו', nameEn: 'Asado', description: 'קשתות צלעות (שפונדרה) מושלמות לעישון ואפייה ארוכה.', cookingSuggestions: ['עישון', 'אסדו בתנור'], svgPathId: 'part-asado', totalKg: 25, soldKg: 0, bufferKg: 0, pricePerKg: 90, processingOptions: ['whole', 'sliced'], defaultPercent: 8, emoji: '🍖' },
  { id: 'neck', roundId: 'round-001', nameHe: 'צוואר', nameEn: 'Neck', description: 'בשר מתקתק ושרירי, מצוין לתבשילים ארוכים וטחינה.', cookingSuggestions: ['גולאש', 'טחינה'], svgPathId: 'part-neck', totalKg: 20, soldKg: 0, bufferKg: 2, pricePerKg: 45, processingOptions: ['whole', 'cubed'], defaultPercent: 8, emoji: '🍖' },
  { id: 'sirloin', roundId: 'round-001', nameHe: 'סינטה', nameEn: 'Sirloin', description: 'רזה ואיכותי, אידיאלי לצלייה קצרה.', cookingSuggestions: ['סטייק', 'רוסטביף'], svgPathId: 'part-sirloin', totalKg: 15, soldKg: 0, bufferKg: 1.5, pricePerKg: 110, processingOptions: ['whole', 'sliced', 'cubed'], defaultPercent: 6, emoji: '🥩' },
  { id: 'fillet', roundId: 'round-001', nameHe: 'פילה', nameEn: 'Tenderloin', description: 'הנתח הרך והיקר ביותר בקר.', cookingSuggestions: ['סטייק', 'קרפצ׳ו'], svgPathId: 'part-fillet', totalKg: 10, soldKg: 0, bufferKg: 1, pricePerKg: 165, processingOptions: ['whole', 'sliced'], defaultPercent: 4, emoji: '🥩' },
  { id: 'shaitel', roundId: 'round-001', nameHe: 'שייטל', nameEn: 'Rumpsteak', description: 'בשר רזה וטעים להפליא, מעולה לשניצל או הקפצה.', cookingSuggestions: ['מנות מוקפצות', 'שניצל עגל', 'סטייק'], svgPathId: 'part-shaitel', totalKg: 14, soldKg: 0, bufferKg: 1, pricePerKg: 95, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🥩' },
  { id: 'avasit', roundId: 'round-001', nameHe: 'אווזית', nameEn: 'Silverside', description: 'בשר רזה המצוי ברגל האחורית.', cookingSuggestions: ['צלי עדין', 'גולאש'], svgPathId: 'part-avasit', totalKg: 16, soldKg: 0, bufferKg: 1, pricePerKg: 75, processingOptions: ['whole', 'cubed'], defaultPercent: 5, emoji: '🥩' },
  { id: 'chach', roundId: 'round-001', nameHe: "צ'אך", nameEn: 'Outside Meat', description: 'חלק נהדר לבישול בקדירה וצלי.', cookingSuggestions: ['צלי בקדירה'], svgPathId: 'part-chach', totalKg: 12, soldKg: 0, bufferKg: 1, pricePerKg: 70, processingOptions: ['whole', 'cubed'], defaultPercent: 4, emoji: '🥩' },
  { id: 'kaf', roundId: 'round-001', nameHe: 'כף', nameEn: 'Topside', description: 'חלק רזה מהירך הפנימית.', cookingSuggestions: ['שניצל בקר', 'אסקלופ'], svgPathId: 'part-kaf', totalKg: 15, soldKg: 0, bufferKg: 1, pricePerKg: 85, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🥩' },
  { id: 'flank', roundId: 'round-001', nameHe: 'פלדה', nameEn: 'Flank', description: 'בשר בטן, אידיאלי גם לטחינה.', cookingSuggestions: ['המבורגר', 'תבשיל בטן'], svgPathId: 'part-flank', totalKg: 25, soldKg: 0, bufferKg: 2, pricePerKg: 55, processingOptions: ['ground', 'whole'], defaultPercent: 8, emoji: '🫙' },
  { id: 'rear_shank', roundId: 'round-001', nameHe: 'שריר אחורי', nameEn: 'Rear Shank', description: 'שוק אחורית ארוכה, מלאה קולגן לבישול ממושך.', cookingSuggestions: ['אוסובוקו', 'מרק'], svgPathId: 'part-rear_shank', totalKg: 15, soldKg: 0, bufferKg: 1, pricePerKg: 55, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🍖' },
  { id: 'weissbraten', roundId: 'round-001', nameHe: 'ויסבראטן', nameEn: 'Weissbraten', description: 'נתח רזה ובהיר, טוב לבישול ברוטב לחות.', cookingSuggestions: ['צלי ברוטב'], svgPathId: 'part-weissbraten', totalKg: 10, soldKg: 0, bufferKg: 1, pricePerKg: 80, processingOptions: ['whole', 'sliced'], defaultPercent: 3, emoji: '🥩' },
  { id: 'bones', roundId: 'round-001', nameHe: 'עצמות / ציר', nameEn: 'Bones / Stock', description: 'עצמות למרק או ציר בריא ועשיר.', cookingSuggestions: ['ציר עצמות', 'מרק', 'רמן'], svgPathId: 'part-bones', totalKg: 25, soldKg: 0, bufferKg: 2.5, pricePerKg: 20, processingOptions: ['whole'], defaultPercent: 5, emoji: '🦴' },
  { id: 'other', roundId: 'round-001', nameHe: 'כבד / לב / לשון', nameEn: 'Offal', description: 'פנים התרת בקר', cookingSuggestions: ['קבב כבד', 'כבד מטוגן'], svgPathId: 'part-other', totalKg: 18, soldKg: 0, bufferKg: 1.8, pricePerKg: 40, processingOptions: ['whole', 'sliced'], defaultPercent: 5, emoji: '🫀' },
];

export const MOCK_ORDERS: Order[] = [];

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

