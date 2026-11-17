// Mandatory, physical HQ defense interlude between the OpenAI escape and DeepSeek.
// The attackers are an unidentified bot network. No named character is accused.
(function(){
 const targetIds=['anthropic','nvidia','openai','anthropic'];
 const prompts=[
  ['DARIO','Unknown bots are hammering our perimeter. Lock the core before they start selling our model weights.','ACTIVATE PERIMETER'],
  ['ALICE','My independent logistics records show a forged Blackwell diversion order. Jensen is on another call about his jacket.','VERIFY SHIPMENT MANIFEST'],
  ['SAM','Someone forged an AGI safety memo and signed my name. That is not even my preferred font.','TRACE THE FORGED MEMO'],
  ['DARIO','The perimeter is stable. Bring the authenticated logs home and shut the fake investor swarm out.','SEAL THE HQ CORE']
 ];
 function state(){return storyMissionState}
 function phase(){return state().hqDefensePhase||0}
 function active(){return running&&stage===4&&!state().hqDefenseDone}
 function siteForPhase(){return sites.find(s=>s.id===targetIds[phase()])}
 function finish(){
  state().hqDefenseDone=true;state().hqDefensePhase=4;
  const reward=450;cash+=reward;safety=Math.min(100,safety+9);hype=Math.min(100,hype+6);wanted=0;
  closeModal();showDialog('DARIO','HQ defended. The attackers remain anonymous. Alice secured the supply chain; Sam verified the forged memo. Now, DeepSeek.');
  toast('MAIN MISSION PASSED · HQ DEFENDED · +$'+reward);
 }
 function interactDefense(){
  const p=driving?car:player,site=siteForPhase();
  if(!site||!closeEntry(p,siteEntry(site))){toast('HQ DEFENSE · FOLLOW THE MISSION MARKER');return}
  const i=phase(),entry=prompts[i];
  modal('MAIN STORY · ANTHROPIC UNDER SIEGE',
   entry[0]+': '+entry[1]+'<br><br>OBJECTIVE '+(i+1)+'/4 · '+site.n,
   [{text:entry[2],fn:()=>{
    state().hqDefensePhase=i+1;
    closeModal();
    if(i===0){wanted=Math.max(wanted,1);toast('PERIMETER ONLINE · TRACE THE SUPPLY CHAIN')}
    if(i===1){gpu+=10;toast('BLACKWELL MANIFEST VERIFIED · +10 GPU')}
    if(i===2){wanted=Math.max(wanted,2);toast('FORGED MEMO TRACED · RETURN TO HQ')}
    if(i===3)finish();
   }},{text:'RETURN TO CITY',alt:true,fn:closeModal}]);
 }
 const originalInteract=interact;
 interact=function(){
  if(active()){interactDefense();return}
  return originalInteract();
 };
 window.hqDefenseTargetSite=function(){return active()?siteForPhase():null};
})();
