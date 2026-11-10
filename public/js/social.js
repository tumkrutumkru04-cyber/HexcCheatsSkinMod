(() => {
  'use strict';

  window.fishCheckExport = async () => ({ ok: true });
  window.fishChargeExport = async () => {};

  const versions = ['android-normal', 'android-max', 'ios-normal', 'ios-max'];
  let saved;
  try { saved = localStorage.getItem('alok-current-version'); } catch {}
  window.currentAlokVersion = versions.includes(saved) ? saved : 'android-normal';

  const version = document.getElementById('version');
  if (version) version.value = window.currentAlokVersion;

  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('top-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('open')) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
