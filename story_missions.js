// First two chapters: narrative encounters and mechanics, independent from renderer.
// Public figures are fictional satirical characters; no allegation of real wrongdoing.
function freshStoryState(){return {deal:'',terminal:0,attempts:0,security:0,heistDone:false,escapeStart:0,loadingUntil:0,loadingStart:0}}
let storyMissionState=freshStoryState();
const TERMINAL_STEPS=[
 {question:'SECURITY TERMINAL 1/3 · Which document is the target?',options:['AGI Definition v17 FINAL FINAL.pdf','quarterly_board_minutes.txt','launch_party_guestlist.csv'],correct:0},
 {question:'SECURITY TERMINAL 2/3 · The board voted Sam out. What happened next?',options:['The board became a GPU','Sam was reinstated','The company moved to Mars'],correct:1},
 {question:'SECURITY TERMINAL 3/3 · The vault requires a final passphrase.',options:['MOVE FAST AND BREAK SAFETY','PLEASE SEE ATTACHED APPENDIX','CUDA IS FREE'],correct:1}
];
function resetStoryMission(n){if(n===0){storyMissionState=freshStoryState()}if(n===1){storyMissionState.deal=storyMissionState.deal||'auction';cargoIntegrity=100;rivalVans=[]}if(n===2){storyMissionState.terminal=0;storyMissionState.attempts=0;storyMissionState.security=0;storyMissionState.heistDone=false}if(n===3){storyMissionState.escapeStart=0}}
function onStoryAdvance(n){if(n===0){cargoIntegrity=100;rivalVans=[];showDialog('ALICE','Invoice paid. The Blackwell shipment is yours. The competitors have other plans.')}if(n===1){rivalVans=[];cargoIntegrity=100;wanted=0}if(n===2){storyMissionState.heistDone=true;wanted=3;showDialog('SAM','You found the file. The board has voted to schedule another board vote.')}if(n===3){wanted=0;storyMissionState=freshStoryState();storyMissionState.hqDefenseDone=false;storyMissionState.hqDefensePhase=0}}
function storyGoal(m){if(stage===0)return storyMissionState.loadingUntil?'Blackwell shipment loading at the NVIDIA depot. Hold position until dispatch.':'Meet Jensen at the NVIDIA depot. Negotiate for the Blackwell shipment.';if(stage===1)return 'Drive the shipment home. Rival vans are chasing you; protect the cargo ('+cargoIntegrity+'%).';if(stage===2)return 'Reach the OpenAI rooftop club and crack three absurd security terminals.';if(stage===3)return 'Escape the boardroom chaos and reach Anthropic HQ before time runs out.';if(stage===4&&!storyMissionState.hqDefenseDone){const phase=storyMissionState.hqDefensePhase||0;return ['MANDATORY: Return to Anthropic HQ and activate the perimeter defense.','HQ UNDER SIEGE: Reach NVIDIA to verify the Blackwell shipment.','HQ UNDER SIEGE: Reach OpenAI to trace the forged memo.','HQ UNDER SIEGE: Return to Anthropic HQ to secure the core.'][phase]}return m.goal}
function handleStoryInteraction(){
 if(stage===0){
  if(storyMissionState.loadingUntil){toast('BLACKWELL LOADING IN PROGRESS');return true}
  modal('THE <span>LEATHER JACKET TAX</span>','Jensen: “Everyone wants Blackwell. Everyone gets an invoice.”<br>Alice: “The auction is closing. Choose your procurement strategy.”<br><br>Your current cash: $'+cash+'.',[
   {text:'PAY THE $250 LEATHER JACKET TAX',fn:()=>{if(cash<250){toast('INSUFFICIENT CASH');return}storyMissionState.deal='auction';closeModal();beginBlackwellLoading()}},
   {text:'NEGOTIATE A SAFETY DISCOUNT · $150',fn:()=>{if(cash<150){toast('INSUFFICIENT CASH');return}storyMissionState.deal='discount';cash+=100;safety=Math.min(100,safety+4);hype=Math.max(0,hype-5);closeModal();beginBlackwellLoading()}},
   {text:'WALK AWAY',alt:true,fn:closeModal}
  ]);return true;
 }
 if(stage===1){
  if(!driving){toast('GET IN THE CAR TO DELIVER THE GPUs');return true}
  if(cargoIntegrity<=0){fail();return true}
  const earned=Math.round(700*cargoIntegrity/100);cash+=earned-700;
  gpu-=Math.round((100-cargoIntegrity)*.45);
  showDialog('DARIO','Shipment secured at '+cargoIntegrity+'% integrity. The board will call this “responsible logistics.”');
  advance();return true;
 }
 if(stage===2){openTerminal();return true}
 if(stage===3){if(!storyMissionState.heistDone){toast('GET THE FILE FIRST');return true}advance();return true}
 return false;
}
// v2.0 loading sequence: the mission only advances after the dispatch scene.
// Keeping this state in story_missions.js prevents the renderer from owning
// progression or changing the campaign's save format.
function beginBlackwellLoading(){
 const now=performance.now();
 storyMissionState.loadingStart=now;
 storyMissionState.loadingUntil=now+1500;
 showDialog('ALICE','Payment confirmed. Loading Blackwell crates now. Stay clear of the forklift.');
 toast('NVIDIA LOADING BAY · BLACKWELL DISPATCH');
}
function blackwellLoadingProgress(t){
 if(stage!==0||!storyMissionState.loadingUntil)return -1;
 return Math.max(0,Math.min(1,(t-storyMissionState.loadingStart)/1500));
}
function openTerminal(){const i=storyMissionState.terminal;if(i>=TERMINAL_STEPS.length){closeModal();advance();return}const step=TERMINAL_STEPS[i];modal('THE <span>EX-OPENAI FILES</span>',step.question+'<br><br>Terminal '+(i+1)+' of '+TERMINAL_STEPS.length+' · Security alerts: '+storyMissionState.security,step.options.map((o,j)=>({text:o,fn:()=>{
 if(j===step.correct){storyMissionState.terminal++;if(storyMissionState.terminal===TERMINAL_STEPS.length){closeModal();advance()}else openTerminal()}
 else{storyMissionState.attempts++;storyMissionState.security++;wanted=Math.max(wanted,Math.min(4,storyMissionState.security));cash=Math.max(0,cash-35);toast('WRONG ANSWER · -$35 LEGAL FEES');if(storyMissionState.security>=3){closeModal();fail()}else openTerminal()}
 }})).concat([{text:'LEAVE TERMINAL',alt:true,fn:closeModal}]));}
function updateStoryMission(dt,t){if(!running||locked)return;if(stage===0&&storyMissionState.loadingUntil&&t>=storyMissionState.loadingUntil){storyMissionState.loadingUntil=0;storyMissionState.loadingStart=0;advance();return;}if(stage===1&&carrying){if(!driving&&rivalVans.length)toastStoryOnce('GET BACK IN YOUR CAR · THE SHIPMENT IS EXPOSED');if(cargoIntegrity<=0){fail();return}}if(stage===3&&wanted<2)wanted=2}
let storyOnce=false;function toastStoryOnce(msg){if(storyOnce)return;storyOnce=true;toast(msg)}
function drawStoryWorld(t){/* Reserved for future story-only world markers. */}
function drawStoryHud(t){const c=document.querySelector('#story-status');if(!c)return;if(!running||stage>3){c.style.display='none';return;}if(stage===1){c.style.display='block';c.textContent='BLACKWELL CARGO  '+cargoIntegrity+'%  ·  '+(rivalVans.length?'RIVALS IN PURSUIT':'PREPARE FOR PURSUIT')}else if(stage===2){c.style.display='block';c.textContent='VAULT TERMINALS  '+storyMissionState.terminal+'/3  ·  ALERTS '+storyMissionState.security+'/3'}else if(stage===3){c.style.display='block';c.textContent='BOARDROOM ESCAPE  ·  WANTED '+wanted+' STARS'}else if(stage===0&&storyMissionState.loadingUntil){c.style.display='block';c.textContent='BLACKWELL LOADING  '+Math.round(blackwellLoadingProgress(t)*100)+'%  ·  DISPATCH PENDING'}else c.style.display='none'}
