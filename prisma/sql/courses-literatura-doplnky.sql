-- Vygenerováno z prisma/content/literatura-doplnky.cjs. Idempotentní: opakované spuštění nic nezdvojí.

INSERT INTO "Course" ("id","title","slug","description","published","category","subject","section","grade","createdAt","updatedAt") VALUES
('c_lit-p-literarni-pojmy','Literární pojmy','lit-p-literarni-pojmy','Základní pojmy teorie literatury.',true,'ZAKLADNI'::"Category",'LITERATURA'::"Subject",'Teorie literatury',7,NOW(),NOW()),
('c_lit-p-hrdinove-a-autori','Hrdinové a jejich autoři','lit-p-hrdinove-a-autori','Spojování postav a autorů.',true,'ZAKLADNI'::"Category",'LITERATURA'::"Subject",'Próza',6,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Level" ("id","title","order","published","courseId","createdAt","updatedAt") VALUES
('l_lit-p-literarni-pojmy_1','Test 1',1,true,'c_lit-p-literarni-pojmy',NOW(),NOW()),
('l_lit-p-literarni-pojmy_2','Test 2',2,true,'c_lit-p-literarni-pojmy',NOW(),NOW()),
('l_lit-p-literarni-pojmy_3','Test 3',3,true,'c_lit-p-literarni-pojmy',NOW(),NOW()),
('l_lit-p-literarni-pojmy_4','Test 4',4,true,'c_lit-p-literarni-pojmy',NOW(),NOW()),
('l_lit-p-literarni-pojmy_5','Test 5',5,true,'c_lit-p-literarni-pojmy',NOW(),NOW()),
('l_lit-p-hrdinove-a-autori_1','Test 1',1,true,'c_lit-p-hrdinove-a-autori',NOW(),NOW()),
('l_lit-p-hrdinove-a-autori_2','Test 2',2,true,'c_lit-p-hrdinove-a-autori',NOW(),NOW()),
('l_lit-p-hrdinove-a-autori_3','Test 3',3,true,'c_lit-p-hrdinove-a-autori',NOW(),NOW()),
('l_lit-p-hrdinove-a-autori_4','Test 4',4,true,'c_lit-p-hrdinove-a-autori',NOW(),NOW()),
('l_lit-p-hrdinove-a-autori_5','Test 5',5,true,'c_lit-p-hrdinove-a-autori',NOW(),NOW())
ON CONFLICT ("courseId","order") DO NOTHING;

INSERT INTO "Question" ("id","prompt","options","correctIndex","explanation","difficulty","answers","hint","order","courseId","levelId","createdAt") VALUES
('q_lit-p-literarni-pojmy_0','Co je sloka?',ARRAY['skupina veršů','vyprávění o dávných událostech a místech','shoda zvuků na konci veršů','příběh se zvířaty a poučením']::TEXT[],0,'sloka → skupina veršů.',1,ARRAY[]::TEXT[],NULL,0,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_1','Co je přirovnání?',ARRAY['srovnání dvou věcí pomocí jako','řádek básně','příběh se zvířaty a poučením','přenesené pojmenování']::TEXT[],0,'přirovnání → srovnání dvou věcí pomocí jako.',1,ARRAY[]::TEXT[],NULL,1,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_2','Co je tragédie?',ARRAY['veselá divadelní hra','vyprávění o dávných událostech a místech','hra s tragickým koncem','řádek básně']::TEXT[],2,'tragédie → hra s tragickým koncem.',1,ARRAY[]::TEXT[],NULL,2,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_3','Co je personifikace?',ARRAY['básnický přívlastek','očlovečení věcí nebo zvířat','báseň s ponurým dramatickým příběhem','řádek básně']::TEXT[],1,'personifikace → očlovečení věcí nebo zvířat.',2,ARRAY[]::TEXT[],NULL,3,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_4','Co je balada?',ARRAY['srovnání dvou věcí pomocí jako','báseň s ponurým dramatickým příběhem','básnický přívlastek','shoda zvuků na konci veršů']::TEXT[],1,'balada → báseň s ponurým dramatickým příběhem.',2,ARRAY[]::TEXT[],NULL,4,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_5','Co je epiteton?',ARRAY['srovnání dvou věcí pomocí jako','veselá divadelní hra','básnický přívlastek','báseň s ponurým dramatickým příběhem']::TEXT[],2,'epiteton → básnický přívlastek.',2,ARRAY[]::TEXT[],NULL,5,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_6','Co je bajka?',ARRAY['báseň s ponurým dramatickým příběhem','skupina veršů','příběh se zvířaty a poučením','přenesené pojmenování']::TEXT[],2,'bajka → příběh se zvířaty a poučením.',3,ARRAY[]::TEXT[],NULL,6,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_7','Co je komedie?',ARRAY['vyprávění o dávných událostech a místech','veselá divadelní hra','skupina veršů','básnický přívlastek']::TEXT[],1,'komedie → veselá divadelní hra.',3,ARRAY[]::TEXT[],NULL,7,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_8','Co je metafora?',ARRAY['hra s tragickým koncem','přenesené pojmenování','báseň s ponurým dramatickým příběhem','očlovečení věcí nebo zvířat']::TEXT[],1,'metafora → přenesené pojmenování.',3,ARRAY[]::TEXT[],NULL,8,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_9','Co je rým?',ARRAY['řádek básně','hra s tragickým koncem','shoda zvuků na konci veršů','očlovečení věcí nebo zvířat']::TEXT[],2,'rým → shoda zvuků na konci veršů.',4,ARRAY[]::TEXT[],NULL,9,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_10','Co je pověst?',ARRAY['shoda zvuků na konci veršů','básnický přívlastek','veselá divadelní hra','vyprávění o dávných událostech a místech']::TEXT[],3,'pověst → vyprávění o dávných událostech a místech.',4,ARRAY[]::TEXT[],NULL,10,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_11','Co je verš?',ARRAY['řádek básně','veselá divadelní hra','přenesené pojmenování','básnický přívlastek']::TEXT[],0,'verš → řádek básně.',4,ARRAY[]::TEXT[],NULL,11,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_12','Který pojem označuje: skupina veršů?',ARRAY['balada','bajka','sloka','pověst']::TEXT[],2,'skupina veršů → sloka.',5,ARRAY[]::TEXT[],NULL,12,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_13','Který pojem označuje: srovnání dvou věcí pomocí jako?',ARRAY['balada','rým','tragédie','přirovnání']::TEXT[],3,'srovnání dvou věcí pomocí jako → přirovnání.',5,ARRAY[]::TEXT[],NULL,13,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-literarni-pojmy_14','Který pojem označuje: hra s tragickým koncem?',ARRAY['tragédie','personifikace','balada','komedie']::TEXT[],0,'hra s tragickým koncem → tragédie.',5,ARRAY[]::TEXT[],NULL,14,'c_lit-p-literarni-pojmy',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_0','Kdo je autorem postavy: Pinocchio?',ARRAY['Carlo Collodi','Josef Lada','Ondřej Sekora','Astrid Lindgrenová']::TEXT[],0,'Pinocchio → Carlo Collodi.',1,ARRAY[]::TEXT[],NULL,0,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_1','Kdo je autorem postavy: Kocour Mikeš?',ARRAY['Carlo Collodi','J. K. Rowlingová','Josef Lada','Ondřej Sekora']::TEXT[],2,'Kocour Mikeš → Josef Lada.',1,ARRAY[]::TEXT[],NULL,1,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_2','Kdo je autorem postavy: Sherlock Holmes?',ARRAY['Antoine de Saint-Exupéry','Rudyard Kipling','Arthur Conan Doyle','Lewis Carroll']::TEXT[],2,'Sherlock Holmes → Arthur Conan Doyle.',1,ARRAY[]::TEXT[],NULL,2,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_3','Kdo je autorem postavy: Bilbo Pytlík?',ARRAY['Antoine de Saint-Exupéry','Mark Twain','J. R. R. Tolkien','Carlo Collodi']::TEXT[],2,'Bilbo Pytlík → J. R. R. Tolkien.',2,ARRAY[]::TEXT[],NULL,3,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_4','Kdo je autorem postavy: Malý princ?',ARRAY['Antoine de Saint-Exupéry','Karel Čapek','J. R. R. Tolkien','J. K. Rowlingová']::TEXT[],0,'Malý princ → Antoine de Saint-Exupéry.',2,ARRAY[]::TEXT[],NULL,4,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_5','Kdo je autorem postavy: Harry Potter?',ARRAY['Astrid Lindgrenová','Carlo Collodi','J. K. Rowlingová','Mark Twain']::TEXT[],2,'Harry Potter → J. K. Rowlingová.',2,ARRAY[]::TEXT[],NULL,5,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_6','Kdo je autorem postavy: Dášeňka?',ARRAY['Mark Twain','Josef Lada','Karel Čapek','Jaroslav Hašek']::TEXT[],2,'Dášeňka → Karel Čapek.',3,ARRAY[]::TEXT[],NULL,6,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_7','Kdo je autorem postavy: Rumcajs?',ARRAY['Arthur Conan Doyle','Mark Twain','Antoine de Saint-Exupéry','Václav Čtvrtek']::TEXT[],3,'Rumcajs → Václav Čtvrtek.',3,ARRAY[]::TEXT[],NULL,7,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_8','Kdo je autorem postavy: Mauglí?',ARRAY['Jaroslav Hašek','Václav Čtvrtek','Rudyard Kipling','J. K. Rowlingová']::TEXT[],2,'Mauglí → Rudyard Kipling.',3,ARRAY[]::TEXT[],NULL,8,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_9','Kdo je autorem postavy: Pipi Dlouhá punčocha?',ARRAY['Josef Lada','Astrid Lindgrenová','Arthur Conan Doyle','Ondřej Sekora']::TEXT[],1,'Pipi Dlouhá punčocha → Astrid Lindgrenová.',4,ARRAY[]::TEXT[],NULL,9,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_10','Kdo je autorem postavy: Švejk?',ARRAY['Václav Čtvrtek','J. R. R. Tolkien','J. K. Rowlingová','Jaroslav Hašek']::TEXT[],3,'Švejk → Jaroslav Hašek.',4,ARRAY[]::TEXT[],NULL,10,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_11','Kdo je autorem postavy: Alenka v říši divů?',ARRAY['Arthur Conan Doyle','Lewis Carroll','Mark Twain','Ondřej Sekora']::TEXT[],1,'Alenka v říši divů → Lewis Carroll.',4,ARRAY[]::TEXT[],NULL,11,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_12','Kdo je autorem postavy: Ferda Mravenec?',ARRAY['J. R. R. Tolkien','Václav Čtvrtek','J. K. Rowlingová','Ondřej Sekora']::TEXT[],3,'Ferda Mravenec → Ondřej Sekora.',5,ARRAY[]::TEXT[],NULL,12,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_13','Kdo je autorem postavy: Tom Sawyer?',ARRAY['Mark Twain','Carlo Collodi','J. K. Rowlingová','Karel Čapek']::TEXT[],0,'Tom Sawyer → Mark Twain.',5,ARRAY[]::TEXT[],NULL,13,'c_lit-p-hrdinove-a-autori',NULL,NOW()),
('q_lit-p-hrdinove-a-autori_14','Kterou postavu vytvořil(a) Carlo Collodi?',ARRAY['Švejk','Malý princ','Tom Sawyer','Pinocchio']::TEXT[],3,'Carlo Collodi → Pinocchio.',5,ARRAY[]::TEXT[],NULL,14,'c_lit-p-hrdinove-a-autori',NULL,NOW())
ON CONFLICT ("id") DO NOTHING;

