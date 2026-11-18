// Save/load serialization and backward-compatible recovery.
// Loaded after game.js; uses the shared classic-script game state.
function saveGame(quiet=false){
 if(!running||locked)return;
 if(storyMissionState.loadingUntil){if(!quiet)toast('WAIT FOR GPU LOADING TO FINISH BEFORE SAVING');return}
 try{
  const now=performance.now();
  const snapshot={
   version:14,storyMissionState:{...storyMissionState,loadingStart:0,loadingUntil:0,escapeStart:0},
   difficulty,gigCompleted,vehicleUpgrade,stage,cash,gpu,hype,safety,wanted,carrying,driving,
   player,car,ownedProperties,completedAssetMissions,cycles,economyElapsed,gigCooldown,ipoComplete,
   assetRun,gigRun,velocity,cargoIntegrity,
   deadlineRemaining:deadline?Math.max(1000,deadline-now):0,
   checkpoint,ts:Date.now()
  };
  localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));
  if(!quiet)toast('GAME SAVED · LOCAL BROWSER');
 }catch(e){if(!quiet)toast('SAVE UNAVAILABLE · PRIVATE MODE?')}
}
function loadGame(){
 try{
  const raw=localStorage.getItem(SAVE_KEY)||localStorage.getItem(LEGACY_SAVE_KEY)||localStorage.getItem(OLDER_SAVE_KEY);
  if(!raw){toast('NO SAVE FOUND');return}
  const v=JSON.parse(raw);
  if(![11,12,13,14].includes(v.version)||!Number.isInteger(v.stage)||v.stage<0||v.stage>missions.length)throw Error('invalid save');
  if(!v.player||!Number.isFinite(v.player.x)||!Number.isFinite(v.player.y)||!v.car||!Number.isFinite(v.car.x)||!Number.isFinite(v.car.y))throw Error('invalid coordinates');
  resetMissionQuiz();
  storyMissionState={...freshStoryState(),...(v.storyMissionState||{}),loadingStart:0,loadingUntil:0,escapeStart:0};
  difficulty=DIFFICULTY[v.difficulty]?v.difficulty:'normal';
  gigCompleted=v.gigCompleted||0;vehicleUpgrade=v.vehicleUpgrade||0;
  stage=v.stage;cash=v.cash;gpu=v.gpu;hype=v.hype;safety=v.safety;wanted=v.wanted;
  carrying=v.carrying;driving=v.driving;player=v.player;car=v.car;
  ownedProperties=v.ownedProperties||{};completedAssetMissions=v.completedAssetMissions||{};
  cycles=v.cycles||0;economyElapsed=v.economyElapsed||0;gigCooldown=v.gigCooldown||0;
  ipoComplete=!!v.ipoComplete;velocity=v.velocity||{x:0,y:0};cargoIntegrity=v.cargoIntegrity??100;
  // Reconstruct side contracts from canonical definitions; never trust stale saved step lists.
  gigRun=null;
  if(v.version>=14&&v.gigRun&&Number.isInteger(v.gigRun.step)){
   const contract=GIG_CONTRACTS.find(g=>g.name===v.gigRun.name);
   if(contract&&v.gigRun.step>=0&&v.gigRun.step<contract.steps.length&&Number.isFinite(v.gigRun.remaining)&&v.gigRun.remaining>0)
    gigRun={...contract,step:v.gigRun.step,remaining:v.gigRun.remaining};
  }
  assetRun=null;
  if(v.assetRun&&assetMissions[v.assetRun.id]&&ownedProperties[v.assetRun.id]&&
     Number.isInteger(v.assetRun.step)&&v.assetRun.step>=0&&
     v.assetRun.step<assetMissions[v.assetRun.id].steps.length&&
     Number.isFinite(v.assetRun.remaining)&&v.assetRun.remaining>0)
   assetRun={id:v.assetRun.id,step:v.assetRun.step,remaining:v.assetRun.remaining,originalWanted:v.assetRun.originalWanted||0};
  if(assetRun&&gigRun)gigRun=null;
  const now=performance.now();
  deadline=0;
  if(v.version>=14&&Number.isFinite(v.deadlineRemaining)&&v.deadlineRemaining>0&&
     stage<missions.length&&['delivery','escape'].includes(missions[stage].kind))
   deadline=now+v.deadlineRemaining;
  checkpoint=v.version>=14&&v.checkpoint?v.checkpoint:null;
  if(stage===3&&storyMissionState.heistDone)storyMissionState.escapeStart=now+5000;
  rivalVans=[];cops=[{x:3900,y:2450},{x:3450,y:420}];
  arrestStart=0;lastImpact=now;lastFrameTime=0;autoSaveElapsed=0;missionStart=null;
  running=true;closeModal();
  toast(v.version>=14?'SAVE LOADED · MISSION PROGRESS RESTORED':'LEGACY SAVE LOADED · TIMED STORY MISSION RESTARTED');
 }catch(e){toast('SAVE FILE INVALID')}
}
