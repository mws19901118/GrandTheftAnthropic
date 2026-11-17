// Image-backed landmarks and purchasable properties. NVIDIA retains its original animated depot art.
(() => {
 'use strict';
 const main=['anthropic_hq','nvidia_depot','openai_club','xai_colossus','deepseek_casino','gemini_tower','meta_mall','ipo_exchange'];
 const assets=['blackwell_warehouse','research_lab','cloud_data_center'];
 const images={};
 for(const name of [...main,...assets]){
  const im=new Image();
  im.src='assets/buildings/'+name+'.png';
  images[name]=im;
 }
 const oldTower=tower;
 function sprite(name,x,y,w){
  const im=images[name];
  if(!im||!im.complete||!im.naturalWidth)return false;
  const p=iso(x,y,0),h=w*im.naturalHeight/im.naturalWidth;
  ctx.drawImage(im,p.x-w/2,p.y-h+40,w,h);
  return true;
 }
 tower=function(s,i){
  const p=driving?car:player;
  if(i===1){oldTower(s,i);return;} // Original NVIDIA art and animation
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>2900)return;
  const width=[3,4,5,6,7].includes(i)?290:365;
  if(!sprite(main[i],s.x,s.y,width))oldTower(s,i);
 };
 window.drawPropertySprite=function(d){
  const p=driving?car:player;
  if(Math.abs(p.x-d.x)+Math.abs(p.y-d.y)>2450)return false;
  const name=assets[['warehouse','lab','cloud'].indexOf(d.id)];
  if(!name||!sprite(name,d.x,d.y,265))return false;
  const owned=ownedProperties[d.id];
  const label=iso(d.x,d.y+102,9);
  ctx.save();
  ctx.textAlign='center';
  ctx.font='900 12px system-ui';
  ctx.fillStyle=owned?'#e9fff0':'#ffe3a0';
  ctx.shadowColor=d.color;
  ctx.shadowBlur=12;
  ctx.fillText(owned?'LVL '+owned.level:'$'+d.price,label.x,label.y);
  if(owned&&owned.level===2){
   const badge=iso(d.x,d.y,165);
   ctx.strokeStyle=d.color;ctx.lineWidth=3;
   ctx.strokeRect(badge.x-50,badge.y-17,100,24);
  }
  ctx.restore();
  return true;
 };
})();
