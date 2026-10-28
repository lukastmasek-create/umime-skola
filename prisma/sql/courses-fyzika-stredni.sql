-- Vygenerováno z prisma/content/fyzika-stredni.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_fyz-s-kinematika-dynamika','Kinematika a dynamika','fyz-s-kinematika-dynamika','Zrychlení, volný pád, hybnost, gravitace a pohyb po kružnici.',true,'STREDNI'::"Category",'FYZIKA'::"Subject",'Mechanika',1,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_fyz-s-kinematika-dynamika_1','Test 1',1,false,'c_fyz-s-kinematika-dynamika',NOW(),NOW()),
('l_fyz-s-kinematika-dynamika_2','Test 2',2,true,'c_fyz-s-kinematika-dynamika',NOW(),NOW()),
('l_fyz-s-kinematika-dynamika_3','Test 3',3,true,'c_fyz-s-kinematika-dynamika',NOW(),NOW()),
('l_fyz-s-kinematika-dynamika_4','Test 4',4,true,'c_fyz-s-kinematika-dynamika',NOW(),NOW()),
('l_fyz-s-kinematika-dynamika_5','Test 5',5,true,'c_fyz-s-kinematika-dynamika',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_fyz-s-kinematika-dynamika_0','Jak se vypočítá zrychlení?',ARRAY['a = s : t','a = Δv : t','a = F · m','a = v · t']::TEXT[],1,'Zrychlení je změna rychlosti za čas.',2,ARRAY[]::TEXT[],NULL,0,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_1','Těleso začíná z klidu a zrychluje 2 m/s². Jakou rychlost má po 5 s?',ARRAY['10 m/s','25 m/s','7 m/s','2,5 m/s']::TEXT[],0,'v = a · t = 2 · 5 = 10 m/s.',2,ARRAY[]::TEXT[],NULL,1,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_2','Jaké je přibližně tíhové zrychlení u povrchu Země?',ARRAY['98,1 m/s²','0,981 m/s²','1,62 m/s²','9,81 m/s²']::TEXT[],3,'Hodnota g je asi 9,81 m/s².',2,ARRAY[]::TEXT[],NULL,2,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_3','Těleso z klidu zrychluje 2 m/s². Jakou dráhu urazí za 4 s?',ARRAY['16 m','8 m','32 m','4 m']::TEXT[],0,'s = ½ · a · t² = ½ · 2 · 16 = 16 m.',3,ARRAY[]::TEXT[],NULL,3,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_4','Těleso volně padá z klidu 3 s (odpor zanedbej, g = 10 m/s²). Jakou rychlost má?',ARRAY['15 m/s','30 m/s','45 m/s','10 m/s']::TEXT[],1,'v = g · t = 10 · 3 = 30 m/s.',3,ARRAY[]::TEXT[],NULL,4,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_5','Jakou dráhu urazí těleso při volném pádu za 2 s (g = 10 m/s²)?',ARRAY['20 m','10 m','40 m','5 m']::TEXT[],0,'s = ½ · g · t² = ½ · 10 · 4 = 20 m.',3,ARRAY[]::TEXT[],NULL,5,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_6','Jak zní druhý Newtonův zákon?',ARRAY['a = m : F','F = a : m','F = m : a','a = F : m']::TEXT[],3,'Zrychlení je přímo úměrné síle a nepřímo hmotnosti.',3,ARRAY[]::TEXT[],NULL,6,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_7','Jaká síla uděluje tělesu o hmotnosti 3 kg zrychlení 4 m/s²?',ARRAY['7 N','12 N','0,75 N','1,33 N']::TEXT[],1,'F = m · a = 3 · 4 = 12 N.',3,ARRAY[]::TEXT[],NULL,7,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_8','Jaká je jednotka zrychlení v SI?',ARRAY['N','m/s','m/s²','kg·m']::TEXT[],2,'Zrychlení se měří v metrech za sekundu na druhou.',3,ARRAY[]::TEXT[],NULL,8,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_9','Jakou jednotkou se v SI měří hybnost?',ARRAY['J','kg·m/s','kg·m/s²','W']::TEXT[],1,'Hybnost p = m · v.',3,ARRAY[]::TEXT[],NULL,9,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_10','Jak se vypočítá hybnost tělesa?',ARRAY['p = m · v','p = F : t','p = m : v','p = m · a']::TEXT[],0,'Hybnost je součin hmotnosti a rychlosti.',3,ARRAY[]::TEXT[],NULL,10,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_11','Vozík o hmotnosti 2 kg se pohybuje rychlostí 3 m/s. Jaká je jeho hybnost?',ARRAY['1,5 kg·m/s','6 kg·m/s','9 kg·m/s','5 kg·m/s']::TEXT[],1,'p = 2 · 3 = 6 kg·m/s.',4,ARRAY[]::TEXT[],NULL,11,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_12','Co říká zákon zachování hybnosti?',ARRAY['hybnost tělesa vždy klesá','celková hybnost izolované soustavy zůstává stálá','celková energie vždy roste','hybnost závisí jen na hmotnosti']::TEXT[],1,'Při srážkách izolovaných těles se celková hybnost nemění.',4,ARRAY[]::TEXT[],NULL,12,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_13','Jak se změní gravitační síla mezi dvěma tělesy, když vzdálenost zdvojnásobíme?',ARRAY['nezmění se','zmenší se na polovinu','zmenší se na čtvrtinu','zdvojnásobí se']::TEXT[],2,'Síla je nepřímo úměrná druhé mocnině vzdálenosti.',4,ARRAY[]::TEXT[],NULL,13,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_14','Jak se nazývá síla, která udržuje těleso na kruhové dráze a směřuje do středu?',ARRAY['odstředivá síla','třecí síla','tíhová síla','dostředivá síla']::TEXT[],3,'Dostředivá síla míří do středu kružnice.',4,ARRAY[]::TEXT[],NULL,14,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_15','Perioda kruhového pohybu je 0,5 s. Jaká je frekvence?',ARRAY['0,5 Hz','5 Hz','0,25 Hz','2 Hz']::TEXT[],3,'f = 1 : T = 1 : 0,5 = 2 Hz.',4,ARRAY[]::TEXT[],NULL,15,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_16','Jak se vypočítá velikost dostředivého zrychlení při pohybu po kružnici?',ARRAY['a = v : r²','a = v · r','a = r : v²','a = v² : r']::TEXT[],3,'Dostředivé zrychlení je rychlost na druhou dělená poloměrem.',4,ARRAY[]::TEXT[],NULL,16,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_17','Těleso o hmotnosti 10 kg leží na vodorovné podložce, součinitel tření je 0,3. Jak velká třecí síla brzdí posun (g = 10 m/s²)?',ARRAY['3 N','100 N','30 N','300 N']::TEXT[],2,'F = f · m · g = 0,3 · 100 = 30 N.',4,ARRAY[]::TEXT[],NULL,17,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_18','Co platí při rovnoměrně zrychleném pohybu z klidu?',ARRAY['rychlost je stálá','dráha je stálá','dráha roste s druhou mocninou času','dráha roste lineárně s časem']::TEXT[],2,'s = ½ · a · t².',4,ARRAY[]::TEXT[],NULL,18,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_19','Auto jede 20 m/s a brzdí se zrychlením −5 m/s². Za jak dlouho se zastaví?',ARRAY['za 4 s','za 100 s','za 2 s','za 5 s']::TEXT[],0,'t = v : a = 20 : 5 = 4 s.',5,ARRAY[]::TEXT[],NULL,19,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_20','Jakou brzdnou dráhu urazí auto jedoucí 20 m/s se zpomalením 5 m/s²?',ARRAY['100 m','20 m','80 m','40 m']::TEXT[],3,'s = v² : (2a) = 400 : 10 = 40 m.',5,ARRAY[]::TEXT[],NULL,20,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_21','Kulka o hmotnosti 0,01 kg letí rychlostí 400 m/s. Jaká je její hybnost?',ARRAY['40 kg·m/s','0,04 kg·m/s','400 kg·m/s','4 kg·m/s']::TEXT[],3,'p = 0,01 · 400 = 4 kg·m/s.',5,ARRAY[]::TEXT[],NULL,21,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_22','Vozík 2 kg jedoucí 3 m/s narazí do stojícího vozíku 1 kg a slepí se. Jaká je společná rychlost?',ARRAY['2 m/s','3 m/s','1,5 m/s','1 m/s']::TEXT[],0,'Hybnost 6 se rozdělí na hmotnost 3 kg: 6 : 3 = 2 m/s.',5,ARRAY[]::TEXT[],NULL,22,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_23','Jaká je přibližně první kosmická rychlost u Země?',ARRAY['7,9 km/s','16,7 km/s','0,79 km/s','11,2 km/s']::TEXT[],0,'Je to rychlost pro oběh těsně nad povrchem Země.',5,ARRAY[]::TEXT[],NULL,23,'c_fyz-s-kinematika-dynamika',NULL,NOW()),
('q_fyz-s-kinematika-dynamika_24','Jak se změní dostředivá síla při dvojnásobné rychlosti (stejný poloměr a hmotnost)?',ARRAY['zůstane stejná','zmenší se na polovinu','zdvojnásobí se','vzroste čtyřnásobně']::TEXT[],3,'F = m · v² : r, závisí na druhé mocnině rychlosti.',5,ARRAY[]::TEXT[],NULL,24,'c_fyz-s-kinematika-dynamika',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

