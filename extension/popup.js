/* global LCAC_DEFAULTS, chrome */
const LANG_NAMES = {
  python: 'Python', cpp: 'C++', c: 'C', java: 'Java', javascript: 'JavaScript', typescript: 'TypeScript',
  csharp: 'C#', go: 'Go', rust: 'Rust', kotlin: 'Kotlin', swift: 'Swift',
};

const switches = [...document.querySelectorAll('input[data-key]')];
const options = document.getElementById('options');
const statusEl = document.getElementById('status');
const statusText = document.getElementById('statusText');

function render(settings) {
  switches.forEach((el) => { el.checked = !!settings[el.dataset.key]; });
  options.classList.toggle('disabled', !settings.enabled);
}

function setStatus(state, text) {
  statusEl.dataset.state = state;
  statusText.textContent = text;
}

function refreshStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab) return setStatus('none', 'No active tab');
    chrome.tabs.sendMessage(tab.id, { type: 'lcac:getStatus' }, (res) => {
      if (chrome.runtime.lastError || !res) {
        return setStatus('none', 'Open a LeetCode problem (refresh if already open)');
      }
      if (res.state === 'off') return setStatus('off', 'Turned off');
      if (res.state === 'waiting') return setStatus('waiting', 'Waiting for the code editor…');
      if (res.state === 'active') {
        const name = LANG_NAMES[res.lang] || res.lang;
        if (!name) return setStatus('active', 'Active');
        return setStatus('active', `Active · ${name}${res.typed ? '' : ' (basic methods)'}`);
      }
      return setStatus('none', 'Not running on this page');
    });
  });
}

chrome.storage.local.get(LCAC_DEFAULTS, (settings) => {
  render(settings);
  switches.forEach((el) => {
    el.addEventListener('change', () => {
      settings[el.dataset.key] = el.checked;
      render(settings);
      chrome.storage.local.set({ [el.dataset.key]: el.checked }, () => setTimeout(refreshStatus, 250));
    });
  });
});

refreshStatus();
