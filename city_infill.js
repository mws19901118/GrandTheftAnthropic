// Style-matched city infill. Original neon shops and street props have priority.
(() => {
 'use strict';
 const existing=window.existingStreetProps||[];
 const art={};
 for(const name of ['office6','office10','apartment6','apartment9','factory']){
  const im=new Image();im.src='assets/environment/neon_'+name+'.svg';art[name]=im;
 }
 const blocks=[];
 const hash=(x,y)=>{const v=Math.sin(x*12.9898+y*78.233)*43758.5453;return v-Math.floor(v)};
 const overlap=(x,y,hw,hh,r,pad)=>x+hw>r.x-pad&&x-hw<r.x+r.w+pad&&y+hh>r.y-pad&&y-hh<r.y+r.h+pad;
 function clear(x,y,w,h){
  const hw=w/2,hh=h/2;
  if(x-hw<35||y-hh<35||x+hw>WORLD.w-35||y+hh>WORLD.h-35)return false;
  if(ROADS.some(r=>overlap(x,y,hw,hh,r,38)))return false;
  if(WATER.some(r=>overlap(x,y,hw,hh,r,32)))return false;
  for(const dx of [-hw-45,0,hw+45])for(const dy of [-hh-45,0,hh+45])if(nearWaterfront(x+dx,y+dy,40))return false;
  for(const xx of [x-hw-25,x,x+hw+25])for(const yy of [y-hh-25,y,y+hh+25])
   if(onCurvedRoad(xx,yy,55))return false;
  if(sites.some(s=>Math.abs(s.x-x)<hw+250&&Math.abs(s.y-y)<hh+240))return false;
  if(propertyDefs.some(p=>Math.abs(p.x-x)<hw+205&&Math.abs(p.y-y)<hh+190))return false;
  // Reserve the entire visible footprint of pre-existing shops, offices,
  // palms, kiosks and signs. Isometric screen projection can overlap even
  // when world-space bounding boxes do not.
  if(existing.some(p=>Math.abs(p.x-x)<hw+(p.type==='office'||p.type==='shop'?185:115)&&Math.abs(p.y-y)<hh+(p.type==='office'||p.type==='shop'?185:115)))return false;
  // Match the exact industrial crates rendered in game.js ground().
  // Each crate is 75x45 world units and rises 27 units above its base.
  for(const d of DISTRICTS.filter(d=>d.type==='industrial')){
   for(let i=0;i<14;i++){
    const cx=d.x+65+(i*157)%(d.w-120),cy=d.y+55+(i*101)%(d.h-100);
    if(roadSurface(cx,cy)||restrictedSite(cx,cy))continue;
    if(Math.abs(cx-x)<hw+95&&Math.abs(cy-y)<hh+100)return false;
   }
  }
  if(blocks.some(b=>Math.abs(b.x-x)<(b.w+w)/2+28&&Math.abs(b.y-y)<(b.h+h)/2+28))return false;
  return true;
 }
 // Fill the northeast corner lots more densely while keeping road setbacks.
 // This uses the same SVG offices/apartments as the rest of the city.
 for(let y=120;y<=990;y+=118)for(let x=3850;x<=4630;x+=122){
  const r=hash(x+19,y+43),v=hash(y+11,x+37);
  const w=84+Math.floor(r*18),h=82+Math.floor(v*18);
  const px=x+(r-.5)*18,py=y+(v-.5)*18;
  if(!clear(px,py,w,h))continue;
  const type=hash(x+29,y+73)>.48?'office':'apartment';
  const floors=type==='office'?(r>.52?10:6):(v>.52?9:6);
  blocks.push({x:px,y:py,w,h,type,floors});
 }
 for(let y=220;y<WORLD.h-110;y+=134)for(let x=190;x<WORLD.w-110;x+=144){
  const r=hash(x,y),v=hash(y,x),w=92+Math.floor(r*24),h=88+Math.floor(v*26);
  const px=x+(r-.5)*25,py=y+(v-.5)*25;
  if(!clear(px,py,w,h))continue;
  const district=DISTRICTS.find(d=>px>=d.x&&px<=d.x+d.w&&py>=d.y&&py<=d.y+d.h);
  const industrial=district&&district.type==='industrial';
  const commercial=district&&district.type==='plaza';
  const type=industrial?'factory':commercial?'office':hash(x+45,y+61)>.54?'office':'apartment';
  const floors=type==='factory'?0:type==='office'?(hash(x+72,y+23)>.48?10:6):(hash(x+72,y+23)>.55?9:6);
  blocks.push({x:px,y:py,w,h,type,floors});
 }
 blocks.sort((a,b)=>a.x+a.y-b.x-b.y);
 const previous=streetDetails;
 function render(b){
  const im=art[b.type==='factory'?'factory':b.type+b.floors];if(!im.complete||!im.naturalWidth)return;
  // Constant footprint, variable actual floor count and facade height.
  const at=iso(b.x,b.y,0),w=b.type==='factory'?154:b.type==='office'?148:142,h=w*im.naturalHeight/im.naturalWidth;
  ctx.save();
  ctx.drawImage(im,at.x-w/2,at.y-h+12,w,h);
  ctx.restore();
 }
 streetDetails=function(t){
  previous(t);
  const p=driving?car:player;
  for(const b of blocks)if(Math.abs(b.x-p.x)<1050&&Math.abs(b.y-p.y)<1050)render(b);
 };
 window.cityInfillCount=blocks.length;
})();
