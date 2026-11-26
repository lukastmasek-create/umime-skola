-- Vygenerováno z prisma/content/fyzika-dalsi-kurzy.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_fyz-elektricky-obvod','Elektrický obvod','fyz-elektricky-obvod','Napětí, proud, odpor a jednoduché elektrické obvody.',true,'ZAKLADNI'::"Category",'FYZIKA'::"Subject",'Elektřina',8,NOW(),NOW()),
('c_fyz-teplo-a-teplota','Teplo a teplota','fyz-teplo-a-teplota','Teplota, přenos tepla, skupenské změny a tepelná roztažnost.',true,'ZAKLADNI'::"Category",'FYZIKA'::"Subject",'Energie',7,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_fyz-elektricky-obvod_1','Test 1',1,true,'c_fyz-elektricky-obvod',NOW(),NOW()),
('l_fyz-elektricky-obvod_2','Test 2',2,true,'c_fyz-elektricky-obvod',NOW(),NOW()),
('l_fyz-elektricky-obvod_3','Test 3',3,true,'c_fyz-elektricky-obvod',NOW(),NOW()),
('l_fyz-elektricky-obvod_4','Test 4',4,true,'c_fyz-elektricky-obvod',NOW(),NOW()),
('l_fyz-elektricky-obvod_5','Test 5',5,true,'c_fyz-elektricky-obvod',NOW(),NOW()),
('l_fyz-teplo-a-teplota_1','Test 1',1,true,'c_fyz-teplo-a-teplota',NOW(),NOW()),
('l_fyz-teplo-a-teplota_2','Test 2',2,true,'c_fyz-teplo-a-teplota',NOW(),NOW()),
('l_fyz-teplo-a-teplota_3','Test 3',3,true,'c_fyz-teplo-a-teplota',NOW(),NOW()),
('l_fyz-teplo-a-teplota_4','Test 4',4,true,'c_fyz-teplo-a-teplota',NOW(),NOW()),
('l_fyz-teplo-a-teplota_5','Test 5',5,true,'c_fyz-teplo-a-teplota',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_fyz-elektricky-obvod_0','Jaká je jednotka elektrického proudu?',ARRAY['ohm','watt','ampér','volt']::TEXT[],2,'Elektrický proud měříme v ampérech.',1,ARRAY[]::TEXT[],NULL,0,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_1','Jaká je jednotka napětí?',ARRAY['joule','ohm','ampér','volt']::TEXT[],3,'Napětí měříme ve voltech.',1,ARRAY[]::TEXT[],NULL,1,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_2','Co potřebuje jednoduchý obvod, aby jím procházel proud?',ARRAY['otevřený obvod','jen vodič','uzavřený obvod','jen žárovku']::TEXT[],2,'Proud prochází pouze uzavřenou cestou.',2,ARRAY[]::TEXT[],NULL,2,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_3','Který materiál je dobrý vodič?',ARRAY['měď','plast','guma','sklo']::TEXT[],0,'Měď vede elektrický proud velmi dobře.',2,ARRAY[]::TEXT[],NULL,3,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_4','Jaká je jednotka odporu?',ARRAY['ohm','watt','ampér','volt']::TEXT[],0,'Elektrický odpor měříme v ohmech.',3,ARRAY[]::TEXT[],NULL,4,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_5','Co se stane s proudem při zvětšení odporu a stejném napětí?',ARRAY['nezmění se vždy na nulu','zmenší se','zvětší se','změní směr']::TEXT[],1,'Podle Ohmova zákona I = U/R.',3,ARRAY[]::TEXT[],NULL,5,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_6','Jak zapojíme ampérmetr?',ARRAY['ke zdroji bez vodičů','mimo obvod','paralelně vždy','sériově']::TEXT[],3,'Ampérmetr měří proud procházející větví.',4,ARRAY[]::TEXT[],NULL,6,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_7','Jak zapojíme voltmetr?',ARRAY['mimo obvod','sériově','do vypínače místo vodiče','paralelně']::TEXT[],3,'Voltmetr měří napětí mezi dvěma body.',4,ARRAY[]::TEXT[],NULL,7,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_8','Jaký výkon má spotřebič při napětí 12 V a proudu 2 A?',ARRAY['14 W','24 W','120 W','6 W']::TEXT[],1,'Výkon P = U · I = 12 · 2 = 24 W.',5,ARRAY[]::TEXT[],NULL,8,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-elektricky-obvod_9','Proč se používá pojistka?',ARRAY['mění proud na světlo','vyrábí energii','zvyšuje napětí','chrání obvod před velkým proudem']::TEXT[],3,'Pojistka obvod při nadproudu přeruší.',5,ARRAY[]::TEXT[],NULL,9,'c_fyz-elektricky-obvod',NULL,NOW()),
('q_fyz-teplo-a-teplota_0','Čím měříme teplotu?',ARRAY['barometrem','teploměrem','siloměrem','voltmetrem']::TEXT[],1,'Teploměr měří teplotu.',1,ARRAY[]::TEXT[],NULL,0,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_1','Jaká je jednotka teploty v soustavě SI?',ARRAY['joule','watt','stupeň Celsia','kelvin']::TEXT[],3,'Základní jednotkou teploty je kelvin.',1,ARRAY[]::TEXT[],NULL,1,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_2','Kam proudí teplo samovolně?',ARRAY['jen ve vakuu','z teplejšího tělesa na chladnější','nikam','z chladnějšího na teplejší']::TEXT[],1,'Teplo se přenáší z vyšší teploty na nižší.',2,ARRAY[]::TEXT[],NULL,2,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_3','Který způsob přenosu tepla probíhá ve vakuu?',ARRAY['var','záření','proudění','vedení']::TEXT[],1,'Tepelné záření nepotřebuje látkové prostředí.',2,ARRAY[]::TEXT[],NULL,3,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_4','Při jaké teplotě tuhne voda za běžného tlaku?',ARRAY['-100 °C','50 °C','100 °C','0 °C']::TEXT[],3,'Voda tuhne při 0 °C.',3,ARRAY[]::TEXT[],NULL,4,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_5','Při jaké teplotě vře voda za běžného tlaku?',ARRAY['50 °C','100 °C','212 °C','0 °C']::TEXT[],1,'Voda vře při 100 °C.',3,ARRAY[]::TEXT[],NULL,5,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_6','Co se obvykle stane s kovem při zahřátí?',ARRAY['ztratí hmotnost na polovinu','roztáhne se','zmizí','vždy se smrští']::TEXT[],1,'Částice se více rozkmitají a kov se roztáhne.',4,ARRAY[]::TEXT[],NULL,6,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_7','Co je skupenské teplo?',ARRAY['energie potřebná ke změně skupenství','hmotnost vody','rychlost částic','teplota vzduchu']::TEXT[],0,'Při změně skupenství se dodává nebo odebírá energie.',4,ARRAY[]::TEXT[],NULL,7,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_8','Proč mají domy izolaci?',ARRAY['omezuje přenos tepla','vyrábí elektřinu','ochlazuje jen střechu','zvyšuje spotřebu']::TEXT[],0,'Izolace snižuje tepelné ztráty.',5,ARRAY[]::TEXT[],NULL,8,'c_fyz-teplo-a-teplota',NULL,NOW()),
('q_fyz-teplo-a-teplota_9','Který materiál je dobrý tepelný izolant?',ARRAY['měď','polystyren','železo','hliník']::TEXT[],1,'Polystyren obsahuje vzduch a špatně vede teplo.',5,ARRAY[]::TEXT[],NULL,9,'c_fyz-teplo-a-teplota',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

