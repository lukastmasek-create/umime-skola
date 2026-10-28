-- Vygenerováno z prisma/content/matematika-stredni.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_mat-s-kvadraticke-rovnice','Kvadratické rovnice','mat-s-kvadraticke-rovnice','Diskriminant, kořeny, Viètovy vzorce a rozklad na součin.',true,'STREDNI'::"Category",'MATEMATIKA'::"Subject",'Algebra',1,NOW(),NOW()),
('c_mat-s-goniometrie','Goniometrie a trigonometrie','mat-s-goniometrie','Sinus, kosinus, tangens, radiány a řešení trojúhelníků.',true,'STREDNI'::"Category",'MATEMATIKA'::"Subject",'Goniometrie',2,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_mat-s-kvadraticke-rovnice_1','Test 1',1,true,'c_mat-s-kvadraticke-rovnice',NOW(),NOW()),
('l_mat-s-kvadraticke-rovnice_2','Test 2',2,true,'c_mat-s-kvadraticke-rovnice',NOW(),NOW()),
('l_mat-s-kvadraticke-rovnice_3','Test 3',3,true,'c_mat-s-kvadraticke-rovnice',NOW(),NOW()),
('l_mat-s-kvadraticke-rovnice_4','Test 4',4,true,'c_mat-s-kvadraticke-rovnice',NOW(),NOW()),
('l_mat-s-kvadraticke-rovnice_5','Test 5',5,true,'c_mat-s-kvadraticke-rovnice',NOW(),NOW()),
('l_mat-s-goniometrie_1','Test 1',1,true,'c_mat-s-goniometrie',NOW(),NOW()),
('l_mat-s-goniometrie_2','Test 2',2,true,'c_mat-s-goniometrie',NOW(),NOW()),
('l_mat-s-goniometrie_3','Test 3',3,true,'c_mat-s-goniometrie',NOW(),NOW()),
('l_mat-s-goniometrie_4','Test 4',4,true,'c_mat-s-goniometrie',NOW(),NOW()),
('l_mat-s-goniometrie_5','Test 5',5,true,'c_mat-s-goniometrie',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_mat-s-kvadraticke-rovnice_0','Jak se nazývá výraz D = b² − 4ac u kvadratické rovnice ax² + bx + c = 0?',ARRAY['determinant','diskriminant','kvocient','derivace']::TEXT[],1,'Diskriminant rozhoduje o počtu kořenů.',1,ARRAY[]::TEXT[],NULL,0,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_1','Kolik reálných kořenů má kvadratická rovnice, když D > 0?',ARRAY['dva různé','jeden','tři','žádný']::TEXT[],0,'Kladný diskriminant dává dva různé kořeny.',2,ARRAY[]::TEXT[],NULL,1,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_2','Kolik reálných kořenů má kvadratická rovnice, když D = 0?',ARRAY['jeden (dvojnásobný)','tři','žádný','dva různé']::TEXT[],0,'Při nulovém diskriminantu je kořen jeden.',2,ARRAY[]::TEXT[],NULL,2,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_3','Kolik reálných kořenů má kvadratická rovnice, když D < 0?',ARRAY['jeden','žádný reálný','nekonečně mnoho','dva']::TEXT[],1,'Záporný diskriminant znamená žádné reálné řešení.',2,ARRAY[]::TEXT[],NULL,3,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_4','Řeš rovnici x² − 9 = 0.',ARRAY['x = −3','x = 3 nebo x = −3','x = 9','x = 3']::TEXT[],1,'x² = 9, tedy x = ±3.',2,ARRAY[]::TEXT[],NULL,4,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_5','Řeš rovnici x² = 16.',ARRAY['x = −4','x = 4 nebo x = −4','x = 8','x = 4']::TEXT[],1,'x = ±√16 = ±4.',2,ARRAY[]::TEXT[],NULL,5,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_6','Řeš rovnici x² − 5x + 6 = 0.',ARRAY['x = 2 nebo x = 3','x = 1 nebo x = 6','x = −2 nebo x = −3','x = 5 nebo x = 1']::TEXT[],0,'(x − 2)(x − 3) = 0.',3,ARRAY[]::TEXT[],NULL,6,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_7','Řeš rovnici x² + 2x − 8 = 0.',ARRAY['x = 2 nebo x = 4','x = 2 nebo x = −4','x = 8 nebo x = −1','x = −2 nebo x = 4']::TEXT[],1,'(x − 2)(x + 4) = 0.',3,ARRAY[]::TEXT[],NULL,7,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_8','Jaký je diskriminant rovnice x² − 4x + 3 = 0?',ARRAY['16','1','−4','4']::TEXT[],3,'D = 16 − 12 = 4.',3,ARRAY[]::TEXT[],NULL,8,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_9','Jaký je diskriminant rovnice 2x² + 3x + 5 = 0?',ARRAY['−40','−31','31','49']::TEXT[],1,'D = 9 − 40 = −31.',3,ARRAY[]::TEXT[],NULL,9,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_10','Jaký je součet kořenů rovnice x² − 7x + 10 = 0?',ARRAY['7','−7','−10','10']::TEXT[],0,'Podle Viètových vzorců x₁ + x₂ = −b : a = 7.',3,ARRAY[]::TEXT[],NULL,10,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_11','Jaký je součin kořenů rovnice x² − 7x + 10 = 0?',ARRAY['−7','10','−10','7']::TEXT[],1,'Podle Viètových vzorců x₁ · x₂ = c : a = 10.',3,ARRAY[]::TEXT[],NULL,11,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_12','Řeš rovnici x² − 6x + 9 = 0.',ARRAY['nemá řešení','x = −3','x = 3 nebo x = −3','x = 3']::TEXT[],3,'(x − 3)² = 0, dvojnásobný kořen 3.',3,ARRAY[]::TEXT[],NULL,12,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_13','Řeš rovnici x² + 4 = 0 v oboru reálných čísel.',ARRAY['nemá řešení','x = 4','x = 2 nebo x = −2','x = −4']::TEXT[],0,'x² = −4 nemá reálné řešení.',3,ARRAY[]::TEXT[],NULL,13,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_14','Řeš rovnici 2x² − 8x = 0.',ARRAY['x = 4','x = 0 nebo x = −4','x = 2','x = 0 nebo x = 4']::TEXT[],3,'2x(x − 4) = 0.',4,ARRAY[]::TEXT[],NULL,14,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_15','V jakém bodě x leží vrchol paraboly y = x² − 4x + 3?',ARRAY['x = 2','x = −2','x = 3','x = 4']::TEXT[],0,'x_v = −b : (2a) = 4 : 2 = 2.',4,ARRAY[]::TEXT[],NULL,15,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_16','Řeš rovnici 3x² − 12 = 0.',ARRAY['x = 12','x = 2','x = 2 nebo x = −2','x = 4 nebo x = −4']::TEXT[],2,'x² = 4, tedy x = ±2.',4,ARRAY[]::TEXT[],NULL,16,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_17','Pro které kladné m má rovnice x² + mx + 9 = 0 právě jeden kořen?',ARRAY['m = 9','m = 6','m = 3','m = 18']::TEXT[],1,'D = m² − 36 = 0, tedy m = 6.',4,ARRAY[]::TEXT[],NULL,17,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_18','Obdélník má obvod 20 cm a obsah 21 cm². Jaké jsou jeho strany?',ARRAY['4 cm a 6 cm','5 cm a 5 cm','2 cm a 8 cm','3 cm a 7 cm']::TEXT[],3,'a + b = 10 a ab = 21, tedy 3 a 7.',4,ARRAY[]::TEXT[],NULL,18,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_19','Rozlož na součin x² − 49.',ARRAY['(x − 7)²','(x − 7)(x + 7)','(x + 7)²','(x − 49)(x + 1)']::TEXT[],1,'Rozdíl čtverců: a² − b² = (a − b)(a + b).',4,ARRAY[]::TEXT[],NULL,19,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_20','Rozlož na součin x² + 6x + 9.',ARRAY['(x + 3)(x − 3)','(x − 3)²','(x + 9)(x + 1)','(x + 3)²']::TEXT[],3,'Je to čtverec dvojčlenu.',4,ARRAY[]::TEXT[],NULL,20,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_21','Řeš rovnici x² − 3x − 10 = 0.',ARRAY['x = 3 nebo x = 10','x = 10 nebo x = −1','x = 5 nebo x = −2','x = −5 nebo x = 2']::TEXT[],2,'(x − 5)(x + 2) = 0.',5,ARRAY[]::TEXT[],NULL,21,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_22','Pro která x platí nerovnost x² − 4 > 0?',ARRAY['x < −2 nebo x > 2','x > 2','−2 < x < 2','x > −2']::TEXT[],0,'Parabola je nad osou x mimo kořeny −2 a 2.',5,ARRAY[]::TEXT[],NULL,22,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_23','Řeš rovnici (x − 1)(x + 5) = 0.',ARRAY['x = −1 nebo x = 5','x = 1 nebo x = −5','x = 1 nebo x = 5','x = −1 nebo x = −5']::TEXT[],1,'Součin je nula, když je nula některý činitel.',5,ARRAY[]::TEXT[],NULL,23,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-kvadraticke-rovnice_24','Součin dvou po sobě jdoucích kladných celých čísel je 56. Která čísla to jsou?',ARRAY['6 a 7','5 a 11','8 a 9','7 a 8']::TEXT[],3,'7 · 8 = 56.',5,ARRAY[]::TEXT[],NULL,24,'c_mat-s-kvadraticke-rovnice',NULL,NOW()),
('q_mat-s-goniometrie_0','Jak je definován sinus ostrého úhlu v pravoúhlém trojúhelníku?',ARRAY['přilehlá odvěsna : přepona','protilehlá odvěsna : přepona','protilehlá : přilehlá odvěsna','přepona : protilehlá odvěsna']::TEXT[],1,'sin α = protilehlá : přepona.',1,ARRAY[]::TEXT[],NULL,0,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_1','Jak je definován kosinus ostrého úhlu v pravoúhlém trojúhelníku?',ARRAY['protilehlá odvěsna : přepona','přilehlá : protilehlá odvěsna','přilehlá odvěsna : přepona','přepona : přilehlá odvěsna']::TEXT[],2,'cos α = přilehlá : přepona.',1,ARRAY[]::TEXT[],NULL,1,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_2','Jak je definován tangens ostrého úhlu v pravoúhlém trojúhelníku?',ARRAY['přepona : přilehlá odvěsna','přilehlá odvěsna : protilehlá odvěsna','protilehlá odvěsna : přepona','protilehlá odvěsna : přilehlá odvěsna']::TEXT[],3,'tg α = protilehlá : přilehlá.',1,ARRAY[]::TEXT[],NULL,2,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_3','Kolik je sin 30°?',ARRAY['1/2','√2/2','√3/2','1']::TEXT[],0,'sin 30° = 1/2.',2,ARRAY[]::TEXT[],NULL,3,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_4','Kolik je cos 60°?',ARRAY['√2/2','√3/2','0','1/2']::TEXT[],3,'cos 60° = 1/2.',2,ARRAY[]::TEXT[],NULL,4,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_5','Kolik je tg 45°?',ARRAY['1','√3','1/2','0']::TEXT[],0,'Odvěsny jsou stejně dlouhé.',2,ARRAY[]::TEXT[],NULL,5,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_6','Kolik je sin 90°?',ARRAY['−1','1/2','1','0']::TEXT[],2,'sin 90° = 1.',2,ARRAY[]::TEXT[],NULL,6,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_7','Kolik je cos 0°?',ARRAY['1/2','1','−1','0']::TEXT[],1,'cos 0° = 1.',2,ARRAY[]::TEXT[],NULL,7,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_8','Kolik je sin 0°?',ARRAY['1','−1','1/2','0']::TEXT[],3,'sin 0° = 0.',2,ARRAY[]::TEXT[],NULL,8,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_9','Kolik je sin 60°?',ARRAY['√2/2','1','√3/2','1/2']::TEXT[],2,'sin 60° = √3/2.',3,ARRAY[]::TEXT[],NULL,9,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_10','Kolik je cos 45°?',ARRAY['1','1/2','√2/2','√3/2']::TEXT[],2,'cos 45° = √2/2.',3,ARRAY[]::TEXT[],NULL,10,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_11','Který vztah platí pro každý úhel α?',ARRAY['sin² α − cos² α = 1','sin α · cos α = 1','sin² α + cos² α = 1','sin α + cos α = 1']::TEXT[],2,'Je to základní goniometrický vztah.',3,ARRAY[]::TEXT[],NULL,11,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_12','Kolik radiánů je 180°?',ARRAY['π','2π','π/4','π/2']::TEXT[],0,'Půlkruh je π rad.',3,ARRAY[]::TEXT[],NULL,12,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_13','Kolik stupňů je π/2 rad?',ARRAY['60°','45°','180°','90°']::TEXT[],3,'π rad je 180°, polovina je 90°.',3,ARRAY[]::TEXT[],NULL,13,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_14','Kolik radiánů je 60°?',ARRAY['π/6','2π/3','π/3','π/4']::TEXT[],2,'60° je třetina z 180°.',3,ARRAY[]::TEXT[],NULL,14,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_15','V pravoúhlém trojúhelníku je přepona 10 cm a úhel α = 30°. Jak dlouhá je protilehlá odvěsna?',ARRAY['8,66 cm','2,5 cm','20 cm','5 cm']::TEXT[],3,'a = c · sin 30° = 10 · 1/2 = 5 cm.',3,ARRAY[]::TEXT[],NULL,15,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_16','Jak vyjádříme tg α pomocí sin a cos?',ARRAY['tg α = sin α · cos α','tg α = sin α + cos α','tg α = sin α : cos α','tg α = cos α : sin α']::TEXT[],2,'Tangens je podíl sinu a kosinu.',3,ARRAY[]::TEXT[],NULL,16,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_17','Kolik je cos 90°?',ARRAY['−1','1/2','1','0']::TEXT[],3,'cos 90° = 0.',4,ARRAY[]::TEXT[],NULL,17,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_18','Jaká je perioda funkce y = sin x?',ARRAY['π/2','π','4π','2π']::TEXT[],3,'Sinus se opakuje po 2π.',4,ARRAY[]::TEXT[],NULL,18,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_19','Který úhel mezi 0° a 90° má sinus roven 1/2?',ARRAY['30°','90°','60°','45°']::TEXT[],0,'sin 30° = 1/2.',4,ARRAY[]::TEXT[],NULL,19,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_20','Co plyne ze sinové věty v trojúhelníku ABC?',ARRAY['a : sin α = b : sin β','a · sin α = b · sin β','a + b = sin α + sin β','a : cos α = b : cos β']::TEXT[],0,'Poměr strany a sinu protilehlého úhlu je v celém trojúhelníku stejný.',4,ARRAY[]::TEXT[],NULL,20,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_21','Který vztah je kosinová věta?',ARRAY['c² = a² + b² + 2ab · cos γ','c = a + b − cos γ','c² = a² + b²','c² = a² + b² − 2ab · cos γ']::TEXT[],3,'Pro γ = 90° přejde na Pythagorovu větu.',4,ARRAY[]::TEXT[],NULL,21,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_22','Stožár vrhá stín 12 m, když Slunce svítí pod úhlem 45°. Jak je vysoký?',ARRAY['6 m','12 m','24 m','12√2 m']::TEXT[],1,'tg 45° = 1, výška = stín.',5,ARRAY[]::TEXT[],NULL,22,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_23','Žebřík dlouhý 5 m stojí 3 m od zdi. V jaké výšce se opírá o zeď?',ARRAY['4 m','3 m','2 m','5,8 m']::TEXT[],0,'Pythagorova věta: √(25 − 9) = 4.',5,ARRAY[]::TEXT[],NULL,23,'c_mat-s-goniometrie',NULL,NOW()),
('q_mat-s-goniometrie_24','Kolik je sin 150°?',ARRAY['−1/2','√3/2','−√3/2','1/2']::TEXT[],3,'sin 150° = sin 30° = 1/2.',5,ARRAY[]::TEXT[],NULL,24,'c_mat-s-goniometrie',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

