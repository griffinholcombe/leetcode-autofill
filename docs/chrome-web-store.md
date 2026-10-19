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

**Single purpose description:**
Adds classic IDE-style code autocomplete (keywords, standard-library names, type-aware method suggestions, snippets and the user's own identifiers) to the code editor on LeetCode problem pages.

**storage justification:**
Saves the user's six on/off settings from the toolbar popup (such as turning snippets or Enter-to-accept on or off) in chrome.storage.local on their own device. Nothing else is stored, and nothing is synced or sent anywhere.

**Host permission justification:**
The extension adds autocomplete to LeetCode's code editor, so its content scripts must run on https://leetcode.com/* and https://leetcode.cn/*. LeetCode is a single-page app, so the scripts need to be present on all LeetCode pages to be ready when the user opens a problem. The scripts only read the code in the editor, in the page, to build suggestions; they make no network requests and do not access any other site.

**Are you using remote code?** Select **"No, I am not using Remote code."**
(If a justification box still shows: All of the extension's JavaScript is included in the package. It does not load or run any external scripts, modules or WebAssembly, and does not use eval.)

**Data usage:** tick none of the data types. The extension does not collect or transmit any user data.
Then tick all three certifications:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://github.com/griffinholcombe/leetcode-autofill/blob/main/PRIVACY.md

## Account settings (publisher)
Add a contact email on the dashboard's **Settings** page, then click the verification link Google emails to it.
Both are required before anything can be published.
