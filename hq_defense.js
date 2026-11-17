// Optional HQ defense; no campaign stage renumbering.
(function(){
 const rounds=[
  {who:'ALICE',q:'Fake investor demos are flooding the HQ network.',yes:'ISOLATE THE DEMO NETWORK',no:'LIVESTREAM THE INCIDENT',good:'The demos are quarantined. One tried to upsell its own firewall.',bad:'You turned a breach into a product launch.'},
  {who:'JENSEN',q:'Rivals are diverting the Blackwell shipment.',yes:'VERIFY THE GPU ALLOCATION',no:'SEND A SLIDE DECK',good:'The GPUs are safe. My jacket still has a higher insurance premium.',bad:'The attackers sent a deck too. Theirs had better margins.'},
  {who:'SAM',q:'A forged AGI safety memo is circulating.',yes:'PUBLISH VERIFIED FACTS',no:'DELETE THE LOGS AND BLAME THE BOARD',good:'An evidence-based response? You make sarcasm difficult.',bad:'That is a board meeting with extra steps.'}
 ];
 function play(){
  const state=storyMissionState,i=state.hqDefenseRound||0;
  if(i>=rounds.length){
   state.hqDefenseDone=true;
   const score=state.hqDefenseScore||0,reward=score===3?500:score===2?250:100;
   cash+=reward;hype=Math.min(100,hype+score*2);
   closeModal();showDialog('DARIO','HQ secured. The safety committee is furious we skipped the meeting.');
   toast('HQ DEFENDED · +$'+reward+' · '+score+'/3 SYSTEMS SECURED');return;
  }
  const r=rounds[i];
  function answer(good){
   if(good){state.hqDefenseScore=(state.hqDefenseScore||0)+1;safety=Math.min(100,safety+3)}
   else{cash=Math.max(0,cash-50);safety=Math.max(0,safety-5)}
   state.hqDefenseRound=i+1;
   modal('HQ DEFENSE · '+r.who,good?r.good:r.bad,[{text:'CONTINUE DEFENSE',fn:play},{text:'PAUSE DEFENSE',alt:true,fn:closeModal}]);
  }
  modal('ANTHROPIC HQ · UNDER SIEGE',r.who+': '+r.q+' · DEFENSE '+(i+1)+'/3',
   [{text:r.yes,fn:()=>answer(true)},{text:r.no,fn:()=>answer(false)},{text:'RETREAT · RESUME LATER',alt:true,fn:closeModal}]);
 }
 const originalInteract=interact;
 interact=function(){
  if(running&&!locked&&stage>=4&&stage<missions.length&&!storyMissionState.hqDefenseDone){
   const pos=driving?car:player;
   if(closeEntry(pos,siteEntry(sites[0]))){
    modal('ANTHROPIC HQ · UNDER SIEGE','ALICE: Dario, HQ is under attack. Jensen and Sam are on the emergency channel. Defend headquarters?',
     [{text:'DEFEND HQ',fn:play},{text:'NOT NOW',alt:true,fn:closeModal}]);return;
   }
  }
  return originalInteract();
 };
})();