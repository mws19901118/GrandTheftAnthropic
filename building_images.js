// Game-ready building sprites. Keeps procedural geometry as a loading/error fallback.
(() => {
 const main=['anthropic_hq','nvidia_depot','openai_club','xai_colossus','deepseek_casino','gemini_tower','meta_mall','ipo_exchange'];
 const assets=['blackwell_warehouse','research_lab','cloud_data_center'];
 const images={};
 for(const name of [...main,...assets]){
  const im=new Image();im.src='assets/buildings/'+name+'.png';images[name]=im;
 }
 const oldTower=tower,oldWarehouse=warehouseDetail;
 function sprite(name,x,y,w,h){
  const im=images[name];if(!im||!im.complete||!im.naturalWidth)return false;
  const p=iso(x,y,0);
  const naturalHeight=w*im.naturalHeight/im.naturalWidth;
  ctx.drawImage(im,p.x-w/2,p.y-naturalHeight+40,w,naturalHeight);
  return true;
 }
 tower=function(s,i){
  const p=driving?car:player;
  if(i===1){oldTower(s,i);return;} // Restore original NVIDIA illustration/animated depot.
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>2900)return;
  if(!sprite(main[i],s.x,s.y,365,315))oldTower(s,i);
 };
 // warehouse_art.js owns the original NVIDIA depot and its overlays.
 window.drawPropertySprite=function(d){
  const p=driving?car:player;
  if(Math.abs(p.x-d.x)+Math.abs(p.y-d.y)>2450)return false;
  const name=assets[['warehouse','lab','cloud'].indexOf(d.id)];
  if(!name||!sprite(name,d.x,d.y,265,220))return false;
  const o=ownedProperties[d.id];
  const q=iso(d.x,d.y,165);
  ctx.save();
  ctx.textAlign='center';ctx.font='900 12px system-ui';
  ctx.fillStyle=o?'#e9fff0':'#ffe3a0';
  ctx.shadowColor=d.color;ctx.shadowBlur=12;
  ctx.fillText(d.name,q.x,q.y);
  const b=iso(d.x,d.y+102,9);
  ctx.fillText(o?'LVL '+o.level:'$'+d.price,b.x,b.y);
  if(o&&o.level===2){ctx.strokeStyle=d.color;ctx.lineWidth=3;ctx.strokeRect(q.x-50,q.y-17,100,24)}
  ctx.restore();return true;
 };
})();
