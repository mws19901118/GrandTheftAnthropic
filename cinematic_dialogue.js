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
  const [accent,coat,letter]=cast[name]||cast.DARIO;
  // Vector bust placeholder; can be replaced with cropped cover character artwork later.
  return '<svg class="cin-bust" viewBox="0 0 200 245" role="img" aria-label="'+safe(name)+' portrait">'+
   '<defs><linearGradient id="coat-'+letter+'" x2="1" y2="1"><stop stop-color="'+coat+'"/><stop offset="1" stop-color="#101a2d"/></linearGradient></defs>'+
   '<ellipse cx="100" cy="235" rx="85" ry="15" fill="#030817" opacity=".55"/>'+
   '<path d="M14 245 Q22 164 76 157 L125 157 Q178 168 186 245Z" fill="'+coat+'" stroke="'+accent+'" stroke-width="3"/>'+
   '<path d="M82 156 L100 194 L119 156 L111 143 L89 143Z" fill="#d69b7e"/>'+
   '<path d="M64 77 Q65 31 100 31 Q137 31 139 80 L134 135 Q120 159 100 159 Q79 156 67 132Z" fill="#d8a082"/>'+
   '<path d="M64 91 Q53 31 94 22 Q133 17 142 59 L137 89 L126 52 Q95 64 69 57Z" fill="#1b2636"/>'+
   '<path d="M80 103 h13 M110 103 h13" stroke="#28303b" stroke-width="3" stroke-linecap="round"/>'+
   '<path d="M91 133 Q100 139 110 133" stroke="#8b594d" stroke-width="2" fill="none"/>'+
   '<path d="M72 165 L100 194 L85 213 L62 167 M127 165 L100 194 L116 213 L142 169" fill="none" stroke="'+accent+'" stroke-width="3"/>'+
   '<text x="100" y="230" text-anchor="middle" font-family="system-ui" font-size="15" font-weight="900" fill="'+accent+'">'+letter+'</text></svg>';
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
  const participants=[...new Set(script.map(v=>v[0]).concat(['DARIO']))].slice(0,3);
  for(const who of participants){
   const actor=document.createElement('div');actor.className='scene-actor';actor.dataset.who=who;
   actor.innerHTML=portrait(who);actors.append(actor);
  }
  let index=0,advance=null,buttonsShown=[],selected=0;
  function speak(who,msg){
   nameTag.textContent=who;dialogue.textContent=msg;
   for(const actor of actors.children)actor.classList.toggle('speaking',actor.dataset.who===who);
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
