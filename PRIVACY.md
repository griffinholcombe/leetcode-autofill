# Privacy & security

**LeetCode Autocomplete collects no data.**

- **Your code stays on the page.** The extension reads the code in LeetCode's editor only to build suggestions,
  in memory, as you type. It is never saved, logged, or sent anywhere.
- **No network access.** No script in the extension makes network requests, and the popup is locked down by a
  Content Security Policy that blocks all connections (`connect-src 'none'`).
- **No accounts, analytics, ads or tracking.** There is no server and no third-party code.
- **Only your switches are stored**, in `chrome.storage.local` on this device (not synced to your Google account):
  six on/off values and nothing else.
- **Smallest possible permissions.** The only permission is `storage`. There are no host permissions, no access
  to your tabs' contents beyond LeetCode, no cookies, history, downloads or clipboard.
- **Runs only on leetcode.com and leetcode.cn**, in the top-level page.

## How it's hardened
- No `eval`, `new Function`, remote scripts, or `innerHTML`; the popup sets text with `textContent` only.
- Messages between the extension's two scripts are posted to the page's own origin only, and both sides
  accept only a fixed set of message types. Settings are accepted only as known true/false values, and the
  status shown in the popup is reduced to a state word and a short language name.
- The status relay on the page only answers requests that come from this extension itself.

You can verify all of this yourself: every file is plain, readable JavaScript (no minified or bundled code).
