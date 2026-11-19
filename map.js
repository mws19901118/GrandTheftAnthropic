// AI Vice City geography. Story and economy refer to stable site IDs and coordinates.
const WORLD={w:4800,h:3400};
const sites=[
 {id:'anthropic',x:780,y:950,n:'ANTHROPIC HQ',color:'#e6a77e'},
 {id:'nvidia',x:1880,y:950,n:'NVIDIA DEPOT',color:'#8bd34b'},
 {id:'openai',x:2960,y:950,n:'OPENAI CLUB',color:'#57d2b5'},
 {id:'xai',x:4260,y:2740,n:'xAI COLOSSUS',color:'#8f93ff'},
 {id:'deepseek',x:920,y:2100,n:'DEEPSEEK CASINO',color:'#4dbde9'},
 {id:'gemini',x:2050,y:2100,n:'GEMINI TOWER',color:'#f5c960'},
 {id:'meta',x:3180,y:2100,n:'META MALL',color:'#559dff'},
 {id:'ipo',x:4260,y:2100,n:'IPO EXCHANGE',color:'#ff65b0'}
];
const DISTRICTS=[
 {x:0,y:0,w:1160,h:690,type:'water',name:'NEON BAY'},
 {x:2200,y:0,w:260,h:740,type:'water',name:'CANAL INLET'},
 {x:1260,y:70,w:1050,h:680,type:'industrial',name:'COMPUTE DOCKS'},
 {x:2700,y:80,w:1250,h:690,type:'plaza',name:'STARTUP VALLEY'},
 {x:120,y:1400,w:920,h:540,type:'park',name:'PALM GARDENS'},
 {x:3550,y:1420,w:1050,h:1080,type:'plaza',name:'IPO FINANCIAL DISTRICT'},
 {x:1200,y:2530,w:1050,h:680,type:'industrial',name:'SERVER ROW'},
 {x:3650,y:2640,w:980,h:570,type:'industrial',name:'COLOSSUS OUTSKIRTS'}
];
// Road segments are finite: the player must use junctions rather than infinite grid lines.
// Bridge at y=460 crosses the bay inlet; waterfront barriers prevent driving into water.
const ROADS=[
 {x:0,y:1050,w:4800,h:125,kind:'arterial'},
 {x:0,y:2230,w:4800,h:125,kind:'arterial'},
 {x:0,y:2840,w:3400,h:110,kind:'arterial'},
 {x:3640,y:2840,w:1160,h:110,kind:'arterial'},
 {x:1390,y:420,w:2350,h:110,kind:'bridge'},
 {x:420,y:780,w:110,h:2580,kind:'local'},
 {x:1440,y:0,w:120,h:3400,kind:'highway'},
 {x:2520,y:0,w:120,h:3400,kind:'highway'},
 {x:3650,y:0,w:120,h:3400,kind:'highway'},
 {x:4470,y:760,w:110,h:2640,kind:'local'},
 {x:1440,y:1660,w:560,h:110,kind:'local'},
 {x:2000,y:1660,w:1020,h:110,kind:'local'},
 // Restore the straight eastbound street marked yellow, ending at the highway.
 {x:3020,y:1660,w:750,h:110,kind:'local'},
 {x:1490,y:420,w:370,h:110,kind:'local'},
 {x:2520,y:710,w:1235,h:110,kind:'local'},
 {x:660,y:1050,w:110,h:1250,kind:'access'},
 {x:1800,y:1050,w:110,h:1250,kind:'access'},
 {x:2880,y:1050,w:110,h:1250,kind:'access'},
 {x:4070,y:1050,w:110,h:1250,kind:'access'},
 {x:660,y:2230,w:110,h:620,kind:'access'},
 {x:1800,y:2230,w:110,h:620,kind:'access'},
 {x:2880,y:2230,w:110,h:620,kind:'access'},
 {x:4070,y:2230,w:110,h:620,kind:'access'},
 // Former lagoon crossings are ordinary, connected streets.
 {x:3270,y:2230,w:570,h:125,kind:'arterial'},
 {x:3400,y:2840,w:240,h:110,kind:'arterial'}
];
// Non-grid diagonal connectors, represented as short world-space polylines.
const CURVED_ROADS=[
 // East-west elevated bypass follows the shallow, near-straight yellow sketch.
 // The ground-level road stops at its first junction east of Palm Gardens.
 // The east end meets the north-south road at the NVIDIA-side junction (x=2520, y=1110).
 // Remove the old diagonal fork that previously approached this junction.
 {points:(()=>{const p=[];for(let i=0;i<=40;i++){const t=i/40,u=1-t;p.push([Math.round(u*u*u*1120+3*u*u*t*1450+3*u*t*t*2070+t*t*t*2520),Math.round(u*u*u*2290+3*u*u*t*2060+3*u*t*t*1450+t*t*t*1110)]);}return p})(),width:110,kind:'overpass',elevated:true},
 // Northeast corner connector: from the upper bridge to the eastern perimeter road.
 // Keep the curve entirely in the top-right sector, away from IPO Exchange.
 {points:(()=>{const p=[];for(let i=0;i<=32;i++){const t=i/32,u=1-t;p.push([
  Math.round(u*u*u*3690+3*u*u*t*3970+3*u*t*t*4380+t*t*t*4525),
  Math.round(u*u*u*475+3*u*u*t*475+3*u*t*t*570+t*t*t*815)
 ]);}return p})(),width:110,kind:'local'},
];
function distanceToSegment(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
 const t=Math.max(0,Math.min(1,len?((x-a[0])*dx+(y-a[1])*dy)/len:0));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
function onCurvedRoad(x,y,pad=0){
 return CURVED_ROADS.some(r=>r.points.some((p,i)=>i&&distanceToSegment(x,y,r.points[i-1],p)<=r.width/2+pad));
}
// The proposed Meta lagoon was removed; the original bay and canal remain.
const WATERFRONT=[];
function nearWaterfront(x,y,pad=0){return WATERFRONT.some(w=>{const p=w.points;for(let i=0;i<p.length;i++)if(distanceToSegment(x,y,p[i],p[(i+1)%p.length])<=pad)return true;return false;})||inWaterfront(x,y);}
function inWaterfront(x,y){return WATERFRONT.some(w=>{let inside=false,p=w.points;for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i],b=p[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;});}
const WATER=[{x:0,y:0,w:1140,h:680},{x:0,y:680,w:320,h:200},{x:2200,y:0,w:260,h:740}];
function inRect(x,y,r,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad}
function elevatedRoadAt(x,y){
 for(const r of CURVED_ROADS){
  if(!r.elevated)continue;
  let total=0,nearest=Infinity,height=0;
  const lens=[];for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);lens.push(len);total+=len;}
  let traversed=0;
  for(let i=1;i<r.points.length;i++){
   const a=r.points[i-1],b=r.points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=lens[i-1],q=len?Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(len*len))):0;
   const dist=Math.hypot(x-a[0]-dx*q,y-a[1]-dy*q);
   if(dist<nearest){nearest=dist;const t=(traversed+q*len)/total;height=7+110*Math.sin(Math.PI*t)**2;}
   traversed+=len;
  }
  if(nearest<=r.width/2+6)return height;
 }
 return 0;
}
function roadSurface(x,y){return ROADS.some(r=>inRect(x,y,r))||onCurvedRoad(x,y)}

// Road decks remain traversable even where the shoreline polygon overlaps them.
function blockedTerrain(x,y){return (WATER.some(r=>inRect(x,y,r,8))||inWaterfront(x,y))&&!roadSurface(x,y)}
function roadClass(x,y){const r=ROADS.find(r=>inRect(x,y,r));return r?r.kind:CURVED_ROADS.some(q=>q.elevated&&q.points.some((p,i)=>i&&distanceToSegment(x,y,q.points[i-1],p)<=q.width/2))?'overpass':onCurvedRoad(x,y)?'local':null}
