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
  // Paint all asphalt first. Draw exposed curbs only after every road has
  // been laid down, so intersections cannot acquire internal seams.
  const visibleRoads=roads.filter(({r})=>{
   const cx=r.x+r.w/2,cy=r.y+r.h/2;
   return Math.abs(cx-focus.x)<=r.w/2+1000&&Math.abs(cy-focus.y)<=r.h/2+1000;
  });
  for(const {r} of visibleRoads)
   drawQuad(r.x,r.y,r.w,r.h,6,r.kind==='bridge'?'#536174':r.kind==='highway'?'#364454':'#344353');
  const insideOther=(x,y,self)=>ROADS.some(r=>r!==self&&x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
  for(const {r,stripes} of visibleRoads){
   const horizontal=r.w>r.h;
   const span=horizontal?r.w:r.h;
   // Short curb sections stop at crossing roads instead of running through them.
   for(let u=0;u<span;u+=16){
    const len=Math.min(16,span-u),middle=u+len/2;
    for(const edge of [0,1]){
     const cx=horizontal?r.x+middle:r.x+(edge?r.w-2:2);
     const cy=horizontal?r.y+(edge?r.h-2:2):r.y+middle;
     if(insideOther(cx,cy,r)||onCurvedRoad(cx,cy,8))continue;
     if(horizontal)drawQuad(r.x+u,edge?r.y+r.h-3:r.y,len,3,8,'#718198');
     else drawQuad(edge?r.x+r.w-3:r.x,r.y+u,3,len,8,'#718198');
    }
   }
   for(const line of stripes){
    if(Math.abs(line.x-focus.x)>1050||Math.abs(line.y-focus.y)>1050)continue;
    drawQuad(line.x,line.y,line.w,line.h,11,'#e8c775');
   }
  }
  function strokeSupport(foot,top){
  ctx.save();ctx.strokeStyle='#83909a';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(foot.x,foot.y);ctx.lineTo(top.x,top.y);ctx.stroke();ctx.strokeStyle='#b0bdc5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(foot.x-3,foot.y);ctx.lineTo(top.x-3,top.y);ctx.stroke();ctx.restore();
 }
 // Diagonal road polygons share the same low-cost rendering path.
  for(const route of CURVED_ROADS){
   const pts=route.points,n=pts.length;
   const deckHeight=t=>route.elevated?7+110*Math.sin(Math.PI*t)**2:7;
   const geom=pts.map((p,i)=>{
    const prev=pts[Math.max(0,i-1)],next=pts[Math.min(n-1,i+1)];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1;
    return {x:p[0],y:p[1],nx:-dy/len,ny:dx/len,z:deckHeight(i/(n-1))};
   });
   const close=geom.some(p=>Math.abs(p.x-focus.x)<1500&&Math.abs(p.y-focus.y)<1500);
   if(!close)continue;
   // Support columns remain behind the continuous bridge deck.
   if(route.elevated)for(let i=5;i<n-4;i+=6){
    const p=geom[i],foot=iso(p.x,p.y,4),top=iso(p.x,p.y,p.z-6);
    strokeSupport(foot,top);
   }
   // One continuous ribbon: shared vertex normals eliminate angular joins.
   const ribbon=(offsetA,offsetB,zOffset,color)=>{
    const vertices=[];
    for(const p of geom)vertices.push([p.x+p.nx*offsetA,p.y+p.ny*offsetA,p.z+zOffset]);
    for(let i=geom.length-1;i>=0;i--){const p=geom[i];vertices.push([p.x+p.nx*offsetB,p.y+p.ny*offsetB,p.z+zOffset]);}
    quad(vertices,color);
   };
   ribbon(route.width/2,-route.width/2,0,'#344353');
   ribbon(route.width/2,route.width/2-3,2,'#718198');
   ribbon(-route.width/2+3,-route.width/2,2,'#718198');
   // Distance-based lane dashes instead of restarting them per segment.
   let traveled=0,nextDash=28;
   for(let i=1;i<n;i++){
    const a=geom[i-1],b=geom[i],len=Math.hypot(b.x-a.x,b.y-a.y);
    if(!len)continue;
    while(nextDash<traveled+len){
     const from=(nextDash-traveled)/len,to=Math.min(1,(nextDash+48-traveled)/len);
     if(from<1&&to>from){
      const q=t=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,nx:a.nx+(b.nx-a.nx)*t,ny:a.ny+(b.ny-a.ny)*t,z:a.z+(b.z-a.z)*t+4});
      const p=q(from),e=q(to);
      quad([[p.x+p.nx*2,p.y+p.ny*2,p.z],[e.x+e.nx*2,e.y+e.ny*2,e.z],[e.x-e.nx*2,e.y-e.ny*2,e.z],[p.x-p.nx*2,p.y-p.ny*2,p.z]],'#e8c775');
     }
     nextDash+=112;
    }
    traveled+=len;
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
