/* ══ MICROPHONE & PITCH DETECTION ══ */

async function startMic(){
  if(mReady)return;
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    if(!audioCtx)ensureAudioCtx();mAC=audioCtx;
    const src=mAC.createMediaStreamSource(stream);mGainNode=mAC.createGain();mGainNode.gain.value=micGain;src.connect(mGainNode);
    mAn=mAC.createAnalyser();mAn.fftSize=4096;mAn.smoothingTimeConstant=0.3;mGainNode.connect(mAn);
    mReady=true;micLoop();
  }catch(e){console.warn('Mic:',e);}
}
function getRMS(){let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];return Math.sqrt(s/buf.length);}
function transposedFreq(baseFreq){return baseFreq*Math.pow(2,transpose/12);}
function closestNote(freq){let best=null,bd=1e9;for(const n of MN){const tf=transposedFreq(n.freq),d=Math.abs(freq-tf);if(d<bd){bd=d;best=n;}}return(best&&bd<=noteMargin)?best:null;}
function closestNoteDisplay(freq){
  const ids=NOTE_RANGE_MAP[getRangeKey()]||[];const pool=ids.map(id=>ALL_NOTE_DEFS.find(n=>n.id===id)).filter(Boolean);
  let best=null,bd=1e9;for(const n of pool){const tf=transposedFreq(n.freq),d=Math.abs(freq-tf);if(d<bd){bd=d;best=n;}}return best;
}
function micLoop(){
  const useMic=controlMode==='mic'||controlMode==='both';
  if(mAn&&mReady&&useMic){
    mAn.getFloatTimeDomainData(buf);const rms=getRMS();
    document.getElementById('vuf').style.width=Math.min(100,rms*600)+'%';
    const mdot=document.getElementById('mdot');
    if(rms<0.003){fH=[];dCD=0;mdot.className='hud-mdot q';document.getElementById('hud-note').textContent='\u2014';}
    else{const freq=acorr(buf,mAC.sampleRate);if(freq>0){
      const dn=closestNoteDisplay(freq);document.getElementById('hud-note').textContent=dn?dn.name:'~';mdot.className='hud-mdot on';
      fH.push(freq);if(fH.length>3)fH.shift();
      const note=closestNote(freq);
      if(note&&dCD===0){const ok=fH.filter(f=>{let bn=null,bd=1e9;for(const n of MN){const tf=transposedFreq(n.freq),d=Math.abs(f-tf);if(d<bd){bd=d;bn=n;}}return bn&&bn.id===note.id&&bd<=noteMargin;}).length;if(ok>=1){dCD=9;move(note.dir);reshuffleNotes();}}
    }}
    if(dCD>0)dCD--;
  }else{document.getElementById('mdot').className='hud-mdot';document.getElementById('hud-note').textContent='\u2014';document.getElementById('vuf').style.width='0%';}
  requestAnimationFrame(micLoop);
}
function acorr(buf,sr){
  let rms=0;for(const v of buf)rms+=v*v;rms=Math.sqrt(rms/buf.length);if(rms<0.0005)return-1;
  const H=buf.length>>1;let r1=0;for(let i=0;i<H;i++){if(Math.abs(buf[i])<0.04){r1=i;break;}}
  const s=buf.subarray(r1,r1+H),L=s.length,c2=new Float32Array(L);
  for(let i=0;i<L;i++)for(let j=0;j<L-i;j++)c2[i]+=s[j]*s[j+i];
  let d=0;while(d<L-1&&c2[d]>c2[d+1])d++;
  let mv=-1,mp=-1;for(let i=d;i<L;i++){if(c2[i]>mv){mv=c2[i];mp=i;}}
  if(mp<1)return-1;let T=mp;
  if(mp>0&&mp<L-1){const a=(c2[mp-1]+c2[mp+1]-2*c2[mp])/2,b=(c2[mp+1]-c2[mp-1])/2;if(a)T-=b/(2*a);}
  const f=sr/T;return(f<55||f>1100)?-1:f;
}
