(function () {
  const STORAGE_KEY = 'kanbanLab4_v1';

  function randomColor() {
    const h = Math.floor(Math.random() * 360);
    const s = 70 + Math.floor(Math.random() * 20); 
    const l = 45 + Math.floor(Math.random() * 10); 
    return `hsl(${h} ${s}% ${l}%)`;
  }

  function uid() {
    return 'k_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  }

  const defaultState = {
    columns: {
      todo: [],
      doing: [],
      done: [],
    },
    sorts: {
      todo: 'created_desc',
      doing: 'created_desc',
      done: 'created_desc',
    }
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);
      return {
        columns: { ...defaultState.columns, ...(parsed.columns || {}) },
        sorts: { ...defaultState.sorts, ...(parsed.sorts || {}) }
      };
    } catch {
      return structuredClone(defaultState);
    }
  }
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  const boardEl = document.getElementById('board');

  function render() {
    ['todo', 'doing', 'done'].forEach(col => {
      const listEl = document.querySelector(`.cards[data-list="${col}"]`);
      listEl.innerHTML = '';

      const items = sortCards(state.columns[col], state.sorts[col]);
      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.textContent = 'Brak kart';
        listEl.appendChild(empty);
      } else {
        items.forEach(card => listEl.appendChild(renderCard(card, col)));
      }

      const counterEl = document.querySelector(`[data-counter="${col}"]`);
      counterEl.textContent = items.length;
      const select = document.querySelector(`select[data-action="sort"][data-col="${col}"]`);
      if (select) select.value = state.sorts[col];
    });
  }

  function renderCard(card, column) {
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = card.id;
    el.dataset.column = column;
    el.style.background = card.color;

    el.innerHTML = `
      <div class="card__top">
        <div class="card__title" contenteditable="true" data-field="title">${escapeHTML(card.title || 'Nowa karta')}</div>
        <div class="card__controls">
          <button class="cbtn cbtn--left" data-action="move-left" title="Przenieś w lewo">←</button>
          <button class="cbtn cbtn--right" data-action="move-right" title="Przenieś w prawo">→</button>
          <button class="cbtn cbtn--paint" data-action="paint" title="Zmień kolor">🎨</button>
          <button class="cbtn cbtn--del" data-action="delete" title="Usuń">×</button>
        </div>
      </div>
      <div class="card__body" contenteditable="true" data-field="body">${escapeHTML(card.body || '')}</div>
    `;

    return el;
  }

  function sortCards(items, mode) {
    const arr = [...items];
    switch (mode) {
      case 'created_asc':
        arr.sort((a, b) => a.createdAt - b.createdAt); break;
      case 'title_asc':
        arr.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'pl', { sensitivity: 'base' })); break;
      case 'title_desc':
        arr.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'pl', { sensitivity: 'base' })); break;
      case 'created_desc':
      default:
        arr.sort((a, b) => b.createdAt - a.createdAt); break;
    }
    return arr;
  }

  function escapeHTML(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  function addCard(column) {
    const card = {
      id: uid(),
      title: 'Nowa karta',
      body: '',
      color: randomColor(),
      createdAt: Date.now()
    };
    state.columns[column].push(card);
    saveState();
    render();
  }

  function deleteCard(id) {
    for (const col of ['todo', 'doing', 'done']) {
      const idx = state.columns[col].findIndex(c => c.id === id);
      if (idx !== -1) {
        state.columns[col].splice(idx, 1);
        break;
      }
    }
    saveState();
    render();
  }

  function paintCard(id) {
    const card = findCard(id);
    if (!card) return;
    card.color = randomColor();
    saveState();
    render();
  }

  function paintColumn(column) {
    state.columns[column].forEach(c => c.color = randomColor());
    saveState();
    render();
  }

  function findCard(id) {
    for (const col of ['todo', 'doing', 'done']) {
      const card = state.columns[col].find(c => c.id === id);
      if (card) return card;
    }
    return null;
  }
  function findCardWithColumn(id) {
    for (const col of ['todo', 'doing', 'done']) {
      const idx = state.columns[col].findIndex(c => c.id === id);
      if (idx !== -1) return { col, idx, card: state.columns[col][idx] };
    }
    return null;
  }

  function moveCard(id, dir) {
    const found = findCardWithColumn(id);
    if (!found) return;
    const order = ['todo', 'doing', 'done'];
    const fromIdx = order.indexOf(found.col);
    const toIdx = dir === 'left' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= order.length) return; 
    const [card] = state.columns[found.col].splice(found.idx, 1);
    state.columns[order[toIdx]].unshift(card);
    saveState();
    render();
  }

  function updateEditable(cardId, field, newValue) {
    const card = findCard(cardId);
    if (!card) return;
    const trimmed = newValue.replace(/\s+$/,''); 
    if (field === 'title') card.title = trimmed;
    else if (field === 'body') card.body = newValue;
    saveState();
  }

  boardEl.addEventListener('click', (e) => {
    const t = e.target;

    if (t.matches('button[data-action="add"]')) {
      addCard(t.dataset.col);
      return;
    }
    if (t.matches('button[data-action="colorize"]')) {
      paintColumn(t.dataset.col);
      return;
    }

    if (t.matches('.cbtn[data-action="delete"]')) {
      const cardEl = t.closest('.card');
      deleteCard(cardEl.dataset.id);
      return;
    }
    if (t.matches('.cbtn[data-action="paint"]')) {
      const cardEl = t.closest('.card');
      paintCard(cardEl.dataset.id);
      return;
    }
    if (t.matches('.cbtn[data-action="move-left"]')) {
      const cardEl = t.closest('.card');
      moveCard(cardEl.dataset.id, 'left');
      return;
    }
    if (t.matches('.cbtn[data-action="move-right"]')) {
      const cardEl = t.closest('.card');
      moveCard(cardEl.dataset.id, 'right');
      return;
    }
  });

  boardEl.addEventListener('change', (e) => {
    const t = e.target;
    if (t.matches('select[data-action="sort"]')) {
      const col = t.dataset.col;
      state.sorts[col] = t.value;
      saveState();
      render();
    }
  });

  boardEl.addEventListener('input', (e) => {
    const el = e.target;
    if (el.matches('[data-field]')) {
      const cardEl = el.closest('.card');
      updateEditable(cardEl.dataset.id, el.dataset.field, el.innerText);
    }
  });
  boardEl.addEventListener('blur', (e) => {
    const el = e.target;
    if (el.matches('[data-field]')) {
      el.innerText = el.innerText; 
    }
  }, true);

  render();

})();
