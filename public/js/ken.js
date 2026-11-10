(() => {
  const CATALOG_URL = './ken-catalog.json?v=1';
  const STORE_KEY = 'hexcheats-ken-v1';
  const SLOTS = [
    { id: 'HAIR', label: 'Hair', icon: 'hair' },
    { id: 'MASK', label: 'Mask', icon: 'mask' },
    { id: 'TOP', label: 'Top', icon: 'top' },
    { id: 'BOTTOM', label: 'Bottom', icon: 'bottom' },
    { id: 'SHOES', label: 'Shoes', icon: 'shoes' },
    { id: 'MAKEUP', label: 'Makeup', icon: 'face' },
  ];
  const $ = id => document.getElementById(id);
  const state = { catalog: null, charId: null, version: 'ADR_NORMAL', byChar: {} };
  let pickerOpen = false;

  const readStore = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORE_KEY));
      return value && typeof value === 'object' ? value : {};
    } catch { return {}; }
  };
  const writeStore = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ charId: state.charId, version: state.version, byChar: state.byChar })); } catch {}
  };
  const character = () => state.catalog?.characters.find(item => item.id === state.charId) || null;
  const countItems = char => SLOTS.reduce((sum, slot) => sum + (char.slots[slot.id]?.length || 0), 0);
  const itemById = (char, slot, id) => char.slots[slot]?.find(item => item.id === id) || null;

  function ensureSelection(char) {
    if (!state.byChar[char.id]) state.byChar[char.id] = {};
    const selected = state.byChar[char.id];
    for (const slot of SLOTS) {
      const items = char.slots[slot.id] || [];
      if (!items.length) { delete selected[slot.id]; continue; }
      if (!items.some(item => item.id === selected[slot.id])) selected[slot.id] = items[0].id;
    }
  }

  function renderCharacters() {
    const rail = $('ken-characters');
    rail.replaceChildren();
    for (const char of state.catalog.characters) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ken-character' + (char.id === state.charId ? ' is-active' : '');
      card.setAttribute('aria-pressed', char.id === state.charId ? 'true' : 'false');
      const avatar = document.createElement('img');
      avatar.src = './' + char.avatar;
      avatar.alt = '';
      avatar.loading = 'lazy';
      const text = document.createElement('span');
      const name = document.createElement('strong');
      name.textContent = char.name;
      const meta = document.createElement('small');
      meta.textContent = `${char.gender === 'FEMALE' ? 'Female' : 'Male'} · ${countItems(char)} items${char.hasVfx ? ' · VFX' : ''}`;
      text.append(name, meta);
      card.append(avatar, text);
      card.addEventListener('click', () => selectCharacter(char.id));
      rail.appendChild(card);
    }
  }

  function renderSlots(char) {
    const list = $('ken-slots');
    list.replaceChildren();
    const selected = state.byChar[char.id];
    for (const slot of SLOTS) {
      const items = char.slots[slot.id] || [];
      const row = document.createElement('div');
      row.className = 'pick-row';
      const label = document.createElement('label');
      label.textContent = slot.label;
      const ico = document.createElement('span');
      ico.className = 'pick-ico';
      const icoImg = document.createElement('img');
      icoImg.src = './assets/category-icons/' + slot.icon + '.webp';
      icoImg.alt = '';
      ico.append(icoImg);
      label.prepend(ico);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'item-picker-button';
      button.disabled = !items.length;
      const thumb = document.createElement('img');
      thumb.alt = '';
      const name = document.createElement('span');
      const chosen = itemById(char, slot.id, selected[slot.id]);
      if (chosen) {
        thumb.src = './' + chosen.icon;
        name.textContent = chosen.name;
      } else {
        thumb.src = './assets/category-icons/' + slot.icon + '.webp';
        name.textContent = items.length ? 'Choose ' + slot.label.toLowerCase() : 'Not available';
      }
      button.append(thumb, name);
      if (items.length) button.addEventListener('click', () => openPicker(slot, char));
      row.append(label, button);
      list.appendChild(row);
    }
  }

  function renderMoodboard(char) {
    const board = $('ken-moodboard');
    board.replaceChildren();
    const selected = state.byChar[char.id];
    let shown = 0;
    for (const slot of SLOTS) {
      const item = itemById(char, slot.id, selected[slot.id]);
      if (!item) continue;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'ken-tile';
      const img = document.createElement('img');
      img.src = './' + item.icon;
      img.alt = item.name;
      img.loading = 'lazy';
      const name = document.createElement('span');
      name.textContent = item.name;
      const meta = document.createElement('small');
      meta.textContent = slot.label + (item.tier ? ' · ' + item.tier : '');
      tile.append(img, name, meta);
      tile.addEventListener('click', () => openPicker(slot, char));
      board.appendChild(tile);
      shown++;
    }
    if (!shown) {
      const empty = document.createElement('p');
      empty.className = 'ken-empty';
      empty.textContent = 'Nothing selected yet. Pick a slot to start the fit.';
      board.appendChild(empty);
    }
    $('ken-count').textContent = shown + ' ITEMS';
    $('ken-summary').textContent = SLOTS.map(slot => {
      const item = itemById(char, slot.id, selected[slot.id]);
      return item ? `${slot.label}: ${item.name}` : null;
    }).filter(Boolean).join('  ·  ');
  }

  function renderBuilder() {
    const char = character();
    if (!char) return;
    $('ken-loading').hidden = true;
    $('ken-builder').hidden = false;
    const avatar = $('ken-avatar');
    avatar.src = './' + char.avatar;
    avatar.alt = char.name;
    $('ken-name').textContent = char.name.toUpperCase();
    $('ken-meta').textContent = `${char.gender === 'FEMALE' ? 'Female' : 'Male'} · ${countItems(char)} catalogue items${char.hasVfx ? ' · VFX supported upstream' : ''}`;
    $('ken-version').value = state.version;
    renderSlots(char);
    renderMoodboard(char);
  }

  function selectCharacter(id) {
    if (!state.catalog) return;
    const char = state.catalog.characters.find(item => item.id === id);
    if (!char) return;
    state.charId = id;
    ensureSelection(char);
    writeStore();
    renderCharacters();
    renderBuilder();
  }

  function closePicker() {
    const modal = document.getElementById('ken-picker');
    if (modal) modal.remove();
    document.body.classList.remove('picker-open');
    pickerOpen = false;
  }

  function openPicker(slot, char) {
    if (pickerOpen) closePicker();
    pickerOpen = true;
    const selected = state.byChar[char.id];
    const modal = document.createElement('div');
    modal.id = 'ken-picker';
    modal.className = 'picker-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Choose ' + slot.label);
    modal.innerHTML = `
      <div class="picker-panel">
        <div class="picker-head">
          <div><span class="picker-kicker">KEN MOD Z · ${char.name}</span><strong>${slot.label}</strong></div>
          <div class="ken-picker-actions"><button class="ken-clear-slot" type="button">CLEAR</button><button class="picker-close" type="button" aria-label="Close">×</button></div>
        </div>
        <label class="picker-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search ${slot.label.toLowerCase()}…" autocomplete="off"></label>
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
      for (const item of char.slots[slot.id] || []) {
        if (query && !item.name.toLowerCase().includes(query)) continue;
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'picker-card' + (selected[slot.id] === item.id ? ' is-selected' : '');
        card.setAttribute('role', 'option');
        card.setAttribute('aria-selected', selected[slot.id] === item.id ? 'true' : 'false');
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.src = './' + item.icon;
        const name = document.createElement('span');
        name.textContent = item.name;
        if (item.tier) {
          const dot = document.createElement('i');
          dot.className = 'tier tier-' + item.tier;
          card.append(img, name, dot);
        } else {
          card.append(img, name);
        }
        card.addEventListener('click', () => {
          selected[slot.id] = item.id;
          writeStore();
          renderSlots(char);
          renderMoodboard(char);
          closePicker();
        });
        grid.appendChild(card);
        shown++;
      }
      if (!shown) {
        const empty = document.createElement('p');
        empty.className = 'picker-empty';
        empty.textContent = 'No matching items.';
        grid.appendChild(empty);
      }
    };
    search.addEventListener('input', build);
    modal.querySelector('.picker-close').addEventListener('click', closePicker);
    modal.querySelector('.ken-clear-slot').addEventListener('click', () => {
      delete selected[slot.id];
      writeStore();
      renderSlots(char);
      renderMoodboard(char);
      closePicker();
    });
    modal.addEventListener('click', event => { if (event.target === modal) closePicker(); });
    document.addEventListener('keydown', function onKey(event) {
      if (event.key === 'Escape') { closePicker(); document.removeEventListener('keydown', onKey); }
    });
    build();
    search.focus();
  }

  async function boot() {
    const loading = $('ken-loading');
    try {
      const response = await fetch(CATALOG_URL, { cache: 'default' });
      if (!response.ok) throw new Error(String(response.status));
      state.catalog = await response.json();
    } catch (error) {
      if (loading) loading.textContent = 'Could not load the Ken Mod Z catalogue. Reload the page.';
      return;
    }
    const saved = readStore();
    state.version = saved.version || state.catalog.versions[0].id;
    state.byChar = saved.byChar && typeof saved.byChar === 'object' ? saved.byChar : {};
    const initial = state.catalog.characters.some(char => char.id === saved.charId) ? saved.charId : state.catalog.characters[0].id;
    state.charId = initial;
    ensureSelection(character());
    renderCharacters();
    renderBuilder();
    $('ken-version').addEventListener('change', event => {
      state.version = event.target.value;
      writeStore();
    });
    $('ken-random').addEventListener('click', () => {
      const char = character();
      const selected = state.byChar[char.id];
      for (const slot of SLOTS) {
        const items = char.slots[slot.id] || [];
        if (items.length) selected[slot.id] = items[Math.floor(Math.random() * items.length)].id;
      }
      writeStore();
      renderSlots(char);
      renderMoodboard(char);
    });
    $('ken-clear').addEventListener('click', () => {
      const char = character();
      state.byChar[char.id] = {};
      writeStore();
      renderSlots(char);
      renderMoodboard(char);
    });
  }

  boot();
})();
