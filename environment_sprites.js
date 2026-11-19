// Reusable SVG environment sprites. Rendering-only; no mission or collision changes.
(() => {
 'use strict';
 const sprites={};
 for(const [id,file] of Object.entries({shop:'neon_shop',office:'neon_office',palm:'neon_palm',lamp:'neon_lamp',billboard:'neon_billboard',kiosk:'neon_kiosk'})){
  const im=new Image();im.src='assets/environment/'+file+'.svg';sprites[id]=im;
 }
 const oldDetails=streetDetails;
 const props=[];
 function intersectsRect(x,y,halfX,halfY,r,pad=0){
  return x+halfX>r.x-pad&&x-halfX<r.x+r.w+pad&&y+halfY>r.y-pad&&y-halfY<r.y+r.h+pad;
 }
 function clearLot(x,y,type){
  const half=type==='palm'?24:type==='lamp'?18:type==='billboard'?48:type==='kiosk'?54:90;
  const margin=type==='palm'||type==='lamp'?10:24;
  if(x-half<0||y-half<0||x+half>WORLD.w||y+half>WORLD.h)return false;
  if(ROADS.some(r=>intersectsRect(x,y,half,half,r,margin)))return false;
  if(WATER.some(r=>intersectsRect(x,y,half,half,r,margin)))return false;
  // Reserve the shoreline and the full footprint of all street sprites.
  for(const dx of [-half-margin,0,half+margin])for(const dy of [-half-margin,0,half+margin])if(nearWaterfront(x+dx,y+dy,35))return false;
 if(onCurvedRoad(x,y,half*1.45+margin))return false;
  if(elevatedRoadAt(x,y)>20)return false;
  if(sites.some(q=>Math.abs(q.x-x)<half+195&&Math.abs(q.y-y)<half+195))return false;
  if(propertyDefs.some(q=>Math.abs(q.x-x)<half+160&&Math.abs(q.y-y)<half+155))return false;
  return true;
 }

 // Deterministic, stable city dressing. Keep road corridors and mission entrances open.
 const districts=[
  [300,520,6,3],[1110,650,4,2],[2240,1270,5,2],
  [3260,1250,5,2],[500,2630,5,2],[3410,2700,5,2],
  [1210,1900,4,2],[2660,2550,4,2]
 ];
 for(let g=0;g<districts.length;g++){
  const [x,y,cols,rows]=districts[g];
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
   const px=x+i*137+(j%2)*31,py=y+j*155;
   if(!clearLot(px,py,(i+j+g)%3===0?'office':'shop'))continue;
   if(sites.some(s=>Math.hypot(s.x-px,s.y-py)<255))continue;
   if(propertyDefs.some(s=>Math.hypot(s.x-px,s.y-py)<180))continue;
   props.push({x:px,y:py,type:(i+j+g)%3===0?'office':'shop'});
  }
 }
 for(let i=0;i<68;i++){
  const x=95+(i*397)%4560,y=105+(i*293)%3160;
  if(!clearLot(x,y,'palm'))continue;
  if(sites.some(s=>Math.hypot(s.x-x,s.y-y)<220))continue;
  props.push({x,y,type:'palm'});
 }
 // Fill empty blocks with small storefronts/offices, without increasing NPC simulation.
 // All lots are checked against full road footprints and existing landmarks.
 for(let y=320;y<WORLD.h-180;y+=210){
  for(let x=210;x<WORLD.w-180;x+=230){
   const px=x+((Math.floor(y/210)%2)*35),py=y;
   const type=(Math.floor(x/230)+Math.floor(y/210))%3===0?'office':'shop';
   if(!clearLot(px,py,type))continue;
   if(props.some(p=>Math.abs(p.x-px)<175&&Math.abs(p.y-py)<145))continue;
   props.push({x:px,y:py,type});
  }
 }
 // Street furniture sits on clear lots beside the road, never in a traffic lane.
 for(let i=0;i<56;i++){
  const x=115+(i*307)%4490,y=120+(i*419)%3090;
  const type=i%7===0?'billboard':i%3===0?'kiosk':'lamp';
  if(!clearLot(x,y,type))continue;
  if(props.some(p=>Math.abs(p.x-x)<95&&Math.abs(p.y-y)<95))continue;
  props.push({x,y,type});
 }
 props.sort((a,b)=>a.x+a.y-b.x-b.y);
 // Expose read-only placement data so later decorative layers cannot cover shops.
 window.existingStreetProps=props.map(p=>({x:p.x,y:p.y,type:p.type}));
 function visible(x,y){const p=driving?car:player;return Math.abs(p.x-x)<1050&&Math.abs(p.y-y)<1050}
 function renderProp(p){
  const im=sprites[p.type];if(!im.complete||!im.naturalWidth||!visible(p.x,p.y))return;
  const anchor=iso(p.x,p.y,0),width=({palm:72,office:145,shop:132,lamp:54,billboard:124,kiosk:96})[p.type]||100;
  const height=width*im.naturalHeight/im.naturalWidth;
  ctx.save();
  ctx.drawImage(im,anchor.x-width/2,anchor.y-height+12,width,height);
  ctx.restore();
 }
 streetDetails=function(t){oldDetails(t);for(const p of props)renderProp(p)};
})();
