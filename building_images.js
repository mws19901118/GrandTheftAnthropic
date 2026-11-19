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
 // Width and ground offset are tuned for the newly uploaded, wider isometric assets.
 // Keep all foreground bases away from road lanes and site access routes.
 const settings=[
  {w:312,dy:39,accent:'#f5ba98'},
  null, // NVIDIA's original warehouse and animation are untouched.
  {w:315,dy:39,accent:'#75f7d9'},
  {w:360,dy:43,accent:'#aaa7ff'},
  {w:305,dy:37,accent:'#70d9ff'},
  {w:318,dy:39,accent:'#f5d375'},
  {w:312,dy:39,accent:'#86b9ff'},
  {w:315,dy:38,accent:'#ff8ac2'}
 ];
 // Road-aware cap: leave a buffer between every landmark's base and the
 // road surface. This controls image footprint without altering world geometry.
 function roadClearance(x,y){
  let closest=Infinity;
  for(const r of ROADS){
   const dx=Math.max(r.x-x,0,x-(r.x+r.w));
   const dy=Math.max(r.y-y,0,y-(r.y+r.h));
   closest=Math.min(closest,Math.hypot(dx,dy));
  }
  return closest;
 }
 function safeWidth(x,y,requested){
  // A three-quarter-view building base occupies roughly half its screen width
  // in projected ground radius; preserve a small street-side margin.
  const clearance=roadClearance(x,y);
  return Math.min(requested,Math.max(180,(clearance-16)*2.7));
 }
 function imageBounds(name,x,y,w,dy){
  const im=images[name];
  if(!im||!im.complete||!im.naturalWidth)return null;
  const p=iso(x,y,0),h=w*im.naturalHeight/im.naturalWidth;
  return {im,x:p.x-w/2,y:p.y-h+dy,w,h};
 }
 function drawImageAt(b){ctx.drawImage(b.im,b.x,b.y,b.w,b.h)}
 // An isometric footprint makes flat landmark sprites feel anchored to the city.
 // All geometry stays under the artwork and within its site footprint; no road furniture.
 function foundation(x,y,w,accent){
  const c=iso(x,y,0),rx=w*.34,ry=w*.115;
  ctx.save();
  ctx.fillStyle='#07131eb3';
  ctx.beginPath();ctx.ellipse(c.x,c.y+10,rx*1.17,ry*1.25,0,0,Math.PI*2);ctx.fill();
  ctx.beginPath();
  ctx.moveTo(c.x,c.y-ry);ctx.lineTo(c.x+rx,c.y);
  ctx.lineTo(c.x,c.y+ry);ctx.lineTo(c.x-rx,c.y);ctx.closePath();
  ctx.fillStyle='#1b2a37';ctx.fill();
  ctx.strokeStyle=accent;ctx.globalAlpha=.48;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(c.x-rx,c.y);ctx.lineTo(c.x,c.y+ry);
  ctx.lineTo(c.x+rx,c.y);ctx.strokeStyle='#07111c';ctx.lineWidth=3;ctx.stroke();
  ctx.restore();
 }
 // Do not draw freestanding decorations around landmarks: world-space
 // furniture can overlap roads and vehicle access lanes.

 tower=function(s,i){
  const p=driving?car:player;
  if(i===1){oldTower(s,i);return;}
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>2900)return;
  const cfg=settings[i],width=i===3?cfg.w:safeWidth(s.x,s.y,cfg.w),b=imageBounds(main[i],s.x,s.y,width,cfg.dy*width/cfg.w);
  if(!b){oldTower(s,i);return;}
  ctx.save();
  // Ground contact shadow behind sprite, then opaque architecture, then facade accents.
  foundation(s.x,s.y,width,cfg.accent);
  drawImageAt(b);
  ctx.restore();
 };
 window.drawPropertySprite=function(d){
  const p=driving?car:player;
  if(Math.abs(p.x-d.x)+Math.abs(p.y-d.y)>2450)return false;
  const name=assets[['warehouse','lab','cloud'].indexOf(d.id)];
  if(!name)return false;
  const width=d.id==='warehouse'?Math.min(210,safeWidth(d.x,d.y,275)):d.id==='lab'?Math.min(250,safeWidth(d.x,d.y,265)):safeWidth(d.x,d.y,275);
  const b=imageBounds(name,d.x,d.y,width,(d.id==='warehouse'?50:36)*width/275);
  if(!b)return false;
  ctx.save();
  foundation(d.x,d.y,d.id==='warehouse'?width*.72:width,'#83a9ba');
  drawImageAt(b);
  const owned=ownedProperties[d.id],label=iso(d.x,d.y+95,9);
  ctx.font='900 12px system-ui';ctx.textAlign='center';
  ctx.fillStyle=owned?'#e9fff0':'#ffe3a0';
  ctx.fillText(owned?'LVL '+owned.level:'$'+d.price,label.x,label.y);
  ctx.restore();
  return true;
 };
})();
