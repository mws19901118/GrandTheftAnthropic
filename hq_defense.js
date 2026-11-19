// Mandatory arcade defense between the OpenAI escape and DeepSeek.
// Attackers are anonymous bots; no character identities are presented as suspects.
(function(){
 let session=null,raf=0,ui=null;
 const lanes=['NETWORK','GPU SUPPLY','SAFETY FILES'];
 function active(){return running&&stage===4&&!storyMissionState.hqDefenseDone}
 function clean(){if(raf)cancelAnimationFrame(raf);raf=0;if(ui){ui.remove();ui=null;locked=false}session=null}
 function end(win){
  const score=session?session.score:0,integrity=session?session.integrity:0;
  clean();
  if(win){
   storyMissionState.hqDefenseDone=true;
   cash+=300+score*10;gpu+=12;safety=Math.min(100,safety+Math.round(integrity/10));hype=Math.min(100,hype+5);
   wanted=0;closeModal();showDialog('DARIO','The bot swarm is offline. Its origin remains unknown. The firewall is holding, and the IPO is still alive.');
   toast('HQ DEFENDED · +$'+(300+score*10)+' · +12 GPU');
  }else{
   safety=Math.max(0,safety-5);closeModal();
   modal('HQ BREACHED','The anonymous bot swarm overwhelmed the firewall. Restore the defenses and try again.',[{text:'RETRY DEFENSE',fn:launch},{text:'RETURN TO CITY',alt:true,fn:closeModal}]);
  }
 }
 function fire(lane){
  if(!session||!ui)return;
  const now=performance.now();
  if(now-session.lastFire<360)return;
  session.lastFire=now;
  let best=-1,progress=-1;
  for(let i=0;i<session.bots.length;i++){let b=session.bots[i];if(b.lane===lane&&b.p>progress){progress=b.p;best=i}}
  if(best>=0){session.bots.splice(best,1);session.score++;session.flash=lane;session.flashUntil=now+220}
  else{session.integrity=Math.max(0,session.integrity-2);session.flash=-1;session.flashUntil=now+220}
 }
 function launch(){
  clean();closeModal();locked=true;
  session={start:performance.now(),last:performance.now(),lastSpawn:performance.now(),lastFire:0,bots:[],score:0,integrity:100,flash:-2,flashUntil:0};
  ui=document.createElement('div');ui.id='hq-arcade';ui.style.cssText='position:fixed;z-index:10000;inset:0;background:rgba(3,8,22,.93);color:#f1f7ff;font:15px system-ui;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  ui.innerHTML='<div style="width:min(680px,100%);background:#122035;border:2px solid #66e6d2;border-radius:14px;padding:22px;box-shadow:0 0 40px #000"><h2 style="margin:0 0 8px;color:#66e6d2">ANTHROPIC · FIREWALL UNDER SIEGE</h2><p style="margin:0 0 12px">UNKNOWN BOT SWARM · Intercept incoming packets before they reach HQ. Press <b>1 / 2 / 3</b> or click a lane. Missed packets damage the core; firing at an empty lane costs 2 integrity.</p><div id="hq-readout" style="font-weight:bold;margin-bottom:14px"></div><div id="hq-lanes"></div><p style="font-size:12px;opacity:.8">SYSTEM: Packet signatures are unverified. Focus on protecting the three infrastructure lanes.</p><button id="hq-abort" style="padding:9px 16px;border:1px solid #ddd;border-radius:7px;background:#263a50;color:white;cursor:pointer">PAUSE · RETURN TO CITY</button></div>';
  document.body.appendChild(ui);
  const board=ui.querySelector('#hq-lanes');
  lanes.forEach((name,i)=>{let row=document.createElement('button');row.type='button';row.dataset.lane=i;row.style.cssText='display:block;width:100%;text-align:left;margin:10px 0;padding:13px;background:#1b3145;border:1px solid #607d91;border-radius:8px;color:white;cursor:pointer;font:inherit';row.onclick=()=>fire(i);board.appendChild(row)});
  ui.querySelector('#hq-abort').onclick=()=>{clean();toast('HQ DEFENSE PAUSED · RETURN TO ANTHROPIC HQ TO RESUME')};
  raf=requestAnimationFrame(tick);
 }
 window.launchHQDefense=launch;
 function tick(t){
  if(!session)return;
  if(!running){clean();return}
  const dt=Math.min(80,t-session.last);session.last=t;
  const elapsed=(t-session.start)/1000,remaining=Math.max(0,45-elapsed);
  if(t-session.lastSpawn>Math.max(620,1450-elapsed*14)){
   session.lastSpawn=t;session.bots.push({lane:Math.floor(Math.random()*3),p:0});
  }
  for(const b of session.bots)b.p+=dt*(0.00018+elapsed*0.000003);
  for(let i=session.bots.length-1;i>=0;i--)if(session.bots[i].p>=1){session.bots.splice(i,1);session.integrity-=14}
  if(session.integrity<=0){end(false);return}
  if(remaining<=0){end(true);return}
  ui.querySelector('#hq-readout').textContent='CORE INTEGRITY '+Math.round(session.integrity)+'%   ·   INTERCEPTED '+session.score+'   ·   '+Math.ceil(remaining)+'s';
  for(let i=0;i<3;i++){
   const row=ui.querySelector('[data-lane="'+i+'"]'),bots=session.bots.filter(b=>b.lane===i);
   const nearest=bots.length?Math.max(...bots.map(b=>b.p)):0;
   const filled=Math.min(10,Math.floor(nearest*10));
   row.textContent=(i+1)+' · '+lanes[i]+'   '+('█'.repeat(filled)+'░'.repeat(10-filled))+'  '+bots.length+' THREATS';
   row.style.borderColor=session.flash===i&&t<session.flashUntil?'#66e6d2':nearest>.7?'#ff6666':'#607d91';
  }
  raf=requestAnimationFrame(tick);
 }
 document.addEventListener('keydown',e=>{if(!session)return;if(['1','2','3'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();fire(Number(e.key)-1)}},true);
 const originalInteract=interact;
 interact=function(){
  if(active()){
   const p=driving?car:player;
   if(closeEntry(p,siteEntry(sites[0]))){
    modal('ANTHROPIC HQ · UNDER SIEGE','An anonymous bot swarm is attacking the HQ network, GPU supply and safety files. Defend the core for 45 seconds using a three-lane interception console. The source of the bot swarm remains unknown.',[{text:'START FIREWALL DEFENSE',fn:launch},{text:'NOT YET',alt:true,fn:closeModal}]);
   }else toast('RETURN TO ANTHROPIC HQ · DEFEND THE CORE');
   return;
  }
  return originalInteract();
 };
 window.hqDefenseTargetSite=function(){return active()?sites[0]:null};
})();
