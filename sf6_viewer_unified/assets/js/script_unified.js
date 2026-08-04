// ============================================================================
//  STREET FIGHTER 6 — Local Capcom Clone Logic (clean build)
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  renderAppVersionBadge();
  initMainTabs();
  initCharacterControls();
  initCharacterSelect();
  initTooltips();
  initDragScroll('#frameScroll');
  initLanguageToggle();
  initTutorialOverlay();
  initInfoModals();
  const bootLastSeen = getLastSeenAppVersion();
  const bootAutomationSeen = getAutomationTutorialSeenVersion();
  const bootComboDetailsSeen = getComboDetailsTutorialSeenVersion();
  // Show "automation-2" once per app version until it is actually seen, including
  // recovery from prior launches where update log showed but tutorial got blocked.
  automationTutorialEligibleThisLaunch = (
    bootAutomationSeen !== AUTOMATION_TUTORIAL_VERSION
    && cmpSemver(bootLastSeen || '0.0.0', AUTOMATION_TUTORIAL_VERSION) <= 0
  );
  comboDetailsTutorialEligibleThisLaunch = (
    bootComboDetailsSeen !== APP_VERSION
    && cmpSemver(bootLastSeen || '0.0.0', APP_VERSION) <= 0
  );
  maybeShowWelcomePopup().catch((err) => {
    console.warn('Failed to show welcome popup:', err);
  }).finally(() => {
    maybeShowUpdateTutorials();
  });
  checkForAppUpdate()
    .then((info) => {
      if (info && info.hasUpdate) {
        maybeShowStartupUpdatePopup();
      }
    })
    .catch((err) => {
      console.warn('Update check failed:', err);
    });
  syncHeaderHeightVar();
  window.addEventListener('resize', handleViewportResize);
});
window.addEventListener('load', () => {
  syncHeaderHeightVar();
  handleViewportResize();
});

let loadDataRequestId = 0;
const headerTemplateHTMLByLang = new Map();
const frameMovesCache = new Map();
const APP_VERSION_FALLBACK = '1.0.5';
const APP_VERSION = getCurrentAppVersion();
const TUTORIAL_FIRST_RUN_KEY = 'lm_tutorial_seen_v1';
const TUTORIAL_AUTOMATION_UPDATE_SEEN_KEY = 'lm_tutorial_automation_seen_v1';
const TUTORIAL_COMBO_DETAILS_UPDATE_SEEN_KEY = 'lm_tutorial_combo_details_seen_v1';
const AUTOMATION_TUTORIAL_FLOW_KEY = 'automation-2';
const AUTOMATION_TUTORIAL_VERSION = '1.0.3.1';
const COMBO_DETAILS_TUTORIAL_FLOW_KEY = 'combo-details';
const LANGUAGE_PREF_KEY = 'lm_lang_pref_v1';
const I18NEXT_LANGUAGE_KEY = 'i18nextLng';
const LAST_SEEN_VERSION_KEY = 'lm_last_seen_version';
const UPDATES_TEXT_PATH = 'assets/data/updates.txt';
const WELCOME_MAX_ITEMS = 20;
const DEFAULT_FRAME_DATA_VERSION = '2025.12.16';
const FRAME_VIEW_STATE_KEY = 'lm_frame_view_state_v1';
const MAIN_VIEW_STATE_KEY = 'lm_main_view_state_v1';
const UPDATE_CHECK_ENDPOINT = 'https://api.github.com/repos/blackinferno/LabMonsterSF6/releases/latest';
const UPDATE_CHECK_TIMEOUT_MS = 10000;
let currentFrameDataVersion = DEFAULT_FRAME_DATA_VERSION;
const FRAME_VERSION_MANIFEST_PATH = 'assets/data/versions.json';
let offlineBundlePromise = null;
let updatesDataCache = null;
let updatesDataPromise = null;
let pendingWelcomeGroups = [];
let automationTutorialEligibleThisLaunch = false;
let automationTutorialRetryTimer = null;
let comboDetailsTutorialEligibleThisLaunch = false;
let comboDetailsTutorialRetryTimer = null;
let appUpdateInfo = {
  checked: false,
  checkFailed: false,
  hasUpdate: false,
  latestTag: '',
  latestVersion: '',
  releaseUrl: '',
};
let updateStartupPopupShown = false;
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
const ONBOARDING_TUTORIAL_SLIDES = [
  {
    image: 'assets/images/help/help-1_jp.png',
    titleKey: 'tutorial.slide.1.title',
    textKey: 'tutorial.slide.1.text',
  },
  {
    image: 'assets/images/help/help-1_jp.png',
    titleKey: 'tutorial.slide.2.title',
    textKey: 'tutorial.slide.2.text',
  },
  {
    image: 'assets/images/help/help-1_jp.png',
    titleKey: 'tutorial.slide.3.title',
    textKey: 'tutorial.slide.3.text',
  },
  {
    image: 'assets/images/help/help-3-2_jp.png',
    titleKey: 'tutorial.slide.4.title',
    textKey: 'tutorial.slide.4.text',
  },
  {
    image: 'assets/images/help/help-1_jp.png',
    titleKey: 'tutorial.slide.5.title',
    textKey: 'tutorial.slide.5.text',
  },
  {
    image: 'assets/images/help/help-1_jp.png',
    titleKey: 'tutorial.slide.6.title',
    textKey: 'tutorial.slide.6.text',


  },
];
const TUTORIAL_FLOW_SLIDES = {
  onboarding: ONBOARDING_TUTORIAL_SLIDES,
  'frame-view': [
    {
      image: 'assets/images/help/help-6_jp.png',
      title: { jp: 'Frame Data画面の基本', en: 'Frame Data Screen Basics' },
      text: {
        jp: 'FRAME DATAタブでキャラを選び、Classic/Modernを先に固定してから確認を始めます。',
        en: 'In FRAME DATA, select character and fix Classic or Modern first for consistent checks.',
      },
    },
    {
      image: 'assets/images/help/help-6_jp.png',
      title: { jp: 'バージョン指定', en: 'Version Selection' },
      text: {
        jp: '右上のVersionで基準、Compareで比較先を指定します。近いバージョン同士だと差分を追いやすいです。',
        en: 'Use Version as baseline and Compare as target. Nearby versions are easier to review.',
      },
    },
    {
      image: 'assets/images/help/help-6_jp.png',
      title: { jp: '差分確認', en: 'Diff Review' },
      text: {
        jp: 'Compare適用後は変更セルが強調されます。発生・硬直・ガード時など主要列から先に確認します。',
        en: 'After Compare, changed cells are highlighted. Start with startup, recovery, and block columns.',
      },
    },
  ],
  'combo-table': [
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: 'コンボ表の全体像', en: 'Combo Table Overview' },
      text: {
        jp: '上段は検索と各種機能、中央はコンボ表、下段は入力セクションです。まずこの3層構成を把握します。',
        en: 'Top section is search and tools, center is the combo table, bottom is input controls.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      imageIndex: 2,
      title: { jp: '行編集の基本', en: 'Row Editing Basics' },
      text: {
        jp: 'コマンドを編集するとボタン表示が自動更新されます。備考には始動条件や補足を残せます。',
        en: 'Editing Command updates button icons automatically. Use Notes for setup details.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: '行コンテキストメニュー（詳細）', en: 'Row Context Menu (Expanded)' },
      text: {
        jp: '行を右クリックすると、行コピー・貼り付け・コピーを下に挿入・行挿入・行削除・値クリアを行えます。複数行選択後に実行すると一括編集できます。',
        en: 'Right-click a row to use Copy Rows, Paste, Insert Copied Below, Insert Rows, Delete Rows, and Clear Values. With multi-row selection, these actions run in bulk.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: '列コンテキストメニュー（詳細）', en: 'Column Context Menu (Expanded)' },
      text: {
        jp: '列ヘッダーを右クリックすると、並び替え、列表示/非表示、値クリア、数値の負値変換、フィルター適用/解除を使えます。複数列選択時は選択範囲へまとめて適用できます。',
        en: 'Right-click a column header to access sort, show/hide columns, clear values, convert to negative, and filter actions. With multi-column selection, actions apply to the selected range.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: '行・列選択とショートカット', en: 'Row/Column Selection Workflow' },
      text: {
        jp: 'Shift/Ctrl(⌘)選択で複数の行・列をまとめて選び、コンテキストメニューやショートカットで連続編集します。大きい修正ほど先に範囲選択すると効率的です。',
        en: 'Use Shift/Ctrl (Cmd) selection to target multiple rows/columns, then run context-menu actions or shortcuts in one pass. Select the range first for faster large edits.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: '自動入力と上書き', en: 'Auto-Input and Overwrite' },
      text: {
        jp: '表の上にある自動入力および上書き機能をON/OFFで切り替えることができます。自動入力は手動入力を上書きしないのがデフォルトですが、上書きをONにすると手動入力値も自動入力で上書きされるようになります。',
        en: 'You can toggle the auto-input and overwrite features on/off at the top of the table. Auto-input defaults to not overwriting manual inputs, but when overwrite is enabled, manual input values will be replaced by auto-input.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: 'コンボ詳細（ポップアップ）', en: 'Combo Details Popup' },
      text: {
        jp: '行をダブルクリックまたは右クリックのコンテキストメニューから、フレームメーターや統計を確認できる詳細表示を開けます。',
        en: 'Double-click a row or use right-click menu to open Combo Details with frame meter and stats.',
      },
    },
    {
      image: 'assets/images/help/help-3_jp.png',
      title: { jp: 'コンボ比較とコンボツリー', en: 'Compare & Combo Tree' },
      text: {
        jp: 'コンテキストメニューから「比較に追加」をクリックすると、画面下のトレイに最大4件まで溜めて比較画面を開けます（最大4件。2件以上が必要）。また、ツリーで開くからコンボツリー画面に移動できます。',
        en: 'Click Add to compare in the context menu to save a combo you want to compare (up to four combos; open Compare with two or more). You can also jump to the combo tree screen by clicking Open in Tree.',
      },
    },

    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '整理と保存', en: 'Cleanup and Save Strategy' },
      text: {
        jp: '共有前は重複削除を実行し、JSON/XLSXをExportして復元用バックアップを残します。',
        en: 'Before sharing, run dedupe and export JSON or XLSX backups for recovery.',
      },
    },
  ],
  'combo-details': [
    {
      image: 'assets/images/help/help-3-7_jp.png',
      title: { jp: 'コンボ詳細', en: 'Combo Details' },
      text: {
        jp: '行をダブルクリックまたは右クリックのコンテキストメニューから、フレームメーターや統計を確認できる詳細表示を開けます。',
        en: 'Open Combo Details with frame meter and stats by double-clicking a row or using the right-click menu.',
      },
    },
    {
      image: 'assets/images/help/help-11_jp.png',
      title: { jp: 'フレームメーターとコマンド', en: 'Frame Meter and Command' },
      text: {
        jp: '上部でフレームメーター、ボタン、コマンドを確認します。コマンドや備考などは編集して保存できます。',
        en: 'Review the frame meter, buttons, and command at the top. You can edit and save command and notes.',
      },
    },
    {
      image: 'assets/images/help/help-11_jp.png',
      title: { jp: 'URLと動画の埋め込み', en: 'URL and Video Embed' },
      text: {
        jp: 'URL欄に動画リンクを入れると、下にプレビューが表示されます。',
        en: 'Paste a video URL to show an embedded preview under the URL field.',
      },
    },
    {
      image: 'assets/images/help/help-11_jp.png',
      title: { jp: '始動別の統計', en: 'Starter-Based Stats' },
      text: {
        jp: '下部で始動平均、順位、トップコンボなどの統計を確認できます。',
        en: 'Check starter averages, ranks, and top combos in the stats section.',
      },
    },
  ],
  'input-section': [
    {
      image: 'assets/images/help/help-2_jp.png',
      title: { jp: '入力デバイス選択', en: 'Input Device Selection' },
      text: {
        jp: 'Keyboard / PS5 / Xbox(XInput) / D-Inputから使用デバイスを選びます。入力反映前に確認してください。',
        en: 'Select Keyboard, PS5, Xbox (XInput), or D-Input before entering commands.',
      },
    },
    {
      image: 'assets/images/help/help-2_jp.png',
      title: { jp: 'クイック入力パッド', en: 'Quick Input Pads' },
      text: {
        jp: '方向・攻撃トークンをクリックしてコマンドを組み立てます。手入力との併用も可能です。',
        en: 'Build commands with direction and attack tokens. Mixed use with typing is supported.',
      },
    },
    {
      image: 'assets/images/help/help-2_jp.png',
      title: { jp: '入力欄との連携', en: 'Working With Command Cells' },
      text: {
        jp: '編集対象は選択中のCommandセルです。入力パッドもキーボード入力も同じセルに反映されます。',
        en: 'All input applies to the focused Command cell, whether from pads or keyboard.',
      },
    },
    {
      image: 'assets/images/help/help-2_jp.png',
      title: { jp: '表示オプション（行・列）', en: 'Display Options (Rows and Columns)' },
      text: {
        jp: '入力セクション上の行トグルで Frame Meter / Buttons / Notes を切り替えできます。列は FULL / BASIC / SIMPLE / CUSTOM で作業目的に合わせて調整します。',
        en: 'Use the row toggles above the input section to show/hide Frame Meter, Buttons, and Notes. Adjust columns with FULL / BASIC / SIMPLE / CUSTOM to match your task.',
      },
    },
    {
      image: 'assets/images/help/help-2_jp.png',
      title: { jp: '入力セクションを隠す', en: 'Hide the Input Section' },
      text: {
        jp: '下部セクションの開閉ボタンで入力エリアを折りたたみできます。表の確認に集中したい時は閉じ、編集時に再度開いて入力します。',
        en: 'Use the bottom section toggle to collapse the input area. Keep it hidden while reviewing the table, then reopen it when you need to edit inputs.',
      },
    },
  ],
  'advanced-search': [
    {
      image: 'assets/images/help/help-4_jp.png',
      title: { jp: '詳細検索', en: 'Advanced Search' },
      text: {
        jp: '検索バー横のADVANCED SEARCHから複合条件パネルを開きます。',
        en: 'Open the condition panel from ADVANCED SEARCH next to the search bar.',
      },
    },
    {
      image: 'assets/images/help/help-4_jp.png',
      title: { jp: 'フィールド検索', en: 'Field Search' },
      text: {
        jp: 'KeywordとFieldを組み合わせると、CommandやNotesなど対象列を限定できます。',
        en: 'Use Keyword plus Field to target specific columns such as Command or Notes.',
      },
    },
    {
      image: 'assets/images/help/help-4_jp.png',
      title: { jp: '条件グループ', en: 'Condition Groups' },
      text: {
        jp: 'Control / Distance / Position / Counter / BOなどを重ねて候補を段階的に絞ります。',
        en: 'Stack Control, Distance, Position, Counter, and BO filters to narrow results step by step.',
      },
    },
    {
      image: 'assets/images/help/help-4_jp.png',
      title: { jp: '数値レンジ', en: 'Numeric Ranges' },
      text: {
        jp: 'ダメージ・ゲージ・フレーム差はexact/min/maxで指定します。厳密検索と範囲検索を使い分けます。',
        en: 'For damage, gauge, and frame fields, use exact or min/max ranges as needed.',
      },
    },
    {
      image: 'assets/images/help/help-4_jp.png',
      title: { jp: '適用と初期化', en: 'Apply and Reset' },
      text: {
        jp: 'Applyで現在条件を反映し、Clearで全条件を初期化します。条件の再利用前にリセットすると安全です。',
        en: 'Apply runs current filters. Clear resets all conditions before the next search pass.',
      },
    },
  ],
  'import-flow': [
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: 'Import開始', en: 'Start Import' },
      text: {
        jp: 'IMPORTから.json/.xlsxを選択します。大きな取り込み前は必ずExportでバックアップを取ります。',
        en: 'Start from IMPORT and select .json or .xlsx. Export a backup before large imports.',
      },
    },
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '取込先の確認', en: 'Import Targets' },
      text: {
        jp: 'キャラ別データを含む場合は取込対象キャラを明確に選び、誤上書きを防ぎます。',
        en: 'When files include multiple characters, select import targets carefully to avoid overwrite.',
      },
    },
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '表記プレビュー確認', en: 'Notation Preview Check' },
      text: {
        jp: '取り込み表記がLM表記へどう正規化されるかを、適用前にプレビューで確認します。',
        en: 'Check notation preview before apply to see how inputs normalize into LM format.',
      },
    },
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '未認識語の処理', en: 'Unknown Token Handling' },
      text: {
        jp: '未認識トークンは無視・削除・置換を選択できます。置換時はLM表記で指定します。',
        en: 'For unknown tokens, choose ignore, delete, or replace. Use LM notation for replacements.',
      },
    },
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '適用後チェック', en: 'Post-import Validation' },
      text: {
        jp: '取込後は件数、主要ルート、条件列を確認します。想定外があればすぐ戻せるようにします。',
        en: 'After import, verify row count, key routes, and condition fields before continuing.',
      },
    },
    {
      image: 'assets/images/help/help-5_jp.png',
      title: { jp: '再エクスポート', en: 'Re-export Recommended' },
      text: {
        jp: '整合性確認後にJSON/XLSXを再エクスポートし、最新の復元ポイントを更新します。',
        en: 'Re-export JSON or XLSX after validation to keep an up to date restore point.',
      },
    },
  ],
  'import-notation': [
    {
      image: 'assets/images/help/help-8_jp.png',
      title: { jp: '既存表記プレビュー', en: 'Notation Preview' },
      text: {
        jp: '既存コマンドがLM正規化後にどう表示されるかを一覧で確認できます。',
        en: 'Use preview to confirm how existing commands convert into LM notation and icons.',
      },
    },
    {
      image: 'assets/images/help/help-8_jp.png',
      title: { jp: '未認識語の振り分け', en: 'Unknown Token Rules' },
      text: {
        jp: '未認識語ごとに処理方針を設定し、意図しない置換や欠落を防ぎます。',
        en: 'Define handling rule per unknown token to prevent unintended replacements or drops.',
      },
    },
    {
      image: 'assets/images/help/help-8_jp.png',
      title: { jp: '適用と再読込', en: 'Apply and Reload' },
      text: {
        jp: '設定変更後は適用し、再読み込みで結果が意図どおりか確認します。',
        en: 'Apply changes, then reload preview to verify output matches expectations.',
      },
    },
    {
      image: 'assets/images/help/help-8_jp.png',
      title: { jp: '運用のポイント', en: 'Operational Tip' },
      text: {
        jp: '同じ外部ソースを繰り返し取り込む場合、最初に辞書を整えると以後の取り込みが安定します。',
        en: 'If you import from the same source repeatedly, stabilize rules early for consistent results.',
      },
    },
  ],
  'export-flow': [
    {
      image: 'assets/images/help/help-9_jp.png',
      title: { jp: 'Exportメニュー', en: 'Export Menu' },
      text: {
        jp: 'EXPORTではキャラ範囲、操作モード範囲、列範囲を個別に指定できます。',
        en: 'In EXPORT, set character scope, control mode scope, and column scope independently.',
      },
    },
    {
      image: 'assets/images/help/help-9_jp.png',
      title: { jp: 'フォーマット選択', en: 'Format Selection' },
      text: {
        jp: 'JSONは復元向け、XLSXは編集向け、HTMLは閲覧共有向けです。',
        en: 'JSON fits restore, XLSX fits spreadsheet edits, and HTML fits read only sharing.',
      },
    },
    {
      image: 'assets/images/help/help-9_jp.png',
      title: { jp: '表示列との関係', en: 'Column Scope Impact' },
      text: {
        jp: 'ColumnsをCurrentにすると現在表示中の列のみを出力できます。ファイル軽量化に有効です。',
        en: 'Set Columns to Current to export only visible columns and keep output lighter.',
      },
    },
    {
      image: 'assets/images/help/help-9_jp.png',
      title: { jp: '出力前チェック', en: 'Pre-export Checklist' },
      text: {
        jp: '出力前に重複削除、検索解除、対象キャラ確認を行うと管理しやすくなります。',
        en: 'Before exporting, run dedupe, clear filters, and confirm target characters.',
      },
    },
  ],
  'automation-2': [
    {
      image: 'assets/images/help/help-1-2_jp.png',
      title: { jp: 'Automation 2.0', en: 'Automation 2.0' },
      text: {
        jp: 'Ver.1.0.3で暫定版の自動入力機能が追加されました。今回はダメージや距離関連の一部の項目のみです。',
        en: 'In Ver.1.0.3, a preliminary version of the auto-input feature was added. It currently only covers some damage and spacing related fields.',
      },
    },
    {
      image: 'assets/images/help/help-10_jp.png',
      title: { jp: '自動入力トグル', en: 'Auto Input Toggle' },
      text: {
        jp: '表の上にある自動入力をON/OFFで切り替えることができます。まだ試験段階なので、精度はいまいちです。',
        en: 'Use the ON/OFF Auto Input toggle above the table section to enable automation. Since this is still experimental, accuracy is not great.',
      },
    },
    {
      image: 'assets/images/help/help-10_jp.png',
      title: { jp: '上書きトグル', en: 'Overwrite Toggle' },
      text: {
        jp: 'デフォルトでは自動入力は手入力されたセルを上書きしません。上書きをONにすると手入力値も上書きされるようになります。',
        en: 'Manually entered values will not be overwritten by default. Turning Overwrite ON allows automation to replace manual inputs as well.',
      },
    },
    {
      image: 'assets/images/help/help-10_jp.png',
      title: { jp: 'フレームメーター', en: 'Frame Meter' },
      text: {
        jp: 'Ver.1.0.3で暫定版のフレームメーター生成機能が追加されました。まだ試験段階なので、抜けや誤りが多いです。',
        en: 'In Ver.1.0.3, a preliminary version of the frame meter generation feature was added. Since this is still experimental, there may be missing or incorrect meter.',
      },
    },
    {
      image: 'assets/images/help/help-10_jp.png',
      title: { jp: '入力補助の追加', en: 'Notation/Input Additions' },
      text: {
        jp: 'ディレイやヒット数を指定できるように、F と Hit、ブランカ人形やJPの爆発等用のアイコンを追加しました。',
        en: 'Added F and Hit notation helpers to enable specifying delays and hit counts as well as icon for explosions for Blanka, JP, and other characters.',
      },
    },
  ],
  'hotkey-customize': [
    {
      image: 'assets/images/help/help-7_jp.png',
      title: { jp: 'キー割り当て変更', en: 'Rebinding Keys' },
      text: {
        jp: 'よく使うトークンから優先して再割り当てし、誤操作しやすいキー配置を整理します。',
        en: 'Rebind high frequency tokens first and clean up keys that cause frequent misinputs.',
      },
    },
    {
      image: 'assets/images/help/help-7_jp.png',
      title: { jp: '保存時の注意', en: 'Save and Conflict Handling' },
      text: {
        jp: '保存前に既存割り当てとの重複を確認し、意図した配置になっているか見直します。',
        en: 'Before saving, check duplicate assignments and verify intended key layout.',
      },
    },
    {
      image: 'assets/images/help/help-2-3_jp.png',
      title: { jp: '反映確認', en: 'Verify in Command Input' },
      text: {
        jp: '保存後はCommand欄で実入力テストを行い、操作感と誤入力率を確認します。',
        en: 'After saving, run live input tests in Command cells to validate feel and accuracy.',
      },
    },
  ],
  'combo-tree': [
    {
      image: 'assets/images/help/help-12_jp.png',
      title: { jp: 'コンボツリー画面', en: 'Combo Tree View' },
      text: {
        jp: '選択中キャラ・操作モードのコンボが分岐チャートで表示されます。コンボ表と同じデータを共有します。',
        en: 'The branching combo chart of currently character and mode will be displayed. It shares the same data as the combo list.',
      },
    },
    {
      image: 'assets/images/help/help-12_jp.png',
      title: { jp: 'フィルターと縦軸', en: 'Filters and Rail' },
      text: {
        jp: '上部のチェックボックスで距離・位置などを絞り込み、Dゲージ／ダメージで縦軸を切り替ることができます。',
        en: 'Use checkboxes in the upper section to narrow routes, and switch between D Gauge and Damage to change the vertical axis.',
      },
    },
    {
      image: 'assets/images/help/help-12_jp.png',
      title: { jp: '操作と右クリック', en: 'Selection and Context Menu' },
      text: {
        jp: 'パーツをクリックすると枝が展開します。パーツを右クリックで比較に追加、配下の展開／折りたたみ、その経路からコンボの追加、枝の削除が使えます。',
        en: 'Click nodes to expand the tree. Right-click a node to Add to compare, expand/collapse subtree, add combo that node, or delete its children.',
      },
    },
    {
      image: 'assets/images/help/help-12_jp.png',
      title: { jp: '詳細とコンボ詳細', en: 'Pane and Combo Details' },
      text: {
        jp: 'そのパーツで終わるコンボ（パーツの右側に青色の点があるもの）があれば、右ペインに情報が表示されます。右ペインでコンボリストと同様に編集することも可能です。',
        en: 'Information about the combo will be displayed in the right pane if there is a combo ending in that node (Nodes with a blue dot on the right). You can edit items in the right pane just like in the combo list.',
      },
    },
  ],
};
const DEFAULT_TUTORIAL_FLOW = 'onboarding';
let activeTutorialFlow = DEFAULT_TUTORIAL_FLOW;
let tutorialSlideIndex = 0;

function normalizeFrameControlType(value) {
  return String(value || '').toLowerCase() === 'modern' ? 'modern' : 'classic';
}

function loadPersistedFrameViewState() {
  try {
    const raw = localStorage.getItem(FRAME_VIEW_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      char: String(parsed.char || '').trim(),
      control: normalizeFrameControlType(parsed.control),
      version: normalizeGameVersion(parsed.version) || DEFAULT_FRAME_DATA_VERSION,
      compareVersion: normalizeGameVersion(parsed.compareVersion),
      compareEnabled: !!parsed.compareEnabled,
    };
  } catch {
    return null;
  }
}

function savePersistedFrameViewState(payload) {
  try {
    localStorage.setItem(FRAME_VIEW_STATE_KEY, JSON.stringify({
      char: String(payload && payload.char ? payload.char : ''),
      control: normalizeFrameControlType(payload && payload.control),
      version: normalizeGameVersion(payload && payload.version) || DEFAULT_FRAME_DATA_VERSION,
      compareVersion: normalizeGameVersion(payload && payload.compareVersion),
      compareEnabled: !!(payload && payload.compareEnabled),
    }));
  } catch { /* ignore quota / private mode failures */ }
}

function resolveCharacterNamesBySlug(slug) {
  if (!slug) return { jp: '', en: '' };
  const card = document.querySelector(`.char-card[data-char="${slug}"]`);
  if (!card) {
    return { jp: slug, en: slug.toUpperCase() };
  }
  const spanEl = card.querySelector('span');
  const imgEl = card.querySelector('img');
  const jp = card.dataset.nameJp || ((spanEl && spanEl.textContent) || slug);
  const en = card.dataset.nameEn || ((imgEl && imgEl.getAttribute('alt')) || slug.toUpperCase());
  return { jp, en };
}

function normalizeOfflineResourcePath(path) {
  return String(path || '')
    .replace(/^[./]+/, '')
    .replace(/\\/g, '/')
    .trim();
}

function loadOfflineBundleScript() {
  if (
    typeof window !== 'undefined'
    && window.OFFLINE_DATA_BUNDLE
    && typeof window.OFFLINE_DATA_BUNDLE === 'object'
  ) {
    return Promise.resolve(window.OFFLINE_DATA_BUNDLE);
  }
  if (offlineBundlePromise) return offlineBundlePromise;

  offlineBundlePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'assets/js/offline_data_bundle.js';
    script.defer = true;
    script.onload = () => resolve(window.OFFLINE_DATA_BUNDLE || {});
    script.onerror = () => reject(new Error('Failed to load offline_data_bundle.js'));
    document.head.appendChild(script);
  });

  return offlineBundlePromise;
}

function getOfflineBundle() {
  return (
    typeof window !== 'undefined'
    && window.OFFLINE_DATA_BUNDLE
    && typeof window.OFFLINE_DATA_BUNDLE === 'object'
  )
    ? window.OFFLINE_DATA_BUNDLE
    : null;
}

function getOfflineResourceText(path) {
  const bundle = getOfflineBundle();
  if (!bundle) return null;
  const normalized = normalizeOfflineResourcePath(path);
  if (!normalized) return null;
  return Object.prototype.hasOwnProperty.call(bundle, normalized)
    ? bundle[normalized]
    : null;
}

async function loadTextResource(path) {
  const bundledText = getOfflineResourceText(path);
  if (bundledText != null) return bundledText;

  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (res.ok) return await res.text();
  } catch { /* fall through to lazy offline bundle load */ }

  try {
    await loadOfflineBundleScript();
    const offlineText = getOfflineResourceText(path);
    if (offlineText != null) return offlineText;
  } catch { /* keep final error below */ }

  throw new Error(`Missing ${path}`);
}

async function loadJsonResource(path) {
  const bundledText = getOfflineResourceText(path);
  if (bundledText != null) {
    return JSON.parse(bundledText);
  }

  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (res.ok) return await res.json();
  } catch { /* fall through to lazy offline bundle load */ }

  try {
    await loadOfflineBundleScript();
    const offlineText = getOfflineResourceText(path);
    if (offlineText != null) return JSON.parse(offlineText);
  } catch { /* keep final error below */ }

  throw new Error(`Missing ${path}`);
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
  "alex": {
    "top": "calc(1px - min(4.16667vw, 80px))",
    "left": "calc(50% - min(34.375vw, 660px))",
    "width": "min(63.0208vw, 1210px)",
    "height": "min(80.7292vw, 1550px)",
    "shift": "8%",
    "shiftx": "-4%"
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
  },
  "ingrid": {
    "top": "calc(1px - min(4.16667vw, 80px))",
    "left": "calc(50% - min(34.375vw, 660px))",
    "width": "min(63.0208vw, 1462px)",
    "height": "min(80.7292vw, 1552px)",
    "shift": "-1%",
    "shiftx": "0%"
  },
  "yasmine": {
    "top": "calc(1px - min(4.16667vw, 80px))",
    "left": "calc(50% - min(34.375vw, 660px))",
    "width": "min(96.5625vw, 1703px)",
    "height": "min(76.9792vw, 1580px)",
    "shift": "16%",
    "shiftx": "0%"
  },

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

// Keep legacy select-thumb numbering stable; Alex uses CHARACTER_SELECT_SPECIAL.
const CHARACTER_ORDER = Object.keys(CHARACTER_ART_PRESETS).filter((slug) => slug !== 'alex');
const CHARACTER_SELECT_SPECIAL = {
  gouki_akuma: {
    jp: 'assets/images/characters/select_character22_gouki_over.png',
    en: 'assets/images/characters/select_character22_over.png'
  },
  vega_mbison: {
    jp: 'assets/images/characters/select_character23_vega_over.png',
    en: 'assets/images/characters/select_character23_over.png'
  },
  alex: 'assets/images/characters/select_character29_over.png',
  jp: 'assets/images/characters/select_character15_over.png',
  deejay: 'assets/images/characters/select_character12_over.png',
  marisa: 'assets/images/characters/select_character14_over.png',
  manon: 'assets/images/characters/select_character13_over.png',
  ingrid: 'assets/images/characters/select_character30_over.png',
  yasmine: 'assets/images/characters/select_character31_over.png'
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
    ? ['assets/templates/header_capcom_en.html']
    : ['assets/templates/header_capcom.html'];

  for (const templatePath of templateCandidates) {
    try {
      const raw = await loadTextResource(templatePath);
      const parsed = extractHeaderRows(raw, activeLang);
      headerTemplateHTMLByLang.set(activeLang, parsed);
      return parsed;
    } catch (err) {
      console.warn(`Failed to load header template: ${templatePath}`, err);
    }
  }

  const fallback = activeLang === 'en' ? headerHTMLFallbackEn() : headerHTMLFallbackJp();
  headerTemplateHTMLByLang.set(activeLang, fallback);
  return fallback;
}

function extractHeaderRows(raw, lang = 'jp') {
  if (!raw) return lang === 'en' ? headerHTMLFallbackEn() : headerHTMLFallbackJp();
  try {
    const tpl = document.createElement('template');
    tpl.innerHTML = raw.trim();
    const thead = tpl.content.querySelector('thead');
    if (thead) return thead.innerHTML;
  } catch (err) {
    console.warn('extractHeaderRows failed', err);
  }
  return raw || (lang === 'en' ? headerHTMLFallbackEn() : headerHTMLFallbackJp());
}

function headerHTMLFallbackEn() {
  return `
<tr>
  <th class="frame_fixed_m__icTnd frame_skill__tLJuM" rowspan="2">Move Name</th>
  <th class="frame_frame__ev9CB" colspan="3">Frames
    <ul>
      <li class="frame_startup_frame__Dc2Ph">Start-up</li>
      <li class="frame_active_frame__6Sovc"><input id="active_frame" type="checkbox" /><label for="active_frame">Active</label></li>
      <li class="frame_recovery_frame__CznJj">Recovery</li>
    </ul>
  </th>
  <th class="frame_recovery__omnsf" colspan="2">Frame Advantage
    <ul>
      <li class="frame_hit_frame__K7xOz"><input id="hit_frame" type="checkbox" /><label for="hit_frame">Hit</label></li>
      <li class="frame_block_frame__SfHiW"><input id="block_frame" type="checkbox" /><label for="block_frame">Block</label></li>
    </ul>
  </th>
  <th class="frame_cancel__hT_hr" rowspan="2"><input id="cancel" type="checkbox" /><label for="cancel">Cancel</label></th>
  <th class="frame_damage__HWaQm" rowspan="2"><p>Damage</p></th>
  <th class="frame_combo_correct__hCDUB" rowspan="2"><input id="combo_correct" type="checkbox" /><label for="combo_correct">Combo Scaling</label></th>
  <th class="frame_drive_gauge_gain___tEvm" rowspan="2"><input id="drive_gauge_gain_hit" type="checkbox" /><label for="drive_gauge_gain_hit">Drive Gauge Increase (Hit)</label></th>
  <th class="frame_drive_gauge_lose__nSHd3" colspan="2">Drive Gauge Decrease
    <ul>
      <li class="frame_drive_gauge_lose_dguard__4uQOc"><input id="drive_gauge_lose_dguard" type="checkbox" /><label for="drive_gauge_lose_dguard">Block</label></li>
      <li class="frame_drive_gauge_lose_punish__mFrmM"><input id="drive_gauge_lose_punish" type="checkbox" /><label for="drive_gauge_lose_punish">Punish Counter</label></li>
    </ul>
  </th>
  <th class="frame_sa_gauge_gain__oGcqw" rowspan="2">SA Gauge Increase</th>
  <th class="frame_attribute__1vABD" rowspan="2"><input id="attribute" type="checkbox" /><label for="attribute">Properties</label></th>
  <th class="frame_note__hfwBr" rowspan="2">Miscellaneous</th>
</tr>
`;
}

function headerHTMLFallbackJp() {
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
    const currentData = await getFrameMovesCached(char, control, selectedVersion, activeLang);
    const { version, moves } = currentData;
    if (requestId !== loadDataRequestId) return;
    renderFrameDataVersion(selectedVersion || version);
    let diffMap = new Map();
    if (frameDataViewState.compareEnabled
      && frameDataViewState.compareVersion
      && frameDataViewState.compareVersion !== selectedVersion) {
      try {
        // Compare both datasets in the same resolved language bucket.
        // This avoids false NEW rows when one version has no EN files and falls back to JP.
        const compareLang = (currentData && currentData.resolvedLang) || activeLang;
        let diffCurrentMoves = moves;
        let diffCompareMoves = null;
        let hasComparableBaseline = false;

        // In EN mode, run compare on JP datasets to avoid translation/template
        // mismatches causing false positives. Keep EN rows for rendering only.
        if (compareLang === 'en') {
          try {
            const jpCurrentData = await getFrameMovesCached(
              char,
              control,
              selectedVersion,
              'jp'
            );
            const jpCompareData = await getFrameMovesCached(
              char,
              control,
              frameDataViewState.compareVersion,
              'jp'
            );
            if (Array.isArray(jpCurrentData.moves) && jpCurrentData.moves.length
              && Array.isArray(jpCompareData.moves) && jpCompareData.moves.length) {
              diffCurrentMoves = jpCurrentData.moves;
              diffCompareMoves = jpCompareData.moves;
              hasComparableBaseline = true;
            } else {
              console.warn('Frame compare JP baseline unavailable. Skipping compare highlight.');
            }
          } catch (jpCompareErr) {
            console.warn('Frame compare JP baseline load failed. Skipping compare highlight:', jpCompareErr);
          }
        } else {
          const compareData = await getFrameMovesCached(
            char,
            control,
            frameDataViewState.compareVersion,
            compareLang
          );
          diffCompareMoves = compareData.moves;
          hasComparableBaseline = Array.isArray(diffCompareMoves) && diffCompareMoves.length > 0;
        }
        if (hasComparableBaseline && Array.isArray(diffCompareMoves) && diffCompareMoves.length) {
          if (Array.isArray(diffCurrentMoves) && diffCurrentMoves.length) {
            diffMap = buildFrameDiffMap(diffCurrentMoves, diffCompareMoves, control);
          } else {
            console.warn('Frame compare current rows unavailable. Skipping compare highlight.');
          }
        }
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

const FRAME_LEGACY_TEXT_FIXUPS = [
  ['着地後', '着地後'],
  ['着地まで', '着地まで'],
  ['着地', '着地'],
  ['全体', '全体'],
  ['フレーム', 'フレーム'],
  ['ガード時', 'ガード時'],
  ['ヒット時', 'ヒット時'],
  ['技名', '技名'],
  ['動作フレーム', '動作フレーム'],
  ['発生', '発生'],
  ['持続', '持続'],
  ['硬直', '硬直'],
  ['硬直差', '硬直差'],
  ['ヒット', 'ヒット'],
  ['ガード', 'ガード'],
  ['キャンセル', 'キャンセル'],
  ['ダメージ', 'ダメージ'],
  ['コンボ補正値', 'コンボ補正値'],
  ['Dゲージ増加', 'Dゲージ増加'],
  ['Dゲージ減少', 'Dゲージ減少'],
  ['パニッシュカウンター', 'パニッシュカウンター'],
  ['SAゲージ増加', 'SAゲージ増加'],
  ['属性', '属性'],
  ['備考', '備考'],
  ['通常技', '通常技'],
  ['特殊技', '特殊技'],
  ['必殺技', '必殺技'],
  ['スーパーアーツ', 'スーパーアーツ'],
  ['通常投げ', '通常投げ'],
  ['共通システム', '共通システム'],
];

function normalizeLegacyFrameText(rawText) {
  let out = String(rawText || '');
  if (!out) return out;
  FRAME_LEGACY_TEXT_FIXUPS.forEach(([from, to]) => {
    if (from && out.includes(from)) out = out.split(from).join(to);
  });
  return out
    .replace(/\u00a0/g, ' ')
    .replace(/　/g, ' ')
    .replace(/\uff05/g, '%')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u30fc\uff0d]/g, '-');
}

function localizeFrameInlineText(rawText, lang = null) {
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const source = normalizeLegacyFrameText(rawText);
  if (!source || active !== 'en') return source;
  const jp = {
    total: '\u5168\u4f53',
    frameWord: '\u30d5\u30ec\u30fc\u30e0',
    afterLanding: '\u7740\u5730\u5f8c',
    untilLanding: '\u7740\u5730\u307e\u3067',
    landing: '\u7740\u5730',
    onBlock: '\u30ac\u30fc\u30c9\u6642',
    onHit: '\u30d2\u30c3\u30c8\u6642',
  };
  let out = source
    .replace(new RegExp(jp.onBlock, 'g'), 'on Block')
    .replace(new RegExp(jp.onHit, 'g'), 'on Hit')
    // Normalize symbols first so matching/compare stays stable.
    .replace(/\uff05/g, '%')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u30fc\uff0d]/g, '-');

  out = out
    .replace(new RegExp(`(\\d+)\\s*[-+~]\\s*${jp.untilLanding}`, 'g'), '$1 frame(s) until landing')
    .replace(new RegExp(`${jp.untilLanding}\\s*(\\d+)`, 'g'), '$1 frame(s) until landing')
    .replace(new RegExp(`(\\d+)\\s*\\+\\s*${jp.afterLanding}\\s*(\\d+)`, 'g'), '$1+$2 frame(s) after landing')
    .replace(new RegExp(`${jp.afterLanding}\\s*(\\d+)`, 'g'), '$1 frame(s) after landing')
    // Some 2025.11.13 rows use shorthand such as "着地3".
    .replace(new RegExp(`${jp.landing}\\s*(\\d+)`, 'g'), '$1 frame(s) after landing')
    .replace(new RegExp(`${jp.total}\\s*[\\u203b*]?\\s*(\\d+)\\s*(?:F|${jp.frameWord})?`, 'g'), '$1 total frames')
    .replace(new RegExp(jp.total, 'g'), 'Total')
    .replace(new RegExp(jp.onBlock, 'g'), 'on Block')
    .replace(new RegExp(jp.onHit, 'g'), 'on Hit');

  return out.replace(/\s{2,}/g, ' ').trim();
}

function localizeFrameInlineHtml(rawHtml, lang = null) {
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const source = String(rawHtml || '');
  if (!source || active !== 'en') return source;
  const wrap = document.createElement('div');
  wrap.innerHTML = source;
  const walker = document.createTreeWalker(wrap, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    node.textContent = localizeFrameInlineText(node.textContent, active);
    node = walker.nextNode();
  }
  return wrap.innerHTML;
}

function rowHtml(m, control, diffInfo = null) {
  const cell = (html, txt, modeSensitive = false, tooltipContent = null) => {
    let markup = html && html.trim ? html.trim() : html;
    if (modeSensitive && markup) {
      markup = filterModeHtml(markup, control);
    }
    const normalizedText = localizeFrameInlineText(txt ?? '', getCurrentLang());
    const content = markup && markup.length
      ? localizeFrameInlineHtml(markup, getCurrentLang())
      : escapeHtmlCompat(normalizedText);

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
    } else if (isNewRow && fieldKey === 'name') {
      classes.push('frame-cell-changed');
      const nextText = extractFrameNameCompareText(
        filterModeHtml(String(m.nameHtml || ''), control),
        m.name,
      ) || String(m.name || '-').trim() || '-';
      title = `Prev: - -> ${nextText}`;
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
  const safe = escapeHtmlCompat(localizeFrameSectionLabel(label));
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

function frameCommandIconTokenFromSrc(src) {
  const file = String(src || '').split(/[\\/]/).pop().toLowerCase();
  const map = {
    'modern_l.png': 'L',
    'modern_m.png': 'M',
    'modern_h.png': 'H',
    'modern_sp.png': 'SP',
    'modern_auto.png': 'Auto',
    'modern_dl.png': 'DI',
    'modern_dr.png': 'DR',
    'modern_dp.png': 'DP',
    'modern_cr.png': 'CR',
    'key-plus.png': '+',
    'key-or.png': 'or',
    'key-all.png': 'Any',
    'key-nutral.png': 'N',
    'key-u.png': '8',
    'key-d.png': '2',
    'key-l.png': '4',
    'key-r.png': '6',
    'key-ul.png': '7',
    'key-ur.png': '9',
    'key-dl.png': '1',
    'key-dr.png': '3',
    'arrow_3.png': '>',
  };
  return map[file] || '';
}

function extractFrameCommandIconText(html) {
  if (!html || typeof html !== 'string') return '';
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  const tokens = Array.from(wrap.querySelectorAll('img'))
    .map((img) => frameCommandIconTokenFromSrc(img.getAttribute('src') || ''))
    .filter(Boolean);
  if (!tokens.length) return '';
  return tokens.join(' ')
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s+or\s+/g, ' or ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFrameNameCompareText(html, fallbackText = '') {
  const text = extractTextFromTd(html) || String(fallbackText || '').trim();
  const icons = extractFrameCommandIconText(html);
  return [text, icons].filter(Boolean).join(' | ');
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
    'nav.tree': 'COMBO TREE',
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
    'combo.tree_view': 'ツリー',
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
    'combo.rows.frame': 'タグ',
    'combo.rows.buttons': 'ボタン',
    'combo.rows.notes': '備考',
    'combo.rows.all': '全表示',
    'combo.filter.apply': '適用',
    'combo.filter.clear': 'クリア',
    'help.button': 'ヘルプ',
    'tutorial.button': '\u30c1\u30e5\u30fc\u30c8\u30ea\u30a2\u30eb',
    'tutorial.title': '\u30c1\u30e5\u30fc\u30c8\u30ea\u30a2\u30eb',
    'tutorial.prev': '\u623b\u308b',
    'tutorial.next': '\u6b21\u3078',
    'tutorial.close': '\u9589\u3058\u308b',
    'tutorial.help': '\u30d8\u30eb\u30d7',
    'tutorial.slide.1.title': '\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u3068\u64cd\u4f5c\u30e2\u30fc\u30c9',
    'tutorial.slide.1.text': '\u5de6\u4e0a\u306e\u30ad\u30e3\u30e9\u753b\u50cf\u304b\u3089\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u3092\u9078\u3073\u3001Classic / Modern \u3092\u5207\u308a\u66ff\u3048\u307e\u3059\u3002',
    'tutorial.slide.2.title': '\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u3068\u64cd\u4f5c\u30e2\u30fc\u30c9',
    'tutorial.slide.2.text': '\u5de6\u4e0a\u306e\u30ad\u30e3\u30e9\u753b\u50cf\u304b\u3089\u30ad\u30e3\u30e9\u30af\u30bf\u30fc\u3092\u9078\u3073\u3001Classic / Modern \u3092\u5207\u308a\u66ff\u3048\u307e\u3059\u3002',
    'tutorial.slide.3.title': '\u5165\u529b\u65b9\u6cd5\u3092\u9078\u629e',
    'tutorial.slide.3.text': '\u5de6\u4e0b\u306e\u30d7\u30eb\u30c0\u30a6\u30f3\u30e1\u30cb\u30e5\u30fc\u3067\u5165\u529b\u30c7\u30d0\u30a4\u30b9\u3092\u9078\u3073\u3001\u300c\u65b0\u898f\u300d\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u884c\u3092\u8ffd\u52a0\u3057\u307e\u3059\u3002',
    'tutorial.slide.4.title': '\u30b3\u30de\u30f3\u30c9\u5165\u529b',
    'tutorial.slide.4.text': '\u30b3\u30de\u30f3\u30c9\u6b04\u3092\u9078\u629e\u3057\u3066\u30b3\u30f3\u30dc\u3092\u5165\u529b\u3057\u307e\u3059\u3002\u30dc\u30bf\u30f3\u8868\u793a\u306f\u81ea\u52d5\u66f4\u65b0\u3055\u308c\u307e\u3059\u3002',
    'tutorial.slide.5.title': '\u691c\u7d22\u3068\u7d5e\u308a\u8fbc\u307f',
    'tutorial.slide.5.text': '\u691c\u7d22\u306f\u5168\u4f53\u304b\u3089\u63a2\u3059\u3068\u304d\u306b\u4f7f\u7528\u3057\u3001\u8a73\u7d30\u691c\u7d22\u3067\u306f\u8907\u6570\u6761\u4ef6\u3084\u7bc4\u56f2\u3092\u6307\u5b9a\u3057\u3066\u7d5e\u308a\u8fbc\u3081\u307e\u3059\u3002',
    'tutorial.slide.6.title': '\u30a4\u30f3\u30dd\u30fc\u30c8\u3068\u30a8\u30af\u30b9\u30dd\u30fc\u30c8',
    'tutorial.slide.6.text': 'IMPORT/EXPORT \u304b\u3089\u30c7\u30fc\u30bf\u3092\u53d6\u308a\u8fbc\u307f\u30fb\u66f8\u304d\u51fa\u3057\u3067\u304d\u307e\u3059\u3002JSON/XLSX\u3067\u5b9a\u671f\u7684\u306b\u30d0\u30c3\u30af\u30a2\u30c3\u30d7\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
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
    'help.group.tree': 'コンボツリー',
    'help.group.analysis': '分析機能（予定）',
    'help.howto.heading': '機能別ワークフロー',
    'help.howto.frame_compare': 'フレームデータ比較',
    'help.howto.combo_entry': 'コンボ入力',
    'help.howto.combo_details': 'コンボ詳細',
    'help.howto.combo_compare': 'コンボ比較',
    'help.howto.combo_compare_full': 'コンボ比較',
    'help.howto.combo_tree': 'コンボツリー',
    'help.howto.combo_tree_full': 'コンボツリー',
    'help.howto.table_control': '表操作',
    'help.howto.shortcuts': 'ショートカット',
    'help.howto.search': '検索 / フィルター',
    'help.howto.import': 'インポート',
    'help.howto.export': 'エクスポート',
    'help.howto.data_management': 'データ管理',
    'help.howto.combo_details_full': 'コンボ詳細',
    'help.howto.table_control_full': '表操作（行 / 列 / ソート）',
    'help.howto.shortcuts_full': 'ショートカット',
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
    'update.button': '\u66f4\u65b0\u5c65\u6b74',
    'update.title': '\u66f4\u65b0\u5c65\u6b74',
    'update.description': 'Lab Monster SF6 \u306e\u66f4\u65b0\u5c65\u6b74\u3067\u3059\u3002',
    'update.version_label': '\u30d0\u30fc\u30b8\u30e7\u30f3',
    'update.date_label': '\u65e5\u4ed8',
    'update.notes.title': 'ツール更新履歴',
    'update.notes.1': 'v1.0.0 (2026-02-16): 基礎的なコンボ表とフレーム表の機能をリリース。',

    'info.button': '\u60c5\u5831',
    'updater.button': '\u66f4\u65b0',
    'updater.available': '\u66f4\u65b0\u3042\u308a',
    'updater.checking': '\u66f4\u65b0\u78ba\u8a8d\u4e2d...',
    'updater.uptodate': '\u6700\u65b0\u7248\u3067\u3059\u3002',
    'updater.prompt.title': '\u66f4\u65b0\u901a\u77e5',
    'updater.prompt.body': '\u65b0\u3057\u3044\u30d0\u30fc\u30b8\u30e7\u30f3 v{latest} \u304c\u516c\u958b\u3055\u308c\u3066\u3044\u307e\u3059\u3002\n\u73fe\u5728: v{current}\n\n\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u30da\u30fc\u30b8\u3092\u958b\u304d\u307e\u3059\u304b\uff1f',
    'updater.manual.none': '\u66f4\u65b0\u306f\u3042\u308a\u307e\u305b\u3093\u3002',
    'updater.latest_version': '\u6700\u65b0\u30d0\u30fc\u30b8\u30e7\u30f3: v{version}',
    'updater.latest_unknown': '\u6700\u65b0\u30d0\u30fc\u30b8\u30e7\u30f3: \u78ba\u8a8d\u4e2d...',
    'updater.status.available': '\u66f4\u65b0\u3042\u308a',
    'updater.status.uptodate': '\u6700\u65b0',
    'updater.status.check_failed': '\u78ba\u8a8d\u5931\u6557',
    'updater.popup.title': '\u66f4\u65b0\u304c\u3042\u308a\u307e\u3059',
    'updater.popup.message': '\u65b0\u3057\u3044\u30d0\u30fc\u30b8\u30e7\u30f3\u304c\u516c\u958b\u3055\u308c\u3066\u3044\u307e\u3059\u3002',
    'updater.popup.latest': '\u6700\u65b0: v{version}',
    'updater.popup.current': '\u73fe\u5728: v{version}',
    'updater.popup.later': '\u5f8c\u3067',
    'updater.local_fallback': '\u81ea\u52d5\u66f4\u65b0\u30e9\u30f3\u30c1\u30e3\u30fc\u306e\u8d77\u52d5\u306b\u5931\u6557\u3057\u307e\u3057\u305f\u3002Start_LabMonster.exe \u3092\u624b\u52d5\u3067\u5b9f\u884c\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    'info.title': 'INFORMATION',
    'info.description': '\u9023\u7d61\u5148\u3001\u95a2\u9023\u30ea\u30f3\u30af\u3001\u30af\u30ec\u30b8\u30c3\u30c8\u3002',
    'info.team.title': '\u30c1\u30fc\u30e0',
    'info.team.body': 'Marshial Law: Lab Monster SF6 の企画・開発担当。コンボ研究と実戦準備に使える実用ツールを継続的に改善してきます。傍らでSF6のMOD制作も行っています。',
    'info.contact.title': '\u9023\u7d61\u5148',
    'info.contact.body': '要望やフィードバックはこちらから。',
    'info.contact.discord_label': 'Discord',
    'info.contact.email_label': '\u30e1\u30fc\u30eb',
    'info.contact.report_label': '\u4e0d\u5177\u5408\u5831\u544a',
    'info.links.title': '\u30ea\u30f3\u30af',
    'info.links.patch': '\u516c\u5f0f SF6 \u30d1\u30c3\u30c1\u30ce\u30fc\u30c8',
    'info.links.site': '\u516c\u5f0f SF6 \u30b5\u30a4\u30c8',
    'info.links.update': '\u66f4\u65b0\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9',
    'info.thanks.title': '\u8b1d\u8f9e',
    'info.thanks.body': '検証・データ共有・フィードバックを提供してくれるSF6コミュニティに感謝。',
    'info.donate.title': '\u30b5\u30dd\u30fc\u30c8',
    'info.donate.bmc': 'Buy Me a Coffee',
    'info.donate.patreon': 'Patreon',
    'info.donate.kofi': 'Ko-fi',

    'info.roadmap.title': '\u4eca\u5f8c\u306e\u4e88\u5b9a',
    'info.roadmap.1': 'データ入力の負担を減らすために、自動計算と自動入力機能。',
    'info.roadmap.2': 'クラシックとモダンの間で、コマンド・ボタン・ダメージを自動変換する機能。',
    'info.roadmap.3': 'コンボが成立可能かや、操作タイプ別に自動判定する機能。',
    'info.roadmap.4': 'モバイル版の検討（タブレット向け想定）',
    'info.roadmap.5': 'コンボ自動生成機能の検討（おそらく実装しない）',
    'info.roadmap.6': 'コンボ品質の分析・レポート機能の検討（おそらく実装しない）',
    'info.roadmap.note': 'ロードマップは段階的に更新され、内容は変更される場合があります。',
    'onboarding.title': 'クイックスタート',
    'onboarding.desc': '最初にこの4点だけ確認してください。',
    'onboarding.item.1': 'Classic / Modern はキャラ画像の下にあるタブで切り替えます。',
    'onboarding.item.2': 'コンボは「新規」で行を作成し、コマンド欄に入力します。',
    'onboarding.item.3': '行をダブルクリックするとコンボ詳細（フレーム・メモ・統計）を確認できます。',
    'onboarding.item.4': '検索/詳細検索で必要なルートだけを絞り込み、共有・退避はEXPORTを使ってください。',
    'onboarding.close': '開始する',

  },
  en: {
    'header.title': 'Frame Data',
    'theme.dark': 'Dark',
    'theme.light': 'Light',
    'nav.frame': 'FRAME DATA',
    'nav.combo': 'COMBO LIST',
    'nav.tree': 'COMBO TREE',
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
    'combo.tree_view': 'Tree',
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
    'combo.rows.frame': 'Tags',
    'combo.rows.buttons': 'Buttons',
    'combo.rows.notes': 'Notes',
    'combo.rows.all': 'All',
    'combo.filter.apply': 'Apply',
    'combo.filter.clear': 'Clear',
    'help.button': 'HELP',
    'tutorial.button': 'TUTORIAL',
    'tutorial.title': 'Quick Tutorial',
    'tutorial.prev': 'Prev',
    'tutorial.next': 'Next',
    'tutorial.close': 'Close',
    'tutorial.help': 'Help',
    'tutorial.slide.1.title': 'Choose Character and Mode',
    'tutorial.slide.1.text': 'Select a character from the portrait on the top left, then choose Classic or Modern mode.',
    'tutorial.slide.2.title': 'Toggle Automation/Overwrite',
    'tutorial.slide.2.text': 'Beta version of auto-calculation and auto-fill can be turned ON/OFF. It does not overwrite manually entered data, but you can toggle overwriting manual inputs.',
    'tutorial.slide.3.title': 'Choose Input Method',
    'tutorial.slide.3.text': 'Choose input device from the pulldown menu on the bottom left, then click Create to add a new row.',
    'tutorial.slide.4.title': 'Enter Commands',
    'tutorial.slide.4.text': 'Select a Command field and enter the combo. Button icons update automatically.',
    'tutorial.slide.5.title': 'Search and Filter',
    'tutorial.slide.5.text': 'Use Search for broad lookup or Advanced Search to specify multiple conditions and/or ranges.',
    'tutorial.slide.6.title': 'Importing and Exporting',
    'tutorial.slide.6.text': 'Import/export data from IMPORT/EXPORT. Keep regular backups in JSON/XLSX.',
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
    'help.group.tree': 'Combo Tree',
    'help.group.analysis': 'Analysis (Planned)',
    'help.howto.heading': 'Function-Based Workflows',
    'help.howto.frame_compare': 'Frame Data Compare',
    'help.howto.combo_entry': 'Combo Entry',
    'help.howto.combo_details': 'Combo Details',
    'help.howto.combo_compare': 'Combo Compare',
    'help.howto.combo_compare_full': 'Combo Compare',
    'help.howto.combo_tree': 'Combo Tree',
    'help.howto.combo_tree_full': 'Combo Tree',
    'help.howto.table_control': 'Table Control',
    'help.howto.search': 'Search / Filter',
    'help.howto.import': 'Importing',
    'help.howto.export': 'Exporting',
    'help.howto.data_management': 'Data Management',
    'help.howto.combo_details_full': 'Combo Details',
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
    'updater.button': 'UPDATE',
    'updater.available': 'UPDATE!',
    'updater.checking': 'Checking...',
    'updater.uptodate': 'Up to date.',
    'updater.prompt.title': 'Update Available',
    'updater.prompt.body': 'A new version v{latest} is available.\nCurrent: v{current}\n\nOpen download page now?',
    'updater.manual.none': 'No updates found.',
    'updater.latest_version': 'Latest version: v{version}',
    'updater.latest_unknown': 'Latest version: checking...',
    'updater.status.available': 'Update available',
    'updater.status.uptodate': 'Up to date',
    'updater.status.check_failed': 'Check failed',
    'updater.popup.title': 'Update Available',
    'updater.popup.message': 'A new version is available.',
    'updater.popup.latest': 'Latest: v{version}',
    'updater.popup.current': 'Current: v{version}',
    'updater.popup.later': 'Later',
    'updater.local_fallback': 'Could not launch local updater automatically. Please run Start_LabMonster.exe manually.',
    'info.title': 'INFORMATION',
    'info.description': 'Contact, useful links, and project credits.',
    'info.team.title': 'TEAM',
    'info.team.body': 'Marshial Law: Creator and developer of Lab Monster SF6. Focused on practical tools for combo lab and match preparation. Also making SF6 mods on the side.',
    'info.contact.title': 'CONTACT',
    'info.contact.body': 'For requests and feedback, please use your preferred contact channel.',
    'info.contact.discord_label': 'Discord',
    'info.contact.email_label': 'Email',
    'info.contact.report_label': 'Report Issue',
    'info.links.title': 'LINKS',
    'info.links.patch': 'Official SF6 Patch Notes',
    'info.links.site': 'Official SF6 Website',
    'info.links.update': 'Download Update',
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
    'onboarding.title': 'Quick Start',
    'onboarding.desc': 'Check these four points first.',
    'onboarding.item.1': 'Switch Classic / Modern with the tabs under the character portrait.',
    'onboarding.item.2': 'Create a row with Create, then enter your route in Command.',
    'onboarding.item.3': 'Double-click a row to open Combo Details (frame meter, notes, stats).',
    'onboarding.item.4': 'Use Search/Advanced Search to filter, and use EXPORT for backup and sharing.',
    'onboarding.close': 'Get Started',

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
const LOCAL_UPDATER_LAUNCHER = 'launcher/Update_LabMonster.bat';
const DEFAULT_RELEASE_URL = 'https://github.com/blackinferno/LabMonsterSF6/releases/latest';

function resolveConfiguredReleaseUrl() {
  const fromBody = String(document.body?.dataset?.releaseUrl || '').trim();
  if (fromBody) return fromBody;
  const fromMeta = String(
    document.querySelector('meta[name="lm-release-url"]')?.getAttribute('content') || '',
  ).trim();
  if (fromMeta) return fromMeta;
  return '';
}

function resolveReleaseUrl() {
  const configured = resolveConfiguredReleaseUrl();
  if (configured) return configured;

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
  return DEFAULT_RELEASE_URL;
}

function openExternalUrl(url) {
  if (!url || url === '#') return false;
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    window.location.href = url;
    return true;
  }
  return true;
}

function resolveUpdateAction() {
  const releaseUrl = appUpdateInfo.releaseUrl || resolveReleaseUrl();
  const protocol = String(window.location?.protocol || '').toLowerCase();
  if (protocol === 'file:') {
    return { mode: 'local', url: LOCAL_UPDATER_LAUNCHER, fallbackUrl: releaseUrl };
  }
  return { mode: 'web', url: releaseUrl, fallbackUrl: releaseUrl };
}

function openLocalUpdaterLauncher(url) {
  if (!url || url === '#') return false;
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    window.setTimeout(() => iframe.remove(), 1800);
    return true;
  } catch {
    return false;
  }
}

let helpTranslations = (window.HELP_TRANSLATIONS_DATA && typeof window.HELP_TRANSLATIONS_DATA === 'object')
  ? window.HELP_TRANSLATIONS_DATA
  : { jp: {} };
let helpTranslationsPromise = null;
let helpTranslationsScriptPromise = null;
let helpReverseTranslationCache = null;
let helpWhitespaceLookupCache = null;
let helpWhitespaceLookupSource = null;
const helpCoreEnglishCollisionSet = (() => {
  const seen = new Map();
  const collisions = new Set();
  const en = I18N_CORE.en || {};
  const jp = I18N_CORE.jp || {};
  Object.keys(en).forEach((key) => {
    if (!/^help\.|^tutorial\./.test(key)) return;
    const enText = String(en[key] || '');
    const jpText = String(jp[key] || '');
    if (!enText) return;
    if (!seen.has(enText)) {
      seen.set(enText, jpText);
      return;
    }
    if (seen.get(enText) !== jpText) collisions.add(enText);
  });
  return collisions;
})();
const helpTextOriginalCache = new WeakMap();
const helpElementOriginalHtmlCache = new WeakMap();

function invalidateHelpTranslationCache() {
  helpReverseTranslationCache = null;
  helpWhitespaceLookupCache = null;
  helpWhitespaceLookupSource = null;
}

function buildHelpReverseTranslationLookup() {
  if (helpReverseTranslationCache) return helpReverseTranslationCache;
  const reverse = new Map();
  const duplicates = new Set();
  const dict = (helpTranslations && helpTranslations.jp && typeof helpTranslations.jp === 'object')
    ? helpTranslations.jp
    : {};

  Object.entries(dict).forEach(([enText, jpText]) => {
    const normJp = normalizeHelpTextKey(jpText || '');
    if (!normJp) return;
    if (duplicates.has(normJp)) return;
    if (reverse.has(normJp)) {
      reverse.delete(normJp);
      duplicates.add(normJp);
      return;
    }
    reverse.set(normJp, enText);
  });

  helpReverseTranslationCache = reverse;
  return reverse;
}

function resolveHelpCoreTranslationOverride(key, lang) {
  if (!/^help\.|^tutorial\./.test(key || '')) return '';
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const jpDict = (helpTranslations && helpTranslations.jp && typeof helpTranslations.jp === 'object')
    ? helpTranslations.jp
    : null;
  if (!jpDict) return '';

  if (active === 'jp') {
    const enKeyText = I18N_CORE.en && I18N_CORE.en[key];
    if (!enKeyText) return '';
    if (helpCoreEnglishCollisionSet.has(enKeyText)) return '';
    return jpDict[enKeyText] || '';
  }

  const jpKeyText = I18N_CORE.jp && I18N_CORE.jp[key];
  if (!jpKeyText) return '';
  const reverse = buildHelpReverseTranslationLookup();
  return reverse.get(normalizeHelpTextKey(jpKeyText)) || '';
}

function buildHelpWhitespaceLookup(dict) {
  if (!dict || typeof dict !== 'object') return null;
  if (helpWhitespaceLookupCache && helpWhitespaceLookupSource === dict) return helpWhitespaceLookupCache;
  const lookup = new Map();
  const duplicates = new Set();
  Object.entries(dict).forEach(([rawKey, value]) => {
    const key = normalizeHelpTextKey(rawKey);
    if (!key) return;
    if (duplicates.has(key)) return;
    if (lookup.has(key)) {
      lookup.delete(key);
      duplicates.add(key);
      return;
    }
    lookup.set(key, value);
  });
  helpWhitespaceLookupSource = dict;
  helpWhitespaceLookupCache = lookup;
  return lookup;
}

function resolveHelpTextTranslation(dict, sourceText) {
  if (!dict || typeof dict !== 'object') return '';
  if (Object.prototype.hasOwnProperty.call(dict, sourceText)) {
    return dict[sourceText];
  }
  // Soft-break fallback only: normalize whitespace/newlines/NBSP and match exact normalized key.
  const lookup = buildHelpWhitespaceLookup(dict);
  if (!lookup) return '';
  return lookup.get(normalizeHelpTextKey(sourceText)) || '';
}

const FRAME_HEADER_LABELS = {
  '技名': 'Move Name',
  '技名': 'Move Name',
  'フレーム': 'Frames',
  'フレーム': 'Frames',
  '動作フレーム': 'Frames',
  '動作フレーム': 'Frames',
  '発生': 'Start-up',
  '発生': 'Start-up',
  '持続': 'Active',
  '持続': 'Active',
  '硬直': 'Recovery',
  '硬直': 'Recovery',
  '硬直差': 'Frame Advantage',
  '硬直差': 'Frame Advantage',
  'ヒット': 'Hit',
  'ヒット': 'Hit',
  'ガード': 'Block',
  'ガード': 'Block',
  'キャンセル': 'Cancel',
  'キャンセル': 'Cancel',
  'ダメージ': 'Damage',
  'ダメージ': 'Damage',
  'コンボ補正値': 'Combo Scaling',
  'コンボ補正値': 'Combo Scaling',
  'Dゲージ増加（ヒット）': 'Drive Gauge Increase (Hit)',
  'Dゲージ増加（ヒット）': 'Drive Gauge Increase (Hit)',
  'Dゲージ増加': 'Drive Gauge Increase',
  'Dゲージ増加': 'Drive Gauge Increase',
  'Dゲージ減少': 'Drive Gauge Decrease',
  'Dゲージ減少': 'Drive Gauge Decrease',
  'パニッシュカウンター': 'Punish Counter',
  'パニッシュカウンター': 'Punish Counter',
  'SAゲージ増加': 'SA Gauge Increase',
  'SAゲージ増加': 'SA Gauge Increase',
  '属性': 'Properties',
  '属性': 'Properties',
  '備考': 'Miscellaneous',
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
  normalizeLegacyFrameText(text)
    .replace(/\s+/g, '')
    .replace(/[()\uFF08\uFF09]/g, '')
    .trim();

const FRAME_SECTION_LABELS = {
  '通常技': 'Normal Moves',
  '通常技': 'Normal Moves',
  '特殊技': 'Unique Attacks',
  '特殊技': 'Unique Attacks',
  '必殺技': 'Special Moves',
  '必殺技': 'Special Moves',
  'スーパーアーツ': 'Super Arts',
  'スーパーアーツ': 'Super Arts',
  '通常投げ': 'Throws',
  '通常投げ': 'Throws',
  '共通システム': 'Common Moves',
  '共通システム': 'Common Moves',
};

const FRAME_SECTION_LABEL_LOOKUP = (() => {
  const lookup = new Map();
  Object.entries(FRAME_SECTION_LABELS).forEach(([jp, en]) => {
    lookup.set(normalizeFrameLabel(jp), en);
  });
  return lookup;
})();

function localizeFrameSectionLabel(label, lang = null) {
  const raw = String(label || '').trim();
  if (!raw) return '';
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  if (active !== 'en') return raw;
  const mapped = FRAME_SECTION_LABEL_LOOKUP.get(normalizeFrameLabel(raw));
  return mapped || raw;
}

function normalizeGameVersion(value) {

  const raw = String(value || '').trim();
  if (!raw) return '';
  return raw.replace(/^v(?:er(?:sion)?)?\.?\s*/i, '');
}

function getCurrentAppVersion() {
  const bodyVersion = document.body?.getAttribute('data-version');
  if (bodyVersion && String(bodyVersion).trim()) {
    return String(bodyVersion).trim();
  }
  const metaVersion = document
    .querySelector('meta[name="lm-version"]')
    ?.getAttribute('content');
  if (metaVersion && String(metaVersion).trim()) {
    return String(metaVersion).trim();
  }
  return APP_VERSION_FALLBACK;
}

function parseSemver(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/^v/i, '');
  const parts = cleaned.split('.');
  const normalized = [0, 0, 0];
  for (let i = 0; i < normalized.length; i += 1) {
    const parsed = Number.parseInt(parts[i] || '0', 10);
    normalized[i] = Number.isFinite(parsed) ? parsed : 0;
  }
  return normalized;
}

function cmpSemver(a, b) {
  const av = parseSemver(a);
  const bv = parseSemver(b);
  for (let i = 0; i < 3; i += 1) {
    if (av[i] > bv[i]) return 1;
    if (av[i] < bv[i]) return -1;
  }
  return 0;
}

function normalizeVersionTagToVersion(tag) {
  return String(tag || '').trim().replace(/^v/i, '');
}

function getUpdateActionUrl() {
  return resolveUpdateAction().url || '#';
}

function applyUpdateActionState(lang) {
  const updateInfoButton = document.getElementById('infoLatestUpdateBtn');
  const latestVersionText = document.getElementById('infoLatestVersionText');
  const latestVersionStatus = document.getElementById('infoLatestVersionStatus');
  const actionUrl = getUpdateActionUrl();
  const hasUpdate = !!appUpdateInfo.hasUpdate;
  const activeLang = lang || getCurrentLang() || 'jp';

  if (latestVersionText) {
    const latest = String(appUpdateInfo.latestVersion || '').trim();
    if (latest) {
      const template = translateKey('updater.latest_version', activeLang)
        || translateKey('updater.latest_version', 'jp')
        || 'Latest version: v{version}';
      latestVersionText.textContent = String(template).replaceAll('{version}', latest);
    } else {
      latestVersionText.textContent = translateKey('updater.latest_unknown', activeLang)
        || translateKey('updater.latest_unknown', 'jp')
        || 'Latest version: checking...';
    }
  }

  if (latestVersionStatus) {
    let statusKey = 'updater.checking';
    if (appUpdateInfo.checkFailed) statusKey = 'updater.status.check_failed';
    else if (hasUpdate) statusKey = 'updater.status.available';
    else if (appUpdateInfo.checked) statusKey = 'updater.status.uptodate';
    latestVersionStatus.textContent = translateKey(statusKey, activeLang)
      || translateKey(statusKey, 'jp')
      || '';
    latestVersionStatus.classList.toggle('is-available', hasUpdate);
  }

  const applyLinkState = (el) => {
    if (!el) return;
    if (actionUrl) {
      el.href = actionUrl;
      el.classList.remove('is-disabled');
      el.removeAttribute('aria-disabled');
      el.removeAttribute('tabindex');
    } else {
      el.href = '#';
      el.classList.add('is-disabled');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('tabindex', '-1');
    }
    el.classList.toggle('update-available', hasUpdate);
    if (hasUpdate) {
      el.setAttribute('data-update-available', '1');
      el.setAttribute('title', translateKey('updater.available', lang || getCurrentLang() || 'jp') || 'Update available');
    } else {
      el.removeAttribute('data-update-available');
      el.removeAttribute('title');
    }
  };

  applyLinkState(updateInfoButton);
}

function isOverlayVisible(id) {
  const el = document.getElementById(id);
  return !!(el && !el.classList.contains('hidden'));
}

function closeUpdateOverlay() {
  const overlay = document.getElementById('updateOverlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    maybeShowUpdateTutorials();
  }, 0);
}

function resetUpdateOverlayLayout() {
  const overlay = document.getElementById('updateOverlay');
  if (!overlay) return;
  const nowBtn = document.getElementById('updateNowBtn');
  const laterBtn = document.getElementById('updateLaterBtn');
  const titleEl = document.getElementById('updateTitle');
  const messageEl = document.getElementById('updateMessage');
  const metaSection = overlay.querySelector('.welcome-section');
  const activeLang = getCurrentLang();
  const titleText = translateKey('updater.popup.title', activeLang)
    || translateKey('updater.popup.title', 'jp')
    || 'Update Available';
  const messageText = translateKey('updater.popup.message', activeLang)
    || translateKey('updater.popup.message', 'jp')
    || 'A new version is available.';
  const laterText = translateKey('updater.popup.later', activeLang)
    || translateKey('updater.popup.later', 'jp')
    || 'Later';
  const nowText = translateKey('updater.button', activeLang)
    || translateKey('updater.button', 'jp')
    || 'UPDATE';

  if (titleEl) titleEl.textContent = titleText;
  if (messageEl) messageEl.textContent = messageText;
  if (metaSection) metaSection.classList.remove('hidden');
  if (laterBtn) laterBtn.textContent = laterText;
  if (nowBtn) {
    nowBtn.classList.remove('hidden');
    nowBtn.textContent = nowText;
  }
}

function openUpdateOverlayNotice(message, title = '') {
  const overlay = document.getElementById('updateOverlay');
  if (!overlay) return;
  resetUpdateOverlayLayout();
  const titleEl = document.getElementById('updateTitle');
  const messageEl = document.getElementById('updateMessage');
  const nowBtn = document.getElementById('updateNowBtn');
  const metaSection = overlay.querySelector('.welcome-section');
  if (titleEl && title) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = String(message || '');
  if (metaSection) metaSection.classList.add('hidden');
  if (nowBtn) nowBtn.classList.add('hidden');
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function openUpdateOverlay() {
  const overlay = document.getElementById('updateOverlay');
  if (!overlay) return;
  resetUpdateOverlayLayout();
  const activeLang = getCurrentLang();
  const latestLine = document.getElementById('updateLatestLine');
  const currentLine = document.getElementById('updateCurrentLine');
  const latestTemplate = translateKey('updater.popup.latest', activeLang)
    || translateKey('updater.popup.latest', 'jp')
    || 'Latest: v{version}';
  const currentTemplate = translateKey('updater.popup.current', activeLang)
    || translateKey('updater.popup.current', 'jp')
    || 'Current: v{version}';

  if (latestLine) {
    latestLine.textContent = String(latestTemplate).replaceAll('{version}', String(appUpdateInfo.latestVersion || ''));
  }
  if (currentLine) {
    currentLine.textContent = String(currentTemplate).replaceAll('{version}', String(APP_VERSION || ''));
  }

  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function maybeShowStartupUpdatePopup() {
  if (!appUpdateInfo.hasUpdate || updateStartupPopupShown) return;

  const tryShow = (attempt = 0) => {
    const blocking =
      isOverlayVisible('onboardingOverlay')
      || isOverlayVisible('welcomeOverlay')
      || isOverlayVisible('tutorialOverlay')
      || isOverlayVisible('charSelectOverlay');
    if (blocking && attempt < 20) {
      window.setTimeout(() => tryShow(attempt + 1), 500);
      return;
    }
    updateStartupPopupShown = true;
    openUpdateOverlay();
  };

  tryShow();
}

function triggerUpdateAction(showNoUpdateAlert = true) {
  return checkForAppUpdate()
    .catch(() => appUpdateInfo)
    .then(() => {
      if (appUpdateInfo.hasUpdate) {
        const action = resolveUpdateAction();
        if (action.mode === 'local') {
          const ok = openLocalUpdaterLauncher(action.url);
          if (!ok) {
            const openedFallback = openExternalUrl(action.fallbackUrl);
            if (!openedFallback) {
              const activeLang = getCurrentLang();
              const title = translateKey('updater.popup.title', activeLang)
                || translateKey('updater.popup.title', 'jp')
                || 'Update Available';
              const message = translateKey('updater.local_fallback', activeLang)
                || translateKey('updater.local_fallback', 'jp')
                || 'Could not launch local updater. Please run Start_LabMonster.exe manually.';
              openUpdateOverlayNotice(message, title);
            }
          }
          return;
        }
        openExternalUrl(action.url);
        return;
      }
      if (showNoUpdateAlert) {
        const activeLang = getCurrentLang();
        const title = translateKey('updater.button', activeLang)
          || translateKey('updater.button', 'jp')
          || 'Update';
        const message = translateKey('updater.manual.none', activeLang)
          || translateKey('updater.manual.none', 'jp')
          || 'No updates found.';
        openUpdateOverlayNotice(message, title);
      }
    });
}

async function checkForAppUpdate() {
  const activeLang = getCurrentLang();
  const fallbackUrl = resolveReleaseUrl();
  appUpdateInfo = {
    ...appUpdateInfo,
    checkFailed: false,
    releaseUrl: appUpdateInfo.releaseUrl || fallbackUrl,
  };
  applyUpdateActionState(activeLang);

  let timeoutId = null;
  let controller = null;
  try {
    controller = new AbortController();
    timeoutId = window.setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT_MS);
    const res = await fetch(UPDATE_CHECK_ENDPOINT, {
      method: 'GET',
      cache: 'no-cache',
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const latestTag = String(json?.tag_name || '').trim();
    const latestVersion = normalizeVersionTagToVersion(latestTag);
    const releaseUrl = String(json?.html_url || '').trim() || fallbackUrl;
    const hasUpdate = !!latestVersion && cmpSemver(latestVersion, APP_VERSION) > 0;

    appUpdateInfo = {
      checked: true,
      checkFailed: false,
      hasUpdate,
      latestTag,
      latestVersion,
      releaseUrl,
    };
    applyUpdateActionState(activeLang);
    return appUpdateInfo;
  } catch (err) {
    appUpdateInfo = {
      ...appUpdateInfo,
      checked: true,
      checkFailed: true,
      hasUpdate: false,
      releaseUrl: fallbackUrl,
    };
    applyUpdateActionState(activeLang);
    throw err;
  } finally {
    if (timeoutId != null) window.clearTimeout(timeoutId);
  }
}

function getLastSeenAppVersion() {
  try {
    return String(localStorage.getItem(LAST_SEEN_VERSION_KEY) || '').trim();
  } catch {
    return '';
  }
}

function setLastSeenAppVersion(version) {
  try {
    localStorage.setItem(LAST_SEEN_VERSION_KEY, String(version || '').trim());
  } catch { /* ignore localStorage write failures */ }
}

function getAutomationTutorialSeenVersion() {
  try {
    return String(localStorage.getItem(TUTORIAL_AUTOMATION_UPDATE_SEEN_KEY) || '').trim();
  } catch {
    return '';
  }
}

function setAutomationTutorialSeenVersion(version) {
  try {
    localStorage.setItem(TUTORIAL_AUTOMATION_UPDATE_SEEN_KEY, String(version || '').trim());
  } catch { /* ignore localStorage write failures */ }
}

function getComboDetailsTutorialSeenVersion() {
  try {
    return String(localStorage.getItem(TUTORIAL_COMBO_DETAILS_UPDATE_SEEN_KEY) || '').trim();
  } catch {
    return '';
  }
}

function setComboDetailsTutorialSeenVersion(version) {
  try {
    localStorage.setItem(TUTORIAL_COMBO_DETAILS_UPDATE_SEEN_KEY, String(version || '').trim());
  } catch { /* ignore localStorage write failures */ }
}

function maybeShowUpdateTutorials() {
  maybeShowAutomationUpdateTutorial();
  maybeShowComboDetailsUpdateTutorial();
}

function scheduleAutomationTutorialRetry() {
  if (!automationTutorialEligibleThisLaunch) return;
  if (automationTutorialRetryTimer) return;
  automationTutorialRetryTimer = window.setTimeout(() => {
    automationTutorialRetryTimer = null;
    maybeShowAutomationUpdateTutorial();
  }, 250);
}

function scheduleComboDetailsTutorialRetry() {
  if (!comboDetailsTutorialEligibleThisLaunch) return;
  if (comboDetailsTutorialRetryTimer) return;
  comboDetailsTutorialRetryTimer = window.setTimeout(() => {
    comboDetailsTutorialRetryTimer = null;
    maybeShowComboDetailsUpdateTutorial();
  }, 250);
}

function maybeShowAutomationUpdateTutorial() {
  let tutorialSeen = false;
  try {
    tutorialSeen = localStorage.getItem(TUTORIAL_FIRST_RUN_KEY) === '1';
  } catch { /* ignore */ }
  if (!tutorialSeen) return;
  if (!automationTutorialEligibleThisLaunch) return;
  if (getAutomationTutorialSeenVersion() === AUTOMATION_TUTORIAL_VERSION) {
    automationTutorialEligibleThisLaunch = false;
    return;
  }

  if (
    isOverlayVisible('onboardingOverlay')
    || isOverlayVisible('welcomeOverlay')
    || isOverlayVisible('tutorialOverlay')
    || isOverlayVisible('updateOverlay')
    || isOverlayVisible('charSelectOverlay')
  ) {
    scheduleAutomationTutorialRetry();
    return;
  }

  if (automationTutorialRetryTimer) {
    window.clearTimeout(automationTutorialRetryTimer);
    automationTutorialRetryTimer = null;
  }
  setAutomationTutorialSeenVersion(AUTOMATION_TUTORIAL_VERSION);
  automationTutorialEligibleThisLaunch = false;
  openTutorialOverlay({
    flow: AUTOMATION_TUTORIAL_FLOW_KEY,
    startIndex: 0,
  });
}

function maybeShowComboDetailsUpdateTutorial() {
  let tutorialSeen = false;
  try {
    tutorialSeen = localStorage.getItem(TUTORIAL_FIRST_RUN_KEY) === '1';
  } catch { /* ignore */ }
  if (!tutorialSeen) return;
  if (!comboDetailsTutorialEligibleThisLaunch) return;
  if (getComboDetailsTutorialSeenVersion() === APP_VERSION) {
    comboDetailsTutorialEligibleThisLaunch = false;
    return;
  }

  if (
    isOverlayVisible('onboardingOverlay')
    || isOverlayVisible('welcomeOverlay')
    || isOverlayVisible('tutorialOverlay')
    || isOverlayVisible('updateOverlay')
    || isOverlayVisible('charSelectOverlay')
  ) {
    scheduleComboDetailsTutorialRetry();
    return;
  }

  if (comboDetailsTutorialRetryTimer) {
    window.clearTimeout(comboDetailsTutorialRetryTimer);
    comboDetailsTutorialRetryTimer = null;
  }
  setComboDetailsTutorialSeenVersion(APP_VERSION);
  comboDetailsTutorialEligibleThisLaunch = false;
  openTutorialOverlay({
    flow: COMBO_DETAILS_TUTORIAL_FLOW_KEY,
    startIndex: 0,
  });
}

function normalizeMainView(value) {
  const v = String(value || '').toLowerCase();
  if (v === 'frame') return 'frame';
  if (v === 'tree') return 'tree';
  return 'combos';
}

function loadPersistedMainView() {
  try {
    return normalizeMainView(localStorage.getItem(MAIN_VIEW_STATE_KEY));
  } catch {
    return 'combos';
  }
}

function savePersistedMainView(viewKey) {
  try {
    localStorage.setItem(MAIN_VIEW_STATE_KEY, normalizeMainView(viewKey));
  } catch { /* ignore quota / private mode failures */ }
}

function normalizeRoadmapStatus(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return 'planned';
  if (raw === 'in-progress' || raw === 'in_progress' || raw === 'progress' || raw === 'inprogress') {
    return 'in-progress';
  }
  if (raw === 'done' || raw === 'complete' || raw === 'completed') {
    return 'done';
  }
  return 'planned';
}

function parseUpdatesText(source) {
  const output = {
    current_version: APP_VERSION,
    updates: [],
    roadmap: { jp: [], en: [] },
  };
  const lines = String(source || '').split(/\r?\n/);
  let currentSection = '';
  let currentLang = '';
  let currentUpdate = null;
  let currentRoadmapTrack = '';

  lines.forEach((rawLine) => {
    const line = String(rawLine || '').trim();
    if (!line) return;

    const versionMatch = line.match(/^CURRENT_VERSION\s*:\s*(.+)$/i);
    if (versionMatch) {
      output.current_version = normalizeGameVersion(versionMatch[1]) || APP_VERSION;
      return;
    }

    const updateMatch = line.match(/^##\s*UPDATE\s+([^\s|]+)\s*\|\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\|\s*(.+))?$/i);
    if (updateMatch) {
      const version = normalizeGameVersion(updateMatch[1]) || '';
      const date = String(updateMatch[2] || '').trim();
      const flagsRaw = String(updateMatch[3] || '').trim();
      const updateEntry = {
        version,
        date,
        important: false,
        tags: [],
        items: { jp: [], en: [] },
      };
      if (flagsRaw) {
        flagsRaw.split('|').map((part) => part.trim()).filter(Boolean).forEach((flag) => {
          if (/^important$/i.test(flag)) {
            updateEntry.important = true;
            return;
          }
          const tagsMatch = flag.match(/^tags?\s*:\s*(.+)$/i);
          if (tagsMatch) {
            updateEntry.tags = tagsMatch[1]
              .split(',')
              .map((tag) => String(tag || '').trim())
              .filter(Boolean);
          }
        });
      }
      output.updates.push(updateEntry);
      currentUpdate = updateEntry;
      currentSection = 'update';
      currentLang = '';
      currentRoadmapTrack = '';
      return;
    }

    const roadmapMatch = line.match(/^##\s*ROADMAP\s+(REALISTIC|STRETCH)\s*$/i);
    if (roadmapMatch) {
      currentSection = 'roadmap';
      currentRoadmapTrack = String(roadmapMatch[1] || '').trim().toLowerCase() === 'stretch'
        ? 'stretch'
        : 'realistic';
      currentLang = '';
      currentUpdate = null;
      return;
    }

    const langMatch = line.match(/^###\s*(JP|EN)\s*$/i);
    if (langMatch) {
      currentLang = String(langMatch[1] || '').trim().toLowerCase();
      return;
    }

    const bulletMatch = line.match(/^-\s+(.+)$/);
    if (!bulletMatch || !currentLang) return;
    const bulletBody = String(bulletMatch[1] || '').trim();
    if (!bulletBody) return;

    if (currentSection === 'update' && currentUpdate) {
      currentUpdate.items[currentLang] = currentUpdate.items[currentLang] || [];
      currentUpdate.items[currentLang].push(bulletBody);
      return;
    }

    if (currentSection === 'roadmap' && currentRoadmapTrack) {
      let status = 'planned';
      let content = bulletBody;
      const statusMatch = content.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (statusMatch) {
        status = normalizeRoadmapStatus(statusMatch[1]);
        content = String(statusMatch[2] || '').trim();
      }
      const parts = content.split(/\s*::\s*/);
      const title = String(parts[0] || '').trim();
      const notes = String(parts.slice(1).join(' :: ') || '').trim();
      if (!title) return;
      output.roadmap[currentLang] = output.roadmap[currentLang] || [];
      output.roadmap[currentLang].push({
        track: currentRoadmapTrack,
        status,
        title,
        notes,
      });
    }
  });

  return output;
}

function normalizeUpdatesPayload(raw) {
  const payload = (raw && typeof raw === 'object') ? raw : {};
  const updates = Array.isArray(payload.updates) ? payload.updates : [];
  const normalizedUpdates = updates
    .map((entry) => {
      const version = String(entry && entry.version ? entry.version : '').trim();
      if (!version) return null;
      const items = (entry && entry.items && typeof entry.items === 'object') ? entry.items : {};
      return {
        version,
        date: String(entry && entry.date ? entry.date : '').trim(),
        important: !!(entry && entry.important),
        tags: Array.isArray(entry && entry.tags) ? entry.tags.filter(Boolean).map((tag) => String(tag)) : [],
        items: {
          jp: Array.isArray(items.jp) ? items.jp.filter(Boolean).map((item) => String(item)) : [],
          en: Array.isArray(items.en) ? items.en.filter(Boolean).map((item) => String(item)) : [],
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => cmpSemver(b.version, a.version));
  const roadmapRaw = (payload.roadmap && typeof payload.roadmap === 'object') ? payload.roadmap : {};
  const normalizeRoadmapEntries = (entries) => (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      title: String(entry && entry.title ? entry.title : '').trim(),
      status: String(entry && entry.status ? entry.status : 'planned').trim().toLowerCase(),
      track: String(entry && entry.track ? entry.track : 'realistic').trim().toLowerCase() === 'stretch'
        ? 'stretch'
        : 'realistic',
      notes: String(entry && entry.notes ? entry.notes : '').trim(),
    }))
    .filter((entry) => entry.title);

  const currentVersion = String(payload.current_version || payload.currentVersion || APP_VERSION).trim() || APP_VERSION;

  return {
    current_version: currentVersion,
    updates: normalizedUpdates,
    roadmap: {
      jp: normalizeRoadmapEntries(roadmapRaw.jp),
      en: normalizeRoadmapEntries(roadmapRaw.en),
    },
  };
}

async function ensureUpdatesDataLoaded() {
  if (updatesDataCache) return updatesDataCache;
  if (updatesDataPromise) return updatesDataPromise;

  updatesDataPromise = (async () => {
    try {
      const rawText = await loadTextResource(UPDATES_TEXT_PATH);
      if (rawText && String(rawText).trim()) {
        const parsedText = parseUpdatesText(rawText);
        updatesDataCache = normalizeUpdatesPayload(parsedText);
        return updatesDataCache;
      }
    } catch (err) {
      console.warn('updates.txt load failed.', err);
    }

    console.warn('Failed to load updates data. Falling back to minimal payload.');
    updatesDataCache = normalizeUpdatesPayload({
      current_version: APP_VERSION,
      updates: [],
      roadmap: { jp: [], en: [] },
    });
    return updatesDataCache;
  })();

  return updatesDataPromise;
}

function getWelcomeLocaleStrings(lang = null) {
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  if (active === 'en') {
    return {
      title: 'What\'s new',
      version: (v) => `Current version: v${v}`,
      viewFull: 'View full notes',
      ok: 'OK',
      skip: 'Don\'t show again for this version',
      noItems: 'No updates available for this range.',
      sectionLabel: 'Version',
      changelogTitle: 'Changelog',
      roadmapTitle: 'Roadmap',
      roadmapGroupRealistic: 'Realistic Plan',
      roadmapGroupStretch: 'Stretch / Long-shot',
      status: {
        planned: 'Planned',
        'in-progress': 'In Progress',
        done: 'Done',
      },
    };
  }
  return {
    title: '\u30a2\u30c3\u30d7\u30c7\u30fc\u30c8\u60c5\u5831',
    version: (v) => `\u73fe\u5728\u306e\u30d0\u30fc\u30b8\u30e7\u30f3: v${v}`,
    viewFull: '\u8a73\u7d30\u3092\u898b\u308b',
    ok: 'OK',
    skip: '\u3053\u306e\u30d0\u30fc\u30b8\u30e7\u30f3\u3067\u306f\u4eca\u5f8c\u8868\u793a\u3057\u306a\u3044',
    noItems: '\u8868\u793a\u3067\u304d\u308b\u66f4\u65b0\u9805\u76ee\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
    sectionLabel: '\u30d0\u30fc\u30b8\u30e7\u30f3',
    changelogTitle: '\u66f4\u65b0\u5c65\u6b74',
    roadmapTitle: '\u4eca\u5f8c\u306e\u4e88\u5b9a',
    roadmapGroupRealistic: '\u5b9f\u73fe\u6027\u306e\u9ad8\u3044\u8a08\u753b',
    roadmapGroupStretch: '\u30b9\u30c8\u30ec\u30c3\u30c1\uff08\u9577\u671f/\u9ad8\u96e3\u5ea6\uff09',
    status: {
      planned: '\u4e88\u5b9a',
      'in-progress': '\u9032\u884c\u4e2d',
      done: '\u5b8c\u4e86',
    },
  };
}

function getLocalizedUpdateItems(entry, lang = null) {
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const preferred = Array.isArray(entry?.items?.[active]) ? entry.items[active] : [];
  if (preferred.length) return preferred;
  const fallback = active === 'en' ? entry?.items?.jp : entry?.items?.en;
  return Array.isArray(fallback) ? fallback : [];
}

function buildWelcomeUpdateGroups(data, lang = null) {
  const current = APP_VERSION;
  const lastSeen = getLastSeenAppVersion();
  if (lastSeen && cmpSemver(lastSeen, current) === 0) return [];

  const updates = Array.isArray(data?.updates) ? data.updates : [];
  if (!updates.length) return [];

  if (!lastSeen) {
    const currentEntry = updates.find((entry) => cmpSemver(entry.version, current) === 0) || updates[0];
    if (!currentEntry) return [];
    const localized = getLocalizedUpdateItems(currentEntry, lang);
    const picked = currentEntry.important ? localized : localized.slice(0, 5);
    return picked.length
      ? [{ ...currentEntry, displayItems: picked }]
      : [];
  }

  let remaining = WELCOME_MAX_ITEMS;
  return updates
    .filter((entry) => cmpSemver(entry.version, lastSeen) > 0 && cmpSemver(entry.version, current) <= 0)
    .sort((a, b) => cmpSemver(b.version, a.version))
    .map((entry) => {
      const localized = getLocalizedUpdateItems(entry, lang);
      if (!localized.length || remaining <= 0) return null;
      const sliced = localized.slice(0, remaining);
      remaining -= sliced.length;
      return { ...entry, displayItems: sliced };
    })
    .filter(Boolean);
}

function renderWelcomePopup(lang = null) {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  const strings = getWelcomeLocaleStrings(lang);
  const titleEl = document.getElementById('welcomeTitle');
  const versionEl = document.getElementById('welcomeVersionLine');
  const listEl = document.getElementById('welcomeUpdateList');
  const skipLabelEl = document.getElementById('welcomeSkipLabel');
  const viewFullBtn = document.getElementById('welcomeViewFull');
  const okBtn = document.getElementById('welcomeOk');

  if (titleEl) titleEl.textContent = strings.title;
  if (versionEl) versionEl.textContent = strings.version(APP_VERSION);
  if (skipLabelEl) skipLabelEl.textContent = strings.skip;
  if (viewFullBtn) viewFullBtn.textContent = strings.viewFull;
  if (okBtn) okBtn.textContent = strings.ok;
  if (!listEl) return;

  if (!pendingWelcomeGroups.length) {
    listEl.innerHTML = `<li>${escapeHtml(strings.noItems)}</li>`;
    return;
  }

  const chunks = [];
  pendingWelcomeGroups.forEach((group) => {
    let items = Array.isArray(group.displayItems) ? group.displayItems : [];
    const sourceEntry = updatesDataCache?.updates?.find?.((entry) => entry.version === group.version);
    if (sourceEntry && items.length) {
      const localized = getLocalizedUpdateItems(sourceEntry, lang);
      if (localized.length) {
        items = localized.slice(0, items.length);
      }
    }
    if (!items.length) return;
    chunks.push(
      `<li class="welcome-group-header"><strong>${escapeHtml(`${strings.sectionLabel} v${group.version}`)}</strong>${group.date ? ` <span class="welcome-group-date">${escapeHtml(group.date)}</span>` : ''}</li>`
    );
    items.forEach((item) => {
      chunks.push(`<li>${escapeHtml(item)}</li>`);
    });
  });
  listEl.innerHTML = chunks.join('');
}

async function renderInfoUpdatesAndRoadmap(lang = null) {
  const updatesRoot = document.getElementById('infoUpdates');
  const roadmapRoot = document.getElementById('infoRoadmap');
  if (!updatesRoot && !roadmapRoot) return;

  const data = await ensureUpdatesDataLoaded();
  const active = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const strings = getWelcomeLocaleStrings(active);

  if (updatesRoot) {
    const updateBlocks = [];
    data.updates.forEach((entry) => {
      const items = getLocalizedUpdateItems(entry, active);
      if (!items.length) return;
      const itemHtml = items.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
      const tagsHtml = entry.tags.length
        ? `<div class="info-tag-list">${entry.tags.map((tag) => `<span class="info-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
        : '';
      updateBlocks.push(
        `<article class="info-update-entry">
          <header class="info-update-head">
            <strong>v${escapeHtml(entry.version)}</strong>
            ${entry.date ? `<time datetime="${escapeHtml(entry.date)}">${escapeHtml(entry.date)}</time>` : ''}
          </header>
          ${tagsHtml}
          <ul class="welcome-list">${itemHtml}</ul>
        </article>`
      );
    });
    updatesRoot.innerHTML = updateBlocks.length
      ? updateBlocks.join('')
      : `<p class="help-note">${escapeHtml(strings.noItems)}</p>`;
  }

  if (roadmapRoot) {
    const roadmapEntries = Array.isArray(data.roadmap?.[active]) ? data.roadmap[active] : [];
    const grouped = {
      realistic: roadmapEntries.filter((entry) => (entry.track || 'realistic') !== 'stretch'),
      stretch: roadmapEntries.filter((entry) => (entry.track || 'realistic') === 'stretch'),
    };
    const buildGroupHtml = (entries, groupLabel) => {
      if (!entries.length) return '';
      const roadmapHtml = entries.map((entry) => {
        const statusKey = entry.status === 'in_progress' ? 'in-progress' : entry.status;
        const label = strings.status[statusKey] || strings.status.planned;
        return `<li class="info-roadmap-item">
          <span class="info-status info-status-${escapeHtml(statusKey)}">${escapeHtml(label)}</span>
          <div class="info-roadmap-copy">
            <strong>${escapeHtml(entry.title)}</strong>
            ${entry.notes ? `<p>${escapeHtml(entry.notes)}</p>` : ''}
          </div>
        </li>`;
      }).join('');
      return `<section class="info-roadmap-group"><h4 class="info-roadmap-group-title">${escapeHtml(groupLabel)}</h4><ul class="info-roadmap-list">${roadmapHtml}</ul></section>`;
    };

    const realisticHtml = buildGroupHtml(grouped.realistic, strings.roadmapGroupRealistic || strings.roadmapTitle);
    const stretchHtml = buildGroupHtml(grouped.stretch, strings.roadmapGroupStretch || strings.roadmapTitle);
    const finalHtml = `${realisticHtml}${stretchHtml}`;
    roadmapRoot.innerHTML = finalHtml
      ? finalHtml
      : `<p class="help-note">${escapeHtml(strings.noItems)}</p>`;
  }
}

function openWelcomeOverlay() {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  const skipCheckbox = document.getElementById('welcomeSkipVersion');
  if (skipCheckbox) skipCheckbox.checked = false;
  renderWelcomePopup(getCurrentLang());
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeWelcomeOverlay({ markSeen = false } = {}) {
  const overlay = document.getElementById('welcomeOverlay');
  if (!overlay) return;
  if (markSeen) setLastSeenAppVersion(APP_VERSION);
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    maybeShowUpdateTutorials();
  }, 0);
}

async function maybeShowWelcomePopup() {
  try {
    if (localStorage.getItem(TUTORIAL_FIRST_RUN_KEY) !== '1') return;
  } catch { /* ignore */ }
  const lastSeen = getLastSeenAppVersion();
  if (lastSeen && cmpSemver(lastSeen, APP_VERSION) === 0) return;
  const data = await ensureUpdatesDataLoaded();
  pendingWelcomeGroups = buildWelcomeUpdateGroups(data, getCurrentLang());
  if (!pendingWelcomeGroups.length) {
    setLastSeenAppVersion(APP_VERSION);
    return;
  }
  openWelcomeOverlay();
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

function renderHeaderGameVersion(version = null, lang = null) {
  const badge = document.getElementById('footerGameVersionText');
  if (!badge) return;
  const value = normalizeGameVersion(version || currentFrameDataVersion) || DEFAULT_FRAME_DATA_VERSION;
  badge.textContent = `Game Ver: ${value}`;
}

function renderFrameDataVersion(version = null) {
  if (version != null) {
    currentFrameDataVersion = normalizeGameVersion(version) || DEFAULT_FRAME_DATA_VERSION;
  }
  if (document && document.body) {
    document.body.dataset.frameDataVersion = currentFrameDataVersion;
  }
  renderHeaderGameVersion(currentFrameDataVersion, getCurrentLang());
  document.dispatchEvent(new CustomEvent('lm:frame-version-changed', {
    detail: { version: currentFrameDataVersion },
  }));
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
    // If EN path(s) are configured, keep EN-only candidates to avoid silently
    // falling back to JP and rendering mixed-language frame tables.
    if (!candidates.length && base) candidates.push(base);
  } else {
    const explicitJp = String(entry.pathJp || entry.path_jp || '').trim().replace(/\/+$/, '');
    if (explicitJp) candidates.push(explicitJp);
    if (base) candidates.push(base);
  }

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

async function getFrameMovesCached(char, control, versionId, lang) {
  const safeChar = String(char || '').trim();
  const safeControl = String(control || 'classic').trim();
  const safeVersion = normalizeGameVersion(versionId) || DEFAULT_FRAME_DATA_VERSION;
  const safeLang = (lang || getCurrentLang() || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  const cacheKey = `${safeLang}|${safeVersion}|${safeChar}|${safeControl}`;
  if (frameMovesCache.has(cacheKey)) {
    return frameMovesCache.get(cacheKey);
  }
  const pathCandidates = getFrameDataPathCandidatesForVersion(
    safeChar,
    safeControl,
    safeVersion,
    safeLang
  );
  const { data: raw, path: usedPath } = await fetchFrameJsonByCandidates(pathCandidates);
  const resolvedLang = /_en\/[^/]+_(classic|modern)\.json$/i.test(String(usedPath || '')) ? 'en' : 'jp';
  const cached = {
    version: extractFrameDataVersion(raw),
    moves: normalizeMoves(raw),
    resolvedLang,
    sourcePath: usedPath,
  };
  frameMovesCache.set(cacheKey, cached);
  return cached;
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

function buildFrameDiffMap(currentMoves, compareMoves, control = 'classic') {
  const result = new Map();
  if (!Array.isArray(currentMoves) || !Array.isArray(compareMoves) || !compareMoves.length) {
    return result;
  }
  const fields = [
    'name', 'startup', 'active', 'recovery', 'hitAdv', 'guardAdv', 'cancel', 'damage',
    'comboMod', 'driveGain', 'driveLossGuard', 'driveLossPunish', 'saGain',
    'attribute', 'notes',
  ];
  const numericCoreFields = [
    'startup', 'active', 'recovery', 'hitAdv', 'guardAdv',
    'damage', 'driveGain', 'driveLossGuard', 'driveLossPunish', 'saGain',
  ];
  const modeSensitiveFields = new Set([
    'name',
    'startup', 'active', 'recovery', 'hitAdv', 'guardAdv',
    'damage', 'driveGain', 'driveLossGuard', 'driveLossPunish', 'saGain',
  ]);
  const comparableText = (move, field) => {
    if (!move || typeof move !== 'object') return '';
    const htmlField = `${field}Html`;
    const hasHtml = typeof move[htmlField] === 'string' && move[htmlField].trim();
    if (hasHtml) {
      let html = move[htmlField];
      if (modeSensitiveFields.has(field)) {
        html = filterModeHtml(html, control);
      }
      const text = extractTextFromTd(html);
      if (text) return text;
    }
    return String(move[field] || '');
  };
  const comparableDiffText = (move, field) => {
    if (field !== 'name') return comparableText(move, field);
    if (!move || typeof move !== 'object') return '';
    let html = typeof move.nameHtml === 'string' ? move.nameHtml : '';
    if (html.trim()) {
      html = filterModeHtml(html, control);
      return extractFrameNameCompareText(html, move.name);
    }
    return String(move.name || '');
  };
  const normalizeKey = (text) => {
    const localized = localizeFrameInlineText(String(text || ''), 'en');
    const normalized = typeof localized.normalize === 'function'
      ? localized.normalize('NFKC')
      : localized;
    return normalized
      .toLowerCase()
      .replace(/[\s\u00a0]+/g, '')
      .replace(/[’'"`“”.,:;!?()[\]{}\\/|_\-~〜～]/g, '');
  };
  const normalizeValue = (text) => {
    const localized = localizeFrameInlineText(String(text || ''), 'en');
    const normalized = typeof localized.normalize === 'function'
      ? localized.normalize('NFKC')
      : localized;
    return normalized
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\u30fc\uff0d]/g, '-')
      .replace(/[~〜～]/g, '~')
      .replace(/\s+/g, '')
      .replace(/[\u203b※]/g, '')
      .replace(/[,，]/g, '')
      .trim();
  };
  const diffCount = (aMove, bMove) => {
    let count = 0;
    fields.forEach((field) => {
      if (normalizeValue(comparableDiffText(aMove, field)) !== normalizeValue(comparableDiffText(bMove, field))) count += 1;
    });
    return count;
  };
  const diffCountByFields = (aMove, bMove, targetFields) => {
    let count = 0;
    (targetFields || []).forEach((field) => {
      if (normalizeValue(comparableText(aMove, field)) !== normalizeValue(comparableText(bMove, field))) count += 1;
    });
    return count;
  };
  const sameIdentityCore = (aMove, bMove) => {
    const identityFields = ['startup', 'active', 'recovery', 'hitAdv', 'guardAdv', 'damage'];
    let compared = 0;
    let mismatch = 0;
    identityFields.forEach((field) => {
      const aVal = normalizeValue(comparableText(aMove, field));
      const bVal = normalizeValue(comparableText(bMove, field));
      if (!aVal && !bVal) return;
      compared += 1;
      if (aVal !== bVal) mismatch += 1;
    });
    // Require enough overlap to avoid accidental name-only matches.
    if (compared < 3) return false;
    // Allow one noisy field (usually text/render drift) but otherwise treat as same move.
    return mismatch <= 1;
  };
  const buildCandidateBuckets = (moves) => {
    const byBase = new Map();
    const byName = new Map();
    const byIndex = new Map();
    const byCore = new Map();
    moves.forEach((move, index) => {
      const sectionKey = normalizeKey(move.section);
      const nameKey = normalizeKey(comparableText(move, 'name'));
      const baseKey = `${sectionKey}|${nameKey}`;
      const coreKey = numericCoreFields
        .map((field) => normalizeValue(comparableText(move, field)))
        .join('|');
      const entry = { move, index, used: false };
      byIndex.set(index, entry);
      if (!byBase.has(baseKey)) byBase.set(baseKey, []);
      byBase.get(baseKey).push(entry);
      if (!byName.has(nameKey)) byName.set(nameKey, []);
      byName.get(nameKey).push(entry);
      if (coreKey.replace(/\|/g, '')) {
        if (!byCore.has(coreKey)) byCore.set(coreKey, []);
        byCore.get(coreKey).push(entry);
      }
    });
    return { byBase, byName, byIndex, byCore };
  };
  const findExact = (entries, move, opts = {}) => {
    if (!Array.isArray(entries) || !entries.length) return null;
    const ignoreUsed = !!opts.ignoreUsed;
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry || (!ignoreUsed && entry.used)) continue;
      if (diffCount(move, entry.move) === 0) return entry;
    }
    return null;
  };
  const findClosest = (entries, move, opts = {}) => {
    if (!Array.isArray(entries) || !entries.length) return null;
    const ignoreUsed = !!opts.ignoreUsed;
    let best = null;
    let bestDiff = Infinity;
    for (let i = 0; i < entries.length; i += 1) {
      const entry = entries[i];
      if (!entry || (!ignoreUsed && entry.used)) continue;
      const nextDiff = diffCount(move, entry.move);
      if (!best || nextDiff < bestDiff || (nextDiff === bestDiff && entry.index < best.index)) {
        best = entry;
        bestDiff = nextDiff;
      }
    }
    return best;
  };

  const buckets = buildCandidateBuckets(compareMoves);
  currentMoves.forEach((move, idx) => {
    const sectionKey = normalizeKey(move.section);
    const nameKey = normalizeKey(comparableText(move, 'name'));
    const baseKey = `${sectionKey}|${nameKey}`;
    const coreKey = numericCoreFields
      .map((field) => normalizeValue(comparableText(move, field)))
      .join('|');
    let sharedMatch = false;
    let matched = findExact(buckets.byBase.get(baseKey), move);
    if (!matched) matched = findClosest(buckets.byBase.get(baseKey), move);
    if (!matched && nameKey) matched = findExact(buckets.byName.get(nameKey), move);
    if (!matched && nameKey) matched = findClosest(buckets.byName.get(nameKey), move);
    if (!matched && coreKey.replace(/\|/g, '')) {
      matched = findClosest(buckets.byCore.get(coreKey), move);
      if (matched) sharedMatch = true;
    }
    if (!matched && currentMoves.length === compareMoves.length) {
      const direct = buckets.byIndex.get(idx);
      if (direct && !direct.used) matched = direct;
    }
    if (!matched) {
      const sharedCandidates = [];
      const byBase = buckets.byBase.get(baseKey);
      if (Array.isArray(byBase) && byBase.length) sharedCandidates.push(...byBase);
      const byName = buckets.byName.get(nameKey);
      if (Array.isArray(byName) && byName.length) sharedCandidates.push(...byName);
      if (sharedCandidates.length) {
        const uniq = [];
        const seen = new Set();
        sharedCandidates.forEach((entry) => {
          if (!entry || typeof entry !== 'object') return;
          const key = `${entry.index}:${normalizeKey(comparableText(entry.move, 'name'))}`;
          if (seen.has(key)) return;
          seen.add(key);
          uniq.push(entry);
        });
        matched = findExact(uniq, move, { ignoreUsed: true }) || findClosest(uniq, move, { ignoreUsed: true });
        sharedMatch = !!matched;
      }
    }
    if (!matched) {
      // Final fallback: if frame values are exactly identical, treat as same move
      // even when section/name labels differ between versions or locales.
      const allEntries = Array.from(buckets.byIndex.values());
      matched = findExact(allEntries, move, { ignoreUsed: true });
      if (!matched) {
        // Defensive fallback for EN/JP text drift:
        // if frame-value core fields are almost identical, do not mark as NEW.
        const nearest = findClosest(allEntries, move, { ignoreUsed: true });
        const sameSection = !!(
          nearest
          && normalizeKey(move.section)
          && normalizeKey(move.section) === normalizeKey(nearest.move.section)
        );
        if (nearest && diffCountByFields(move, nearest.move, numericCoreFields) <= (sameSection ? 2 : 1)) {
          matched = nearest;
        }
      }
      if (!matched && nameKey) {
        // Extra fallback for 2025.11.13 EN regeneration:
        // when names line up and core frame identity is effectively the same,
        // avoid marking unchanged rows as NEW.
        const byNameEntries = buckets.byName.get(nameKey) || [];
        const sameCore = byNameEntries.find((entry) => {
          if (!entry) return false;
          return sameIdentityCore(move, entry.move);
        });
        if (sameCore) {
          matched = sameCore;
        }
      }
      if (!matched && nameKey) {
        // Final safety net: if a same-name row exists in compare data, treat it as
        // the baseline row instead of forcing NEW due noisy template/text drift.
        const byNameEntries = buckets.byName.get(nameKey) || [];
        const sameName = byNameEntries.find((entry) => !!entry && !!entry.move);
        if (sameName) {
          matched = sameName;
          sharedMatch = true;
        }
      }
      sharedMatch = !!matched;
    }
    if (!matched) {
      result.set(idx, { isNew: true, fields: {} });
      return;
    }
    if (!sharedMatch) matched.used = true;
    const other = matched.move;
    const diffFields = {};
    fields.forEach((field) => {
      const nowRaw = comparableDiffText(move, field);
      const oldRaw = comparableDiffText(other, field);
      const nowVal = normalizeValue(nowRaw);
      const oldVal = normalizeValue(oldRaw);
      if (nowVal !== oldVal) {
        diffFields[field] = {
          old: String(oldRaw || '').trim(),
          next: String(nowRaw || '').trim(),
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
  const override = resolveHelpCoreTranslationOverride(key, lang);
  if (override) return override;
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
  applyUpdateActionState(active);
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

function escapeHelpHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const HELP_EMPHASIS_TOKEN_MAP = {
  'Create': ['新規'],
  'Duplicate': ['複製'],
  'Delete': ['削除'],
  'Dedupe': ['重複削除'],
  'Compare': ['比較'],
  'Version': ['Version', 'バージョン'],
  'Command': ['コマンド'],
  'Notes': ['備考', 'Notes'],
  'Import': ['Import', 'IMPORT', 'インポート'],
  'Export': ['Export', 'EXPORT', 'エクスポート'],
  'Apply': ['Apply', '適用'],
  'Search': ['Search', '検索'],
  'ADVANCED SEARCH': ['ADVANCED SEARCH', '詳細検索'],
  'FULL': ['FULL', '全て'],
  'BASIC': ['BASIC', '基本'],
  'SIMPLE': ['SIMPLE', '簡易'],
  'CUSTOM': ['CUSTOM', 'カスタム'],
  'Close': ['Close', '閉じる'],
  'Frame Meter': ['フレームメーター'],
  'Buttons': ['ボタン'],
};

function preserveHelpInlineEmphasis(el, translated, dict = null) {
  if (!el) return '';
  const tokens = Array.from(el.querySelectorAll('b,strong'))
    .map((node) => String(node.textContent || '').trim())
    .filter(Boolean);
  if (!tokens.length) return '';

  let html = escapeHelpHtml(translated);
  let replacedCount = 0;
  tokens.forEach((token) => {
    const variants = [token, ...(HELP_EMPHASIS_TOKEN_MAP[token] || [])];
    if (dict && typeof dict === 'object') {
      const translatedToken = resolveHelpTextTranslation(dict, token);
      if (translatedToken) variants.push(translatedToken);
    }
    const uniqueVariants = Array.from(
      new Set(
        variants
          .map((variant) => String(variant || '').trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => b.length - a.length);
    for (const variant of uniqueVariants) {
      const escToken = String(variant || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!escToken) continue;
      const regex = new RegExp(escToken, 'g');
      if (!regex.test(html)) continue;
      html = html.replace(regex, `<b>${escapeHelpHtml(variant)}</b>`);
      replacedCount += 1;
      break;
    }
  });
  return replacedCount > 0 ? html : '';
}

function ensureHelpTranslationsLoaded() {
  if (window.HELP_TRANSLATIONS_DATA && typeof window.HELP_TRANSLATIONS_DATA === 'object') {
    helpTranslations = window.HELP_TRANSLATIONS_DATA;
    invalidateHelpTranslationCache();
    return Promise.resolve(helpTranslations);
  }
  if (helpTranslationsPromise) return helpTranslationsPromise;

  if (!helpTranslationsScriptPromise) {
    helpTranslationsScriptPromise = new Promise((resolve, reject) => {
      const src = 'assets/js/help_translations_data.js';
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') {
          resolve();
          return;
        }
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  }

  helpTranslationsPromise = helpTranslationsScriptPromise
    .then(() => {
      helpTranslations = (window.HELP_TRANSLATIONS_DATA && typeof window.HELP_TRANSLATIONS_DATA === 'object')
        ? window.HELP_TRANSLATIONS_DATA
        : { jp: {} };
      invalidateHelpTranslationCache();
      return helpTranslations;
    })
    .catch(() => {
      helpTranslations = helpTranslations && typeof helpTranslations === 'object' ? helpTranslations : { jp: {} };
      invalidateHelpTranslationCache();
      return helpTranslations;
    });

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
    const isHelpActive = document.body.getAttribute('data-view') === 'help';
    const hasInline = window.HELP_TRANSLATIONS_DATA && typeof window.HELP_TRANSLATIONS_DATA === 'object';
    if (!isHelpActive && !hasInline && !helpTranslationsPromise) return;
    ensureHelpTranslationsLoaded().then(() => applyHelpTextLanguage(active, true));
    return;
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

    const sourceText = el.textContent || '';
    const translated = resolveHelpTextTranslation(dict, sourceText);
    if (!translated) return;

    if (/<[a-z][\s\S]*>/i.test(translated)) {
      el.innerHTML = translated;
    } else {
      const emphasized = preserveHelpInlineEmphasis(el, translated, dict);
      if (emphasized) {
        el.innerHTML = emphasized;
      } else {
        el.textContent = translated;
      }
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
      const translated = resolveHelpTextTranslation(dict, original);
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
  // Only bind language switching to the actual JP/EN language buttons.
  // Other parts of the UI reuse `.lang-btn` styling for toggle buttons.
  const buttons = document.querySelectorAll('.lang-btn[data-lang]');
  if (!buttons.length) return;
  const body = document.body;
  const normalizeLang = (value) => (String(value || '').toLowerCase() === 'en' ? 'en' : 'jp');
  const readPersistedLang = () => {
    try {
      const raw = localStorage.getItem(LANGUAGE_PREF_KEY);
      if (raw) return normalizeLang(raw);
      const fallback = localStorage.getItem(I18NEXT_LANGUAGE_KEY);
      return fallback ? normalizeLang(fallback) : '';
    } catch {
      return '';
    }
  };
  const writePersistedLang = (lang) => {
    try {
      const next = normalizeLang(lang);
      localStorage.setItem(LANGUAGE_PREF_KEY, next);
      localStorage.setItem(I18NEXT_LANGUAGE_KEY, next);
    } catch { /* ignore localStorage write failures */ }
  };
  const applyLang = (lang, options = {}) => {
    const nextLang = normalizeLang(lang);
    const persist = options && options.persist === false ? false : true;
    buttons.forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === nextLang));
    body.setAttribute('data-lang', nextLang);
    if (persist) writePersistedLang(nextLang);
    else {
      // Keep legacy i18next key consistent even on startup restore.
      try {
        localStorage.setItem(I18NEXT_LANGUAGE_KEY, nextLang);
      } catch { /* ignore localStorage write failures */ }
    }
    applyCoreI18n(nextLang);
    applyOfficialLinks(nextLang);
    applyHelpTextLanguage(nextLang);
    if (updatesDataCache) {
      renderInfoUpdatesAndRoadmap(nextLang).catch((err) => {
        console.warn('Failed to rerender updates/roadmap for language switch:', err);
      });
    }
    renderWelcomePopup(nextLang);
    applyFrameHeaderLanguage(nextLang);
    renderFrameDataVersion();
    frameMovesCache.clear();
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
    if (typeof window.refreshTutorialOverlayLanguage === 'function') {
      window.refreshTutorialOverlayLanguage();
    }
  };
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang || 'jp';
      applyLang(lang, { persist: true });
    });
  });
  const initial = readPersistedLang() || normalizeLang(body.getAttribute('data-lang') || 'jp');
  applyLang(initial, { persist: false });
}

function initInfoModals() {
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const updateOverlay = document.getElementById('updateOverlay');
  const infoBtn = document.getElementById('appInfoBtn');
  const helpBtn = document.getElementById('appHelpBtn');
  const welcomeClose = document.getElementById('welcomeClose');
  const welcomeOk = document.getElementById('welcomeOk');
  const welcomeViewFull = document.getElementById('welcomeViewFull');
  const welcomeSkipCheckbox = document.getElementById('welcomeSkipVersion');
  const updateClose = document.getElementById('updateClose');
  const updateLaterBtn = document.getElementById('updateLaterBtn');
  const updateNowBtn = document.getElementById('updateNowBtn');
  const frameOfficialPatchBtn = document.getElementById('frameOfficialPatchBtn');
  const infoLatestUpdateBtn = document.getElementById('infoLatestUpdateBtn');
  const infoReportLink = document.getElementById('infoReportLink');

  const scrollInfoSection = (targetId, behavior = 'smooth') => {
    const infoView = document.getElementById('infoView');
    if (!infoView || !targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const viewRect = infoView.getBoundingClientRect();
    const nextTop = infoView.scrollTop + (targetRect.top - viewRect.top) - 10;
    infoView.scrollTo({ top: Math.max(0, nextTop), behavior });
  };

  const openInfoSection = (targetId = 'info-team', options = {}) => {
    const behavior = options.behavior || 'smooth';
    if (typeof window.setMainView === 'function') window.setMainView('info');
    ensureUpdatesDataLoaded()
      .then(() => renderInfoUpdatesAndRoadmap(getCurrentLang()))
      .catch((err) => console.warn('Failed to render info updates/roadmap:', err))
      .finally(() => {
        requestAnimationFrame(() => {
          scrollInfoSection(targetId, behavior);
        });
      });
  };
  window.openInfoSection = openInfoSection;

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
      if (!targetId) return;
      if (targetId === 'info-updates' || targetId === 'info-roadmap') {
        ensureUpdatesDataLoaded()
          .then(() => renderInfoUpdatesAndRoadmap(getCurrentLang()))
          .catch((err) => console.warn('Failed to render info updates/roadmap:', err))
          .finally(() => scrollInfoSection(targetId));
        return;
      }
      scrollInfoSection(targetId);
    });
  }
  if (window.location.hash && /^#help-/.test(window.location.hash)) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  infoBtn?.addEventListener('click', () => {
    openInfoSection('info-team', { behavior: 'auto' });
  });
  const handleWelcomeDismiss = (markSeenDefault = false) => {
    const markSeen = markSeenDefault || !!welcomeSkipCheckbox?.checked;
    closeWelcomeOverlay({ markSeen });
  };
  welcomeClose?.addEventListener('click', () => handleWelcomeDismiss(false));
  welcomeOverlay?.querySelector('.modal-backdrop')?.addEventListener('click', () => handleWelcomeDismiss(false));
  welcomeOk?.addEventListener('click', () => closeWelcomeOverlay({ markSeen: true }));
  welcomeViewFull?.addEventListener('click', () => {
    closeWelcomeOverlay({ markSeen: true });
    openInfoSection('info-updates');
  });
  updateClose?.addEventListener('click', () => closeUpdateOverlay());
  updateLaterBtn?.addEventListener('click', () => closeUpdateOverlay());
  updateOverlay?.querySelector('.modal-backdrop')?.addEventListener('click', () => closeUpdateOverlay());
  updateNowBtn?.addEventListener('click', () => {
    closeUpdateOverlay();
    triggerUpdateAction(false);
  });

  window.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    if (welcomeOverlay && !welcomeOverlay.classList.contains('hidden')) {
      handleWelcomeDismiss(false);
      return;
    }
    if (updateOverlay && !updateOverlay.classList.contains('hidden')) {
      closeUpdateOverlay();
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

  const bindUpdateAction = (el) => {
    if (!el || el.dataset.updateBound) return;
    el.dataset.updateBound = '1';
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (el.classList.contains('is-disabled')) return;
      triggerUpdateAction(true);
    });
  };
  bindUpdateAction(infoLatestUpdateBtn);
  if (infoReportLink && !infoReportLink.dataset.bound) {
    infoReportLink.dataset.bound = '1';
    infoReportLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      const report = buildReportMailto();
      const popup = window.open(report, '_blank', 'noopener,noreferrer');
      if (!popup) window.location.href = report;
    });
  }
}

function buildReportMailto() {
  const lang = getCurrentLang() === 'en' ? 'en' : 'jp';
  const selectedChar = (document.body.dataset.currentCharSlug || '').trim() || '(none)';
  const mode = document.getElementById('tabModern')?.classList.contains('active') ? 'modern' : 'classic';
  const comboCtx = (typeof window.getComboReportContext === 'function')
    ? window.getComboReportContext()
    : null;
  const lines = [
    `App Version: v${APP_VERSION}`,
    `Frame Data Version: ${currentFrameDataVersion || DEFAULT_FRAME_DATA_VERSION}`,
    `Language: ${lang}`,
    `Character: ${selectedChar}`,
    `Mode: ${mode}`,
  ];
  if (comboCtx && comboCtx.snippet) {
    lines.push(`Row: ${comboCtx.row}`);
    lines.push(`Command: ${comboCtx.snippet.command || ''}`);
    lines.push(`Notes: ${comboCtx.snippet.notes || ''}`);
    lines.push(`Authored Version: ${comboCtx.snippet.authoredVersion || ''}`);
  }
  const subject = encodeURIComponent(`[Lab Monster SF6] Feedback / Bug Report`);
  const body = encodeURIComponent(lines.join('\n'));
  return `mailto:labmonster0718@gmail.com?subject=${subject}&body=${body}`;
}

function normalizeTutorialFlowKey(flowKey) {
  const raw = String(flowKey || '').trim().toLowerCase();
  const alias = raw === 'advance-search' ? 'advanced-search' : raw;
  const key = alias;
  if (!key) return DEFAULT_TUTORIAL_FLOW;
  return Object.prototype.hasOwnProperty.call(TUTORIAL_FLOW_SLIDES, key)
    ? key
    : DEFAULT_TUTORIAL_FLOW;
}

function getTutorialSlidesForFlow(flowKey) {
  const key = normalizeTutorialFlowKey(flowKey);
  const slides = TUTORIAL_FLOW_SLIDES[key];
  return Array.isArray(slides) && slides.length ? slides : ONBOARDING_TUTORIAL_SLIDES;
}

function getActiveTutorialSlides() {
  return getTutorialSlidesForFlow(activeTutorialFlow);
}

function getLocalizedTutorialText(value, lang) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return '';
  const key = (lang || 'jp').toLowerCase() === 'en' ? 'en' : 'jp';
  return String(value[key] || value.jp || value.en || '');
}

function resolveLocalizedTutorialImagePath(imageValue, locale) {
  const use = locale === 'en' ? 'en' : 'jp';
  if (!imageValue) return '';
  if (typeof imageValue === 'string') {
    const raw = String(imageValue || '').trim();
    if (!raw) return '';
    const swapped = raw.replace(/_(jp|en)(\.[a-z0-9]+)$/i, `_${use}$2`);
    return swapped || raw;
  }
  if (typeof imageValue === 'object') {
    const picked = imageValue[use] || imageValue.jp || imageValue.en || '';
    return resolveLocalizedTutorialImagePath(picked, use);
  }
  return '';
}

function createTutorialNumberedImagePath(path, slideNumber, locale) {
  const raw = String(path || '').trim();
  if (!raw) return '';
  const use = locale === 'en' ? 'en' : 'jp';
  const n = Math.max(1, Math.floor(Number(slideNumber) || 1));
  // Only treat as "already numbered" when path already has both flow + page numbers
  // (e.g. help-4-5_jp.png). A single number (help-5_jp.png) still needs page suffix.
  if (new RegExp(`-\\d+-\\d+_${use}(\\.[a-z0-9]+)$`, 'i').test(raw)) return raw;
  const numbered = raw.replace(/_(jp|en)(\.[a-z0-9]+)$/i, `-${n}_${use}$2`);
  if (numbered !== raw) return numbered;
  return raw.replace(/(\.[a-z0-9]+)$/i, `-${n}$1`);
}

function createTutorialFlowPageImagePath(flowKey, slideNumber, locale) {
  const flow = String(flowKey || DEFAULT_TUTORIAL_FLOW)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '') || DEFAULT_TUTORIAL_FLOW;
  const use = locale === 'en' ? 'en' : 'jp';
  const n = Math.max(1, Math.floor(Number(slideNumber) || 1));
  return `assets/images/help/help-${flow}-${n}_${use}.png`;
}

const TUTORIAL_FLOW_IMAGE_PREFIXES = {
  onboarding: ['1'],
  'combo-table': ['3'],
  'combo-details': ['3'],
  'input-section': ['2'],
  'advanced-search': ['4'],
  'import-flow': ['5'],
  'import-target': ['5'],
  'xlsx-map': ['5'],
  'export-flow': ['9'],
  'automation-2': ['10'],
  'hotkey-customize': ['7'],
  'frame-view': ['6'],
  'import-notation': ['8'],
  'notation-manager': ['8'],
  'combo-tree': ['3'],
};

function getTutorialFlowImageKeys(flowKey) {
  const normalized = normalizeTutorialFlowKey(flowKey);
  const keys = [];
  if (/-flow$/i.test(normalized)) {
    // Prefer compact flow names so import/export can use separate prefixes.
    keys.push(normalized.replace(/-flow$/i, ''));
  }
  keys.push(normalized);
  return Array.from(new Set(keys.filter(Boolean)));
}

function getTutorialNumericImagePrefixes(flowKey, slide) {
  const normalized = normalizeTutorialFlowKey(flowKey);
  const prefixes = [];
  const mapped = TUTORIAL_FLOW_IMAGE_PREFIXES[normalized];
  if (Array.isArray(mapped) && mapped.length) prefixes.push(...mapped);
  const imageValue = resolveLocalizedTutorialImagePath(slide && slide.image, 'jp');
  const m = String(imageValue || '').match(/help-(\d+)(?:-\d+)?_(?:jp|en)\.[a-z0-9]+$/i);
  if (m && m[1]) prefixes.push(m[1]);
  return Array.from(new Set(prefixes.filter(Boolean)));
}

function getTutorialImageCandidates(flowKey, slide, locale, slideIdx) {
  const use = locale === 'en' ? 'en' : 'jp';
  const alt = use === 'en' ? 'jp' : 'en';
  const basePrimary = resolveLocalizedTutorialImagePath(slide && slide.image, use);
  const baseAlt = resolveLocalizedTutorialImagePath(slide && slide.image, alt);
  const imageNumber = Number.isFinite(Number(slide && slide.imageIndex))
    ? Math.max(1, Math.floor(Number(slide.imageIndex)))
    : (Math.max(0, Number(slideIdx) || 0) + 1);
  const prefixes = getTutorialNumericImagePrefixes(flowKey, slide);
  const prefixedPrimary = prefixes.map((prefix) => `assets/images/help/help-${prefix}-${imageNumber}_${use}.png`);
  const prefixedAlt = prefixes.map((prefix) => `assets/images/help/help-${prefix}-${imageNumber}_${alt}.png`);
  const prefixedPrimaryBase = prefixes.map((prefix) => `assets/images/help/help-${prefix}_${use}.png`);
  const prefixedAltBase = prefixes.map((prefix) => `assets/images/help/help-${prefix}_${alt}.png`);
  const flowKeys = getTutorialFlowImageKeys(flowKey);
  const flowPrimary = flowKeys.map((key) => createTutorialFlowPageImagePath(key, imageNumber, use));
  const flowAlt = flowKeys.map((key) => createTutorialFlowPageImagePath(key, imageNumber, alt));
  const candidates = [
    createTutorialNumberedImagePath(basePrimary, imageNumber, use),
    basePrimary,
    ...prefixedPrimary,
    ...prefixedPrimaryBase,
    ...flowPrimary,
    createTutorialNumberedImagePath(baseAlt, imageNumber, alt),
    baseAlt,
    ...prefixedAlt,
    ...prefixedAltBase,
    ...flowAlt,
  ].filter(Boolean);
  return Array.from(new Set(candidates));
}

function applyTutorialImageWithFallback(imgEl, candidates, altText) {
  if (!imgEl) return;
  const paths = Array.isArray(candidates) ? candidates.filter(Boolean) : [];
  if (!paths.length) {
    imgEl.removeAttribute('src');
    imgEl.alt = altText || '';
    return;
  }
  let cursor = 0;
  const tryLoad = () => {
    if (cursor >= paths.length) {
      imgEl.removeAttribute('src');
      return;
    }
    imgEl.src = paths[cursor];
  };
  imgEl.onerror = () => {
    cursor += 1;
    tryLoad();
  };
  imgEl.onload = null;
  imgEl.alt = altText || '';
  tryLoad();
}

function renderTutorialSlide(lang) {
  const overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  const active = ((lang || getCurrentLang() || 'jp').toLowerCase() === 'en') ? 'en' : 'jp';
  const slides = getActiveTutorialSlides();
  const safeIndex = Math.max(0, Math.min(slides.length - 1, tutorialSlideIndex));
  tutorialSlideIndex = safeIndex;
  const slide = slides[safeIndex] || null;
  const titleEl = document.getElementById('tutorialTitle');
  const textEl = document.getElementById('tutorialText');
  const stepEl = document.getElementById('tutorialStep');
  const imgEl = document.getElementById('tutorialImage');
  const prevBtn = document.getElementById('tutorialPrev');
  const nextBtn = document.getElementById('tutorialNext');
  const helpBtn = document.getElementById('tutorialHelp');
  const doneBtn = document.getElementById('tutorialDone');
  if (titleEl) {
    const fallback = translateKey('tutorial.title', active) || 'Quick Tutorial';
    const title = slide
      ? (translateKey(slide.titleKey, active) || getLocalizedTutorialText(slide.title, active) || fallback)
      : fallback;
    titleEl.textContent = title;
  }
  if (textEl) {
    const text = slide
      ? (translateKey(slide.textKey, active) || getLocalizedTutorialText(slide.text, active) || '')
      : '';
    textEl.textContent = text;
  }
  if (stepEl) {
    const total = Math.max(1, slides.length);
    stepEl.textContent = `${safeIndex + 1} / ${total}`;
  }
  if (imgEl) {
    if (slide && slide.image) {
      const altTitle = translateKey(slide.titleKey, active) || `Tutorial ${safeIndex + 1}`;
      const candidates = getTutorialImageCandidates(activeTutorialFlow, slide, active, safeIndex);
      applyTutorialImageWithFallback(imgEl, candidates, altTitle);
    } else {
      imgEl.removeAttribute('src');
      imgEl.alt = '';
    }
  }
  if (prevBtn) prevBtn.disabled = safeIndex <= 0;
  if (nextBtn) nextBtn.disabled = safeIndex >= slides.length - 1;
  if (helpBtn) helpBtn.textContent = translateKey('tutorial.help', active) || 'Help';
  if (doneBtn) doneBtn.textContent = translateKey('tutorial.close', active) || 'Close';
}

function openTutorialOverlay(options = 0) {
  const overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  let flow = DEFAULT_TUTORIAL_FLOW;
  let startIndex = 0;
  if (typeof options === 'number') {
    startIndex = options;
  } else if (options && typeof options === 'object') {
    flow = options.flow || DEFAULT_TUTORIAL_FLOW;
    startIndex = options.startIndex != null ? options.startIndex : 0;
  }
  activeTutorialFlow = normalizeTutorialFlowKey(flow);
  const slides = getActiveTutorialSlides();
  tutorialSlideIndex = Math.max(0, Math.min(slides.length - 1, Number(startIndex) || 0));
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');
  renderTutorialSlide(getCurrentLang());
}
window.openTutorialOverlay = openTutorialOverlay;

function closeTutorialOverlay() {
  const overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  let tutorialSeen = false;
  try {
    tutorialSeen = localStorage.getItem(TUTORIAL_FIRST_RUN_KEY) === '1';
  } catch { }
  if (!tutorialSeen) {
    try {
      localStorage.setItem(TUTORIAL_FIRST_RUN_KEY, '1');
    } catch { }
    maybeShowWelcomePopup().catch(() => { /* no-op */ });
  }
}

function initTutorialOverlay() {
  const overlay = document.getElementById('tutorialOverlay');
  if (!overlay) return;
  if (overlay.dataset.bound !== '1') {
    overlay.dataset.bound = '1';
    const doneBtn = document.getElementById('tutorialDone');
    const helpBtn = document.getElementById('tutorialHelp');
    const prevBtn = document.getElementById('tutorialPrev');
    const nextBtn = document.getElementById('tutorialNext');
    doneBtn?.addEventListener('click', closeTutorialOverlay);
    helpBtn?.addEventListener('click', () => {
      closeTutorialOverlay();
      if (typeof window.setMainView === 'function') {
        window.setMainView('help');
      }
    });
    prevBtn?.addEventListener('click', () => {
      tutorialSlideIndex = Math.max(0, tutorialSlideIndex - 1);
      renderTutorialSlide(getCurrentLang());
    });
    nextBtn?.addEventListener('click', () => {
      const slides = getActiveTutorialSlides();
      tutorialSlideIndex = Math.min(slides.length - 1, tutorialSlideIndex + 1);
      renderTutorialSlide(getCurrentLang());
    });
    document.addEventListener('click', (ev) => {
      const target = ev.target && ev.target.closest ? ev.target.closest('[data-tutorial-flow]') : null;
      if (!target) return;
      ev.preventDefault();
      const flow = target.getAttribute('data-tutorial-flow') || DEFAULT_TUTORIAL_FLOW;
      const parsedStart = Number.parseInt(target.getAttribute('data-tutorial-start') || '0', 10);
      openTutorialOverlay({
        flow,
        startIndex: Number.isFinite(parsedStart) ? parsedStart : 0,
      });
    });
    overlay.querySelector('.modal-backdrop')?.addEventListener('click', closeTutorialOverlay);
    window.addEventListener('keydown', (ev) => {
      if (overlay.classList.contains('hidden')) return;
      if (ev.key === 'Escape') {
        closeTutorialOverlay();
        return;
      }
      if (ev.key === 'ArrowLeft') {
        tutorialSlideIndex = Math.max(0, tutorialSlideIndex - 1);
        renderTutorialSlide(getCurrentLang());
        return;
      }
      if (ev.key === 'ArrowRight') {
        const slides = getActiveTutorialSlides();
        tutorialSlideIndex = Math.min(slides.length - 1, tutorialSlideIndex + 1);
        renderTutorialSlide(getCurrentLang());
      }
    });
  }
  let seen = false;
  try {
    seen = localStorage.getItem(TUTORIAL_FIRST_RUN_KEY) === '1';
  } catch { }
  if (!seen) {
    openTutorialOverlay(0);
  }
  window.refreshTutorialOverlayLanguage = () => {
    if (!overlay.classList.contains('hidden')) {
      renderTutorialSlide(getCurrentLang());
    }
  };
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

  const persistedView = loadPersistedFrameViewState();
  if (persistedView && persistedView.version) {
    frameDataViewState.selectedVersion = persistedView.version;
    if (persistedView.compareVersion) {
      frameDataViewState.compareVersion = persistedView.compareVersion;
      frameDataViewState.compareEnabled = !!persistedView.compareEnabled
        && frameDataViewState.compareVersion !== frameDataViewState.selectedVersion;
    }
  }
  const current = {
    char: persistedView && persistedView.char ? persistedView.char : '',
    control: normalizeFrameControlType(persistedView && persistedView.control),
  };
  const persistFrameViewState = () => {
    savePersistedFrameViewState({
      char: current.char,
      control: current.control,
      version: frameDataViewState.selectedVersion,
      compareVersion: frameDataViewState.compareVersion,
      compareEnabled: frameDataViewState.compareEnabled,
    });
  };
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
      persistFrameViewState();
      frameMovesCache.clear();
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
      persistFrameViewState();
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
      persistFrameViewState();
      frameMovesCache.clear();
      refreshFrameData();
    });
  }

  if (compareClearBtn && !compareClearBtn.dataset.bound) {
    compareClearBtn.dataset.bound = '1';
    compareClearBtn.addEventListener('click', () => {
      frameDataViewState.compareEnabled = false;
      setFrameComparePanelVisible(false);
      persistFrameViewState();
      frameMovesCache.clear();
      refreshFrameData();
    });
  }

  const setControl = (type) => {
    current.control = type;
    if (classic) classic.classList.toggle('active', type === 'classic');
    if (modern) modern.classList.toggle('active', type === 'modern');
    if (classic) classic.setAttribute('aria-selected', String(type === 'classic'));
    if (modern) modern.setAttribute('aria-selected', String(type === 'modern'));
    persistFrameViewState();
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
    persistFrameViewState();
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
    const { jp, en } = resolveCharacterNamesBySlug(current.char);
    if (portrait) {
      portrait.src = `assets/images/characters/${current.char}.png`;
      portrait.style.display = '';
      portrait.alt = `${en || current.char} portrait`;
    }
    if (bg) bg.style.backgroundImage = `url('assets/images/backgrounds/bg_${current.char}.jpg')`;
    if (nameJP) nameJP.textContent = formatDisplayName(current.char, jp, 'primary', getCurrentLang());
    if (nameEN) nameEN.textContent = formatDisplayName(current.char, en, 'english', getCurrentLang());
    applyCharacterArtPreset(current.char);
    // Keep Combo List unselected on load; sync only when user explicitly picks a character.
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
  setControl(current.control);
  persistFrameViewState();
  renderFrameDataVersion(frameDataViewState.selectedVersion);
  if (comparePanel && !comparePanel.classList.contains('hidden')) {
    setFrameComparePanelVisible(true);
  }
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
  const close = () => {
    overlay.classList.add('hidden');
    window.setTimeout(() => {
      maybeShowUpdateTutorials();
    }, 0);
  };
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
      const activeView = String(document.body.getAttribute('data-view') || '').toLowerCase();
      if (activeView === 'frame') {
        if (window.switchCharacter) window.switchCharacter(slug, jp, en);
      } else if (activeView === 'combos' || activeView === 'tree') {
        if (window.switchComboCharacter) window.switchComboCharacter(slug, jp, en);
      } else {
        if (window.switchCharacter) window.switchCharacter(slug, jp, en);
        if (window.switchComboCharacter) window.switchComboCharacter(slug, jp, en);
      }
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
  if (!html) return html;
  const hasSpanMarkup = html.indexOf('<span') !== -1;
  const hasModeMarkup = html.indexOf('frame_classic') !== -1 || html.indexOf('frame_modern') !== -1;
  if (!hasSpanMarkup && !hasModeMarkup) return html;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // Prefer explicit mode blocks when available.
  const classicBlocks = Array.from(wrapper.querySelectorAll('p[class*="frame_classic"], .frame_classic___gpLR'));
  const modernBlocks = Array.from(wrapper.querySelectorAll('p[class*="frame_modern"], .frame_modern__smvDf'));
  if (classicBlocks.length || modernBlocks.length) {
    if (control === 'modern' && classicBlocks.length) {
      classicBlocks.forEach((node) => node.remove());
      const modernHtml = wrapper.innerHTML.trim();
      if (modernHtml) return modernHtml;
    }
    if (control !== 'modern' && modernBlocks.length) {
      modernBlocks.forEach((node) => node.remove());
      const classicHtml = wrapper.innerHTML.trim();
      if (classicHtml) return classicHtml;
    }
  }

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
  const isEditableDragTarget = (target) => {
    if (!target || !target.closest) return false;
    return !!target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""], .cmd-input');
  };
  const onDown = (pageX) => { isDown = true; el.classList.add('grabbing'); startX = pageX - el.offsetLeft; scrollLeft = el.scrollLeft; };
  const onMove = (pageX) => { if (!isDown) return; const x = pageX - el.offsetLeft; const walk = x - startX; el.scrollLeft = scrollLeft - walk; updateRightShadow(el); };
  const onUp = () => { isDown = false; el.classList.remove('grabbing'); };
  el.addEventListener('mousedown', (e) => {
    // Keep side buttons available for app/browser back-forward navigation.
    if (e.button !== 0) return;
    if (isEditableDragTarget(e.target)) return;
    onDown(e.pageX);
  });
  el.addEventListener('mousemove', (e) => onMove(e.pageX));
  el.addEventListener('mouseleave', onUp);
  el.addEventListener('mouseup', onUp);
  el.addEventListener('touchstart', (e) => {
    if (isEditableDragTarget(e.target)) return;
    if (e.touches && e.touches[0]) onDown(e.touches[0].pageX);
  }, { passive: true });
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
window.getSelectThumbForSlug = getSelectThumbForSlug;

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
  const MAIN_VIEWS = new Set(['combos', 'frame', 'tree', 'help', 'info']);
  const normalizeAppView = (value) => {
    const key = String(value || '').trim().toLowerCase();
    return MAIN_VIEWS.has(key) ? key : 'combos';
  };
  let activeView = '';
  const viewHistory = [];
  let viewHistoryIndex = -1;

  if (!tabs.length || !views.length) return;

  const recordViewHistory = (viewKey, options = {}) => {
    if (options.skipHistory) return;
    if (viewHistoryIndex < 0) {
      viewHistory.push(viewKey);
      viewHistoryIndex = 0;
      return;
    }
    if (options.replaceHistory) {
      viewHistory[viewHistoryIndex] = viewKey;
      return;
    }
    if (viewHistory[viewHistoryIndex] === viewKey) return;
    if (viewHistoryIndex < viewHistory.length - 1) {
      viewHistory.splice(viewHistoryIndex + 1);
    }
    viewHistory.push(viewKey);
    viewHistoryIndex = viewHistory.length - 1;
  };

  const setView = (viewKey, options = {}) => {
    const nextView = normalizeAppView(viewKey);
    if (activeView === nextView && !options.force) return;

    views.forEach((view) => {
      const isActive = view.dataset.view === nextView;
      view.classList.toggle('active', isActive);
      view.setAttribute('aria-hidden', String(!isActive));
    });
    tabs.forEach((tab) => {
      const isActive = tab.dataset.viewTab === nextView;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
    activeView = nextView;
    if (helpBtn) helpBtn.classList.toggle('active', nextView === 'help');
    if (infoBtn) infoBtn.classList.toggle('active', nextView === 'info');
    body.setAttribute('data-view', nextView);
    if (nextView === 'frame' || nextView === 'combos' || nextView === 'tree') {
      savePersistedMainView(nextView);
    }
    if (nextView === 'help') {
      applyHelpTextLanguage(getCurrentLang());
    }
    if (headerTitle) {
      const titleKey = nextView === 'combos'
        ? 'nav.combo'
        : (nextView === 'tree'
          ? 'nav.tree'
          : (nextView === 'help'
            ? 'help.button'
            : (nextView === 'info' ? 'info.button' : 'nav.frame')));
      headerTitle.dataset.i18n = titleKey;
      headerTitle.textContent = translateKey(headerTitle.dataset.i18n, getCurrentLang());
    }
    recordViewHistory(nextView, options);
    updateFrameScrollHeight();
  };

  // Expose before tab/history bindings so handlers always call the current
  // window.setMainView (combos.js may wrap it for tree lifecycle).
  window.setMainView = setView;

  const navigateViewHistory = (direction) => {
    const step = Number(direction) < 0 ? -1 : 1;
    const nextIndex = viewHistoryIndex + step;
    if (nextIndex < 0 || nextIndex >= viewHistory.length) return false;
    viewHistoryIndex = nextIndex;
    window.setMainView(viewHistory[nextIndex], { skipHistory: true, force: true });
    return true;
  };

  let lastMouseNavAt = -1;
  let lastMouseNavButton = -1;
  const handleMouseBackForward = (ev) => {
    if (!ev || ev.defaultPrevented) return;
    if (ev.button !== 3 && ev.button !== 4) return;
    const stamp = Number(ev.timeStamp) || 0;
    if (ev.button === lastMouseNavButton && Math.abs(stamp - lastMouseNavAt) < 24) return;
    const handled = ev.button === 3
      ? navigateViewHistory(-1)
      : navigateViewHistory(1);
    if (!handled) return;
    lastMouseNavAt = stamp;
    lastMouseNavButton = ev.button;
    ev.preventDefault();
    ev.stopPropagation();
  };
  window.addEventListener('mouseup', handleMouseBackForward, true);
  window.addEventListener('auxclick', handleMouseBackForward, true);
  window.addEventListener('keydown', (ev) => {
    if (!ev || ev.defaultPrevented) return;
    if (ev.key !== 'BrowserBack' && ev.key !== 'BrowserForward') return;
    const handled = ev.key === 'BrowserBack'
      ? navigateViewHistory(-1)
      : navigateViewHistory(1);
    if (!handled) return;
    ev.preventDefault();
    ev.stopPropagation();
  }, true);

  const onKey = (ev, viewKey) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      window.setMainView(viewKey);
    }
  };

  tabs.forEach((tab) => {
    const viewKey = tab.dataset.viewTab;
    tab.addEventListener('click', () => window.setMainView(viewKey));
    tab.addEventListener('keydown', (ev) => onKey(ev, viewKey));
  });

  window.navigateMainViewHistory = navigateViewHistory;

  // Restore last primary view (Frame Data / Combo List)
  window.setMainView(loadPersistedMainView(), { replaceHistory: true, force: true });
}

window.getCurrentFrameDataVersion = () => currentFrameDataVersion || DEFAULT_FRAME_DATA_VERSION;
window.getLabMonsterAppVersion = () => APP_VERSION;
function renderAppVersionBadge() {
  const badge = document.getElementById('footerAppVersionText');
  if (!badge) return;
  badge.textContent = `Tool Ver: ${APP_VERSION}`;
}
