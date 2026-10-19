# Publishing to the Chrome Web Store

Notes for submitting or updating the listing in the
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Build the upload
```bash
bash scripts/package.sh
```
Upload `dist/leetcode-autocomplete-<version>.zip`. Bump `version` in `extension/manifest.json` for every update.

## Store listing

**Name:** LeetCode Autocomplete

**Summary:** comes from `description` in `extension/manifest.json` (132 characters max; `npm test` checks this):
IDE-style autocomplete for LeetCode: type-aware methods, keywords, snippets. No AI, no setup, no data collection.

**Category:** Developer Tools

**Description:**
LeetCode's editor doesn't give you the autocomplete you're used to from an IDE. This extension adds it.

• Suggestions as you type: keywords, standard-library names, and the variables you've already written
• Type-aware methods: nums. shows list methods, s. shows string methods, heapq. shows heapq functions
• Snippets for common loops and functions
• Python, C++, Java, JavaScript and TypeScript get type-aware suggestions; C, C#, Go, Rust, Kotlin and Swift get keywords, library names and snippets
• Works the moment it's installed. Optional switches in the toolbar popup

It's not AI and doesn't write code for you. It only completes what you're typing.

Private by design: your code never leaves the page, nothing is sent anywhere, and the only thing stored is your on/off switches, on your device.

**Assets you still need to make:** at least one screenshot (1280×800 or 640×400) of suggestions open in the
LeetCode editor, and a 440×280 small promo tile. The 128×128 icon is `extension/icons/icon128.png`.

## Privacy practices tab

**Single purpose:** Adds IDE-style code autocomplete to the code editor on LeetCode problem pages.

**Permission justifications:**
- `storage`: saves the user's on/off switches from the toolbar popup, locally on their device.
- Content scripts on `https://leetcode.com/*` and `https://leetcode.cn/*`: needed to add autocomplete to
  LeetCode's code editor. LeetCode is a single-page app, so the script must be present on every LeetCode page
  to be ready when the user opens a problem.

**Remote code:** No, the extension does not use remote code.

**Data usage:** Select none of the data categories. The extension does not collect or transmit user data.
Check all three certifications (not sold to third parties, not used for unrelated purposes, not used for
creditworthiness or lending).

**Privacy policy URL:** link to `PRIVACY.md` in this repository.
