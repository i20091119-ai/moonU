// 인트로부터 마무리까지 전 단계를 실제로 눌러 가며 캡처하고 콘솔 오류를 모음
// 사용: node tools/check_flow.js <캡처 폴더> [너비 높이]     (playwright 필요)
// 예:   node tools/check_flow.js shots 1024 768
// 화면을 고친 뒤에는 1280x800, 1024x768, 760x1000 세 크기로 돌리고 캡처를 눈으로 확인할 것
const path=require('path'),fs=require('fs');
const {chromium}=require('playwright');const out=process.argv[2]||'shots';fs.mkdirSync(out,{recursive:true});const W=+(process.argv[3]||1280),H=+(process.argv[4]||800);
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
let n=0;const shot=async(name,w=900)=>{await p.waitForTimeout(w);await p.screenshot({path:out+'/'+String(++n).padStart(2,'0')+'_'+name+'.png'})};
const stageXY=async(lat,lon)=>p.evaluate(([lat,lon])=>{const r=SR(),q=screenOf(ll(lat,lon,1.03));return{x:r.x+q.x,y:r.y+q.y}},[lat,lon]);
await p.goto('file://'+path.resolve(__dirname,'../index.html'));await shot('intro',2500);
await p.click('#bStart');await shot('prep_check',400);for(const e of await p.$$('#popBox .pitem')){await e.click();await p.waitForTimeout(150)}await shot('prep_checked',200);await p.waitForTimeout(1300);await shot('predict');
await p.locator('#predOpts .opt').nth(1).click();await shot('predict_done',500);
await p.click('#bNext');await shot('shape1',1500);
let r=await p.evaluate(()=>SR());
await p.mouse.click(r.x+r.w/2,r.y+r.h/2);await shot('shape2',2200);
await p.mouse.move(r.x+r.w/2-150,r.y+r.h/2);await p.mouse.down();for(let i=0;i<16;i++){await p.mouse.move(r.x+r.w/2-150+(i%8)*45,r.y+r.h/2+((i%2)*40),{steps:4})}await p.mouse.up();
await shot('shape3');
await p.locator('#shapeOpts .opt').nth(0).click();await shot('shape_wrong',400);
await p.locator('#shapeOpts .opt').nth(1).click();await shot('shape_ok',600);
await p.click('#bNext');await shot('surface',2500);
const spots=[[8.5,31.4,0],[32.8,-15.6,0],[-43.3,-11.4,2],[9.6,-20.1,2],[-22,22,1]];
for(let i=0;i<spots.length;i++){const [la,lo,a]=spots[i];await p.evaluate(()=>{V.t.az=0;V.t.el=0;V.t.dist=4.3});await p.waitForTimeout(1800);const q=await stageXY(la,lo);await p.mouse.click(q.x,q.y);await p.waitForTimeout(1600);
  if(i===3){await shot('surface_ask',200);await p.locator('#spotQ .opt').nth(0).click();await shot('surface_wrong',300)}
  await p.locator('#spotQ .opt').nth(a).click();
  if(i===3){await shot('surface_right',500);await p.click('#spotDown');await shot('terrain',3200);await p.click('#spotUp');await p.waitForTimeout(1500)}
  else await p.click('#spotBack');}
await shot('surface_front_done',1200);
await p.click('#flip');await p.waitForTimeout(2500);const q=await stageXY(-4,-157.4);await p.mouse.click(q.x,q.y);await p.waitForTimeout(1500);
await p.locator('#spotQ .opt').nth(0).click();await p.click('#spotBack');await shot('surface_all');
await p.click('#bNext');await shot('wrap');
for(const w of ['둥근 공','어두운 곳','울퉁불퉁한','충돌 구덩이','달의 바다']){if(w==='울퉁불퉁한'){await p.locator('#bank button',{hasText:'매끈매끈한'}).click();await shot('wrap_wrong',250)}await p.locator('#bank button',{hasText:w}).click();await p.waitForTimeout(150)}
await shot('wrap_result',1200);await p.click('#resOk');await shot('wrap_done');
await p.click('#bNext');await shot('actA_example',2500);await p.click('#aGo');await shot('actA',600);
r=await p.evaluate(()=>SR());await p.mouse.move(r.x+r.w/2-60,r.y+r.h/2-40);await p.mouse.down();await p.mouse.move(r.x+r.w/2+40,r.y+r.h/2-80,{steps:6});await p.mouse.move(r.x+r.w/2+60,r.y+r.h/2+50,{steps:6});await p.mouse.up();
await p.fill('#aName','춤추는 고양이');await shot('actA_ready',400);
await p.click('#aSave');await shot('actA_saved');
await p.click('#bNext');await shot('more');
await p.click('#pickC');await shot('actC',2500);
await p.locator('#side [data-s]').nth(2).click();await p.waitForTimeout(1500);await p.locator('#side [data-w]').nth(2).click();await shot('actC_why',400);
await p.click('#cGo');await shot('actC_land',2600);
await p.click('#bNext');await p.click('#pickB');await shot('actB');
const ib=await p.locator('#impact').boundingBox();for(const fx of [.25,.5,.75]){await p.mouse.click(ib.x+ib.width*fx,ib.y+30);await p.waitForTimeout(1500)}
await shot('actB_done');
await p.click('#bNext');await p.click('#bNext');await shot('finish');
for(const i of [0,4,8])await p.locator('.face').nth(i).click();
await shot('finish_popup',1200);await p.click('#popX');await shot('finish_done',500);
await p.click('#bJournal');await shot('pop_journal');await p.click('#popX');
await p.click('#bPrep');await shot('pop_prep');await p.click('#popX');
await p.locator('.tab').nth(2).click();await shot('tab_jump',1500);await p.click('#reset');await shot('reset',800);const afterReset=await p.evaluate(()=>Object.keys(__moon.S().found).length);await p.locator('.tab').nth(6).click();await p.waitForTimeout(500);
await p.click('#bSnd');const sndOff=await p.evaluate(()=>document.querySelector('#bSnd').classList.contains('off'));await p.click('#bSnd');
await p.click('#bHomeTop');await shot('intro_resume',600);
const resume=await p.evaluate(()=>getComputedStyle(document.querySelector('#bResume')).display);
await p.click('#bResume');await shot('resumed');
console.log('found after reset',afterReset,'snd toggled off',sndOff,'resume btn',resume,'stage',await p.evaluate(()=>__moon.S().stage),'errs',errs);await b.close()})();
