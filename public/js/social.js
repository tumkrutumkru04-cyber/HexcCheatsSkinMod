(() => {
  'use strict';
  const versions = ['android-normal', 'android-max', 'ios-normal', 'ios-max'];
  const cookieRead = name => { const row = document.cookie.split('; ').find(item => item.startsWith(name + '=')); return row ? decodeURIComponent(row.slice(name.length + 1)) : ''; };
  const cookieWrite = (name, value, maxAge = 31536000) => { document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`; };
  let saved;
  try { saved = localStorage.getItem('alok-current-version') || cookieRead('hex_ui_version'); } catch { saved = cookieRead('hex_ui_version'); }
  window.currentAlokVersion = versions.includes(saved) ? saved : 'android-normal';
  const version = document.getElementById('version');
  if (version) version.value = window.currentAlokVersion;

  const versionMeta = {
    'android-normal': { label: 'Android · FF Standard', platform: './assets/platform/android.svg', game: './assets/official/free-fire-app-icon.jpg' },
    'android-max': { label: 'Android · FF MAX', platform: './assets/platform/android.svg', game: './assets/official/free-fire-max-app-icon.jpg' },
    'ios-normal': { label: 'iOS · FF Standard', platform: './assets/platform/apple.svg', game: './assets/official/free-fire-app-icon.jpg' },
    'ios-max': { label: 'iOS · FF MAX', platform: './assets/platform/apple.svg', game: './assets/official/free-fire-max-app-icon.jpg' },
  };

  const modal = document.getElementById('unlock-modal');
  const card = modal?.querySelector('.unlock-card');
  const modalTitle = document.getElementById('unlock-title');
  const modalCopy = document.getElementById('unlock-copy');
  const modalKicker = document.getElementById('unlock-kicker');
  const continueButton = document.getElementById('unlock-continue');
  const setStep = (n, state = 'active') => {
    for (let i = 1; i <= 3; i++) { const el = document.getElementById(`unlock-step-${i}`); if (el) el.classList.toggle('is-active', i === n && state !== 'done'), el.classList.toggle('is-done', i < n || (i === n && state === 'done')); }
  };
  const showModal = () => { if (modal) modal.hidden = false; };
  const hideModal = () => { if (modal) modal.hidden = true; };
  const showProtocol = () => {
    if (!modal) return;
    card.classList.remove('is-success'); modalKicker.textContent = 'SECURE EXPORT PROTOCOL'; modalTitle.textContent = 'Complete the VIPLINK task'; modalCopy.textContent = 'Complete the task to unlock downloads. No ZIP file will be generated before access is confirmed.'; continueButton.hidden = true; setStep(1); showModal();
  };
  const showSuccess = (expiresIn = 86400) => {
    if (!modal) return;
    const hours = Math.max(1, Math.ceil(expiresIn / 3600));
    card.classList.add('is-success'); modalKicker.textContent = 'ACCESS CONFIRMED'; modalTitle.textContent = 'Downloads unlocked'; modalCopy.textContent = `Your browser has unlimited download access for the next ${hours} hours.`; setStep(3, 'done'); continueButton.hidden = false; showModal();
  };
  const showError = message => { if (!modal) return; card.classList.remove('is-success'); modalKicker.textContent = 'VERIFICATION ERROR'; modalTitle.textContent = 'Task link unavailable'; modalCopy.textContent = message; continueButton.hidden = false; continueButton.textContent = 'CLOSE'; showModal(); };
  window.showUnlockProtocol = showProtocol;
  document.getElementById('unlock-close')?.addEventListener('click', hideModal);
  continueButton?.addEventListener('click', () => { hideModal(); continueButton.textContent = 'CONTINUE TO STUDIO'; });

  const updateAccessPill = data => {
    const pill = document.getElementById('access-pill'); if (!pill) return;
    pill.classList.toggle('unlocked', Boolean(data.unlocked)); pill.classList.toggle('locked', !data.unlocked);
    pill.textContent = data.unlocked ? `ACCESS UNLOCKED · ${Math.max(1, Math.ceil((data.expiresIn || 0) / 3600))}H` : 'ACCESS LOCKED';
  };
  const refreshAccess = async () => { try { const data = await fetch('/api/access-status', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()); updateAccessPill(data); return data; } catch { return { unlocked: false, expiresIn: 0 }; } };

  function mountVersionPicker() {
    if (!version || version.dataset.customPicker) return;
    version.dataset.customPicker = 'true';
    const wrap = version.closest('.version-wrap'); const picker = document.createElement('div'); picker.className = 'version-picker';
    picker.innerHTML = '<button class="version-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false"></button><div class="version-picker-menu" role="listbox"></div>';
    wrap.append(picker); const button = picker.querySelector('.version-picker-button'); const menu = picker.querySelector('.version-picker-menu');
    const render = () => { const current = versionMeta[version.value] || versionMeta['android-normal']; button.innerHTML = `<img class="version-platform-icon" src="${current.platform}" alt=""><img class="version-game-icon" src="${current.game}" alt=""><span>${current.label}</span><i aria-hidden="true"></i>`; menu.replaceChildren(); Object.entries(versionMeta).forEach(([value, meta]) => { const option = document.createElement('button'); option.type = 'button'; option.className = 'version-option' + (value === version.value ? ' is-selected' : ''); option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(value === version.value)); option.innerHTML = `<img class="version-platform-icon" src="${meta.platform}" alt=""><img class="version-game-icon" src="${meta.game}" alt=""><span>${meta.label}</span>`; option.addEventListener('click', () => { version.value = value; window.currentAlokVersion = value; cookieWrite('hex_ui_version', value); try { localStorage.setItem('alok-current-version', value); } catch {} version.dispatchEvent(new Event('change', { bubbles: true })); picker.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); }); menu.append(option); }); };
    button.addEventListener('click', () => { const open = picker.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', event => { if (!picker.contains(event.target)) { picker.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); } });
    version.addEventListener('change', render); render();
  }
  mountVersionPicker();

  window.fishCheckExport = async () => {
    showProtocol();
    const accessStatus = await refreshAccess();
    if (accessStatus.unlocked) { hideModal(); return { ok: true }; }
    try {
      const response = await fetch('/api/unlock/start', { credentials: 'same-origin', cache: 'no-store' }); const data = await response.json();
      if (!response.ok || !data.shortUrl) throw new Error(data.error || 'Could not create the VIPLINK task link.');
      setStep(1, 'done'); setStep(2); modalCopy.textContent = 'Complete the task in the next tab. Return here afterward to confirm your 24-hour download access.';
      await new Promise(resolve => setTimeout(resolve, 900)); window.location.assign(data.shortUrl); throw new DOMException('Verification required', 'AbortError');
    } catch (error) { if (error.name === 'AbortError') throw error; showError(error.message); throw error; }
  };
  window.fishChargeExport = async () => {};

  const toggle = document.getElementById('menu-toggle'); const nav = document.getElementById('top-nav');
  if (toggle && nav) { toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); }); nav.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } }); document.addEventListener('click', event => { if (nav.classList.contains('open') && !nav.contains(event.target) && !toggle.contains(event.target)) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } }); }

  const params = new URLSearchParams(window.location.search);
  refreshAccess().then(data => { if (params.get('unlocked') === '1' && data.unlocked) { showSuccess(data.expiresIn); const status = document.getElementById('status'); if (status) { status.classList.remove('error'); status.textContent = 'ACCESS UNLOCKED — your 24-hour browser download pass is active.'; } window.history.replaceState({}, '', window.location.pathname + '#studio'); } });
  const year = document.getElementById('year'); if (year) year.textContent = String(new Date().getFullYear());
})();
