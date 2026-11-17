// Non-quiz missions: OpenAI signal decoder and Google approval routing.
(function(){
 let overlay=null;
 function clear(){if(overlay){overlay.remove();overlay=null}}
 function setup(title,desc){
  clear();overlay=document.createElement('div');overlay.style.cssText='position:fixed;inset:0;z-index:10002;background:rgba(4,9,22,.94);display:flex;align-items:center;justify-content:center;padding:15px;box-sizing:border-box;color:#eef7ff;font:15px system-ui';
  const c=document.createElement('div');c.style.cssText='width:min(620px,100%);max-height:90vh;overflow:auto;background:#17283d;border:2px solid #75d7ca;border-radius:14px;padding:22px';
  const h=document.createElement('h2');h.textContent=title;h.style.color='#75e7d8';c.appendChild(h);const p=document.createElement('p');p.textContent=desc;c.appendChild(p);overlay.appendChild(c);document.body.appendChild(overlay);return c;
 }
 function line(c,t){const p=document.createElement('p');p.textContent=t;c.appendChild(p);return p}
 function btn(c,t,fn){const b=document.createElement('button');b.textContent=t;b.style.cssText='padding:10px 13px;margin:5px;background:#2c4560;color:white;border:1px solid #8daabd;border-radius:8px;cursor:pointer;font:inherit';b.onclick=fn;c.appendChild(b);return b}
 function openai(){
  const c=setup('OPENAI · VAULT SIGNAL DECODER','SAM: The vault changes its access sequence every time the board votes. Watch the four signals, then reproduce them. Three successful decryptions unlock the file.');
  const colors=['CYAN','MAGENTA','AMBER','LIME'];let round=0,seq=[],entry=[],showing=false,token=0;
  const status=line(c,'');const display=line(c,'');const controls=document.createElement('div');c.appendChild(controls);
  function next(){
   if(!overlay)return;round++;entry=[];seq=Array.from({length:Math.min(5,round+2)},()=>Math.floor(Math.random()*4));showing=true;const id=++token;status.textContent='LOCK '+round+'/3 · MEMORIZE THE SIGNALS';display.textContent='SIGNALS: '+seq.map(i=>colors[i]).join('  →  ');
   controls.replaceChildren();btn(controls,'I HAVE MEMORIZED THE SEQUENCE',()=>{if(id!==token)return;showing=false;display.textContent='ENTER THE SEQUENCE';controls.replaceChildren();colors.forEach((color,i)=>btn(controls,color,()=>{entry.push(i);display.textContent='INPUT '+entry.map(n=>colors[n]).join(' → ');if(entry[entry.length-1]!==seq[entry.length-1]){cash=Math.max(0,cash-25);wanted=Math.max(wanted,1);status.textContent='ALARM TRIGGERED · -$25 · RESTART LOCK';round--;next()}else if(entry.length===seq.length){if(round===3){clear();advance()}else next()}}))}) ;
  }
  btn(c,'LEAVE VAULT',()=>{token++;clear()});next();
 }
 function google(){
  const c=setup('GEMINI TOWER · APPROVAL ROUTER','SUNDAR: Our forms have forms. Arrange the four approval cards in the correct dependency order. Move cards up or down; submit only when the workflow is valid.');
  const cards=[
   {id:'risk',name:'Risk assessment',requires:[]},
   {id:'privacy',name:'Privacy review',requires:['risk']},
   {id:'capacity',name:'TPU capacity reservation',requires:['risk']},
   {id:'release',name:'Final deployment sign-off',requires:['privacy','capacity']}
  ];
  let order=[3,2,1,0];const list=document.createElement('div'),status=line(c,'');c.appendChild(list);
  function render(){
   list.replaceChildren();order.forEach((idx,pos)=>{const row=document.createElement('div');row.style.cssText='padding:7px;margin:5px 0;border:1px solid #57728a;border-radius:7px';const label=document.createElement('span');label.textContent=(pos+1)+'. '+cards[idx].name+'  ';row.appendChild(label);
   for(const [dir,symbol] of [[-1,'↑'],[1,'↓']]){const b=btn(row,symbol,()=>{const j=pos+dir;if(j<0||j>=order.length)return;[order[pos],order[j]]=[order[j],order[pos]];render()});b.disabled=pos+dir<0||pos+dir>=order.length}list.appendChild(row)});
  }
  render();
  btn(c,'SUBMIT WORKFLOW',()=>{const done=new Set();for(const i of order){const card=cards[i];if(card.requires.some(dep=>!done.has(dep))){status.textContent='REJECTED: '+card.name+' is missing a prerequisite. Reorder the cards.';cash=Math.max(0,cash-10);return}done.add(card.id)}clear();showDialog('SUNDAR','All approvals are in the right order. Please do not tell the other committees.');advance()});
  btn(c,'LEAVE TOWER',clear);
 }
 const baseChallenge=challenge;
 challenge=function(m){if(m.kind==='approval'){google();return}return baseChallenge(m)};
 const baseHandle=handleStoryInteraction;
 handleStoryInteraction=function(){if(stage===2){openai();return true}return baseHandle()};
})();
