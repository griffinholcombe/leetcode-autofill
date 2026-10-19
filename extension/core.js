// LeetCode Autocomplete — vocabulary and type inference (no Monaco dependency, so it can be unit-tested).
(function (root) {
  'use strict';

  const w = (s) => (s && s.trim() ? s.trim().split(/\s+/) : []);

  // =====================================================================
  // Plain vocabulary (keywords, builtins, generic members, snippets)
  // =====================================================================
  const VOCAB = {
    python: {
      keywords: w(`False None True and as assert async await break class continue def del elif else except
        finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self`),
      builtins: w(`print len range enumerate zip map filter sorted reversed sum min max abs int str float bool list
        dict set tuple frozenset ord chr isinstance any all divmod pow round hash iter next type object super bin
        hex oct defaultdict Counter deque OrderedDict heapq heappush heappop heapify heappushpop heapreplace nlargest
        nsmallest bisect bisect_left bisect_right insort math inf gcd lcm sqrt isqrt ceil floor log log2 comb perm
        factorial accumulate permutations combinations product groupby chain pairwise zip_longest lru_cache cache
        reduce cmp_to_key List Optional Dict Set Tuple ListNode TreeNode Node collections itertools functools string
        ascii_lowercase ascii_uppercase digits SortedList`),
      members: w(`append extend insert pop remove index count sort reverse copy clear keys values items get setdefault
        update add discard union intersection difference symmetric_difference issubset issuperset popleft appendleft
        rotate most_common elements join split strip lstrip rstrip replace find rfind startswith endswith lower upper
        isdigit isalpha isalnum islower isupper isspace format zfill val next left right children neighbors
        bit_count bit_length bisect_left bisect_right`),
      snippets: [
        ['for in range', 'for ${1:i} in range(${2:n}):\n\t$0'],
        ['for in enumerate', 'for ${1:i}, ${2:x} in enumerate(${3:nums}):\n\t$0'],
        ['def', 'def ${1:name}(${2}):\n\t$0'],
        ['if', 'if ${1:cond}:\n\t$0'],
        ['while', 'while ${1:cond}:\n\t$0'],
        ['class', 'class ${1:Name}:\n\tdef __init__(self${2}):\n\t\t$0'],
        ['lambda', 'lambda ${1:x}: ${0}'],
        ['dfs', 'def dfs(${1:node}):\n\tif not ${1:node}:\n\t\treturn ${2}\n\t$0'],
      ],
    },
    cpp: {
      keywords: w(`auto bool break case catch char class const constexpr continue default delete do double else enum
        explicit extern false float for friend if inline int long mutable namespace new noexcept nullptr operator
        private protected public return short signed sizeof static struct switch template this throw true try
        typedef typename union unsigned using virtual void volatile while include`),
      builtins: w(`std vector string unordered_map unordered_set map set multiset multimap priority_queue queue stack
        deque pair tuple array bitset list make_pair make_tuple sort stable_sort reverse min max swap accumulate
        lower_bound upper_bound binary_search max_element min_element fill iota unique count find to_string stoi
        stol stoll INT_MAX INT_MIN LLONG_MAX LLONG_MIN greater less function ListNode TreeNode Node size_t
        __builtin_popcount __builtin_clz __builtin_ctz gcd lcm memset abs pow sqrt next_permutation cout cin endl
        isdigit isalpha tolower toupper numeric_limits`),
      members: w(`push_back emplace_back pop_back back front size empty begin end rbegin rend insert erase find count
        clear resize reserve assign push pop top emplace first second substr length at val next left right contains
        data swap lower_bound upper_bound append c_str`),
      snippets: [
        ['for i', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n\t$0\n}'],
        ['for each', 'for (auto& ${1:x} : ${2:nums}) {\n\t$0\n}'],
        ['if', 'if (${1:cond}) {\n\t$0\n}'],
        ['while', 'while (${1:cond}) {\n\t$0\n}'],
        ['lambda', 'auto ${1:f} = [&](${2}) {\n\t$0\n};'],
      ],
    },
    java: {
      keywords: w(`abstract boolean break byte case catch char class continue default do double else enum extends final
        finally float for if implements import instanceof int interface long new null package private protected public
        return short static super switch this throw throws true false try void while var`),
      builtins: w(`String StringBuilder Integer Long Double Character Boolean Math Arrays Collections List ArrayList
        LinkedList Map HashMap TreeMap LinkedHashMap Set HashSet TreeSet LinkedHashSet Queue Deque ArrayDeque
        PriorityQueue Stack Iterator Comparator Objects System ListNode TreeNode Node`),
      members: w(`add get set put getOrDefault containsKey containsValue remove size isEmpty contains offer poll peek push
        pop addFirst addLast pollFirst pollLast peekFirst peekLast offerFirst offerLast removeFirst removeLast keySet
        values entrySet getKey getValue length charAt substring toCharArray equals indexOf lastIndexOf append toString
        reverse sort asList fill max min abs pow sqrt MAX_VALUE MIN_VALUE valueOf parseInt compareTo floorKey
        ceilingKey higherKey lowerKey firstKey lastKey floor ceiling first last merge computeIfAbsent putIfAbsent
        stream val next left right out println print isDigit isLetter isLetterOrDigit toLowerCase toUpperCase split
        trim deleteCharAt insert clear addAll copyOf copyOfRange bitCount comparingInt`),
      snippets: [
        ['fori', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}'],
        ['foreach', 'for (${1:int} ${2:x} : ${3:nums}) {\n\t$0\n}'],
        ['if', 'if (${1:cond}) {\n\t$0\n}'],
        ['while', 'while (${1:cond}) {\n\t$0\n}'],
        ['sout', 'System.out.println(${1});'],
      ],
    },
    javascript: {
      keywords: w(`break case catch class const continue debugger default delete do else export extends false finally
        for function if import in instanceof let new null return super switch this throw true try typeof undefined
        var void while yield async await of`),
      builtins: w(`Math Array Map Set Object Number String Infinity NaN parseInt parseFloat console JSON BigInt
        ListNode TreeNode Node`),
      members: w(`push pop shift unshift slice splice map filter reduce forEach sort reverse includes indexOf lastIndexOf
        join split length has get set delete add keys values entries fill concat some every find findIndex at
        charCodeAt fromCharCode substring toString max min floor ceil round abs sqrt pow trunc val next left right
        size log trim repeat padStart padEnd flat from isArray isInteger MAX_SAFE_INTEGER MIN_SAFE_INTEGER
        localeCompare startsWith endsWith toLowerCase toUpperCase`),
      snippets: [
        ['for i', 'for (let ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}'],
        ['for of', 'for (const ${1:x} of ${2:arr}) {\n\t$0\n}'],
        ['if', 'if (${1:cond}) {\n\t$0\n}'],
        ['arrow', 'const ${1:f} = (${2}) => {\n\t$0\n};'],
      ],
    },
    csharp: {
      keywords: w(`abstract as base bool break byte case catch char class const continue decimal default do double else
        enum false finally float for foreach if in int interface internal is long namespace new null object out
        override private protected public readonly ref return static string struct switch this throw true try var
        void while`),
      builtins: w(`List Dictionary HashSet Queue Stack PriorityQueue SortedSet SortedDictionary Math Array String
        StringBuilder Console int.MaxValue int.MinValue ListNode TreeNode`),
      members: w(`Add Remove Contains ContainsKey Count Length Enqueue Dequeue Peek Push Pop Clear Sort Reverse
        TryGetValue Keys Values Append ToString ToCharArray Substring Max Min Abs val next left right`),
      snippets: [['for i', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}'],
                 ['foreach', 'foreach (var ${1:x} in ${2:nums}) {\n\t$0\n}']],
    },
    go: {
      keywords: w(`break case chan const continue default defer else fallthrough for func go goto if import interface
        map package range return select struct switch type var nil true false`),
      builtins: w(`append cap close copy delete len make new panic print println int int64 string bool byte rune
        float64 math sort strings strconv MaxInt32 MinInt32 ListNode TreeNode`),
      members: w(`Ints Strings Slice Sort Abs Max Min Sqrt Itoa Atoi Split Join Contains Val Next Left Right`),
      snippets: [['for range', 'for ${1:i}, ${2:v} := range ${3:nums} {\n\t$0\n}'],
                 ['for i', 'for ${1:i} := 0; ${1:i} < ${2:n}; ${1:i}++ {\n\t$0\n}']],
    },
    rust: {
      keywords: w(`as break const continue crate else enum false fn for if impl in let loop match mod move mut pub ref
        return self Self static struct super trait true type unsafe use where while`),
      builtins: w(`Vec String HashMap HashSet BTreeMap BTreeSet VecDeque BinaryHeap Option Some None Result Ok Err
        Box Rc RefCell i32 i64 usize u8 char bool vec! println!`),
      members: w(`push pop len is_empty iter iter_mut into_iter collect map filter insert remove get get_mut
        contains contains_key entry or_insert unwrap unwrap_or clone sort sort_unstable reverse chars as_bytes
        push_back pop_front push_front pop_back max min abs borrow borrow_mut`),
      snippets: [['for in', 'for ${1:x} in ${2:iter} {\n\t$0\n}']],
    },
    kotlin: {
      keywords: w(`as break class continue do else false for fun if in interface is null object package return super
        this throw true try typealias val var when while`),
      builtins: w(`IntArray mutableListOf mutableMapOf mutableSetOf listOf mapOf setOf HashMap ArrayDeque
        PriorityQueue maxOf minOf Int Long String Char Boolean`),
      members: w(`add remove size isEmpty contains get put getOrDefault indices first last sorted sortedBy reversed
        forEach map filter sum toInt toString length`),
      snippets: [['for in', 'for (${1:i} in ${2:0 until n}) {\n\t$0\n}']],
    },
    swift: {
      keywords: w(`class deinit enum extension func import init inout let protocol struct subscript var break case
        continue default defer do else for guard if in repeat return switch where while nil true false self`),
      builtins: w(`Int String Character Bool Array Dictionary Set max min abs print stride`),
      members: w(`append removeLast removeFirst count isEmpty contains insert remove sorted sort reversed first last
        keys values`),
      snippets: [['for in', 'for ${1:i} in ${2:0..<n} {\n\t$0\n}']],
    },
  };
  VOCAB.typescript = VOCAB.javascript;
  VOCAB.c = {
    keywords: w(`auto break case char const continue default do double else enum extern float for if int long
      return short signed sizeof static struct switch typedef union unsigned void while bool true false NULL`),
    builtins: w(`malloc calloc free memset memcpy qsort printf strlen strcmp abs INT_MAX INT_MIN`),
    members: w(`val next left right`),
    snippets: [VOCAB.cpp.snippets[0], VOCAB.cpp.snippets[2], VOCAB.cpp.snippets[3]],
  };

  // =====================================================================
  // Type tables
  //   m: methods, f: fields, r: method -> return type, fr: field -> type,
  //   idx: type of x[i], it: type when iterating, ext: inherit from, rd: default return
  //   Type specs use internal names; T0/T1 are the receiver's type arguments, '@' is the receiver itself.
  // =====================================================================
  const PY = {
    br: ['[', ']'],
    display: { counter: 'Counter', sortedlist: 'SortedList', listnode: 'ListNode', treenode: 'TreeNode', node: 'Node' },
    types: {
      list: { m: 'append extend insert pop remove index count sort reverse copy clear',
              r: { pop: 'T0', copy: '@', index: 'int', count: 'int' }, idx: 'T0', it: 'T0' },
      dict: { m: 'keys values items get setdefault pop popitem update copy clear fromkeys',
              r: { get: 'T1', setdefault: 'T1', pop: 'T1', copy: '@', keys: 'list<T0>', values: 'list<T1>' }, idx: 'T1', it: 'T0' },
      defaultdict: { ext: 'dict', f: 'default_factory' },
      counter: { ext: 'dict', m: 'most_common elements total subtract', r: { most_common: 'list<tuple>', get: 'int' }, idx: 'int', it: 'T0' },
      set: { m: `add remove discard pop clear copy union intersection difference symmetric_difference issubset
                 issuperset isdisjoint update intersection_update difference_update`,
             r: { pop: 'T0', copy: '@', union: '@', intersection: '@', difference: '@' }, it: 'T0' },
      frozenset: { m: 'copy union intersection difference symmetric_difference issubset issuperset isdisjoint', it: 'T0' },
      deque: { m: 'append appendleft pop popleft extend extendleft rotate clear copy count index insert remove reverse',
               f: 'maxlen', r: { pop: 'T0', popleft: 'T0', copy: '@' }, idx: 'T0', it: 'T0' },
      str: { m: `join split rsplit splitlines strip lstrip rstrip replace find rfind index rindex count startswith
                 endswith lower upper title capitalize swapcase isdigit isalpha isalnum islower isupper isspace
                 isnumeric isdecimal zfill center ljust rjust format partition rpartition encode`,
             r: { split: 'list<str>', rsplit: 'list<str>', splitlines: 'list<str>', find: 'int', rfind: 'int',
                  index: 'int', rindex: 'int', count: 'int', encode: null, partition: 'tuple', rpartition: 'tuple',
                  startswith: null, endswith: null },
             rd: 'str', idx: 'str', it: 'str' },
      int: { m: 'bit_count bit_length to_bytes conjugate as_integer_ratio', f: 'real imag numerator denominator', r: { bit_count: 'int', bit_length: 'int' } },
      float: { m: 'is_integer as_integer_ratio hex conjugate', f: 'real imag' },
      tuple: { m: 'count index', idx: 'T0', it: 'T0' },
      range: { m: 'count index', f: 'start stop step', idx: 'int', it: 'int' },
      sortedlist: { m: 'add update remove discard pop clear bisect_left bisect_right bisect count index irange islice copy',
                    r: { pop: 'T0', copy: '@' }, idx: 'T0', it: 'T0' },
      listnode: { f: 'val next', fr: { next: 'listnode', val: 'int' } },
      treenode: { f: 'val left right', fr: { left: 'treenode', right: 'treenode', val: 'int' } },
      node: { f: 'val next prev child left right random children neighbors',
              fr: { next: 'node', prev: 'node', child: 'node', left: 'node', right: 'node', random: 'node', val: 'int',
                    children: 'list<node>', neighbors: 'list<node>' } },
    },
    alias: {
      list: 'list', List: 'list', dict: 'dict', Dict: 'dict', OrderedDict: 'dict', defaultdict: 'defaultdict',
      DefaultDict: 'defaultdict', Counter: 'counter', set: 'set', Set: 'set', frozenset: 'frozenset',
      FrozenSet: 'frozenset', deque: 'deque', Deque: 'deque', str: 'str', int: 'int', bool: 'int', float: 'float',
      tuple: 'tuple', Tuple: 'tuple', range: 'range', SortedList: 'sortedlist', ListNode: 'listnode',
      TreeNode: 'treenode', Node: 'node',
    },
    // calls like sorted(x) / len(x)
    ctor: { sorted: 'list', reversed: 'list', len: 'int', ord: 'int', abs: 'int', sum: 'int', input: 'str',
            chr: 'str', bin: 'str', hex: 'str', oct: 'str', repr: 'str' },
    statics: {
      heapq: { m: 'heappush heappop heapify heappushpop heapreplace nlargest nsmallest merge', r: { nlargest: 'list', nsmallest: 'list' } },
      math: { m: 'gcd lcm sqrt isqrt ceil floor log log2 log10 exp pow comb perm factorial hypot fabs prod dist isclose', f: 'inf pi e',
              r: { gcd: 'int', lcm: 'int', isqrt: 'int', ceil: 'int', floor: 'int', comb: 'int', perm: 'int', factorial: 'int' } },
      bisect: { m: 'bisect bisect_left bisect_right insort insort_left insort_right', rd: 'int' },
      collections: { m: 'defaultdict Counter deque OrderedDict namedtuple',
                     r: { defaultdict: 'defaultdict', Counter: 'counter', deque: 'deque', OrderedDict: 'dict' } },
      itertools: { m: 'accumulate permutations combinations combinations_with_replacement product groupby chain pairwise zip_longest count cycle repeat islice starmap' },
      functools: { m: 'lru_cache cache reduce cmp_to_key partial' },
      string: { f: 'ascii_lowercase ascii_uppercase ascii_letters digits punctuation whitespace', rd: null,
                fr: { ascii_lowercase: 'str', ascii_uppercase: 'str', ascii_letters: 'str', digits: 'str', punctuation: 'str' } },
      sys: { m: 'setrecursionlimit', f: 'maxsize' },
      random: { m: 'randint random choice shuffle sample randrange uniform' },
    },
  };

  const cppSeqIter = 'iter<T0>';
  const cppMapIter = 'iter<pair<T0,T1>>';
  const CPP = {
    br: ['<', '>'],
    display: { umap: 'unordered_map', uset: 'unordered_set', pq: 'priority_queue', listnode: 'ListNode',
               treenode: 'TreeNode', node: 'Node', iter: 'iterator', prim: 'value' },
    types: {
      vector: { m: 'push_back emplace_back pop_back back front size empty begin end rbegin rend insert erase clear resize reserve assign at data swap',
                r: { back: 'T0', front: 'T0', at: 'T0', begin: cppSeqIter, end: cppSeqIter, rbegin: cppSeqIter, rend: cppSeqIter, insert: cppSeqIter, erase: cppSeqIter, size: 'prim' },
                idx: 'T0', it: 'T0' },
      deque: { ext: 'vector', m: 'push_front emplace_front pop_front' },
      array: { m: 'size empty begin end fill front back at data swap', r: { front: 'T0', back: 'T0', at: 'T0' }, idx: 'T0', it: 'T0' },
      string: { m: `push_back pop_back back front size length empty begin end substr find rfind find_first_of
                    find_last_of find_first_not_of append insert erase replace clear compare c_str at swap resize
                    starts_with ends_with contains`,
                r: { substr: 'string', append: 'string', insert: 'string', erase: 'string', replace: 'string' },
                rd: 'prim', idx: 'prim', it: 'prim' },
      umap: { m: 'size empty begin end insert emplace try_emplace erase find count contains clear at',
              r: { at: 'T1', find: cppMapIter, begin: cppMapIter, end: cppMapIter }, idx: 'T1', it: 'pair<T0,T1>' },
      map: { ext: 'umap', m: 'lower_bound upper_bound rbegin rend',
             r: { lower_bound: cppMapIter, upper_bound: cppMapIter, rbegin: cppMapIter, rend: cppMapIter } },
      uset: { m: 'size empty begin end insert emplace erase find count contains clear',
              r: { find: cppSeqIter, begin: cppSeqIter, end: cppSeqIter }, it: 'T0' },
      set: { ext: 'uset', m: 'lower_bound upper_bound rbegin rend',
             r: { lower_bound: cppSeqIter, upper_bound: cppSeqIter, rbegin: cppSeqIter, rend: cppSeqIter } },
      pq: { m: 'push emplace pop top size empty', r: { top: 'T0' } },
      queue: { m: 'push emplace pop front back size empty', r: { front: 'T0', back: 'T0' } },
      stack: { m: 'push emplace pop top size empty', r: { top: 'T0' } },
      pair: { f: 'first second', fr: { first: 'T0', second: 'T1' } },
      listnode: { f: 'val next', fr: { next: 'listnode', val: 'prim' } },
      treenode: { f: 'val left right', fr: { left: 'treenode', right: 'treenode', val: 'prim' } },
      node: { f: 'val next left right random children neighbors',
              fr: { next: 'node', left: 'node', right: 'node', random: 'node', val: 'prim', children: 'vector<node>', neighbors: 'vector<node>' } },
      prim: {},
    },
    alias: {
      vector: 'vector', deque: 'deque', array: 'array', string: 'string', unordered_map: 'umap',
      unordered_multimap: 'umap', map: 'map', multimap: 'map', unordered_set: 'uset', unordered_multiset: 'uset',
      set: 'set', multiset: 'set', priority_queue: 'pq', queue: 'queue', stack: 'stack', pair: 'pair',
      ListNode: 'listnode', TreeNode: 'treenode', Node: 'node',
      int: 'prim', long: 'prim', short: 'prim', char: 'prim', bool: 'prim', double: 'prim', float: 'prim',
      size_t: 'prim', unsigned: 'prim', signed: 'prim', int64_t: 'prim', uint64_t: 'prim', int32_t: 'prim', uint32_t: 'prim',
    },
    ctor: { make_pair: 'pair', to_string: 'string' },
    statics: {},
  };

  const jList = {
    m: 'add addAll get set remove size isEmpty contains indexOf lastIndexOf clear sort subList toArray forEach stream iterator removeIf equals',
    r: { get: 'T0', remove: 'T0', set: 'T0', subList: '@', size: 'prim', indexOf: 'prim' }, idx: 'T0', it: 'T0',
  };
  const jDeque = {
    m: `offer poll peek add remove push pop size isEmpty contains clear offerFirst offerLast pollFirst pollLast
        peekFirst peekLast addFirst addLast removeFirst removeLast getFirst getLast element iterator descendingIterator`,
    r: { poll: 'T0', peek: 'T0', pop: 'T0', remove: 'T0', pollFirst: 'T0', pollLast: 'T0', peekFirst: 'T0',
         peekLast: 'T0', removeFirst: 'T0', removeLast: 'T0', getFirst: 'T0', getLast: 'T0', element: 'T0', size: 'prim' },
    it: 'T0',
  };
  const jNavKeys = { firstKey: 'T0', lastKey: 'T0', floorKey: 'T0', ceilingKey: 'T0', higherKey: 'T0', lowerKey: 'T0' };
  const jNavEntries = {};
  'firstEntry lastEntry floorEntry ceilingEntry higherEntry lowerEntry pollFirstEntry pollLastEntry'.split(' ').forEach((k) => { jNavEntries[k] = 'entry<T0,T1>'; });
  const JAVA = {
    br: ['<', '>'],
    display: { string: 'String', stringbuilder: 'StringBuilder', list: 'List', linkedlist: 'LinkedList', map: 'Map',
               treemap: 'TreeMap', entry: 'Map.Entry', set: 'Set', treeset: 'TreeSet', deque: 'Deque',
               pq: 'PriorityQueue', stack: 'Stack', integer: 'Integer', printstream: 'PrintStream',
               listnode: 'ListNode', treenode: 'TreeNode', node: 'Node', prim: 'value' },
    types: {
      string: { m: `length charAt substring indexOf lastIndexOf equals equalsIgnoreCase compareTo contains startsWith
                    endsWith isEmpty toCharArray toLowerCase toUpperCase trim strip split replace replaceAll chars repeat
                    matches hashCode concat`,
                r: { substring: 'string', toLowerCase: 'string', toUpperCase: 'string', trim: 'string', strip: 'string',
                     replace: 'string', replaceAll: 'string', repeat: 'string', concat: 'string',
                     split: 'array<string>', toCharArray: 'array<prim>' }, rd: 'prim' },
      stringbuilder: { m: 'append insert reverse deleteCharAt delete setCharAt charAt length toString indexOf setLength replace substring',
                       r: { append: '@', insert: '@', reverse: '@', deleteCharAt: '@', delete: '@', replace: '@',
                            toString: 'string', substring: 'string' }, rd: 'prim' },
      list: jList,
      linkedlist: { m: jList.m + ' ' + jDeque.m, r: Object.assign({}, jList.r, jDeque.r), idx: 'T0', it: 'T0' },
      map: { m: 'put get getOrDefault containsKey containsValue remove size isEmpty keySet values entrySet putIfAbsent computeIfAbsent computeIfPresent compute merge clear forEach replace',
             r: { get: 'T1', getOrDefault: 'T1', computeIfAbsent: 'T1', computeIfPresent: 'T1', compute: 'T1', remove: 'T1',
                  put: 'T1', merge: 'T1', putIfAbsent: 'T1', keySet: 'set<T0>', values: 'list<T1>',
                  entrySet: 'set<entry<T0,T1>>', size: 'prim' } },
      treemap: { ext: 'map', m: `firstKey lastKey floorKey ceilingKey higherKey lowerKey firstEntry lastEntry floorEntry
                                 ceilingEntry higherEntry lowerEntry pollFirstEntry pollLastEntry headMap tailMap subMap descendingMap`,
                 r: Object.assign({ headMap: '@', tailMap: '@', subMap: '@', descendingMap: '@' }, jNavKeys, jNavEntries) },
      entry: { m: 'getKey getValue setValue', r: { getKey: 'T0', getValue: 'T1' } },
      set: { m: 'add remove contains size isEmpty clear addAll removeAll retainAll containsAll iterator stream forEach', r: { size: 'prim' }, it: 'T0' },
      treeset: { ext: 'set', m: 'first last floor ceiling higher lower pollFirst pollLast headSet tailSet subSet descendingSet',
                 r: { first: 'T0', last: 'T0', floor: 'T0', ceiling: 'T0', higher: 'T0', lower: 'T0', pollFirst: 'T0',
                      pollLast: 'T0', headSet: '@', tailSet: '@', subSet: '@', descendingSet: '@' } },
      deque: jDeque,
      pq: { m: 'offer poll peek add remove size isEmpty contains clear iterator', r: { poll: 'T0', peek: 'T0', remove: 'T0', size: 'prim' }, it: 'T0' },
      stack: { m: 'push pop peek empty isEmpty size search get', r: { push: 'T0', pop: 'T0', peek: 'T0', get: 'T0', size: 'prim' }, idx: 'T0', it: 'T0' },
      array: { f: 'length', m: 'clone', fr: { length: 'prim' }, r: { clone: '@' }, idx: 'T0', it: 'T0' },
      integer: { m: 'intValue longValue doubleValue compareTo equals hashCode toString', r: { toString: 'string' }, rd: 'prim' },
      printstream: { m: 'println print printf' },
      listnode: { f: 'val next', fr: { next: 'listnode', val: 'prim' } },
      treenode: { f: 'val left right', fr: { left: 'treenode', right: 'treenode', val: 'prim' } },
      node: { f: 'val next left right random children neighbors',
              fr: { next: 'node', left: 'node', right: 'node', random: 'node', val: 'prim', children: 'list<node>', neighbors: 'list<node>' } },
      prim: {},
    },
    alias: {
      String: 'string', StringBuilder: 'stringbuilder', StringBuffer: 'stringbuilder', List: 'list',
      ArrayList: 'list', Collection: 'list', LinkedList: 'linkedlist', Map: 'map', HashMap: 'map',
      LinkedHashMap: 'map', Hashtable: 'map', TreeMap: 'treemap', SortedMap: 'treemap', NavigableMap: 'treemap',
      'Map.Entry': 'entry', Entry: 'entry', Set: 'set', HashSet: 'set', LinkedHashSet: 'set', TreeSet: 'treeset',
      SortedSet: 'treeset', NavigableSet: 'treeset', Queue: 'deque', Deque: 'deque', ArrayDeque: 'deque',
      PriorityQueue: 'pq', Stack: 'stack', Integer: 'integer', Long: 'integer', Double: 'integer',
      ListNode: 'listnode', TreeNode: 'treenode', Node: 'node',
      int: 'prim', long: 'prim', short: 'prim', byte: 'prim', char: 'prim', boolean: 'prim', double: 'prim', float: 'prim',
    },
    statics: {
      Math: { m: 'max min abs pow sqrt floor ceil round random log log10 floorMod floorDiv hypot signum cbrt exp', f: 'PI E', rd: 'prim' },
      Arrays: { m: 'sort fill asList stream copyOf copyOfRange equals toString binarySearch deepToString hashCode',
                r: { asList: 'list', toString: 'string', deepToString: 'string' } },
      Collections: { m: 'sort reverse max min swap shuffle frequency emptyList unmodifiableList nCopies reverseOrder addAll' },
      Integer: { m: 'parseInt valueOf toString toBinaryString bitCount compare sum max min signum highestOneBit numberOfTrailingZeros',
                 f: 'MAX_VALUE MIN_VALUE', r: { valueOf: 'integer', toString: 'string', toBinaryString: 'string' }, rd: 'prim' },
      Long: { m: 'parseLong valueOf toString bitCount compare sum max min', f: 'MAX_VALUE MIN_VALUE', r: { toString: 'string' }, rd: 'prim' },
      Double: { m: 'parseDouble valueOf compare isNaN', f: 'MAX_VALUE MIN_VALUE POSITIVE_INFINITY NEGATIVE_INFINITY', rd: 'prim' },
      Character: { m: 'isDigit isLetter isLetterOrDigit isUpperCase isLowerCase toUpperCase toLowerCase getNumericValue isWhitespace isAlphabetic toString',
                   r: { toString: 'string' }, rd: 'prim' },
      String: { m: 'valueOf join format copyValueOf', rd: 'string' },
      System: { m: 'arraycopy currentTimeMillis nanoTime', f: 'out err', fr: { out: 'printstream', err: 'printstream' } },
      Objects: { m: 'equals hash hashCode isNull nonNull requireNonNull' },
      Comparator: { m: 'comparingInt comparing comparingLong comparingDouble reverseOrder naturalOrder' },
      Boolean: { m: 'parseBoolean valueOf toString' },
    },
  };

  const JS = {
    br: ['<', '>'],
    display: { array: 'Array', map: 'Map', set: 'Set', listnode: 'ListNode', treenode: 'TreeNode', node: 'Node', prim: 'value' },
    types: {
      array: { f: 'length', m: `push pop shift unshift slice splice map filter reduce reduceRight forEach sort reverse
                  includes indexOf lastIndexOf join concat some every find findIndex findLast findLastIndex at fill
                  flat flatMap keys values entries toSorted toReversed with`,
               fr: { length: 'number' },
               r: { pop: 'T0', shift: 'T0', at: 'T0', find: 'T0', findLast: 'T0', slice: '@', filter: '@', sort: '@',
                    reverse: '@', concat: '@', toSorted: '@', toReversed: '@', splice: '@', fill: '@', with: '@',
                    map: 'array', join: 'string', indexOf: 'number', findIndex: 'number', push: 'number' },
               idx: 'T0', it: 'T0' },
      string: { f: 'length', m: `charAt charCodeAt codePointAt at indexOf lastIndexOf includes startsWith endsWith slice
                   substring substr split trim trimStart trimEnd toLowerCase toUpperCase repeat padStart padEnd replace
                   replaceAll localeCompare concat match`,
                fr: { length: 'number' },
                r: { split: 'array<string>', charCodeAt: 'number', codePointAt: 'number', indexOf: 'number',
                     lastIndexOf: 'number', localeCompare: 'number', includes: 'prim', startsWith: 'prim',
                     endsWith: 'prim', match: null },
                rd: 'string', idx: 'string', it: 'string' },
      map: { f: 'size', m: 'get set has delete clear keys values entries forEach', fr: { size: 'number' },
             r: { get: 'T1', set: '@' }, it: 'array' },
      set: { f: 'size', m: 'add has delete clear keys values entries forEach', fr: { size: 'number' }, r: { add: '@' }, it: 'T0' },
      number: { m: 'toString toFixed toPrecision', rd: 'string' },
      listnode: { f: 'val next', fr: { next: 'listnode', val: 'number' } },
      treenode: { f: 'val left right', fr: { left: 'treenode', right: 'treenode', val: 'number' } },
      node: { f: 'val next left right random children neighbors',
              fr: { next: 'node', left: 'node', right: 'node', random: 'node', val: 'number', children: 'array<node>', neighbors: 'array<node>' } },
      prim: {},
    },
    alias: {
      Array: 'array', ReadonlyArray: 'array', string: 'string', String: 'string', number: 'number', Number: 'number',
      bigint: 'prim', boolean: 'prim', Map: 'map', Set: 'set', ListNode: 'listnode', TreeNode: 'treenode',
      Node: 'node', _Node: 'node',
    },
    ctor: { parseInt: 'number', parseFloat: 'number' },
    statics: {
      Math: { m: 'max min abs floor ceil round trunc sqrt cbrt pow log log2 log10 exp random sign hypot', f: 'PI E', rd: 'number' },
      Object: { m: 'keys values entries assign freeze fromEntries create',
                r: { keys: 'array<string>', values: 'array', entries: 'array<array>' } },
      Array: { m: 'from isArray of', r: { from: 'array', of: 'array' } },
      Number: { m: 'isInteger parseInt parseFloat isNaN isFinite isSafeInteger',
                f: 'MAX_SAFE_INTEGER MIN_SAFE_INTEGER MAX_VALUE MIN_VALUE POSITIVE_INFINITY NEGATIVE_INFINITY EPSILON',
                fr: { MAX_SAFE_INTEGER: 'number', MIN_SAFE_INTEGER: 'number', MAX_VALUE: 'number', MIN_VALUE: 'number' },
                r: { parseInt: 'number', parseFloat: 'number' } },
      String: { m: 'fromCharCode fromCodePoint raw', rd: 'string' },
      JSON: { m: 'stringify parse', r: { stringify: 'string' } },
      console: { m: 'log error warn info table' },
    },
  };

  const LANGS = { python: PY, cpp: CPP, java: JAVA, javascript: JS, typescript: JS };
  const TYPED = new Set(Object.keys(LANGS));
  for (const k of Object.keys(LANGS)) LANGS[k] = Object.assign({ id: k }, LANGS[k]);
  LANGS.typescript.id = 'typescript';

  // =====================================================================
  // Small parsing helpers
  // =====================================================================
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const nameRe = (name) => (name.includes('.') ? '\\b' : '(?<![\\w$.])') + esc(name) + '(?![\\w$])';

  function splitTop(s) {
    const out = []; let d = 0, cur = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if ('[<({'.includes(ch)) d++;
      else if (']>)}'.includes(ch) && !(ch === '>' && (s[i - 1] === '=' || s[i - 1] === '-'))) d--;
      if (ch === ',' && d === 0) { out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur.trim()) out.push(cur);
    return out.map((x) => x.trim());
  }

  // "vector<vector<int>>", "List[int]", "int[][]", "Map.Entry<K,V>" -> { name, args }
  function parseRaw(s) {
    s = String(s || '').trim().replace(/^(?:const|final|struct|readonly)\s+/, '').replace(/[&*\s]+$/, '');
    let arrays = 0;
    while (/\[\s*\]$/.test(s)) { s = s.replace(/\[\s*\]$/, '').trim(); arrays++; }
    let node;
    const m = /^([\w$.:]+)\s*([<[])([\s\S]*)([>\]])$/.exec(s);
    if (m) node = { name: m[1], args: splitTop(m[3]).map(parseRaw) };
    else node = { name: s, args: [] };
    while (arrays-- > 0) node = { name: '[]', args: [node] };
    return node;
  }

  function parseTypeText(text) {
    const parts = splitPipes(String(text || '')).filter((p) => !/^(?:null|undefined|None)$/.test(p));
    return parseRaw(parts[0] || '');
  }
  function splitPipes(s) {
    const out = []; let d = 0, cur = '';
    for (const ch of s) {
      if ('[<({'.includes(ch)) d++; else if (']>)}'.includes(ch)) d--;
      if (ch === '|' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  function canon(L, raw) {
    if (!raw) return null;
    const name = raw.name.replace(/^(?:std::|typing\.|collections\.|java\.util\.|java\.lang\.)/, '');
    if (name === 'Optional' || name === 'Readonly') return canon(L, raw.args[0]);
    if (name === '[]') return { n: 'array', a: [canon(L, raw.args[0])] };
    const n = L.alias[name];
    if (!n) return null;
    return { n, a: raw.args.map((x) => canon(L, x)) };
  }

  function specT(spec, recv) {
    if (!spec) return null;
    if (spec === '@') return recv;
    const conv = (r) => {
      if (r.name === 'T0') return (recv && recv.a[0]) || null;
      if (r.name === 'T1') return (recv && recv.a[1]) || null;
      return { n: r.name, a: r.args.map(conv) };
    };
    return conv(parseRaw(spec));
  }

  // Walk a type's ext chain looking for a property (key: 'r' | 'fr' | 'idx' | 'it' | 'rd').
  function prop(L, n, key, name) {
    let d = L.types[n], guard = 0;
    while (d && guard++ < 6) {
      const v = d[key];
      if (name === undefined) { if (v !== undefined) return v; }
      else if (v && Object.prototype.hasOwnProperty.call(v, name)) return v[name];
      d = d.ext ? L.types[d.ext] : null;
    }
    return undefined;
  }

  function matchFwd(s, i) {
    const open = s[i], close = { '[': ']', '(': ')', '{': '}' }[open];
    let d = 0;
    for (let j = i; j < s.length; j++) {
      if (s[j] === open) d++;
      else if (s[j] === close && --d === 0) return j;
    }
    return s.length;
  }

  function restOfLine(text, i) {
    const e = text.indexOf('\n', i);
    return text.slice(i, e < 0 ? text.length : e);
  }

  // Read a type annotation forward, stopping at a depth-0 stop char or newline.
  function readTypeFwd(text, i, stops) {
    let d = 0, out = '';
    for (; i < text.length; i++) {
      const ch = text[i];
      if (ch === '\n' && d === 0) break;
      if ('[<({'.includes(ch)) d++;
      else if (']>)}'.includes(ch)) { if (d === 0) break; d--; }
      else if (d === 0 && stops.includes(ch)) break;
      out += ch;
    }
    return out.trim();
  }

  // Read an expression forward until ; or newline (or an unmatched closer / stop char) at depth 0.
  function readExprFwd(text, i, stops) {
    let d = 0, out = '';
    for (; i < text.length; i++) {
      const ch = text[i];
      if ('([{'.includes(ch)) d++;
      else if (')]}'.includes(ch)) { if (d === 0) break; d--; }
      else if (d === 0 && (ch === ';' || ch === '\n' || (stops && stops.includes(ch)))) break;
      out += ch;
    }
    return out.trim();
  }

  // =====================================================================
  // Backward expression parser: "self.graph[u].pop()" -> base + ops
  // =====================================================================
  function parseChain(s) {
    let i = s.length;
    const ops = [];
    const ws = () => { while (i > 0 && /\s/.test(s[i - 1])) i--; };
    const back = (close, open) => {
      let d = 0;
      for (let j = i - 1; j >= 0; j--) {
        const c = s[j];
        if (c === close) d++;
        else if (c === open && --d === 0) return j;
      }
      return -1;
    };
    const accessor = () => {
      const two = s.slice(i - 2, i);
      if (two === '->' || two === '?.') { i -= 2; return true; }
      if (s[i - 1] === '.' && s[i - 2] !== '.') { i -= 1; return true; }
      return false;
    };
    const ident = () => {
      const m = /[A-Za-z_$][\w$]*$/.exec(s.slice(Math.max(0, i - 200), i));
      if (!m) return null;
      i -= m[0].length;
      if (i > 0 && /[\w$]/.test(s[i - 1])) return null; // part of a number like 1e5
      return m[0];
    };
    const done = (base) => ({ base, ops: ops.reverse(), start: i });

    for (let g = 0; g < 40; g++) {
      ws();
      if (i <= 0) return null;
      const c = s[i - 1];
      if (c === ')') {
        const j = back(')', '(');
        if (j < 0) return null;
        const args = s.slice(j + 1, i - 1);
        i = j; ws();
        let gen = '';
        if (s[i - 1] === '>') {
          const k = back('>', '<');
          if (k < 0) return null;
          gen = s.slice(k, i); i = k; ws();
        }
        const name = ident();
        if (!name) return null;
        if (accessor()) { ops.push({ k: 'call', name, args }); continue; }
        const ns = /[A-Za-z_]\w*\s*::\s*$/.exec(s.slice(0, i));
        if (ns) i -= ns[0].length;
        const pre = s.slice(0, i);
        const isNew = /\bnew\s+$/.test(pre);
        if (isNew) i = pre.replace(/\bnew\s+$/, '').length;
        return done({ k: 'ctor', name, gen, args, isNew });
      }
      if (c === ']') {
        const j = back(']', '[');
        if (j < 0) return null;
        const inner = s.slice(j + 1, i - 1);
        i = j;
        let k = i;
        while (k > 0 && /[ \t]/.test(s[k - 1])) k--;
        const pre = s.slice(0, k);
        if (k > 0 && /[\w$)\]'"`]/.test(s[k - 1]) && !/\b(?:return|in|of|yield|else|and|or|not|await|is)$/.test(pre)) {
          ops.push({ k: 'index', inner });
          continue;
        }
        return done({ k: 'list', inner });
      }
      if (c === '}') {
        const j = back('}', '{');
        if (j < 0) return null;
        const inner = s.slice(j + 1, i - 1);
        i = j;
        return done({ k: 'brace', inner });
      }
      if (c === '"' || c === "'" || c === '`') {
        let j = i - 2;
        while (j >= 0 && !(s[j] === c && s[j - 1] !== '\\')) j--;
        if (j < 0) return null;
        i = j;
        while (i > 0 && /[frbuFRBU]/.test(s[i - 1]) && !/[\w$]/.test(s[i - 2] || '')) i--;
        return done({ k: 'str' });
      }
      const name = ident();
      if (!name) return null;
      if (accessor()) { ops.push({ k: 'field', name }); continue; }
      return done({ k: 'var', name });
    }
    return null;
  }

  // =====================================================================
  // Declaration finders: where might `name` have been given a type?
  //   -> [{ pos, type } | { pos, expr } | { pos, iter } | { pos, pyfor }]
  // =====================================================================
  function findPython(text, name) {
    const out = [];
    const N = nameRe(name);
    let re, m;
    // Annotations: params `nums: List[int]` and statements `x: int = 0`
    re = new RegExp('(?:^[ \\t]*|[(,][ \\t]*)' + N + '[ \\t]*:(?!=)', 'gm');
    while ((m = re.exec(text))) out.push({ pos: m.index, type: readTypeFwd(text, m.index + m[0].length, ',)=:') });
    // Assignments: `x = ...` / `self.x = ...` at statement start
    re = new RegExp('^[ \\t]*' + N + '[ \\t]*(?::[^=\\n]*)?=(?!=)', 'gm');
    while ((m = re.exec(text))) out.push({ pos: m.index, expr: restOfLine(text, m.index + m[0].length) });
    // for-loops
    if (!name.includes('.')) {
      re = /\bfor\s+([^\n]+?)\s+in\s+/g;
      while ((m = re.exec(text))) {
        const targets = m[1].replace(/[()[\]]/g, '').split(',').map((x) => x.trim()).filter(Boolean);
        const idx = targets.indexOf(name);
        if (idx >= 0) out.push({ pos: m.index, pyfor: { expr: readTypeFwd(text, m.index + m[0].length, ':'), idx, n: targets.length } });
      }
    }
    return out;
  }

  const CLIKE_SKIP = new Set(`return new else case throw instanceof import package extends implements class interface
    enum throws assert yield goto delete typename sizeof using namespace struct co_return do in of typeof await not
    and or is if while for switch catch`.split(/\s+/));

  function findCLike(text, name) {
    const out = [];
    const re = new RegExp('(?<![\\w$.>])' + esc(name) + '(?![\\w$])', 'g');
    let m;
    while ((m = re.exec(text))) {
      const p = m.index;
      const after = text.slice(p + name.length);
      if (!/^\s*(?:[;,=(){}[:)]|$)/.test(after)) continue;
      let k = p;
      while (k > 0 && /[\s&*]/.test(text[k - 1])) k--;
      if (k === p && !/\s/.test(text[p - 1] || '')) { /* must be separated */ }
      let arrays = 0;
      while (/\[\s*\]$/.test(text.slice(Math.max(0, k - 8), k))) {
        const mm = /\[\s*\]$/.exec(text.slice(Math.max(0, k - 8), k));
        k -= mm[0].length;
        while (k > 0 && /\s/.test(text[k - 1])) k--;
        arrays++;
      }
      let gen = '';
      if (text[k - 1] === '>') {
        let d = 0, j = k - 1;
        for (; j >= 0; j--) {
          if (text[j] === '>') d++;
          else if (text[j] === '<' && --d === 0) break;
          else if (text[j] === ';' || text[j] === '{' || text[j] === '}') { j = -1; break; }
        }
        if (j < 0) continue;
        gen = text.slice(j, k);
        k = j;
        while (k > 0 && /\s/.test(text[k - 1])) k--;
      }
      const im = /[A-Za-z_$][\w$]*(?:(?:\.|::)[A-Za-z_$][\w$]*)*$/.exec(text.slice(Math.max(0, k - 120), k));
      if (!im) continue;
      const typeName = im[0];
      if (CLIKE_SKIP.has(typeName)) continue;
      if (!gen && !arrays && k === p) continue;
      if (typeName === 'auto' || typeName === 'var' || typeName === 'const' || typeName === 'let') {
        const am = /^\s*(=|:)/.exec(after);
        if (!am) continue;
        const startExpr = p + name.length + am[0].length;
        if (am[1] === '=') out.push({ pos: p, expr: readExprFwd(text, startExpr) });
        else out.push({ pos: p, iter: readExprFwd(text, startExpr, ')') });
        continue;
      }
      let typeText = typeName + gen + '[]'.repeat(arrays);
      const nm = /^\s*=\s*new\s+([A-Za-z_$][\w$]*)/.exec(after);
      if (nm && !arrays) typeText = nm[1] + gen;
      out.push({ pos: p, type: typeText });
    }
    return out;
  }

  function findJS(text, name, ts) {
    const out = [];
    const N = nameRe(name);
    let re, m;
    if (!name.includes('.')) {
      re = new RegExp('@param\\s*\\{([^}]*)\\}\\s*\\[?' + esc(name) + '(?![\\w$])', 'g');
      while ((m = re.exec(text))) out.push({ pos: m.index, type: m[1] });
      re = new RegExp('@type\\s*\\{([^}]*)\\}[^\\n]*\\n[^\\n]*?\\b(?:let|const|var)\\s+' + esc(name) + '(?![\\w$])', 'g');
      while ((m = re.exec(text))) out.push({ pos: m.index, type: m[1] });
    }
    if (ts) {
      re = new RegExp('(?:[(,][ \\t]*|\\b(?:let|const|var)\\s+|^[ \\t]*(?:(?:private|public|protected|readonly|static)\\s+)*)' + N + '[ \\t]*\\??[ \\t]*:(?!:)', 'gm');
      while ((m = re.exec(text))) out.push({ pos: m.index, type: readTypeFwd(text, m.index + m[0].length, ',)=;{') });
    }
    re = new RegExp('(?:\\b(?:let|const|var)\\s+|^[ \\t]*|[;{][ \\t]*)' + N + '\\s*(?::[^=\\n]*)?=(?![=>])', 'gm');
    while ((m = re.exec(text))) out.push({ pos: m.index, expr: readExprFwd(text, m.index + m[0].length) });
    if (!name.includes('.')) {
      re = new RegExp('for\\s*\\(\\s*(?:const|let|var)\\s+' + esc(name) + '\\s+of\\s+', 'g');
      while ((m = re.exec(text))) out.push({ pos: m.index, iter: readExprFwd(text, m.index + m[0].length, ')') });
    }
    return out;
  }

  function finder(L) {
    if (L.id === 'python') return findPython;
    if (L.id === 'javascript') return (t, n) => findJS(t, n, false);
    if (L.id === 'typescript') return (t, n) => findJS(t, n, true);
    return findCLike;
  }

  // =====================================================================
  // Resolution
  // =====================================================================
  const intT = (L) => ({ n: L.id === 'python' ? 'int' : L.id === 'javascript' || L.id === 'typescript' ? 'number' : 'prim', a: [] });
  const strT = (L) => (L.id === 'python' ? { n: 'str', a: [] } : L.id === 'cpp' ? null : { n: 'string', a: [] });
  const isPy = (L) => L.id === 'python';
  const isJS = (L) => L.id === 'javascript' || L.id === 'typescript';

  function lookupVar(ctx, name) {
    if (ctx.cache.has(name)) return ctx.cache.get(name);
    if (ctx.depth > 8 || ctx.visiting.has(name)) return null;
    ctx.visiting.add(name); ctx.depth++;
    const cands = finder(ctx.L)(ctx.text, name).sort((a, b) => a.pos - b.pos);
    const before = cands.filter((c) => c.pos < ctx.cursor).reverse();
    const after = cands.filter((c) => c.pos >= ctx.cursor);
    let result = null;
    for (const c of before.concat(after)) {
      result = evalCand(ctx, c);
      if (result) break;
    }
    ctx.visiting.delete(name); ctx.depth--;
    ctx.cache.set(name, result);
    return result;
  }

  function evalCand(ctx, c) {
    const L = ctx.L;
    if (c.type !== undefined) return canon(L, parseTypeText(c.type));
    if (c.expr !== undefined) return inferExpr(ctx, c.expr);
    if (c.iter !== undefined) return elementOf(L, inferExpr(ctx, c.iter));
    if (c.pyfor) return pyForType(ctx, c.pyfor);
    return null;
  }

  function elementOf(L, t) {
    t = unwrap(t);
    if (!t) return null;
    const spec = prop(L, t.n, 'it') || prop(L, t.n, 'idx');
    return spec ? specT(spec, t) : null;
  }

  function pyForType(ctx, f) {
    const L = ctx.L, e = f.expr.trim();
    let m;
    if ((m = /^enumerate\s*\(([\s\S]*)\)$/.exec(e))) {
      if (f.n !== 2) return null;
      return f.idx === 0 ? intT(L) : elementOf(L, inferExpr(ctx, splitTop(m[1])[0] || ''));
    }
    if ((m = /^zip\s*\(([\s\S]*)\)$/.exec(e))) {
      const args = splitTop(m[1]);
      return f.n === args.length ? elementOf(L, inferExpr(ctx, args[f.idx])) : null;
    }
    if (/^range\s*\(/.test(e)) return intT(L);
    if ((m = /^([\s\S]+)\.items\s*\(\s*\)$/.exec(e)) && f.n === 2) {
      const d = unwrap(inferExpr(ctx, m[1]));
      if (!d) return null;
      if (d.n === 'counter' && f.idx === 1) return intT(L);
      return d.a[f.idx] || null;
    }
    if (f.n === 1) return elementOf(L, inferExpr(ctx, e));
    return null;
  }

  function stripExpr(L, e) {
    e = String(e || '');
    e = isPy(L) ? e.replace(/\s#.*$/, '') : e.replace(/\s\/\/.*$/, '');
    return e.trim().replace(/[;{]\s*$/, '').trim();
  }

  function inferExpr(ctx, expr) {
    const L = ctx.L;
    expr = stripExpr(L, expr);
    if (!expr) return null;
    const ch = parseChain(expr);
    if (ch && !expr.slice(0, ch.start).trim()) {
      const t = resolveChain(ctx, ch);
      if (t) return t;
    }
    if (expr[0] === '[' && (isPy(L) || isJS(L))) return listLiteral(ctx, expr.slice(1, matchFwd(expr, 0)));
    if (expr[0] === '{' && isPy(L)) return braceLiteral(L, expr.slice(1, matchFwd(expr, 0)));
    if (/^[fFrRbBuU]?['"`]/.test(expr)) return strT(L);
    if (/^-?\d/.test(expr)) return intT(L);
    return null;
  }

  function listLiteral(ctx, inner) {
    const L = ctx.L;
    const first = splitTop(inner)[0] || '';
    let el = null;
    if (first) {
      const head = first.split(/\s+for\s+/)[0].trim();
      el = inferExpr(ctx, head);
    }
    return { n: isPy(L) ? 'list' : 'array', a: [el] };
  }

  function braceLiteral(L, inner) {
    if (!inner.trim()) return { n: 'dict', a: [] };
    const first = splitTop(inner)[0] || '';
    let d = 0;
    for (const ch of first) {
      if ('[({'.includes(ch)) d++; else if (')]}'.includes(ch)) d--;
      else if (ch === ':' && d === 0) return { n: 'dict', a: [] };
    }
    return { n: 'set', a: [] };
  }

  function unwrap(t) {
    let g = 0;
    while (t && t.n === 'iter' && g++ < 4) t = t.a[0] || null;
    return t;
  }

  function resolveChain(ctx, ch) {
    let t = resolveBase(ctx, ch.base);
    for (const op of ch.ops) {
      if (!t) return null;
      t = applyOp(ctx, t, op);
    }
    return t;
  }

  function resolveBase(ctx, b) {
    const L = ctx.L;
    switch (b.k) {
      case 'var': {
        if ((b.name === 'self' && isPy(L)) || (b.name === 'this' && L.id !== 'python')) return { n: 'self', a: [] };
        const v = lookupVar(ctx, b.name);
        if (v) return v;
        if (L.statics[b.name]) return { n: 'static:' + b.name, a: [] };
        return null;
      }
      case 'ctor': {
        if (isPy(L)) {
          const firstArg = splitTop(b.args)[0] || '';
          if (b.name === 'defaultdict') {
            const fac = canon(L, parseRaw(firstArg.replace(/^lambda\s*:\s*/, '')));
            return { n: 'defaultdict', a: [null, fac] };
          }
          if (['list', 'sorted', 'reversed', 'set', 'deque', 'SortedList', 'frozenset'].includes(b.name)) {
            const n = b.name === 'sorted' || b.name === 'reversed' ? 'list' : L.alias[b.name];
            return { n, a: [firstArg ? elementOf(L, inferExpr(ctx, firstArg)) : null] };
          }
        }
        if (L.ctor && L.ctor[b.name]) return specT(L.ctor[b.name], null);
        return canon(L, parseRaw(b.name + (b.gen || '')));
      }
      case 'list':
        return isPy(L) || isJS(L) ? listLiteral(ctx, b.inner) : null;
      case 'brace':
        return isPy(L) ? braceLiteral(L, b.inner) : null;
      case 'str':
        return strT(L);
    }
    return null;
  }

  function selfKey(L, name) {
    if (isPy(L)) return 'self.' + name;
    if (isJS(L)) return 'this.' + name;
    return name;
  }

  function applyOp(ctx, t, op) {
    const L = ctx.L;
    t = unwrap(t);
    if (!t) return null;
    if (t.n === 'self') return op.k === 'field' ? lookupVar(ctx, selfKey(L, op.name)) : null;
    if (t.n.startsWith('static:')) {
      const st = L.statics[t.n.slice(7)];
      if (isJS(L) && t.n === 'static:Array' && op.k === 'call' && op.name === 'from') {
        const fn = splitTop(op.args)[1] || '';
        const body = (/=>\s*([\s\S]*)$/.exec(fn) || [])[1];
        return { n: 'array', a: [body ? inferExpr(ctx, body) : null] };
      }
      if (op.k === 'field') return specT(st.fr && st.fr[op.name], null);
      if (op.k === 'call') {
        if (st.r && Object.prototype.hasOwnProperty.call(st.r, op.name)) return specT(st.r[op.name], null);
        return specT(st.rd, null);
      }
      return null;
    }
    if (isJS(L) && t.n === 'array' && op.k === 'call' && op.name === 'fill' && !t.a[0]) {
      return { n: 'array', a: [inferExpr(ctx, splitTop(op.args)[0] || '')] };
    }
    if (op.k === 'index') return specT(prop(L, t.n, 'idx'), t);
    if (op.k === 'field') return specT(prop(L, t.n, 'fr', op.name), t);
    if (op.k === 'call') {
      const r = prop(L, t.n, 'r', op.name);
      if (r !== undefined) return specT(r, t);
      return specT(prop(L, t.n, 'rd'), t);
    }
    return null;
  }

  // =====================================================================
  // Describe a resolved type as a member list
  // =====================================================================
  function pretty(L, t) {
    t = unwrap(t);
    if (!t) return '';
    if (t.n === 'array' && L.id === 'java') return (pretty(L, t.a[0]) || '?') + '[]';
    if (t.n === 'array' && isJS(L) && t.a[0]) return pretty(L, t.a[0]) + '[]';
    const name = (L.display && L.display[t.n]) || t.n;
    if (!t.a.length || t.a.every((x) => !x)) return name;
    return name + L.br[0] + t.a.map((x) => pretty(L, x) || '?').join(', ') + L.br[1];
  }

  function selfMembers(ctx) {
    const L = ctx.L, text = ctx.text, items = [];
    const seen = new Set();
    const add = (name, kind) => { if (!seen.has(name)) { seen.add(name); items.push({ name, kind }); } };
    let re, m;
    if (isPy(L)) {
      re = /\bself\.([A-Za-z_]\w*)\s*(?::[^=\n]*)?=(?!=)/g;
      while ((m = re.exec(text))) add(m[1], 'f');
      re = /\bdef\s+([A-Za-z_]\w*)\s*\(\s*self\b/g;
      while ((m = re.exec(text))) if (!m[1].startsWith('__')) add(m[1], 'm');
    } else if (isJS(L)) {
      re = /\bthis\.([A-Za-z_$][\w$]*)\s*=(?![=>])/g;
      while ((m = re.exec(text))) add(m[1], 'f');
      re = /\.prototype\.([A-Za-z_$][\w$]*)\s*=/g;
      while ((m = re.exec(text))) add(m[1], 'm');
      re = /^[ \t]+(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)\n]*\)\s*(?::[^{\n]*)?\{/gm;
      while ((m = re.exec(text))) if (!CLIKE_SKIP.has(m[1]) && m[1] !== 'function' && m[1] !== 'constructor') add(m[1], 'm');
    } else return null;
    return items.length ? { label: isPy(L) ? 'self' : 'this', items } : null;
  }

  function describe(ctx, t) {
    const L = ctx.L;
    t = unwrap(t);
    if (!t) return null;
    if (t.n === 'self') return selfMembers(ctx);
    const items = [];
    const seen = new Set();
    const add = (list, kind) => w(list).forEach((name) => { if (!seen.has(name)) { seen.add(name); items.push({ name, kind }); } });
    if (t.n.startsWith('static:')) {
      const st = L.statics[t.n.slice(7)];
      add(st.f, 'f'); add(st.m, 'm');
      return { label: t.n.slice(7), items };
    }
    let d = L.types[t.n], guard = 0;
    if (!d) return null;
    while (d && guard++ < 6) { add(d.f, 'f'); add(d.m, 'm'); d = d.ext ? L.types[d.ext] : null; }
    return { label: pretty(L, t), items };
  }

  // Public: what members does `recvText` (code just before the "." / "->") have?
  function inferMembers(lang, text, recvText, cursor) {
    const L = LANGS[lang];
    if (!L) return null;
    const ctx = { L, text, cursor: cursor == null ? text.length : cursor, cache: new Map(), visiting: new Set(), depth: 0 };
    const ch = parseChain(recvText);
    if (!ch) return null;
    const t = resolveChain(ctx, ch);
    return t ? describe(ctx, t) : null;
  }

  const api = { VOCAB, TYPED, inferMembers, _internal: { parseChain, parseRaw, splitTop } };
  root.__lcAC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
