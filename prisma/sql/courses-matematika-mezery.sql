-- Vygenerováno z prisma/content/matematika-mezery.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_mat-logicke-ulohy','Logické úlohy a číselné řady','mat-logicke-ulohy','Číselné řady, hádanky a úlohy na logické myšlení.',true,'ZAKLADNI'::"Category",'MATEMATIKA'::"Subject",'Logika a úlohy',5,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_mat-logicke-ulohy_1','Test 1',1,true,'c_mat-logicke-ulohy',NOW(),NOW()),
('l_mat-logicke-ulohy_2','Test 2',2,true,'c_mat-logicke-ulohy',NOW(),NOW()),
('l_mat-logicke-ulohy_3','Test 3',3,true,'c_mat-logicke-ulohy',NOW(),NOW()),
('l_mat-logicke-ulohy_4','Test 4',4,true,'c_mat-logicke-ulohy',NOW(),NOW()),
('l_mat-logicke-ulohy_5','Test 5',5,true,'c_mat-logicke-ulohy',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_mat-logicke-ulohy_0','Doplň číselnou řadu: 2, 4, 6, 8, ?',ARRAY['9','10','12','11']::TEXT[],1,'Přičítáme 2.',1,ARRAY[]::TEXT[],NULL,0,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_1','Doplň číselnou řadu: 5, 10, 15, 20, ?',ARRAY['22','24','25','30']::TEXT[],2,'Přičítáme 5.',1,ARRAY[]::TEXT[],NULL,1,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_2','Které číslo nepatří mezi ostatní: 2, 4, 6, 7, 8?',ARRAY['7','4','8','2']::TEXT[],0,'Ostatní čísla jsou sudá, 7 je liché.',1,ARRAY[]::TEXT[],NULL,2,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_3','Jakou barvu bude mít další kostka: červená, modrá, červená, modrá, ?',ARRAY['červenou','žlutou','modrou','zelenou']::TEXT[],0,'Barvy se střídají po dvou.',1,ARRAY[]::TEXT[],NULL,3,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_4','Doplň číselnou řadu: 1, 2, 4, 8, ?',ARRAY['10','14','16','12']::TEXT[],2,'Každé číslo je dvojnásobkem předchozího.',2,ARRAY[]::TEXT[],NULL,4,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_5','Doplň číselnou řadu: 100, 90, 80, 70, ?',ARRAY['60','75','65','50']::TEXT[],0,'Odčítáme 10.',2,ARRAY[]::TEXT[],NULL,5,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_6','Doplň číselnou řadu: 3, 6, 9, 12, ?',ARRAY['16','15','14','18']::TEXT[],1,'Přičítáme 3.',2,ARRAY[]::TEXT[],NULL,6,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_7','Petr je o 3 roky starší než Jana. Janě je 9 let. Kolik let je Petrovi?',ARRAY['11','27','6','12']::TEXT[],3,'9 + 3 = 12.',2,ARRAY[]::TEXT[],NULL,7,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_8','V košíku je 12 jablek. Polovinu snědli. Kolik jablek zbylo?',ARRAY['10','4','6','8']::TEXT[],2,'12 : 2 = 6.',2,ARRAY[]::TEXT[],NULL,8,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_9','Kolik rohů mají dohromady jeden čtverec a jeden trojúhelník?',ARRAY['12','7','6','8']::TEXT[],1,'Čtverec má 4 rohy, trojúhelník 3, dohromady 7.',2,ARRAY[]::TEXT[],NULL,9,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_10','Dnes je úterý. Jaký den bude za tři dny?',ARRAY['sobota','čtvrtek','středa','pátek']::TEXT[],3,'Středa, čtvrtek, pátek.',2,ARRAY[]::TEXT[],NULL,10,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_11','Doplň číselnou řadu: 1, 1, 2, 3, 5, 8, ?',ARRAY['13','11','12','10']::TEXT[],0,'Každé číslo je součtem dvou předchozích (5 + 8 = 13).',3,ARRAY[]::TEXT[],NULL,11,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_12','Doplň číselnou řadu: 2, 6, 18, 54, ?',ARRAY['72','148','162','108']::TEXT[],2,'Každé číslo vynásobíme třemi: 54 · 3 = 162.',3,ARRAY[]::TEXT[],NULL,12,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_13','Doplň číselnou řadu: 1, 4, 9, 16, ?',ARRAY['32','24','25','20']::TEXT[],2,'Jsou to druhé mocniny: 1², 2², 3², 4², 5² = 25.',3,ARRAY[]::TEXT[],NULL,13,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_14','V autobuse sedí 9 lidí. Na zastávce 4 vystoupí a 6 nastoupí. Kolik lidí je v autobuse?',ARRAY['10','13','11','19']::TEXT[],2,'9 − 4 + 6 = 11.',3,ARRAY[]::TEXT[],NULL,14,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_15','Mám dvakrát víc korun než bratr. Dohromady máme 36 Kč. Kolik korun mám já?',ARRAY['12','18','24','30']::TEXT[],2,'Bratr má 12, já 24, dohromady 36.',3,ARRAY[]::TEXT[],NULL,15,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_16','Kolik různých tříciferných čísel sestavíš z číslic 1, 2, 3, když každou použiješ právě jednou?',ARRAY['3','12','6','9']::TEXT[],2,'123, 132, 213, 231, 312, 321.',3,ARRAY[]::TEXT[],NULL,16,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_17','Tři kamarádi si podají každý s každým ruku. Kolik podání proběhne?',ARRAY['3','2','6','9']::TEXT[],0,'Dvojice jsou tři: A–B, A–C, B–C.',3,ARRAY[]::TEXT[],NULL,17,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_18','Kolik čtverců je na čtvercové síti 2 × 2 (včetně velkého)?',ARRAY['5','9','4','8']::TEXT[],0,'Čtyři malé a jeden velký.',3,ARRAY[]::TEXT[],NULL,18,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_19','Kolik prvočísel je mezi čísly 1 až 10?',ARRAY['5','4','6','3']::TEXT[],1,'Jsou to 2, 3, 5 a 7.',3,ARRAY[]::TEXT[],NULL,19,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_20','Které číslo patří místo otazníku: 3, 5, 9, 17, ?',ARRAY['33','31','25','34']::TEXT[],0,'Rozdíly jsou 2, 4, 8, další je 16, tedy 17 + 16 = 33.',4,ARRAY[]::TEXT[],NULL,20,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_21','Za 3 dny vyroste rostlina o 6 cm, každý den stejně. O kolik vyroste za 5 dní?',ARRAY['o 12 cm','o 15 cm','o 10 cm','o 8 cm']::TEXT[],2,'Za den vyroste 2 cm, za 5 dní 10 cm.',4,ARRAY[]::TEXT[],NULL,21,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_22','Otec je o 24 let starší než syn a je třikrát starší než on. Kolik let je synovi?',ARRAY['36','24','12','8']::TEXT[],2,'Syn x, otec x + 24 = 3x, tedy x = 12.',4,ARRAY[]::TEXT[],NULL,22,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_23','Ve třídě je 28 žáků. Dívek je o 4 víc než chlapců. Kolik je chlapců?',ARRAY['10','12','16','14']::TEXT[],1,'Chlapců x, dívek x + 4, dohromady 2x + 4 = 28, tedy x = 12.',4,ARRAY[]::TEXT[],NULL,23,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_24','Kolik je 3 · 3 − 3 : 3 + 3?',ARRAY['9','3','7','11']::TEXT[],3,'Nejdřív násobení a dělení: 9 − 1 + 3 = 11.',4,ARRAY[]::TEXT[],NULL,24,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_25','V řadě stojí děti. Jana je pátá zleva a třetí zprava. Kolik je v řadě dětí?',ARRAY['9','6','7','8']::TEXT[],2,'5 + 3 − 1 = 7, protože Janu jsme započítali dvakrát.',4,ARRAY[]::TEXT[],NULL,25,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_26','Kolik trojúhelníků vznikne, když čtverec rozdělíme oběma úhlopříčkami (počítej i velké)?',ARRAY['8','4','10','6']::TEXT[],0,'Čtyři malé a čtyři velké (každý složený ze dvou malých).',4,ARRAY[]::TEXT[],NULL,26,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_27','Kolik nejvýše průsečíků mohou mít tři různé přímky v rovině?',ARRAY['4','3','6','2']::TEXT[],1,'Každé dvě přímky se protnou nejvýš jednou, dvojic je tři.',5,ARRAY[]::TEXT[],NULL,27,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_28','Součet tří po sobě jdoucích čísel je 48. Které z nich je největší?',ARRAY['16','15','18','17']::TEXT[],3,'15 + 16 + 17 = 48.',5,ARRAY[]::TEXT[],NULL,28,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_29','Kolik různých součtů můžeš dostat při hodu dvěma kostkami?',ARRAY['11','12','36','6']::TEXT[],0,'Součty jsou 2 až 12, tedy 11 možností.',5,ARRAY[]::TEXT[],NULL,29,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_30','V pytli je 5 červených a 3 modré kuličky. Kolik nejméně jich musíš poslepu vytáhnout, abys měl jistě aspoň jednu červenou?',ARRAY['1','4','6','3']::TEXT[],1,'V nejhorším vytáhneš napřed všechny 3 modré, čtvrtá už je červená.',5,ARRAY[]::TEXT[],NULL,30,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_31','Doplň číselnou řadu: 10, 20, 30, 40, ?',ARRAY['45','50','35','60']::TEXT[],1,'Přičítáme 10.',1,ARRAY[]::TEXT[],NULL,31,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_32','Které číslo nepatří mezi ostatní: 3, 5, 9, 11, 13?',ARRAY['9','5','11','3']::TEXT[],0,'Všechna ostatní jsou prvočísla, 9 = 3 · 3.',1,ARRAY[]::TEXT[],NULL,32,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_33','Doplň číselnou řadu: 7, 14, 21, 28, ?',ARRAY['35','30','49','42']::TEXT[],0,'Přičítáme 7.',1,ARRAY[]::TEXT[],NULL,33,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_34','Jaký tvar bude další: kruh, čtverec, kruh, čtverec, ?',ARRAY['kruh','hvězda','trojúhelník','čtverec']::TEXT[],0,'Tvary se střídají.',1,ARRAY[]::TEXT[],NULL,34,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_35','Kolik nohou mají dohromady 2 psi a 1 kočka?',ARRAY['12','8','10','6']::TEXT[],0,'2 · 4 + 4 = 12.',1,ARRAY[]::TEXT[],NULL,35,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_36','Doplň číselnou řadu: 2, 5, 8, 11, ?',ARRAY['15','16','13','14']::TEXT[],3,'Přičítáme 3.',2,ARRAY[]::TEXT[],NULL,36,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_37','Doplň číselnou řadu: 81, 27, 9, 3, ?',ARRAY['0','1','2','6']::TEXT[],1,'Dělíme třemi.',2,ARRAY[]::TEXT[],NULL,37,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_38','Anna má 15 bonbónů. Dala 6 kamarádce a 4 bratrovi. Kolik jich má?',ARRAY['9','11','5','4']::TEXT[],2,'15 − 6 − 4 = 5.',2,ARRAY[]::TEXT[],NULL,38,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_39','Kolik stran mají dohromady šestiúhelník a osmiúhelník?',ARRAY['14','16','13','12']::TEXT[],0,'6 + 8 = 14.',2,ARRAY[]::TEXT[],NULL,39,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_40','Dnes je pondělí. Jaký den bylo před čtyřmi dny?',ARRAY['čtvrtek','pátek','středa','neděle']::TEXT[],0,'Pondělí − 1 = neděle, − 2 = sobota, − 3 = pátek, − 4 = čtvrtek.',2,ARRAY[]::TEXT[],NULL,40,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_41','Doplň číselnou řadu: 1, 3, 6, 10, 15, ?',ARRAY['21','24','18','20']::TEXT[],0,'Rozdíly rostou: 2, 3, 4, 5, 6.',3,ARRAY[]::TEXT[],NULL,41,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_42','Doplň číselnou řadu: 1, 2, 6, 24, ?',ARRAY['72','96','120','48']::TEXT[],2,'Násobíme 2, 3, 4, 5.',3,ARRAY[]::TEXT[],NULL,42,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_43','Kolik různých dvojciferných čísel sestavíš z číslic 1 a 2, když se nesmí opakovat?',ARRAY['3','1','4','2']::TEXT[],3,'Jsou to 12 a 21.',3,ARRAY[]::TEXT[],NULL,43,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_44','Kolik minut je 3 hodiny?',ARRAY['150','120','180','200']::TEXT[],2,'3 · 60 = 180.',3,ARRAY[]::TEXT[],NULL,44,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_45','V krabici je 12 zelených a 8 modrých míčků. Kolik je jich dohromady?',ARRAY['22','4','20','18']::TEXT[],2,'12 + 8 = 20.',3,ARRAY[]::TEXT[],NULL,45,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_46','Doplň číselnou řadu: 2, 3, 5, 9, 17, ?',ARRAY['35','31','33','27']::TEXT[],2,'Rozdíly jsou 1, 2, 4, 8, 16, další je 32; 17 + 16 = 33.',4,ARRAY[]::TEXT[],NULL,46,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_47','Pavel je dvakrát starší než Jana. Dohromady jsou staří 24 let. Kolik je Janě?',ARRAY['12','6','16','8']::TEXT[],3,'Jana x, Pavel 2x, 3x = 24 → x = 8.',4,ARRAY[]::TEXT[],NULL,47,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_48','Kolik je 20 − 4 · 3 + 8 : 4?',ARRAY['12','8','10','14']::TEXT[],2,'20 − 12 + 2 = 10.',4,ARRAY[]::TEXT[],NULL,48,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_49','Kolik čtverců je na šachovnici 3 × 3 (všech velikostí)?',ARRAY['12','14','9','16']::TEXT[],1,'9 + 4 + 1 = 14.',4,ARRAY[]::TEXT[],NULL,49,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_50','Autobus jede 45 minut rychlostí 60 km/h. Jak dlouhá je trasa?',ARRAY['30 km','45 km','60 km','75 km']::TEXT[],1,'60 · 0,75 = 45 km.',4,ARRAY[]::TEXT[],NULL,50,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_51','Kolik různých dvojic lze vybrat ze čtyř lidí?',ARRAY['4','12','6','8']::TEXT[],2,'C(4, 2) = 6.',5,ARRAY[]::TEXT[],NULL,51,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_52','Kolik je 2⁵ − 3³ + 4²?',ARRAY['21','25','15','11']::TEXT[],0,'32 − 27 + 16 = 21.',5,ARRAY[]::TEXT[],NULL,52,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_53','Součet čtyř po sobě jdoucích čísel je 58. Které je nejmenší?',ARRAY['14','15','12','13']::TEXT[],3,'4x + 6 = 58 → x = 13.',5,ARRAY[]::TEXT[],NULL,53,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_54','Kolik nejméně ponožek musíš vytáhnout z šuplíku se 4 černými a 4 bílými, aby byl jistě pár stejné barvy?',ARRAY['3','8','4','2']::TEXT[],0,'Dvě barvy, takže třetí ponožka musí tvořit pár.',5,ARRAY[]::TEXT[],NULL,54,'c_mat-logicke-ulohy',NULL,NOW()),
('q_mat-logicke-ulohy_55','Kolik různých pořadí lze vytvořit z 3 knih?',ARRAY['3','12','9','6']::TEXT[],3,'3 · 2 · 1 = 6.',5,ARRAY[]::TEXT[],NULL,55,'c_mat-logicke-ulohy',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

