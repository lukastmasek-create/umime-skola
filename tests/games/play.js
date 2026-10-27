const path = require('path');
const { chromium } = require('playwright');
const games = process.argv[2].split(',');
const diff = process.argv[3] || 'easy';
const maxSec = Number(process.argv[4] || 420);
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const results = await Promise.all(games.map(async g=>{
    const p = await b.newPage({viewport:{width:820,height:1100}});
    const errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    p.on('console',m=>{ if(m.type()==='error' && !/401|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0,160)); });
    await p.route('**/api/**', r=>r.fulfill({status:401,body:'{}'}));
    await p.addInitScript(d=>{ try{localStorage.setItem('game:difficulty',d);}catch(e){} }, diff);
    await p.addInitScript({path:path.join(__dirname,'bots.js')});
    await p.goto('http://localhost:8770/index.html?game='+g);
    await p.waitForTimeout(600);
    await p.locator('button.btn-bouncy').filter({hasText:/spustit|start|hru|play/i}).first().click();
    await p.evaluate((g)=>{
      const st={ticks:0};
      window.__botTimer=setInterval(()=>{
        const e=window.__quizEngine; if(!e||e.over===true||e.running===false) return;
        st.ticks++;
        try{ window.__bots[g](e,st); }catch(err){ window.__botErr=String(err&&err.stack||err).slice(0,300); }
      },50);
    }, g);
    let hints=0; const log=[]; const t0=Date.now(); let lastQ=''; let qStart=Date.now();
    let done=false;
    while(!done && Date.now()-t0<maxSec*1000){
      await p.waitForTimeout(400);
      const info = await p.evaluate(()=>{
        const txt=document.body.innerText;
        const btns=[...document.querySelectorAll('button')].map(b=>b.innerText.trim());
        return {txt: txt.replace(/\n+/g,' | ').slice(0,260), btns};
      });
      const m=/Otázka (\d+)/.exec(info.txt); const q=m?m[1]:'?';
      if(q!==lastQ){ if(lastQ) log[log.length-1]&&(log[log.length-1].ms=Date.now()-qStart); lastQ=q; qStart=Date.now(); }
      const outcome = /Správně! 🎉/.test(info.txt) && /Proč je to správně/.test(info.txt) ? 'correct' : /Správná odpověď ti uletěla/.test(info.txt) ? 'missed' : /Špatná odpověď!/.test(info.txt) ? 'wrong' : null;
      if(outcome && !log.find(l=>l.q===q)) log.push({q,outcome,ms:Date.now()-qStart});
      if(info.btns.some(t=>/Hrát znovu/.test(t))){ done=true; break; }
      if(process.env.HINT && info.btns.some(t=>/Nápověda · [1-9]/.test(t)) && !/Není to/.test(info.txt)){ await p.locator('button',{hasText:/Nápověda/}).first().click({timeout:300}).catch(()=>{}); hints++; }
      const next=info.btns.find(t=>/Další otázka|Dokončit/.test(t));
      if(next){ await p.locator('button',{hasText:/Další otázka|Dokončit/}).first().click().catch(()=>{}); }
    }
    const final = await p.evaluate(()=>document.body.innerText.replace(/\n+/g,' | ').slice(0,200));
    const botErr = await p.evaluate(()=>window.__botErr||null);
    await p.screenshot({path:`${process.env.TMPDIR||'/tmp'}/play_${g}_${diff}.png`,clip:{x:0,y:0,width:820,height:900}});
    await p.close();
    return {hints,g,diff,secs:Math.round((Date.now()-t0)/1000),done,log,final,errs:[...new Set(errs)],botErr};
  }));
  for(const r of results){
    const c=r.log.filter(l=>l.outcome==='correct').length, w=r.log.filter(l=>l.outcome==='wrong').length, m=r.log.filter(l=>l.outcome==='missed').length;
    console.log(`${r.g} [${r.diff}] hints=${r.hints} ${r.done?'DONE':'TIMEOUT'} ${r.secs}s  correct=${c} wrong=${w} missed=${m}  | ${r.final.slice(0,90)} ${r.errs.length?'ERR:'+r.errs.join(';'):''} ${r.botErr?'BOTERR:'+r.botErr:''}`);
    console.log('   per question ms:', r.log.map(l=>`${l.q}:${l.outcome[0]}${Math.round(l.ms/1000)}s`).join(' '));
  }
  await b.close();
})();
