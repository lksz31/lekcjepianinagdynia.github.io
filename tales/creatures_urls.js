/* ══ CREATURE_IMGS — obrazki z GitHub Pages ══ */
const CREATURE_IMGS = {
  sowa:       'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/sowa_maze.png',
  swinka:     'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/swinka_m_maze.png',
  szynszyla:  'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/szynszyla_maze.png',
  wiewiorka:  'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/wiewiorka_maze.png',
  winniczek:  'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/winniczek_maze.png',
  wrobel:     'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/wrobel_maze.png',
  zabka:      'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/zabka_maze.png',
  zolw:       'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/zolw_maze.png',
  biedronka:  'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/biedronka_maze.png',
  chomik:     'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/chomik_maze.png',
  dzdz:       'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/dzdz_maze.png',
  jaszczurka: 'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/jaszczurka_maze.png',
  jez:        'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/jez_maze.png',
  kameleon:   'https://lksz31.github.io/lekcjepianinagdynia.github.io/tales/postacie/zwierzatka/kameleon_maze.png',
};

/* ══ CREATURE_DEFS ══ */
const CREATURE_DEFS = [
  { id: 'sowa',       name: 'Sowa',        img: CREATURE_IMGS.sowa },
  { id: 'swinka',     name: 'Świnka',      img: CREATURE_IMGS.swinka },
  { id: 'szynszyla',  name: 'Szynszyla',   img: CREATURE_IMGS.szynszyla },
  { id: 'wiewiorka',  name: 'Wiewiórka',   img: CREATURE_IMGS.wiewiorka },
  { id: 'winniczek',  name: 'Winniczek',   img: CREATURE_IMGS.winniczek },
  { id: 'wrobel',     name: 'Wróbel',      img: CREATURE_IMGS.wrobel },
  { id: 'zabka',      name: 'Żabka',       img: CREATURE_IMGS.zabka },
  { id: 'zolw',       name: 'Żółw',        img: CREATURE_IMGS.zolw },
  { id: 'biedronka',  name: 'Biedronka',   img: CREATURE_IMGS.biedronka },
  { id: 'chomik',     name: 'Chomik',      img: CREATURE_IMGS.chomik },
  { id: 'dzdz',       name: 'Dżdżownica', img: CREATURE_IMGS.dzdz },
  { id: 'jaszczurka', name: 'Jaszczurka',  img: CREATURE_IMGS.jaszczurka },
  { id: 'jez',        name: 'Jeż',         img: CREATURE_IMGS.jez },
  { id: 'kameleon',   name: 'Kameleon',    img: CREATURE_IMGS.kameleon },
];

/* ══ CREATURE SYSTEM ══ */
let creaturesOnMap = [];
let creaturesFollowing = [];
let creaturePositions = [];
const CREATURE_SIZE = 20;
const CREATURE_SPACING = 18;
const CREATURE_HIST = 200;

function spawnCreatures() {
  creaturesOnMap.forEach(c => { if (c.imgEl && c.imgEl.parentNode) c.imgEl.parentNode.removeChild(c.imgEl); });
  creaturesFollowing.forEach(c => { if (c.imgEl && c.imgEl.parentNode) c.imgEl.parentNode.removeChild(c.imgEl); });
  creaturesOnMap = [];
  creaturesFollowing = [];
  creaturePositions = [];

  if (!mazeData) return;

  const { conn, startR, startC, goalR, goalC } = mazeData;
  const available = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (conn[r][c].size > 0 && !(r === startR && c === startC) && !(r === goalR && c === goalC)) {
        available.push({ r, c });
      }
    }
  }
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }

  const wrap = document.getElementById('canvas-wrap');
  const count = Math.min(CREATURE_DEFS.length, available.length);

  for (let i = 0; i < count; i++) {
    const def = CREATURE_DEFS[i];
    const pos = available[i];
    const imgEl = document.createElement('img');
    imgEl.src = def.img;
    imgEl.style.cssText = `position:absolute;width:${CREATURE_SIZE}px;height:${CREATURE_SIZE}px;image-rendering:pixelated;pointer-events:none;z-index:9;transform:translate(-50%,-50%);transition:opacity .3s;`;
    wrap.appendChild(imgEl);
    creaturesOnMap.push({ ...def, r: pos.r, c: pos.c, imgEl });
  }

  updateCreatureHUD();
  updateCreaturePositions();
}

function updateCreaturePositions() {
  if (!mazeData) return;
  const cr = canvas.getBoundingClientRect();
  const ar = document.getElementById('canvas-wrap').getBoundingClientRect();
  const ox = cr.left - ar.left;
  const oy = cr.top - ar.top;

  creaturesOnMap.forEach(c => {
    const px = ox + c.c * TILE + TILE / 2;
    const py = oy + c.r * TILE + TILE / 2;
    c.imgEl.style.left = px + 'px';
    c.imgEl.style.top = py + 'px';
    const fa = fogEnabled ? (fogAlpha[c.r] ? fogAlpha[c.r][c.c] : 1) : 0;
    c.imgEl.style.opacity = fogEnabled ? (fa < 0.7 ? '1' : '0') : '1';
  });

  creaturesFollowing.forEach((c, idx) => {
    const delay = (idx + 1) * CREATURE_SPACING;
    const histIdx = Math.max(0, creaturePositions.length - 1 - delay);
    if (creaturePositions.length === 0) return;
    const pos = creaturePositions[histIdx];
    c.imgEl.style.left = pos.x + 'px';
    c.imgEl.style.top = pos.y + 'px';
    c.imgEl.style.opacity = '1';
  });
}

function recordPlayerPos() {
  if (!mazeData) return;
  const cr = canvas.getBoundingClientRect();
  const ar = document.getElementById('canvas-wrap').getBoundingClientRect();
  const ox = cr.left - ar.left;
  const oy = cr.top - ar.top;
  const px = ox + playerC * TILE + TILE / 2;
  const py = oy + playerR * TILE + TILE / 2;
  creaturePositions.push({ x: px, y: py });
  if (creaturePositions.length > CREATURE_HIST + creaturesFollowing.length * CREATURE_SPACING + 20) {
    creaturePositions.shift();
  }
}

function checkCreaturePickup() {
  const idx = creaturesOnMap.findIndex(c => c.r === playerR && c.c === playerC);
  if (idx !== -1) {
    const creature = creaturesOnMap.splice(idx, 1)[0];
    creaturesFollowing.push(creature);
    updateCreatureHUD();
  }
}

function updateCreatureHUD() {
  const el = document.getElementById('hud-creatures');
  if (!el) return;
  const total = creaturesOnMap.length + creaturesFollowing.length;
  el.textContent = `🐾 ${creaturesFollowing.length}/${total}`;
}
