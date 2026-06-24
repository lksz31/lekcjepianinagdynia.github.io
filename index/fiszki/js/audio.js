/* ═══════════════════════════════════════
   audio.js – odtwarzanie dźwięków
   ═══════════════════════════════════════ */
let audioCtxPlay=null;

function getACtx(){
  if(!audioCtxPlay||audioCtxPlay.state==='closed')
    audioCtxPlay=new(window.AudioContext||window.webkitAudioContext)();
  if(audioCtxPlay.state==='suspended')audioCtxPlay.resume();
  return audioCtxPlay;
}

function playFreq(freq,start,dur){
  const ac=getACtx();
  const tuned=freq*Math.pow(2,micTuneSteps/12);
  const osc=ac.createOscillator(),gain=ac.createGain();
  osc.type='triangle';osc.frequency.value=tuned;
  gain.gain.setValueAtTime(0,start);
  gain.gain.linearRampToValueAtTime(0.35,start+0.02);
  gain.gain.setValueAtTime(0.35,start+dur-0.05);
  gain.gain.linearRampToValueAtTime(0,start+dur);
  osc.connect(gain);gain.connect(ac.destination);
  osc.start(start);osc.stop(start+dur);
}

function playNotes(){
  if(!notes.length)return;
  const ac=getACtx();const now=ac.currentTime;
  notes.forEach((it,i)=>playFreq(it.n.f,now+i*0.6,0.55));
}

function playCurrentGuess(){
  if(guessIdx>=notes.length)return;
  const it=notes[guessIdx];
  if(it)playFreq(it.n.f,getACtx().currentTime,1.0);
}

function playPlaceTarget(){
  if(placeTargetNote)playFreq(placeTargetNote.f,getACtx().currentTime,1.0);
}

function playPyk(correct){
  /* W trybie dziecięcym:
     - błąd  → szybki przelot pszczółki (runBeeAnim)
     - sukces → animację startuje spawnKidFlower (runBeeToFlower)  */
  if(kidMode&&!correct&&typeof runBeeAnim==='function')runBeeAnim(false);
  try{
    const ac=getACtx();const now=ac.currentTime;
    const osc=ac.createOscillator();const gain=ac.createGain();
    osc.connect(gain);gain.connect(ac.destination);
    if(correct){
      osc.type='sine';osc.frequency.setValueAtTime(523,now);
      osc.frequency.exponentialRampToValueAtTime(784,now+0.10);
      gain.gain.setValueAtTime(0.22,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.32);
      osc.start(now);osc.stop(now+0.32);
    }else{
      osc.type='sine';osc.frequency.setValueAtTime(220,now);
      osc.frequency.exponentialRampToValueAtTime(140,now+0.18);
      gain.gain.setValueAtTime(0.18,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.28);
      osc.start(now);osc.stop(now+0.28);
    }
  }catch(e){}
}

function playPop(){
  try{
    const ac=getACtx();const now=ac.currentTime;
    const osc=ac.createOscillator();const gain=ac.createGain();
    osc.type='sine';osc.frequency.setValueAtTime(800,now);
    osc.frequency.exponentialRampToValueAtTime(400,now+0.06);
    gain.gain.setValueAtTime(0.18,now);gain.gain.exponentialRampToValueAtTime(0.001,now+0.09);
    osc.connect(gain);gain.connect(ac.destination);
    osc.start(now);osc.stop(now+0.09);
  }catch(e){}
}
