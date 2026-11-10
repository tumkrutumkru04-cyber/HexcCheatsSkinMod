(() => {
  'use strict';
  const versions = ['android-normal', 'android-max', 'ios-normal', 'ios-max'];
  let saved;
  try { saved = localStorage.getItem('alok-current-version'); } catch {}
  window.currentAlokVersion = versions.includes(saved) ? saved : 'android-normal';
  const version = document.getElementById('version');
  if (version) version.value = window.currentAlokVersion;

  window.fishCheckExport = async () => {
    const accessStatus = await fetch('/api/access-status', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json());
    if (accessStatus.unlocked) return { ok: true };
    const response = await fetch('/api/unlock/start', { credentials: 'same-origin', cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || !data.shortUrl) throw new Error(data.error || 'Could not create the verification link.');
    const statusEl = document.getElementById('status');
    if (statusEl) { statusEl.classList.remove('error'); statusEl.textContent = 'VERIFICATION PROTOCOL ACTIVE — opening the task…'; }
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
