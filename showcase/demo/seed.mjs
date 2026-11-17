// Seeds NON-PERSONAL demo accounts into the LOCAL capture database only (never production).
import { createRequire } from 'node:module';
const require = createRequire('/home/user/umime-skola/');
const bcrypt = require('bcryptjs');
import { execFileSync } from 'node:child_process';
const hash = bcrypt.hashSync('DemoPass-12345', 10);
const names = [['Demo Žák','demo.zak@example.test','STUDENT',1450],['Demo Učitel','demo.ucitel@example.test','INSTRUCTOR',0],
 ['Anna K.','anna@example.test','STUDENT',1200],['Tomáš N.','tomas@example.test','STUDENT',960],['Eliška P.','eliska@example.test','STUDENT',720],
 ['Matyáš R.','matyas@example.test','STUDENT',640],['Klára S.','klara@example.test','STUDENT',515],['Jakub M.','jakub@example.test','STUDENT',380]];
const sql = names.map(([n,e,r,p],i)=>`INSERT INTO "User"(id,name,email,password,role,points,"createdAt","updatedAt") VALUES ('demo_u${i}','${n}','${e}','${hash}','${r}'::"Role",${p},NOW(),NOW()) ON CONFLICT (email) DO NOTHING;`).join('\n');
execFileSync('psql',['-h','localhost','-p','54329','-U','demo','umime','-q','-c',sql],{env:{...process.env,PGPASSWORD:'demo'},stdio:'inherit'});
console.log('seeded');
