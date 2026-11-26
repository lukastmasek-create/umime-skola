-- Vygenerováno z prisma/content/anglictina-dalsi.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_aj-cestovani','Travel English','aj-cestovani','Základní anglická slovíčka a fráze pro cestování.',true,'ZAKLADNI'::"Category",'ANGLICTINA'::"Subject",'Konverzace',7,NOW(),NOW()),
('c_aj-technologie','Technology and the Internet','aj-technologie','Anglická slovní zásoba pro počítače, internet a moderní technologie.',true,'ZAKLADNI'::"Category",'ANGLICTINA'::"Subject",'Slovní zásoba',8,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_aj-cestovani_1','Test 1',1,true,'c_aj-cestovani',NOW(),NOW()),
('l_aj-cestovani_2','Test 2',2,true,'c_aj-cestovani',NOW(),NOW()),
('l_aj-cestovani_3','Test 3',3,true,'c_aj-cestovani',NOW(),NOW()),
('l_aj-cestovani_4','Test 4',4,true,'c_aj-cestovani',NOW(),NOW()),
('l_aj-cestovani_5','Test 5',5,true,'c_aj-cestovani',NOW(),NOW()),
('l_aj-technologie_1','Test 1',1,true,'c_aj-technologie',NOW(),NOW()),
('l_aj-technologie_2','Test 2',2,true,'c_aj-technologie',NOW(),NOW()),
('l_aj-technologie_3','Test 3',3,true,'c_aj-technologie',NOW(),NOW()),
('l_aj-technologie_4','Test 4',4,true,'c_aj-technologie',NOW(),NOW()),
('l_aj-technologie_5','Test 5',5,true,'c_aj-technologie',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_aj-cestovani_0','How do you say letiště?',ARRAY['station','airport','hotel','street']::TEXT[],1,'Airport znamená letiště.',1,ARRAY[]::TEXT[],NULL,0,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_1','What do you show at the airport?',ARRAY['ticket','map','passport','menu']::TEXT[],2,'Passport je cestovní pas.',1,ARRAY[]::TEXT[],NULL,1,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_2','Complete the sentence: Where are you from?',ARRAY['is','are','am','be']::TEXT[],1,'Se you používá are.',2,ARRAY[]::TEXT[],NULL,2,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_3','How do you ask for directions?',ARRAY['How old are you?','Where are you born?','What is it?','How can I get there?']::TEXT[],3,'Tato fráze znamená Jak se tam dostanu?',2,ARRAY[]::TEXT[],NULL,3,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_4','What is a return ticket?',ARRAY['free ticket','ticket for today','ticket for a child','ticket there and back']::TEXT[],3,'Return ticket je zpáteční jízdenka.',3,ARRAY[]::TEXT[],NULL,4,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_5','Choose the correct sentence.',ARRAY['I stays at hotel.','I am staying at a hotel.','I am stay hotel.','I staying hotel.']::TEXT[],1,'Po am následuje sloveso s koncovkou -ing.',3,ARRAY[]::TEXT[],NULL,5,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_6','What does boarding pass mean?',ARRAY['palubní lístek','pas','jízdní řád','mapa']::TEXT[],0,'Boarding pass je palubní lístek.',4,ARRAY[]::TEXT[],NULL,6,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_7','We have been waiting for two hours. Which word completes the sentence?',ARRAY['for','since','on','at']::TEXT[],0,'For používáme pro délku trvání.',4,ARRAY[]::TEXT[],NULL,7,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_8','Which sentence is correct?',ARRAY['Could recommend you a restaurant?','Could you recommending restaurant?','Can you recommended restaurant?','Could you recommend a restaurant?']::TEXT[],3,'Po could používáme základní tvar slovesa.',5,ARRAY[]::TEXT[],NULL,8,'c_aj-cestovani',NULL,NOW()),
('q_aj-cestovani_9','What does delayed mean?',ARRAY['zrušený','zpožděný','zaplacený','ztracený']::TEXT[],1,'Delayed znamená zpožděný.',5,ARRAY[]::TEXT[],NULL,9,'c_aj-cestovani',NULL,NOW()),
('q_aj-technologie_0','What is a keyboard?',ARRAY['tiskárna','myš','klávesnice','obrazovka']::TEXT[],2,'Keyboard je klávesnice.',1,ARRAY[]::TEXT[],NULL,0,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_1','What does download mean?',ARRAY['tisknout','sdílet','smazat','stáhnout']::TEXT[],3,'Download znamená stáhnout data.',1,ARRAY[]::TEXT[],NULL,1,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_2','I sent an email yesterday. Which verb is correct?',ARRAY['send','sent','sends','sending']::TEXT[],1,'Yesterday vyžaduje minulý čas; minulý tvar send je sent.',2,ARRAY[]::TEXT[],NULL,2,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_3','What is a password?',ARRAY['heslo','soubor','uživatelské jméno','program']::TEXT[],0,'Password je heslo.',2,ARRAY[]::TEXT[],NULL,3,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_4','Choose the correct plural of mouse.',ARRAY['mice','mices','mousees','mouses']::TEXT[],0,'Mouse má nepravidelné množné číslo mice.',3,ARRAY[]::TEXT[],NULL,4,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_5','What does online mean?',ARRAY['offline','připojený k internetu','rozbitý','vytištěný']::TEXT[],1,'Online označuje připojení k internetu.',3,ARRAY[]::TEXT[],NULL,5,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_6','If you click the link, it will open. Which word is correct?',ARRAY['would','has','was','will']::TEXT[],3,'V prvním kondicionálu používáme will.',4,ARRAY[]::TEXT[],NULL,6,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_7','What is cyberbullying?',ARRAY['online nákup','počítačová hra','ochrana hesla','šikana přes internet']::TEXT[],3,'Cyberbullying je šikana v digitálním prostředí.',4,ARRAY[]::TEXT[],NULL,7,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_8','Which sentence uses present perfect correctly?',ARRAY['I have lose my phone.','I have lost my phone.','I has lost my phone.','I lost have my phone.']::TEXT[],1,'Po have následuje třetí tvar slovesa: lost.',5,ARRAY[]::TEXT[],NULL,8,'c_aj-technologie',NULL,NOW()),
('q_aj-technologie_9','What does privacy mean?',ARRAY['záloha','rychlost','soukromí','síť']::TEXT[],2,'Privacy znamená soukromí.',5,ARRAY[]::TEXT[],NULL,9,'c_aj-technologie',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

