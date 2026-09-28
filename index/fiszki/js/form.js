/* ═══════════════════════════════════════
   form.js – formularz rezerwacji i modal
   ═══════════════════════════════════════ */
const FORM_WEBHOOK='https://hook.eu1.make.com/3w8cbmpc1v3fff8k0qq4fk6w8mo81wd6';

function openBookingModal(){document.getElementById('bookingModal').classList.add('open');document.body.style.overflow='hidden';}
function closeBookingModal(){document.getElementById('bookingModal').classList.remove('open');document.body.style.overflow='';}

let mLoc='s',mPiano=true;
function mSetLoc(t){
  mLoc=t;
  document.getElementById('m-l-s').classList.toggle('selected',t==='s');
  document.getElementById('m-l-u').classList.toggle('selected',t==='u');
  document.getElementById('m-piano-box').style.display=t==='u'?'block':'none';
  mUpdatePrice();
}
function mSetPiano(v){
  mPiano=v;
  document.getElementById('m-p-y').classList.toggle('selected',v);
  document.getElementById('m-p-n').classList.toggle('selected',!v);
  mUpdatePrice();
}
function mUpdatePrice(){document.getElementById('m-price').textContent=(mLoc==='u'&&!mPiano?119:99)+' zł / h';}

async function wyslijModal(){
  const s=document.getElementById('modal-status');const submitBtn=document.querySelector('.modal-submit-btn');
  const name=document.getElementById('m-name').value.trim();
  const phone=document.getElementById('m-phone').value.trim();
  const email=document.getElementById('m-email').value.trim();
  if(name.length<2||phone.length<9||!email.includes('@')){s.textContent='⚠️ Wypełnij imię, telefon i email.';s.style.color='#ef4444';return;}
  submitBtn.disabled=true;submitBtn.textContent='Wysyłanie...';s.textContent='';
  const payload={
    typ:'lekcja-probna-fiszki',
    imie_nazwisko:name,telefon:phone,email:email,
    tresc:document.getElementById('m-msg').value.trim(),
    miejsce:mLoc==='s'?'Studio — Gdynia Mały Kack':'U ucznia — dojazd',
    pianino:mLoc==='s'?'—':(mPiano?'Tak':'Nie — dowóz instrumentu'),
    cena:(mLoc==='u'&&!mPiano?119:99)+' zł/h',
    data:new Date().toLocaleString('pl-PL')
  };
  try{
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),8000);
    await fetch(FORM_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
    clearTimeout(tid);
    s.textContent='✅ Wysłano!';s.style.color='#22c55e';submitBtn.textContent='WYŚLIJ PROŚBĘ';
    setTimeout(()=>{closeBookingModal();s.textContent='';['m-name','m-phone','m-email','m-msg'].forEach(id=>document.getElementById(id).value='');submitBtn.disabled=false;},3000);
  }catch(e){
    s.textContent='❌ Błąd. Zadzwoń: 514 338 875';s.style.color='#ef4444';
    submitBtn.textContent='WYŚLIJ PROŚBĘ';submitBtn.disabled=false;
  }
}
