(() => {
  'use strict';
  const versions = ['android-normal', 'android-max', 'ios-normal', 'ios-max'];
  let saved;
  try { saved = localStorage.getItem('alok-current-version'); } catch {}
  window.currentAlokVersion = versions.includes(saved) ? saved : 'android-normal';
  const version = document.getElementById('version');
  if (version) version.value = window.currentAlokVersion;

  const versionMeta = {
    'android-normal': { label: 'Android · FF Standard', platform: './assets/platform/android.svg', game: './assets/official/free-fire-app-icon.jpg', alt: 'Android and Free Fire' },
    'android-max': { label: 'Android · FF MAX', platform: './assets/platform/android.svg', game: './assets/official/free-fire-max-app-icon.jpg', alt: 'Android and Free Fire MAX' },
    'ios-normal': { label: 'iOS · FF Standard', platform: './assets/platform/apple.svg', game: './assets/official/free-fire-app-icon.jpg', alt: 'iOS and Free Fire' },
    'ios-max': { label: 'iOS · FF MAX', platform: './assets/platform/apple.svg', game: './assets/official/free-fire-max-app-icon.jpg', alt: 'iOS and Free Fire MAX' },
  };
  function mountVersionPicker() {
    if (!version || version.dataset.customPicker) return;
    version.dataset.customPicker = 'true';
    const wrap = version.closest('.version-wrap');
    const picker = document.createElement('div');
    picker.className = 'version-picker';
    picker.innerHTML = '<button class="version-picker-button" type="button" aria-haspopup="listbox" aria-expanded="false"></button><div class="version-picker-menu" role="listbox"></div>';
    wrap.append(picker);
    const button = picker.querySelector('.version-picker-button');
    const menu = picker.querySelector('.version-picker-menu');
    const render = () => {
      const current = versionMeta[version.value] || versionMeta['android-normal'];
      button.innerHTML = `<img class="version-platform-icon" src="${current.platform}" alt=""><img class="version-game-icon" src="${current.game}" alt=""><span>${current.label}</span><i aria-hidden="true"></i>`;
      menu.replaceChildren();
      Object.entries(versionMeta).forEach(([value, meta]) => {
        const option = document.createElement('button');
        option.type = 'button'; option.className = 'version-option' + (value === version.value ? ' is-selected' : ''); option.setAttribute('role', 'option'); option.setAttribute('aria-selected', String(value === version.value));
        option.innerHTML = `<img class="version-platform-icon" src="${meta.platform}" alt=""><img class="version-game-icon" src="${meta.game}" alt=""><span>${meta.label}</span>`;
        option.addEventListener('click', () => { version.value = value; window.currentAlokVersion = value; try { localStorage.setItem('alok-current-version', value); } catch {} version.dispatchEvent(new Event('change', { bubbles: true })); picker.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); });
        menu.append(option);
      });
    };
    button.addEventListener('click', () => { const open = picker.classList.toggle('is-open'); button.setAttribute('aria-expanded', String(open)); });
    document.addEventListener('click', event => { if (!picker.contains(event.target)) { picker.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); } });
    version.addEventListener('change', render);
    render();
  }
  mountVersionPicker();

  window.fishCheckExport = async () => {
    const accessStatus = await fetch('/api/access-status', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json());
    if (accessStatus.unlocked) return { ok: true };
    const response = await fetch('/api/unlock/start', { credentials: 'same-origin', cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.shortUrl) throw new Error(data.error || 'Could not create the verification link.');
    const statusEl = document.getElementById('status');
    if (statusEl) { statusEl.classList.remove('error'); statusEl.textContent = 'COMPLETE THE VIPLINK TASK — no ZIP has been generated. Opening secure verification…'; }
    await new Promise(resolve => setTimeout(resolve, 850));
    window.location.assign(data.shortUrl);
    throw new DOMException('Verification required', 'AbortError');
  };
  window.fishChargeExport = async () => {};

  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('top-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('open') || nav.contains(event.target) || toggle.contains(event.target)) return;
      nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
    });
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('unlocked') === '1') {
    const status = document.getElementById('status');
    if (status) { status.classList.remove('error'); status.textContent = 'DOWNLOADS UNLOCKED — unlimited browser exports are active for 24 hours.'; }
    window.history.replaceState({}, '', window.location.pathname + '#studio');
  }
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
