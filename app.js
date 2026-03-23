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
const SVG_ARROW_RIGHT='<svg style="width:14px;height:14px;vertical-align:-2px;margin-left:2px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
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

// — State —

let activeThemeFilter=null;
let sessionSize=5;
let sessionQueue=[],sessIdx=0,sessPhase=0,sessRatings=[],db;
let sessSentences=[];
let sessionContexts=[];
let dbSnapshot=null;
let activeRecognition=null;

// — API Key —

function getApiKey(){return localStorage.getItem('kr_srs_apikey')||'';}

function renderApiKeySection(){
  const el=document.getElementById('api-key-section');
  if(!el) return;
  const has=!!getApiKey();
  if(has){
    el.innerHTML=`
      <div style="display:flex;align-items:center;gap:8px;background:var(--bg-secondary);border-radius:var(--radius-md);padding:8px 10px;margin-bottom:6px">
        <span style="font-size:13px;color:var(--teal);flex:1">key saved ✓</span>
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="startReplaceKey()" style="flex:1;font-size:12px;padding:6px 8px">replace</button>
        <button onclick="removeApiKey()" style="flex:1;font-size:12px;padding:6px 8px;color:var(--color-text-danger, #E24B4A);border-color:var(--color-border-danger, #E24B4A)">remove</button>
      </div>
      <div id="api-key-replace" class="hidden" style="margin-top:8px">
        <div style="display:flex;gap:6px">
          <input type="password" id="api-key-input" placeholder="sk-ant-..." style="flex:1;font-size:13px;padding:7px 10px;border-radius:var(--radius-md);border:0.5px solid var(--border-hover);background:transparent;color:var(--text);font-family:var(--font-ui)" />
          <button onclick="saveApiKey()" style="white-space:nowrap;font-size:12px;padding:7px 10px">save</button>
        </div>
        <div id="api-key-status" style="font-size:12px;margin-top:4px;min-height:14px;color:var(--teal)"></div>
      </div>`;
  } else {
    el.innerHTML=`
      <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:8px">Enables AI feedback, story generation, and theme grouping.</div>
      <div style="display:flex;gap:6px">
        <input type="password" id="api-key-input" placeholder="sk-ant-..." style="flex:1;font-size:13px;padding:7px 10px;border-radius:var(--radius-md);border:0.5px solid var(--border-hover);background:transparent;color:var(--text);font-family:var(--font-ui)" />
        <button onclick="saveApiKey()" style="white-space:nowrap;font-size:12px;padding:7px 10px">save</button>
      </div>
      <div id="api-key-status" style="font-size:12px;margin-top:4px;min-height:14px;color:var(--teal)"></div>`;
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
    return`<button class="theme-pill${active?' active':''}" onclick="setSessionSize(${n})" style="padding:3px 10px;font-size:12px">${label}</button>`;
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
function toggleAddWords(){toggleSection('add-words-body','add-words-toggle-btn','add-words-card');}

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
    themeEl.innerHTML=`<div class="muted" style="font-size:13px">Add an API key in the ··· menu to enable theme grouping.</div>`;
    filterEl.style.display='none';return;
  }
  if(!themed.length){
    themeEl.innerHTML=`<div class="muted" style="font-size:13px">${words.length?'Click refresh to group your words by theme.':'Add words to get started.'}</div>`;
    filterEl.style.display='none';return;
  }
  const groups={};
  themed.forEach(w=>{if(!groups[w.theme])groups[w.theme]=[];groups[w.theme].push(w);});
  const unthemed=words.filter(w=>!w.theme);
  themeEl.innerHTML=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length).map(([theme,ws])=>`
    <div class="theme-row">
      <span class="theme-name">${esc(theme)}</span>
      <span class="theme-count">${ws.length} word${ws.length>1?'s':''} · ${ws.filter(isDue).length} due</span>
    </div>`).join('')+(unthemed.length?`<div class="theme-row"><span class="theme-name" style="color:var(--text-secondary)">ungrouped</span><span class="theme-count">${unthemed.length} words</span></div>`:'');

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
  el.innerHTML=hard.map(w=>`<div class="hard-row"><span style="font-size:15px">${esc(w.ko)}</span><span class="muted" style="margin-left:8px;font-size:13px">${esc(w.en)}</span><span class="badge badge-hard" style="margin-left:auto">${w.hardCount}x hard</span></div>`).join('');
}

// — UI Rendering: Word Bank —

function toggleWordBank(){
  const el=document.getElementById('word-bank-list');
  const show=el.classList.contains('hidden');
  el.classList.toggle('hidden');
  const icon=document.getElementById('word-bank-toggle-btn');
  icon.innerHTML=show?SVG_CHEVRON_DOWN:SVG_CHEVRON_RIGHT;
  document.getElementById('word-bank-card').classList.toggle('collapsed',!show);
  if(show){
    const words=Object.values(db.words);
    if(!words.length){el.innerHTML='<div class="muted">No words yet.</div>';return;}
    el.innerHTML=wordRowsHtml(words);
  }
}

function wordRowHtml(w){
  return`<div class="word-row" id="wr-${esc(w.ko)}"><span class="wb-ko">${esc(w.ko)}</span><span class="wb-en">${esc(w.en)}</span><span class="wb-date">${w.nextReview?'next: '+esc(w.nextReview):'new'}</span><button class="del-btn" onclick="editWord(${escJS(w.ko)})">edit</button><button class="del-btn" onclick="deleteWord(${escJS(w.ko)})">remove</button></div>`;
}
function wordRowsHtml(words){return words.map(wordRowHtml).join('');}

function deleteWord(ko){db=getDB();delete db.words[ko];saveDB(db);loadHome();renderWordBank();}

function renderWordBank(){
  const el=document.getElementById('word-bank-list');
  if(!el||el.classList.contains('hidden'))return;
  const words=Object.values(db.words);
  if(!words.length){el.innerHTML='<div class="muted">No words yet.</div>';return;}
  el.innerHTML=wordRowsHtml(words);
}

function editWord(ko){
  db=getDB();const w=db.words[ko];if(!w)return;
  const row=document.getElementById('wr-'+ko);
  if(!row)return;
  row.style.cssText='display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:0.5px solid var(--border)';
  row.innerHTML=`<input type="text" id="edit-ko" value="${esc(w.ko)}" style="flex:1;font-size:14px;padding:6px 8px" /><input type="text" id="edit-en" value="${esc(w.en)}" style="flex:1;font-size:13px;padding:6px 8px" /><button class="del-btn" onclick="saveEditWord(${escJS(ko)})" style="font-weight:500;color:var(--teal)">save</button><button class="del-btn" onclick="renderWordBank()">cancel</button>`;
  document.getElementById('edit-ko')?.focus();
}

function saveEditWord(oldKo){
  const newKo=document.getElementById('edit-ko')?.value.trim();
  const newEn=document.getElementById('edit-en')?.value.trim();
  if(!newKo||!newEn)return;
  db=getDB();const w=db.words[oldKo];if(!w)return;
  if(newKo!==oldKo){delete db.words[oldKo];w.ko=newKo;}
  w.en=newEn;
  db.words[newKo]=w;
  saveDB(db);loadHome();renderWordBank();
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
  loadHome();
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
  toggleBulk();loadHome();
  if(getApiKey()&&added>0) runGrouping();
}

function toggleBulk(){const el=document.getElementById('bulk-area');const btn=document.getElementById('bulk-toggle-btn');const show=el.classList.contains('hidden');el.classList.toggle('hidden');btn.textContent=show?'hide bulk':'bulk paste';}
function showFeedback(msg){const el=document.getElementById('add-feedback');el.textContent=msg;setTimeout(()=>{el.textContent='';},2500);}

// — Session Flow —

function startSession(){
  db=getDB();
  const due=Object.values(db.words).filter(isDue);
  const filtered=activeThemeFilter?due.filter(w=>w.theme===activeThemeFilter):due;
  const hard=filtered.filter(w=>(w.hardCount||0)>0).sort(()=>Math.random()-0.5);
  const normal=filtered.filter(w=>(w.hardCount||0)===0).sort(()=>Math.random()-0.5);
  const limit=sessionSize===0?Infinity:sessionSize;
  sessionQueue=[...hard,...normal].slice(0,limit);
  sessIdx=0;sessPhase=0;sessRatings=[];sessSentences=[];sessionContexts=[];
  dbSnapshot=JSON.stringify(db);
  showScreen('session');
  renderSessionPhase();
}

function showScreen(name){
  document.getElementById('home-screen').classList.toggle('hidden',name!=='home');
  document.getElementById('session-screen').classList.toggle('hidden',name!=='session');
  document.getElementById('done-screen').classList.toggle('hidden',name!=='done');
}

function renderPhaseBar(){
  const bar=document.getElementById('phase-bar');bar.innerHTML='';
  const total=4,done=sessPhase;
  bar.style.cssText='display:flex;gap:6px;margin-bottom:0.75rem';
  for(let i=0;i<total;i++){
    const p=document.createElement('div');
    p.style.cssText=`flex:1;height:4px;border-radius:2px;background:${i<done?'var(--teal)':i===done?'#5DCAA5':'var(--border-tertiary, rgba(0,0,0,0.12))'}`;
    bar.appendChild(p);
  }
  const roundNames=['round 1 — see it','round 2 — say it','round 3 — use it','round 4 — seal it'];
  const el=document.getElementById('sess-round');
  if(el) el.textContent=roundNames[sessPhase]||'';
}

function renderSessionPhase(){
  if(sessPhase>3){endSession();return;}
  const w=sessionQueue[sessIdx];
  renderPhaseBar();
  const el=document.getElementById('phase-content');
  if(sessPhase===0){
    const kbdHints=isMobile?'':'<kbd>space</kbd>';
    const kbdR=isMobile?['','','']:['<kbd>1</kbd>','<kbd>2</kbd>','<kbd>3</kbd>'];
    el.innerHTML=`<div class="card"><div class="session-body"><div class="label">word ${sessIdx+1} of ${sessionQueue.length}</div><div class="flashcard-word">${esc(w.ko)}</div></div><div class="session-actions"><div id="reveal-area"><button class="btn-full" onclick="revealMeaning()">show meaning ${kbdHints}</button></div><div id="rate-area" class="hidden" style="margin-top:.75rem"><div class="label">how well did you remember?</div><div class="rate-row"><button class="btn-good" onclick="rateWord('good')">knew it ${kbdR[0]}</button><button onclick="rateWord('ok')">vaguely ${kbdR[1]}</button><button class="btn-hard" onclick="rateWord('hard')">forgot ${kbdR[2]}</button></div></div></div></div>`;
  } else if(sessPhase===1){
    const hasSpeech=('webkitSpeechRecognition' in window||'SpeechRecognition' in window);
    el.innerHTML=`<div class="card">
      <div class="session-body">
        <div class="label">word ${sessIdx+1} of ${sessionQueue.length}</div>
        <div style="text-align:center;padding:0.5rem 0 0.25rem">
          <div style="font-size:13px;color:var(--text-secondary);margin-bottom:0.25rem">how do you say</div>
          <div style="font-size:28px;font-weight:500;color:var(--text);line-height:1.3">${esc(w.en)}</div>
          <div style="font-size:13px;color:var(--text-secondary);margin-top:4px">in Korean?</div>
        </div>
        ${hasSpeech?`
        <button class="mic-btn" id="mic-btn" onclick="startVoice(${escJS(w.ko)})">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-secondary)"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>
        </button>
        <div id="voice-status" style="text-align:center;font-size:13px;color:var(--text-secondary);min-height:20px;margin-bottom:0.75rem">tap mic or type below</div>`
        :''}
        <div class="type-input-wrap"><input class="type-input" id="type-ans" placeholder="한국어" autocomplete="off" autocorrect="off" spellcheck="false" /></div>
        <div id="type-result" style="min-height:20px;margin-top:0.5rem"></div>
      </div>
      <div class="session-actions" style="display:flex;justify-content:flex-end">
        <button onclick="nextWord()" style="font-size:13px">skip ${SVG_ARROW_RIGHT}</button>
      </div>
    </div>`;
    setTimeout(()=>{
      const ti=document.getElementById('type-ans');
      if(ti) ti.addEventListener('keydown',function(e){
        if(e.key==='Enter'){e.preventDefault();checkTypedAnswer(w.ko);}
      });
    },50);
  } else if(sessPhase===2){
    const ctx=sessionContexts[sessIdx]||(sessionContexts[sessIdx]=CONTEXTS[Math.floor(Math.random()*CONTEXTS.length)](w.ko,w.en));
    const aiFbBtn=getApiKey()?`<button onclick="getAiFeedback('use',${escJS(w.ko)},${escJS(w.en)})">evaluate${isMobile?'':' <kbd>⌘↵</kbd>'}</button>`:'';
    el.innerHTML=`<div class="card"><div class="session-body"><div class="label">word ${sessIdx+1} of ${sessionQueue.length}</div><div style="font-size:14px;line-height:1.6;margin:8px 0 .75rem;white-space:pre-line;color:var(--text)">${esc(ctx)}</div><textarea id="use-ans" placeholder="Write in Korean..."></textarea><div id="use-ai-feedback"></div></div><div class="session-actions"><div class="btn-row">${aiFbBtn}<button id="use-skip" onclick="nextWord()" style="margin-left:auto">skip ${SVG_ARROW_RIGHT}</button></div></div></div>`;
    setTimeout(()=>document.getElementById('use-ans')?.focus(),50);
  } else if(sessPhase===3){
    const aiFbBtn=getApiKey()?`<button onclick="getAiFeedback('seal',${escJS(w.ko)},${escJS(w.en)})">evaluate${isMobile?'':' <kbd>⌘↵</kbd>'}</button>`:'';
    el.innerHTML=`<div class="card"><div class="session-body"><div class="label">word ${sessIdx+1} of ${sessionQueue.length}</div><div style="font-size:15px;color:var(--text);margin:8px 0 .75rem;line-height:1.6">Write one sentence using <strong style="font-weight:500">${esc(w.ko)}</strong> (${esc(w.en)}) from your own life or imagination. Then say it aloud.</div><textarea id="seal-ans" placeholder="${esc(w.ko)}..."></textarea><div id="seal-ai-feedback"></div></div><div class="session-actions"><div class="btn-row">${aiFbBtn}<button id="seal-skip" onclick="finishWord()" style="margin-left:auto">skip ${SVG_ARROW_RIGHT}</button></div></div></div>`;
    setTimeout(()=>document.getElementById('seal-ans')?.focus(),50);
  }
}

function nextWord(){
  sessIdx++;
  if(sessIdx>=sessionQueue.length){
    sessPhase++;
    sessIdx=0;
    sessionContexts=[];
  }
  if(sessPhase>3){endSession();return;}
  renderSessionPhase();
}

function revealMeaning(){
  const w=sessionQueue[sessIdx];
  document.getElementById('reveal-area').innerHTML=`<div class="answer-box"><span style="font-size:17px;font-weight:500;color:var(--teal)">${esc(w.en)}</span>${w.hardCount>0?`<div class="muted" style="margin-top:4px;font-size:12px">flagged hard ${w.hardCount}x</div>`:''}</div>`;
  document.getElementById('rate-area').classList.remove('hidden');
}


function rateWord(rating){
  const w=sessionQueue[sessIdx];db=getDB();const word=db.words[w.ko];if(!word)return;
  if(rating==='hard'){word.hardCount=(word.hardCount||0)+1;word.level=Math.max(0,(word.level||0)-1);}
  else if(rating==='good'){word.level=Math.min(4,(word.level||0)+1);if(word.hardCount>0)word.hardCount--;}
  word.nextReview=nextInterval(word,rating);
  saveDB(db);sessRatings.push({ko:w.ko,rating});
  nextWord();
}

function advancePhase(){nextWord();}

function finishWord(){
  if(sessPhase===3){
    const ans=document.getElementById('seal-ans')?.value?.trim();
    const w=sessionQueue[sessIdx];
    if(ans) sessSentences.push({ko:w.ko,en:w.en,sentence:ans});
  }
  nextWord();
}

function endSession(){
  db=getDB();db.sessions=(db.sessions||0)+1;updateStreak(db);saveDB(db);
  showScreen('done');
  const good=sessRatings.filter(r=>r.rating==='good').length;
  const ok=sessRatings.filter(r=>r.rating==='ok').length;
  const hard=sessRatings.filter(r=>r.rating==='hard').length;
  document.getElementById('done-msg').textContent=`${sessionQueue.length}개 단어 완료. Hard words come back sooner — you'll see them again before the rest.`;
  document.getElementById('done-stats').innerHTML=`<div class="stat"><div class="n">${good}</div><div class="l">knew it</div></div><div class="stat"><div class="n">${ok}</div><div class="l">vaguely</div></div><div class="stat"><div class="n">${hard}</div><div class="l">hard</div></div><div class="stat"><div class="n">${db.sessions}</div><div class="l">total sessions</div></div>`;
  const sentEl=document.getElementById('story-sentences');
  sentEl.innerHTML=sessSentences.map(s=>`<div class="sentence-chip"><div class="chip-word">${esc(s.ko)} — ${esc(s.en)}</div>${esc(s.sentence)}</div>`).join('');
  generateStory();
}

function endSessionEarly(){sessionContexts=[];endSession();}

function cancelSession(){
  if(!confirm('Cancel session? No progress will be saved.')) return;
  if(dbSnapshot) saveDB(JSON.parse(dbSnapshot));
  dbSnapshot=null;
  if(activeRecognition){activeRecognition.stop();activeRecognition=null;}
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
  if(!key||sessSentences.length===0){
    if(!key) out.innerHTML=`<div class="muted" style="font-size:13px">Add an API key in the ··· menu to generate a story.</div>`;
    else document.getElementById('story-card').classList.add('hidden');
    return;
  }
  out.innerHTML=`<div class="ai-loading">concocting something ridiculous...</div>`;
  const wordList=sessSentences.map(s=>`- "${s.sentence}" (used word: ${s.ko}, ${s.en})`).join('\n');
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
  const ansId=phase==='use'?'use-ans':'seal-ans';
  const outId=phase==='use'?'use-ai-feedback':'seal-ai-feedback';
  const answer=document.getElementById(ansId)?.value?.trim();
  if(!answer){document.getElementById(outId).innerHTML=`<div class="ai-loading">Write something first.</div>`;return;}
  document.getElementById(outId).innerHTML=`<div class="ai-loading">evaluating...</div>`;
  const prompt=`You are a Korean language tutor for an upper-intermediate learner. The target word is "${ko}" (${en}).\n\nThe learner wrote this Korean sentence:\n"${answer}"\n\nEvaluate in 3 parts, be concise:\n1. SCORE: one of — great / good / needs work\n2. FEEDBACK: 1-2 sentences on grammar, naturalness, or word usage. Be specific.\n3. SUGGESTION: If score is not "great", rewrite the sentence more naturally (Korean only, then translation in parentheses). If great, skip this.\n\nReply in this exact format:\nSCORE: [great/good/needs work]\nFEEDBACK: [your feedback]\nSUGGESTION: [improved sentence (translation)] or none`;
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
    let html=`<div class="ai-feedback-box"><div class="fb-label">evaluation</div><span class="fb-score ${scoreClass}">${scoreLabel}</span><div style="color:var(--text)">${esc(feed)}</div>`;
    if(sugg&&sugg.toLowerCase()!=='none')html+=`<div style="margin-top:8px;padding-top:8px;border-top:0.5px solid var(--border);font-size:13px"><span style="font-size:11px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;display:block;margin-bottom:4px;color:var(--text-secondary)">suggestion</span><span style="color:var(--text)">${esc(sugg)}</span></div>`;
    html+=`</div>`;
    document.getElementById(outId).innerHTML=html;
    const skipBtn=document.getElementById(phase==='use'?'use-skip':'seal-skip');
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
      if(typeResult) typeResult.innerHTML=`<div style="text-align:center;margin-top:0.5rem"><button onclick="advancePhase()" style="border-color:var(--teal);color:var(--teal)">correct →</button></div>`;
    } else {
      if(input) input.style.color='var(--text)';
      if(status) status.textContent='not quite';
      if(typeResult) typeResult.innerHTML=`<div style="text-align:center;display:flex;gap:8px;justify-content:center;margin-top:0.5rem"><button onclick="retryVoice(${escJS(expectedKo)})">retry</button><button onclick="giveUpTyped(${escJS(expectedKo)})">give up</button></div>`;
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
    result.innerHTML=`<div style="text-align:center;margin-top:0.5rem"><button onclick="advancePhase()" style="border-color:var(--teal);color:var(--teal)">correct →</button></div>`;
  } else {
    input.style.color='var(--red)';
    result.innerHTML=`<div style="text-align:center;font-size:13px;color:var(--text-secondary);margin-top:4px">not quite — try again or <button class="del-btn" onclick="giveUpTyped(${escJS(expectedKo)})" style="font-size:13px;color:var(--text-secondary);text-decoration:underline;padding:0">give up</button></div>`;
    setTimeout(()=>{input.style.color='var(--text)';},600);
  }
}

function giveUpTyped(expectedKo){
  const input=document.getElementById('type-ans');
  const result=document.getElementById('type-result');
  if(input){input.value=expectedKo;input.disabled=true;input.style.color='var(--teal)';}
  if(result) result.innerHTML=`<div style="text-align:center;margin-top:0.5rem"><button onclick="advancePhase()">next →</button></div>`;
}

// — Keyboard Shortcuts —

document.addEventListener('keydown',function(e){
  const inSession=!document.getElementById('session-screen').classList.contains('hidden');
  if(!inSession) return;
  const tag=document.activeElement.tagName;
  const inText=tag==='TEXTAREA'||tag==='INPUT';

  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){
    e.preventDefault();
    const w=sessionQueue[sessIdx];
    if(!w) return;
    const ko=w.ko,en=w.en;
    if(sessPhase===2) getAiFeedback('use',ko,en);
    else if(sessPhase===3) getAiFeedback('seal',ko,en);
    return;
  }

  if(inText) return;

  if(e.key===' '||e.code==='Space'){
    e.preventDefault();
    if(sessPhase===1){
      const w=sessionQueue[sessIdx];
      if(w) startVoice(w.ko);
    } else {
      const revealBtn=document.querySelector('#reveal-area button');
      if(revealBtn) revealBtn.click();
    }
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
    if(sessPhase===2){const s=document.getElementById('use-skip');if(s)s.click();return;}
    if(sessPhase===3){finishWord();}
  }});

document.addEventListener('click',function(e){
  const menu=document.getElementById('dropdown-menu');
  const btn=document.getElementById('menu-btn');
  if(!menu||!btn) return;
  if(!menu.contains(e.target)&&e.target!==btn){menu.classList.add('hidden');}
});

// — Init —

loadHome();
