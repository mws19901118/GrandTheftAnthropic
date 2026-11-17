// Grand Theft Anthropic v1.5 visual-only layer.
// This module decorates the existing renderer without changing world-space physics,
// site coordinates, story logic, collision, saves or property simulation.
(() => {
 const baseGround=ground, baseStreet=streetDetails, baseTower=tower, baseCar=spriteCar, basePerson=spritePerson, baseWarehouse=warehouseDetail;
 const near=(x,y,r=1200)=>{let p=driving?car:player;return Math.abs(p.x-x)+Math.abs(p.y-y)<r*1.6};
 const seed=n=>{let a=Math.sin(n*127.17+32.71)*43758.5453;return a-Math.floor(a)};
 const line=(a,b,c,d,color,width=1)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 const poly=(pts,fill)=>polygon(pts,fill);
 function shadow(x,y,rx,ry,color='#050c20a0'){const p=iso(x,y,3);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p.x+9,p.y+12,rx,ry,0,0,7);ctx.fill()}
 function facade(s,w,h,z,accent,i){
  const x=s.x-w/2,y=s.y-h/2,cols=6,rows=Math.max(3,Math.floor(z/28));
  // Right-facing facade: each window is projected onto an actual vertical wall.
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const wx=x+w,wy=y+(c+.5)*h/cols,zz=18+r*(z-30)/rows;
   const p=iso(wx+1,wy,zz);const lit=seed(i*100+r*13+c*5)>.35;
   ctx.fillStyle=lit?(r%4===0?'#ffd6a4':'#81d6e6'):'#152b43';
   ctx.globalAlpha=lit?.85:.8;ctx.fillRect(p.x-6,p.y-6,12,9);ctx.globalAlpha=1;
  }
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const wx=x+(c+.5)*w/cols,wy=y+h,zz=18+r*(z-30)/rows;
   const p=iso(wx,wy+1,zz);ctx.fillStyle=seed(i*78+r*9+c*3)>.42?'#f6c59e':'#182e49';ctx.fillRect(p.x-6,p.y-5,12,8);
  }
  const roof=iso(s.x,s.y,z+18);
  ctx.fillStyle='#142234';ctx.fillRect(roof.x-27,roof.y-7,54,14);
  ctx.fillStyle=accent;ctx.globalAlpha=.9;ctx.fillRect(roof.x-18,roof.y-6,36,3);ctx.globalAlpha=1;
  const pole=iso(s.x+32,s.y-25,z+35);line(pole.x,pole.y,pole.x,pole.y-31,'#91b7c4',2);
  ctx.fillStyle='#7df4ff';ctx.beginPath();ctx.arc(pole.x,pole.y-32,3,0,7);ctx.fill();
 }
 function pavement(x,y,w,h){
  quad([[x-w/2-12,y-h/2-12,3],[x+w/2+12,y-h/2-12,3],[x+w/2+12,y+h/2+12,3],[x-w/2-12,y+h/2+12,3]],'#536074');
  quad([[x-w/2-4,y-h/2-4,4],[x+w/2+4,y-h/2-4,4],[x+w/2+4,y+h/2+4,4],[x-w/2-4,y+h/2+4,4]],'#283748');
 }
 function lamp(x,y,t,color='#79e9ed'){
  let p=iso(x,y,0),q=iso(x,y,67);
  ctx.strokeStyle='#6e8493';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.lineTo(q.x+12,q.y-4);ctx.stroke();
  ctx.save();ctx.globalAlpha=.13+.05*Math.sin(t/750+x);ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(p.x,p.y,43,18,0,0,7);ctx.fill();ctx.restore();
  ctx.save();ctx.shadowColor=color;ctx.shadowBlur=18;ctx.fillStyle=color;ctx.fillRect(q.x+9,q.y-7,10,5);ctx.restore();
 }
 function vegetation(x,y,n=0){
  let p=iso(x,y,0),top=iso(x,y,65+seed(n)*18);
  shadow(x,y,22,8,'#071c1b77');line(p.x,p.y,top.x,top.y,'#a98a67',5);
  for(let k=0;k<7;k++){
   let a=k*Math.PI*2/7+seed(n)*.5,reach=29+seed(n+k)*17;
   ctx.beginPath();ctx.moveTo(top.x,top.y);ctx.quadraticCurveTo(top.x+Math.cos(a)*reach*.62,top.y+Math.sin(a)*reach*.35-8,top.x+Math.cos(a)*reach,top.y+Math.sin(a)*reach*.52+6);
   ctx.strokeStyle=k%2?'#31aa85':'#63c99d';ctx.lineWidth=4;ctx.stroke();
  }
 }
 function streetSign(x,y,title,accent){
  let p=iso(x,y,105),base=iso(x,y,0);ctx.save();ctx.strokeStyle='#8b9ba4';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(base.x,base.y);ctx.lineTo(p.x,p.y+12);ctx.stroke();ctx.translate(p.x,p.y);ctx.fillStyle='#071425';ctx.fillRect(-58,-18,116,30);ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.strokeRect(-58,-18,116,30);ctx.shadowColor=accent;ctx.shadowBlur=12;ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(title,0,2);ctx.restore();
 }
 ground=function(){
  baseGround();
  const p=driving?car:player;
  // Road shoulders, curbs and reflective edge strips: visual only, physics unchanged.
  for(const r of ROADS){if(Math.abs(r.x+r.w/2-p.x)>1600||Math.abs(r.y+r.h/2-p.y)>1500)continue;
   let c=r.kind==='bridge'?'#a9c5d6':'#8a96a6';
   if(r.w>r.h){quad([[r.x,r.y+7,7],[r.x+r.w,r.y+7,7],[r.x+r.w,r.y+10,7],[r.x,r.y+10,7]],c);quad([[r.x,r.y+r.h-10,7],[r.x+r.w,r.y+r.h-10,7],[r.x+r.w,r.y+r.h-7,7],[r.x,r.y+r.h-7,7]],c)}
   else{quad([[r.x+7,r.y,7],[r.x+10,r.y,7],[r.x+10,r.y+r.h,7],[r.x+7,r.y+r.h,7]],c);quad([[r.x+r.w-10,r.y,7],[r.x+r.w-7,r.y,7],[r.x+r.w-7,r.y+r.h,7],[r.x+r.w-10,r.y+r.h,7]],c)}
  }
  // Distinct walkable pads visually ground all major structures.
  for(const s of sites)if(near(s.x,s.y,1350))pavement(s.x,s.y,220,180);
  for(const d of propertyDefs)if(near(d.x,d.y,1100))pavement(d.x,d.y,135,115);
  // Sidewalk expansion joints and parking spaces around the warehouse.
  const s=sites[1];if(near(s.x,s.y,1500)){
   quad([[s.x-215,s.y+145,7],[s.x+215,s.y+145,7],[s.x+215,s.y+248,7],[s.x-215,s.y+248,7]],'#344452');
   for(let i=-3;i<=3;i++){let x=s.x+i*59;quad([[x,s.y+159,9],[x+3,s.y+159,9],[x+3,s.y+222,9],[x,s.y+222,9]],'#e6dfb3')}
   for(let i=0;i<7;i++){let x=s.x-196+i*64,y=s.y+249;quad([[x,y,9],[x+30,y,9],[x+30,y+5,9],[x,y+5,9]],i%2?'#f3c75a':'#e6d5aa')}
  }
 };
 streetDetails=function(t){
  // Fewer, more carefully composed roadside elements instead of uniform scattered poles.
  for(let i=0;i<55;i++){
   let x=95+(i*397)%4500,y=90+(i*311)%3190;
   if(!near(x,y,1150)||blockedTerrain(x,y)||restrictedSite(x,y)||roadSurface(x,y))continue;
   if(i%3===0)vegetation(x,y,i);else if(i%3===1)lamp(x,y,t,i%2?'#ff73bc':'#70d9f4');
   else{let q=iso(x,y,8);ctx.fillStyle='#3e5c69';ctx.fillRect(q.x-9,q.y-7,18,10);ctx.fillStyle='#9de4d1';ctx.fillRect(q.x-7,q.y-9,14,2)}
  }
  const s=sites[1];if(near(s.x,s.y,1700)){
   for(let i=-2;i<=2;i++)lamp(s.x+i*93,s.y+244,t,'#a4ff74');
   streetSign(s.x+260,s.y-150,'CUDA LICENSED','#a0f76a');
   for(let i=0;i<9;i++){
    let x=s.x-310+(i%5)*74,y=s.y-290+Math.floor(i/5)*85;
    if(!restrictedSite(x,y)&&!roadSurface(x,y)){
     shadow(x,y,32,12);prism(x,y,46,32,20,i%2?'#5b8570':'#a17868');
     let q=iso(x,y,24);ctx.fillStyle='#e3f6d5';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(i%2?'CUDA':'B200',q.x,q.y)
    }
   }
  }
 };
 tower=function(s,i){
  if(!near(s.x,s.y,1800))return;
  const heights=[140,138,206,158,128,250,180,230],z=heights[i];
  shadow(s.x,s.y,118,45);
  const w=i===1?268:205,h=i===1?188:165;
  prism(s.x,s.y,w+18,h+16,12,'#3e5263');
  prism(s.x,s.y,w,h,z,i===1?'#314a3c':'#263e58');
  prism(s.x,s.y,w-18,h-16,z+9,i===1?'#618e49':s.color);
  facade(s,w,h,z,s.color,i);
  // Vertical illuminated trim gives each building a recognizable silhouette.
  for(const [wx,wy] of [[s.x+w/2,s.y+h/2],[s.x-w/2,s.y+h/2]]){
   let a=iso(wx,wy,11),b=iso(wx,wy,z);line(a.x,a.y,b.x,b.y,s.color,3);
  }
  const sign=iso(s.x,s.y,z+39);ctx.save();ctx.font='900 16px system-ui';ctx.textAlign='center';ctx.shadowColor=s.color;ctx.shadowBlur=17;ctx.fillStyle='#f8fbff';ctx.fillText(s.n,sign.x,sign.y);ctx.restore();
  if(i===1){
   // NVIDIA facility: stepped loading hall, roof vents, security barriers.
   for(let j=-2;j<=2;j++){
    const x=s.x+j*49,y=s.y+112;prism(x,y,40,38,24,'#4d5d64');
    let q=iso(x,y+19,24);ctx.fillStyle='#0c1c24';ctx.fillRect(q.x-16,q.y-10,32,13);
    ctx.fillStyle='#9bfa60';ctx.fillRect(q.x-16,q.y-10,32,2)
   }
   for(let j=-2;j<=2;j++){let x=s.x+j*45,y=s.y-55;prism(x,y,29,26,17,'#657b73')}
   let a=iso(s.x,s.y-40,z+45);ctx.save();ctx.shadowColor='#8efa53';ctx.shadowBlur=20;ctx.fillStyle='#baff83';ctx.font='900 25px system-ui';ctx.textAlign='center';ctx.fillText('BLACKWELL',a.x,a.y);ctx.restore();
  }else if(i===2){let q=iso(s.x,s.y,z+63);ctx.fillStyle='#d8fff2';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('AGI? ASK LEGAL',q.x,q.y)}
  else if(i===7){let q=iso(s.x,s.y,z+64);ctx.fillStyle='#ffb2db';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('IPO TODAY',q.x,q.y)}
 };
 warehouseDetail=function(t){
  if(!near(sites[1].x,sites[1].y,1800))return;
  baseWarehouse(t);
  const s=sites[1];
  // Animated gantry beacon and dock floor floodlights.
  const q=iso(s.x+118,s.y-65,190);ctx.save();ctx.fillStyle='#ffb85e';ctx.globalAlpha=.55+.45*Math.sin(t/240);ctx.shadowColor='#ffac4a';ctx.shadowBlur=26;ctx.beginPath();ctx.arc(q.x,q.y,7,0,7);ctx.fill();ctx.restore();
  for(let j=-2;j<=2;j++){
   const p=iso(s.x+j*64,s.y+151,9);ctx.save();ctx.fillStyle='#a5f66d';ctx.globalAlpha=.08+.03*Math.sin(t/600+j);ctx.beginPath();ctx.ellipse(p.x,p.y,38,15,0,0,7);ctx.fill();ctx.restore();
  }
 };
 spriteCar=function(x,y,a,color){
  const p=iso(x,y,8);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a/2);
  ctx.fillStyle='#050b18aa';ctx.beginPath();ctx.ellipse(3,12,43,17,0,0,7);ctx.fill();
  // Tires, chassis, cabin and windscreen with highlighted trim.
  ctx.fillStyle='#10151f';for(const xx of [-25,20])for(const yy of [-10,7]){ctx.beginPath();ctx.ellipse(xx,yy+6,8,5,0,0,7);ctx.fill()}
  poly([{x:-39,y:-13},{x:23,y:-15},{x:39,y:-4},{x:34,y:10},{x:-34,y:12},{x:-43,y:1}],color);
  poly([{x:-15,y:-19},{x:12,y:-20},{x:24,y:-12},{x:-22,y:-11}],'#101e32');
  poly([{x:-10,y:-18},{x:8,y:-18},{x:16,y:-13},{x:-15,y:-12}],'#8cd8eb');
  line(-33,-8,28,-10,'#ffffff65',2);
  ctx.fillStyle='#fff0bd';ctx.shadowColor='#ffe6a4';ctx.shadowBlur=12;ctx.fillRect(31,-9,7,4);ctx.fillRect(32,1,7,4);ctx.shadowBlur=0;
  ctx.fillStyle='#ff334b';ctx.fillRect(-40,-8,5,4);ctx.fillRect(-40,3,5,4);
  ctx.restore();
 };
 spritePerson=function(x,y){
  const p=iso(x,y,4),moving=!!(keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright),step=moving?Math.sin(performance.now()/105)*4:0;
  ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#07101e9a';ctx.beginPath();ctx.ellipse(3,5,15,6,0,0,7);ctx.fill();
  ctx.strokeStyle='#12172a';ctx.lineWidth=6;line(-4,-7,-6+step,2,'#12172a',6);line(4,-7,6-step,2,'#12172a',6);
  poly([{x:-10,y:-32},{x:10,y:-32},{x:12,y:-8},{x:-11,y:-8}],'#263b53');
  line(-8,-28,-13,-12-step*.4,'#d1a083',5);line(8,-28,13,-12+step*.4,'#d1a083',5);
  ctx.fillStyle='#edb99a';ctx.beginPath();ctx.arc(0,-39,9,0,7);ctx.fill();
  ctx.fillStyle='#24202a';ctx.beginPath();ctx.arc(0,-43,9,Math.PI,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5e7ce';ctx.fillRect(-3,-29,6,11);ctx.fillStyle='#b3e2e5';ctx.fillRect(-1,-28,2,12);
  ctx.font='900 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff0da';ctx.shadowColor='#050b18';ctx.shadowBlur=6;ctx.fillText('DARIO',0,-57);ctx.restore();
 };
 // Distant haze and glow are drawn by the base sky; keep world assets deterministic.
})();
