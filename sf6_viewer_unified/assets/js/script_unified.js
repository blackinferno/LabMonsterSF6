// ============================================================================
//  STREET FIGHTER 6 — Local Capcom Clone Logic (clean build)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMainTabs();
  initCharacterControls();
  initCharacterSelect();
  initTooltips();
  initDragScroll('#frameScroll');
  initLanguageToggle();
  initInfoModals();
  syncHeaderHeightVar();
  window.addEventListener('resize', handleViewportResize);
});
window.addEventListener('load', () => {
  syncHeaderHeightVar();
  handleViewportResize();
});

let loadDataRequestId = 0;
const headerTemplateHTMLByLang = new Map();
const DEFAULT_FRAME_DATA_VERSION = '2025.12.16';
let currentFrameDataVersion = DEFAULT_FRAME_DATA_VERSION;
const FRAME_VERSION_MANIFEST_PATH = 'assets/data/versions.json';
const OFFLINE_DATA_BUNDLE = (
  typeof window !== 'undefined'
  && window.OFFLINE_DATA_BUNDLE
  && typeof window.OFFLINE_DATA_BUNDLE === 'object'
)
  ? window.OFFLINE_DATA_BUNDLE
  : null;
const DEFAULT_FRAME_DATA_VERSION_ENTRY = {
  id: DEFAULT_FRAME_DATA_VERSION,
  label: DEFAULT_FRAME_DATA_VERSION,
  path: 'assets/data_2025_12_16',
};
let frameDataVersions = [DEFAULT_FRAME_DATA_VERSION_ENTRY];
let frameDataVersionsLoaded = false;
let frameDataVersionsPromise = null;
const frameDataViewState = {
  selectedVersion: DEFAULT_FRAME_DATA_VERSION,
  compareEnabled: false,
  compareVersion: '',
};

function normalizeOfflineResourcePath(path) {
  return String(path || '')
    .replace(/^[./]+/, '')
    .replace(/\\/g, '/')
    .trim();
}

function getOfflineResourceText(path) {
  if (!OFFLINE_DATA_BUNDLE) return null;
  const normalized = normalizeOfflineResourcePath(path);
  if (!normalized) return null;
  return Object.prototype.hasOwnProperty.call(OFFLINE_DATA_BUNDLE, normalized)
    ? OFFLINE_DATA_BUNDLE[normalized]
    : null;
}

async function loadTextResource(path) {
  const offlineText = getOfflineResourceText(path);
  if (offlineText != null) {
    return offlineText;
  }
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Missing ${path}`);
  }
  return await res.text();
}

async function loadJsonResource(path) {
  const offlineText = getOfflineResourceText(path);
  if (offlineText != null) {
    return JSON.parse(offlineText);
  }
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) {
    throw new Error(`Missing ${path}`);
  }
  return await res.json();
}
const CHARACTER_ART_PRESETS = {
  "ryu": {
    "top": "min(1.04167vw, 20px)",
    "left": "calc(50% - min(28.9062vw, 555px))",
    "width": "min(54.8438vw, 1053px)",
    "height": "min(76.4062vw, 1467px)",
    "shift": "12%",
    "shiftx": "-2%"
  },
  "luke": {
    "top": "0px",
    "left": "calc(50% - min(21.6146vw, 415px))",
    "width": "min(54.8438vw, 1053px)",
    "height": "min(72.9688vw, 1401px)",
    "shift": "14%",
    "shiftx": "7%"
  },
  "jamie": {
    "top": "min(1.04167vw, 20px)",
    "left": "calc(50% - min(25.2604vw, 485px))",
    "width": "min(54.8438vw, 1053px)",
    "height": "min(71.6667vw, 1376px)",
    "shift": "12%",
    "shiftx": "8%"
  },
  "chunli": {
    "top": "calc(1px - min(5.72917vw, 110px))",
    "left": "calc(50% - min(21.875vw, 420px))",
    "width": "min(53.6458vw, 1030px)",
    "height": "min(85.6771vw, 1645px)"
  },
  "guile": {
    "top": "min(7.29167vw, 10px)",
    "left": "calc(50% - min(26.0417vw, 500px))",
    "width": "min(51.0417vw, 980px)",
    "height": "min(69.1146vw, 1327px)",
    "shift": "20%"
  },
  "kimberly": {
    "top": "min(-18.2292vw, -230px)",
    "left": "calc(50% - min(20.8333vw, 400px))",
    "width": "min(72.9167vw, 1400px)",
    "height": "min(73.4896vw, 1411px)",
    "shift": "25%",
    "shiftx": "10%"
  },
  "juri": {
    "top": "min(-16.1458vw, -250px)",
    "left": "calc(50% - min(26.0417vw, 500px))",
    "width": "min(67.7083vw, 1300px)",
    "height": "min(59.1146vw, 1135px)",
    "shift": "28%",
    "shiftx": "10%"
  },
  "ken": {
    "top": "0px",
    "left": "calc(50% - min(39.5833vw, 760px))",
    "width": "min(67.7083vw, 1300px)",
    "height": "min(77.3438vw, 1485px)",
    "shift": "10%",
    "shiftx": "-6%"
  },
  "blanka": {
    "top": "min(-10.4167vw, -160px)",
    "left": "calc(50% - min(33.8542vw, 650px))",
    "width": "min(69.2708vw, 1330px)",
    "height": "min(74.5833vw, 1432px)",
    "shift": "22%",
    "shiftx": "-5%"
  },
  "dhalsim": {
    "top": "min(1.04167vw, 20px)",
    "left": "calc(50% - min(35.9375vw, 690px))",
    "width": "min(72.9167vw, 1400px)",
    "height": "min(71.7188vw, 1377px)",
    "shift": "13%"
  },
  "ehonda": {
    "top": "min(-18.2292vw, -300px)",
    "left": "calc(50% - min(39.0625vw, 750px))",
    "width": "min(78.125vw, 1500px)",
    "height": "min(93.5938vw, 1797px)",
    "shift": "22%",
    "shiftx": "-2%"
  },
  "jp": {
    "top": "min(3.125vw, 60px)",
    "left": "calc(50% - min(28.75vw, 552px))",
    "width": "min(47.2917vw, 908px)",
    "height": "min(76.8229vw, 1475px)"
  },
  "marisa": {
    "top": "min(-12.5vw, -200px)",
    "left": "calc(50% - min(26.5625vw, 510px))",
    "width": "min(61.4583vw, 1180px)",
    "height": "min(76.4062vw, 1467px)",
    "shift": "24%",
    "shiftx": "8%"
  },
  "manon": {
    "top": "min(-3.125vw, -50px)",
    "left": "calc(50% - min(50.3646vw, 967px))",
    "width": "min(96.5625vw, 1854px)",
    "height": "min(76.9792vw, 1478px)",
    "shiftx": "-3%"
  },
  "deejay": {
    "top": "min(1.04167vw, 20px)",
    "left": "calc(50% - min(55vw, 1056px))",
    "width": "min(77.7083vw, 1492px)",
    "height": "min(68.8542vw, 1322px)",
    "shift": "10%",
    "shiftx": "-15%"
  },
  "zangief": {
    "top": "min(0vw, 0px)",
    "left": "calc(50% - min(31.25vw, 600px))",
    "width": "min(57.2917vw, 1100px)",
    "height": "min(63.6979vw, 1223px)",
    "shift": "12%",
    "shiftx": "-10%"
  },
  "lily": {
    "top": "min(-16.6667vw, -250px)",
    "left": "calc(50% - min(39.0625vw, 750px))",
    "width": "min(77.7083vw, 1492px)",
    "height": "min(88.1771vw, 1693px)",
    "shift": "23%",
    "shiftx": "-5%"
  },
  "cammy": {
    "top": "min(5.20833vw, 50px)",
    "left": "calc(50% - min(28.6458vw, 550px))",
    "width": "min(57.2917vw, 1100px)",
    "height": "min(69.0104vw, 1325px)",
    "shift": "16%",
    "shiftx": "-7%"
  },
  "rashid": {
    "top": "calc(1px - min(16.4062vw, 30px))",
    "left": "calc(50% - min(39.5833vw, 760px))",
    "width": "min(100vw, 1920px)",
    "height": "min(93.75vw, 1800px)",
    "shift": "0%",
    "shiftx": "5%"
  },
  "aki": {
    "top": "calc(1px - min(23.4375vw, 450px))",
    "left": "calc(50% - min(45.8333vw, 880px))",
    "width": "min(78.125vw, 1500px)",
    "height": "min(93.75vw, 1800px)",
    "shift": "22%",
    "shiftx": "-10%"
  },
  "ed": {
    "top": "calc(1px - min(5.20833vw, 130px))",
    "left": "calc(50% - min(40.625vw, 780px))",
    "width": "min(67.7083vw, 1300px)",
    "height": "min(78.125vw, 1500px)",
    "shift": "20%",
    "shiftx": "-8%"
  },
  "gouki_akuma": {
    "top": "calc(1px - min(5.20833vw, 100px))",
    "left": "calc(50% - min(38.4896vw, 739px))",
    "width": "min(67.4479vw, 1295px)",
    "height": "min(82.1875vw, 1578px)",
    "shift": "15%",
    "shiftx": "2%"
  },
  "vega_mbison": {
    "top": "calc(1px - min(1.04167vw, 20px))",
    "left": "calc(50% - min(29.6875vw, 570px))",
    "width": "min(55.8333vw, 1072px)",
    "height": "min(81.875vw, 1572px)"
  },
  "terry": {
    "top": "calc(1px - min(6.25vw, 120px))",
    "left": "calc(50% - min(34.8958vw, 670px))",
    "width": "min(55.8333vw, 1072px)",
    "height": "min(81.875vw, 1572px)",
    "shift": "18%",
    "shiftx": "-11%"
  },
  "mai": {
    "top": "calc(1px - min(27.0833vw, 520px))",
    "left": "calc(50% - min(40.625vw, 780px))",
    "width": "calc(1.3 * min(55.8333vw, 1072px))",
    "height": "calc(1.3 * min(81.875vw, 1572px))",
    "shift": "24%",
    "shiftx": "-8%"
  },
  "elena": {
    "top": "calc(1px - min(61.4583vw, 1300px))",
    "left": "calc(50% - min(58.8542vw, 1130px))",
    "width": "calc(1.5 * min(55.8333vw, 1072px))",
    "height": "calc(1.5 * min(81.875vw, 1572px))",
    "shift": "32%",
    "shiftx": "-15%"
  },
  "sagat": {
    "top": "calc(1px - min(6.25vw, 120px))",
    "left": "calc(50% - min(34.8958vw, 670px))",
    "width": "min(55.8333vw, 1072px)",
    "height": "min(81.875vw, 1572px)",
    "shift": "18%",
    "shiftx": "-2%"
  },
  "cviper": {
    "top": "calc(1px - min(-0.260417vw, -5px))",
    "left": "calc(50% - min(28.6458vw, 550px))",
    "width": "min(52.7083vw, 1012px)",
    "height": "min(83.1771vw, 1597px)",
    "shift": "17%"
  }
};
const CHARACTER_ART_DEFAULT = {
  top: '0px',
  left: '50%',
  width: 'min(54.8438vw, 1053px)',
  height: 'min(76.4062vw, 1467px)',
  bottom: 'auto',
  shift: '15%',
  shiftX: '0%'
};

const CHARACTER_ORDER = Object.keys(CHARACTER_ART_PRESETS);
const CHARACTER_SELECT_SPECIAL = {
  gouki_akuma: {
    jp: 'assets/images/characters/select_character22_gouki_over.png',
    en: 'assets/images/characters/select_character22_over.png'
  },
  vega_mbison: {
    jp: 'assets/images/characters/select_character23_vega_over.png',
    en: 'assets/images/characters/select_character23_over.png'
  },
  jp: 'assets/images/characters/select_character15_over.png',
  deejay: 'assets/images/characters/select_character12_over.png',
  marisa: 'assets/images/characters/select_character14_over.png',
  manon: 'assets/images/characters/select_character13_over.png'
};

const CHARACTER_NAME_OVERRIDES = {
  gouki_akuma: {
    primary: { jp: 'Gouki', en: 'Akuma' },
    english: { jp: 'Gouki', en: 'Akuma' }
  },
  vega_mbison: {
    primary: { jp: 'Vega', en: 'M.Bison' },
    english: { jp: 'Vega', en: 'M.Bison' }
  }
};

// ---------------------------------------------------------------------------
// Character Data Loader
// ---------------------------------------------------------------------------
async function getHeaderTemplateHTML(lang = null) {
  const activeLang = ((lang || getCurrentLang() || 'jp').toLowerCase() === 'en') ? 'en' : 'jp';
  if (headerTemplateHTMLByLang.has(activeLang)) {
    return headerTemplateHTMLByLang.get(activeLang);
  }

  const templateCandidates = activeLang === 'en'
    ? ['assets/templates/header_capcom_en.html', 'assets/templates/header_capcom.html']
    : ['assets/templates/header_capcom.html'];

  for (const templatePath of templateCandidates) {
    try {
      const raw = await loadTextResource(templatePath);
      const parsed = extractHeaderRows(raw);
      headerTemplateHTMLByLang.set(activeLang, parsed);
      return parsed;
    } catch (err) {
      console.warn(`Failed to load header template: ${templatePath}`, err);
    }
  }

  const fallback = headerHTMLFallback();
  headerTemplateHTMLByLang.set(activeLang, fallback);
  return fallback;
}

function extractHeaderRows(raw) {
  if (!raw) return headerHTMLFallback();
  try {
    const tpl = document.createElement('template');
    tpl.innerHTML = raw.trim();
    const thead = tpl.content.querySelector('thead');
    if (thead) return thead.innerHTML;
  } catch (err) {
    console.warn('extractHeaderRows failed', err);
  }
  return raw;
}

function headerHTMLFallback() {
  return `
<tr>
  <th class="frame_fixed_m__icTnd frame_skill__tLJuM" rowspan="2">技名</th>
  <th class="frame_frame__ev9CB" colspan="3">フレーム<ul>
    <li class="frame_startup_frame__Dc2Ph">発生</li>
    <li class="frame_active_frame__6Sovc"><input id="active_frame" type="checkbox" /><label for="active_frame">持続</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">技の動作中に攻撃判定が発生しているフレームを表します<br><br>（例） 【10-12】表記の場合、【10F/11F/12F】の【3F】間、攻撃判定が持続</div></div></li>
    <li class="frame_recovery_frame__CznJj">硬直</li>
  </ul></th>
  <th class="frame_recovery__omnsf" colspan="2">硬直差<ul>
    <li class="frame_hit_frame__K7xOz"><input id="hit_frame" type="checkbox" /><label for="hit_frame">ヒット</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">攻撃ヒット時の硬直差を表します<br><br>プラスの数値が大きいほど攻撃側が有利になります</div></div></li>
    <li class="frame_block_frame__SfHiW"><input id="block_frame" type="checkbox" /><label for="block_frame">ガード</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">相手にガードされた時の硬直差を表します<br><br>プラスの数値が大きいほど攻撃側が有利になります</div></div></li>
  </ul></th>
  <th class="frame_cancel__hT_hr" rowspan="2"><input id="cancel" type="checkbox" /><label for="cancel">キャンセル</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">C: キャンセル可能<br/>SA: スーパーアートへのキャンセル<br/>SA2: SA2/SA3 にキャンセル<br/>SA3: SA3 にキャンセル</div></div></th>
  <th class="frame_damage__HWaQm" rowspan="2"><p>ダメージ</p></th>
  <th class="frame_combo_correct__hCDUB" rowspan="2"><input id="combo_correct" type="checkbox" /><label for="combo_correct">コンボ補正値</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">コンボ中のダメージ修正などの概要</div></div></th>
  <th class="frame_drive_gauge_gain___tEvm" rowspan="2"><input id="drive_gauge_gain_hit" type="checkbox" /><label for="drive_gauge_gain_hit">Dゲージ増加（ヒット）</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">ドライブゲージ増加（ヒット）</div></div></th>
  <th class="frame_drive_gauge_lose__nSHd3" colspan="2">Dゲージ減少<ul>
    <li class="frame_drive_gauge_lose_dguard__4uQOc"><input id="drive_gauge_lose_dguard" type="checkbox" /><label for="drive_gauge_lose_dguard">ガード</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">ドライブゲージ減少（ガード）</div></div></li>
    <li class="frame_drive_gauge_lose_punish__mFrmM"><input id="drive_gauge_lose_punish" type="checkbox" /><label for="drive_gauge_lose_punish">パニッシュカウンター</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">ドライブゲージ減少（パニッシュカウンター）</div></div></li>
  </ul></th>
  <th class="frame_sa_gauge_gain__oGcqw" rowspan="2">SAゲージ増加</th>
  <th class="frame_attribute__1vABD" rowspan="2"><input id="attribute" type="checkbox" /><label for="attribute">属性</label><div class="frame_ex___h3rR"><div class="frame_inner__Qf7xV">属性の説明。上段・中段・下段・飛び道具など</div></div></th>
  <th class="frame_note__hfwBr" rowspan="2">備考</th>
</tr>
`;
}


async function loadCharacterData(char = '', control = 'classic') {
  const requestId = ++loadDataRequestId;
  const selectedVersion = frameDataViewState.selectedVersion || DEFAULT_FRAME_DATA_VERSION;
  const activeLang = getCurrentLang();
  const pathCandidates = getFrameDataPathCandidatesForVersion(char, control, selectedVersion, activeLang);
  const tbody = document.getElementById('frameBody');
  const thead = document.getElementById('frameHeader');
  const table = document.querySelector('.frame-table');

  // Header
  const headerHTML = await getHeaderTemplateHTML(getCurrentLang());
  if (thead) {
    thead.innerHTML = headerHTML;
    applyFrameHeaderLanguage(getCurrentLang());
  }
  if (table) applyColumnLayout(table);
  // Rows
  tbody.innerHTML = '';
  if (!char) {
    renderFrameDataVersion(selectedVersion);
    const selectText = getCurrentLang() === 'en'
      ? 'Select a character to load frame data.'
      : 'キャラクターを選択するとフレームデータを表示します。';
    tbody.innerHTML = `<tr><td colspan="15" style="color:#aaa">${selectText}</td></tr>`;
    convertAllTooltips();
    updateRightShadowById('#frameScroll');
    return;
  }
  try {
    const { data: raw } = await fetchFrameJsonByCandidates(pathCandidates);
    const version = extractFrameDataVersion(raw);
    const moves = normalizeMoves(raw);
    if (requestId !== loadDataRequestId) return;
    renderFrameDataVersion(selectedVersion || version);
    let diffMap = new Map();
    if (frameDataViewState.compareEnabled
      && frameDataViewState.compareVersion
      && frameDataViewState.compareVersion !== selectedVersion) {
      try {
        const compareCandidates = getFrameDataPathCandidatesForVersion(
          char,
          control,
          frameDataViewState.compareVersion,
          activeLang
        );
        const { data: compareRaw } = await fetchFrameJsonByCandidates(compareCandidates);
        const compareMoves = normalizeMoves(compareRaw);
        diffMap = buildFrameDiffMap(moves, compareMoves);
      } catch (compareErr) {
        console.warn('Frame compare data load failed:', compareErr);
      }
    }
    let lastSection = null;
    const rowsHtml = moves.map((m, moveIndex) => {
      let chunk = '';
      if (m.section && m.section !== lastSection) {
        chunk += sectionRowHtml(m.section);
        lastSection = m.section;
      }
      chunk += rowHtml(m, control, diffMap.get(moveIndex) || null);
      return chunk;
    }).join('');
    const noRowsText = getCurrentLang() === 'en' ? 'No rows' : 'データがありません。';
    tbody.innerHTML = rowsHtml || `<tr><td colspan="15" style="color:#aaa">${noRowsText}</td></tr>`;
  } catch (err) {
    console.error(err);
    if (requestId !== loadDataRequestId) return;
    renderFrameDataVersion(selectedVersion);
    const failText = getCurrentLang() === 'en'
      ? `Failed to load ${char} (${control}).`
      : `${char} (${control})の読み込みに失敗しました。`;
    tbody.innerHTML = `<tr><td colspan="15" style="color:#f55">${failText}</td></tr>`;
  }
  convertAllTooltips();
  updateRightShadowById('#frameScroll');
}

function normalizeMoves(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.moves)) {
    return raw.moves.map((m) => ({
      section: safeText(m.section),
      name: safeText(m.name),
      startup: safeText(m.startup),
      active: safeText(m.active),
      recovery: safeText(m.recovery),
      hitAdv: safeText(m.hitAdv),
      guardAdv: safeText(m.guardAdv),
      cancel: m.cancel ? safeText(m.cancel) : '',
      damage: safeText(m.damage),
      comboMod: safeText(m.comboMod),
      driveGain: safeText(m.driveGain),
      driveLossGuard: safeText(m.driveLossGuard),
      driveLossPunish: safeText(m.driveLossPunish),
      saGain: safeText(m.saGain),
      attribute: safeText(m.attribute),
      notes: safeText(m.notes)
    }));
  }
  if (Array.isArray(raw)) {
    return raw.map((m) => ({
      section: safeText(m && m.section),
      nameHtml: extractInnerFromTd(m && m.name),
      name: extractTextFromTd(m && m.name),
      startupHtml: extractInnerFromTd(m && m.startup),
      startup: extractTextFromTd(m && m.startup),
      activeHtml: extractInnerFromTd(m && m.active),
      active: extractTextFromTd(m && m.active),
      recoveryHtml: extractInnerFromTd(m && m.recovery),
      recovery: extractTextFromTd(m && m.recovery),
      hitAdvHtml: extractInnerFromTd(m && m.hitAdv),
      hitAdv: extractTextFromTd(m && m.hitAdv),
      guardAdvHtml: extractInnerFromTd(m && m.guardAdv),
      guardAdv: extractTextFromTd(m && m.guardAdv),
      cancelHtml: extractInnerFromTd(m && m.cancel),
      cancel: extractCancelFromTd(m && m.cancel),
      damageHtml: extractInnerFromTd(m && m.damage),
      damage: extractTextFromTd(m && m.damage),
      comboModHtml: extractInnerFromTd(m && m.comboMod),
      comboMod: extractTextFromTd(m && m.comboMod),
      driveGainHtml: extractInnerFromTd(m && m.driveGain),
      driveGain: extractTextFromTd(m && m.driveGain),
      driveLossGuardHtml: extractInnerFromTd(m && m.driveLossGuard),
      driveLossGuard: extractTextFromTd(m && m.driveLossGuard),
      driveLossPunishHtml: extractInnerFromTd(m && m.driveLossPunish),
      driveLossPunish: extractTextFromTd(m && m.driveLossPunish),
      saGainHtml: extractInnerFromTd(m && m.saGain),
      saGain: extractTextFromTd(m && m.saGain),
      attributeHtml: extractInnerFromTd(m && m.attribute),
      attribute: extractTextFromTd(m && m.attribute),
      notesHtml: extractInnerFromTd(m && m.notes),
      notes: extractTextFromTd(m && m.notes)
    }));
  }
  return [];
}

function rowHtml(m, control, diffInfo = null) {
  const cell = (html, txt, modeSensitive = false, tooltipContent = null) => {
    let markup = html && html.trim ? html.trim() : html;
    if (modeSensitive && markup) {
      markup = filterModeHtml(markup, control);
    }
    const content = markup && markup.length ? markup : escapeHtmlCompat(txt ?? '');

    if (tooltipContent) {
      const safeTooltip = escapeHtmlCompat(tooltipContent);
      return `<div class="tooltip-wrap">${content}<div class="tooltip-content">${safeTooltip}</div></div>`;
    }

    return content;
  };
  const diffFields = (diffInfo && diffInfo.fields) ? diffInfo.fields : {};
  const isNewRow = !!(diffInfo && diffInfo.isNew);
  const td = (baseClass, fieldKey, content) => {
    const classes = [];
    if (baseClass) classes.push(baseClass);
    if (isNewRow) classes.push('frame-row-new');
    const diff = fieldKey ? diffFields[fieldKey] : null;
    let title = '';
    if (diff) {
      classes.push('frame-cell-changed');
      const oldText = String(diff.old || '-').trim() || '-';
      const nextText = String(diff.next || '-').trim() || '-';
      title = `Prev: ${oldText} -> ${nextText}`;
    }
    const classAttr = classes.length ? ` class="${classes.join(' ')}"` : '';
    const titleAttr = title ? ` title="${escapeHtmlCompat(title)}"` : '';
    return `<td${classAttr}${titleAttr}>${content}</td>`;
  };
  const cancelCell = () => {
    if (m.cancelHtml && m.cancelHtml.trim()) return enhanceCancelHtml(m.cancelHtml);
    if (!m.cancel) return '';
    const token = resolveCancelToken(m.cancel);
    return `<span class="cancel-badge cancel-badge--${token}">${escapeHtmlCompat(m.cancel)}</span>`;
  };
  const nameContent = `${cell(m.nameHtml, m.name)}${isNewRow ? '<span class="frame-new-badge">NEW</span>' : ''}`;
  const rowClass = isNewRow ? ' class="frame-row-is-new"' : '';
  return (
    `<tr${rowClass}>` +
    td('frame_skill__tLJuM', 'name', nameContent) +
    td('', 'startup', cell(formatNumbersInHtml(m.startupHtml), fmt(m.startup), true)) +
    td('', 'active', cell(formatNumbersInHtml(m.activeHtml), fmt(m.active), true)) +
    td('', 'recovery', cell(formatNumbersInHtml(m.recoveryHtml), fmt(m.recovery), true)) +
    td('', 'hitAdv', cell(formatNumbersInHtml(m.hitAdvHtml), fmtSigned(m.hitAdv), true)) +
    td('', 'guardAdv', cell(formatNumbersInHtml(m.guardAdvHtml), fmtSigned(m.guardAdv), true)) +
    td('', 'cancel', cancelCell()) +
    td('', 'damage', cell(formatNumbersInHtml(m.damageHtml), fmt(m.damage), true)) +
    td('', 'comboMod', cell(m.comboModHtml, m.comboMod)) +
    td('', 'driveGain', cell(formatNumbersInHtml(m.driveGainHtml), fmt(m.driveGain), true)) +
    td('', 'driveLossGuard', cell(formatNumbersInHtml(m.driveLossGuardHtml), fmt(m.driveLossGuard), true)) +
    td('', 'driveLossPunish', cell(formatNumbersInHtml(m.driveLossPunishHtml), fmt(m.driveLossPunish), true)) +
    td('', 'saGain', cell(formatNumbersInHtml(m.saGainHtml), fmt(m.saGain), true)) +
    td('', 'attribute', cell(m.attributeHtml, m.attribute)) +
    td('', 'notes', cell(m.notesHtml, m.notes)) +
    '</tr>'
  );
}

function sectionRowHtml(label) {
  if (!label) return '';
  const safe = escapeHtmlCompat(label);
  return `<tr class="frame-section-row"><td class="frame-section-label">${safe}</td><td class="frame-section-fill" colspan="14"></td></tr>`;
}

function resolveCancelToken(text) {

  const raw = String(text || '');

  const normalized = typeof raw.normalize === "function" ? raw.normalize('NFKC') : raw;

  const upper = normalized.toUpperCase();

  if (upper.includes('SA3')) return normalized.includes('?') ? 'SA3-star' : 'SA3';

  if (upper.includes('SA2')) return normalized.includes('?') ? 'SA2-star' : 'SA2';

  if (upper.includes('SA')) return 'SA';

  if (normalized.includes('?') || upper.includes('*')) return 'STAR';

  if (upper.includes('C')) return 'C';

  return 'PLAIN';

}



function enhanceCancelHtml(html) {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const spans = wrap.querySelectorAll('span');
  if (!spans.length) {
    const text = wrap.textContent.trim();
    if (!text) return '';
    const token = resolveCancelToken(text);
    return `<span class="cancel-badge cancel-badge--${token}">${escapeHtmlCompat(text)}</span>`;
  }
  spans.forEach((span) => {
    const classes = Array.from(span.classList || []);
    const hasCancelBadge = classes.some((cls) => cls.startsWith('cancel-badge'));
    const text = (span.textContent || '').trim();
    const token = resolveCancelToken(text);
    if (!hasCancelBadge) {
      span.classList.add('cancel-badge');
    }
    span.classList.add(`cancel-badge--${token}`);
  });
  return wrap.innerHTML;
}

function safeText(v) { return v == null ? '' : (typeof v === 'string' ? v : String(v)); }

function extractTextFromTd(html) {
  if (!html || typeof html !== 'string') return '';
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const td = wrap.querySelector('td');
  const container = td || wrap;
  return container.textContent.trim();
}
function extractInnerFromTd(html) {
  if (!html || typeof html !== 'string') return '';
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const td = wrap.querySelector('td');
  const container = td || wrap;
  return container.innerHTML.trim();
}
function extractCancelFromTd(html) {
  const txt = extractTextFromTd(html).toUpperCase();
  const token = ['SA3', 'SA2', 'SA', 'C'].find(t => txt.includes(t));
  return token || txt || '';
}
const I18N_CORE = {
  jp: {
    'header.title': 'FRAME DATA',
    'theme.dark': 'DARK',
    'theme.light': 'LIGHT',
    'nav.frame': 'FRAME DATA',
    'nav.combo': 'COMBO LIST',
    'frame.char_label': 'キャラクターフレームアーカイブ',
    'frame.char_select': 'SELECT CHARACTER',
    'frame.data_version': 'データ',
    'frame.version_label': 'バージョン',
    'frame.official_patch': '公式パッチノート',
    'frame.compare': '比較',
    'frame.compare_against': '比較対象',
    'frame.compare_apply': '適用',
    'frame.compare_clear': '解除',
    'frame.empty': 'キャラクターと操作方法を選んでフレームデータを表示します。',
    'combo.search.placeholder': '検索',
    'combo.search': '検索',
    'combo.advanced': '詳細検索',
    'combo.advanced.summary': '詳細検索',
    'combo.import': 'IMPORT',
    'combo.export': 'EXPORT',
    'combo.export.scope': 'キャラ',
    'combo.export.mode': '操作モード',
    'combo.export.columns': '表示例',
    'combo.export.scope_current': '選択中',
    'combo.export.scope_all': '全て',
    'combo.export.mode_current': '選択中',
    'combo.export.mode_all': '全て',
    'combo.export.columns_current': '表示中',
    'combo.export.columns_full': '全て',
    'combo.rows.label': '行:',
    'combo.rows.frame': 'フレームメーター',
    'combo.rows.buttons': 'ボタン',
    'combo.rows.notes': '備考',
    'combo.rows.all': 'ALL',
    'combo.filter.apply': '適用',
    'combo.filter.clear': 'クリア',
    'help.button': 'ヘルプ',
    'help.title': 'HELP',
    'help.description': 'Lab Monster SF6 の使い方',
    'help.main_title': 'Lab Monster SF6 - 利用ガイド',
    'help.intro': 'コンボ作成、入出力、安全なデータ管理、フレームデータ参照のための総合ツールです。',
    'help.tab.features': '機能',
    'help.tab.howto': '使い方',
    'help.tab.notations': '表記ルール',
    'help.tab.fields': '項目の説明',
    'help.tab.roadmap': '今後の予定',
    'help.group.frame': 'フレームデータ',
    'help.group.combo': 'コンボリスト',
    'help.howto.heading': '機能別ワークフロー',
    'help.howto.frame_compare': 'フレームデータ比較',
    'help.howto.combo_entry': 'コンボ入力',
    'help.howto.table_control': 'テーブル操作',
    'help.howto.search': '検索 / フィルター',
    'help.howto.import_export': 'インポート / エクスポート',
    'help.howto.data_management': 'データ管理',
    'help.howto.table_control_full': 'テーブル操作（行 / 列 / ソート）',
    'help.howto.search_full': '検索 / 詳細フィルター',
    'help.howto.data_management_full': 'データ管理 / 復旧',
    'help.common.what_it_does': '機能概要',
    'help.common.how_to_do': '手順',
    'help.common.specific_uses': '活用例',
    'help.jump.notations.prefix': '指定のコマンド表記は、こちらを参照してください：',
    'help.jump.fields.prefix': '各項目の意味は、こちらを参照してください：',
    'help.notation.command': 'コマンド構成',
    'help.notation.symbols': '記号 / トークン',
    'help.notation.examples': '記述例',
    'help.fields.core': '基本項目',
    'help.fields.condition': '条件グループ',
    'help.fields.result': '結果グループ',
    'help.fields.post': 'コンボ後グループ',
    'help.fields.misc': 'その他項目',
    'help.roadmap.note': 'ロードマップは段階的に更新され、内容は変更される場合があります。',
    'help.quickstart.title': 'クイックスタート',
    'help.quickstart.1': 'キャラ画像をクリックしてキャラを切り替えます。',
    'help.quickstart.2': 'Classic/Modern を選んでコンボ表を編集します。',
    'help.quickstart.3': 'Import / Export でデータを入出力できます。',
    'update.button': '更新履歴',
    'update.title': '更新履歴',
    'update.description': 'Lab Monster SF6 の更新履歴です。',
    'update.version_label': 'バージョン',
    'update.date_label': '日付',
    'update.notes.title': 'ツール更新履歴',
    'update.notes.1': 'v1.0.0 (2026-02-16): 基礎的なコンボ表とフレーム表の機能をリリース。',

    'info.button': '情報',
    'offline.button': 'オフライン版',
    'offline.warning': 'オンライン版とオフライン版のセーブデータは共有されません。\n切り替え前にバックアップを出力してください。\nオフライン版をダウンロードしますか？',
    'info.title': 'INFORMATION',
    'info.description': '連絡先、関連リンク、クレジット。',
    'info.team.title': 'チーム',
    'info.team.body': 'Marshial Law: Lab Monster SF6 の企画・開発担当。コンボ研究と実戦準備に使える実用ツールを継続的に改善してきます。傍らでSF6のMOD制作も行っています。',
    'info.contact.title': '連絡先',
    'info.contact.body': '要望やフィードバックはこちらから。',
    'info.contact.discord_label': 'Discord',
    'info.contact.email_label': 'メール',
    'info.links.title': 'リンク',
    'info.links.patch': '公式 SF6 パッチノート',
    'info.links.site': '公式 SF6 サイト',
    'info.links.offline': 'オフライン版ダウンロード',
    'info.thanks.title': '謝辞',
    'info.thanks.body': '検証・データ共有・フィードバックを提供してくれるSF6コミュニティに感謝。',
    'info.donate.title': 'サポート',
    'info.donate.bmc': 'Buy Me a Coffee',
    'info.donate.patreon': 'Patreon',
    'info.donate.kofi': 'Ko-fi',

    'info.roadmap.title': '今後の予定',
    'info.roadmap.1': 'データ入力の負担を減らすために、自動計算と自動入力機能。',
    'info.roadmap.2': 'クラシックとモダンの間で、コマンド・ボタン・ダメージを自動変換する機能。',
    'info.roadmap.3': 'コンボが成立可能かや、操作タイプ別に自動判定する機能。',
    'info.roadmap.4': 'モバイル版の検討（タブレット向け想定）',
    'info.roadmap.5': 'コンボ自動生成機能の検討（おそらく実装しない）',
    'info.roadmap.6': 'コンボ品質の分析・レポート機能の検討（おそらく実装しない）',
    'info.roadmap.note': 'ロードマップは段階的に更新され、内容は変更される場合があります。',

  },
  en: {
    'header.title': 'Frame Data',
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'nav.frame': 'FRAME DATA',
    'nav.combo': 'COMBO LIST',
    'frame.char_label': 'Character Frame Archive',
    'frame.char_select': 'CHARACTER SELECT',
    'frame.data_version': 'Data',
    'frame.version_label': 'Version',
    'frame.official_patch': 'Official Patch Notes',
    'frame.compare': 'Compare',
    'frame.compare_against': 'Against',
    'frame.compare_apply': 'Apply',
    'frame.compare_clear': 'Clear',
    'frame.empty': 'Select a character and control type to load frame data.',
    'combo.search.placeholder': 'Search',
    'combo.search': 'Search',
    'combo.advanced': 'Advanced Search',
    'combo.advanced.summary': 'Advanced Search',
    'combo.import': 'IMPORT',
    'combo.export': 'EXPORT',
    'combo.export.scope': 'Character',
    'combo.export.mode': 'Control Mode',
    'combo.export.columns': 'Columns',
    'combo.export.scope_current': 'Current',
    'combo.export.scope_all': 'All',
    'combo.export.mode_current': 'Current',
    'combo.export.mode_all': 'All',
    'combo.export.columns_current': 'Current',
    'combo.export.columns_full': 'All',
    'combo.rows.label': 'Rows:',
    'combo.rows.frame': 'Frame Meter',
    'combo.rows.buttons': 'Buttons',
    'combo.rows.notes': 'Notes',
    'combo.rows.all': 'All',
    'combo.filter.apply': 'Apply',
    'combo.filter.clear': 'Clear',
    'help.button': 'HELP',
    'help.title': 'HELP',
    'help.description': 'How to use Lab Monster SF6.',
    'help.main_title': 'Lab Monster SF6 - Usage Guide',
    'help.intro': 'Definitive combo management tool for combo authoring, importing/exporting, safe data management, and frame-data reference.',
    'help.tab.features': 'Features',
    'help.tab.howto': 'How To Use',
    'help.tab.notations': 'Notations Used',
    'help.tab.fields': 'Explanation of Fields',
    'help.tab.roadmap': "What's Next",
    'help.group.frame': 'Frame Data',
    'help.group.combo': 'Combo List',
    'help.howto.heading': 'Function-Based Workflows',
    'help.howto.frame_compare': 'Frame Data Compare',
    'help.howto.combo_entry': 'Combo Entry',
    'help.howto.table_control': 'Table Control',
    'help.howto.search': 'Search / Filter',
    'help.howto.import_export': 'Import / Export',
    'help.howto.data_management': 'Data Management',
    'help.howto.table_control_full': 'Table Control (Rows / Columns / Sorting)',
    'help.howto.search_full': 'Search / Advanced Filter',
    'help.howto.data_management_full': 'Data Management / Recovery',
    'help.common.what_it_does': 'What It Does',
    'help.common.how_to_do': 'How To Do It',
    'help.common.specific_uses': 'Specific Uses',
    'help.jump.notations.prefix': 'Notation requirements are summarized in',
    'help.jump.fields.prefix': 'Field meanings are documented in',
    'help.notation.command': 'Command Structure',
    'help.notation.symbols': 'Symbols / Tokens',
    'help.notation.examples': 'Examples',
    'help.fields.core': 'Core Columns',
    'help.fields.condition': 'Condition Group',
    'help.fields.result': 'Result Group',
    'help.fields.post': 'Post-Combo Group',
    'help.fields.misc': 'Miscellaneous Group',
    'help.roadmap.note': 'Roadmap is iterative and subject to change.',
    'help.quickstart.title': 'QUICK START',
    'help.quickstart.1': 'Select a character portrait to switch characters.',
    'help.quickstart.2': 'Choose Classic/Modern and edit combos in the table.',
    'help.quickstart.3': 'Use Import/Export to move data in and out.',
    'update.button': 'UPDATE LOG',
    'update.title': 'UPDATE LOG',
    'update.description': 'Updates for Lab Monster SF6.',
    'update.version_label': 'Version',
    'update.date_label': 'Date',
    'update.notes.title': 'RECENT UPDATES',
    'update.notes.1': 'v1.0.0 (2026-02-16): Initial version release with basic combo table and frame data functions.',

    'info.button': 'INFO',
    'offline.button': 'OFFLINE Ver.',
    'offline.warning': 'Online and offline versions do not share saved data.\nPlease export a backup before switching.\nDownload offline version now?',
    'info.title': 'INFORMATION',
    'info.description': 'Contact, useful links, and project credits.',
    'info.team.title': 'TEAM',
    'info.team.body': 'Marshial Law: Creator and developer of Lab Monster SF6. Focused on practical tools for combo lab and match preparation. Also making SF6 mods on the side.',
    'info.contact.title': 'CONTACT',
    'info.contact.body': 'For requests and feedback, please use your preferred contact channel.',
    'info.contact.discord_label': 'Discord',
    'info.contact.email_label': 'Email',
    'info.links.title': 'LINKS',
    'info.links.patch': 'Official SF6 Patch Notes',
    'info.links.site': 'Official SF6 Website',
    'info.links.offline': 'Download Offline Version',
    'info.thanks.title': 'THANKS',
    'info.thanks.body': 'Thanks to the SF6 community and everyone testing, sharing data, and sending feedback.',
    'info.donate.title': 'SUPPORT ME',
    'info.donate.bmc': 'Buy Me a Coffee',
    'info.donate.patreon': 'Patreon',
    'info.donate.kofi': 'Ko-fi',

    'info.roadmap.title': 'FUTURE PLAN',
    'info.roadmap.1': 'Automatic calculation and auto-fill data functions to make data entry faster and easier.',
    'info.roadmap.2': 'Automatic conversion of command, buttons, and damage between Classic and Modern controls.',
    'info.roadmap.3': 'Function to automatically check if a combo is possible in general and in selected control mode.',
    'info.roadmap.4': 'Mobile app version, probably intended for tablets (may be).',
    'info.roadmap.5': 'Function to automatically generate combo (probably not).',
    'info.roadmap.6': 'Function to analyze and report quality combos (probably not).',
    'info.roadmap.note': 'Roadmap is iterative and subject to change.',

  }

};

const PATCH_NOTES_LINKS = {
  jp: 'https://www.streetfighter.com/6/buckler/ja-jp/battle_change',
  en: 'https://www.streetfighter.com/6/buckler/en/battle_change',
};
const OFFICIAL_SITE_LINKS = {
  jp: 'https://www.streetfighter.com/6/ja-jp/',
  en: 'https://www.streetfighter.com/6/en-us/',
};

function resolveOfflineReleaseUrl() {
  if (typeof window === 'undefined' || !window.location) return null;
  const hostname = String(window.location.hostname || '').toLowerCase();
  const parts = String(window.location.pathname || '').split('/').filter(Boolean);
  if (hostname.endsWith('.github.io')) {
    const owner = hostname.split('.')[0];
    const repo = parts[0];
    if (owner && repo) return `https://github.com/${owner}/${repo}/releases/latest`;
  }
  if (hostname === 'github.com' && parts.length >= 2) {
    return `https://github.com/${parts[0]}/${parts[1]}/releases/latest`;
  }
  return null;
}

function getOfflineDownloadWarningMessage(lang) {
  const active = ((lang || getCurrentLang() || 'jp').toLowerCase() === 'en') ? 'en' : 'jp';
  return translateKey('offline.warning', active)
    || translateKey('offline.warning', 'jp')
    || 'Online and offline versions do not share saved data. Continue?';
}

function openOfflineDownloadWithWarning(url) {
  if (!url || url === '#') return;
  const approved = window.confirm(getOfflineDownloadWarningMessage(getCurrentLang()));
  if (!approved) return;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.location.href = url;
  }
}

let helpTranslations = (window.HELP_TRANSLATIONS_DATA && typeof window.HELP_TRANSLATIONS_DATA === 'object')
  ? window.HELP_TRANSLATIONS_DATA
  : { jp: {} };
let helpTranslationsPromise = null;
const helpTextOriginalCache = new WeakMap();
const helpElementOriginalHtmlCache = new WeakMap();

const FRAME_HEADER_LABELS = {
  '技名': 'Move Name',
  'フレーム': 'Frames',
  '動作フレーム': 'Frames',
  '発生': 'Start-up',
  '持続': 'Active',
  '硬直': 'Recovery',
  '硬直差': 'Frame Advantage',
  'ヒット': 'Hit',
  'ガード': 'Block',
  'キャンセル': 'Cancel',
  'ダメージ': 'Damage',
  'コンボ補正値': 'Combo Scaling',
  'Dゲージ増加（ヒット）': 'Drive Gauge Increase (Hit)',
  'Dゲージ増加': 'Drive Gauge Increase',
  'Dゲージ減少': 'Drive Gauge Decrease',
  'パニッシュカウンター': 'Punish Counter',
  'SAゲージ増加': 'SA Gauge Increase',
  '属性': 'Properties',
  '備考': 'Miscellaneous',
};

const frameHeaderTextCache = new WeakMap();
const frameHeaderTooltipCache = new WeakMap();
const FRAME_HEADER_TOOLTIP_TEXTS = {
  active_frame:
    'The value listed here is what frame the attack hitbox will come out when the attack is performed.<br><br>Ex.<br>If the value is 10-12, then the attack hitbox will be active from frames 10-12.',
  hit_frame:
    'Shows frame advantage on hit.<br><br>The larger the positive value, the more advantage the attacker has.',
  block_frame:
    'Shows frame advantage on block.<br><br>The larger the positive value, the more advantage the attacker has.',
  cancel:
    'C<br>Can be canceled by a special move, Drive Impact, Drive Rush or Super Art<br><br>SA<br>Can only be canceled by a Super Art<br><br>SA2<br>Can only be canceled by a level 2 or 3 Super Art<br><br>SA3<br>Can only be canceled by a level 3 Super Art or Critical Art<br><br>*<br>Can only be canceled by specific attacks',
  combo_correct:
    'In addition to the regular combo scaling, any unique scaling that an attack has is displayed here<br><br>Initial Scaling<br>Scaling added when the first hit of the combo lands<br><br>Combo Scaling<br>Scaling added after the second hit of the combo lands<br><br>Immediate Scaling<br>Scaling added to the attack itself after the second hit of the combo lands<br><br>Multiplier Scaling <br>Scaling value that is multiplied by subsequent combo scaling values when incorporated into a combo.',
  drive_gauge_gain_hit:
    'Amount of Drive Gauge recovered by the attacker when the attack hits',
  drive_gauge_lose_dguard:
    'Amount of Drive Gauge lost by the defender when blocking',
  drive_gauge_lose_punish:
    'Amount of Drive Gauge lost by the defender on a Punish Counter',
  attribute:
    'Displays the attack hitbox properties.<br><br>H<br>High level attacks that can be blocked standing or crouching<br><br>M<br>Mid level overhead attacks that must be blocked standing<br><br>L<br>Low level attacks that must be blocked crouching<br><br>T<br>Throws that cannot be blocked<br><br>P<br>Projectile attacks<br><br>MP<br>Mid-air projectile attacks that are considered to be aerial attacks',
};
const normalizeFrameLabel = (text) =>
  String(text || '')
    .replace(/\s+/g, '')
    .replace(/[()\uFF08\uFF09]/g, '')
    .trim();

function normalizeGameVersion(value) {

  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.replace(/^v(?:er(?:sion)?)?\.?\s*/i, '');
}

function extractFrameDataVersion(raw) {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const meta = raw.meta || raw._meta || raw.info || {};
    const version = normalizeGameVersion(
      raw.gameVersion || raw.game_version || raw.updateVersion || raw.update_version
      || raw.version || raw.dataVersion || raw.datasetVersion
      || meta.gameVersion || meta.game_version || meta.updateVersion || meta.update_version
      || meta.version || meta.dataVersion || meta.datasetVersion
    );
    if (version) return version;
  }
  return DEFAULT_FRAME_DATA_VERSION;
}

function renderFrameDataVersion(version = null) {
  if (version != null) {
    currentFrameDataVersion = normalizeGameVersion(version) || DEFAULT_FRAME_DATA_VERSION;
  }
}

function versionSortValue(versionId) {
  const parts = String(versionId || '')
    .split(/[^0-9]+/)
    .filter(Boolean)
    .map((n) => Number.parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts.slice(0, 3);
}

function compareVersionsDesc(a, b) {
  const av = versionSortValue(a);
  const bv = versionSortValue(b);
  for (let i = 0; i < Math.max(av.length, bv.length); i += 1) {
    const d = (bv[i] || 0) - (av[i] || 0);
    if (d !== 0) return d;
  }
  return String(b || '').localeCompare(String(a || ''));
}

function getFrameVersionEntry(versionId) {
  return frameDataVersions.find((entry) => entry.id === versionId) || DEFAULT_FRAME_DATA_VERSION_ENTRY;
}

function getFrameDataPathCandidatesForVersion(char, control, versionId, lang = null) {
  const activeLang = (lang || getCurrentLang() || 'jp').toLowerCase();
  const entry = getFrameVersionEntry(versionId);
  const base = String(entry.path || DEFAULT_FRAME_DATA_VERSION_ENTRY.path).replace(/\/+$/, '');
  const candidates = [];

  if (activeLang === 'en') {
    const explicitEn = String(entry.pathEn || entry.path_en || '').trim().replace(/\/+$/, '');
    if (explicitEn) candidates.push(explicitEn);
    if (base && !base.endsWith('_en')) candidates.push(`${base}_en`);
  } else {
    const explicitJp = String(entry.pathJp || entry.path_jp || '').trim().replace(/\/+$/, '');
    if (explicitJp) candidates.push(explicitJp);
  }

  if (base) candidates.push(base);
  const uniqueBases = [...new Set(candidates.filter(Boolean))];
  return uniqueBases.map((dir) => `${dir}/${char}_${control}.json`);
}

function getFrameDataPathForVersion(char, control, versionId, lang = null) {
  const [firstPath] = getFrameDataPathCandidatesForVersion(char, control, versionId, lang);
  return firstPath || `${DEFAULT_FRAME_DATA_VERSION_ENTRY.path}/${char}_${control}.json`;
}

async function fetchFrameJsonByCandidates(paths) {
  let lastError = null;
  for (const path of paths) {
    try {
      const data = await loadJsonResource(path);
      return { data, path };
    } catch (err) {
      lastError = err;
    }
  }
  if (lastError) throw lastError;
  throw new Error('No frame data path candidates available.');
}

async function ensureFrameDataVersionsLoaded() {
  if (frameDataVersionsLoaded) return frameDataVersions;
  if (frameDataVersionsPromise) return frameDataVersionsPromise;
  frameDataVersionsPromise = (async () => {
    try {
      const data = await loadJsonResource(FRAME_VERSION_MANIFEST_PATH);
      const versions = Array.isArray(data && data.versions) ? data.versions : [];
      const parsed = versions
        .map((entry) => ({
          id: normalizeGameVersion(entry && (entry.id || entry.version || '')),
          label: String((entry && entry.label) || '').trim(),
          path: String((entry && entry.path) || '').trim(),
          pathEn: String((entry && (entry.pathEn || entry.path_en)) || '').trim(),
          pathJp: String((entry && (entry.pathJp || entry.path_jp)) || '').trim(),
        }))
        .filter((entry) => entry.id && entry.path);
      if (parsed.length) {
        parsed.sort((a, b) => compareVersionsDesc(a.id, b.id));
        frameDataVersions = parsed;
      } else {
        frameDataVersions = [DEFAULT_FRAME_DATA_VERSION_ENTRY];
      }
      const manifestLatest = normalizeGameVersion(data && (data.latest || data.latestVersion || ''));
      const first = frameDataVersions[0] || DEFAULT_FRAME_DATA_VERSION_ENTRY;
      const selected = frameDataVersions.some((v) => v.id === manifestLatest) ? manifestLatest : first.id;
      frameDataViewState.selectedVersion = selected || DEFAULT_FRAME_DATA_VERSION;
      currentFrameDataVersion = frameDataViewState.selectedVersion;
      frameDataVersionsLoaded = true;
      return frameDataVersions;
    } catch (err) {
      console.warn('Failed to load frame data version manifest, using default.', err);
      frameDataVersions = [DEFAULT_FRAME_DATA_VERSION_ENTRY];
      frameDataViewState.selectedVersion = DEFAULT_FRAME_DATA_VERSION;
      currentFrameDataVersion = DEFAULT_FRAME_DATA_VERSION;
      frameDataVersionsLoaded = true;
      return frameDataVersions;
    }
  })();
  return frameDataVersionsPromise;
}

function populateFrameVersionSelects() {
  const select = document.getElementById('frameVersionSelect');
  const compareSelect = document.getElementById('frameCompareVersionSelect');
  if (!select) return;
  const options = frameDataVersions.length ? frameDataVersions : [DEFAULT_FRAME_DATA_VERSION_ENTRY];
  const makeOption = (entry) => {
    const opt = document.createElement('option');
    opt.value = entry.id;
    opt.textContent = entry.label || entry.id;
    return opt;
  };
  select.innerHTML = '';
  options.forEach((entry) => select.appendChild(makeOption(entry)));
  if (!options.some((entry) => entry.id === frameDataViewState.selectedVersion)) {
    frameDataViewState.selectedVersion = options[0].id;
  }
  select.value = frameDataViewState.selectedVersion;

  if (compareSelect) {
    compareSelect.innerHTML = '';
    options.forEach((entry) => compareSelect.appendChild(makeOption(entry)));
    let compareVersion = frameDataViewState.compareVersion;
    if (!compareVersion || !options.some((entry) => entry.id === compareVersion) || compareVersion === frameDataViewState.selectedVersion) {
      const fallback = options.find((entry) => entry.id !== frameDataViewState.selectedVersion);
      compareVersion = fallback ? fallback.id : frameDataViewState.selectedVersion;
    }
    frameDataViewState.compareVersion = compareVersion;
    compareSelect.value = compareVersion;
  }
  renderFrameDataVersion(frameDataViewState.selectedVersion);
}

function setFrameComparePanelVisible(visible) {
  const panel = document.getElementById('frameComparePanel');
  const btn = document.getElementById('frameCompareBtn');
  if (!panel) return;
  panel.classList.toggle('hidden', !visible);
  if (btn) btn.classList.toggle('active', !!visible);
}

function buildFrameDiffMap(currentMoves, compareMoves) {
  const result = new Map();
  if (!Array.isArray(currentMoves) || !Array.isArray(compareMoves) || !compareMoves.length) {
    return result;
  }
  const fields = [
    'startup', 'active', 'recovery', 'hitAdv', 'guardAdv', 'cancel', 'damage',
    'comboMod', 'driveGain', 'driveLossGuard', 'driveLossPunish', 'saGain',
    'attribute', 'notes',
  ];
  const normalizeKey = (text) => String(text || '').replace(/\s+/g, '').toLowerCase();
  const normalizeValue = (text) => String(text || '').replace(/\s+/g, '').replace(/,/g, '').trim();
  const buildLookup = (moves) => {
    const map = new Map();
    const counters = new Map();
    moves.forEach((move) => {
      const base = `${normalizeKey(move.section)}|${normalizeKey(move.name)}`;
      const count = (counters.get(base) || 0) + 1;
      counters.set(base, count);
      map.set(`${base}#${count}`, move);
    });
    return map;
  };

  const compareLookup = buildLookup(compareMoves);
  const currentCounters = new Map();
  currentMoves.forEach((move, idx) => {
    const base = `${normalizeKey(move.section)}|${normalizeKey(move.name)}`;
    const count = (currentCounters.get(base) || 0) + 1;
    currentCounters.set(base, count);
    const other = compareLookup.get(`${base}#${count}`);
    if (!other) {
      result.set(idx, { isNew: true, fields: {} });
      return;
    }
    const diffFields = {};
    fields.forEach((field) => {
      const nowVal = normalizeValue(move[field]);
      const oldVal = normalizeValue(other[field]);
      if (nowVal !== oldVal) {
        diffFields[field] = {
          old: String(other[field] || '').trim(),
          next: String(move[field] || '').trim(),
        };
      }
    });
    if (Object.keys(diffFields).length) {
      result.set(idx, { isNew: false, fields: diffFields });
    }
  });
  return result;
}

function getCurrentLang() {
  return document.body.getAttribute('data-lang') || 'jp';
}

function translateKey(key, lang) {
  const dict = I18N_CORE[lang] || I18N_CORE.jp;
  return dict[key] ?? (I18N_CORE.jp[key] ?? '');
}

function applyCoreI18n(lang) {
  const active = lang || getCurrentLang();
  const html = document.documentElement;
  if (html) html.setAttribute('lang', active === 'en' ? 'en' : 'ja');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const text = translateKey(key, active);
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    const text = translateKey(key, active);
    if (text) el.setAttribute('placeholder', text);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    const text = translateKey(key, active);
    if (text) el.setAttribute('aria-label', text);
  });
}

function applyOfficialLinks(lang) {
  const active = ((lang || getCurrentLang() || 'jp').toLowerCase() === 'en') ? 'en' : 'jp';
  const patchLink = document.getElementById('infoPatchNotesLink');
  if (patchLink) {
    patchLink.href = PATCH_NOTES_LINKS[active] || PATCH_NOTES_LINKS.jp;
  }
  const officialSiteLink = document.getElementById('infoOfficialSiteLink');
  if (officialSiteLink) {
    officialSiteLink.href = OFFICIAL_SITE_LINKS[active] || OFFICIAL_SITE_LINKS.jp;
  }
  const offlineLink = document.getElementById('infoOfflineDownloadLink');
  const offlineTopButton = document.getElementById('appOfflineBtn');
  const releaseUrl = resolveOfflineReleaseUrl();
  if (offlineLink) {
    if (releaseUrl) {
      offlineLink.href = releaseUrl;
      offlineLink.classList.remove('is-disabled');
      offlineLink.removeAttribute('aria-disabled');
      offlineLink.removeAttribute('tabindex');
    } else {
      offlineLink.href = '#';
      offlineLink.classList.add('is-disabled');
      offlineLink.setAttribute('aria-disabled', 'true');
      offlineLink.setAttribute('tabindex', '-1');
    }
  }
  if (offlineTopButton) {
    if (releaseUrl) {
      offlineTopButton.href = releaseUrl;
      offlineTopButton.classList.remove('is-disabled');
      offlineTopButton.removeAttribute('aria-disabled');
      offlineTopButton.removeAttribute('tabindex');
    } else {
      offlineTopButton.href = '#';
      offlineTopButton.classList.add('is-disabled');
      offlineTopButton.setAttribute('aria-disabled', 'true');
      offlineTopButton.setAttribute('tabindex', '-1');
    }
  }
}

function normalizeHelpTextKey(text) {
  const raw = String(text || '').replace(/\u00a0/g, ' ');
  const normalized = typeof raw.normalize === 'function' ? raw.normalize('NFKC') : raw;
  return normalized
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function preserveHelpTextWhitespace(original, translated) {
  const leading = (original.match(/^\s*/) || [''])[0];
  const trailing = (original.match(/\s*$/) || [''])[0];
  return `${leading}${translated}${trailing}`;
}

function ensureHelpTranslationsLoaded() {
  if (!helpTranslationsPromise) {
    helpTranslationsPromise = Promise.resolve(helpTranslations);
  }
  return helpTranslationsPromise;
}

function applyHelpInlineOverrides(helpView, lang) {
  if (!helpView) return;
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const htmlAttr = active === 'jp' ? 'data-help-jp-html' : 'data-help-en-html';
  const textAttr = active === 'jp' ? 'data-help-jp' : 'data-help-en';
  const tagged = helpView.querySelectorAll('[data-help-jp],[data-help-en],[data-help-jp-html],[data-help-en-html]');

  tagged.forEach((el) => {
    if (!helpElementOriginalHtmlCache.has(el)) {
      helpElementOriginalHtmlCache.set(el, el.innerHTML);
    }
    const html = el.getAttribute(htmlAttr);
    const text = el.getAttribute(textAttr);
    if (html != null && html !== '') {
      el.innerHTML = html;
      el.dataset.helpInlineTranslated = '1';
      return;
    }
    if (text != null) {
      el.textContent = text;
      el.dataset.helpInlineTranslated = '1';
      return;
    }
    const original = helpElementOriginalHtmlCache.get(el);
    if (typeof original === 'string') el.innerHTML = original;
    delete el.dataset.helpInlineTranslated;
  });
}

function applyHelpTextLanguage(lang, skipFetch = false) {
  const active = lang || getCurrentLang();
  const helpView = document.getElementById('helpView');
  if (!helpView) return;

  if (!skipFetch) {
    ensureHelpTranslationsLoaded().then(() => applyHelpTextLanguage(active, true));
  }

  const dict = (helpTranslations && helpTranslations[active]) || {};
  applyHelpInlineOverrides(helpView, active);

  // Element-level fallback translation.
  // If a JP translation contains HTML tags (e.g. <b>...</b>), render it as HTML
  // so help text can include custom emphasis without extra per-line attributes.
  helpView.querySelectorAll('li, p, h3, th, td').forEach((el) => {
    if (!el || el.hasAttribute('data-i18n')) return;
    if (el.closest('[data-i18n],[data-i18n-placeholder],[data-i18n-aria]')) return;
    if (el.closest('[data-help-inline-translated="1"]')) return;
    if (el.querySelector('code,img,svg')) return;

    if (!helpElementOriginalHtmlCache.has(el)) {
      helpElementOriginalHtmlCache.set(el, el.innerHTML);
    }

    if (active !== 'jp') {
      if (el.dataset.helpBlockTranslated === '1') {
        const originalHtml = helpElementOriginalHtmlCache.get(el);
        if (typeof originalHtml === 'string') el.innerHTML = originalHtml;
        delete el.dataset.helpBlockTranslated;
      }
      return;
    }

    const key = normalizeHelpTextKey(el.textContent || '');
    const translated = dict[key];
    if (!translated) return;

    if (/<[a-z][\s\S]*>/i.test(translated)) {
      el.innerHTML = translated;
    } else {
      el.textContent = translated;
    }
    el.dataset.helpBlockTranslated = '1';
  });

  const walker = document.createTreeWalker(helpView, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node || !node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-i18n],[data-i18n-placeholder],[data-i18n-aria]')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('code,script,style')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-help-block-translated="1"]')) return NodeFilter.FILTER_REJECT;
      if (parent.closest('[data-help-inline-translated="1"]')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let node = walker.nextNode();
  while (node) {
    if (!helpTextOriginalCache.has(node)) {
      helpTextOriginalCache.set(node, node.textContent || '');
    }
    const original = helpTextOriginalCache.get(node) || '';
    if (active !== 'jp') {
      node.textContent = original;
    } else {
      const translated = dict[normalizeHelpTextKey(original)];
      node.textContent = translated ? preserveHelpTextWhitespace(original, translated) : original;
    }
    node = walker.nextNode();
  }
}

function applyFrameHeaderLanguage(lang) {
  const active = lang || getCurrentLang();
  const header = document.getElementById('frameHeader');
  if (!header) return;
  const lookup = new Map();
  Object.entries(FRAME_HEADER_LABELS).forEach(([jp, en]) => {
    lookup.set(normalizeFrameLabel(jp), en);
  });
  const translateTextNode = (node) => {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const raw = node.textContent || '';
    const normalized = normalizeFrameLabel(raw);
    const en = lookup.get(normalized);
    if (!en) return;
    if (active === 'en') {
      if (!frameHeaderTextCache.has(node)) frameHeaderTextCache.set(node, raw);
      node.textContent = en;
    } else {
      const jp = frameHeaderTextCache.get(node);
      if (jp != null) node.textContent = jp;
    }
  };

  header
    .querySelectorAll('label, th > p, th > span, th > div > p, th > div > span')
    .forEach((el) => {
      const raw = (el.textContent || '').trim();
      if (!raw) return;
      const normalized = normalizeFrameLabel(raw);
      const en = lookup.get(normalized);
      if (!en) return;
      if (active === 'en') {
        if (!frameHeaderTextCache.has(el)) frameHeaderTextCache.set(el, raw);
        el.textContent = en;
      } else {
        const jp = frameHeaderTextCache.get(el);
        if (jp != null) el.textContent = jp;
      }
    });

  header.querySelectorAll('th').forEach((th) => {
    th.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim()) {
        translateTextNode(node);
      }
    });
  });

  header.querySelectorAll('th li').forEach((li) => {
    li.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim()) {
        translateTextNode(node);
      }
    });
  });

  header.querySelectorAll('.frame_inner__Qf7xV').forEach((el) => {
    if (!el) return;
    if (!frameHeaderTooltipCache.has(el)) {
      frameHeaderTooltipCache.set(el, el.innerHTML);
    }
    if (active !== 'en') {
      const original = frameHeaderTooltipCache.get(el);
      if (typeof original === 'string') el.innerHTML = original;
      return;
    }
    // If template already provides English text (e.g., official EN header template), keep it.
    if (!/[\u3040-\u30ff\u4e00-\u9fff]/.test(el.textContent || '')) return;
    const owner = el.closest('th, li');
    const inputId = owner ? (owner.querySelector('input[id]')?.id || '') : '';
    const translated = FRAME_HEADER_TOOLTIP_TEXTS[inputId];
    if (translated) {
      el.innerHTML = translated;
    }
  });
}

function initLanguageToggle() {
  const buttons = document.querySelectorAll('.lang-btn');
  if (!buttons.length) return;
  const body = document.body;
  const applyLang = (lang) => {
    const nextLang = lang || 'jp';
    buttons.forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === nextLang));
    body.setAttribute('data-lang', nextLang);
    applyCoreI18n(nextLang);
    applyOfficialLinks(nextLang);
    applyHelpTextLanguage(nextLang);
    applyFrameHeaderLanguage(nextLang);
    renderFrameDataVersion();
    // Reload current frame table immediately so locale-specific data swaps without requiring mode/character changes.
    const currentChar = (document.body.dataset.currentCharSlug || '').trim();
    const activeControl = document.getElementById('tabModern')?.classList.contains('active') ? 'modern' : 'classic';
    loadCharacterData(currentChar, activeControl).catch((err) => {
      console.warn('Language frame reload failed:', err);
    });
    if (typeof window.applyCharacterSelectLanguage === 'function') {
      window.applyCharacterSelectLanguage(nextLang);
    }
    refreshFrameCharacterNames(nextLang);
    if (typeof window.applyComboLanguage === 'function') {
      window.applyComboLanguage(nextLang);
    }
  };
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang || 'jp';
      applyLang(lang);
    });
  });
  const initial = body.getAttribute('data-lang') || 'jp';
  applyLang(initial);
}

function initInfoModals() {
  const updateOverlay = document.getElementById('updateOverlay');
  const openOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
  };
  const closeOverlay = (overlay) => {
    if (!overlay) return;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
  };
  const infoBtn = document.getElementById('appInfoBtn');
  const helpBtn = document.getElementById('appHelpBtn');
  const updateBtn = document.getElementById('appUpdateBtn');
  const updateClose = document.getElementById('updateClose');
  const frameOfficialPatchBtn = document.getElementById('frameOfficialPatchBtn');
  const appOfflineBtn = document.getElementById('appOfflineBtn');
  const infoOfflineDownloadLink = document.getElementById('infoOfflineDownloadLink');

  helpBtn?.addEventListener('click', () => {
    if (typeof window.setMainView === 'function') window.setMainView('help');
  });
  const helpView = document.getElementById('helpView');
  const infoView = document.getElementById('infoView');
  if (helpView && !helpView.dataset.bound) {
    helpView.dataset.bound = '1';
    const applyHelpTab = (tabId) => {
      if (!tabId) return;
      const tabButtons = Array.from(helpView.querySelectorAll('.help-tab-btn[data-help-tab]'));
      const tabPanels = Array.from(helpView.querySelectorAll('.help-tab-panel[id]'));
      if (!tabButtons.length || !tabPanels.length) return;
      tabButtons.forEach((btn) => {
        const active = btn.getAttribute('data-help-tab') === tabId;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      tabPanels.forEach((panel) => {
        const active = panel.id === tabId;
        panel.classList.toggle('active', active);
        panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      helpView.scrollTo({ top: 0, behavior: 'auto' });
    };
    const firstHelpTab = helpView.querySelector('.help-tab-btn[data-help-tab]');
    if (firstHelpTab) {
      applyHelpTab(firstHelpTab.getAttribute('data-help-tab'));
    }
    helpView.addEventListener('click', (ev) => {
      const tabTrigger = ev.target.closest('.help-tab-btn[data-help-tab]');
      if (tabTrigger) {
        ev.preventDefault();
        ev.stopPropagation();
        applyHelpTab(tabTrigger.getAttribute('data-help-tab'));
        return;
      }
      const trigger = ev.target.closest('[data-help-target],a[href^="#help-"]');
      if (!trigger) return;
      ev.preventDefault();
      ev.stopPropagation();
      const targetId = (trigger.getAttribute('data-help-target') || trigger.getAttribute('href') || '').replace(/^#/, '');
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (!target || !helpView) return;
      const targetPanel = target.closest('.help-tab-panel[id]');
      if (targetPanel && !targetPanel.classList.contains('active')) {
        applyHelpTab(targetPanel.id);
      }
      const targetRect = target.getBoundingClientRect();
      const viewRect = helpView.getBoundingClientRect();
      const nextTop = helpView.scrollTop + (targetRect.top - viewRect.top) - 10;
      helpView.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    });
  }
  if (infoView && !infoView.dataset.bound) {
    infoView.dataset.bound = '1';
    infoView.addEventListener('click', (ev) => {
      const trigger = ev.target.closest('[data-info-target]');
      if (!trigger) return;
      ev.preventDefault();
      const targetId = trigger.getAttribute('data-info-target') || '';
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      const targetRect = target.getBoundingClientRect();
      const viewRect = infoView.getBoundingClientRect();
      const nextTop = infoView.scrollTop + (targetRect.top - viewRect.top) - 10;
      infoView.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
    });
  }
  if (window.location.hash && /^#help-/.test(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  infoBtn?.addEventListener('click', () => {
    if (typeof window.setMainView === 'function') window.setMainView('info');
  });
  updateBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    openOverlay(updateOverlay);
  });
  updateClose?.addEventListener('click', () => closeOverlay(updateOverlay));
  updateOverlay?.querySelector('.modal-backdrop')?.addEventListener('click', () => closeOverlay(updateOverlay));
  window.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (updateOverlay && !updateOverlay.classList.contains('hidden')) {
      closeOverlay(updateOverlay);
    }
  });

  frameOfficialPatchBtn?.addEventListener('click', (ev) => {
    ev.preventDefault();
    const lang = ((document.body.getAttribute('data-lang') || 'jp').toLowerCase() === 'en') ? 'en' : 'jp';
    const url = PATCH_NOTES_LINKS[lang] || PATCH_NOTES_LINKS.jp;
    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (!popup) {
      window.location.href = url;
    }
  });

  const bindOfflineDownload = (el) => {
    if (!el || el.dataset.offlineBound) return;
    el.dataset.offlineBound = '1';
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const href = el.getAttribute('href') || '';
      if (!href || href === '#' || el.classList.contains('is-disabled')) return;
      openOfflineDownloadWithWarning(href);
    });
  };
  bindOfflineDownload(appOfflineBtn);
  bindOfflineDownload(infoOfflineDownloadLink);
}
function fmt(v) { if (v == null || v === '') return ''; const n = Number(v); return isNaN(n) ? v : n.toLocaleString(); }
function fmtSigned(v) {
  if (v == null || v === '') return '';
  const n = Number(v);
  if (isNaN(n)) return v;
  const base = n.toLocaleString();
  return n > 0 ? `+${base}` : base;
}
function escapeHtml(s) { return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function formatNumbersInHtml(html) { try { return String(html).replace(/\b-?\d{4,}\b/g, m => { const n = Number(m); return isNaN(n) ? m : n.toLocaleString(); }); } catch { return html; } }

// ---------------------------------------------------------------------------
// Character + Control Switching
// ---------------------------------------------------------------------------
function initCharacterControls() {
  const classic = document.getElementById('tabClassic');
  const modern = document.getElementById('tabModern');
  const tabs = document.querySelector('.char-control-tabs-list');
  const versionSelect = document.getElementById('frameVersionSelect');
  const compareBtn = document.getElementById('frameCompareBtn');
  const comparePanel = document.getElementById('frameComparePanel');
  const compareVersionSelect = document.getElementById('frameCompareVersionSelect');
  const compareApplyBtn = document.getElementById('frameCompareApplyBtn');
  const compareClearBtn = document.getElementById('frameCompareClearBtn');
  const portrait = document.getElementById('charPortrait');
  const bg = document.getElementById('charHeader-bg');
  const nameJP = document.getElementById('charNameJP');
  const nameEN = document.getElementById('charNameEN');

  const current = { char: '', control: 'classic' };
  document.body.dataset.frameCharSelected = current.char ? '1' : '0';
  const refreshFrameData = () => loadCharacterData(current.char, current.control);

  ensureFrameDataVersionsLoaded().then(() => {
    populateFrameVersionSelects();
    if (compareVersionSelect && frameDataViewState.compareVersion) {
      compareVersionSelect.value = frameDataViewState.compareVersion;
    }
    refreshFrameData();
  });

  if (versionSelect && !versionSelect.dataset.bound) {
    versionSelect.dataset.bound = '1';
    versionSelect.addEventListener('change', () => {
      frameDataViewState.selectedVersion = normalizeGameVersion(versionSelect.value) || DEFAULT_FRAME_DATA_VERSION;
      populateFrameVersionSelects();
      refreshFrameData();
    });
  }

  if (compareBtn && !compareBtn.dataset.bound) {
    compareBtn.dataset.bound = '1';
    compareBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      const show = comparePanel ? comparePanel.classList.contains('hidden') : false;
      setFrameComparePanelVisible(show);
    });
  }

  if (comparePanel && !comparePanel.dataset.bound) {
    comparePanel.dataset.bound = '1';
    comparePanel.addEventListener('click', (ev) => ev.stopPropagation());
  }

  if (!document.body.dataset.frameCompareDocBound) {
    document.body.dataset.frameCompareDocBound = '1';
    document.addEventListener('click', (ev) => {
      const panel = document.getElementById('frameComparePanel');
      const btn = document.getElementById('frameCompareBtn');
      if (!panel || panel.classList.contains('hidden')) return;
      if (panel.contains(ev.target)) return;
      if (btn && btn.contains(ev.target)) return;
      setFrameComparePanelVisible(false);
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Escape') return;
      setFrameComparePanelVisible(false);
    });
  }

  if (compareVersionSelect && !compareVersionSelect.dataset.bound) {
    compareVersionSelect.dataset.bound = '1';
    compareVersionSelect.addEventListener('change', () => {
      frameDataViewState.compareVersion = normalizeGameVersion(compareVersionSelect.value);
    });
  }

  if (compareApplyBtn && !compareApplyBtn.dataset.bound) {
    compareApplyBtn.dataset.bound = '1';
    compareApplyBtn.addEventListener('click', () => {
      const against = normalizeGameVersion(compareVersionSelect ? compareVersionSelect.value : '');
      frameDataViewState.compareVersion = against || '';
      frameDataViewState.compareEnabled = !!frameDataViewState.compareVersion
        && frameDataViewState.compareVersion !== frameDataViewState.selectedVersion;
      setFrameComparePanelVisible(false);
      refreshFrameData();
    });
  }

  if (compareClearBtn && !compareClearBtn.dataset.bound) {
    compareClearBtn.dataset.bound = '1';
    compareClearBtn.addEventListener('click', () => {
      frameDataViewState.compareEnabled = false;
      setFrameComparePanelVisible(false);
      refreshFrameData();
    });
  }

  const setControl = (type) => {
    current.control = type;
    if (classic) classic.classList.toggle('active', type === 'classic');
    if (modern) modern.classList.toggle('active', type === 'modern');
    if (classic) classic.setAttribute('aria-selected', String(type === 'classic'));
    if (modern) modern.setAttribute('aria-selected', String(type === 'modern'));
    refreshFrameData();
  };
  const setCharacter = (slug, jp, en) => {
    current.char = slug;
    document.body.dataset.currentCharSlug = slug || '';
    document.body.dataset.frameCharSelected = slug ? '1' : '0';
    if (portrait) {
      portrait.src = `assets/images/characters/${slug}.png`;
      portrait.style.display = '';
      portrait.alt = `${en || slug} portrait`;
    }
    if (bg) bg.style.backgroundImage = `url('assets/images/backgrounds/bg_${slug}.jpg')`;
    const displayJP = formatDisplayName(slug, jp, 'primary', getCurrentLang());
    const displayEN = formatDisplayName(slug, en, 'english', getCurrentLang());
    if (nameJP) nameJP.textContent = displayJP;
    if (nameEN) nameEN.textContent = displayEN;
    applyCharacterArtPreset(slug);
    refreshFrameData();
  };

  // Accessibility roles
  if (tabs) tabs.setAttribute('role', 'tablist');
  if (classic) classic.setAttribute('role', 'tab');
  if (modern) modern.setAttribute('role', 'tab');

  // Direct tab clicks
  if (classic) classic.addEventListener('click', () => setControl('classic'));
  if (modern) modern.addEventListener('click', () => setControl('modern'));

  // Delegate clicks (img, etc.)
  if (tabs) tabs.addEventListener('click', (e) => {
    const li = e.target && e.target.closest ? e.target.closest('li') : null;
    if (!li) return;
    if (li.id === 'tabClassic') setControl('classic');
    if (li.id === 'tabModern') setControl('modern');
  });

  // Keyboard
  const onKey = (ev, type) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); setControl(type); } };
  if (classic) classic.addEventListener('keydown', (e) => onKey(e, 'classic'));
  if (modern) modern.addEventListener('keydown', (e) => onKey(e, 'modern'));

  window.switchCharacter = setCharacter;
  document.body.dataset.currentCharSlug = current.char || '';
  if (current.char) {
    if (nameJP) nameJP.textContent = formatDisplayName(current.char, nameJP.textContent, 'primary', getCurrentLang());
    if (nameEN) nameEN.textContent = formatDisplayName(current.char, nameEN.textContent, 'english', getCurrentLang());
    applyCharacterArtPreset(current.char);
  } else {
    document.body.dataset.frameCharSelected = '0';
    if (nameJP) nameJP.textContent = '';
    if (nameEN) nameEN.textContent = '';
    if (bg) bg.style.backgroundImage = 'none';
    if (portrait) {
      portrait.removeAttribute('src');
      portrait.alt = '';
      portrait.style.display = 'none';
    }
  }
  renderFrameDataVersion(frameDataViewState.selectedVersion);
  if (comparePanel && !comparePanel.classList.contains('hidden')) {
    setFrameComparePanelVisible(true);
  }
  refreshFrameData();
}

// ---------------------------------------------------------------------------
// Character Select Overlay
// ---------------------------------------------------------------------------
function initCharacterSelect() {
  const overlay = document.getElementById('charSelectOverlay');
  const openBtn = document.getElementById('charSelectBtn');
  const closeBtn = document.getElementById('charSelectClose');
  const grid = overlay ? overlay.querySelector('.char-grid') : null;
  const open = () => overlay.classList.remove('hidden');
  const close = () => overlay.classList.add('hidden');
  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.classList.contains('overlay-bg')) close(); });
  const cards = Array.from(document.querySelectorAll('.char-card'));
  if (grid && !grid.dataset.baseOrder) {
    grid.dataset.baseOrder = cards.map((card) => card.getAttribute('data-char')).filter(Boolean).join(',');
  }
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const slug = card.getAttribute('data-char');
      const spanEl = card.querySelector('span');
      const imgEl = card.querySelector('img');
      const jp = card.dataset.nameJp || ((spanEl && spanEl.textContent) || slug);
      const en = card.dataset.nameEn || ((imgEl && imgEl.getAttribute('alt')) || slug.toUpperCase());
      if (window.switchCharacter) window.switchCharacter(slug, jp, en);
      if (window.switchComboCharacter) window.switchComboCharacter(slug, jp, en);
      close();
    });
    const spanEl = card.querySelector('span');
    const imgEl = card.querySelector('img');
    if (!card.dataset.nameJp) card.dataset.nameJp = (spanEl && spanEl.textContent) || card.getAttribute('data-char') || '';
    if (!card.dataset.nameEn) card.dataset.nameEn = (imgEl && imgEl.getAttribute('alt')) || card.dataset.nameJp || '';
  });

  window.applyCharacterSelectLanguage = (lang = null) => {
    const active = lang || getCurrentLang();
    if (!grid) return;
    const allCards = Array.from(grid.querySelectorAll('.char-card'));
    allCards.forEach((card) => {
      const slug = card.getAttribute('data-char');
      const spanEl = card.querySelector('span');
      const imgEl = card.querySelector('img');

      if (slug === 'gouki_akuma') {
        card.dataset.nameJp = 'Gouki';
        card.dataset.nameEn = 'Akuma';
        if (spanEl) spanEl.textContent = active === 'en' ? 'Akuma' : 'Gouki';
        if (imgEl) imgEl.alt = active === 'en' ? 'Akuma' : 'Gouki';
      } else if (slug === 'vega_mbison') {
        card.dataset.nameJp = 'Vega';
        card.dataset.nameEn = 'M.Bison';
        if (spanEl) spanEl.textContent = active === 'en' ? 'M.Bison' : 'Vega';
        if (imgEl) imgEl.alt = active === 'en' ? 'M.Bison' : 'Vega';
      }

      const customThumb = getSelectThumbForSlug(slug, active);
      if (customThumb && imgEl) {
        imgEl.src = customThumb;
      }
    });

    const baseOrder = (grid.dataset.baseOrder || '').split(',').map((v) => v.trim()).filter(Boolean);
    if (!baseOrder.length) return;
    let nextOrder = baseOrder.slice();
    if (active === 'en') {
      nextOrder = baseOrder.filter((slug) => slug !== 'gouki_akuma' && slug !== 'vega_mbison');
      const insertAfter = (arr, slug, afterSlug) => {
        const idx = arr.indexOf(afterSlug);
        if (idx < 0) arr.push(slug);
        else arr.splice(idx + 1, 0, slug);
      };
      const insertBefore = (arr, slug, beforeSlug) => {
        const idx = arr.indexOf(beforeSlug);
        if (idx < 0) arr.push(slug);
        else arr.splice(idx, 0, slug);
      };
      insertAfter(nextOrder, 'gouki_akuma', 'aki');
      insertBefore(nextOrder, 'vega_mbison', 'mai');
    }
    nextOrder.forEach((slug) => {
      const card = grid.querySelector(`.char-card[data-char="${slug}"]`);
      if (card) grid.appendChild(card);
    });

    refreshFrameCharacterNames(active);
  };

  if (typeof window.applyCharacterSelectLanguage === 'function') {
    window.applyCharacterSelectLanguage(getCurrentLang());
  }
}

// ---------------------------------------------------------------------------
// Compat: HTML escape without replaceAll (older browsers)
// ---------------------------------------------------------------------------
function escapeHtmlCompat(s) {
  s = String(s);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function filterModeHtml(html, control) {
  if (!html || html.indexOf('<span') === -1) return html;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  const spans = Array.from(wrapper.querySelectorAll('span'));
  if (!spans.length) return html;
  const parenSpans = spans.filter((sp) => {
    const text = (sp.textContent || '').trim();
    return text.startsWith('(') && text.endsWith(')');
  });
  if (control === 'modern') {
    parenSpans.forEach((sp) => sp.remove());
    const modernHtml = wrapper.innerHTML.trim();
    return modernHtml || html;
  }
  if (parenSpans.length) {
    const target = parenSpans[parenSpans.length - 1];
    const text = (target.textContent || '').trim().replace(/^\(/, '').replace(/\)$/, '');
    const safe = escapeHtmlCompat(text);
    return safe || html;
  }
  return html;
}

// ---------------------------------------------------------------------------
// Tooltips
// ---------------------------------------------------------------------------
function initTooltips() { convertAllTooltips(); }

// ---------------------------------------------------------------------------
// Column Layout (Capcom-like)
// ---------------------------------------------------------------------------
function applyColumnLayout(tableEl) {
  try {
    // Fixed widths matching the 15 data columns (including subheaders)
    const widths = [
      310,   // 技名
      89.33, // フレーム-発生
      89.33, // フレーム-持続
      89.33, // フレーム-硬直
      89,    // 硬直差-ヒット
      89,    // 硬直差-ガード
      163,   // キャンセル
      95,    // ダメージ
      154,   // コンボ補正
      106,   // ドライブ増加
      105.3, // ドライブ減少(ガード)
      198.7, // ドライブ減少(パニッシュ)
      106,   // SA増加
      85,    // 属性
      785    // 備考
    ];
    const total = widths.reduce((a, b) => a + b, 0);

    // Keep fixed widths to allow horizontal scrolling
    const scaledWidths = widths.map((w) => Math.max(20, Math.floor(w)));
    const tableWidth = total;

    let cg = tableEl.querySelector('colgroup#frameColGroup');
    if (cg) cg.remove();
    cg = document.createElement('colgroup');
    cg.id = 'frameColGroup';
    scaledWidths.forEach((width) => {
      const colEl = document.createElement('col');
      colEl.style.width = width + 'px';
      cg.appendChild(colEl);
    });
    tableEl.insertBefore(cg, tableEl.firstChild);

    const widthPx = `${Math.floor(tableWidth)}px`;
    tableEl.style.width = widthPx;
    tableEl.style.minWidth = widthPx;
    tableEl.style.maxWidth = widthPx;
  } catch (e) {
    console.warn('applyColumnLayout failed', e);
  }
}

// ---------------------------------------------------------------------------
// Scroll shadows + drag scroll
// ---------------------------------------------------------------------------
function initDragScroll(sel = '#frameScroll') {
  const el = document.querySelector(sel);
  if (!el) return;
  let isDown = false, startX = 0, scrollLeft = 0;
  const onDown = (pageX) => { isDown = true; el.classList.add('grabbing'); startX = pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
  const onMove = (pageX) => { if (!isDown) return; const x = pageX - el.offsetLeft; const walk = x - startX; el.scrollLeft = scrollLeft - walk; updateRightShadow(el); };
  const onUp = () => { isDown = false; el.classList.remove('grabbing'); };
  el.addEventListener('mousedown', (e) => onDown(e.pageX));
  el.addEventListener('mousemove', (e) => onMove(e.pageX));
  el.addEventListener('mouseleave', onUp);
  el.addEventListener('mouseup', onUp);
  el.addEventListener('touchstart', (e) => { if (e.touches && e.touches[0]) onDown(e.touches[0].pageX); }, { passive: true });
  el.addEventListener('touchmove', (e) => { if (e.touches && e.touches[0]) onMove(e.touches[0].pageX); }, { passive: true });
  el.addEventListener('touchend', onUp);
  el.addEventListener('scroll', () => updateRightShadow(el));
  window.addEventListener('resize', () => updateRightShadow(el));
  updateRightShadow(el);
}
function updateRightShadow(el) {
  if (!el) return;
  const sl = el.scrollLeft;
  const cw = el.clientWidth;
  const sw = el.scrollWidth;
  const maxScrollLeft = Math.max(0, sw - cw);
  const tolerance = 2; // allow for fractional scroll offsets
  const hasMoreRight = sl < (maxScrollLeft - tolerance);
  const container = el.closest("#frameContainer") || el.parentElement;
  if (container) {
    container.classList.toggle("has-more-right", hasMoreRight);
  }
}
function updateRightShadowById(selector) { const el = document.querySelector(selector); updateRightShadow(el); }

function syncHeaderHeightVar() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  const rect = header.getBoundingClientRect();
  document.documentElement.style.setProperty('--site-header-height', `${rect.height}px`);
}

function handleViewportResize() {
  syncHeaderHeightVar();
  // Debounce resize events to avoid performance issues
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(() => {
    const table = document.querySelector('.frame-table');
    if (table) applyColumnLayout(table);
    updateRightShadowById('#frameScroll');
    updateFrameScrollHeight();
  }, 100);
}

function updateFrameScrollHeight() {
  const scroll = document.getElementById('frameScroll');
  if (!scroll) return;
  const header = document.getElementById('mainHeader');
  const charHeader = document.getElementById('charHeader');
  const tabs = document.querySelector('.char-control-tabs');
  const headerH = header ? header.offsetHeight : 0;
  const charH = charHeader ? charHeader.offsetHeight : 0;
  const tabsH = tabs ? tabs.offsetHeight : 0;
  const padding = 16;
  const available = window.innerHeight - headerH - charH - tabsH - padding;
  if (available > 200) {
    scroll.style.maxHeight = `${available}px`;
  }
}

// ---------------------------------------------------------------------------
// Tooltip normalization
// ---------------------------------------------------------------------------
function applyCharacterArtPreset(slug) {
  const portrait = document.querySelector('.char-portrait');
  if (!portrait) return;
  const preset = CHARACTER_ART_PRESETS[slug] || CHARACTER_ART_DEFAULT;
  const apply = (prop, value, fallback) => {
    portrait.style.setProperty(prop, value || fallback);
  };
  const verticalShift = preset.shift ?? preset.shiftY ?? preset.shifty;
  const horizontalShift = preset.shiftX ?? preset.shiftx ?? preset.shiftH ?? preset.shiftHorizontal;
  apply('--char-img-top', preset.top, CHARACTER_ART_DEFAULT.top);
  apply('--char-img-width', preset.width, CHARACTER_ART_DEFAULT.width);
  apply('--char-img-height', preset.height, CHARACTER_ART_DEFAULT.height);
  apply('--char-img-shift', verticalShift, CHARACTER_ART_DEFAULT.shift);
  apply('--char-img-shift-x', horizontalShift, CHARACTER_ART_DEFAULT.shiftX);
}

function convertAllTooltips() {
  // Handle header tooltips (Capcom style)
  document.querySelectorAll('.frame_ex___h3rR').forEach((tip) => {
    const html = tip.innerHTML || tip.textContent || '';
    const plain = normalizeTooltipText(html);

    // Find the associated label, which might be an immediate sibling or inside a parent `li`
    let label = tip.previousElementSibling;
    if (label && label.tagName !== 'LABEL') {
      label = tip.parentElement.querySelector('label') || tip.parentElement.parentElement.querySelector('label');
    }

    if (label) {
      label.removeAttribute('title');
      label.classList.add('has-inline-tooltip');
      const show = () => tip.classList.add('force-visible');
      const hide = () => tip.classList.remove('force-visible');
      // Trigger on the parent `li` or `th` to provide a larger hover area
      const trigger = label.closest('li') || label.closest('th') || label;
      trigger.addEventListener('mouseenter', show);
      trigger.addEventListener('mouseleave', hide);
      label.addEventListener('focus', show); // Keep focus on label itself
      label.addEventListener('blur', hide);  // Keep blur on label itself
    }

    const inner = tip.querySelector('.frame_inner__Qf7xV');
    if (inner && plain) {
      inner.innerHTML = plain.replace(/\n/g, '<br/>');
    }
  });

  // Handle body tooltips (generic .tooltip-wrap)
  document.querySelectorAll('.tooltip-wrap').forEach((wrap) => {
    const content = wrap.querySelector('.tooltip-content');
    if (!content) return;
    const show = () => content.classList.add('force-visible');
    const hide = () => content.classList.remove('force-visible');
    wrap.addEventListener('mouseenter', show);
    wrap.addEventListener('mouseleave', hide);
  });

  // Color advantage columns based on sign
  document.querySelectorAll('#frameBody tr').forEach((row) => {
    const cells = row.querySelectorAll('td');
    const applyTone = (cell, addPlus = false) => {
      const raw = (cell.textContent || '').trim();
      const val = parseFloat(raw.replace(/[^\d\-\+\.]/g, ''));
      cell.classList.remove('adv-pos', 'adv-neg', 'adv-zero');
      if (isNaN(val)) return;
      if (val === 0) {
        cell.classList.add('adv-zero');
        return;
      }
      if (val > 0) {
        cell.classList.add('adv-pos');
        if (addPlus && raw && !raw.startsWith('+')) {
          cell.textContent = `+${raw}`;
        }
      }
      if (val < 0) cell.classList.add('adv-neg');
    };
    if (cells[4]) {
      applyTone(cells[4], true); // ヒット (hitAdv)
      // Mark drive-specific notation with purple
      const txt = (cells[4].textContent || '').trim();
      cells[4].classList.remove('hit-drive');
      if (/D/.test(txt)) {
        cells[4].classList.add('hit-drive');
      }
    }
    if (cells[5]) applyTone(cells[5], true); // ガード (guardAdv)

    // 動作フレーム coloring
    if (cells[1]) cells[1].classList.add('frame-start-val');   // 発生
    if (cells[2]) cells[2].classList.add('frame-active-val');  // 持続
    if (cells[3]) cells[3].classList.add('frame-recovery-val'); // 硬直
  });
}

function formatDisplayName(slug, label, type = 'primary', lang = null) {
  const override = CHARACTER_NAME_OVERRIDES[slug];
  const activeLang = lang || getCurrentLang();
  let source = label;
  if (override) {
    const bucket = type !== 'primary' ? override.english : override.primary;
    if (bucket && typeof bucket === 'object') {
      source = bucket[activeLang] || bucket.jp || bucket.en || source;
    } else if (bucket) {
      source = bucket;
    } else if (!source) {
      source = (override.primary && (override.primary[activeLang] || override.primary.jp || override.primary.en))
        || (override.english && (override.english[activeLang] || override.english.jp || override.english.en))
        || source;
    }
  }
  if (!source) {
    source = slug || '';
  }
  const clean = String(source).trim();
  return clean ? clean.toUpperCase() : clean;
}

function getCardNames(slug) {
  const card = document.querySelector(`.char-card[data-char="${slug}"]`);
  const spanEl = card ? card.querySelector('span') : null;
  const imgEl = card ? card.querySelector('img') : null;
  const jp = (card && card.dataset && card.dataset.nameJp)
    || (spanEl && spanEl.textContent)
    || slug
    || '';
  const en = (card && card.dataset && card.dataset.nameEn)
    || (imgEl && imgEl.getAttribute('alt'))
    || jp
    || '';
  return { jp, en };
}

function refreshFrameCharacterNames(lang = null) {
  const activeLang = lang || getCurrentLang();
  const slug = (document.body.dataset.currentCharSlug || '').trim();
  if (!slug) return;
  const { jp, en } = getCardNames(slug);
  const nameJP = document.getElementById('charNameJP');
  const nameEN = document.getElementById('charNameEN');
  if (nameJP) nameJP.textContent = formatDisplayName(slug, jp, 'primary', activeLang);
  if (nameEN) nameEN.textContent = formatDisplayName(slug, en, 'english', activeLang);
}

function normalizeTooltipText(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r?\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function getSelectThumbForSlug(slug, lang = null) {
  if (!slug) return null;
  const activeLang = lang || getCurrentLang();
  const special = CHARACTER_SELECT_SPECIAL[slug];
  if (special) {
    if (typeof special === 'string') return special;
    return special[activeLang] || special.jp || special.en || null;
  }
  const idx = CHARACTER_ORDER.indexOf(slug);
  if (idx === -1) return null;
  const number = idx + 1;
  return `assets/images/characters/select_character${number}_over.png`;
}

// ---------------------------------------------------------------------------
// App-level tabs (Frame Data / Combo List)
// ---------------------------------------------------------------------------
function initMainTabs() {
  const tabs = document.querySelectorAll('.app-tab');
  const siteMain = document.querySelector('.site-main');
  const helpView = document.getElementById('helpView');
  const infoView = document.getElementById('infoView');
  if (siteMain && helpView && helpView.parentElement !== siteMain) {
    siteMain.appendChild(helpView);
  }
  if (siteMain && infoView && infoView.parentElement !== siteMain) {
    siteMain.appendChild(infoView);
  }
  const views = document.querySelectorAll('.site-view');
  const headerTitle = document.querySelector('.header-title');
  const body = document.body;
  const infoBtn = document.getElementById('appInfoBtn');
  const helpBtn = document.getElementById('appHelpBtn');

  if (!tabs.length || !views.length) return;

  const setView = (viewKey) => {
    views.forEach((view) => {
      const isActive = view.dataset.view === viewKey;
      view.classList.toggle('active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });
    tabs.forEach((tab) => {
      const isActive = tab.dataset.viewTab === viewKey;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    if (helpBtn) helpBtn.classList.toggle('active', viewKey === 'help');
    if (infoBtn) infoBtn.classList.toggle('active', viewKey === 'info');
    body.setAttribute('data-view', viewKey);
    if (headerTitle) {
      const titleKey = viewKey === 'combos'
        ? 'nav.combo'
        : (viewKey === 'help'
          ? 'help.button'
          : (viewKey === 'info' ? 'info.button' : 'nav.frame'));
      headerTitle.dataset.i18n = titleKey;
      headerTitle.textContent = translateKey(headerTitle.dataset.i18n, getCurrentLang());
    }
    updateFrameScrollHeight();
  };

  const onKey = (ev, viewKey) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      setView(viewKey);
    }
  };

  tabs.forEach((tab) => {
    const viewKey = tab.dataset.viewTab;
    tab.addEventListener('click', () => setView(viewKey));
    tab.addEventListener('keydown', (ev) => onKey(ev, viewKey));
  });

  window.setMainView = setView;

  // Default to combo view
  setView('combos');
}
