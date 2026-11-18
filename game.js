// Game engine and rendering. Narrative data is loaded from story.js.

const C=document.querySelector('#g'),ctx=C.getContext('2d');let W,H,dpr;function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,2);C.width=W*dpr;C.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}onresize=resize;resize();
const keys={};

let running=false,stage=0,cash=650,gpu=0,hype=15,safety=80,wanted=0,carrying=false,driving=false,player={x:800,y:1150},car={x:880,y:1170,a:0},cops=[{x:3900,y:2450},{x:3450,y:420}],deadline=0,dialogEnd=0,toastEnd=0,frame=0,locked=false,arrestStart=0,checkpoint=null,missionStart=null,missionBannerUntil=0;
let ownedProperties={};
// Vehicle handling, dynamic pursuers, cargo damage and persistent saves.
let velocity={x:0,y:0}, cargoIntegrity=100, rivalVans=[], lastImpact=0, autoSaveElapsed=0;
const SAVE_KEY='gta_anthropic_v13_save', LEGACY_SAVE_KEY='gta_anthropic_v12_save';
let difficulty='normal',gigRun=null,gigCompleted=0,vehicleUpgrade=0;
const DIFFICULTY={casual:{rivalSpeed:.65,damage:.45,timer:1.65,arrest:2200},normal:{rivalSpeed:.83,damage:.7,timer:1.3,arrest:1550},hard:{rivalSpeed:1,damage:1,timer:1,arrest:1050}};
const GARAGE={price:650,upgrade:450};
function validPoint(x,y){return x>=30&&y>=30&&x<WORLD.w-30&&y<WORLD.h-30&&!restrictedSite(x,y)&&!blockedTerrain(x,y)}
function resetVehicle(){velocity={x:0,y:0};cargoIntegrity=100;rivalVans=[];lastImpact=0}
function saveGame(quiet=false){
 if(!running||locked)return;
 try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:13,storyMissionState,difficulty,gigCompleted,vehicleUpgrade,stage,cash,gpu,hype,safety,wanted,carrying,driving,player,car,ownedProperties,completedAssetMissions,cycles,economyElapsed,gigCooldown,ipoComplete,assetRun,velocity,cargoIntegrity,ts:Date.now()}));if(!quiet)toast('GAME SAVED · LOCAL BROWSER')}catch(e){if(!quiet)toast('SAVE UNAVAILABLE · PRIVATE MODE?')}
}
function loadGame(){try{resetMissionQuiz();let raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(LEGACY_SAVE_KEY);if(!raw){toast('NO SAVE FOUND');return}let v=JSON.parse(raw);if(![11,12,13].includes(v.version)||!Number.isInteger(v.stage)||v.stage<0||v.stage>missions.length)throw Error('invalid save');
 storyMissionState=v.storyMissionState||freshStoryState();difficulty=DIFFICULTY[v.difficulty]?v.difficulty:'normal';gigCompleted=v.gigCompleted||0;vehicleUpgrade=v.vehicleUpgrade||0;gigRun=null;stage=v.stage;cash=v.cash;gpu=v.gpu;hype=v.hype;safety=v.safety;wanted=v.wanted;carrying=v.carrying;driving=v.driving;player=v.player;car=v.car;ownedProperties=v.ownedProperties||{};completedAssetMissions=v.completedAssetMissions||{};cycles=v.cycles||0;economyElapsed=v.economyElapsed||0;gigCooldown=v.gigCooldown||0;ipoComplete=!!v.ipoComplete;assetRun=v.assetRun||null;velocity=v.velocity||{x:0,y:0};cargoIntegrity=v.cargoIntegrity??100;rivalVans=[];cops=[{x:3900,y:2450},{x:3450,y:420}];arrestStart=0;deadline=0;checkpoint=null;lastFrameTime=0;running=true;closeModal();toast('SAVE LOADED · TIMED STORY MISSION RESET');
 }catch(e){toast('SAVE FILE INVALID')}}
function chaseActive(){return (assetRun&&assetRun.id==='warehouse'&&assetRun.step>=1)||(stage===1&&carrying)}
function spawnRivals(){rivalVans=[{x:car.x+330,y:car.y+170,vx:0,vy:0},{x:car.x-280,y:car.y-160,vx:0,vy:0}].map((v,i)=>({...v,x:Math.max(40,Math.min(WORLD.w-40,v.x)),y:Math.max(40,Math.min(WORLD.h-40,v.y)),id:i}))}
function updateRivals(dt,t){if(!chaseActive()){rivalVans=[];return}if(!rivalVans.length)spawnRivals();let target=driving?car:player;
 for(const v of rivalVans){let dx=target.x-v.x,dy=target.y-v.y,d=Math.hypot(dx,dy)||1;let rate=Math.min(1,dt/300),rivalSpeed=5.8*DIFFICULTY[difficulty].rivalSpeed;v.vx+=(dx/d*rivalSpeed-v.vx)*rate;v.vy+=(dy/d*rivalSpeed-v.vy)*rate;let nx=v.x+v.vx*dt/16.67,ny=v.y+v.vy*dt/16.67;if(validPoint(nx,v.y))v.x=nx;else v.vx*=-.5;if(validPoint(v.x,ny))v.y=ny;else v.vy*=-.5;
 if(d<68&&t-lastImpact>1100){cargoIntegrity=Math.max(0,cargoIntegrity-Math.ceil((driving?17:24)*DIFFICULTY[difficulty].damage));lastImpact=t;wanted=Math.max(wanted,2);toast('RIVAL RAMMED THE SHIPMENT · CARGO '+cargoIntegrity+'%');if(cargoIntegrity<=0){if(stage===1&&carrying)fail();else failAssetMission('CARGO DESTROYED');return}}}}
function objectivePoint(){if(gigRun)return gigTarget();if(assetRun){let step=assetMissions[assetRun.id].steps[assetRun.step];return step?{x:step.x,y:step.y}:null}return stage<missions.length?(window.hqDefenseTargetSite&&window.hqDefenseTargetSite()||sites[missions[stage].site]):null}
// Entry pads are intentionally on the SOUTH side of buildings, facing the nearest street.
// Story and property coordinates remain unchanged.
const ENTRY_RADIUS=112;
// Entrance positions are authored per building to match its frontage and reachable roads.
const ENTRY_LOCATIONS={
 anthropic:{x:780,y:1080},nvidia:{x:1880,y:1080},openai:{x:2960,y:1080},
 deepseek:{x:920,y:2240},gemini:{x:2050,y:2240},meta:{x:3180,y:2240},
 ipo:{x:4260,y:2240},xai:{x:4260,y:2860},
 warehouse:{x:780,y:2860},lab:{x:1650,y:510},cloud:{x:3330,y:735}
};
function siteEntry(s){return {...ENTRY_LOCATIONS[s.id],site:s,kind:'site',label:s.n}}
function propertyEntry(p){return {...ENTRY_LOCATIONS[p.id],property:p,kind:'property',label:p.name}}
function currentEntry(){if(gigRun){let s=gigTarget();return s&&siteEntry(s)}if(assetRun){const step=assetMissions[assetRun.id].steps[assetRun.step];if(!step)return null;const s=sites.find(s=>Math.hypot(s.x-step.x,s.y-step.y)<12);const p=propertyDefs.find(p=>Math.hypot(p.x-step.x,p.y-step.y)<12);return s?siteEntry(s):p?propertyEntry(p):{x:step.x,y:step.y,kind:'checkpoint',label:step.label}}if(stage<missions.length)return siteEntry((window.hqDefenseTargetSite&&window.hqDefenseTargetSite()||sites[missions[stage].site]));return null}
function closeEntry(p,e,r=ENTRY_RADIUS){return !!e&&Math.hypot(p.x-e.x,p.y-e.y)<r}
function nearestEntry(p){const all=[...sites.map(siteEntry),...propertyDefs.map(propertyEntry)];return all.filter(e=>closeEntry(p,e)).sort((a,b)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(p.x-b.x,p.y-b.y))[0]||null}
function entryPrompt(){
 const p=driving?car:player,e=nearestEntry(p),target=currentEntry();
 if(!e)return null;
 const active=!!target&&Math.hypot(e.x-target.x,e.y-target.y)<25;
 return {e,active,text:e.kind==='property'?'E · MANAGE '+e.label:active?'E · '+(gigRun?'CONTRACT CHECKPOINT':driving?'USE LOADING BAY / ENTER':'ENTER / INTERACT')+' · '+e.label:'E · VISIT '+e.label};
}
function drawEntryPad(e,t,active){const q=iso(e.x,e.y,9),pulse=.55+.45*Math.sin(t/340),color=active?'#ffdf75':e.kind==='property'?'#8cf5e3':'#9bacc9';ctx.save();ctx.translate(q.x,q.y);ctx.scale(1,.52);ctx.strokeStyle=color;ctx.lineWidth=active?6:3;ctx.shadowColor=color;ctx.shadowBlur=active?25:10;ctx.beginPath();ctx.arc(0,0,active?33+4*pulse:29,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=active?'#ffe9a0':'#e4e9f6';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.scale(1,1/.52);ctx.fillText(active?'MISSION':e.kind==='property'?'ASSET':'ENTRY',0,-33);ctx.restore()}
function drawEntryPads(t){const target=currentEntry();const p=driving?car:player;for(const s of sites){const e=siteEntry(s);if(Math.hypot(e.x-p.x,e.y-p.y)<1100||target&&target.site===s)drawEntryPad(e,t,!!target&&Math.hypot(e.x-target.x,e.y-target.y)<25)}for(const d of propertyDefs){const e=propertyEntry(d);if(Math.hypot(e.x-p.x,e.y-p.y)<950)drawEntryPad(e,t,!!target&&Math.hypot(e.x-target.x,e.y-target.y)<25)}if(target&&target.kind==='checkpoint')drawEntryPad(target,t,true)}
function drawEntryHint(){const hint=entryPrompt();const el=document.querySelector('#entry-hint');if(!el)return;if(!running||locked||!hint){el.style.display='none';return}el.style.display='block';el.textContent=hint.text}

let assetRun=null, completedAssetMissions={};
// Economy time is measured in active gameplay, not wall-clock time.
let economyElapsed=0, lastFrameTime=0, gigCooldown=0, cycles=0, ipoComplete=false;
const ECONOMY_INTERVAL=45000;
const GIG_CONTRACTS=[
 {name:'GPU COURIER',cash:410,gpu:12,time:235,steps:[
  {site:'nvidia',label:'PICK UP THE GPU CRATE',line:'JENSEN: No refunds on thermal paste.'},
  {site:'openai',label:'VERIFY THE SERIAL NUMBERS',line:'DARIO: The spreadsheet says these GPUs are emotionally available.'},
  {site:'anthropic',label:'DELIVER THE SHIPMENT',line:'ALICE: Megaspeed verified the manifest. Anthropic can handle its own safety review.'}]},
 {name:'EFFICIENCY AUDIT',cash:360,hype:8,time:245,steps:[
  {site:'deepseek',label:'COLLECT THE BENCHMARK DATA',line:'DARIO: Small model, enormous spreadsheet.'},
  {site:'gemini',label:'CROSS-CHECK THE RESULTS',line:'GEMINI: The chart looks persuasive, which is not the same as correct.'},
  {site:'anthropic',label:'SUBMIT THE AUDIT',line:'DARIO: Independent verification achieved. Alice did not even invoice us for it.'}]},
 {name:'COMPLIANCE EXPRESS',cash:390,safety:7,time:240,steps:[
  {site:'anthropic',label:'PICK UP THE SAFETY REPORT',line:'DARIO: Do not lose the appendix. Sam will charge us for a replacement.'},
  {site:'gemini',label:'GET THE COMPLIANCE STAMP',line:'GEMINI: Please initial every page, including the blank ones.'},
  {site:'ipo',label:'FILE THE REPORT',line:'DARIO: The market appreciates a stamped document.'}]},
 {name:'BOARDROOM DOCUMENT DELIVERY',cash:440,hype:5,time:255,steps:[
  {site:'openai',label:'COLLECT THE BOARD PACKET',line:'SAM: This is the final version. Probably.'},
  {site:'meta',label:'OBTAIN THE LEGAL SIGNATURE',line:'META: We have reviewed the review.'},
  {site:'ipo',label:'HAND OFF THE PACKET',line:'DARIO: Confidential paperwork successfully transported in a sports car.'}]}
];
function gigStep(){if(!gigRun)return null;return (gigRun.steps||[{site:gigRun.target,label:'DELIVER THE CONTRACT'}])[gigRun.step||0]}
function gigTarget(){const step=gigStep();return step&&sites.find(s=>s.id===step.site)}
function sideGig(){
 if(!running||locked)return;
 if(gigRun){const step=gigStep();toast('ACTIVE CONTRACT · '+(step?step.label:'FINISH THE CONTRACT'));return}
 if(assetRun||deadline){toast('FINISH YOUR ACTIVE MISSION FIRST');return}
 if(gigCooldown>0){toast('CONTRACT BOARD COOLDOWN · '+Math.ceil(gigCooldown/1000)+'s');return}
 const j=GIG_CONTRACTS[gigCompleted%GIG_CONTRACTS.length];
 gigRun={...j,step:0,remaining:Math.round(j.time*DIFFICULTY[difficulty].timer)*1000};
 const target=gigTarget();
 toast('CONTRACT ACCEPTED · '+j.name);
 showDialog('FREELANCE CONTRACT',j.name+' · 1/'+j.steps.length+' · '+j.steps[0].label+' at '+target.n+'. Press E at the entrance. Time limit: '+Math.ceil(gigRun.remaining/1000)+' seconds.');
}
function finishGig(){
 if(!gigRun)return;
 const step=gigStep();
 if(step&&step.line)showDialog('CONTRACT · '+(gigRun.step+1)+'/'+gigRun.steps.length,step.line);
 gigRun.step=(gigRun.step||0)+1;
 if(gigRun.step<gigRun.steps.length){
  const next=gigStep(),target=gigTarget();
  toast('CHECKPOINT COMPLETE · '+next.label);
  showDialog('NEXT CONTRACT STOP',next.label+' · '+target.n+' · '+Math.ceil(gigRun.remaining/1000)+'s left.');
  return;
 }
 const j=gigRun;cash+=j.cash;gpu+=j.gpu||0;hype+=j.hype||0;safety=Math.min(100,safety+(j.safety||0));
 gigRun=null;gigCompleted++;gigCooldown=12000;
 toast('CONTRACT COMPLETE · +$'+j.cash);
 showDialog('CONTRACT PAID',j.name+' completed all checkpoints. Payment received.');
}
function failGig(){if(!gigRun)return;gigRun=null;gigCooldown=7000;toast('CONTRACT EXPIRED · TRY AGAIN');}
function garageMenu(){modal('VEHICLE <span>GARAGE</span>','Upgrade your getaway car for better acceleration and a higher top speed. Current engine: '+(vehicleUpgrade?'TURBO':'STOCK')+'.',[{text:vehicleUpgrade?'TURBO ALREADY INSTALLED':'INSTALL TURBO · $'+GARAGE.upgrade,fn:()=>{if(vehicleUpgrade){toast('ALREADY INSTALLED');return}if(cash<GARAGE.upgrade){toast('NOT ENOUGH CASH');return}cash-=GARAGE.upgrade;vehicleUpgrade=1;closeModal();toast('TURBO INSTALLED · ROAD SPEED +18%')}},{text:'CLOSE',alt:true,fn:closeModal}])}

function snapshotProperties(){return JSON.parse(JSON.stringify(ownedProperties))}
function propertyIncome(){
 let changes=[];for(const d of propertyDefs){let owned=ownedProperties[d.id];if(!owned)continue;let total={...d.base};if(owned.level===2)for(const [k,v] of Object.entries(d.bonus))total[k]=(total[k]||0)+v;
 // Production is atomic: never consume resources that the player does not have.
 if((total.gpu||0)<0&&gpu< -total.gpu){changes.push(d.name+': NO COMPUTE');continue}
 if((total.cash||0)<0&&cash< -total.cash){changes.push(d.name+': NO CASH');continue}
 cash+=total.cash||0;gpu+=total.gpu||0;hype+=total.hype||0;safety+=total.safety||0;changes.push(d.name+': '+Object.entries(total).map(([k,v])=>(v>0?'+':'')+v+' '+k.toUpperCase()).join(', '))}
 if(changes.length)showDialog('ASSET PAYDAY · CYCLE '+cycles,changes.join('<br>'))}
function startAssetMission(id){
 if(assetRun){toast('FINISH YOUR ACTIVE ASSET MISSION FIRST');return}
 if(!ownedProperties[id]){toast('BUY THE PROPERTY FIRST');return}
 if(stage<missions.length && ['delivery','escape'].includes(missions[stage].kind)){
  toast('FINISH YOUR TIMED STORY MISSION FIRST');return;
 }
 const def=assetMissions[id];
 assetRun={id,step:0,remaining:Math.round(def.time*DIFFICULTY[difficulty].timer)*1000,originalWanted:wanted};
 wanted=id==='warehouse'?2:0;cargoIntegrity=100;rivalVans=[];arrestStart=0;closeModal();
 showDialog(def.title,def.intro);toast('ASSET MISSION STARTED · '+def.title);
}
function finishAssetMission(){
 const run=assetRun,def=assetMissions[run.id];
 const first=!completedAssetMissions[run.id];completedAssetMissions[run.id]=true;
 const reward=first?def.reward:{cash:Math.round(def.reward.cash*.6),gpu:Math.round((def.reward.gpu||0)*.5),hype:0,safety:0};
 if(run.id==='warehouse'){reward.cash=Math.round(reward.cash*cargoIntegrity/100);reward.gpu=Math.round((reward.gpu||0)*cargoIntegrity/100)}
 cash+=reward.cash||0;gpu+=reward.gpu||0;hype+=reward.hype||0;safety=Math.min(100,safety+(reward.safety||0));
 wanted=run.originalWanted;assetRun=null;rivalVans=[];arrestStart=0;
 showDialog('ASSET MISSION COMPLETE',def.title+'<br>+$'+reward.cash+' · +'+(reward.gpu||0)+' GPU'+(first?' · FIRST-TIME BONUS':' · REPLAY PAYOUT'));
 toast('ASSET MISSION PASSED · +$'+reward.cash);
}
function failAssetMission(reason){
 if(!assetRun)return;
 const run=assetRun,def=assetMissions[run.id];wanted=run.originalWanted;assetRun=null;rivalVans=[];arrestStart=0;
 modal('<span class="failed">'+reason+'</span>',def.title+' failed. Your property is safe, but the contract is lost.',[
  {text:'RETRY ASSET MISSION',fn:()=>startAssetMission(run.id)},
  {text:'RETURN TO CITY',alt:true,fn:closeModal}]);
}
function assetInteract(){
 if(!assetRun)return false;
 const def=assetMissions[assetRun.id],step=def.steps[assetRun.step],p=driving?car:player;
 if(!closeEntry(p,currentEntry(),ENTRY_RADIUS)){toast('FIND THE GLOWING CHECKPOINT / LOADING BAY');return true}
 showDialog(def.title,step.line);assetRun.step++;if(assetRun.id==='warehouse'&&assetRun.step===1){spawnRivals();toast('RIVAL VANS INBOUND · PROTECT THE CARGO')}
 if(assetRun.step>=def.steps.length)finishAssetMission();
 else toast('OBJECTIVE COMPLETE · NEXT CHECKPOINT');
 return true;
}
function propertyMenu(d){let o=ownedProperties[d.id];let detail=d.desc+'<br><br>Price: $'+d.price+' · Upgrade: $'+d.upgrade+'<br>Status: '+(o?'LEVEL '+o.level:'FOR SALE')+'<br><br>Pays every 45 seconds of active play, including after the IPO. Production pauses when inputs are insufficient.';let options=[];if(!o){options.push({text:'BUY FOR $'+d.price,fn:()=>{if(cash<d.price){toast('NOT ENOUGH CASH');return}cash-=d.price;ownedProperties[d.id]={level:1};closeModal();toast('PROPERTY ACQUIRED · '+d.name)}})}else if(o.level<2){options.push({text:'UPGRADE FOR $'+d.upgrade,fn:()=>{if(cash<d.upgrade){toast('NOT ENOUGH CASH');return}cash-=d.upgrade;o.level=2;closeModal();toast('PROPERTY UPGRADED · LEVEL 2')}})}options.push(...(o?[{text:(completedAssetMissions[d.id]?'REPLAY':'START')+' · '+assetMissions[d.id].title,fn:()=>startAssetMission(d.id)}]:[]));options.push({text:'CLOSE',alt:true,fn:closeModal});modal(d.name,detail,options)}
function portfolio(){let rows=propertyDefs.map(d=>{let o=ownedProperties[d.id];return '<b>'+d.name+'</b> — '+(o?'LEVEL '+o.level:'NOT OWNED')+(completedAssetMissions[d.id]?' · CONTRACT CLEARED':'')+'<br><small>'+d.desc+'</small>'}).join('<br><br>');modal('ASSET <span>EMPIRE</span>',rows+'<br><br>Properties pay every 45 seconds of active gameplay. [G] completes repeatable freelance contracts (+cash). Time to next payday: '+Math.ceil((ECONOMY_INTERVAL-economyElapsed)/1000)+'s. Freelance cooldown: '+Math.ceil(gigCooldown/1000)+'s.',[{text:'CLOSE',fn:closeModal}])}
function showDialog(w,t){const d=document.querySelector('#dialog');d.innerHTML='<strong>'+w+'</strong><p>'+t+'</p>';d.style.display='block';dialogEnd=performance.now()+5500}
function toast(t){document.querySelector('#toast').textContent=t;document.querySelector('#toast').style.opacity=1;toastEnd=performance.now()+2200}
function modal(title,body,buttons){locked=true;const el=document.querySelector('#modal');el.style.display='grid';document.querySelector('#panel').innerHTML='<h1>'+title+'</h1><p>'+body+'</p><div id="choices"></div><p><small>Fictional satire of public tech-industry themes.</small></p>';let ch=document.querySelector('#choices');buttons.forEach(b=>{let bt=document.createElement('button');bt.textContent=b.text;bt.className=b.alt?'alt':'';bt.onclick=b.fn;ch.append(bt)})}
function closeModal(){document.querySelector('#modal').style.display='none';locked=false}
function start(){resetMissionQuiz();storyMissionState=freshStoryState();resetVehicle();gigRun=null;gigCompleted=0;vehicleUpgrade=0;autoSaveElapsed=0;economyElapsed=0;lastFrameTime=0;gigCooldown=0;cycles=0;ipoComplete=false;ownedProperties={};assetRun=null;completedAssetMissions={};running=true;stage=0;cash=650;gpu=0;hype=15;safety=80;wanted=0;carrying=false;driving=false;player={x:800,y:1150};car={x:880,y:1170,a:0};cops=[{x:3900,y:2450},{x:3450,y:420}];deadline=0;arrestStart=0;checkpoint=null;missionStart=null;missionBannerUntil=performance.now()+2800;closeModal();showDialog('DARIO','Seven days until IPO. Jensen has the GPUs. Sam has the lawyers. I have a mission and a very optimistic valuation.');toast('NEW CAMPAIGN · THE IPO HEIST')}
function endingTitle(){if(Object.keys(ownedProperties).length===3&&Object.values(ownedProperties).every(o=>o.level===2)&&Object.keys(completedAssetMissions).length===3)return 'SECRET ENDING: THE VERTICAL MONOPOLY';if(hype>=85&&safety>=70&&gpu>=140)return 'CLAUDE EMPIRE ENDING';if(safety<55)return 'AGI MERGER ENDING';return 'THE IPO SURVIVES';}
function endingDescription(){if(Object.keys(ownedProperties).length===3&&Object.values(ownedProperties).every(o=>o.level===2)&&Object.keys(completedAssetMissions).length===3)return 'Dario owns every business in AI Vice City. Jensen sends a CUDA renewal invoice. Alice sends a separate commercial invoice and refuses to merge the two.';if(hype>=85&&safety>=70&&gpu>=140)return 'Claude rules the benchmarks. The safety team gets a vacation, pending seventeen approvals.';if(safety<55)return 'The market demands a merger. Sam brings a term sheet; Dario brings a very long model card.';return 'Anthropic rings the bell. The GPU suppliers win either way. Alice insists her contracts are her own.';}
function advance(){const completedStage=stage;const m=missions[stage];showDialog(m.speaker,m.line);toast(m.reward);const e=m.effects||{};cash+=e.cash||0;gpu+=e.gpu||0;hype+=e.hype||0;safety+=e.safety||0;if(e.wanted!==undefined)wanted=e.wanted;if(e.carrying!==undefined)carrying=e.carrying;stage++;onStoryAdvance(completedStage);deadline=0;arrestStart=0;checkpoint=null;missionStart=null;missionBannerUntil=performance.now()+2600;if(stage===missions.length){ipoComplete=true;wanted=0;setTimeout(()=>modal('IPO <span>SUCCESS!</span>','Anthropic goes public! Cash: $'+cash+' · Compute: '+gpu+' · Hype: '+hype+'.<br><br><b>'+endingTitle()+'</b><br>'+endingDescription(),[{text:'CONTINUE FREE ROAM',fn:()=>{closeModal();toast('FREE ROAM · BUILD YOUR ASSET EMPIRE')}},{text:'NEW CAMPAIGN',alt:true,fn:start}]),1700)}}
function fail(){if(locked)return;deadline=0;arrestStart=0;modal('<span class="failed">MISSION FAILED</span>','The compliance department has filed an incident report. It is longer than the model card.',[{text:'RETRY MISSION',fn:retryMission},{text:'RESTART CAMPAIGN',alt:true,fn:start}])}
function busted(){
 if(locked)return;
 if(assetRun){failAssetMission('BUSTED');return;}if(gigRun)failGig();
 arrestStart=0;deadline=0;
 modal('<span class="busted">BUSTED</span>',
 'AI Vice City Police Department<br><b>Charge:</b> Excessive GPU possession and reckless valuation.<br><br>Mission failed. Your current mission will restart.',
 [{text:'RETRY MISSION',fn:retryMission},{text:'RESTART CAMPAIGN',alt:true,fn:start}]);
}
function retryMission(){
 resetMissionQuiz();resetStoryMission(stage);
 if(checkpoint){({cash,gpu,hype,safety,carrying}=checkpoint)}
 // A retry starts a fresh attempt, never with the previous arrest meter or pursuers.
 wanted=0;
 if(stage===1)carrying=true;
 driving=false;resetVehicle();velocity={x:0,y:0};arrestStart=0;deadline=0;
 missionStart=null;checkpoint=null;lastImpact=0;cargoIntegrity=100;rivalVans=[];
 missionBannerUntil=performance.now()+2200;
 // Continuation stages restart at the previous destination; new chapters at HQ.
 const chapters=[0,2,4,5,7,8,9];
 const prev=stage>0?sites[missions[stage-1].site]:sites[0];
 const home=sites[0];
 const origin=chapters.includes(stage)?home:prev;
 player={x:origin.x+15,y:origin.y+90};
 car={x:player.x+80,y:player.y+20,a:0};
 cops=[{x:3900,y:2450},{x:3450,y:420}];
 closeModal();toast('MISSION RESTARTED · PURSUIT RESET');
}
// Mission minigames share one neutral-choice UI: never reveal the answer via styling.
const MISSION_ROUNDS={
  poker:[
    {q:'Your GPU budget was cut in half. What is the best move?',options:['Buy more GPUs on credit','Distill a smaller model','Cancel the benchmark'],correct:1},
    {q:'Inference costs are rising. Which change helps?',options:['Cache repeated requests','Double every context window','Add animated logos'],correct:0},
    {q:'Investors demand proof of efficiency. Show them:',options:['Parameter count','An unverified leaderboard','Quality per dollar on held-out tests'],correct:2}
  ],
  approval:[
    {q:'Google Form 17-B: Who can approve TPU access?',options:['The committee that approves committees','The cafeteria robot','A random benchmark leaderboard'],correct:0},
    {q:'Form 17-C: The approval workflow is stuck. What do you submit?',options:['Another GPU invoice','A documented risk assessment','A dancing Gemini logo'],correct:1},
    {q:'Final compliance audit: What belongs in the deployment record?',options:['Nothing, ship immediately','Only the marketing slogan','Owner, limits and rollback plan'],correct:2}
  ],
  zuck:[
    {q:'Three identical Zucks appear. Which clue identifies the real dealmaker?',options:['Offers a concrete distribution agreement','Promises everyone is a hologram','Refuses to discuss the product'],correct:0},
    {q:'The glasses collect user data. Which contract protects users?',options:['Unlimited silent collection','Clear consent and data minimization','Sell all data to the highest bidder'],correct:1},
    {q:'Meta offers an open-weight release. What should Dario verify?',options:['The jacket color','The number of VR headsets','License terms and model evaluation'],correct:2}
  ],
  market:[
    {q:'A competitor launches a model. What should the IPO team publish?',options:['A fake leaderboard','Reproducible benchmark results','A promise of AGI tomorrow'],correct:1},
    {q:'GPU prices spike. What keeps the business viable?',options:['Track unit economics and optimize inference','Double spending with no plan','Hide the invoices'],correct:0},
    {q:'Analysts ask about safety. What is the credible response?',options:['Remove the safety team','Change the subject','Show evaluations, mitigations and governance'],correct:2}
  ],
  grok:[
    {q:'Elon wants to launch the server racks into orbit. Your response?',options:['Approve immediate launch','Keep compute on the ground with a tested backup','Ask a meme account to certify the rocket'],correct:1},
    {q:'A Grok bot rewrites the route mid-delivery. Which route do you trust?',options:['The verified dispatch route','The most viral post','A random map screenshot'],correct:0}
  ]
};
let missionQuiz={stage:-1,round:0};
function resetMissionQuiz(){missionQuiz={stage:-1,round:0}}
function openMissionQuiz(kind){
 if(missionQuiz.stage!==stage)missionQuiz={stage,round:0};
 const rounds=MISSION_ROUNDS[kind],round=rounds[missionQuiz.round];
 const heading={poker:'THE R1 GAMBIT',approval:'FORM 17-B',zuck:'FIND ZUCK',market:'THE MARKET',grok:'THE GROKFATHER'}[kind];
 const prefix=kind==='market'?'IPO BOARD CHALLENGE':kind==='grok'?'COLOSSUS DISPATCH':'MISSION CHALLENGE';
 modal(heading,'<b>'+prefix+' · '+(missionQuiz.round+1)+'/'+rounds.length+'</b><br><br>'+round.q,
 round.options.map((option,i)=>({text:option,fn:()=>{
   if(i!==round.correct){
     const penalty=kind==='market'?75:kind==='poker'?50:25;
     cash=Math.max(0,cash-penalty);hype=Math.max(0,hype-2);
     resetMissionQuiz();closeModal();toast('INCORRECT · -$'+penalty+' · RETRY THE CHALLENGE');return;
   }
   missionQuiz.round++;
   if(missionQuiz.round>=rounds.length){
     resetMissionQuiz();closeModal();
     if(kind==='market'&&(gpu<100||safety<40)){toast('IPO NOT READY · NEED 100 COMPUTE AND 40 SAFETY');return}
     advance();
   }else openMissionQuiz(kind);
 }})).concat([{text:'LEAVE CHALLENGE',alt:true,fn:()=>{resetMissionQuiz();closeModal()}}]));
}
function challenge(m){
 if(MISSION_ROUNDS[m.kind]){openMissionQuiz(m.kind);return}
 if(stage===5){openMissionQuiz('grok');return}
 advance();
}
function interact(){if(!running||locked)return;const interactionPos=driving?car:player;if(gigRun&&gigTarget()&&closeEntry(interactionPos,siteEntry(gigTarget()))){finishGig();return}if(assetInteract())return;if(stage>=missions.length){const p=driving?car:player;const d=propertyDefs.find(q=>closeEntry(p,propertyEntry(q)));if(d){propertyMenu(d);return}const visit=sites.find(q=>closeEntry(p,siteEntry(q)));if(visit){showDialog(visit.n,'Welcome to '+visit.n+'. No active story mission here. Explore the city or press G for a freelance contract.');return}if(driving){driving=false;velocity={x:0,y:0};player.x=car.x+45;player.y=car.y+22;toast('EXIT VEHICLE');return}if(Math.hypot(player.x-car.x,player.y-car.y)<95){driving=true;velocity={x:0,y:0};toast('VEHICLE ENTERED');return}toast('FREE ROAM · [G] CONTRACTS · [B] ASSETS');return}const pos=driving?car:player,m=missions[stage],s=sites[m.site];const nearbyProperty=propertyDefs.find(d=>closeEntry(pos,propertyEntry(d)));if(nearbyProperty){propertyMenu(nearbyProperty);return;}if(closeEntry(pos,siteEntry(s))){if(handleStoryInteraction())return;if(m.kind==='delivery'||m.kind==='escape'){if(deadline&&performance.now()>deadline){fail();return}}challenge(m);return}let site=sites.find(q=>closeEntry(pos,siteEntry(q)));if(site){showDialog(site.n,'Welcome to '+site.n+'. No active story mission here. Explore the city or press G for a freelance contract.');return}if(driving){driving=false;velocity={x:0,y:0};player.x=car.x+45;player.y=car.y+22;toast('EXIT VEHICLE');return}if(Math.hypot(player.x-car.x,player.y-car.y)<95){driving=true;velocity={x:0,y:0};toast('VEHICLE ENTERED');return}toast('FIND THE GLOWING ENTRANCE · CHECK THE MINIMAP')}
function nextTimer(){if(!checkpoint&&stage<missions.length)checkpoint={cash,gpu,hype,safety,wanted,carrying};if(stage<missions.length&&['delivery','escape'].includes(missions[stage].kind)&&!deadline){deadline=performance.now()+Math.round(missions[stage].time*DIFFICULTY[difficulty].timer)*1000;toast('⏱ COUNTDOWN STARTED!')}}
document.querySelector('#start').onclick=start;const diffPicker=document.createElement('div');diffPicker.style.cssText='margin:10px 0;color:#d6e7f9;font:13px system-ui';diffPicker.innerHTML='DIFFICULTY: <select id=diff-select style="background:#182d40;color:#fff;padding:8px;border:1px solid #6ad9da;border-radius:8px"><option value=casual>CASUAL · Story mode</option><option value=normal selected>NORMAL · Balanced</option><option value=hard>HARD · Vice City</option></select>';document.querySelector('#start').before(diffPicker);document.querySelector('#start').addEventListener('click',()=>{difficulty=document.querySelector('#diff-select').value});const loadButton=document.createElement('button');loadButton.textContent='CONTINUE SAVED GAME';loadButton.className='alt';loadButton.onclick=loadGame;document.querySelector('#start').after(loadButton);addEventListener('keydown',e=>{let k=e.key.toLowerCase();keys[k]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(k==='e'&&!e.repeat)interact();if(k==='r'&&e.shiftKey&&!e.repeat&&running&&!locked)modal('RESTART CAMPAIGN?','This will erase your current unsaved progress. Press Cancel to return to the city.',[{text:'CANCEL',alt:true,fn:closeModal},{text:'RESTART CAMPAIGN',fn:start}]);if(k==='b'&&!e.repeat&&running&&!locked)portfolio();if(k==='g'&&!e.repeat)sideGig();if(k==='u'&&!e.repeat&&running&&!locked)garageMenu();if(k==='p'&&!e.repeat)saveGame();if(k==='l'&&!e.repeat)loadGame()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);document.querySelectorAll('#mobile button').forEach(b=>{let k=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();if(k==='e')interact();else keys[k]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=false))});
function rect(a,b,w,h,c){ctx.fillStyle=c;ctx.fillRect(a,b,w,h)}function label(t,a,b,size=13,color='#fff'){ctx.fillStyle=color;ctx.font='bold '+size+'px system-ui';ctx.textAlign='center';ctx.fillText(t,a,b)}

// Isometric projection: game mechanics remain in world-space, rendering is 2.5D.
const ISOX=.79, ISOY=.40;
function iso(wx,wy,z=0){return {x:(wx-wy)*ISOX,y:(wx+wy)*ISOY-z}}
function polygon(pts,fill,stroke){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function quad(points,fill,stroke){polygon(points.map(p=>iso(...p)),fill,stroke)}
function prism(cx,cy,w,h,z,color){let a=cx-w/2,b=cy-h/2,A=iso(a,b,z),B=iso(a+w,b,z),D=iso(a,b+h,z),E=iso(a+w,b+h,z),aa=iso(a,b),bb=iso(a+w,b),dd=iso(a,b+h),ee=iso(a+w,b+h);
polygon([B,E,ee,bb],shade(color,-36));polygon([D,E,ee,dd],shade(color,-54));polygon([A,B,E,D],color,'#ffffff25')}
function shade(hex,amount){let n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amount)),g=Math.max(0,Math.min(255,((n>>8)&255)+amount)),b=Math.max(0,Math.min(255,(n&255)+amount));return `rgb(${r},${g},${b})`}
// World geometry is separate from story data and mission scripting.
function restrictedSite(x,y){return sites.some(s=>Math.abs(x-s.x)<110&&Math.abs(y-s.y)<90)||propertyDefs.some(d=>Math.abs(x-d.x)<72&&Math.abs(y-d.y)<62)}
function ground(){
 quad([[0,0,0],[WORLD.w,0,0],[WORLD.w,WORLD.h,0],[0,WORLD.h,0]],'#183544');
 for(const d of DISTRICTS){const fill={water:'#12617b',park:'#285b4a',industrial:'#474b55',plaza:'#4d435b'}[d.type];
  quad([[d.x,d.y,1],[d.x+d.w,d.y,1],[d.x+d.w,d.y+d.h,1],[d.x,d.y+d.h,1]],fill);
  if(d.type==='water')for(let i=0;i<14;i++){let y=d.y+25+i*44;quad([[d.x+24,y,2],[d.x+d.w-30,y,2],[d.x+d.w-55,y+5,2],[d.x+44,y+5,2]],i%2?'#207c96':'#1a7088')}
  if(d.type==='park')for(let i=0;i<28;i++){let x=d.x+45+(i*109)%(d.w-90),y=d.y+35+(i*167)%(d.h-70);if(!roadSurface(x,y))prism(x,y,25,25,20,i%2?'#3c8b62':'#397d5b')}
  if(d.type==='industrial')for(let i=0;i<14;i++){let x=d.x+65+(i*157)%(d.w-120),y=d.y+55+(i*101)%(d.h-100);if(!roadSurface(x,y)&&!restrictedSite(x,y))prism(x,y,75,45,27,i%2?'#59636c':'#69616b')}
 }
 // Road surfaces, curbs and lane markings are rendered by unified_world_art.js.

}
// Original procedural palms and lamps replaced by reusable environment sprites.
function streetDetails(t){}
function minimap(){
 const mw=174,mh=128,xx=W-mw-18,yy=H-mh-52;
 ctx.save();ctx.fillStyle='#071222e8';ctx.fillRect(xx-6,yy-6,mw+12,mh+12);ctx.strokeStyle='#f779b880';ctx.strokeRect(xx-6,yy-6,mw+12,mh+12);
 ctx.fillStyle='#173d46';ctx.fillRect(xx,yy,mw,mh);
 for(const d of DISTRICTS){ctx.fillStyle={water:'#12617b',park:'#285b4a',industrial:'#474b55',plaza:'#4d435b'}[d.type];ctx.fillRect(xx+d.x/WORLD.w*mw,yy+d.y/WORLD.h*mh,d.w/WORLD.w*mw,d.h/WORLD.h*mh)}
 for(const r of ROADS){ctx.fillStyle=r.kind==='highway'?'#a1b4ca':'#65758b';ctx.fillRect(xx+r.x/WORLD.w*mw,yy+r.y/WORLD.h*mh,Math.max(1,r.w/WORLD.w*mw),Math.max(1,r.h/WORLD.h*mh))}
 // Draw the same non-grid roads used by the world renderer.
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(const r of CURVED_ROADS){
  ctx.beginPath();
  r.points.forEach((p,i)=>{const x=xx+p[0]/WORLD.w*mw,y=yy+p[1]/WORLD.h*mh;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.strokeStyle='#8395aa';ctx.lineWidth=Math.max(2,r.width/WORLD.w*mw);ctx.stroke();
 }
 ctx.restore();
 sites.forEach((s,i)=>{ctx.fillStyle=s.color;ctx.fillRect(xx+s.x/WORLD.w*mw-2,yy+s.y/WORLD.h*mh-2,4,4)});propertyDefs.forEach(d=>{ctx.fillStyle=ownedProperties[d.id]?d.color:'#f3dfab';ctx.fillRect(xx+d.x/WORLD.w*mw-3,yy+d.y/WORLD.h*mh-3,6,6)});
 if(gigRun){let st=gigTarget();ctx.strokeStyle='#8aff9c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(xx+st.x/WORLD.w*mw,yy+st.y/WORLD.h*mh,8,0,7);ctx.stroke()}if(assetRun){let st=assetMissions[assetRun.id].steps[assetRun.step];ctx.strokeStyle='#62f3ee';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx+st.x/WORLD.w*mw,yy+st.y/WORLD.h*mh,7,0,7);ctx.stroke()}else if(stage<missions.length){let s=(window.hqDefenseTargetSite&&window.hqDefenseTargetSite()||sites[missions[stage].site]);ctx.strokeStyle='#ffe16f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(xx+s.x/WORLD.w*mw,yy+s.y/WORLD.h*mh,6,0,7);ctx.stroke()}
 const p=driving?car:player;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(xx+p.x/WORLD.w*mw,yy+p.y/WORLD.h*mh,4,0,7);ctx.fill();ctx.restore();
}
function tower(s,i){let z=[115,150,180,160,135,230,170,205][i];prism(s.x,s.y,205,165,z,'#253e56');prism(s.x,s.y,183,146,z+13,s.color);
for(let k=0;k<5;k++){let p=iso(s.x-75+k*34,s.y+83,z-30);ctx.fillStyle=k%2?'#f8d6a2':'#79d6ee';ctx.fillRect(p.x-7,p.y-3,14,7)}
let p=iso(s.x,s.y,z+28);ctx.textAlign='center';ctx.font='900 15px system-ui';ctx.fillStyle=s.color;ctx.shadowBlur=14;ctx.shadowColor=s.color;ctx.fillText(s.n,p.x,p.y);ctx.shadowBlur=0;
// Character names intentionally omitted from buildings.
if(i===1){let a=iso(s.x,s.y,z+55);ctx.font='bold 30px system-ui';ctx.fillStyle='#b6f767';ctx.fillText('GPU',a.x,a.y)}
if(i===3){let a=iso(s.x,s.y,z+65);ctx.fillStyle='#e9eaff';ctx.beginPath();ctx.moveTo(a.x,a.y-38);ctx.lineTo(a.x-13,a.y+12);ctx.lineTo(a.x+13,a.y+12);ctx.fill()}
}
function warehouseDetail(t){const s=sites[1];ctx.save();
// A readable loading dock at street level, distinct from the office towers.
for(let i=-1;i<=1;i++){const x=s.x+i*64,y=s.y+108;prism(x,y,51,35,18,'#536779');let p=iso(x,y+19,22);ctx.fillStyle='#101c2c';ctx.fillRect(p.x-17,p.y-10,34,13);ctx.strokeStyle='#9bf25a';ctx.lineWidth=2;ctx.strokeRect(p.x-17,p.y-10,34,13)}
for(let i=0;i<5;i++){const x=s.x-110+i*50,y=s.y-112;prism(x,y,36,31,27,i%2?'#6a9a43':'#a6b85e');const p=iso(x,y,31);ctx.fillStyle='#162d1c';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('B100',p.x,p.y)}
const a=iso(s.x,s.y-102,182);ctx.textAlign='center';ctx.font='900 16px system-ui';ctx.fillStyle='#c4ff8d';ctx.shadowBlur=18;ctx.shadowColor='#8cff45';ctx.fillText('BLACKWELL SHIPPING',a.x,a.y);ctx.shadowBlur=0;
const lamp=iso(s.x,s.y+130,15);ctx.fillStyle='#a0f97c';ctx.globalAlpha=.3+.16*Math.sin(t/400);ctx.beginPath();ctx.ellipse(lamp.x,lamp.y,85,23,0,0,7);ctx.fill();ctx.restore()}
function streetAccent(){const s=sites[1];ctx.save();for(let i=-2;i<=2;i++){let p=iso(s.x+i*48,s.y+168,10);ctx.fillStyle='#f3e8b3';ctx.beginPath();ctx.moveTo(p.x,p.y-7);ctx.lineTo(p.x-9,p.y+4);ctx.lineTo(p.x+9,p.y+4);ctx.fill()}for(let i=-2;i<=2;i++){let p=iso(s.x+i*55,s.y+214,7);ctx.fillStyle='#c0d6dd';ctx.fillRect(p.x-11,p.y-2,22,3)}ctx.restore()}
function spriteCar(px,py,a,color){let p=iso(px,py,8);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a/2);ctx.shadowBlur=15;ctx.shadowColor=color;ctx.fillStyle='#0a1123';ctx.beginPath();ctx.ellipse(0,8,34,15,0,0,7);ctx.fill();ctx.shadowBlur=0;polygon([{x:-32,y:-12},{x:26,y:-12},{x:34,y:4},{x:-25,y:4}],color);polygon([{x:-8,y:-17},{x:16,y:-17},{x:23,y:-12},{x:-14,y:-12}],'#8ed5e5');ctx.fillStyle='#ffe7a3';ctx.fillRect(26,-8,7,4);ctx.fillRect(27,0,7,4);ctx.restore()}
function spritePerson(px,py){let p=iso(px,py,5);ctx.fillStyle='#080f24a0';ctx.beginPath();ctx.ellipse(p.x,p.y+5,14,7,0,0,7);ctx.fill();ctx.fillStyle='#e6a382';ctx.fillRect(p.x-8,p.y-27,16,24);ctx.fillStyle='#f1c6a5';ctx.beginPath();ctx.arc(p.x,p.y-34,9,0,7);ctx.fill();ctx.fillStyle='#f8d9ba';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('DARIO',p.x,p.y-51)}
function draw(t){frame++;
 const delta=lastFrameTime?Math.min(100,t-lastFrameTime):0;lastFrameTime=t;
 if(window.ambientCity)window.ambientCity.update(delta);
 if(running&&!locked){
  if(gigRun){gigRun.remaining-=delta;if(gigRun.remaining<=0)failGig()}if(assetRun){assetRun.remaining-=delta;if(assetRun.remaining<=0)failAssetMission('MISSION FAILED')}
  autoSaveElapsed+=delta;if(autoSaveElapsed>14000){autoSaveElapsed=0;saveGame(true)}
  economyElapsed+=delta;gigCooldown=Math.max(0,gigCooldown-delta);
  if(economyElapsed>=ECONOMY_INTERVAL){economyElapsed-=ECONOMY_INTERVAL;cycles++;propertyIncome();}
let dx=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),dy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
let factor=Math.min(2.5,delta/16.67),mag=Math.hypot(dx,dy);if(mag){dx/=mag;dy/=mag}
if(driving){let onRoad=roadSurface(car.x,car.y),topSpeed=(onRoad?10.6:3.15)*(vehicleUpgrade?1.18:1),boost=keys[' ']?1.28:1;
 let response=Math.min(1,(onRoad?.075:.045)*factor),friction=Math.pow(mag?.988:.92,factor);
 velocity.x=(velocity.x+(dx*topSpeed*boost-velocity.x)*response)*friction;
 velocity.y=(velocity.y+(dy*topSpeed*boost-velocity.y)*response)*friction;
 let nx=car.x+velocity.x*factor,ny=car.y+velocity.y*factor;
 if(validPoint(nx,car.y))car.x=nx;else{velocity.x*=-.22;if(t-lastImpact>900){lastImpact=t;toast('COLLISION · ROAD BLOCKED');if(chaseActive())cargoIntegrity=Math.max(0,cargoIntegrity-Math.ceil(8*DIFFICULTY[difficulty].damage))}}
 if(validPoint(car.x,ny))car.y=ny;else{velocity.y*=-.22;if(t-lastImpact>900){lastImpact=t;toast('COLLISION · ROAD BLOCKED');if(chaseActive())cargoIntegrity=Math.max(0,cargoIntegrity-Math.ceil(8*DIFFICULTY[difficulty].damage))}}
 if(Math.hypot(velocity.x,velocity.y)>.3)car.a=Math.atan2(velocity.y,velocity.x);
}else if(mag){let nx=player.x+dx*3.7*factor,ny=player.y+dy*3.7*factor;if(validPoint(nx,player.y))player.x=nx;if(validPoint(player.x,ny))player.y=ny}
if(chaseActive()&&cargoIntegrity<=0){if(stage===1&&carrying)fail();else failAssetMission('CARGO DESTROYED');}
updateRivals(delta,t);
let p=driving?car:player;p.x=Math.max(25,Math.min(WORLD.w-25,p.x));p.y=Math.max(25,Math.min(WORLD.h-25,p.y));if(!assetRun)nextTimer();updateStoryMission(delta,t);if(!assetRun&&deadline&&t>deadline)fail();if(wanted>0){let contact=false;cops.forEach(cp=>{let d=Math.hypot(p.x-cp.x,p.y-cp.y);if(d>28){cp.x+=(p.x-cp.x)/d*(.7+wanted*.42);cp.y+=(p.y-cp.y)/d*(.7+wanted*.42)}if(d<43)contact=true});if(contact){if(!arrestStart)arrestStart=t;if(t-arrestStart>DIFFICULTY[difficulty].arrest)busted()}else arrestStart=0}}
const pos=driving?car:player,focus=iso(pos.x,pos.y),offX=W/2-focus.x,offY=H*.57-focus.y;ctx.clearRect(0,0,W,H);let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#100b2e');sky.addColorStop(.55,'#392249');sky.addColorStop(1,'#0d2b39');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
ctx.save();ctx.translate(offX,offY);ground();streetDetails(t);streetAccent();


DISTRICTS.filter(d=>d.type!=='water').forEach(d=>{let p=iso(d.x+d.w/2,d.y+d.h/2,9);ctx.textAlign='center';ctx.font='900 19px system-ui';ctx.fillStyle='#e7e9fc90';ctx.fillText(d.name,p.x,p.y)});
let drawables=propertyDefs.map(d=>({y:d.x+d.y,fn:()=>{if(window.drawPropertySprite&&window.drawPropertySprite(d))return;let o=ownedProperties[d.id],z=o&&o.level===2?115:65;prism(d.x,d.y,125,105,z,o?d.color:'#58677a');let a=iso(d.x,d.y,z+26);ctx.textAlign='center';ctx.font='bold 12px system-ui';ctx.fillStyle=o?'#fff':'#ffdca8';ctx.shadowColor=d.color;ctx.shadowBlur=o?12:0;ctx.fillText(d.name,a.x,a.y);ctx.shadowBlur=0;let b=iso(d.x,d.y+90,6);ctx.font='bold 12px system-ui';ctx.fillText(o?'LVL '+o.level:'$'+d.price,b.x,b.y)}}));
let drawablesOld=sites.map((s,i)=>({y:s.x+s.y,fn:()=>{tower(s,i);if(i===1)warehouseDetail(t)}}));drawables.push(...drawablesOld);drawables.push({y:car.x+car.y,fn:()=>spriteCar(car.x,car.y,car.a,'#ff5ba9')});if(!driving)drawables.push({y:player.x+player.y,fn:()=>spritePerson(player.x,player.y)});cops.forEach(cp=>drawables.push({y:cp.x+cp.y,fn:()=>spriteCar(cp.x,cp.y,0,'#5b9dff')}));rivalVans.forEach(v=>drawables.push({y:v.x+v.y,fn:()=>spriteCar(v.x,v.y,Math.atan2(v.vy,v.vx),'#ff794a')}));if(window.ambientCity)window.ambientCity.addDrawables(drawables);
drawables.sort((a,b)=>a.y-b.y).forEach(d=>d.fn());
drawEntryPads(t);
drawStoryWorld(t,offX,offY);ctx.restore();minimap();drawEntryHint();drawStoryHud(t);
if(running&&stage<missions.length&&t<missionBannerUntil){ctx.save();ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=15;ctx.fillStyle='#ffe3a2';ctx.font='900 22px system-ui';ctx.fillText(missions[stage].title,W/2,H*.22);ctx.restore()}
document.querySelector('#stats').innerHTML='🏢 '+Object.keys(ownedProperties).length+'/3 ASSETS · [B] PORTFOLIO<br>'+'🎮 '+difficulty.toUpperCase()+' · 💵 $'+cash+'　⚡ '+gpu+' GPU　📈 '+hype+' HYPE<br>🛡 '+safety+' SAFETY　🚨 '+('★'.repeat(wanted)||'CLEAR')+'<br>🏦 PAYDAY '+Math.ceil((ECONOMY_INTERVAL-economyElapsed)/1000)+'s · [G] SIDE GIG '+(gigCooldown?Math.ceil(gigCooldown/1000)+'s':'READY')+'<br>'+(driving?(roadSurface(car.x,car.y)?'🚗 ROAD SPEED ×3.6':'🚙 OFF-ROAD SLOW'):'🚶 ON FOOT')+(assetRun?' · 🧊 ASSET CONTRACT ACTIVE':'')+(chaseActive()?' · 📦 CARGO '+cargoIntegrity+'%':'')+'<br>💾 [P] SAVE · [L] LOAD · [U] GARAGE · [G] CONTRACT';
if(gigRun){let dest=gigTarget();document.querySelector('#quest').innerHTML='<b>FREELANCE · '+gigRun.name+'</b><p>'+(gigStep()?gigStep().label:'CONTRACT')+' · '+dest.n+' · '+((gigRun.step||0)+1)+'/'+(gigRun.steps?gigRun.steps.length:1)+'</p><small>'+Math.ceil(gigRun.remaining/1000)+'s · PRESS E AT DESTINATION · GREEN MINIMAP TARGET</small>'}else if(assetRun){let def=assetMissions[assetRun.id],st=def.steps[assetRun.step],d=Math.round(Math.hypot(pos.x-st.x,pos.y-st.y));document.querySelector('#quest').innerHTML='<b>ASSET · '+def.title+'</b><p>'+st.label+' ('+(assetRun.step+1)+'/'+def.steps.length+')</p><small>📍 '+d+'m · '+Math.ceil(assetRun.remaining/1000)+'s · E AT GLOWING ENTRY / CHECKPOINT'+(chaseActive()?' · CARGO '+cargoIntegrity+'%':'')+'</small>'}
else if(stage<missions.length){let m=missions[stage],s=(window.hqDefenseTargetSite&&window.hqDefenseTargetSite()||sites[m.site]),d=Math.round(Math.hypot(pos.x-siteEntry(s).x,pos.y-siteEntry(s).y)),prop=propertyDefs.find(q=>closeEntry(pos,propertyEntry(q))),time=deadline?Math.max(0,Math.ceil((deadline-t)/1000)):null;document.querySelector('#quest').innerHTML='<b>'+(stage===4&&!storyMissionState.hqDefenseDone?'ANTHROPIC UNDER SIEGE':m.title)+'</b><p>'+storyGoal(m)+'</p><small>📍 '+d+'m '+(prop?'· E TO MANAGE '+prop.name:(d<ENTRY_RADIUS?'· PRESS E AT ENTRANCE':'· FIND THE GLOWING ENTRANCE'))+(time!==null?' · ⏱ '+time+'s':'')+'</small>'}else {let prop=propertyDefs.find(q=>closeEntry(pos,propertyEntry(q)));document.querySelector('#quest').innerHTML='<b>🏆 IPO SUCCESS · FREE ROAM</b><p>Own all three businesses, upgrade them, and keep earning.</p><small>'+(prop?'E · MANAGE '+prop.name:'G · FREELANCE CONTRACTS · B · PORTFOLIO')+'</small>'};if(t>dialogEnd)document.querySelector('#dialog').style.display='none';if(t>toastEnd)document.querySelector('#toast').style.opacity=0;requestAnimationFrame(draw)}requestAnimationFrame(draw);
