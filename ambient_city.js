// Lightweight ambient city life: eight pedestrians and five civilian cars.
// All state is ephemeral and cosmetic; no save, mission or collision changes.
(() => {
 'use strict';
 const people=[],traffic=[];
 const citizenImages=Array.from({length:6},(_,i)=>{const im=new Image();im.src='assets/environment/citizen_'+(i+1)+'.svg';return im});
 const carImages=Array.from({length:5},(_,i)=>{const im=new Image();im.src='assets/environment/civilian_car_'+(i+1)+'.svg';return im});
 const colors=['#f7a5cb','#6eddd4','#f5d184','#8c9cdd','#d6a0f2','#7ac49a','#f29b78','#b4cee4'];
 const horizontal=ROADS.filter(r=>r.w>r.h&&r.kind!=='access'&&r.w>700);
 const vertical=ROADS.filter(r=>r.h>r.w&&r.kind!=='access'&&r.h>700);
 // Only straight road segments; cars turn at the end and remain on-road.
 for(let i=0;i<5;i++){
  const road=horizontal[i%horizontal.length],forward=i%2===0;
  traffic.push({road,axis:'x',v:forward?1:-1,x:road.x+road.w*(.15+i*.15),y:road.y+road.h*(forward?.35:.65),speed:1.2+i*.23,color:colors[i],variant:i%5});
 }
 const pedestrianRoutes=[
  [290,1270,1300,1270],[1650,1260,2370,1260],
  [2700,1250,3500,1250],[3820,1260,4330,1260],
  [260,2450,1200,2450],[1600,2470,2350,2470],
  [2690,2450,3450,2450],[3850,2470,4380,2470]
 ];
 for(let i=0;i<8;i++){
  const [x1,y1,x2,y2]=pedestrianRoutes[i];
  people.push({x:x1+i*15,y:y1,from:x1,to:x2,dir:1,speed:.43+(i%3)*.12,color:colors[i],variant:i%6});
 }
 let elapsed=0;
 const near=(x,y)=>{const p=driving?car:player;return Math.abs(x-p.x)<1050&&Math.abs(y-p.y)<1050};
 function update(delta){
  if(!running||locked)return;
  elapsed+=Math.min(delta,100);
  if(elapsed<80)return;
  const dt=Math.min(elapsed,160)/16.67;elapsed=0;
  for(const p of people){
   if(!near(p.x,p.y))continue;
   p.x+=p.dir*p.speed*dt;
   if(p.x>p.to){p.x=p.to;p.dir=-1}
   if(p.x<p.from){p.x=p.from;p.dir=1}
  }
  for(const v of traffic){
   if(!near(v.x,v.y))continue;
   v.x+=v.v*v.speed*dt;
   if(v.x>v.road.x+v.road.w-85){v.x=v.road.x+v.road.w-85;v.v=-1}
   if(v.x<v.road.x+85){v.x=v.road.x+85;v.v=1}
  }
 }
 function drawPed(p){
  const pos=iso(p.x,p.y,5);
  ctx.save();
  const image=citizenImages[p.variant];
  if(image.complete&&image.naturalWidth){
   ctx.translate(pos.x,pos.y);if(p.dir<0)ctx.scale(-1,1);
   ctx.drawImage(image,-13,-47,26,47);
  }else{
   ctx.fillStyle=p.color;ctx.fillRect(pos.x-6,pos.y-23,12,20);
   ctx.beginPath();ctx.arc(pos.x,pos.y-29,6,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
 }
 function drawCar(v){
  const im=carImages[v.variant];
  if(!im.complete||!im.naturalWidth){spriteCar(v.x,v.y,v.v>0?0:Math.PI,v.color);return}
  const p=iso(v.x,v.y,8),w=75,h=w*im.naturalHeight/im.naturalWidth;
  ctx.save();ctx.translate(p.x,p.y);if(v.v<0)ctx.scale(-1,1);
  ctx.drawImage(im,-w/2,-h*.73,w,h);ctx.restore();
 }
 window.ambientCity={
  update,
  addDrawables(items){
   for(const p of people)if(near(p.x,p.y))items.push({y:p.x+p.y,fn:()=>drawPed(p)});
   for(const v of traffic)if(near(v.x,v.y))items.push({y:v.x+v.y,fn:()=>drawCar(v)});
  }
 };
})();
