/* ═══════════════════════════════════════
   ui.js – ustawienia, timery, panel sterowania
   ═══════════════════════════════════════ */

/* ── Klawisze trybu ── */
function setMode(m){
  mode=m;cnt=0;ok=0;selfCheckActive=false;
  document.getElementById('sCnt').textContent='0';
  document.getElementById('cCnt').textContent='0';
  document.getElementById('sPct').textContent='';
  ['reveal','place','choice'].forEach(id=>{
    const el=document.getElementById('mb-'+id);
    if(el)el.classList.toggle('active',id===m);
  });
  notes=[];placeTargetNote=null;placeCurrentP=null;
  document.getElementById('namesRow').innerHTML='';
  document.getElementById('namesRowC').innerHTML='';
  document.getElementById('choiceGrid').innerHTML='';
  document.getElementById('revBtn').textContent='Pokaż nuty';
  document.getElementById('okMsg').classList.remove('show');

  const isPlace=(m==='place');
  document.getElementById('revealChoiceWrap').style.display=(m==='reveal'||m==='choice')?'flex':'none';
  document.getElementById('placeModeWrap').style.display=isPlace?'flex':'none';
  document.getElementById('micSettingsOuter').style.display=isPlace?'none':'block';
  document.getElementById('note-settings-group').style.display='';
  document.getElementById('row-acc').style.display='flex';
  document.getElementById('row-name-format').style.display=isPlace?'none':'flex';
  const soundBtn=document.getElementById('cb-nf-sound');
  if(soundBtn)soundBtn.style.display=(m==='choice')?'':'none';
  if(m!=='choice'&&nameFormat==='sound')setNameFormat('pl');
  document.getElementById('row-notecount').style.display=isPlace?'none':'flex';
  document.getElementById('row-place-hint').style.display=isPlace?'flex':'none';
  if(m!=='reveal'&&micOn)stopMic();
  updateSelfCheckVisibility();
  if(isPlace)render([]);
  go();
}

/* ── Klucz ── */
function setClef(c){
  clef=c;
  ['treble','bass','both'].forEach(id=>document.getElementById('cb-'+id).classList.toggle('active',id===c));
  notes=[];placeTargetNote=null;placeCurrentP=null;
  document.getElementById('namesRow').innerHTML='';
  document.getElementById('namesRowC').innerHTML='';
  document.getElementById('choiceGrid').innerHTML='';
  render([]);renderPlace();
}

/* ── Zakres ── */
function setRange(r){
  range=r;
  document.getElementById('cb-small').classList.toggle('active',r==='small');
  document.getElementById('cb-full').classList.toggle('active',r==='full');
}

/* ── Diatonika/chromatyka ── */
function setAcc(){
  acc=!acc;
  const btn=document.getElementById('cb-acc');
  btn.classList.toggle('active',acc);
  btn.textContent=acc?'Chromatyczne':'Diatoniczne';
}

/* ── Format nazwy nuty ── */
function setNameFormat(f){
  nameFormat=f;
  ['pl','en','both','sound'].forEach(id=>{
    const el=document.getElementById('cb-nf-'+id);if(el)el.classList.toggle('active',id===f);
  });
  if(mode==='choice'&&notes.length>0)buildChoiceButtons();
}

function formatNoteName(note){
  const pl=note.l;const en=noteEN(note);
  if(nameFormat==='pl')return pl;
  if(nameFormat==='en')return en;
  return pl+' / '+en;
}

function setN(n){noteCount=n;}

/* ── Podpowiedź w trybie Place ── */
function updatePlaceHintUI(){
  const n=placeTargetNote;
  if(!n){document.getElementById('placeTargetNote').textContent='—';return;}
  const sub=document.getElementById('placeTargetSub');
  const noteEl=document.getElementById('placeTargetNote');
  const playBtn=document.getElementById('placePlayBtn');
  noteEl.classList.remove('kontra','subkontra');
  if(placeHint==='en'){sub.textContent='Umieść:';noteEl.textContent=noteEN(n);noteEl.style.display='block';playBtn.style.display='none';}
  else if(placeHint==='pl'){sub.textContent='Umieść:';noteEl.textContent=n.l;if(n.kontra)noteEl.classList.add('kontra');if(n.subkontra)noteEl.classList.add('subkontra');noteEl.style.display='block';playBtn.style.display='none';}
  else{sub.textContent='Umieść:';noteEl.style.display='none';playBtn.style.display='block';setTimeout(()=>playPlaceTarget(),200);}
}

function setPlaceHint(h){
  placeHint=h;
  ['en','pl','sound'].forEach(id=>document.getElementById('cb-hint-'+id).classList.toggle('active',id===h));
  updatePlaceHintUI();
}

/* ── Timer ── */
function setTimer(s){
  timerSec=s;stopTimer();
  [0,5,10,30].forEach(t=>document.getElementById('cb-t'+t).classList.toggle('active',t===s));
  const d=document.getElementById('timerDisp');
  d.classList.toggle('active',s>0);if(s>0)d.textContent=fmt(s);
}
function fmt(s){return Math.floor(s/60)+':'+(s%60).toString().padStart(2,'0');}
function startTimer(){
  stopTimer();if(!timerSec)return;
  timerLeft=timerSec;const d=document.getElementById('timerDisp');
  d.textContent=fmt(timerLeft);d.classList.remove('warn');
  timerInt=setInterval(()=>{timerLeft--;d.textContent=fmt(timerLeft);if(timerLeft<=3)d.classList.add('warn');if(timerLeft<=0){stopTimer();go();}},1000);
}
function stopTimer(){if(timerInt){clearInterval(timerInt);timerInt=null;}}
function resetTimer(){
  stopTimer();if(!timerSec)return;
  const d=document.getElementById('timerDisp');d.classList.remove('warn');timerLeft=timerSec;d.textContent=fmt(timerLeft);
  timerInt=setInterval(()=>{timerLeft--;d.textContent=fmt(timerLeft);if(timerLeft<=3)d.classList.add('warn');if(timerLeft<=0){stopTimer();go();}},1000);
}

/* ── Toggles ── */
function togglePanel(){
  panelOpen=!panelOpen;
  document.getElementById('ctrlBody').classList.toggle('collapsed',!panelOpen);
  document.getElementById('collapseBtn').textContent=panelOpen?'▲ Zwiń':'▼ Rozwiń';
}
function toggleMicPanel(){
  micSettingsOpen=!micSettingsOpen;
  document.getElementById('micSettingsBody').classList.toggle('collapsed',!micSettingsOpen);
  document.getElementById('micPanelBtn').textContent=micSettingsOpen?'▲ Zwiń':'▼ Rozwiń';
}
function updatePlayBtnVisibility(){
  const show=document.getElementById('togglePlayBtn').checked;
  ['playBtnEl','playBtnChoiceEl'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=show?'':'none';});
}

/* ── Suwaki mikrofonu ── */
function updateTolLabel(v){micTolerance=v/1000;document.getElementById('tolVal').textContent=(v/10).toFixed(1)+'%';}
function updateGainLabel(v){micGain=v/10;document.getElementById('gainVal').textContent=(v/10).toFixed(1)+'×';}
function updateTuneLabel(v){micTuneSteps=+v;document.getElementById('tuneVal').textContent=(v>=0?'+':'')+v+' st.';}
