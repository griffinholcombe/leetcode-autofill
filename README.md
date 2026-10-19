<p align="center">
  <img src="extension/icons/icon128.png" width="96" alt="LeetCode Autocomplete icon">
</p>

<h1 align="center">LeetCode Autocomplete</h1>

<p align="center">
  Classic IDE-style autocomplete for the LeetCode code editor.<br>
  No AI, no account, no setup, and no data collection.
</p>

---

LeetCode's editor doesn't give you the autocomplete you're used to from a real IDE. This extension adds it:
start typing and you get keywords, standard-library names, the variables you've already written, snippets,
and **type-aware method suggestions**. Type `nums.` and you see list methods; type `s.` and you see string methods.

It's deliberately simple. It isn't AI and it doesn't write code for you. It only completes what you're typing,
the way VS Code or IntelliJ would.

## Install

Add **LeetCode Autocomplete** to Chrome from the Chrome Web Store. That's it: open any LeetCode problem and start
typing. There is nothing to configure.

> Chrome Web Store listing coming soon. Until then, see [Install from source](#install-from-source).

## What it does

- **Suggestions as you type.** Tab or Enter accepts, Esc dismisses, Ctrl+Space opens the list manually.
- **Type-aware members** after `.` (and `->` in C++). The list shows the type it worked out, such as
  `list[int]` or `Map<Integer, List<Integer>>`.
  - `heapq.`, `math.`, `Math.`, `Arrays.`, `System.out.` and `std::` list their functions.
  - Chains work: `q.popleft().left`, `graph.get(u).add`, `pq.top().first`, `dp[i].push_back`, `s.split().`
- **Names from your code.** Variables, functions and parameters you've already written are suggested first.
- **Keywords and standard-library names** for each language (`defaultdict`, `bisect_left`, `unordered_map`,
  `PriorityQueue`, `Array.from`, …).
- **Snippets** such as `for in range`, `fori`, `foreach`, `def`, `lambda` and `dfs`. Tab moves through the placeholders.
- **Stays out of the way.** No suggestions pop up inside comments or strings.

### Languages

| Language | Type-aware methods | Keywords, library names, snippets |
|---|:---:|:---:|
| Python | ✓ | ✓ |
| C++ | ✓ | ✓ |
| Java | ✓ | ✓ |
| JavaScript | ✓ | ✓ |
| TypeScript | ✓ | ✓ |
| C, C#, Go, Rust, Kotlin, Swift | general list | ✓ |

### How types are worked out

It reads the code in the editor (there's no compiler involved). It uses:
- LeetCode's parameter types, including the `@param {number[]}` comments in JavaScript problems
- Declarations, such as `vector<int> v` or `Map<..> m = new TreeMap<>()`
- What a variable was assigned: `[]`, `{}`, `Counter(s)`, `new Map()`, `deque([root])`, `[[0]*n for _ in range(m)]`
- Loop variables: `for i, row in enumerate(grid)`, `for (auto& x : v)`
- Indexing and common method return types: `g[u].`, `q.popleft().`, `map.get(k).`
- `self.x` / `this.x` fields, and `auto` / `var`

When it can't tell a variable's type, it falls back to a general method list for that language.

## Settings

Everything is on by default. Click the toolbar icon if you want to change anything:

| Switch | What it does |
|---|---|
| Autocomplete | Turns the whole extension on or off |
| Pop up while typing | Off: suggestions only appear with Ctrl+Space |
| Type-aware methods | Off: the general method list is shown after `.` |
| Names from my code | Suggest variables and functions you've written |
| Snippets | Loop, function and lambda templates |
| Enter accepts | Off: only Tab accepts, and Enter always makes a new line |

The popup also shows whether autocomplete is active on the current tab and which language it detected.

## Privacy

**This extension collects no data.**
- Your code is read only inside the page, as you type, to build suggestions. It is never stored or sent anywhere.
- There are no network requests, no analytics and no third-party code.
- The only permission is `storage`, used to keep your six on/off switches on your own device.
- It runs only on leetcode.com and leetcode.cn.

Full details are in [PRIVACY.md](PRIVACY.md).

## Install from source

1. Download this repository (green **Code** button → **Download ZIP**) and unzip it.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension` folder.
4. Open or refresh a LeetCode problem.

If suggestions don't appear, open DevTools on the problem page and look for
`[LeetCode Autocomplete] enabled` in the console.

## Development

```
extension/          the extension itself (this folder is what gets published)
  manifest.json
  core.js           word lists, type tables and type inference (no browser APIs, unit-testable)
  inject.js         connects core.js to LeetCode's Monaco editor
  bridge.js         passes your switches from extension storage to the page
  popup.*           the toolbar popup
tests/              Node tests for completions and security
scripts/package.sh  builds the zip to upload to the Chrome Web Store
docs/               Chrome Web Store submission notes
```

Requirements: Node 18 or newer, for the tests only. The extension has no dependencies and no build step.

```bash
npm test                  # run completion and security tests
bash scripts/package.sh   # create dist/leetcode-autocomplete-<version>.zip
```

To add a word, method or type, edit the tables at the top of `extension/core.js`, add a test case in
`tests/completion.test.js`, then reload the extension in `chrome://extensions`.

## License

[MIT](LICENSE)
