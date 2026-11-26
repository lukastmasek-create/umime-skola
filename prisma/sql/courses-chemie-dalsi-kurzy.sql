-- Vygenerováno z prisma/content/chemie-dalsi-kurzy.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_chem-kyseliny-zasady-bezpecnost','Kyseliny a zásady: bezpečnost','chem-kyseliny-zasady-bezpecnost','Vlastnosti kyselin, zásad, pH a bezpečná práce v laboratoři.',true,'ZAKLADNI'::"Category",'CHEMIE'::"Subject",'Chemické reakce',8,NOW(),NOW()),
('c_chem-organicka-chemie','Základy organické chemie','chem-organicka-chemie','Uhlík, uhlovodíky, paliva a běžné organické látky.',true,'ZAKLADNI'::"Category",'CHEMIE'::"Subject",'Organická chemie',9,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_chem-kyseliny-zasady-bezpecnost_1','Test 1',1,true,'c_chem-kyseliny-zasady-bezpecnost',NOW(),NOW()),
('l_chem-kyseliny-zasady-bezpecnost_2','Test 2',2,true,'c_chem-kyseliny-zasady-bezpecnost',NOW(),NOW()),
('l_chem-kyseliny-zasady-bezpecnost_3','Test 3',3,true,'c_chem-kyseliny-zasady-bezpecnost',NOW(),NOW()),
('l_chem-kyseliny-zasady-bezpecnost_4','Test 4',4,true,'c_chem-kyseliny-zasady-bezpecnost',NOW(),NOW()),
('l_chem-kyseliny-zasady-bezpecnost_5','Test 5',5,true,'c_chem-kyseliny-zasady-bezpecnost',NOW(),NOW()),
('l_chem-organicka-chemie_1','Test 1',1,true,'c_chem-organicka-chemie',NOW(),NOW()),
('l_chem-organicka-chemie_2','Test 2',2,true,'c_chem-organicka-chemie',NOW(),NOW()),
('l_chem-organicka-chemie_3','Test 3',3,true,'c_chem-organicka-chemie',NOW(),NOW()),
('l_chem-organicka-chemie_4','Test 4',4,true,'c_chem-organicka-chemie',NOW(),NOW()),
('l_chem-organicka-chemie_5','Test 5',5,true,'c_chem-organicka-chemie',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_chem-kyseliny-zasady-bezpecnost_0','Jakou hodnotu má neutrální pH?',ARRAY['1','14','7','0']::TEXT[],2,'Neutrální prostředí má pH 7.',1,ARRAY[]::TEXT[],NULL,0,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_1','Která látka je kyselá?',ARRAY['ocet','mýdlo','čistá voda','cukr']::TEXT[],0,'Ocet obsahuje kyselinu octovou.',1,ARRAY[]::TEXT[],NULL,1,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_2','Jakou barvu má lakmus v kyselině?',ARRAY['zelenou','červenou','modrou','žlutou']::TEXT[],1,'Kyselé prostředí zbarví modrý lakmus červeně.',2,ARRAY[]::TEXT[],NULL,2,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_3','Co je zásada?',ARRAY['plyn','látka bez vody','látka s pH větším než 7','látka s pH 7']::TEXT[],2,'Zásadité látky mají pH větší než 7.',2,ARRAY[]::TEXT[],NULL,3,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_4','Co vzniká neutralizací kyseliny a zásady?',ARRAY['cukr a voda','sůl a voda','kov a plyn','jen kyslík']::TEXT[],1,'Neutralizace obvykle vytváří sůl a vodu.',3,ARRAY[]::TEXT[],NULL,4,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_5','Která látka je zásaditá?',ARRAY['mýdlo','ocet','citronová šťáva','kyselina chlorovodíková']::TEXT[],0,'Mýdlový roztok je zásaditý.',3,ARRAY[]::TEXT[],NULL,5,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_6','Jak bezpečně zjistíme pH?',ARRAY['ochutnáním','zahřátím v ruce','indikátorem nebo pH-metrem','čichem zblízka']::TEXT[],2,'pH zjišťujeme indikátorem nebo pH-metrem.',4,ARRAY[]::TEXT[],NULL,6,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_7','Jak se ředí kyselina?',ARRAY['nelze ji ředit','obojí najednou','voda se lije do kyseliny','kyselina se lije do vody']::TEXT[],3,'Při ředění lijeme vždy kyselinu do vody.',4,ARRAY[]::TEXT[],NULL,7,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_8','Co znamená žíravina?',ARRAY['látka podporující růst','neškodný plyn','látka poškozující tkáně','potravina']::TEXT[],2,'Žíraviny mohou poleptat kůži i oči.',5,ARRAY[]::TEXT[],NULL,8,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-kyseliny-zasady-bezpecnost_9','Který ion způsobuje kyselost vodného roztoku?',ARRAY['sodný Na⁺','vodíkový H⁺','chloridový Cl⁻','vápníkový Ca²⁺']::TEXT[],1,'Kyselost souvisí s koncentrací iontů H⁺.',5,ARRAY[]::TEXT[],NULL,9,'c_chem-kyseliny-zasady-bezpecnost',NULL,NOW()),
('q_chem-organicka-chemie_0','Který prvek je základem organické chemie?',ARRAY['železo','kyslík','uhlík','sodík']::TEXT[],2,'Organické látky jsou založené na uhlíku.',1,ARRAY[]::TEXT[],NULL,0,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_1','Jaký je vzorec methanu?',ARRAY['CH₄','CO₂','C₂H₅OH','H₂O']::TEXT[],0,'Methan má jeden uhlík a čtyři vodíky.',1,ARRAY[]::TEXT[],NULL,1,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_2','Co jsou uhlovodíky?',ARRAY['směsi vody a soli','oxidy','sloučeniny uhlíku a vodíku','sloučeniny kovů']::TEXT[],2,'Uhlovodíky obsahují pouze uhlík a vodík.',2,ARRAY[]::TEXT[],NULL,2,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_3','Které palivo je fosilní?',ARRAY['sluneční světlo','vítr','dřevo','ropa']::TEXT[],3,'Ropa vznikala miliony let z organických zbytků.',2,ARRAY[]::TEXT[],NULL,3,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_4','Jaký plyn vzniká dokonalým spalováním uhlovodíků?',ARRAY['vodík','chlor','dusík','oxid uhličitý']::TEXT[],3,'Při dokonalém spalování vzniká CO₂ a voda.',3,ARRAY[]::TEXT[],NULL,4,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_5','Co je ethanol?',ARRAY['cukr','alkohol','kov','kyselina']::TEXT[],1,'Ethanol je běžný alkohol se vzorcem C₂H₅OH.',3,ARRAY[]::TEXT[],NULL,5,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_6','Co je polymer?',ARRAY['jediný atom','čistý kov','látka z dlouhých řetězců opakujících se jednotek','plyn']::TEXT[],2,'Polymery jsou tvořeny mnoha opakujícími se částmi.',4,ARRAY[]::TEXT[],NULL,6,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_7','Která látka je přírodní polymer?',ARRAY['kyslík','železo','chlorid sodný','celulóza']::TEXT[],3,'Celulóza je polysacharid v buněčných stěnách rostlin.',4,ARRAY[]::TEXT[],NULL,7,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_8','Co vzniká kvašením cukrů?',ARRAY['železo a voda','ethanol a oxid uhličitý','sůl a chlor','kyslík a dusík']::TEXT[],1,'Kvasinky přeměňují cukry na ethanol a CO₂.',5,ARRAY[]::TEXT[],NULL,8,'c_chem-organicka-chemie',NULL,NOW()),
('q_chem-organicka-chemie_9','Proč je oxid uhelnatý nebezpečný?',ARRAY['je pevný','je modrý','váže se na hemoglobin','způsobuje růst rostlin']::TEXT[],2,'CO brání krvi přenášet kyslík.',5,ARRAY[]::TEXT[],NULL,9,'c_chem-organicka-chemie',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

