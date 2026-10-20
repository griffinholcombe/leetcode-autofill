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

**Description** (plain text, paste as is; no tables, checkmarks or lists of names, which the store treats as keyword spam):

LeetCode's code editor doesn't give you the autocomplete you're used to from an IDE. This extension adds it.

As you type, a suggestion list appears with the language's keywords, common standard-library functions and the variables you've already written. Press Tab or Enter to accept a suggestion.

When you type a dot after a variable, the list shows only the methods that variable actually has. A list shows list methods, a string shows string methods, and a hash map shows map methods. Short templates for common loops and functions are included too.

It works in every language LeetCode offers, with the type-aware method suggestions in the most popular ones. It is not AI and never writes code for you. It only completes what you're typing.

Everything works as soon as it's installed. If you want to change anything, click the toolbar icon to turn individual features on or off.

Your privacy: your code never leaves the page, nothing is collected or sent anywhere, and the only thing saved is your on/off settings, on your own device.

**Screenshots:** three 1280×800 screenshots have been made. Optional: a 440×280 small promo tile.
The 128×128 icon is `extension/icons/icon128.png`.

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
