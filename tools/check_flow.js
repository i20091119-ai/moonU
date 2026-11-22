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
await p.click('#bNext');await shot('shape1_aim',1500);
let r=await p.evaluate(()=>SR());
// 01 달을 끌어 가운데로 (달은 가운데에서 오른쪽 위로 벗어나 있음)
{const mx=r.x+r.w/2+r.w*.24,my=r.y+r.h/2-r.h*.2;await p.mouse.move(mx,my);await p.mouse.down();await p.mouse.move(r.x+r.w/2,r.y+r.h/2,{steps:14});await p.mouse.up()}
await shot('shape2_focus',2200);
await p.locator('#focusBar input').fill('40');await shot('shape2_blur',300);await p.locator('#focusBar input').fill('64');await shot('shape3_duo',2200);
await p.mouse.move(r.x+r.w*.75-80,r.y+r.h/2);await p.mouse.down();for(let i=0;i<20;i++){await p.mouse.move(r.x+r.w*.75-80+(i%10)*24,r.y+r.h/2+((i%2)*30),{steps:3})}await p.mouse.up();
await p.evaluate(()=>{V.t.az=82;V.az=82});await shot('shape3_side',700);
await p.locator('#shapeOpts .opt').nth(0).click();await shot('shape_wrong',400);
await p.locator('#shapeOpts .opt').nth(1).click();await shot('shape_ok',600);
await p.click('#bNext');await shot('surface',2500);
// 관찰 2: 임무 4개를 찾아서 찍기. 시점은 직접 맞춰 줌
const aim=async(lon,lat,dist)=>{await p.evaluate(([lon,lat,dist])=>{V.t.az=lon;V.t.el=lat;V.t.dist=dist},[lon,lat,dist]);await p.waitForTimeout(2200)};
await p.click('#shoot');await shot('surface_far',400);await aim(-30,-70,3.2);await p.click('#shoot');await shot('surface_miss',400);          // 어두운 곳이 아닌 데를 찍어 봄
await aim(31.4,8.5,3.0);await p.click('#shoot');await shot('surface_m1',1100);
await p.click('#spotDown');await shot('terrain',3200);await p.click('#spotUp');await p.waitForTimeout(1500);
await p.click('#spotNext');await aim(22,-22,3.0);await p.click('#shoot');await shot('surface_m2',1100);
await p.click('#spotNext');await aim(-20.1,9.6,2.4);await shot('surface_m3_aim',200);await p.click('#shoot');await shot('surface_m3',1100);
await p.click('#spotNext');await shot('surface_m4',600);await p.click('#flip');await p.waitForTimeout(2600);await p.click('#shoot');await shot('surface_m4_ask',1100);
await p.locator('#farOpts .opt').nth(1).click();await p.waitForTimeout(250);await p.locator('#farOpts .opt').nth(0).click();await shot('surface_m4_done',700);
await p.click('#spotNext');await shot('surface_all',600);
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
await p.click('#bNext');await p.click('#pickD');await shot('actD',2500);
{const sr=await p.evaluate(()=>SR());const cam=await p.locator('.phone .cam').boundingBox();const from={x:cam.x+17,y:cam.y+60},to={x:sr.x+sr.w/2,y:sr.y+sr.h*.36+43};
 await p.mouse.move(from.x,from.y);await p.mouse.down();await p.mouse.move(to.x,to.y,{steps:12});await p.mouse.up();await shot('actD_aligned',700);
 await p.locator('.pmode [data-m=more]').click();await p.waitForTimeout(200);await p.locator('.pmode [data-m=pro]').click();await shot('actD_pro',500);
 await p.locator('.prow [data-p=iso]').click();await p.locator('.pslide input').fill('0');await shot('actD_iso',500);
 await p.locator('.prow [data-p=spd]').click();await p.locator('.pslide input').fill('6');await shot('actD_speed',500);
 await p.locator('.phone .shut').click();await shot('actD_shot',900);await p.locator('#side [data-f]').nth(2).click();await p.waitForTimeout(200)}
await p.click('#bNext');await p.click('#bNext');await shot('finish');
for(const i of [0,4,8])await p.locator('.face').nth(i).click();
await shot('finish_popup',1200);await p.click('#popX');await shot('finish_done',500);
await p.click('#bJournal');await shot('pop_journal');await p.click('#popX');
await p.click('#bPrep');await shot('pop_prep');await p.click('#popX');
await p.locator('.tab').nth(2).click();await shot('tab_jump',1500);await p.click('#reset');await shot('reset',800);const afterReset=await p.evaluate(()=>Object.keys(__moon.S().shots).length);await p.locator('.tab').nth(6).click();await p.waitForTimeout(500);
await p.click('#bSnd');const sndOff=await p.evaluate(()=>document.querySelector('#bSnd').classList.contains('off'));await p.click('#bSnd');
await p.click('#bHomeTop');await shot('intro_resume',600);
const resume=await p.evaluate(()=>getComputedStyle(document.querySelector('#bResume')).display);
await p.click('#bResume');await shot('resumed');
console.log('found after reset',afterReset,'snd toggled off',sndOff,'resume btn',resume,'stage',await p.evaluate(()=>__moon.S().stage),'errs',errs);await b.close()})();
