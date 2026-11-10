(() => {
  const slots = ['hair', 'top', 'bottom', 'shoes', 'mask', 'face', 'action'];
  const labels = { hair: 'Hair', top: 'Top', bottom: 'Bottom', shoes: 'Shoes', mask: 'Mask', face: 'Face', action: 'Action' };
  let ready = false;
  let activeSelect = null;
  const iconFor = (select, id) => {
    const fallback = './assets/category-icons/' + select.id + '.webp';
    if (!id || id.endsWith('-default')) return fallback;
    return './assets/item-icons/' + id + '.webp';
  };
  const fallbackFor = (select) => './assets/category-icons/' + select.id + '.webp';
  const currentOption = (select) => select.options[select.selectedIndex];

  function sync(select) {
    const wrap = select.closest('.select-wrap');
    if (!wrap) return;
    let trigger = wrap.querySelector('.pick-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'pick-trigger';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.innerHTML = '<img class="pick-thumb" alt=""><span class="pick-name"></span><span class="pick-arrow" aria-hidden="true"></span>';
      wrap.appendChild(trigger);
      select.classList.add('select-hidden');
      trigger.addEventListener('click', () => open(select));
    }
    const option = currentOption(select);
    const img = trigger.querySelector('.pick-thumb');
    const name = trigger.querySelector('.pick-name');
    name.textContent = option ? option.textContent : 'Loading…';
    const src = option && option.dataset.itemId ? iconFor(select, option.dataset.itemId) : fallbackFor(select);
    if (img.getAttribute('src') !== src) {
      img.onerror = () => { img.onerror = null; img.src = fallbackFor(select); };
      img.src = src;
    }
  }

  function refreshAll() {
    for (const id of slots) {
      const select = document.getElementById(id);
      if (select && select.options.length) sync(select);
    }
  }

  function close() {
    const modal = document.getElementById('item-picker');
    if (modal) modal.remove();
    activeSelect = null;
    document.body.classList.remove('picker-open');
  }

  function open(select) {
    close();
    activeSelect = select;
    const modal = document.createElement('div');
    modal.id = 'item-picker';
    modal.className = 'picker-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', labels[select.id] || 'Choose item');
    modal.innerHTML = `
      <div class="picker-panel">
        <div class="picker-head">
          <div><span class="picker-kicker">CHOOSE</span><strong>${labels[select.id] || 'Item'}</strong></div>
          <button class="picker-close" type="button" aria-label="Close">×</button>
        </div>
        <label class="picker-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search ${labels[select.id] || 'items'}…" autocomplete="off"></label>
        <div class="picker-grid" role="listbox"></div>
      </div>`;
    document.body.appendChild(modal);
    document.body.classList.add('picker-open');
    const grid = modal.querySelector('.picker-grid');
    const search = modal.querySelector('input');
    const build = () => {
      const query = search.value.trim().toLowerCase();
      grid.replaceChildren();
      let shown = 0;
      [...select.options].forEach((option) => {
        const name = option.textContent || '';
        if (query && !name.toLowerCase().includes(query) && !(option.dataset.itemId || '').includes(query)) return;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'picker-card' + (option.selected ? ' is-selected' : '');
        card.setAttribute('role', 'option');
        card.setAttribute('aria-selected', option.selected ? 'true' : 'false');
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.onerror = () => { img.onerror = null; img.src = fallbackFor(select); };
        img.src = iconFor(select, option.dataset.itemId);
        const label = document.createElement('span');
        label.textContent = name;
        card.append(img, label);
        card.addEventListener('click', () => {
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          sync(select);
          close();
        });
        grid.appendChild(card);
        shown++;
      });
      if (!shown) {
        const empty = document.createElement('p');
        empty.className = 'picker-empty';
        empty.textContent = 'No matching items.';
        grid.appendChild(empty);
      }
    };
    search.addEventListener('input', build);
    modal.querySelector('.picker-close').addEventListener('click', close);
    modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
    document.addEventListener('keydown', function onKey(event) {
      if (event.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
    });
    build();
    search.focus();
  }

  function boot() {
    if (ready) { refreshAll(); return; }
    const select = document.getElementById('hair');
    if (!select || !select.options.length) return;
    ready = true;
    for (const id of slots) {
      const el = document.getElementById(id);
      if (!el) continue;
      sync(el);
      el.addEventListener('change', () => sync(el));
      new MutationObserver(() => sync(el)).observe(el, { childList: true });
    }
  }

  setInterval(boot, 350);
  window.addEventListener('wardrobe-change', refreshAll);
})();
