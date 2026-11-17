// Unified street/road/vehicle/character art. All geometry is decorative.
(() => {
 'use strict';
 const names={road:'road_surface',player:'car_player',police:'car_police',rival:'car_rival',dario:'dario'};
 const images={};
 for(const [key,name] of Object.entries(names)){
  const img=new Image();img.src='assets/environment/'+name+'.svg';images[key]=img;
 }
 const ready=im=>im&&im.complete&&im.naturalWidth>0;
 const oldGround=ground,oldCar=spriteCar,oldPerson=spritePerson;
 const drawQuad=(x,y,w,h,z,color)=>quad([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],color);
 // Precompute static lane segments once, not every animation frame.
 const roads=ROADS.map(r=>{
  const horizontal=r.w>r.h,total=horizontal?r.w:r.h;
  const stripes=[];
  for(let u=30;u<total-25;u+=116){
   const length=Math.min(52,total-u-10);
   if(length<=0)continue;
   const x=horizontal?r.x+u:r.x+r.w/2,y=horizontal?r.y+r.h/2:r.y+u;
   const segment={x:horizontal?x-length/2:x-2,y:horizontal?y-2:y-length/2,w:horizontal?length:4,h:horizontal?4:length};
   if(ROADS.some(other=>other!==r&&segment.x<other.x+other.w&&segment.x+segment.w>other.x&&segment.y<other.y+other.h&&segment.y+segment.h>other.y))continue;
   stripes.push(segment);
  }
  return {r,stripes};
 });
 // Canvas SVG patterns are expensive to rasterize repeatedly; use a cached,
 // flat asphalt base with sparse texture flecks instead.
 ground=function(){
  oldGround();
  const focus=driving?car:player;
  for(const {r,stripes} of roads){
   const cx=r.x+r.w/2,cy=r.y+r.h/2;
   if(Math.abs(cx-focus.x)>r.w/2+1000||Math.abs(cy-focus.y)>r.h/2+1000)continue;
   const horizontal=r.w>r.h;
   drawQuad(r.x,r.y,r.w,r.h,6,r.kind==='bridge'?'#536174':r.kind==='highway'?'#364454':'#344353');
   if(horizontal){
    drawQuad(r.x,r.y,r.w,3,8,'#718198');
    drawQuad(r.x,r.y+r.h-3,r.w,3,8,'#718198');
   }else{
    drawQuad(r.x,r.y,3,r.h,8,'#718198');
    drawQuad(r.x+r.w-3,r.y,3,r.h,8,'#718198');
   }
   for(const line of stripes){
    if(Math.abs(line.x-focus.x)>1050||Math.abs(line.y-focus.y)>1050)continue;
    drawQuad(line.x,line.y,line.w,line.h,11,'#e8c775');
   }
  }
  if(window.drawWorldCrosswalks)window.drawWorldCrosswalks();
 };
 spriteCar=function(px,py,a,color){
  const kind=color==='#5b9dff'?'police':color==='#ff794a'?'rival':'player';
  const im=images[kind];if(!ready(im)){oldCar(px,py,a,color);return}
  const p=iso(px,py,8);
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a/2);
  const width=kind==='rival'?83:76,height=width*im.naturalHeight/im.naturalWidth;
  ctx.drawImage(im,-width/2,-height*.73,width,height);ctx.restore();
 };
 spritePerson=function(px,py){
  const im=images.dario;if(!ready(im)){oldPerson(px,py);return}
  const p=iso(px,py,5),w=42,h=w*im.naturalHeight/im.naturalWidth;
  ctx.save();ctx.drawImage(im,p.x-w/2,p.y-h+9,w,h);
  ctx.textAlign='center';ctx.font='bold 11px system-ui';ctx.fillStyle='#f8d9ba';ctx.fillText('DARIO',p.x,p.y-h+1);ctx.restore();
 };
})();
