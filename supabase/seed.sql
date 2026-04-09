-- ============================================
-- FreshCut Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================

-- 1. Create the butcher customer
INSERT INTO customers (phone, name, role, password_hash) VALUES
  ('054-7274527', 'דביר ישראלי', 'butcher', 'butcher123');

-- 2. Create the active round (future dates so timer works)
INSERT INTO rounds (id, butcher_id, butcher_name, animal_type, slaughter_date, order_close_date, total_weight_kg, buffer_percent, status, visibility, location)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'butcher-001',
  'דביר ישראלי',
  'calf',
  (NOW() + INTERVAL '5 days')::timestamptz,
  (NOW() + INTERVAL '4 days')::timestamptz,
  250,
  5,
  'open',
  'public',
  'רחובות, ישראל'
);

-- 3. Create all meat parts
INSERT INTO parts (id, round_id, name_he, name_en, description, cooking_suggestions, svg_path_id, total_kg, sold_kg, buffer_kg, price_per_kg, processing_options, default_percent, emoji) VALUES
  ('entrecote', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'אנטריקוט', 'Entrecote', 'חלק פרימיום ריחני ועסיסי.', '{סטייק על הגריל,צלייה בתנור}', 'part-entrecote', 20, 0, 2, 120, '{whole,sliced}', 8, '🥩'),
  ('ribs', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'צלעות', 'Ribs', 'צלעות עסיסיות מתאימות לבישול ארוך.', '{BBQ,בישול איטי}', 'part-ribs', 30, 0, 3, 80, '{whole,sliced}', 12, '🍖'),
  ('brisket', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'חזה', 'Brisket', 'חלק עשיר בשומן מתאים לעישון או בישול ארוך.', '{עישון,קדירה}', 'part-brisket', 18, 0, 1, 70, '{whole,cubed}', 5, '🥩'),
  ('shoulder_center', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'כתף מרכזי', 'Shoulder Center', 'חלק שרירי לבישול איטי.', '{נסיבות,קציצות}', 'part-shoulder_center', 15, 0, 2, 65, '{whole,sliced,cubed,ground}', 6, '🥩'),
  ('shoulder_roast', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'צלי כתף', 'Shoulder Roast', 'נתח מצוין לצלי קדירה קלאסי.', '{צלי מסורתי}', 'part-shoulder_roast', 12, 0, 1, 75, '{whole,sliced}', 4, '🥩'),
  ('mock_fillet', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'פילה מדומה', 'Mock Fillet', 'נתח רזה המזכיר בצורתו פילה, מצוין לבישול ברוטב.', '{בישול ארוך ברוטב}', 'part-mock_fillet', 8, 0, 1, 85, '{whole,sliced}', 3, '🥩'),
  ('rib_cover', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'מכסה הצלע', 'Rib Cover', 'שכבת השומן והבשר המכסה את האנטריקוט.', '{טחינה,תבשיל}', 'part-rib_cover', 10, 0, 1, 55, '{ground,cubed}', 3, '🍖'),
  ('front_shank', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'זרוע', 'Front Shank', 'שוק קדמית, עשירה בקולגן.', '{מרק,אוסובוקו קדמי}', 'part-front_shank', 15, 0, 1, 50, '{whole,sliced}', 5, '🍖'),
  ('asado', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'אסדו', 'Asado', 'קשתות צלעות (שפונדרה) מושלמות לעישון ואפייה ארוכה.', '{עישון,אסדו בתנור}', 'part-asado', 25, 0, 0, 90, '{whole,sliced}', 8, '🍖'),
  ('neck', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'צוואר', 'Neck', 'בשר מתקתק ושרירי, מצוין לתבשילים ארוכים וטחינה.', '{גולאש,טחינה}', 'part-neck', 20, 0, 2, 45, '{whole,cubed}', 8, '🍖'),
  ('sirloin', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'סינטה', 'Sirloin', 'רזה ואיכותי, אידיאלי לצלייה קצרה.', '{סטייק,רוסטביף}', 'part-sirloin', 15, 0, 1.5, 110, '{whole,sliced,cubed}', 6, '🥩'),
  ('fillet', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'פילה', 'Tenderloin', 'הנתח הרך והיקר ביותר בקר.', '{סטייק,קרפצ׳ו}', 'part-fillet', 10, 0, 1, 165, '{whole,sliced}', 4, '🥩'),
  ('shaitel', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'שייטל', 'Rumpsteak', 'בשר רזה וטעים להפליא, מעולה לשניצל או הקפצה.', '{מנות מוקפצות,שניצל עגל,סטייק}', 'part-shaitel', 14, 0, 1, 95, '{whole,sliced}', 5, '🥩'),
  ('avasit', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'אווזית', 'Silverside', 'בשר רזה המצוי ברגל האחורית.', '{צלי עדין,גולאש}', 'part-avasit', 16, 0, 1, 75, '{whole,cubed}', 5, '🥩'),
  ('chach', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'צ''אך', 'Outside Meat', 'חלק נהדר לבישול בקדירה וצלי.', '{צלי בקדירה}', 'part-chach', 12, 0, 1, 70, '{whole,cubed}', 4, '🥩'),
  ('kaf', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'כף', 'Topside', 'חלק רזה מהירך הפנימית.', '{שניצל בקר,אסקלופ}', 'part-kaf', 15, 0, 1, 85, '{whole,sliced}', 5, '🥩'),
  ('flank', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'פלדה', 'Flank', 'בשר בטן, אידיאלי גם לטחינה.', '{המבורגר,תבשיל בטן}', 'part-flank', 25, 0, 2, 55, '{ground,whole}', 8, '🫙'),
  ('rear_shank', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'שריר אחורי', 'Rear Shank', 'שוק אחורית ארוכה, מלאה קולגן לבישול ממושך.', '{אוסובוקו,מרק}', 'part-rear_shank', 15, 0, 1, 55, '{whole,sliced}', 5, '🍖'),
  ('weissbraten', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ויסבראטן', 'Weissbraten', 'נתח רזה ובהיר, טוב לבישול ברוטב לחות.', '{צלי ברוטב}', 'part-weissbraten', 10, 0, 1, 80, '{whole,sliced}', 3, '🥩'),
  ('bones', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'עצמות / ציר', 'Bones / Stock', 'עצמות למרק או ציר בריא ועשיר.', '{ציר עצמות,מרק,רמן}', 'part-bones', 25, 0, 2.5, 20, '{whole}', 5, '🦴'),
  ('other', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'כבד / לב / לשון', 'Offal', 'פנים התרת בקר', '{קבב כבד,כבד מטוגן}', 'part-other', 18, 0, 1.8, 40, '{whole,sliced}', 5, '🫀');
