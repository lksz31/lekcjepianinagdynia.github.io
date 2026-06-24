/* ═══════════════════════════════════════
   kids.js – tryb dziecięcy
   • pszczółka leci wolno do krawędzi → kwiatek wyrasta
   • kwiaty pojawiają się na bokach strony, nie nachodzą totalnie
   ═══════════════════════════════════════ */

/* ── Pszczółka ── */
let kidMode = false;
const BEE_IMG = new Image();
BEE_IMG.src = 'concept_art/' + encodeURIComponent('pszczoła.png');

let beeOpacity = 0.30;
let _beeAnimPhase = 0;
let _beeAnimFrame = null;

/* ── Lista kwiatów ── */
const KID_FLOWERS = [
  'aster.png','dzwonek.png','frezja.png','gerbera.png',
  'groszek_pachnacy.png','hibiskus.png','lilia.png','mak.png',
  'ostrożeń_chaber_kulkowy.png','piwonia.png','roza1.png',
  'slonecznik.png','stokrotka.png','szafirek.png','tulipan.png'
];
const MAX_FLOWERS = 60;
const MIN_FLOWER_DIST = 80; /* minimalna odległość między środkami (px) */

/* Śledzenie pozycji kwiatów (aby unikać pełnego nachodzenia) */
let placedFlowerPositions = [];

/* ─────────────────────────────────────
   getFlowerPos – losuj pozycję na boku
   ───────────────────────────────────── */
function getFlowerPos(size) {
  const VW = window.innerWidth;
  const VH = window.innerHeight;
  const side = Math.random() < 0.5 ? 'left' : 'right';

  /* Kwiatek ma być widoczny w 45–80 % – na krawędzi lub w marginesie */
  let cx, cy;
  let bestCx = null, bestCy = null, bestDist = -1;

  for (let attempt = 0; attempt < 18; attempt++) {
    const vis = size * (0.45 + Math.random() * 0.35);  /* ile widoczne */

    if (side === 'left') {
      cx = vis - size / 2;                             /* ujemne OK – poza ekranem */
    } else {
      cx = VW - vis + size / 2;
    }
    cy = VH * 0.10 + Math.random() * VH * 0.78;

    /* minimalna odległość od istniejących kwiatów */
    const minD = placedFlowerPositions.reduce((d, p) => {
      const dist = Math.hypot(p.x - cx, p.y - cy);
      return Math.min(d, dist);
    }, Infinity);

    if (minD > MIN_FLOWER_DIST || placedFlowerPositions.length === 0) {
      return { cx, cy, side };
    }
    if (minD > bestDist) { bestDist = minD; bestCx = cx; bestCy = cy; }
  }
  return { cx: bestCx ?? cx, cy: bestCy ?? cy, side };
}

/* ─────────────────────────────────────
   bloomFlower – wstaw kwiatek do DOM
   ───────────────────────────────────── */
function bloomFlower(bg, flower, pos, size, rot, swayDelay) {
  const img = document.createElement('img');
  img.src = 'concept_art/' + encodeURIComponent(flower);
  img.alt = '';
  img.className = 'kid-flower';
  img.draggable = false;

  /* Pozycja: CSS left/top to lewy-górny róg elementu */
  img.style.cssText =
    'left:' + (pos.cx - size / 2) + 'px;' +
    'top:'  + (pos.cy - size / 2) + 'px;' +
    'width:' + size + 'px;height:' + size + 'px;';
  img.style.setProperty('--rot', rot + 'deg');
  img.style.setProperty('--sway-delay', swayDelay);

  bg.appendChild(img);

  /* Zapisz pozycję do kolizji */
  placedFlowerPositions.push({ x: pos.cx, y: pos.cy });
  if (placedFlowerPositions.length > MAX_FLOWERS) placedFlowerPositions.shift();

  /* Po animacji pop – zamroz i zacznij kołysanie */
  img.addEventListener('animationend', () => {
    img.style.opacity = '0.88';
    img.style.transform = 'rotate(' + rot + 'deg) scale(1)';
    img.style.animation = 'none';
    setTimeout(() => img.classList.add('swaying'), 50);
  }, { once: true });
}

/* ─────────────────────────────────────
   spawnKidFlower – uruchom całą sekwencję
   ───────────────────────────────────── */
function spawnKidFlower() {
  if (!kidMode) return;
  const bg = document.getElementById('kid-flowers-bg');
  if (!bg) return;
  if (bg.childElementCount >= MAX_FLOWERS) bg.removeChild(bg.firstChild);

  const flower   = KID_FLOWERS[Math.floor(Math.random() * KID_FLOWERS.length)];
  const size     = 130 + Math.random() * 75;          /* 130–205 px */
  const rot      = (Math.random() - 0.5) * 28;
  const swayDel  = (Math.random() * 3).toFixed(2) + 's';
  const pos      = getFlowerPos(size);

  /* Pszczółka wlatuje z przeciwnej strony i leci do pozycji kwiatu */
  if (typeof window.runBeeToFlower === 'function') {
    const fromRight = (pos.side === 'left');  /* kwiat po lewej → pszcz. z prawej */
    window.runBeeToFlower(pos.cx, pos.cy, fromRight, () => {
      bloomFlower(bg, flower, pos, size, rot, swayDel);
    });
  } else {
    bloomFlower(bg, flower, pos, size, rot, swayDel);
  }
}

/* ── Włącz / wyłącz tryb dziecięcy ── */
function setKidMode(on) {
  kidMode = on;
  document.body.classList.toggle('kid-mode', on);
  if (on) {
    if (!_beeAnimFrame) _beeAnimate();
  } else {
    if (_beeAnimFrame) { cancelAnimationFrame(_beeAnimFrame); _beeAnimFrame = null; }
    beeOpacity = 1;
    if (notes && notes.length > 0) render(notes);
    /* Wyczyść kwiaty i pozycje */
    const bg = document.getElementById('kid-flowers-bg');
    if (bg) bg.innerHTML = '';
    placedFlowerPositions = [];
  }
}

/* Pulsowanie pszczółki na pięciolinii */
function _beeAnimate() {
  if (!kidMode) { _beeAnimFrame = null; return; }
  if (document.hidden) { _beeAnimFrame = requestAnimationFrame(_beeAnimate); return; }
  _beeAnimPhase += 0.025;
  beeOpacity = 0.5 + 0.5 * (1 + Math.sin(_beeAnimPhase)) / 2;
  if (notes && notes.length > 0) render(notes);
  _beeAnimFrame = requestAnimationFrame(_beeAnimate);
}

/* ═══════════════════════════════════════
   Animacja pszczółki – canvas overlay
   ═══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById('kid-anim-canvas');
  const ctx    = canvas.getContext('2d');
  let animId   = null;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* ── BŁĘDNA ODPOWIEDŹ: szybki przelot przez ekran ── */
  function runBeeAnim(isCorrect) {
    if (!kidMode) return;
    if (animId) { cancelAnimationFrame(animId); animId = null; ctx.clearRect(0,0,canvas.width,canvas.height); }
    resize();
    const W = canvas.width, H = canvas.height;
    const BS = 80;
    let t = 0;
    const TOTAL = 80;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const p   = t / TOTAL;
      const beeX = W * 0.5 + p * (W + BS * 2);
      const beeY = H * 0.5 + Math.sin(p * Math.PI) * (-50);
      if (BEE_IMG.complete && BEE_IMG.naturalWidth > 0) {
        ctx.save(); ctx.translate(beeX, beeY); ctx.scale(1, 1);
        ctx.drawImage(BEE_IMG, -BS/2, -BS/2, BS,
          Math.round(BS * BEE_IMG.naturalHeight / Math.max(BEE_IMG.naturalWidth, 1)));
        ctx.restore();
      }
      t++;
      if (t <= TOTAL) animId = requestAnimationFrame(draw);
      else { ctx.clearRect(0,0,W,H); animId = null; }
    }
    animId = requestAnimationFrame(draw);
  }

  /* ── POPRAWNA ODPOWIEDŹ: pszczółka leci WOLNO do kwiatu ──
     Wlatuje z przeciwnej strony niż kwiat, leci bezierową
     krzywą do pozycji kwiatu, na chwilę zatrzymuje się,
     po czym szybko wylatuje (i wtedy wywołuje onArrived).   */
  function runBeeToFlower(flowerCX, flowerCY, fromRight, onArrived) {
    if (!kidMode) { setTimeout(onArrived, 0); return; }
    if (animId) {
      /* pszczółka zajęta – kwiatek pojawia się natychmiast */
      setTimeout(onArrived, 0);
      return;
    }
    resize();
    const W  = canvas.width, H = canvas.height;
    const BS = 90;  /* rozmiar pszczółki na canvasie */

    /* Start: wlatuje z zewnątrz, po przeciwnej stronie niż kwiat */
    const startX = fromRight ? W + BS : -BS;
    const startY = H * 0.35 + Math.random() * H * 0.30;

    /* Punkt kontrolny łuku: góra-środek trasy */
    const ctrlX  = (startX + flowerCX) / 2;
    const ctrlY  = Math.min(startY, flowerCY) - H * 0.14;

    /* Wyjście: za krawędzią, po stronie kwiatu */
    const exitX  = fromRight ? -BS * 2 : W + BS * 2;

    /* Kierunek lotu (orientacja pszczółki) */
    const scaleX = fromRight ? 1 : -1;   /* leci w lewo lub w prawo */

    const ARRIVE  = 160;   /* klatka dotarcia do kwiatu (~2.7 s @ 60fps) */
    const HOVER   = 20;    /* chwila unoszenia się przy kwiatu */
    const DEPART  = 35;    /* szybkie odlecenie */
    const TOTAL   = ARRIVE + HOVER + DEPART;

    let t = 0, arrived = false;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      let bx, by;

      if (t <= ARRIVE) {
        /* Faza 1: powolny lot krzywą do kwiatu */
        const p = t / ARRIVE;
        const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2) / 2; /* ease-in-out */
        bx = (1-e)*(1-e)*startX + 2*(1-e)*e*ctrlX + e*e*flowerCX;
        by = (1-e)*(1-e)*startY + 2*(1-e)*e*ctrlY + e*e*flowerCY;

      } else if (t <= ARRIVE + HOVER) {
        /* Faza 2: unoszenie przy kwiatu (drobne wibrowanie) */
        const phase = (t - ARRIVE) / HOVER;
        bx = flowerCX + Math.sin(phase * Math.PI * 4) * 5;
        by = flowerCY + Math.sin(phase * Math.PI * 6) * 4;

      } else {
        /* Faza 3: szybkie odlecenie + trigger kwiatu */
        const p  = (t - ARRIVE - HOVER) / DEPART;
        const e2 = p * p;              /* ease-in: przyspiesza */
        bx = flowerCX + (exitX - flowerCX) * e2;
        by = flowerCY;

        if (!arrived && p >= 0.12) {
          arrived = true;
          onArrived();              /* kwiatek wyrasta gdy pszcz. odlatuje */
        }
      }

      if (BEE_IMG.complete && BEE_IMG.naturalWidth > 0) {
        ctx.save(); ctx.translate(bx, by); ctx.scale(scaleX, 1);
        ctx.drawImage(BEE_IMG, -BS/2, -BS/2, BS,
          Math.round(BS * BEE_IMG.naturalHeight / Math.max(BEE_IMG.naturalWidth, 1)));
        ctx.restore();
      }

      t++;
      if (t <= TOTAL) {
        animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        animId = null;
        if (!arrived) onArrived();   /* fallback */
      }
    }
    animId = requestAnimationFrame(draw);
  }

  /* Eksportuj obie funkcje globalnie */
  window.runBeeAnim     = runBeeAnim;
  window.runBeeToFlower = runBeeToFlower;
})();
