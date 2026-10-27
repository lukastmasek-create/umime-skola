const path = require('path');
const { chromium } = require('playwright');
const games = process.argv[2].split(',');
const diff = process.argv[3] || 'hard';
const secs = Number(process.argv[4] || 25);
(async()=>{
  const b = await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
  const res = await Promise.all(games.map(async g=>{
    const p = await b.newPage({viewport:{width:820,height:1100}});
    const errs=[];
    p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
    p.on('console',m=>{ if(m.type()==='error' && !/401|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0,160)); });
    await p.route('**/api/**', r=>r.fulfill({status:401,body:'{}'}));
    await p.addInitScript(d=>{ try{localStorage.setItem('game:difficulty',d);}catch(e){} }, diff);
    await p.goto('http://localhost:8770/index.html?game='+g);
    await p.waitForTimeout(500);
    await p.locator('button.btn-bouncy').filter({hasText:/spustit/i}).first().click();
    const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'];
    const t0=Date.now(); let n=0;
    while(Date.now()-t0<secs*1000){
      const r=Math.random();
      if(r<0.04) await p.locator('button',{hasText:/Nápověda/}).first().click({timeout:200}).catch(()=>{});
      else if(r<0.07){ await p.keyboard.press('KeyP'); await p.waitForTimeout(300); await p.keyboard.press('KeyP'); }
      else if(r<0.10) await p.locator('button',{hasText:/Další otázka|Dokončit|Hrát znovu/}).first().click({timeout:200}).catch(()=>{});
      else if(r<0.14){ const box=await p.locator('canvas').boundingBox(); await p.mouse.click(box.x+Math.random()*box.width, box.y+Math.random()*box.height); }
      else { const k=keys[Math.floor(Math.random()*keys.length)]; await p.keyboard.down(k); await p.waitForTimeout(60+Math.random()*200); await p.keyboard.up(k); }
      n++;
    }
    const nan = await p.evaluate(()=>{ const e=window.__quizEngine; return e? Object.entries(e).filter(([k,v])=>typeof v==='number'&&!Number.isFinite(v)).map(([k])=>k):[] });
    await p.close();
    return {g,errs:[...new Set(errs)],nan,n};
  }));
  for(const r of res) console.log(r.g, diff, r.errs.length||r.nan.length ? 'PROBLEM '+JSON.stringify(r) : 'ok ('+r.n+' actions)');
  await b.close();
})();
