// LeetCode Autocomplete — Monaco glue. Runs in the page's own JS world so it can reach window.monaco.
(() => {
  if (window.__lcAutocompleteLoaded) return;
  window.__lcAutocompleteLoaded = true;

  // Privacy: your code is only read locally to build suggestions. Nothing is stored or sent anywhere;
  // the only message this script posts is a status like { state: 'active', lang: 'python' }.
  const core = window.__lcAC;
  if (!core) return;
  try { delete window.__lcAC; } catch (_) {}   // don't leave the helper lying around on the page
  const { VOCAB, TYPED, inferMembers } = core;

  // ---------- Settings (pushed from the popup via the bridge script) ----------
  let settings = {
    enabled: true, autoPopup: true, typeAware: true, identifiers: true, snippets: true, enterAccepts: true,
  };
  const SETTING_KEYS = Object.keys(settings);
  let monacoRef = null;
  const ORIGIN = window.location ? window.location.origin : '*';

  const post = (type, payload) => {
    try { window.postMessage(Object.assign({ __lcac: 'toBridge', type }, payload), ORIGIN); } catch (_) {}
  };

  try {
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (e.source !== window || (ORIGIN !== '*' && e.origin !== ORIGIN)) return;
      if (!d || d.__lcac !== 'toPage' || d.type !== 'settings' || !d.settings) return;
      // Accept only known boolean toggles.
      const next = Object.assign({}, settings);
      for (const k of SETTING_KEYS) if (typeof d.settings[k] === 'boolean') next[k] = d.settings[k];
      settings = next;
      if (monacoRef) applyAll(monacoRef);
    });
  } catch (_) {}
  post('hello', {});

  // ---------- Editor options ----------
  const KEYS = ['quickSuggestions', 'quickSuggestionsDelay', 'suggestOnTriggerCharacters', 'wordBasedSuggestions',
                'snippetSuggestions', 'tabCompletion', 'acceptSuggestionOnEnter', 'suggest'];
  const MONACO_DEFAULTS = {
    quickSuggestions: { other: true, comments: false, strings: false }, quickSuggestionsDelay: 10,
    suggestOnTriggerCharacters: true, snippetSuggestions: 'inline', tabCompletion: 'off', acceptSuggestionOnEnter: 'on',
  };
  const originals = new WeakMap();

  function optsFor(s) {
    return {
      quickSuggestions: s.autoPopup ? { other: true, comments: false, strings: false } : false,
      quickSuggestionsDelay: 10,
      suggestOnTriggerCharacters: true,
      wordBasedSuggestions: s.identifiers ? 'currentDocument' : 'off',
      snippetSuggestions: s.snippets ? 'inline' : 'none',
      tabCompletion: 'on',
      acceptSuggestionOnEnter: s.enterAccepts ? 'on' : 'off',
      suggest: { showWords: s.identifiers, showKeywords: true, showSnippets: s.snippets, showFunctions: true,
                 showMethods: true, showClasses: true, showVariables: true, showFields: true, showProperties: true },
    };
  }

  function applyTo(editor) {
    try {
      if (!originals.has(editor)) {
        const raw = typeof editor.getRawOptions === 'function' ? editor.getRawOptions() : {};
        const saved = {};
        for (const k of KEYS) if (raw[k] !== undefined) saved[k] = raw[k];
        originals.set(editor, saved);
      }
      if (settings.enabled) {
        editor.updateOptions(optsFor(settings));
      } else {
        editor.updateOptions(Object.assign({}, MONACO_DEFAULTS, originals.get(editor)));
      }
    } catch (_) {}
  }

  function editors(monaco) {
    try { return typeof monaco.editor.getEditors === 'function' ? monaco.editor.getEditors() : []; } catch (_) { return []; }
  }

  let lastStatus = '';
  function reportStatus(monaco) {
    let status;
    if (!settings.enabled) status = { state: 'off' };
    else {
      const eds = editors(monaco);
      const ed = eds.find((e) => { try { return e.hasTextFocus(); } catch (_) { return false; } }) || eds[0];
      let lang = null;
      try { lang = ed && ed.getModel() && ed.getModel().getLanguageId(); } catch (_) {}
      status = { state: 'active', lang, typed: !!(lang && TYPED.has(lang)) };
    }
    const key = JSON.stringify(status);
    if (key !== lastStatus) { lastStatus = key; post('status', { status }); }
  }

  function applyAll(monaco) {
    editors(monaco).forEach(applyTo);
    reportStatus(monaco);
  }

  // ---------- Completion provider ----------
  function inCommentOrString(monaco, langId, lineText, col) {
    // col: 1-based column of the character to check
    try {
      const toks = monaco.editor.tokenize(lineText, langId)[0] || [];
      let type = '';
      for (const t of toks) { if (t.offset <= col - 1) type = t.type; else break; }
      return /comment|string/.test(type);
    } catch (_) { return false; }
  }

  function makeProvider(monaco, langId) {
    const V = VOCAB[langId];
    const K = monaco.languages.CompletionItemKind;
    const SNIPPET = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    const isCpp = langId === 'cpp' || langId === 'c';

    return {
      triggerCharacters: isCpp ? ['.', '>', ':'] : ['.'],
      provideCompletionItems(model, position, context) {
        const empty = { suggestions: [] };
        const S = settings;
        if (!S.enabled) return empty;

        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
          startColumn: word.startColumn, endColumn: word.endColumn,
        };
        const text = model.getValue();
        const wordStart = model.getOffsetAt({ lineNumber: position.lineNumber, column: word.startColumn });
        const before = text.slice(0, wordStart);
        const am = /(\?\.|->|::|\.)$/.exec(before);
        const acc = am ? am[1] : '';

        // '>' / ':' typed but not as '->' / '::'
        if (context && context.triggerKind === 1 && !acc) return empty;
        if (acc === '->' && !isCpp) return empty;      // e.g. Python "def f() ->"
        if (acc === '::' && !isCpp) return empty;

        const lineText = model.getLineContent(position.lineNumber);
        const checkCol = acc ? word.startColumn - acc.length : word.startColumn;
        if (inCommentOrString(monaco, langId, lineText.slice(0, Math.max(0, checkCol)), checkCol)) return empty;

        const seen = new Set();
        const out = [];
        const push = (label, kind, sort, detail) => {
          if (seen.has(label)) return;
          seen.add(label);
          const item = { label, kind, insertText: label, range, sortText: sort + label };
          if (detail) item.detail = detail;
          out.push(item);
        };

        // Identifiers already in your code (skip the one you're mid-typing)
        const ids = new Map();
        if (S.identifiers) {
          for (const m of text.matchAll(/[A-Za-z_$][\w$]*/g)) ids.set(m[0], (ids.get(m[0]) || 0) + 1);
        }
        const pushIds = (kind, sort) => ids.forEach((n, id) => {
          if (id.length > 1 && !(id === word.word && n === 1)) push(id, kind, sort);
        });

        if (acc) {
          const recv = before.slice(0, before.length - acc.length);
          if (/(?:^|[^\w$.])\d+$/.test(recv)) return empty;           // "1." is a number
          if (acc === '::') {
            if (/\bstd\s*$/.test(recv)) { V.builtins.forEach((b) => push(b, K.Class, '1')); return { suggestions: out }; }
            return empty;
          }
          if (S.typeAware && TYPED.has(langId)) {
            let info = null;
            try { info = inferMembers(langId, text, recv, wordStart); } catch (_) { info = null; }
            if (info) {
              info.items.forEach((it) => push(it.name, it.kind === 'f' ? K.Field : K.Method, '1', info.label));
              return { suggestions: out };
            }
          }
          V.members.forEach((m) => push(m, K.Method, '1'));
          pushIds(K.Field, '3');
          return { suggestions: out };
        }

        pushIds(K.Variable, '1');
        V.keywords.forEach((k) => push(k, K.Keyword, '2'));
        V.builtins.forEach((b) => push(b, /^[A-Z]/.test(b) ? K.Class : K.Function, '2'));
        if (S.snippets) {
          V.snippets.forEach(([label, body]) => out.push({
            label, kind: K.Snippet, insertText: body, insertTextRules: SNIPPET, range,
            sortText: '4' + label, detail: 'snippet',
          }));
        }
        return { suggestions: out };
      },
    };
  }

  // ---------- Bootstrapping ----------
  function setup(monaco) {
    if (monaco.__lcAutocomplete) return;
    monaco.__lcAutocomplete = true;
    monacoRef = monaco;

    for (const id of Object.keys(VOCAB)) {
      try { monaco.languages.registerCompletionItemProvider(id, makeProvider(monaco, id)); } catch (_) {}
    }
    try { monaco.editor.onDidCreateEditor((ed) => setTimeout(() => applyTo(ed), 0)); } catch (_) {}

    // LeetCode can reset editor options (language switch, settings changes), so re-apply periodically.
    applyAll(monaco);
    setInterval(() => applyAll(monaco), 2000);
    console.log('[LeetCode Autocomplete] enabled');
  }

  const ready = () => window.monaco && window.monaco.languages && window.monaco.editor;
  if (ready()) setup(window.monaco);
  else {
    post('status', { status: { state: 'waiting' } });
    const poll = setInterval(() => {
      if (ready()) { clearInterval(poll); setup(window.monaco); }
    }, 500);
  }
})();
