/* ═══════════════════════════════════════
   canvas.js – rysowanie pięciolinii i nut
   ═══════════════════════════════════════ */
const STEP=20, LX=95, RE=28;
const cv=document.getElementById('C');
const ctx2d=cv.getContext('2d');
const cvP=document.getElementById('Cplace');
const ctxP=cvP.getContext('2d');

function ny(st,p){return st+4*STEP-p*(STEP/2);}

/* Czcionka muzyczna */
const cfont=new FontFace('NotoMusic',"url('https://fonts.gstatic.com/s/notomusic/v20/pe0rMImSLYT1-7EeGl95MqrFJA.woff2')");
cfont.load().then(f=>{document.fonts.add(f);render([]);renderPlace();}).catch(()=>{});

/* ── Pozycje nut na canvasie (dla animacji) ── */
function computeNotePositions(items,tops,clefs,ns,nw){
  noteCanvasPositions=[];
  const sp=nw/(items.length+1);
  items.forEach((it,i)=>{
    const dual=(clef==='both');
    if(dual){
      const si=clefs.indexOf(it.ct);
      if(si<0){noteCanvasPositions.push(null);return;}
      noteCanvasPositions.push({nx:ns+sp*(i+1),ny:ny(tops[si],it.n.p)});
    }else{
      noteCanvasPositions.push({nx:ns+sp*(i+1),ny:ny(tops[0],it.n.p)});
    }
  });
}

/* ── Klamra Grand Staff ── */
function _drawBrace(ctxR,tops){
  const ty=tops[0],by=tops[1]+4*STEP,mid=(ty+by)/2,aw=15;
  ctxR.save();ctxR.strokeStyle='#1e3a8a';ctxR.fillStyle='#1e3a8a';ctxR.lineCap='round';
  ctxR.lineWidth=2.2;ctxR.beginPath();ctxR.moveTo(LX-3,ty);ctxR.lineTo(LX-3,by);ctxR.stroke();
  ctxR.lineWidth=1.6;
  ctxR.beginPath();ctxR.moveTo(LX-3,ty);ctxR.bezierCurveTo(LX-3-aw*0.7,ty+(mid-ty)*0.2,LX-3-aw,mid-STEP,LX-3-aw*0.2,mid);ctxR.stroke();
  ctxR.beginPath();ctxR.moveTo(LX-3-aw*0.2,mid);ctxR.bezierCurveTo(LX-3-aw,mid+STEP,LX-3-aw*0.7,by-(by-mid)*0.2,LX-3,by);ctxR.stroke();
  ctxR.beginPath();ctxR.moveTo(LX-3,ty);ctxR.lineTo(LX-9,ty+11);ctxR.lineTo(LX-1,ty+6);ctxR.closePath();ctxR.fill();
  ctxR.beginPath();ctxR.moveTo(LX-3,by);ctxR.lineTo(LX-9,by-11);ctxR.lineTo(LX-1,by-6);ctxR.closePath();ctxR.fill();
  ctxR.restore();
}

/* ── Klucze (treble / bass) ──
   Klucz basowy przesunięty o jedną pozycję wyżej (STEP/2 = 10 px)   */
function _drawClef(ctx,which,st){
  ctx.save();ctx.fillStyle='#1e3a8a';
  if(which==='treble'){
    ctx.font=(STEP*5.5*0.92)+'px NotoMusic,Times New Roman,serif';
    ctx.textBaseline='top';
    ctx.fillText(String.fromCodePoint(0x1D11E),LX+3,st-STEP*0.37);
  }else{
    ctx.font=(STEP*4.2*1.1)+'px NotoMusic,Times New Roman,serif';
    ctx.textBaseline='top';
    /* POPRAWKA: przesunięto klucz basowy o 1 pozycję wyżej (−STEP zamiast −STEP*0.5) */
    ctx.fillText(String.fromCodePoint(0x1D122),LX+2,st-STEP*1.0);
  }
  ctx.restore();
}

/* ── Rysowanie linii pięciolinii ── */
function _drawStaffLines(ctxR,st,W){
  ctxR.strokeStyle='#1e3a8a';ctxR.lineWidth=1.5;
  for(let i=0;i<5;i++){const y=st+i*STEP;ctxR.beginPath();ctxR.moveTo(LX,y);ctxR.lineTo(W-RE,y);ctxR.stroke();}
  ctxR.lineWidth=2.5;ctxR.beginPath();ctxR.moveTo(LX,st);ctxR.lineTo(LX,st+4*STEP);ctxR.stroke();
}

/* ── Główny render (tryb reveal/choice) ── */
function render(items,highlightIdx=-1,highlightColor='#1e3a8a'){
  const dpr=Math.min(window.devicePixelRatio||1,3);
  const W=900,H=440;
  cv.width=W*dpr;cv.height=H*dpr;
  ctx2d.setTransform(dpr,0,0,dpr,0,0);
  ctx2d.clearRect(0,0,W,H);
  ctx2d.fillStyle='#fff';ctx2d.beginPath();ctx2d.roundRect(0,0,W,H,12);ctx2d.fill();
  const dual=(clef==='both');
  let tops,clefs2;
  if(dual){const g=STEP*2.6,tot=4*STEP+g+4*STEP,sy=Math.round((H-tot)/2);tops=[sy,sy+4*STEP+g];clefs2=['treble','bass'];}
  else{tops=[Math.round(H/2-2*STEP)];clefs2=[clef];}
  if(dual)_drawBrace(ctx2d,tops);
  tops.forEach((st,si)=>{_drawStaffLines(ctx2d,st,W);_drawClef(ctx2d,clefs2[si],st);});
  ctx2d.strokeStyle='#1e3a8a';ctx2d.lineWidth=2.5;
  ctx2d.beginPath();ctx2d.moveTo(W-RE,tops[0]);ctx2d.lineTo(W-RE,tops[tops.length-1]+4*STEP);ctx2d.stroke();
  if(!items||!items.length)return;
  const ns=LX+90,ne=W-RE-15,nw=ne-ns;
  computeNotePositions(items,tops,clefs2,ns,nw);
  const sp=nw/(items.length+1);
  items.forEach((it,i)=>{
    const st=dual?tops[clefs2.indexOf(it.ct)]:tops[0];
    if(st===undefined)return;
    drawNote(ctx2d,st,it.n,ns+sp*(i+1),it.n.p<=4,i===highlightIdx?highlightColor:'#1e3a8a',it.n.a,it.ct==='bass');
  });
}

/* ── Render trybu Place ── */
function renderPlace(dragP,correctP){
  const dpr=Math.min(window.devicePixelRatio||1,3);
  const dual=(clef==='both');
  const W=900,H=dual?380:280;
  cvP.width=W*dpr;cvP.height=H*dpr;
  ctxP.setTransform(dpr,0,0,dpr,0,0);
  ctxP.clearRect(0,0,W,H);
  ctxP.fillStyle='#fff';ctxP.beginPath();ctxP.roundRect(0,0,W,H,12);ctxP.fill();
  let tops,clefs2;
  if(dual){const g=STEP*2.6,PAD=50;tops=[PAD,PAD+4*STEP+g];clefs2=['treble','bass'];}
  else{tops=[Math.round(H/2-2*STEP)];clefs2=[clef];}
  if(dual)_drawBrace(ctxP,tops);
  tops.forEach((st,si)=>{_drawStaffLines(ctxP,st,W);_drawClef(ctxP,clefs2[si],st);});
  ctxP.strokeStyle='#1e3a8a';ctxP.lineWidth=2.5;
  ctxP.beginPath();ctxP.moveTo(W-RE,tops[0]);ctxP.lineTo(W-RE,tops[tops.length-1]+4*STEP);ctxP.stroke();
  const nx=W/2;
  const tClef=placeTargetNote?(placeTargetNote.ct||clef):clef;
  const dragClef=(dual&&placeInteractClef)?placeInteractClef:tClef;
  const activeClef=dual?dragClef:clef;
  const activeSt=dual?tops[clefs2.indexOf(activeClef)]:tops[0];
  const correctClef=dual?tClef:clef;
  const correctSt=dual?tops[clefs2.indexOf(correctClef)]:tops[0];
  const poolFiltered=getPlacePool().filter(n=>(!dual)||(n.ct===activeClef));
  if(poolFiltered.length>0){
    const minP=Math.min(...poolFiltered.map(n=>n.p));
    const maxP=Math.max(...poolFiltered.map(n=>n.p));
    for(let p=minP;p<=maxP;p+=2){
      if(p<-2||p>8){const ly=ny(activeSt,p);ctxP.save();ctxP.strokeStyle='rgba(30,58,138,0.12)';ctxP.lineWidth=1.2;ctxP.beginPath();ctxP.moveTo(nx-22,ly);ctxP.lineTo(nx+22,ly);ctxP.stroke();ctxP.restore();}
    }
  }
  if(correctP!==undefined&&correctP!==null)drawNote(ctxP,correctSt,{p:correctP,l:'',f:0,a:null},nx,correctP<=4,'#16a34a',null,correctClef==='bass');
  if(dragP!==undefined&&dragP!==null){const col=(correctP!==undefined)?'#ef4444':'rgba(30,58,138,0.7)';drawNote(ctxP,activeSt,{p:dragP,l:'',f:0,a:null},nx,dragP<=4,col,null,activeClef==='bass');}
}

/* ── Render mini-canvasu „poprzednie zagranie" ── */
function renderPrevAttempt(entry){
  const cvPrev=document.getElementById('Cprev');
  if(!cvPrev||!entry)return;
  const ctx=cvPrev.getContext('2d');
  const dpr=Math.min(window.devicePixelRatio||1,3);
  const W=900,H=148;
  cvPrev.width=W*dpr;cvPrev.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.clearRect(0,0,W,H);
  /* tło zależne od wyniku */
  ctx.fillStyle=entry.wasCorrect?'#f0fdf4':'#fff8f8';
  ctx.beginPath();ctx.roundRect(0,0,W,H,10);ctx.fill();
  ctx.strokeStyle=entry.wasCorrect?'#86efac':'#fca5a5';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(1,1,W-2,H-2,10);ctx.stroke();
  /* pięciolinia (szara, kompaktowa) */
  const st=Math.round(H/2-2*STEP)-4;
  ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.3;
  for(let i=0;i<5;i++){const y=st+i*STEP;ctx.beginPath();ctx.moveTo(LX,y);ctx.lineTo(W-RE,y);ctx.stroke();}
  ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(LX,st);ctx.lineTo(LX,st+4*STEP);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W-RE,st);ctx.lineTo(W-RE,st+4*STEP);ctx.stroke();
  /* klucz */
  const ct=entry.clefType||'treble';
  _drawClef(ctx,ct,st);
  /* nuty */
  const ns=LX+90,ne=W-RE-15,nw=ne-ns;
  const isBass=ct==='bass';
  const FONT='bold 12px Poppins,sans-serif';
  const labelY=H-5;
  if(entry.wasCorrect){
    const nx=ns+nw/2;
    drawNote(ctx,st,{p:entry.targetNote.p,l:'',f:0,a:entry.targetNote.a||null},nx,entry.targetNote.p<=4,'#16a34a',entry.targetNote.a||null,isBass);
    ctx.font=FONT;ctx.fillStyle='#16a34a';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText('✓ '+entry.targetNote.l,nx,labelY);
  }else{
    const nxU=ns+nw*0.28,nxC=ns+nw*0.72;
    const userName=getNoteLabelForP(ct,entry.userP);
    drawNote(ctx,st,{p:entry.userP,l:'',f:0,a:null},nxU,entry.userP<=4,'#ef4444',null,isBass);
    drawNote(ctx,st,{p:entry.targetNote.p,l:'',f:0,a:entry.targetNote.a||null},nxC,entry.targetNote.p<=4,'#16a34a',entry.targetNote.a||null,isBass);
    /* linia podziału */
    ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(ns+nw*0.5,6);ctx.lineTo(ns+nw*0.5,H-6);ctx.stroke();
    ctx.font=FONT;ctx.textBaseline='bottom';ctx.textAlign='center';
    ctx.fillStyle='#ef4444';ctx.fillText('Twoja: '+userName,nxU,labelY);
    ctx.fillStyle='#16a34a';ctx.fillText('Poprawna: '+entry.targetNote.l,nxC,labelY);
  }
}

/* ── Rysowanie nuty (z obsługą trybu dziecięcego) ── */
function drawNote(ctx,st,n,nx,stemUp,col,accSign,isBasClef){
  const nyv=ny(st,n.p);
  const rx=STEP*0.70,ry=STEP*0.49,lw=rx*2.8;
  ctx.strokeStyle=col;ctx.lineWidth=1.6;
  if(n.p<=-2){for(let p=-2;p>=n.p;p-=2){const ly=ny(st,p);ctx.beginPath();ctx.moveTo(nx-lw/2,ly);ctx.lineTo(nx+lw/2,ly);ctx.stroke();}}
  if(n.p>=10){for(let p=10;p<=n.p;p+=2){const ly=ny(st,p);ctx.beginPath();ctx.moveTo(nx-lw/2,ly);ctx.lineTo(nx+lw/2,ly);ctx.stroke();}}
  if(accSign){ctx.font='bold '+(STEP*1.575)+'px serif';ctx.fillStyle=col;ctx.textBaseline='middle';ctx.fillText(accSign==='#'?'♯':'♭',nx-rx-STEP*1.575,nyv);}
  if(kidMode&&BEE_IMG.complete&&BEE_IMG.naturalWidth>0){
    const beeH=STEP*1.7,ratio=BEE_IMG.naturalWidth/BEE_IMG.naturalHeight,beeW=beeH*ratio;
    ctx.save();ctx.globalAlpha=beeOpacity;ctx.drawImage(BEE_IMG,nx-beeW*0.5,nyv-beeH*0.5-4,beeW,beeH);ctx.restore();
  }else{
    ctx.save();ctx.translate(nx,nyv);ctx.rotate(-0.22);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.strokeStyle=col;ctx.lineWidth=2;const sl=STEP*3.5;
    if(stemUp){ctx.beginPath();ctx.moveTo(nx+rx-1,nyv);ctx.lineTo(nx+rx-1,nyv-sl);ctx.stroke();}
    else{ctx.beginPath();ctx.moveTo(nx-rx+1,nyv);ctx.lineTo(nx-rx+1,nyv+sl);ctx.stroke();}
  }
}
