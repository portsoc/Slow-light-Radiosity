import * as kbd from './keyboard-shortcuts.js';

export class Range extends EventTarget {
  constructor(
    name,
    min,
    max,
    dflt,
  ) {
    super();

    this.name = name;
    this.min = min;
    this.max = max;
    this.value = this.default = dflt;
  }

  setupHtml(el, toString = (x) => x.toString()) {
    const containerEl = document.createElement('label');
    this.containerEl = containerEl;
    el.append(containerEl);

    const nameEl = document.createElement('div');
    nameEl.classList.add('label');
    containerEl.append(nameEl);
    nameEl.textContent = this.name;

    const inputEl = document.createElement('input');
    this.inputEl = inputEl;
    containerEl.append(inputEl);
    inputEl.type = 'range';
    inputEl.min = this.min;
    inputEl.max = this.max;
    inputEl.step = 1;
    inputEl.value = this.value;

    if (this.value === this.default) containerEl.classList.add('default');

    inputEl.addEventListener('input', this.onInput.bind(this));

    const displayEl = document.createElement('span');
    displayEl.classList.add('value');
    this.displayEl = displayEl;
    containerEl.append(displayEl);

    this.valueToString = toString;
    this.display();

    const resetEl = document.createElement('i');
    this.resetEl = resetEl;
    containerEl.append(resetEl);
    resetEl.title = 'reset to default';
    resetEl.classList.add('fas');
    resetEl.classList.add('fa-undo-alt');
    resetEl.addEventListener('click', () => {
      this.setTo(this.default);
    });
  }

  setupKeyHandler(key, category) {
    const keys = [key, key.toUpperCase()];
    kbd.registerKeyboardShortcut(
      keys,
      (e) => {
        if (e.ctrlKey) {
          this.setTo(this.default);
        } else {
          this.setTo(this.value + (e.shiftKey ? -1 : 1));
        }
      },
      {
        category,
        description: [keys.join('/'), `Increase/decrease ${this.name} (ctrl-${key} to reset)`],
      },
    );
  }

  display() {
    if (this.displayEl) {
      this.displayEl.textContent = this.valueToString(this.value);
    }
  }

  onInput(e) {
    this.setTo(e.target.valueAsNumber);
  }

  setTo(value) {
    if (value > this.max) value = this.max;
    if (value < this.min) value = this.min;

    if (this.inputEl) {
      this.inputEl.value = value;
      this.containerEl.classList.toggle('default', value === this.default);
    }
    this.value = value;
    this.display();
    this.dispatchEvent(new CustomEvent('update'));
  }
}
