// Cinematic dialogue layer for story encounters; wraps existing choices without changing mission logic.
(() => {
 'use strict';
 const baseModal=modal;
 const cast={
  JENSEN:['#9bdf55','#273e29','J'],ALICE:['#f4b16b','#5b3940','A'],
  DARIO:['#edab87','#553f4c','D'],SAM:['#7de6cf','#304f60','S'],
  LIANG:['#6ed7ff','#29465b','L'],ELON:['#b3a5ff','#34335b','E'],
  SUNDAR:['#ffcc6f','#3c5674','S'],ZUCK:['#83b7ff','#364969','Z'],
  'THE MARKET':['#ff89c4','#55304d','$']
 };
 const scenes=[
  [['DARIO','I need Blackwell chips, Jensen. Not a keynote and not a waitlist.'],
   ['JENSEN','Everybody wants Blackwell. You want priority? Convince the allocation desk.'],
   ['ALICE','The allocation desk is a company, Jensen. I have my own clients, my own contracts, and my own reasons to be here.'],
   ['DARIO','Alice Huang. The Megaspeed dealmaker. I expected a price sheet, not a complicated relationship chart.'],
   ['JENSEN','We are discussing compute. Not my personal life.'],
   ['ALICE','Then stop treating a personal promise like a purchase order. Dario needs documented terms, not a whispered favor.'],
   ['DARIO','For once, the safety guy is asking for paperwork and the GPU guy wants discretion. Beautiful.'],
   ['JENSEN','The chips are real. The invoices are real. Can we please keep this meeting about those two things?'],
   ['ALICE','Then choose a route, Dario. Full-price priority or a slower, auditable safety discount. My business does not run on heart-shaped stamps.']],
  [['DARIO','The cargo survived the road. The compliance report may not.']],
  [['DARIO','Nice rooftop, Sam. Did the board approve the view, or just your latest attempt to lock up the future?'],['SAM','Dario. I thought you were busy selling safety as a competitive advantage.'],['DARIO','And I thought you were busy calling a closed vault open progress. Hand over the AGI file.'],['SAM','You want my research and my compute? Try earning access instead of giving another speech about principles.'],['DARIO','Fine. Show me the terminal. Let us see whether your security is as strong as your press releases.'],['SAM','One wrong answer and Legal gets a new yacht. Your move.']],
  [['SAM','The board is voting again. Unlike your safety committee, ours occasionally lets us ship something.']],
  [['LIANG','You brought a warehouse. I brought a spreadsheet.'],['DARIO','Fine. Let us compare quality per dollar.']],
  [['ELON','My compute is going to Mars. The route is trending.'],['DARIO','Can we keep the servers on Earth for one more quarter?']],
  [['DARIO','The rocket needs a CAPTCHA. Of course it does.']],
  [['SUNDAR','We can absolutely approve your TPU access.'],['DARIO','Great. How many committees?'],['SUNDAR','Yes.']],
  [['ZUCK','Open weights. Closed ecosystem. Very fashionable glasses.'],['DARIO','Which one of you is the real Zuck?']],
  [['THE MARKET','NEW MODEL! NEW BENCHMARK! NEW SELL ORDER!'],['DARIO','Time to defend our numbers in front of Wall Street.']]
 ];
 const speakerByStage=['JENSEN','DARIO','SAM','SAM','LIANG','ELON','DARIO','SUNDAR','ZUCK','THE MARKET'];
 const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function portrait(name){
  const [accent,coat]=cast[name]||cast.DARIO;
  const glasses=['DARIO','JENSEN','LIANG','SUNDAR'].includes(name);
  const skin=name==='SUNDAR'?'#ae765c':['JENSEN','LIANG','ALICE'].includes(name)?'#d3a07c':'#e0a98a';
  const hair=name==='ALICE'?'M55 116 Q31 8 103 12 Q173 8 151 125 L168 192 L143 188 L137 93 Q102 49 66 94 L58 190 L36 191Z':
   name==='ZUCK'?'M58 92 Q35 32 71 27 Q89 6 105 29 Q130 8 146 50 Q158 82 137 96 L131 57 Q97 76 67 62Z':
   name==='JENSEN'?'M57 96 Q42 40 86 33 Q128 19 145 64 L135 92 L130 55 Q100 67 67 58Z':
   'M59 94 Q38 30 81 23 Q119 12 145 55 L135 95 L128 54 Q95 67 66 58Z';
  const jacket=['JENSEN','ELON','ALICE'].includes(name)?'#151b27':coat;
  const eyewear=glasses?'<path d="M71 99 h27 v18 h-27z M107 99 h27 v18 h-27z M98 106 h9" stroke="#151b27" stroke-width="3" fill="#8ed6ff22"/>':'';
  const accessory=name==='ALICE'?'<circle cx="63" cy="120" r="6" fill="none" stroke="#ffd17c" stroke-width="3"/><circle cx="140" cy="120" r="6" fill="none" stroke="#ffd17c" stroke-width="3"/>':
   name==='ZUCK'?'<path d="M73 102 h27 M108 102 h27" stroke="#111" stroke-width="8"/>':
   name==='SUNDAR'||name==='ELON'?'<path d="M81 139 Q102 156 122 139" stroke="#68463e" stroke-width="5" fill="none"/>':'';
  return '<svg class="cin-bust" viewBox="0 0 200 245" role="img" aria-label="'+safe(name)+' portrait">'+
   '<path d="M6 245 Q15 163 74 153 L128 153 Q183 168 194 245Z" fill="'+jacket+'" stroke="'+accent+'" stroke-width="3"/>'+
   '<path d="M86 145 L82 165 L102 195 L120 163 L114 144Z" fill="'+skin+'"/>'+
   '<path d="M64 77 Q67 35 102 36 Q139 35 141 82 L135 131 Q120 159 101 160 Q80 155 66 131Z" fill="'+skin+'" stroke="#5d3c35" stroke-width="2"/>'+
   '<path d="'+hair+'" fill="'+(name==='JENSEN'?'#44474c':name==='ZUCK'?'#65453a':'#242632')+'"/>'+
   '<path d="M78 97 L94 98 M109 98 L125 97" stroke="#352a2a" stroke-width="3"/>'+
   '<path d="M87 132 Q103 139 116 132" stroke="#8d574b" stroke-width="2" fill="none"/>'+
   eyewear+accessory+
   '<path d="M72 159 L102 197 L86 213 L58 169 M129 159 L102 197 L118 213 L149 171" fill="none" stroke="'+accent+'" stroke-width="3"/>'+
   '</svg>';
 }
 function isStory(title){
  if(!running||stage>=missions.length)return false;
  return /LEATHER JACKET TAX|EX-OPENAI FILES|THE R1 GAMBIT|FORM 17-B|FIND ZUCK|THE MARKET|THE GROKFATHER/.test(title);
 }
 let session=0;
 let lastSceneStage=-1;
 function show(title,body,buttons,customScript){
  const token=++session, panel=document.querySelector('#panel'),overlay=document.querySelector('#modal');
  locked=true;overlay.style.display='grid';
  panel.classList.add('cinematic-panel','cinematic-scene');
  panel.replaceChildren();
  const background=document.createElement('div');background.className='scene-backdrop scene-'+stage;
  const heading=document.createElement('div');heading.className='scene-title';heading.textContent=title.replace(/<[^>]*>/g,'');
  const actors=document.createElement('div');actors.className='scene-actors';
  const box=document.createElement('div');box.className='scene-caption';
  const nameTag=document.createElement('strong');nameTag.className='scene-speaker';
  const dialogue=document.createElement('p');dialogue.className='scene-line';
  const hint=document.createElement('div');hint.className='scene-hint';
  const choices=document.createElement('div');choices.className='scene-choices';
  box.append(nameTag,dialogue,hint,choices);panel.append(background,heading,actors,box);
  const base=scenes[stage]||[];
  const script=customScript||(lastSceneStage===stage?[[speakerByStage[stage],missions[stage].line]]:(base.length?base:[[speakerByStage[stage],missions[stage].line]]));
  if(!customScript)lastSceneStage=stage;
  const artFiles={DARIO:'dario',JENSEN:'jensen',ALICE:'alice',SAM:'sam',LIANG:'liang',ELON:'elon',SUNDAR:'sundar',ZUCK:'zuck','THE MARKET':'the_market'};
  // Scene-appropriate resting pose. The active speaker may use a gesture pose.
  // Only clean, production-ready files are eligible; *_reference.webp is never loaded.
  // Until each background has authored seating positions, never spawn a chair as part of a character sprite.
  const restPose='stand';
  // Stable blocking per location: never reassign left/right slots between dialogue beats.
  const fixedCast={0:['DARIO','JENSEN','ALICE'],2:['DARIO','SAM'],3:['DARIO','SAM']};
  const participants=(fixedCast[stage]||[...new Set(script.map(v=>v[0]).concat(['DARIO']))]).slice(0,3);
  const actorImages=new Map();
  for(const who of participants){
   const actor=document.createElement('div');actor.className='scene-actor';actor.dataset.who=who;
   const slug=artFiles[who];
   if(slug){
    const img=document.createElement('img');img.className='scene-character-art';
    img.alt=who+' illustrated character';img.decoding='async';
    actor.append(img);actorImages.set(who,{img,slug,pose:'',request:0});
   }else actor.innerHTML=portrait(who);
   actors.append(actor);
  }
  function setPose(who,pose){
   const entry=actorImages.get(who);
   if(!entry||entry.pose===pose)return;
   entry.pose=pose;
   const request=++entry.request;
   const root='assets/cutscenes/characters/'+entry.slug;
   // Production pose WebP -> optional PNG pose -> original working portrait.
   // Prefer uploaded raster artwork for every character, including Jensen; SVG is a last resort.
   const candidates=pose==='stand'?[root+'_stand.webp',root+'.png']:[root+'_'+pose+'.webp',root+'_'+pose+'.png',root+'_stand.webp',root+'.png'];
   let next=0;
   function tryNext(){
    if(request!==entry.request)return;
    if(next>=candidates.length){entry.img.remove();entry.img=null;const actor=[...actors.children].find(a=>a.dataset.who===who);if(actor)actor.innerHTML=portrait(who);actorImages.delete(who);return}
    entry.img.src=candidates[next++];
   }
   entry.img.onerror=tryNext;
   tryNext();
  }
  for(const who of participants)setPose(who,restPose);
  let index=0,advance=null,buttonsShown=[],selected=0;
  function speak(who,msg){
   nameTag.textContent=who;dialogue.textContent=msg;
   const castOnStage=[...actors.children];
   for(let i=0;i<castOnStage.length;i++){
    const actor=castOnStage[i],active=actor.dataset.who===who;
    actor.classList.toggle('speaking',active);
    // Lock eyelines to the set: no mid-conversation mirroring or position jumps.
    actor.classList.toggle('facing-left',i===castOnStage.length-1);
    setPose(actor.dataset.who,restPose);
   }
  }

  // Option-specific banter. This is presentation-only: mission callbacks still own all outcomes.
  const choiceBanter={
   poker:{
    right:["LIANG","Correct. Turns out optimization is cheaper than buying another warehouse of GPUs."],
    wrong:[
     ["LIANG","That answer costs more than the training run. Impressive inefficiency."],
     ["LIANG","Wall Street loves confidence. My spreadsheet prefers arithmetic."],
     ["LIANG","You have successfully benchmarked the wrong answer at record speed."]
    ]
   },
   approval:{
    right:["SUNDAR","Approved. Please allow six to eight business quarters for the approval to become emotionally available."],
    wrong:[
     ["SUNDAR","Interesting. I will forward that to the committee that decides which committee should reject it."],
     ["SUNDAR","Our process is very efficient. Every rejection is automatically copied to seventeen teams."],
     ["SUNDAR","That answer has been placed on a waitlist for the waitlist."]
    ]
   },
   zuck:{
    right:["ZUCK","You found the real me. The other versions are still A/B testing eye contact."],
    wrong:[
     ["ZUCK","Wrong Zuck. That one is a fine-tuned model with better social skills."],
     ["ZUCK","That is my digital twin. He has already accepted your friend request."],
     ["ZUCK","Close. You have identified the version that actually reads the privacy policy."]
    ]
   },
   market:{
    right:["THE MARKET","CORRECT! THE ANALYSTS ARE CONFUSED, WHICH COUNTS AS A BEAT!"],
    wrong:[
     ["THE MARKET","WRONG! YOUR STOCK HAS BEEN DOWNGRADED TO 'INTERESTING THREAD'!"],
     ["THE MARKET","THE STREET DISAGREES! PLEASE INSERT ANOTHER QUARTER!"],
     ["THE MARKET","BAD ANSWER! THE VOLATILITY IS NOW SENTIENT!"]
    ]
   },
   grok:{
    right:["ELON","Correct. The launch window is still open. I checked between posts."],
    wrong:[
     ["ELON","Wrong. The rocket has been renamed and the launch date is now a meme."],
     ["ELON","That answer has been fact-checked by a poll with twelve voters."],
     ["ELON","Mission control says no. The group chat says absolutely yes."]
    ]
   }
  };
  const stageBanter={
   0:["JENSEN","That is a bold negotiating position. Unfortunately, my GPU allocation spreadsheet has no sense of humor."],
   1:["ALICE","Noted. The compliance team is already drafting a strongly worded emoji."],
   2:["SAM","Cute answer, Dario. Did your safety committee approve the punchline?"],
   3:["SAM","You can argue with the board after you escape the boardroom."],
   4:["LIANG","Interesting theory. Let us see if it survives contact with the benchmark."],
   5:["ELON","I would respond, but I just announced a different mission on my feed."],
   6:["DARIO","Great. Another countdown with an optional existential crisis."],
   7:["SUNDAR","I have opened a ticket to discuss your answer at our next ticket-opening meeting."],
   8:["ZUCK","That response has been recorded by your glasses. And by mine."],
   9:["THE MARKET","THE MARKET HAS HEARD YOU. THE MARKET REMAINS IRRATIONALLY EXCITED."]
  };
  // Responses track the actual mission option, not just the button position.
  // A correct answer to one quiz round is not the same as clearing the mission.
  const quizReactions={
   poker:[
    {right:["LIANG","Good. A smaller model that actually works beats a giant model that invoices you."],wrong:["LIANG","More debt is not an optimization algorithm. Neither is deleting the benchmark."]},
    {right:["LIANG","Caching. The cheapest token is the one you do not generate twice."],wrong:["LIANG","That is a beautiful way to make every request more expensive."]},
    {right:["LIANG","Held-out quality per dollar. Finally, a chart with two meaningful axes."],wrong:["LIANG","That is marketing, not evidence. The casino at least tells you the odds."]}
   ],
   approval:[
    {right:["SUNDAR","Correct. You have identified the committee. You have not yet received approval."],wrong:["SUNDAR","Neither a cafeteria robot nor a leaderboard has signing authority. Yet."]},
    {right:["SUNDAR","A documented risk assessment. Good. Form 17-C is now eligible to be reviewed."],wrong:["SUNDAR","A dancing logo is not a risk assessment. It is, however, a possible launch event."]},
    {right:["SUNDAR","Owner, limits, rollback plan. The audit is satisfied. I can finally say approved."],wrong:["SUNDAR","The auditors need a rollback plan, not a slogan or an empty folder."]}
   ],
   zuck:[
    {right:["ZUCK","A real distribution agreement. You found the version of me that can sign things."],wrong:["ZUCK","That one is a demo avatar. Great eye contact; absolutely no signing authority."]},
    {right:["ZUCK","Consent and data minimization. Fine. The glasses will have to ask before remembering your lunch."],wrong:["ZUCK","No. Even in a satire, unlimited silent collection is a terrible contract."]},
    {right:["ZUCK","License and evaluation checked. Now we can argue about what open actually means."],wrong:["ZUCK","Jacket color and headset counts do not tell you whether you can ship the model."]}
   ],
   market:[
    {right:["THE MARKET","REPRODUCIBLE RESULTS! ANALYSTS HATE THAT THEY CAN CHECK THE MATH!"],wrong:["THE MARKET","A FAKE LEADERBOARD IS NOT AN EARNINGS STRATEGY!"]},
    {right:["THE MARKET","UNIT ECONOMICS! THE MARKET HAS DISCOVERED DIVISION!"],wrong:["THE MARKET","YOU CANNOT HIDE INVOICES FROM A CASH-FLOW STATEMENT!"]},
    {right:["THE MARKET","EVALUATIONS! MITIGATIONS! GOVERNANCE! THE UNDERWRITERS CAN EXHALE!"],wrong:["THE MARKET","REMOVING THE SAFETY TEAM IS NOT A SAFETY DISCLOSURE!"]}
   ],
   grok:[
    {right:["ELON","Fine. Ground-based compute with a backup. The rocket team is disappointed."],wrong:["ELON","No. A meme account cannot certify orbital server racks. I checked."]},
    {right:["ELON","Verified dispatch route. Boring, reliable, annoyingly correct."],wrong:["ELON","A viral post is not a navigation system. The server racks would end up in a podcast studio."]}
   ],
   terminal:[
    {right:["SAM","You found the AGI definition. Do not get excited; the appendix is longer than the document."],wrong:["SAM","That is not the AGI file. You have just paid thirty-five dollars to open the wrong folder."]},
    {right:["SAM","Correct. I was reinstated. Corporate governance: the reboot nobody asked for."],wrong:["SAM","No. The board did not become a GPU or move to Mars. That would have been simpler."]},
    {right:["SAM","You cracked the passphrase. I cannot believe the appendix joke was the actual password."],wrong:["SAM","Wrong passphrase. The vault is now billing you for an unauthorized metaphor."]}
   ]
  };
  function quizContext(option,choiceIndex){
   const kind=missions[stage]&&missions[stage].kind;
   const quizKind=stage===5?'grok':kind;
   if(quizReactions[quizKind]&&typeof MISSION_ROUNDS!=='undefined'&&MISSION_ROUNDS[quizKind]){
    const index=typeof missionQuiz!=='undefined'?missionQuiz.round:0;
    const round=MISSION_ROUNDS[quizKind][index];
    if(round&&round.options&&round.options[choiceIndex]===option.text)
     return {kind:quizKind,index,correct:choiceIndex===round.correct,last:index===MISSION_ROUNDS[quizKind].length-1};
   }
   if(stage===2&&typeof TERMINAL_STEPS!=='undefined'&&typeof storyMissionState!=='undefined'){
    const index=storyMissionState.terminal;
    const round=TERMINAL_STEPS[index];
    if(round&&round.options&&round.options[choiceIndex]===option.text)
     return {kind:'terminal',index,correct:choiceIndex===round.correct,last:index===TERMINAL_STEPS.length-1};
   }
   return null;
  }
  function replyFor(option,choiceIndex,choiceCount){
   const context=quizContext(option,choiceIndex);
   if(context){
    const {kind,index,correct,last}=context;
    const line=quizReactions[kind][index][correct?'right':'wrong'];
    if(!correct){
     const fee=kind==='terminal'?35:kind==='market'?75:kind==='poker'?50:25;
     return [line,["DARIO","That mistake just cost us $"+fee+". The lesson was apparently not included in the tuition."]];
    }
    if(last)return [line,["DARIO",kind==='terminal'?"File acquired. Now comes the part where we run.":"That was the final check. Let us see if the mission agrees."]];
    return [line,["DARIO","One checkpoint down. What is next?"]];
   }
   if(stage===0){
    if(choiceIndex===0)return [["JENSEN","Full price. Priority allocation. Finally, a transaction I can explain in one sentence."],["ALICE","And I will put the actual terms in writing. No private promises disguised as supply contracts."]];
    if(choiceIndex===1)return [["JENSEN","A safety discount? Fine. But the GPUs do not get to take a safety day."],["ALICE","One hundred dollars saved, fewer headlines, a cleaner paper trail. I negotiate deals, not alibis."]];
   }
   const stageLines={
    1:[["ALICE","Please deliver the crates intact. 'GPU confetti' is not an accepted inventory status."]],
    3:[["SAM","I would escort you out, but the board is voting on whether doors are a governance issue."]],
    5:[["ELON","The servers are staying on Earth. I am announcing a Mars version anyway."]],
    6:[["DARIO","The rocket may be delayed, but our liability exposure is right on schedule."]]
   };
   if(stageLines[stage])return stageLines[stage];
   if(choiceCount<=1)return [];
   return [["DARIO","That is a choice. The incident report will have a very specific footnote."]];
  }
  function mark(){buttonsShown.forEach((button,i)=>button.classList.toggle('selected',i===selected))}
  function offer(){
   if(token!==session)return;
   advance=null;choices.replaceChildren();buttonsShown=[];
   speak(speakerByStage[stage]||'DARIO',body.replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
   hint.textContent='CHOOSE RESPONSE · ↑ ↓ / ENTER';
   for(const [choiceIndex,option] of buttons.entries()){
    const button=document.createElement('button');button.textContent=option.text;
    if(option.alt)button.className='alt';
    button.onclick=()=>{
     if(token!==session)return;
     if(option.alt){panel.classList.remove('cinematic-panel','cinematic-scene');option.fn();return}
     const exchange=replyFor(option,choiceIndex,buttons.length);
     choices.replaceChildren();buttonsShown=[];
     const context=quizContext(option,choiceIndex);
     speak(context?'DARIO':'DARIO',context?'I am going with: '+option.text:option.text);
     hint.textContent='SPACE / ENTER / E TO CONTINUE ▸';
     let beat=0;
     advance=()=>{
      if(beat<exchange.length){const [who,line]=exchange[beat++];speak(who,line);return}
      panel.classList.remove('cinematic-panel','cinematic-scene');
      advance=null;option.fn();
     };
    };
    choices.append(button);buttonsShown.push(button);
   }
   selected=0;mark();
  }
  function next(){
   if(token!==session)return;
   if(index>=script.length){offer();return}
   const [who,msg]=script[index++];speak(who,msg);
   choices.replaceChildren();buttonsShown=[];
   hint.textContent='SPACE / ENTER / E TO CONTINUE ▸';advance=next;
  }
  function onKey(event){
   if(token!==session)return;
   const key=event.key.toLowerCase();
   if(![' ','enter','e','arrowup','arrowdown'].includes(key))return;
   event.preventDefault();event.stopImmediatePropagation();
   if(event.repeat)return;
   if(buttonsShown.length){
    if(key==='arrowup')selected=(selected+buttonsShown.length-1)%buttonsShown.length;
    if(key==='arrowdown')selected=(selected+1)%buttonsShown.length;
    if([' ','enter','e'].includes(key))buttonsShown[selected].click();
    mark();
   }else if(advance&&[' ','enter','e'].includes(key))advance();
  }
  if(window.__sceneCleanup)window.__sceneCleanup();
  window.addEventListener('keydown',onKey,true);
  window.__sceneCleanup=()=>window.removeEventListener('keydown',onKey,true);
  next();
 }
 window.playMissionCutscene=function(title,script,onContinue){show(title,'', [{text:'CONTINUE',fn:onContinue}],script)};
 modal=function(title,body,buttons){
  const panel=document.querySelector('#panel');panel.classList.remove('cinematic-panel');
  if(isStory(title)){show(title,body,buttons);return}
  ++session;if(window.__sceneCleanup)window.__sceneCleanup();baseModal(title,body,buttons);
 };
 const originalClose=closeModal;
 closeModal=function(){++session;if(window.__sceneCleanup)window.__sceneCleanup();document.querySelector('#panel').classList.remove('cinematic-panel','cinematic-scene');originalClose()};
})();
