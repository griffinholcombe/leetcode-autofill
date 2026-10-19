// Runs in the extension's isolated world: relays the on/off toggles from chrome.storage.local to the
// page script, and remembers the page script's status so the popup can show it.
// It never reads your code, never makes network requests, and accepts only validated messages.
(() => {
  /* global LCAC_DEFAULTS, chrome */
  const ORIGIN = window.location.origin;
  const STATES = new Set(['waiting', 'active', 'off']);
  let status = { state: 'waiting' };

  // Keep only the known boolean toggles.
  const cleanSettings = (obj) => {
    const out = {};
    for (const k of Object.keys(LCAC_DEFAULTS)) {
      out[k] = obj && typeof obj[k] === 'boolean' ? obj[k] : LCAC_DEFAULTS[k];
    }
    return out;
  };

  // Keep only a state word, a short language id and a boolean.
  const cleanStatus = (s) => {
    if (!s || !STATES.has(s.state)) return null;
    const out = { state: s.state };
    if (typeof s.lang === 'string' && /^[a-z+#]{1,20}$/.test(s.lang)) out.lang = s.lang;
    if (typeof s.typed === 'boolean') out.typed = s.typed;
    return out;
  };

  const sendSettings = () => {
    chrome.storage.local.get(LCAC_DEFAULTS, (stored) => {
      window.postMessage({ __lcac: 'toPage', type: 'settings', settings: cleanSettings(stored) }, ORIGIN);
    });
  };

  window.addEventListener('message', (e) => {
    const d = e.data;
    if (e.source !== window || e.origin !== ORIGIN || !d || d.__lcac !== 'toBridge') return;
    if (d.type === 'hello') sendSettings();
    else if (d.type === 'status') { const s = cleanStatus(d.status); if (s) status = s; }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') sendSettings();
  });

  chrome.runtime.onMessage.addListener((msg, sender, reply) => {
    if (sender.id !== chrome.runtime.id) return;
    if (msg && msg.type === 'lcac:getStatus') reply(status);
  });

  sendSettings();
})();
