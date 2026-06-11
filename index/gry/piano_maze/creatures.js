/* ══ CREATURES ══ */

const CREATURE_DEFS=[
  {id:'sowa',name:'Sowa',img:CREATURE_IMGS.sowa},{id:'swinka',name:'\u015awinka',img:CREATURE_IMGS.swinka},
  {id:'szynszyla',name:'Szynszyla',img:CREATURE_IMGS.szynszyla},{id:'wiewiorka',name:'Wiewi\u00f3rka',img:CREATURE_IMGS.wiewiorka},
  {id:'winniczek',name:'Winniczek',img:CREATURE_IMGS.winniczek},{id:'wrobel',name:'Wr\u00f3bel',img:CREATURE_IMGS.wrobel},
  {id:'zabka',name:'\u017cabka',img:CREATURE_IMGS.zabka},{id:'zolw',name:'\u017c\u00f3\u0142w',img:CREATURE_IMGS.zolw},
  {id:'biedronka',name:'Biedronka',img:CREATURE_IMGS.biedronka},{id:'chomik',name:'Chomik',img:CREATURE_IMGS.chomik},
  {id:'dzdz',name:'D\u017cd\u017cownica',img:CREATURE_IMGS.dzdz},{id:'jaszczurka',name:'Jaszczurka',img:CREATURE_IMGS.jaszczurka},
  {id:'jez',name:'Je\u017c',img:CREATURE_IMGS.jez},{id:'kameleon',name:'Kameleon',img:CREATURE_IMGS.kameleon},
];
let creaturesOnMap=[],creaturesFollowing=[],creaturePositions=[];
const BASE_SPACING=20,HIST_FRAMES=900;
function playerPixelPos(){
  if(!mazeData)return{x:0,y:0};
  const cr=canvas.getBoundingClientRect(),ar=document.getElementById('canvas-wrap').getBoundingClientRect();
  return{x:cr.left-ar.left+playerC*TILE+TILE/2,y:cr.top-ar.top+playerR*TILE+TILE/2};
}
function spawnCreatures(){
  [...creaturesOnMap,...creaturesFollowing].forEach(c=>{if(c.imgEl&&c.imgEl.parentNode)c.imgEl.parentNode.removeChild(c.imgEl);});
  creaturesOnMap=[];creaturesFollowing=[];creaturePositions=[];
  if(!mazeData)return;
  const{conn,startR,startC,goalR,goalC}=mazeData,available=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)if(conn[r][c].size>0&&!(r===startR&&c===startC)&&!(r===goalR&&c===goalC))available.push({r,c});
  for(let i=available.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[available[i],available[j]]=[available[j],available[i]];}
  const wrap=document.getElementById('canvas-wrap'),count=Math.min(CREATURE_DEFS.length,available.length);
  for(let i=0;i<count;i++){
    const def=CREATURE_DEFS[i],pos=available[i],imgEl=document.createElement('img');imgEl.src=def.img;
    const cSz=Math.max(10,Math.min(36,Math.round(TILE*.40)));
    imgEl.style.cssText='position:absolute;width:'+cSz+'px;height:'+cSz+'px;image-rendering:pixelated;pointer-events:none;z-index:9;transform:translate(-50%,-50%);transition:left 0.18s linear,top 0.18s linear,opacity 0.3s;will-change:left,top;';
    imgEl.dataset.cSz=cSz;wrap.appendChild(imgEl);creaturesOnMap.push({...def,r:pos.r,c:pos.c,imgEl});
  }
  const pp=playerPixelPos();for(let i=0;i<HIST_FRAMES;i++)creaturePositions.push({...pp});
  updateCreatureHUD();updateCreaturePositions();
}
function recordPlayerPos(){
  if(!mazeData)return;creaturePositions.push(playerPixelPos());
  const n=creaturesFollowing.length,spacing=computeSpacing(n),needed=HIST_FRAMES+n*spacing+60;
  while(creaturePositions.length>needed)creaturePositions.shift();
}
function computeSpacing(n){return Math.max(10,BASE_SPACING-Math.floor(n/5)*3);}
function updateCreaturePositions(){
  if(!mazeData)return;
  const cr=canvas.getBoundingClientRect(),ar=document.getElementById('canvas-wrap').getBoundingClientRect(),ox=cr.left-ar.left,oy=cr.top-ar.top;
  creaturesOnMap.forEach(c=>{
    c.imgEl.style.left=(ox+c.c*TILE+TILE/2)+'px';c.imgEl.style.top=(oy+c.r*TILE+TILE/2)+'px';
    const fa=fogEnabled?(fogAlpha[c.r]?fogAlpha[c.r][c.c]:1):0;c.imgEl.style.opacity=fogEnabled?(fa<0.7?'1':'0'):'1';
  });
  const n=creaturesFollowing.length;if(!n)return;
  const histLen=creaturePositions.length,spacing=computeSpacing(n);
  const tp=creaturesFollowing.map((_,idx)=>{const delay=Math.round(TILE)+(idx+1)*spacing,histIdx=Math.max(0,histLen-1-delay),pos=creaturePositions[histIdx];return{x:pos.x,y:pos.y};});
  const cSzNow=creaturesFollowing.length>0?parseInt(creaturesFollowing[0].imgEl.dataset.cSz||Math.round(TILE*.75)):Math.round(TILE*.75),minDist=cSzNow*1.05;
  for(let pass=0;pass<3;pass++){for(let i=0;i<tp.length;i++)for(let j=i+1;j<tp.length;j++){const dx=tp[j].x-tp[i].x,dy=tp[j].y-tp[i].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<minDist&&dist>0.01){const push=(minDist-dist)/2+1,nx=dx/dist,ny=dy/dist;tp[i].x-=nx*push;tp[i].y-=ny*push;tp[j].x+=nx*push;tp[j].y+=ny*push;}else if(dist<=0.01){const angle=(j/tp.length)*Math.PI*2;tp[j].x+=Math.cos(angle)*minDist;tp[j].y+=Math.sin(angle)*minDist;}}}
  creaturesFollowing.forEach((c,idx)=>{c.imgEl.style.left=tp[idx].x+'px';c.imgEl.style.top=tp[idx].y+'px';c.imgEl.style.opacity='1';});
}
function refreshCreatureSizes(){
  const cSz=Math.max(10,Math.min(36,Math.round(TILE*.40)));
  [...creaturesOnMap,...creaturesFollowing].forEach(c=>{c.imgEl.style.width=cSz+'px';c.imgEl.style.height=cSz+'px';c.imgEl.dataset.cSz=cSz;});
}
function checkCreaturePickup(){
  const idx=creaturesOnMap.findIndex(c=>c.r===playerR&&c.c===playerC);
  if(idx!==-1){const creature=creaturesOnMap.splice(idx,1)[0];creaturesFollowing.push(creature);playCreatureSound(creature.id);updateCreatureHUD();}
}
function updateCreatureHUD(){const el=document.getElementById('hud-creatures');if(el)el.textContent='\uD83D\uDC3E '+creaturesFollowing.length+'/'+(creaturesOnMap.length+creaturesFollowing.length);}
</script>
</body>
