(() => {
  const STORAGE_KEY = 'lm_notation_overrides_v1';
  const DEFAULT_CSV_PATH = 'assets/data/notation.csv';
  const MODULE_VERSION = 1;

  const ATTACK_TOKENS = new Set([
    'LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'P', 'K', 'L', 'M', 'H', 'SP', 'AUTO',
  ]);
  const DIRECTIONAL_TOKENS = new Set([
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '4(タメ)', '2(タメ)', '360', '360 360',
  ]);
  const DIRECTIONAL_COMMAND_TOKENS = new Set([
    '22', '44', '66', '236', '214', '41236', '63214', '623', '421', '236236', '214214',
  ]);
  const DIRECTIONAL_ALIAS_KEYWORDS = new Set([
    'qcf', 'qcb', 'hcf', 'hcb', 'dp', 'srk', 'rdp', 'fd', 'bd', 'j.',
    'forwarddash', 'backdash', 'fdash', 'bdash', 'fjump', 'bjump', 'd/b', 'd/f', 'dd', 'c.', 'cr.',
  ]);
  const UTILITY_TOKENS = new Set([
    '投げ', 'THROW', 'JUMP', 'HOLD', 'ANY', 'DP', 'DI', 'DR', 'CR', 'OR', '>', '>>', '-', '[]',
  ]);
  const KNOWN_LM_KEYWORDS = new Set([
    ...Array.from(ATTACK_TOKENS),
    ...Array.from(DIRECTIONAL_TOKENS),
    ...Array.from(UTILITY_TOKENS),
  ]);
  const PROTECTED_USER_ALIAS_KEYS = new Set([
    'lp', 'mp', 'hp', 'lk', 'mk', 'hk', 'pp', 'kk', 'p', 'k', 'l', 'm', 'h',
    'sp', 'auto', 'jump', 'hold', 'any', 'throw',
    'dp', 'di', 'dr', 'cr', 'or',
    '[]', '-', '>', '>>',
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '22', '44', '66', '236', '214', '623', '421', '41236', '63214', '236236', '214214', '360', '720',
    'qcf', 'qcb', 'hcf', 'hcb', 'srk', 'rdp', 'dd',
  ]);
  const PROTECTED_STRUCTURED_ALIAS_PATTERNS = [
    /^(?:st|s)\.?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)$/i,
    /^(?:cr|c)\.?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)$/i,
    /^(?:j|jump)\.?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)?$/i,
    /^(?:f|b)\.?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)$/i,
    /^(?:qcf|qcb|hcf|hcb|dp|srk|rdp|dd)(?:[.+]?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k))?$/i,
    /^[1-9](?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)$/i,
    /^(?:22|44|66|236|214|623|421|41236|63214|236236|214214)(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)?$/i,
  ];
  const LM_TOKEN_PATTERN = /^[0-9]{1,6}[A-Z]{1,3}$/;
  const FREQUENT_PATTERN = /(昇竜|波動|竜巻|shoryu|dp|hadou|hado|tatsu|fireball|flash\s*kick)/i;
  const MOTION_WITH_ATTACK_PATTERN = /^(?:236|214|623|421|41236|63214|632146|236236|214214|360|720)(?:LP|MP|HP|LK|MK|HK|P|K|PP|KK)$/i;
  const DIRECTIONAL_ALIAS_PATTERN = /^(?:QCF|QCB|HCF|HCB|QCX|DP|SRK|236|214|623|421|41236|63214|632146|236236|214214|360|720|\[4\]|\[2\])(?:LP|MP|HP|LK|MK|HK|P|K)?$/i;
  const ATTACK_ALIAS_PATTERN = /^(?:ST|CR|J)?\.?(?:立|屈|下|近|遠|空中|J|JUMP)?(?:弱|中|強)?(?:LP|MP|HP|LK|MK|HK|P|K)$/i;

  const state = {
    loadPromise: null,
    defaultsLoaded: false,
    defaultAliasMap: new Map(),
    defaultAliasSet: new Set(),
    defaultAliasMeta: new Map(), // alias -> { scope: common|jp|en|canonical, category }
    lmDisplayMap: new Map(),
    userData: loadUserData(),
  };

  function normalizeWhitespace(value) {
    return String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeAlias(value) {
    return normalizeWhitespace(value);
  }

  function toAsciiLower(value) {
    return String(value || '').toLowerCase();
  }

  function hasAsciiLetter(value) {
    return /[A-Za-z]/.test(String(value || ''));
  }

  function normalizeScope(value) {
    const scope = String(value || '').toLowerCase();
    if (scope === 'jp' || scope === 'en' || scope === 'common' || scope === 'canonical') return scope;
    return 'common';
  }

  function classifyCategory(alias, lmToken) {
    const aliasText = String(alias || '');
    const compactAlias = normalizeWhitespace(aliasText).replace(/\s+/g, '');
    const compactAscii = compactAlias.toUpperCase().replace(/[+]/g, '');
    const aliasLower = compactAlias.toLowerCase();
    const lm = normalizeWhitespace(lmToken).toUpperCase();
    if (DIRECTIONAL_ALIAS_KEYWORDS.has(aliasLower)) return 'directional';
    if (/^(?:236x2|214x2|qcfx2|qcbx2)$/i.test(aliasLower)) return 'frequent';
    if (/^(?:u|d|f|b)\/(?:u|d|f|b)$/i.test(aliasLower)) return 'directional';
    if (DIRECTIONAL_ALIAS_PATTERN.test(compactAscii)) {
      if (MOTION_WITH_ATTACK_PATTERN.test(compactAscii)) return 'frequent';
      if (/(LP|MP|HP|LK|MK|HK|P|K|PP|KK)$/i.test(compactAscii)) return 'attack';
      return 'directional';
    }
    if (/^[1-9]{2,}(?:LP|MP|HP|LK|MK|HK|P|K)?$/i.test(compactAscii)) {
      if (MOTION_WITH_ATTACK_PATTERN.test(compactAscii)) return 'frequent';
      if (/(LP|MP|HP|LK|MK|HK|P|K|PP|KK)$/i.test(compactAscii)) return 'attack';
      return 'directional';
    }
    if (MOTION_WITH_ATTACK_PATTERN.test(compactAscii)) return 'frequent';
    if (DIRECTIONAL_COMMAND_TOKENS.has(lm)) return 'directional';
    if (lm === '236236' || lm === '214214') return 'frequent';
    if (/^(?:[1-9]|[1-9]{2,4})$/.test(lm)) return 'directional';
    if (MOTION_WITH_ATTACK_PATTERN.test(lm)) return 'frequent';
    if (/^[1-9](LP|MP|HP|LK|MK|HK|P|K|PP|KK)$/.test(lm)) return 'attack';
    if (/^[1-9]{2,6}(LP|MP|HP|LK|MK|HK|P|K|PP|KK)$/.test(lm)) return 'attack';
    if (ATTACK_ALIAS_PATTERN.test(compactAlias)) return 'attack';
    if (/^(?:st|s|cr|c|j|jump|f|b)\.?(?:lp|mp|hp|lk|mk|hk|p|k)$/i.test(aliasLower)) return 'attack';
    if (/^(?:j|jump)?[\u3040-\u30ff\u3400-\u9fff]+(?:pp|kk|p|k)$/i.test(aliasLower)) return 'attack';
    if (/^[\u3040-\u30ff\u3400-\u9fff]+(?:pp|kk|p|k)$/i.test(aliasText)) return 'attack';
    if (FREQUENT_PATTERN.test(aliasText)) return 'frequent';
    if (DIRECTIONAL_TOKENS.has(lm) || /^[1-9]$/.test(lm)) return 'directional';
    if (ATTACK_TOKENS.has(lm)) return 'attack';
    return 'utility';
  }

  function inferScopeFromHeader(headerText) {
    const text = String(headerText || '').toLowerCase();
    if (!text) return 'common';
    if (text.includes('common')) return 'common';
    if (text.includes('jp') || text.includes('japanese') || text.includes('日本')) return 'jp';
    if (text.includes('en') || text.includes('english')) return 'en';
    return 'common';
  }

  function loadUserData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { version: MODULE_VERSION, overrides: {}, disabled: [], customDisplay: {} };
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') {
        return { version: MODULE_VERSION, overrides: {}, disabled: [], customDisplay: {} };
      }
      return {
        version: MODULE_VERSION,
        overrides: parsed.overrides && typeof parsed.overrides === 'object' ? { ...parsed.overrides } : {},
        disabled: Array.isArray(parsed.disabled) ? parsed.disabled.slice() : [],
        customDisplay: parsed.customDisplay && typeof parsed.customDisplay === 'object' ? { ...parsed.customDisplay } : {},
      };
    } catch {
      return { version: MODULE_VERSION, overrides: {}, disabled: [], customDisplay: {} };
    }
  }

  function saveUserData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.userData));
      return true;
    } catch {
      return false;
    }
  }

  function splitCsvLine(line) {
    const out = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        const next = line[i + 1];
        if (inQuote && next === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuote = !inQuote;
        }
        continue;
      }
      if (ch === ',' && !inQuote) {
        out.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map((cell) => normalizeWhitespace(cell));
  }

  function parseCsv(text) {
    const rows = String(text || '')
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.trim().length > 0)
      .map((line) => splitCsvLine(line));
    if (!rows.length) return { headers: [], rows: [] };
    return { headers: rows[0], rows: rows.slice(1) };
  }

  function findColumnIndex(headers, predicates, fallbackIndex) {
    const list = Array.isArray(headers) ? headers : [];
    for (let i = 0; i < list.length; i += 1) {
      const header = String(list[i] || '').trim();
      if (!header) continue;
      if (predicates.some((fn) => fn(header))) return i;
    }
    return Math.min(Math.max(fallbackIndex, 0), Math.max(0, list.length - 1));
  }

  function readOfflineBundledText(path) {
    const bundle = (typeof window !== 'undefined'
      && window.OFFLINE_DATA_BUNDLE
      && typeof window.OFFLINE_DATA_BUNDLE === 'object')
      ? window.OFFLINE_DATA_BUNDLE
      : null;
    if (!bundle) return null;
    const normalized = String(path || '').replace(/^[./]+/, '').replace(/\\/g, '/').trim();
    if (!normalized) return null;
    if (Object.prototype.hasOwnProperty.call(bundle, normalized)) {
      return String(bundle[normalized] || '');
    }
    return null;
  }

  async function readDefaultCsvText() {
    try {
      const res = await fetch(DEFAULT_CSV_PATH, { cache: 'no-cache' });
      if (res.ok) return await res.text();
    } catch { /* ignore and fall back */ }
    const bundled = readOfflineBundledText(DEFAULT_CSV_PATH);
    if (bundled != null) return bundled;
    throw new Error(`Failed to load ${DEFAULT_CSV_PATH}`);
  }

  function setDisplayForLm(lmToken, jpLabel, enLabel) {
    if (!lmToken) return;
    const prev = state.lmDisplayMap.get(lmToken) || { jp: lmToken, en: lmToken };
    state.lmDisplayMap.set(lmToken, {
      jp: normalizeWhitespace(jpLabel) || prev.jp || lmToken,
      en: normalizeWhitespace(enLabel) || prev.en || lmToken,
    });
  }

  function registerDefaultAlias(alias, lmToken, scope = 'common', category = 'utility') {
    const key = normalizeAlias(alias);
    const lm = normalizeWhitespace(lmToken);
    if (!key || !lm) return;
    if (!state.defaultAliasMap.has(key)) {
      state.defaultAliasMap.set(key, lm);
    }
    state.defaultAliasSet.add(key);
    if (!state.defaultAliasMeta.has(key)) {
      state.defaultAliasMeta.set(key, { scope: normalizeScope(scope), category });
    }
  }

  async function ensureNotationDefaultsLoaded() {
    if (state.defaultsLoaded) return true;
    if (state.loadPromise) return state.loadPromise;
    state.loadPromise = (async () => {
      const csvText = await readDefaultCsvText();
      const parsed = parseCsv(csvText);
      const headers = parsed.headers || [];
      const jpIdx = findColumnIndex(headers, [
        (h) => /jp/i.test(h),
        (h) => /japanese/i.test(h),
        (h) => /日本/.test(h),
      ], 1);
      const enIdx = findColumnIndex(headers, [
        (h) => /en/i.test(h),
        (h) => /english/i.test(h),
      ], 2);

      state.defaultAliasMap.clear();
      state.defaultAliasSet.clear();
      state.defaultAliasMeta.clear();
      state.lmDisplayMap.clear();

      parsed.rows.forEach((row) => {
        const canonical = normalizeWhitespace(row[0] || '');
        if (!canonical) return;
        const jpLabel = normalizeWhitespace(row[jpIdx] || '');
        const enLabel = normalizeWhitespace(row[enIdx] || '');
        setDisplayForLm(canonical, jpLabel || canonical, enLabel || canonical);

        registerDefaultAlias(canonical, canonical, 'canonical', classifyCategory(canonical, canonical));
        if (jpLabel) registerDefaultAlias(jpLabel, canonical, 'jp', classifyCategory(jpLabel, canonical));
        if (enLabel) registerDefaultAlias(enLabel, canonical, 'en', classifyCategory(enLabel, canonical));

        row.forEach((cell, idx) => {
          if (idx === 0 || idx === jpIdx || idx === enIdx) return;
          const alias = normalizeWhitespace(cell);
          if (!alias) return;
          const scope = inferScopeFromHeader(headers[idx] || '');
          registerDefaultAlias(alias, canonical, scope, classifyCategory(alias, canonical));
        });
      });

      state.defaultsLoaded = true;
      return true;
    })()
      .finally(() => {
        state.loadPromise = null;
      });
    return state.loadPromise;
  }

  function getDisabledSet() {
    const set = new Set();
    (state.userData.disabled || []).forEach((alias) => {
      const key = normalizeAlias(alias);
      if (key) set.add(key);
    });
    return set;
  }

  function getUserOverrideMap() {
    const out = new Map();
    const src = state.userData.overrides || {};
    Object.keys(src).forEach((alias) => {
      const key = normalizeAlias(alias);
      const lmToken = normalizeWhitespace(src[alias]);
      if (!key || !lmToken) return;
      if (!isAllowedLmToken(lmToken)) return;
      out.set(key, lmToken);
    });
    return out;
  }

  function getEffectiveAliasEntries() {
    const disabled = getDisabledSet();
    const userOverrides = getUserOverrideMap();
    const out = new Map();

    state.defaultAliasMap.forEach((lmToken, alias) => {
      if (disabled.has(alias)) return;
      out.set(alias, lmToken);
    });
    userOverrides.forEach((lmToken, alias) => {
      const aliasKey = toAsciiLower(alias);
      const lmKey = toAsciiLower(lmToken);
      const compactAlias = aliasKey.replace(/\s+/g, '');
      const aliasUpper = normalizeWhitespace(alias).toUpperCase();
      const lmUpper = normalizeWhitespace(lmToken).toUpperCase();
      // Prevent user overrides from hijacking core LM tokens (e.g. LP -> 8).
      if (PROTECTED_USER_ALIAS_KEYS.has(aliasKey) && aliasKey !== lmKey) return;
      if (PROTECTED_STRUCTURED_ALIAS_PATTERNS.some((rx) => rx.test(compactAlias)) && compactAlias !== lmKey) return;
      // Prevent overrides of canonical LM-like aliases (e.g. 2LP -> 2, 236LP -> 216).
      if (
        (KNOWN_LM_KEYWORDS.has(aliasUpper) || LM_TOKEN_PATTERN.test(aliasUpper))
        && aliasUpper !== lmUpper
      ) {
        return;
      }
      out.set(alias, lmToken);
    });

    return out;
  }

  function getEffectiveAliasMap() {
    const entries = getEffectiveAliasEntries();
    const out = {};
    entries.forEach((lmToken, alias) => {
      out[alias] = lmToken;
    });
    return out;
  }

  function escapeRegExp(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function replaceByExactTokens(text, aliasEntries, replacements) {
    // Keep "/" inside tokens so aliases like "d/f" and "d/b" resolve as a unit.
    const separators = /(\s+|>>|>|,|\+|-|\(|\)|\[|\]|\{|\}|:|;)/;
    const parts = String(text || '').split(separators);
    return parts.map((part) => {
      if (!part) return part;
      const normalized = normalizeAlias(part);
      if (normalized && aliasEntries.has(normalized)) {
        const mapped = aliasEntries.get(normalized);
        if (normalized !== mapped) replacements.push({ from: part, to: mapped });
        return mapped;
      }
      if (separators.test(part)) return part;
      if (!normalized) return part;
      const lower = toAsciiLower(normalized);
      if (lower !== normalized && aliasEntries.has(lower)) {
        const mapped = aliasEntries.get(lower);
        replacements.push({ from: part, to: mapped });
        return mapped;
      }
      return part;
    }).join('');
  }

  function replaceByPhrases(text, aliasEntries, replacements) {
    let out = String(text || '');
    const aliases = Array.from(aliasEntries.keys())
      .filter((alias) => alias && alias.length > 1)
      .sort((a, b) => b.length - a.length);
    aliases.forEach((alias) => {
      const mapped = aliasEntries.get(alias);
      if (!mapped || alias === mapped) return;
      // Single-token aliases are already handled by exact-token replacement.
      // Skipping them here avoids case-insensitive collisions such as "DP" <- "dp".
      if (/^[A-Za-z0-9._/-]+$/.test(alias) && !/\s/.test(alias)) return;
      const escaped = escapeRegExp(alias);
      if (hasAsciiLetter(alias)) {
        // For ASCII aliases, only replace at token boundaries to avoid mutating canonical tokens
        // like "2LP" by replacing inner substrings such as "LP".
        const regex = new RegExp(`(^|[^A-Za-z0-9_])(${escaped})(?=$|[^A-Za-z0-9_])`, 'gi');
        out = out.replace(regex, (match, prefix, body) => {
          replacements.push({ from: body, to: mapped });
          return `${prefix}${mapped}`;
        });
        return;
      }
      const regex = new RegExp(escaped, 'g');
      out = out.replace(regex, (match) => {
        replacements.push({ from: match, to: mapped });
        return mapped;
      });
    });
    return out;
  }

  function dedupeReplacements(replacements) {
    const seen = new Set();
    const out = [];
    replacements.forEach((entry) => {
      const from = normalizeWhitespace(entry && entry.from);
      const to = normalizeWhitespace(entry && entry.to);
      if (!from || !to) return;
      if (toAsciiLower(from) === toAsciiLower(to)) return;
      const key = `${from}=>${to}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ from, to });
    });
    return out;
  }

  function isLikelyLmToken(token, aliasEntries) {
    const text = normalizeWhitespace(token);
    if (!text) return true;
    if (aliasEntries.has(text)) return true;
    const lower = toAsciiLower(text);
    if (lower !== text && aliasEntries.has(lower)) return true;
    if (KNOWN_LM_KEYWORDS.has(text) || KNOWN_LM_KEYWORDS.has(text.toUpperCase())) return true;
    if (LM_TOKEN_PATTERN.test(text)) return true;
    if (/^[1-9]$/.test(text)) return true;
    if (/^\[\d+F?\]$/i.test(text) || text === '[]') return true;
    return false;
  }

  function collectUnknownTerms(text, aliasEntries) {
    const sanitized = String(text || '')
      .replace(/\bxx\b/gi, ' ')
      .replace(/[×＋]/g, ' ');
    const terms = sanitized
      .split(/[\s,>/+\-()[\]{}:;]+/)
      .map((value) => normalizeWhitespace(value))
      .filter(Boolean);
    const unknown = [];
    const seen = new Set();
    terms.forEach((term) => {
      if (isLikelyLmToken(term, aliasEntries)) return;
      const key = toAsciiLower(term);
      if (seen.has(key)) return;
      seen.add(key);
      unknown.push(term);
    });
    return unknown;
  }

  function normalizeCommonAliasSpacing(text) {
    return String(text || '')
      .replace(
        /\b(st|s|cr|c|j|jump|f|b)\s*[.,]\s*(lp|mp|hp|lk|mk|hk|pp|kk|p|k)\b/gi,
        (_, prefix, attack) => `${prefix}.${attack}`,
      )
      .replace(/\b(u|d|f|b)\s*\/\s*(u|d|f|b)\b/gi, (_, a, b) => `${a}/${b}`);
  }

  function normalizeCommandText(rawText) {
    const input = normalizeCommonAliasSpacing(normalizeWhitespace(rawText));
    if (!input) return { normalizedText: '', replacements: [], unknown: [] };
    const entries = getEffectiveAliasEntries();
    const replacements = [];
    // Apply phrase aliases first (e.g. "forward dash"), then exact single-token aliases.
    let output = replaceByPhrases(input, entries, replacements);
    output = replaceByExactTokens(output, entries, replacements);
    output = normalizeWhitespace(output);
    return {
      normalizedText: output,
      replacements: dedupeReplacements(replacements),
      unknown: collectUnknownTerms(output, entries),
    };
  }

  function getDisplayForLM(lmToken, lang) {
    const token = normalizeWhitespace(lmToken);
    if (!token) return '';
    const customKey = normalizeCustomDisplayKey(token);
    const custom = state.userData.customDisplay && (
      state.userData.customDisplay[customKey]
      || state.userData.customDisplay[token]
    );
    if (custom && typeof custom === 'object') {
      const jp = normalizeWhitespace(custom.jp);
      const en = normalizeWhitespace(custom.en);
      if (lang === 'jp' && jp) return jp;
      if (lang === 'en' && en) return en;
      if (lang === 'jp' && en) return en;
      if (lang === 'en' && jp) return jp;
    }
    const base = state.lmDisplayMap.get(token);
    if (!base) return token;
    if (lang === 'jp') return base.jp || base.en || token;
    if (lang === 'en') return base.en || base.jp || token;
    return base.en || base.jp || token;
  }

  function normalizeCustomDisplayKey(lmToken) {
    const key = normalizeWhitespace(lmToken);
    if (!key) return '';
    return key.toUpperCase();
  }

  function canonicalDisplayLmToken(lmToken) {
    const key = normalizeCustomDisplayKey(lmToken);
    if (!key) return '';
    if (key === 'JUMP') return 'Jump';
    if (key === 'AUTO') return 'Auto';
    if (key === 'THROW') return '投げ';
    return key;
  }

  function isAllowedLmToken(lmToken) {
    const value = normalizeWhitespace(lmToken);
    if (!value) return false;
    const upper = value.toUpperCase();
    if (KNOWN_LM_KEYWORDS.has(value) || KNOWN_LM_KEYWORDS.has(upper)) return true;
    if (DIRECTIONAL_COMMAND_TOKENS.has(value) || DIRECTIONAL_COMMAND_TOKENS.has(upper)) return true;
    if (LM_TOKEN_PATTERN.test(value)) return true;
    if (/^[1-9]$/.test(value)) return true;
    if (/^360\s+360$/i.test(value)) return true;
    return false;
  }

  function validateLmToken(lmToken) {
    const value = normalizeWhitespace(lmToken);
    if (!value) return { ok: false, warnings: [], reason: 'lm token is empty' };
    const looksKnown = isAllowedLmToken(value);
    const warnings = [];
    if (!looksKnown) warnings.push('Token does not match common LM patterns.');
    return { ok: true, warnings, reason: '' };
  }

  function addOrUpdateUserAlias(alias, lmToken) {
    const key = normalizeAlias(alias);
    const value = normalizeWhitespace(lmToken);
    if (!key) return { ok: false, warnings: [], reason: 'alias is empty' };
    if (!value) return { ok: false, warnings: [], reason: 'lm token is empty' };
    const validation = validateLmToken(value);
    state.userData.overrides[key] = value;
    state.userData.disabled = (state.userData.disabled || [])
      .map((entry) => normalizeAlias(entry))
      .filter((entry) => entry && entry !== key);
    saveUserData();
    return { ok: true, warnings: validation.warnings || [], reason: '' };
  }

  function removeUserAlias(alias) {
    const key = normalizeAlias(alias);
    if (!key) return false;
    if (!state.userData.overrides || !Object.prototype.hasOwnProperty.call(state.userData.overrides, key)) {
      return false;
    }
    delete state.userData.overrides[key];
    saveUserData();
    return true;
  }

  function getCustomDisplayForLM(lmToken, lang = 'jp') {
    const key = normalizeCustomDisplayKey(lmToken);
    if (!key) return '';
    const payload = state.userData.customDisplay && (
      state.userData.customDisplay[key]
      || state.userData.customDisplay[normalizeWhitespace(lmToken)]
    );
    if (!payload || typeof payload !== 'object') return '';
    const active = String(lang || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
    const jp = normalizeWhitespace(payload.jp || '');
    const en = normalizeWhitespace(payload.en || '');
    if (active === 'jp') return jp || '';
    return en || '';
  }

  function setCustomDisplay(lmToken, jpLabel, enLabel) {
    const key = normalizeCustomDisplayKey(lmToken);
    const rawKey = normalizeWhitespace(lmToken);
    if (!key) return false;
    const jp = normalizeWhitespace(jpLabel || '');
    const en = normalizeWhitespace(enLabel || '');
    if (!jp && !en) {
      if (state.userData.customDisplay && Object.prototype.hasOwnProperty.call(state.userData.customDisplay, key)) {
        delete state.userData.customDisplay[key];
      }
      if (rawKey && state.userData.customDisplay && Object.prototype.hasOwnProperty.call(state.userData.customDisplay, rawKey)) {
        delete state.userData.customDisplay[rawKey];
      }
      saveUserData();
      return true;
    }
    if (!state.userData.customDisplay || typeof state.userData.customDisplay !== 'object') {
      state.userData.customDisplay = {};
    }
    state.userData.customDisplay[key] = { jp, en };
    saveUserData();
    return true;
  }

  function clearCustomDisplay(lmToken) {
    const key = normalizeCustomDisplayKey(lmToken);
    const rawKey = normalizeWhitespace(lmToken);
    if (!key) return false;
    if (!state.userData.customDisplay || typeof state.userData.customDisplay !== 'object') return false;
    const hasKey = Object.prototype.hasOwnProperty.call(state.userData.customDisplay, key)
      || (rawKey && Object.prototype.hasOwnProperty.call(state.userData.customDisplay, rawKey));
    if (!hasKey) return false;
    if (Object.prototype.hasOwnProperty.call(state.userData.customDisplay, key)) {
      delete state.userData.customDisplay[key];
    }
    if (rawKey && Object.prototype.hasOwnProperty.call(state.userData.customDisplay, rawKey)) {
      delete state.userData.customDisplay[rawKey];
    }
    saveUserData();
    return true;
  }

  function getCustomDisplayRows() {
    const source = (state.userData && state.userData.customDisplay && typeof state.userData.customDisplay === 'object')
      ? state.userData.customDisplay
      : {};
    const deduped = new Map();
    Object.keys(source).forEach((lmToken) => {
      const payload = source[lmToken];
      if (!payload || typeof payload !== 'object') return;
      const key = normalizeCustomDisplayKey(lmToken);
      if (!key) return;
      const next = {
        lmToken: canonicalDisplayLmToken(key),
        jp: normalizeWhitespace(payload.jp || ''),
        en: normalizeWhitespace(payload.en || ''),
      };
      if (!deduped.has(key)) {
        deduped.set(key, next);
        return;
      }
      const prev = deduped.get(key);
      deduped.set(key, {
        lmToken: canonicalDisplayLmToken(key),
        jp: prev.jp || next.jp,
        en: prev.en || next.en,
      });
    });
    return Array.from(deduped.values())
      .map((row) => {
        const key = normalizeWhitespace(row.lmToken);
        if (!key) return null;
        return {
          lmToken: key,
          jp: normalizeWhitespace(row.jp || ''),
          en: normalizeWhitespace(row.en || ''),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.lmToken.localeCompare(b.lmToken, 'en'));
  }

  function disableDefaultAlias(alias) {
    const key = normalizeAlias(alias);
    if (!key || !state.defaultAliasSet.has(key)) return false;
    const disabled = getDisabledSet();
    disabled.add(key);
    state.userData.disabled = Array.from(disabled);
    saveUserData();
    return true;
  }

  function enableDefaultAlias(alias) {
    const key = normalizeAlias(alias);
    if (!key) return false;
    const disabled = getDisabledSet();
    if (!disabled.has(key)) return false;
    disabled.delete(key);
    state.userData.disabled = Array.from(disabled);
    saveUserData();
    return true;
  }

  function resetUserAliases() {
    state.userData = { version: MODULE_VERSION, overrides: {}, disabled: [], customDisplay: {} };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* ignore */ }
    return true;
  }

  function exportUserAliasesJSON() {
    return JSON.stringify(state.userData, null, 2);
  }

  function importUserAliasesJSON(jsonText) {
    const parsed = typeof jsonText === 'string' ? JSON.parse(jsonText) : jsonText;
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON payload');

    const incomingOverrides = parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {};
    const incomingDisabled = Array.isArray(parsed.disabled) ? parsed.disabled : [];
    const incomingDisplay = parsed.customDisplay && typeof parsed.customDisplay === 'object' ? parsed.customDisplay : {};

    Object.keys(incomingOverrides).forEach((alias) => {
      const key = normalizeAlias(alias);
      const lmToken = normalizeWhitespace(incomingOverrides[alias]);
      if (!key || !lmToken) return;
      state.userData.overrides[key] = lmToken;
    });

    const disabledSet = getDisabledSet();
    incomingDisabled.forEach((alias) => {
      const key = normalizeAlias(alias);
      if (key) disabledSet.add(key);
    });
    state.userData.disabled = Array.from(disabledSet);

    Object.keys(incomingDisplay).forEach((lmToken) => {
      const key = normalizeCustomDisplayKey(lmToken);
      const payload = incomingDisplay[lmToken];
      if (!key || !payload || typeof payload !== 'object') return;
      state.userData.customDisplay[key] = {
        jp: normalizeWhitespace(payload.jp || ''),
        en: normalizeWhitespace(payload.en || ''),
      };
    });

    saveUserData();
    return true;
  }

  function shouldShowScope(scope, lang) {
    const active = String(lang || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
    if (scope === 'common') return true;
    if (scope === 'jp') return active === 'jp';
    if (scope === 'en') return active === 'en';
    if (scope === 'canonical') return true;
    return true;
  }

  function getNotationManagerRows(lang = 'jp') {
    const active = String(lang || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
    const disabled = getDisabledSet();
    const allRows = [];

    state.defaultAliasMap.forEach((lmToken, alias) => {
      const meta = state.defaultAliasMeta.get(alias) || { scope: 'common', category: classifyCategory(alias, lmToken) };
      const sameAsToken = normalizeAlias(alias).toUpperCase() === normalizeWhitespace(lmToken).toUpperCase();
      if (sameAsToken) return;
      allRows.push({
        alias,
        lmToken,
        source: 'default',
        enabled: !disabled.has(alias),
        scope: meta.scope,
        category: meta.category || classifyCategory(alias, lmToken),
      });
    });

    const userOverrides = getUserOverrideMap();
    userOverrides.forEach((lmToken, alias) => {
      allRows.push({
        alias,
        lmToken,
        source: 'user',
        enabled: true,
        scope: 'common',
        category: classifyCategory(alias, lmToken),
      });
    });

    let rows = allRows.filter((row) => shouldShowScope(row.scope, active));
    // If scope tags are too strict for a CSV variant, keep the list usable.
    if (!rows.length && allRows.length) {
      rows = allRows.slice();
    }

    rows.sort((a, b) => {
      const categoryOrder = ['directional', 'attack', 'utility', 'frequent'];
      const ai = categoryOrder.indexOf(a.category);
      const bi = categoryOrder.indexOf(b.category);
      if (ai !== bi) return ai - bi;
      if (a.source !== b.source) return a.source === 'user' ? -1 : 1;
      return a.alias.localeCompare(b.alias, 'en');
    });
    return rows;
  }

  function getCanonicalNotationRows(lang = 'jp') {
    const active = String(lang || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
    const rows = [];
    const seen = new Set();

    state.lmDisplayMap.forEach((labels, lmToken) => {
      const key = normalizeWhitespace(lmToken);
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({
        lmToken: key,
        category: classifyCategory(key, key),
        jp: normalizeWhitespace(labels && labels.jp ? labels.jp : ''),
        en: normalizeWhitespace(labels && labels.en ? labels.en : ''),
      });
    });

    const userOverrides = getUserOverrideMap();
    userOverrides.forEach((lmToken) => {
      const key = normalizeWhitespace(lmToken);
      if (!key || seen.has(key)) return;
      seen.add(key);
      rows.push({
        lmToken: key,
        category: classifyCategory(key, key),
        jp: getDisplayForLM(key, 'jp'),
        en: getDisplayForLM(key, 'en'),
      });
    });

    const categoryOrder = ['directional', 'attack', 'utility', 'frequent'];
    rows.sort((a, b) => {
      const ai = categoryOrder.indexOf(a.category);
      const bi = categoryOrder.indexOf(b.category);
      if (ai !== bi) return ai - bi;
      const al = active === 'jp' ? (a.jp || a.lmToken) : (a.en || a.lmToken);
      const bl = active === 'jp' ? (b.jp || b.lmToken) : (b.en || b.lmToken);
      const labelCompare = al.localeCompare(bl, 'en');
      if (labelCompare !== 0) return labelCompare;
      return a.lmToken.localeCompare(b.lmToken, 'en');
    });
    return rows;
  }

  window.LMNotationDict = {
    ensureNotationDefaultsLoaded,
    getEffectiveAliasMap,
    normalizeCommandText,
    getDisplayForLM,
    addOrUpdateUserAlias,
    removeUserAlias,
    getCustomDisplayForLM,
    setCustomDisplay,
    clearCustomDisplay,
    getCustomDisplayRows,
    disableDefaultAlias,
    enableDefaultAlias,
    resetUserAliases,
    exportUserAliasesJSON,
    importUserAliasesJSON,
    getNotationManagerRows,
    getCanonicalNotationRows,
    validateLmToken,
    getStorageKey: () => STORAGE_KEY,
  };
})();
