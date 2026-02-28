// ===== Lock timer state =====
let lockTimeout = null;
let lockCountdown = null;
let lockSeconds = 60;
let lockActive = false;

const lockBox = document.getElementById('lockBox');
const lockTimer = document.getElementById('lockTimer');

function resetLockTimer() {
  if (!lockActive) return;
  clearTimeout(lockTimeout);
  clearInterval(lockCountdown);
  lockSeconds = 60;
  lockTimer.textContent = lockSeconds;
  lockTimeout = setTimeout(startLockCountdown, 2000);
}

function startLockCountdown() {
  clearInterval(lockCountdown);
  lockCountdown = setInterval(() => {
    lockSeconds--;
    lockTimer.textContent = lockSeconds;

    if (lockSeconds <= 10) {
      const redFade = Math.min(1, (11 - lockSeconds) / 10);
      const yellow = '#ffe066';
      const red = '#ff2d55';
      lockBox.style.background = `linear-gradient(90deg, ${yellow} ${(1 - redFade) * 100}%, ${red} ${redFade * 100}%)`;
    } else if (lockSeconds <= 20) {
      const yellowFade = Math.min(1, (21 - lockSeconds) / 10);
      const blue = 'rgba(77,163,255,0.10)';
      const yellow = '#ffe066';
      lockBox.style.background = `linear-gradient(90deg, ${blue} ${(1 - yellowFade) * 100}%, ${yellow} ${yellowFade * 100}%)`;
    } else {
      lockBox.style.background = 'rgba(77,163,255,0.10)';
    }

    if (lockSeconds <= 0) {
      clearInterval(lockCountdown);
      lockAccount();
    }
  }, 1000);
}

function lockAccount() {
  lockActive = false;
  lockBox.style.display = 'none';
  showLogin();
}

function enableLockTimer() {
  lockActive = true;
  lockBox.style.display = 'flex';
  lockSeconds = 60;
  lockTimer.textContent = lockSeconds;
  resetLockTimer();
}

function disableLockTimer() {
  lockActive = false;
  lockBox.style.display = 'none';
  clearTimeout(lockTimeout);
  clearInterval(lockCountdown);
}

// reset on mouse movement
document.addEventListener('mousemove', () => {
  if (lockActive) resetLockTimer();
});

// ===== Mock data =====
const VAULT = {
  WORK: [
    { name: "olle@company.se", password: "P@ssw0rd123" },
    { name: "user@domain.tld", password: "GH!tHub2026" },
    { name: "jane.doe@work.com", password: "JaneWork!45" },
    { name: "admin@company.se", password: "Adm1n!2026" },
    { name: "john.smith@work.com", password: "Smith#2026" },
    { name: "emma@company.se", password: "Emma*2026" },
    { name: "it.support@company.se", password: "ITsupport!2026" },
    { name: "finance@company.se", password: "Fin@2026" },
  ],
  HOME: [
    { name: "wifi@home", password: "HomeNet2026" },
    { name: "admin", password: "Router!2026" },
    { name: "family@home.com", password: "FamPass!2026" },
    { name: "me@home.com", password: "MyHome!2026" },
    { name: "kids@home.com", password: "Kids#2026" },
    { name: "guest@home", password: "GuestWifi!2026" },
    { name: "mom@home.com", password: "MomHome!2026" },
    { name: "dad@home.com", password: "DadHome!2026" },
  ],
  HOBBY: [
    { name: "steamuser", password: "Steam!2026" },
    { name: "discorduser", password: "Disc0rd!2026" },
    { name: "gamer@hobby.com", password: "Gamer#2026" },
    { name: "artist@hobby.com", password: "Art!2026" },
    { name: "reader@hobby.com", password: "Read#2026" },
    { name: "collector@hobby.com", password: "Collect!2026" },
    { name: "builder@hobby.com", password: "Build!2026" },
    { name: "chef@hobby.com", password: "Chef!2026" },
  ],
};

// ===== Login rules (mock) =====
const ACCOUNT_RE = /^[A-Z][0-9]{8}$/;
const PIN_RE = /^[0-9]{4}$/;

// ===== Elements =====
const pillEl = document.getElementById('pill');
const loginScreen = document.getElementById('loginScreen');
const appScreen = document.getElementById('appScreen');

const accountEl = document.getElementById('account');
const pinEl = document.getElementById('pin');
const msgEl = document.getElementById('msg');

const whoEl = document.getElementById('who');
const crumbsEl = document.getElementById('crumbs');

const folderView = document.getElementById('folderView');
const passwordView = document.getElementById('passwordView');

const folderGrid = document.getElementById('folderGrid');
const entryList = document.getElementById('entryList');
const emptyState = document.getElementById('emptyState');
const searchEl = document.getElementById('search');

let currentUser = null;
let currentFolder = null;

// ===== Helpers =====
function setError(text){
  msgEl.textContent = text;
  msgEl.style.display = 'block';
}
function clearMsg(){
  msgEl.textContent = '';
  msgEl.style.display = 'none';
}

function normalizeAccount(){
  const v = accountEl.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  accountEl.value = v.slice(0, 9);
}
function normalizePin(){
  const v = pinEl.value.replace(/\D/g, '');
  pinEl.value = v.slice(0, 4);
}

function generateAccount(prefix='C'){
  const n = Math.floor(Math.random() * 1e8).toString().padStart(8,'0');
  return `${prefix}${n}`;
}

function setCrumbs(folder){
  crumbsEl.innerHTML = '';
  const home = document.createElement('span');
  home.className = 'crumb';
  home.innerHTML = `<strong>Folders</strong>`;
  crumbsEl.appendChild(home);

  if(folder){
    const sep = document.createElement('span');
    sep.className = 'sep';
    sep.textContent = '›';
    crumbsEl.appendChild(sep);

    const f = document.createElement('span');
    f.className = 'crumb';
    f.innerHTML = `<strong>${folder}</strong>`;
    crumbsEl.appendChild(f);
  }
}

// ===== Render folder cards =====
function renderFolders(){
  folderGrid.innerHTML = '';

  Object.keys(VAULT).forEach(name => {
    const count = (VAULT[name] || []).length;

    const card = document.createElement('div');
    card.className = 'panel';

    card.innerHTML = `
      <div class="panelHead">
        <div>
          <p class="panelTitle">${name}</p>
          <p class="panelMeta">${count} password${count === 1 ? '' : 's'}</p>
        </div>
        <span class="pill mono">${name.slice(0,1)}</span>
      </div>
      <div class="panelActions">
        <button class="mini primary" data-open="${name}">Open</button>
      </div>
    `;
    folderGrid.appendChild(card);
  });

  folderGrid.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => openFolder(btn.getAttribute('data-open')));
  });
}

// ===== Render passwords in folder =====
function renderEntries(){
  const items = VAULT[currentFolder] || [];
  const q = (searchEl.value || '').trim().toLowerCase();

  // FIX: your data is {name,password} but old filter used {title,meta}
  const filtered = q
    ? items.filter(x => (`${x.name} ${x.password}`).toLowerCase().includes(q))
    : items;

  entryList.innerHTML = '';

  if(filtered.length === 0){
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((e) => {
    const row = document.createElement('div');
    row.className = 'entry';

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <span class="t mono copyable" style="min-width:120px; cursor:pointer;">${e.name}</span>
        <span class="m mono copyable" style="min-width:100px; cursor:pointer;">${e.password}</span>
      </div>
      <div class="entryActions">
        <button class="mini copy-btn" type="button" data-copy="user">Copy user</button>
        <button class="mini primary copy-btn" type="button" data-copy="pass">Copy pass</button>
      </div>
    `;
    entryList.appendChild(row);

    const nameSpan = row.querySelector('.t.copyable');
    const passSpan = row.querySelector('.m.copyable');

    // prevent double click selection
    nameSpan.addEventListener('mousedown', (ev) => { if(ev.detail === 2) ev.preventDefault(); });
    passSpan.addEventListener('mousedown', (ev) => { if(ev.detail === 2) ev.preventDefault(); });

    nameSpan.addEventListener('click', (ev) => {
      if(ev.detail === 2) return;
      navigator.clipboard.writeText(e.name);
      nameSpan.classList.add('flash-glow');
      setTimeout(() => nameSpan.classList.remove('flash-glow'), 350);
    });

    passSpan.addEventListener('click', (ev) => {
      if(ev.detail === 2) return;
      navigator.clipboard.writeText(e.password);
      passSpan.classList.add('flash-glow');
      setTimeout(() => passSpan.classList.remove('flash-glow'), 350);
    });

    // FIX: buttons previously had no listeners
    row.querySelectorAll('button[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.copy === 'user') {
          navigator.clipboard.writeText(e.name);
          nameSpan.classList.add('flash-glow');
          setTimeout(() => nameSpan.classList.remove('flash-glow'), 350);
        } else {
          navigator.clipboard.writeText(e.password);
          passSpan.classList.add('flash-glow');
          setTimeout(() => passSpan.classList.remove('flash-glow'), 350);
        }
      });
    });
  });
}

// ===== Navigation =====
function openFolder(name){
  currentFolder = name;
  setCrumbs(currentFolder);
  folderView.style.display = 'none';
  passwordView.style.display = 'block';
  searchEl.value = '';
  renderEntries();
  searchEl.focus();
}

function goBack(){
  currentFolder = null;
  setCrumbs(null);
  passwordView.style.display = 'none';
  folderView.style.display = 'block';
}

function showApp(user){
  currentUser = user;
  whoEl.textContent = user;

  pillEl.textContent = 'logged in';
  loginScreen.style.display = 'none';
  appScreen.style.display = 'block';

  setCrumbs(null);
  renderFolders();
  goBack();
  enableLockTimer();
}

function showLogin(){
  currentUser = null;
  currentFolder = null;

  pillEl.textContent = 'logged out';
  loginScreen.style.display = 'block';
  appScreen.style.display = 'none';

  pinEl.value = '';
  clearMsg();
  pinEl.focus();
  disableLockTimer();
}

// ===== Events =====
accountEl.addEventListener('input', () => { normalizeAccount(); clearMsg(); });
pinEl.addEventListener('input', () => { normalizePin(); clearMsg(); });

document.getElementById('loginBtn').addEventListener('click', () => {
  clearMsg();
  normalizeAccount();
  normalizePin();

  const acc = accountEl.value.trim().toUpperCase();
  const pin = pinEl.value.trim();

  if(!ACCOUNT_RE.test(acc)) return setError('Invalid Account ID. Use 1 letter + 8 digits (e.g. C12345678).');
  if(!PIN_RE.test(pin)) return setError('Invalid PIN. Use exactly 4 digits.');

  showApp(acc);
});

document.getElementById('genBtn').addEventListener('click', () => {
  accountEl.value = generateAccount('C');
  pinEl.value = '';
  clearMsg();
  pinEl.focus();
});

document.getElementById('logoutBtn').addEventListener('click', showLogin);
document.getElementById('backBtn').addEventListener('click', goBack);

searchEl.addEventListener('input', renderEntries);

document.getElementById('newFolderBtn').addEventListener('click', () => {
  const name = prompt('Folder name (e.g. WORK):');
  if(!name) return;
  const key = name.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'');
  if(!key) return;
  if(!VAULT[key]) VAULT[key] = [];
  renderFolders();
});

document.getElementById('newEntryBtn').addEventListener('click', () => {
  // FIX: your VAULT entries are {name,password}. Keep consistent.
  const name = prompt('Username / label:');
  if(!name) return;
  const password = prompt('Password:') || '';
  VAULT[currentFolder] = VAULT[currentFolder] || [];
  VAULT[currentFolder].push({ name: name.trim(), password: password.trim() });
  renderEntries();
  renderFolders();
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Enter' && loginScreen.style.display !== 'none'){
    document.getElementById('loginBtn').click();
  }
  if(e.key === 'Escape' && appScreen.style.display !== 'none'){
    if(passwordView.style.display !== 'none') goBack();
    else showLogin();
  }
});

// initial
showLogin();
