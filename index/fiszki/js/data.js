/* ═══════════════════════════════════════
   data.js – dane nut (TREBLE, BASS, alteracje)
   ═══════════════════════════════════════ */
const TREBLE=[
  {l:'g',p:-5,f:196.00},{l:'a',p:-4,f:220.00},{l:'h',p:-3,f:246.94},
  {l:'c¹',p:-2,f:261.63},{l:'d¹',p:-1,f:293.66},{l:'e¹',p:0,f:329.63},
  {l:'f¹',p:1,f:349.23},{l:'g¹',p:2,f:392.00},{l:'a¹',p:3,f:440.00},
  {l:'h¹',p:4,f:493.88},{l:'c²',p:5,f:523.25},{l:'d²',p:6,f:587.33},
  {l:'e²',p:7,f:659.25},{l:'f²',p:8,f:698.46},{l:'g²',p:9,f:783.99},
  {l:'a²',p:10,f:880.00},{l:'h²',p:11,f:987.77},{l:'c³',p:12,f:1046.50},
  {l:'d³',p:13,f:1174.66},{l:'e³',p:14,f:1318.51},
];
const BASS=[
  {l:'G',p:-7,f:24.50,kontra:true},{l:'A',p:-6,f:27.50,kontra:true},{l:'H',p:-5,f:30.87,kontra:true},
  {l:'C',p:-4,f:32.70},{l:'D',p:-3,f:36.71},{l:'E',p:-2,f:41.20},{l:'F',p:-1,f:43.65},
  {l:'G',p:0,f:49.00},{l:'A',p:1,f:55.00},{l:'H',p:2,f:61.74},
  {l:'c',p:3,f:65.41},{l:'d',p:4,f:73.42},{l:'e',p:5,f:82.41},
  {l:'f',p:6,f:87.31},{l:'g',p:7,f:98.00},{l:'a',p:8,f:110.00},
  {l:'h',p:9,f:123.47},{l:'c¹',p:10,f:130.81},{l:'d¹',p:11,f:146.83},
  {l:'e¹',p:12,f:164.81},{l:'f¹',p:13,f:174.61},
];
const T_ALT=[
  {l:'gis',p:-5,f:207.65,a:'#'},{l:'as',p:-4,f:207.65,a:'b'},
  {l:'ais',p:-4,f:233.08,a:'#'},{l:'b',p:-3,f:233.08,a:'b'},
  {l:'cis¹',p:-2,f:277.18,a:'#'},{l:'dis¹',p:-1,f:311.13,a:'#'},
  {l:'es¹',p:0,f:311.13,a:'b'},{l:'fis¹',p:1,f:369.99,a:'#'},
  {l:'gis¹',p:2,f:415.30,a:'#'},{l:'as¹',p:3,f:415.30,a:'b'},
  {l:'ais¹',p:3,f:466.16,a:'#'},{l:'b¹',p:4,f:466.16,a:'b'},
  {l:'cis²',p:5,f:554.37,a:'#'},{l:'dis²',p:6,f:622.25,a:'#'},
  {l:'fis²',p:8,f:739.99,a:'#'},{l:'gis²',p:9,f:830.61,a:'#'},
  {l:'cis³',p:12,f:1108.73,a:'#'},{l:'dis³',p:13,f:1244.51,a:'#'},
];
const B_ALT=[
  {l:'Gis',p:-7,f:25.96,a:'#',kontra:true},{l:'Ais',p:-6,f:29.14,a:'#',kontra:true},
  {l:'Cis',p:-4,f:34.65,a:'#'},{l:'Dis',p:-3,f:38.89,a:'#'},
  {l:'Fis',p:-1,f:46.25,a:'#'},{l:'Gis',p:0,f:51.91,a:'#'},
  {l:'Ais',p:1,f:58.27,a:'#'},{l:'cis',p:3,f:69.30,a:'#'},
  {l:'dis',p:4,f:77.78,a:'#'},{l:'fis',p:6,f:92.50,a:'#'},
  {l:'gis',p:7,f:103.83,a:'#'},{l:'as',p:8,f:103.83,a:'b'},
  {l:'ais',p:8,f:116.54,a:'#'},{l:'b',p:9,f:116.54,a:'b'},
  {l:'cis¹',p:10,f:138.59,a:'#'},{l:'dis¹',p:11,f:155.56,a:'#'},
  {l:'fis¹',p:13,f:185.00,a:'#'},
];

function noteEN(n){
  const base=n.l.replace(/[¹²³]/g,'');
  const oct=n.l.match(/[¹²³]/)?n.l.match(/[¹²³]/)[0]:'';
  const names={'C':'C','D':'D','E':'E','F':'F','G':'G','A':'A','H':'B','h':'b',
    'Cis':'C#','Dis':'D#','Fis':'F#','Gis':'G#','Ais':'A#',
    'es':'Eb','as':'Ab','b':'Bb','Es':'Eb','As':'Ab','B':'Bb'};
  const baseN=base in names?names[base]:base;
  /* Oktawy bez znaku diakrytycznego (bez ¹²³) rozróżniamy wielkością litery
     oraz flagami kontra/subkontra: subkontra=0, kontra=1, wielka (duża
     litera, bez flagi)=2, mała (mała litera, bez flagi)=3. */
  const octMap={'¹':'4','²':'5','³':'6','':(n.subkontra?'0':n.kontra?'1':(/^[A-Z]/.test(base)?'2':'3'))};
  return baseN+(octMap[oct]||'');
}
