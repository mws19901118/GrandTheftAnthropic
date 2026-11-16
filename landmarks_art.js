// Lightweight landmark art pass: no external image downloads or gameplay changes.
(() => {
 const oldTower=tower;
 const near=s=>{const p=driving?car:player;return Math.hypot(p.x-s.x,p.y-s.y)<1750};
 const box=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const neon=(text,x,y,color,size=13)=>{ctx.save();ctx.font='900 '+size+'px system-ui';ctx.textAlign='center';ctx.shadowColor=color;ctx.shadowBlur=16;ctx.fillStyle=color;ctx.fillText(text,x,y);ctx.restore()};
 const pole=(x,y,h,color)=>{const a=iso(x,y,7),b=iso(x,y,h);ctx.strokeStyle='#6e8797';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(b.x,b.y,4,0,7);ctx.fill();ctx.shadowBlur=0};
 const floor=(s,fill)=>quad([[s.x-145,s.y+125,7],[s.x+145,s.y+125,7],[s.x+145,s.y+213,7],[s.x-145,s.y+213,7]],fill);
 function art(s,i){
  const t=performance.now(),q=iso(s.x,s.y+115,35);
  ctx.save();
  if(i===0){
   floor(s,'#a58d80');
   for(let j=-2;j<=2;j++){const p=iso(s.x+j*48,s.y+162,12);box(p.x-13,p.y-5,26,10,'#d7b7a0');box(p.x-9,p.y-7,18,3,'#f8e4cc')}
   neon('CONSTITUTIONAL AI',q.x,q.y-9,'#ffcb9f',13);
   pole(s.x-115,s.y+118,85,'#f5b68e');pole(s.x+115,s.y+118,85,'#f5b68e');
  }else if(i===2){
   floor(s,'#244c4d');
   for(let j=-2;j<=2;j++){const p=iso(s.x+j*45,s.y+167,11);box(p.x-10,p.y-20,20,26,'#142d32');box(p.x-7,p.y-17,14,4,'#71f4cd')}
   neon('AGI ROOFTOP CLUB',q.x,q.y-15,'#77ffe0',14);
   neon('MEMBERS ONLY',q.x,q.y+7,'#f7d9a7',9);
  }else if(i===3){
   floor(s,'#292943');
   for(let j=-2;j<=2;j++){let p=iso(s.x+j*49,s.y+166,17);box(p.x-19,p.y-22,38,24,'#17223e');box(p.x-16,p.y-19,32,4,'#a7a7ff');box(p.x-12,p.y-8,24,3,'#67d9ff')}
   const a=iso(s.x+65,s.y-45,220);ctx.strokeStyle='#c2baff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x,a.y-65);ctx.stroke();
   neon('COLOSSUS COMPUTE',q.x,q.y-11,'#b9adff',13);
  }else if(i===4){
   floor(s,'#3b315b');
   for(let j=-2;j<=2;j++){let p=iso(s.x+j*45,s.y+168,14);box(p.x-14,p.y-22,28,23,j%2?'#643b8b':'#264d7b');neon(j%2?'7':'R1',p.x,p.y-8,j%2?'#ff91ce':'#78e6ff',11)}
   neon('DEEPSEEK CASINO',q.x,q.y-12,'#6bd8ff',14);
  }else if(i===5){
   floor(s,'#46546a');
   const colors=['#6cb4ff','#f4d15b','#f07878','#6acb93'];
   for(let j=0;j<4;j++){const p=iso(s.x-95+j*64,s.y+170,14);box(p.x-24,p.y-28,48,30,'#182b46');box(p.x-21,p.y-25,42,5,colors[j]);neon('FORM '+(17+j),p.x,p.y-10,'#e6f1ff',9)}
   neon('APPROVAL CENTER',q.x,q.y-14,'#ffe08a',13);
  }else if(i===6){
   floor(s,'#243b63');
   for(let j=-2;j<=2;j++){const p=iso(s.x+j*47,s.y+172,13);box(p.x-19,p.y-26,38,29,'#142b48');box(p.x-16,p.y-22,32,8,'#83baff');box(p.x-11,p.y-10,22,3,'#e7f8ff')}
   neon('SMART GLASSES',q.x,q.y-13,'#8cc0ff',14);
   neon('OPEN WEIGHTS · CLOSED MALL',q.x,q.y+7,'#d9eaff',9);
  }else if(i===7){
   floor(s,'#4e304b');
   for(let j=-2;j<=2;j++){const p=iso(s.x+j*45,s.y+166,13);box(p.x-17,p.y-25,34,26,'#231a37');box(p.x-14,p.y-22,28,5,j%2?'#ff80bd':'#ffe9a0')}
   neon('IPO BELL · $10B?',q.x,q.y-13,'#ff9bcf',14);
   const b=iso(s.x,s.y,292);ctx.save();ctx.strokeStyle='#ffca70';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,13,0,7);ctx.stroke();box(b.x-9,b.y-3,18,8,'#ffca70');ctx.restore();
  }
  ctx.restore();
 }
 tower=function(s,i){oldTower(s,i);if(i!==1&&near(s))art(s,i)};
})();
