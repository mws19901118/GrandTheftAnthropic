// AI Vice City geography. Story and economy refer to stable site IDs and coordinates.
const WORLD={w:4800,h:3400};
const sites=[
 {id:'anthropic',x:780,y:950,n:'ANTHROPIC HQ',color:'#e6a77e'},
 {id:'nvidia',x:1880,y:950,n:'NVIDIA DEPOT',color:'#8bd34b'},
 {id:'openai',x:2960,y:950,n:'OPENAI CLUB',color:'#57d2b5'},
 {id:'xai',x:4150,y:2740,n:'xAI COLOSSUS',color:'#8f93ff'},
 {id:'deepseek',x:780,y:2100,n:'DEEPSEEK CASINO',color:'#4dbde9'},
 {id:'gemini',x:1880,y:2100,n:'GEMINI TOWER',color:'#f5c960'},
 {id:'meta',x:2960,y:2100,n:'META MALL',color:'#559dff'},
 {id:'ipo',x:4150,y:2100,n:'IPO EXCHANGE',color:'#ff65b0'}
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
 {x:0,y:2840,w:4800,h:110,kind:'arterial'},
 {x:1390,y:420,w:2350,h:110,kind:'bridge'},
 {x:420,y:780,w:110,h:2580,kind:'local'},
 {x:1440,y:0,w:120,h:3400,kind:'highway'},
 {x:2520,y:0,w:120,h:3400,kind:'highway'},
 {x:3650,y:0,w:120,h:3400,kind:'highway'},
 {x:4470,y:760,w:110,h:2640,kind:'local'},
 {x:900,y:1660,w:1100,h:85,kind:'local'},
 {x:2000,y:1660,w:1020,h:85,kind:'local'},
 {x:3020,y:1660,w:820,h:85,kind:'local'},
 {x:660,y:1050,w:95,h:1250,kind:'access'},
 {x:1800,y:1050,w:95,h:1250,kind:'access'},
 {x:2880,y:1050,w:95,h:1250,kind:'access'},
 {x:4070,y:1050,w:95,h:1250,kind:'access'},
 {x:660,y:2230,w:95,h:620,kind:'access'},
 {x:1800,y:2230,w:95,h:620,kind:'access'},
 {x:2880,y:2230,w:95,h:620,kind:'access'},
 {x:4070,y:2230,w:95,h:620,kind:'access'}
];
// Non-grid diagonal connectors, represented as short world-space polylines.
const CURVED_ROADS=[
 {points:[[1080,1700],[1160,1800],[1250,1950],[1380,2230]],width:82,kind:'local'},
 {points:[[3100,1700],[3240,1830],[3450,2020],[3650,2290]],width:84,kind:'local'}
];
function distanceToSegment(x,y,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],len=dx*dx+dy*dy;
 const t=Math.max(0,Math.min(1,len?((x-a[0])*dx+(y-a[1])*dy)/len:0));
 return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);
}
function onCurvedRoad(x,y,pad=0){
 return CURVED_ROADS.some(r=>r.points.some((p,i)=>i&&distanceToSegment(x,y,r.points[i-1],p)<=r.width/2+pad));
}
const WATER=[{x:0,y:0,w:1140,h:680},{x:0,y:680,w:320,h:200},{x:2200,y:0,w:260,h:740}];
function inRect(x,y,r,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad}
function roadSurface(x,y){return ROADS.some(r=>inRect(x,y,r))||onCurvedRoad(x,y)}
function blockedTerrain(x,y){return WATER.some(r=>inRect(x,y,r,8))&&!ROADS.some(r=>r.kind==='bridge'&&inRect(x,y,r))}
function roadClass(x,y){const r=ROADS.find(r=>inRect(x,y,r));return r?r.kind:onCurvedRoad(x,y)?'local':null}
