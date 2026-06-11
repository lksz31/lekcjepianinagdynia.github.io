/* ══ MAZE ENGINE ══ */

function generateMaze(){
  const conn=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>new Set()));
  const DIRS=[['N',-1,0,'S'],['S',1,0,'N'],['E',0,1,'W'],['W',0,-1,'E']];
  const sc=1+Math.floor(Math.random()*(COLS-2));
  const isRoad=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++)isRoad[r][c]=Math.random()<0.70;
  for(let r=0;r<ROWS;r++)isRoad[r][sc]=true;isRoad[0][sc]=true;
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  function dfs(r,c,fromDir){
    vis[r][c]=true;
    let ds=[...DIRS].sort(()=>Math.random()-.5);
    if(fromDir){const opp={N:'S',S:'N',E:'W',W:'E'};const perp=ds.filter(d=>d[0]!==fromDir&&d[0]!==opp[fromDir]);const rest=ds.filter(d=>!perp.includes(d));ds=Math.random()<0.55?[...perp,...rest]:ds;}
    for(const[d,dr,dc,rd]of ds){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!vis[nr][nc]&&isRoad[nr][nc]){conn[r][c].add(d);conn[nr][nc].add(rd);dfs(nr,nc,d);}}
  }
  dfs(0,sc,null);
  let best=0,gr=ROWS-1,gc=sc;
  for(let r=Math.floor(ROWS/2);r<ROWS;r++){for(let c=0;c<COLS;c++){if(conn[r][c].size>0){const dist=Math.abs(r)+Math.abs(c-sc);if(dist>best){best=dist;gr=r;gc=c;}}}}
  return{conn,startR:0,startC:sc,goalR:gr,goalC:gc};
}

// ══ FOG ══
function initFog(){
  fogState=Array.from({length:ROWS},()=>Array(COLS).fill(0));
  fogAlpha=Array.from({length:ROWS},()=>Array(COLS).fill(1));
  fogTimers={};
  if(!mazeData)return;
  revealCell(mazeData.startR,mazeData.startC,true);revealNeighbours(mazeData.startR,mazeData.startC,true);
}
function revealCell(r,c,instant){
  if(r<0||r>=ROWS||c<0||c>=COLS||fogState[r][c]===1)return;
  if(instant){fogState[r][c]=1;fogAlpha[r][c]=0;}
  else if(fogState[r][c]===0){fogState[r][c]=2;fogTimers[`${r},${c}`]=performance.now();}
}
function revealNeighbours(r,c,instant){
  if(!mazeData)return;
  const{conn}=mazeData,ALLDIRS={N:[-1,0],S:[1,0],E:[0,1],W:[0,-1]};
  for(const[d,[dr,dc]]of Object.entries(ALLDIRS)){if(conn[r][c].has(d))revealCell(r+dr,c+dc,instant);}
}
function updateFog(){
  const now=performance.now(),FADE=350;
  for(const key of Object.keys(fogTimers)){
    const[r,c]=key.split(',').map(Number);const prog=Math.min(1,(now-fogTimers[key])/FADE);
    fogAlpha[r][c]=1-prog;if(prog>=1){fogState[r][c]=1;fogAlpha[r][c]=0;delete fogTimers[key];}
  }
}

// ══ CANVAS ══
const canvas=document.getElementById('mc'),ctx=canvas.getContext('2d');
function fitCanvas(){
  const wrap=document.getElementById('canvas-wrap');
  const W=wrap.clientWidth||window.innerWidth||600,H=wrap.clientHeight||window.innerHeight||400;
  TILE=Math.max(16,Math.floor(Math.min(W/COLS,H/ROWS)));
  canvas.width=TILE*COLS;canvas.height=TILE*ROWS;canvas.style.margin='auto';
}
function assignCellTile(r,c,op){
  const k=`${r},${c}`;
  if(!cellTiles2[k])cellTiles2[k]=op.size===0?TILES_BY_PATH['WALL'][Math.floor(Math.random()*5)]:pickTileName(op);
  return cellTiles2[k];
}
function drawMaze(){
  if(!mazeData)return;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#0a1a0a';ctx.fillRect(0,0,canvas.width,canvas.height);
  const{conn,goalR,goalC}=mazeData;
  for(let r=0;r<ROWS;r++){for(let c=0;c<COLS;c++){
    const x=c*TILE,y=r*TILE,op=conn[r][c],isGoal=(r===goalR&&c===goalC);
    const tileName=assignCellTile(r,c,op),im=IMG[tileName];
    if(im&&im.complete&&im.naturalWidth>0)ctx.drawImage(im,x,y,TILE,TILE);
    else{ctx.fillStyle=op.size===0?'#111a11':'#1e3a1e';ctx.fillRect(x,y,TILE,TILE);ctx.strokeStyle='#2a3a2a';ctx.strokeRect(x+.5,y+.5,TILE-1,TILE-1);}
    if(isGoal){
      const fa=fogEnabled?fogAlpha[r][c]:0;
      if(fa<0.5&&DRZWIIMG.complete&&DRZWIIMG.naturalWidth>0){
        ctx.save();ctx.globalAlpha=(0.12+0.06*Math.sin(Date.now()*.004))*Math.max(0,1-fa*2);ctx.fillStyle='#d4af37';ctx.fillRect(x,y,TILE,TILE);ctx.restore();
        const dw=Math.round(TILE*.75),dh=Math.round(TILE*.90);ctx.drawImage(DRZWIIMG,x+(TILE-dw)/2,y+(TILE-dh)/2-Math.round(TILE*.1),dw,dh);
      }
    }
  }}
  if(fogEnabled){
    updateFog();fogBlurPhase+=0.008;
    const R=TILE*(0.333+0.12*Math.sin(fogBlurPhase));
    const fogOff=document.createElement('canvas');fogOff.width=canvas.width;fogOff.height=canvas.height;
    const fc=fogOff.getContext('2d');
    if(FOGIMG.complete&&FOGIMG.naturalWidth>0){const fw=FOGIMG.naturalWidth,fh=FOGIMG.naturalHeight,scale=Math.max(canvas.width/fw,canvas.height/fh),sw=Math.ceil(fw*scale),sh=Math.ceil(fh*scale);fc.drawImage(FOGIMG,(canvas.width-sw)/2,(canvas.height-sh)/2,sw,sh);}
    else{fc.fillStyle='rgba(160,175,190,1)';fc.fillRect(0,0,canvas.width,canvas.height);}
    fc.globalCompositeOperation='destination-out';
    for(let r=0;r<ROWS;r++){for(let c2=0;c2<COLS;c2++){
      const fogA=fogAlpha[r][c2],x0=c2*TILE,y0=r*TILE;
      if(fogA<0.02){fc.globalAlpha=1;fc.fillStyle='black';fc.fillRect(x0,y0,TILE,TILE);continue;}
      function isOpen(dr,dc){const nr=r+dr,nc=c2+dc;if(nr<0||nr>=ROWS||nc<0||nc>=COLS)return false;return fogAlpha[nr][nc]<0.3;}
      const oN=isOpen(-1,0),oS=isOpen(1,0),oW=isOpen(0,-1),oE=isOpen(0,1);
      if(oN){const g=fc.createLinearGradient(0,y0,0,y0+R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;fc.fillRect(x0,y0,TILE,R);}
      if(oS){const g=fc.createLinearGradient(0,y0+TILE,0,y0+TILE-R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;fc.fillRect(x0,y0+TILE-R,TILE,R);}
      if(oW){const g=fc.createLinearGradient(x0,0,x0+R,0);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;fc.fillRect(x0,y0,R,TILE);}
      if(oE){const g=fc.createLinearGradient(x0+TILE,0,x0+TILE-R,0);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;fc.fillRect(x0+TILE-R,y0,R,TILE);}
      const corners=[{dr:-1,dc:-1,cx:x0,cy:y0,oA:oN||oW,oB:isOpen(-1,-1)},{dr:-1,dc:1,cx:x0+TILE,cy:y0,oA:oN||oE,oB:isOpen(-1,1)},{dr:1,dc:-1,cx:x0,cy:y0+TILE,oA:oS||oW,oB:isOpen(1,-1)},{dr:1,dc:1,cx:x0+TILE,cy:y0+TILE,oA:oS||oE,oB:isOpen(1,1)}];
      for(const corner of corners){if(!corner.oA&&!corner.oB)continue;const g=fc.createRadialGradient(corner.cx,corner.cy,0,corner.cx,corner.cy,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;const rx=corner.dc<0?x0:x0+TILE-R,ry=corner.dr<0?y0:y0+TILE-R;fc.fillRect(rx,ry,R,R);}
    }}
    fc.globalCompositeOperation='source-over';fc.globalAlpha=1;ctx.drawImage(fogOff,0,0);
    if(showExitHint){const{goalR,goalC}=mazeData,alpha=fogAlpha[goalR][goalC];if(alpha>0&&POLOWINADRZWIIMG.complete&&POLOWINADRZWIIMG.naturalWidth>0){const x=goalC*TILE,y=goalR*TILE;ctx.save();ctx.globalAlpha=Math.min(alpha*1.2,1);ctx.drawImage(POLOWINADRZWIIMG,x+(TILE-TILE*.4)/2,y+TILE-TILE*.55,TILE*.4,TILE*.55);ctx.restore();}}
  }
}
function posEl(el,r,c){
  const cr=canvas.getBoundingClientRect(),ar=document.getElementById('canvas-wrap').getBoundingClientRect();
  el.style.left=(cr.left-ar.left+c*TILE+TILE/2)+'px';
  el.style.top=(cr.top-ar.top+r*TILE+TILE/2)+'px';
}
function updatePlayer(){
  const plImg=document.getElementById('pl-img'),plSize=Math.max(20,Math.min(56,Math.round(TILE*.65)));
  plImg.style.width=plSize+'px';
  const cr=canvas.getBoundingClientRect(),ar=document.getElementById('canvas-wrap').getBoundingClientRect();
  const pl=document.getElementById('pl');pl.style.left=(cr.left-ar.left+playerC*TILE+TILE/2)+'px';pl.style.top=(cr.top-ar.top+playerR*TILE+TILE/2)+'px';
}
function move(dir){
  if(won||!mazeData)return;
  const op=mazeData.conn[playerR][playerC];if(!op.has(dir))return;
  const D={N:[-1,0,'S'],S:[1,0,'N'],E:[0,1,'W'],W:[0,-1,'E']};
  const[dr,dc,rd]=D[dir];const nr=playerR+dr,nc=playerC+dc;
  if(nr<0||nr>=ROWS||nc<0||nc>=COLS||!mazeData.conn[nr][nc].has(rd))return;
  playerR=nr;playerC=nc;updatePlayer();recordPlayerPos();checkCreaturePickup();
  if(fogEnabled){revealCell(playerR,playerC,true);revealNeighbours(playerR,playerC,true);}
  if(nr===mazeData.goalR&&nc===mazeData.goalC){won=true;setTimeout(()=>showWinScreen(),500);}
}

// ══ WIN ══
function showWinScreen(){
  const total=creaturesOnMap.length+creaturesFollowing.length,got=creaturesFollowing.length;
  document.getElementById('wo-summary').textContent='Zebrałeś '+got+' z '+total+' zwierzątek!';
  const grid=document.getElementById('wo-creatures-grid');grid.innerHTML='';
  if(!creaturesFollowing.length){document.getElementById('wo-empty').style.display='block';document.getElementById('wo-creatures-title').style.display='none';}
  else{document.getElementById('wo-empty').style.display='none';document.getElementById('wo-creatures-title').style.display='block';
    creaturesFollowing.forEach(c=>{const card=document.createElement('div');card.className='wo-creature-card';const img=document.createElement('img');img.src=c.img;img.alt=c.name;const lbl=document.createElement('span');lbl.textContent=c.name;card.appendChild(img);card.appendChild(lbl);grid.appendChild(card);});}
  document.getElementById('wo').classList.add('show');
}
function newMaze(){
  won=false;stopPress();cellTiles2={};
  document.getElementById('wo').classList.remove('show');
  mazeData=generateMaze();playerR=mazeData.startR;playerC=mazeData.startC;
  buildActiveNotes();initFog();fitCanvas();updatePlayer();spawnCreatures();refreshCreatureSizes();
}
function loop(){drawMaze();updatePlayer();recordPlayerPos();updateCreaturePositions();requestAnimationFrame(loop);}

