import * as components from './basic-components.js';

const COMPONENT_CLASSNAME = 'animation-controls';

let currTime = 0;
let maxTimeInclusive = 1;
let showCallback;

export const playing = new components.IconToggle('play/pause', false);
export const repeating = new components.IconToggle('repeat animation on finish', false);
export const backward = new components.IconToggle('backward play', false);

// 0 is default (100% speed), other values are 25% speed increments
export const playbackSpeed = new components.Range('playback speed', -3, 12, 0);

const el = {};

export function setup() {
  if (el.root) return; // already initialized

  el.root = newDiv(document.body);

  const progressEl = newDiv(el.root, 'progress');
  newDiv(progressEl, 'buffer-bar');
  newDiv(progressEl, 'progress-bar');

  const buttonsEl = newDiv(el.root, 'buttons');
  const centerEl = newDiv(buttonsEl, 'center');
  const sideEl = newDiv(buttonsEl, 'side');

  el.toStartBtn = newIcon('Move to the start', centerEl, 'fas fa-fast-backward fa-fw', 'go to start');
  el.backBtn = newIcon('Step back (and pause)', centerEl, 'fas fa-step-backward fa-fw', 'step back');
  setupToggleIcon(playing, centerEl, 'fas fa-fw', 'pause/resume', ['fa-pause', 'fa-play']);
  el.fwdBtn = newIcon('Step forward (and pause)', centerEl, 'fas fa-step-forward fa-fw', 'step forward');
  el.toEndBtn = newIcon('Move to the end', centerEl, 'fas fa-fast-forward fa-fw', 'go to end');

  setupToggleIcon(backward, sideEl, 'fas fa-exchange-alt fa-fw', 'switch direction of time');
  setupToggleIcon(repeating, sideEl, 'fas fa-sync-alt fa-fw', 'repeat on/off');

  backward.addEventListener('change', () => {
    playing.iconEl.classList.toggle('fa-rotate-180', backward.value);
  });

  el.toStartBtn.addEventListener('click', toStart);
  el.toEndBtn.addEventListener('click', toEnd);
  el.backBtn.addEventListener('click', stepBack);
  el.fwdBtn.addEventListener('click', stepFwd);
  playing.addEventListener('change', resetIfStartingPlayAtEnd);

  progressEl.addEventListener('click', seek);

  animate();
}

export function setupDefaultKeys() {
  playing.setupKeyHandler(' ', 'View', ['Space', 'Start/stop replay']);
  el.backBtn.setupKeyHandler('ArrowLeft', 'View');
  el.fwdBtn.setupKeyHandler('ArrowRight', 'View');
  el.toStartBtn.setupKeyHandler(['PageUp', 'Home'], 'View');
  el.toEndBtn.setupKeyHandler(['PageDown', 'End'], 'View');
}

function animate() {
  requestAnimationFrame(animate);

  if (playing.value) {
    const playDirection = backward.value ? -1 : 1;
    currTime += playDirection * speedValue();

    if (repeating.value) {
      if (currTime < 0) currTime = maxTimeInclusive;
      if (currTime > maxTimeInclusive) currTime = 0;
    }
  }

  // other functions can update currTime so check bounds
  if (currTime < 0) {
    currTime = 0;
    playing.setTo(false);
  }
  if (currTime > maxTimeInclusive) {
    currTime = maxTimeInclusive;
    playing.setTo(false);
  }

  showProgress();

  if (showCallback) showCallback(Math.floor(currTime));
}

export function setMaxTime(t) {
  maxTimeInclusive = t - 1;
  if (currTime > maxTimeInclusive) currTime = maxTimeInclusive;
  showProgress();
}

export function setShowCallback(f) {
  showCallback = f;
}

function showProgress() {
  el.root.style.setProperty('--val-fraction', currTime / maxTimeInclusive);
}

export function setBufferedFraction(fraction) {
  el.root.style.setProperty('--buf-fraction', fraction);
}

function newDiv(parent, subclass) {
  const className = subclass ? COMPONENT_CLASSNAME + '-' + subclass : COMPONENT_CLASSNAME;

  const el = document.createElement('div');
  parent.append(el);
  el.className = className;
  return el;
}

function newIcon(name, parent, className, title) {
  const el = new components.IconButton(name);
  el.setupHtml(parent, className, title);
  return el;
}

function setupToggleIcon(toggle, parent, className, title, onOffClasses) {
  toggle.setupHtml(parent, className, title, onOffClasses);
  return toggle;
}

export function resetIfStartingPlayAtEnd() {
  if (playing.value) {
    // playing was just turned on: are we at the end? if so, set to beginning
    // if backwards, switch end and beginning
    if (!backward.value && currTime >= maxTimeInclusive) toStart();
    if (backward.value && currTime <= 0) toEnd();
  }
}

export function stepFwd() {
  currTime += 1;
  playing.setTo(false);
}

export function stepBack() {
  currTime -= 1;
  playing.setTo(false);
}

export function toStart() {
  // set to before beginning so next animation step shows the beginning
  currTime = 0;
}

export function toEnd() {
  // set to after end so next animation step shows the end
  currTime = maxTimeInclusive;
}

function seek(event) {
  const progressEl = event.target;
  currTime = event.offsetX / progressEl.clientWidth * maxTimeInclusive;
}

export function stop() {
  playing.setTo(false);
}

export function reset() {
  currTime = 0;
  playing.setTo(false);
  backward.setTo(false);
}


/*
todo:

disabling going back for ProgRad (maybe only if it's too slow)
gamma and exposure with animation buttons
*/

export function displaySpeedSetting(val) {
  return `${speedValue(val) * 100}%`;
}

function speedValue(val = playbackSpeed.value) {
  const speed = 1 + val / 4;
  return speed;
}
