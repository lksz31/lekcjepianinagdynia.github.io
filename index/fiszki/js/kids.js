/* ═══════════════════════════════════════
   kids.js – tryb dziecięcy (pszczółka)
   Pszczółka ładowana z: concept_art/pszczoła.png
   ═══════════════════════════════════════ */
let kidMode=false;
const BEE_IMG=new Image();
BEE_IMG.src='concept_art/pszczoła.png';    /* ← plik lokalny, bez base64 */

let beeOpacity=0.30;
let _beeAnimPhase=0;
let _beeAnimFrame=null;

function setKidMode(on){
  kidMode=on;
  document.body.classList.toggle('kid-mode',on);
  if(on){
    if(!_beeAnimFrame)_beeAnimate();
  }else{
    if(_beeAnimFrame){cancelAnimationFrame(_beeAnimFrame);_beeAnimFrame=null;}
    beeOpacity=1;
    if(notes&&notes.length>0)render(notes);
  }
}

function _beeAnimate(){
  if(!kidMode){_beeAnimFrame=null;return;}
  if(document.hidden){_beeAnimFrame=requestAnimationFrame(_beeAnimate);return;}
  _beeAnimPhase+=0.025;
  beeOpacity=0.5+0.5*(1+Math.sin(_beeAnimPhase))/2;
  if(notes&&notes.length>0)render(notes);
  _beeAnimFrame=requestAnimationFrame(_beeAnimate);
}

/* ── Animacja pszczółki po odpowiedzi (canvas overlay) ── */
(function(){
  const overlay=document.getElementById('kid-anim-overlay');
  const canvas=document.getElementById('kid-anim-canvas');
  const ctx=canvas.getContext('2d');
  let animId=null;

  function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
  window.addEventListener('resize',resize);resize();

  function runBeeAnim(isCorrect){
    if(!kidMode)return;
    if(animId){cancelAnimationFrame(animId);animId=null;ctx.clearRect(0,0,canvas.width,canvas.height);}
    resize();
    const W=canvas.width,H=canvas.height;
    const beeSize=90;
    const beeStartX=W+beeSize,beeStartY=H*0.6;
    const beeTargetX=W*0.3,beeTargetY=H*0.5;
    let t=0;const TOTAL=isCorrect?280:80;

    function draw(){
      ctx.clearRect(0,0,W,H);
      let beeX,beeY,beeScaleX=1;
      if(isCorrect){
        if(t<100){
          const p=t/100;
          beeX=beeStartX+(beeTargetX-beeStartX)*p;
          beeY=beeStartY+(beeTargetY-beeStartY)*p-Math.sin(p*Math.PI)*80;
          beeScaleX=-1;
        }else if(t<200){
          const p=(t-100)/100;
          beeX=beeTargetX+Math.cos(p*Math.PI*6)*30;
          beeY=beeTargetY+Math.sin(p*Math.PI*2)*15-10;
          beeScaleX=Math.cos(p*Math.PI*6)>=0?-1:1;
        }else{
          const p=(t-200)/80;
          beeX=beeTargetX-p*(beeTargetX+beeSize*2);
          beeY=beeTargetY-p*60;
          beeScaleX=1;
        }
      }else{
        const p=t/80;
        beeX=W*0.5+p*(W+beeSize*2);
        beeY=H*0.5+Math.sin(p*Math.PI)*(-40);
        beeScaleX=1;
      }
      if(BEE_IMG.complete&&BEE_IMG.naturalWidth>0){
        ctx.save();ctx.translate(beeX,beeY);ctx.scale(beeScaleX,1);
        ctx.drawImage(BEE_IMG,-beeSize/2,-beeSize/2,beeSize,
          Math.round(beeSize*BEE_IMG.naturalHeight/Math.max(BEE_IMG.naturalWidth,1)));
        ctx.restore();
      }
      t++;
      if(t<=TOTAL){animId=requestAnimationFrame(draw);}
      else{ctx.clearRect(0,0,W,H);animId=null;}
    }
    animId=requestAnimationFrame(draw);
  }
  window.runBeeAnim=runBeeAnim;
})();
