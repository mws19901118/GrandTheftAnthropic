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
   ['accent','> /mission '+String(stage+1).padStart(2,'0')+' --brief'],
   ['dim','Reading mission context...'],
   ['success','✓ City map loaded  ✓ Mission objectives synchronized'],
   ['accent','MISSION: '+title],
   ['normal',msg.replace(/^CLAUDE CODE:\s*/,'')],
   ['dim','Risk check: '+(stage===4?'Unknown bot swarm; attribution unverified.':stage===9?'Market volatility; protect compliance.':'Use your judgment. The board will not.')],
   ['accent','CLAUDE CODE: Dario, execute when ready.'],
   ['normal','DARIO: So this is what an AI agent means by “a quick task.”'],
   ['success','? Accept this assignment?']
  ];
  const palette={dim:'#81958b',accent:'#e9ae80',success:'#8fe1ad',normal:'#dce9df'};
  function add(entry){const el=document.createElement('div');el.style.margin='3px 0';el.style.color=palette[entry[0]];el.textContent=entry[1];log.appendChild(el);shell.scrollTop=shell.scrollHeight}
  function cleanup(){alive=false;terminal.remove();locked=false;document.removeEventListener('keydown',keyHandler,true)}
  function accept(){
   if(!alive)return;
   const list=storyMissionState.briefedStages||[];
   if(!list.includes(stage))list.push(stage);
   storyMissionState.briefedStages=list;
   cleanup();
   showDialog('DARIO','Assignment received. Time to turn this prompt into a very expensive road trip.');
   toast('CLAUDE CODE · NEW OBJECTIVE UNLOCKED');
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
