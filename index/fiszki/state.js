/* ═══════════════════════════════════════
   state.js – wspólny stan aplikacji
   ═══════════════════════════════════════ */
let clef='treble', range='small', acc=false, nameFormat='pl';
let mode='reveal', noteCount=1;
let notes=[], seqIdx=0, guessIdx=0;
let revealState=false, cnt=0, ok=0;
let timerSec=0, timerLeft=0, timerInt=null;
let micOn=false, aCtx=null, analyser=null, micSt=null, pitchInt=null;
let freqHist=[], cooldown=false;
let panelOpen=true, micSettingsOpen=false;
let lastDrawnNote=null;
let selfCheckActive=false;
let feedbackTimeout=null;
let micTolerance=0.015, micGain=2.0, micTuneSteps=0;
let noteCanvasPositions=[];
let placeHint='pl';
let placeTargetNote=null;
let placeCurrentP=null;
let placeConfirmed=false;
let placeInteractClef=null;

/* emoji-samoocena */
const EMOJIS_GOOD=['🎉','🥳','🌟','👏','🎯','💪','🏆','✨','🔥','😄'];
const EMOJIS_BAD=['😬','😅','🙈','💀','😵','🤦','🫠','😤','😭','🤷'];
let emojiGoodIdx=0, emojiBadIdx=0;

/* historia trybu Place */
let placeHistory = [];       // {targetNote, userP, wasCorrect, clefType}
let placeWrongCounts = {};   // {'g¹': 2, 'a¹': 1, ...}
let wrongNotesOpen = false;
