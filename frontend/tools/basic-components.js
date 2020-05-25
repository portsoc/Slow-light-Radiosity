import * as kbd from './keyboard-shortcuts.js';

export class Range extends EventTarget {
  constructor(name, min, max, dflt) {
    super();

    this.name = name;
    this.min = min;
    this.max = max;
    this.value = this.default = dflt;
  }

  setupHtml(el, toString = (x) => x.toString()) {
    el = findElement(el);

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
    resetEl.classList.add('reset');
    resetEl.classList.add('fas', 'fa-undo-alt'); // fontawesome icon
    resetEl.addEventListener('click', () => {
      this.setTo(this.default);
    });
  }

  setupKeyHandler(key, category) {
    const keys = [key, key.toUpperCase()];
    kbd.registerKeyboardShortcut(
      keys,
      (e) => {
        if (e.metaKey || e.altKey) {
          return false;
        }
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
    this.dispatchEvent(new CustomEvent('change'));
  }
}

export class Toggle extends EventTarget {
  constructor(name, initial) {
    super();

    this.name = name;
    this.value = initial;
    this.explanations = [];
  }

  setupHtml(el) {
    el = findElement(el);

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
    inputEl.type = 'checkbox';
    inputEl.checked = this.value;

    inputEl.addEventListener('input', this.onInput.bind(this));

    for (const exp of this.explanations) {
      const expEl = document.createElement('div');
      expEl.classList.add('explanation');
      containerEl.append(expEl);
      expEl.textContent = exp;
    }
  }

  addExplanation(text) {
    if (this.containerEl) throw new TypeError('explanation must be added before setupHtml');

    this.explanations.push(text);
  }

  setupKeyHandler(key, category) {
    kbd.registerKeyboardShortcut(
      key,
      (e) => {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
          return false;
        }

        this.setTo(!this.value);
      },
      {
        category,
        description: `Toggle ${this.name}`,
      },
    );
  }

  onInput(e) {
    this.setTo(e.target.checked);
  }

  setTo(value) {
    if (this.inputEl) {
      this.inputEl.checked = value;
    }
    this.value = value;
    this.dispatchEvent(new CustomEvent('change'));
  }
}

export class Selector extends EventTarget {
  constructor(name, namedObjects) {
    super();

    this.name = name;
    this.options = namedObjects;
    this.optionEls = [];
    this.index = 0;
    this.value = this.options[this.index];
  }

  setupHtml(el) {
    el = findElement(el);

    for (let i = 0; i < this.options.length; i++) {
      const option = this.options[i];

      const optionEl = document.createElement('div');
      optionEl.classList.add('option');
      optionEl.dataset.index = i;

      if (option.name) {
        optionEl.textContent = `${i + 1}: ${option.name}`;
      } else {
        optionEl.textContent = `${i + 1}`;
      }

      el.addEventListener('click', (e) => this.setToIndex(Number(e.target.dataset.index)));
      el.append(optionEl);
      this.optionEls[i] = optionEl;
    }

    this.displaySelected();
  }

  displaySelected() {
    for (const el of this.optionEls) {
      el.classList.toggle('selected', Number(el.dataset.index) === this.index);
    }
  }

  setupKeyHandlers(keys, eventToIndex, description) {
    kbd.registerKeyboardShortcut(keys,
      (e) => {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
          return false;
        }

        const newIndex = eventToIndex(e);
        if (newIndex >= this.options.length) {
          return false;
        }

        this.setToIndex(newIndex);
      },
      description,
    );
  }

  setupSwitchKeyHandler(key, category) {
    kbd.registerKeyboardShortcut(
      key,
      (e) => {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) {
          return false;
        }

        this.setToIndex((this.index + 1) % this.options.length);
      },
      {
        category,
        description: `Switch ${this.name}`,
      },
    );
  }

  setToIndex(newIndex) {
    if (this.index !== newIndex) {
      this.value = this.options[newIndex];
      this.index = newIndex;
      this.displaySelected();

      this.dispatchEvent(new CustomEvent('change'));
    }
  }
}

function findElement(el) {
  if (el instanceof Element) {
    return el;
  } else {
    return document.querySelector(el);
  }
}
