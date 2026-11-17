// Independent, non-critical landmark animations. The building image renderer stays untouched.
(() => {
 'use strict';
 const previousTower=tower;
 function drawScene(s,i,t){
  if(i===1)return;
  const p=driving?car:player;
  if(Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>1900)return;
  const widths=[405,0,405,405,380,395,390,390];
  const w=widths[i],u=iso(s.x,s.y,0);
  // Register effects to a small ground-level portion of each image, not the street.
  const at=(x,y)=>({x:u.x+w*(x-.5),y:u.y+68+w*(y-.88)*.66});
  const dot=(x,y,r,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
  const line=(a,b,c,thick=2)=>{ctx.strokeStyle=c;ctx.lineWidth=thick;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()};
  ctx.save();
  // Slightly enlarge and move details toward the visible front-right facade.
  const focus=at(.68,.76);
  ctx.translate(focus.x,focus.y);ctx.scale(1.32,1.32);ctx.translate(-focus.x,-focus.y);
  if(i===0){
   // Anthropic: slow security rover, two wheels and a blinking beacon.
   const f=(Math.sin(t/1600)+1)/2,q=at(.57+.12*f,.82);
   ctx.fillStyle='#21373c';ctx.fillRect(q.x-11,q.y-7,22,11);
   ctx.fillStyle='#e3ad8a';ctx.fillRect(q.x-7,q.y-11,14,5);
   dot(q.x-7,q.y+5,3,'#121c25');dot(q.x+7,q.y+5,3,'#121c25');
   dot(q.x,q.y-13,2,Math.floor(t/500)%2?'#91ffe0':'#4c756d');
  }else if(i===2){
   // OpenAI: holographic DJ turntable.
   const q=at(.70,.77);ctx.strokeStyle='#70f7df';ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(q.x,q.y,17,5,0,0,Math.PI*2);ctx.stroke();
   ctx.globalAlpha=.5+.4*Math.sin(t/700);dot(q.x,q.y-12,5,'#8cfbe8');
  }else if(i===3){
   // xAI: cooling fan with rotating blades and status lights.
   const q=at(.72,.78),angle=t/550;
   for(let k=0;k<3;k++){const a=angle+k*Math.PI*2/3;line(q,{x:q.x+Math.cos(a)*10,y:q.y+Math.sin(a)*10},'#b5c4ee',2)}
   for(let k=0;k<4;k++)dot(q.x-27+k*7,q.y+13,1.8,Math.floor(t/420+k)%3?'#a3a3ff':'#ffbd72');
  }else if(i===4){
   // DeepSeek: three independently cycling casino reels.
   const q=at(.69,.82);ctx.font='bold 12px monospace';ctx.textAlign='center';
   for(let k=0;k<3;k++){ctx.fillStyle='#132c50';ctx.fillRect(q.x-24+k*17,q.y-14,15,18);
    ctx.fillStyle=k===Math.floor(t/750)%3?'#ffca79':'#7ceaff';
    ctx.fillText(['7','R','1'][(Math.floor(t/(700+k*230))+k)%3],q.x-17+k*17,q.y);}
  }else if(i===5){
   // Gemini: rotating approval scanner.
   const q=at(.70,.82),a=t/850;
   ctx.strokeStyle='#f9d27a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,12,0,Math.PI*2);ctx.stroke();
   line(q,{x:q.x+Math.cos(a)*11,y:q.y+Math.sin(a)*11},'#80d5ff',2);
  }else if(i===6){
   // Meta: smart glasses with a sweeping AR scan.
   const q=at(.69,.80);ctx.strokeStyle='#90d6ff';ctx.lineWidth=2;
   ctx.strokeRect(q.x-19,q.y-5,17,11);ctx.strokeRect(q.x+2,q.y-5,17,11);
   line({x:q.x-2,y:q.y},{x:q.x+2,y:q.y},'#90d6ff');
   const y=q.y+15-12*((t/1800)%1);
   line({x:q.x-23,y},{x:q.x+23,y},'#80f0ed',1);
  }else if(i===7){
   // IPO: swinging exchange bell and changing stock ticker.
   const q=at(.71,.80);ctx.save();ctx.translate(q.x,q.y);ctx.rotate(Math.sin(t/350)*.15);
   ctx.strokeStyle='#ffda86';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,11,Math.PI,0);ctx.stroke();
   ctx.fillStyle='#ffda86';ctx.fillRect(-12,0,24,3);ctx.restore();
   ctx.fillStyle='#ffacd6';ctx.font='bold 10px monospace';ctx.textAlign='center';
   ctx.fillText(['IPO UP','AI +7%','GPU UP'][Math.floor(t/1600)%3],q.x,q.y+19);
  }
  ctx.restore();
 }
 tower=function(s,i){
  previousTower(s,i);
  // A decorative error must never take down the core building renderer.
  try{drawScene(s,i,performance.now())}catch(err){
   if(!window.landmarkAnimationWarned){console.warn('Landmark animation skipped',err);window.landmarkAnimationWarned=true}
  }
 };
})();
