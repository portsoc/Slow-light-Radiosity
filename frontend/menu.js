export default function setupMenu(menuEl = document.querySelector('#menu')) {
  for (const item of menuEl.children) {
    item.addEventListener('click', () => openItem(item, menuEl));
  }
}

function openItem(item, menuEl) {
  const wasOpen = item.classList.contains('selected');

  // close all items
  for (const el of menuEl.children) {
    el.classList.remove('selected');
  }

  // open (or close) the given item
  if (!wasOpen) {
    item.classList.add('selected');
  }
}
