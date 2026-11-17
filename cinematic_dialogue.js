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
 function show(title,body,buttons){
  const token=++session;
  const panel=document.querySelector('#panel'),el=document.querySelector('#modal');
  locked=true;el.style.display='grid';
  panel.classList.add('cinematic-panel');
  panel.replaceChildren();
  const header=document.createElement('div');header.className='cin-heading';header.textContent=title.replace(/<[^>]+>/g,'');
  const layout=document.createElement('div');layout.className='cin-layout';
  const art=document.createElement('div');art.className='cin-portrait';
  const text=document.createElement('div');text.className='cin-copy';
  const speaker=document.createElement('div');speaker.className='cin-speaker';
  const line=document.createElement('p');line.className='cin-line';
  const controls=document.createElement('div');controls.className='cin-controls';
  text.append(speaker,line,controls);layout.append(art,text);panel.append(header,layout);
  const base= scenes[stage]||[];
  const step=base.length?base: [[speakerByStage[stage],missions[stage].line]];
  // First terminal / quiz uses its existing question as the last spoken line.
  let cursor=0;
  function say(name,msg){
   speaker.textContent=name;
   art.innerHTML=portrait(name);
   line.textContent=msg;
  }
  function options(){
   if(token!==session)return;
   const who=speakerByStage[stage]||'DARIO';
   say(who,body.replace(/<br\s*\/?\s*>/gi,' · ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim());
   controls.replaceChildren();
   for(const b of buttons){
    const btn=document.createElement('button');btn.textContent=b.text;btn.className=b.alt?'alt':'';
    btn.onclick=()=>{
     if(token!==session)return;
     if(b.alt){panel.classList.remove('cinematic-panel');b.fn();return}
     // Interleave Dario's response before executing the original gameplay callback.
     say('DARIO',b.text);
     controls.replaceChildren();
     const next=document.createElement('button');next.textContent='CONFIRM CHOICE ›';
     next.onclick=()=>{if(token!==session)return;panel.classList.remove('cinematic-panel');b.fn()};
     controls.append(next);
    };
    controls.append(btn);
   }
  }
  function nextLine(){
   if(token!==session)return;
   if(cursor>=step.length){options();return}
   const [who,msg]=step[cursor++];say(who,msg);
   controls.replaceChildren();
   const next=document.createElement('button');next.textContent=cursor<step.length?'CONTINUE ›':'YOUR RESPONSE ›';
   next.onclick=nextLine;controls.append(next);
  }
  nextLine();
 }
 modal=function(title,body,buttons){
  const panel=document.querySelector('#panel');panel.classList.remove('cinematic-panel');
  if(isStory(title)){show(title,body,buttons);return}
  ++session;baseModal(title,body,buttons);
 };
 const originalClose=closeModal;
 closeModal=function(){++session;document.querySelector('#panel').classList.remove('cinematic-panel');originalClose()};
})();
