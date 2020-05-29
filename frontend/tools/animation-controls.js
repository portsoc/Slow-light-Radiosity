import * as components from './basic-components.js';

const COMPONENT_CLASSNAME = 'animation-controls';

let maxTime;
let showCallback;

const el = {};

export function setup() {
  el.root = newDiv(document.body);

  const progressEl = newDiv(el.root, 'progress');
  newDiv(progressEl, 'buffer-bar');
  newDiv(progressEl, 'progress-bar');

  const buttonsEl = newDiv(el.root, 'buttons');
  const centerEl = newDiv(buttonsEl, 'center');
  const sideEl = newDiv(buttonsEl, 'side');

  el.toStartBtn = newIcon(centerEl, 'fas fa-fast-backward fa-fw', 'go to start');
  el.backBtn = newIcon(centerEl, 'fas fa-step-backward fa-fw', 'step back');
  el.playBtn = newIcon(centerEl, 'fas fa-play fa-fw', 'pause/resume');
  el.fwdBtn = newIcon(centerEl, 'fas fa-step-forward fa-fw', 'step forward');
  el.toEndBtn = newIcon(centerEl, 'fas fa-fast-forward fa-fw', 'go to end');

  el.backwardBtn = newIconToggle(sideEl, 'backward play', 'fas fa-exchange-alt fa-fw', 'switch direction of time');
  el.repeatBtn = newIconToggle(sideEl, 'repeat animation on finish', 'fas fa-sync-alt fa-fw', 'repeat on/off');

  el.backwardBtn.addEventListener('change', () => {
    el.playBtn.classList.toggle('fa-rotate-180', el.backwardBtn.value);
  });
}

export function setMaxTime(t) {
  maxTime = t;
  setProgressAmount(0);
  setBufferedPercent(0);
}

export function setShowCallback(f) {
  showCallback = f;
}

function setProgressAmount(value) {
  el.root.style.setProperty('--val-percent', `${value * 100 / maxTime}%`);
}

export function setBufferedPercent(percent) {
  el.root.style.setProperty('--buf-percent', `${percent}%`);
}

function newDiv(parent, subclass) {
  const className = subclass ? COMPONENT_CLASSNAME + '-' + subclass : COMPONENT_CLASSNAME;

  const el = document.createElement('div');
  parent.append(el);
  el.className = className;
  return el;
}

function newIcon(parent, className, title) {
  const el = document.createElement('i');
  parent.append(el);
  el.className = className;
  el.title = title;
  return el;
}

function newIconToggle(parent, name, className, title) {
  const toggle = new components.IconToggle(name, false);
  toggle.setupHtml(parent, className, title);
  return toggle;
}
