export function setup(menuEl = document.querySelector('#menu')) {
  for (const item of menuEl.children) {
    item.addEventListener('click', (e) => openItem(item, menuEl, e));
  }
}

function openItem(item, menuEl, e) {
  if (isEventInsideMenuWindow(e)) return;

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

function isEventInsideMenuWindow(e) {
  let target = e.target;
  while (target !== e.currentTarget && !target.classList.contains('window')) {
    target = target.parentElement;
  }

  return target.classList.contains('window');
}
