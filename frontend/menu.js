function stats() {
  const s = document.getElementById('stats');
  if (s.style.display === 'none' || s.style.display === '') {
    s.style.display = 'block';
  } else {
    s.style.display = 'none';
  }
}
