export default function setupMenu() {
  // menu windows
  document.querySelector('#stats-color').addEventListener('click', stats);
  document.querySelector('#controls-color').addEventListener('click', controls);
  document.querySelector('#env-color').addEventListener('click', envSelector);
  document.querySelector('#settings-color').addEventListener('click', settings);
}

function stats() {
  const s = document.getElementById('stats');
  if (s.classList.contains('hidden')) {
    hideWindows();
    s.classList.remove('hidden');
  } else {
    s.classList.add('hidden');
  }
}

function controls() {
  const c = document.getElementById('controls');
  if (c.classList.contains('hidden')) {
    hideWindows();
    c.classList.remove('hidden');
  } else {
    c.classList.add('hidden');
  }
}

function envSelector() {
  const e = document.getElementById('env');
  if (e.classList.contains('hidden')) {
    hideWindows();
    e.classList.remove('hidden');
  } else {
    e.classList.add('hidden');
  }
}

function settings() {
  const s = document.getElementById('settings');
  if (s.classList.contains('hidden')) {
    hideWindows();
    s.classList.remove('hidden');
  } else {
    s.classList.add('hidden');
  }
}

function hideWindows() {
  for (const e of document.getElementsByClassName('window')) {
    e.classList.add('hidden');
  }
}
