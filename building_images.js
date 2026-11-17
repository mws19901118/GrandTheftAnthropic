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
