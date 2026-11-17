// Image-backed landmarks: unified isometric registration, foreground occlusion and light detail.
// NVIDIA keeps its independent original warehouse artwork and animation.
(() => {
 'use strict';
 const main=['anthropic_hq','nvidia_depot','openai_club','xai_colossus','deepseek_casino','gemini_tower','meta_mall','ipo_exchange'];
 const assets=['blackwell_warehouse','research_lab','cloud_data_center'];
 const images={};
 for(const name of [...main,...assets]){
  const im=new Image();im.src='assets/buildings/'+name+'.png';images[name]=im;
 }
 const oldTower=tower;
 const settings=[
  {w:405,dy:68,accent:'#f5ba98',title:'SAFETY REVIEW'},
  null,
  {w:405,dy:68,accent:'#75f7d9',title:'MEMBERS ONLY'},
  {w:405,dy:68,accent:'#aaa7ff',title:'COMPUTE ONLINE'},
  {w:380,dy:68,accent:'#70d9ff',title:'R1 JACKPOT'},
  {w:395,dy:68,accent:'#f5d375',title:'APPROVED'},
  {w:390,dy:68,accent:'#86b9ff',title:'OPEN WEIGHTS'},
  {w:390,dy:68,accent:'#ff8ac2',title:'MARKET OPEN'}
 ];
 function imageBounds(name,x,y,w,dy){
  const im=images[name];
  if(!im||!im.complete||!im.naturalWidth)return null;
  const p=iso(x,y,0),h=w*im.naturalHeight/im.naturalWidth;
  return {im,x:p.x-w/2,y:p.y-h+dy,w,h};
 }
 function drawImageAt(b){ctx.drawImage(b.im,b.x,b.y,b.w,b.h)}
 function lamp(x,y,color,t){
  const foot=iso(x,y,5),top=iso(x,y,58);
  ctx.strokeStyle='#596f7b';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y);ctx.stroke();
  ctx.fillStyle=color;ctx.globalAlpha=.65+.25*Math.sin(t/460+x);
  ctx.shadowColor=color;ctx.shadowBlur=9;
  ctx.beginPath();ctx.arc(top.x,top.y,3,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.globalAlpha=1;
 }
 function details(s,i,t){
  const cfg=settings[i];
  // All foreground items use the same isometric world transform as the building.
  // Keep them close to the building and off the vehicle access corridor.
  ctx.save();
  const near=iso(s.x,s.y+105,7);
  ctx.fillStyle='#071d2a66';ctx.beginPath();ctx.ellipse(near.x,near.y,100,24,0,0,7);ctx.fill();
  for(const side of [-1,1]){
   const x=s.x+side*125,y=s.y+82;
   lamp(x,y,cfg.accent,t);
  }
  // Architectural light strips are drawn on the facade, not in midair.
  const face=iso(s.x,s.y+48,70);
  ctx.fillStyle='#071722dd';ctx.fillRect(face.x-49,face.y-9,98,17);
  ctx.strokeStyle=cfg.accent;ctx.lineWidth=1.3;ctx.strokeRect(face.x-49,face.y-9,98,17);
  ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillStyle=cfg.accent;
  ctx.fillText(cfg.title,face.x,face.y+3);
  // Low foreground barriers create consistent depth with the NVIDIA depot.
  for(const side of [-1,1]){
   const a=iso(s.x+side*108,s.y+114,10),b=iso(s.x+side*108,s.y+135,10);
   ctx.strokeStyle='#526b7a';ctx.lineWidth=4;
   ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
   ctx.fillStyle=cfg.accent;ctx.fillRect(a.x-3,a.y-3,6,3);
  }
  ctx.restore();
 }

 // Small, image-registered animated vignettes: drawn within each building's
 // illustration bounds so props cannot drift into roads or hover in world space.
 function vignette(s,i,b,t){
  const point=(u,v)=>({x:b.x+b.w*u,y:b.y+b.h*v});
  const pulse=.5+.5*Math.sin(t/520+i);
  const stroke=(a,c,color,w=2)=>{ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(c.x,c.y);ctx.stroke()};
  const rect=(u,v,w,h,color)=>{const p=point(u,v);ctx.fillStyle=color;ctx.fillRect(p.x,p.y,b.w*w,b.h*h)};
  const dot=(u,v,r,color)=>{const p=point(u,v);ctx.fillStyle=color;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill()};
  ctx.save();
  if(i===0){ // Anthropic: tiny security rover on the paved forecourt.
   const phase=(t/8500)%1,u=.58+.16*(phase<.5?phase*2:2-phase*2),p=point(u,.88);
   ctx.fillStyle='#1a3439';ctx.fillRect(p.x-12,p.y-8,24,12);
   ctx.fillStyle='#e9b38f';ctx.fillRect(p.x-8,p.y-13,16,7);
   for(const dx of [-8,8])dot(u+dx/b.w,.895,3,'#0a1824');
   dot(u,.86,2.3,pulse>.45?'#83ffdb':'#527f79');
  }else if(i===2){ // OpenAI: pulsing holographic turntable in a club window.
   const p=point(.69,.64);
   ctx.strokeStyle='#72fbe0';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(p.x,p.y,19,6,0,0,7);ctx.stroke();
   ctx.globalAlpha=.3+.6*pulse;dot(.69,.60,7,'#72fbe0');
   stroke(point(.69,.61),point(.69,.51),'#b1fff2',1.5);
  }else if(i===3){ // xAI: data-rack diagnostics and cooling fans.
   for(let j=0;j<3;j++){
    const u=.56+j*.075;
    rect(u,.70,.055,.12,'#142237cc');
    for(let k=0;k<4;k++)dot(u+.014,.72+k*.025,1.5,(Math.floor(t/380+j+k)%3)?'#a7aaff':'#f5ae7d');
   }
   const fan=point(.79,.73),a=t/800;
   for(let k=0;k<3;k++){const ang=a+k*2.094;stroke(fan,{x:fan.x+Math.cos(ang)*8,y:fan.y+Math.sin(ang)*8},'#b3c6df',2)}
  }else if(i===4){ // DeepSeek: animated slot-machine reels.
   for(let j=0;j<3;j++){
    const u=.56+j*.065;
    rect(u,.69,.053,.085,'#0b2742dd');
    const p=point(u+.026,.737);
    ctx.fillStyle=j===Math.floor(t/900)%3?'#ffcc77':'#70eaff';
    ctx.font='bold 11px monospace';ctx.textAlign='center';
    ctx.fillText(['7','R1','
  const p=driving?car:player;
  if(i===1){oldTower(s,i);return;}
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>2900)return;
  const cfg=settings[i],b=imageBounds(main[i],s.x,s.y,cfg.w,cfg.dy);
  if(!b){oldTower(s,i);return;}
  ctx.save();
  // Ground contact shadow behind sprite, then opaque architecture, then facade accents.
  const q=iso(s.x,s.y,3);
  ctx.fillStyle='#07152077';ctx.beginPath();ctx.ellipse(q.x,q.y+10,cfg.w*.39,36,0,0,7);ctx.fill();
  drawImageAt(b);
  details(s,i,performance.now());
  vignette(s,i,b,performance.now());
  ctx.restore();
 };
 window.drawPropertySprite=function(d){
  const p=driving?car:player;
  if(Math.abs(p.x-d.x)+Math.abs(p.y-d.y)>2450)return false;
  const name=assets[['warehouse','lab','cloud'].indexOf(d.id)];
  if(!name)return false;
  const b=imageBounds(name,d.x,d.y,315,65);
  if(!b)return false;
  ctx.save();
  const q=iso(d.x,d.y,3);
  ctx.fillStyle='#07152088';ctx.beginPath();ctx.ellipse(q.x,q.y+8,112,25,0,0,7);ctx.fill();
  drawImageAt(b);
  const owned=ownedProperties[d.id],label=iso(d.x,d.y+95,9);
  ctx.font='900 12px system-ui';ctx.textAlign='center';
  ctx.fillStyle=owned?'#e9fff0':'#ffe3a0';
  ctx.fillText(owned?'LVL '+owned.level:'$'+d.price,label.x,label.y);
  ctx.restore();
  return true;
 };
})();
][(Math.floor(t/1100)+j)%3],p.x,p.y);
   }
  }else if(i===5){ // Gemini: small rotating approval scanner.
   const p=point(.69,.78);
   ctx.strokeStyle='#f9d97b';ctx.lineWidth=2;
   ctx.beginPath();ctx.arc(p.x,p.y,12,0,7);ctx.stroke();
   const a=t/1000;
   stroke(p,{x:p.x+Math.cos(a)*11,y:p.y+Math.sin(a)*11},'#79d6ff',2);
   rect(.63,.85,.12,.013,pulse>.5?'#8ff7a8':'#edb977');
  }else if(i===6){ // Meta: smart-glasses display scanning the storefront.
   const p=point(.69,.72);
   ctx.strokeStyle='#90d7ff';ctx.lineWidth=2;
   for(const dx of [-10,10])ctx.strokeRect(p.x+dx-8,p.y-5,16,10);
   stroke({x:p.x-2,y:p.y},{x:p.x+2,y:p.y},'#90d7ff',2);
   const scan=(t/1700)%1;
   stroke(point(.58,.81-scan*.09),point(.79,.81-scan*.09),'#83eaff',1);
  }else if(i===7){ // IPO Exchange: ringing trading bell and ticker.
   const p=point(.70,.63),a=Math.sin(t/350)*.12;
   ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
   ctx.strokeStyle='#ffd77d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,12,Math.PI,0);ctx.stroke();
   ctx.fillStyle='#ffd77d';ctx.fillRect(-13,0,26,3);ctx.fillRect(-2,3,4,4);ctx.restore();
   const ticker=['IPO ↑','AI +7%','GPU ↑'][Math.floor(t/1700)%3];
   const q=point(.68,.78);ctx.fillStyle='#ffacd4';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(ticker,q.x,q.y);
  }
  ctx.restore();
 }
 tower=function(s,i){
  const p=driving?car:player;
  if(i===1){oldTower(s,i);return;}
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>2900)return;
  const cfg=settings[i],b=imageBounds(main[i],s.x,s.y,cfg.w,cfg.dy);
  if(!b){oldTower(s,i);return;}
  ctx.save();
  // Ground contact shadow behind sprite, then opaque architecture, then facade accents.
  const q=iso(s.x,s.y,3);
  ctx.fillStyle='#07152077';ctx.beginPath();ctx.ellipse(q.x,q.y+10,cfg.w*.39,36,0,0,7);ctx.fill();
  drawImageAt(b);
  details(s,i,performance.now());
  ctx.restore();
 };
 window.drawPropertySprite=function(d){
  const p=driving?car:player;
  if(Math.abs(p.x-d.x)+Math.abs(p.y-d.y)>2450)return false;
  const name=assets[['warehouse','lab','cloud'].indexOf(d.id)];
  if(!name)return false;
  const b=imageBounds(name,d.x,d.y,315,65);
  if(!b)return false;
  ctx.save();
  const q=iso(d.x,d.y,3);
  ctx.fillStyle='#07152088';ctx.beginPath();ctx.ellipse(q.x,q.y+8,112,25,0,0,7);ctx.fill();
  drawImageAt(b);
  const owned=ownedProperties[d.id],label=iso(d.x,d.y+95,9);
  ctx.font='900 12px system-ui';ctx.textAlign='center';
  ctx.fillStyle=owned?'#e9fff0':'#ffe3a0';
  ctx.fillText(owned?'LVL '+owned.level:'$'+d.price,label.x,label.y);
  ctx.restore();
  return true;
 };
})();
