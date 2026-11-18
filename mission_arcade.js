// Interactive mission variety: resource optimization, evidence investigation, and IPO stress test.
(function(){
 let panel=null;
 function close(){if(panel){panel.remove();panel=null;locked=false}}
 function open(title,description){
  close();locked=true;panel=document.createElement('div');panel.style.cssText='position:fixed;inset:0;z-index:10001;background:rgba(3,9,22,.94);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;color:#eef9ff;font:15px system-ui';
  const card=document.createElement('div');card.style.cssText='width:min(640px,100%);max-height:90vh;overflow:auto;padding:22px;background:#15243b;border:2px solid #61d9c9;border-radius:14px';
  const h=document.createElement('h2');h.textContent=title;h.style.color='#71ead8';card.appendChild(h);
  const p=document.createElement('p');p.textContent=description;card.appendChild(p);
  panel.appendChild(card);document.body.appendChild(panel);
  return card;
 }
 function line(card,text){const p=document.createElement('p');p.textContent=text;card.appendChild(p);return p}
 function button(card,label,fn){const b=document.createElement('button');b.textContent=label;b.style.cssText='margin:6px 6px 6px 0;padding:10px 14px;background:#29445d;color:white;border:1px solid #75b4c7;border-radius:8px;cursor:pointer;font:inherit';b.onclick=fn;card.appendChild(b);return b}
 function win(){close();advance()}
 function deepseek(){
  const card=open('THE R1 GAMBIT · MULTI-WORKLOAD OPTIMIZER','LIANG: One model configuration must survive three different workloads. Tune training, distillation and cache within a 100-credit budget. Each benchmark has different quality, latency and inference-cost requirements.');
  const names=['TRAINING','DISTILLATION','CACHE'],vals=[40,25,20],inputs=[];
  let round=0,failures=0;
  const workloads=[
   {name:'REASONING BENCHMARK',quality:79,cost:65,latency:76,weights:[.95,.60,.35],latencyWeights:[.2,.35,.8]},
   {name:'LOW-COST INFERENCE',quality:74,cost:47,latency:67,weights:[.48,.95,.55],latencyWeights:[.1,.4,1]},
   {name:'REAL-TIME AGENT',quality:76,cost:58,latency:58,weights:[.62,.65,.8],latencyWeights:[.15,.35,1.2]}
  ];
  names.forEach((n,i)=>{const row=document.createElement('div');row.style.margin='10px 0';const label=line(row,n+' · '+vals[i]);const input=document.createElement('input');input.type='range';input.min=0;input.max=80;input.step=5;input.value=vals[i];input.style.width='100%';input.oninput=()=>{vals[i]=Number(input.value);label.textContent=n+' · '+vals[i];refresh()};row.appendChild(input);card.appendChild(row);inputs.push(input)});
  const stats=line(card,''),feedback=line(card,'');
  function metrics(){
   const w=workloads[round],spent=vals.reduce((a,b)=>a+b,0);
   return {spent,quality:Math.round(20+vals.reduce((sum,v,i)=>sum+v*w.weights[i],0)),cost:Math.round(vals[0]*.82+vals[1]*.45+vals[2]*.27),latency:Math.round(105-vals.reduce((sum,v,i)=>sum+v*w.latencyWeights[i],0))};
  }
  function refresh(){
   const w=workloads[round],m=metrics();
   stats.textContent='WORKLOAD '+(round+1)+'/3 · '+w.name+' | COMPUTE '+m.spent+'/100 | QUALITY '+m.quality+' ≥ '+w.quality+' | COST '+m.cost+' ≤ '+w.cost+' | LATENCY '+m.latency+' ≤ '+w.latency;
   return m.spent<=100&&m.quality>=w.quality&&m.cost<=w.cost&&m.latency<=w.latency;
  }
  refresh();
  button(card,'RUN BENCHMARK',()=>{
   if(!refresh()){failures++;cash=Math.max(0,cash-20);feedback.textContent='BENCHMARK FAILED · -$20. Check all four constraints. Attempts: '+failures;return}
   round++;
   if(round===workloads.length){showDialog('LIANG','You optimized for reasoning, cost and latency. Now that is an actual benchmark.');win();return}
   feedback.textContent='✓ WORKLOAD PASSED · Next workload has different constraints. Re-tune your allocation.';refresh();
  });
  button(card,'LEAVE LAB',close);
 }
 function meta(){
  const card=open('META MALL · FIND THE REAL ZUCK','Three Zuck doubles have different claims. Gather evidence by interviewing them, then identify the executive who can actually sign a distribution agreement.');
  const clues=[
   ['ZUCK A','My avatar has 900 million followers. Contracts? My hologram signs them.'],
   ['ZUCK B','I can provide signed distribution terms, opt-in consent, and an audit trail.'],
   ['ZUCK C','Give me your customer database and I will give you a free virtual jacket.']
  ];
  const seen=new Set(),status=line(card,'INTERVIEWS 0/3');
  clues.forEach(([name,quote],i)=>button(card,'INTERVIEW '+name,()=>{seen.add(i);showDialog(name,quote);status.textContent='INTERVIEWS '+seen.size+'/3 · '+name+': '+quote}));
  line(card,'Choose a candidate after interviewing at least two doubles:');
  clues.forEach(([name],i)=>button(card,'SIGN WITH '+name,()=>{if(seen.size<2){status.textContent='Gather at least two interviews before signing.';return}if(i===1){showDialog('ZUCK','You found me. The other two are still in beta.');win()}else{hype=Math.max(0,hype-3);status.textContent='Fake executive. -3 Hype. Interview again and check the paperwork.'}}));
  button(card,'LEAVE MALL',close);
 }
 function market(){
  if(gpu<100||safety<40){toast('IPO NOT READY · NEED 100 COMPUTE AND 40 SAFETY');return}
  const card=open('THE MARKET · IPO WAR ROOM','Five escalating shocks. Protect confidence, liquidity, compliance and runway. Every intervention has a tradeoff; the market punishes weak reserves at each close.');
  let round=0,confidence=60,liquidity=65,compliance=60,runway=55,failures=0;
  const phases=[
   {title:'RIVAL MODEL LAUNCH',drain:[10,5,3,4],opts:[['PUBLISH REPRODUCIBLE BENCHMARKS',15,-12,10,-6],['BUY VIRAL HYPE',22,-22,-16,-12],['DELAY THE ROADSHOW',-7,9,12,8]]},
   {title:'GPU SUPPLY CRUNCH',drain:[5,13,3,11],opts:[['NEGOTIATE RESERVED CAPACITY',7,-17,6,15],['OPTIMIZE SERVING COSTS',3,12,3,10],['BUY SPOT COMPUTE',12,-25,0,-18]]},
   {title:'REGULATORY HEARING',drain:[9,4,17,6],opts:[['OPEN INDEPENDENT AUDIT',8,-14,22,-6],['PROMISE AGI NEXT WEEK',24,8,-28,-12],['PAUSE THE LISTING',-18,8,14,8]]},
   {title:'SHORT SELLER ATTACK',drain:[17,13,5,9],opts:[['DISCLOSE VERIFIED FINANCIALS',12,-9,15,3],['LAUNCH EMERGENCY BUYBACK',19,-25,0,-14],['CUT CASH BURN',-8,14,4,20]]},
   {title:'FINAL PRICING WINDOW',drain:[13,13,12,12],opts:[['PRICE CONSERVATIVELY',7,13,8,6],['CHASE A RECORD VALUATION',25,-22,-10,-18],['FUND LAST-MINUTE AUDIT',4,-12,19,-6]]}
  ];
  const info=line(card,''),feedback=line(card,''),actions=document.createElement('div');card.appendChild(actions);
  function render(){
   if(round===phases.length){showDialog('THE MARKET','Five shocks survived. Your cash flow, disclosures and valuation all made it to the opening bell.');win();return}
   const p=phases[round];
   info.textContent='SHOCK '+(round+1)+'/5 · '+p.title+' | CONFIDENCE '+confidence+' | LIQUIDITY '+liquidity+' | COMPLIANCE '+compliance+' | RUNWAY '+runway+' · Minimum 20 each';
   actions.replaceChildren();
   p.opts.forEach(([name,c,l,s,r])=>button(actions,name,()=>{
    confidence=Math.max(0,Math.min(100,confidence+c-p.drain[0]));
    liquidity=Math.max(0,Math.min(100,liquidity+l-p.drain[1]));
    compliance=Math.max(0,Math.min(100,compliance+s-p.drain[2]));
    runway=Math.max(0,Math.min(100,runway+r-p.drain[3]));
    if(Math.min(confidence,liquidity,compliance,runway)<20){
     failures++;cash=Math.max(0,cash-100);
     confidence=60;liquidity=65;compliance=60;runway=55;round=0;
     feedback.textContent='MARKET PANIC · -$100 · All indicators must remain at least 20. Attempt '+(failures+1);
    }else{round++;feedback.textContent='CLOSING BELL · All four indicators survived this shock.'}
    render();
   }));
  }
  render();button(card,'EXIT EXCHANGE',close);
 }
 const original=challenge;
 challenge=function(m){if(m.kind==='poker'){deepseek();return}if(m.kind==='zuck'){meta();return}if(m.kind==='market'){market();return}original(m)};
})();
