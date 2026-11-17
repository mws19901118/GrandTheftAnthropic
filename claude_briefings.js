// Chapter dispatch: Dario receives assignments from Claude Code at Anthropic HQ.
// Delivery/escape continuations stay uninterrupted; no campaign stages are renumbered.
(function(){
 const chapters=new Set([0,2,4,5,7,8,9]);
 const briefing={
  0:['GPU PROCUREMENT','CLAUDE CODE: Dario, we need Blackwell GPUs. Meet Jensen at NVIDIA. Alice controls her own commercial terms. Bring the shipment back intact.'],
  2:['OPENAI INFILTRATION','CLAUDE CODE: The AGI definition file is inside Sam’s rooftop vault. Memorize its changing access signals and get out before the board changes its mind.'],
  4:['HQ UNDER SIEGE','CLAUDE CODE: Anonymous investor bots are attacking our network. Defend the three firewall lanes for 45 seconds. Do not accuse Alice, Sam or Jensen without evidence.'],
  5:['THE R1 GAMBIT','CLAUDE CODE: Liang says our model is expensive. Go to DeepSeek Casino and beat his efficiency benchmark with a limited compute budget.'],
  7:['TPU APPROVAL','CLAUDE CODE: Sundar has TPU capacity, but the approval graph is a maze. Route the dependencies in the correct order at Gemini Tower.'],
  8:['META DISTRIBUTION','CLAUDE CODE: Meta has three Zucks and one real signature. Interview the doubles and verify the dealmaker before signing.'],
  9:['IPO LAUNCH','CLAUDE CODE: The market is ready to panic. Head to the exchange and survive three shocks without sacrificing liquidity, confidence or compliance.']
 };
 function pending(){return running&&stage<missions.length&&chapters.has(stage)&&!(storyMissionState.briefedStages||[]).includes(stage)}
 function atHQ(){return closeEntry(driving?car:player,siteEntry(sites[0]))}
 function teleport(){const h=sites[0];driving=false;velocity={x:0,y:0};player={x:h.x+18,y:h.y+90};car={x:h.x+100,y:h.y+120,a:0};wanted=0;deadline=0;checkpoint=null}
 function dispatch(){
  const [title,msg]=briefing[stage];
  modal('CLAUDE CODE · '+title,msg+'<br><br>DARIO: So this is what an AI agent means by “a quick task.”',[
   {text:'ACCEPT ASSIGNMENT',fn:()=>{const list=storyMissionState.briefedStages||[];if(!list.includes(stage))list.push(stage);storyMissionState.briefedStages=list;closeModal();showDialog('DARIO','Assignment received. Time to turn this prompt into a very expensive road trip.');toast('CLAUDE CODE · NEW OBJECTIVE UNLOCKED')}},
   {text:'REVIEW LATER',alt:true,fn:closeModal}
  ]);
 }
 const baseInteract=interact;
 interact=function(){
  if(pending()){if(atHQ())dispatch();else toast('RETURN TO ANTHROPIC HQ · GET YOUR CLAUDE CODE BRIEFING');return}
  return baseInteract();
 };
 const baseAdvance=advance;
 advance=function(){
  const previous=stage;baseAdvance();
  if(stage!==previous&&stage<missions.length&&chapters.has(stage)){teleport();toast('RETURNED TO ANTHROPIC HQ · PRESS E FOR CLAUDE CODE BRIEFING')}
 };
 const baseStart=start;
 start=function(){baseStart();teleport();toast('ANTHROPIC HQ · PRESS E FOR CLAUDE CODE BRIEFING')};
 const baseRetry=retryMission;
 retryMission=function(){baseRetry();if(pending())teleport()};
 const baseGoal=storyGoal;
 storyGoal=function(m){if(pending())return 'At Anthropic HQ, press E to receive your next assignment from Claude Code.';return baseGoal(m)};
 const baseTarget=window.hqDefenseTargetSite;
 window.hqDefenseTargetSite=function(){if(pending())return sites[0];return baseTarget?baseTarget():null};
})();
