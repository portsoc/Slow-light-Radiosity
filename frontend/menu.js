function stats() {
  const s = document.getElementById('stats');
  if (s.style.display === 'none' || s.style.display === '') {
    s.style.display = 'block';
  } else {
    s.style.display = 'none';
  }
}

function controls() {
  const c = document.getElementById('controls');
  if (c.style.display === 'none' || c.style.display === '') {
    c.style.display = 'block';
  } else {
    c.style.display = 'none';
  }
}

function env() {
  const e = document.getElementById('env');
  if (e.style.display === 'none' || e.style.display === '') {
    e.style.display = 'block';
  } else {
    e.style.display = 'none';
  }
}
