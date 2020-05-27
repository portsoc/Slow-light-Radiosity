const elements = new Map();

export function setup(rootEl = document.querySelector('#stats')) {
  for (const el of rootEl.children) {
    if (el.dataset.stat) {
      const targetEl = el.querySelector('.stat-target') || el;
      elements.set(el.dataset.stat, targetEl);
    }
  }
}

export function set(key, value) {
  const targetEl = elements.get(key);

  if (!targetEl) {
    console.warn(`stats asked to show unknown key ${key} with value ${value}`);
    return;
  }

  targetEl.textContent = value;
}
