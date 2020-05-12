export default function setupMenu() {
  // menu windows
  document.querySelector('#stats-color').addEventListener('click', stats);
  document.querySelector('#controls-color').addEventListener('click', controls);
  document.querySelector('#env-color').addEventListener('click', envSelector);
}

function stats() {
  const s = document.getElementById('stats');
  if (s.classList.contains('hidden')) {
    // close other window
    document.getElementById('controls').classList.add('hidden');
    document.getElementById('env').classList.add('hidden');

    s.classList.remove('hidden');
  } else {
    s.classList.add('hidden');
  }
}

function controls() {
  const c = document.getElementById('controls');
  if (c.classList.contains('hidden')) {
    // close other window
    document.getElementById('stats').classList.add('hidden');
    document.getElementById('env').classList.add('hidden');

    c.classList.remove('hidden');
  } else {
    c.classList.add('hidden');
  }
}

function envSelector() {
  const e = document.getElementById('env');
  if (e.classList.contains('hidden')) {
    // close other window
    document.getElementById('stats').classList.add('hidden');
    document.getElementById('controls').classList.add('hidden');

    e.classList.remove('hidden');
  } else {
    e.classList.add('hidden');
  }
}
