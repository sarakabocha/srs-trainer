// — Constants & Config —

const isMobile=/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

const CONTEXTS=[
  (ko,en)=>`Someone just did something unexpected. Describe what happened using "${ko}" (${en}) — make it specific and vivid.`,
  (ko,en)=>`You're texting a friend about your day. Work "${ko}" (${en}) into the message naturally — one or two sentences.`,
  (ko,en)=>`A character in a drama turns to the camera and says something using "${ko}" (${en}). Write the line.`,
  (ko,en)=>`Finish this thought in Korean using "${ko}" (${en}):\n"솔직히 말하면..."  (Honestly speaking...)`,
  (ko,en)=>`Describe a moment when you — or someone you know — would feel or say "${ko}" (${en}). Be specific.`,
  (ko,en)=>`What's the difference between "${ko}" (${en}) and a word with a similar meaning? Show it in a sentence.`,
  (ko,en)=>`You're giving advice to a friend. Use "${ko}" (${en}) somewhere in your advice.`,
  (ko,en)=>`Write a one-sentence observation about life, people, or the world using "${ko}" (${en}).`,
  (ko,en)=>`Set the scene: where are you, what time is it, what's happening — and use "${ko}" (${en}) somewhere in it.`,
  (ko,en)=>`Finish this sentence in Korean using "${ko}" (${en}):\n"요즘 들어서..."  (Lately I've been noticing...)`,
  (ko,en)=>`Write the internal monologue of someone experiencing "${ko}" (${en}) right now. One or two sentences.`,
  (ko,en)=>`Use "${ko}" (${en}) to describe something you noticed, felt, or thought about recently — real or invented.`,
];
const INTERVALS={good:[1,3,7,14,30],ok:[1,2,4,10],hard:[0,0,1,2]};
const SESSION_SIZES=[5,10,15,0];

// — SVG Icons —

const SVG_CHEVRON_RIGHT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const SVG_CHEVRON_DOWN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
const SVG_ARROW_RIGHT='<svg class="svg-icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
const MIC_ICON=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`;
const MIC_ICON_ACTIVE=`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>`;

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
function updateStreak(db){const today=todayStr();if(db.lastDate===today)return;const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const yd=yesterday.toISOString().slice(0,10);if(db.lastDate===yd)db.streak=(db.streak||0)+1;else if(db.lastDate!==today)db.streak=1;db.lastDate=today;}

function similar(a,b){
  if(a===b) return true;
  if(a.includes(b)||b.includes(a)) return true;
  if(Math.abs(a.length-b.length)>3) return false;
  let diff=0;const len=Math.max(a.length,b.length);
  for(let i=0;i<len;i++){if(a[i]!==b[i])diff++;}
  return diff<=1;
}

function findSimilar(ko){
  const db=getDB();
  return Object.values(db.words).filter(w=>w.ko!==ko&&similar(w.ko,ko));
}

function normalize(s){return s.replace(/\s+/g,'').replace(/[.,!?~]/g,'').toLowerCase();}
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
  document.getElementById('last-session-label').textContent=db.lastDate?'last: '+db.lastDate:'';
  const filteredDue=activeThemeFilter?due.filter(w=>w.theme===activeThemeFilter):due;
  document.getElementById('due-summary').textContent=filteredDue.length===0
    ?activeThemeFilter?`No words due in "${activeThemeFilter}" — try another theme or check back tomorrow.`:'No words due — check back tomorrow, or add new words below.'
    :`${filteredDue.length} word${filteredDue.length>1?'s':''} ready for review.${hard.length>0&&!activeThemeFilter?' Includes '+hard.length+' hard word'+(hard.length>1?'s':'')+'.':''}`;
  document.getElementById('start-btn').disabled=filteredDue.length===0;
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
    filterEl.style.display='none';return;
  }
  if(!themed.length){
    themeEl.innerHTML=`<div class="muted">${words.length?'Click refresh to group your words by theme.':'Add words to get started.'}</div>`;
    filterEl.style.display='none';return;
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
  filterEl.style.display='block';
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
  return`<div class="word-row" id="wr-${esc(w.ko)}"><span class="wb-ko">${esc(w.ko)}</span><span class="wb-en">${esc(w.en)}</span><span class="wb-date">${w.nextReview?'next: '+esc(w.nextReview):'new'}</span><button class="del-btn" onclick="editWord(${escJS(w.ko)})">edit</button><button class="del-btn" onclick="deleteWord(${escJS(w.ko)})">remove</button></div>`;
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
  row.innerHTML=`<input type="text" id="edit-ko" value="${esc(w.ko)}" class="edit-input" /><input type="text" id="edit-en" value="${esc(w.en)}" class="edit-input-sm" /><button class="del-btn edit-save" onclick="saveEditWord(${escJS(ko)})">save</button><button class="del-btn" onclick="renderWordBank()">cancel</button>`;
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
  const matches=findSimilar(ko);
  if(matches.length){
    showFeedback(`Added — similar word already exists: ${matches.map(w=>w.ko).join(', ')}`);
  } else {
    showFeedback(ko+' added.');
  }
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

async function startSession(){
  db=getDB();
  const due=Object.values(db.words).filter(isDue);
  const filtered=activeThemeFilter?due.filter(w=>w.theme===activeThemeFilter):due;
  const hard=filtered.filter(w=>(w.hardCount||0)>0).sort(()=>Math.random()-0.5);
  const normal=filtered.filter(w=>(w.hardCount||0)===0).sort(()=>Math.random()-0.5);
  const limit=sessionSize===0?Infinity:sessionSize;
  sessionQueue=[...hard,...normal].slice(0,limit);
  sessIdx=0;sessPhase=0;sessRatings=[];sessionContexts=[];sessRecallResults=[];sessPairResults=[];sessCollocations={};sessUseSentences=[];
  dbSnapshot=JSON.stringify(db);
  showScreen('session');
  // Load collocations if API key available
  if(getApiKey()){
    document.getElementById('phase-content').innerHTML=`<div class="card session-loading"><div class="ai-loading">preparing session...</div></div>`;
    const ok=await loadCollocations(sessionQueue);
    phaseMap=ok?['see','say','pair','use']:['see','say','use'];
  } else {
    phaseMap=['see','say','use'];
  }
  renderSessionPhase();
}

function showScreen(name){
  document.getElementById('home-screen').classList.toggle('hidden',name!=='home');
  document.getElementById('session-screen').classList.toggle('hidden',name!=='session');
  document.getElementById('done-screen').classList.toggle('hidden',name!=='done');
  document.getElementById('words-screen').classList.toggle('hidden',name!=='words');
  const sessHeader=document.querySelector('.sess-header');
  if(name!=='session'){
    document.getElementById('phase-content').innerHTML='';
    document.getElementById('phase-bar').innerHTML='';
    const sr=document.getElementById('sess-round');
    if(sr) sr.textContent='';
    if(sessHeader) sessHeader.style.display='none';
  } else {
    if(sessHeader) sessHeader.style.display='';
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
    el.innerHTML =
      `<div class="card">` +
      `<div class="session-body session-body-center">` +
      `<div class="label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="flashcard-word">${esc(w.ko)}</div>` +
      `<div id="reveal-area" class="w-full">` +
      `<button class="btn-full" onclick="revealMeaning()">show meaning ${kbdHints}</button>` +
      `</div></div>` +
      `<div class="session-actions">` +
      `<div id="rate-area" class="hidden">` +
      `<div class="label">how well did you remember?</div>` +
      `<div class="rate-row">` +
      `<button class="btn-good" onclick="rateWord('good')">knew it ${kbdR[0]}</button>` +
      `<button onclick="rateWord('ok')">vaguely ${kbdR[1]}</button>` +
      `<button class="btn-hard" onclick="rateWord('hard')">forgot ${kbdR[2]}</button>` +
      `</div></div></div></div>`;
  } else if(phase==='say'){
    const remaining = sessionQueue.length - sessIdx - 1;
    const hasSpeech = ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    el.innerHTML=`<div class="card">
      <div class="session-body">
        <div class="label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>
        <div class="phase-center">
          <div class="prompt-text mb-sm">how do you say</div>
          <div class="prompt-word">${esc(w.en)}</div>
          <div class="prompt-text mt-sm">in Korean?</div>
        </div>
        ${hasSpeech ? `
        <button class="mic-btn" id="mic-btn" onclick="startVoice(${escJS(w.ko)})">${MIC_ICON}</button>
        <div id="voice-status" class="text-center voice-status">tap mic or type below</div>`
        : ''}
        <div class="type-input-wrap"><input class="type-input" id="type-ans" placeholder="한국어" autocomplete="off" autocorrect="off" spellcheck="false" /></div>
        <div id="type-result" class="type-result"></div>
      </div>
      <div class="session-actions session-actions-end">
        <button onclick="skipRecall()">skip ${SVG_ARROW_RIGHT}</button>
      </div>
    </div>`;
    setTimeout(()=>{
      const ti=document.getElementById('type-ans');
      if(ti){
        ti.addEventListener('keydown',function(e){
          if(e.key==='Enter'){e.preventDefault();checkTypedAnswer(w.ko);}
        });
        ti.addEventListener('blur',function(){
          if(ti.value.trim()&&!ti.disabled) setTimeout(()=>checkTypedAnswer(w.ko),100);
        });
      }
    },50);
  } else if(phase==='pair'){
    const coll=sessCollocations[w.ko];
    if(!coll){nextWord();return;}
    const opts=shuffleArray([...coll.options]);
    const kbdNums=isMobile?['','','','']:['<kbd>1</kbd>','<kbd>2</kbd>','<kbd>3</kbd>','<kbd>4</kbd>'];
    const remaining = sessionQueue.length - sessIdx - 1;
    const optBtns = opts.map((o, i) =>
      `<button class="pair-option" onclick="selectCollocation(${escJS(w.ko)},${escJS(o.ko)})">` +
      `<span class="pair-num">${kbdNums[i] || i + 1}</span>` +
      `<span class="pair-ko">${esc(o.ko)}</span>` +
      `</button>`
    ).join('');
    el.innerHTML =
      `<div class="card"><div class="session-body">` +
      `<div class="label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="phase-center">` +
      `<div class="prompt-text mb-sm">which does NOT pair with</div>` +
      `<div class="flashcard-word">${esc(w.ko)}</div>` +
      `</div>` +
      `<div id="pair-options">${optBtns}</div>` +
      `<div id="pair-result" class="pair-result"></div>` +
      `</div>` +
      `<div class="session-actions session-actions-end">` +
      `<button onclick="skipPair()" class="ml-auto">skip ${SVG_ARROW_RIGHT}</button>` +
      `</div></div>`;
  } else if(phase==='use'){
    const remaining = sessionQueue.length - sessIdx - 1;
    const ctx = sessionContexts[sessIdx] || (sessionContexts[sessIdx] = CONTEXTS[Math.floor(Math.random() * CONTEXTS.length)](w.ko, w.en));
    const aiFbBtn = getApiKey()
      ? `<button onclick="getAiFeedback('use',${escJS(w.ko)},${escJS(w.en)})">evaluate${isMobile ? '' : ' <kbd>⌘↵</kbd>'}</button>`
      : '';
    el.innerHTML =
      `<div class="card"><div class="session-body">` +
      `<div class="label">${remaining} word${remaining !== 1 ? 's' : ''} left</div>` +
      `<div class="prompt-text prompt-context">${esc(ctx)}</div>` +
      `<textarea id="use-ans" placeholder="Write in Korean..."></textarea>` +
      `<div id="use-ai-feedback"></div>` +
      `</div><div class="session-actions"><div class="btn-row">` +
      `${aiFbBtn}` +
      `<button id="use-skip" onclick="skipUse()" class="ml-auto">skip ${SVG_ARROW_RIGHT}</button>` +
      `</div></div></div>`;
    setTimeout(() => document.getElementById('use-ans')?.focus(), 50);
  }
}

function stopRecognition(){
  if(activeRecognition){activeRecognition.stop();activeRecognition=null;}
}

function nextWord(){
  stopRecognition();
  sessIdx++;
  if(sessIdx>=sessionQueue.length){
    sessPhase++;
    sessIdx=0;
    sessionContexts=[];
    // Deduplicate queue — remove retry copies from the previous phase
    const seen=new Set();
    sessionQueue=sessionQueue.filter(w=>{if(seen.has(w.ko))return false;seen.add(w.ko);return true;});
  }
  if(sessPhase>=phaseMap.length){endSession();return;}
  renderSessionPhase();
}

function revealMeaning(){
  const w=sessionQueue[sessIdx];
  document.getElementById('reveal-area').innerHTML=`<div class="answer-box text-center"><span class="reveal-answer">${esc(w.en)}</span>${w.hardCount>0?`<div class="muted reveal-hard">flagged hard ${w.hardCount}x</div>`:''}</div>`;
  document.getElementById('rate-area').classList.remove('hidden');
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
    resultEl.innerHTML=`<div class="pair-feedback correct">correct</div>`;
  } else {
    resultEl.innerHTML=`<div class="pair-feedback wrong">the odd one out was ${esc(coll.wrong.ko)} (${esc(coll.wrong.en)})</div>`;
  }
  if(!sessPairResults.find(r=>r.ko===ko)) sessPairResults.push({ko,correct:gotIt,chosen:chosenKo,answer:coll.wrong.ko});
  const w=sessionQueue[sessIdx];
  if(!gotIt&&w&&!sessionQueue.slice(sessIdx+1).find(q=>q.ko===ko)) sessionQueue.push(w);
  // Show next button
  const actions=document.querySelector('.session-actions');
  if(actions) actions.innerHTML=`<button onclick="nextWord()" class="ml-auto">next${isMobile?'':' <kbd>space</kbd>'} ${SVG_ARROW_RIGHT}</button>`;
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

function endSessionEarly(){sessionContexts=[];endSession();}

function cancelSession(){
  if(!confirm('Cancel session? No progress will be saved.')) return;
  if(dbSnapshot) saveDB(JSON.parse(dbSnapshot));
  dbSnapshot=null;
  stopRecognition();
  showScreen('home');
  loadHome();
}

function goHome(){
  showScreen('home');
  loadHome();
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
  const wordList=sessUseSentences.map(s=>`- "${s.sentence}" (used word: ${s.ko}, ${s.en})`).join('\n');
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
    const koHtml=esc(korean).replace(/\*\*(.+?)\*\*/g,'<span class="story-word">$1</span>').replace(/\n/g,'<br>');
    const enHtml=esc(english).replace(/\*\*(.+?)\*\*/g,'<span class="story-word">$1</span>').replace(/\n/g,'<br>');
    out.innerHTML=`<div class="story-text">${koHtml}</div>${enHtml?`<div class="story-translation">${enHtml}</div>`:''}`;
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
  document.getElementById(outId).innerHTML=`<div class="ai-loading">evaluating...</div>`;
  const prompt=`You are a Korean language tutor for an upper-intermediate learner. The target word is "${ko}" (${en}).\n\nThe learner wrote this Korean sentence:\n"${answer}"\n\nEvaluate in 3 parts, be concise:\n1. SCORE: one of — great / good / needs work\n2. FEEDBACK: 1-2 sentences on grammar, naturalness, or word usage. Be specific.\n3. SUGGESTION: If score is not "great", rewrite the sentence more naturally. The suggestion MUST use the target word "${ko}". (Korean only, then translation in parentheses). If great, skip this.\n\nReply in this exact format:\nSCORE: [great/good/needs work]\nFEEDBACK: [your feedback]\nSUGGESTION: [improved sentence using ${ko} (translation)] or none`;
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:300,messages:[{role:'user',content:prompt}]})
    });
    const data=await res.json();
    if(data.error){document.getElementById(outId).innerHTML=`<div class="ai-loading">Error: ${data.error.message}</div>`;return;}
    const text=data.content?.[0]?.text||'';
    const scoreM=text.match(/SCORE:\s*(.+)/i);
    const feedM=text.match(/FEEDBACK:\s*(.+)/i);
    const suggM=text.match(/SUGGESTION:\s*([\s\S]+?)(?:\n\n|$)/i);
    const score=(scoreM?.[1]||'').trim().toLowerCase();
    const feed=(feedM?.[1]||'').trim();
    const sugg=(suggM?.[1]||'').trim();
    const scoreClass=score.includes('great')?'score-great':score.includes('needs')?'score-revise':'score-ok';
    const scoreLabel=score.includes('great')?'great':score.includes('needs')?'needs work':'good';
    let html=`<div class="ai-feedback-box"><div class="fb-label">evaluation</div><span class="fb-score ${scoreClass}">${scoreLabel}</span><div>${esc(feed)}</div>`;
    if(sugg&&sugg.toLowerCase()!=='none')html+=`<div class="fb-suggestion"><div class="fb-label">suggestion</div><div>${esc(sugg)}</div></div>`;
    html+=`</div>`;
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
      const existing=getDB();
      const merged={...existing};
      merged.words={...existing.words};
      let added=0,updated=0;
      Object.values(imported.words).forEach(w=>{
        if(!merged.words[w.ko]){merged.words[w.ko]=w;added++;}
        else{
          const ex=merged.words[w.ko];
          const lvl=Math.max(ex.level||0,w.level||0);
          const hc=Math.max(ex.hardCount||0,w.hardCount||0);
          const nr=ex.nextReview&&w.nextReview?((ex.nextReview>w.nextReview)?ex.nextReview:w.nextReview):ex.nextReview||w.nextReview;
          if(lvl!==(ex.level||0)||hc!==(ex.hardCount||0)){
            ex.level=lvl;ex.hardCount=hc;if(nr)ex.nextReview=nr;
            if(w.theme&&!ex.theme)ex.theme=w.theme;
            updated++;
          }
        }
      });
      merged.sessions=Math.max(existing.sessions||0,imported.sessions||0);
      merged.streak=Math.max(existing.streak||0,imported.streak||0);
      if(imported.lastDate>existing.lastDate) merged.lastDate=imported.lastDate;
      saveDB(merged);
      loadHome();
      showSyncFeedback(`Imported: ${added} new, ${updated} updated.`);
    }catch(err){showSyncFeedback('Could not read file.');}
  };
  reader.readAsText(file);
  e.target.value='';
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
  const micBtn=document.getElementById('mic-btn');
  const status=document.getElementById('voice-status');
  if(micBtn){micBtn.className='mic-btn';micBtn.innerHTML=MIC_ICON;micBtn.disabled=false;}
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
  const micBtn=document.getElementById('mic-btn');
  const status=document.getElementById('voice-status');
  const input=document.getElementById('type-ans');
  const typeResult=document.getElementById('type-result');
  if(micBtn){micBtn.className='mic-btn listening';micBtn.innerHTML=MIC_ICON_ACTIVE;}
  if(status) status.textContent='listening... (tap mic to cancel)';
  rec.onresult=function(e){
    const alternatives=Array.from(e.results[0]).map(r=>r.transcript.trim());
    const heard=alternatives[0];
    const correct=alternatives.some(a=>normalize(a)===normalize(expectedKo));
    activeRecognition=null;
    if(micBtn){micBtn.className='mic-btn';micBtn.innerHTML=MIC_ICON;}
    if(input){input.value=heard;input.disabled=true;}
    if(correct){
      if(input) input.style.color='var(--teal)';
      if(status) status.textContent='';
      if(typeResult) typeResult.innerHTML=`<div class="btn-action-row"><button class="btn-correct" onclick="advancePhase()">correct →</button></div>`;
    } else {
      if(input) input.style.color='var(--text)';
      if(status) status.textContent='not quite';
      if(typeResult) typeResult.innerHTML=`<div class="btn-retry-row"><button onclick="retryVoice(${escJS(expectedKo)})">retry</button><button onclick="giveUpTyped(${escJS(expectedKo)})">give up</button></div>`;
    }
  };
  rec.onerror=function(e){
    activeRecognition=null;
    resetMic();
    if(status) status.textContent=e.error==='not-allowed'?'microphone access denied':e.error==='no-speech'?'no speech — try again':'tap mic or type below';
  };
  rec.onend=function(){
    if(activeRecognition===rec) activeRecognition=null;
    const btn=document.getElementById('mic-btn');
    if(btn&&btn.className==='mic-btn listening'){btn.className='mic-btn';btn.innerHTML=MIC_ICON;}
  };
  rec.start();
}

function retryVoice(expectedKo){
  const input=document.getElementById('type-ans');
  const typeResult=document.getElementById('type-result');
  const status=document.getElementById('voice-status');
  if(input){input.value='';input.disabled=false;input.style.color='var(--text)';}
  if(typeResult) typeResult.innerHTML='';
  if(status) status.textContent='tap mic or type below';
  startVoice(expectedKo);
}

function checkTypedAnswer(expectedKo){
  const input=document.getElementById('type-ans');
  const result=document.getElementById('type-result');
  const status=document.getElementById('voice-status');
  if(!input||!result) return;
  const val=input.value.trim();
  if(!val) return;
  if(status) status.textContent='';
  const correct=normalize(val)===normalize(expectedKo);
  if(correct){
    input.disabled=true;
    input.style.color='var(--teal)';
    result.innerHTML=`<div class="btn-action-row"><button class="btn-correct" onclick="advancePhase()">correct →</button></div>`;
  } else {
    input.style.color='var(--red)';
    result.innerHTML=`<div class="give-up-text">not quite — try again or <button class="del-btn give-up-link" onclick="giveUpTyped(${escJS(expectedKo)})">give up</button></div>`;
    setTimeout(()=>{input.style.color='var(--text)';},600);
  }
}

function giveUpTyped(expectedKo){
  const input=document.getElementById('type-ans');
  const result=document.getElementById('type-result');
  if(input){input.value=expectedKo;input.disabled=true;input.style.color='var(--teal)';}
  const w=sessionQueue[sessIdx];
  sessRecallResults.push({ko:w.ko,en:w.en,result:'gave-up'});
  sessionQueue.push(w);
  if(result) result.innerHTML=`<div class="btn-action-row"><button onclick="nextWord()">next →</button></div>`;
}

// — Keyboard Shortcuts —

document.addEventListener('keydown',function(e){
  const inSession=!document.getElementById('session-screen').classList.contains('hidden');
  if(!inSession) return;
  const tag=document.activeElement.tagName;
  const inText=tag==='TEXTAREA'||tag==='INPUT';

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
    if(phase==='say'){
      const w=sessionQueue[sessIdx];
      if(w) startVoice(w.ko);
    } else if(phase==='pair'){
      const allDisabled=!document.querySelector('.pair-option:not(:disabled)');
      if(allDisabled) nextWord();
    } else {
      const revealBtn=document.querySelector('#reveal-area button');
      if(revealBtn) revealBtn.click();
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
  } else if(e.key==='Enter'){
    if(phase==='use'){const s=document.getElementById('use-skip');if(s)s.click();return;}
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

// — Init —

loadHome();
