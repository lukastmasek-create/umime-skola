-- Vygenerováno z prisma/content/dejepis-dalsi-kurzy.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_dej-prumyslova-revoluce','Průmyslová revoluce','dej-prumyslova-revoluce','Stroje, továrny, urbanizace a změny společnosti v 18. a 19. století.',true,'ZAKLADNI'::"Category",'DEJEPIS'::"Subject",'Novověk',8,NOW(),NOW()),
('c_dej-ceske-zeme-19-stoleti','České země v 19. století','dej-ceske-zeme-19-stoleti','Národní obrození, průmysl a vznik moderní české společnosti.',true,'ZAKLADNI'::"Category",'DEJEPIS'::"Subject",'Moderní dějiny',8,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_dej-prumyslova-revoluce_1','Test 1',1,true,'c_dej-prumyslova-revoluce',NOW(),NOW()),
('l_dej-prumyslova-revoluce_2','Test 2',2,true,'c_dej-prumyslova-revoluce',NOW(),NOW()),
('l_dej-prumyslova-revoluce_3','Test 3',3,true,'c_dej-prumyslova-revoluce',NOW(),NOW()),
('l_dej-prumyslova-revoluce_4','Test 4',4,true,'c_dej-prumyslova-revoluce',NOW(),NOW()),
('l_dej-prumyslova-revoluce_5','Test 5',5,true,'c_dej-prumyslova-revoluce',NOW(),NOW()),
('l_dej-ceske-zeme-19-stoleti_1','Test 1',1,true,'c_dej-ceske-zeme-19-stoleti',NOW(),NOW()),
('l_dej-ceske-zeme-19-stoleti_2','Test 2',2,true,'c_dej-ceske-zeme-19-stoleti',NOW(),NOW()),
('l_dej-ceske-zeme-19-stoleti_3','Test 3',3,true,'c_dej-ceske-zeme-19-stoleti',NOW(),NOW()),
('l_dej-ceske-zeme-19-stoleti_4','Test 4',4,true,'c_dej-ceske-zeme-19-stoleti',NOW(),NOW()),
('l_dej-ceske-zeme-19-stoleti_5','Test 5',5,true,'c_dej-ceske-zeme-19-stoleti',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_dej-prumyslova-revoluce_0','Kde začala průmyslová revoluce?',ARRAY['ve Velké Británii','v Egyptě','v Číně','v Rusku']::TEXT[],0,'Průmyslová revoluce začala v Británii.',1,ARRAY[]::TEXT[],NULL,0,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_1','Který vynález poháněl první továrny?',ARRAY['parní stroj','telefon','televize','letadlo']::TEXT[],0,'Parní stroj umožnil mechanizaci výroby.',1,ARRAY[]::TEXT[],NULL,1,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_2','Kdo zdokonalil parní stroj?',ARRAY['Alexander Graham Bell','James Watt','Thomas Edison','Louis Pasteur']::TEXT[],1,'James Watt parní stroj výrazně zdokonalil.',2,ARRAY[]::TEXT[],NULL,2,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_3','Co znamená urbanizace?',ARRAY['úpadek měst','stavba hradů','růst měst a stěhování lidí do měst','objev oceánu']::TEXT[],2,'Urbanizace je růst měst.',2,ARRAY[]::TEXT[],NULL,3,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_4','Jaký průmysl byl důležitý pro textilní revoluci?',ARRAY['letecký','textilní','filmový','potravinářský']::TEXT[],1,'Textilní výroba patřila mezi první mechanizované obory.',3,ARRAY[]::TEXT[],NULL,4,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_5','Kdo tvořil dělnickou třídu?',ARRAY['lidé pracující v továrnách','duchovenstvo','šlechta','panovníci']::TEXT[],0,'Dělníci pracovali za mzdu v továrnách.',3,ARRAY[]::TEXT[],NULL,5,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_6','Co je manufaktura?',ARRAY['výroba rozdělená mezi mnoho ručních pracovníků','středověký hrad','zemědělský nástroj','typ zákona']::TEXT[],0,'Manufaktura předcházela tovární výrobě.',4,ARRAY[]::TEXT[],NULL,6,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_7','Jaký dopravní prostředek rozšířila železnice?',ARRAY['balón','vrtulník','vlak','ponorku']::TEXT[],2,'Železnice umožnila rychlou přepravu osob i zboží.',4,ARRAY[]::TEXT[],NULL,7,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_8','Jaký byl jeden důsledek industrializace?',ARRAY['konec obchodu','návrat k lovu','zánik měst','růst výroby a sociální problémy dělníků']::TEXT[],3,'Industrializace zvýšila výrobu, ale zhoršila pracovní podmínky.',5,ARRAY[]::TEXT[],NULL,8,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-prumyslova-revoluce_9','Co požadovalo dělnické hnutí?',ARRAY['více válek','návrat feudálních vztahů','lepší mzdy a pracovní podmínky','zrušení škol']::TEXT[],2,'Dělnické hnutí usilovalo o sociální práva.',5,ARRAY[]::TEXT[],NULL,9,'c_dej-prumyslova-revoluce',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_0','Co bylo národní obrození?',ARRAY['obnova českého jazyka a kultury','náboženská válka','vojenská bitva','stavba pyramid']::TEXT[],0,'Národní obrození posilovalo českou identitu.',1,ARRAY[]::TEXT[],NULL,0,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_1','Kdo napsal Slovník česko-německý?',ARRAY['František Palacký','Karel IV.','Josef Jungmann','Jan Amos Komenský']::TEXT[],2,'Josef Jungmann byl významný obrozenec.',1,ARRAY[]::TEXT[],NULL,1,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_2','Kdo je autorem Dějin národu českého?',ARRAY['Josef Dobrovský','František Palacký','Mikoláš Aleš','Božena Němcová']::TEXT[],1,'Palacký napsal rozsáhlé české dějiny.',2,ARRAY[]::TEXT[],NULL,2,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_3','Které město se stalo centrem českého průmyslu?',ARRAY['Oslo','Řím','Athény','Praha']::TEXT[],3,'Praha byla významným kulturním i průmyslovým centrem.',2,ARRAY[]::TEXT[],NULL,3,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_4','Kdy vzniklo Národní divadlo?',ARRAY['v 15. století','v 19. století','ve 21. století','ve 13. století']::TEXT[],1,'Národní divadlo bylo otevřeno roku 1881.',3,ARRAY[]::TEXT[],NULL,4,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_5','Která spisovatelka napsala Babičku?',ARRAY['Karolína Světlá','Marie Majerová','Božena Němcová','Eliška Krásnohorská']::TEXT[],2,'Babičku napsala Božena Němcová.',3,ARRAY[]::TEXT[],NULL,5,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_6','Jaký význam měl rok 1848?',ARRAY['vznik Říma','revoluce a požadavky občanských práv','začátek husitství','objev Ameriky']::TEXT[],1,'Rok 1848 přinesl revoluční hnutí v Evropě.',4,ARRAY[]::TEXT[],NULL,6,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_7','Co prosazovali obrozenci?',ARRAY['návrat latiny jako jediného jazyka','zrušení měst','češtinu ve školách a veřejném životě','zákaz knih']::TEXT[],2,'Obrozenci podporovali český jazyk a kulturu.',4,ARRAY[]::TEXT[],NULL,7,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_8','Který panovník vydal pragmatickou sankci?',ARRAY['Rudolf II.','Josef II.','Karel VI.','František Josef I.']::TEXT[],2,'Pragmatická sankce byla vydána Karlem VI.',5,ARRAY[]::TEXT[],NULL,8,'c_dej-ceske-zeme-19-stoleti',NULL,NOW()),
('q_dej-ceske-zeme-19-stoleti_9','Co znamenal vznik moderních národů?',ARRAY['zánik všech států','jen změnu měny','návrat k pravěku','sdílený jazyk, kultura a politické vědomí']::TEXT[],3,'Moderní národy spojoval jazyk, kultura a společná identita.',5,ARRAY[]::TEXT[],NULL,9,'c_dej-ceske-zeme-19-stoleti',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

