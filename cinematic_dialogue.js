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
  [['DARIO','The IPO clock is ticking. I need Blackwell chips, not another investor deck.'],['JENSEN','Welcome to the depot. Supply is limited. My leather jacket is not.'],['ALICE','Procurement has three options. Only two involve GPUs.']],
  [['DARIO','The cargo survived the road. The compliance report may not.']],
  [['DARIO','Sam has the AGI file. I have an extremely temporary visitor badge.'],['SAM','Welcome to the rooftop. The board keeps changing the vault password.'],['SAM','Answer the security terminal carefully. Legal fees are non-refundable.']],
  [['SAM','The board is voting again. Nobody remembers who is CEO.']],
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
 function show(title,body,buttons){
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
  const script=lastSceneStage===stage?[[speakerByStage[stage],missions[stage].line]]:(base.length?base:[[speakerByStage[stage],missions[stage].line]]);
  lastSceneStage=stage;
  const artFiles={DARIO:'dario',JENSEN:'jensen',ALICE:'alice',SAM:'sam',LIANG:'liang',ELON:'elon',SUNDAR:'sundar',ZUCK:'zuck','THE MARKET':'the_market'};
  // Scene-appropriate resting pose. The active speaker may use a gesture pose.
  // Only clean, production-ready files are eligible; *_reference.webp is never loaded.
  const seatedStages=new Set([2,3,4,7,8,9]);
  const restPose=seatedStages.has(stage)?'sit':'stand';
  const participants=[...new Set(script.map(v=>v[0]).concat(['DARIO']))].slice(0,3);
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
   const candidates=pose==='stand'?[root+'_stand.webp',root+'.png']:[root+'_'+pose+'.webp',root+'_'+pose+'.png',root+'.png'];
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
   for(const actor of actors.children){const active=actor.dataset.who===who;actor.classList.toggle('speaking',active);setPose(actor.dataset.who,active?'gesture':restPose)}
  }
  function mark(){buttonsShown.forEach((button,i)=>button.classList.toggle('selected',i===selected))}
  function offer(){
   if(token!==session)return;
   advance=null;choices.replaceChildren();buttonsShown=[];
   speak(speakerByStage[stage]||'DARIO',body.replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
   hint.textContent='CHOOSE RESPONSE · ↑ ↓ / ENTER';
   for(const option of buttons){
    const button=document.createElement('button');button.textContent=option.text;
    if(option.alt)button.className='alt';
    button.onclick=()=>{
     if(token!==session)return;
     if(option.alt){panel.classList.remove('cinematic-panel','cinematic-scene');option.fn();return}
     speak('DARIO',option.text);choices.replaceChildren();buttonsShown=[];
     hint.textContent='SPACE / ENTER / E TO CONTINUE ▸';
     advance=()=>{panel.classList.remove('cinematic-panel','cinematic-scene');advance=null;option.fn()};
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
 modal=function(title,body,buttons){
  const panel=document.querySelector('#panel');panel.classList.remove('cinematic-panel');
  if(isStory(title)){show(title,body,buttons);return}
  ++session;if(window.__sceneCleanup)window.__sceneCleanup();baseModal(title,body,buttons);
 };
 const originalClose=closeModal;
 closeModal=function(){++session;if(window.__sceneCleanup)window.__sceneCleanup();document.querySelector('#panel').classList.remove('cinematic-panel','cinematic-scene');originalClose()};
})();
