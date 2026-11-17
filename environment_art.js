// v1.6 environmental art pass. Visual-only hooks; no game state mutations.
(() => {
 'use strict';
 const priorGround=ground, priorDetails=streetDetails, priorTower=tower;
 const rng=n=>{const v=Math.sin(n*91.17+4.31)*43758.5453;return v-Math.floor(v)};
 const visible=(x,y,range=1150)=>{const p=driving?car:player;return Math.abs(x-p.x)+Math.abs(y-p.y)<range*1.7};
 const stroke=(a,b,c,d,color,width=1)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke()};
 const diamond=(x,y,w,h,z,color)=>quad([[x-w/2,y-h/2,z],[x+w/2,y-h/2,z],[x+w/2,y+h/2,z],[x-w/2,y+h/2,z]],color);
 const glow=(x,y,r,color,alpha=.18)=>{const p=iso(x,y,12);ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p.x,p.y,r,r*.42,0,0,Math.PI*2);ctx.fill();ctx.restore()};
 function stripe(x,y,angle,length,color,width=3){const a=iso(x-Math.cos(angle)*length/2,y-Math.sin(angle)*length/2,10),b=iso(x+Math.cos(angle)*length/2,y+Math.sin(angle)*length/2,10);stroke(a.x,a.y,b.x,b.y,color,width)}
 // Base map already draws yellow lane stripes. Only add bridge guardrails.
 function paintedRoads(){
  for(const r of ROADS.filter(r=>r.kind==='bridge')){
   if(!visible(r.x+r.w/2,r.y+r.h/2,2100))continue;
   for(let u=35;u<r.w;u+=95){
    const x=r.x+u;
    for(const yy of [r.y+7,r.y+r.h-7]){
     const a=iso(x,yy,12),b=iso(x,yy,32);
     stroke(a.x,a.y,b.x,b.y,'#b8cbd7',3);
    }
   }
  }
 }
 function waterDetails(t){
  for(const w of WATER){
   if(!visible(w.x+w.w/2,w.y+w.h/2,2300))continue;
   for(let i=0;i<45;i++){
    const x=w.x+30+rng(i*7+w.w)*Math.max(1,w.w-60),y=w.y+20+rng(i*13+w.h)*Math.max(1,w.h-40);
    if(!visible(x,y,1250)||roadSurface(x,y))continue;
    const a=iso(x,y,8),shift=Math.sin(t/1250+i)*5;
    stroke(a.x-11,a.y+shift,a.x+12,a.y+shift-2,i%4?'#56a8c055':'#a5eddb88',1.4);
   }
  }
 }
 function crosswalks(){
  const horizontals=ROADS.filter(r=>r.w>r.h&&r.kind!=='access');
  const verticals=ROADS.filter(r=>r.h>r.w&&r.kind!=='access');
  for(const h of horizontals)for(const v of verticals){
   const cx=v.x+v.w/2,cy=h.y+h.h/2;
   if(cx<h.x||cx>h.x+h.w||cy<v.y||cy>v.y+v.h||!visible(cx,cy))continue;
   for(const side of [-1,1]){
    const crossingX=cx+side*(v.w/2+16);
    if(crossingX-8<h.x||crossingX+8>h.x+h.w)continue;
    for(let k=-3;k<=3;k++){
     const yy=cy+k*12;
     if(yy-4<h.y||yy+4>h.y+h.h)continue;
     diamond(crossingX,yy,20,7,11,'#e5eef0b8');
    }
   }
  }
 }
 function planter(x,y,n){
  const p=iso(x,y,7);ctx.fillStyle='#142d35';ctx.beginPath();ctx.ellipse(p.x,p.y,21,9,0,0,7);ctx.fill();
  const top=iso(x,y,35);stroke(p.x,p.y,top.x,top.y,'#9c8566',3);
  for(let k=0;k<6;k++){let a=k*Math.PI/3+rng(n)*.7;stroke(top.x,top.y,top.x+Math.cos(a)*(13+rng(k+n)*8),top.y+Math.sin(a)*9-5,k%2?'#6ccaa1':'#2c9c88',3)}
 }
 function billboard(x,y,label,accent){
  const p=iso(x,y,82);ctx.save();ctx.fillStyle='#09182c';ctx.fillRect(p.x-61,p.y-22,122,35);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(p.x-61,p.y-22,122,35);
  ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#e9f7ff';ctx.shadowColor=accent;ctx.shadowBlur=12;ctx.fillText(label,p.x,p.y);ctx.restore();
  const base=iso(x,y,0);stroke(base.x,base.y,p.x,p.y+14,'#586579',4);
 }
 function benches(x,y){const p=iso(x,y,6);ctx.fillStyle='#a87661';ctx.fillRect(p.x-20,p.y-6,40,7);ctx.fillStyle='#654e51';ctx.fillRect(p.x-17,p.y-12,34,5);stroke(p.x-14,p.y,p.x-14,p.y+7,'#33495c',2);stroke(p.x+14,p.y,p.x+14,p.y+7,'#33495c',2)}
 function districtProps(t){
  // Carefully located landmarks; not random grid scatter.
  const plazas=[{x:3290,y:470,label:'STARTUP VALLEY',c:'#72e6cc'},{x:4080,y:1730,label:'IPO DISTRICT',c:'#ff8cbe'}];
  for(const z of plazas){if(!visible(z.x,z.y,1500))continue;
   for(let i=0;i<6;i++){let a=i*Math.PI/3;let x=z.x+Math.cos(a)*145,y=z.y+Math.sin(a)*110;if(!roadSurface(x,y)&&!restrictedSite(x,y))planter(x,y,i+z.x)}
   if(!roadSurface(z.x,z.y)&&!restrictedSite(z.x,z.y)){glow(z.x,z.y,90,z.c,.10);billboard(z.x,z.y,z.label,z.c)}
  }
  const industrial=[{x:1700,y:2800},{x:2110,y:2890},{x:3860,y:2940},{x:4270,y:2950}];
  for(const z of industrial){if(!visible(z.x,z.y,1250)||roadSurface(z.x,z.y)||restrictedSite(z.x,z.y)||propertyDefs.some(p=>Math.hypot(p.x-z.x,p.y-z.y)<270))continue;
   for(let i=0;i<3;i++){const x=z.x+i*42;prism(x,z.y,35,29,20,i%2?'#5b7880':'#906e61');const p=iso(x,z.y,25);ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillStyle='#d5e9d6';ctx.fillText('GPU',p.x,p.y)}
  }
  for(let i=0;i<12;i++){const x=190+i*67,y=1500+(i%2)*85;if(visible(x,y)&&!roadSurface(x,y)&&!restrictedSite(x,y))i%3?planter(x,y,i):benches(x,y)}
  if(visible(1870,650,1400)){billboard(1670,635,'COMPUTE DOCKS','#a2f575');billboard(2060,620,'CUDA LICENSED','#a2f575')}
  if(visible(4140,2170,1300))billboard(4270,1940,'THE MARKET NEVER SLEEPS','#ff78b7');
 }
 function rooftop(s,i){
  if(!visible(s.x,s.y,1600))return;
  const heights=[140,138,206,158,128,250,180,230],z=heights[i],c=s.color;
  const p=iso(s.x,s.y,z+18);
  if(i===0){ // Anthropic: terraced safety garden
   for(let k=-2;k<=2;k++){let q=iso(s.x+k*34,s.y+27,z+20);ctx.fillStyle='#69a99a';ctx.beginPath();ctx.ellipse(q.x,q.y,10,5,0,0,7);ctx.fill()}
   ctx.fillStyle='#f6e0c6';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText('SAFETY REVIEW IN PROGRESS',p.x,p.y-34);
  }else if(i===2){ // OpenAI: roof club canopy
   prism(s.x,s.y-28,85,45,12,'#3a6f75');
   for(let k=-2;k<=2;k++){const q=iso(s.x+k*19,s.y-43,z+38);ctx.fillStyle=k%2?'#ff75bc':'#73f2dd';ctx.fillRect(q.x-3,q.y-3,6,6)}
  }else if(i===3){ // xAI: stylized rocket silhouette
   const a=iso(s.x+42,s.y-22,z+18),b=iso(s.x+42,s.y-22,z+102);stroke(a.x,a.y,b.x,b.y,'#b9c6eb',10);ctx.fillStyle='#ff8a75';ctx.beginPath();ctx.moveTo(b.x-8,b.y+9);ctx.lineTo(b.x,b.y-14);ctx.lineTo(b.x+8,b.y+9);ctx.closePath();ctx.fill();
  }else if(i===4){ // DeepSeek casino marquee
   ctx.save();ctx.translate(p.x,p.y-23);ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.shadowColor='#4dbde9';ctx.shadowBlur=18;ctx.fillStyle='#b6f2ff';ctx.fillText('R1 • JACKPOT',0,0);ctx.restore();
  }else if(i===5){ // Gemini radio dishes
   for(let k=-1;k<=1;k++){const q=iso(s.x+k*35,s.y,z+24);ctx.strokeStyle='#f3db9b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,11,Math.PI,2*Math.PI);ctx.stroke();stroke(q.x,q.y,q.x+9,q.y-13,'#f3db9b',2)}
  }else if(i===6){ // Meta holographic glasses
   ctx.save();ctx.translate(p.x,p.y-32);ctx.strokeStyle='#83c9ff';ctx.lineWidth=4;ctx.shadowColor='#5ab7ff';ctx.shadowBlur=15;ctx.strokeRect(-27,-8,21,15);ctx.strokeRect(6,-8,21,15);stroke(-6,-2,6,-2,'#83c9ff',3);ctx.restore();
  }else if(i===7){ // IPO antenna
   for(let k=0;k<5;k++){const q=iso(s.x+(k-2)*22,s.y+15,z+26+k*9);ctx.fillStyle=k%2?'#ff5ca7':'#f4cb77';ctx.fillRect(q.x-7,q.y-8,14,8)}
  }
 }
 window.drawWorldCrosswalks=crosswalks;
 ground=function(){priorGround();paintedRoads();waterDetails(performance.now())};
 streetDetails=function(t){priorDetails(t);districtProps(t)};
 tower=function(s,i){priorTower(s,i);rooftop(s,i)};
})();
