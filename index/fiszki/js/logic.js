/* ═══════════════════════════════════════
   logic.js – główna logika gry
   ═══════════════════════════════════════ */

/* ── Pula nut ── */
function pool(ct){
  const base=ct==='bass'?BASS:TREBLE;const alts=ct==='bass'?B_ALT:T_ALT;let arr;
  if(clef==='both'){
    arr=ct==='bass'
      ?(range==='small'?base.filter(n=>n.p>=3&&n.p<=10):base.filter(n=>n.p>=-6&&n.p<=10))
      :(range==='small'?base.filter(n=>n.p>=-2&&n.p<=4):base.filter(n=>n.p>=-2&&n.p<=14));
  }else if(ct==='bass'){
    arr=range==='small'?base.filter(n=>n.p>=3&&n.p<=13):base.filter(n=>n.p>=-7);
  }else{
    arr=range==='small'?base.filter(n=>n.p>=-5&&n.p<=4):base.filter(n=>n.p>=-5);
  }
  if(acc&&mode!=='place'){
    return arr.map(n=>{
      if(Math.random()<0.70){const cands=alts.filter(a=>a.p===n.p);if(cands.length)return{...cands[rnd(cands.length)],a:cands[rnd(cands.length)].a};}
      return{...n,a:null};
    });
  }
  return arr.map(n=>({...n,a:null}));
}

function getPlacePool(){
  if(clef==='both'){
    const t=range==='small'?TREBLE.filter(n=>n.p>=-2&&n.p<=4):TREBLE.filter(n=>n.p>=-5);
    const b=range==='small'?BASS.filter(n=>n.p>=3&&n.p<=10):BASS.filter(n=>n.p>=-7);
    return[...t.map(n=>({...n,ct:'treble'})),...b.map(n=>({...n,ct:'bass'}))];
  }
  if(clef==='bass'){
    const b=range==='small'?BASS.filter(n=>n.p>=3&&n.p<=13):BASS.filter(n=>n.p>=-7);
    return b.map(n=>({...n,ct:'bass'}));
  }
  const t=range==='small'?TREBLE.filter(n=>n.p>=-5&&n.p<=4):TREBLE.filter(n=>n.p>=-5);
  return t.map(n=>({...n,ct:'treble'}));
}

/* ── Główna funkcja: losuj nową nutę ── */
function go(){
  revealState=false;seqIdx=0;guessIdx=0;cooldown=false;
  notes=[];noteCanvasPositions=[];
  placeCurrentP=null;placeConfirmed=false;
  document.getElementById('namesRow').innerHTML='';
  document.getElementById('namesRowC').innerHTML='';
  document.getElementById('choiceGrid').innerHTML='';
  document.getElementById('revBtn').textContent='Pokaż nuty';
  document.getElementById('okMsg').classList.remove('show');
  if(mode==='place'){buildPlaceNote();return;}
  buildNotes();render(notes);
  if(mode==='reveal'){
    if(micOn){cnt++;document.getElementById('sCnt').textContent=cnt;updScore();}
    selfCheckActive=true;updateSelfCheckVisibility();
    document.getElementById('revealSec').style.display='flex';
    document.getElementById('choiceSec').style.display='none';
    notes.forEach(()=>{const b=document.createElement('div');b.className='nb hidden';b.textContent='?';document.getElementById('namesRow').appendChild(b);});
    resetMicUI();
  }else{
    selfCheckActive=false;updateSelfCheckVisibility();
    cnt++;document.getElementById('sCnt').textContent=cnt;
    document.getElementById('revealSec').style.display='none';
    document.getElementById('choiceSec').style.display='block';
    buildChoiceUI();
  }
  startTimer();anim();
}

function buildPlaceNote(){
  /* Panel poprzedniego zagrania NIE jest chowany przy losowaniu nowej nuty –
     ma być widoczny przez cały czas umieszczania następnej nuty.
     Znika dopiero gdy użytkownik trafi poprawnie (obsługuje showPrevAttempt). */
  /* Losuj nową nutę (nie tę samą co poprzednia) */
  const p=getPlacePool();let note,attempts=0;
  do{
    note=p[rnd(p.length)];
    if(placeTargetNote&&note.l===placeTargetNote.l&&note.p===placeTargetNote.p&&note.ct===placeTargetNote.ct)note=null;
    attempts++;
  }while(!note&&attempts<50);
  placeTargetNote=note||p[0];
  placeCurrentP=null;placeConfirmed=false;
  placeInteractClef=(placeTargetNote&&placeTargetNote.ct)?placeTargetNote.ct:(clef==='both'?'treble':clef);
  renderPlace();updatePlaceHintUI();
  const ph=document.getElementById('place-hint-text');if(ph)ph.style.display='block';
  startTimer();anim();
}

function buildNotes(){
  notes=[];
  if(clef==='both'){
    for(let i=0;i<noteCount;i++){const ct=Math.random()<0.5?'treble':'bass';const p=pool(ct);notes.push({n:p[rnd(p.length)],ct});}
  }else{
    const p=pool(clef);const usedNotes=new Set();
    for(let i=0;i<noteCount;i++){
      let note,attempts=0;
      do{
        note=p[rnd(p.length)];const noteKey=note.l+'_'+note.p;
        if(noteCount===1&&lastDrawnNote&&note.l===lastDrawnNote.l&&note.p===lastDrawnNote.p)note=null;
        if(note&&usedNotes.has(noteKey))note=null;
        attempts++;
      }while(!note&&attempts<100);
      if(note){notes.push({n:note,ct:clef});usedNotes.add(note.l+'_'+note.p);}
    }
  }
  if(noteCount===1&&notes.length>0)lastDrawnNote=notes[0].n;
}

/* ── Samoocena ── */
function updateSelfCheckVisibility(){
  const show=(mode==='reveal'&&!micOn&&selfCheckActive);
  document.getElementById('scGood').classList.toggle('visible',show);
  document.getElementById('scBad').classList.toggle('visible',show);
}
function handleSelfCheck(correct){
  if(mode==='reveal'&&!selfCheckActive)return;
  cnt++;document.getElementById('sCnt').textContent=cnt;
  if(correct){ok++;if(document.getElementById('toggleFeedbackSound').checked)playPyk(true);flyNotesFromCanvas(EMOJIS_GOOD[emojiGoodIdx]);document.getElementById('scGood').textContent=nextEmojiGood();if(kidMode)spawnKidFlower();}
  else{if(document.getElementById('toggleFeedbackSound').checked)playPyk(false);flyNotesFromCanvas(EMOJIS_BAD[emojiBadIdx]);document.getElementById('scBad').textContent=nextEmojiBad();}
  updScore();go();
}
function nextEmojiGood(){emojiGoodIdx=(emojiGoodIdx+1)%EMOJIS_GOOD.length;return EMOJIS_GOOD[emojiGoodIdx];}
function nextEmojiBad(){emojiBadIdx=(emojiBadIdx+1)%EMOJIS_BAD.length;return EMOJIS_BAD[emojiBadIdx];}

/* ── Reveal ── */
function toggleReveal(){
  revealState=!revealState;
  document.getElementById('revBtn').textContent=revealState?'Ukryj nuty':'Pokaż nuty';
  const children=document.getElementById('namesRow').children;
  notes.forEach((it,i)=>{
    const b=children[i];if(!b)return;
    if(revealState){b.classList.remove('hidden');b.textContent=formatNoteName(it.n);if(it.n.kontra)b.classList.add('kontra');}
    else{b.classList.add('hidden');b.textContent='?';b.className='nb hidden';}
  });
}

/* ── Tryb Choice ── */
function buildChoiceUI(){
  const namesRowC=document.getElementById('namesRowC');namesRowC.innerHTML='';
  notes.forEach((it,i)=>{const b=document.createElement('div');b.className='nb'+(i===0?' guess-cur':'');b.id='nc-'+i;b.textContent='?';namesRowC.appendChild(b);});
  const hintEl=document.getElementById('choice-sound-hint');if(hintEl)hintEl.style.display=(nameFormat==='sound')?'block':'none';
  guessIdx=0;render(notes,0,'#d4af37');buildChoiceButtons();
}
function buildChoiceButtons(){
  const grid=document.getElementById('choiceGrid');grid.innerHTML='';
  const it=notes[guessIdx];if(!it)return;
  const p=pool(it.ct).filter(n=>n.l!==it.n.l);
  const wrong=[];const used=new Set([it.n.l]);
  while(wrong.length<3&&wrong.length<p.length){const c=p[rnd(p.length)];if(!used.has(c.l)){used.add(c.l);wrong.push(c);}}
  const opts=shuffle([it.n,...wrong]);
  opts.forEach((n,idx)=>{
    const btn=document.createElement('button');btn.className='ch-btn'+(n.kontra?' kontra':'');
    if(nameFormat==='sound'){
      btn.innerHTML='<span style="font-size:1.6rem;">♪</span><br><span style="font-size:0.65rem;opacity:0.6;">'+(idx+1)+'</span>';btn.title=n.l;
      btn.onmouseenter=()=>playFreq(n.f,getACtx().currentTime,0.4);
      btn.ontouchstart=(e)=>{e.preventDefault();playFreq(n.f,getACtx().currentTime,0.4);};
    }else{btn.textContent=formatNoteName(n);}
    btn.dataset.noteL=n.l;btn.onclick=()=>handleChoice(n,it.n);grid.appendChild(btn);
  });
}
function handleChoice(chosen,correct){
  document.querySelectorAll('.ch-btn').forEach(b=>b.disabled=true);
  const allBtns=document.querySelectorAll('.ch-btn');const nb=document.getElementById('nc-'+guessIdx);
  if(chosen.l===correct.l){
    allBtns.forEach(b=>{if(b.dataset.noteL===correct.l)b.classList.add('ok');});
    if(nb){nb.classList.remove('guess-cur');nb.classList.add('guess-ok');nb.textContent=formatNoteName(correct);if(correct.kontra)nb.classList.add('kontra');}
    render(notes,guessIdx,'#16a34a');
    if(document.getElementById('toggleFeedbackSound').checked)playPyk(true);
    if(kidMode)spawnKidFlower();
    flyNoteAnimation(document.getElementById('C'),allBtns[0]);
    guessIdx++;
    if(guessIdx>=notes.length){ok++;updScore();cooldown=true;resetTimer();setTimeout(go,600);}
    else{const nextNb=document.getElementById('nc-'+guessIdx);if(nextNb)nextNb.classList.add('guess-cur');setTimeout(()=>{render(notes,guessIdx,'#d4af37');buildChoiceButtons();},600);}
  }else{
    if(document.getElementById('toggleFeedbackSound').checked)playPyk(false);
    allBtns.forEach(b=>{if(b.dataset.noteL===correct.l)b.classList.add('ok');});
    document.querySelectorAll('.ch-btn').forEach(b=>{if(b.dataset.noteL===chosen.l&&!b.classList.contains('ok'))b.classList.add('bad');});
    if(nb){nb.classList.remove('guess-cur');nb.classList.add('guess-bad');nb.textContent='✗';}
    render(notes,guessIdx,'#dc2626');
    setTimeout(()=>{guessIdx++;if(guessIdx>=notes.length){setTimeout(go,1000);}else{const nextNb=document.getElementById('nc-'+guessIdx);if(nextNb)nextNb.classList.add('guess-cur');setTimeout(()=>{render(notes,guessIdx,'#d4af37');buildChoiceButtons();},600);}},1200);
  }
}

/* ── Mikrofon – sukces ── */
function allGood(){
  ok++;cnt++;document.getElementById('sCnt').textContent=cnt;updScore();cooldown=true;
  if(kidMode)spawnKidFlower();
  document.getElementById('okMsg').textContent='✓ Brawo! Zagrano poprawnie!';document.getElementById('okMsg').classList.add('show');
  resetTimer();setTimeout(()=>{document.getElementById('okMsg').classList.remove('show');go();},1500);
}

/* ══════════════════════════════════════
   TRYB PLACE – drag & drop
   ══════════════════════════════════════ */
function canvasYtoP(canvasY){
  const rect=cvP.getBoundingClientRect();
  const dual=(clef==='both');const H=dual?380:280;
  const relY=(canvasY-rect.top)*(H/rect.height);
  if(dual){
    const g=STEP*2.6,PAD=50;const tops=[PAD,PAD+4*STEP+g];
    const distTreble=Math.abs(relY-(tops[0]+2*STEP));const distBass=Math.abs(relY-(tops[1]+2*STEP));
    let st,detectedClef;
    if(distTreble<=distBass){st=tops[0];detectedClef='treble';}else{st=tops[1];detectedClef='bass';}
    if(isDragging)placeInteractClef=detectedClef;
    return Math.round((st+4*STEP-relY)/(STEP/2));
  }
  const st=Math.round(H/2-2*STEP);return Math.round((st+4*STEP-relY)/(STEP/2));
}
function clampP(p){
  const pool2=getPlacePool();
  const filteredPool=(clef==='both'&&placeInteractClef)?pool2.filter(n=>n.ct===placeInteractClef):pool2;
  if(!filteredPool.length)return p;
  const minP=Math.min(...filteredPool.map(n=>n.p));const maxP=Math.max(...filteredPool.map(n=>n.p));
  return Math.max(minP,Math.min(maxP,p));
}

/* ── Strzałki ▲▼ – przesuwanie nuty krok po kroku ── */
function nudgePlace(delta){
  if(mode!=='place'||!placeTargetNote)return;
  const pool2=getPlacePool();
  const filteredPool=(clef==='both'&&placeInteractClef)?pool2.filter(n=>n.ct===placeInteractClef):pool2;
  let base=placeCurrentP;
  if(base===null||base===undefined){
    if(filteredPool.length){
      const minP=Math.min(...filteredPool.map(n=>n.p));
      const maxP=Math.max(...filteredPool.map(n=>n.p));
      base=Math.round((minP+maxP)/2);
    }else base=0;
  }
  placeConfirmed=false;
  placeCurrentP=clampP(base+delta);
  const hint=document.getElementById('place-hint-text');
  if(hint)hint.style.display='none';
  renderPlace(placeCurrentP);
}

let isDragging=false;
cvP.addEventListener('mousedown',startDrag);
cvP.addEventListener('touchstart',startDragTouch,{passive:false});
function startDrag(e){e.preventDefault();isDragging=true;placeConfirmed=false;const hint=document.getElementById('place-hint-text');if(hint)hint.style.display='none';const p=clampP(canvasYtoP(e.clientY));placeCurrentP=p;renderPlace(p);}
function startDragTouch(e){e.preventDefault();isDragging=true;placeConfirmed=false;const hint=document.getElementById('place-hint-text');if(hint)hint.style.display='none';const t=e.touches[0];const p=clampP(canvasYtoP(t.clientY));placeCurrentP=p;renderPlace(p);}
document.addEventListener('mousemove',function(e){if(!isDragging||mode!=='place')return;const p=clampP(canvasYtoP(e.clientY));placeCurrentP=p;renderPlace(p);});
document.addEventListener('touchmove',function(e){if(!isDragging||mode!=='place')return;const t=e.touches[0];const p=clampP(canvasYtoP(t.clientY));placeCurrentP=p;renderPlace(p);},{passive:false});
document.addEventListener('mouseup',function(){isDragging=false;});
document.addEventListener('touchend',function(){isDragging=false;});

function confirmPlace(){
  if(placeCurrentP===null||!placeTargetNote)return;
  /* W trybie dwóch kluczy ta sama nuta (np. c¹) może leżeć poprawnie
     zarówno na wiolinowym, jak i na basowym — liczy się nuta, na którą
     faktycznie wskazał użytkownik (placeInteractClef), nie ta losowo
     wylosowana jako "karta". */
  let correct;
  if(clef==='both'){
    const pool2=getPlacePool();
    const matchClef=placeInteractClef||placeTargetNote.ct;
    correct=pool2.some(n=>n.l===placeTargetNote.l&&n.ct===matchClef&&n.p===placeCurrentP);
  }else{
    correct=(placeCurrentP===placeTargetNote.p);
  }
  cnt++;document.getElementById('sCnt').textContent=cnt;
  const btn=document.getElementById('confirmBtn');
  if(correct){ok++;btn.classList.add('flash-good');if(document.getElementById('toggleFeedbackSound').checked)playPyk(true);flyPlaceEmoji(true);if(kidMode)spawnKidFlower();}
  else{btn.classList.add('flash-bad');if(document.getElementById('toggleFeedbackSound').checked)playPyk(false);flyPlaceEmoji(false);renderPlace(placeCurrentP,placeTargetNote.p);}
  updScore();placeConfirmed=true;
  /* Zapisz do historii */
  const entry={
    targetNote:{...placeTargetNote},
    userP:placeCurrentP,
    wasCorrect:correct,
    clefType:placeTargetNote.ct||clef
  };
  placeHistory.push(entry);
  if(!correct){
    const key=placeTargetNote.l;
    placeWrongCounts[key]=(placeWrongCounts[key]||0)+1;
  }
  /* Pokaż panel (tylko przy błędzie) już teraz, przed go() */
  showPrevAttempt(entry);
  setTimeout(()=>{btn.classList.remove('flash-good','flash-bad');go();},900);
}

/* ── Podgląd poprzedniego zagrania ── */
function getNoteLabelForP(clefType,p){
  const base=clefType==='bass'?BASS:TREBLE;
  const n=base.find(n=>n.p===p);return n?n.l:'?';
}

function showPrevAttempt(entry){
  /* Panel widoczny przez CAŁY czas umieszczania następnej nuty:
     – błąd  → pokaż panel z nowym błędnym zagraniem
     – trafił → schowaj panel (nagroda za poprawną odpowiedź)          */
  updateWrongNotesTable();
  const panel=document.getElementById('prevAttemptPanel');
  if(!panel)return;
  if(!entry||entry.wasCorrect){
    panel.style.display='none';          /* poprawna odpowiedź → chowamy */
    return;
  }
  panel.style.display='flex';            /* błąd → pokazujemy             */
  renderPrevAttempt(entry);
}

function updateWrongNotesTable(){
  const body=document.getElementById('wrongNotesBody');if(!body)return;
  body.innerHTML='';
  const sorted=Object.entries(placeWrongCounts).sort((a,b)=>b[1]-a[1]);
  sorted.forEach(([note,count])=>{
    const tr=document.createElement('tr');
    tr.innerHTML='<td><strong>'+note+'</strong></td><td>'+count+'×</td>';
    body.appendChild(tr);
  });
  const total=Object.values(placeWrongCounts).reduce((s,v)=>s+v,0);
  const badge=document.getElementById('wrongNotesBadge');
  if(badge)badge.textContent=total>0?total+'':'';
  const header=document.getElementById('wrongNotesHeader');
  if(header)header.style.display=sorted.length>0?'flex':'none';
}

function toggleWrongNotes(){
  wrongNotesOpen=!wrongNotesOpen;
  const table=document.getElementById('wrongNotesTable');
  const arr=document.querySelectorAll('#wrongNotesHeader .wnh-arrow');
  if(table)table.style.display=wrongNotesOpen?'block':'none';
  arr.forEach(el=>el.textContent=wrongNotesOpen?'▲':'▼');
}

/* ── Emoji w trybie Place ── */
function flyPlaceEmoji(correct){
  const rect=cvP.getBoundingClientRect();const x=rect.left+rect.width/2;const y=rect.top+rect.height/2;
  const emojis=correct?EMOJIS_GOOD:EMOJIS_BAD;
  spawnSpecificEmoji(x,y,emojis[Math.floor(Math.random()*emojis.length)]);
  if(document.getElementById('togglePopSound').checked)playPop();
}

/* ══════════════════════════════════════
   ANIMACJE (latające nuty / emoji)
   ══════════════════════════════════════ */
function getCanvasNoteScreenPos(idx){
  const rect=cv.getBoundingClientRect();const pos=noteCanvasPositions[idx];if(!pos)return null;
  return{x:rect.left+pos.nx*(rect.width/900),y:rect.top+pos.ny*(rect.height/440)};
}
function flyNotesFromCanvas(sharedEmoji){
  const drawCol=document.querySelector('.draw-col');const dcRect=drawCol?drawCol.getBoundingClientRect():null;
  const toX=dcRect?(dcRect.left+dcRect.width/2):window.innerWidth/2;const toY=dcRect?(dcRect.top+dcRect.height/2):window.innerHeight/2;
  notes.forEach((_,i)=>{const from=getCanvasNoteScreenPos(i);if(!from)return;setTimeout(()=>flyOneNote(from.x,from.y,toX,toY,sharedEmoji),i*80);});
}
function flyOneNote(fromX,fromY,toX,toY,emoji){
  if(document.getElementById('togglePopSound').checked)playPop();
  const note=document.createElement('div');note.className='note-fly';note.textContent='♩';
  note.style.cssText='left:'+fromX+'px;top:'+fromY+'px;color:#1e3a8a;';document.body.appendChild(note);
  const midX=(fromX+toX)/2+(Math.random()-0.5)*120;const midY=Math.min(fromY,toY)-80-Math.random()*60;
  const dur=700;const startT=performance.now();
  (function step(now){
    const t=Math.min((now-startT)/dur,1);const e2=t<0.5?2*t*t:(1-Math.pow(-2*t+2,2)/2);
    const x=(1-e2)*(1-e2)*fromX+2*(1-e2)*e2*midX+e2*e2*toX;const y=(1-e2)*(1-e2)*fromY+2*(1-e2)*e2*midY+e2*e2*toY;
    const sc=1+Math.sin(e2*Math.PI)*0.6;const op=t>0.72?1-(t-0.72)/0.28:1;
    note.style.left=x+'px';note.style.top=y+'px';note.style.transform='translate(-50%,-50%) scale('+sc+')';note.style.opacity=op;
    if(t<1){requestAnimationFrame(step);}else{note.remove();spawnSpecificEmoji(toX,toY,emoji);}
  })(startT);
}
function spawnSpecificEmoji(x,y,emoji){
  const el=document.createElement('div');el.className='emoji-float';el.textContent=emoji;
  el.style.cssText='left:'+x+'px;top:'+y+'px;';document.body.appendChild(el);
  const dur=1300;const startT=performance.now();const ampX=25+Math.random()*25;const freq=2.5+Math.random()*2;
  (function step(now){
    const t=Math.min((now-startT)/dur,1);const ease=1-Math.pow(1-t,3);const dx=Math.sin(t*Math.PI*freq)*ampX;
    const op=t>0.6?1-(t-0.6)/0.4:1;const sc=1+Math.sin(t*Math.PI)*0.5;
    el.style.left=(x+dx)+'px';el.style.top=(y-ease*120)+'px';el.style.transform='translate(-50%,-50%) scale('+sc+')';el.style.opacity=op;
    if(t<1){requestAnimationFrame(step);}else{el.remove();}
  })(startT);
}
function flyNoteAnimation(fromEl,toEl){
  const from=fromEl.getBoundingClientRect();const to=toEl.getBoundingClientRect();
  flyOneNote(from.left+from.width/2,from.top+from.height/2,to.left+to.width/2,to.top+to.height/2,'🎵');
}

/* ── Pomocnicze ── */
function rnd(n){return Math.floor(Math.random()*n);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function anim(){const c=document.getElementById('card');c.style.animation='none';c.offsetHeight;c.style.animation='fadeIn 0.35s ease';}
function updScore(){document.getElementById('cCnt').textContent=ok;document.getElementById('sPct').textContent=cnt>0?'('+Math.round(ok/cnt*100)+'% poprawnych)':'';}
