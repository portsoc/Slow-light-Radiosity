// for each category create <h2>name</h2>
// for each shortcut in that category, create item: <span>key</span><span>description</span>
export function listKeyboardShortcuts(el) {
  for (const cat of categories) {
    const handlers = shortcutsByCategory.get(cat) || [];
    handlers.sort(descKeyCompare);

    const headingEl = document.createElement('h2');
    headingEl.textContent = cat;
    el.append(headingEl);

    for (const handler of handlers) {
      const key = handler.descKey;
      const description = handler.descText;

      // skip handlers with no description
      if (!description) continue;

      const keyEl = document.createElement('span');
      keyEl.textContent = key;

      const descEl = document.createElement('span');
      descEl.textContent = description;

      el.append(keyEl);
      el.append(descEl);
    }
  }
}

// compare descKey property in ascii, uppercase first
function descKeyCompare(a, b) {
  a = a.descKey;
  b = b.descKey;
  return a < b ? -1 : a === b ? 0 : 1;
}

const categories = [];

const shortcutsByCategory = new Map();
const shortcutsByKey = new Map();
const defaultOptions = {
  category: 'Others',
  acceptModifiers: [], // by default, no modifiers are allowed
};

const MODIFIERS = ['shift', 'ctrl', 'alt', 'meta'];

export function registerKeyboardShortcut(key, f, options = {}) {
  if (Array.isArray(key)) {
    registerMultipleShortcuts(key, f, options);
    return;
  }

  options = { ...defaultOptions, ...options };

  let shortcutsForKey = shortcutsByKey.get(key);
  if (!shortcutsForKey) {
    shortcutsForKey = [];
    shortcutsByKey.set(key, shortcutsForKey);
  }

  let shortcutForCategory = shortcutsByCategory.get(options.category);
  if (!shortcutForCategory) {
    shortcutForCategory = [];
    shortcutsByCategory.set(options.category, shortcutForCategory);
  }

  const record = {
    key,
    f,
    category: options.category,
    description: options.description,
  };

  if (Array.isArray(options.description)) {
    [record.descKey, record.descText] = options.description;
  } else {
    record.descKey = key;
    record.acceptModifiers = options.acceptModifiers;
    record.descText = options.description;
  }

  shortcutForCategory.push(record);
  shortcutsForKey.push(record);

  if (!categories.includes(record.category)) {
    categories.push(record.category);
  }
}

function registerMultipleShortcuts(keys, f, options) {
  const currentOptions = { ...options };
  for (const key of keys) {
    registerKeyboardShortcut(key, f, currentOptions);
    // only the first shortcut will have a description
    delete currentOptions.description;
  }
}

document.addEventListener('keydown', handleKeyboard);

function handleKeyboard(e) {
  const shortcuts = shortcutsByKey.get(e.key) || [];
  for (const handler of shortcuts) {
    // skip if handler doesn't accept a modifier that's pressed
    if (!matchesAcceptedModifiers(e, handler)) continue;

    const retval = handler.f(e);
    if (retval !== false) { // different from null, so we don't just test for falsey
      // this handler handled the key
      e.preventDefault();
      break;
    }
  }
}

function matchesAcceptedModifiers(e, handler) {
  if (!handler.acceptModifiers) return true;

  for (const mod of MODIFIERS) {
    if (e[mod + 'Key'] && !handler.acceptModifiers.includes(mod)) return false;
  }

  return true;
}
