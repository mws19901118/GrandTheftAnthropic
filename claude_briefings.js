// Chapter dispatch: Dario receives assignments from Claude Code at Anthropic HQ.
// Delivery/escape continuations stay uninterrupted; no campaign stages are renumbered.
(function(){
 const chapters=new Set([0,2,4,5,7,8,9]);
 const briefingNumber=()=>stage===4?(storyMissionState.hqDefenseDone?'03B':'03A'):(['01',null,'02',null,null,'04',null,'05','06','07'][stage]||'00');
 const briefingKey=()=>stage===4?(storyMissionState.hqDefenseDone?'4-deepseek':'4-defense'):String(stage);
 const briefing={
  0:['GPU PROCUREMENT','CLAUDE CODE: Dario, we need Blackwell GPUs. Meet Jensen at NVIDIA. Secure a Blackwell shipment and bring it back intact.'],
  2:['OPENAI INFILTRATION','CLAUDE CODE: The AGI definition file is inside Sam’s rooftop vault. Pass its prompt-injection, retrieval-integrity and tool-permission gates, then get out before the board changes its mind.'],
  4:['HQ UNDER SIEGE','CLAUDE CODE: An unidentified bot swarm is attacking our network. Defend the three firewall lanes for 45 seconds.'],
  5:['THE GROKFATHER','CLAUDE CODE: Reach xAI Colossus. Secure available compute capacity before the server launch window closes.'],
  7:['TPU APPROVAL','CLAUDE CODE: Sundar has TPU capacity, but the approval graph is a maze. Route the dependencies in the correct order at Gemini Tower.'],
  8:['META DISTRIBUTION','CLAUDE CODE: Meta has three Zucks and one real signature. Interview the doubles and verify the dealmaker before signing.'],
  9:['IPO LAUNCH','CLAUDE CODE: The market is ready to panic. Head to the exchange and survive three shocks without sacrificing liquidity, confidence or compliance.']
 };
 function pending(){return running&&stage<missions.length&&chapters.has(stage)&&!(storyMissionState.briefedStages||[]).map(String).includes(briefingKey())}
 function atHQ(){return closeEntry(driving?car:player,siteEntry(sites[0]))}
 function teleport(){const h=sites[0];driving=false;velocity={x:0,y:0};player={x:h.x+18,y:h.y+90};car={x:h.x+100,y:h.y+120,a:0};wanted=0;deadline=0;checkpoint=null}
 function dispatch(){
  const [title,msg]=stage===4&&storyMissionState.hqDefenseDone?['THE R1 GAMBIT','CLAUDE CODE: Proceed to DeepSeek Casino. Test model quality against compute and inference costs. Optimize the resource allocation before returning.']:briefing[stage];
  const key=briefingKey();
  const terminal=document.createElement('div');
  terminal.id='claude-code-terminal';
  terminal.style.cssText='position:fixed;inset:0;z-index:11000;display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box;background:rgba(2,6,13,.94);color:#d7e4da;font:14px/1.65 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
  const shell=document.createElement('div');
  shell.style.cssText='width:min(850px,100%);max-height:92vh;overflow:auto;background:#11171b;border:1px solid #46534c;border-radius:12px;box-shadow:0 25px 90px #000;padding:0';
  terminal.appendChild(shell);document.body.appendChild(terminal);
  locked=true;
  const top=document.createElement('div');
  top.style.cssText='display:flex;align-items:center;gap:8px;padding:12px 16px;border-bottom:1px solid #334039;background:#1b2428;color:#a6b6ad';
  top.innerHTML='<span style="color:#fa756d">●</span><span style="color:#f4c765">●</span><span style="color:#70c995">●</span><span style="margin-left:14px">dario@anthropic: ~/ipo-heist</span><span style="margin-left:auto;font-size:11px">LOCAL SIMULATION</span>';
  shell.appendChild(top);
  const log=document.createElement('div');log.style.cssText='padding:20px 24px;white-space:pre-wrap;overflow-wrap:anywhere;min-height:300px';shell.appendChild(log);
  const controls=document.createElement('div');controls.style.cssText='padding:12px 20px 20px;display:flex;gap:9px;flex-wrap:wrap;border-top:1px solid #334039';shell.appendChild(controls);
  let alive=true,step=0;
  const entries=[
   ['dim','$ claude'],
   ['accent','✳ Claude Code'],
   ['dim','Working directory: /anthropic/ipo-heist'],
   ['dim','Session: dario · local mission briefing'],
   ['accent','> /mission '+briefingNumber()+' --brief'],
   ['dim','Reading mission context...'],
   ['success','✓ City map loaded  ✓ Mission objectives synchronized'],
   ['accent','CHAPTER '+briefingNumber()+' · '+title],
   ['normal',msg.replace(/^CLAUDE CODE:\s*/,'')],
   ['dim','Risk check: '+(stage===4&&!storyMissionState.hqDefenseDone?'Unknown bot swarm; attribution unverified.':stage===9?'Market volatility; protect compliance.':'Use your judgment. The board will not.')],
   ['accent','CLAUDE CODE: Dario, execute when ready.'],
   ['success','? Accept this assignment?']
  ];
  const palette={dim:'#81958b',accent:'#e9ae80',success:'#8fe1ad',normal:'#dce9df'};
  function add(entry){const el=document.createElement('div');el.style.margin='3px 0';el.style.color=palette[entry[0]];el.textContent=entry[1];log.appendChild(el);shell.scrollTop=shell.scrollHeight}
  function cleanup(){alive=false;terminal.remove();locked=false;document.removeEventListener('keydown',keyHandler,true)}
  function accept(){
   if(!alive)return;
   const list=storyMissionState.briefedStages||[];
   if(!list.map(String).includes(key))list.push(key);
   storyMissionState.briefedStages=list;
   cleanup();
   if(key==='4-defense'&&typeof window.launchHQDefense==='function'){
    window.launchHQDefense();
   }else toast('CLAUDE CODE · NEW OBJECTIVE UNLOCKED');
  }
  function later(){if(alive){cleanup();toast('BRIEFING PAUSED · PRESS E TO REOPEN')}}
  function button(label,fn){const el=document.createElement('button');el.textContent=label;el.style.cssText='padding:10px 15px;background:#293c33;color:#c8f5d4;border:1px solid #598b6d;border-radius:6px;font:inherit;cursor:pointer';el.onclick=fn;controls.appendChild(el)}
  function ready(){if(!alive)return;controls.replaceChildren();button('❯ ACCEPT MISSION  [ENTER]',accept);button('REVIEW LATER  [ESC]',later)}
  function revealAll(){while(step<entries.length)add(entries[step++]);ready()}
  function keyHandler(e){if(!alive)return;if(['Enter','Escape',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape')later();else if(step<entries.length)revealAll();else accept()}}
  document.addEventListener('keydown',keyHandler,true);
  button('SKIP OUTPUT',revealAll);
  function typeNext(){if(!alive)return;if(step<entries.length){add(entries[step++]);if(step===entries.length)ready();else setTimeout(typeNext,step<5?110:220)}}
  typeNext();
 }
 // Defense and DeepSeek share stage 4: completing the defense opens a second HQ briefing.
  const baseInteract=interact;
 interact=function(){
  if(pending()){
   // Side activities must remain playable while a main-story briefing is pending.
   // Keep property purchases, asset checkpoints, freelance deliveries and vehicle controls available.
   const pos=driving?car:player;
   if(gigRun&&gigTarget()&&closeEntry(pos,siteEntry(gigTarget()))){finishGig();return}
   if(assetRun&&assetInteract())return;
   const property=propertyDefs.find(d=>closeEntry(pos,propertyEntry(d)));
   if(property){propertyMenu(property);return}
   if(atHQ()){dispatch();return}
   if(driving){driving=false;velocity={x:0,y:0};player.x=car.x+45;player.y=car.y+22;toast('EXIT VEHICLE');return}
   if(Math.hypot(player.x-car.x,player.y-car.y)<95){driving=true;velocity={x:0,y:0};toast('VEHICLE ENTERED');return}
   const target=sites[missions[stage].site];
   if(closeEntry(pos,siteEntry(target))){toast('MAIN STORY LOCKED · GET YOUR CLAUDE CODE BRIEFING AT HQ');return}
   toast('MAIN STORY: HQ BRIEFING PENDING · SIDE ACTIVITIES AVAILABLE');
   return;
  }
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
