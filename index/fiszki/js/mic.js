/* ═══════════════════════════════════════
   mic.js – detekcja wysokości dźwięku przez mikrofon
   POPRAWKA: f2name miało offset +0 zamiast +9 od A440,
             przez co każda nuta była wyświetlana o tercję wyżej.
   ═══════════════════════════════════════ */

async function toggleMic(){
  if(micOn){stopMic();updateSelfCheckVisibility();updScore();return;}
  try{
    micSt=await navigator.mediaDevices.getUserMedia({
      audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}
    });
    aCtx=new(window.AudioContext||window.webkitAudioContext)();
    const src=aCtx.createMediaStreamSource(micSt);
    const gain=aCtx.createGain();gain.gain.value=micGain;src.connect(gain);
    analyser=aCtx.createAnalyser();analyser.fftSize=8192;analyser.smoothingTimeConstant=0.6;
    gain.connect(analyser);
    micOn=true;
    ['micBtn','micBtnCard'].forEach(id=>{
      const el=document.getElementById(id);
      if(el){el.classList.add('on');el.textContent='🎤 Wyłącz';}
    });
    document.getElementById('micPanel').classList.add('on');
    pitchInt=setInterval(detectPitch,100);
    updateSelfCheckVisibility();updScore();
  }catch(e){alert('Brak dostępu do mikrofonu.');}
}

function stopMic(){
  if(pitchInt){clearInterval(pitchInt);pitchInt=null;}
  if(micSt){micSt.getTracks().forEach(t=>t.stop());micSt=null;}
  if(aCtx){aCtx.close();aCtx=null;}
  analyser=null;
  micOn=false;
  ['micBtn','micBtnCard'].forEach(id=>{
    const el=document.getElementById(id);
    if(el){el.classList.remove('on');el.textContent='🎤 Mikrofon';}
  });
  document.getElementById('micPanel').classList.remove('on');
}

function resetMicUI(){
  document.getElementById('micDet').textContent='—';
  document.getElementById('micRes').className='mic-res wait';
  document.getElementById('micRes').textContent='Graj nutę...';
  document.getElementById('pitchBar').style.width='0';
}

function updateFeedback(text,className){
  const res=document.getElementById('micRes');
  res.textContent=text;res.className='mic-res '+className;
}

function detectPitch(){
  if(!analyser||!notes.length||cooldown)return;
  const buf=new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);
  const vol=getVol(buf);
  document.getElementById('pitchBar').style.width=Math.min(100,vol*400)+'%';
  if(vol<0.006){freqHist=[];document.getElementById('pitchBar').style.background='var(--navy)';return;}
  const freq=autoCorr(buf,aCtx.sampleRate);
  if(freq<0){freqHist=[];return;}
  const corrFreq=freq/Math.pow(2,micTuneSteps/12);
  freqHist.push(corrFreq);if(freqHist.length>4)freqHist.shift();
  document.getElementById('micDet').textContent=f2name(corrFreq)+' ('+Math.round(corrFreq)+' Hz)';
  const target=seqIdx<notes.length?[notes[seqIdx]]:[];
  const bar=document.getElementById('pitchBar');
  if(!target.length)return;
  const targetFreq=target[0].n.f;
  /* dopasowanie z tolerancją oktawową (piano może dać silniejszą harmoniczną) */
  const matchC=freqHist.filter(f=>{
    for(let shift=-1;shift<=1;shift++){
      const adj=f*Math.pow(2,shift);
      if(Math.abs(adj-targetFreq)/targetFreq<micTolerance)return true;
    }
    return false;
  }).length;
  if(matchC>=3){
    updateFeedback('Dobrze','ok');bar.style.background='#16a34a';freqHist=[];
    const b=document.getElementById('namesRow').children[seqIdx];
    if(b){b.classList.remove('hidden','guess-cur');b.classList.add('guess-ok');b.textContent=notes[seqIdx].n.l;if(notes[seqIdx].n.kontra)b.classList.add('kontra');}
    seqIdx++;
    if(seqIdx>=notes.length){allGood();}
    else{
      const nb=document.getElementById('namesRow').children[seqIdx];
      if(nb)nb.classList.add('guess-cur');
      if(feedbackTimeout)clearTimeout(feedbackTimeout);
      feedbackTimeout=setTimeout(()=>{updateFeedback('Następny','wait');},800);
    }
  }else if(vol>0.015){
    const semitones=Math.abs(Math.round(12*Math.log2(corrFreq/targetFreq)));
    if(semitones===1){updateFeedback('Obok','bad');bar.style.background='#f59e0b';}
    else if(semitones>1){updateFeedback('Zagrałeś '+f2name(corrFreq),'bad');bar.style.background='#dc2626';}
  }
}

/* ── Autokorelacja (estymacja częstotliwości) ── */
function autoCorr(buf,sr){
  let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);
  if(rms<0.005)return-1;
  let r1=0,r2=buf.length-1;
  for(let i=0;i<buf.length/2;i++){if(Math.abs(buf[i])<0.12){r1=i;break;}}
  for(let i=1;i<buf.length/2;i++){if(Math.abs(buf[buf.length-i])<0.12){r2=buf.length-i;break;}}
  const s=buf.slice(r1,r2);if(s.length<2)return-1;
  const c=new Float32Array(s.length);
  for(let i=0;i<s.length;i++)for(let j=0;j<s.length-i;j++)c[i]+=s[j]*s[j+i];
  let d=0;while(d<c.length-1&&c[d]>c[d+1])d++;
  let mv=-1,mp=-1;for(let i=d;i<s.length;i++){if(c[i]>mv){mv=c[i];mp=i;}}if(mp<1)return-1;
  let T=mp;
  if(T>0&&T<c.length-1){const a=(c[T-1]+c[T+1]-2*c[T])/2,b=(c[T+1]-c[T-1])/2;if(a)T-=b/(2*a);}
  const f=sr/T;
  return(f<50||f>4500)?-1:f;
}

function getVol(buf){let s=0;for(const v of buf)s+=v*v;return Math.sqrt(s/buf.length);}

/* ── f2name: zamiana Hz → nazwa nuty (POPRAWKA: +9 offset od A=440) ──
   Poprzedni kod: idx=((semi%12)+12)%12 – brak offsetu, wyświetlało nuty
   o 3 półtony (tercję małą) wyżej niż rzeczywiście grana nuta.
   Poprawne: A4=440Hz → semi=0 → idx=(0+9)%12=9 → 'A' ✓            */
function f2name(f){
  const pl=['C','Cis','D','Es','E','F','Fis','G','Gis','A','B','H'];
  const semi=Math.round(12*Math.log2(f/440));
  const idx=((semi+9)%12+12)%12;          /* ← POPRAWKA (+9) */
  const oct=4+Math.floor((semi+9)/12);
  const sfx={1:'',2:'',3:'',4:'¹',5:'²',6:'³'};
  return pl[idx]+(sfx[oct]||oct);
}
