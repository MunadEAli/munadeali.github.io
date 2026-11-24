/* Local translations: English source content remains the fallback. */
(() => {
  'use strict';
  const supported = ['en', 'fr', 'de'];
  const storageKey = 'portfolio-language';
  const catalog = window.portfolioTranslations || { text: {}, blocks: {} };
  const strings = catalog.text;
  const originals = new WeakMap();
  const attributes = new WeakMap();
  const blockOriginals = new WeakMap();
  const normalize = value => value.replace(/\s+/g, ' ').trim();
  let language = 'en';
  try {
    const saved = localStorage.getItem(storageKey);
    if (supported.includes(saved)) language = saved;
  } catch (_) { /* Language switching also works without browser storage. */ }

  const bar = document.createElement('div');
  bar.className = 'language-bar container';
  bar.innerHTML = `<label class="language-switcher">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></svg>
    <span class="sr-only">Language</span>
    <select id="site-language" aria-label="Language">
      <option value="en" lang="en">English</option>
      <option value="fr" lang="fr">Français</option>
      <option value="de" lang="de">Deutsch</option>
    </select>
    <svg class="language-chevron" viewBox="0 0 12 8" width="10" height="7" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m1 1 5 5 5-5"/></svg>
  </label>`;
  const nav = document.querySelector('nav');
  if (nav) nav.before(bar);
  else document.body.prepend(bar);
  const select = bar.querySelector('select');
  select.value = language;

  function localize(source) {
    const key = normalize(source);
    const entry = strings[key];
    const translated = language === 'en' ? null : entry?.[language];
    return translated ? source.match(/^\s*/)[0] + translated + source.match(/\s*$/)[0] : source;
  }

  function translate(root = document) {
    observer.disconnect();
    document.documentElement.lang = language;
    const label = { en: 'Language', fr: 'Langue', de: 'Sprache' }[language];
    select.setAttribute('aria-label', label);
    bar.querySelector('.sr-only').textContent = label;
    root.querySelectorAll('[data-i18n-block]').forEach(element => {
      const key = element.dataset.i18nBlock;
      if (!blockOriginals.has(element)) blockOriginals.set(element, element.innerHTML);
      const markup = language === 'en' ? blockOriginals.get(element) : catalog.blocks[key]?.[language];
      if (markup !== undefined && element.innerHTML !== markup) element.innerHTML = markup;
    });
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.parentElement?.closest('script, style, code, pre, template, .eq, .language-bar, [translate="no"], [data-i18n-block]')
          || !normalize(node.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      },
    });
    let node;
    while ((node = walker.nextNode())) {
      let state = originals.get(node);
      if (!state || node.nodeValue !== state.last) state = { source: node.nodeValue };
      state.last = localize(state.source);
      if (node.nodeValue !== state.last) node.nodeValue = state.last;
      originals.set(node, state);
    }
    root.querySelectorAll('[alt], [title], [placeholder], [aria-label]').forEach(element => {
      if (element.closest('.language-bar, [translate="no"]')) return;
      const states = attributes.get(element) || {};
      for (const name of ['alt', 'title', 'placeholder', 'aria-label']) {
        const value = element.getAttribute(name);
        if (value === null) continue;
        let state = states[name];
        if (!state || value !== state.last) state = { source: value };
        state.last = localize(state.source);
        if (value !== state.last) element.setAttribute(name, state.last);
        states[name] = state;
      }
      attributes.set(element, states);
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  }

  const observer = new MutationObserver(() => translate());
  select.addEventListener('change', () => {
    language = supported.includes(select.value) ? select.value : 'en';
    try { localStorage.setItem(storageKey, language); } catch (_) { /* Optional persistence. */ }
    translate();
  });
  window.portfolioI18n = { translate, get language() { return language; } };
  translate();
})();
