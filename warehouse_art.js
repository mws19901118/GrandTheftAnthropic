// v1.8 NVIDIA depot: independent animated scene elements over the static architecture.
// Rendering-only: no changes to site IDs, missions, collision, or save format.
(() => {
  const art=new Image();let ready=false;
  art.onload=()=>ready=true;
  art.onerror=()=>console.warn('NVIDIA illustration unavailable; using procedural fallback');
  art.src='assets/nvidia_warehouse.png';
  const oldTower=tower, oldDetail=warehouseDetail;
  const site=sites.find(s=>s.id==='nvidia');
  const pos=(x,y,z=0)=>iso(site.x+x,site.y+y,z);
  const nearDepot=()=>{const p=driving?car:player;return Math.hypot(p.x-site.x,p.y-site.y)<1550};
  const rounded=(x,y,w,h,r)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
  // Pixel-registered overlays: positions are defined on the ORIGINAL 1536x1024
  // illustration, not on an arbitrary world-space offset. This prevents the
  // forklift from wandering onto the road or the shutter appearing at a corner.
  const SPRITE={w:465,h:310,offsetY:88};
  // Every overlay is registered in source-image pixels. The depot's existing
  // illustration already contains loading doors and a forklift; do not paint
  // another shutter on top of an unrelated wall or place a second forklift
  // outside the loading yard.
  const DEPOT={apron:{left:1175,right:1375,top:770,bottom:865},bay2:{x:1060,y:735}};
  let debug=false;
  addEventListener('keydown',e=>{if(e.key.toLowerCase()==='k'&&!e.repeat){debug=!debug;console.info('Depot art guides:',debug?'on':'off')}});
  function artPoint(px,py){
    const at=iso(site.x,site.y,0);
    return {x:at.x-SPRITE.w/2+px/1536*SPRITE.w,
            y:at.y-SPRITE.h+SPRITE.offsetY+py/1024*SPRITE.h};
  }
  // Loading apron runs along the RIGHT face of the warehouse illustration.
  // These endpoints are intentionally both INSIDE the apron on the image.
  function forklift(t){
    const loading=typeof blackwellLoadingProgress==='function'?blackwellLoadingProgress(t):-1;
    const phase=loading>=0?Math.min(.98,loading):((t/12000)%1);
    const travel=phase<.38?phase/.38:phase<.60?1:phase<.98?1-(phase-.60)/.38:0;
    const apron=DEPOT.apron;
    const q=artPoint(apron.left+35+travel*(apron.right-apron.left-75),apron.bottom-25-travel*20);
    const bob=Math.sin(t/210)*.45;
    ctx.save();ctx.translate(q.x,q.y+bob);ctx.scale(.43,.43);
    ctx.fillStyle='#02080d99';ctx.beginPath();ctx.ellipse(2,13,34,11,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#171c23';for(const x of [-19,20]){ctx.beginPath();ctx.arc(x,7,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#aebbc1';ctx.beginPath();ctx.arc(x,7,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#171c23'}
    ctx.fillStyle='#e8ac28';rounded(-28,-12,47,21,4);ctx.fill();
    ctx.fillStyle='#18242c';ctx.fillRect(-9,-31,5,23);ctx.fillRect(13,-31,5,23);ctx.fillRect(-9,-31,27,5);
    ctx.fillStyle='#83c4d3';ctx.fillRect(-3,-26,15,12);
    ctx.fillStyle='#b5c3ca';ctx.fillRect(22,-37,5,45);ctx.fillRect(27,0,26,4);ctx.fillRect(27,7,26,4);
    ctx.fillStyle='#59636a';ctx.fillRect(28,-20,22,19);ctx.fillStyle='#a3e74c';ctx.fillRect(29,-20,20,4);
    ctx.restore();
  }
  function door(t){
    // The raster artwork already has a baked-in shutter. Overlaying a second
    // opaque shutter produces a visibly misplaced door; use a subtle amber
    // loading-status light instead until a clean shutter sprite is supplied.
    const q=artPoint(DEPOT.bay2.x,DEPOT.bay2.y-35);
    const active=(t/12000)%1>.18 && (t/12000)%1<.85;
    ctx.save();
    ctx.globalAlpha=active?.85:.35;
    ctx.fillStyle=active?'#ffbd52':'#65ed72';
    ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(q.x,q.y,2.2,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }
  function guides(){
    if(!debug)return;
    const a=DEPOT.apron;
    const p=artPoint(a.left,a.top),r=artPoint(a.right,a.bottom);
    ctx.save();ctx.strokeStyle='#00ffff';ctx.lineWidth=1.5;ctx.strokeRect(p.x,p.y,r.x-p.x,r.y-p.y);
    const b=artPoint(DEPOT.bay2.x,DEPOT.bay2.y);
    ctx.fillStyle='#fff';ctx.font='11px monospace';ctx.fillText('BAY 2 (image px)',b.x+5,b.y);
    ctx.fillText('FORKLIFT YARD',p.x,p.y-5);ctx.restore();
  }
  function cargoScene(t){
    const progress=typeof blackwellLoadingProgress==='function'?blackwellLoadingProgress(t):-1;
    if(progress<0)return;
    // All effects are positioned in the source artwork's coordinate system.
    const crate=artPoint(1265+Math.min(1,progress*2)*65,790);
    ctx.save();ctx.translate(crate.x,crate.y);
    ctx.fillStyle='#101a1d';ctx.fillRect(-13,-11,26,22);
    ctx.fillStyle='#9bea50';ctx.fillRect(-11,-9,22,4);
    ctx.strokeStyle='#d7ffb4';ctx.lineWidth=1;ctx.strokeRect(-13,-11,26,22);
    ctx.fillStyle='#fff';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('B200',0,4);
    ctx.restore();
    const a=artPoint(1050,570);
    ctx.save();ctx.font='bold 12px monospace';ctx.textAlign='center';
    ctx.fillStyle='#b5ff72';ctx.shadowColor='#84ff3d';ctx.shadowBlur=12;
    ctx.fillText('BLACKWELL DISPATCH  '+Math.round(progress*100)+'%',a.x,a.y);
    ctx.restore();
  }
  function steam(t){
    ctx.save();for(let vent=0;vent<3;vent++){
      const base=pos(-72+vent*76,-40,155);
      for(let i=0;i<5;i++){
        const age=((t/2800+i*.19+vent*.31)%1),drift=Math.sin(t/1100+i+vent)*9;
        ctx.globalAlpha=.19*(1-age);ctx.fillStyle='#d7e6f2';ctx.beginPath();ctx.ellipse(base.x+drift+age*19,base.y-age*78,7+age*15,5+age*10,0,0,7);ctx.fill();
      }
    }ctx.restore();
  }
  function lights(t){
    const pulse=.5+.5*Math.sin(t/380);
    for(const [x,y,z] of [[-155,90,80],[170,-75,135],[150,135,30]]){
      const q=pos(x,y,z);ctx.save();ctx.globalAlpha=.25+.75*pulse;ctx.shadowBlur=17;ctx.shadowColor='#ff483d';ctx.fillStyle='#ff7766';ctx.beginPath();ctx.arc(q.x,q.y,3.5,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    // Ground spill and guiding entrance marker (the gameplay interaction pad remains authoritative).
    const q=artPoint(410,840);ctx.save();ctx.globalAlpha=.12+.08*Math.sin(t/600);ctx.fillStyle='#aaff67';ctx.beginPath();ctx.ellipse(q.x,q.y,52,20,0,0,7);ctx.fill();ctx.restore();
  }
  tower=function(s,i){
    if(i!==1||!ready){oldTower(s,i);return}
    if(!nearDepot())return;
    const at=iso(s.x,s.y,0),width=465,height=310;
    ctx.save();ctx.drawImage(art,at.x-width/2,at.y-height+88,width,height);ctx.restore();
    steam(performance.now());
  };
  warehouseDetail=function(t){
    if(!ready){oldDetail(t);return}
    if(!nearDepot())return;
    door(t);forklift(t);cargoScene(t);lights(t);guides();
  };
})();
