/* ═══════════════════════════════════════
   form.js – formularz rezerwacji i modal
   ═══════════════════════════════════════ */
const FORM_WEBHOOK='https://hook.eu1.make.com/3w8cbmpc1v3fff8k0qq4fk6w8mo81wd6';
let isStudio=true,hasPiano=true;

function toggleForm(show){document.getElementById('formOverlay').classList.toggle('open',show);}
function setLoc(loc){
  isStudio=loc==='studio';
  document.getElementById('loc-studio').classList.toggle('selected',isStudio);
  document.getElementById('loc-uczen').classList.toggle('selected',!isStudio);
  document.getElementById('piano-options').style.display=isStudio?'none':'block';
  updatePrice();
}
function setPiano(v){
  hasPiano=v;
  document.getElementById('piano-yes').classList.toggle('selected',v);
  document.getElementById('piano-no').classList.toggle('selected',!v);
  updatePrice();
}
function updatePrice(){document.getElementById('price-val').textContent=(!isStudio&&!hasPiano?119:99)+' zł / h';val();}
function val(){
  const n=document.getElementById('res-name').value;
  const p=document.getElementById('res-phone').value;
  const e=document.getElementById('res-email').value;
  const ok2=n.length>2&&p.length>=9&&e.includes('@');
  const btn=document.getElementById('subBtn');
  btn.classList.toggle('active',ok2);btn.style.cursor=ok2?'pointer':'not-allowed';
}

async function wyslij(){
  if(!document.getElementById('subBtn').classList.contains('active'))return;
  const s=document.getElementById('res-status');const btn=document.getElementById('subBtn');
  s.textContent='⏳ Wysyłanie...';s.style.color='var(--navy)';btn.disabled=true;btn.classList.remove('active');
  const payload={
    typ:'rezerwacja-fiszki',
    imie_nazwisko:document.getElementById('res-name').value.trim(),
    telefon:document.getElementById('res-phone').value.trim(),
    email:document.getElementById('res-email').value.trim(),
    tresc:document.getElementById('res-msg').value.trim(),
    miejsce:isStudio?'Studio — Gdynia Mały Kack':'U ucznia — dojazd',
    pianino:isStudio?'—':(hasPiano?'Tak':'Nie — dowóz instrumentu'),
    cena:(!isStudio&&!hasPiano?119:99)+' zł/h',
    data:new Date().toLocaleString('pl-PL')
  };
  try{
    const ctrl=new AbortController();const tid=setTimeout(()=>ctrl.abort(),8000);
    const r=await fetch(FORM_WEBHOOK,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
    clearTimeout(tid);const text=await r.text();
    if(!r.ok&&!text.toLowerCase().includes('accepted'))throw new Error('HTTP '+r.status);
    s.textContent='✅ Dziękujemy! Odezwiemy się wkrótce.';s.style.color='#16a34a';
    setTimeout(()=>{toggleForm(false);s.textContent='';['res-name','res-phone','res-email','res-msg'].forEach(id=>document.getElementById(id).value='');btn.disabled=false;},3000);
  }catch(e){
    s.textContent='❌ Błąd wysyłki. Zadzwoń: 514 338 875';s.style.color='#ef4444';
    btn.textContent='WYŚLIJ ZGŁOSZENIE';btn.disabled=false;btn.classList.add('active');
  }
}

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
