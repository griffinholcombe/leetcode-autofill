// Drives the real provider from inject.js against a mock Monaco model.
const path = require('path');
const EXT = path.join(__dirname, '..', 'extension');
global.window = globalThis;
window.postMessage = () => {};
window.addEventListener = (t, fn) => { (window.__listeners ||= []).push(fn); };

const providers = {};
const Kind = { Method: 'Method', Field: 'Field', Variable: 'Variable', Class: 'Class', Keyword: 'Keyword', Snippet: 'Snippet', Function: 'Function' };
window.monaco = {
  languages: {
    CompletionItemKind: Kind,
    CompletionItemInsertTextRule: { InsertAsSnippet: 4 },
    registerCompletionItemProvider: (id, p) => { providers[id] = p; },
  },
  editor: { onDidCreateEditor() {}, getEditors: () => [], tokenize: (line) => [[{ offset: 0, type: line.trimStart().startsWith('#') || line.trimStart().startsWith('//') ? 'comment' : '' }]] },
};
require(path.join(EXT, 'core.js'));
require(path.join(EXT, 'inject.js'));
const origSetInterval = setInterval;

function model(src) {
  const cur = src.lastIndexOf('|');
  const text = src.slice(0, cur) + src.slice(cur + 1);
  const lines = text.split('\n');
  const before = text.slice(0, cur).split('\n');
  const position = { lineNumber: before.length, column: before[before.length - 1].length + 1 };
  return {
    position,
    getValue: () => text,
    getLineContent: (n) => lines[n - 1],
    getOffsetAt: ({ lineNumber, column }) => lines.slice(0, lineNumber - 1).reduce((a, l) => a + l.length + 1, 0) + column - 1,
    getWordUntilPosition: ({ lineNumber, column }) => {
      const l = lines[lineNumber - 1].slice(0, column - 1);
      const m = /[A-Za-z_$][\w$]*$/.exec(l);
      const word = m ? m[0] : '';
      return { word, startColumn: column - word.length, endColumn: column };
    },
  };
}
function complete(lang, src, trigger) {
  const m = model(src);
  const res = providers[lang].provideCompletionItems(m, m.position, { triggerKind: trigger ? 1 : 0 });
  return res.suggestions;
}
let pass = 0, fail = 0;
function check(name, lang, src, { has = [], not = [], detail, empty, trigger } = {}) {
  const s = complete(lang, src, trigger);
  const labels = new Set(s.map((x) => x.label));
  const errs = [];
  if (empty && s.length) errs.push(`expected empty, got ${s.length}: ${[...labels].slice(0, 8).join(',')}`);
  has.forEach((h) => { if (!labels.has(h)) errs.push(`missing ${h}`); });
  not.forEach((h) => { if (labels.has(h)) errs.push(`unexpected ${h}`); });
  if (detail !== undefined) { const d = s[0] && s[0].detail; if (d !== detail) errs.push(`detail ${JSON.stringify(d)} != ${JSON.stringify(detail)}`); }
  if (errs.length) { fail++; console.log('FAIL', name, '\n   ', errs.join('; '), '\n    got:', [...labels].slice(0, 15).join(', '), '| detail:', s[0] && s[0].detail); }
  else pass++;
}
function setSettings(obj) { window.__listeners.forEach((fn) => fn({ source: window, data: { __lcac: 'toPage', type: 'settings', settings: obj } })); }

// ---------------- Python ----------------
const pyHead = `class Solution:
    def solve(self, nums: List[int], s: str, grid: List[List[int]], root: Optional[TreeNode], head: Optional[ListNode]) -> int:
`;
check('py list param', 'python', pyHead + '        nums.|', { has: ['append', 'pop'], not: ['join', 'popleft'], detail: 'list[int]' });
check('py str param', 'python', pyHead + '        s.|', { has: ['join', 'split'], not: ['append'], detail: 'str' });
check('py str method chain', 'python', pyHead + '        s.strip().lower().|', { has: ['split'], not: ['append'] });
check('py split -> list', 'python', pyHead + '        s.split().|', { has: ['append'], detail: 'list[str]' });
check('py str literal join', 'python', pyHead + '        ", ".join(nums).|', { has: ['replace'], not: ['append'] });
check('py Counter', 'python', pyHead + '        cnt = Counter(s)\n        cnt.|', { has: ['most_common', 'items'], not: ['append'] });
check('py collections.Counter', 'python', pyHead + '        cnt = collections.Counter(s)\n        cnt.|', { has: ['most_common'] });
check('py defaultdict(list)[x]', 'python', pyHead + '        g = defaultdict(list)\n        g[1].|', { has: ['append'], not: ['items'] });
check('py deque', 'python', pyHead + '        q = deque([root])\n        q.|', { has: ['popleft', 'appendleft'] });
check('py deque popleft -> TreeNode', 'python', pyHead + '        q = deque([root])\n        node = q.popleft()\n        node.|', { has: ['left', 'right', 'val'], not: ['append'] });
check('py grid row via enumerate', 'python', pyHead + '        for i, row in enumerate(grid):\n            row.|', { has: ['append'], detail: 'list[int]' });
check('py for over str', 'python', pyHead + '        for ch in s:\n            ch.|', { has: ['isdigit'], not: ['append'] });
check('py for over range', 'python', pyHead + '        for i in range(10):\n            i.|', { has: ['bit_count'] });
check('py dict items', 'python', pyHead + '        d: Dict[str, List[int]] = {}\n        for k, v in d.items():\n            v.|', { has: ['append'] });
check('py tree chain', 'python', pyHead + '        root.left.right.|', { has: ['val', 'left'], not: ['append'] });
check('py linked list', 'python', pyHead + '        cur = head\n        cur.next.|', { has: ['val', 'next'], not: ['left'] });
check('py int literal', 'python', pyHead + '        x = 5\n        x.|', { has: ['bit_count'] });
check('py 2d comprehension row', 'python', pyHead + '        dp = [[0] * 5 for _ in range(3)]\n        dp[0].|', { has: ['append'], detail: 'list[int]' });
check('py dict literal', 'python', pyHead + '        seen = {}\n        seen.|', { has: ['get', 'items'], not: ['add'] });
check('py set literal', 'python', pyHead + '        seen = {1, 2}\n        seen.|', { has: ['add', 'discard'], not: ['items'] });
check('py set()', 'python', pyHead + '        seen = set()\n        seen.|', { has: ['add'] });
check('py heapq module', 'python', pyHead + '        heapq.|', { has: ['heappush', 'heappop'], not: ['append'], detail: 'heapq' });
check('py math module', 'python', pyHead + '        math.|', { has: ['gcd', 'inf'] });
check('py sorted', 'python', pyHead + '        arr = sorted(nums)\n        arr.|', { has: ['append'] });
check('py unknown -> generic', 'python', pyHead + '        foo.|', { has: ['append', 'join', 'nums'] });
const pyCls = `class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = OrderedDict()
        self.order = []

    def get(self, key: int) -> int:
        `;
check('py self members', 'python', pyCls + 'self.|', { has: ['cap', 'cache', 'order', 'get'], not: ['append'] });
check('py self.attr type', 'python', pyCls + 'self.order.|', { has: ['append'], not: ['items'] });
check('py self.attr dict', 'python', pyCls + 'self.cache.|', { has: ['items'] });
check('py arrow annotation', 'python', 'def f(x) ->|', { empty: true, trigger: true });
check('py comment dot', 'python', pyHead + '        # hello world.|', { empty: true, trigger: true });
check('py number dot', 'python', pyHead + '        x = 1.|', { empty: true, trigger: true });

// ---------------- C++ ----------------
const cppHead = `class Solution {
public:
    int solve(vector<int>& nums, string s, ListNode* head, TreeNode *root) {
        unordered_map<int, vector<int>> g;
        map<int, int> mp;
        priority_queue<pair<int,int>> pq;
        vector<vector<int>> dp(5, vector<int>(5));
        stack<char> st;
        `;
check('cpp vector param', 'cpp', cppHead + 'nums.|', { has: ['push_back', 'size'], not: ['substr', 'top'], detail: 'vector<value>' });
check('cpp string', 'cpp', cppHead + 's.|', { has: ['substr', 'find'], not: ['push_front'] });
check('cpp substr chain', 'cpp', cppHead + 's.substr(1).|', { has: ['length'] });
check('cpp map index', 'cpp', cppHead + 'g[3].|', { has: ['push_back'], not: ['find'] });
check('cpp map', 'cpp', cppHead + 'mp.|', { has: ['lower_bound', 'find', 'count'] });
check('cpp listnode arrow', 'cpp', cppHead + 'head->|', { has: ['val', 'next'], not: ['push_back'], trigger: true });
check('cpp listnode chain', 'cpp', cppHead + 'head->next->|', { has: ['next'], trigger: true });
check('cpp treenode', 'cpp', cppHead + 'root->left->|', { has: ['left', 'right'], trigger: true });
check('cpp pq top pair', 'cpp', cppHead + 'pq.top().|', { has: ['first', 'second'], not: ['push'] });
check('cpp auto iterator', 'cpp', cppHead + 'auto it = mp.find(3);\n        it->|', { has: ['first', 'second'], trigger: true });
check('cpp range-for auto', 'cpp', cppHead + 'for (auto& row : dp) {\n            row.|', { has: ['push_back'] });
check('cpp range-for pair', 'cpp', cppHead + 'for (auto& [k, v] : mp) {}\n        for (auto& e : mp) {\n            e.|', { has: ['first', 'second'] });
check('cpp dp row', 'cpp', cppHead + 'dp[1].|', { has: ['push_back'] });
check('cpp dp cell (int)', 'cpp', cppHead + 'dp[1][2].|', { empty: true });
check('cpp stack', 'cpp', cppHead + 'st.|', { has: ['top', 'push', 'pop'], not: ['front'] });
check('cpp new ListNode', 'cpp', cppHead + 'ListNode* dummy = new ListNode(0);\n        dummy->|', { has: ['next'], trigger: true });
check('cpp std::', 'cpp', cppHead + 'std::|', { has: ['vector', 'sort'], trigger: true });
check('cpp > comparison', 'cpp', cppHead + 'if (a >|', { empty: true, trigger: true });
check('cpp unknown generic', 'cpp', cppHead + 'foo.|', { has: ['push_back', 'nums'] });

// ---------------- Java ----------------
const jHead = `class Solution {
    private Map<Integer, List<Integer>> graph = new HashMap<>();
    public int solve(int[] nums, String s, ListNode head, char[][] board) {
        TreeMap<Integer, Integer> tm = new TreeMap<>();
        Queue<int[]> q = new LinkedList<>();
        StringBuilder sb = new StringBuilder();
        Deque<Integer> stack = new ArrayDeque<>();
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
        `;
check('java map', 'java', jHead + 'graph.|', { has: ['getOrDefault', 'computeIfAbsent'], not: ['floorKey'] });
check('java map get -> list', 'java', jHead + 'graph.get(1).|', { has: ['add', 'size'], not: ['put'] });
check('java computeIfAbsent chain', 'java', jHead + 'graph.computeIfAbsent(1, k -> new ArrayList<>()).|', { has: ['add'] });
check('java treemap', 'java', jHead + 'tm.|', { has: ['floorKey', 'ceilingEntry', 'put'] });
check('java treemap entry', 'java', jHead + 'tm.floorEntry(3).|', { has: ['getKey', 'getValue'] });
check('java linkedlist queue', 'java', jHead + 'q.|', { has: ['offer', 'poll', 'add'] });
check('java poll -> int[]', 'java', jHead + 'q.poll().|', { has: ['length'], not: ['add'] });
check('java string', 'java', jHead + 's.|', { has: ['charAt', 'substring'], not: ['append'] });
check('java toCharArray', 'java', jHead + 's.toCharArray().|', { has: ['length'] });
check('java array param', 'java', jHead + 'nums.|', { has: ['length'], not: ['add', 'size'] });
check('java 2d array row', 'java', jHead + 'board[0].|', { has: ['length'] });
check('java sb chain', 'java', jHead + 'sb.append("x").|', { has: ['append', 'reverse', 'toString'] });
check('java deque', 'java', jHead + 'stack.|', { has: ['push', 'pop', 'peekLast'] });
check('java pq peek', 'java', jHead + 'pq.peek().|', { has: ['length'] });
check('java Math', 'java', jHead + 'Math.|', { has: ['max', 'abs'], detail: 'Math' });
check('java System.out', 'java', jHead + 'System.out.|', { has: ['println'] });
check('java Integer', 'java', jHead + 'Integer.|', { has: ['MAX_VALUE', 'parseInt'] });
check('java entrySet loop', 'java', jHead + 'for (Map.Entry<Integer, Integer> e : tm.entrySet()) {\n            e.|', { has: ['getKey'] });
check('java var', 'java', jHead + 'var seen = new HashSet<Integer>();\n        seen.|', { has: ['add', 'contains'] });
check('java listnode', 'java', jHead + 'head.next.|', { has: ['val', 'next'] });
check('java int local', 'java', jHead + 'int n = nums.length;\n        n.|', { empty: true });

// ---------------- JavaScript ----------------
const jsHead = `/**
 * @param {number[]} nums
 * @param {string} s
 * @param {TreeNode} root
 * @return {number}
 */
var solve = function(nums, s, root) {
    const m = new Map();
    const seen = new Set();
    const dp = Array.from({ length: 5 }, () => new Array(5).fill(0));
    const res = [];
    `;
check('js jsdoc array', 'javascript', jsHead + 'nums.|', { has: ['push', 'length', 'reduce'], not: ['charCodeAt', 'has'] });
check('js jsdoc string', 'javascript', jsHead + 's.|', { has: ['charCodeAt', 'split'], not: ['push'] });
check('js map', 'javascript', jsHead + 'm.|', { has: ['get', 'set', 'has', 'size'], not: ['add'] });
check('js set', 'javascript', jsHead + 'seen.|', { has: ['add', 'has'], not: ['get'] });
check('js Array.from row', 'javascript', jsHead + 'dp[0].|', { has: ['push'] });
check('js Array.from cell', 'javascript', jsHead + 'dp[0][1].|', { has: ['toFixed'], not: ['push'] });
check('js array literal', 'javascript', jsHead + 'res.|', { has: ['push'] });
check('js tree', 'javascript', jsHead + 'root.left.|', { has: ['val', 'left', 'right'] });
check('js Math', 'javascript', jsHead + 'Math.|', { has: ['max', 'floor'] });
check('js for-of', 'javascript', jsHead + 'for (const x of nums) {\n        x.|', { has: ['toFixed'] });
check('js split chain', 'javascript', jsHead + 's.split("").|', { has: ['push', 'join'] });
const jsCls = `var LRUCache = function(capacity) {
    this.cap = capacity;
    this.cache = new Map();
};
LRUCache.prototype.get = function(key) {
    `;
check('js this members', 'javascript', jsCls + 'this.|', { has: ['cap', 'cache', 'get'] });
check('js this.cache', 'javascript', jsCls + 'this.cache.|', { has: ['get', 'set', 'has'] });

// ---------------- TypeScript ----------------
const tsHead = `function solve(nums: number[], s: string, root: TreeNode | null, grid: number[][]): number {
    const m: Map<number, number[]> = new Map();
    `;
check('ts array param', 'typescript', tsHead + 'nums.|', { has: ['push'], not: ['charAt'] });
check('ts union tree', 'typescript', tsHead + 'root.right.|', { has: ['val', 'left'] });
check('ts map get -> array', 'typescript', tsHead + 'm.get(1).|', { has: ['push'] });
check('ts grid row', 'typescript', tsHead + 'grid[0].|', { has: ['push'] });

// ---------------- Other languages stay generic ----------------
check('go generic', 'go', 'func f() {\n  x.|', { has: ['Ints'] });

// ---------------- Settings ----------------
setSettings({ typeAware: false });
check('typeAware off -> generic', 'python', pyHead + '        s.|', { has: ['append', 'join'] });
setSettings({ typeAware: true, identifiers: false, snippets: false });
check('identifiers off', 'python', pyHead + '        nu|', { not: ['nums', 'grid'], has: ['print'] });
check('snippets off', 'python', pyHead + '        fo|', { not: ['for in range'] });
setSettings({ identifiers: true, snippets: true });
check('snippets on', 'python', pyHead + '        fo|', { has: ['for in range', 'nums'] });
setSettings({ enabled: false });
check('disabled', 'python', pyHead + '        nums.|', { empty: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
