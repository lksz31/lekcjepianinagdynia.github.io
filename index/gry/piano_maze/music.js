/* ══ MUSIC ENGINE ══ */

let audioCtx=null,musicEnabled=true,sfxEnabled=true,musicVol=0.08,sfxVol=0.70;
let musicMasterGain=null,sfxMasterGain=null,technoRunning=false,technoScheduler=null;
let technoNextBeat=0,technoStep16=0;

// FIX 2: noiseBuf declared at module scope BEFORE any function that uses it
let noiseBuf=null;

const CHIP_BPM=130,CHIP_STEP=60/CHIP_BPM/4;

function ensureAudioCtx(){
  if(!audioCtx){
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    musicMasterGain=audioCtx.createGain();musicMasterGain.gain.value=musicEnabled?musicVol:0;musicMasterGain.connect(audioCtx.destination);
    sfxMasterGain=audioCtx.createGain();sfxMasterGain.gain.value=sfxEnabled?sfxVol:0;sfxMasterGain.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended')audioCtx.resume();
  return audioCtx;
}
function midiHz(n){return 440*Math.pow(2,(n-69)/12);}

// FIX 1: ALL midi constants defined here, including Db4=61
const A2=45,B2=47,C3=48,D3=50,E3=52,F3=53,G3=55,
      A3=57,B3=59,C4=60,D4=62,E4=64,F4=65,G4=67,
      A4=69,B4=71,C5=72,D5=74,E5=76,F5=77,G5=79,A5=81,
      Gs2=44,Gs3=56,Gs4=68,Bb2=46,Bb3=58,Bb4=70,
      Eb3=51,Eb4=63,Eb5=75,
      Db3=49,Db4=61,Db5=73,
      Fs3=54,Fs4=66;

const MELODY_SEQ=[
  E4,-1,E4,D4,C4,-1,A3,-1,C4,D4,E4,-1,G4,-1,A4,-1,G4,-1,F4,E4,D4,-1,B3,-1,C4,-1,A3,Gs3,A3,-1,-1,-1,
  C5,B4,A4,G4,F4,E4,D4,C4,Bb3,-1,C4,-1,D4,E4,-1,-1,A3,C4,E4,G4,A4,-1,G4,E4,D4,C4,B3,A3,-1,-1,A3,-1,
  A3,-1,G3,A3,C4,-1,E4,-1,D4,C4,B3,-1,A3,-1,G3,-1,F3,G3,A3,-1,C4,B3,A3,G3,A3,-1,-1,E3,A3,-1,-1,-1,
  A4,Gs4,G4,Fs4,F4,E4,Eb4,D4,C4,-1,D4,-1,E4,-1,F4,-1,G4,F4,E4,D4,C4,B3,A3,Gs3,A3,-1,-1,-1,A3,C4,E4,-1,
  E5,-1,D5,C5,B4,-1,A4,-1,C5,B4,A4,-1,G4,A4,B4,-1,C5,-1,B4,A4,G4,-1,E4,-1,F4,G4,A4,-1,E4,-1,A4,-1,
  F4,-1,G4,A4,Bb4,-1,A4,G4,F4,E4,D4,-1,C4,-1,D4,-1,Bb3,C4,D4,E4,F4,-1,G4,-1,A4,-1,G4,F4,E4,D4,C4,-1,
  E4,Fs4,E4,D4,C4,D4,C4,A3,C4,D4,E4,Fs4,G4,-1,A4,-1,G4,Fs4,F4,E4,D4,C4,B3,A3,C4,E4,A3,Gs3,A3,-1,-1,-1,
  A3,B3,C4,D4,E4,F4,G4,A4,B4,A4,G4,F4,E4,D4,C4,B3,C4,E4,G4,A4,G4,E4,C4,A3,D4,F4,A4,-1,E4,G4,B4,-1,
  A4,-1,-1,E4,-1,-1,C4,-1,-1,A3,-1,-1,G3,A3,-1,-1,E4,-1,D4,-1,C4,-1,B3,A3,-1,-1,C4,E4,A4,-1,-1,-1,
  E4,-1,E4,D4,C4,-1,A3,G3,C4,D4,E4,F4,G4,A4,B4,C5,A4,G4,E4,D4,C4,B3,A3,Gs3,A3,C4,E4,A4,A3,-1,A3,-1,
  A3,C4,A3,E4,A3,C4,E4,G4,A4,G4,E4,C4,A3,-1,G3,-1,E3,G3,A3,C4,E4,-1,D4,C4,B3,A3,G3,E3,A3,-1,-1,-1,
  E4,-1,D4,-1,C4,-1,B3,-1,A3,-1,G3,A3,C4,D4,E4,-1,F4,-1,E4,-1,D4,-1,C4,B3,A3,B3,C4,-1,A3,-1,A3,-1,
  A3,C4,-1,C4,E4,-1,E4,G4,-1,G4,B4,-1,B4,A4,G4,-1,E4,D4,C4,B3,A3,G3,E3,-1,A3,-1,E4,-1,A4,-1,E4,A3,
  A4,-1,A4,B4,C5,-1,E5,-1,C5,B4,A4,-1,F4,-1,E4,-1,D4,-1,E4,F4,G4,-1,A4,-1,E4,-1,E4,Fs4,E4,-1,-1,-1,
  E4,-1,-1,-1,G4,-1,-1,-1,A4,-1,-1,G4,E4,-1,D4,-1,C4,-1,-1,-1,E4,-1,-1,-1,A3,-1,C4,E4,A4,-1,-1,-1,
  E4,Eb4,D4,Db4,C4,B3,Bb3,A3,Bb3,B3,C4,Db4,D4,Eb4,E4,F4,Fs4,G4,Gs4,A4,G4,F4,E4,D4,C4,B3,A3,Gs3,A3,-1,-1,-1,
  A3,G3,A3,C4,E4,G4,E4,C4,B3,A3,G3,F3,E3,-1,G3,A3,C4,B3,A3,G3,F3,G3,A3,-1,E3,A3,E4,-1,A3,-1,E3,-1,
  E4,F4,G4,A4,B4,C5,D5,E5,D5,C5,B4,A4,G4,F4,E4,D4,C4,D4,E4,F4,G4,A4,G4,E4,A4,-1,G4,E4,D4,C4,B3,A3,
  E5,-1,-1,-1,-1,C5,-1,-1,A4,-1,-1,E4,-1,-1,C4,-1,A3,-1,C4,-1,E4,-1,A4,-1,-1,E4,-1,C4,-1,A3,-1,-1,
  E4,-1,E4,D4,C4,D4,E4,G4,A4,G4,E4,D4,C4,B3,A3,G3,A3,B3,C4,D4,E4,F4,G4,A4,A3,-1,E4,-1,A4,E4,A3,-1,
];
const BASS_SEQ=[
  A2,-1,A2,-1,A2,-1,E3,-1,A2,-1,A2,-1,C3,-1,E3,-1,D3,-1,D3,-1,D3,-1,A3,-1,A2,-1,Gs3,-1,A2,-1,-1,-1,
  F3,-1,F3,-1,C3,-1,F3,-1,Bb2,-1,Bb2,-1,F3,-1,G3,-1,A2,-1,C3,-1,E3,-1,A3,-1,D3,-1,E3,-1,A2,-1,A2,-1,
  A2,-1,A2,-1,E3,-1,A2,-1,D3,-1,D3,-1,A2,-1,E3,-1,F3,-1,F3,-1,C3,-1,F3,-1,A2,-1,E3,-1,A2,-1,-1,-1,
  A2,-1,A2,-1,A2,-1,D3,-1,A2,-1,D3,-1,A2,-1,E3,-1,A2,-1,Gs2,-1,A2,-1,E3,-1,A2,-1,A2,-1,C3,E3,A2,-1,
  A2,-1,E3,-1,A2,-1,C3,-1,E3,-1,A2,-1,E3,-1,G3,-1,C3,-1,G3,-1,C3,-1,E3,-1,F3,-1,C3,-1,A2,-1,E3,-1,
  F3,-1,F3,-1,C3,-1,F3,-1,Bb2,-1,F3,-1,Bb2,-1,G3,-1,Bb2,-1,C3,-1,D3,-1,F3,-1,A2,-1,E3,-1,A2,-1,A2,-1,
  A2,-1,E3,-1,A2,-1,E3,-1,A2,-1,D3,-1,E3,-1,A3,-1,D3,-1,D3,-1,A2,-1,Gs2,-1,A2,-1,C3,E3,A2,-1,-1,-1,
  A2,-1,A2,-1,A2,E3,A2,-1,E3,-1,D3,-1,C3,-1,E3,-1,A2,-1,C3,-1,E3,-1,A3,-1,D3,-1,F3,-1,E3,-1,Gs3,-1,
  A2,-1,-1,-1,E3,-1,-1,-1,A2,-1,-1,-1,E3,-1,-1,-1,D3,-1,-1,-1,A2,-1,E3,-1,A2,-1,C3,-1,E3,-1,A2,-1,
  A2,-1,A2,-1,E3,-1,A2,-1,C3,-1,F3,-1,C3,-1,F3,-1,A2,-1,Gs2,-1,A2,-1,E3,-1,A2,-1,E3,A3,A2,-1,A2,-1,
  A2,-1,E3,-1,A2,-1,C3,-1,E3,-1,A2,-1,E3,-1,A2,-1,C3,-1,E3,-1,A2,-1,E3,-1,A2,-1,E3,-1,A2,-1,A2,-1,
  A2,-1,C3,-1,E3,-1,A3,-1,E3,-1,G3,-1,B2,-1,E3,-1,A2,-1,E3,-1,A2,-1,A2,-1,A2,-1,E3,-1,A2,-1,A3,-1,
  C3,-1,A2,-1,F3,-1,C3,-1,D3,-1,A2,-1,D3,-1,F3,-1,A2,-1,E3,-1,A2,-1,A2,-1,A2,-1,-1,-1,E3,-1,-1,-1,
  A2,-1,-1,-1,C3,-1,-1,-1,A2,-1,-1,-1,E3,-1,-1,-1,A2,-1,C3,-1,E3,A3,A2,-1,A2,-1,A2,-1,E3,-1,A2,-1,
  D3,-1,A2,-1,D3,-1,F3,-1,A2,-1,E3,-1,A2,-1,A2,-1,A2,-1,-1,-1,A2,-1,-1,-1,E2,-1,-1,-1,A2,-1,-1,-1,
  A2,-1,E3,-1,A2,-1,D3,-1,Bb2,-1,F3,-1,Bb2,-1,F3,-1,Fs3,-1,D3,-1,A2,-1,E3,-1,A2,-1,Gs2,-1,A2,-1,A2,-1,
  A2,-1,E3,-1,A2,-1,E3,-1,A2,-1,D3,-1,A2,-1,E3,-1,F3,-1,C3,-1,F3,-1,C3,-1,A2,-1,E3,-1,A2,-1,A2,-1,
  A2,-1,A2,-1,E3,A2,E3,-1,E3,-1,D3,-1,C3,D3,E3,-1,A2,C3,E3,-1,A3,-1,E3,-1,A2,-1,E3,-1,A3,E3,A2,-1,
  A2,-1,-1,-1,-1,-1,E3,-1,A2,-1,-1,-1,E3,-1,-1,-1,A2,-1,C3,-1,E3,-1,A2,-1,E3,-1,C3,-1,A2,-1,-1,-1,
  A2,-1,E3,-1,A2,C3,E3,-1,A3,-1,E3,-1,A2,-1,C3,-1,A2,C3,E3,A3,E3,-1,A2,-1,A2,-1,A3,-1,A2,-1,A2,-1,
];
const ARP_CHORDS = [
  // Section A (bars 1–4)
  [A3,C4,E4],[A3,C4,E4],[A3,C4,E4],[A3,C4,E4],
  [A3,C4,E4],[A3,C4,E4],[E3,G3,B3],[E3,G3,B3],
  [D3,F3,A3],[D3,F3,A3],[D3,F3,A3],[D3,A3,D4],
  [A3,C4,E4],[Gs3,B3,E4],[A3,C4,E4],[E3,G3,B3],
  // Section B (bars 5–8)
  [F3,A3,C4],[F3,A3,C4],[C3,E3,G3],[C3,E3,G3],
  [Bb3,D4,F4],[Bb3,D4,F4],[F3,A3,C4],[G3,B3,D4],
  [A3,C4,E4],[A3,C4,E4],[A3,C4,E4],[A3,C4,E4],
  [D3,F3,A3],[E3,G3,B3],[A2,E3,A3],[A2,E3,A3],
  // Section C (bars 9–12)
  [A3,C4,E4],[A3,E3,A3],[A3,C4,E4],[E3,G3,B3],
  [D3,F3,A3],[D3,F3,A3],[A2,E3,A3],[A2,E3,A3],
  [F3,A3,C4],[F3,A3,C4],[F3,A3,C4],[G3,B3,D4],
  [A3,C4,E4],[E3,G3,B3],[A2,E3,A3],[E3,Gs3,B3],
  // Section D (bars 13–16)
  [A3,C4,E4],[A3,C4,E4],[D3,F3,A3],[D3,F3,A3],
  [A3,C4,E4],[D3,F3,A3],[E3,G3,B3],[E3,G3,B3],
  [A3,C4,E4],[Gs3,B3,E4],[A3,C4,E4],[E3,Gs3,B3],
  [A3,C4,E4],[A3,C4,E4],[C3,E3,G3],[E3,G3,B3],
  // Section E (bars 17–20)
  [A3,C4,E4],[A3,C4,E4],[E3,B3,E4],[E3,B3,E4],
  [E3,G3,B3],[E3,G3,B3],[A3,C4,E4],[G3,B3,D4],
  [C3,G3,C4],[C3,G3,C4],[C3,E3,G3],[G3,B3,D4],
  [F3,A3,C4],[F3,A3,C4],[E3,G3,B3],[E3,G3,B3],
  // Section F (bars 21–24)
  [F3,A3,C4],[F3,A3,C4],[F3,C4,F4],[F3,C4,F4],
  [Bb2,F3,Bb3],[Bb2,F3,Bb3],[F3,A3,C4],[G3,B3,D4],
  [Bb2,D3,F3],[Bb2,D3,F3],[C3,G3,C4],[C3,G3,C4],
  [A3,C4,E4],[A3,C4,E4],[E3,G3,B3],[A2,E3,A3],
  // Section G (bars 25–28)
  [A3,C4,E4],[A3,C4,E4],[A3,C4,E4],[E3,G3,B3],
  [A3,C4,E4],[D3,F3,A3],[E3,G3,B3],[A3,E4,A4],
  [D3,F3,A3],[D3,F3,A3],[Gs3,B3,E4],[Gs3,B3,E4],
  [A3,C4,E4],[E3,G3,B3],[A2,E3,A3],[A2,E3,Gs3],
  // Section H (bars 29–32)
  [A3,C4,E4],[A3,C4,E4],[A3,C4,E4],[E3,G3,B3],
  [E3,B3,E4],[E3,G3,B3],[D3,A3,D4],[E3,G3,B3],
  [C3,E3,G3],[C3,G3,C4],[E3,G3,B3],[A3,C4,E4],
  [D3,F3,A3],[F3,A3,C4],[E3,G3,B3],[E3,Gs3,B3],
  // Section I (bars 33–36)
  [A2,E3,A3],[A2,E3,A3],[E2,E3,B3],[E2,E3,B3],
  [A2,E3,A3],[A2,E3,A3],[E2,E3,B3],[A2,E3,A3],
  [D3,F3,A3],[D3,F3,A3],[A2,E3,A3],[E3,G3,B3],
  [A2,E3,A3],[C3,E3,A3],[E3,G3,B3],[A2,E3,A3],
  // Section J (bars 37–40)
  [A3,C4,E4],[A3,C4,E4],[E3,G3,B3],[A3,C4,E4],
  [C3,G3,C4],[F3,A3,C4],[C3,G3,C4],[F3,A3,C4],
  [A3,C4,E4],[Gs3,B3,E4],[A3,C4,E4],[E3,Gs3,B3],
  [A3,C4,E4],[A3,C4,E4],[A2,E3,A3],[A2,E3,A3],
  // Section K (bars 41–44)
  [A3,C4,E4],[A3,C4,E4],[E3,A3,C4],[E3,G3,B3],
  [A3,C4,E4],[E3,G3,B3],[A2,E3,A3],[A3,C4,E4],
  [C3,E3,G3],[C3,G3,C4],[E3,G3,B3],[A3,C4,E4],
  [A2,E3,A3],[E3,B3,E4],[A2,E3,A3],[A2,E3,A3],
  // Section L (bars 45–48)
  [A3,C4,E4],[E3,G3,B3],[A3,C4,E4],[E3,G3,B3],
  [A2,E3,A3],[C3,E3,A3],[E3,G3,B3],[A3,C4,E4],
  [F3,A3,C4],[F3,C4,F4],[C3,F3,A3],[G3,B3,D4],
  [A2,E3,A3],[E3,G3,B3],[A2,E3,A3],[A2,E3,A3],
  // Section M (bars 49–52)
  [A3,C4,E4],[C3,E3,G3],[E3,G3,B3],[A3,E4,A4],
  [E3,G3,B3],[G3,B3,D4],[B2,D3,Fs3],[E3,G3,B3],
  [A2,E3,A3],[C3,E3,A3],[E3,G3,B3],[A3,C4,E4],
  [A2,E3,A3],[E3,G3,B3],[A2,E3,A3],[A2,E3,A3],
  // Section N (bars 53–56)
  [A2,E3,A3],[E3,A3,E4],[A3,C4,E4],[A3,C4,E4],
  [C3,G3,C4],[C3,E3,G3],[F3,A3,C4],[C3,G3,C4],
  [D3,F3,A3],[A2,D3,F3],[D3,F3,A3],[F3,A3,D4],
  [A2,E3,A3],[E3,G3,B3],[A2,E3,A3],[A2,E3,A3],
  // Section O (bars 57–60)
  [A2,E3,A3],[A2,E3,A3],[E2,E3,B3],[E2,E3,B3],
  [A2,C3,E3],[A2,C3,E3],[E2,B2,E3],[E2,B2,E3],
  [A2,E3,A3],[A2,E3,A3],[E2,E3,B3],[E2,E3,B3],
  [A2,E3,A3],[C3,E3,A3],[E3,G3,B3],[A2,E3,A3],
  // Section P (bars 61–64)
  [A3,C4,E4],[E3,G3,B3],[A2,E3,A3],[D3,F3,A3],
  [Bb2,F3,D4],[Bb2,D3,F3],[Bb2,F3,Bb3],[F3,A3,C4],
  [D3,Fs3,A3],[D3,Fs3,A3],[A2,E3,A3],[E3,Gs3,B3],
  [A2,E3,A3],[E3,Gs3,B3],[A2,E3,A3],[A2,E3,Gs3],
  // Section Q (bars 65–68)
  [A3,C4,E4],[E3,G3,B3],[A3,C4,E4],[E3,G3,B3],
  [A2,E3,A3],[D3,F3,A3],[A2,E3,A3],[E3,G3,B3],
  [F3,A3,C4],[F3,C4,F4],[C3,F3,A3],[G3,C4,E4],
  [A2,E3,A3],[E3,G3,B3],[A2,E3,A3],[A2,E3,A3],
  // Section R (bars 69–72)
  [A3,C4,E4],[C3,G3,C4],[A3,E4,A4],[E3,G3,B3],
  [E3,G3,B3],[D3,F3,A3],[C3,E3,G3],[E3,G3,B3],
  [A2,E3,A3],[C3,E3,G3],[E3,G3,B3],[A3,C4,E4],
  [A2,E3,A3],[E3,Gs3,B3],[A2,E3,A3],[A2,E3,Gs3],
  // Section S (bars 73–76)
  [A2,E3,A3],[A2,E3,A3],[A2,E3,A3],[A2,E3,A3],
  [A2,E3,A3],[E2,E3,B3],[A2,E3,A3],[E2,E3,B3],
  [A2,C3,E3],[A2,C3,E3],[E3,G3,B3],[A2,E3,A3],
  [E3,G3,B3],[C3,E3,A3],[A2,E3,A3],[E2,E3,A3],
  // Section T (bars 77–80)
  [A3,C4,E4],[A3,C4,E4],[E3,G3,B3],[A3,C4,E4],
  [A3,C4,E4],[F3,A3,C4],[C3,G3,C4],[F3,A3,C4],
  [A2,C3,E3],[A3,C4,E4],[E3,Gs3,B3],[A3,C4,E4],
  [A2,E3,A3],[C3,E3,A3],[E3,G3,B3],[A2,E3,A3],
];
let arpPhase=0;

function chipNoiseBuf(ac,durationS){
  const len=Math.ceil(ac.sampleRate*durationS),b=ac.createBuffer(1,len,ac.sampleRate),d=b.getChannelData(0);
  let reg=0xACE1;
  for(let i=0;i<len;i++){const bit=((reg>>0)^(reg>>2)^(reg>>3)^(reg>>5))&1;reg=(reg>>1)|(bit<<15);d[i]=bit?0.9:-0.9;}
  return b;
}
let noiseBuf = null; // lazily built

function scheduleNoise(t,dur,vol,lpHz){
  const ac=audioCtx;
  if(!noiseBuf)noiseBuf=chipNoiseBuf(ac,0.25);
  const src=ac.createBufferSource();src.buffer=noiseBuf;
  const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpHz;
  const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  src.connect(lp);lp.connect(g);g.connect(musicMasterGain);src.start(t);src.stop(t+dur+0.01);
}
function chipNote(t,freq,dur,vol,wave){
  const ac=audioCtx,osc=ac.createOscillator(),g=ac.createGain();
  osc.type=wave||'square';osc.frequency.value=freq;
  g.gain.setValueAtTime(0,t);g.gain.setValueAtTime(vol,t+0.004);g.gain.setValueAtTime(vol*0.75,t+dur*0.5);g.gain.linearRampToValueAtTime(0,t+dur);
  osc.connect(g);g.connect(musicMasterGain);osc.start(t);osc.stop(t+dur+0.01);
}
function scheduleKick(t){
  const ac=audioCtx,osc=ac.createOscillator(),g=ac.createGain();
  osc.type='square';osc.frequency.setValueAtTime(120,t);osc.frequency.exponentialRampToValueAtTime(38,t+0.07);
  g.gain.setValueAtTime(0.55,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
  osc.connect(g);g.connect(musicMasterGain);osc.start(t);osc.stop(t+0.13);
}
const TOTAL_STEPS=MELODY_SEQ.length;
function isKick(s){return s%8===0;}function isSnare(s){return s%8===4;}
function isHihat(s){return s%2===0&&!isKick(s)&&!isSnare(s);}
function technoTick(){
  if(!audioCtx||!musicEnabled)return;
  const lookahead=0.12;
  while(technoNextBeat<audioCtx.currentTime+lookahead){
    const t=technoNextBeat,s=technoStep16%TOTAL_STEPS,sd=CHIP_STEP*0.88;
    const mn=MELODY_SEQ[s];if(mn!==-1)chipNote(t,midiHz(mn),sd,0.22,'square');
    const bn=BASS_SEQ[s%BASS_SEQ.length];if(bn!==-1)chipNote(t,midiHz(bn),CHIP_STEP*1.85,0.18,'triangle');
    const chord=ARP_CHORDS[Math.floor(s/2)%ARP_CHORDS.length];
    if(chord){const an=chord[arpPhase%chord.length];arpPhase++;chipNote(t,midiHz(an)*2,CHIP_STEP*0.5,0.06,'square');}
    if(isKick(s))scheduleKick(t);
    if(isSnare(s))scheduleNoise(t,0.055,0.30,5000);
    if(isHihat(s))scheduleNoise(t,0.020,0.10,14000);
    technoStep16++;technoNextBeat+=CHIP_STEP;
  }
}
function startTechno(){
  if(technoRunning)return;
  ensureAudioCtx();
  noiseBuf=null;
  technoNextBeat=audioCtx.currentTime+0.05;technoStep16=0;arpPhase=0;
  technoRunning=true;technoScheduler=setInterval(technoTick,25);
}
function stopTechno(){technoRunning=false;if(technoScheduler){clearInterval(technoScheduler);technoScheduler=null;}}
function setMusicEnabled(on){
  musicEnabled=on;
  document.getElementById('musicOn').classList.toggle('on',on);
  document.getElementById('musicOff').classList.toggle('on',!on);
  document.getElementById('musicToggleVal').textContent=on?'W\u0142\u0105czona':'Wy\u0142\u0105czona';
  if(musicMasterGain)musicMasterGain.gain.setTargetAtTime(on?musicVol:0,audioCtx.currentTime,0.1);
  if(on&&!technoRunning)startTechno();
  updateMusicBtn();
}
function setSfxEnabled(on){
  sfxEnabled=on;
  document.getElementById('sfxOn').classList.toggle('on',on);
  document.getElementById('sfxOff').classList.toggle('on',!on);
  document.getElementById('sfxToggleVal').textContent=on?'W\u0142\u0105czone':'Wy\u0142\u0105czone';
  if(sfxMasterGain)sfxMasterGain.gain.setTargetAtTime(on?sfxVol:0,audioCtx.currentTime,0.05);
}
function applyMusicVol(v){
  musicVol=parseInt(v)/100;document.getElementById('musicVolVal').textContent=v+'%';document.getElementById('musicVolSlider').value=v;
  if(musicMasterGain&&musicEnabled)musicMasterGain.gain.setTargetAtTime(musicVol,audioCtx.currentTime,0.05);
}
function applySfxVol(v){
  sfxVol=parseInt(v)/100;document.getElementById('sfxVolVal').textContent=v+'%';document.getElementById('sfxVolSlider').value=v;
  if(sfxMasterGain&&sfxEnabled)sfxMasterGain.gain.setTargetAtTime(sfxVol,audioCtx.currentTime,0.05);
}
function toggleMusicBtn(){setMusicEnabled(!musicEnabled);}
function updateMusicBtn(){const btn=document.getElementById('hud-music-btn');if(btn)btn.textContent=musicEnabled?'\uD83C\uDFB5':'\uD83D\uDD07';}

function playCreatureSound(id){
  if(!sfxEnabled)return;
  try{
    ensureAudioCtx();const ac=audioCtx,t=ac.currentTime;
    function fm(cf,mf,md,dur,gpk,otype){
      const mod=ac.createOscillator(),mg=ac.createGain(),car=ac.createOscillator(),g=ac.createGain();
      mod.frequency.value=mf;mg.gain.value=md;car.type=otype||'sine';car.frequency.value=cf;
      mod.connect(mg);mg.connect(car.frequency);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gpk,t+dur*0.12);g.gain.exponentialRampToValueAtTime(0.001,t+dur);
      car.connect(g);g.connect(sfxMasterGain);mod.start(t);car.start(t);mod.stop(t+dur+0.05);car.stop(t+dur+0.05);
    }
    function nburst(lp,hp,dur,gpk,atk){
      const b2=ac.createBuffer(1,Math.ceil(ac.sampleRate*(dur+0.02)),ac.sampleRate),d=b2.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      const src=ac.createBufferSource();src.buffer=b2;
      const lpf=ac.createBiquadFilter();lpf.type='lowpass';lpf.frequency.value=lp;
      const hpf=ac.createBiquadFilter();hpf.type='highpass';hpf.frequency.value=hp;
      const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(gpk,t+(atk||dur*0.1));g.gain.exponentialRampToValueAtTime(0.001,t+dur);
      src.connect(lpf);lpf.connect(hpf);hpf.connect(g);g.connect(sfxMasterGain);src.start(t);src.stop(t+dur+0.03);
    }
    switch(id){
      case'sowa':{
        const o1=ac.createOscillator(),g1=ac.createGain(),v1=ac.createOscillator(),vg1=ac.createGain();
        v1.frequency.value=5.5;vg1.gain.value=6;v1.connect(vg1);vg1.connect(o1.frequency);
        o1.type='sine';o1.frequency.value=290;
        g1.gain.setValueAtTime(0,t);g1.gain.linearRampToValueAtTime(0.35,t+0.08);g1.gain.setValueAtTime(0.35,t+0.28);g1.gain.exponentialRampToValueAtTime(0.001,t+0.4);
        o1.connect(g1);g1.connect(sfxMasterGain);v1.start(t);o1.start(t);v1.stop(t+0.45);o1.stop(t+0.45);
        setTimeout(()=>{const t2=ac.currentTime;const o2=ac.createOscillator(),g2=ac.createGain(),v2=ac.createOscillator(),vg2=ac.createGain();
          v2.frequency.value=5;vg2.gain.value=8;v2.connect(vg2);vg2.connect(o2.frequency);
          o2.type='sine';o2.frequency.value=245;
          g2.gain.setValueAtTime(0,t2);g2.gain.linearRampToValueAtTime(0.5,t2+0.1);g2.gain.setValueAtTime(0.5,t2+0.32);g2.gain.exponentialRampToValueAtTime(0.001,t2+0.55);
          o2.connect(g2);g2.connect(sfxMasterGain);v2.start(t2);o2.start(t2);v2.stop(t2+0.6);o2.stop(t2+0.6);},480);break;}
      case'swinka':{for(let r=0;r<2;r++){const dd=r*0.25,o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter(),lp2=ac.createBiquadFilter();
        lp.type='lowpass';lp.frequency.value=900;lp2.type='bandpass';lp2.frequency.value=700;lp2.Q.value=2;
        o.type='sawtooth';o.frequency.setValueAtTime(220+r*30,t+dd);o.frequency.linearRampToValueAtTime(340+r*30,t+dd+0.12);o.frequency.exponentialRampToValueAtTime(260+r*20,t+dd+0.22);
        g.gain.setValueAtTime(0,t+dd);g.gain.linearRampToValueAtTime(0.4,t+dd+0.04);g.gain.setValueAtTime(0.4,t+dd+0.18);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.28);
        o.connect(lp);lp.connect(lp2);lp2.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.32);}break;}
      case'szynszyla':{for(let i=0;i<5;i++){const dd=i*0.055,o=ac.createOscillator(),g=ac.createGain(),hp=ac.createBiquadFilter();
        hp.type='highpass';hp.frequency.value=1800;o.type='triangle';o.frequency.value=2200+(i%2)*400;
        g.gain.setValueAtTime(0.25,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.04);
        o.connect(hp);hp.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.05);}nburst(4000,2000,0.025,0.12);break;}
      case'wiewiorka':{for(let i=0;i<4;i++){const dd=i*0.1,o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter();
        bp.type='bandpass';bp.frequency.value=1200;bp.Q.value=3;o.type='triangle';
        o.frequency.setValueAtTime(1100,t+dd);o.frequency.exponentialRampToValueAtTime(800,t+dd+0.06);
        g.gain.setValueAtTime(0.3,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.07);
        o.connect(bp);bp.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.08);}break;}
      case'winniczek':{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';
        o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(80,t+0.18);
        g.gain.setValueAtTime(0.25,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);
        o.connect(g);g.connect(sfxMasterGain);o.start(t);o.stop(t+0.25);nburst(500,80,0.12,0.08,0.02);break;}
      case'wrobel':{[3200,2800,3500,2600,3000].forEach((cf,i)=>{const dd=i*0.07,mod=ac.createOscillator(),mg=ac.createGain(),car=ac.createOscillator(),g=ac.createGain();
        mod.frequency.value=cf*0.5;mg.gain.value=cf*0.3;mod.connect(mg);mg.connect(car.frequency);
        car.type='sine';car.frequency.value=cf;
        g.gain.setValueAtTime(0,t+dd);g.gain.linearRampToValueAtTime(0.28,t+dd+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.065);
        car.connect(g);g.connect(sfxMasterGain);mod.start(t+dd);car.start(t+dd);mod.stop(t+dd+0.08);car.stop(t+dd+0.08);});break;}
      case'zabka':{const c1=ac.createOscillator(),cg1=ac.createGain(),am=ac.createOscillator(),amg=ac.createGain();
        c1.type='square';c1.frequency.value=180;am.frequency.value=40;amg.gain.value=0.5;
        const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;
        const mg=ac.createGain();mg.gain.setValueAtTime(0,t);mg.gain.linearRampToValueAtTime(0.4,t+0.04);mg.gain.setValueAtTime(0.4,t+0.18);mg.gain.exponentialRampToValueAtTime(0.001,t+0.28);
        am.connect(amg);amg.connect(cg1.gain);c1.connect(cg1);cg1.connect(lp);lp.connect(mg);mg.connect(sfxMasterGain);
        am.start(t);c1.start(t);am.stop(t+0.32);c1.stop(t+0.32);
        setTimeout(()=>{const t2=ac.currentTime,c2=ac.createOscillator(),cg2=ac.createGain(),am2=ac.createOscillator(),amg2=ac.createGain();
          c2.type='square';c2.frequency.value=160;am2.frequency.value=38;amg2.gain.value=0.45;
          const lp2=ac.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=650;
          const mg2=ac.createGain();mg2.gain.setValueAtTime(0,t2);mg2.gain.linearRampToValueAtTime(0.35,t2+0.03);mg2.gain.setValueAtTime(0.35,t2+0.14);mg2.gain.exponentialRampToValueAtTime(0.001,t2+0.22);
          am2.connect(amg2);amg2.connect(cg2.gain);c2.connect(cg2);cg2.connect(lp2);lp2.connect(mg2);mg2.connect(sfxMasterGain);
          am2.start(t2);c2.start(t2);am2.stop(t2+0.25);c2.stop(t2+0.25);},320);break;}
      case'zolw':{nburst(400,40,0.6,0.3,0.15);const o=ac.createOscillator(),g=ac.createGain();
        o.type='sine';o.frequency.setValueAtTime(90,t);o.frequency.exponentialRampToValueAtTime(60,t+0.5);
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.2,t+0.18);g.gain.exponentialRampToValueAtTime(0.001,t+0.65);
        o.connect(g);g.connect(sfxMasterGain);o.start(t);o.stop(t+0.7);break;}
      case'biedronka':{nburst(5000,2000,0.08,0.18,0.01);const o=ac.createOscillator(),g=ac.createGain();
        o.type='triangle';o.frequency.value=4000;
        g.gain.setValueAtTime(0.12,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.07);
        o.connect(g);g.connect(sfxMasterGain);o.start(t);o.stop(t+0.08);break;}
      case'chomik':{for(let i=0;i<4;i++){const dd=i*0.06,o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter();
        bp.type='bandpass';bp.frequency.value=2000;bp.Q.value=4;o.type='sawtooth';o.frequency.value=1800+(i%2)*600;
        g.gain.setValueAtTime(0.22,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.04);
        o.connect(bp);bp.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.05);}break;}
      case'dzdz':{for(let i=0;i<3;i++){const dd=i*0.12,o=ac.createOscillator(),g=ac.createGain();
        o.type='sine';o.frequency.setValueAtTime(120,t+dd);o.frequency.exponentialRampToValueAtTime(50,t+dd+0.1);
        g.gain.setValueAtTime(0.18,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.12);
        o.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.14);}nburst(300,20,0.35,0.1,0.05);break;}
      case'jaszczurka':{for(let i=0;i<2;i++){const dd=i*0.09,b2=ac.createBuffer(1,Math.ceil(ac.sampleRate*0.04),ac.sampleRate),dat=b2.getChannelData(0);
        for(let j=0;j<dat.length;j++)dat[j]=(Math.random()*2-1)*Math.exp(-j/300);
        const src=ac.createBufferSource();src.buffer=b2;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=4000;bp.Q.value=3;
        const g=ac.createGain();g.gain.setValueAtTime(0.3,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.04);
        src.connect(bp);bp.connect(g);g.connect(sfxMasterGain);src.start(t+dd);src.stop(t+dd+0.05);}nburst(3000,1500,0.22,0.15,0.03);break;}
      case'jez':{for(let i=0;i<3;i++){const dd=i*0.14;nburst(600,100,0.1,0.22,0.02);
        const o=ac.createOscillator(),g=ac.createGain();o.type='sine';
        o.frequency.setValueAtTime(220,t+dd);o.frequency.exponentialRampToValueAtTime(160,t+dd+0.08);
        g.gain.setValueAtTime(0.12,t+dd);g.gain.exponentialRampToValueAtTime(0.001,t+dd+0.1);
        o.connect(g);g.connect(sfxMasterGain);o.start(t+dd);o.stop(t+dd+0.12);}break;}
      case'kameleon':{nburst(2000,400,0.4,0.15,0.08);const o=ac.createOscillator(),g=ac.createGain(),tr=ac.createOscillator(),trg=ac.createGain();
        tr.frequency.value=18;trg.gain.value=0.08;tr.connect(trg);trg.connect(g.gain);
        o.type='sine';o.frequency.value=280;
        g.gain.setValueAtTime(0.1,t);g.gain.linearRampToValueAtTime(0.18,t+0.12);g.gain.exponentialRampToValueAtTime(0.001,t+0.45);
        o.connect(g);g.connect(sfxMasterGain);tr.start(t);o.start(t);tr.stop(t+0.5);o.stop(t+0.5);break;}
      default:{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=1200;
        g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
        o.connect(g);g.connect(sfxMasterGain);o.start(t);o.stop(t+0.4);}
    }
  }catch(e){console.warn('SFX:',e);}
}

// ══ MENU ══
