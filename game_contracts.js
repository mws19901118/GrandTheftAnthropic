// Repeatable courier contracts and their lifecycle.
// Loaded after game.js; exposes gigStep, gigTarget, sideGig, finishGig, failGig.
const GIG_CONTRACTS=[
 {name:'GPU COURIER',cash:410,gpu:12,time:235,steps:[
  {site:'nvidia',label:'PICK UP THE GPU CRATE',line:'JENSEN: No refunds on thermal paste.'},
  {site:'openai',label:'VERIFY THE SERIAL NUMBERS',line:'DARIO: The spreadsheet says these GPUs are emotionally available.'},
  {site:'anthropic',label:'DELIVER THE SHIPMENT',line:'ALICE: Megaspeed verified the manifest. Anthropic can handle its own safety review.'}]},
 {name:'EFFICIENCY AUDIT',cash:360,hype:8,time:245,steps:[
  {site:'deepseek',label:'COLLECT THE BENCHMARK DATA',line:'DARIO: Small model, enormous spreadsheet.'},
  {site:'gemini',label:'CROSS-CHECK THE RESULTS',line:'GEMINI: The chart looks persuasive, which is not the same as correct.'},
  {site:'anthropic',label:'SUBMIT THE AUDIT',line:'DARIO: Independent verification achieved. Alice did not even invoice us for it.'}]},
 {name:'COMPLIANCE EXPRESS',cash:390,safety:7,time:240,steps:[
  {site:'anthropic',label:'PICK UP THE SAFETY REPORT',line:'DARIO: Do not lose the appendix. Sam will charge us for a replacement.'},
  {site:'gemini',label:'GET THE COMPLIANCE STAMP',line:'GEMINI: Please initial every page, including the blank ones.'},
  {site:'ipo',label:'FILE THE REPORT',line:'DARIO: The market appreciates a stamped document.'}]},
 {name:'BOARDROOM DOCUMENT DELIVERY',cash:440,hype:5,time:255,steps:[
  {site:'openai',label:'COLLECT THE BOARD PACKET',line:'SAM: This is the final version. Probably.'},
  {site:'meta',label:'OBTAIN THE LEGAL SIGNATURE',line:'META: We have reviewed the review.'},
  {site:'ipo',label:'HAND OFF THE PACKET',line:'DARIO: Confidential paperwork successfully transported in a sports car.'}]}
];
function gigStep(){if(!gigRun)return null;return (gigRun.steps||[{site:gigRun.target,label:'DELIVER THE CONTRACT'}])[gigRun.step||0]}
function gigTarget(){const step=gigStep();return step&&sites.find(s=>s.id===step.site)}
function sideGig(){
 if(!running||locked)return;
 if(gigRun){const step=gigStep();toast('ACTIVE CONTRACT · '+(step?step.label:'FINISH THE CONTRACT'));return}
 if(assetRun||deadline){toast('FINISH YOUR ACTIVE MISSION FIRST');return}
 if(gigCooldown>0){toast('CONTRACT BOARD COOLDOWN · '+Math.ceil(gigCooldown/1000)+'s');return}
 const j=GIG_CONTRACTS[gigCompleted%GIG_CONTRACTS.length];
 gigRun={...j,step:0,remaining:Math.round(j.time*DIFFICULTY[difficulty].timer)*1000};
 const target=gigTarget();
 toast('CONTRACT ACCEPTED · '+j.name);
 showDialog('FREELANCE CONTRACT',j.name+' · 1/'+j.steps.length+' · '+j.steps[0].label+' at '+target.n+'. Press E at the entrance. Time limit: '+Math.ceil(gigRun.remaining/1000)+' seconds.');
}
function finishGig(){
 if(!gigRun)return;
 const step=gigStep();
 if(step&&step.line)showDialog('CONTRACT · '+(gigRun.step+1)+'/'+gigRun.steps.length,step.line);
 gigRun.step=(gigRun.step||0)+1;
 if(gigRun.step<gigRun.steps.length){
  const next=gigStep(),target=gigTarget();
  toast('CHECKPOINT COMPLETE · '+next.label);
  showDialog('NEXT CONTRACT STOP',next.label+' · '+target.n+' · '+Math.ceil(gigRun.remaining/1000)+'s left.');
  return;
 }
 const j=gigRun;cash+=j.cash;gpu+=j.gpu||0;hype+=j.hype||0;safety=Math.min(100,safety+(j.safety||0));
 gigRun=null;gigCompleted++;gigCooldown=12000;
 toast('CONTRACT COMPLETE · +$'+j.cash);
 showDialog('CONTRACT PAID',j.name+' completed all checkpoints. Payment received.');
}
function failGig(){if(!gigRun)return;gigRun=null;gigCooldown=7000;toast('CONTRACT EXPIRED · TRY AGAIN');}
