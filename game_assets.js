// Property economy, garage, and property-linked side missions.
// Loaded after game.js; shares the runtime state declared there.
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
 if(gigRun){toast('FINISH YOUR ACTIVE COURIER CONTRACT FIRST');return}
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
function propertyMenu(d){
 const o=ownedProperties[d.id],price=o?d.upgrade:d.price,canPurchase=!o||o.level<2;
 const missing=Math.max(0,price-cash);
 const detail=d.desc+'<br><br>Purchase: $'+d.price+' · Upgrade: $'+d.upgrade+
  '<br>Status: '+(o?'LEVEL '+o.level:'FOR SALE')+
  '<br><b>Available cash: $'+cash+'</b>'+
  (canPurchase&&missing?'<br><strong style="color:#ff8e8e">INSUFFICIENT FUNDS · NEED $'+missing+' MORE</strong>':'')+
  '<br><br>Pays every 45 seconds of active play, including after the IPO. Production pauses when inputs are insufficient.';
 const options=[];
 function insufficient(){
  const panel=document.querySelector('#panel');
  let warning=panel.querySelector('#property-funds-warning');
  if(!warning){warning=document.createElement('p');warning.id='property-funds-warning';warning.style.cssText='padding:12px;background:#52202a;border:1px solid #ff9a9a;border-radius:8px;color:#fff;font-weight:bold';panel.appendChild(warning)}
  warning.textContent='INSUFFICIENT FUNDS · Available $'+cash+' · Required $'+price+' · Need $'+Math.max(0,price-cash)+' more';
  toast('NEED $'+Math.max(0,price-cash)+' MORE');
 }
 if(!o)options.push({text:missing?'BUY · NEED $'+missing+' MORE':'BUY FOR $'+d.price,fn:()=>{
  if(cash<d.price){insufficient();return}
  cash-=d.price;ownedProperties[d.id]={level:1};closeModal();toast('PROPERTY ACQUIRED · '+d.name);
 }});
 else if(o.level<2)options.push({text:missing?'UPGRADE · NEED $'+missing+' MORE':'UPGRADE FOR $'+d.upgrade,fn:()=>{
  if(cash<d.upgrade){insufficient();return}
  cash-=d.upgrade;o.level=2;closeModal();toast('PROPERTY UPGRADED · LEVEL 2');
 }});
 if(o)options.push({text:(completedAssetMissions[d.id]?'REPLAY':'START')+' · '+assetMissions[d.id].title,fn:()=>startAssetMission(d.id)});
 options.push({text:'CLOSE',alt:true,fn:closeModal});
 modal(d.name,detail,options);
}
