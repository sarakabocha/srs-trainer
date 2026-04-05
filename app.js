// — Constants & Config —

const isMobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const CONTEXTS=[
  // Conversational — friend texts you
  (ko,en)=>({bubble:'요즘 뭐 하고 있어?',prompt:`Your friend says: "요즘 뭐 하고 있어?" Reply using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'주말에 뭐 했어요?',prompt:`A coworker asks: "주말에 뭐 했어요?" Answer using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'나 고민이 있어...',prompt:`Your friend texts: "나 고민이 있어..." Give advice using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'그거 어땠어?',prompt:`Someone asks: "그거 어땠어?" Describe your experience using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'한국어 왜 배워?',prompt:`A friend says: "한국어 왜 배워?" Explain using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'요즘 무슨 드라마 봐?',prompt:`Your friend asks: "요즘 무슨 드라마 봐?" Reply and work in "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'그 사람 어때?',prompt:`Someone asks: "그 사람 어때?" Describe them using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'너무 힘들어...',prompt:`A friend complains: "너무 힘들어..." Respond using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'이거 해 본 적 있어?',prompt:`Your friend says: "이거 해 본 적 있어?" Answer using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'왜 그렇게 생각해?',prompt:`Someone asks: "왜 그렇게 생각해?" Explain your reasoning using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'이번 주에 뭐 있었어?',prompt:`A friend asks: "이번 주에 뭐 있었어?" Describe something that happened using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'내일 뭐 할 거야?',prompt:`Your friend texts: "내일 뭐 할 거야?" Reply about your plans using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'습관 같은 거 있어?',prompt:`A friend asks: "습관 같은 거 있어?" Describe a habit using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'요즘 놀란 적 있어?',prompt:`Someone texts: "요즘 놀란 적 있어?" Describe a surprise using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'좋아하는 장소 있어?',prompt:`A friend asks: "좋아하는 장소 있어?" Write about a place using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'뭐 먹을 거야?',prompt:`A friend at a restaurant asks: "뭐 먹을 거야?" Explain what you want using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'그거 사 봤어? 어때?',prompt:`Someone asks about a purchase: "그거 사 봤어? 어때?" Leave a review using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'왜 이렇게 늦었어?',prompt:`A friend says: "왜 이렇게 늦었어?" Explain why you were late using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'뭐 추천해 줄 수 있어?',prompt:`A friend asks: "뭐 추천해 줄 수 있어?" Recommend something using "${ko}" (${en}).`}),
  (ko,en)=>({bubble:'나한테 할 말 없어?',prompt:`A friend says: "나한테 할 말 없어?" Apologize using "${ko}" (${en}).`}),
  // Sentence starters
  (ko,en)=>({bubble:'솔직히 말해 봐...',prompt:`Finish this in Korean using "${ko}" (${en}): "솔직히 말하면..." (honestly speaking...)`}),
  (ko,en)=>({bubble:'그때 무슨 일이 있었어?',prompt:`Finish this in Korean using "${ko}" (${en}): "그때 알았어..." (that's when I realized...)`}),
  (ko,en)=>({bubble:'처음부터 알았어?',prompt:`Finish this in Korean using "${ko}" (${en}): "처음에는 몰랐는데..." (at first I didn't know, but...)`}),
  (ko,en)=>({bubble:'만약에 말이야...',prompt:`Finish this in Korean using "${ko}" (${en}): "만약에..." (if...)`}),
];
const INTERVALS={good:[1,3,7,14,30],ok:[1,2,4,10],hard:[0,0,1,2]};
const SESSION_SIZES=[5,10,15,0];

// — Theme Toggle —

const SVG_SUN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
const SVG_MOON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const SVG_MONITOR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>';

function getThemePref(){return localStorage.getItem('theme-pref')||'system';}

function applyTheme(pref){
  document.documentElement.removeAttribute('data-theme');
  if(pref==='light') document.documentElement.setAttribute('data-theme','light');
  else if(pref==='dark') document.documentElement.setAttribute('data-theme','dark');
  // update all toggle buttons
  const icon=pref==='light'?SVG_SUN:pref==='dark'?SVG_MOON:SVG_MONITOR;
  document.querySelectorAll('.btn-theme-toggle').forEach(b=>{b.innerHTML=icon;});
}

function cycleTheme(){
  const order=['system','light','dark'];
  const cur=getThemePref();
  const next=order[(order.indexOf(cur)+1)%order.length];
  localStorage.setItem('theme-pref',next);
  applyTheme(next);
}

applyTheme(getThemePref());

// — SVG Icons —

const SVG_CHEVRON_RIGHT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const SVG_CHEVRON_DOWN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
const SVG_ARROW_RIGHT='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
const SVG_CHECK='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
const MIC_ICON=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`;
const MIC_ICON_ACTIVE=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`;
const SVG_WAVE='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2-4 6 4 10 0s6-4 10 0"/><path d="M2 17c2-4 6 4 10 0s6-4 10 0"/><path d="M2 7c2-4 6 4 10 0s6-4 10 0"/></svg>';
const SVG_X_MARK='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const SVG_TRASH='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>';
const SVG_SKIP_FWD='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>';
const SVG_X_CLOSE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

// — Utilities —

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function escJS(s){return"'"+String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/</g,'\\x3c').replace(/>/g,'\\x3e')+"'";}

// — Database / LocalStorage —

function getDB(){try{const d=localStorage.getItem('kr_srs');return d?JSON.parse(d):{words:{},sessions:0,streak:0,lastDate:null};}catch(e){return{words:{},sessions:0,streak:0,lastDate:null};}}
function saveDB(db){try{localStorage.setItem('kr_srs',JSON.stringify(db));}catch(e){}}
function todayStr(){return new Date().toISOString().slice(0,10);}

// — Spaced Repetition Logic —

function isDue(w){if(!w.nextReview)return true;return w.nextReview<=todayStr();}
function nextInterval(w,rating){const lvl=Math.max(0,Math.min((w.level||0),4));const arr=INTERVALS[rating]||INTERVALS.ok;const days=arr[Math.min(lvl,arr.length-1)];const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function updateStreak(db){const today=todayStr();if(db.lastDate===today){db.lastTimestamp=Date.now();return;}const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const yd=yesterday.toISOString().slice(0,10);if(db.lastDate===yd)db.streak=(db.streak||0)+1;else if(db.lastDate!==today)db.streak=1;db.lastDate=today;db.lastTimestamp=Date.now();}
function formatLastSession(db){if(!db.lastTimestamp&&!db.lastDate)return'';const ts=db.lastTimestamp||new Date(db.lastDate+'T12:00:00').getTime();const now=Date.now();const diffMs=now-ts;const diffH=Math.floor(diffMs/3600000);const diffD=Math.floor(diffMs/86400000);if(diffH<1)return'last: just now';if(diffH<24)return'last: '+diffH+'h ago';if(diffD<7)return'last: '+diffD+'d ago';const d=new Date(ts);const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];if(diffD>=365)return'last: '+months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();return'last: '+months[d.getMonth()]+' '+d.getDate();}


function normalize(s){return s.replace(/\s+/g,'').replace(/[.,!?~]/g,'').toLowerCase();}

// — Sound Effects —

let _audioCtx=null;
let _iosAudioUnlocked=false;
function getAudioCtx(){
  if(!_audioCtx) _audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(_audioCtx.state==='suspended') _audioCtx.resume();
  return _audioCtx;
}
// iOS routes Web Audio as a system sound (ignoring volume buttons) unless
// an HTML5 <audio> element has played in the same user-gesture first.
// Playing a tiny silent buffer once "unlocks" the media audio session.
function unlockIOSAudio(){
  if(_iosAudioUnlocked) return;
  try{
    const s=new Audio();
    s.src='data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAD/+1DEAAAFeAFX9AAAB1wirv80YAAERAAAH/f/5cMQBAAIcwt/+JhUAZkQM///5sIIA/Af///5YMbEQQAD///9xjYiBgYAAAA9yGCAIAhw//LA4AYME///ywOsRBAAP///8sGNiIIAB///+4xsRAEAQ9yGCAIYn//4HGIA/ygYgD/LA6xEEAA////8sDrEQQAD///+WB1iIIAB////uMbEQBA//tQxBaAAADSAAAAAAAAANIAAAAASf/6yIIAiAf///5hBsRBAAP///8sDrEQQAD////cY2IgiAIeAA/Af///lAxsRBAAP///ywY2IggAH///+4xsRAEAQ///8sDrEQQAD///+WB1iIIAB///+4xsRBAAP///ywOsRBAAP///8sGNiIIAB////cY2IgCAIe5DEAQBEH//8sDuEQQAD///+WDGxEEAA////uMbEQBAEP///ywOsRBAAP///8sDrEQQAD///+4xg==';
    s.volume=0.01;
    s.play().then(()=>{s.pause();}).catch(()=>{});
  }catch(e){}
  _iosAudioUnlocked=true;
}
function playCorrectSound(){
  try{
    unlockIOSAudio();
    const ctx=getAudioCtx();
    const now=ctx.currentTime;
    const gain=ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.18,now);
    gain.gain.setValueAtTime(0.18,now+0.2);
    gain.gain.linearRampToValueAtTime(0,now+0.5);
    [783.99, 1046.50].forEach((freq,i)=>{
      const osc=ctx.createOscillator();
      osc.type='sine';
      osc.frequency.value=freq;
      osc.connect(gain);
      osc.start(now+i*0.08);
      osc.stop(now+0.5);
    });
  }catch(e){}
}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// — State —

let activeThemeFilter=null;
let sessionSize=5;
let sessionQueue=[],sessIdx=0,sessPhase=0,sessRatings=[],db;
let sessionContexts=[];
let sessRecallResults=[];
let sessPairResults=[];
let sessCollocations={};
let sessUseSentences=[];
let sayUsedTextInput=false;
let dbSnapshot=null;
let phaseMap=['see','say','use'];
let activeRecognition=null;

// — API Key —

function getApiKey(){return localStorage.getItem('kr_srs_apikey')||'';}

function renderApiKeySection(){
  const el=document.getElementById('api-key-section');
  if(!el) return;
  const has=!!getApiKey();
  if(has){
    el.innerHTML=`
      <div class="api-key-saved">
        <span class="api-key-saved-text">key saved ✓</span>
      </div>
      <div class="flex-row gap-sm">
        <button onclick="startReplaceKey()" class="btn-sm flex-1">replace</button>
        <button onclick="removeApiKey()" class="btn-sm btn-danger flex-1">remove</button>
      </div>
      <div id="api-key-replace" class="hidden mt-sm">
        <div class="flex-row gap-sm">
          <input type="password" id="api-key-input" placeholder="sk-ant-..." class="api-key-input" />
          <button onclick="saveApiKey()" class="btn-sm">save</button>
        </div>
        <div id="api-key-status" class="api-key-status"></div>
      </div>`;
  } else {
    el.innerHTML=`
      <div class="api-key-hint">Enables AI feedback, story generation, and theme grouping.</div>
      <div class="flex-row gap-sm">
        <input type="password" id="api-key-input" placeholder="sk-ant-..." class="api-key-input" />
        <button onclick="saveApiKey()" class="btn-sm">save</button>
      </div>
      <div id="api-key-status" class="api-key-status"></div>`;
  }
}

function startReplaceKey(){
  const el=document.getElementById('api-key-replace');
  if(el) el.classList.remove('hidden');
  setTimeout(()=>document.getElementById('api-key-input')?.focus(),50);
}

function saveApiKey(){
  const val=document.getElementById('api-key-input')?.value.trim();
  if(!val){const s=document.getElementById('api-key-status');if(s)s.textContent='Enter a key first.';return;}
  localStorage.setItem('kr_srs_apikey',val);
  renderApiKeySection();
  loadHome();
}

function removeApiKey(){
  localStorage.removeItem('kr_srs_apikey');
  renderApiKeySection();
  loadHome();
}

// — UI Rendering: Home —

function loadHome(){
  db=getDB();
  const words=Object.values(db.words);
  const due=words.filter(isDue);
  const hard=words.filter(w=>(w.hardCount||0)>=2);
  document.getElementById('s-total').textContent=words.length;
  document.getElementById('s-due').textContent=due.length;
  document.getElementById('s-hard').textContent=hard.length;
  document.getElementById('s-sessions').textContent=db.sessions||0;
  document.getElementById('streak-num').textContent=db.streak||0;
  document.getElementById('last-session-label').textContent=formatLastSession(db);
  const filteredDue=activeThemeFilter?due.filter(w=>w.theme===activeThemeFilter):due;
  document.getElementById('due-summary').textContent=filteredDue.length===0
    ?activeThemeFilter?`No words due in "${activeThemeFilter}" — try another theme or check back tomorrow.`:'No words due — check back tomorrow, or add new words below.'
    :`${filteredDue.length} word${filteredDue.length>1?'s':''} ready for review.${hard.length>0&&!activeThemeFilter?' Includes '+hard.length+' hard word'+(hard.length>1?'s':'')+'.':''}`;
  document.getElementById('start-btn').disabled=filteredDue.length===0;
  const caret=document.getElementById('start-caret');
  if(caret){caret.disabled=filteredDue.length===0;if(!caret.innerHTML.trim())caret.innerHTML=SVG_CHEVRON_DOWN;}
  renderSessionSizes(filteredDue.length);
  renderHardList(hard);
  renderThemes();
}

function renderSessionSizes(dueCount){
  const el=document.getElementById('session-size-btns');
  if(!el)return;
  el.innerHTML=SESSION_SIZES.map(n=>{
    const label=n===0?'all':String(n);
    const active=(sessionSize===n)||(n===0&&sessionSize>=dueCount);
    return`<button class="theme-pill session-size-pill${active?' active':''}" onclick="setSessionSize(${n})">${label}</button>`;
  }).join('');
}

function setSessionSize(n){
  sessionSize=n;
  loadHome();
}

// — UI Rendering: Collapsible Sections —

function toggleSection(bodyId,iconId,cardId){
  const body=document.getElementById(bodyId);
  const icon=document.getElementById(iconId);
  const opening=body.classList.toggle('hidden')===false;
  icon.innerHTML=opening?SVG_CHEVRON_DOWN:SVG_CHEVRON_RIGHT;
  document.getElementById(cardId).classList.toggle('collapsed',!opening);
}
function toggleThemeCard(){toggleSection('theme-body','theme-toggle-btn','theme-card');}

// — UI Rendering: Themes —

function renderThemes(){
  const db=getDB();
  const words=Object.values(db.words);
  const key=getApiKey();
  const themed=words.filter(w=>w.theme);
  const themeEl=document.getElementById('theme-list');
  const filterEl=document.getElementById('theme-filter');
  const filterBtns=document.getElementById('theme-filter-btns');

  if(!key){
    themeEl.innerHTML=`<div class="muted">Add an API key in the ··· menu to enable theme grouping.</div>`;
    filterEl.classList.add('hidden');return;
  }
  if(!themed.length){
    themeEl.innerHTML=`<div class="muted">${words.length?'Click refresh to group your words by theme.':'Add words to get started.'}</div>`;
    filterEl.classList.add('hidden');return;
  }
  const groups={};
  themed.forEach(w=>{if(!groups[w.theme])groups[w.theme]=[];groups[w.theme].push(w);});
  const unthemed=words.filter(w=>!w.theme);
  themeEl.innerHTML=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([theme,ws])=>`
    <div class="theme-row">
      <span class="theme-name">${esc(theme)}</span>
      <span class="theme-count">${ws.length} word${ws.length>1?'s':''} · ${ws.filter(isDue).length} due</span>
    </div>`).join('')+(unthemed.length?`<div class="theme-row"><span class="theme-name theme-name-muted">ungrouped</span><span class="theme-count">${unthemed.length} words</span></div>`:'');

  const themes=Object.keys(groups).sort();
  filterEl.classList.remove('hidden');
  filterBtns.innerHTML=`<button class="theme-pill${!activeThemeFilter?' active':''}" onclick="setThemeFilter(null)">all</button>`
    +themes.map(t=>`<button class="theme-pill${activeThemeFilter===t?' active':''}" onclick="setThemeFilter(${escJS(t)})">  ${esc(t)}</button>`).join('');
}

function setThemeFilter(theme){
  activeThemeFilter=theme;
  loadHome();
}

async function runGrouping(){
  const key=getApiKey();
  if(!key){showFeedback('Add an API key first.');return;}
  const db=getDB();
  const words=Object.values(db.words);
  if(!words.length){showFeedback('No words to group.');return;}
  const btn=document.getElementById('theme-refresh-btn');
  btn.textContent='grouping...';btn.disabled=true;
  document.getElementById('theme-list').innerHTML=`<div class="ai-loading">analysing your word bank...</div>`;
  const wordList=words.map(w=>`${w.ko}: ${w.en}`).join('\n');
  const prompt=`You are a Korean vocabulary organiser. Group these words into 3-8 thematic categories. Use short English theme names (2-3 words max, e.g. "religion", "body & health", "emotions", "daily life").\n\nWords:\n${wordList}\n\nRespond ONLY with valid JSON in this exact format, no other text:\n{"theme_name": ["word1", "word2"], "theme_name2": ["word3"]}`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:800,messages:[{role:'user',content:prompt}]})
    });
    const data=await res.json();
    if(data.error){document.getElementById('theme-list').innerHTML=`<div class="ai-loading">Error: ${data.error.message}</div>`;return;}
    const text=(data.content?.[0]?.text||'').trim().replace(/```json|```/g,'').trim();
    const grouped=JSON.parse(text);
    Object.entries(grouped).forEach(([theme,koWords])=>{
      koWords.forEach(ko=>{if(db.words[ko])db.words[ko].theme=theme;});
    });
    saveDB(db);
    loadHome();
  }catch(e){
    document.getElementById('theme-list').innerHTML=`<div class="ai-loading">Could not group words. Try again.</div>`;
  }finally{
    btn.textContent='refresh';btn.disabled=false;
  }
}

// — UI Rendering: Hard Words —

function renderHardList(hard){
  const el=document.getElementById('hard-list');
  document.getElementById('hard-count-label').textContent=hard.length?hard.length+' words':'';
  if(!hard.length){el.innerHTML='<div class="muted">No words flagged as hard yet.</div>';return;}
  el.innerHTML=hard.map(w=>`<div class="hard-row"><span>${esc(w.ko)}</span><span class="muted">${esc(w.en)}</span><span class="badge badge-hard">${w.hardCount}x hard</span></div>`).join('');
}

// — UI Rendering: Word Bank —


function wordRowHtml(w){
  return`<div class="word-row" id="wr-${esc(w.ko)}"><span class="wb-ko">${esc(w.ko)}</span><span class="wb-en">${esc(w.en)}</span><span class="wb-date">${w.nextReview?'next: '+esc(w.nextReview):'new'}</span><button class="btn-tertiary" onclick="editWord(${escJS(w.ko)})">edit</button><button class="btn-tertiary" onclick="deleteWord(${escJS(w.ko)})">remove</button></div>`;
}
function wordRowsHtml(words){return words.map(wordRowHtml).join('');}

function deleteWord(ko){db=getDB();delete db.words[ko];saveDB(db);renderWordBank();}

function renderWordBank(){
  const el=document.getElementById('word-bank-list');
  if(!el)return;
  db=getDB();
  const words=Object.values(db.words);
  const countEl=document.getElementById('word-bank-count');
  if(countEl) countEl.textContent=words.length?words.length+' words':'';
  if(!words.length){el.innerHTML='<div class="muted">No words yet.</div>';return;}
  el.innerHTML=wordRowsHtml(words);
}

function editWord(ko){
  db=getDB();const w=db.words[ko];if(!w)return;
  const row=document.getElementById('wr-'+ko);
  if(!row)return;
  row.className='edit-row';
  row.innerHTML=`<input type="text" id="edit-ko" value="${esc(w.ko)}" class="edit-input" /><input type="text" id="edit-en" value="${esc(w.en)}" class="edit-input-sm" /><button class="btn-tertiary edit-save" onclick="saveEditWord(${escJS(ko)})">save</button><button class="btn-tertiary" onclick="renderWordBank()">cancel</button>`;
  document.getElementById('edit-ko')?.focus();
}

function saveEditWord(oldKo){
  const newKo=document.getElementById('edit-ko')?.value.trim();
  const newEn=document.getElementById('edit-en')?.value.trim();
  if(!newKo||!newEn)return;
  db=getDB();const w=db.words[oldKo];if(!w)return;
  if(newKo!==oldKo){delete db.words[oldKo];w.ko=newKo;}
  w.en=newEn;
  delete w.collocations;
  db.words[newKo]=w;
  saveDB(db);renderWordBank();
}

// — Adding Words —

function addSingleWord(){
  const ko=document.getElementById('add-ko').value.trim();
  const en=document.getElementById('add-en').value.trim();
  if(!ko||!en){showFeedback('Enter both Korean and meaning.');return;}
  db=getDB();
  if(db.words[ko]){showFeedback(ko+' already in bank.');return;}
  showFeedback(ko+' added.');
  db.words[ko]={ko,en,level:0,hardCount:0,nextReview:todayStr(),added:todayStr()};
  saveDB(db);
  document.getElementById('add-ko').value='';
  document.getElementById('add-en').value='';
  renderWordBank();
  if(getApiKey()) runGrouping();
}

function addBulk(){
  const raw=document.getElementById('bulk-input').value;
  const lines=raw.trim().split('\n').filter(l=>l.trim());
  db=getDB();let added=0,dupes=[];
  lines.forEach(line=>{
    const m=line.trim().match(/^(\S+)\s*[-\u2013\u2014:\s]+\s*(.+)$/);if(!m)return;
    const ko=m[1].trim(),en=m[2].trim();
    if(db.words[ko]){dupes.push(ko);return;}
    db.words[ko]={ko,en,level:0,hardCount:0,nextReview:todayStr(),added:todayStr()};added++;
  });
  saveDB(db);
  document.getElementById('bulk-input').value='';
  const msg=added+' added'+(dupes.length?` — ${dupes.length} skipped (already in bank): ${dupes.join(', ')}`:'.')  ;
  showFeedback(msg);
  toggleBulk();renderWordBank();
  if(getApiKey()&&added>0) runGrouping();
}

function toggleBulk(){const el=document.getElementById('bulk-area');const btn=document.getElementById('bulk-toggle-btn');const show=el.classList.contains('hidden');el.classList.toggle('hidden');btn.textContent=show?'hide bulk':'bulk paste';}
function showFeedback(msg){const el=document.getElementById('add-feedback');el.textContent=msg;setTimeout(()=>{el.textContent='';},2500);}

// — Session Flow —

let selectedRounds='all';

function toggleRoundPicker(){
  document.getElementById('round-picker').classList.toggle('hidden');
}

function startRound(phase){
  document.getElementById('round-picker').classList.add('hidden');
  selectedRounds=phase;
  startSession();
}

async function startSession(){
  const roundChoice=selectedRounds;
  selectedRounds='all';
  db=getDB();
  const due=Object.values(db.words).filter(isDue);
  const filtered=activeThemeFilter?due.filter(w=>w.theme===activeThemeFilter):due;
  const hard=filtered.filter(w=>(w.hardCount||0)>0).sort(()=>Math.random()-0.5);
  const normal=filtered.filter(w=>(w.hardCount||0)===0).sort(()=>Math.random()-0.5);
  const limit=sessionSize===0?Infinity:sessionSize;
  sessionQueue=[...hard,...normal].slice(0,limit);
  sessIdx=0;sessPhase=0;sessRatings=[];sessionContexts=[];sessRecallResults=[];sessPairResults=[];sessCollocations={};sessUseSentences=[];sayUsedTextInput=false;
  dbSnapshot=JSON.stringify(db);
  showScreen('session');
  const endBtn=document.getElementById('end-early-btn');
  // Build phase map based on round selection
  if(roundChoice!=='all'){
    const needsCollocations=roundChoice==='pair';
    if(needsCollocations&&getApiKey()){
      document.getElementById('phase-content').innerHTML=`<div class="card session-loading"><div class="ai-loading">preparing session...</div></div>`;
      await loadCollocations(sessionQueue);
    }
    phaseMap=[roundChoice];
  } else if(getApiKey()){
    document.getElementById('phase-content').innerHTML=`<div class="card session-loading"><div class="ai-loading">preparing session...</div></div>`;
    const ok=await loadCollocations(sessionQueue);
    phaseMap=ok?['see','say','pair','use']:['see','say','use'];
  } else {
    phaseMap=['see','say','use'];
  }
  if(endBtn) endBtn.classList.remove('hidden');
  renderSessionPhase();
}

function showScreen(name){
  document.getElementById('home-screen').classList.toggle('hidden',name!=='home');
  document.getElementById('session-screen').classList.toggle('hidden',name!=='session');
  document.getElementById('done-screen').classList.toggle('hidden',name!=='done');
  document.getElementById('words-screen').classList.toggle('hidden',name!=='words');
  document.getElementById('stories-screen').classList.toggle('hidden',name!=='stories');
  const sessHeader=document.querySelector('.sess-header');
  const appHeader=document.querySelector('.app-header');
  if(name!=='session'){
    document.getElementById('phase-content').innerHTML='';
    document.getElementById('phase-bar').innerHTML='';
    const sr=document.getElementById('sess-round');
    if(sr) sr.textContent='';
    if(sessHeader) sessHeader.style.display='none';
    if(appHeader) appHeader.classList.remove('hidden');
  } else {
    if(sessHeader) sessHeader.style.display='';
    if(appHeader) appHeader.classList.add('hidden');
  }
  window.scrollTo(0,0);
}

function showWords(){
  showScreen('words');
  renderWordBank();
}

function renderPhaseBar(){
  const bar=document.getElementById('phase-bar');bar.innerHTML='';
  const total=phaseMap.length,done=sessPhase;
  for(let i=0;i<total;i++){
    const p=document.createElement('div');
    p.className='pip'+(i<done?' done':i===done?' active':'');
    bar.appendChild(p);
  }
  const nameMap={see:'see it',say:'say it',pair:'pair it',use:'use it'};
  const el=document.getElementById('sess-round');
  if(el) el.textContent=`round ${sessPhase+1} — ${nameMap[phaseMap[sessPhase]]||''}`;
  const closeBtn=document.querySelector('.btn-close-session');
  if(closeBtn&&!closeBtn.innerHTML.trim()) closeBtn.innerHTML=SVG_X_CLOSE;
}

function renderSessionPhase(){
  if(sessPhase>=phaseMap.length){endSession();return;}
  const w=sessionQueue[sessIdx];
  renderPhaseBar();
  const el=document.getElementById('phase-content');
  const phase=phaseMap[sessPhase];
  if(phase==='see'){
    const remaining = sessionQueue.length - sessIdx - 1;
    const kbdHints = isMobile ? '' : '<kbd>space</kbd>';
    const kbdR = isMobile ? ['','',''] : ['<kbd>1</kbd>','<kbd>2</kbd>','<kbd>3</kbd>'];
    const rateGood = isMobile ? SVG_CHECK : `knew it ${kbdR[0]}`;
    const rateOk = isMobile ? SVG_WAVE : `vaguely ${kbdR[1]}`;
    const rateHard = isMobile ? SVG_X_MARK : `forgot ${kbdR[2]}`;
    const stackLayers = remaining > 0
      ? `<div class="card-stack-layer card-stack-1"></div>` +
        (remaining > 1 ? `<div class="card-stack-layer card-stack-2"></div>` : '')
      : '';
    el.innerHTML =
      `<div class="see-remaining label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="card-stack-wrap">` +
      stackLayers +
      `<div class="card see-card" onclick="revealMeaning()" style="cursor:pointer">` +
      `<div class="session-body session-body-center">` +
      `<div class="flashcard-word" id="see-word">${esc(w.ko)}</div>` +
      `<div id="reveal-area"></div>` +
      `</div></div></div>` +
      `<div id="see-action" class="see-action">` +
      `<button class="btn-full" onclick="revealMeaning()">show meaning ${kbdHints}</button>` +
      `</div>` +
      `<div id="rate-area" class="rate-area-outside hidden">` +
      `<div class="rate-label">HOW WELL DID YOU REMEMBER?</div>` +
      `<div class="rate-row">` +
      `<button class="btn-rate btn-success" onclick="rateWord('good')">${rateGood}</button>` +
      `<button class="btn-rate" onclick="rateWord('ok')">${rateOk}</button>` +
      `<button class="btn-rate btn-danger" onclick="rateWord('hard')">${rateHard}</button>` +
      `</div>` +
      `<div id="hard-flag-label"></div>` +
      `</div>`;
  } else if(phase==='say'){
    const remaining = sessionQueue.length - sessIdx - 1;
    const hasSpeech = ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    const stackLayers = remaining > 0
      ? `<div class="card-stack-layer card-stack-1"></div>` +
        (remaining > 1 ? `<div class="card-stack-layer card-stack-2"></div>` : '')
      : '';
    el.innerHTML=
      `<div class="see-remaining label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="card-stack-wrap">` +
      stackLayers +
      `<div class="card see-card">` +
      `<div class="session-body session-body-center">` +
      `<div class="flashcard-word">${esc(w.en)}</div>` +
      `${hasSpeech ? `<button class="btn-circle" id="btn-circle" onclick="startVoice(${escJS(w.ko)})">${MIC_ICON}</button>` : ''}` +
      `<div class="type-input-wrap"><input class="type-input" id="type-ans" lang="ko" placeholder="한국어" autocomplete="off" autocorrect="off" spellcheck="false" /></div>` +
      `<div id="type-result" class="type-result"></div>` +
      `<div id="voice-status" class="hidden"></div>` +
      `</div></div></div>` +
      `<div id="say-action" class="see-action" style="text-align:right">` +
      `<button onclick="skipRecall()">skip ${SVG_ARROW_RIGHT}</button>` +
      `</div>`;
    setTimeout(()=>{
      const ti=document.getElementById('type-ans');
      if(ti){
        ti.addEventListener('keydown',function(e){
          if(e.key==='Enter'){e.preventDefault();checkTypedAnswer(w.ko);}
        });
        ti.addEventListener('blur',function(){
          if(ti.value.trim()&&!ti.disabled) setTimeout(()=>checkTypedAnswer(w.ko),100);
        });
        if(sayUsedTextInput) ti.focus();
      }
    },50);
  } else if(phase==='pair'){
    const coll=sessCollocations[w.ko];
    if(!coll){nextWord();return;}
    const opts=shuffleArray([...coll.options]);
    const kbdNums=isMobile?['','','','']:['<kbd>1</kbd>','<kbd>2</kbd>','<kbd>3</kbd>','<kbd>4</kbd>'];
    const remaining = sessionQueue.length - sessIdx - 1;
    const stackLayers = remaining > 0
      ? `<div class="card-stack-layer card-stack-1"></div>` +
        (remaining > 1 ? `<div class="card-stack-layer card-stack-2"></div>` : '')
      : '';
    const optBtns = opts.map((o, i) =>
      `<button class="pair-option" onclick="selectCollocation(${escJS(w.ko)},${escJS(o.ko)})">` +
      `<span class="pair-num">${kbdNums[i] || i + 1}</span>` +
      `<span class="pair-ko">${esc(o.ko)}</span>` +
      `</button>`
    ).join('');
    el.innerHTML =
      `<div class="see-remaining label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="card-stack-wrap">` +
      stackLayers +
      `<div class="card see-card">` +
      `<div class="session-body session-body-center">` +
      `<div class="prompt-text mt-md mb-sm">which does NOT pair with</div>` +
      `<div class="flashcard-word">${esc(w.ko)}</div>` +
      `<div id="pair-options">${optBtns}</div>` +
      `<div id="pair-result" class="pair-result"></div>` +
      `</div></div></div>` +
      `<div id="pair-action" class="see-action" style="text-align:right">` +
      `<button onclick="skipPair()" class="ml-auto">skip ${SVG_ARROW_RIGHT}</button>` +
      `</div>`;
  } else if(phase==='use'){
    const remaining = sessionQueue.length - sessIdx - 1;
    const ctxObj = sessionContexts[sessIdx] || (sessionContexts[sessIdx] = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)](w.ko, w.en));
    const hasKey = !!getApiKey();
    el.innerHTML =
      `<div class="see-remaining label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="card use-card">` +
      `<div class="session-body use-chat">` +
      `<div class="chat-bubble chat-incoming">${esc(ctxObj.bubble)}</div>` +
      `<div id="use-reply-area" style="justify-items: flex-end;"></div>` +
      `<div class="chat-target">"${esc(w.ko)}"</div>` +
      `<div class="use-input-area">` +
      `<div class="use-input-wrap">` +
      `<textarea id="use-ans" lang="ko" placeholder="답장..." autocomplete="off" autocorrect="off" rows="1"></textarea>` +
      `<button class="btn-close-session use-clear-btn" id="use-clear" onclick="document.getElementById('use-ans').value='';document.getElementById('use-ans').style.height='auto';this.hidden=true;document.getElementById('use-ans').focus();" hidden>${SVG_X_CLOSE}</button>` +
      `</div>` +
      `${hasKey?`<button class="btn-full" onclick="getAiFeedback('use',${escJS(w.ko)},${escJS(w.en)})">reply${isMobile?'':' <kbd>⌘↵</kbd>'}</button>`:''}` +
      `</div>` +
      `</div></div>` +
      `<div id="use-ai-feedback"></div>` +
      `<div id="use-action" class="see-action" style="text-align:right">` +
      `<button id="use-skip" onclick="skipUse()">skip ${SVG_ARROW_RIGHT}</button>` +
      `</div>`;
    setTimeout(() => {
      const inp=document.getElementById('use-ans');
      if(inp){
        inp.focus();
        inp.addEventListener('keydown',function(e){
          if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();getAiFeedback('use',w.ko,w.en);}
        });
        inp.addEventListener('input',function(){
          this.style.height='auto';
          this.style.height=this.scrollHeight+'px';
          const clr=document.getElementById('use-clear');
          if(clr) clr.hidden=!this.value.trim();
        });
      }
    }, 50);
  }
}

function stopRecognition(){
  if(activeRecognition){activeRecognition.stop();activeRecognition=null;}
}

function nextWord(){
  stopRecognition();
  const wasSee = phaseMap[sessPhase]==='see';
  const card = wasSee && document.querySelector('.see-card');
  const rateArea = wasSee && document.getElementById('rate-area');

  function advance(){
    sessIdx++;
    if(sessIdx>=sessionQueue.length){
      sessPhase++;
      sessIdx=0;
      sessionContexts=[];
      const seen=new Set();
      sessionQueue=sessionQueue.filter(w=>{if(seen.has(w.ko))return false;seen.add(w.ko);return true;});
    }
    if(sessPhase>=phaseMap.length){endSession();return;}
    renderSessionPhase();
  }

  if(card){
    card.classList.add('see-card-exit');
    if(rateArea) rateArea.style.opacity='0';
    const layer1=document.querySelector('.card-stack-1');
    const layer2=document.querySelector('.card-stack-2');
    if(layer1) layer1.classList.add('card-stack-promote');
    if(layer2) layer2.classList.add('card-stack-promote-2');
    // Wait for exit + promote, then swap content in-place
    setTimeout(()=>{
      // Advance index
      sessIdx++;
      if(sessIdx>=sessionQueue.length){
        sessPhase++;sessIdx=0;sessionContexts=[];
        const seen=new Set();
        sessionQueue=sessionQueue.filter(w=>{if(seen.has(w.ko))return false;seen.add(w.ko);return true;});
      }
      if(sessPhase>=phaseMap.length){endSession();return;}
      if(phaseMap[sessPhase]!=='see'){renderSessionPhase();return;}
      // Still in see phase — swap content without full re-render
      const w=sessionQueue[sessIdx];
      const remaining=sessionQueue.length-sessIdx-1;
      const kbdHints=isMobile?'':'<kbd>space</kbd>';
      // Update remaining label
      const remLabel=document.querySelector('.see-remaining');
      if(remLabel) remLabel.textContent=`${remaining} word${remaining!==1?'s':''} left`;
      // Reset card: remove exit, restore click-to-reveal
      card.classList.remove('see-card-exit');
      card.style.transition='none';
      card.style.opacity='1';
      card.style.transform='';
      card.style.cursor='pointer';
      card.onclick=revealMeaning;
      card.innerHTML=
        `<div class="session-body session-body-center see-content-enter">`+
        `<div class="flashcard-word" id="see-word">${esc(w.ko)}</div>`+
        `<div id="reveal-area"></div>`+
        `</div>`;
      // Reset show meaning button
      const seeAction=document.getElementById('see-action');
      if(seeAction){seeAction.classList.remove('hidden');seeAction.innerHTML=`<button class="btn-full" onclick="revealMeaning()">show meaning ${kbdHints}</button>`;}
      // Reset stack layers
      if(layer1){layer1.classList.remove('card-stack-promote');layer1.style='';}
      if(layer2){layer2.classList.remove('card-stack-promote-2');layer2.style='';}
      // Update stack layers for new remaining count
      const wrap=document.querySelector('.card-stack-wrap');
      if(wrap){
        wrap.querySelectorAll('.card-stack-layer').forEach(l=>l.remove());
        if(remaining>0) wrap.insertAdjacentHTML('afterbegin','<div class="card-stack-layer card-stack-1"></div>'+(remaining>1?'<div class="card-stack-layer card-stack-2"></div>':''));
      }
      // Reset rate area
      if(rateArea){rateArea.classList.add('hidden');rateArea.classList.remove('rate-area-reveal');rateArea.style.opacity='';
        const hl=document.getElementById('hard-flag-label');if(hl)hl.innerHTML='';
      }
      renderPhaseBar();
      // Force reflow then restore transition
      void card.offsetHeight;
      card.style.transition='';
    },300);
  } else {
    advance();
  }
}

function revealMeaning(){
  const w=sessionQueue[sessIdx];
  const wordEl=document.getElementById('see-word');
  if(!wordEl||wordEl.classList.contains('flashcard-word-faded')) return;
  wordEl.classList.add('flashcard-word-faded');
  const card=document.querySelector('.see-card');
  if(card){card.style.cursor='';card.onclick=null;}
  document.getElementById('reveal-area').innerHTML=`<div class="reveal-answer-text">${esc(w.en)}</div>`;
  const seeAction=document.getElementById('see-action');
  if(seeAction) seeAction.classList.add('hidden');
  const rateArea=document.getElementById('rate-area');
  rateArea.classList.remove('hidden');
  rateArea.classList.add('rate-area-reveal');
  if(w.hardCount>0){
    const hl=document.getElementById('hard-flag-label');
    if(hl) hl.innerHTML=`<div class="muted reveal-hard">flagged hard ${w.hardCount}x</div>`;
  }
}


function rateWord(rating){
  const w=sessionQueue[sessIdx];db=getDB();const word=db.words[w.ko];if(!word)return;
  if(rating==='hard'){word.hardCount=(word.hardCount||0)+1;word.level=Math.max(0,(word.level||0)-1);}
  else if(rating==='good'){word.level=Math.min(4,(word.level||0)+1);if(word.hardCount>0)word.hardCount--;}
  word.nextReview=nextInterval(word,rating);
  saveDB(db);sessRatings.push({ko:w.ko,rating});
  if(rating==='hard') sessionQueue.push(w);
  nextWord();
}

function showSayNext(){
  const typeResult=document.getElementById('type-result');
  if(typeResult) typeResult.innerHTML=`<div class="pair-feedback correct text-center">correct ${SVG_CHECK}</div>`;
  const actions=document.getElementById('say-action');
  if(actions) actions.innerHTML=`<button onclick="advancePhase()" class="ml-auto">next${isMobile?'':' <kbd>enter</kbd>'} ${SVG_ARROW_RIGHT}</button>`;
}

function advancePhase(){
  if(phaseMap[sessPhase]==='say'){
    const w=sessionQueue[sessIdx];
    sessRecallResults.push({ko:w.ko,en:w.en,result:'correct'});
  }
  nextWord();
}

function skipRecall(){
  const w=sessionQueue[sessIdx];
  sessRecallResults.push({ko:w.ko,en:w.en,result:'skipped'});
  nextWord();
}

function skipUse(){
  const w=sessionQueue[sessIdx];
  const ans=document.getElementById('use-ans')?.value?.trim();
  if(ans&&!sessUseSentences.find(s=>s.ko===w.ko)) sessUseSentences.push({ko:w.ko,en:w.en,sentence:ans});
  nextWord();
}

// — Collocation loading —

async function loadCollocations(words){
  const key=getApiKey();if(!key)return false;
  const db=getDB();
  const uncached=[];
  words.forEach(w=>{
    const cached=db.words[w.ko]?.collocations;
    if(cached&&cached.wrong) sessCollocations[w.ko]=cached;
    else uncached.push(w);
  });
  if(!uncached.length) return true;
  const wordList=uncached.map((w,i)=>`${i+1}. ${w.ko} (${w.en})`).join('\n');
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1500,messages:[{role:'user',content:`For each Korean word below, provide 3 natural collocations (word pairings) and 1 plausible but INCORRECT one. The learner must spot the odd one out. Collocations can be verb+noun, adjective+noun, or adverb+verb patterns — pick whichever is most useful for learning.

Words:
${wordList}

Respond ONLY with a valid JSON array, no other text:
[{"ko":"훈련","wrong":{"ko":"등록하다","en":"to register"},"options":[{"ko":"받다","en":"to undergo"},{"ko":"시작하다","en":"to start"},{"ko":"등록하다","en":"to register"},{"ko":"마치다","en":"to finish"}]}]

Rules:
- "options" must include exactly 3 natural collocations and 1 unnatural one (4 total)
- The wrong option must be a real Korean word that sounds plausible but is NOT a natural collocation with the target word
- The 3 correct options should be common, useful collocations the learner should know
- "wrong" must match one of the entries in "options"
- Keep English translations concise`}]})
    });
    const data=await res.json();
    const text=data.content?.[0]?.text||'';
    const match=text.match(/\[[\s\S]*\]/);
    if(!match) return Object.keys(sessCollocations).length>0;
    const arr=JSON.parse(match[0]);
    arr.forEach(c=>{
      if(c.ko&&c.wrong&&c.options?.length>=2){
        sessCollocations[c.ko]=c;
        if(db.words[c.ko]){db.words[c.ko].collocations=c;};
      }
    });
    saveDB(db);
    return Object.keys(sessCollocations).length>0;
  }catch(e){
    return Object.keys(sessCollocations).length>0;
  }
}

function selectCollocation(ko,chosenKo){
  const coll=sessCollocations[ko];if(!coll)return;
  const gotIt=coll.wrong.ko===chosenKo;
  const btns=document.querySelectorAll('.pair-option');
  btns.forEach(b=>{
    b.disabled=true;
    const bKo=b.querySelector('.pair-ko').textContent;
    if(bKo===coll.wrong.ko) b.classList.add(gotIt?'correct':'wrong');
    if(bKo===chosenKo&&!gotIt) b.classList.add('chosen');
    const opt=coll.options.find(o=>o.ko===bKo);
    if(opt) b.insertAdjacentHTML('beforeend',`<span class="pair-en">${esc(opt.en)}</span>`);
  });
  const resultEl=document.getElementById('pair-result');
  if(gotIt){
    playCorrectSound();
    resultEl.innerHTML=`<div class="pair-feedback correct">correct ${SVG_CHECK}</div>`;
  } else {
    resultEl.innerHTML=`<div class="pair-feedback wrong">the odd one out was ${esc(coll.wrong.ko)} (${esc(coll.wrong.en)})</div>`;
  }
  if(!sessPairResults.find(r=>r.ko===ko)) sessPairResults.push({ko,correct:gotIt,chosen:chosenKo,answer:coll.wrong.ko});
  const w=sessionQueue[sessIdx];
  if(!gotIt&&w&&!sessionQueue.slice(sessIdx+1).find(q=>q.ko===ko)) sessionQueue.push(w);
  // Show next button
  const actions=document.getElementById('pair-action');
  if(actions) actions.innerHTML=`<button onclick="nextWord()" class="ml-auto">next${isMobile?'':' <kbd>enter</kbd>'} ${SVG_ARROW_RIGHT}</button>`;
}

function skipPair(){
  const w=sessionQueue[sessIdx];
  if(!sessPairResults.find(r=>r.ko===w.ko)) sessPairResults.push({ko:w.ko,correct:false,chosen:null,answer:sessCollocations[w.ko]?.correct?.ko||'',skipped:true});
  nextWord();
}

function endSession(){
  db=getDB();db.sessions=(db.sessions||0)+1;updateStreak(db);saveDB(db);
  showScreen('done');
  const finalRatings={};
  sessRatings.forEach(r=>{finalRatings[r.ko]=r.rating;});
  const ratings=Object.values(finalRatings);
  const good=ratings.filter(r=>r==='good').length;
  const ok=ratings.filter(r=>r==='ok').length;
  const hard=ratings.filter(r=>r==='hard').length;
  document.getElementById('done-msg').textContent=`${sessionQueue.length}개 단어 완료. Hard words come back sooner — you'll see them again before the rest.`;
  document.getElementById('done-stats').innerHTML=`<div class="stat"><div class="n">${good}</div><div class="l">knew it</div></div><div class="stat"><div class="n">${ok}</div><div class="l">vaguely</div></div><div class="stat"><div class="n">${hard}</div><div class="l">hard</div></div><div class="stat"><div class="n">${db.sessions}</div><div class="l">total sessions</div></div>`;
  const sentEl=document.getElementById('story-sentences');
  sentEl.innerHTML=sessUseSentences.map(s=>`<div class="sentence-chip"><div class="chip-word">${esc(s.ko)} — ${esc(s.en)}</div>${esc(s.sentence)}</div>`).join('');
  renderRecap();
  generateStory();
}

function scoreBadge(score){
  if(!score) return '';
  const cls=score==='great'?'score-great':score==='needs work'?'score-revise':'score-ok';
  return `<span class="fb-score fb-score-sm ${cls}">${esc(score)}</span>`;
}

function renderRecap(){
  let html='';
  const roundNum=(name)=>phaseMap.indexOf(name)+1;

  // Say it — Recall
  if(sessRecallResults.length){
    const byWord={};
    sessRecallResults.forEach(r=>{byWord[r.ko]=r;});
    const unique=Object.values(byWord);
    const correct=unique.filter(r=>r.result==='correct').length;
    html+=`<div class="card"><div class="label">round ${roundNum('say')} — say it</div>`;
    html+=`<div class="muted recap-summary">${correct} of ${unique.length} recalled correctly</div>`;
    html+=unique.map(r=>{
      const icon=r.result==='correct'?'<span class="recap-icon recap-icon-ok">✓</span>':r.result==='gave-up'?'<span class="recap-icon recap-icon-fail">✗</span>':'<span class="recap-icon recap-icon-skip">—</span>';
      const label=r.result==='correct'?'recalled':r.result==='gave-up'?'gave up':'skipped';
      return `<div class="recap-row">${icon} <span>${esc(r.ko)}</span><span class="muted">${esc(r.en)}</span><span class="muted ml-auto">${label}</span></div>`;
    }).join('');
    html+=`</div>`;
  }

  // Pair it — Collocations
  if(sessPairResults.length){
    const byWord={};
    sessPairResults.forEach(r=>{byWord[r.ko]=r;});
    const unique=Object.values(byWord);
    const correct=unique.filter(r=>r.correct).length;
    html+=`<div class="card"><div class="label">round ${roundNum('pair')} — pair it</div>`;
    html+=`<div class="muted recap-summary">${correct} of ${unique.length} paired correctly</div>`;
    html+=unique.map(r=>{
      const coll=sessCollocations[r.ko];
      const icon=r.correct?'<span class="recap-icon recap-icon-ok">✓</span>':r.skipped?'<span class="recap-icon recap-icon-skip">—</span>':'<span class="recap-icon recap-icon-fail">✗</span>';
      const detail=coll?`odd one out: ${esc(coll.wrong.ko)}`:'';
      return `<div class="recap-row">${icon} <span>${esc(r.ko)}</span><span class="muted">${detail}</span></div>`;
    }).join('');
    html+=`</div>`;
  }

  // Use it — Sentences
  if(sessUseSentences.length){
    html+=`<div class="card"><div class="label">round ${roundNum('use')} — use it</div>`;
    html+=sessUseSentences.map(s=>
      `<div class="recap-sentence">` +
      `<div class="recap-sentence-head"><span class="word">${esc(s.ko)}</span><span class="def">${esc(s.en)}</span>${scoreBadge(s.score)}</div>` +
      `<div class="recap-sentence-body">${esc(s.sentence)}</div></div>`
    ).join('');
    html+=`</div>`;
  }

  document.getElementById('recap-section').innerHTML=html;
}

function endSessionEarly(){closeEndSessionModal();sessionContexts=[];endSession();}

function cancelSession(){
  closeEndSessionModal();
  if(dbSnapshot) saveDB(JSON.parse(dbSnapshot));
  dbSnapshot=null;
  stopRecognition();
  showScreen('home');
  loadHome();
}

function openEndSessionModal(){
  const overlay=document.getElementById('end-session-overlay');
  const modal=document.getElementById('end-session-modal');
  const trashIcon=document.getElementById('modal-trash-icon');
  const skipIcon=document.getElementById('modal-skip-icon');
  if(trashIcon&&!trashIcon.innerHTML.trim()) trashIcon.innerHTML=SVG_TRASH;
  if(skipIcon&&!skipIcon.innerHTML.trim()) skipIcon.innerHTML=SVG_SKIP_FWD;
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
  requestAnimationFrame(()=>{
    overlay.classList.add('visible');
    modal.classList.add('visible');
  });
}

function closeEndSessionModal(){
  const overlay=document.getElementById('end-session-overlay');
  const modal=document.getElementById('end-session-modal');
  if(!overlay||!modal) return;
  overlay.classList.remove('visible');
  modal.classList.remove('visible');
  setTimeout(()=>{
    overlay.classList.add('hidden');
    modal.classList.add('hidden');
  },200);
}

function goHome(){
  showScreen('home');
  loadHome();
}

// — Tappable Story Words —

function makeStoryTappable(korean){
  const parts=korean.split(/(\*\*.+?\*\*)/g);
  let html='';
  parts.forEach(part=>{
    const boldMatch=part.match(/^\*\*(.+?)\*\*$/);
    if(boldMatch){
      const word=boldMatch[1];
      html+=word.split(/(\s+)/).map(t=>{
        if(!t.trim()) return t;
        return `<span class="story-word story-tap" onclick="tapStoryWord(this)">${esc(t)}</span>`;
      }).join('');
    } else {
      html+=part.split(/(\n)/).map(seg=>{
        if(seg==='\n') return '<br>';
        return seg.split(/(\s+)/).map(t=>{
          if(!t.trim()) return t;
          return `<span class="story-tap" onclick="tapStoryWord(this)">${esc(t)}</span>`;
        }).join('');
      }).join('');
    }
  });
  return html;
}

function tapStoryWord(el){
  const raw=el.textContent.trim();
  const cleaned=raw.replace(/[.,!?~…\u3001\u3002\uFF0C\uFF01\uFF1F]/g,'');
  if(!cleaned) return;

  const popup=document.getElementById('word-popup');
  const overlay=document.getElementById('word-popup-overlay');
  document.getElementById('popup-word').textContent=raw;
  document.getElementById('popup-ko').value=cleaned;
  document.getElementById('popup-en').value='';
  document.getElementById('popup-feedback').textContent='';
  document.getElementById('popup-translation').innerHTML='';
  updatePopupLookupBtn();

  // Check if already in word bank
  const db=getDB();
  if(db.words[cleaned]){
    document.getElementById('popup-en').value=db.words[cleaned].en;
    document.getElementById('popup-feedback').textContent='already in word list';
    document.getElementById('popup-feedback').className='popup-feedback popup-feedback-note';
  }

  overlay.classList.remove('hidden');
  popup.classList.remove('hidden');
  requestAnimationFrame(()=>{
    overlay.classList.add('visible');
    popup.classList.add('visible');
  });

  // Auto-translate if API key available and word not already known
  if(getApiKey()&&!db.words[cleaned]){
    lookupWord(cleaned);
  }
}

async function translateKo(ko){
  const key=getApiKey();
  if(!key) return null;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:100,messages:[{role:'user',content:`Translate this Korean word/phrase to English. Give only the translation, concise, no extra text: "${ko}"`}]})
    });
    const data=await res.json();
    if(data.error) return null;
    return (data.content?.[0]?.text||'').trim()||null;
  }catch(e){ return null; }
}

async function lookupWord(ko){
  const transEl=document.getElementById('popup-translation');
  transEl.innerHTML='<span class="ai-loading" style="margin:0;font-size:var(--fs-body-sm)">looking up...</span>';
  const translation=await translateKo(ko);
  if(translation){
    transEl.innerHTML=`<span class="muted">${esc(translation)}</span>`;
    const enInput=document.getElementById('popup-en');
    if(!enInput.value) enInput.value=translation;
  } else { transEl.innerHTML=''; }
}

async function lookupAddWord(){
  const btn=document.getElementById('lookup-btn');
  if(btn.getAttribute('aria-disabled')==='true') return;
  const ko=document.getElementById('add-ko').value.trim();
  if(!ko) return;
  const enInput=document.getElementById('add-en');
  btn.setAttribute('aria-disabled','true');btn.textContent='...';
  const translation=await translateKo(ko);
  if(translation) enInput.value=translation;
  btn.textContent='look up';updateLookupBtn();
}

function updateLookupBtn(){
  const btn=document.getElementById('lookup-btn');
  if(!btn) return;
  const off=!getApiKey()||!document.getElementById('add-ko').value.trim();
  btn.setAttribute('aria-disabled',off?'true':'false');
}

async function lookupPopupWord(){
  const btn=document.getElementById('popup-lookup-btn');
  if(btn.getAttribute('aria-disabled')==='true') return;
  const ko=document.getElementById('popup-ko').value.trim();
  if(!ko) return;
  const enInput=document.getElementById('popup-en');
  btn.setAttribute('aria-disabled','true');btn.textContent='...';
  const translation=await translateKo(ko);
  if(translation) enInput.value=translation;
  btn.textContent='look up';updatePopupLookupBtn();
}

function updatePopupLookupBtn(){
  const btn=document.getElementById('popup-lookup-btn');
  if(!btn) return;
  const off=!getApiKey()||!document.getElementById('popup-ko').value.trim();
  btn.setAttribute('aria-disabled',off?'true':'false');
}

function closeWordPopup(){
  const popup=document.getElementById('word-popup');
  const overlay=document.getElementById('word-popup-overlay');
  popup.classList.remove('visible');
  overlay.classList.remove('visible');
  setTimeout(()=>{
    popup.classList.add('hidden');
    overlay.classList.add('hidden');
  },200);
}

function addWordFromPopup(){
  const ko=document.getElementById('popup-ko').value.trim();
  const en=document.getElementById('popup-en').value.trim();
  const fb=document.getElementById('popup-feedback');
  if(!ko||!en){fb.textContent='Enter both Korean and meaning.';fb.className='popup-feedback';return;}
  db=getDB();
  if(db.words[ko]){fb.textContent=ko+' already in word list.';fb.className='popup-feedback popup-feedback-note';return;}
  db.words[ko]={ko,en,level:0,hardCount:0,nextReview:todayStr(),added:todayStr()};
  saveDB(db);
  fb.textContent=ko+' added!';
  fb.className='popup-feedback popup-feedback-ok';
  setTimeout(closeWordPopup,800);
}

// — AI Integration —

async function generateStory(){
  const out=document.getElementById('story-content');
  const key=getApiKey();
  if(!key||sessUseSentences.length===0){
    if(!key) out.innerHTML=`<div class="muted">Add an API key in the ··· menu to generate a story.</div>`;
    else document.getElementById('story-card').classList.add('hidden');
    return;
  }
  out.innerHTML=`<div class="ai-loading">concocting something ridiculous...</div>`;
  const usable=sessUseSentences.filter(s=>s.score!=='needs work');
  if(usable.length===0){document.getElementById('story-card').classList.add('hidden');return;}
  const wordList=usable.map(s=>`- "${s.sentence}" (used word: ${s.ko}, ${s.en})`).join('\n');
  const prompt=`You are a Korean creative writing assistant with a talent for absurd, deadpan comedy. A learner wrote these sentences during vocabulary practice:\n\n${wordList}\n\nWeave them into a short funny/absurd story in Korean (4-8 sentences). The tone should be comedic — unexpected situations, dry humor, surreal logic, bizarre consequences. Rules:\n1. Include each of the learner's sentences naturally — you may lightly adjust grammar but keep their words\n2. Bold each target vocabulary word using **word** markdown\n3. Commit fully to the absurdity — the funnier the better\n4. After the Korean story, add a natural English translation starting with "---"\n\nFormat:\n[Korean story]\n---\n[English translation]`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:600,messages:[{role:'user',content:prompt}]})
    });
    const data=await res.json();
    if(data.error){out.innerHTML=`<div class="ai-loading">Error: ${data.error.message}</div>`;return;}
    const text=(data.content?.[0]?.text||'').trim();
    const parts=text.split(/\n---\n/);
    const korean=parts[0]?.trim()||'';
    const english=parts[1]?.trim()||'';
    const koHtml=makeStoryTappable(korean);
    const enHtml=esc(english).replace(/\*\*(.+?)\*\*/g,'<span class="story-word">$1</span>').replace(/\n/g,'<br>');
    out.innerHTML=`<div class="story-text">${koHtml}</div>${enHtml?`<div class="story-translation">${enHtml}</div>`:''}`;
    saveCurrentStory(korean,english,sessUseSentences);
  }catch(e){
    out.innerHTML=`<div class="ai-loading">Could not reach API. Check your key and connection.</div>`;
  }
}

async function getAiFeedback(phase,ko,en){
  const key=getApiKey();
  if(!key){return;}
  const ansId='use-ans';
  const outId='use-ai-feedback';
  const answer=document.getElementById(ansId)?.value?.trim();
  if(!answer){document.getElementById(outId).innerHTML=`<div class="ai-loading">Write something first.</div>`;return;}
  // Show user's reply as a chat bubble
  const replyArea=document.getElementById('use-reply-area');
  if(replyArea){
    replyArea.querySelectorAll('.chat-suggestion').forEach(el=>el.remove());
    const prev=replyArea.querySelector('.user-reply-latest');
    if(prev) prev.classList.remove('user-reply-latest');
    replyArea.insertAdjacentHTML('beforeend',`<div class="chat-bubble chat-outgoing user-reply-latest">${esc(answer)}</div>`);
  }
  replyArea.insertAdjacentHTML('afterend',`<div class="chat-bubble chat-incoming chat-typing" id="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`);
  document.getElementById(outId).innerHTML='';
  const ctxObj=sessionContexts[sessIdx]||{prompt:''};
  const ctxPrompt=typeof ctxObj==='string'?ctxObj:(ctxObj.prompt||'');
  const prompt=`You are a Korean language tutor for an upper-intermediate learner. The target word is "${ko}" (${en}).\n\nThe learner was given this prompt:\n"${ctxPrompt}"\n\nThe learner wrote:\n"${answer}"\n\nEvaluate in 3 parts, be concise:\n1. SCORE: one of — great / good / needs work\n2. FEEDBACK: 1-2 sentences on grammar, naturalness, or word usage. Did they respond appropriately to the prompt? Be specific.\n3. SUGGESTION: If score is not "great", rewrite the sentence more naturally. The suggestion MUST use the target word "${ko}". (Korean only, then translation in parentheses). If great, skip this.\n\nReply in this exact format:\nSCORE: [great/good/needs work]\nFEEDBACK: [your feedback]\nSUGGESTION: [improved sentence using ${ko} (translation)] or none`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:300,messages:[{role:'user',content:prompt}]})
    });
    const data=await res.json();
    if(data.error){const t=document.getElementById('typing-indicator');if(t)t.remove();document.getElementById(outId).innerHTML=`<div class="ai-loading">Error: ${data.error.message}</div>`;return;}
    const text=data.content?.[0]?.text||'';
    const scoreM=text.match(/SCORE:\s*(.+)/i);
    const feedM=text.match(/FEEDBACK:\s*(.+)/i);
    const suggM=text.match(/SUGGESTION:\s*([\s\S]+?)(?:\n\n|$)/i);
    const score=(scoreM?.[1]||'').trim().toLowerCase();
    const feed=(feedM?.[1]||'').trim();
    const sugg=(suggM?.[1]||'').trim();
    const scoreClass=score.includes('great')?'score-great':score.includes('needs')?'score-revise':'score-ok';
    const scoreLabel=score.includes('great')?'great':score.includes('needs')?'needs work':'good';
    // Remove typing indicator
    const typing=document.getElementById('typing-indicator');
    if(typing) typing.remove();
    // Add reaction to user's reply bubble
    const replyBubble=replyArea?.querySelector('.user-reply-latest');
    if(replyBubble){
      const reaction=scoreLabel==='needs work'?'👎':scoreLabel==='great'?'👍':'';
      if(reaction) replyBubble.insertAdjacentHTML('afterbegin',`<span class="chat-reaction">${reaction}</span>`);
    }
    // Show suggestion as a corrected reply bubble
    const replyArea=document.getElementById('use-reply-area');
    if(sugg&&sugg.toLowerCase()!=='none'&&replyArea){
      const m=sugg.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      const suggKo=m?m[1]:sugg;
      const suggEn=m?m[2]:'';
      replyArea.insertAdjacentHTML('beforeend',
        `<div class="chat-bubble chat-outgoing chat-suggestion">` +
        `${esc(suggKo)}` +
        `</div>`);
    }
    let html=`<div class="ai-feedback-box"><div class="fb-label">evaluation</div><span class="fb-score ${scoreClass}">${scoreLabel}</span><div>${esc(feed)}</div></div>`;
    if(sugg&&sugg.toLowerCase()!=='none'){
      const m=sugg.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
      if(m) html+=`<div class="fb-suggestion"><div class="fb-label">suggestion</div><div>${esc(m[1])}</div><div class="muted">${esc(m[2])}</div></div>`;
      else html+=`<div class="fb-suggestion"><div class="fb-label">suggestion</div><div>${esc(sugg)}</div></div>`;
    }
    document.getElementById(outId).innerHTML=html;
    // Store score on the corresponding sentence record
    const existing=sessUseSentences.find(s=>s.ko===ko);
    if(existing){existing.score=scoreLabel;}
    else{sessUseSentences.push({ko,en,sentence:answer,score:scoreLabel});}
    if(scoreLabel==='needs work'){
      const w=sessionQueue[sessIdx];
      if(w&&!sessionQueue.slice(sessIdx+1).find(q=>q.ko===ko)){
        sessionQueue.push(w);
      }
    }
    const skipBtn=document.getElementById('use-skip');
    if(skipBtn) skipBtn.innerHTML='next '+SVG_ARROW_RIGHT;
  }catch(e){
    const t=document.getElementById('typing-indicator');if(t)t.remove();
    document.getElementById(outId).innerHTML=`<div class="ai-loading">Could not reach API. Check your key and connection.</div>`;
  }
}

// — Import / Export —

function exportData(){
  const db=getDB();
  const json=JSON.stringify(db,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const date=new Date().toISOString().slice(0,10);
  a.href=url;a.download=`korean-srs-${date}.json`;
  a.click();URL.revokeObjectURL(url);
  showSyncFeedback('Progress exported.');
}

function importData(e){
  const file=e.target.files[0];
  if(!file){return;}
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const imported=JSON.parse(ev.target.result);
      if(!imported.words){showSyncFeedback('Invalid file — no word bank found.');return;}
      saveDB(imported);
      loadHome();
      const count=Object.keys(imported.words).length;
      showSyncFeedback(`Imported ${count} word${count!==1?'s':''} — replaced all progress.`);
    }catch(err){showSyncFeedback('Could not read file.');}
  };
  reader.readAsText(file);
  e.target.value='';
}

function resetAllData(){
  if(!confirm('This will delete all words, progress, and stats. This cannot be undone.\n\nAre you sure?')) return;
  saveDB({words:{},sessions:0,streak:0,lastDate:null});
  document.getElementById('dropdown-menu').classList.add('hidden');
  loadHome();
  showSyncFeedback('All progress reset.');
}

function showSyncFeedback(msg){
  const el=document.getElementById('sync-feedback');
  if(!el) return;
  el.textContent=msg;
  setTimeout(()=>{el.textContent='';},3000);
}

// — Menu —

function toggleMenu(){
  const m=document.getElementById('dropdown-menu');
  m.classList.toggle('hidden');
  if(!m.classList.contains('hidden')) renderApiKeySection();
}

// — Voice Recognition —

function resetMic(){
  const micBtn=document.getElementById('btn-circle');
  const status=document.getElementById('voice-status');
  if(micBtn){micBtn.className='btn-circle';micBtn.innerHTML=MIC_ICON;micBtn.disabled=false;}
  if(status) status.textContent='tap mic or type below';
}

function startVoice(expectedKo){
  const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SpeechRecognition) return;
  if(activeRecognition){activeRecognition.stop();activeRecognition=null;resetMic();return;}
  const rec=new SpeechRecognition();
  rec.lang='ko-KR';
  rec.interimResults=false;
  rec.maxAlternatives=5;
  activeRecognition=rec;
  const micBtn=document.getElementById('btn-circle');
  const status=document.getElementById('voice-status');
  const input=document.getElementById('type-ans');
  const typeResult=document.getElementById('type-result');
  if(micBtn){micBtn.className='btn-circle listening';micBtn.innerHTML=MIC_ICON_ACTIVE;}
  if(status) status.textContent='listening... (tap mic to cancel)';
  rec.onresult=function(e){
    const alternatives=Array.from(e.results[0]).map(r=>r.transcript.trim());
    const heard=alternatives[0];
    const correct=alternatives.some(a=>normalize(a)===normalize(expectedKo));
    activeRecognition=null;
    if(micBtn){micBtn.className='btn-circle';micBtn.innerHTML=MIC_ICON;}
    if(input){input.value=heard;input.disabled=true;}
    if(correct){
      playCorrectSound();
      if(input) input.style.color='var(--teal)';
      if(status) status.textContent='';
      showSayNext();
    } else {
      if(input) input.style.color='var(--text)';
      if(status) status.textContent='not quite';
      if(typeResult) typeResult.innerHTML=`<div class="btn-row" style="justify-content:center"><button onclick="retryVoice(${escJS(expectedKo)})">retry</button><button onclick="giveUpTyped(${escJS(expectedKo)})">give up</button></div>`;
    }
  };
  rec.onerror=function(e){
    activeRecognition=null;
    resetMic();
    if(status) status.textContent=e.error==='not-allowed'?'microphone access denied':e.error==='no-speech'?'no speech — try again':'tap mic or type below';
  };
  rec.onend=function(){
    if(activeRecognition===rec) activeRecognition=null;
    const btn=document.getElementById('btn-circle');
    if(btn&&btn.className==='btn-circle listening'){btn.className='btn-circle';btn.innerHTML=MIC_ICON;}
  };
  rec.start();
}

function retryTyped(expectedKo){
  const input=document.getElementById('type-ans');
  const typeResult=document.getElementById('type-result');
  if(input){input.value='';input.disabled=false;input.style.color='var(--text)';input.focus();}
  if(typeResult) typeResult.innerHTML='';
}

function retryVoice(expectedKo){
  const input=document.getElementById('type-ans');
  const typeResult=document.getElementById('type-result');
  const status=document.getElementById('voice-status');
  if(input){input.value='';input.disabled=false;input.style.color='var(--text)';}
  if(typeResult) typeResult.innerHTML='';
  if(status) status.textContent='';
  startVoice(expectedKo);
}

function checkTypedAnswer(expectedKo){
  const input=document.getElementById('type-ans');
  const result=document.getElementById('type-result');
  const status=document.getElementById('voice-status');
  if(!input||!result) return;
  const val=input.value.trim();
  if(!val) return;
  sayUsedTextInput=true;
  if(status) status.textContent='';
  const correct=normalize(val)===normalize(expectedKo);
  if(correct){
    playCorrectSound();
    input.disabled=true;
    input.style.color='var(--teal)';
    showSayNext();
  } else {
    input.style.color='var(--red)';
    result.innerHTML=`<div class="btn-row" style="justify-content:center"><button onclick="retryTyped(${escJS(expectedKo)})">retry</button><button onclick="giveUpTyped(${escJS(expectedKo)})">give up</button></div>`;
    input.disabled=true;
  }
}

function giveUpTyped(expectedKo){
  const input=document.getElementById('type-ans');
  const result=document.getElementById('type-result');
  if(input){input.value=expectedKo;input.disabled=true;input.style.color='var(--teal)';}
  const w=sessionQueue[sessIdx];
  sessRecallResults.push({ko:w.ko,en:w.en,result:'gave-up'});
  sessionQueue.push(w);
  if(result) result.innerHTML='';
  const actions=document.getElementById('say-action');
  if(actions) actions.innerHTML=`<button onclick="nextWord()" class="ml-auto">next${isMobile?'':' <kbd>enter</kbd>'} ${SVG_ARROW_RIGHT}</button>`;
}

// — Keyboard Shortcuts —

document.addEventListener('keydown',function(e){
  const inSession=!document.getElementById('session-screen').classList.contains('hidden');
  if(!inSession) return;
  const tag=document.activeElement.tagName;
  const inText=tag==='TEXTAREA'||tag==='INPUT';

  if(e.key==='Escape'){
    const modal=document.getElementById('end-session-modal');
    if(modal&&modal.classList.contains('visible')){closeEndSessionModal();return;}
  }

  const phase=phaseMap[sessPhase];

  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){
    e.preventDefault();
    const w=sessionQueue[sessIdx];
    if(!w) return;
    if(phase==='use') getAiFeedback('use',w.ko,w.en);
    return;
  }

  if(inText) return;

  if(e.key===' '||e.code==='Space'){
    e.preventDefault();
    if(phase==='see'){
      const revealBtn=document.querySelector('#see-action button');
      if(revealBtn) revealBtn.click();
    } else if(phase==='say'){
      const w=sessionQueue[sessIdx]; if(w) startVoice(w.ko);
    }
    return;
  }

  if(e.key==='Enter'){
    if(phase==='say'){
      const ti=document.getElementById('type-ans');
      if(ti&&ti.disabled) { const btn=document.querySelector('.session-actions button'); if(btn) btn.click(); }
    } else if(phase==='pair'){
      const allDisabled=!document.querySelector('.pair-option:not(:disabled)');
      if(allDisabled) nextWord();
    } else if(phase==='use'){
      const s=document.getElementById('use-skip');if(s)s.click();
    }
    return;
  }

  if(phase==='pair'&&['1','2','3','4'].includes(e.key)){
    const btns=document.querySelectorAll('.pair-option:not(:disabled)');
    const idx=parseInt(e.key)-1;
    if(btns[idx]) btns[idx].click();
    return;
  }

  if(e.key==='1'){
    const rateArea=document.getElementById('rate-area');
    if(rateArea&&!rateArea.classList.contains('hidden')) rateWord('good');
  } else if(e.key==='2'){
    const rateArea=document.getElementById('rate-area');
    if(rateArea&&!rateArea.classList.contains('hidden')) rateWord('ok');
  } else if(e.key==='3'){
    const rateArea=document.getElementById('rate-area');
    if(rateArea&&!rateArea.classList.contains('hidden')) rateWord('hard');
  }});

document.addEventListener('click',function(e){
  const menu=document.getElementById('dropdown-menu');
  const btn=document.getElementById('menu-btn');
  if(!menu||!btn) return;
  if(!menu.contains(e.target)&&e.target!==btn){menu.classList.add('hidden');}
});

// — Visibility —

document.addEventListener('visibilitychange',function(){
  if(document.hidden) stopRecognition();
});

// — Saved Stories —

function getSavedStories(){try{const d=localStorage.getItem('kr_srs_stories');return d?JSON.parse(d):[];}catch(e){return[];}}
function saveStories(stories){try{localStorage.setItem('kr_srs_stories',JSON.stringify(stories));}catch(e){}}

function saveCurrentStory(korean,english,words){
  const stories=getSavedStories();
  stories.unshift({
    id:Date.now(),
    date:todayStr(),
    korean:korean,
    english:english,
    words:words.map(s=>({ko:s.ko,en:s.en,sentence:s.sentence}))
  });
  saveStories(stories);
}

function deleteStory(id){
  if(!confirm('Delete this story?')) return;
  const stories=getSavedStories().filter(s=>s.id!==id);
  saveStories(stories);
  renderStoriesList();
}

function showStories(){
  showScreen('stories');
  renderStoriesList();
}

function renderStoriesList(){
  const stories=getSavedStories();
  const countEl=document.getElementById('stories-count');
  const listEl=document.getElementById('stories-list');
  countEl.textContent=stories.length?`${stories.length} stor${stories.length===1?'y':'ies'}`:'';
  if(!stories.length){
    listEl.innerHTML='<div class="card"><div class="muted">No saved stories yet. Complete a session with an API key to generate stories.</div></div>';
    return;
  }
  listEl.innerHTML=stories.map(s=>{
    const koHtml=makeStoryTappable(s.korean);
    const enHtml=s.english?esc(s.english).replace(/\*\*(.+?)\*\*/g,'<span class="story-word">$1</span>').replace(/\n/g,'<br>'):'';
    const wordChips=s.words?s.words.map(w=>`<span class="theme-pill">${esc(w.ko)}</span>`).join(' '):'';
    return `<div class="card story-saved-card">
      <div class="story-saved-header">
        <span class="muted">${esc(s.date)}</span>
        <button class="btn-tertiary" onclick="deleteStory(${s.id})">delete</button>
      </div>
      ${wordChips?`<div class="story-saved-words">${wordChips}</div>`:''}
      <div class="story-text">${koHtml}</div>
      ${enHtml?`<div class="story-translation">${enHtml}</div>`:''}
    </div>`;
  }).join('');
}

function exportStories(){
  const stories=getSavedStories();
  if(!stories.length){showSyncFeedback('No stories to export.');return;}
  const json=JSON.stringify(stories,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const date=new Date().toISOString().slice(0,10);
  a.href=url;a.download=`korean-stories-${date}.json`;
  a.click();URL.revokeObjectURL(url);
  showSyncFeedback('Stories exported.');
}

function importStories(e){
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(ev){
    try{
      const imported=JSON.parse(ev.target.result);
      if(!Array.isArray(imported)){showSyncFeedback('Invalid file — expected a stories array.');return;}
      const existing=getSavedStories();
      const existingIds=new Set(existing.map(s=>s.id));
      let added=0;
      imported.forEach(s=>{
        if(s.korean&&!existingIds.has(s.id)){
          existing.push(s);
          existingIds.add(s.id);
          added++;
        }
      });
      existing.sort((a,b)=>(b.id||0)-(a.id||0));
      saveStories(existing);
      showSyncFeedback(`Imported ${added} stor${added===1?'y':'ies'}.`);
    }catch(err){showSyncFeedback('Could not read stories file.');}
  };
  reader.readAsText(file);
  e.target.value='';
}

// — Init —

document.getElementById('add-ko').addEventListener('input',updateLookupBtn);
document.getElementById('popup-ko').addEventListener('input',updatePopupLookupBtn);
loadHome();
