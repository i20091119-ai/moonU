// 글자가 자기 칸(단추·알약·탭·칩)의 세로 가운데에서 얼마나 벗어났는지 재는 점검
// 사용: node tools/check_align.js [너비 높이]     (playwright 필요)
// 글자의 실제 잉크 범위를 캔버스로 재서 칸 가운데와 견줌. 1.5px 넘게 벗어난 것만 출력
// 같은 줄에 나란히 놓인 것끼리(.pill 안, 단추 안의 글자와 아이콘)도 가운데 높이를 견줌
const {chromium}=require('playwright');const path=require('path');
const W=+(process.argv[2]||1280),H=+(process.argv[3]||800),LIMIT=1.5;
// 한 줄짜리 글자를 가운데에 두어야 하는 칸
const BOXES='.pill em,.pill b,.pill span,.tab small,.tab b,.btn,.hd,.opt,.bank button,.blank,.erow .tg,#stepNo,#viewChip,#zoom button,#toast span,.it-go span:not(.tile):not(.arw),.it-sub span:not(.arw),.eyebrow,.pick small,.cards .got';
// 안의 것들이 같은 높이에 있어야 하는 줄
const ROWS='.pill,.btn,.hd,#zoom button,#stepBar,#viewChip,#toast,.it-sub,.it-go,.erow,.tab';
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:W,height:H}});await p.goto('file://'+path.resolve(__dirname,'../index.html'));await p.waitForTimeout(1500);
const measure=()=>p.evaluate(([BOXES,ROWS,LIMIT])=>{
  const cv=document.createElement('canvas').getContext('2d');const bad=[];
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2&&getComputedStyle(e).visibility!=='hidden'&&e.offsetParent!==null};
  // 요소 안 글자의 잉크 세로 가운데(화면 좌표). 한 줄일 때만
  const ink=e=>{const tn=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());if(!tn.length)return null;const rg=document.createRange();rg.selectNodeContents(tn[0]);const rs=rg.getClientRects();if(rs.length!==1)return null;const cs=getComputedStyle(e);cv.font=`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;const m=cv.measureText(tn[0].textContent.trim());
    // 줄 상자 안에서 기준선 위치: 줄 상자 가운데 = 글꼴 상자 가운데
    const r=rs[0],base=r.top+r.height/2+(m.fontBoundingBoxAscent-m.fontBoundingBoxDescent)/2;return{c:base-(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2,t:tn[0].textContent.trim().slice(0,14)}};
  const name=e=>(e.id?'#'+e.id:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).join('.'):''));
  document.querySelectorAll(BOXES).forEach(e=>{if(!vis(e))return;const k=ink(e);if(!k)return;const cs=getComputedStyle(e);if(cs.display==='inline')return;const r=e.getBoundingClientRect();const d=k.c-(r.top+r.height/2);
    if(Math.abs(d)>LIMIT&&r.height<90&&e.children.length<=2)bad.push(`칸 가운데에서 ${d>0?'아래로':'위로'} ${Math.abs(d).toFixed(1)}px  ${name(e)} "${k.t}"`)});
  document.querySelectorAll(ROWS).forEach(row=>{if(!vis(row))return;const cs=getComputedStyle(row);if(!cs.display.includes('flex')||cs.flexDirection!=='row')return;const cs_=[];
    [...row.children].forEach(c=>{if(!vis(c)||getComputedStyle(c).position==='absolute')return;const k=ink(c);const r=c.getBoundingClientRect();cs_.push({n:name(c),y:k?k.c:r.top+r.height/2,t:k?k.t:''})});
    // 글자 노드가 줄에 바로 들어 있는 경우
    const k0=ink(row);if(k0)cs_.push({n:'(글자)',y:k0.c,t:k0.t});
    if(cs_.length<2)return;const ys=cs_.map(c=>c.y),sp=Math.max(...ys)-Math.min(...ys);
    if(sp>LIMIT)bad.push(`한 줄 안에서 ${sp.toFixed(1)}px 어긋남  ${name(row)}: `+cs_.map(c=>`${c.n}${c.t?' "'+c.t+'"':''} ${c.y.toFixed(1)}`).join(' | '))});
  return [...new Set(bad)]},[BOXES,ROWS,LIMIT]);
let total=0;const run=async label=>{await p.waitForTimeout(700);const r=await measure();total+=r.length;console.log(`[${label}] ${r.length?'':'문제 없음'}`);r.forEach(x=>console.log('  '+x))};
await run('인트로');
await p.evaluate(()=>{const s=__moon.S();Object.assign(s,{pred:1,max:6,shape:{dragged:true,ok:true},found:{sea1:1,sea2:1,cr1:1,cr2:1,hi:1},wrapOk:false,draw:null,site:'다',siteWhy:[2]})});
for(const st of ['predict','shape','surface','wrap','actA','more','actC','actB','actD','finish']){await p.evaluate(s=>{__moon.go(s);toast('알림 문장이에요.')},st);await run(st)}
await p.evaluate(()=>{__moon.go('surface')});await p.waitForTimeout(600);
await p.evaluate(()=>document.querySelector('#bPrep').click());await run('준비물 팝업');
console.log(total?`벗어난 곳 ${total}개`:'모두 통과');await b.close()})();
