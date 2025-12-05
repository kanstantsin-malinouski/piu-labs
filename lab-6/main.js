const api = new Ajax({
  baseURL: 'https://jsonplaceholder.typicode.com',
  timeout: 5000
});

const btnLoad = document.getElementById('btn-load');
const btnError = document.getElementById('btn-error');
const btnReset = document.getElementById('btn-reset');
const loader = document.getElementById('loader');
const errorBox = document.getElementById('errorBox');
const list = document.getElementById('list');

function showLoader(show) {
  if (show) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

function clearError() {
  errorBox.textContent = '';
  errorBox.classList.add('hidden');
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove('hidden');
}

function renderItems(items) {
  list.innerHTML = '';

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.style.animationDelay = `${index * 60}ms`;

    const title = document.createElement('div');
    title.className = 'list-item-title';
    title.textContent = item.title || '(bez tytułu)';

    const body = document.createElement('div');
    body.className = 'list-item-body';
    body.textContent = item.body || '';

    li.appendChild(title);
    li.appendChild(body);
    list.appendChild(li);
  });
}

btnLoad.addEventListener('click', async () => {
  clearError();
  showLoader(true);
  list.innerHTML = '';

  try {
    const data = await api.get('/posts?_limit=5');
    renderItems(data);
  } catch (err) {
    if (err instanceof TimeoutError) {
      showError('Błąd timeout: ' + err.message);
    } else if (err instanceof HttpError) {
      showError('Błąd HTTP: ' + err.message);
    } else {
      showError('Nieoczekiwany błąd: ' + (err.message || err));
    }
  } finally {
    showLoader(false);
  }
});

btnError.addEventListener('click', async () => {
  clearError();
  showLoader(true);

  try {
    await api.get('/zly-endpoint');
  } catch (err) {
    if (err instanceof TimeoutError) {
      showError('Błąd timeout: ' + err.message);
    } else if (err instanceof HttpError) {
      showError('Błąd HTTP: ' + err.message);
    } else {
      showError('Nieoczekiwany błąd: ' + (err.message || err));
    }
  } finally {
    showLoader(false);
  }
});

btnReset.addEventListener('click', () => {
  clearError();
  list.innerHTML = '';
});