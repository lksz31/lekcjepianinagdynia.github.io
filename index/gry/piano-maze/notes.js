/* ══ notes.js – Muzyczny Labirynt ══
   Klucze muzyczne: obrazy PNG/JPG zamiast tekstu
   Klucz basowy:    zapis-nutowy/piano-maze-klucz.png  (302×362, F line ≈ 33.6 % od góry)
   Klucz wiolinowy: zapis-nutowy/wiolinowy-maze-bez-tla.jpg (183×399, G line ≈ 56 % od góry)
   ══════════════════════════════════════════════════════════════════════════════════════ */

/* ── URL-e do obrazów kluczy (ścieżka względem katalogu piano-maze/) ── */
const CLEF_BASS_URL   = '/index/gry/piano-maze/zapis-nutowy/piano-maze-klucz.png';
const CLEF_TREBLE_URL = '/index/gry/piano-maze/zapis-nutowy/wiolinowy-maze-bez-tla.jpg';

/* ── Proporcje obrazów (szerokość/wysokość) ── */
const CLEF_BASS_RATIO   = 302 / 362;  /* 0.834 */
const CLEF_TREBLE_RATIO = 183 / 399;  /* 0.459 */

/* ── Pozycja kluczowej linii w obrazie (procent od góry) ──
   Bass:   linia F = midpoint dwóch kropek (y ≈ 21.8 % i 45.3 %) → 33.6 %
   Treble: linia G = środek dolnej pętli ≈ 56 %                              */
const CLEF_BASS_F_PCT   = 0.336;
const CLEF_TREBLE_G_PCT = 0.560;

/* ══════════════════════════════════════════════════════════════════════════ */

const DIR_COLORS         = { N:'#e8c040', E:'#f06868', S:'#50a8f0', W:'#60d870' };
const NOTE_COLOR_DEFAULT = '#c8b87a';

const ALL_NOTE_DEFS = [
  {id:'C',  freq:65.41,  name:'C',   clef:'B', staffY_G:null, staffY_B:14},
  {id:'D',  freq:73.42,  name:'D',   clef:'B', staffY_G:null, staffY_B:13},
  {id:'E',  freq:82.41,  name:'E',   clef:'B', staffY_G:null, staffY_B:12},
  {id:'F',  freq:87.31,  name:'F',   clef:'B', staffY_G:null, staffY_B:11},
  {id:'G',  freq:98.00,  name:'G',   clef:'B', staffY_G:null, staffY_B:10},
  {id:'A',  freq:110.00, name:'A',   clef:'B', staffY_G:null, staffY_B:9},
  {id:'H',  freq:123.47, name:'H',   clef:'B', staffY_G:null, staffY_B:8},
  {id:'c',  freq:130.81, name:'c',   clef:'B', staffY_G:null, staffY_B:7},
  {id:'d',  freq:146.83, name:'d',   clef:'B', staffY_G:null, staffY_B:6},
  {id:'e',  freq:164.81, name:'e',   clef:'B', staffY_G:null, staffY_B:5},
  {id:'f',  freq:174.61, name:'f',   clef:'B', staffY_G:null, staffY_B:4},
  {id:'g',  freq:196.00, name:'g',   clef:'B', staffY_G:null, staffY_B:3},
  {id:'a',  freq:220.00, name:'a',   clef:'B', staffY_G:null, staffY_B:2},
  {id:'h',  freq:246.94, name:'h',   clef:'B', staffY_G:null, staffY_B:1},
  {id:'c1', freq:261.63, name:'c\u00b9', clef:'G', staffY_G:10, staffY_B:0},
  {id:'d1', freq:293.66, name:'d\u00b9', clef:'G', staffY_G:9,  staffY_B:-1},
  {id:'e1', freq:329.63, name:'e\u00b9', clef:'G', staffY_G:8,  staffY_B:-2},
  {id:'f1', freq:349.23, name:'f\u00b9', clef:'G', staffY_G:7,  staffY_B:-3},
  {id:'g1', freq:392.00, name:'g\u00b9', clef:'G', staffY_G:6,  staffY_B:-4},
  {id:'a1', freq:440.00, name:'a\u00b9', clef:'G', staffY_G:5,  staffY_B:-5},
  {id:'h1', freq:493.88, name:'h\u00b9', clef:'G', staffY_G:4,  staffY_B:-6},
  {id:'c2', freq:523.25, name:'c\u00b2', clef:'G', staffY_G:3,  staffY_B:-7},
  {id:'d2', freq:587.33, name:'d\u00b2', clef:'G', staffY_G:2,  staffY_B:-8},
  {id:'e2', freq:659.25, name:'e\u00b2', clef:'G', staffY_G:1,  staffY_B:-9},
  {id:'f2', freq:698.46, name:'f\u00b2', clef:'G', staffY_G:0,  staffY_B:-10},
  {id:'g2', freq:784.00, name:'g\u00b2', clef:'G', staffY_G:-1, staffY_B:-11},
  {id:'a2', freq:880.00, name:'a\u00b2', clef:'G', staffY_G:-2, staffY_B:-12},
  {id:'h2', freq:987.77, name:'h\u00b2', clef:'G', staffY_G:-3, staffY_B:-13},
];

const NOTE_RANGE_MAP = {
  'G_small':  ['c1','d1','e1','f1','g1','a1','h1'],
  'G_big':    ['c1','d1','e1','f1','g1','a1','h1','c2','d2','e2','f2','g2','a2','h2'],
  'B_small':  ['c','d','e','f','g','a','h','c1'],
  'B_big':    ['C','D','E','F','G','A','H','c','d','e','f','g','a','h','c1'],
  'GB_small': ['c','d','e','f','g','a','h','c1','d1','e1','f1','g1','a1','h1'],
  'GB_big':   ['C','D','E','F','G','A','H','c','d','e','f','g','a','h','c1','d1','e1','f1','g1','a1','h1','c2','d2','e2','f2','g2','a2','h2'],
};

const NOTE_RANGE_LABELS = {
  'G_small':  'c\u00b9 \u2014 h\u00b9',
  'G_big':    'c\u00b9 \u2014 h\u00b2',
  'B_small':  'c \u2014 c\u00b9',
  'B_big':    'C \u2014 c\u00b9',
  'GB_small': 'c \u2014 h\u00b9',
  'GB_big':   'C \u2014 h\u00b2',
};

const ARR = { N:'\u2191', S:'\u2193', W:'\u2190', E:'\u2192' };
let coloredNotes = false;
function noteColor(n, dir) { return coloredNotes ? DIR_COLORS[dir] || NOTE_COLOR_DEFAULT : NOTE_COLOR_DEFAULT; }

let MN = [];
let clefMode  = 'GB';
let noteRange = 'small';

function getRangeKey() { return clefMode + '_' + noteRange; }

const DIR_BY_NOTE_BASE = { 'C':'N','D':'N','E':'E','F':'E','G':'S','A':'S','H':'W' };
function getNoteBase(id) { return id.replace(/[0-9]/g, '').toUpperCase(); }

function resolveDisplayProps(n) {
  let displayClef = n.clef;
  let staffY      = n.clef === 'G' ? n.staffY_G : n.staffY_B;
  if (clefMode === 'B' && n.clef === 'G') { staffY = n.staffY_B;  displayClef = 'B'; }
  if (clefMode === 'G' && n.clef === 'B') { staffY = n.staffY_G !== null ? n.staffY_G : (n.staffY_B + 10); displayClef = 'G'; }
  return { displayClef, staffY };
}

function buildActiveNotes() {
  const key  = getRangeKey();
  const ids  = NOTE_RANGE_MAP[key] || NOTE_RANGE_MAP['G_small'];
  const pool = ids.map(id => ALL_NOTE_DEFS.find(n => n.id === id)).filter(Boolean);
  if (!pool.length) return;
  const groups = { N:[], E:[], S:[], W:[] };
  pool.forEach(n => { const dir = DIR_BY_NOTE_BASE[getNoteBase(n.id)]; if (dir) groups[dir].push(n); });
  MN = ['N','E','S','W'].map(dir => {
    const g = groups[dir];
    if (!g || !g.length) return null;
    const n = g[Math.floor(Math.random() * g.length)];
    const { displayClef, staffY } = resolveDisplayProps(n);
    return { ...n, dir, displayClef, staffY };
  }).filter(Boolean);
  updateRangeInfoBox();
}

function updateRangeInfoBox() {
  const key = getRangeKey();
  const el  = document.getElementById('range-info-text');
  if (el) el.textContent = NOTE_RANGE_LABELS[key] || '';
}

/* ══════════════════════════════════════════════════════════════════════════
   noteSVG – generuje SVG dla kafelka nuty
   Klucze rysowane jako <image> (PNG/JPG) zamiast fontów muzycznych:
     • Klucz basowy  – piano-maze-klucz.png  – linia F na 33.6 % od góry
     • Klucz wiolinowy – wiolinowy-maze-bez-tla.jpg – linia G na 56 % od góry
       (JPG ma ciemne tło → mix-blend-mode:screen usuwa tło wizualnie)
   ══════════════════════════════════════════════════════════════════════════ */
function noteSVG(n, W, H, showLabel) {
  W = W || 80;
  H = H || 92;
  const dir   = n.dir;
  const c     = noteColor(n, dir);
  const isB   = n.displayClef === 'B';
  const scale = W / 80;
  const sg    = Math.round(9 * scale);          /* odstęp między liniami      */
  const staffTop = Math.round(18 * scale);      /* y pierwszej (górnej) linii */

  let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect width="${W}" height="${H}" rx="7" fill="rgba(2,6,2,0.75)" stroke="${c}" stroke-width="1.5"/>`;

  /* Pięć linii pięciolinii */
  for (let i = 0; i < 5; i++) {
    const ly = staffTop + i * sg;
    s += `<line x1="5" y1="${ly}" x2="${W-5}" y2="${ly}" stroke="${c}" stroke-width="${Math.max(0.7, 0.9*scale)}" opacity="0.6"/>`;
  }

  /* ── Klucz muzyczny – obraz zamiast fontu ──
     Bass:   h = sg*4.0, wyrównanie linii F (2. linia od góry = staffTop+sg)
     Treble: h = sg*6.0, wyrównanie linii G (4. linia od góry = staffTop+3*sg)
             JPG ma ciemne tło → mix-blend-mode:screen czyni je przezroczystym */
  if (isB) {
    const ch  = Math.round(sg * 4.0);
    const cw  = Math.round(ch * CLEF_BASS_RATIO);
    /* linia F = staffTop + sg; linia F w PNG = CLEF_BASS_F_PCT * ch */
    const cy  = (staffTop + sg) - CLEF_BASS_F_PCT * ch;
    s += `<image href="${CLEF_BASS_URL}" x="2" y="${cy.toFixed(1)}" width="${cw}" height="${ch}" preserveAspectRatio="none"/>`;
  } else {
    const ch  = Math.round(sg * 6.0);
    const cw  = Math.round(ch * CLEF_TREBLE_RATIO);
    /* linia G = staffTop + 3*sg; linia G w JPG = CLEF_TREBLE_G_PCT * ch */
    const cy  = (staffTop + 3 * sg) - CLEF_TREBLE_G_PCT * ch;
    /* mix-blend-mode:screen sprawia że ciemne tło JPG staje się "przezroczyste" */
    s += `<image href="${CLEF_TREBLE_URL}" x="2" y="${cy.toFixed(1)}" width="${cw}" height="${ch}" preserveAspectRatio="none" style="mix-blend-mode:screen"/>`;
  }

  /* Linia ledger powyżej pięciolinii */
  const topLine = staffTop;
  const botLine = staffTop + 4 * sg;
  const ledW    = Math.max(6, Math.round(9 * scale));
  const noteX   = W * 0.65;
  const staffY  = n.staffY;
  const noteY   = staffTop + (staffY * sg / 2);

  if (noteY > botLine + sg * 0.5) {
    let ledY = botLine + sg;
    while (ledY <= noteY + sg * 0.3) {
      s += `<line x1="${noteX-ledW}" y1="${ledY}" x2="${noteX+ledW}" y2="${ledY}" stroke="${c}" stroke-width="${Math.max(0.8, 1.2*scale)}"/>`;
      ledY += sg;
    }
  }
  if (noteY < topLine - sg * 0.5) {
    let ledY = topLine - sg;
    while (ledY >= noteY - sg * 0.3) {
      s += `<line x1="${noteX-ledW}" y1="${ledY}" x2="${noteX+ledW}" y2="${ledY}" stroke="${c}" stroke-width="${Math.max(0.8, 1.2*scale)}"/>`;
      ledY -= sg;
    }
  }

  /* Główka nuty */
  const nrx = Math.max(4, Math.round(6.5 * scale));
  const nry = Math.max(3, Math.round(4.5 * scale));
  s += `<ellipse cx="${noteX}" cy="${noteY}" rx="${nrx}" ry="${nry}" fill="${c}" transform="rotate(-15,${noteX},${noteY})"/>`;

  /* Ogon nuty */
  const stemUp = noteY > staffTop + sg * 2;
  const sx     = stemUp ? noteX + nrx * 0.9 : noteX - nrx * 0.9;
  const stemLen = Math.max(18, Math.round(26 * scale));
  const sy2    = noteY + (stemUp ? -stemLen : stemLen);
  s += `<line x1="${sx}" y1="${noteY}" x2="${sx}" y2="${sy2}" stroke="${c}" stroke-width="${Math.max(1, 1.5*scale)}"/>`;

  /* Podpis nuty (opcjonalny) */
  if (showLabel) {
    const lblSz = Math.max(7, Math.round(9 * scale));
    s += `<text x="${W/2}" y="${H-4}" font-size="${lblSz}" fill="${c}" text-anchor="middle" font-family="Cinzel,serif" font-weight="700">${n.name} ${ARR[dir]}</text>`;
  }

  s += '</svg>';
  return s;
}

/* ══ KAFELKI NUT ══ */
function shuffleTileOrder() {
  for (let i = tileOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tileOrder[i], tileOrder[j]] = [tileOrder[j], tileOrder[i]];
  }
}

function reshuffleNotes() {
  shuffleTileOrder();
  buildActiveNotes();
  buildNoteTiles();
  refreshSideBar();
}

function buildNoteTiles() {
  shuffleTileOrder();
  const bar  = document.getElementById('note-bar');
  const show = controlMode === 'tiles' || controlMode === 'both';
  if (!show) { bar.innerHTML = ''; bar.className = 'note-bar'; return; }
  bar.innerHTML = '';
  const barW  = window.innerWidth;
  const tileW = Math.min(82, Math.floor((barW - 80) / 4));
  const tileH = noteLabels ? Math.min(102, tileW + 14) : Math.min(94, tileW + 10);
  tileOrder.forEach(dir => {
    const n = MN.find(x => x.dir === dir);
    if (!n) return;
    const t = document.createElement('div');
    t.className = 'note-tile';
    t.dataset.dir = dir;
    t.innerHTML = noteSVG(n, tileW, tileH, noteLabels);
    t.addEventListener('mousedown', () => startPress(dir, t));
    t.addEventListener('mouseup', stopPress);
    t.addEventListener('mouseleave', stopPress);
    t.addEventListener('touchstart', e => { e.preventDefault(); startPress(dir, t); }, { passive: false });
    t.addEventListener('touchend', stopPress);
    t.addEventListener('touchcancel', stopPress);
    if (controlMode === 'mic') t.classList.add('mic-only');
    bar.appendChild(t);
  });
  bar.className = 'note-bar show';
}

function startPress(dir, tile) {
  if (won || !mazeData) return;
  if (controlMode === 'mic') return;
  stopPress();
  activeTile = tile;
  tile.classList.add('pressing');
  move(dir);
  reshuffleNotes();
  pressTimer = setInterval(() => {
    if (!won && mazeData) { move(dir); reshuffleNotes(); } else stopPress();
  }, 200);
}
function stopPress() {
  clearInterval(pressTimer);
  pressTimer = null;
  if (activeTile) { activeTile.classList.remove('pressing'); activeTile = null; }
}

/* ══ PANEL BOCZNY – tabela sterowania ══ */
function buildCtrlTable(container) {
  if (!container) return;
  let h = '<div style="margin-bottom:7px;"><h5 style="font-size:.58rem;color:#8a7a5a;letter-spacing:.06em;margin-bottom:4px;">Klawiatura</h5>';
  h += `<table class="ctrl-table"><thead><tr><th>Klawisz</th><th>Kier.</th></tr></thead><tbody>
    <tr><td><span class="ctrl-key">\u2191/W</span></td><td>G\u00f3ra</td></tr>
    <tr><td><span class="ctrl-key">\u2193/S</span></td><td>D\u00f3\u0142</td></tr>
    <tr><td><span class="ctrl-key">\u2190/A</span></td><td>Lewo</td></tr>
    <tr><td><span class="ctrl-key">\u2192/D</span></td><td>Prawo</td></tr>
  </tbody></table></div>`;
  h += '<div><h5 style="font-size:.58rem;color:#8a7a5a;letter-spacing:.06em;margin-bottom:4px;">Nuty</h5>';
  h += `<table class="ctrl-table"><thead><tr><th>Nuta</th><th>Kier.</th></tr></thead><tbody>`;
  MN.forEach(n => {
    const col = coloredNotes ? DIR_COLORS[n.dir] : NOTE_COLOR_DEFAULT;
    h += `<tr><td style="color:${col}">${n.name}</td><td>${ARR[n.dir]}</td></tr>`;
  });
  h += '</tbody></table></div>';
  container.innerHTML = h;
}
function refreshSideBar() { const sb = document.getElementById('side-content'); if (sb) buildCtrlTable(sb); }
