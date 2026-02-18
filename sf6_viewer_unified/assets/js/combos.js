// Combo List UI (rebuilt)
(() => {
  const STORAGE_KEY_BASE = 'sf6_combo_table_v3';
  const LEGACY_STORAGE_KEY = 'sf6_combo_table_v2';
  const UI_PREFS_KEY = 'sf6_combo_ui_prefs_v1';
  const KEYMAP_KEY = 'sf6_combo_keymap_v1';
  const SHORTCUT_KEY = 'sf6_combo_shortcuts_v1';
  const XLSX_IMPORT_MAPS_KEY = 'lm_xlsx_import_maps_v1';
  const COMBO_CHARACTER_KEY = 'lm_combo_selected_char_v1';
  const COMBO_CONTROL_MODE_KEY = 'lm_combo_control_mode_v1';
  const UNSELECTED_STORAGE_SLUG = '__unselected__';
  const STORAGE_DRAFT_KEY_BASE = 'sf6_combo_table_draft_v1';
  const STORAGE_BACKUP_KEY_BASE = 'sf6_combo_table_backup_short_v1';
  const STORAGE_BACKUP_LONG_KEY_BASE = 'sf6_combo_table_backup_long_v1';
  const STORAGE_BACKUP_IMPORT_KEY_BASE = 'sf6_combo_table_backup_import_v1';
  const STORAGE_META_KEY_BASE = 'sf6_combo_table_meta_v1';
  const AUTOSAVE_DELAY_MS = 600;
  const SHORT_BACKUP_INTERVAL_MS = 90 * 1000;
  const LONG_BACKUP_INTERVAL_MS = 10 * 60 * 1000;
  const XLSX_MAP_BASIC_FIELDS = [
    'command',
    'combo_notes',
    'control_mode',
    'position',
    'distance',
    'damage_normal',
    'drive_req',
    'drive_delta',
    'sa_req',
    'sa_delta',
    'frame_adv',
  ];

  const DEFAULT_KEYMAP = {
    '4(タメ)': 'q',
    '2(タメ)': 'w',
    '360': 'e',
    LP: 'y',
    MP: 'u',
    HP: 'i',
    P: 'o',
    ' 投げ ': 't',
    '-': '-',
    LK: 'h',
    MK: 'j',
    HK: 'k',
    K: 'l',
    ' Any ': 'a',
    ' DP ': 'P',
    ' DI ': 'I',
    ' DR ': 'R',
    ' CR ': 'C',
    ' Jump ': 'J',
    ' Hold ': 'H',
    ' or ': 'O',
    ' > ': '>',
    ' >> ': '<',
    ' [] ': 'D',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
  };
  const buildModernMap = (classicMap = {}) => {
    const map = { ...classicMap };
    if (classicMap.LK) map.SP = classicMap.LK;
    if (classicMap.MK) map.Auto = classicMap.MK;
    ['P', 'K', 'HK', 'LK', 'MK', 'L', 'M', 'H'].forEach((key) => {
      delete map[key];
    });
    return map;
  };

  const DEFAULT_MODERN_KEYMAP = buildModernMap(DEFAULT_KEYMAP);
  const CLASSIC_ONLY_TOKEN_REGEX = /(?:\b(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)\b|\d+(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)\b)/i;
  const MODERN_ONLY_TOKEN_REGEX = /(?:\b(?:SP|Auto|[LMH]{1,3})\b|\d+(?:SP|Auto|[LMH]{1,3})\b)/i;

  const DEFAULT_PS5_KEYMAP = {
    LP: 'Square',
    MP: 'Triangle',
    HP: 'R1',
    P: 'L2+R1',
    LK: 'Cross',
    MK: 'Circle',
    HK: 'R2',
    K: 'L2+R2',
    ' 投げ ': 'L2+R3',
    '7': '↑+←',
    '8': '↑',
    '9': '↑+→',
    '4': '←',
    '5': 'L3',
    '6': '→',
    '1': '↓+←',
    '2': '↓',
    '3': '↓+→',
    '4(タメ)': 'L2+←',
    '2(タメ)': 'L2+↓',
    '360': 'L2+L3',
    ' Any ': 'R3',
    ' DP ': 'L2+Square',
    ' DI ': 'L2+Triangle',
    ' DR ': 'L2+Cross',
    ' CR ': 'L2+Circle',
    ' Jump ': 'L2+↑',
    ' Hold ': 'L2+L1',
    ' or ': 'Share',
    ' > ': 'Touchpad',
    ' >> ': 'L2+Touchpad',
    ' [] ': 'L2+Share',
    '-': 'Options',
  };

  const DEFAULT_XBOX_KEYMAP = {
    LP: 'X',
    MP: 'Y',
    HP: 'RB',
    P: 'LT+RB',
    LK: 'A',
    MK: 'B',
    HK: 'RT',
    K: 'LT+RT',
    ' 投げ ': 'LT+RS',
    '7': '↑+←',
    '8': '↑',
    '9': '↑+→',
    '4': '←',
    '5': 'LS',
    '6': '→',
    '1': '↓+←',
    '2': '↓',
    '3': '↓+→',
    '4(タメ)': 'LT+←',
    '2(タメ)': 'LT+↓',
    '360': 'LT+LS',
    ' Any ': 'RS',
    ' DP ': 'LT+X',
    ' DI ': 'LT+Y',
    ' DR ': 'LT+A',
    ' CR ': 'LT+B',
    ' Jump ': 'LT+↑',
    ' Hold ': 'LT+LB',
    ' or ': 'View',
    ' > ': 'Menu',
    ' >> ': 'LT+Menu',
    ' [] ': 'LT+View',
    '-': 'Menu',
  };

  const DEFAULT_DINPUT_KEYMAP = {
    LP: 'B3',
    MP: 'B4',
    HP: 'B5',
    P: 'B6+B5',
    LK: 'B1',
    MK: 'B2',
    HK: 'B7',
    K: 'B6+B7',
    ' 投げ ': 'B12',
    '7': '↑+←',
    '8': '↑',
    '9': '↑+→',
    '4': '←',
    '5': 'B8',
    '6': '→',
    '1': '↓+←',
    '2': '↓',
    '3': '↓+→',
    '4(タメ)': 'B6+←',
    '2(タメ)': 'B6+↓',
    '360': 'B6+B8',
    ' Any ': 'B11',
    ' DP ': 'B6+B1',
    ' DI ': 'B6+B4',
    ' DR ': 'B6+B2',
    ' CR ': 'B6+B3',
    ' Jump ': 'B6+↑',
    ' Hold ': 'B6+B12',
    ' or ': 'B13',
    ' > ': 'B9',
    ' >> ': 'B6+B9',
    ' [] ': 'B6+B9',
    '-': 'B10',
  };

  const DEFAULT_KEYMAPS = {
    keyboard: { classic: { ...DEFAULT_KEYMAP }, modern: buildModernMap(DEFAULT_KEYMAP) },
    ps5: { classic: { ...DEFAULT_PS5_KEYMAP }, modern: buildModernMap(DEFAULT_PS5_KEYMAP) },
    xbox: { classic: { ...DEFAULT_XBOX_KEYMAP }, modern: buildModernMap(DEFAULT_XBOX_KEYMAP) },
    dinput: { classic: { ...DEFAULT_DINPUT_KEYMAP }, modern: buildModernMap(DEFAULT_DINPUT_KEYMAP) },
  };

  const COMBO_I18N = {
    jp: {
      rows: {
        frame_meter: 'フレームメーター',
        command: 'コマンド',
        buttons: 'ボタン',
        notes: '備考',
      },
      presets: {
        full: '全て',
        basic: '基本',
        simple: '簡易',
        custom: 'カスタム',
      },
      columns: {
        label: '列:',
      },
      filter: {
        field_search: 'フィールド検索',
        keyword: 'キーワード',
        field_spec: '指定検索:',
        command_first_hit: '初段',
        command_any: 'Any',
        range_title: '数値範囲',
        control: '操作方法',
        distance: '距離',
        position: '位置',
        counter: 'カウンター',
        bo: 'BO/スタン',
        vs: '対応キャラ',
        interrupt: '割込',
        safe_jump: '詐欺飛び',
        special: '特殊条件',
        version: 'Ver.',
        oki: '重ね',
      },
      ui: {
        quick_input: 'クイック入力',
        input: '入力',
        customize: '設定変更',
        create: '新規',
        duplicate: '複製',
        delete: '削除',
        dedupe: '重複削除',
        restore: '復元',
        rows_show_all: '全表示',
        rows_hide_all: '全非表示',
        notation_dict: '表記辞書',
        notation_title: '表記辞書（インポート用）',
        notation_close: '閉じる',
        notation_desc: 'インポート/貼り付け時の表記ゆれを、LMトークンに自動変換します。',
        notation_hint_1: '例: 「弱昇竜」→「623LP」',
        notation_hint_2: '標準辞書は編集不可。必要な別名だけユーザー辞書に追加してください。',
        notation_hint_3: '変換はJSON/XLSXインポート時と、コマンド貼り付け時に自動で実行されます。',
        notation_existing_dict: '既存の辞書',
        notation_normalize_title: '正規化テスト',
        notation_normalize_desc: '入力すると自動で変換結果が更新されます。',
        notation_add: '追加/更新',
        notation_reset: '初期化',
        notation_export: '書き出し',
        notation_import: '読み込み',
        notation_test_preview: 'プレビュー',
        notation_test_original: '入力',
        notation_test_normalized: '正規化結果',
        notation_test_replacements: '置換',
        notation_test_unknown: '未認識',
        notation_table_alias: '別名',
        notation_table_lm: 'コマンド',
        notation_table_display: 'ボタン',
        notation_table_source: '種別',
        notation_table_enabled: '有効',
        notation_table_actions: '操作',
        notation_category_directional: '方向',
        notation_category_attack: '攻撃',
        notation_category_utility: 'ユーティリティ',
        notation_category_frequent: 'よく使うコマンド',
        notation_category_user: 'ユーザー追加',
        notation_source_default: '標準',
        notation_source_user: 'ユーザー',
        notation_action_edit: '編集',
        notation_action_delete: '削除',
        notation_input_alias: '別名 (例: 弱昇竜)',
        notation_input_lm: 'LM表記 (例: 623LP)',
        notation_test_placeholder: 'ここに入力して変換結果を確認 (例: 弱昇竜 > 236LP)',
        xlsx_map_title: 'XLSX列マッピング',
        xlsx_map_desc: 'このシートの列を、読み込み先フィールドに割り当ててください。',
        xlsx_map_header_row: 'ヘッダー行',
        xlsx_map_basic: '基本フィールド',
        xlsx_map_advanced: '詳細フィールド',
        xlsx_map_field: 'フィールド',
        xlsx_map_column: '列',
        xlsx_map_preview: 'プレビュー (先頭5行)',
        xlsx_map_raw_command: 'コマンド(元)',
        xlsx_map_norm_command: 'コマンド(正規化)',
        xlsx_map_summary: '取り込み内容',
        xlsx_map_apply: '取り込み',
        xlsx_map_cancel: 'キャンセル',
        xlsx_map_save_preset: 'このマッピングを保存',
        xlsx_map_none: '(未設定)',
        restore_title: '復元元を選択',
        restore_apply: '復元',
        restore_cancel: 'キャンセル',
        restore_notice: '自動バックアップはローカル保存のみです。重要なデータはEXPORTで保存してください。',
        bottom_open: '開く▲',
        bottom_close: '閉じる▼',
        bottom_open_title: '下部セクションを表示',
        bottom_close_title: '下部セクションを隠す',
        keyboard: 'キーボード',
        ps5: 'PS5',
        xbox: 'Xbox/XInput',
        dinput: 'D-Input',
        keymap_title: '入力設定',
        keymap_save: '保存',
        keymap_cancel: '閉じる',
        keymap_reassigned: 'キー {key} を {from} から {to} に移動しました。',
        multi_apply: '適用',
        multi_clear: 'クリア',
        frame_version_prefix: 'データVer',
        game_version_prefix: 'ゲームVer',
      },
      ui_labels: {
        throw: '投げ',
        target_combo: 'タゲコン等',
        delay: 'ディレイ',
        hold: 'ホールド',
        cancel: 'キャンセル',
        jump: 'ジャンプ',
        parry: 'パリィ',
        impact: 'インパクト',
        drive_rush: 'ドライブ\nラッシュ',
        cancel_rush: 'キャンセル\nラッシュ',
        no_cancel: '未キャンセル',
      },
      values: {
        classic: 'クラシック',
        modern: 'モダン',
        both: '両方',
        semi: '準',
        close: '密着',
        tip: '先端',
        ground: '地上',
        air: '空中',
        wall: '壁',
        reverse_wall: '逆壁',
        near_wall: '壁付近',
        far_wall: '端端',
        stun: 'スタン',
        all_chars: '全キャラ',
        big_only: 'デカキャラのみ',
        no_big: 'デカキャラ以外',
        yes: '可',
        no: '不可',
        other: 'その他',
      },
      header_hints: {
        combo: 'コンボ入力列です。',
        conditions: 'コンボ開始時の条件です。',
        control_mode: 'クラシック / モダンの操作タイプです。',
        distance: '開始距離です。',
        position: '画面位置です。',
        counter: 'カウンターヒット種別です。',
        bo_stun: 'バーンアウト or スタン状態です。',
        drive_req: '必要な開始Dゲージ量です。',
        sa_req: '必要な開始SAゲージ量です。',
        vs_character: '対応キャラ条件です。',
        special: '特定状態・特殊条件です。',
        damage: 'ダメージ関連項目です。',
        damage_jp: 'ジャストパリィ後のダメージです。',
        damage_bo_guard: 'BO中ガードさせた時の削りダメージです。',
        damage_normal: '通常ヒット時のダメージです。',
        damage_counter: 'カウンターヒット時のダメージです。',
        damage_punish: 'パニッシュカウンター時のダメージです。',
        damage_normal_ca: 'CA版通常ヒット時のダメージです。',
        damage_counter_ca: 'CA版カウンターヒット時のダメージです。',
        damage_punish_ca: 'CA版パニッシュカウンター時のダメージです。',
        d_gauge_chip: '相手に与えるDゲージ削り量です。',
        d_guard: 'ガード時のDゲージ削り量です。',
        d_normal: '通常ヒット時のDゲージ削り量です。',
        d_pc: 'パニッシュカウンター時のDゲージ削り量です。',
        d_delta: 'Dゲージの増減量です。',
        d_delta_self: '自分側のDゲージ増減量です。',
        d_delta_opp: '相手側のDゲージ増減量です。',
        d_eff: 'Dゲージ効率です。',
        sa_delta: 'SAゲージの増減量です。',
        sa_delta_self: '自分側のSAゲージ増減量です。',
        sa_delta_opp: '相手側のSAゲージ増減量です。',
        carry: '運び距離（ヒット時）です。',
        end_distance: 'コンボ後の相対距離（ヒット時）です。',
        frame_adv: 'コンボ後フレーム差（ヒット時）です。',
        safe_jump: '詐欺飛び可否です。',
        interrupt: '割込可否です。',
        oki: '重ね可否です。',
      },
      special_conditions: {
        none: '-',
        poison: '毒',
        focus: '集中',
        drunk1: '酔1',
        drunk2: '酔2',
        drunk3: '酔3',
        drunk4: '酔4',
        flame1: '焔1',
        flame2: '焔2',
        flame3: '焔3',
        flame4: '焔4',
        flame5: '焔5',
        mine: 'マイン',
        sa1: 'SA1時',
        sa2: 'SA2時',
        doll1: '人形1',
        doll2: '人形2',
        doll3: '人形3',
        wind1: '風1',
        wind2: '風2',
        wind3: '風3',
        spray1: 'スプレー1',
        spray2: 'スプレー2',
        spray3: 'スプレー3',
      },
      versionLabel: 'Ver.',
      sample_notes: '基本コンボ',
      restore_sources: {
        import: 'インポート前',
        short: '直近',
        long: '長期',
        draft: '下書き',
      },
      messages: {
        exporting: '書き出し中...',
        export_html_complete: 'HTML書き出し完了。',
        export_html_failed: 'HTML書き出しに失敗しました。',
        export_xlsx_complete: 'XLSX書き出し完了。',
        export_xlsx_failed: 'XLSX書き出しに失敗しました。',
        export_json_complete: 'JSON書き出し完了。',
        export_json_failed: 'JSON書き出しに失敗しました。',
        export_failed: '書き出しに失敗しました。',
        export_jszip_missing: 'JSZipが読み込まれていません。',
        export_character_missing: 'キャラ情報が見つかりません。',
        export_no_combos: '書き出し対象のコンボがありません。',
        export_exceljs_missing: 'ExcelJSが読み込まれていません。',
        no_empty_rows: '空き行がありません。',
        dedupe_none: '重複は見つかりませんでした。',
        dedupe_confirm: '重複が{count}件見つかりました。削除しますか？',
        restore_no_backup: '復元できるバックアップがありません。',
        restore_confirm: '{source}バックアップから復元しますか？',
        restore_choose_prompt: '復元元を番号で選択してください:\\n{options}\\n番号を入力:',
        restore_invalid_choice: '無効な番号です。',
        restore_done: 'バックアップから復元しました。',
        restore_failed: '復元に失敗しました。',
        restore_time_unknown: '時刻不明',
        import_select_character: 'インポートする前にキャラクターを選択してください。',
        import_filetype_only: 'JSONまたはXLSXファイルのみ読み込めます。',
        import_exceljs_missing: 'ExcelJSが読み込めていません。',
        import_sheet_not_found: 'シートが見つかりません。',
        import_unknown_sheets: '未知のシート名があるため中止しました: {sheets}\\nキャラ名と一致するシート名にしてください。',
        import_no_importable: '読み込めるデータがありません。',
        import_xlsx_failed: 'XLSXの読み込みに失敗しました。',
        import_notation_partial: '表記辞書で未認識の語がありました: {items}',
        notation_load_failed: '表記辞書の読み込みに失敗しました。',
        notation_add_failed: 'AliasとLMトークンを入力してください。',
        notation_add_warning: '追加しました（注意: {warnings}）',
        notation_add_done: '追加/更新しました。',
        notation_reset_confirm: 'ユーザー辞書を初期化しますか？',
        notation_import_failed: '辞書JSONの読み込みに失敗しました。',
        notation_import_done: '辞書JSONを読み込みました。',
        notation_delete_confirm: 'このユーザーAliasを削除しますか？',
        xlsx_map_required_command: 'コマンド列の割り当てが必要です。',
        xlsx_map_failed: 'XLSX列マッピングの処理に失敗しました。',
        warn_unknown_notation: '未認識の表記: {value}',
        warn_modern_mismatch: 'モダンでクラシック専用入力が含まれています',
        warn_classic_mismatch: 'クラシックでモダン専用入力が含まれています',
        save_status_saved: '保存済み',
        save_status_unsaved: '● 未保存',
        save_status_recovered: '● 復旧データ',
      },
    },
    en: {
      rows: {
        frame_meter: 'Frame Meter',
        command: 'Command',
        buttons: 'Buttons',
        notes: 'Notes',
      },
      presets: {
        full: 'Full',
        basic: 'Basic',
        simple: 'Simple',
        custom: 'Custom',
      },
      columns: {
        label: 'Cols:',
      },
      filter: {
        field_search: 'Field Search',
        keyword: 'Keyword',
        field_spec: 'Field:',
        command_first_hit: 'First Hit',
        command_any: 'Any',
        range_title: 'Range Search',
        control: 'Control',
        distance: 'Distance',
        position: 'Position',
        counter: 'Counter',
        bo: 'BO/Stun',
        vs: 'Opp Character',
        interrupt: 'Interrupt',
        safe_jump: 'Safe Jump',
        special: 'Special Conditions',
        version: 'Ver.',
        oki: 'Meaty',
      },
      ui: {
        quick_input: 'Quick Input',
        input: 'INPUT',
        customize: 'Customize',
        create: 'Create',
        duplicate: 'Duplicate',
        delete: 'Delete',
        dedupe: 'Dedupe',
        restore: 'Restore',
        rows_show_all: 'Show All',
        rows_hide_all: 'Hide All',
        notation_dict: 'Notation Dict',
        notation_title: 'Notation Dictionary (Import)',
        notation_close: 'Close',
        notation_desc: 'Automatically converts import/paste notation aliases into LM tokens.',
        notation_hint_1: 'Example: "Light DP" -> "623LP"',
        notation_hint_2: 'Default entries are read-only. Add only the aliases you need.',
        notation_hint_3: 'Normalization runs automatically on JSON/XLSX import and command-field paste.',
        notation_existing_dict: 'Existing Dictionary',
        notation_normalize_title: 'Normalization Test',
        notation_normalize_desc: 'Preview updates automatically as you type.',
        notation_add: 'Add/Update',
        notation_reset: 'Reset',
        notation_export: 'Export',
        notation_import: 'Import',
        notation_test_preview: 'Preview',
        notation_test_original: 'Input',
        notation_test_normalized: 'Normalized',
        notation_test_replacements: 'Replacements',
        notation_test_unknown: 'Unknown',
        notation_table_alias: 'Alias',
        notation_table_lm: 'Command',
        notation_table_display: 'Buttons',
        notation_table_source: 'Source',
        notation_table_enabled: 'Enabled',
        notation_table_actions: 'Actions',
        notation_category_directional: 'Directional',
        notation_category_attack: 'Attack',
        notation_category_utility: 'Utility',
        notation_category_frequent: 'Frequent Commands',
        notation_category_user: 'User Custom',
        notation_source_default: 'Default',
        notation_source_user: 'User',
        notation_action_edit: 'Edit',
        notation_action_delete: 'Delete',
        notation_input_alias: 'Alias (e.g. Light DP)',
        notation_input_lm: 'LM Notation (e.g. 623LP)',
        notation_test_placeholder: 'Type here to preview normalization (e.g. Light DP > 236LP)',
        xlsx_map_title: 'XLSX Column Mapping',
        xlsx_map_desc: 'Map this sheet columns to import fields.',
        xlsx_map_header_row: 'Header row',
        xlsx_map_basic: 'Basic fields',
        xlsx_map_advanced: 'Advanced fields',
        xlsx_map_field: 'Field',
        xlsx_map_column: 'Column',
        xlsx_map_preview: 'Preview (first 5 rows)',
        xlsx_map_raw_command: 'Raw command',
        xlsx_map_norm_command: 'Normalized command',
        xlsx_map_summary: 'Imported fields',
        xlsx_map_apply: 'Import',
        xlsx_map_cancel: 'Cancel',
        xlsx_map_save_preset: 'Save this mapping',
        xlsx_map_none: '(none)',
        restore_title: 'Choose Restore Source',
        restore_apply: 'Restore',
        restore_cancel: 'Cancel',
        restore_notice: 'Auto backups are local-only. Use EXPORT for reliable external backups.',
        bottom_open: 'Open ▲',
        bottom_close: 'Close ▼',
        bottom_open_title: 'Show bottom section',
        bottom_close_title: 'Hide bottom section',
        keyboard: 'Keyboard',
        ps5: 'PS5',
        xbox: 'Xbox/XInput',
        dinput: 'D-Input',
        keymap_title: 'Customize Input',
        keymap_save: 'Save',
        keymap_cancel: 'Cancel',
        keymap_reassigned: 'Moved {key} from {from} to {to}.',
        multi_apply: 'Apply',
        multi_clear: 'Clear',
        frame_version_prefix: 'Data Ver',
        game_version_prefix: 'Game Ver',
      },
      ui_labels: {
        throw: 'Throw',
        target_combo: 'Link',
        delay: 'Delay',
        hold: 'Hold',
        cancel: 'Cancel',
        jump: 'Jump',
        parry: 'Parry',
        impact: 'Impact',
        drive_rush: 'Drive\nRush',
        cancel_rush: 'Cancel\nRush',
        no_cancel: 'No\nCancel',
      },
      values: {
        classic: 'Classic',
        modern: 'Modern',
        both: 'Both',
        semi: 'Semi',
        close: 'Close',
        tip: 'Tip',
        ground: 'Ground',
        air: 'Air',
        wall: 'Corner',
        reverse_wall: 'Cornered',
        near_wall: 'Near C',
        far_wall: 'CtoC',
        stun: 'Stun',
        all_chars: 'All',
        big_only: 'Big Only',
        no_big: 'No Big',
        yes: 'Yes',
        no: 'No',
        other: 'Other',
      },
      header_hints: {
        combo: 'Main combo input columns.',
        conditions: 'Conditions required before starting the combo.',
        control_mode: 'Control type: Classic or Modern.',
        distance: 'Starting distance.',
        position: 'Screen position.',
        counter: 'Counter hit type.',
        bo_stun: 'Burnout / Stun state.',
        drive_req: 'Required starting Drive Gauge.',
        sa_req: 'Required starting SA Gauge.',
        vs_character: 'Character-specific condition.',
        special: 'Special state requirement.',
        damage: 'Damage-related values.',
        damage_jp: 'Damage after Just Parry.',
        damage_bo_guard: 'Chip damage while opponent is in Burnout.',
        damage_normal: 'Normal hit damage.',
        damage_counter: 'Counter-hit damage.',
        damage_punish: 'Punish-counter damage.',
        damage_normal_ca: 'Normal hit damage with CA.',
        damage_counter_ca: 'Counter-hit damage with CA.',
        damage_punish_ca: 'Punish-counter damage with CA.',
        d_gauge_chip: 'Drive Gauge damage dealt to opponent.',
        d_guard: 'Drive damage on block.',
        d_normal: 'Drive damage on normal hit.',
        d_pc: 'Drive damage on punish counter.',
        d_delta: 'Drive Gauge gain/loss.',
        d_delta_self: 'Your Drive Gauge gain/loss.',
        d_delta_opp: 'Opponent Drive Gauge gain/loss.',
        d_eff: 'Drive Gauge efficiency.',
        sa_delta: 'SA Gauge gain/loss.',
        sa_delta_self: 'Your SA Gauge gain/loss.',
        sa_delta_opp: 'Opponent SA Gauge gain/loss.',
        carry: 'Carry distance on hit.',
        end_distance: 'Post-combo distance on hit.',
        frame_adv: 'Post-combo frame advantage on hit.',
        safe_jump: 'Safe-jump availability.',
        interrupt: 'Interrupt availability.',
        oki: 'Meaty setup availability.',
      },
      special_conditions: {
        none: '-',
        poison: 'Poison',
        focus: 'Focus',
        drunk1: 'Drink 1',
        drunk2: 'Drink 2',
        drunk3: 'Drink 3',
        drunk4: 'Drink 4',
        flame1: 'Flame 1',
        flame2: 'Flame 2',
        flame3: 'Flame 3',
        flame4: 'Flame 4',
        flame5: 'Flame 5',
        mine: 'Mine',
        sa1: 'SA1 Active',
        sa2: 'SA2 Active',
        doll1: 'Doll 1',
        doll2: 'Doll 2',
        doll3: 'Doll 3',
        wind1: 'Wind 1',
        wind2: 'Wind 2',
        wind3: 'Wind 3',
        spray1: 'Spray 1',
        spray2: 'Spray 2',
        spray3: 'Spray 3',
      },
      versionLabel: 'Ver.',
      sample_notes: 'Basic Combo',
      restore_sources: {
        import: 'Pre-Import',
        short: 'Recent',
        long: 'Long',
        draft: 'Draft',
      },
      messages: {
        exporting: 'Exporting...',
        export_html_complete: 'HTML export complete.',
        export_html_failed: 'HTML export failed.',
        export_xlsx_complete: 'XLSX export complete.',
        export_xlsx_failed: 'XLSX export failed.',
        export_json_complete: 'JSON export complete.',
        export_json_failed: 'JSON export failed.',
        export_failed: 'Export failed.',
        export_jszip_missing: 'JSZip is not loaded.',
        export_character_missing: 'Character data was not found.',
        export_no_combos: 'No combos to export.',
        export_exceljs_missing: 'ExcelJS is not loaded.',
        no_empty_rows: 'No empty rows available.',
        dedupe_none: 'No duplicates were found.',
        dedupe_confirm: '{count} duplicates found. Delete them?',
        restore_no_backup: 'No backup is available to restore.',
        restore_confirm: 'Restore from the {source} backup?',
        restore_choose_prompt: 'Select a restore source by number:\\n{options}\\nEnter number:',
        restore_invalid_choice: 'Invalid selection.',
        restore_done: 'Restored from backup.',
        restore_failed: 'Restore failed.',
        restore_time_unknown: 'Unknown time',
        import_select_character: 'Select a character before importing.',
        import_filetype_only: 'Only JSON or XLSX files are supported.',
        import_exceljs_missing: 'ExcelJS is not loaded.',
        import_sheet_not_found: 'No worksheet was found.',
        import_unknown_sheets: 'Import aborted due to unknown sheet names: {sheets}\\nUse sheet names that match character names.',
        import_no_importable: 'No importable data found.',
        import_xlsx_failed: 'Failed to import XLSX.',
        import_notation_partial: 'Some terms were not recognized by notation dictionary: {items}',
        notation_load_failed: 'Failed to load notation dictionary.',
        notation_add_failed: 'Enter both alias and LM token.',
        notation_add_warning: 'Mapping saved (warning: {warnings})',
        notation_add_done: 'Mapping saved.',
        notation_reset_confirm: 'Reset all user notation mappings?',
        notation_import_failed: 'Failed to import notation JSON.',
        notation_import_done: 'Notation JSON imported.',
        notation_delete_confirm: 'Delete this user alias?',
        xlsx_map_required_command: 'Command column mapping is required.',
        xlsx_map_failed: 'Failed to process XLSX column mapping.',
        warn_unknown_notation: 'Unrecognized notation: {value}',
        warn_modern_mismatch: 'Contains Classic-only tokens while mode is Modern',
        warn_classic_mismatch: 'Contains Modern-only tokens while mode is Classic',
        save_status_saved: 'Saved',
        save_status_unsaved: '● Unsaved',
        save_status_recovered: '● Recovered Draft',
      },
    },
  };

  const UI_LABEL_KEY_MAP = (() => {
    const map = new Map();
    const jpLabels = (COMBO_I18N.jp && COMBO_I18N.jp.ui_labels) || {};
    Object.entries(jpLabels).forEach(([key, jp]) => {
      const normalized = String(jp || '').replace(/\s+/g, '');
      if (normalized) map.set(normalized, key);
      const noBreak = normalized.replace(/\n/g, '');
      if (noBreak) map.set(noBreak, key);
    });
    return map;
  })();

  function translateUiLabel(value, lang) {
    const active = lang || getComboLang();
    const raw = String(value || '');
    if (!raw) return raw;
    const normalized = raw.replace(/\s+/g, '');
    const key = UI_LABEL_KEY_MAP.get(normalized);
    if (!key) return raw;
    return (COMBO_I18N[active] && COMBO_I18N[active].ui_labels && COMBO_I18N[active].ui_labels[key]) || raw;
  }

  const normalizeSpecialConditionLabel = (text) =>
    String(text || '')
      .replace(/\s+/g, '')
      .toLowerCase();

  const SPECIAL_CONDITION_KEY_MAP = (() => {
    const map = new Map();
    const jp = (COMBO_I18N.jp && COMBO_I18N.jp.special_conditions) || {};
    const en = (COMBO_I18N.en && COMBO_I18N.en.special_conditions) || {};
    Object.entries(jp).forEach(([key, label]) => {
      const normalized = normalizeSpecialConditionLabel(label);
      if (normalized) map.set(normalized, key);
    });
    Object.entries(en).forEach(([key, label]) => {
      const normalized = normalizeSpecialConditionLabel(label);
      if (normalized) map.set(normalized, key);
    });
    return map;
  })();

  function translateSpecialConditionToken(token, lang) {
    const active = lang || getComboLang();
    const normalized = normalizeSpecialConditionLabel(token);
    const key = SPECIAL_CONDITION_KEY_MAP.get(normalized);
    if (!key) return token;
    return comboT(`special_conditions.${key}`, active) || token;
  }

  function formatSpecialConditionDisplay(raw, lang) {
    if (!raw) return '';
    const tokens = parseMultiValue(raw);
    if (!tokens.length) return raw;
    return tokens.map((token) => translateSpecialConditionToken(token, lang)).join(', ');
  }

  function getMultiInputRawValue(input) {
    if (!input) return '';
    return input.dataset && input.dataset.rawValue != null ? input.dataset.rawValue : input.value;
  }

  const COMBO_HEADER_ENTRIES = [
    { jp: 'コンボ', en: 'Combo' },
    { jp: '条件', en: 'Conditions' },
    { jp: '操作方法', en: 'Controls' },
    { jp: '距離', en: 'Distance' },
    { jp: '位置', en: 'Position' },
    { jp: 'カウンター', en: 'Counter' },
    { jp: 'BO/スタン', en: 'BO/Stun' },
    { jp: '最小Dゲージ', en: 'Min D Gauge' },
    { jp: '最小SAゲージ', en: 'Min SA Gauge' },
    { jp: '対応キャラ', en: 'Opp Character' },
    { jp: '特殊条件', en: 'Special Conditions' },
    { jp: 'ダメージ', en: 'Damage' },
    { jp: 'ジャスパ後', en: 'After Just Parry' },
    { jp: 'BOガード時', en: 'BO Block' },
    { jp: '通常', en: 'Normal' },
    { jp: 'ガード時', en: 'Blocked' },
    { jp: '通常(CA)', en: 'Normal (CA)' },
    { jp: 'C(CA)', en: 'C (CA)' },
    { jp: 'PC(CA)', en: 'PC (CA)' },
    { jp: 'Dゲージ削り', en: 'D Gauge Damage' },
    { jp: 'Dゲージ増減', en: 'D Gauge Δ' },
    { jp: 'Dゲージ効率', en: 'D Gauge Eff.' },
    { jp: 'SAゲージ増減', en: 'SA Gauge Δ' },
    { jp: '運びヒット時', en: 'Carry<br>on Hit' },
    { jp: 'コンボ後距離ヒット時', en: 'End Dist<br>on Hit' },
    { jp: 'フレーム差ヒット時', en: 'Frame Adv<br>on Hit' },
    { jp: '詐欺飛び', en: 'Safe Jump' },
    { jp: '割込', en: 'Interrupt' },
    { jp: '重ね', en: 'Meaty' },
    { jp: '自分', en: 'Self' },
    { jp: '相手', en: 'Opp' },
    { jp: 'Ver.', en: 'Ver.' },
  ];

  const COMBO_RANGE_LABELS = {
    drive_req: { jp: '開始<br>Dゲージ', en: 'Min D<br>Gauge' },
    sa_req: { jp: '開始<br>SAゲージ', en: 'Min SA<br>Gauge' },
    damage_jp: { jp: 'ジャスパ後<br>ダメージ', en: 'Damage After<br>Just Parry' },
    damage_bo_guard: { jp: 'BO時<br>削りダメージ', en: 'Chip Damage<br>During BO' },
    damage_normal: { jp: '通常ダメージ', en: 'Normal<br>Damage' },
    damage_counter: { jp: 'カウンター時<br>ダメージ', en: 'Counter<br>Damage' },
    damage_punish: { jp: 'パニカン時<br>ダメージ', en: 'Punish Counter<br>Damage' },
    damage_normal_ca: { jp: '通常(CA)<br>ダメージ', en: 'Normal (CA)<br>Damage' },
    damage_counter_ca: { jp: 'C(CA)<br>ダメージ', en: 'C (CA)<br>Damage' },
    damage_punish_ca: { jp: 'PC(CA)<br>ダメージ', en: 'PC (CA)<br>Damage' },
    d_guard: { jp: 'Dゲージ削り<br>ガード時', en: 'Drive Damage<br> on Block' },
    d_normal: { jp: 'Dゲージ削り<br>通常', en: 'Drive Damage<br>Normal' },
    d_pc: { jp: 'Dゲージ削り<br>パニカン時', en: 'Drive Damage<br> on PC' },
    drive_delta: { jp: 'Dゲージ増減<br>自分', en: 'D Gauge Δ<br>Self' },
    drive_delta_opponent: { jp: 'Dゲージ増減<br>相手', en: 'D Gauge Δ<br>Opp' },
    drive_efficiency: { jp: 'Dゲージ効率', en: 'Drive Eff.' },
    sa_delta: { jp: 'SAゲージ増減<br>自分', en: 'SA Δ<br>Self' },
    sa_delta_opponent: { jp: 'SAゲージ増減<br>相手', en: 'SA Δ<br>Opp' },
    carry_distance: { jp: '運び<br>ヒット時', en: 'Carry<br>on Hit' },
    end_distance: { jp: 'コンボ後距離<br>ヒット時', en: 'End Dist<br>on Hit' },
    frame_adv: { jp: 'フレーム差<br>ヒット時', en: 'Frame Adv<br> on Hit' },
  };

  function getRangeLabel(field, lang) {
    const entry = COMBO_RANGE_LABELS[field];
    if (!entry) return null;
    const active = lang || getComboLang();
    return active === 'en' ? entry.en : entry.jp;
  }

  const normalizeComboLabel = (text) =>
    String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, '')
      .trim()
      .toLowerCase();

  // Command text is stored in JP canonical tokens, then localized only for display.
  const COMMAND_CANONICAL_REPLACERS = [
    { jp: '4(タメ)', en: '4(Charge)' },
    { jp: '2(タメ)', en: '2(Charge)' },
    { jp: '投げ', en: 'Throw' },
  ];

  function localizeCommandForDisplay(text, lang) {
    let out = String(text || '');
    const active = lang || getComboLang();
    if (active !== 'en') return out;
    COMMAND_CANONICAL_REPLACERS.forEach((entry) => {
      out = out.split(entry.jp).join(entry.en);
    });
    return out;
  }

  function canonicalizeCommandForStorage(text) {
    let out = String(text || '');
    COMMAND_CANONICAL_REPLACERS.forEach((entry) => {
      if (entry.jp === '投げ') {
        out = out.replace(/\bthrow\b/gi, entry.jp);
      } else {
        out = out.split(entry.en).join(entry.jp);
      }
    });
    return out;
  }

  function getNotationDictApi() {
    return window.LMNotationDict && typeof window.LMNotationDict === 'object'
      ? window.LMNotationDict
      : null;
  }

  async function ensureNotationDictionaryLoaded() {
    const api = getNotationDictApi();
    if (!api || typeof api.ensureNotationDefaultsLoaded !== 'function') {
      return false;
    }
    try {
      await api.ensureNotationDefaultsLoaded();
      return true;
    } catch {
      return false;
    }
  }

  function normalizeCommandWithNotation(rawText, unknownCollector = null) {
    const api = getNotationDictApi();
    let normalized = String(rawText || '');
    let unknown = [];
    if (api && typeof api.normalizeCommandText === 'function') {
      const result = api.normalizeCommandText(normalized);
      if (result && typeof result === 'object') {
        if (typeof result.normalizedText === 'string') normalized = result.normalizedText;
        if (Array.isArray(result.unknown)) unknown = result.unknown.slice();
      }
    }
    if (unknownCollector && unknown.length) {
      unknown.forEach((term) => unknownCollector.add(term));
    }
    return {
      canonical: canonicalizeCommandForStorage(normalized),
      unknown,
    };
  }

  function notifyNotationUnknown(terms) {
    if (!terms || !terms.size) return;
    const list = Array.from(terms).slice(0, 8);
    const suffix = terms.size > list.length ? ' ...' : '';
    showExportToast(comboMsg('import_notation_partial', { items: `${list.join(', ')}${suffix}` }), false, { dim: false });
  }

  const COMBO_HEADER_LOOKUP = (() => {
    const map = new Map();
    COMBO_HEADER_ENTRIES.forEach((entry) => {
      map.set(normalizeComboLabel(entry.jp), entry);
      map.set(normalizeComboLabel(entry.en.replace(/<br\s*\/?>/gi, '')), entry);
    });
    return map;
  })();

  const COMBO_HEADER_HINT_DIRECT = (() => {
    const map = new Map();
    const pairs = [
      ['コンボ', 'combo'],
      ['combo', 'combo'],
      ['条件', 'conditions'],
      ['conditions', 'conditions'],
      ['操作方法', 'control_mode'],
      ['controls', 'control_mode'],
      ['control', 'control_mode'],
      ['距離', 'distance'],
      ['distance', 'distance'],
      ['位置', 'position'],
      ['position', 'position'],
      ['カウンター', 'counter'],
      ['counter', 'counter'],
      ['bo/スタン', 'bo_stun'],
      ['bo/stun', 'bo_stun'],
      ['最小dゲージ', 'drive_req'],
      ['mindgauge', 'drive_req'],
      ['最小saゲージ', 'sa_req'],
      ['minsagauge', 'sa_req'],
      ['対応キャラ', 'vs_character'],
      ['oppcharacter', 'vs_character'],
      ['特殊条件', 'special'],
      ['specialconditions', 'special'],
      ['ダメージ', 'damage'],
      ['damage', 'damage'],
      ['ジャスパ後', 'damage_jp'],
      ['afterjustparry', 'damage_jp'],
      ['boガード時', 'damage_bo_guard'],
      ['boblock', 'damage_bo_guard'],
      ['通常(ca)', 'damage_normal_ca'],
      ['normal(ca)', 'damage_normal_ca'],
      ['c(ca)', 'damage_counter_ca'],
      ['pc(ca)', 'damage_punish_ca'],
      ['dゲージ削り', 'd_gauge_chip'],
      ['dgaugedamage', 'd_gauge_chip'],
      ['ガード時', 'd_guard'],
      ['blocked', 'd_guard'],
      ['dゲージ増減', 'd_delta'],
      ['dgaugeδ', 'd_delta'],
      ['dgaugedelta', 'd_delta'],
      ['dゲージ効率', 'd_eff'],
      ['dgaugeeff.', 'd_eff'],
      ['dgaugeeff', 'd_eff'],
      ['saゲージ増減', 'sa_delta'],
      ['sagaugeδ', 'sa_delta'],
      ['sagaugedelta', 'sa_delta'],
      ['運びヒット時', 'carry'],
      ['carryonhit', 'carry'],
      ['コンボ後距離ヒット時', 'end_distance'],
      ['enddistonhit', 'end_distance'],
      ['フレーム差ヒット時', 'frame_adv'],
      ['frameadvonhit', 'frame_adv'],
      ['詐欺飛び', 'safe_jump'],
      ['safejump', 'safe_jump'],
      ['割込', 'interrupt'],
      ['interrupt', 'interrupt'],
      ['重ね', 'oki'],
      ['meaty', 'oki'],
      ['自分', 'd_delta_self'],
      ['self', 'd_delta_self'],
      ['相手', 'd_delta_opp'],
      ['opp', 'd_delta_opp'],
      ['ver.', 'version'],
      ['ver', 'version'],
    ];
    pairs.forEach(([label, key]) => map.set(normalizeComboLabel(label), key));
    return map;
  })();

  function getComboHeaderHintKey(labelText, groupText) {
    const label = normalizeComboLabel(String(labelText || '').replace(/[▲▼△▽▴▾]/g, ''));
    if (!label) return '';
    const group = normalizeComboLabel(String(groupText || '').replace(/[▲▼△▽▴▾]/g, ''));
    if (label === '通常' || label === 'normal') {
      if (group === 'ダメージ' || group === 'damage') return 'damage_normal';
      if (group === 'dゲージ削り' || group === 'dgaugedamage') return 'd_normal';
    }
    if (label === 'c') return group === 'ダメージ' || group === 'damage' ? 'damage_counter' : '';
    if (label === 'pc') {
      if (group === 'ダメージ' || group === 'damage') return 'damage_punish';
      if (group === 'dゲージ削り' || group === 'dgaugedamage') return 'd_pc';
      return '';
    }
    if (label === '自分' || label === 'self') {
      if (group === 'dゲージ増減' || group === 'dgaugeδ' || group === 'dgaugedelta') return 'd_delta_self';
      if (group === 'saゲージ増減' || group === 'sagaugeδ' || group === 'sagaugedelta') return 'sa_delta_self';
    }
    if (label === '相手' || label === 'opp') {
      if (group === 'dゲージ増減' || group === 'dgaugeδ' || group === 'dgaugedelta') return 'd_delta_opp';
      if (group === 'saゲージ増減' || group === 'sagaugeδ' || group === 'sagaugedelta') return 'sa_delta_opp';
    }
    const direct = COMBO_HEADER_HINT_DIRECT.get(label);
    if (direct === 'd_delta_self' && (group === 'saゲージ増減' || group === 'sagaugeδ' || group === 'sagaugedelta')) return 'sa_delta_self';
    if (direct === 'd_delta_opp' && (group === 'saゲージ増減' || group === 'sagaugeδ' || group === 'sagaugedelta')) return 'sa_delta_opp';
    if (direct === 'version') return '';
    return direct || '';
  }

  function applyComboHeaderTooltips(table, lang) {
    if (!table) return;
    const active = lang || getComboLang();
    const hints = (COMBO_I18N[active] && COMBO_I18N[active].header_hints) || {};
    const thead = table.tHead || table.querySelector('thead');
    if (!thead || !thead.rows.length) return;
    const row1 = thead.rows[0];
    const row2 = thead.rows[1] || null;
    let cellPositions = null;
    if (row1 && row2) {
      const matrix = buildCellMatrixFromRows([row1, row2], { table });
      cellPositions = matrix && matrix.cellPositions ? matrix.cellPositions : null;
    }
    const resolveGroupText = (cell, row) => {
      if (row !== row2 || !row1) return '';
      if (cell.dataset && cell.dataset.baseGroup) return cell.dataset.baseGroup;
      if (!cellPositions) return '';
      const pos = cellPositions.get(cell);
      if (!pos) return '';
      const groupCell = Array.from(row1.cells).find((headCell) => {
        const groupPos = cellPositions.get(headCell);
        if (!groupPos) return false;
        return pos.col >= groupPos.col && pos.col <= groupPos.col + groupPos.colspan - 1;
      });
      return groupCell ? groupCell.textContent : '';
    };
    [row1, row2].filter(Boolean).forEach((row) => {
      Array.from(row.cells).forEach((cell) => {
        const key = getComboHeaderHintKey(cell.textContent || '', resolveGroupText(cell, row));
        const hint = key ? (hints[key] || '') : '';
        if (hint) cell.setAttribute('title', hint);
        else cell.removeAttribute('title');
      });
    });
  }

  function getComboLang() {
    return document.body.getAttribute('data-lang') || 'jp';
  }

  function comboT(path, lang) {
    const active = lang || getComboLang();
    const root = COMBO_I18N[active] || COMBO_I18N.jp;
    return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), root);
  }

  function comboMsg(key, params = null, lang) {
    const base = comboT(`messages.${key}`, lang) || key;
    if (!params || typeof params !== 'object') return base;
    return Object.keys(params).reduce((text, token) => {
      const value = params[token] == null ? '' : String(params[token]);
      return text.replaceAll(`{${token}}`, value);
    }, base);
  }

  function comboValueLabel(key, fallback, lang) {
    return comboT(`values.${key}`, lang) || fallback;
  }

  const FIELD_ORDER = [
    'control_mode',
    'distance',
    'position',
    'counter_type',
    'bo_state',
    'drive_req',
    'sa_req',
    'vs_character',
    'special_condition',
    'damage_jp',
    'damage_bo_guard',
    'damage_normal',
    'damage_counter',
    'damage_punish',
    'damage_normal_ca',
    'damage_counter_ca',
    'damage_punish_ca',
    'd_guard',
    'd_normal',
    'd_pc',
    'drive_delta',
    'drive_delta_opponent',
    'drive_efficiency',
    'sa_delta',
    'sa_delta_opponent',
    'carry_distance',
    'end_distance',
    'frame_adv',
    'safe_jump',
    'interrupt',
    'oki',
  ];

  const NUMERIC_FIELDS = new Set([
    'drive_req',
    'sa_req',
    'damage_jp',
    'damage_bo_guard',
    'damage_normal',
    'damage_counter',
    'damage_punish',
    'damage_normal_ca',
    'damage_counter_ca',
    'damage_punish_ca',
    'd_guard',
    'd_normal',
    'd_pc',
    'drive_delta',
    'drive_delta_opponent',
    'drive_efficiency',
    'sa_delta',
    'sa_delta_opponent',
    'carry_distance',
    'end_distance',
    'frame_adv',
  ]);

  const XLSX_MAP_ALL_FIELDS = [
    'command',
    'buttons',
    'combo_notes',
    'frame_meter',
    'game_version',
    ...FIELD_ORDER,
  ];

  const XLSX_MAP_NONE_VALUE = '';

  const XLSX_FIELD_LABELS = {
    command: { jp: 'コマンド', en: 'Command' },
    buttons: { jp: 'ボタン', en: 'Buttons' },
    combo_notes: { jp: '備考', en: 'Notes' },
    frame_meter: { jp: 'フレームメーター', en: 'Frame Meter' },
    game_version: { jp: 'Ver.', en: 'Ver.' },
    control_mode: { jp: '操作方法', en: 'Controls' },
    distance: { jp: '距離', en: 'Distance' },
    position: { jp: '位置', en: 'Position' },
    counter_type: { jp: 'カウンター', en: 'Counter' },
    bo_state: { jp: 'BO/スタン', en: 'BO/Stun' },
    drive_req: { jp: '最小Dゲージ', en: 'Min D Gauge' },
    sa_req: { jp: '最小SAゲージ', en: 'Min SA Gauge' },
    vs_character: { jp: '対応キャラ', en: 'Opp Character' },
    special_condition: { jp: '特殊条件', en: 'Special Conditions' },
    damage_jp: { jp: 'ジャスパ後', en: 'After Just Parry' },
    damage_bo_guard: { jp: 'BOガード時', en: 'BO Block' },
    damage_normal: { jp: '通常', en: 'Normal' },
    damage_counter: { jp: 'C', en: 'C' },
    damage_punish: { jp: 'PC', en: 'PC' },
    damage_normal_ca: { jp: '通常(CA)', en: 'Normal (CA)' },
    damage_counter_ca: { jp: 'C(CA)', en: 'C (CA)' },
    damage_punish_ca: { jp: 'PC(CA)', en: 'PC (CA)' },
    d_guard: { jp: 'Dゲージ削り/ガード時', en: 'D Gauge Chip/Block' },
    d_normal: { jp: 'Dゲージ削り/通常', en: 'D Gauge Chip/Normal' },
    d_pc: { jp: 'Dゲージ削り/PC', en: 'D Gauge Chip/PC' },
    drive_delta: { jp: 'Dゲージ増減/自分', en: 'D Gauge Delta/Self' },
    drive_delta_opponent: { jp: 'Dゲージ増減/相手', en: 'D Gauge Delta/Opp' },
    drive_efficiency: { jp: 'Dゲージ効率', en: 'D Gauge Efficiency' },
    sa_delta: { jp: 'SAゲージ増減/自分', en: 'SA Delta/Self' },
    sa_delta_opponent: { jp: 'SAゲージ増減/相手', en: 'SA Delta/Opp' },
    carry_distance: { jp: '運びヒット時', en: 'Carry on Hit' },
    end_distance: { jp: 'コンボ後距離ヒット時', en: 'End Distance on Hit' },
    frame_adv: { jp: 'フレーム差ヒット時', en: 'Frame Adv on Hit' },
    safe_jump: { jp: '詐欺飛び', en: 'Safe Jump' },
    interrupt: { jp: '割込', en: 'Interrupt' },
    oki: { jp: '重ね', en: 'Meaty' },
  };

  const XLSX_HEADER_KEYWORDS = {
    command: ['コンボ', '入力', 'コマンド', 'combo', 'command', 'input'],
    buttons: ['ボタン', 'button', 'buttons'],
    combo_notes: ['備考', 'メモ', 'コメント', 'notes', 'note', 'memo', 'comment'],
    control_mode: ['操作方法', 'm/c', 'control', 'mode'],
    position: ['状況', '位置', '画面端', '中央', 'コーナー', 'position', 'corner', 'midscreen'],
    distance: ['距離', '間合', 'レンジ', 'distance', 'range'],
    special_condition: ['始動', 'スターター', '特殊条件', 'special', 'starter', 'condition'],
    damage_normal: ['ダメージ', 'damage', 'dmg'],
    frame_adv: ['有利', 'フレーム', 'frame', 'adv', 'advantage'],
    frame_meter: ['フレームメーター', 'framemeter', 'frame meter'],
    game_version: ['ver', 'version', 'バージョン'],
  };

  const XLSX_DRIVE_KEYWORDS = ['dゲージ', 'ドライブ', 'drive'];
  const XLSX_SA_KEYWORDS = ['sa', 'super', 'スーパー'];
  const XLSX_REQ_KEYWORDS = ['使用', '消費', '必要', 'コスト', 'spent', 'cost', 'required', 'req'];
  const XLSX_DELTA_KEYWORDS = ['増減', '変化', 'delta', 'change', 'net', '+/-', '±', 'plusminus', '変動'];

  const SEARCH_FIELD_GROUPS = {
    command: ['command'],
    buttons: ['buttons'],
    notes: ['combo_notes'],
    conditions: [
      'control_mode',
      'distance',
      'position',
      'counter_type',
      'bo_state',
      'drive_req',
      'sa_req',
      'vs_character',
      'special_condition',
      'safe_jump',
      'interrupt',
      'oki',
      'game_version',
    ],
    damage: [
      'damage_jp',
      'damage_bo_guard',
      'damage_normal',
      'damage_counter',
      'damage_punish',
      'damage_normal_ca',
      'damage_counter_ca',
      'damage_punish_ca',
    ],
    drive: ['d_guard', 'd_normal', 'd_pc'],
    other: ['carry_distance', 'end_distance', 'frame_adv', 'game_version', 'frame_meter'],
  };

  const COLUMN_PRESETS = [
    { key: 'full', labelKey: 'presets.full', label: '全て', fields: null },
    {
      key: 'basic',
      labelKey: 'presets.basic',
      label: '基本',
      fields: [
        'distance',
        'position',
        'counter_type',
        'bo_state',
        'vs_character',
        'special_condition',
        'damage_normal',
        'damage_counter',
        'damage_punish',
        'd_guard',
        'd_normal',
        'drive_delta',
        'drive_efficiency',
        'sa_delta',
        'carry_distance',
        'frame_adv',
      ],
    },
    {
      key: 'simple',
      labelKey: 'presets.simple',
      label: '簡易',
      fields: [
        'counter_type',
        'bo_state',
        'special_condition',
        'damage_normal',
        'drive_delta',
        'sa_delta',
      ],
    },
    { key: 'custom', labelKey: 'presets.custom', label: 'カスタム', fields: null, custom: true },
  ];

  const ALWAYS_VISIBLE_FIELDS = new Set(['command', 'buttons', 'combo_notes', 'frame_meter']);
  const ALWAYS_HIDDEN_FIELDS = new Set();

  const SEARCH_CATEGORY_FIELDS = {
    combo: ['combo_notes'],
    command: ['command'],
    buttons: ['buttons'],
    notes: ['combo_notes'],
    conditions: SEARCH_FIELD_GROUPS.conditions,
    damage: SEARCH_FIELD_GROUPS.damage,
    drive: SEARCH_FIELD_GROUPS.drive,
    other: SEARCH_FIELD_GROUPS.other,
  };

  const state = {
    groups: [],
    combos: [],
    currentCharacter: '',
    activeCell: null,
    controlMode: 'classic',
    syncing: false,
    hiddenColumns: new Set(),
    customHiddenColumns: new Set(),
    columnPreset: 'basic',
    baseColumnEntries: null,
    sort: {
      field: null,
      direction: 1,
    },
    filters: {
      search: '',
      fieldQuery: '',
      fieldFields: [],
      command_scope: [],
      mode: [],
      position: [],
      distance: [],
      counter: [],
      bo: [],
      vs: [],
      interrupt: [],
      special: [],
      version: [],
      safe_jump: [],
      ranges: {},
      control: 'all',
    },
    keymaps: null,
    keymapNoticeTimer: null,
    activeDevice: 'keyboard',
    rowVisibility: {
      frame: false,
      buttons: true,
      notes: true,
    },
    isDirty: false,
    autosaveTimer: null,
    lastSavedAt: 0,
    draftSavedAt: 0,
    lastShortBackupAt: 0,
    lastLongBackupAt: 0,
    importBackupAt: 0,
    recoverySource: '',
    customShortcuts: [],
    searchDebounceTimer: null,
    notationUnknownTerms: new Set(),
    notationManagerRows: [],
    xlsxMapPresets: null,
    xlsxMapModalContext: null,
    gamepad: {
      raf: null,
      lastButtons: {},
      lastDir: '',
    },
  };

  const ui = {};
  const vendorScriptPromises = {};
  let dirtyStateGuardsBound = false;
  let frameVersionEventsBound = false;

  const qs = (id) => document.getElementById(id);

  function ensureSaveStatusUi() {
    if (ui.saveStatus) return;
    const host = ui.comboView || qs('comboView');
    if (!host) return;
    const el = document.createElement('div');
    el.id = 'comboSaveStatus';
    el.className = 'combo-save-status';
    el.setAttribute('aria-live', 'polite');
    host.appendChild(el);
    ui.saveStatus = el;
  }

  function ensureFrameVersionUi() {
    // Data version display has been retired; keep function for compatibility.
    ui.frameVersionInfo = null;
  }

  function ensureGameVersionUi() {
    // Game version is shown in the global header.
    ui.gameVersionInfo = null;
  }

  function getCurrentFrameVersionForCombo() {
    const fromBody = (document.body && document.body.dataset && document.body.dataset.frameDataVersion) || '';
    if (fromBody) return String(fromBody).trim();
    if (typeof window.getCurrentFrameDataVersion === 'function') {
      const fromApi = window.getCurrentFrameDataVersion();
      if (fromApi) return String(fromApi).trim();
    }
    return '2025.12.16';
  }

  function updateComboFrameVersionInfo(lang) {
    return;
  }

  function getSelectedComboGameVersion() {
    const idx = Number(state.selectedGroup);
    if (!Number.isFinite(idx) || idx < 0) return '';
    const combo = state.combos[idx];
    return combo ? String(combo.game_version || '').trim() : '';
  }

  function updateComboGameVersionInfo(lang) {
    if (!ui.gameVersionInfo) return;
    const active = lang || getComboLang();
    const prefix = comboT('ui.game_version_prefix', active) || 'Game Ver';
    const value = getSelectedComboGameVersion() || getCurrentFrameVersionForCombo();
    ui.gameVersionInfo.textContent = `${prefix}: ${value}`;
  }

  function updateSaveStatusUI(dirty, recovery = false) {
    if (!ui.saveStatus) return;
    const key = recovery ? 'save_status_recovered' : (dirty ? 'save_status_unsaved' : 'save_status_saved');
    ui.saveStatus.textContent = comboMsg(key);
    ui.saveStatus.classList.toggle('dirty', !!dirty);
    ui.saveStatus.classList.toggle('recovered', !!recovery);
    const ts = Number(state.lastSavedAt);
    ui.saveStatus.title = ts > 0 ? new Date(ts).toLocaleString() : '';
  }

  function bindDirtyStateGuards() {
    if (dirtyStateGuardsBound) return;
    dirtyStateGuardsBound = true;
    window.addEventListener('beforeunload', (ev) => {
      if (!state.isDirty) return;
      try {
        autosaveDraftNow();
      } catch { }
      ev.preventDefault();
      ev.returnValue = '';
    });
  }

  function bindFrameVersionEvents() {
    if (frameVersionEventsBound) return;
    frameVersionEventsBound = true;
    document.addEventListener('lm:frame-version-changed', () => {
      updateComboGameVersionInfo(getComboLang());
    });
  }

  function loadVendorScript(src) {
    if (vendorScriptPromises[src]) return vendorScriptPromises[src];
    vendorScriptPromises[src] = new Promise((resolve, reject) => {
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
    return vendorScriptPromises[src];
  }

  async function ensureVendorLoaded({ excel = false, zip = false } = {}) {
    const promises = [];
    if (zip && !window.JSZip) {
      promises.push(loadVendorScript('assets/vendor/jszip.min.js'));
    }
    if (excel && !window.ExcelJS) {
      promises.push(loadVendorScript('assets/vendor/exceljs.min.js'));
    }
    if (promises.length) {
      await Promise.all(promises);
    }
  }

  function init() {
    ui.table = qs('Table1');
    if (!ui.table) return;
    ui.comboView = qs('comboView');
    if (ui.comboView) ui.comboView.classList.remove('combo-ready');

    if (ui.table.style.left) ui.table.dataset.baseLeft = ui.table.style.left;
    if (ui.table.style.top) ui.table.dataset.baseTop = ui.table.style.top;
    if (ui.table.style.width) ui.table.dataset.baseWidth = ui.table.style.width;
    if (ui.table.style.height) ui.table.dataset.baseHeight = ui.table.style.height;
    if (!ui.table.dataset.baseStyle) {
      ui.table.dataset.baseStyle = ui.table.getAttribute('style') || '';
    }
    ['Table2', 'Table3', 'Table4', 'Table5'].forEach((id) => {
      const el = qs(id);
      if (!el) return;
      if (el.style.left) el.dataset.baseLeft = el.style.left;
      if (el.style.top) el.dataset.baseTop = el.style.top;
    });

    ui.comboView = qs('comboView');
    ui.search = qs('SiteSearch1');
    ui.searchBtn = qs('Button1');
    ui.filterBtn = qs('Button2');
    ui.exportBtn = qs('Button3');
    ui.importBtn = qs('Button4');
    ui.notationBtn = qs('comboNotationBtn');
    ui.exportMenu = qs('comboExportMenu');
    ui.exportWrapper = qs('comboExportWrapper');
    ui.saveStatus = qs('comboSaveStatus');
    ui.gameVersionInfo = qs('comboGameVersionInfo');
    ui.charBtn = qs('wb_Image1');
    ui.charImg = qs('Image1');
    ui.tabClassic = qs('comboTabClassic') || qs('Image3');
    ui.tabModern = qs('comboTabModern') || qs('Image2');
    ui.keymapTable = qs('Table3');
    ui.deviceSelect = qs('comboDeviceSelect');
    ui.customizeBtn = qs('comboCustomizeBtn');

    setupCustomizeControls();
    ensureSaveStatusUi();
    ensureGameVersionUi();
    bindDirtyStateGuards();
    bindFrameVersionEvents();
    ensureVersionColumn();
    removeFirstColumn();
    mergeMainTableHeader();
    mergeTrailingHeaderRowspan();
    ensureComboColumns();
    ensureComboTableSections();
    cacheHeaderBaseSpans(ui.table, true);
    cacheHeaderBaseLabels(ui.table, true);
    state.baseColumnEntries = buildComboColumnEntriesFromHeader(ui.table);
    buildGroups();
    buildInputs();
    initSortHeaders();
    applyComboColumnWidths();
    const persistedComboCharacter = getPersistedComboCharacter();
    const frameCharacter = resolveCharacterSlug(
      (document.body && document.body.dataset && document.body.dataset.currentCharSlug) || '',
    ) || '';
    state.currentCharacter = persistedComboCharacter || frameCharacter || getCharacterSlugFromUi();
    if (ui.comboView) ui.comboView.dataset.character = state.currentCharacter;
    applyComboPortrait(state.currentCharacter);
    if (state.currentCharacter) persistComboCharacter(state.currentCharacter);
    cleanupStorageBuckets();
    loadState();
    ensureGroupCount(state.combos.length);
    loadUiPrefs();
    ensureSampleCombo();
    applyStateToTable();
    bindEvents();
    bindRowToggles();
    bindCrudButtons();
    ensureColumnPresetControls();
    applyColumnPreset(state.columnPreset);
    applyFilters();
    ensureTableScrollContainer();
    initComboDragScroll();
    layoutInputButtons();
    layoutHeaderActions();
    bindComboTabSizing();
    setControlMode(state.controlMode || 'classic');
    updateGamepadPolling();
    applyComboLanguage(getComboLang());
    if (ui.comboView) ui.comboView.classList.add('combo-ready');
  }

  function buildGroups() {
    const rows = Array.from(ui.table.querySelectorAll('tr'));
    const dataRows = rows.filter((row) => !row.querySelector('th'));
    const groups = [];
    let current = null;
    const fallbackOrder = ['frame_meter', 'command', 'buttons', 'notes'];
    const hasCompleteRows = (group) =>
      !!(group
        && group.rows
        && group.rows.frame_meter
        && group.rows.command
        && group.rows.buttons
        && group.rows.notes);
    const fallbackLabels = {
      frame_meter: comboT('rows.frame_meter') || 'フレームメーター',
      command: comboT('rows.command') || 'コマンド',
      buttons: comboT('rows.buttons') || 'ボタン',
      notes: comboT('rows.notes') || '備考',
    };
    let sawLabel = false;

    dataRows.forEach((row) => {
      let label = getRowLabel(row);
      if (label) {
        sawLabel = true;
      } else if (sawLabel && current) {
        const slot = Math.max(0, current.rowList.length % fallbackOrder.length);
        label = fallbackOrder[slot] || '';
        if (label) {
          const cells = row.querySelectorAll('td');
          const labelCell = cells[0];
          if (labelCell && !labelCell.textContent.trim()) {
            const target = labelCell.querySelector('p') || labelCell;
            target.textContent = fallbackLabels[label] || '';
          }
        }
      }
      if (!label) return;
      const shouldStart = label === 'frame_meter' || (!current && label === 'command');
      if (shouldStart) {
        current = {
          index: groups.length,
          rows: {},
          inputs: {},
          rowList: [],
        };
        groups.push(current);
      }
      if (!current) return;
      row.dataset.row = String(current.index);
      row.dataset.rowLabel = label || '';
      current.rowList.push(row);
      if (label && !current.rows[label]) current.rows[label] = row;
    });

    while (groups.length && !hasCompleteRows(groups[groups.length - 1])) {
      const trailing = groups.pop();
      if (trailing && Array.isArray(trailing.rowList)) {
        trailing.rowList.forEach((row) => row.remove());
      }
    }
    dataRows.forEach((row) => {
      if (!row.dataset.row) row.remove();
    });

    groups.forEach((group, idx) => {
      const isEven = idx % 2 === 0;
      group.rowList.forEach((row, rowIdx) => {
        const rowLabel = (row.dataset.rowLabel || getRowLabel(row) || fallbackOrder[rowIdx % fallbackOrder.length] || '');
        row.dataset.rowLabel = rowLabel;
        row.classList.add('combo-group-row');
        row.classList.add(isEven ? 'combo-group-even' : 'combo-group-odd');
        if (rowLabel === 'frame_meter') row.classList.add('combo-group-start');
        if (rowIdx === group.rowList.length - 1) row.classList.add('combo-group-end');
        if (rowLabel === 'command') row.classList.add('combo-row-command');
        if (rowLabel === 'buttons') row.classList.add('combo-row-buttons');
        if (rowLabel === 'notes') row.classList.add('combo-row-notes');
        if (rowLabel === 'frame_meter') row.classList.add('combo-row-frame');
        if (rowLabel === 'frame_meter') ensureFrameMeterLabelBreak(row, idx);
      });
    });

    state.groups = groups;
    state.combos = groups.map((_, idx) => (idx === 0 ? defaultCombo(true) : defaultCombo()));
  }

  function buildInputs() {
    state.groups.forEach((group) => {
      buildCommandRow(group);
      buildButtonsRow(group);
      buildNotesRow(group);
      buildFrameRow(group);
    });
  }

  function ensureComboColumns() {
    if (!ui.table) return;
    const headerRow = ui.table.querySelector('tr');
    if (!headerRow) return;
    const subHeaderRow = headerRow.nextElementSibling;

    const normalize = (text) =>
      String(text || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, '')
        .trim();

    const findColumnIndexByText = (row, text) => {
      if (!row) return null;
      const targets = Array.isArray(text) ? text : [text];
      const normalizedTargets = targets.map((value) => normalize(value));
      let col = 1;
      for (const cell of Array.from(row.children)) {
        const span = Number(cell.getAttribute('colspan') || 1);
        const cellText = normalize(cell.textContent);
        if (normalizedTargets.some((target) => cellText.includes(target))) return col;
        col += span;
      }
      return null;
    };

    const insertCellAt = (row, colIndex, tagName) => {
      if (!row || !colIndex) return;
      let col = 1;
      for (const cell of Array.from(row.children)) {
        const span = Number(cell.getAttribute('colspan') || 1);
        if (colIndex <= col) {
          const newCell = document.createElement(tagName);
          newCell.className = cell.className || '';
          const p = document.createElement('p');
          p.style.fontSize = '13px';
          p.style.lineHeight = '16px';
          p.innerHTML = '&nbsp;';
          newCell.appendChild(p);
          row.insertBefore(newCell, cell);
          return;
        }
        col += span;
      }
      const newCell = document.createElement(tagName);
      newCell.className = row.lastElementChild ? row.lastElementChild.className : '';
      const p = document.createElement('p');
      p.style.fontSize = '13px';
      p.style.lineHeight = '16px';
      p.innerHTML = '&nbsp;';
      newCell.appendChild(p);
      row.appendChild(newCell);
    };

    const positionCol = findColumnIndexByText(subHeaderRow || headerRow, ['位置', 'Position']);
    const frameCol = findColumnIndexByText(headerRow, ['フレーム差', 'FrameAdv']);
    const interruptCol = findColumnIndexByText(headerRow, ['割込', 'Interrupt']);
    const driveDeltaCol = findColumnIndexByText(headerRow, ['Dゲージ増減', 'DriveΔ']);
    const driveDeltaOppCol = driveDeltaCol ? driveDeltaCol + 1 : null;
    const driveEfficiencyCol = findColumnIndexByText(headerRow, ['Dゲージ効率', 'DriveEff']);
    const saDeltaCol = findColumnIndexByText(headerRow, ['SAゲージ増減', 'SAΔ']);
    const saDeltaOppCol = saDeltaCol ? saDeltaCol + 1 : null;
    const dGuardCol = findColumnIndexByText(subHeaderRow || headerRow, ['ガード時', 'Blocked']);

    const distanceCol = positionCol;
    const safeJumpCol = frameCol ? frameCol + 1 : null;
    const okiCol = interruptCol ? interruptCol + 1 : null;

    const expectedCols = buildCellMatrixFromRows([headerRow, subHeaderRow].filter(Boolean), {
      table: ui.table,
    }).colCount;
    const insertCols = Array.from(new Set([
      okiCol,
      safeJumpCol,
      distanceCol,
      saDeltaOppCol,
      driveDeltaOppCol,
      dGuardCol ? dGuardCol + 2 : null,
      dGuardCol ? dGuardCol + 1 : null,
      dGuardCol,
    ].filter(Boolean))).sort((a, b) => b - a);

    const rows = Array.from(ui.table.querySelectorAll('tr'));
    rows.forEach((row) => {
      if (row === headerRow || row === subHeaderRow) return;
      let rowCols = Array.from(row.children).reduce(
        (sum, cell) => sum + Number(cell.getAttribute('colspan') || 1),
        0,
      );
      if (rowCols > expectedCols) {
        while (rowCols > expectedCols && row.lastElementChild) {
          const lastCell = row.lastElementChild;
          const span = Number(lastCell.getAttribute('colspan') || 1);
          rowCols -= span;
          lastCell.remove();
        }
      }
      if (rowCols >= expectedCols) return;
      let currentCols = rowCols;
      insertCols.forEach((colIndex) => {
        if (currentCols >= expectedCols) return;
        insertCellAt(row, colIndex, 'td');
        currentCols += 1;
      });
      if (currentCols < expectedCols) {
        const missing = expectedCols - currentCols;
        const refCell = row.lastElementChild || null;
        for (let i = 0; i < missing; i += 1) {
          insertCellAt(row, currentCols + 1, 'td');
          currentCols += 1;
        }
      }
    });
  }

  function initSortHeaders() {
    if (!ui.table || !state.groups.length) return;
    const headerRow = ui.table.querySelector('tr');
    if (!headerRow) return;
    const subHeaderRow = headerRow.nextElementSibling;

    const columnMap = {};
    const firstGroup = state.groups[0];
    Object.entries(firstGroup.inputs).forEach(([field, input]) => {
      if (!input) return;
      const cell = input.closest('td,th');
      if (!cell) return;
      const colIndex = getCellColumnIndex(cell);
      if (!colIndex) return;
      columnMap[colIndex] = field;
    });

    const makeSortable = (cell, field) => {
      if (!cell || !field) return;
      cell.classList.add('combo-sortable');
      cell.dataset.sortField = field;
      cell.addEventListener('click', () => {
        const nextDirection = state.sort.field === field ? state.sort.direction * -1 : 1;
        applySort(field, nextDirection);
      });
    };

    const applyDatasetSort = (row) => {
      if (!row) return;
      Array.from(row.children).forEach((cell) => {
        const field = cell.dataset ? cell.dataset.sortField : '';
        if (field) makeSortable(cell, field);
      });
    };

    applyDatasetSort(headerRow);
    applyDatasetSort(subHeaderRow);

    const headerCells = Array.from(headerRow.children);
    const comboHeader = headerCells.find((cell) => {
      const text = normalizeComboLabel(cell.textContent || '');
      return text.includes('コンボ') || text.includes('combo');
    });
    if (comboHeader) makeSortable(comboHeader, '__combo_first__');

    const controlHeader = headerCells.find((cell) => {
      const text = normalizeComboLabel(cell.textContent || '');
      return text.includes('操作方法') || text.includes('control');
    });
    if (controlHeader) makeSortable(controlHeader, 'command');

    const controlCol = Object.keys(columnMap).find((col) => columnMap[col] === 'control_mode');
    if (subHeaderRow && controlCol) {
      const cell = getCellAtColumn(subHeaderRow, Number(controlCol));
      if (cell) makeSortable(cell, 'control_mode');
    }

    headerCells.forEach((cell) => {
      const span = Number(cell.getAttribute('colspan') || 1);
      if (span !== 1) return;
      const colIndex = getCellColumnIndex(cell);
      const field = columnMap[colIndex];
      if (field) makeSortable(cell, field);
    });

    if (subHeaderRow) {
      Array.from(subHeaderRow.children).forEach((cell) => {
        const colIndex = getCellColumnIndex(cell);
        const field = columnMap[colIndex];
        if (field) makeSortable(cell, field);
      });
    }
  }

  function applySort(field, direction) {
    if (!field || !state.groups.length) return;
    const dir = direction || 1;
    const currentSelectedCombo = Number.isFinite(state.selectedGroup)
      ? state.combos[state.selectedGroup]
      : null;
    const sorted = state.groups.map((group, idx) => ({
      group,
      combo: state.combos[idx] || defaultCombo(),
      originalIndex: idx,
    }));

    sorted.sort((a, b) => {
      const result = compareComboField(a.combo, b.combo, field);
      if (result !== 0) return result * dir;
      return (a.originalIndex - b.originalIndex) * dir;
    });

    state.groups = sorted.map((item) => item.group);
    state.combos = sorted.map((item) => item.combo);

    state.groups.forEach((group, idx) => {
      group.index = idx;
      const isEven = idx % 2 === 0;
      group.rowList.forEach((row) => {
        row.classList.toggle('combo-group-even', isEven);
        row.classList.toggle('combo-group-odd', !isEven);
        row.classList.toggle('selected', false);
      });
      Object.values(group.inputs).forEach((input) => {
        if (input && input.dataset) input.dataset.row = String(idx);
      });
      group.rowList.forEach((row) => ui.table.appendChild(row));
    });

    if (currentSelectedCombo) {
      const newIndex = state.combos.findIndex((combo) => combo === currentSelectedCombo);
      state.selectedGroup = newIndex;
      if (newIndex >= 0) setSelectedGroup(newIndex);
    } else {
      state.selectedGroup = -1;
    }

    state.sort.field = field;
    state.sort.direction = dir;
    updateSortIndicators();
    updateEmptyGroups();
  }

  function compareComboField(aCombo, bCombo, field) {
    if (field === '__combo_first__') {
      return compareFirstMove(aCombo, bCombo);
    }
    if (NUMERIC_FIELDS.has(field)) {
      return compareNumbers(aCombo[field], bCombo[field]);
    }
    const aVal = normalizeSortString(aCombo[field]);
    const bVal = normalizeSortString(bCombo[field]);
    if (!aVal && !bVal) return 0;
    if (!aVal) return 1;
    if (!bVal) return -1;
    return aVal.localeCompare(bVal, 'ja', { numeric: true, sensitivity: 'base' });
  }

  function normalizeSortString(value) {
    if (value == null) return '';
    if (Array.isArray(value)) return value.join(' ').trim().toLowerCase();
    return String(value).trim().toLowerCase();
  }

  function compareNumbers(aValue, bValue) {
    const aNum = toSortableNumber(aValue);
    const bNum = toSortableNumber(bValue);
    if (aNum == null && bNum == null) return 0;
    if (aNum == null) return 1;
    if (bNum == null) return -1;
    return aNum - bNum;
  }

  function toSortableNumber(value) {
    const raw = String(value == null ? '' : value).replace(/,/g, '').trim();
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }

  function compareFirstMove(aCombo, bCombo) {
    const aKeys = getComboMoveKeys(aCombo);
    const bKeys = getComboMoveKeys(bCombo);
    const maxMoves = Math.max(aKeys.length, bKeys.length);
    for (let i = 0; i < maxMoves; i += 1) {
      const aKey = aKeys[i];
      const bKey = bKeys[i];
      if (!aKey && !bKey) return 0;
      if (!aKey) return -1;
      if (!bKey) return 1;
      const diff = compareKeyArray(aKey, bKey);
      if (diff !== 0) return diff;
    }
    return 0;
  }

  function compareKeyArray(aKey, bKey) {
    const maxLen = Math.max(aKey.length, bKey.length);
    for (let i = 0; i < maxLen; i += 1) {
      const aVal = aKey[i];
      const bVal = bKey[i];
      if (aVal === bVal) continue;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const aType = typeof aVal;
      const bType = typeof bVal;
      if (aType === 'string' || bType === 'string') {
        return String(aVal).localeCompare(String(bVal), 'ja', { numeric: true, sensitivity: 'base' });
      }
      return aVal > bVal ? 1 : -1;
    }
    return 0;
  }

  function getComboMoveKeys(combo) {
    const command = String(combo.command || '').trim();
    if (!command) return [];
    const tokens = command.split(/\s+/).filter(Boolean);
    const separators = new Set(['>', '>>', '-', 'or', 'OR', '[]']);
    const moves = [];
    let i = 0;
    while (i < tokens.length) {
      let token = tokens[i];
      if (separators.has(token)) {
        i += 1;
        continue;
      }
      let isJump = false;
      if (token.toLowerCase() === 'jump') {
        isJump = true;
        i += 1;
        token = tokens[i] || '';
      }
      if (!token) break;
      const { key, consumed } = getMoveKey(tokens, i, isJump);
      if (key) moves.push(key);
      i += Math.max(consumed, 1);
    }
    return moves;
  }

  function getMoveKey(tokens, index, isJump) {
    const token = tokens[index] || '';
    const nextToken = tokens[index + 1] || '';
    const nextToken2 = tokens[index + 2] || '';
    const normalized = token.toUpperCase();
    const normalizedNext = nextToken.toUpperCase();
    const normalizedNext2 = nextToken2.toUpperCase();
    const normalStrength = {
      L: 0, LP: 0, LK: 0,
      M: 1, MP: 1, MK: 1,
      H: 2, HP: 2, HK: 2,
      P: 3, K: 3,
    };

    const buildNormalKey = (strength) => [0, strength, isJump ? 1 : 0, 0, normalized];
    const buildSpecialKey = (digits, strength, autoFlag) => {
      const category = isJump ? 0.8 : 1;
      const digitValue = digits == null ? 9999 : digits;
      const strengthValue = strength == null ? 3 : strength;
      return [category, digitValue, strengthValue, autoFlag ? 1 : 0, normalized];
    };

    if (Object.prototype.hasOwnProperty.call(normalStrength, normalized)) {
      return { key: buildNormalKey(normalStrength[normalized]), consumed: 1 };
    }
    if (token.includes('投げ')) {
      return { key: [0, 4, isJump ? 1 : 0, 0, normalized], consumed: 1 };
    }
    const saMatch = normalized.match(/SA\s*([123])/);
    if (saMatch) {
      return { key: [2, Number(saMatch[1]) || 0, 0, 0, normalized], consumed: 1 };
    }
    if (normalized === 'SA' && /^[123]$/.test(normalizedNext)) {
      return { key: [2, Number(normalizedNext) || 0, 0, 0, `SA${normalizedNext}`], consumed: 2 };
    }
    if (normalized === 'DR') return { key: [4, 0, 0, 0, normalized], consumed: 1 };
    if (normalized === 'DI') return { key: [5, 0, 0, 0, normalized], consumed: 1 };
    if (normalized === 'DASH' || normalized === '66' || normalized === '44') {
      return { key: [3, 0, 0, 0, normalized], consumed: 1 };
    }

    if (/^[1-9]$/.test(normalized)) {
      if (normalizedNext === 'AUTO' && normalizedNext2 === 'SP') {
        return { key: buildSpecialKey(Number(normalized), null, true), consumed: 3 };
      }
      if (normalizedNext === 'SP') {
        return { key: buildSpecialKey(Number(normalized), null, false), consumed: 2 };
      }
      if (normalizedNext === 'AUTO') {
        return { key: buildSpecialKey(Number(normalized), null, true), consumed: 2 };
      }
    }

    if (normalized === 'AUTO' && normalizedNext === 'SP') {
      return { key: buildSpecialKey(null, null, true), consumed: 2 };
    }
    if (normalized === 'SP') {
      return { key: buildSpecialKey(null, null, false), consumed: 1 };
    }
    if (normalized === 'AUTO') {
      return { key: buildSpecialKey(null, null, true), consumed: 1 };
    }

    if (/\d/.test(normalized)) {
      const strengthMatch = normalized.match(/(L|M|H|LP|MP|HP|LK|MK|HK)$/);
      let strength = strengthMatch ? normalStrength[strengthMatch[1]] ?? 3 : null;
      if (strength == null && Object.prototype.hasOwnProperty.call(normalStrength, normalizedNext)) {
        strength = normalStrength[normalizedNext];
      }
      const digitsMatch = normalized.match(/(\d{2,4})/);
      const digits = digitsMatch ? Number(digitsMatch[1]) : 9999;
      const autoFlag = normalizedNext === 'AUTO' || normalizedNext2 === 'AUTO';
      return { key: buildSpecialKey(digits, strength ?? 3, autoFlag), consumed: 1 };
    }

    return { key: [99, 99, 99, 99, normalized], consumed: 1 };
  }

  function updateSortIndicators() {
    if (!ui.table) return;
    ui.table.querySelectorAll('.combo-sortable').forEach((cell) => {
      cell.dataset.sort = '';
    });
    if (ui.headerTable) {
      ui.headerTable.querySelectorAll('.combo-sortable').forEach((cell) => {
        cell.dataset.sort = '';
      });
    }
    if (!state.sort.field) return;
    const field = state.sort.field;
    const direction = state.sort.direction;
    const selector = `.combo-sortable[data-sort-field="${field}"]`;
    const cell = ui.table.querySelector(selector);
    if (cell) {
      cell.dataset.sort = direction === 1 ? 'asc' : 'desc';
    }
    if (ui.headerTable) {
      const headerCell = ui.headerTable.querySelector(selector);
      if (headerCell) {
        headerCell.dataset.sort = direction === 1 ? 'asc' : 'desc';
      }
    }
  }

  function buildCommandRow(group) {
    const row = group.rows.command;
    if (!row) return;
    const cells = row.querySelectorAll('td');
    if (!cells.length) return;
    const labelIndex = findLabelCellIndex(row, ['コマンド', 'command']);
    if (labelIndex < 0) return;
    const labelCell = cells[labelIndex];
    if (!labelCell) return;
    const labelCol = getCellColumnIndex(labelCell);
    if (!labelCol) return;
    const commandCell = getCellAtColumn(row, labelCol + 1);
    if (!commandCell) return;
    placeControl(commandCell, buildContentEditable('command', group));

    FIELD_ORDER.forEach((field, idx) => {
      const cell = getCellAtColumn(row, labelCol + 2 + idx);
      if (!cell) return;
      let control = null;
      if (field === 'control_mode') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: 'classic', label: comboValueLabel('classic', 'Classic') },
          { value: 'modern', label: comboValueLabel('modern', 'Modern') },
          { value: '両方', label: comboValueLabel('both', '両方') },
        ]);
      } else if (field === 'distance') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: '密着', label: comboValueLabel('close', '密着') },
          { value: '先端', label: comboValueLabel('tip', '先端') },
        ]);
      } else if (field === 'position') {
        control = buildSelect(field, group, [
          { value: '地上', label: comboValueLabel('ground', '地上') },
          { value: '空中', label: comboValueLabel('air', '空中') },
          { value: '壁', label: comboValueLabel('wall', '壁') },
          { value: '逆壁', label: comboValueLabel('reverse_wall', '逆壁') },
          { value: '壁付近', label: comboValueLabel('near_wall', '壁付近') },
          { value: '端端', label: comboValueLabel('far_wall', '端端') },
        ]);
      } else if (field === 'counter_type') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: 'C', label: 'C' },
          { value: 'PC', label: 'PC' },
        ]);
      } else if (field === 'bo_state') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: 'BO', label: 'BO' },
          { value: 'スタン', label: comboValueLabel('stun', 'スタン') },
        ]);
      } else if (field === 'vs_character') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: '全キャラ', label: comboValueLabel('all_chars', '全キャラ') },
          { value: 'デカキャラのみ', label: comboValueLabel('big_only', 'デカキャラのみ') },
          { value: 'デカキャラ以外', label: comboValueLabel('no_big', 'デカキャラ以外') },
        ]);
      } else if (field === 'special_condition') {
        control = buildMultiInput(field, group, getSpecialConditionOptions());
      } else if (field === 'safe_jump') {
        control = buildSelect(field, group, [
          { value: '', label: '-' },
          { value: '可', label: comboValueLabel('yes', '可') },
          { value: '準', label: comboValueLabel('semi', '準') },
          { value: '不可', label: comboValueLabel('no', '不可') },
        ]);
      } else if (field === 'interrupt') {
        control = buildSelect(field, group, [
          { value: '不可', label: comboValueLabel('no', '不可') },
          { value: '可', label: comboValueLabel('yes', '可') },
        ]);
      } else if (field === 'oki') {
        control = buildInput(field, group, { type: 'text' });
      } else if (
        field === 'drive_req'
        || field === 'sa_req'
        || field === 'drive_delta'
        || field === 'drive_delta_opponent'
        || field === 'drive_efficiency'
        || field === 'sa_delta'
        || field === 'sa_delta_opponent'
        || field === 'carry_distance'
        || field === 'end_distance'
      ) {
        control = buildInput(field, group, { type: 'number', step: '0.1' });
      } else {
        control = buildInput(field, group, { type: 'text' });
      }
      if (control) placeControl(cell, control);
    });
    const versionCell = getCellAtColumn(row, labelCol + 2 + FIELD_ORDER.length);
    if (versionCell) {
      placeControl(versionCell, buildSelect('game_version', group, getGameVersionOptions()));
    }
  }

  function buildButtonsRow(group) {
    const row = group.rows.buttons;
    if (!row) return;
    const cells = row.querySelectorAll('td');
    const labelIndex = findLabelCellIndex(row, ['ボタン', 'button']);
    if (labelIndex < 0) return;
    const labelCell = cells[labelIndex];
    if (!labelCell) return;
    const labelCol = getCellColumnIndex(labelCell);
    if (!labelCol) return;
    const targetCell = getCellAtColumn(row, labelCol + 1);
    if (!targetCell) return;
    const output = buildContentEditable('buttons', group);
    output.contentEditable = 'false';
    output.tabIndex = -1;
    output.classList.add('cmd-output');
    placeControl(targetCell, output);
  }

  function buildNotesRow(group) {
    const row = group.rows.notes;
    if (!row) return;
    const cells = row.querySelectorAll('td');
    const labelIndex = findLabelCellIndex(row, ['備考', 'note']);
    if (labelIndex < 0) return;
    const labelCell = cells[labelIndex];
    if (!labelCell) return;
    const labelCol = getCellColumnIndex(labelCell);
    if (!labelCol) return;
    const notesCell = getCellAtColumn(row, labelCol + 1);
    if (notesCell) {
      const notesInput = buildInput('combo_notes', group, { type: 'text' });
      notesInput.classList.add('align-left');
      placeControl(notesCell, notesInput);
    }
    const spacerCell = getCellAtColumn(row, labelCol + 2);
    if (spacerCell) {
      const target = spacerCell.querySelector('p') || spacerCell;
      target.textContent = '';
    }
    row.querySelectorAll('select[data-field="game_version"]').forEach((select) => {
      const holder = select.closest('p') || select.parentElement;
      if (holder) holder.textContent = '';
      else select.remove();
    });
  }

  function ensureVersionColumn() {
    if (!ui.table) return;
    const rows = Array.from(ui.table.querySelectorAll('tr'));
    if (!rows.length) return;
    const headerRow = rows.find((row) => row.querySelector('th')) || rows[0];
    const headerCells = headerRow ? Array.from(headerRow.querySelectorAll('th')) : [];
    if (headerCells.length) {
      const lastHeader = headerCells[headerCells.length - 1];
      if (lastHeader && !lastHeader.dataset.interruptHeader) {
        lastHeader.dataset.interruptHeader = 'true';
      }
    }
    rows.forEach((row) => {
      const existing = row.querySelector('[data-version-col="true"]');
      if (existing) {
        if (existing.tagName.toLowerCase() === 'th') {
          const holder = existing.querySelector('p') || existing;
          holder.textContent = comboT('versionLabel') || 'Ver.';
        }
        return;
      }
      const lastCell = row.lastElementChild;
      if (!lastCell) return;
      const isHeader = lastCell.tagName && lastCell.tagName.toLowerCase() === 'th';
      const newCell = document.createElement(isHeader ? 'th' : 'td');
      newCell.className = lastCell.className || '';
      newCell.dataset.versionCol = 'true';
      const p = document.createElement('p');
      p.style.fontSize = '13px';
      p.style.lineHeight = '16px';
      if (isHeader) p.textContent = comboT('versionLabel') || 'Ver.';
      newCell.appendChild(p);
      row.appendChild(newCell);
    });
  }

  function removeFirstColumn() {
    if (!ui.table) return;
    const rows = Array.from(ui.table.querySelectorAll('tr'));
    rows.forEach((row) => {
      const cell = row.querySelector('th, td');
      if (cell) cell.remove();
    });
    const colgroup = ui.table.querySelector('colgroup.combo-cols');
    if (colgroup && colgroup.firstElementChild) {
      colgroup.firstElementChild.remove();
    }
  }

  function mergeMainTableHeader() {
    if (!ui.table) return;
    const headerRow = ui.table.querySelector('tr');
    const secondRow = headerRow ? headerRow.nextElementSibling : null;
    if (!headerRow || !secondRow) return;

    const headerCells = Array.from(headerRow.querySelectorAll('th'));
    if (headerCells.length < 2) return;
    const comboCell = headerCells.find((cell) => {
      const text = normalizeComboLabel(cell.textContent || '');
      return text.includes('コンボ') || text.includes('combo');
    });
    if (!comboCell) return;

    let colIndex = 1;
    const headerPositions = headerCells.map((cell) => {
      const start = colIndex;
      const span = Number(cell.getAttribute('colspan') || 1);
      colIndex += span;
      return { cell, start, span };
    });

    const comboPos = headerPositions.find((pos) => pos.cell === comboCell);
    if (!comboPos) return;
    const spacerPos = headerPositions.find((pos) => pos.start === comboPos.start + comboPos.span);
    const isHeaderSpacer = spacerPos && !spacerPos.cell.textContent.replace(/\u00a0/g, '').trim();

    comboCell.setAttribute('rowspan', '2');
    if (isHeaderSpacer) {
      comboCell.setAttribute('colspan', String(comboPos.span + spacerPos.span));
      spacerPos.cell.remove();
    } else {
      comboCell.removeAttribute('colspan');
    }

    const secondCells = Array.from(secondRow.querySelectorAll('td'));
    let secondCol = 1;
    const toRemove = [];
    secondCells.forEach((cell) => {
      const start = secondCol;
      const span = Number(cell.getAttribute('colspan') || 1);
      const end = start + span - 1;
      secondCol += span;
      if (start >= comboPos.start && end <= comboPos.start + (Number(comboCell.getAttribute('colspan') || comboPos.span) - 1)) {
        toRemove.push(cell);
      }
    });
    toRemove.forEach((cell) => cell.remove());
  }

  function mergeTrailingHeaderRowspan() {
    if (!ui.table) return;
    const headerRow = ui.table.querySelector('tr');
    const secondRow = headerRow ? headerRow.nextElementSibling : null;
    if (!headerRow || !secondRow) return;

    const normalized = (text) =>
      String(text || '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, '')
        .trim()
        .toLowerCase();

    const isTargetHeader = (text) => {
      const clean = normalized(text);
      if (!clean) return false;
      if (clean.includes('割込') || clean.includes('interrupt')) return true;
      if (clean.includes('詐欺飛び') || clean.includes('safejump')) return true;
      if (clean.includes('重ね') || clean.includes('meaty')) return true;
      if (clean.includes('dゲージ効率') || clean.includes('driveeff')) return true;
      if ((clean.includes('運び') && clean.includes('ヒット')) || clean.includes('carryhit')) return true;
      if ((clean.includes('コンボ後距離') && clean.includes('ヒット')) || clean.includes('enddisthit')) return true;
      if ((clean.includes('フレーム差') && clean.includes('ヒット')) || clean.includes('frameadvhit')) return true;
      if (clean === 'ver' || clean === 'ver.' || clean.includes('ver')) return true;
      return false;
    };

    const headers = Array.from(headerRow.querySelectorAll('th'));
    const targets = headers.filter((cell) => isTargetHeader(cell.textContent));
    if (!targets.length) return;

    const { cellPositions } = buildCellMatrixFromRows([headerRow, secondRow], { table: ui.table });
    const row2Map = new Map();
    Array.from(secondRow.querySelectorAll('td')).forEach((cell) => {
      const pos = cellPositions.get(cell);
      if (!pos) return;
      for (let c = pos.col; c < pos.col + pos.colspan; c += 1) {
        row2Map.set(c, cell);
      }
    });

    const removed = new Set();
    targets.forEach((cell) => {
      if (cell.getAttribute('rowspan') !== '2') {
        cell.setAttribute('rowspan', '2');
      }
      const pos = cellPositions.get(cell);
      if (!pos) return;
      for (let c = pos.col; c < pos.col + pos.colspan; c += 1) {
        const subCell = row2Map.get(c);
        if (!subCell || removed.has(subCell)) continue;
        if (!normalized(subCell.textContent)) {
          subCell.remove();
          removed.add(subCell);
        }
      }
    });

    const { cellPositions: updatedPositions } = buildCellMatrixFromRows([headerRow, secondRow], {
      table: ui.table,
    });
    const rowspanCols = new Set();
    Array.from(headerRow.children).forEach((cell) => {
      const span = Number(cell.getAttribute('rowspan') || 1);
      if (span < 2) return;
      const pos = updatedPositions.get(cell);
      if (!pos) return;
      for (let c = pos.col; c < pos.col + pos.colspan; c += 1) {
        rowspanCols.add(c);
      }
    });
    if (rowspanCols.size) {
      Array.from(secondRow.children).forEach((cell) => {
        const pos = updatedPositions.get(cell);
        if (!pos) return;
        let overlaps = false;
        for (let c = pos.col; c < pos.col + pos.colspan; c += 1) {
          if (rowspanCols.has(c)) {
            overlaps = true;
            break;
          }
        }
        if (overlaps) {
          cell.remove();
        }
      });
    }
  }

  function applyComboColumnWidths() {
    if (!ui.table || !ui.comboView) return;
    const rows = Array.from(ui.table.querySelectorAll('tr'));
    if (!rows.length) return;
    const scrollWrap = qs('comboTableScroll');
    const fieldColumnIndex = (field) => {
      if (!field) return null;
      const el = ui.table.querySelector(`[data-field="${field}"]`);
      if (!el) return null;
      const cell = el.closest('td,th');
      if (!cell) return null;
      return getCellColumnIndex(cell);
    };

    const totalCols = rows.reduce((maxCols, row) => {
      const cells = Array.from(row.children).filter((el) => el.tagName === 'TD' || el.tagName === 'TH');
      const count = cells.reduce((sum, cell) => sum + Number(cell.getAttribute('colspan') || 1), 0);
      return Math.max(maxCols, count);
    }, 0);

    let colgroup = ui.table.querySelector('colgroup.combo-cols');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      colgroup.className = 'combo-cols';
      ui.table.insertBefore(colgroup, ui.table.firstChild);
    }
    while (colgroup.children.length < totalCols) {
      colgroup.appendChild(document.createElement('col'));
    }
    while (colgroup.children.length > totalCols) {
      colgroup.removeChild(colgroup.lastChild);
    }

    const baseWidth =
      parseFloat(getComputedStyle(ui.comboView).getPropertyValue('--combo-col-size')) || 78;
    const widths = {};
    let commandCol = fieldColumnIndex('command');

    const fieldWidths = {
      control_mode: 78,
      distance: 65,
      position: 78,
      counter_type: 75,
      bo_state: 75,
      drive_req: 70,
      sa_req: 70,
      vs_character: 120,
      special_condition: 90,
      safe_jump: 70,
      interrupt: 65,
      oki: 70,
      drive_delta: 60,
      drive_delta_opponent: 60,
      drive_efficiency: 60,
      sa_delta: 60,
      sa_delta_opponent: 60,
    };

    const hiddenCols = enforceForcedHiddenColumns(new Set(state.hiddenColumns || []));
    if (!hiddenCols.size) {
      collectHiddenColumns(ui.table).forEach((colIndex) => hiddenCols.add(colIndex));
    }
    hiddenCols.forEach((colIndex) => {
      if (colIndex) widths[colIndex] = 0;
    });

    if (!commandCol) {
      const commandRow = rows.find((row) => getRowLabel(row) === 'command');
      if (commandRow) {
        const cells = Array.from(commandRow.querySelectorAll('td'));
        const labelIndex = findLabelCellIndex(commandRow, ['コマンド', 'command']);
        if (labelIndex >= 0) {
          let colPos = 1;
          cells.forEach((cell, idx) => {
            const span = Number(cell.getAttribute('colspan') || 1);
            if (idx === labelIndex + 1) {
              commandCol = colPos;
            }
            colPos += span;
          });
        }
      }
    }

    if (commandCol) widths[commandCol] = 440;

    Object.entries(fieldWidths).forEach(([field, width]) => {
      const colIndex = fieldColumnIndex(field);
      if (colIndex) widths[colIndex] = width;
    });

    const versionCol = fieldColumnIndex('game_version');
    if (versionCol) widths[versionCol] = 100;

    if (scrollWrap && commandCol && !isCompactColumnMode()) {
      const available = scrollWrap.clientWidth || 0;
      if (available) {
        let total = 0;
        for (let i = 1; i <= totalCols; i += 1) {
          total += widths[i] ?? baseWidth;
        }
        const commandBase = widths[commandCol] ?? baseWidth;
        const extra = available - total;
        if (extra > 0) {
          widths[commandCol] = commandBase + extra;
        }
      }
    }

    Array.from(colgroup.children).forEach((col, idx) => {
      const colIndex = idx + 1;
      const width = widths[colIndex] ?? baseWidth;
      col.style.width = `${width}px`;
      col.style.minWidth = `${width}px`;
      col.style.maxWidth = `${width}px`;
    });

    updateComboStickyOffsets();
    applyComboStickyColumns(ui.table);
    ensureComboHeaderTable();
  }

  function updateComboStickyOffsets() {
    if (!ui.table) return;
    const rows = ui.table.rows;
    if (!rows || rows.length < 2) return;
    const headerRow = rows[0];
    const subHeaderRow = rows[1];
    const firstCell = headerRow && headerRow.cells ? headerRow.cells[0] : null;
    const headerRect = headerRow ? headerRow.getBoundingClientRect() : null;
    const subHeaderRect = subHeaderRow ? subHeaderRow.getBoundingClientRect() : null;
    const headerHeight = headerRect ? headerRect.height : (headerRow ? headerRow.offsetHeight || 0 : 0);
    const borderBottom = firstCell
      ? Number.parseFloat(getComputedStyle(firstCell).borderBottomWidth) || 0
      : 0;
    const headerTop = Math.max(headerHeight + borderBottom, 25);
    const subHeaderHeight = subHeaderRect ? subHeaderRect.height : (subHeaderRow ? subHeaderRow.offsetHeight || 0 : 0);
    const safeHeaderHeight = Math.ceil(headerTop);
    const safeSubHeight = Math.ceil(Math.max(subHeaderHeight, 25));
    ui.table.style.setProperty('--combo-header-row-height', `${safeHeaderHeight}px`);
    ui.table.style.setProperty('--combo-subheader-row-height', `${safeSubHeight}px`);
    if (headerRow) {
      headerRow.style.height = `${safeHeaderHeight}px`;
      headerRow.style.minHeight = `${safeHeaderHeight}px`;
    }
    if (subHeaderRow) {
      subHeaderRow.style.height = `${safeSubHeight}px`;
      subHeaderRow.style.minHeight = `${safeSubHeight}px`;
    }
    const secondCell = headerRow && headerRow.cells ? headerRow.cells[1] : null;
    const firstWidth = firstCell
      ? firstCell.getBoundingClientRect().width || firstCell.offsetWidth || 0
      : 0;
    const secondWidth = secondCell
      ? secondCell.getBoundingClientRect().width || secondCell.offsetWidth || 0
      : 0;
    ui.table.style.setProperty('--combo-sticky-col1-width', `${Math.ceil(firstWidth || 0)}px`);
    ui.table.style.setProperty('--combo-sticky-col2-width', `${Math.ceil(secondWidth || 0)}px`);
  }

  function getFreezeColumnIndex() {
    if (!ui.table) return 3;
    const fieldColumnIndex = (field) => {
      if (!field) return null;
      const el = ui.table.querySelector(`[data-field="${field}"]`);
      if (!el) return null;
      const cell = el.closest('td,th');
      if (!cell) return null;
      return getCellColumnIndex(cell);
    };
    const buttonsCol = fieldColumnIndex('buttons');
    return Math.max(buttonsCol || 0, 2);
  }

  function applyComboStickyColumns(tableEl) {
    const table = tableEl || ui.table;
    if (!table) return;
    const rows = Array.from(table.rows || []);
    if (!rows.length) return;

    const freezeCol = getFreezeColumnIndex();
    const { cellPositions, colWidthsPx } = buildCellMatrixFromRows(rows, { skipHidden: false, table });
    const colgroup = table.querySelector('colgroup.combo-cols');
    const colWidths = [];
    if (colgroup) {
      Array.from(colgroup.children).forEach((col, idx) => {
        const width =
          Number.parseFloat(col.style.width) ||
          colWidthsPx[idx + 1] ||
          col.getBoundingClientRect().width ||
          col.offsetWidth ||
          0;
        colWidths[idx + 1] = Math.ceil(width);
      });
    }

    const leftOffsets = [];
    let offset = 0;
    for (let i = 1; i <= freezeCol; i += 1) {
      leftOffsets[i] = offset;
      offset += colWidths[i] || 0;
    }

    rows.forEach((row, rowIdx) => {
      const cells = Array.from(row.children).filter((el) => el.tagName === 'TD' || el.tagName === 'TH');
      cells.forEach((cell) => {
        const pos = cellPositions.get(cell);
        const colIndex = pos ? pos.col : null;
        const shouldSticky = colIndex && colIndex <= freezeCol;
        if (shouldSticky) {
          cell.classList.add('combo-sticky-col');
          cell.style.left = `${leftOffsets[colIndex] || 0}px`;
          cell.style.position = 'sticky';
          if (rowIdx === 0) {
            cell.style.zIndex = '30';
          } else if (rowIdx === 1) {
            cell.style.zIndex = '25';
          } else {
            cell.style.zIndex = '10';
          }
        } else {
          cell.classList.remove('combo-sticky-col');
          if (cell.style.position === 'sticky') cell.style.position = '';
          if (cell.style.left) cell.style.left = '';
          if (cell.style.zIndex) cell.style.zIndex = '';
        }
      });
    });
  }

  function ensureComboTableSections() {
    if (!ui.table) return;
    const rows = Array.from(ui.table.querySelectorAll('tr'));
    if (rows.length < 2) return;
    const headerRows = rows.slice(0, 2);
    const remainingRows = rows.slice(2);

    let thead = ui.table.querySelector('thead');
    let tbody = ui.table.querySelector('tbody');
    if (!thead) {
      thead = document.createElement('thead');
      ui.table.insertBefore(thead, ui.table.firstChild);
    }
    if (!tbody) {
      tbody = document.createElement('tbody');
      ui.table.appendChild(tbody);
    }

    headerRows.forEach((row) => {
      if (row.parentElement !== thead) {
        thead.appendChild(row);
      }
    });
    headerRows.forEach((row) => {
      Array.from(row.children).forEach((cell) => {
        if (cell.tagName && cell.tagName.toLowerCase() === 'td') {
          const th = document.createElement('th');
          th.className = cell.className;
          Array.from(cell.attributes).forEach((attr) => {
            if (attr.name === 'class') return;
            th.setAttribute(attr.name, attr.value);
          });
          th.innerHTML = cell.innerHTML;
          cell.replaceWith(th);
        }
      });
    });
    remainingRows.forEach((row) => {
      if (row.parentElement !== tbody) {
        tbody.appendChild(row);
      }
    });
  }

  function ensureComboHeaderTable() {
    if (!ui.comboView || !ui.table) return;
    const scrollWrap = qs('comboTableScroll');
    if (!scrollWrap) return;
    let headerWrap = qs('comboTableHeaderWrap');
    if (!headerWrap) {
      headerWrap = document.createElement('div');
      headerWrap.id = 'comboTableHeaderWrap';
      ui.comboView.appendChild(headerWrap);
    }
    let headerTable = qs('comboTableHeader');
    if (!headerTable) {
      headerTable = document.createElement('table');
      headerTable.id = 'comboTableHeader';
      headerWrap.appendChild(headerTable);
    }
    ui.headerWrap = headerWrap;
    ui.headerTable = headerTable;
    syncComboHeaderTable();
    if (scrollWrap.dataset.headerSync !== 'true') {
      scrollWrap.addEventListener('scroll', () => {
        if (ui.headerWrap) ui.headerWrap.scrollLeft = scrollWrap.scrollLeft;
      });
      scrollWrap.dataset.headerSync = 'true';
    }
  }

  function syncComboHeaderTable() {
    if (!ui.table || !ui.headerWrap || !ui.headerTable) return;
    const scrollWrap = qs('comboTableScroll');
    if (!scrollWrap) return;
    const thead = ui.table.tHead || ui.table.querySelector('thead');
    const headerRows = thead ? Array.from(thead.rows) : Array.from(ui.table.rows).slice(0, 2);
    if (!headerRows.length) return;

    ui.headerTable.innerHTML = '';
    const sourceColgroup = ui.table.querySelector('colgroup.combo-cols');
    if (sourceColgroup) {
      ui.headerTable.appendChild(sourceColgroup.cloneNode(true));
    }

    const headerThead = document.createElement('thead');
    headerRows.forEach((row) => {
      headerThead.appendChild(row.cloneNode(true));
    });
    ui.headerTable.appendChild(headerThead);
    cacheHeaderBaseSpans(ui.table);
    cacheHeaderBaseLabels(ui.table);
    syncHeaderBaseSpans(ui.table, ui.headerTable);
    ui.headerTable.style.width = `${ui.table.offsetWidth}px`;

    const left = Number.parseFloat(scrollWrap.style.left) || scrollWrap.offsetLeft || 0;
    const top = Number.parseFloat(scrollWrap.style.top) || scrollWrap.offsetTop || 0;
    ui.headerWrap.style.left = `${left}px`;
    ui.headerWrap.style.top = `${top}px`;
    ui.headerWrap.style.width = `${scrollWrap.clientWidth}px`;

    const headerHeight = headerRows.reduce((sum, row) => {
      const rect = row.getBoundingClientRect();
      return sum + (rect.height || row.offsetHeight || 0);
    }, 0);
    ui.headerWrap.style.height = `${Math.ceil(headerHeight)}px`;
    ui.headerWrap.scrollLeft = scrollWrap.scrollLeft;

    bindComboHeaderSort();
    applyComboStickyColumns(ui.headerTable);
    updateSortIndicators();
    applyComboHeaderTranslations(ui.headerTable, getComboLang());
    applyHiddenColumns();
    applyComboVerticalSeparators();
  }

  function bindComboHeaderSort() {
    if (!ui.headerTable || ui.headerTable.dataset.sortBound === 'true') return;
    ui.headerTable.addEventListener('click', (ev) => {
      const cell = ev.target.closest('.combo-sortable');
      if (!cell) return;
      const field = cell.dataset ? cell.dataset.sortField : '';
      if (!field) return;
      const nextDirection = state.sort.field === field ? state.sort.direction * -1 : 1;
      applySort(field, nextDirection);
    });
    ui.headerTable.dataset.sortBound = 'true';
  }

  function collectHiddenColumns(table) {
    const hidden = new Set();
    if (!table) return hidden;
    Array.from(table.rows).forEach((row) => {
      let col = 1;
      Array.from(row.children).forEach((cell) => {
        const span = Number(cell.getAttribute('colspan') || 1);
        if (span === 1 && cell.classList.contains('combo-hidden-col')) {
          hidden.add(col);
        }
        col += span;
      });
    });
    return hidden;
  }

  function normalizeHeaderLabel(text) {
    return String(text || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function applyHiddenColumns() {
    const hiddenCols = enforceForcedHiddenColumns(new Set(state.hiddenColumns || []));
    const compact = isCompactColumnMode();
    const tables = [ui.table, ui.headerTable].filter(Boolean);
    const entryMap = new Map();
    if (state.baseColumnEntries && state.baseColumnEntries.length) {
      state.baseColumnEntries.forEach((entry) => {
        entryMap.set(entry.label, entry.columns.slice());
      });
    }
    tables.forEach((table) => {
      applyHiddenColumnsToColgroup(table, hiddenCols, compact);
      const rows = Array.from(table.rows || []);
      const { cellPositions } = buildCellMatrixFromRows(rows, { table });
      const thead = table.tHead || table.querySelector('thead');
      const headerRows = thead ? Array.from(thead.rows) : [];
      const headerRow1 = headerRows[0] || null;
      const headerRow2 = headerRows[1] || null;
      rows.forEach((row) => {
        Array.from(row.children).forEach((cell) => {
          const pos = cellPositions.get(cell);
          if (!pos) return;
          let shouldHide = pos.colspan === 1 && hiddenCols.has(pos.col);
          if (row === headerRow2) {
            const baseCol = Number.parseInt(cell.dataset.baseColStart || '', 10);
            const baseSpan = Number.parseInt(cell.dataset.baseColspan || '', 10) || pos.colspan || 1;
            if (Number.isFinite(baseCol) && baseCol > 0) {
              let visibleCount = 0;
              for (let c = baseCol; c < baseCol + baseSpan; c += 1) {
                if (!hiddenCols.has(c)) visibleCount += 1;
              }
              shouldHide = visibleCount <= 0;
            }
          }
          if (row === headerRow2 && state.columnPreset === 'simple') {
            const baseGroup = normalizeHeaderLabel(cell.dataset.baseGroup || '');
            const baseLabel = normalizeHeaderLabel(cell.dataset.baseLabel || cell.textContent || '');
            if (baseGroup === 'ダメージ') {
              if (baseLabel !== '通常') {
                shouldHide = true;
              } else {
                shouldHide = false;
              }
            }
          }
          if (!shouldHide && entryMap.size && row === headerRow2 && pos.colspan > 1) {
            const baseSub = normalizeHeaderLabel(cell.dataset.baseLabel || cell.textContent || '');
            let groupLabel = normalizeHeaderLabel(cell.dataset.baseGroup || '');
            if (!groupLabel && headerRow1) {
              const groupCell = Array.from(headerRow1.cells).find((headerCell) => {
                const hpos = cellPositions.get(headerCell);
                if (!hpos) return false;
                return pos.col >= hpos.col && pos.col <= hpos.col + hpos.colspan - 1;
              });
              if (groupCell) groupLabel = normalizeHeaderLabel(groupCell.textContent || '');
            }
            const subLabel = baseSub;
            if (subLabel) {
              const key = groupLabel && groupLabel !== subLabel ? `${groupLabel}/${subLabel}` : subLabel;
              const cols = entryMap.get(key);
              if (cols && cols.length && cols.every((colIndex) => hiddenCols.has(colIndex))) {
                shouldHide = true;
              }
            }
          }
          cell.classList.toggle('combo-hidden-col', shouldHide);
          if (shouldHide && compact) {
            cell.style.display = 'none';
          } else if (cell.style.display === 'none') {
            cell.style.display = '';
          }
        });
      });
      updateHeaderGroupSpans(table);
    });
    applyComboVerticalSeparators();
  }

  function applyHiddenColumnsToColgroup(table, hiddenCols, compact) {
    if (!table) return;
    const colgroup = table.querySelector('colgroup.combo-cols');
    if (!colgroup) return;
    Array.from(colgroup.children).forEach((col, idx) => {
      const colIndex = idx + 1;
      const shouldHide = hiddenCols.has(colIndex);
      if (compact && shouldHide) {
        col.style.display = 'none';
      } else if (col.style.display === 'none') {
        col.style.display = '';
      }
    });
  }

  function updateHeaderGroupSpans(table) {
    if (!table) return;
    const thead = table.tHead || table.querySelector('thead');
    if (!thead || !thead.rows.length) return;
    const row1 = thead.rows[0];
    const row2 = thead.rows[1] || null;
    if (!row1) return;
    const headerRows = row2 ? [row1, row2] : [row1];
    const { cellPositions } = buildCellMatrixFromRows(headerRows, { table });
    const hiddenCols = enforceForcedHiddenColumns(new Set(state.hiddenColumns || []));
    const compact = isCompactColumnMode();

    Array.from(row1.cells).forEach((cell) => {
      const pos = cellPositions.get(cell);
      if (!pos) return;
      if (!cell.dataset.baseColspan) {
        cell.dataset.baseColspan = String(pos.colspan || 1);
      }
      if (!cell.dataset.baseColStart) {
        cell.dataset.baseColStart = String(pos.col || 1);
      }
      const baseCol = Number.parseInt(cell.dataset.baseColStart, 10) || pos.col || 1;
      const baseSpan = Number.parseInt(cell.dataset.baseColspan, 10) || pos.colspan || 1;
      let visibleCount = 0;
      for (let c = baseCol; c < baseCol + baseSpan; c += 1) {
        if (!hiddenCols.has(c)) visibleCount += 1;
      }
      if (visibleCount <= 0) {
        cell.classList.add('combo-hidden-col');
        cell.style.display = 'none';
      } else {
        cell.classList.remove('combo-hidden-col');
        if (cell.style.display === 'none') cell.style.display = '';
        const nextSpan = compact && baseSpan > 1 ? visibleCount : baseSpan;
        cell.setAttribute('colspan', String(nextSpan));
      }
    });
  }

  function cacheHeaderBaseSpans(table, force = false) {
    if (!table) return;
    const thead = table.tHead || table.querySelector('thead');
    if (!thead || !thead.rows.length) return;
    const row1 = thead.rows[0];
    const row2 = thead.rows[1] || null;
    if (!row1) return;
    const headerRows = row2 ? [row1, row2] : [row1];
    const { cellPositions } = buildCellMatrixFromRows(headerRows, { table });
    Array.from(row1.cells).forEach((cell) => {
      const pos = cellPositions.get(cell);
      if (!pos) return;
      if (force || !cell.dataset.baseColspan) {
        cell.dataset.baseColspan = String(pos.colspan || 1);
      }
      if (force || !cell.dataset.baseColStart) {
        cell.dataset.baseColStart = String(pos.col || 1);
      }
      if (force || !cell.dataset.baseRowspan) {
        cell.dataset.baseRowspan = String(cell.rowSpan || 1);
      }
    });
  }

  function cacheHeaderBaseLabels(table, force = false) {
    if (!table) return;
    const thead = table.tHead || table.querySelector('thead');
    if (!thead || !thead.rows.length) return;
    const row1 = thead.rows[0];
    const row2 = thead.rows[1] || null;
    if (!row2) return;
    const headerRows = [row1, row2];
    const { cellPositions } = buildCellMatrixFromRows(headerRows, { table });
    Array.from(row2.cells).forEach((cell) => {
      if (force || !cell.dataset.baseLabel) {
        cell.dataset.baseLabel = normalizeHeaderLabel(cell.textContent || '');
      }
      if (force || !cell.dataset.baseGroup) {
        let groupLabel = '';
        const pos = cellPositions.get(cell);
        if (pos && row1) {
          const groupCell = Array.from(row1.cells).find((headerCell) => {
            const hpos = cellPositions.get(headerCell);
            if (!hpos) return false;
            return pos.col >= hpos.col && pos.col <= hpos.col + hpos.colspan - 1;
          });
          if (groupCell) groupLabel = normalizeHeaderLabel(groupCell.textContent || '');
        }
        cell.dataset.baseGroup = groupLabel;
      }
      if (force || !cell.dataset.baseColStart) {
        const pos = cellPositions.get(cell);
        if (pos) {
          cell.dataset.baseColStart = String(pos.col || 1);
          cell.dataset.baseColspan = String(pos.colspan || 1);
        }
      }
    });
  }

  function resetHeaderSpans(table) {
    if (!table) return;
    const thead = table.tHead || table.querySelector('thead');
    if (!thead || !thead.rows.length) return;
    const row1 = thead.rows[0];
    if (!row1) return;
    Array.from(row1.cells).forEach((cell) => {
      if (cell.dataset.baseColspan) {
        cell.setAttribute('colspan', cell.dataset.baseColspan);
      }
      if (cell.dataset.baseRowspan) {
        cell.setAttribute('rowspan', cell.dataset.baseRowspan);
      }
      cell.classList.remove('combo-hidden-col');
      if (cell.style.display === 'none') cell.style.display = '';
    });
  }

  function syncHeaderBaseSpans(sourceTable, targetTable) {
    if (!sourceTable || !targetTable) return;
    const sourceHead = sourceTable.tHead || sourceTable.querySelector('thead');
    const targetHead = targetTable.tHead || targetTable.querySelector('thead');
    if (!sourceHead || !targetHead) return;
    const sourceRow = sourceHead.rows[0];
    const targetRow = targetHead.rows[0];
    if (!sourceRow || !targetRow) return;
    const sourceCells = Array.from(sourceRow.cells);
    const targetCells = Array.from(targetRow.cells);
    sourceCells.forEach((cell, idx) => {
      const target = targetCells[idx];
      if (!target) return;
      if (cell.dataset.baseColspan) target.dataset.baseColspan = cell.dataset.baseColspan;
      if (cell.dataset.baseColStart) target.dataset.baseColStart = cell.dataset.baseColStart;
    });
    const sourceRow2 = sourceHead.rows[1] || null;
    const targetRow2 = targetHead.rows[1] || null;
    if (!sourceRow2 || !targetRow2) return;
    const sourceCells2 = Array.from(sourceRow2.cells);
    const targetCells2 = Array.from(targetRow2.cells);
    sourceCells2.forEach((cell, idx) => {
      const target = targetCells2[idx];
      if (!target) return;
      if (cell.dataset.baseLabel) target.dataset.baseLabel = cell.dataset.baseLabel;
      if (cell.dataset.baseGroup) target.dataset.baseGroup = cell.dataset.baseGroup;
      if (cell.dataset.baseColStart) target.dataset.baseColStart = cell.dataset.baseColStart;
      if (cell.dataset.baseColspan) target.dataset.baseColspan = cell.dataset.baseColspan;
    });
  }

  function getFieldColumnMap() {
    const map = new Map();
    const firstGroup = state.groups && state.groups[0];
    if (!firstGroup || !firstGroup.inputs) return map;
    Object.entries(firstGroup.inputs).forEach(([field, input]) => {
      if (!input) return;
      const cell = input.closest('td,th');
      if (!cell) return;
      const colIndex = getCellColumnIndex(cell);
      if (!colIndex) return;
      map.set(field, colIndex);
    });
    return map;
  }

  function getForcedHiddenColumns(fieldMapOverride = null) {
    const fieldMap = fieldMapOverride || getFieldColumnMap();
    const cols = new Set();
    ALWAYS_HIDDEN_FIELDS.forEach((field) => {
      const colIndex = Number(fieldMap.get(field) || 0);
      if (colIndex > 0) cols.add(colIndex);
    });
    return cols;
  }

  function enforceForcedHiddenColumns(hiddenSet, fieldMapOverride = null) {
    const next = hiddenSet instanceof Set ? new Set(hiddenSet) : new Set(hiddenSet || []);
    const forced = getForcedHiddenColumns(fieldMapOverride);
    forced.forEach((colIndex) => next.add(colIndex));
    return next;
  }

  function getComboSeparatorColumns() {
    const fieldMap = getFieldColumnMap();
    const boundaryFields = [
      'special_condition',
      'damage_punish_ca',
      'd_pc',
      'drive_delta_opponent',
      'drive_efficiency',
      'sa_delta_opponent',
    ];
    const boundaryCols = new Set();
    boundaryFields.forEach((field) => {
      const col = Number(fieldMap.get(field) || 0);
      if (col > 0) boundaryCols.add(col);
    });
    const tailCols = new Set();
    const tailStart = FIELD_ORDER.indexOf('sa_delta_opponent');
    if (tailStart >= 0) {
      for (let i = tailStart; i < FIELD_ORDER.length; i += 1) {
        const col = Number(fieldMap.get(FIELD_ORDER[i]) || 0);
        if (col > 0) {
          boundaryCols.add(col);
          tailCols.add(col);
        }
      }
    }
    return { boundaryCols, tailCols };
  }

  function applyComboVerticalSeparators() {
    const { boundaryCols, tailCols } = getComboSeparatorColumns();
    const tables = [ui.table, ui.headerTable].filter(Boolean);
    tables.forEach((table) => {
      table.querySelectorAll('.combo-sep-right, .combo-sep-right-tail').forEach((cell) => {
        cell.classList.remove('combo-sep-right', 'combo-sep-right-tail');
      });
      if (!boundaryCols.size) return;
      const rows = Array.from(table.rows || []);
      if (!rows.length) return;
      const { cellPositions } = buildCellMatrixFromRows(rows, { table });
      rows.forEach((row) => {
        const isFrameOrNotesRow = row.classList
          && (row.classList.contains('combo-row-frame') || row.classList.contains('combo-row-notes'));
        if (isFrameOrNotesRow) return;
        Array.from(row.children || []).forEach((cell) => {
          const pos = cellPositions.get(cell);
          if (!pos) return;
          const colEnd = pos.col + pos.colspan - 1;
          if (!boundaryCols.has(colEnd)) return;
          cell.classList.add('combo-sep-right');
          if (tailCols.has(colEnd)) {
            cell.classList.add('combo-sep-right-tail');
          }
        });
      });
    });
  }

  function buildComboColumnEntriesFromHeader(table) {
    if (!table) return [];
    const thead = table.tHead || table.querySelector('thead');
    const headerRows = thead ? Array.from(thead.rows) : Array.from(table.rows).slice(0, 2);
    if (!headerRows.length) return [];
    const row1 = headerRows[0];
    const row2 = headerRows[1] || null;
    const { cellPositions, colCount } = buildCellMatrixFromRows(headerRows, { table });
    const cellFor = (row, colIndex) => {
      if (!row) return null;
      const cells = Array.from(row.cells || []);
      return (
        cells.find((cell) => {
          const pos = cellPositions.get(cell);
          if (!pos) return false;
          return colIndex >= pos.col && colIndex <= pos.col + pos.colspan - 1;
        }) || null
      );
    };

    const entries = new Map();
    for (let col = 1; col <= colCount; col += 1) {
      if (col === 1) continue;
      const subCell = row2 ? cellFor(row2, col) : null;
      const subLabel = normalizeHeaderLabel(subCell ? subCell.textContent : '');
      const groupCell = cellFor(row1, col);
      const groupLabel = normalizeHeaderLabel(groupCell ? groupCell.textContent : '');
      let leafCell = subCell;
      let leafLabel = subLabel;
      if (!leafLabel) {
        leafCell = groupCell;
        leafLabel = groupLabel;
      }
      if (!leafCell || !leafLabel) continue;
      const key = leafCell;
      if (!entries.has(key)) {
        let label = leafLabel;
        if (leafCell !== groupCell && groupLabel && groupLabel !== leafLabel) {
          label = `${groupLabel}/${leafLabel}`;
        }
        entries.set(key, {
          label,
          columns: [],
          colStart: col,
        });
      }
      const entry = entries.get(key);
      entry.columns.push(col);
      entry.colStart = Math.min(entry.colStart, col);
    }
    return Array.from(entries.values()).sort((a, b) => a.colStart - b.colStart);
  }

  function getComboColumnEntries() {
    if (state.baseColumnEntries && state.baseColumnEntries.length) {
      return state.baseColumnEntries.map((entry) => ({
        label: entry.label,
        columns: entry.columns.slice(),
        colStart: entry.colStart,
      }));
    }
    return buildComboColumnEntriesFromHeader(ui.table);
  }

  function ensureComboColumnTogglePanel() {
    if (!ui.comboView) return null;
    let panel = qs('comboColumnTogglePanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'comboColumnTogglePanel';
      panel.className = 'combo-col-panel hidden';
      ui.comboView.appendChild(panel);
      panel.addEventListener('click', (ev) => ev.stopPropagation());
    }
    if (!document.body.dataset.comboColumnToggleBound) {
      document.addEventListener('click', () => {
        if (!panel || panel.classList.contains('hidden')) return;
        panel.classList.add('hidden');
      });
      document.body.dataset.comboColumnToggleBound = 'true';
    }
    return panel;
  }

  function renderComboColumnPanel(panel, entries) {
    if (!panel) return;
    panel.innerHTML = '';
    if (!entries || !entries.length) return;
    const forcedHiddenCols = getForcedHiddenColumns();
    const grid = document.createElement('div');
    grid.className = 'combo-col-panel-grid';
    entries.forEach((entry) => {
      if ((entry.columns || []).some((col) => forcedHiddenCols.has(col))) return;
      const label = document.createElement('label');
      label.className = 'combo-col-checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.columns = entry.columns.join(',');
      const hiddenCount = entry.columns.filter((col) => state.hiddenColumns.has(col)).length;
      input.checked = hiddenCount === 0;
      input.indeterminate = hiddenCount > 0 && hiddenCount < entry.columns.length;
      input.addEventListener('change', () => {
        const cols = (input.dataset.columns || '')
          .split(',')
          .map((val) => Number.parseInt(val, 10))
          .filter((val) => Number.isFinite(val));
        setComboColumnsHidden(cols, !input.checked);
      });
      const text = document.createElement('span');
      text.textContent = entry.label;
      label.appendChild(input);
      label.appendChild(text);
      grid.appendChild(label);
    });
    panel.appendChild(grid);
  }

  function setComboColumnsHidden(columns, hidden) {
    if (!columns || !columns.length) return;
    const forcedHiddenCols = getForcedHiddenColumns();
    let changed = false;
    columns.forEach((col) => {
      if (!Number.isFinite(col)) return;
      if (hidden) {
        if (!state.hiddenColumns.has(col)) {
          state.hiddenColumns.add(col);
          changed = true;
        }
      } else if (!forcedHiddenCols.has(col) && state.hiddenColumns.has(col)) {
        state.hiddenColumns.delete(col);
        changed = true;
      }
    });
    if (!changed) return;
    state.columnPreset = 'custom';
    state.customHiddenColumns = new Set(state.hiddenColumns);
    resetHeaderSpans(ui.table);
    updateColumnCompactMode();
    applyHiddenColumns();
    applyComboColumnWidths();
    updatePresetButtons();
    if (ui.headerTable) {
      syncComboHeaderTable();
    }
    saveUiPrefs();
  }

  function getVisibleFieldSet(presetKey) {
    const fieldMap = getFieldColumnMap();
    if (!fieldMap.size) return new Set();
    if (!presetKey || presetKey === 'full' || presetKey === 'all') {
      const visibleAll = new Set(fieldMap.keys());
      ALWAYS_HIDDEN_FIELDS.forEach((field) => visibleAll.delete(field));
      return visibleAll;
    }
    const preset = COLUMN_PRESETS.find((item) => item.key === presetKey);
    const visible = new Set(ALWAYS_VISIBLE_FIELDS);
    if (preset && Array.isArray(preset.fields)) {
      preset.fields.forEach((field) => visible.add(field));
    }
    ALWAYS_HIDDEN_FIELDS.forEach((field) => visible.delete(field));
    return visible;
  }

  function isCompactColumnMode() {
    const hidden = Array.from(state.hiddenColumns || []).filter((col) => col > 1);
    return hidden.length > 0;
  }

  function updateColumnCompactMode() {
    if (!ui.comboView) return;
    ui.comboView.classList.toggle('combo-compact-cols', isCompactColumnMode());
  }

  function applyColumnPreset(presetKey) {
    const fieldMap = getFieldColumnMap();
    if (!fieldMap.size) return;
    resetHeaderSpans(ui.table);
    if (presetKey === 'custom') {
      const nextHidden = (state.customHiddenColumns && state.customHiddenColumns.size)
        ? new Set(state.customHiddenColumns)
        : new Set(state.hiddenColumns || []);
      const enforcedHidden = enforceForcedHiddenColumns(nextHidden, fieldMap);
      state.hiddenColumns = enforcedHidden;
      state.customHiddenColumns = new Set(enforcedHidden);
      state.columnPreset = 'custom';
      updateColumnCompactMode();
      applyHiddenColumns();
      applyComboColumnWidths();
      updatePresetButtons();
      if (ui.headerTable) {
        syncComboHeaderTable();
      }
      const panel = qs('comboColumnTogglePanel');
      if (panel && !panel.classList.contains('hidden')) {
        const entries = getComboColumnEntries();
        renderComboColumnPanel(panel, entries);
      }
      saveUiPrefs();
      return;
    }
    const visibleFields = getVisibleFieldSet(presetKey);
    const nextHidden = new Set();
    fieldMap.forEach((colIndex, field) => {
      if (!visibleFields.has(field)) {
        nextHidden.add(colIndex);
      }
    });
    const enforcedHidden = enforceForcedHiddenColumns(nextHidden, fieldMap);
    state.hiddenColumns = enforcedHidden;
    state.columnPreset = presetKey || 'custom';
    updateColumnCompactMode();
    applyHiddenColumns();
    applyComboColumnWidths();
    updatePresetButtons();
    if (ui.headerTable) {
      syncComboHeaderTable();
    }
    const panel = qs('comboColumnTogglePanel');
    if (panel && !panel.classList.contains('hidden')) {
      const entries = getComboColumnEntries();
      renderComboColumnPanel(panel, entries);
    }
    saveUiPrefs();
  }

  function positionColumnEditPanel(panel, anchor) {
    if (!panel || !anchor || !ui.comboView) return;
    const parentRect = ui.comboView.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || 280;
    const left = Math.max(8, anchorRect.right - parentRect.left - panelWidth);
    const top = Math.max(0, anchorRect.bottom - parentRect.top + 6);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function ensureColumnPresetControls() {
    if (!ui.comboView) return;
    const rowToggles = qs('comboRowToggles');
    if (!rowToggles) return;
    let controls = qs('comboColumnControls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'comboColumnControls';
      controls.className = 'combo-col-controls';
      rowToggles.appendChild(controls);
    }
    if (controls.dataset.built === 'true') return;
    controls.dataset.built = 'true';

    const label = document.createElement('span');
    label.className = 'combo-col-label';
    label.textContent = comboT('columns.label') || '列:';
    controls.appendChild(label);

    const presetWrap = document.createElement('div');
    presetWrap.className = 'combo-col-presets';
    COLUMN_PRESETS.forEach((preset) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'combo-action-btn combo-col-preset';
      btn.dataset.preset = preset.key;
      btn.dataset.i18nKey = preset.labelKey || '';
      btn.textContent = comboT(preset.labelKey || '') || preset.label;
      btn.addEventListener('click', (ev) => {
        if (preset.custom) {
          ev.stopPropagation();
          applyColumnPreset('custom');
          const panel = ensureComboColumnTogglePanel();
          if (!panel) return;
          const entries = getComboColumnEntries();
          renderComboColumnPanel(panel, entries);
          panel.classList.toggle('hidden');
          if (!panel.classList.contains('hidden')) {
            positionColumnEditPanel(panel, btn);
          }
          state.columnPreset = 'custom';
          updatePresetButtons();
          return;
        }
        applyColumnPreset(preset.key);
      });
      presetWrap.appendChild(btn);
    });
    controls.appendChild(presetWrap);
    updatePresetButtons();
  }

  function updatePresetButtons() {
    const controls = qs('comboColumnControls');
    if (!controls) return;
    const activeKey = state.columnPreset || 'full';
    controls.querySelectorAll('.combo-col-preset').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.preset === activeKey);
    });
  }

  function forceColumnWidthByField(rows, field, width) {
    if (!ui.table || !rows || !rows.length || !field || !width) return;
    const fieldEl = ui.table.querySelector(`[data-field="${field}"]`);
    if (!fieldEl) return;
    const baseCell = fieldEl.closest('td,th');
    if (!baseCell || !baseCell.parentElement) return;
    const columnIndex = getCellColumnIndex(baseCell);
    if (!columnIndex) return;

    rows.forEach((row) => {
      const cell = getCellAtColumn(row, columnIndex);
      if (!cell) return;
      const span = Number(cell.getAttribute('colspan') || 1);
      if (span !== 1) return;
      cell.style.setProperty('width', `${width}px`, 'important');
      cell.style.setProperty('min-width', `${width}px`, 'important');
      cell.style.setProperty('max-width', `${width}px`, 'important');
    });
  }

  function getCellColumnIndex(cell) {
    const row = cell.parentElement;
    if (!row) return null;
    let col = 1;
    for (const item of Array.from(row.children)) {
      const span = Number(item.getAttribute('colspan') || 1);
      if (item === cell) return col;
      col += span;
    }
    return null;
  }

  function getCellAtColumn(row, columnIndex) {
    let col = 1;
    for (const item of Array.from(row.children)) {
      const span = Number(item.getAttribute('colspan') || 1);
      const end = col + span - 1;
      if (columnIndex >= col && columnIndex <= end) return item;
      col += span;
    }
    return null;
  }


  function buildFrameRow(group) {
    const row = group.rows.frame_meter;
    if (!row) return;
    const cells = row.querySelectorAll('td');
    const labelIndex = findLabelCellIndex(row, ['フレーム', 'frame']);
    if (labelIndex < 0) return;
    const labelCell = cells[labelIndex];
    if (!labelCell) return;
    const labelCol = getCellColumnIndex(labelCell);
    if (!labelCol) return;
    const targetCell = getCellAtColumn(row, labelCol + 1);
    if (!targetCell) return;
    placeControl(targetCell, buildInput('frame_meter', group, { type: 'text' }));
  }

  function placeControl(cell, control) {
    if (!cell || !control) return;
    const target = cell.querySelector('p') || cell;
    while (target.firstChild) target.removeChild(target.firstChild);
    target.appendChild(control);
  }

  function buildInput(field, group, opts = {}) {
    const input = field === 'combo_notes'
      ? document.createElement('textarea')
      : document.createElement('input');
    const isNumeric = NUMERIC_FIELDS.has(field);
    if (input.tagName === 'INPUT') {
      input.type = isNumeric ? 'text' : (opts.type || 'text');
    } else {
      input.rows = 1;
      input.wrap = 'soft';
    }
    if (opts.step) input.step = opts.step;
    input.className = 'cell-input';
    input.dataset.field = field;
    input.dataset.row = String(group.index);
    input.autocomplete = 'off';
    input.spellcheck = false;
    if (isNumeric) {
      input.inputMode = 'numeric';
      input.dataset.numeric = 'true';
    }
    group.inputs[field] = input;
    return input;
  }

  function buildSelect(field, group, options) {
    const select = document.createElement('select');
    select.dataset.field = field;
    select.dataset.row = String(group.index);
    options.forEach((opt) => {
      select.appendChild(new Option(opt.label, opt.value));
    });
    group.inputs[field] = select;
    return select;
  }

  function buildContentEditable(field, group) {
    const span = document.createElement('span');
    span.className = 'cmd-input';
    span.dataset.field = field;
    span.dataset.row = String(group.index);
    if (field === 'buttons') {
      span.contentEditable = 'false';
      span.tabIndex = -1;
      span.classList.add('cmd-output');
      span.setAttribute('aria-readonly', 'true');
    } else {
      span.contentEditable = 'true';
      span.tabIndex = 0;
    }
    if (field === 'command') {
      span.style.setProperty('font-size', 'var(--command-font-size, 12px)', 'important');
      span.style.setProperty('line-height', '1.1', 'important');
    }
    group.inputs[field] = span;
    return span;
  }

  function buildMultiInput(field, group, options) {
    const input = buildInput(field, group, { type: 'text' });
    input.classList.add('multi-input');
    input.dataset.options = JSON.stringify(options || []);
    return input;
  }

  function getRowLabel(row) {
    const cells = row.querySelectorAll('td');
    if (!cells.length) return '';
    for (const cell of Array.from(cells)) {
      const labelText = (cell.textContent || '').replace(/\s+/g, '').toLowerCase();
      if (!labelText) continue;
      if (labelText.includes('コマンド') || labelText.includes('command')) return 'command';
      if (labelText.includes('ボタン') || labelText.includes('button')) return 'buttons';
      if (labelText.includes('備考') || labelText.includes('note')) return 'notes';
      if (labelText.includes('フレーム') || labelText.includes('frame')) return 'frame_meter';
    }
    return '';
  }

  function getFrameMeterLabelHtml(lang, withBreak) {
    const active = lang || getComboLang();
    if (active === 'en') return withBreak ? 'Frame<br>Meter' : 'Frame Meter';
    return withBreak ? 'フレーム<br>メーター' : 'フレームメーター';
  }

  function ensureFrameMeterLabelBreak(row, groupIndex) {
    if (!row || groupIndex < 2) return;
    const cell = row.querySelector('td');
    if (!cell) return;
    const target = cell.querySelector('p') || cell;
    target.innerHTML = getFrameMeterLabelHtml(getComboLang(), true);
  }

  function applyComboHeaderTranslations(table, lang) {
    if (!table) return;
    const activeLang = lang || getComboLang();
    const headerRows = table.tHead
      ? Array.from(table.tHead.rows).slice(0, 2)
      : Array.from(table.rows).slice(0, 2);
    headerRows.forEach((row) => {
      Array.from(row.children).forEach((cell) => {
        const text = normalizeComboLabel(cell.textContent);
        const entry = COMBO_HEADER_LOOKUP.get(text);
        if (!entry) return;
        if (!cell.dataset.i18nJp) cell.dataset.i18nJp = cell.innerHTML;
        if (!cell.dataset.i18nEn) cell.dataset.i18nEn = entry.en;
        if (activeLang === 'en') {
          cell.innerHTML = cell.dataset.i18nEn;
        } else {
          cell.innerHTML = cell.dataset.i18nJp;
        }
      });
    });
    applyComboHeaderTooltips(table, activeLang);
  }

  function applyComboRowLabels(lang) {
    if (!ui.table) return;
    const active = lang || getComboLang();
    Array.from(ui.table.querySelectorAll('tr')).forEach((row) => {
      const labelKey = row.dataset && row.dataset.rowLabel ? row.dataset.rowLabel : getRowLabel(row);
      if (!labelKey) return;
      const cell = row.querySelector('td');
      if (!cell) return;
      const target = cell.querySelector('p') || cell;
      if (labelKey === 'frame_meter') {
        const idx = Number(row.dataset.row || 0);
        target.innerHTML = getFrameMeterLabelHtml(active, idx >= 2);
        return;
      }
      const text = comboT(`rows.${labelKey}`, active);
      if (text) target.textContent = text;
    });
  }

  function applyComboFilterLabels(lang) {
    const panel = qs('comboFilterPanel');
    if (!panel) return;
    const active = lang || getComboLang();
    const rangeSummary = panel.querySelector('.search-advanced-additional-options summary');
    if (rangeSummary) {
      rangeSummary.textContent = comboT('filter.range_title', active) || rangeSummary.textContent;
    }
    const labelMap = {
      field_search: comboT('filter.field_search', active),
      control: comboT('filter.control', active),
      distance: comboT('filter.distance', active),
      position: comboT('filter.position', active),
      counter: comboT('filter.counter', active),
      bo: comboT('filter.bo', active),
      vs: comboT('filter.vs', active),
      interrupt: comboT('filter.interrupt', active),
      safe_jump: comboT('filter.safe_jump', active),
      special: comboT('filter.special', active),
      version: comboT('filter.version', active),
    };
    panel.querySelectorAll('.control-label').forEach((label) => {
      if (!label.dataset.i18nKey) {
        const text = (label.textContent || '').replace(/\s+/g, '');
        if (text.includes('フィールド検索') || text.toLowerCase().includes('fieldsearch')) label.dataset.i18nKey = 'field_search';
        else if (text.includes('操作方法') || text.toLowerCase().includes('control')) label.dataset.i18nKey = 'control';
        else if (text.includes('距離') || text.toLowerCase().includes('distance')) label.dataset.i18nKey = 'distance';
        else if (text.includes('位置') || text.toLowerCase().includes('position')) label.dataset.i18nKey = 'position';
        else if (text.includes('カウンター') || text.toLowerCase().includes('counter')) label.dataset.i18nKey = 'counter';
        else if (text.includes('BO') || text.toLowerCase().includes('bo')) label.dataset.i18nKey = 'bo';
        else if (text.includes('対応キャラ') || text.toLowerCase().includes('vs')) label.dataset.i18nKey = 'vs';
        else if (text.includes('割込') || text.toLowerCase().includes('interrupt')) label.dataset.i18nKey = 'interrupt';
        else if (text.includes('詐欺') || text.toLowerCase().includes('safe')) label.dataset.i18nKey = 'safe_jump';
        else if (text.includes('特殊条件') || text.toLowerCase().includes('special')) label.dataset.i18nKey = 'special';
        else if (text.toLowerCase().includes('ver')) label.dataset.i18nKey = 'version';
      }
      const key = label.dataset.i18nKey;
      if (key && labelMap[key]) label.textContent = labelMap[key];
    });
    const fieldInput = panel.querySelector('#comboFilterFieldQuery');
    if (fieldInput) fieldInput.setAttribute('placeholder', comboT('filter.keyword', active) || 'Keyword');
    const fieldLabel = panel.querySelector('.field-search-inline-label');
    if (fieldLabel) fieldLabel.textContent = comboT('filter.field_spec', active) || 'Field:';

    panel.querySelectorAll('label.checkbox-item').forEach((label) => {
      const input = label.querySelector('input');
      const span = label.querySelector('span');
      if (!input || !span) return;
      const name = input.name || '';
      if (name.includes('comboFilter-field')) {
        if (input.value === 'command') span.textContent = comboT('rows.command', active) || 'Command';
        if (input.value === 'notes') span.textContent = comboT('rows.notes', active) || 'Notes';
        if (input.value === 'oki') span.textContent = comboT('filter.oki', active) || 'Meaty';
      } else if (name.includes('comboFilter-mode')) {
        if (input.value === 'classic') span.textContent = comboValueLabel('classic', 'Classic', active);
        if (input.value === 'modern') span.textContent = comboValueLabel('modern', 'Modern', active);
        if (input.value === 'both') span.textContent = comboValueLabel('both', '両方', active);
      } else if (name.includes('comboFilter-position')) {
        if (input.value === '地上') span.textContent = comboValueLabel('ground', '地上', active);
        if (input.value === '空中') span.textContent = comboValueLabel('air', '空中', active);
        if (input.value === '壁') span.textContent = comboValueLabel('wall', '壁', active);
        if (input.value === '逆壁') span.textContent = comboValueLabel('reverse_wall', '逆壁', active);
        if (input.value === '壁付近') span.textContent = comboValueLabel('near_wall', '壁付近', active);
        if (input.value === '端端') span.textContent = comboValueLabel('far_wall', '端端', active);
      } else if (name.includes('comboFilter-distance')) {
        if (input.value === '密着') span.textContent = comboValueLabel('close', '密着', active);
        if (input.value === '先端') span.textContent = comboValueLabel('tip', '先端', active);
      } else if (name.includes('comboFilter-bo')) {
        if (input.value === 'スタン') span.textContent = comboValueLabel('stun', 'スタン', active);
      } else if (name.includes('comboFilter-vs')) {
        if (input.value === '全キャラ') span.textContent = comboValueLabel('all_chars', '全キャラ', active);
        if (input.value === 'デカキャラのみ') span.textContent = comboValueLabel('big_only', 'デカキャラのみ', active);
        if (input.value === 'デカキャラ以外') span.textContent = comboValueLabel('no_big', 'デカキャラ以外', active);
      } else if (name.includes('comboFilter-interrupt') || name.includes('comboFilter-safe_jump')) {
        if (input.value === '可') span.textContent = comboValueLabel('yes', '可', active);
        if (input.value === '準') span.textContent = comboValueLabel('semi', '準', active);
        if (input.value === '不可') span.textContent = comboValueLabel('no', '不可', active);
      } else if (name.includes('comboFilter-command_scope')) {
        if (input.value === 'first_hit') span.textContent = comboT('filter.command_first_hit', active) || 'First Hit';
        if (input.value === 'any') span.textContent = comboT('filter.command_any', active) || 'Any';
      }
    });

    const applyOptionLabels = (containerId, options, extraMap = {}) => {
      const container = panel.querySelector(`#${containerId}`);
      if (!container) return;
      const map = new Map();
      options.forEach((opt) => map.set(opt.value, opt.label));
      Object.entries(extraMap).forEach(([key, value]) => map.set(key, value));
      container.querySelectorAll('label.checkbox-item').forEach((label) => {
        const input = label.querySelector('input');
        const span = label.querySelector('span');
        if (!input || !span) return;
        const text = map.get(input.value);
        if (text != null) span.textContent = text;
      });
    };

    applyOptionLabels('comboFilterSpecialGroup', getSpecialConditionOptions(active));
    applyOptionLabels('comboFilterVersionGroup', getGameVersionOptions(active), {
      'その他': comboValueLabel('other', 'Other', active),
    });

    panel.querySelectorAll('.range-row').forEach((row) => {
      const field = row.dataset.field;
      const label = row.querySelector('.range-label');
      if (!field || !label) return;
      const text = getRangeLabel(field, active);
      if (text) label.innerHTML = text;
    });
  }

  function getSelectOptionLabel(field, value, lang) {
    const active = lang || getComboLang();
    if (field === 'control_mode') {
      if (!value) return '-';
      if (value === 'classic') return comboValueLabel('classic', 'Classic', active);
      if (value === 'modern') return comboValueLabel('modern', 'Modern', active);
      if (value === '両方') return comboValueLabel('both', '両方', active);
      return value;
    }
    if (field === 'distance') {
      if (!value || value === '-') return '-';
      if (value === '密着') return comboValueLabel('close', '密着', active);
      if (value === '先端') return comboValueLabel('tip', '先端', active);
      return value;
    }
    if (field === 'position') {
      if (value === '地上') return comboValueLabel('ground', '地上', active);
      if (value === '空中') return comboValueLabel('air', '空中', active);
      if (value === '壁') return comboValueLabel('wall', '壁', active);
      if (value === '逆壁') return comboValueLabel('reverse_wall', '逆壁', active);
      if (value === '壁付近') return comboValueLabel('near_wall', '壁付近', active);
      if (value === '端端') return comboValueLabel('far_wall', '端端', active);
      return value;
    }
    if (field === 'bo_state') {
      if (!value) return '-';
      if (value === 'スタン') return comboValueLabel('stun', 'スタン', active);
      return value;
    }
    if (field === 'vs_character') {
      if (!value) return '-';
      if (value === '全キャラ') return comboValueLabel('all_chars', '全キャラ', active);
      if (value === 'デカキャラのみ') return comboValueLabel('big_only', 'デカキャラのみ', active);
      if (value === 'デカキャラ以外') return comboValueLabel('no_big', 'デカキャラ以外', active);
      return value;
    }
    if (field === 'safe_jump' || field === 'interrupt') {
      if (!value) return '-';
      if (value === '可') return comboValueLabel('yes', '可', active);
      if (value === '準') return comboValueLabel('semi', '準', active);
      if (value === '不可') return comboValueLabel('no', '不可', active);
      return value;
    }
    if (field === 'game_version') {
      if (!value) return '-';
      if (value === 'Other' || value === 'その他') return comboValueLabel('other', 'Other', active);
      return value;
    }
    return null;
  }

  function applyComboSelectLabels(lang) {
    const active = lang || getComboLang();
    if (ui.table) {
      ui.table.querySelectorAll('select[data-field]').forEach((select) => {
        const field = select.dataset.field;
        Array.from(select.options).forEach((option) => {
          const label = getSelectOptionLabel(field, option.value, active);
          if (label != null) option.textContent = label;
        });
      });
    }
    if (ui.headerTable) {
      ui.headerTable.querySelectorAll('select[data-field]').forEach((select) => {
        const field = select.dataset.field;
        Array.from(select.options).forEach((option) => {
          const label = getSelectOptionLabel(field, option.value, active);
          if (label != null) option.textContent = label;
        });
      });
    }
    document.querySelectorAll('input.multi-input[data-field="special_condition"]').forEach((input) => {
      input.dataset.options = JSON.stringify(getSpecialConditionOptions(active));
      const raw = getMultiInputRawValue(input);
      if (raw) {
        input.dataset.rawValue = raw;
        input.value = formatSpecialConditionDisplay(raw, active);
      }
    });
  }

  function applyComboUiLabels(lang) {
    const active = lang || getComboLang();
    const quickLabel = qs('comboQuickInputLabel');
    if (quickLabel) quickLabel.textContent = comboT('ui.quick_input', active) || quickLabel.textContent;
    const inputTitle = document.querySelector('.combo-input-title');
    if (inputTitle) inputTitle.textContent = comboT('ui.input', active) || inputTitle.textContent;
    const customizeBtn = qs('comboCustomizeBtn');
    if (customizeBtn) customizeBtn.textContent = comboT('ui.customize', active) || customizeBtn.textContent;
    const createBtn = qs('comboCreateBtn');
    if (createBtn) createBtn.textContent = comboT('ui.create', active) || createBtn.textContent;
    const duplicateBtn = qs('comboDuplicateBtn');
    if (duplicateBtn) duplicateBtn.textContent = comboT('ui.duplicate', active) || duplicateBtn.textContent;
    const deleteBtn = qs('comboDeleteBtn');
    if (deleteBtn) deleteBtn.textContent = comboT('ui.delete', active) || deleteBtn.textContent;
    const dedupeBtn = qs('comboDedupeBtn');
    if (dedupeBtn) dedupeBtn.textContent = comboT('ui.dedupe', active) || dedupeBtn.textContent;
    const restoreBtn = qs('comboRestoreBtn');
    if (restoreBtn) restoreBtn.textContent = comboT('ui.restore', active) || restoreBtn.textContent;
    const notationBtn = qs('comboNotationBtn');
    if (notationBtn) notationBtn.textContent = comboT('ui.notation_dict', active) || notationBtn.textContent;

    const deviceSelect = qs('comboDeviceSelect');
    if (deviceSelect) {
      Array.from(deviceSelect.options).forEach((option) => {
        if (option.value === 'keyboard') option.textContent = comboT('ui.keyboard', active) || option.textContent;
        if (option.value === 'ps5') option.textContent = comboT('ui.ps5', active) || option.textContent;
        if (option.value === 'xbox') option.textContent = comboT('ui.xbox', active) || option.textContent;
        if (option.value === 'dinput') option.textContent = comboT('ui.dinput', active) || option.textContent;
      });
    }

    const keymap = qs('comboKeymapModal');
    if (keymap) {
      const title = keymap.querySelector('h3');
      if (title) title.textContent = comboT('ui.keymap_title', active) || title.textContent;
      const saveBtn = keymap.querySelector('button[data-action="save"]');
      if (saveBtn) saveBtn.textContent = comboT('ui.keymap_save', active) || saveBtn.textContent;
      const cancelBtn = keymap.querySelector('button[data-action="close"]');
      if (cancelBtn) cancelBtn.textContent = comboT('ui.keymap_cancel', active) || cancelBtn.textContent;
    }

    const restoreModal = qs('comboRestoreModal');
    if (restoreModal) {
      const title = restoreModal.querySelector('h3');
      if (title) title.textContent = comboT('ui.restore_title', active) || title.textContent;
      const applyBtn = restoreModal.querySelector('button[data-action="apply"]');
      if (applyBtn) applyBtn.textContent = comboT('ui.restore_apply', active) || applyBtn.textContent;
      const cancelBtn = restoreModal.querySelector('button[data-action="close"]');
      if (cancelBtn) cancelBtn.textContent = comboT('ui.restore_cancel', active) || cancelBtn.textContent;
      const notice = restoreModal.querySelector('.combo-restore-notice');
      if (notice) notice.textContent = comboT('ui.restore_notice', active) || notice.textContent;
      renderRestoreModalList(restoreModal);
    }

    const notationModal = qs('comboNotationModal');
    if (notationModal) {
      const title = notationModal.querySelector('h3');
      if (title) title.textContent = comboT('ui.notation_title', active) || title.textContent;
      const closeBtn = notationModal.querySelector('button[data-action="close"]');
      if (closeBtn) closeBtn.textContent = comboT('ui.notation_close', active) || closeBtn.textContent;
      const desc = notationModal.querySelector('.combo-notation-desc');
      if (desc) desc.textContent = comboT('ui.notation_desc', active) || desc.textContent;
      const hints = notationModal.querySelectorAll('.combo-notation-hints li');
      if (hints[0]) hints[0].textContent = comboT('ui.notation_hint_1', active) || hints[0].textContent;
      if (hints[1]) hints[1].textContent = comboT('ui.notation_hint_2', active) || hints[1].textContent;
      if (hints[2]) hints[2].textContent = comboT('ui.notation_hint_3', active) || hints[2].textContent;
      const addBtn = notationModal.querySelector('button[data-action="add"]');
      if (addBtn) addBtn.textContent = comboT('ui.notation_add', active) || addBtn.textContent;
      const resetBtn = notationModal.querySelector('button[data-action="reset"]');
      if (resetBtn) resetBtn.textContent = comboT('ui.notation_reset', active) || resetBtn.textContent;
      const exportBtn = notationModal.querySelector('button[data-action="export"]');
      if (exportBtn) exportBtn.textContent = comboT('ui.notation_export', active) || exportBtn.textContent;
      const importBtn = notationModal.querySelector('button[data-action="import"]');
      if (importBtn) importBtn.textContent = comboT('ui.notation_import', active) || importBtn.textContent;
      const aliasInput = notationModal.querySelector('#comboNotationAliasInput');
      if (aliasInput) aliasInput.placeholder = comboT('ui.notation_input_alias', active) || aliasInput.placeholder;
      const lmInput = notationModal.querySelector('#comboNotationLmInput');
      if (lmInput) lmInput.placeholder = comboT('ui.notation_input_lm', active) || lmInput.placeholder;
      const testInput = notationModal.querySelector('#comboNotationTestInput');
      if (testInput) testInput.placeholder = comboT('ui.notation_test_placeholder', active) || testInput.placeholder;
      const labels = notationModal.querySelectorAll('[data-notation-label]');
      labels.forEach((el) => {
        const key = el.dataset.notationLabel || '';
        const text = comboT(`ui.${key}`, active);
        if (text) el.textContent = text;
      });
      renderNotationManagerRows();
      runNotationTestPreview();
    }

    const xlsxModal = qs('comboXlsxMapModal');
    if (xlsxModal) {
      const labels = xlsxModal.querySelectorAll('[data-xlsx-label]');
      labels.forEach((el) => {
        const key = el.dataset.xlsxLabel || '';
        const text = comboT(`ui.${key}`, active);
        if (text) el.textContent = text;
      });
      const applyBtn = xlsxModal.querySelector('button[data-action="apply"]');
      if (applyBtn) applyBtn.textContent = comboT('ui.xlsx_map_apply', active) || applyBtn.textContent;
      const cancelBtn = xlsxModal.querySelector('button[data-action="cancel"]');
      if (cancelBtn) cancelBtn.textContent = comboT('ui.xlsx_map_cancel', active) || cancelBtn.textContent;
      if (xlsxModal._ctx) {
        renderXlsxMapFieldTables(xlsxModal);
        renderXlsxMapPreview(xlsxModal);
      }
    }

    const panel = qs('comboMultiPanel');
    if (panel && panel.classList.contains('active')) {
      const applyBtn = panel.querySelector('button[data-action="apply"]');
      if (applyBtn) applyBtn.textContent = comboT('ui.multi_apply', active) || applyBtn.textContent;
      const clearBtn = panel.querySelector('button[data-action="clear"]');
      if (clearBtn) clearBtn.textContent = comboT('ui.multi_clear', active) || clearBtn.textContent;
    }
    updateAllRowsToggleLabel(
      qs('toggleFrameRows'),
      qs('toggleButtonsRows'),
      qs('toggleNotesRows'),
      qs('toggleAllRowsBtn'),
      active
    );
    refreshMultiSelectPanel(active);
    updateComboGameVersionInfo(active);
  }

  function applyComboLanguage(lang) {
    const active = lang || getComboLang();
    const columnControls = qs('comboColumnControls');
    if (columnControls) {
      const label = columnControls.querySelector('.combo-col-label');
      if (label) label.textContent = comboT('columns.label', active) || '列:';
      columnControls.querySelectorAll('.combo-col-preset').forEach((btn) => {
        const key = btn.dataset.i18nKey || '';
        const text = comboT(key, active);
        if (text) btn.textContent = text;
      });
    }
    applyComboHeaderTranslations(ui.table, active);
    if (ui.headerTable) applyComboHeaderTranslations(ui.headerTable, active);
    state.baseColumnEntries = buildComboColumnEntriesFromHeader(ui.table);
    applyComboRowLabels(active);
    applyComboFilterLabels(active);
    applyComboSelectLabels(active);
    applyComboUiLabels(active);
    applySampleComboLocalization(active);
    state.groups.forEach((group) => {
      const commandInput = group.inputs && group.inputs.command;
      const notesInput = group.inputs && group.inputs.combo_notes;
      const combo = state.combos[group.index] || defaultCombo();
      if (commandInput && commandInput.classList && commandInput.classList.contains('cmd-input')) {
        commandInput.textContent = localizeCommandForDisplay(combo.command || '', active);
      }
      if (notesInput && Object.prototype.hasOwnProperty.call(notesInput, 'value')) {
        notesInput.value = combo.combo_notes || '';
        if (notesInput.tagName === 'TEXTAREA') autoResizeNotesInput(notesInput);
      }
    });
    applyUiButtonLayout();
    if (qs('comboKeymapGrid')) renderKeymapGrid();
    const bottomToggle = qs('comboBottomToggle');
    if (bottomToggle) updateBottomToggleState(bottomToggle);
    updateSaveStatusUI(state.isDirty, !!state.recoverySource);
  }

  function applySampleComboLocalization(lang) {
    const active = lang || getComboLang();
    const sampleCommand = canonicalizeCommandForStorage('Jump H > H > 236L');
    const jpSampleNotes = comboT('sample_notes', 'jp') || '基本コンボ';
    const enSampleNotes = comboT('sample_notes', 'en') || 'Basic Combo';
    let changed = false;

    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      const command = canonicalizeCommandForStorage(combo.command || '');
      const buttons = canonicalizeCommandForStorage(combo.buttons || '');
      const notes = String(combo.combo_notes || '').trim();
      const isSampleRoute = command === sampleCommand && (!buttons || buttons === sampleCommand);
      const isSampleNotesLabel = notes === jpSampleNotes || notes === enSampleNotes;
      const isBlankSampleNotes = !notes && isSampleRoute;
      if (!isSampleNotesLabel && !isBlankSampleNotes) return;
      const localizedNotes = comboT('sample_notes', active) || (active === 'en' ? enSampleNotes : jpSampleNotes);
      if (combo.combo_notes !== localizedNotes) {
        combo.combo_notes = localizedNotes;
        changed = true;
      }
    });

    if (changed) persist();
  }

  function findLabelCellIndex(row, labels) {
    if (!row || !labels || !labels.length) return -1;
    const cells = Array.from(row.querySelectorAll('td'));
    for (let i = 0; i < cells.length; i += 1) {
      const text = (cells[i].textContent || '').replace(/\s+/g, '').toLowerCase();
      if (!text) continue;
      if (labels.some((label) => text.includes(label))) return i;
    }
    return -1;
  }

  function defaultCombo(useSample = false) {
    const combo = {
      command: useSample ? 'Jump H > H > 236L' : '',
      buttons: useSample ? 'Jump H > H > 236L' : '',
      combo_notes: useSample ? (comboT('sample_notes') || '基本コンボ') : '',
      frame_meter: '',
      game_version: '',
      _manual: false,
    };
    FIELD_ORDER.forEach((field) => {
      combo[field] = '';
    });
    return combo;
  }

  function ensureComboAuthoredVersion(combo) {
    if (!combo || typeof combo !== 'object') return;
    if (String(combo.game_version || '').trim()) return;
    combo.game_version = getCurrentFrameVersionForCombo();
  }

  function syncAuthoredVersionInput(row) {
    const idx = Number(row);
    if (!Number.isFinite(idx) || idx < 0) return;
    const group = state.groups[idx];
    const combo = state.combos[idx];
    if (!group || !combo) return;
    const select = group.inputs && group.inputs.game_version;
    if (!select || select.tagName !== 'SELECT') return;
    if (!String(select.value || '').trim()) {
      select.value = combo.game_version || '';
    }
  }

  function getCommandWarnings(command, mode) {
    const normalized = canonicalizeCommandForStorage(command || '');
    if (!normalized) return [];
    const warnings = [];
    const modeKey = String(mode || '').toLowerCase();
    const modernMismatch = CLASSIC_ONLY_TOKEN_REGEX.test(normalized);
    const classicMismatch = MODERN_ONLY_TOKEN_REGEX.test(normalized);
    if (modeKey === 'modern' && modernMismatch) {
      warnings.push(comboMsg('warn_modern_mismatch'));
    }
    if (modeKey === 'classic' && classicMismatch) {
      warnings.push(comboMsg('warn_classic_mismatch'));
    }
    const tokenRegex = /(>>|>|-|360|\[\s*\]|\[\d+F?\]|投げ|4\(タメ\)|2\(タメ\)|\d+(?:LP|MP|HP|LK|MK|HK|SP|Auto|Any|DP|DI|DR|CR|Jump|Hold\d*|or|PP|KK|[PLMHK]{1,3})|\b(?:LP|MP|HP|LK|MK|HK|SP|Auto|Any|DP|DI|DR|CR|Jump|Hold\d*|or|PP|KK|[PLMHK]{1,3})\b|[1-9])/gi;
    const rest = normalized
      .replace(tokenRegex, '')
      .replace(/\s+/g, '')
      .replace(/[,+]/g, '');
    // Ignore separator/punctuation leftovers to avoid false positives on valid notation.
    const restCore = rest
      .replace(/[(){}\[\].,:;+/\\'"`~!@#$%^&*_=|<>?-]/g, '')
      .replace(/[↑↓←→↖↗↙↘]/g, '');
    if (/[A-Za-z0-9\u3040-\u30ff\u3400-\u9fff]/.test(restCore)) {
      warnings.push(comboMsg('warn_unknown_notation', { value: restCore }));
    }
    return warnings;
  }

  function getWarningModeForCombo(combo) {
    const explicit = canonicalControlMode(combo && combo.control_mode ? combo.control_mode : '');
    if (explicit === 'classic' || explicit === 'modern') return explicit;
    if (explicit === '両方') return 'both';
    return state.controlMode || 'classic';
  }

  function applyCommandWarningToInput(input, warnings) {
    if (!input) return;
    const hasWarning = Array.isArray(warnings) && warnings.length > 0;
    input.classList.toggle('cmd-warning', hasWarning);
    if (hasWarning) {
      input.dataset.warning = warnings.join(' / ');
      input.title = warnings.join('\n');
    } else {
      delete input.dataset.warning;
      input.removeAttribute('title');
    }
  }

  function refreshCommandWarning(row) {
    const idx = Number(row);
    if (!Number.isFinite(idx) || idx < 0) return;
    const group = state.groups[idx];
    const combo = state.combos[idx];
    if (!group || !combo) return;
    const commandInput = group.inputs && group.inputs.command;
    if (!commandInput) return;
    const warnings = getCommandWarnings(combo.command || '', getWarningModeForCombo(combo));
    applyCommandWarningToInput(commandInput, warnings);
  }

  function formatNumberText(value) {
    const raw = String(value == null ? '' : value).replace(/,/g, '').trim();
    if (!raw) return '';
    if (!/^-?\d+(?:\.\d+)?$/.test(raw)) return value;
    const negative = raw.startsWith('-');
    const cleaned = negative ? raw.slice(1) : raw;
    const [intPart, decPart] = cleaned.split('.');
    const formattedInt = Number(intPart).toLocaleString('en-US');
    const formatted = decPart != null && decPart !== ''
      ? `${formattedInt}.${decPart}`
      : formattedInt;
    return negative ? `-${formatted}` : formatted;
  }

  function parseNumericText(value) {
    const raw = String(value == null ? '' : value).replace(/,/g, '').trim();
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }

  function computeDriveEfficiencyValue(combo) {
    if (!combo || typeof combo !== 'object') return '';
    const damage = parseNumericText(combo.damage_normal);
    const driveDelta = parseNumericText(combo.drive_delta);
    if (damage == null || driveDelta == null || driveDelta === 0) return '';
    const efficiency = damage / Math.abs(driveDelta);
    if (!Number.isFinite(efficiency)) return '';
    const compact = efficiency.toFixed(2).replace(/\.?0+$/, '');
    return formatNumberText(compact);
  }

  function syncDerivedComboFields(combo) {
    if (!combo || typeof combo !== 'object') return false;
    const nextEff = computeDriveEfficiencyValue(combo);
    const prevEff = String(combo.drive_efficiency || '').trim();
    if (prevEff === nextEff) return false;
    combo.drive_efficiency = nextEff;
    return true;
  }

  function syncDerivedComboFieldsForRow(rowIndex) {
    const row = Number(rowIndex);
    if (!Number.isFinite(row) || row < 0) return false;
    const combo = state.combos[row];
    if (!combo) return false;
    const changed = syncDerivedComboFields(combo);
    if (!changed) return false;
    const group = state.groups[row];
    const input = group && group.inputs ? group.inputs.drive_efficiency : null;
    if (input && Object.prototype.hasOwnProperty.call(input, 'value')) {
      input.value = combo.drive_efficiency || '';
    }
    return true;
  }

  function ensureSampleCombo() {
    if (!state.combos.length) {
      state.combos = [defaultCombo(true)];
      persist();
      return;
    }
    if (state.combos.length < state.groups.length) {
      const missing = state.groups.length - state.combos.length;
      for (let i = 0; i < missing; i += 1) {
        state.combos.push(defaultCombo());
      }
    }
    const first = state.combos[0] || defaultCombo();
    const isBlank = !String(first.combo_notes || '').trim()
      && !String(first.command || '').trim()
      && !String(first.buttons || '').trim();
    if (isBlank) {
      state.combos[0] = { ...defaultCombo(), ...defaultCombo(true) };
      persist();
    }
  }

  function getCharacterSlugFromUi() {
    if (ui.comboView && ui.comboView.dataset && Object.prototype.hasOwnProperty.call(ui.comboView.dataset, 'character')) {
      return (ui.comboView.dataset.character || '').trim();
    }
    const img = ui.charImg;
    const src = img ? (img.getAttribute('src') || '') : '';
    const match = src.match(/characters\/([^/]+)\.png/i);
    if (match) {
      const slug = String(match[1] || '').trim().toLowerCase();
      if (!slug) return '';
      if (slug === 'selectchar' || /select_character/i.test(slug)) return '';
      return slug;
    }
    if (/select_character|selectchar/i.test(src)) return '';
    return '';
  }

  function getPersistedComboCharacter() {
    try {
      const raw = localStorage.getItem(COMBO_CHARACTER_KEY);
      const resolved = resolveCharacterSlug(raw);
      if (resolved) return resolved;
      const fallback = String(raw || '').trim().toLowerCase();
      if (!fallback) return '';
      if (/select_character|selectchar/i.test(fallback)) return '';
      return fallback;
    } catch {
      return '';
    }
  }

  function loadPersistedComboControlMode() {
    try {
      const direct = String(localStorage.getItem(COMBO_CONTROL_MODE_KEY) || '').trim().toLowerCase();
      if (direct === 'classic' || direct === 'modern') return direct;
    } catch { }
    // Legacy fallback (migration from combined UI prefs).
    try {
      const raw = localStorage.getItem(UI_PREFS_KEY);
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      const legacy = String(parsed && parsed.controlMode ? parsed.controlMode : '').trim().toLowerCase();
      if (legacy === 'classic' || legacy === 'modern') return legacy;
    } catch { }
    return '';
  }

  function savePersistedComboControlMode(mode) {
    try {
      localStorage.setItem(COMBO_CONTROL_MODE_KEY, mode === 'modern' ? 'modern' : 'classic');
    } catch { }
  }

  function persistComboCharacter(slug) {
    try {
      const resolved = resolveCharacterSlug(slug) || '';
      if (resolved) {
        localStorage.setItem(COMBO_CHARACTER_KEY, resolved);
      } else {
        localStorage.removeItem(COMBO_CHARACTER_KEY);
      }
    } catch { }
  }

  function applyComboPortrait(slug) {
    if (!ui.charImg) return;
    const resolved = resolveCharacterSlug(slug) || '';
    if (!resolved) {
      ui.charImg.src = 'assets/images/characters/select_character_random_over.png';
      ui.charImg.alt = 'Select Character';
      return;
    }
    const thumb = typeof window.getSelectThumbForSlug === 'function'
      ? window.getSelectThumbForSlug(resolved, getComboLang())
      : '';
    const src = thumb || `assets/images/characters/${resolved}.png`;
    ui.charImg.src = src;
  }

  function getStorageSafeSlug(slug) {
    return slug || state.currentCharacter || getCharacterSlugFromUi() || UNSELECTED_STORAGE_SLUG;
  }

  function getStorageKey(slug) {
    return `${STORAGE_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function getDraftStorageKey(slug) {
    return `${STORAGE_DRAFT_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function getBackupStorageKey(slug) {
    return `${STORAGE_BACKUP_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function getLongBackupStorageKey(slug) {
    return `${STORAGE_BACKUP_LONG_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function getImportBackupStorageKey(slug) {
    return `${STORAGE_BACKUP_IMPORT_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function getMetaStorageKey(slug) {
    return `${STORAGE_META_KEY_BASE}:${getStorageSafeSlug(slug)}`;
  }

  function exportCombosState() {
    return { combos: state.combos };
  }

  function parseStoredCombos(raw) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.combos)) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function normalizeStoredCombos(combos, options = {}) {
    if (!Array.isArray(combos)) return [];
    const fallbackMode = canonicalControlMode(options && options.fallbackMode ? options.fallbackMode : '') || '';
    const normalized = combos.map((c) => {
      const merged = { ...defaultCombo(), ...(c || {}) };
      merged.command = canonicalizeCommandForStorage(merged.command || '');
      if (merged.buttons) merged.buttons = canonicalizeCommandForStorage(merged.buttons);
      ensureComboControlMode(merged, fallbackMode);
      return merged;
    });
    const hasComboData = (combo) => {
      if (!combo) return false;
      if (combo._manual) return true;
      const fields = [
        'command',
        'buttons',
        'combo_notes',
        'frame_meter',
        'game_version',
        ...FIELD_ORDER,
      ];
      return fields.some((field) => String(combo[field] || '').trim().length > 0);
    };
    let lastDataIndex = -1;
    for (let i = normalized.length - 1; i >= 0; i -= 1) {
      if (hasComboData(normalized[i])) {
        lastDataIndex = i;
        break;
      }
    }
    if (lastDataIndex < 0) return [defaultCombo(true)];
    const keepCount = Math.max(1, lastDataIndex + 2); // keep one trailing blank row for quick entry
    return normalized.slice(0, Math.min(keepCount, normalized.length));
  }

  function getPreferredControlModeForMigration() {
    if (state.controlMode === 'modern') return 'modern';
    if (state.controlMode === 'classic') return 'classic';
    try {
      const raw = localStorage.getItem(UI_PREFS_KEY);
      if (!raw) return 'classic';
      const parsed = JSON.parse(raw);
      const pref = String(parsed && parsed.controlMode ? parsed.controlMode : '').trim().toLowerCase();
      if (pref === 'modern') return 'modern';
      if (pref === 'classic') return 'classic';
    } catch { }
    return 'classic';
  }

  function loadXlsxMapPresets() {
    if (Array.isArray(state.xlsxMapPresets)) return state.xlsxMapPresets;
    state.xlsxMapPresets = [];
    try {
      const raw = localStorage.getItem(XLSX_IMPORT_MAPS_KEY);
      if (!raw) return state.xlsxMapPresets;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.presets)) return state.xlsxMapPresets;
      state.xlsxMapPresets = parsed.presets
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          const map = entry.map && typeof entry.map === 'object' ? { ...entry.map } : {};
          return {
            name: String(entry.name || '').trim(),
            headerSignature: String(entry.headerSignature || '').trim(),
            headerRow: Number(entry.headerRow) === 2 ? 2 : 1,
            map,
          };
        })
        .filter(Boolean);
    } catch {
      state.xlsxMapPresets = [];
    }
    return state.xlsxMapPresets;
  }

  function saveXlsxMapPresets() {
    try {
      const payload = {
        version: 1,
        presets: Array.isArray(state.xlsxMapPresets) ? state.xlsxMapPresets : [],
      };
      localStorage.setItem(XLSX_IMPORT_MAPS_KEY, JSON.stringify(payload));
    } catch { }
  }

  function buildHeaderSignature(headers) {
    return (headers || [])
      .map((value) => normalizeLabel(value || ''))
      .join('|');
  }

  function findXlsxPresetBySignature(signature) {
    if (!signature) return null;
    const presets = loadXlsxMapPresets();
    return presets.find((entry) => String(entry.headerSignature || '') === signature) || null;
  }

  function upsertXlsxPreset(entry) {
    if (!entry || typeof entry !== 'object') return;
    const signature = String(entry.headerSignature || '').trim();
    if (!signature) return;
    const presets = loadXlsxMapPresets();
    const next = {
      name: String(entry.name || '').trim() || 'Preset',
      headerSignature: signature,
      headerRow: Number(entry.headerRow) === 2 ? 2 : 1,
      map: entry.map && typeof entry.map === 'object' ? { ...entry.map } : {},
    };
    const index = presets.findIndex((item) => String(item.headerSignature || '') === signature);
    if (index >= 0) presets[index] = next;
    else presets.push(next);
    state.xlsxMapPresets = presets;
    saveXlsxMapPresets();
  }

  function columnIndexToName(index) {
    let value = Number(index) || 1;
    let out = '';
    while (value > 0) {
      const rem = (value - 1) % 26;
      out = String.fromCharCode(65 + rem) + out;
      value = Math.floor((value - 1) / 26);
    }
    return out || 'A';
  }

  function getXlsxFieldLabel(field, lang) {
    const active = lang || getComboLang();
    const entry = XLSX_FIELD_LABELS[field];
    if (!entry) return field;
    return active === 'en' ? (entry.en || entry.jp || field) : (entry.jp || entry.en || field);
  }

  function getSheetMaxColumn(sheet, rowNumbers = [1, 2]) {
    if (!sheet) return 1;
    let maxCol = 1;
    rowNumbers.forEach((rowNumber) => {
      const row = sheet.getRow(Number(rowNumber) || 1);
      if (!row) return;
      const valueLength = Array.isArray(row.values) ? Math.max(0, row.values.length - 1) : 0;
      maxCol = Math.max(maxCol, Number(row.actualCellCount) || 0, Number(row.cellCount) || 0, valueLength);
    });
    return maxCol || 1;
  }

  function buildSheetHeaderEntries(sheet, rowNumber, maxColHint = 0) {
    const row = sheet ? sheet.getRow(Number(rowNumber) || 1) : null;
    const maxCol = Math.max(1, maxColHint || 0, row ? getSheetMaxColumn(sheet, [rowNumber]) : 1);
    const entries = [];
    for (let col = 1; col <= maxCol; col += 1) {
      const header = row ? getCellText(row.getCell(col)) : '';
      entries.push({
        col,
        value: `col:${col}`,
        header,
        lower: String(header || '').toLowerCase(),
        compact: normalizeLabel(header || ''),
        label: header || `Column ${columnIndexToName(col)}`,
      });
    }
    return entries;
  }

  function headerEntriesScore(entries) {
    return (entries || []).reduce((score, entry) => {
      const header = String(entry && entry.header ? entry.header : '').trim();
      if (!header) return score;
      let next = score + 1;
      if (/[A-Za-z\u3040-\u30FF\u3400-\u9FFF]/.test(header)) next += 0.6;
      if (!/^\d+(\.\d+)?$/.test(header)) next += 0.4;
      return next;
    }, 0);
  }

  function chooseLikelyHeaderRow(entriesByRow) {
    const row1 = entriesByRow[1] || [];
    const row2 = entriesByRow[2] || [];
    const score1 = headerEntriesScore(row1);
    const score2 = headerEntriesScore(row2);
    const hasRow2 = row2.some((entry) => String(entry.header || '').trim());
    if (!score1 && hasRow2) return 2;
    if (hasRow2 && score2 > score1 * 1.2) return 2;
    return 1;
  }

  function buildHeaderSignatureFromEntries(entries) {
    return buildHeaderSignature((entries || []).map((entry) => String(entry && entry.header ? entry.header : '')));
  }

  function headerIncludesKeyword(entry, keyword) {
    const token = String(keyword || '').trim().toLowerCase();
    if (!token) return false;
    const compactToken = token.replace(/\s+/g, '');
    return String(entry.lower || '').includes(token) || String(entry.compact || '').includes(compactToken);
  }

  function entryMatchesAnyKeyword(entry, keywords) {
    return (keywords || []).some((keyword) => headerIncludesKeyword(entry, keyword));
  }

  function suggestXlsxMapping(entries) {
    const map = {};
    const used = new Set();
    const rows = Array.isArray(entries) ? entries : [];

    const pick = (field, predicate, allowReuse = false) => {
      if (map[field]) return true;
      const hit = rows.find((entry) => {
        if (!entry || !String(entry.header || '').trim()) return false;
        if (!allowReuse && used.has(entry.value)) return false;
        return predicate(entry);
      });
      if (!hit) return false;
      map[field] = hit.value;
      if (!allowReuse) used.add(hit.value);
      return true;
    };

    const pickByKeywords = (field, keywords, options = {}) => pick(field, (entry) => {
      if (!entryMatchesAnyKeyword(entry, keywords)) return false;
      if (options.exclude && entryMatchesAnyKeyword(entry, options.exclude)) return false;
      return true;
    }, options.allowReuse === true);

    pickByKeywords('command', XLSX_HEADER_KEYWORDS.command);
    pickByKeywords('combo_notes', XLSX_HEADER_KEYWORDS.combo_notes);
    pickByKeywords('control_mode', XLSX_HEADER_KEYWORDS.control_mode);
    pickByKeywords('position', XLSX_HEADER_KEYWORDS.position);
    pickByKeywords('distance', XLSX_HEADER_KEYWORDS.distance);
    pickByKeywords('special_condition', XLSX_HEADER_KEYWORDS.special_condition);
    pickByKeywords('buttons', XLSX_HEADER_KEYWORDS.buttons);
    pickByKeywords('frame_meter', XLSX_HEADER_KEYWORDS.frame_meter);
    pickByKeywords('game_version', XLSX_HEADER_KEYWORDS.game_version);

    pickByKeywords('frame_adv', XLSX_HEADER_KEYWORDS.frame_adv, {
      exclude: ['メーター', 'meter'],
    });

    pickByKeywords('damage_normal', XLSX_HEADER_KEYWORDS.damage_normal, {
      exclude: ['ca', '(ca)', 'just parry', 'ジャスパ'],
    });

    pick('drive_delta', (entry) =>
      entryMatchesAnyKeyword(entry, XLSX_DRIVE_KEYWORDS) && entryMatchesAnyKeyword(entry, XLSX_DELTA_KEYWORDS));
    pick('drive_req', (entry) =>
      entryMatchesAnyKeyword(entry, XLSX_DRIVE_KEYWORDS) && entryMatchesAnyKeyword(entry, XLSX_REQ_KEYWORDS));
    if (!map.drive_delta && !map.drive_req) {
      pick('drive_req', (entry) => entryMatchesAnyKeyword(entry, XLSX_DRIVE_KEYWORDS));
    }

    pick('sa_delta', (entry) =>
      entryMatchesAnyKeyword(entry, XLSX_SA_KEYWORDS) && entryMatchesAnyKeyword(entry, XLSX_DELTA_KEYWORDS));
    pick('sa_req', (entry) =>
      entryMatchesAnyKeyword(entry, XLSX_SA_KEYWORDS) && entryMatchesAnyKeyword(entry, XLSX_REQ_KEYWORDS));
    if (!map.sa_delta && !map.sa_req) {
      pick('sa_req', (entry) => entryMatchesAnyKeyword(entry, XLSX_SA_KEYWORDS));
    }

    return map;
  }

  function sanitizeXlsxMapping(mapping, entries) {
    const out = {};
    const valid = new Set((entries || []).map((entry) => entry.value));
    XLSX_MAP_ALL_FIELDS.forEach((field) => {
      const value = String(mapping && mapping[field] ? mapping[field] : '');
      if (value && valid.has(value)) out[field] = value;
    });
    return out;
  }

  function getMappedCellValue(row, mapValue) {
    const token = String(mapValue || '');
    if (!token.startsWith('col:')) return '';
    const col = Number(token.slice(4));
    if (!Number.isFinite(col) || col <= 0) return '';
    return getCellText(row.getCell(col));
  }

  function canonicalControlMode(raw) {
    const value = normalizeLabel(raw);
    if (!value) return '';
    if (value === 'classic' || value === 'クラシック' || value === 'c') return 'classic';
    if (value === 'modern' || value === 'モダン' || value === 'm') return 'modern';
    if (value === 'both' || value === '両方' || value === 'common' || value === 'all' || value === 'shared') return '両方';
    return '';
  }

  function inferControlModeFromCombo(combo) {
    const command = canonicalizeCommandForStorage(combo && combo.command ? combo.command : '');
    const buttons = canonicalizeCommandForStorage(combo && combo.buttons ? combo.buttons : '');
    const route = `${command} ${buttons}`.trim();
    if (!route) return '';
    const hasClassicTokens = CLASSIC_ONLY_TOKEN_REGEX.test(route);
    const hasModernTokens = MODERN_ONLY_TOKEN_REGEX.test(route);
    if (hasClassicTokens && !hasModernTokens) return 'classic';
    if (hasModernTokens && !hasClassicTokens) return 'modern';
    if (hasClassicTokens && hasModernTokens) return '両方';
    return '';
  }

  function getComboModeForMatch(combo) {
    const mode = canonicalControlMode(combo && combo.control_mode ? combo.control_mode : '');
    if (mode) return mode;
    const inferred = inferControlModeFromCombo(combo);
    return inferred || '';
  }

  function ensureComboControlMode(combo, fallbackMode = '') {
    if (!combo || typeof combo !== 'object') return '';
    const explicit = canonicalControlMode(combo.control_mode);
    if (explicit) {
      combo.control_mode = explicit;
      return explicit;
    }
    const inferred = inferControlModeFromCombo(combo);
    if (inferred) {
      combo.control_mode = inferred;
      return inferred;
    }
    const command = canonicalizeCommandForStorage(combo.command || '');
    const buttons = canonicalizeCommandForStorage(combo.buttons || '');
    if (!command && !buttons) return '';
    const fallback = canonicalControlMode(fallbackMode);
    combo.control_mode = fallback || '両方';
    return combo.control_mode;
  }

  function normalizeControlModeValue(raw) {
    const canonical = canonicalControlMode(raw);
    if (canonical) return canonical;
    return String(raw || '').trim();
  }

  function normalizeImportedCombos(combos, unknownCollector = null) {
    if (!Array.isArray(combos)) return [];
    return combos.map((combo) => {
      const merged = { ...defaultCombo(), ...(combo || {}) };
      const normalizedCommand = normalizeCommandWithNotation(merged.command || '', unknownCollector);
      merged.command = normalizedCommand.canonical;
      if (String(merged.buttons || '').trim()) {
        const normalizedButtons = normalizeCommandWithNotation(merged.buttons || '', unknownCollector);
        merged.buttons = normalizedButtons.canonical;
      } else {
        merged.buttons = merged.command;
      }
      ensureComboControlMode(merged);
      return merged;
    });
  }

  function persistMeta(slug, dirty) {
    try {
      const payload = {
        dirty: !!dirty,
        draftSavedAt: Number(state.draftSavedAt) || 0,
        lastSavedAt: Number(state.lastSavedAt) || 0,
        lastShortBackupAt: Number(state.lastShortBackupAt) || 0,
        lastLongBackupAt: Number(state.lastLongBackupAt) || 0,
        importBackupAt: Number(state.importBackupAt) || 0,
      };
      localStorage.setItem(getMetaStorageKey(slug), JSON.stringify(payload));
    } catch { }
  }

  function snapshotImportBackup(slugOverride) {
    try {
      const slug = getStorageSafeSlug(slugOverride);
      const mainRaw = localStorage.getItem(getStorageKey(slug));
      if (!mainRaw) return;
      localStorage.setItem(getImportBackupStorageKey(slug), mainRaw);
      state.importBackupAt = Date.now();
      persistMeta(slug, state.isDirty);
    } catch { }
  }

  function getRestoreCandidates(slugOverride) {
    const slug = getStorageSafeSlug(slugOverride);
    const candidates = [
      {
        source: 'import',
        raw: localStorage.getItem(getImportBackupStorageKey(slug)),
        savedAt: Number(state.importBackupAt) || 0,
      },
      {
        source: 'short',
        raw: localStorage.getItem(getBackupStorageKey(slug)),
        savedAt: Number(state.lastShortBackupAt) || 0,
      },
      {
        source: 'long',
        raw: localStorage.getItem(getLongBackupStorageKey(slug)),
        savedAt: Number(state.lastLongBackupAt) || 0,
      },
      {
        source: 'draft',
        raw: localStorage.getItem(getDraftStorageKey(slug)),
        savedAt: Number(state.draftSavedAt) || 0,
      },
    ];
    return candidates
      .map((item) => ({ ...item, parsed: parseStoredCombos(item.raw) }))
      .filter((item) => item.parsed && Array.isArray(item.parsed.combos));
  }

  function getRestoreSourceLabel(source, lang) {
    return comboT(`restore_sources.${source}`, lang) || source;
  }

  function formatRestoreSavedAt(savedAt, lang) {
    const ts = Number(savedAt) || 0;
    if (!ts) return comboMsg('restore_time_unknown', null, lang);
    const locale = (lang || getComboLang()) === 'en' ? 'en-US' : 'ja-JP';
    try {
      return new Date(ts).toLocaleString(locale);
    } catch {
      return comboMsg('restore_time_unknown', null, lang);
    }
  }

  function markDirty() {
    state.isDirty = true;
    state.recoverySource = '';
    updateSaveStatusUI(true);
    queueAutosaveDraft();
  }

  function autosaveDraftNow(slugOverride) {
    const slug = getStorageSafeSlug(slugOverride);
    const raw = JSON.stringify(exportCombosState());
    localStorage.setItem(getDraftStorageKey(slug), raw);
    state.draftSavedAt = Date.now();
    persistMeta(slug, true);
  }

  function commitSaveNow(slugOverride) {
    const slug = getStorageSafeSlug(slugOverride);
    const nextRaw = JSON.stringify(exportCombosState());
    const mainKey = getStorageKey(slug);
    const backupKey = getBackupStorageKey(slug);
    const longBackupKey = getLongBackupStorageKey(slug);
    const prevRaw = localStorage.getItem(mainKey);
    const now = Date.now();
    if (prevRaw && prevRaw !== nextRaw) {
      const shouldWriteShort = !state.lastShortBackupAt || (now - state.lastShortBackupAt) >= SHORT_BACKUP_INTERVAL_MS;
      const shouldWriteLong = !state.lastLongBackupAt || (now - state.lastLongBackupAt) >= LONG_BACKUP_INTERVAL_MS;
      if (shouldWriteShort) {
        localStorage.setItem(backupKey, prevRaw);
        state.lastShortBackupAt = now;
      }
      if (shouldWriteLong) {
        localStorage.setItem(longBackupKey, prevRaw);
        state.lastLongBackupAt = now;
      }
    }
    localStorage.setItem(mainKey, nextRaw);
    localStorage.setItem(getDraftStorageKey(slug), nextRaw);
    state.lastSavedAt = now;
    state.draftSavedAt = now;
    state.isDirty = false;
    state.recoverySource = '';
    persistMeta(slug, false);
    updateSaveStatusUI(false);
  }

  function queueAutosaveDraft(delayMs = AUTOSAVE_DELAY_MS) {
    if (state.autosaveTimer) {
      window.clearTimeout(state.autosaveTimer);
    }
    state.autosaveTimer = window.setTimeout(() => {
      state.autosaveTimer = null;
      try {
        autosaveDraftNow();
        commitSaveNow();
      } catch (err) {
        console.error('Combo autosave failed:', err);
      }
    }, delayMs);
  }

  function flushAutosaveNow() {
    if (state.autosaveTimer) {
      window.clearTimeout(state.autosaveTimer);
      state.autosaveTimer = null;
    }
    if (!state.isDirty) return;
    try {
      autosaveDraftNow();
      commitSaveNow();
    } catch (err) {
      console.error('Combo save flush failed:', err);
    }
  }

  function migrateLegacyCombos(slug) {
    try {
      const targetKey = getStorageKey(slug);
      if (localStorage.getItem(targetKey)) return;
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacy) return;
      localStorage.setItem(targetKey, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch { }
  }

  function loadState({ resetIfMissing = false } = {}) {
    loadKeymaps();
    loadCustomShortcuts();
    try {
      const slug = state.currentCharacter || getCharacterSlugFromUi();
      if (!state.currentCharacter) state.currentCharacter = slug;
      migrateLegacyCombos(slug);
      const mainRaw = localStorage.getItem(getStorageKey(slug));
      const mainParsed = parseStoredCombos(mainRaw);
      const draftParsed = parseStoredCombos(localStorage.getItem(getDraftStorageKey(slug)));
      const backupParsed = parseStoredCombos(localStorage.getItem(getBackupStorageKey(slug)));
      const backupLongParsed = parseStoredCombos(localStorage.getItem(getLongBackupStorageKey(slug)));
      const backupImportParsed = parseStoredCombos(localStorage.getItem(getImportBackupStorageKey(slug)));
      const metaRaw = localStorage.getItem(getMetaStorageKey(slug));
      if (metaRaw) {
        try {
          const meta = JSON.parse(metaRaw);
          state.lastSavedAt = Number(meta && meta.lastSavedAt) || 0;
          state.draftSavedAt = Number(meta && meta.draftSavedAt) || 0;
          state.lastShortBackupAt = Number(meta && meta.lastShortBackupAt) || 0;
          state.lastLongBackupAt = Number(meta && meta.lastLongBackupAt) || 0;
          state.importBackupAt = Number(meta && meta.importBackupAt) || 0;
        } catch { }
      }

      let source = '';
      let parsed = null;
      if (mainParsed) {
        parsed = mainParsed;
        source = 'main';
      } else if (draftParsed) {
        parsed = draftParsed;
        source = 'draft';
      } else if (backupParsed) {
        parsed = backupParsed;
        source = 'backup_short';
      } else if (backupLongParsed) {
        parsed = backupLongParsed;
        source = 'backup_long';
      } else if (backupImportParsed) {
        parsed = backupImportParsed;
        source = 'backup_import';
      }

      if (!parsed) {
        if (resetIfMissing) {
          state.combos = state.groups.map((_, idx) => (idx === 0 ? defaultCombo(true) : defaultCombo()));
          persist({ immediate: true });
        }
        state.isDirty = false;
        state.recoverySource = '';
        updateSaveStatusUI(false);
        return;
      }
      const migrationMode = getPreferredControlModeForMigration();
      state.combos = normalizeStoredCombos(parsed.combos, { fallbackMode: migrationMode });
      if (source === 'main') {
        const normalizedRaw = JSON.stringify({ combos: state.combos });
        const shouldPersistNormalized = normalizedRaw !== String(mainRaw || '');
        if (shouldPersistNormalized) {
          try {
            commitSaveNow(slug);
          } catch { }
        }
      }
      state.recoverySource = source === 'main' ? '' : source;
      state.isDirty = source !== 'main';
      updateSaveStatusUI(state.isDirty, source !== 'main');
    } catch { }
  }

  function loadUiPrefs() {
    try {
      const raw = localStorage.getItem(UI_PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return;

      const preset = String(parsed.columnPreset || '').trim();
      if (preset && COLUMN_PRESETS.some((item) => item.key === preset)) {
        state.columnPreset = preset;
      }

      const customCols = Array.isArray(parsed.customHiddenColumns)
        ? parsed.customHiddenColumns
          .map((v) => Number.parseInt(v, 10))
          .filter((v) => Number.isFinite(v) && v > 1)
        : [];
      if (customCols.length) {
        state.customHiddenColumns = new Set(customCols);
      }

      if (parsed.rowVisibility && typeof parsed.rowVisibility === 'object') {
        state.rowVisibility = {
          frame: parsed.rowVisibility.frame !== false,
          buttons: parsed.rowVisibility.buttons !== false,
          notes: parsed.rowVisibility.notes !== false,
        };
      }

    } catch { }
    const persistedMode = loadPersistedComboControlMode();
    if (persistedMode === 'classic' || persistedMode === 'modern') {
      state.controlMode = persistedMode;
    }
  }

  function saveUiPrefs() {
    try {
      const payload = {
        columnPreset: state.columnPreset || 'basic',
        customHiddenColumns: Array.from(state.customHiddenColumns || [])
          .map((v) => Number.parseInt(v, 10))
          .filter((v) => Number.isFinite(v) && v > 1),
        rowVisibility: {
          frame: !!(state.rowVisibility && state.rowVisibility.frame),
          buttons: !!(state.rowVisibility && state.rowVisibility.buttons),
          notes: !!(state.rowVisibility && state.rowVisibility.notes),
        },
      };
      localStorage.setItem(UI_PREFS_KEY, JSON.stringify(payload));
    } catch { }
  }

  function persist(options = {}) {
    const opts = options || {};
    const immediate = opts.immediate === true;
    const dirty = opts.dirty !== false;
    try {
      if (Array.isArray(state.combos) && state.combos.length) {
        state.combos.forEach((combo) => {
          syncDerivedComboFields(combo);
        });
      }
      const slug = state.currentCharacter || getCharacterSlugFromUi();
      if (!state.currentCharacter) state.currentCharacter = slug;
      if (dirty) {
        markDirty();
      }
      if (immediate) {
        flushAutosaveNow();
      }
    } catch { }
  }

  function applyStateToTable() {
    state.groups.forEach((group) => {
      const combo = state.combos[group.index] || defaultCombo();
      syncDerivedComboFields(combo);
      if (combo && typeof combo.command === 'string') {
        const canonical = canonicalizeCommandForStorage(combo.command);
        if (canonical !== combo.command) {
          combo.command = canonical;
          if (!combo.buttons || canonicalizeCommandForStorage(combo.buttons) === combo.command) {
            combo.buttons = canonical;
          }
        }
      }
      Object.keys(group.inputs).forEach((field) => {
        const input = group.inputs[field];
        if (!input) return;
        if (input.tagName === 'SELECT') {
          input.value = combo[field] || '';
        } else if (input.classList.contains('cmd-input')) {
          if (field === 'buttons') {
            renderButtonsInput(input, combo[field] || '');
          } else {
            if (field === 'command') {
              input.textContent = localizeCommandForDisplay(combo[field] || '', getComboLang());
            } else {
              input.textContent = combo[field] || '';
            }
          }
        } else if (NUMERIC_FIELDS.has(field)) {
          input.value = formatNumberText(combo[field]);
        } else {
          if (field === 'special_condition' && input.classList.contains('multi-input')) {
            const raw = combo[field] || '';
            input.dataset.rawValue = raw;
            input.value = formatSpecialConditionDisplay(raw, getComboLang());
          } else {
            input.value = combo[field] || '';
          }
        }
        if (field === 'combo_notes' && input.tagName === 'TEXTAREA') {
          autoResizeNotesInput(input);
        }
      });
      refreshCommandWarning(group.index);
    });
    updateEmptyGroups();
    applyCommandFontSize();
  }

  function applyCommandFontSize() {
    if (!ui.comboView || !ui.table) return;
    const rawSize = getComputedStyle(ui.comboView).getPropertyValue('--command-font-size').trim();
    const size = rawSize || '12px';
    ui.table.querySelectorAll('.cmd-input[data-field="command"]').forEach((el) => {
      el.style.setProperty('font-size', size, 'important');
      el.style.setProperty('line-height', '1.1', 'important');
    });
  }

  function bindEvents() {
    if (ui.search) ui.search.addEventListener('input', onSearchInput);
    if (ui.searchBtn) ui.searchBtn.addEventListener('click', onSearch);
    if (ui.filterBtn) ui.filterBtn.addEventListener('click', toggleFilterPanel);
    if (ui.exportBtn) {
      ui.exportBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        toggleExportMenu();
      });
    }
    if (ui.exportMenu) {
      ui.exportMenu.addEventListener('click', (ev) => {
        const btn = ev.target.closest('button[data-export]');
        if (!btn) return;
        ev.preventDefault();
        ev.stopPropagation();
        const type = btn.dataset.export;
        const options = getExportOptions();
        closeExportMenu();
        handleExport(type, options);
      });
    }
    document.addEventListener('click', handleExportMenuOutside);
    if (ui.importBtn) ui.importBtn.addEventListener('click', () => ui.importInput && ui.importInput.click());
    if (ui.notationBtn) ui.notationBtn.addEventListener('click', openNotationManager);
    if (ui.tabClassic) ui.tabClassic.addEventListener('click', () => setControlMode('classic'));
    if (ui.tabModern) ui.tabModern.addEventListener('click', () => setControlMode('modern'));
    if (ui.charBtn) ui.charBtn.addEventListener('click', openCharSelect);

    if (!ui.importInput) {
      ui.importInput = document.createElement('input');
      ui.importInput.type = 'file';
      ui.importInput.accept = '.json,.xlsx';
      ui.importInput.style.position = 'absolute';
      ui.importInput.style.left = '-9999px';
      document.body.appendChild(ui.importInput);
    }
    ui.importInput.addEventListener('change', handleImport);

    ui.table.addEventListener('input', handleInputChange);
    ui.table.addEventListener('change', handleInputChange);
    ui.table.addEventListener('click', (ev) => {
      const target = ev.target;
      if (target && target.classList && target.classList.contains('cmd-input') && target.dataset.field === 'command') {
        setActiveCell(target);
      }
      if (target && target.classList && target.classList.contains('multi-input')) {
        openMultiSelect(target);
      }
      const row = target && target.closest ? target.closest('tr.combo-group-row') : null;
      if (row) {
        const groupIndex = state.groups.findIndex((group) => group.rowList.includes(row));
        if (groupIndex >= 0) setSelectedGroup(groupIndex, { scroll: false });
      }
    });
    ui.table.addEventListener('focusin', (ev) => {
      const target = ev.target;
      if (target && target.classList && target.classList.contains('cmd-input') && target.dataset.field === 'command') {
        setActiveCell(target);
      }
      if (target && target.classList && target.classList.contains('multi-input')) {
        openMultiSelect(target);
      }
    });
    ui.table.addEventListener('paste', handleCommandPaste);
    ui.table.addEventListener('blur', handleContentEditableBlur, true);

    if (ui.comboView) {
      ui.comboView.addEventListener('click', handleTokenClick);
      ui.comboView.addEventListener('click', (ev) => {
        const inGroup = ev.target && ev.target.closest
          ? ev.target.closest('tr.combo-group-row')
          : null;
        if (!inGroup) setSelectedGroup(-1);
      });
    }
    document.addEventListener('keydown', handleKeymapInput);

    ensureFilterPanel();
    applyUiButtonLayout();
    decorateTokenTables();
  }

  function toggleExportMenu(force) {
    if (!ui.exportMenu) return;
    if (typeof force === 'boolean') {
      ui.exportMenu.classList.toggle('hidden', !force);
      return;
    }
    ui.exportMenu.classList.toggle('hidden');
  }

  function closeExportMenu() {
    toggleExportMenu(false);
  }

  function handleExportMenuOutside(ev) {
    if (!ui.exportMenu || ui.exportMenu.classList.contains('hidden')) return;
    if (ui.exportWrapper && ui.exportWrapper.contains(ev.target)) return;
    closeExportMenu();
  }

  async function handleExport(type, options = {}) {
    const opts = { scope: 'current', mode: 'current', includeHidden: false, ...options };
    flushAutosaveNow();
    try {
      const shouldShow = type === 'html' || type === 'xlsx' || (type === 'json' && opts.scope === 'all');
      if (shouldShow) showExportToast(comboMsg('exporting'), false, { sticky: true, dim: true });
      let ok = false;
      if (type === 'html') {
        ok = await exportCombosHtml(opts);
        if (ok) showExportToast(comboMsg('export_html_complete'), false, { dim: true });
        else showExportToast(comboMsg('export_html_failed'), true, { dim: true });
        return;
      }
      if (type === 'xlsx') {
        ok = await exportCombosXlsx(opts);
        if (ok) showExportToast(comboMsg('export_xlsx_complete'), false, { dim: true });
        else showExportToast(comboMsg('export_xlsx_failed'), true, { dim: true });
        return;
      }
      ok = exportCombosJson(opts);
      if (ok) showExportToast(comboMsg('export_json_complete'), false, { dim: true });
      else showExportToast(comboMsg('export_json_failed'), true, { dim: true });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      const reason = err && err.message ? err.message : String(err || '');
      showExportToast(`${comboMsg('export_failed')}${reason ? ` ${reason}` : ''}`, true, { dim: true });
    }
  }

  function cleanupStorageBuckets() {
    try {
      const prefix = `${STORAGE_KEY_BASE}:`;
      const keys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
      if (keys.length <= 1) return;
      const known = new Set(getAllCharacterSlugs());
      const buckets = new Map();
      keys.forEach((key) => {
        const rawSlug = key.slice(prefix.length);
        if (!rawSlug) return;
        const canonical = known.has(rawSlug) ? rawSlug : (resolveCharacterSlug(rawSlug) || rawSlug);
        const raw = localStorage.getItem(key);
        if (!raw) return;
        let combos = [];
        try {
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.combos)) {
            combos = parsed.combos.map((c) => ({ ...defaultCombo(), ...c }));
          }
        } catch { }
        if (!buckets.has(canonical)) {
          buckets.set(canonical, { keys: [], combos: [] });
        }
        const entry = buckets.get(canonical);
        entry.keys.push(key);
        entry.combos.push(...combos);
      });
      buckets.forEach((entry, canonical) => {
        const seen = new Set();
        const merged = [];
        entry.combos.forEach((combo) => {
          const normalized = { ...defaultCombo(), ...combo };
          const { _manual, ...rest } = normalized;
          const signature = JSON.stringify(rest);
          if (seen.has(signature)) return;
          seen.add(signature);
          merged.push(normalized);
        });
        const targetKey = `${prefix}${canonical}`;
        localStorage.setItem(targetKey, JSON.stringify({ combos: merged }));
        entry.keys.forEach((key) => {
          if (key !== targetKey) localStorage.removeItem(key);
        });
      });
    } catch { }
  }

  function getExportOptions() {
    const scope = (qs('comboExportScope') && qs('comboExportScope').value) || 'current';
    const mode = (qs('comboExportMode') && qs('comboExportMode').value) || 'current';
    const columns = (qs('comboExportColumns') && qs('comboExportColumns').value) || 'current';
    return {
      scope,
      mode,
      includeHidden: columns === 'full',
    };
  }

  function showExportToast(message, isError = false, options = {}) {
    const existing = document.getElementById('comboExportToast');
    if (existing) existing.remove();
    const overlayId = 'comboExportOverlay';
    const existingOverlay = document.getElementById(overlayId);
    if (existingOverlay) existingOverlay.remove();
    if (options.dim) {
      let overlay = document.getElementById(overlayId);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'combo-export-overlay';
        document.body.appendChild(overlay);
      }
    }
    const toast = document.createElement('div');
    toast.id = 'comboExportToast';
    toast.className = `combo-export-toast${isError ? ' error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    if (options.sticky) return;
    window.setTimeout(() => {
      toast.classList.remove('show');
      window.setTimeout(() => toast.remove(), 300);
      const overlay = document.getElementById(overlayId);
      if (overlay) overlay.remove();
    }, 1800);
  }

  function bindRowToggles() {
    const frameToggle = qs('toggleFrameRows');
    const buttonToggle = qs('toggleButtonsRows');
    const notesToggle = qs('toggleNotesRows');
    const allToggle = qs('toggleAllRowsBtn');
    if (!ui.comboView) return;
    if (frameToggle) frameToggle.checked = !!(state.rowVisibility && state.rowVisibility.frame);
    if (buttonToggle) buttonToggle.checked = !!(state.rowVisibility && state.rowVisibility.buttons);
    if (notesToggle) notesToggle.checked = !!(state.rowVisibility && state.rowVisibility.notes);
    const update = () => {
      if (frameToggle) ui.comboView.classList.toggle('hide-frame-meter', !frameToggle.checked);
      if (buttonToggle) ui.comboView.classList.toggle('hide-buttons', !buttonToggle.checked);
      if (notesToggle) ui.comboView.classList.toggle('hide-notes', !notesToggle.checked);
      state.rowVisibility = {
        frame: frameToggle ? !!frameToggle.checked : false,
        buttons: buttonToggle ? !!buttonToggle.checked : true,
        notes: notesToggle ? !!notesToggle.checked : true,
      };
      refreshVisibleGroupRowClasses();
      saveUiPrefs();
      updateAllRowsToggleLabel(frameToggle, buttonToggle, notesToggle, allToggle);
    };
    [frameToggle, buttonToggle, notesToggle].forEach((toggle) => {
      if (!toggle) return;
      toggle.addEventListener('change', update);
    });
    if (allToggle) {
      allToggle.addEventListener('click', () => {
        const toggles = [frameToggle, buttonToggle, notesToggle].filter(Boolean);
        const shouldCheck = toggles.some((t) => !t.checked);
        toggles.forEach((t) => {
          t.checked = shouldCheck;
        });
        update();
      });
    }
    update();
  }

  function updateAllRowsToggleLabel(frameToggle, buttonToggle, notesToggle, allToggle, lang) {
    if (!allToggle) return;
    const active = lang || getComboLang();
    const toggles = [frameToggle, buttonToggle, notesToggle].filter(Boolean);
    const anyUnchecked = toggles.some((t) => !t.checked);
    allToggle.textContent = anyUnchecked
      ? (comboT('ui.rows_show_all', active) || '全表示')
      : (comboT('ui.rows_hide_all', active) || '全非表示');
  }

  function isRowVisibleByToggleState(row) {
    if (!row || row.classList.contains('combo-group-empty')) return false;
    if (row.classList.contains('combo-row-frame')) return !!(state.rowVisibility && state.rowVisibility.frame);
    if (row.classList.contains('combo-row-buttons')) return !!(state.rowVisibility && state.rowVisibility.buttons);
    if (row.classList.contains('combo-row-notes')) return !!(state.rowVisibility && state.rowVisibility.notes);
    return true;
  }

  function refreshVisibleGroupRowClasses() {
    if (!state.groups || !state.groups.length) return;
    let visibleGroupIndex = 0;
    state.groups.forEach((group) => {
      if (!group || !Array.isArray(group.rowList)) return;
      group.rowList.forEach((row) => {
        row.classList.remove(
          'combo-row-visible',
          'combo-row-visible-start',
          'combo-row-visible-end',
          'combo-group-visible-even',
          'combo-group-visible-odd',
        );
      });
      const visibleRows = group.rowList.filter((row) => (
        isRowVisibleByToggleState(row)
        && row.style.display !== 'none'
      ));
      if (!visibleRows.length) return;
      const isVisibleEven = visibleGroupIndex % 2 === 0;
      visibleGroupIndex += 1;
      visibleRows.forEach((row, idx) => {
        row.classList.add('combo-row-visible');
        row.classList.add(isVisibleEven ? 'combo-group-visible-even' : 'combo-group-visible-odd');
        if (idx === 0) row.classList.add('combo-row-visible-start');
        if (idx === visibleRows.length - 1) row.classList.add('combo-row-visible-end');
      });
    });
  }

  function updateEmptyGroups() {
    if (!state.groups.length) return;
    state.groups.forEach((group, idx) => {
      const combo = state.combos[idx] || defaultCombo();
      const isEmpty = isComboBlank(combo);
      group.rowList.forEach((row) => {
        row.classList.toggle('combo-group-empty', isEmpty);
      });
    });
    refreshVisibleGroupRowClasses();
  }

  function bindCrudButtons() {
    const createBtn = qs('comboCreateBtn');
    const duplicateBtn = qs('comboDuplicateBtn');
    const deleteBtn = qs('comboDeleteBtn');
    const dedupeBtn = qs('comboDedupeBtn');
    const restoreBtn = qs('comboRestoreBtn');
    if (createBtn) createBtn.addEventListener('click', handleCreateCombo);
    if (duplicateBtn) duplicateBtn.addEventListener('click', handleDuplicateCombo);
    if (deleteBtn) deleteBtn.addEventListener('click', handleDeleteCombo);
    if (dedupeBtn) dedupeBtn.addEventListener('click', handleDedupeCombos);
    if (restoreBtn) restoreBtn.addEventListener('click', handleRestoreCombos);
  }

  function getActiveGroupIndex() {
    const rowIndex = Number(state.activeCell && state.activeCell.dataset ? state.activeCell.dataset.row : NaN);
    if (Number.isFinite(rowIndex)) return rowIndex;
    return 0;
  }

  function isComboBlank(combo) {
    if (!combo) return true;
    if (combo._manual) return false;
    const fields = [
      'command',
      'buttons',
      'combo_notes',
      'frame_meter',
      'game_version',
      ...FIELD_ORDER,
    ];
    return fields.every((field) => {
      const value = String(combo[field] || '').trim();
      if (!value) return true;
      return false;
    });
  }

  function findEmptyGroupIndex() {
    for (let i = 0; i < state.groups.length; i += 1) {
      const combo = state.combos[i];
      if (isComboBlank(combo)) return i;
    }
    return null;
  }

  function appendEmptyGroup() {
    if (!ui.table || !state.groups.length) return null;
    const fallbackOrder = ['frame_meter', 'command', 'buttons', 'notes'];
    let template = null;
    for (let i = state.groups.length - 1; i >= 0; i -= 1) {
      const group = state.groups[i];
      if (
        group
        && group.rows
        && group.rows.frame_meter
        && group.rows.command
        && group.rows.buttons
        && group.rows.notes
      ) {
        template = group;
        break;
      }
    }
    if (!template) return null;
    const newIndex = state.groups.length;
    const sourceRows = fallbackOrder.map((key) => template.rows[key]).filter(Boolean);
    if (sourceRows.length !== fallbackOrder.length) return null;
    const clonedRows = sourceRows.map((row) => row.cloneNode(true));

    clonedRows.forEach((row) => {
      row.classList.remove(
        'selected',
        'combo-group-even',
        'combo-group-odd',
        'combo-group-start',
        'combo-group-end',
        'combo-row-command',
        'combo-row-buttons',
        'combo-row-notes',
        'combo-row-frame',
        'combo-group-empty',
      );
      row.querySelectorAll('input, select, textarea').forEach((el) => el.remove());
      row.querySelectorAll('.cmd-input').forEach((el) => {
        el.textContent = '';
        el.innerHTML = '';
      });
      row.querySelectorAll('.btn-token').forEach((el) => el.remove());
    });

    clonedRows.forEach((row) => ui.table.appendChild(row));

    const group = {
      index: newIndex,
      rows: {},
      inputs: {},
      rowList: clonedRows,
    };
    clonedRows.forEach((row, rowIdx) => {
      let label = (row.dataset.rowLabel || '').trim();
      if (!label) label = fallbackOrder[rowIdx % fallbackOrder.length] || '';
      row.dataset.rowLabel = label;
      if (label && !group.rows[label]) group.rows[label] = row;
    });

    const isEven = newIndex % 2 === 0;
    clonedRows.forEach((row, rowIdx) => {
      const rowLabel = (row.dataset.rowLabel || fallbackOrder[rowIdx % fallbackOrder.length] || '');
      row.dataset.row = String(newIndex);
      row.dataset.rowLabel = rowLabel || '';
      row.classList.add('combo-group-row');
      row.classList.add(isEven ? 'combo-group-even' : 'combo-group-odd');
      if (rowLabel === 'frame_meter') row.classList.add('combo-group-start', 'combo-row-frame');
      if (rowLabel === 'command') row.classList.add('combo-row-command');
      if (rowLabel === 'buttons') row.classList.add('combo-row-buttons');
      if (rowLabel === 'notes') row.classList.add('combo-row-notes');
      if (rowIdx === clonedRows.length - 1) row.classList.add('combo-group-end');
      if (rowLabel === 'frame_meter') ensureFrameMeterLabelBreak(row, newIndex);
    });

    state.groups.push(group);
    state.combos.push(defaultCombo());

    buildCommandRow(group);
    buildButtonsRow(group);
    buildNotesRow(group);
    buildFrameRow(group);

    return newIndex;
  }

  function ensureEmptyGroupIndex() {
    const existing = findEmptyGroupIndex();
    if (existing != null) return existing;
    return appendEmptyGroup();
  }

  function ensureGroupCount(targetCount) {
    const count = Math.max(0, Number(targetCount) || 0);
    while (state.groups.length < count) {
      const idx = appendEmptyGroup();
      if (idx == null) break;
    }
  }

  function setSelectedGroup(index, options = {}) {
    if (!state.groups.length) return;
    state.selectedGroup = index;
    updateComboGameVersionInfo(getComboLang());
    state.groups.forEach((group, idx) => {
      group.rowList.forEach((row) => {
        row.classList.toggle('selected', idx === index);
      });
    });
    const shouldScroll = options && Object.prototype.hasOwnProperty.call(options, 'scroll')
      ? Boolean(options.scroll)
      : true;
    if (index < 0 || !shouldScroll) return;
    const scroll = qs('comboTableScroll');
    const firstRow = state.groups[index] && state.groups[index].rowList[0];
    if (scroll && firstRow) {
      const offset = firstRow.offsetTop - 6;
      scroll.scrollTop = offset > 0 ? offset : 0;
    }
  }

  function handleCreateCombo() {
    const emptyIndex = ensureEmptyGroupIndex();
    if (emptyIndex == null) {
      window.alert(comboMsg('no_empty_rows'));
      return;
    }
    const combo = defaultCombo();
    combo._manual = true;
    state.combos[emptyIndex] = combo;
    persist();
    applyStateToTable();
    updateEmptyGroups();
    setSelectedGroup(emptyIndex);
  }

  function handleDuplicateCombo() {
    const sourceIndex = getActiveGroupIndex();
    const emptyIndex = ensureEmptyGroupIndex();
    if (emptyIndex == null) {
      window.alert(comboMsg('no_empty_rows'));
      return;
    }
    const source = state.combos[sourceIndex] || defaultCombo();
    state.combos[emptyIndex] = { ...defaultCombo(), ...source, _manual: true };
    persist();
    applyStateToTable();
    updateEmptyGroups();
    setSelectedGroup(emptyIndex);
  }

  function handleDeleteCombo() {
    const targetIndex = getActiveGroupIndex();
    state.combos[targetIndex] = defaultCombo();
    persist();
    applyStateToTable();
    updateEmptyGroups();
    setSelectedGroup(targetIndex);
  }

  function handleDedupeCombos() {
    const seen = new Set();
    const filtered = [];
    let dupes = 0;
    const makeKey = (combo) => {
      const fields = [
        'command',
        'buttons',
        'combo_notes',
        'frame_meter',
        'game_version',
        ...FIELD_ORDER,
      ];
      return fields.map((field) => String(combo[field] || '').trim()).join('||');
    };
    state.combos.forEach((combo) => {
      const normalized = { ...defaultCombo(), ...combo };
      if (isComboBlank(normalized)) {
        filtered.push(normalized);
        return;
      }
      const key = makeKey(normalized);
      if (seen.has(key)) {
        dupes += 1;
        return;
      }
      seen.add(key);
      filtered.push(normalized);
    });
    if (dupes === 0) {
      window.alert(comboMsg('dedupe_none'));
      return;
    }
    const ok = window.confirm(comboMsg('dedupe_confirm', { count: dupes }));
    if (!ok) return;
    state.combos = filtered;
    ensureGroupCount(state.combos.length);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedGroup(0);
  }

  function renderRestoreModalList(modal) {
    if (!modal) return;
    const list = modal.querySelector('#comboRestoreList');
    if (!list) return;
    const lang = getComboLang();
    const candidates = Array.isArray(modal._candidates) ? modal._candidates : [];
    const selected = Number.parseInt(modal.dataset.selectedIndex || '0', 10);
    list.innerHTML = candidates.map((item, idx) => {
      const sourceLabel = getRestoreSourceLabel(item.source, lang);
      const when = formatRestoreSavedAt(item.savedAt, lang);
      const activeClass = idx === selected ? ' active' : '';
      return `<button type="button" class="combo-restore-option${activeClass}" data-index="${idx}">
        <span class="source">${sourceLabel}</span>
        <span class="time">${when}</span>
      </button>`;
    }).join('');
    const applyBtn = modal.querySelector('button[data-action="apply"]');
    if (applyBtn) applyBtn.disabled = !candidates.length;
  }

  function openRestoreModal(candidates) {
    return new Promise((resolve) => {
      let modal = qs('comboRestoreModal');
      if (!modal) {
        const lang = getComboLang();
        const title = comboT('ui.restore_title', lang) || 'Choose Restore Source';
        const applyLabel = comboT('ui.restore_apply', lang) || 'Restore';
        const cancelLabel = comboT('ui.restore_cancel', lang) || 'Cancel';
        const noticeText = comboT('ui.restore_notice', lang) || '';
        modal = document.createElement('div');
        modal.id = 'comboRestoreModal';
        modal.className = 'combo-keymap-modal combo-restore-modal hidden';
        modal.innerHTML = `
          <div class="combo-keymap-content combo-restore-content">
            <header>
              <h3>${title}</h3>
            </header>
            <div id="comboRestoreList" class="combo-restore-list"></div>
            <p class="combo-restore-notice">${noticeText}</p>
            <div class="combo-keymap-actions combo-restore-actions">
              <button type="button" data-action="apply">${applyLabel}</button>
              <button type="button" data-action="close">${cancelLabel}</button>
            </div>
          </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', (ev) => {
          if (ev.target === modal) {
            closeRestoreModal(null);
            return;
          }
          const optionBtn = ev.target.closest('.combo-restore-option');
          if (optionBtn) {
            modal.dataset.selectedIndex = optionBtn.dataset.index || '0';
            renderRestoreModalList(modal);
            return;
          }
          const action = ev.target && ev.target.dataset && ev.target.dataset.action;
          if (action === 'close') {
            closeRestoreModal(null);
            return;
          }
          if (action === 'apply') {
            const idx = Number.parseInt(modal.dataset.selectedIndex || '0', 10);
            const list = Array.isArray(modal._candidates) ? modal._candidates : [];
            const selected = Number.isFinite(idx) && idx >= 0 && idx < list.length ? list[idx] : null;
            closeRestoreModal(selected);
          }
        });
      }
      modal._resolve = resolve;
      modal._candidates = Array.isArray(candidates) ? candidates : [];
      modal.dataset.selectedIndex = '0';
      applyComboUiLabels(getComboLang());
      renderRestoreModalList(modal);
      modal.classList.remove('hidden');
    });
  }

  function closeRestoreModal(selected) {
    const modal = qs('comboRestoreModal');
    if (!modal) return;
    modal.classList.add('hidden');
    const resolve = modal._resolve;
    modal._resolve = null;
    modal._candidates = [];
    if (typeof resolve === 'function') {
      resolve(selected || null);
    }
  }

  function getNotationManagerRows(lang) {
    const api = getNotationDictApi();
    if (!api || typeof api.getNotationManagerRows !== 'function') return [];
    return api.getNotationManagerRows(lang || getComboLang());
  }

  function ensureNotationManagerModal() {
    let modal = qs('comboNotationModal');
    if (modal) return modal;
    const lang = getComboLang();
    const title = comboT('ui.notation_title', lang) || 'Notation Dictionary (Import)';
    const closeLabel = comboT('ui.notation_close', lang) || 'Close';
    const desc = comboT('ui.notation_desc', lang) || '';
    const hint1 = comboT('ui.notation_hint_1', lang) || '';
    const hint2 = comboT('ui.notation_hint_2', lang) || '';
    const hint3 = comboT('ui.notation_hint_3', lang) || '';
    const existingDictTitle = comboT('ui.notation_existing_dict', lang) || 'Existing Dictionary';
    const normalizeTitle = comboT('ui.notation_normalize_title', lang) || 'Normalization Test';
    const normalizeDesc = comboT('ui.notation_normalize_desc', lang) || '';
    const aliasPlaceholder = comboT('ui.notation_input_alias', lang) || 'Alias';
    const lmPlaceholder = comboT('ui.notation_input_lm', lang) || 'LM Token';
    const testPlaceholder = comboT('ui.notation_test_placeholder', lang) || '';
    const addLabel = comboT('ui.notation_add', lang) || 'Add/Update';
    const resetLabel = comboT('ui.notation_reset', lang) || 'Reset';
    const exportLabel = comboT('ui.notation_export', lang) || 'Export';
    const importLabel = comboT('ui.notation_import', lang) || 'Import';

    modal = document.createElement('div');
    modal.id = 'comboNotationModal';
    modal.className = 'combo-keymap-modal combo-notation-modal hidden';
    modal.innerHTML = `
      <div class="combo-keymap-content combo-notation-content">
        <header><h3>${title}</h3></header>
        <p class="combo-notation-desc">${desc}</p>
        <ul class="combo-notation-hints">
          <li>${hint1}</li>
          <li>${hint2}</li>
          <li>${hint3}</li>
        </ul>
        <div class="combo-notation-add">
          <input type="text" id="comboNotationAliasInput" placeholder="${aliasPlaceholder}">
          <input type="text" id="comboNotationLmInput" placeholder="${lmPlaceholder}">
          <button type="button" data-action="add">${addLabel}</button>
        </div>
        <div class="combo-notation-test">
          <h4 class="combo-notation-section-title" data-notation-label="notation_normalize_title">${normalizeTitle}</h4>
          <p class="combo-notation-test-desc" data-notation-label="notation_normalize_desc">${normalizeDesc}</p>
          <div class="combo-notation-test-head">
            <label data-notation-label="notation_test_original">${comboT('ui.notation_test_original', lang) || 'Input'}</label>
          </div>
          <textarea id="comboNotationTestInput" rows="2" placeholder="${testPlaceholder}"></textarea>
          <div class="combo-notation-preview">
            <div class="line"><span data-notation-label="notation_test_normalized">${comboT('ui.notation_test_normalized', lang) || 'Normalized'}</span><pre id="comboNotationPreviewNormalized"></pre></div>
            <div class="line"><span data-notation-label="notation_test_replacements">${comboT('ui.notation_test_replacements', lang) || 'Replacements'}</span><div id="comboNotationPreviewReplacements"></div></div>
            <div class="line"><span data-notation-label="notation_test_unknown">${comboT('ui.notation_test_unknown', lang) || 'Unknown'}</span><div id="comboNotationPreviewUnknown"></div></div>
          </div>
        </div>
        <h4 class="combo-notation-section-title" data-notation-label="notation_existing_dict">${existingDictTitle}</h4>
        <div class="combo-notation-table-wrap">
          <table class="combo-notation-table">
            <thead>
              <tr>
                <th data-notation-label="notation_table_alias">${comboT('ui.notation_table_alias', lang) || 'Alias'}</th>
                <th data-notation-label="notation_table_lm">${comboT('ui.notation_table_lm', lang) || 'LM'}</th>
                <th data-notation-label="notation_table_display">${comboT('ui.notation_table_display', lang) || 'Display'}</th>
                <th data-notation-label="notation_table_source">${comboT('ui.notation_table_source', lang) || 'Source'}</th>
                <th data-notation-label="notation_table_enabled">${comboT('ui.notation_table_enabled', lang) || 'Enabled'}</th>
                <th data-notation-label="notation_table_actions">${comboT('ui.notation_table_actions', lang) || 'Actions'}</th>
              </tr>
            </thead>
            <tbody id="comboNotationTableBody"></tbody>
          </table>
        </div>
        <div class="combo-notation-tools">
          <button type="button" data-action="reset">${resetLabel}</button>
          <button type="button" data-action="export">${exportLabel}</button>
          <button type="button" data-action="import">${importLabel}</button>
          <input type="file" id="comboNotationImportInput" accept=".json,application/json" hidden>
        </div>
        <div class="combo-keymap-actions">
          <button type="button" data-action="close">${closeLabel}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        closeNotationManager();
        return;
      }
      const action = ev.target && ev.target.dataset && ev.target.dataset.action;
      if (!action) return;
      if (action === 'close') {
        closeNotationManager();
        return;
      }
      if (action === 'add') {
        handleNotationAdd();
        return;
      }
      if (action === 'reset') {
        handleNotationReset();
        return;
      }
      if (action === 'export') {
        handleNotationExport();
        return;
      }
      if (action === 'import') {
        const input = qs('comboNotationImportInput');
        if (input) input.click();
        return;
      }
      if (action === 'edit') {
        handleNotationEdit(ev.target.dataset.alias || '');
        return;
      }
      if (action === 'delete') {
        handleNotationDelete(ev.target.dataset.alias || '');
        return;
      }
      if (action === 'toggle-default') {
        handleNotationToggleDefault(ev.target.dataset.alias || '', ev.target.checked);
      }
    });

    const importInput = modal.querySelector('#comboNotationImportInput');
    if (importInput) {
      importInput.addEventListener('change', handleNotationImportFile);
    }

    const testInput = modal.querySelector('#comboNotationTestInput');
    if (testInput) {
      testInput.addEventListener('input', runNotationTestPreview);
    }

    return modal;
  }

  function renderNotationManagerRows() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationTableBody');
    if (!body) return;
    const lang = getComboLang();
    const rows = getNotationManagerRows(lang);
    state.notationManagerRows = rows.slice();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="6">-</td></tr>';
      return;
    }
    const categoryOrder = ['user', 'directional', 'attack', 'utility', 'frequent'];
    const grouped = new Map();
    categoryOrder.forEach((key) => grouped.set(key, []));
    rows.forEach((row) => {
      const key = row.source === 'user'
        ? 'user'
        : (categoryOrder.includes(row.category) ? row.category : 'utility');
      grouped.get(key).push(row);
    });

    const sectionLabel = (category) => comboT(`ui.notation_category_${category}`, lang) || category;
    const renderButtonsFromLm = (lmToken) => {
      const canonical = canonicalizeCommandForStorage(String(lmToken || ''));
      const tokens = parseButtonsValue(canonical);
      if (!tokens.length) {
        return escapeHtml(localizeCommandForDisplay(canonical, lang));
      }
      return tokens.map((token) => {
        const icon = getButtonIcon(token);
        const label = localizeCommandForDisplay(displayLabelForToken(token), lang);
        if (!icon) {
          return `<span class="btn-token btn-token-fallback">${escapeHtml(label)}</span>`;
        }
        return `<span class="btn-token" title="${escapeHtml(label)}"><img alt="${escapeHtml(label)}" src="${icon.src}"><span class="btn-token-text">${escapeHtml(label)}</span></span>`;
      }).join('');
    };

    const html = [];
    categoryOrder.forEach((category) => {
      const items = grouped.get(category) || [];
      if (!items.length) return;
      html.push(`<tr class="notation-category-row"><td colspan="6">${escapeHtml(sectionLabel(category))}</td></tr>`);
      items.forEach((row) => {
        const aliasEsc = escapeHtml(row.alias);
        const lmLabel = localizeCommandForDisplay(row.lmToken, lang);
        const lmEsc = escapeHtml(lmLabel);
        const displayHtml = renderButtonsFromLm(row.lmToken);
        const sourceLabel = row.source === 'user'
          ? (comboT('ui.notation_source_user', lang) || 'User')
          : (comboT('ui.notation_source_default', lang) || 'Default');
        const enabledCell = row.source === 'default'
          ? `<input type="checkbox" data-action="toggle-default" data-alias="${aliasEsc}" ${row.enabled ? 'checked' : ''}>`
          : '-';
        const actions = row.source === 'user'
          ? `<button type="button" data-action="edit" data-alias="${aliasEsc}">${comboT('ui.notation_action_edit', lang) || 'Edit'}</button>
           <button type="button" data-action="delete" data-alias="${aliasEsc}">${comboT('ui.notation_action_delete', lang) || 'Delete'}</button>`
          : '-';
        html.push(`<tr>
        <td>${aliasEsc}</td>
        <td>${lmEsc}</td>
        <td class="combo-notation-buttons"><div class="combo-notation-buttons-wrap">${displayHtml}</div></td>
        <td>${escapeHtml(sourceLabel)}</td>
        <td>${enabledCell}</td>
        <td>${actions}</td>
      </tr>`);
      });
    });
    body.innerHTML = html.join('');
  }

  function runNotationTestPreview() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const input = modal.querySelector('#comboNotationTestInput');
    const outNormalized = modal.querySelector('#comboNotationPreviewNormalized');
    const outReplacements = modal.querySelector('#comboNotationPreviewReplacements');
    const outUnknown = modal.querySelector('#comboNotationPreviewUnknown');
    if (!input || !outNormalized || !outReplacements || !outUnknown) return;
    const api = getNotationDictApi();
    const raw = String(input.value || '');
    if (!api || typeof api.normalizeCommandText !== 'function') {
      outNormalized.textContent = raw;
      outReplacements.textContent = '-';
      outUnknown.textContent = '-';
      return;
    }
    const result = api.normalizeCommandText(raw);
    const normalizedText = String((result && result.normalizedText) || '');
    outNormalized.textContent = localizeCommandForDisplay(normalizedText, getComboLang());
    const replacements = Array.isArray(result && result.replacements) ? result.replacements : [];
    outReplacements.innerHTML = replacements.length
      ? replacements.map((pair) => `<span class="chip">${escapeHtml(pair.from)} -> ${escapeHtml(localizeCommandForDisplay(pair.to, getComboLang()))}</span>`).join(' ')
      : '-';
    const unknown = Array.isArray(result && result.unknown) ? result.unknown : [];
    outUnknown.innerHTML = unknown.length
      ? unknown.map((term) => `<span class="chip unknown">${escapeHtml(term)}</span>`).join(' ')
      : '-';
  }

  function handleNotationAdd() {
    const api = getNotationDictApi();
    if (!api || typeof api.addOrUpdateUserAlias !== 'function') return;
    const aliasInput = qs('comboNotationAliasInput');
    const lmInput = qs('comboNotationLmInput');
    const alias = aliasInput ? aliasInput.value : '';
    const lmToken = lmInput ? lmInput.value : '';
    const result = api.addOrUpdateUserAlias(alias, lmToken);
    if (!result || !result.ok) {
      window.alert(comboMsg('notation_add_failed'));
      return;
    }
    if (aliasInput) aliasInput.value = '';
    if (lmInput) lmInput.value = '';
    renderNotationManagerRows();
    runNotationTestPreview();
    if (result.warnings && result.warnings.length) {
      showExportToast(comboMsg('notation_add_warning', { warnings: result.warnings.join(', ') }), false, { dim: false });
    } else {
      showExportToast(comboMsg('notation_add_done'), false, { dim: false });
    }
  }

  function handleNotationEdit(alias) {
    const row = state.notationManagerRows.find((item) => item.source === 'user' && item.alias === alias);
    if (!row) return;
    const aliasInput = qs('comboNotationAliasInput');
    const lmInput = qs('comboNotationLmInput');
    if (aliasInput) aliasInput.value = row.alias;
    if (lmInput) lmInput.value = row.lmToken;
    if (aliasInput) aliasInput.focus();
  }

  function handleNotationDelete(alias) {
    const api = getNotationDictApi();
    if (!api || typeof api.removeUserAlias !== 'function') return;
    const ok = window.confirm(comboMsg('notation_delete_confirm'));
    if (!ok) return;
    api.removeUserAlias(alias);
    renderNotationManagerRows();
    runNotationTestPreview();
  }

  function handleNotationToggleDefault(alias, enabled) {
    const api = getNotationDictApi();
    if (!api) return;
    if (enabled && typeof api.enableDefaultAlias === 'function') {
      api.enableDefaultAlias(alias);
    } else if (!enabled && typeof api.disableDefaultAlias === 'function') {
      api.disableDefaultAlias(alias);
    }
    renderNotationManagerRows();
    runNotationTestPreview();
  }

  function handleNotationReset() {
    const api = getNotationDictApi();
    if (!api || typeof api.resetUserAliases !== 'function') return;
    const ok = window.confirm(comboMsg('notation_reset_confirm'));
    if (!ok) return;
    api.resetUserAliases();
    renderNotationManagerRows();
    runNotationTestPreview();
  }

  function handleNotationExport() {
    const api = getNotationDictApi();
    if (!api || typeof api.exportUserAliasesJSON !== 'function') return;
    const text = api.exportUserAliasesJSON();
    downloadFile('notation_user_overrides.json', 'application/json;charset=utf-8', text);
  }

  async function handleNotationImportFile(ev) {
    const file = ev.target && ev.target.files ? ev.target.files[0] : null;
    if (!file) return;
    try {
      const text = await file.text();
      const api = getNotationDictApi();
      if (!api || typeof api.importUserAliasesJSON !== 'function') return;
      api.importUserAliasesJSON(text);
      renderNotationManagerRows();
      runNotationTestPreview();
      showExportToast(comboMsg('notation_import_done'), false, { dim: false });
    } catch {
      window.alert(comboMsg('notation_import_failed'));
    } finally {
      ev.target.value = '';
    }
  }

  async function openNotationManager() {
    const loaded = await ensureNotationDictionaryLoaded();
    if (!loaded) {
      window.alert(comboMsg('notation_load_failed'));
      return;
    }
    const modal = ensureNotationManagerModal();
    if (!modal) return;
    modal.classList.remove('hidden');
    applyComboUiLabels(getComboLang());
    renderNotationManagerRows();
    runNotationTestPreview();
  }

  function closeNotationManager() {
    const modal = qs('comboNotationModal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  async function handleRestoreCombos() {
    try {
      const slug = state.currentCharacter || getCharacterSlugFromUi();
      const candidates = getRestoreCandidates(slug);
      if (!candidates.length) {
        window.alert(comboMsg('restore_no_backup'));
        return;
      }
      const lang = getComboLang();
      const chosen = await openRestoreModal(candidates);
      if (!chosen) return;
      const sourceLabel = getRestoreSourceLabel(chosen.source, lang);
      const ok = window.confirm(comboMsg('restore_confirm', { source: sourceLabel }, lang));
      if (!ok) return;
      snapshotImportBackup(slug);
      state.combos = normalizeStoredCombos(chosen.parsed.combos, {
        fallbackMode: state.controlMode,
      });
      ensureGroupCount(state.combos.length);
      while (state.combos.length < state.groups.length) {
        state.combos.push(defaultCombo());
      }
      state.isDirty = false;
      state.recoverySource = '';
      commitSaveNow(slug);
      applyStateToTable();
      updateEmptyGroups();
      applyFilters();
      setSelectedGroup(0);
      window.alert(comboMsg('restore_done'));
    } catch {
      window.alert(comboMsg('restore_failed'));
    }
  }

  function handleInputChange(ev) {
    const el = ev.target;
    if (!el || !el.dataset || el.dataset.row == null || !el.dataset.field) return;
    const row = Number(el.dataset.row);
    if (!state.combos[row]) state.combos[row] = defaultCombo();
    if (el.classList && el.classList.contains('cmd-input')) {
      // ContentEditable command/buttons are committed on blur.
      return;
    }
    if (el.tagName === 'SELECT') {
      state.combos[row][el.dataset.field] = el.value;
    } else {
      const field = el.dataset.field;
      if (field === 'special_condition' && el.classList.contains('multi-input')) {
        const raw = getMultiInputRawValue(el) || el.value;
        el.dataset.rawValue = raw;
        el.value = formatSpecialConditionDisplay(raw, getComboLang());
        state.combos[row][field] = raw;
      } else if (NUMERIC_FIELDS.has(field) && ev.type === 'change') {
        const formatted = formatNumberText(el.value);
        el.value = formatted;
        state.combos[row][field] = formatted;
      } else {
        state.combos[row][field] = el.value;
      }
    }
    if (el.dataset.field === 'combo_notes' && el.tagName === 'TEXTAREA') {
      autoResizeNotesInput(el);
    }
    if (String(state.combos[row][el.dataset.field] || '').trim()) {
      state.combos[row]._manual = false;
      if (el.dataset.field !== 'game_version') {
        ensureComboAuthoredVersion(state.combos[row]);
        syncAuthoredVersionInput(row);
      }
    }
    if (el.dataset.field === 'damage_normal' || el.dataset.field === 'drive_delta') {
      syncDerivedComboFieldsForRow(row);
    }
    persist();
    refreshCommandWarning(row);
    updateEmptyGroups();
    applyFilters();
    updateComboGameVersionInfo(getComboLang());
  }

  function handleCommandPaste(ev) {
    const target = ev.target;
    if (!target || !target.classList || !target.classList.contains('cmd-input')) return;
    if (target.dataset.field !== 'command') return;
    const row = Number(target.dataset.row);
    if (!Number.isFinite(row) || row < 0) return;
    window.setTimeout(async () => {
      const loaded = await ensureNotationDictionaryLoaded();
      if (!loaded) return;
      const currentText = (target.textContent || '').replace(/\u00a0/g, ' ');
      const unknownSet = new Set();
      const normalized = normalizeCommandWithNotation(currentText, unknownSet);
      const localized = localizeCommandForDisplay(normalized.canonical, getComboLang());
      if (localized !== currentText) {
        target.textContent = localized;
      }
      if (!state.combos[row]) state.combos[row] = defaultCombo();
      state.combos[row].command = normalized.canonical;
      syncCommandButtons(row, 'command');
      if (normalized.canonical.trim()) {
        state.combos[row]._manual = false;
        ensureComboControlMode(state.combos[row], state.controlMode);
        ensureComboAuthoredVersion(state.combos[row]);
        syncAuthoredVersionInput(row);
      }
      persist();
      refreshCommandWarning(row);
      updateEmptyGroups();
      applyFilters();
      notifyNotationUnknown(unknownSet);
    }, 0);
  }

  function handleContentEditableBlur(ev) {
    const el = ev.target;
    if (!el || !el.dataset || el.dataset.row == null || !el.dataset.field) return;
    if (!el.classList.contains('cmd-input')) return;
    const row = Number(el.dataset.row);
    if (!state.combos[row]) state.combos[row] = defaultCombo();
    if (el.dataset.field === 'buttons') {
      return;
    } else {
      const raw = (el.textContent || '').replace(/\u00a0/g, ' ');
      if (el.dataset.field === 'command') {
        const normalized = normalizeCommandWithNotation(raw);
        const canonical = normalized.canonical;
        state.combos[row][el.dataset.field] = canonical;
        const localized = localizeCommandForDisplay(canonical, getComboLang());
        if (el.textContent !== localized) {
          el.textContent = localized;
        }
        if (document.activeElement === el) {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        syncCommandButtons(row, 'command');
        if (canonical.trim()) {
          state.combos[row]._manual = false;
          ensureComboControlMode(state.combos[row], state.controlMode);
          ensureComboAuthoredVersion(state.combos[row]);
          syncAuthoredVersionInput(row);
        }
      } else {
        state.combos[row][el.dataset.field] = raw;
        if (raw.trim()) {
          state.combos[row]._manual = false;
          ensureComboAuthoredVersion(state.combos[row]);
          syncAuthoredVersionInput(row);
        }
      }
    }
    persist();
    updateEmptyGroups();
    applyFilters();
  }

  function setActiveCell(el) {
    if (state.activeCell) state.activeCell.classList.remove('cmd-active');
    state.activeCell = el;
    if (state.activeCell) state.activeCell.classList.add('cmd-active');
    const rowIndex = Number(state.activeCell && state.activeCell.dataset ? state.activeCell.dataset.row : NaN);
    if (Number.isFinite(rowIndex)) setSelectedGroup(rowIndex, { scroll: false });
  }

  function autoResizeNotesInput(el) {
    if (!el || el.tagName !== 'TEXTAREA') return;
    el.style.height = 'auto';
    const next = Math.max(el.scrollHeight || 0, 18);
    el.style.height = `${next}px`;
  }

  function setupCustomizeControls() {
    if (ui.deviceSelect) {
      ui.deviceSelect.value = state.activeDevice || 'keyboard';
      ui.deviceSelect.addEventListener('change', (ev) => {
        state.activeDevice = ev.target.value || 'keyboard';
        applyKeymapToButtons();
        updateGamepadPolling();
        const modal = qs('comboKeymapModal');
        if (modal && !modal.classList.contains('hidden')) {
          renderKeymapGrid();
        }
      });
    }
    if (ui.customizeBtn) {
      ui.customizeBtn.addEventListener('click', () => {
        openKeymapModal();
      });
    }
  }

  function resolveKeymapDevice(device) {
    if (device === 'controller') {
      const active = state.activeDevice && state.activeDevice !== 'keyboard' ? state.activeDevice : 'xbox';
      return active === 'xinput' ? 'xbox' : active;
    }
    if (device === 'keyboard' || device === 'ps5' || device === 'xbox' || device === 'dinput') {
      return device;
    }
    return 'keyboard';
  }

  function normalizeDeviceKeymap(deviceKey, raw) {
    const defaults = DEFAULT_KEYMAPS[deviceKey] || { classic: {}, modern: {} };
    const classicDefaults = defaults.classic || {};
    const modernDefaults = defaults.modern || {};
    if (raw && (raw.classic || raw.modern)) {
      return {
        classic: { ...classicDefaults, ...(raw.classic || {}) },
        modern: { ...modernDefaults, ...(raw.modern || {}) },
      };
    }
    const rawMap = raw || {};
    const classicMap = { ...classicDefaults, ...rawMap };
    return {
      classic: classicMap,
      modern: { ...modernDefaults, ...buildModernMap(rawMap) },
    };
  }

  function getActiveKeymap(device, mode) {
    if (!state.keymaps) loadKeymaps();
    const resolvedDevice = resolveKeymapDevice(device || 'keyboard');
    const deviceMaps = state.keymaps[resolvedDevice] || {};
    if (deviceMaps.classic || deviceMaps.modern) {
      if (mode === 'modern') return deviceMaps.modern || deviceMaps.classic || {};
      return deviceMaps.classic || deviceMaps.modern || {};
    }
    return deviceMaps || {};
  }

  function setActiveKeymap(device, mode, map) {
    const resolvedDevice = resolveKeymapDevice(device || 'keyboard');
    const deviceMaps = state.keymaps[resolvedDevice] || {};
    if (deviceMaps.classic || deviceMaps.modern) {
      if (mode === 'modern') deviceMaps.modern = map;
      else deviceMaps.classic = map;
      state.keymaps[resolvedDevice] = deviceMaps;
    } else {
      state.keymaps[resolvedDevice] = {
        classic: mode === 'modern' ? { ...(deviceMaps || {}) } : map,
        modern: mode === 'modern' ? map : { ...(deviceMaps || {}) },
      };
    }
  }

  const GAMEPAD_DEVICES = new Set(['ps5', 'xbox', 'dinput']);

  function updateGamepadPolling() {
    if (!GAMEPAD_DEVICES.has(state.activeDevice)) {
      stopGamepadPolling();
      return;
    }
    startGamepadPolling();
  }

  function startGamepadPolling() {
    if (state.gamepad.raf) return;
    const tick = () => {
      if (!GAMEPAD_DEVICES.has(state.activeDevice)) {
        stopGamepadPolling();
        return;
      }
      pollGamepadForDevice(state.activeDevice);
      state.gamepad.raf = window.requestAnimationFrame(tick);
    };
    state.gamepad.raf = window.requestAnimationFrame(tick);
  }

  function stopGamepadPolling() {
    if (state.gamepad.raf) {
      window.cancelAnimationFrame(state.gamepad.raf);
      state.gamepad.raf = null;
    }
    state.gamepad.lastButtons = {};
    state.gamepad.lastDir = '';
  }

  function pollGamepadForDevice(device) {
    const gp = getGamepadForDevice(device);
    if (!gp) return;

    loadKeymaps();
    const map = getActiveKeymap(device, state.controlMode);

    const {
      buttonLabels,
      modifierLabel,
      modifierButtonIndex,
      aliasMap,
      skipDpadRange,
      skipDpadIndices,
      altDpad,
    } = getGamepadConfig(device, gp);

    const modifierButton = typeof modifierButtonIndex === 'number' ? gp.buttons[modifierButtonIndex] : null;
    const modifierHeld = !!(
      modifierButton
      && (modifierButton.pressed || (typeof modifierButton.value === 'number' && modifierButton.value > 0.2))
    );

    const getHotkeyCandidates = (label) => {
      const extras = aliasMap[label] || [];
      return Array.from(new Set([label, ...extras]));
    };

    gp.buttons.forEach((btn, idx) => {
      const pressed = !!(btn && btn.pressed);
      const last = !!state.gamepad.lastButtons[idx];
      if (pressed && !last) {
        let label = buttonLabels[idx];
        if (!label && device === 'dinput') {
          label = `B${idx + 1}`;
        }
        label = label || `Button${idx}`;
        if ((skipDpadRange && idx >= 12 && idx <= 15) || (skipDpadIndices && skipDpadIndices.includes(idx))) {
          state.gamepad.lastButtons[idx] = pressed;
          return;
        }
        let token = '';
        const candidates = getHotkeyCandidates(label);
        if (modifierLabel && modifierHeld) {
          for (const candidate of candidates) {
            token = resolveTokenFromHotkey(`${modifierLabel}+${candidate}`, map);
            if (token) break;
          }
        }
        if (!token) {
          for (const candidate of candidates) {
            token = resolveTokenFromHotkey(candidate, map);
            if (token) break;
          }
        }
        if (token) appendToken(token, { forceEnd: true });
      }
      state.gamepad.lastButtons[idx] = pressed;
    });

    const dirInput = getDirectionInput(gp, { altDpad });
    if (dirInput) {
      const dirKey = modifierLabel && modifierHeld ? `${modifierLabel}+${dirInput.label}` : dirInput.label;
      if (dirKey !== state.gamepad.lastDir) {
        let token = '';
        if (modifierLabel && modifierHeld) {
          token = resolveTokenFromHotkey(`${modifierLabel}+${dirInput.label}`, map);
        }
        if (!token) {
          token = resolveTokenFromHotkey(dirInput.label, map);
        }
        if (!token) {
          token = dirInput.token;
        }
        if (token) appendToken(token, { forceEnd: true });
        state.gamepad.lastDir = dirKey;
      }
    } else {
      state.gamepad.lastDir = '';
    }
  }

  function getGamepadForDevice(device) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pads = Array.from(gamepads || []).filter(Boolean);
    if (!pads.length) return null;
    const hasId = (pad, tokens) => {
      const id = String(pad.id || '').toLowerCase();
      return tokens.some((token) => id.includes(token));
    };
    const isPs = (pad) => hasId(pad, ['dualsense', 'dualshock', 'ps5', 'ps4']);
    const isXbox = (pad) => hasId(pad, ['xbox', 'xinput', 'microsoft']);
    const isDinput = (pad) => hasId(pad, ['directinput', 'dinput']);

    if (device === 'ps5') {
      return pads.find(isPs)
        || pads.find((pad) => pad.mapping === 'standard' && !isXbox(pad))
        || pads[0];
    }
    if (device === 'xbox') {
      return pads.find(isXbox)
        || pads.find((pad) => pad.mapping === 'standard' && !isPs(pad))
        || pads[0];
    }
    if (device === 'dinput') {
      return pads.find(isDinput)
        || pads.find((pad) => pad.mapping !== 'standard')
        || pads[0];
    }
    return pads[0];
  }

  function getGamepadConfig(device, gp) {
    if (device === 'ps5') {
      return {
        buttonLabels: [
          'Cross', 'Circle', 'Square', 'Triangle',
          'L1', 'R1', 'L2', 'R2',
          'Share', 'Options', 'L3', 'R3',
          'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight',
          'PS', 'Touchpad',
        ],
        modifierLabel: 'L2',
        modifierButtonIndex: 6,
        skipDpadRange: true,
        aliasMap: {
          Square: ['□'],
          Triangle: ['△'],
          Cross: ['✕', 'X'],
          Circle: ['○', 'O'],
          Touchpad: ['Touch Pad', 'TP'],
          Share: ['Create'],
          Options: ['Menu', 'Start'],
          L1: ['LB'],
          R1: ['RB'],
          L2: ['LT'],
          R2: ['RT'],
          L3: ['LS'],
          R3: ['RS'],
          DpadUp: ['Up', '↑'],
          DpadDown: ['Down', '↓'],
          DpadLeft: ['Left', '←'],
          DpadRight: ['Right', '→'],
        },
      };
    }
    if (device === 'xbox') {
      return {
        buttonLabels: [
          'A', 'B', 'X', 'Y',
          'LB', 'RB', 'LT', 'RT',
          'View', 'Menu', 'LS', 'RS',
          'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight',
          'Xbox',
        ],
        modifierLabel: 'LT',
        modifierButtonIndex: 6,
        skipDpadRange: true,
        aliasMap: {
          A: ['Cross', '✕', 'X'],
          B: ['Circle', '○', 'O'],
          X: ['Square', '□'],
          Y: ['Triangle', '△'],
          View: ['Back', 'Select'],
          Menu: ['Start', 'Options'],
          LB: ['L1'],
          RB: ['R1'],
          LT: ['L2'],
          RT: ['R2'],
          LS: ['L3'],
          RS: ['R3'],
          DpadUp: ['Up', '↑'],
          DpadDown: ['Down', '↓'],
          DpadLeft: ['Left', '←'],
          DpadRight: ['Right', '→'],
        },
      };
    }
    return {
      buttonLabels: [
        'B1', 'B2', 'B3', 'B4',
        'B5', 'B6', 'B7', 'B8',
        'B9', 'B10', 'B11', 'B12',
        'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight',
        'B13',
      ],
      modifierLabel: 'B6',
      modifierButtonIndex: 5,
      skipDpadIndices: [16, 17, 18, 19],
      altDpad: { up: 16, down: 17, left: 18, right: 19 },
      skipDpadRange: true,
      aliasMap: {
        B1: ['Button1'],
        B2: ['Button2'],
        B3: ['Button3'],
        B4: ['Button4'],
        B5: ['Button5'],
        B6: ['Button6'],
        B7: ['Button7'],
        B8: ['Button8'],
        B9: ['Button9'],
        B10: ['Button10'],
        B11: ['Button11'],
        B12: ['Button12'],
        B13: ['Button13'],
        DpadUp: ['Up', '↑'],
        DpadDown: ['Down', '↓'],
        DpadLeft: ['Left', '←'],
        DpadRight: ['Right', '→'],
      },
    };
  }

  function getDirectionInput(gp, opts = {}) {
    if (!gp) return null;
    const alt = opts.altDpad;
    const isPressed = (idx) => gp.buttons[idx] && gp.buttons[idx].pressed;
    const up = isPressed(12) || (alt && isPressed(alt.up));
    const down = isPressed(13) || (alt && isPressed(alt.down));
    const left = isPressed(14) || (alt && isPressed(alt.left));
    const right = isPressed(15) || (alt && isPressed(alt.right));
    if (up || down || left || right) {
      if (up && left) return { token: '7', label: '↑+←' };
      if (up && right) return { token: '9', label: '↑+→' };
      if (down && left) return { token: '1', label: '↓+←' };
      if (down && right) return { token: '3', label: '↓+→' };
      if (up) return { token: '8', label: '↑' };
      if (down) return { token: '2', label: '↓' };
      if (left) return { token: '4', label: '←' };
      if (right) return { token: '6', label: '→' };
      return null;
    }
    const x = gp.axes && gp.axes.length > 0 ? gp.axes[0] : 0;
    const y = gp.axes && gp.axes.length > 1 ? gp.axes[1] : 0;
    const dead = 0.5;
    if (Math.abs(x) < dead && Math.abs(y) < dead) return null;
    const upAxis = y < -dead;
    const downAxis = y > dead;
    const leftAxis = x < -dead;
    const rightAxis = x > dead;
    if (upAxis && leftAxis) return { token: '7', label: '↑+←' };
    if (upAxis && rightAxis) return { token: '9', label: '↑+→' };
    if (downAxis && leftAxis) return { token: '1', label: '↓+←' };
    if (downAxis && rightAxis) return { token: '3', label: '↓+→' };
    if (upAxis) return { token: '8', label: '↑' };
    if (downAxis) return { token: '2', label: '↓' };
    if (leftAxis) return { token: '4', label: '←' };
    if (rightAxis) return { token: '6', label: '→' };
    return null;
  }

  function onSearch() {
    state.filters.search = (ui.search && ui.search.value) || '';
    applyFilters();
  }

  function onSearchInput() {
    if (state.searchDebounceTimer) {
      window.clearTimeout(state.searchDebounceTimer);
      state.searchDebounceTimer = null;
    }
    state.searchDebounceTimer = window.setTimeout(() => {
      state.searchDebounceTimer = null;
      onSearch();
    }, 140);
  }

  function applyFilters() {
    const search = (state.filters.search || '').toLowerCase();
    const fieldQuery = (state.filters.fieldQuery || '').toLowerCase();
    const fieldFilters = state.filters.fieldFields || [];
    const commandScopeFilters = state.filters.command_scope || [];
    const modeFilters = state.filters.mode || [];
    const positionFilters = state.filters.position || [];
    const distanceFilters = state.filters.distance || [];
    const counterFilters = state.filters.counter || [];
    const boFilters = state.filters.bo || [];
    const vsFilters = state.filters.vs || [];
    const interruptFilters = state.filters.interrupt || [];
    const specialFilters = state.filters.special || [];
    const versionFilters = state.filters.version || [];
    const safeJumpFilters = state.filters.safe_jump || [];
    const rangeFilters = state.filters.ranges || {};
    const searchExclude = new Set(['buttons', 'frame_meter']);
    const activeMode = state.controlMode === 'modern' ? 'modern' : 'classic';

    const toNumber = (value) => {
      const raw = String(value == null ? '' : value).replace(/,/g, '').trim();
      if (!raw) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    const commandQueryVariants = Array.from(new Set([
      fieldQuery,
      canonicalizeCommandForStorage(fieldQuery).toLowerCase(),
      localizeCommandForDisplay(canonicalizeCommandForStorage(fieldQuery), 'en').toLowerCase(),
    ].filter(Boolean)));

    const getFirstCommandPart = (command) =>
      String(command || '')
        .split(/\s*(?:>>|>)\s*/)
        .map((part) => part.trim())
        .find(Boolean) || '';

    const commandFieldMatches = (commandRaw) => {
      const rawCommand = String(commandRaw || '');
      if (!rawCommand || !commandQueryVariants.length) return false;
      const canonical = canonicalizeCommandForStorage(rawCommand);
      const localizedEn = localizeCommandForDisplay(canonical, 'en');
      const scope = new Set(commandScopeFilters);
      const useFirstHit = scope.has('first_hit');
      const useAny = scope.size === 0 || scope.has('any');
      const haystacks = [];

      if (useAny) {
        haystacks.push(rawCommand.toLowerCase(), canonical.toLowerCase(), localizedEn.toLowerCase());
      }
      if (useFirstHit) {
        const first = getFirstCommandPart(canonical);
        if (first) {
          haystacks.push(first.toLowerCase(), localizeCommandForDisplay(first, 'en').toLowerCase());
        }
      }
      return commandQueryVariants.some((query) => haystacks.some((hay) => hay.includes(query)));
    };

    state.groups.forEach((group) => {
      const combo = state.combos[group.index] || defaultCombo();
      let visible = true;
      if (search) {
        const hay = Object.entries(combo)
          .filter(([key]) => !searchExclude.has(key))
          .map(([, v]) => (Array.isArray(v) ? v.join(',') : v))
          .join(' ')
          .toLowerCase();
        visible = hay.includes(search);
      }
      if (visible && fieldQuery) {
        const fieldMap = {
          command: ['command'],
          notes: ['combo_notes'],
          oki: ['oki'],
        };
        if (fieldFilters.length) {
          const fields = fieldFilters.flatMap((key) => fieldMap[key] || []);
          visible = fields.some((field) => {
            if (field === 'command') return commandFieldMatches(combo.command);
            const value = combo[field];
            const text = Array.isArray(value) ? value.join(',') : String(value || '');
            return text.toLowerCase().includes(fieldQuery);
          });
        } else {
          const hay = Object.keys(combo)
            .filter((key) => !searchExclude.has(key))
            .map((field) => {
              if (field === 'command') {
                return [
                  String(combo.command || ''),
                  canonicalizeCommandForStorage(combo.command || ''),
                  localizeCommandForDisplay(combo.command || '', 'en'),
                ].join(' ');
              }
              const value = combo[field];
              return Array.isArray(value) ? value.join(',') : value;
            })
            .join(' ')
            .toLowerCase();
          visible = hay.includes(fieldQuery) || commandFieldMatches(combo.command);
        }
      }
      if (visible && !matchesComboMode(combo, activeMode)) {
        visible = false;
      }
      if (visible && modeFilters.length) {
        const mode = getComboModeForMatch(combo);
        const matched = modeFilters.some((filter) => {
          const value = String(filter || '').trim().toLowerCase();
          if (!value) return false;
          if (mode === '両方') return ['both', 'classic', 'modern'].includes(value);
          if (!mode) return false;
          return mode === value;
        });
        visible = matched;
      }
      if (visible && positionFilters.length) {
        const pos = String(combo.position || '').trim();
        visible = positionFilters.includes(pos);
      }
      if (visible && distanceFilters.length) {
        const distance = String(combo.distance || '').trim();
        visible = distanceFilters.includes(distance);
      }
      if (visible && counterFilters.length) {
        const counter = String(combo.counter_type || '').trim();
        visible = counterFilters.includes(counter);
      }
      if (visible && boFilters.length) {
        const bo = String(combo.bo_state || '').trim();
        visible = boFilters.includes(bo);
      }
      if (visible && vsFilters.length) {
        const vs = String(combo.vs_character || '').trim();
        visible = vsFilters.includes(vs);
      }
      if (visible && interruptFilters.length) {
        const interrupt = String(combo.interrupt || '').trim();
        visible = interruptFilters.includes(interrupt);
      }
      if (visible && safeJumpFilters.length) {
        const safeJump = String(combo.safe_jump || '').trim();
        visible = safeJumpFilters.includes(safeJump);
      }
      if (visible && specialFilters.length) {
        const special = String(combo.special_condition || '').trim();
        visible = specialFilters.some((value) => special.includes(value));
      }
      if (visible && versionFilters.length) {
        const version = String(combo.game_version || '').trim();
        visible = versionFilters.includes(version);
      }
      if (visible && Object.keys(rangeFilters).length) {
        visible = Object.entries(rangeFilters).every(([field, range]) => {
          const value = toNumber(combo[field]);
          if (value == null) return false;
          if (range.exact !== '' && Number(range.exact) !== value) return false;
          if (range.min !== '' && value < Number(range.min)) return false;
          if (range.max !== '' && value > Number(range.max)) return false;
          return true;
        });
      }

      group.rowList.forEach((row) => {
        row.style.display = visible ? '' : 'none';
      });
    });
    refreshVisibleGroupRowClasses();
  }

  function setControlMode(mode) {
    state.controlMode = (mode === 'modern') ? 'modern' : 'classic';
    savePersistedComboControlMode(state.controlMode);
    if (ui.comboView) ui.comboView.setAttribute('data-control', state.controlMode);
    if (ui.tabClassic) ui.tabClassic.classList.toggle('active', state.controlMode === 'classic');
    if (ui.tabModern) ui.tabModern.classList.toggle('active', state.controlMode === 'modern');
    applyUiButtonLayout();
    applyKeymapToButtons();
    const modal = qs('comboKeymapModal');
    if (modal && !modal.classList.contains('hidden')) {
      renderKeymapGrid();
    }
    state.groups.forEach((group) => refreshCommandWarning(group.index));
    applyFilters();
    saveUiPrefs();
  }

  function openCharSelect() {
    const overlay = qs('charSelectOverlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
  }

  function bindComboTabSizing() {
    document.querySelectorAll('[data-view-tab="combos"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setTimeout(() => {
          ensureTableScrollContainer();
          initComboDragScroll();
          layoutInputButtons();
          layoutHeaderActions();
        }, 50);
      });
    });
  }

  function initComboDragScroll() {
    const scroll = qs('comboTableScroll');
    if (!scroll || scroll.dataset.dragInit === 'true') return;
    if (typeof window.initDragScroll === 'function') {
      window.initDragScroll('#comboTableScroll');
    }
    scroll.style.cursor = 'grab';
    scroll.dataset.dragInit = 'true';
  }

  function ensureTableScrollContainer() {
    if (!ui.comboView || !ui.table) return;
    let container = qs('comboTableScroll');
    const px = (val) => {
      if (!val) return 0;
      const num = Number(String(val).replace('px', '').trim());
      return Number.isFinite(num) ? num : 0;
    };
    const baseStyle = ui.table.dataset.baseStyle || '';
    const baseHeightStr = ui.table.dataset.baseHeight || '';
    const styleHeightMatch = baseStyle.match(/height:\s*(\d+)px/i);
    const styleWidthMatch = baseStyle.match(/width:\s*(\d+)px/i);
    const styleLeftMatch = baseStyle.match(/left:\s*(\d+)px/i);
    const styleTopMatch = baseStyle.match(/top:\s*(\d+)px/i);
    const baseLeft = px(ui.table.dataset.baseLeft) || (styleLeftMatch ? Number(styleLeftMatch[1]) : 0);
    const baseTop = px(ui.table.dataset.baseTop) || (styleTopMatch ? Number(styleTopMatch[1]) : 0);
    const baseWidth =
      px(ui.table.dataset.baseWidth) ||
      (styleWidthMatch ? Number(styleWidthMatch[1]) : 0) ||
      px(ui.table.style.width) ||
      ui.table.offsetWidth ||
      0;
    const baseHeight =
      px(baseHeightStr) ||
      (styleHeightMatch ? Number(styleHeightMatch[1]) : 0) ||
      px(ui.table.style.height) ||
      0;
    const fixedHeight = baseHeight || 754;

    let left = baseLeft;
    let top = baseTop;
    let width = baseWidth || 600;
    let height = fixedHeight;

    height = Math.max(120, height);

    if (!container) {
      container = document.createElement('div');
      container.id = 'comboTableScroll';
      container.style.position = 'absolute';
      container.style.overflow = 'auto';
      container.style.background = 'transparent';
      container.style.zIndex = '11';
      container.dataset.baseLeft = String(baseLeft);
      container.dataset.baseTop = String(baseTop);
      container.dataset.baseWidth = String(baseWidth);
      container.dataset.baseHeight = String(fixedHeight);
      ui.comboView.appendChild(container);
    }

    if (ui.table.parentElement !== container) {
      container.appendChild(ui.table);
    }
    ui.table.style.position = 'static';
    ui.table.style.left = '';
    ui.table.style.top = '';
    ui.table.style.margin = '0';
    ui.table.style.height = 'auto';

    const storedLeft = Number(container.dataset.baseLeft) || baseLeft;
    const storedTop = Number(container.dataset.baseTop) || baseTop;
    const storedWidth = Number(container.dataset.baseWidth) || baseWidth || 600;
    const finalLeft = Number.isFinite(left) ? left : storedLeft;
    const finalTop = Number.isFinite(top) ? top : storedTop;
    const finalWidth = Number.isFinite(width) ? width : storedWidth;
    const maxWidth = Math.max(200, ui.comboView.clientWidth - finalLeft - 10);
    const cappedWidth = maxWidth;

    container.style.left = `${finalLeft}px`;
    container.style.top = `${finalTop}px`;
    container.style.width = `${cappedWidth}px`;
    const finalHeight = `${fixedHeight}px`;
    container.style.height = finalHeight;
    container.style.maxHeight = finalHeight;

    container.dataset.bottomY = String(finalTop + fixedHeight);

    ensureComboHeaderTable();
  }

  function layoutInputButtons() {
    if (!ui.comboView) return;
    const table2 = qs('Table2');
    const table3 = qs('Table3');
    const table4 = qs('Table4');
    const table5 = qs('Table5');
    const crudBar = qs('comboCrudBar');
    const rowToggles = qs('comboRowToggles');
    if (!table2 || !table4 || !table5) return;

    const gap = 64;
    const tableScroll = qs('comboTableScroll');
    const viewHeight = ui.comboView.clientHeight || ui.comboView.getBoundingClientRect().height || 0;
    const baseLeft = Number.parseFloat(table2.dataset.baseLeft || table2.style.left) || table2.offsetLeft || 0;
    const t2w = table2.offsetWidth || Number.parseFloat(table2.style.width) || 0;
    const t2h = table2.offsetHeight || Number.parseFloat(table2.style.height) || 0;
    const t3w = table3 ? table3.offsetWidth || Number.parseFloat(table3.style.width) || 0 : 0;
    const t3h = table3 ? table3.offsetHeight || Number.parseFloat(table3.style.height) || 0 : 0;
    const t4w = table4.offsetWidth || Number.parseFloat(table4.style.width) || 0;
    const t4h = table4.offsetHeight || Number.parseFloat(table4.style.height) || 0;
    const t5w = table5.offsetWidth || Number.parseFloat(table5.style.width) || 0;
    const t5h = table5.offsetHeight || Number.parseFloat(table5.style.height) || 0;
    const uiHeight = Math.max(t2h, t3h, t4h, t5h);
    const targetUiHeight = viewHeight ? Math.floor(viewHeight * 0.32) : 0;
    const autoScaleRaw = ui.comboView
      ? getComputedStyle(ui.comboView).getPropertyValue('--ui-auto-scale').trim().toLowerCase()
      : '';
    const allowScale = autoScaleRaw ? !['0', 'false', 'off', 'no'].includes(autoScaleRaw) : true;
    const forceScale = Boolean(viewHeight && uiHeight && viewHeight < 720);
    const scale =
      (allowScale || forceScale) && uiHeight && targetUiHeight ? Math.min(1, targetUiHeight / uiHeight) : 1;
    const scaled = (val) => (Number.isFinite(val) ? val * scale : 0);
    const reservedUiHeight = uiHeight ? Math.round(uiHeight * (scale || 1.0)) : 0;
    const reserveRaw = ui.comboView
      ? getComputedStyle(ui.comboView).getPropertyValue('--combo-ui-reserve').trim()
      : '';
    let extraReserve = 0;
    if (reserveRaw) {
      if (reserveRaw.endsWith('%')) {
        const pct = Number.parseFloat(reserveRaw);
        extraReserve = Number.isFinite(pct) && viewHeight ? (viewHeight * pct) / 100 : 0;
      } else {
        const px = Number.parseFloat(reserveRaw);
        extraReserve = Number.isFinite(px) ? px : 0;
      }
    }
    const isBottomCollapsed = !!state.bottomCollapsed;
    const isShortView = Boolean(viewHeight && viewHeight < 720);
    const shouldScrollUi = !isBottomCollapsed && isShortView;
    const allowUiOverflow = isBottomCollapsed || isShortView;
    ui.comboView.style.overflowY = shouldScrollUi ? 'auto' : 'hidden';
    ui.comboView.style.overflowX = 'hidden';
    ui.comboView.style.paddingBottom = '0px';
    ui.comboView.style.scrollPaddingBottom = '0px';
    ui.comboView.dataset.shortView = shouldScrollUi ? '1' : '0';
    const reservedSpace = allowUiOverflow
      ? 0
      : Math.max(0, reservedUiHeight + (Number.isFinite(extraReserve) ? extraReserve : 0));
    const reservedSpaceForLayout = Number.isFinite(reservedSpace) ? reservedSpace : uiHeight;
    const crudHeight = crudBar ? (crudBar.offsetHeight || 22) : 0;
    const toggleHeight = rowToggles ? (rowToggles.offsetHeight || 22) : 0;
    const controlHeight = Math.max(crudHeight, toggleHeight);
    const crudGap = controlHeight ? 6 : 0;
    const tableTop =
      tableScroll ? tableScroll.offsetTop : Number.parseFloat(ui.table.dataset.baseTop || ui.table.style.top) || ui.table.offsetTop || 0;
    const gapBelowTable = 10;
    const tableHeight = viewHeight
      ? viewHeight - tableTop - reservedSpaceForLayout - gapBelowTable - controlHeight - crudGap
      : 0;
    let effectiveTableHeight = 0;
    if (tableScroll && Number.isFinite(tableHeight) && viewHeight) {
      const minTableHeight = Math.max(60, Math.floor(viewHeight * 0.2));
      effectiveTableHeight = Math.max(minTableHeight, tableHeight);
      tableScroll.style.height = `${effectiveTableHeight}px`;
      tableScroll.style.maxHeight = `${effectiveTableHeight}px`;
      tableScroll.dataset.bottomY = String(tableTop + effectiveTableHeight);
    }
    const baseTop = tableScroll && viewHeight
      ? tableTop + effectiveTableHeight + gapBelowTable
      : Number.parseFloat(table2.dataset.baseTop || table2.style.top) || table2.offsetTop || 0;
    const tableBottom = tableScroll ? tableScroll.offsetTop + tableScroll.offsetHeight : baseTop;
    if (crudBar && tableScroll) {
      crudBar.style.left = '';
      crudBar.style.right = '0px';
      crudBar.style.top = `${tableBottom + 6}px`;
      crudBar.style.zIndex = '20';
      crudBar.style.width = 'auto';
      crudBar.style.display = 'flex';
      crudBar.style.visibility = 'visible';
    }
    if (rowToggles && tableScroll) {
      rowToggles.style.left = '80px';
      rowToggles.style.right = '';
      rowToggles.style.top = `${tableBottom + 6}px`;
      rowToggles.style.zIndex = '20';
      rowToggles.style.display = 'flex';
      rowToggles.style.visibility = 'visible';
    }
    const uiSectionGap = 2;
    const uiTop = controlHeight
      ? baseTop + controlHeight + crudGap + uiSectionGap
      : baseTop + uiSectionGap;

    [table2, table3, table4, table5].forEach((el) => {
      if (!el) return;
      el.style.transformOrigin = 'top left';
      el.style.transform = scale < 1 ? `scale(${scale.toFixed(3)})` : '';
    });

    table2.style.left = `${baseLeft}px`;
    table2.style.top = `${uiTop}px`;
    table4.style.left = `${baseLeft + scaled(t2w) + gap}px`;
    table4.style.top = `${uiTop}px`;
    table5.style.left = `${baseLeft + scaled(t2w) + gap + scaled(t4w) + gap}px`;
    table5.style.top = `${uiTop}px`;
    positionQuickInputLabel(table5);
    const bottomToggle = ensureBottomSectionToggle();
    positionBottomToggle(bottomToggle, tableBottom + 6, isBottomCollapsed);

    if (table3) {
      const newLeft = baseLeft - scaled(t3w) - 20;
      const newTop = uiTop;
      table3.style.left = `${Math.max(0, newLeft)}px`;
      table3.style.top = `${Math.max(0, newTop)}px`;
    }

    updateBottomSectionVisibility({
      collapsed: isBottomCollapsed,
      rowToggles,
      crudBar,
      table2,
      table3,
      table4,
      table5,
      quickLabel: qs('comboQuickInputLabel'),
    });
    if (!isBottomCollapsed) {
      adjustUiSectionWithinView([rowToggles, crudBar, table2, table3, table4, table5]);
      updateCustomizeFrame(table3);
      ensureUiSectionBackdrop([rowToggles, crudBar, table2, table3, table4, table5]);
    }
    syncComboScrollSpacer(
      !isBottomCollapsed && isShortView,
      [rowToggles, crudBar, table2, table3, table4, table5, qs('comboQuickInputLabel')],
      4
    );
  }

  function layoutHeaderActions() {
    if (!ui.comboView) return;
    if (qs('comboSearchShell')) return;
    const viewWidth = ui.comboView.clientWidth || ui.comboView.getBoundingClientRect().width || 0;
    if (!viewWidth) return;
    const marginRight = 10;
    const gap = 6;
    const getWidth = (el) => {
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      if (rect.width) return rect.width;
      const width = Number.parseFloat(el.style.width);
      return Number.isFinite(width) ? width : el.offsetWidth || 0;
    };
    const setLeft = (el, left) => {
      if (!el) return;
      const safe = Math.max(0, Math.round(left));
      el.style.left = `${safe}px`;
    };

    let right = viewWidth - marginRight;
    const exportWidth = getWidth(ui.exportBtn);
    if (ui.exportBtn) {
      right -= exportWidth;
      setLeft(ui.exportBtn, right);
      right -= gap;
    }
    const filterWidth = getWidth(ui.filterBtn);
    if (ui.filterBtn) {
      right -= filterWidth;
      setLeft(ui.filterBtn, right);
      right -= gap;
    }
    const searchBtnWidth = getWidth(ui.searchBtn);
    if (ui.searchBtn) {
      right -= searchBtnWidth;
      setLeft(ui.searchBtn, right);
      right -= gap;
    }
    const searchWidth = getWidth(ui.search);
    if (ui.search) {
      right -= searchWidth;
      setLeft(ui.search, right);
    }

    if (ui.importBtn && ui.exportBtn) {
      const exportLeft = Number.parseFloat(ui.exportBtn.style.left) || (viewWidth - marginRight - exportWidth);
      ui.importBtn.style.left = `${Math.max(0, Math.round(exportLeft))}px`;
    }
  }

  function ensureCustomizeFrame() {
    let frame = qs('comboCustomizeFrame');
    if (!frame && ui.comboView) {
      frame = document.createElement('div');
      frame.id = 'comboCustomizeFrame';
      frame.className = 'combo-customize-frame';
      ui.comboView.appendChild(frame);
    }
    return frame;
  }

  function updateCustomizeFrame(table3) {
    if (!ui.comboView || !table3) return;
    const viewRect = ui.comboView.getBoundingClientRect();
    const t3Rect = table3.getBoundingClientRect();
    const t3Left = t3Rect.left - viewRect.left + ui.comboView.scrollLeft;
    const t3Top = t3Rect.top - viewRect.top + ui.comboView.scrollTop;
    const frame = ensureCustomizeFrame();
    const pad = 2;
    frame.style.left = `${t3Left - pad}px`;
    frame.style.top = `${t3Top - pad}px`;
    frame.style.width = `${t3Rect.width + pad * 2}px`;
    frame.style.height = `${t3Rect.height + pad * 2}px`;
  }

  function adjustUiSectionWithinView(elements) {
    if (!ui.comboView || !elements || !elements.length) return;
    if (ui.comboView.dataset.shortView === '1') {
      ui.comboView.style.overflowY = 'auto';
      return;
    }
    const viewRect = ui.comboView.getBoundingClientRect();
    const viewBottom = viewRect.top + ui.comboView.clientHeight;
    const rects = elements
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width && rect.height);
    if (!rects.length) return;
    const maxBottom = Math.max(...rects.map((r) => r.bottom));
    if (maxBottom <= viewBottom) {
      ui.comboView.style.overflowY = 'hidden';
      return;
    }
    ui.comboView.style.overflowY = 'auto';
  }

  function ensureBottomSectionToggle() {
    if (!ui.comboView) return null;
    let btn = qs('comboBottomToggle');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'comboBottomToggle';
      btn.type = 'button';
      btn.className = 'combo-bottom-toggle';
      btn.addEventListener('click', () => {
        state.bottomCollapsed = !state.bottomCollapsed;
        updateBottomToggleState(btn);
        if (state.bottomCollapsed) {
          const top = Number.parseFloat(btn.dataset.baseTop || '0') || 0;
          positionBottomToggle(btn, top, true);
        }
        layoutInputButtons();
      });
      ui.comboView.addEventListener('scroll', () => {
        if (state.bottomCollapsed) {
          const baseTop = Number.parseFloat(btn.dataset.baseTop || '0') || 0;
          positionBottomToggle(btn, baseTop, true);
        }
      });
      ui.comboView.appendChild(btn);
    }
    updateBottomToggleState(btn);
    return btn;
  }

  function updateBottomToggleState(btn) {
    if (!btn) return;
    const collapsed = !!state.bottomCollapsed;
    btn.textContent = collapsed
      ? (comboT('ui.bottom_open') || '開く▲')
      : (comboT('ui.bottom_close') || '閉じる▼');
    btn.title = collapsed
      ? (comboT('ui.bottom_open_title') || '下部セクションを表示')
      : (comboT('ui.bottom_close_title') || '下部セクションを隠す');
    btn.setAttribute('aria-label', btn.title);
    btn.dataset.state = collapsed ? 'collapsed' : 'expanded';
  }

  function positionBottomToggle(btn, top, collapsed) {
    if (!ui.comboView || !btn) return;
    const left = 8;
    if (collapsed) {
      const leftPos = 8;
      const footerEl = document.querySelector('.site-footer');
      const footerInset = footerEl ? (footerEl.offsetHeight || 0) : 0;
      if (btn.parentElement !== document.body) {
        document.body.appendChild(btn);
      }
      btn.style.display = '';
      btn.style.position = 'fixed';
      btn.style.left = `${Math.round(leftPos)}px`;
      btn.style.top = '';
      btn.style.bottom = `${Math.max(6, footerInset + 6)}px`;
      btn.style.right = '';
      btn.style.zIndex = '9999';
    } else {
      const topPos = Math.max(0, top);
      if (btn.parentElement !== ui.comboView) {
        ui.comboView.appendChild(btn);
      }
      btn.style.display = '';
      btn.style.position = 'absolute';
      btn.style.left = `${Math.round(left)}px`;
      btn.style.top = `${Math.round(topPos)}px`;
      btn.style.right = '';
      btn.style.bottom = '';
      btn.style.zIndex = '';
    }
    btn.dataset.baseTop = `${Math.round(top)}`;
  }

  function updateBottomSectionVisibility({
    collapsed,
    rowToggles,
    crudBar,
    table2,
    table3,
    table4,
    table5,
    quickLabel,
  }) {
    const hide = (el) => {
      if (!el) return;
      el.style.display = 'none';
    };
    const show = (el) => {
      if (!el) return;
      el.style.display = '';
    };
    const customizeFrame = qs('comboCustomizeFrame');
    const backdrop = qs('comboUiBackdrop');
    if (ui.comboView) {
      ui.comboView.classList.toggle('combo-bottom-collapsed', collapsed);
    }
    if (collapsed) {
      hide(rowToggles);
      hide(crudBar);
      hide(table2);
      hide(table3);
      hide(table4);
      hide(table5);
      hide(quickLabel);
      hide(customizeFrame);
      hide(backdrop);
      return;
    }
    show(rowToggles);
    show(crudBar);
    show(table2);
    show(table3);
    show(table4);
    show(table5);
    show(quickLabel);
    show(customizeFrame);
    show(backdrop);
  }

  function positionQuickInputLabel(table5) {
    if (!ui.comboView || !table5) return;
    let label = qs('comboQuickInputLabel');
    if (!label) {
      label = document.createElement('div');
      label.id = 'comboQuickInputLabel';
      label.className = 'combo-quick-label';
      label.textContent = comboT('ui.quick_input') || 'クイック入力';
      ui.comboView.appendChild(label);
    }
    const left = Number.parseFloat(table5.style.left) || table5.offsetLeft || 0;
    const top = Number.parseFloat(table5.style.top) || table5.offsetTop || 0;
    const width = table5.offsetWidth || table5.getBoundingClientRect().width || 0;
    const center = width ? (left + width / 2) : left;
    label.style.left = `${center}px`;
    label.style.transform = width ? 'translateX(-50%)' : '';
    label.style.top = `${Math.max(0, top - 18)}px`;
  }

  function ensureUiSectionBackdrop(elements) {
    if (!ui.comboView || !elements || !elements.length) return;
    const viewRect = ui.comboView.getBoundingClientRect();
    const rects = elements
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width && rect.height);
    if (!rects.length) return;
    const tableScroll = qs('comboTableScroll');
    const tableRect = tableScroll ? tableScroll.getBoundingClientRect() : null;
    const uiBottom = Math.max(...rects.map((r) => r.bottom)) - viewRect.top + ui.comboView.scrollTop;
    const tableBottom = tableRect ? tableRect.bottom - viewRect.top + ui.comboView.scrollTop : 0;
    const left = 0;
    const right = ui.comboView.clientWidth;
    const top = Math.max(0, tableBottom + 2);
    const bottom = Math.max(uiBottom, top + 20);

    let backdrop = qs('comboUiBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'comboUiBackdrop';
      backdrop.className = 'combo-ui-backdrop';
      ui.comboView.appendChild(backdrop);
    }
    backdrop.style.left = `${left}px`;
    backdrop.style.top = `${top}px`;
    backdrop.style.width = `${right - left}px`;
    backdrop.style.height = `${bottom - top}px`;
  }

  function syncComboScrollSpacer(enabled, elements, extraBottom = 0) {
    if (!ui.comboView) return;
    let spacer = qs('comboScrollSpacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'comboScrollSpacer';
      spacer.setAttribute('aria-hidden', 'true');
      spacer.style.width = '1px';
      spacer.style.opacity = '0';
      spacer.style.pointerEvents = 'none';
      ui.comboView.appendChild(spacer);
    }
    if (!enabled || !elements || !elements.length) {
      spacer.style.height = '0px';
      return;
    }
    const viewRect = ui.comboView.getBoundingClientRect();
    const bottoms = elements
      .filter(Boolean)
      .map((el) => el.getBoundingClientRect())
      .filter((rect) => rect.width || rect.height)
      .map((rect) => rect.bottom - viewRect.top + (ui.comboView.scrollTop || 0));
    const contentBottom = Math.max(0, ...bottoms);
    const targetHeight = Math.ceil(contentBottom + Math.max(0, extraBottom));
    spacer.style.height = `${targetHeight}px`;
  }

  function ensureFilterPanel() {
    const panel = qs('comboFilterPanel');
    if (!panel || panel.dataset.bound === 'true') return;
    panel.dataset.bound = 'true';
    const wrapper = qs('comboAdvancedFilters');
    const applyBtn = panel.querySelector('#comboFilterApply');
    const clearBtn = panel.querySelector('#comboFilterClear');
    const buildCheckboxGroup = (containerId, name, options) => {
      const container = panel.querySelector(`#${containerId}`);
      if (!container || container.dataset.built === 'true') return;
      container.dataset.built = 'true';
      options.forEach((opt) => {
        const label = document.createElement('label');
        label.className = 'checkbox-item';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = `comboFilter-${name}`;
        input.value = opt.value;
        const span = document.createElement('span');
        span.textContent = opt.label;
        label.appendChild(input);
        label.appendChild(span);
        container.appendChild(label);
      });
    };
    const ensureCommandScopeGroup = () => {
      const container = panel.querySelector('#comboFilterFieldSearchGroup');
      if (!container) return;
      const commandInput = container.querySelector('input[name="comboFilter-field"][value="command"]');
      if (!commandInput) return;
      const commandLabel = commandInput.closest('label.checkbox-item');
      if (!commandLabel) return;
      let scope = commandLabel.querySelector('.field-command-scope');
      if (!scope) {
        scope = document.createElement('div');
        scope.className = 'checkbox-group field-command-scope hidden';
        const items = [
          { value: 'first_hit', text: comboT('filter.command_first_hit') || 'First Hit' },
          { value: 'any', text: comboT('filter.command_any') || 'Any' },
        ];
        items.forEach((item) => {
          const label = document.createElement('label');
          label.className = 'checkbox-item';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.name = 'comboFilter-command_scope';
          input.value = item.value;
          const span = document.createElement('span');
          span.textContent = item.text;
          label.appendChild(input);
          label.appendChild(span);
          scope.appendChild(label);
        });
        commandLabel.appendChild(scope);
      }
      const scopeInputs = Array.from(scope.querySelectorAll('input[name="comboFilter-command_scope"]'));
      const sync = () => {
        const active = !!commandInput.checked;
        scope.classList.toggle('hidden', !active);
        scopeInputs.forEach((input) => {
          input.disabled = !active;
          if (!active) input.checked = false;
        });
        if (active && !scopeInputs.some((input) => input.checked)) {
          const anyInput = scopeInputs.find((input) => input.value === 'any');
          if (anyInput) anyInput.checked = true;
        }
      };
      commandInput.addEventListener('change', sync);
      scopeInputs.forEach((input) => {
        input.addEventListener('change', () => {
          if (input.checked && !commandInput.checked) commandInput.checked = true;
          sync();
        });
      });
      sync();
    };
    const populateGroups = () => {
      buildCheckboxGroup('comboFilterModeGroup', 'mode', [
        { value: 'classic', label: comboValueLabel('classic', 'Classic') },
        { value: 'modern', label: comboValueLabel('modern', 'Modern') },
        { value: 'both', label: comboValueLabel('both', '両方') },
      ]);
      buildCheckboxGroup('comboFilterFieldSearchGroup', 'field', [
        { value: 'command', label: comboT('rows.command') || 'コマンド' },
        { value: 'notes', label: comboT('rows.notes') || '備考' },
        { value: 'oki', label: comboT('filter.oki') || '重ね' },
      ]);
      buildCheckboxGroup('comboFilterPositionGroup', 'position', [
        { value: '地上', label: comboValueLabel('ground', '地上') },
        { value: '空中', label: comboValueLabel('air', '空中') },
        { value: '壁', label: comboValueLabel('wall', '壁') },
        { value: '逆壁', label: comboValueLabel('reverse_wall', '逆壁') },
        { value: '壁付近', label: comboValueLabel('near_wall', '壁付近') },
        { value: '端端', label: comboValueLabel('far_wall', '端端') },
      ]);
      buildCheckboxGroup('comboFilterDistanceGroup', 'distance', [
        { value: '-', label: '-' },
        { value: '密着', label: comboValueLabel('close', '密着') },
        { value: '先端', label: comboValueLabel('tip', '先端') },
      ]);
      buildCheckboxGroup('comboFilterCounterGroup', 'counter', [
        { value: 'C', label: 'C' },
        { value: 'PC', label: 'PC' },
      ]);
      buildCheckboxGroup('comboFilterBoGroup', 'bo', [
        { value: 'BO', label: 'BO' },
        { value: 'スタン', label: comboValueLabel('stun', 'スタン') },
      ]);
      buildCheckboxGroup('comboFilterVsGroup', 'vs', [
        { value: '全キャラ', label: comboValueLabel('all_chars', '全キャラ') },
        { value: 'デカキャラのみ', label: comboValueLabel('big_only', 'デカキャラのみ') },
        { value: 'デカキャラ以外', label: comboValueLabel('no_big', 'デカキャラ以外') },
      ]);
      buildCheckboxGroup('comboFilterInterruptGroup', 'interrupt', [
        { value: '不可', label: comboValueLabel('no', '不可') },
        { value: '可', label: comboValueLabel('yes', '可') },
      ]);
      buildCheckboxGroup('comboFilterSafeJumpGroup', 'safe_jump', [
        { value: '可', label: comboValueLabel('yes', '可') },
        { value: '準', label: comboValueLabel('semi', '準') },
        { value: '不可', label: comboValueLabel('no', '不可') },
      ]);
      const specialOptions = getSpecialConditionOptions()
        .filter((opt) => opt.value && opt.value !== '-');
      buildCheckboxGroup('comboFilterSpecialGroup', 'special', specialOptions);
      const versionOptions = getGameVersionOptions()
        .filter((opt) => opt.value && opt.value !== '-');
      buildCheckboxGroup('comboFilterVersionGroup', 'version', versionOptions);
    };
    const readChecks = (name) =>
      Array.from(panel.querySelectorAll(`input[name=\"comboFilter-${name}\"]:checked`)).map((input) => input.value);
    const readRanges = () => {
      const ranges = {};
      panel.querySelectorAll('.range-row').forEach((row) => {
        const field = row.dataset.field;
        if (!field) return;
        const exact = row.querySelector('.range-exact')?.value || '';
        const min = row.querySelector('.range-min')?.value || '';
        const max = row.querySelector('.range-max')?.value || '';
        if (exact || min || max) ranges[field] = { exact, min, max };
      });
      return ranges;
    };
    populateGroups();
    ensureCommandScopeGroup();
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        state.filters.fieldQuery = panel.querySelector('#comboFilterFieldQuery')?.value || '';
        state.filters.fieldFields = readChecks('field');
        state.filters.command_scope = readChecks('command_scope');
        state.filters.mode = readChecks('mode');
        state.filters.position = readChecks('position');
        state.filters.distance = readChecks('distance');
        state.filters.counter = readChecks('counter');
        state.filters.bo = readChecks('bo');
        state.filters.vs = readChecks('vs');
        state.filters.interrupt = readChecks('interrupt');
        state.filters.special = readChecks('special');
        state.filters.version = readChecks('version');
        state.filters.safe_jump = readChecks('safe_jump');
        state.filters.ranges = readRanges();
        applyFilters();
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        panel.querySelectorAll('input[type=\"checkbox\"]').forEach((input) => {
          input.checked = false;
        });
        const fieldQuery = panel.querySelector('#comboFilterFieldQuery');
        if (fieldQuery) fieldQuery.value = '';
        panel.querySelectorAll('.range-row .range-min, .range-row .range-max').forEach((input) => {
          input.value = '';
        });
        panel.querySelectorAll('.range-row .range-exact').forEach((input) => {
          input.value = '';
        });
        state.filters.fieldQuery = '';
        state.filters.fieldFields = [];
        state.filters.command_scope = [];
        state.filters.mode = [];
        state.filters.position = [];
        state.filters.distance = [];
        state.filters.counter = [];
        state.filters.bo = [];
        state.filters.vs = [];
        state.filters.interrupt = [];
        state.filters.special = [];
        state.filters.version = [];
        state.filters.safe_jump = [];
        state.filters.ranges = {};
        applyFilters();
      });
    }
    panel.addEventListener('click', (ev) => ev.stopPropagation());
    document.addEventListener('click', (ev) => {
      if (panel.classList.contains('hidden')) return;
      if (ui.filterBtn && ui.filterBtn.contains(ev.target)) return;
      panel.classList.add('hidden');
      if (wrapper) wrapper.removeAttribute('open');
    });
  }

  function toggleFilterPanel() {
    const panel = qs('comboFilterPanel');
    if (!panel) return;
    const wrapper = qs('comboAdvancedFilters');
    const shouldOpen = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (wrapper) {
      if (shouldOpen) wrapper.setAttribute('open', '');
      else wrapper.removeAttribute('open');
    }
  }

  function handleTokenClick(ev) {
    const cell = ev.target.closest('#Table2 td[data-token], #Table4 td[data-token], #Table5 td[data-token]');
    if (!cell) return;
    if (cell.dataset.shortcutAdd === 'true') {
      const val = window.prompt('Add shortcut (e.g., 236 > 236):');
      if (!val) return;
      state.customShortcuts.push(val);
      saveCustomShortcuts();
      applyCustomShortcuts();
      return;
    }
    const token = cell.dataset.token || '';
    if (!token) return;
    appendToken(token, { forceEnd: true });
  }

  function appendToken(token, opts = {}) {
    if (!token) return;
    let target = state.activeCell;
    if (!target || target.dataset.field !== 'command') {
      const firstGroup = state.groups && state.groups[0];
      target = firstGroup && firstGroup.inputs ? firstGroup.inputs.command : null;
    }
    if (!target || target.dataset.field !== 'command') return;
    const insertText = hotkeyToCommandText(token);
    insertCommandText(target, insertText, opts);
    target.focus();
    handleContentEditableBlur({ target });
  }

  function insertCommandText(target, text, opts = {}) {
    if (opts.forceEnd) {
      target.textContent = (target.textContent || '') + text;
      const range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      return;
    }
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      target.textContent = (target.textContent || '') + text;
      return;
    }
    const range = sel.getRangeAt(0);
    if (!target.contains(range.startContainer)) {
      target.textContent = (target.textContent || '') + text;
      return;
    }

    const insertText = text;

    range.deleteContents();
    const node = document.createTextNode(insertText);
    range.insertNode(node);
    range.setStartAfter(node);
    range.setEndAfter(node);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function isRangeAtEnd(target, range) {
    const probe = document.createRange();
    probe.selectNodeContents(target);
    probe.setEnd(range.endContainer, range.endOffset);
    return probe.toString().length === (target.textContent || '').length;
  }

  function hotkeyToCommandText(token) {
    const modern = state.controlMode === 'modern';
    const modernMap = {
      y: ' L',
      u: ' M',
      i: ' H',
      LP: ' L',
      MP: ' M',
      HP: ' H',
      LK: ' SP',
      MK: ' Auto',
      SP: ' SP',
      Auto: ' Auto',
      AUTO: ' Auto',
    };
    if (modern && Object.prototype.hasOwnProperty.call(modernMap, token)) {
      return modernMap[token];
    }
    const map = {
      q: localizeCommandForDisplay('4(タメ)', getComboLang()),
      w: localizeCommandForDisplay('2(タメ)', getComboLang()),
      e: '360',
      y: ' LP',
      u: ' MP',
      i: ' HP',
      o: ' P',
      h: ' LK',
      j: ' MK',
      k: ' HK',
      l: ' K',
      a: ' Any ',
      t: ` ${localizeCommandForDisplay('投げ', getComboLang())} `,
      J: ' Jump ',
      H: ' Hold ',
      O: ' or',
      '-': ' - ',
      '>': ' > ',
      '<': ' >> ',
      D: ' [] ',
    };
    return map[token] || token;
  }

  function syncCommandButtons(row, sourceField) {
    if (state.syncing) return;
    const group = state.groups[row];
    if (!group) return;
    const combo = state.combos[row] || defaultCombo();
    state.syncing = true;
    if (sourceField === 'command') {
      const value = combo.command || '';
      combo.buttons = value;
      const buttonsInput = group.inputs.buttons;
      if (buttonsInput) renderButtonsInput(buttonsInput, value);
    }
    state.syncing = false;
  }

  function insertButtonToken(target, token) {
    if (!target || !token) return;
    const icon = getButtonIcon(token);
    const span = document.createElement('span');
    span.className = 'btn-token';
    span.dataset.token = token;
    if (icon) {
      span.dataset.icon = icon.src;
      span.innerHTML = `<img alt="" src="${icon.src}"><span class="btn-token-text">${token}</span>`;
    } else {
      span.textContent = token;
      span.classList.add('btn-token-fallback');
    }
    target.appendChild(span);
  }

  function renderButtonsInput(target, value) {
    if (!target) return;
    target.innerHTML = '';
    const tokens = parseButtonsValue(value);
    if (!tokens.length && value) {
      target.textContent = value;
      return;
    }
    tokens.forEach((token) => insertButtonToken(target, token));
  }

  function getButtonTokens(target, fallbackValue) {
    if (target) {
      const tokens = Array.from(target.querySelectorAll('.btn-token'))
        .map((el) => el.dataset.token)
        .filter(Boolean);
      if (tokens.length) return tokens;
      const raw = (target.textContent || '').trim();
      if (raw) return parseButtonsValue(raw);
    }
    return parseButtonsValue(fallbackValue || '');
  }

  function displayLabelForToken(token) {
    if (typeof token === 'string' && /^\[\s*\]$/.test(token)) {
      return '[ ]';
    }
    if (typeof token === 'string' && /^\[\d+F?\]$/i.test(token)) {
      return token;
    }
    const map = {
      q: localizeCommandForDisplay('4(タメ)', getComboLang()),
      w: localizeCommandForDisplay('2(タメ)', getComboLang()),
      e: '360',
      y: 'LP',
      u: 'MP',
      i: 'HP',
      o: 'P',
      h: 'LK',
      j: 'MK',
      k: 'HK',
      l: 'K',
      A: 'Auto',
      S: 'SP',
      I: 'DI',
      R: 'DR',
      C: 'CR',
      t: localizeCommandForDisplay('投げ', getComboLang()),
      J: 'Jump',
      H: 'Hold',
      O: 'or',
      a: 'Any',
      '-': '-',
      '<': '>>',
      '>': '>',
      D: '[]',
    };
    return map[token] || token;
  }

  function normalizeKeyLabel(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function findHotkeyForLabel(label, map) {
    const target = normalizeKeyLabel(label);
    if (!target || !map) return '';
    const key = Object.keys(map).find((mapKey) => normalizeKeyLabel(mapKey) === target);
    return key ? map[key] : '';
  }

  function resolveTokenFromHotkey(hotkey, map) {
    const target = normalizeKeyLabel(hotkey);
    if (!target || !map) return '';
    const token = Object.keys(map).find((key) => normalizeKeyLabel(map[key]) === target);
    return token || '';
  }

  function tokensToCommandString(tokens) {
    return (tokens || []).map((token) => displayLabelForToken(token)).join('');
  }

  function displayLabelForIcon(src) {
    if (!src) return '';
    const name = String(src).split('/').pop();
    const map = {
      'key-lc.png': '4(タメ)',
      'key-dc.png': '2(タメ)',
      'key-circle.png': '360',
      'delay.png': '[]',
      'key-ul.png': '7',
      'key-u.png': '8',
      'key-ur.png': '9',
      'key-l.png': '4',
      'key-nutral.png': '5',
      'key-r.png': '6',
      'key-dl.png': '1',
      'key-d.png': '2',
      'key-dr.png': '3',
      'arrow_single.png': '>',
      'arrow_double.png': '>>',
      'arrow_3.png': '-',
      'jump.png': 'Jump',
      'key-barrage.png': 'Hold',
      'key-or.png': 'or',
      'icon_throw.png': '投げ',
      'key-all.png': 'Any',
      'icon_punch_l.png': 'LP',
      'icon_punch_m.png': 'MP',
      'icon_punch_h.png': 'HP',
      'icon_kick_l.png': 'LK',
      'icon_kick_m.png': 'MK',
      'icon_kick_h.png': 'HK',
      'icon_punch.png': 'P',
      'icon_kick.png': 'K',
      'modern_auto.png': 'Auto',
      'modern_l.png': 'L',
      'modern_m.png': 'M',
      'modern_h.png': 'H',
      'modern_sp.png': 'SP',
      'modern_auto.png': 'Auto',
      'modern_dp.png': 'DP',
      'modern_dl.png': 'DI',
      'modern_dr.png': 'DR',
      'modern_cr.png': 'CR',
    };
    return map[name] || '';
  }

  function buttonsToCommandString(target, fallbackValue) {
    if (target) {
      const tokens = Array.from(target.querySelectorAll('.btn-token'));
      if (tokens.length) {
        return tokens
          .map((el) => {
            const img = el.querySelector('img');
            const labelFromIcon = img ? displayLabelForIcon(img.src) : '';
            if (labelFromIcon) return labelFromIcon;
            return displayLabelForToken(el.dataset.token || '');
          })
          .join('');
      }
    }
    const tokens = getButtonTokens(null, fallbackValue);
    return tokensToCommandString(tokens);
  }

  function getButtonsValue(target) {
    if (!target) return '';
    const tokens = Array.from(target.querySelectorAll('.btn-token'))
      .map((el) => el.dataset.token)
      .filter(Boolean);
    if (tokens.length) return tokens.join('');
    return (target.textContent || '').trim();
  }

  function parseButtonsValue(value) {
    const raw = String(value || '').trim();
    if (!raw) return [];
    const tokens = [];
    const source = raw.replace(/\s+/g, '');
    const tokenRegex = /(>>|>|-|360|\[\s*\]|\[\d+F?\]|投げ|4\(タメ\)|2\(タメ\)|[0-9]|LP|MP|HP|LK|MK|HK|P|K|SP|DP|DI|DR|CR|Auto|Any|Jump|Hold|or|[A-Za-z])/gi;
    let match;
    while ((match = tokenRegex.exec(source)) !== null) {
      tokens.push(match[1]);
    }
    if (tokens.length) return tokens;
    return raw.split(/\s+/).filter(Boolean);
  }

  function getButtonIcon(token) {
    const map = {
      '7': 'assets/images/icons/key-ul.png',
      '8': 'assets/images/icons/key-u.png',
      '9': 'assets/images/icons/key-ur.png',
      '4': 'assets/images/icons/key-l.png',
      '5': 'assets/images/icons/key-nutral.png',
      '6': 'assets/images/icons/key-r.png',
      '1': 'assets/images/icons/key-dl.png',
      '2': 'assets/images/icons/key-d.png',
      '3': 'assets/images/icons/key-dr.png',
      '4(タメ)': 'assets/images/icons/key-lc.png',
      '2(タメ)': 'assets/images/icons/key-dc.png',
      '360': 'assets/images/icons/key-circle.png',
      '[]': 'assets/images/icons/delay.png',
      '-': 'assets/images/icons/arrow_3.png',
      '>': 'assets/images/icons/arrow_single.png',
      '>>': 'assets/images/icons/arrow_double.png',
      'Jump': 'assets/images/icons/jump.png',
      'Hold': 'assets/images/icons/key-barrage.png',
      'DP': 'assets/images/icons/modern_dp.png',
      'DI': 'assets/images/icons/modern_dl.png',
      'DR': 'assets/images/icons/modern_dr.png',
      'CR': 'assets/images/icons/modern_cr.png',
      'or': 'assets/images/icons/key-or.png',
      '投げ': 'assets/images/icons/icon_throw.png',
      'Any': 'assets/images/icons/key-all.png',
      'LP': 'assets/images/icons/icon_punch_l.png',
      'MP': 'assets/images/icons/icon_punch_m.png',
      'HP': 'assets/images/icons/icon_punch_h.png',
      'P': 'assets/images/icons/icon_punch.png',
      'L': 'assets/images/icons/modern_l.png',
      'M': 'assets/images/icons/modern_m.png',
      'H': 'assets/images/icons/modern_h.png',
      'LK': 'assets/images/icons/icon_kick_l.png',
      'MK': 'assets/images/icons/icon_kick_m.png',
      'HK': 'assets/images/icons/icon_kick_h.png',
      'K': 'assets/images/icons/icon_kick.png',
      'SP': 'assets/images/icons/modern_sp.png',
      'Auto': 'assets/images/icons/modern_auto.png',
      'AUTO': 'assets/images/icons/modern_auto.png',
    };
    const src = map[token] || map[String(token).toUpperCase()] || map[String(token).toLowerCase()];
    if (!src) return null;
    return { src };
  }

  function handleKeymapInput(ev) {
    const target = state.activeCell;
    if (!target || target.dataset.field !== 'command') return;
    if (!document.activeElement || document.activeElement !== target) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const token = keyEventToToken(ev);
    if (!token) return;
    ev.preventDefault();
    appendToken(token);
  }

  function keyEventToToken(ev) {
    if (!state.keymaps) loadKeymaps();
    const map = getActiveKeymap('keyboard', state.controlMode);
    const rawKey = ev.key || '';
    const exact = Object.keys(map).find((token) => (map[token] || '') === rawKey);
    if (exact) return exact;
    if (ev.shiftKey && /^[A-Za-z]$/.test(rawKey)) {
      return rawKey.toUpperCase();
    }
    const key = rawKey.toLowerCase();
    const direct = Object.keys(map).find((token) => (map[token] || '').toLowerCase() === key);
    if (direct) return direct;
    if (/^[0-9]$/.test(ev.key)) return ev.key;
    if (ev.code && ev.code.startsWith('Numpad')) {
      const digit = ev.code.replace('Numpad', '');
      if (/^[0-9]$/.test(digit)) return digit;
      if (digit === 'Add') return '+';
      if (digit === 'Decimal') return '.';
      if (digit === 'Subtract') return '-';
    }
    return null;
  }

  function keyEventToHotkeyString(ev) {
    const key = String(ev.key || '');
    if (!key) return '';
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(key)) return '';

    const normalizeBaseKey = (raw) => {
      if (!raw) return '';
      if (raw === ' ') return 'Space';
      if (raw === 'Escape') return 'Esc';
      if (raw === 'ArrowUp') return 'Up';
      if (raw === 'ArrowDown') return 'Down';
      if (raw === 'ArrowLeft') return 'Left';
      if (raw === 'ArrowRight') return 'Right';
      if (raw.length === 1 && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        return raw.toLowerCase();
      }
      return raw;
    };

    const parts = [];
    if (ev.ctrlKey) parts.push('Ctrl');
    if (ev.altKey) parts.push('Alt');
    if (ev.metaKey) parts.push('Meta');
    if (ev.shiftKey) parts.push('Shift');

    const base = normalizeBaseKey(key);
    if (!base) return '';
    parts.push(base);
    return parts.join('+');
  }

  function matchesComboMode(combo, mode) {
    const targetMode = mode === 'modern' ? 'modern' : 'classic';
    const comboMode = getComboModeForMatch(combo);
    if (!comboMode || comboMode === '両方') return true;
    return comboMode === targetMode;
  }

  function filterCombosByMode(combos, modeScope) {
    if (!Array.isArray(combos)) return [];
    if (modeScope !== 'current') return combos.slice();
    const mode = state.controlMode || 'classic';
    return combos.filter((combo) => matchesComboMode(combo, mode));
  }

  function getAllowedRowSet(combos, modeScope) {
    if (!Array.isArray(combos)) return null;
    if (modeScope !== 'current') return null;
    const mode = state.controlMode || 'classic';
    const allowed = new Set();
    combos.forEach((combo, idx) => {
      if (matchesComboMode(combo, mode)) allowed.add(idx);
    });
    return allowed;
  }

  function getAllCharacterSlugs() {
    return Array.from(document.querySelectorAll('.char-card[data-char]'))
      .map((card) => card.getAttribute('data-char'))
      .filter(Boolean);
  }

  function loadCombosForCharacter(slug) {
    try {
      migrateLegacyCombos(slug);
      const raw = localStorage.getItem(getStorageKey(slug));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.combos)) {
        return parsed.combos.map((c) => ({ ...defaultCombo(), ...c }));
      }
    } catch { }
    return [];
  }

  function exportCombosJson(options = {}) {
    const opts = { scope: 'current', mode: 'current', ...options };
    if (opts.scope === 'all') {
      const characters = [];
      getAllCharacterSlugs().forEach((slug) => {
        const combos = filterCombosByMode(loadCombosForCharacter(slug), opts.mode);
        if (combos.length) {
          characters.push({ character: slug, combos });
        }
      });
      const comboCount = characters.reduce((sum, entry) => sum + entry.combos.length, 0);
      const payload = {
        exported_at: new Date().toISOString(),
        scope: 'all',
        combo_count: comboCount,
        characters,
      };
      downloadFile(buildExportFilename('combo_list', 'json', 'all'), 'application/json', JSON.stringify(payload, null, 2));
      return true;
    }
    if (!Array.isArray(state.combos)) return false;
    const combos = filterCombosByMode(state.combos, opts.mode);
    const payload = {
      exported_at: new Date().toISOString(),
      combo_count: combos.length,
      combos,
    };
    downloadFile(buildExportFilename('combo_list', 'json'), 'application/json', JSON.stringify(payload, null, 2));
    return true;
  }

  async function exportCombosHtml(options = {}) {
    if (!ui.table) return false;
    if (options.scope === 'all') {
      return exportAllCharactersHtml(options);
    }
    const allowedRows = getAllowedRowSet(state.combos, options.mode);
    const table = buildExportTable({
      forXlsx: false,
      includeHidden: options.includeHidden,
      allowedRows,
    });
    applyInlineStylesFromSource(table, ui.table, { includeHidden: options.includeHidden });
    await inlineExportImages(table);
    normalizeExportTableLayout(table);
    const currentSlug = resolveCharacterSlug(state.currentCharacter) || state.currentCharacter || '';
    const currentLabel = getCharacterLabel(currentSlug);
    const safeLabel = escapeHtml(currentLabel || currentSlug || 'Combo List');
    const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Combo List Export - ${safeLabel}</title>
  <style>
    html, body { height: auto; overflow: auto; }
    body { font-family: "Yu Gothic", "Noto Sans JP", sans-serif; background: #fff; color: #000; }
    table { border-collapse: separate; border-spacing: 0; font-size: 7px; height: auto !important; }
    table, table * {
      font-size: 11px !important;
      font-family: "Yu Gothic", "Noto Sans JP", sans-serif !important;
      font-weight: 400 !important;
    }
    th, td { border: 1px solid #444; padding: 4px 6px; vertical-align: middle; height: auto !important; max-height: none !important; }
    tr { height: auto !important; max-height: none !important; }
    tr.combo-row-frame td:nth-child(n+4),
    tr.combo-row-notes td:nth-child(n+4),
    tr.combo-row-buttons td:nth-child(n+4) { border-style: none !important; border-color: transparent !important; }
    tr.combo-row-frame td:nth-child(3),
    tr.combo-row-notes td:nth-child(3),
    tr.combo-row-buttons td:nth-child(3) { border-style: none !important; border-color: transparent !important; }
    tr.combo-row-command td:nth-child(n+4) { border-top: 1px solid #444 !important; }
    .combo-sep-right { border-right-width: 2px !important; border-right-style: solid !important; border-right-color: #555 !important; }
    .combo-hidden-col { display: none; }
    .btn-token { display: inline-flex; align-items: center; gap: 4px; margin-right: 4px; }
    .btn-token-text { display: none; }
    .btn-token img { width: 16px; height: 16px; object-fit: contain; }
    .export-btn-token-wrap { display: flex; flex-wrap: wrap; gap: 2px; align-items: center; white-space: normal !important; }
    .export-btn-token-wrap .btn-token { flex: 0 0 auto; margin-right: 0; }
    img { vertical-align: middle; }
  </style>
</head>
<body>
<h1>${safeLabel}</h1>
${table.outerHTML}
</body>
</html>`;
    downloadFile(buildExportFilename('combo_list', 'html'), 'text/html', html);
    return true;
  }

  async function exportAllCharactersHtml(options = {}) {
    try {
      await ensureVendorLoaded({ zip: true });
    } catch { }
    if (!window.JSZip) {
      window.alert(comboMsg('export_jszip_missing'));
      return false;
    }
    const slugs = getAllCharacterSlugs();
    if (!slugs.length) {
      window.alert(comboMsg('export_character_missing'));
      return false;
    }
    const prevCombos = state.combos;
    const prevCharacter = state.currentCharacter;
    const prevSelected = state.selectedGroup;
    const pages = [];
    try {
      for (const slug of slugs) {
        const combos = filterCombosByMode(loadCombosForCharacter(slug), options.mode);
        if (!combos.length) continue;
        state.currentCharacter = slug;
        state.combos = combos;
        ensureGroupCount(combos.length);
        applyStateToTable();
        updateEmptyGroups();
        applyFilters();
        const table = buildExportTable({
          forXlsx: false,
          includeHidden: options.includeHidden,
          allowedRows: null,
        });
        applyInlineStylesFromSource(table, ui.table, { includeHidden: options.includeHidden });
        // eslint-disable-next-line no-await-in-loop
        await inlineExportImages(table);
        normalizeExportTableLayout(table);
        const label = getCharacterLabel(slug);
        const safeLabel = label || slug;
        const fileName = buildExportFilename('combo_list', 'html', slug);
        const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Combo List Export - ${escapeHtml(safeLabel)}</title>
  <style>
    html, body { height: auto; overflow: auto; }
    body { font-family: "Yu Gothic", "Noto Sans JP", sans-serif; background: #fff; color: #000; }
    h1 { margin: 12px 0 12px; font-size: 16px; }
    table { border-collapse: separate; border-spacing: 0; font-size: 7px; height: auto !important; }
    table, table * {
      font-size: 7px !important;
      font-family: "Yu Gothic", "Noto Sans JP", sans-serif !important;
      font-weight: 400 !important;
    }
    th, td { border: 1px solid #444; padding: 4px 6px; vertical-align: middle; height: auto !important; max-height: none !important; }
    tr { height: auto !important; max-height: none !important; }
    tr.combo-row-frame td:nth-child(n+4),
    tr.combo-row-notes td:nth-child(n+4),
    tr.combo-row-buttons td:nth-child(n+4) { border-style: none !important; border-color: transparent !important; }
    tr.combo-row-frame td:nth-child(3),
    tr.combo-row-notes td:nth-child(3),
    tr.combo-row-buttons td:nth-child(3) { border-style: none !important; border-color: transparent !important; }
    tr.combo-row-command td:nth-child(n+4) { border-top: 1px solid #444 !important; }
    .combo-sep-right { border-right-width: 2px !important; border-right-style: solid !important; border-right-color: #555 !important; }
    .combo-hidden-col { display: none; }
    .btn-token { display: inline-flex; align-items: center; gap: 4px; margin-right: 4px; }
    .btn-token-text { display: none; }
    .btn-token img { width: 16px; height: 16px; object-fit: contain; }
    .export-btn-token-wrap { display: flex; flex-wrap: wrap; gap: 2px; align-items: center; white-space: normal !important; }
    .export-btn-token-wrap .btn-token { flex: 0 0 auto; margin-right: 0; }
    img { vertical-align: middle; }
  </style>
</head>
<body>
<h1>${escapeHtml(safeLabel)}</h1>
${table.outerHTML}
</body>
</html>`;
        pages.push({ slug, label: safeLabel, fileName, html });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      throw err;
    } finally {
      state.combos = prevCombos;
      state.currentCharacter = prevCharacter;
      applyStateToTable();
      updateEmptyGroups();
      applyFilters();
      if (Number.isFinite(prevSelected)) setSelectedGroup(prevSelected, { scroll: false });
    }
    if (!pages.length) {
      window.alert(comboMsg('export_no_combos'));
      return false;
    }
    if (pages.length === 1) {
      const page = pages[0];
      downloadFile(page.fileName, 'text/html', page.html);
      return true;
    }
    const zip = new window.JSZip();
    pages.forEach((page) => {
      zip.file(page.fileName, page.html);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadFile(buildExportFilename('combo_list', 'zip', 'all'), 'application/zip', blob);
    return true;
  }

  async function exportCombosXlsx(options = {}) {
    try {
      await ensureVendorLoaded({ excel: true });
    } catch { }
    if (!window.ExcelJS) {
      window.alert(comboMsg('export_exceljs_missing'));
      return false;
    }
    if (!ui.table) return;
    if (options.scope === 'all') {
      return exportAllCharactersXlsx(options);
    }
    const workbook = new window.ExcelJS.Workbook();
    const allowedRows = getAllowedRowSet(state.combos, options.mode);
    const currentSlug = resolveCharacterSlug(state.currentCharacter) || state.currentCharacter || '';
    const currentLabel = getCharacterLabel(currentSlug) || currentSlug || 'Combo List';
    const sheetName = sanitizeSheetName(currentLabel || 'Combo List');
    await addWorksheetFromTable(workbook, ui.table, sheetName, {
      includeHidden: options.includeHidden,
      allowedRows,
    });

    const output = await workbook.xlsx.writeBuffer();
    downloadFile(
      buildExportFilename('combo_list', 'xlsx'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      output,
    );
    return true;
  }

  async function exportAllCharactersXlsx(options = {}) {
    const slugs = getAllCharacterSlugs();
    if (!slugs.length) {
      window.alert(comboMsg('export_character_missing'));
      return false;
    }
    const workbook = new window.ExcelJS.Workbook();
    const prevCombos = state.combos;
    const prevCharacter = state.currentCharacter;
    const prevSelected = state.selectedGroup;
    let sheetCount = 0;
    try {
      for (const slug of slugs) {
        const combos = filterCombosByMode(loadCombosForCharacter(slug), options.mode);
        if (!combos.length) continue;
        state.currentCharacter = slug;
        state.combos = combos;
        ensureGroupCount(combos.length);
        applyStateToTable();
        updateEmptyGroups();
        applyFilters();
        const label = getCharacterLabel(slug);
        const sheetName = sanitizeSheetName(label || slug || `Sheet${sheetCount + 1}`);
        sheetCount += 1;
        // eslint-disable-next-line no-await-in-loop
        await addWorksheetFromTable(workbook, ui.table, sheetName, {
          includeHidden: options.includeHidden,
          allowedRows: null,
        });
      }
    } finally {
      state.combos = prevCombos;
      state.currentCharacter = prevCharacter;
      applyStateToTable();
      updateEmptyGroups();
      applyFilters();
      if (Number.isFinite(prevSelected)) setSelectedGroup(prevSelected, { scroll: false });
    }
    if (!sheetCount) {
      window.alert(comboMsg('export_no_combos'));
      return false;
    }
    const output = await workbook.xlsx.writeBuffer();
    downloadFile(
      buildExportFilename('combo_list', 'xlsx', 'all'),
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      output,
    );
    return true;
  }

  async function addWorksheetFromTable(workbook, table, sheetName, options = {}) {
    const worksheet = workbook.addWorksheet(sheetName);
    const allowedRows = options.allowedRows || null;
    const exportRows = Array.from(table.rows).filter((row) => {
      if (row.classList.contains('combo-group-empty')) return false;
      const rowIndex = row.dataset && row.dataset.row != null ? Number(row.dataset.row) : null;
      if (rowIndex != null && allowedRows && !allowedRows.has(rowIndex)) return false;
      return true;
    });
    const { cellPositions, colCount, rowHeightsPx, colWidthsPx } = buildCellMatrixFromRows(exportRows, {
      skipHidden: !options.includeHidden,
      table,
    });

    for (let col = 1; col <= colCount; col += 1) {
      const widthPx = colWidthsPx[col] || 80;
      worksheet.getColumn(col).width = Math.max(6, Math.round(widthPx / 7));
    }

    exportRows.forEach((row, idx) => {
      const rowIndex = idx + 1;
      const heightPx = rowHeightsPx[rowIndex];
      if (heightPx) {
        worksheet.getRow(rowIndex).height = Math.max(10, heightPx * 0.75);
      }
    });

    cellPositions.forEach((pos, cell) => {
      const { row, col, rowspan, colspan } = pos;
      if (rowspan > 1 || colspan > 1) {
        worksheet.mergeCells(row, col, row + rowspan - 1, col + colspan - 1);
      }
      const hasTokens = cell.querySelector('.btn-token');
      if (!hasTokens) {
        const value = getCellDisplayText(cell);
        if (value) worksheet.getCell(row, col).value = value;
      }
      applyExcelCellStyle(worksheet, row, col, rowspan, colspan, cell);
    });

    await addImagesToWorksheet(workbook, worksheet, cellPositions, rowHeightsPx, colWidthsPx);
    return worksheet;
  }

  function sanitizeSheetName(name) {
    const raw = String(name || '').trim() || 'Sheet';
    const cleaned = raw.replace(/[\[\]:*?/\\]/g, '').replace(/\s+/g, ' ');
    return cleaned.length > 31 ? cleaned.slice(0, 31) : cleaned;
  }

  function getCharacterLabel(slug) {
    const card = document.querySelector(`.char-card[data-char="${slug}"]`);
    if (!card) return slug;
    const label = card.querySelector('.char-card-label') || card.querySelector('span');
    const text = label ? label.textContent.trim() : '';
    return text || slug;
  }

  function buildExportSectionId(slug, label) {
    const base = String(label || slug || 'section').toLowerCase();
    const cleaned = base.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const suffix = String(slug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (suffix && cleaned && !cleaned.endsWith(suffix)) return `${cleaned}-${suffix}`;
    return cleaned || suffix || 'section';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildExportTable({ forXlsx, includeHidden = false, allowedRows = null }) {
    const source = ui.table;
    const table = source.cloneNode(true);
    table.removeAttribute('id');
    table.style.position = 'static';
    table.style.left = '';
    table.style.top = '';
    table.style.height = '';
    table.style.maxHeight = '';
    table.style.zIndex = '';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.removeAttribute('height');
    const forcedHiddenCols = getForcedHiddenColumns();
    const forcedHiddenCells = new Set();
    if (forcedHiddenCols.size) {
      const rows = Array.from(table.rows || []);
      const { cellPositions } = buildCellMatrixFromRows(rows, { table });
      rows.forEach((row) => {
        Array.from(row.children).forEach((cell) => {
          const pos = cellPositions.get(cell);
          if (!pos || pos.colspan !== 1) return;
          if (forcedHiddenCols.has(pos.col)) {
            forcedHiddenCells.add(cell);
          }
        });
      });
    }

    table.querySelectorAll('.combo-group-empty').forEach((row) => row.remove());
    if (includeHidden) {
      table.querySelectorAll('.combo-hidden-col').forEach((cell) => {
        if (forcedHiddenCells.has(cell)) return;
        cell.classList.remove('combo-hidden-col');
        cell.style.display = '';
      });
      const colgroup = table.querySelector('colgroup.combo-cols');
      if (colgroup) {
        Array.from(colgroup.children).forEach((col, idx) => {
          const colIndex = idx + 1;
          if (forcedHiddenCols.has(colIndex)) {
            col.style.display = 'none';
            return;
          }
          col.style.display = '';
        });
      }
    } else {
      table.querySelectorAll('.combo-hidden-col').forEach((cell) => cell.remove());
    }
    if (allowedRows && allowedRows.size) {
      Array.from(table.tBodies).forEach((tbody) => {
        Array.from(tbody.rows).forEach((row) => {
          const rowIndex = row.dataset && row.dataset.row != null ? Number(row.dataset.row) : null;
          if (rowIndex != null && !allowedRows.has(rowIndex)) {
            row.remove();
          }
        });
      });
    }
    const colgroup = table.querySelector('colgroup');
    const headerRow = table.tHead && table.tHead.rows.length ? table.tHead.rows[0] : table.rows[0];
    const firstHeader = headerRow && headerRow.cells ? headerRow.cells[0] : null;
    const secondHeader = headerRow && headerRow.cells ? headerRow.cells[1] : null;
    const firstText = normalizeHeaderLabel(firstHeader ? firstHeader.textContent : '');
    const secondText = normalizeHeaderLabel(secondHeader ? secondHeader.textContent : '');
    const hasLeadingBlank = firstHeader && !firstText && (secondText.includes('コンボ') || secondText.includes('combo'));
    if (hasLeadingBlank) {
      Array.from(table.rows).forEach((row) => {
        const cell = row.cells && row.cells[0];
        if (cell) cell.remove();
      });
      if (colgroup && colgroup.firstElementChild) {
        colgroup.removeChild(colgroup.firstElementChild);
      }
    }
    if (!forXlsx) {
      table.querySelectorAll('.btn-token-text').forEach((el) => el.remove());
    }

    table.querySelectorAll('input, select, textarea').forEach((el) => {
      let text = '';
      if (el.tagName === 'SELECT') {
        text = el.selectedOptions && el.selectedOptions[0]
          ? el.selectedOptions[0].textContent
          : '';
      } else {
        text = el.value ?? '';
      }
      const span = document.createElement('span');
      span.textContent = text;
      el.replaceWith(span);
    });

    table.querySelectorAll('.cmd-input').forEach((el) => {
      if (el.querySelector('.btn-token')) {
        const span = document.createElement('span');
        span.className = 'export-btn-token-wrap';
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
        return;
      }
      const span = document.createElement('span');
      span.textContent = el.textContent || '';
      el.replaceWith(span);
    });

    if (forXlsx) {
      table.querySelectorAll('.btn-token').forEach((el) => {
        const token = el.dataset.token || el.textContent || '';
        el.replaceWith(document.createTextNode(token));
      });
      table.querySelectorAll('img').forEach((img) => {
        img.replaceWith(document.createTextNode(img.alt || ''));
      });
    } else {
      table.querySelectorAll('.btn-token-text').forEach((el) => el.remove());
    }

    table.querySelectorAll('button').forEach((btn) => btn.remove());

    table.querySelectorAll('table, thead, tbody, tr, th, td').forEach((el) => {
      el.style.position = 'static';
      el.style.left = '';
      el.style.top = '';
      el.style.height = '';
      el.style.maxHeight = '';
      el.style.overflow = 'visible';
      el.removeAttribute('height');
    });

    return table;
  }

  function normalizeExportTableLayout(table) {
    if (!table) return;
    Array.from(table.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-')) table.removeAttribute(attr.name);
    });
    table.style.position = 'static';
    table.style.left = '';
    table.style.top = '';
    table.style.margin = '0';
    table.style.height = 'auto';
    table.style.maxHeight = 'none';
    table.style.overflow = 'visible';
    table.style.borderCollapse = 'separate';
    table.style.borderSpacing = '0';
    table.style.tableLayout = 'fixed';
    table.style.width = 'auto';
    table.querySelectorAll('thead, tbody, tr').forEach((el) => {
      el.style.position = 'static';
      el.style.left = '';
      el.style.top = '';
      el.style.height = 'auto';
      el.style.maxHeight = 'none';
      el.style.overflow = 'visible';
    });
  }

  function applyInlineStylesFromSource(exportTable, sourceTable, options = {}) {
    if (!exportTable || !sourceTable) return;
    const includeHidden = Boolean(options.includeHidden);
    const sourceRows = Array.from(sourceTable.rows);
    const exportRows = Array.from(exportTable.rows);
    const sourceByKey = new Map();
    sourceRows.forEach((row, idx) => {
      const rowKey = row.dataset && row.dataset.row != null
        ? `${row.dataset.row}:${row.dataset.rowLabel || ''}`
        : null;
      if (rowKey && !sourceByKey.has(rowKey)) sourceByKey.set(rowKey, row);
      if (!rowKey && !sourceByKey.has(`idx:${idx}`)) sourceByKey.set(`idx:${idx}`, row);
    });
    const rowCount = exportRows.length;
    exportTable.style.width = `${sourceTable.offsetWidth}px`;
    exportTable.style.borderCollapse = 'separate';
    exportTable.style.borderSpacing = '0';
    exportTable.style.tableLayout = 'fixed';

    for (let i = 0; i < rowCount; i += 1) {
      const dstRow = exportRows[i];
      const key = dstRow && dstRow.dataset && dstRow.dataset.row != null
        ? `${dstRow.dataset.row}:${dstRow.dataset.rowLabel || ''}`
        : `idx:${i}`;
      const srcRow = sourceByKey.get(key) || sourceRows[i];
      if (!srcRow || !dstRow) continue;
      const rowWasSelected = srcRow.classList.contains('selected');
      if (rowWasSelected) srcRow.classList.remove('selected');
      const srcCells = includeHidden
        ? Array.from(srcRow.cells)
        : Array.from(srcRow.cells).filter((cell) => !cell.classList.contains('combo-hidden-col'));
      const dstCells = Array.from(dstRow.cells);
      const cellCount = Math.min(srcCells.length, dstCells.length);
      try {
        for (let j = 0; j < cellCount; j += 1) {
          const srcCell = srcCells[j];
          const dstCell = dstCells[j];
          if (!srcCell || !dstCell) continue;
          const style = window.getComputedStyle(srcCell);
          const isCommandCell = Boolean(srcCell.querySelector('.cmd-input[data-field="command"]'));
          const isButtonsCell = Boolean(srcCell.querySelector('.cmd-input[data-field="buttons"]'));
          dstCell.style.background = style.backgroundColor;
          dstCell.style.color = style.color;
          dstCell.style.fontFamily = '"Yu Gothic", "Noto Sans JP", sans-serif';
          dstCell.style.setProperty('font-size', isCommandCell ? '9px' : '7px', 'important');
          dstCell.style.fontWeight = style.fontWeight;
          dstCell.style.setProperty('text-align', isCommandCell ? 'left' : style.textAlign, 'important');
          dstCell.style.verticalAlign = style.verticalAlign;
          dstCell.style.borderTop = style.borderTop;
          dstCell.style.borderRight = style.borderRight;
          dstCell.style.borderBottom = style.borderBottom;
          dstCell.style.borderLeft = style.borderLeft;
          if (srcCell.classList.contains('combo-sep-right')) {
            dstCell.style.borderRightStyle = 'solid';
            dstCell.style.borderRightWidth = '2px';
          }
          dstCell.style.padding = style.padding;
          dstCell.style.width = style.width;
          dstCell.style.minWidth = style.minWidth;
          dstCell.style.maxWidth = style.maxWidth;
          dstCell.style.height = 'auto';
          dstCell.style.whiteSpace = isButtonsCell ? 'normal' : style.whiteSpace;
          dstCell.style.boxSizing = style.boxSizing;
        }
      } finally {
        if (rowWasSelected) srcRow.classList.add('selected');
      }
    }

    exportTable.querySelectorAll('img').forEach((img) => {
      const style = window.getComputedStyle(img);
      if (style.width) img.style.width = style.width;
      if (style.height) img.style.height = style.height;
    });
  }

  async function inlineExportImages(root) {
    const imgs = Array.from(root.querySelectorAll('img'));
    if (!imgs.length) return;
    const cache = new Map();
    await Promise.all(
      imgs.map(async (img) => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) return;
        if (!cache.has(src)) {
          const inlinePromise = inlineImageFromElement(img, src)
            .then((dataUrl) => dataUrl || fetchAsDataUrl(src));
          cache.set(src, inlinePromise);
        }
        const dataUrl = await cache.get(src);
        if (dataUrl) img.setAttribute('src', dataUrl);
      }),
    );
  }

  async function inlineImageFromElement(img, fallbackSrc) {
    try {
      if (!img.complete || !img.naturalWidth || !img.naturalHeight) return null;
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }

  async function fetchAsDataUrl(src) {
    const imageInline = await inlineImageFromSource(src);
    if (imageInline) return imageInline;
    try {
      const response = await fetch(src);
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  async function inlineImageFromSource(src) {
    return await new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 0;
            canvas.height = img.naturalHeight || img.height || 0;
            if (!canvas.width || !canvas.height) {
              resolve(null);
              return;
            }
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(null);
              return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = src;
      } catch {
        resolve(null);
      }
    });
  }

  function buildCellMatrixFromRows(rows, options = {}) {
    const skipHidden = options.skipHidden === true;
    const tableEl = options.table || ui.table;
    const matrix = [];
    const cellPositions = new Map();
    let colCount = 0;
    rows.forEach((row, rIndex) => {
      let col = 1;
      if (!matrix[rIndex]) matrix[rIndex] = [];
      Array.from(row.cells).forEach((cell) => {
        if (skipHidden && cell.classList.contains('combo-hidden-col')) return;
        const rowspan = Number(cell.rowSpan || 1);
        const colspan = Number(cell.colSpan || 1);
        while (matrix[rIndex][col]) col += 1;
        cellPositions.set(cell, {
          row: rIndex + 1,
          col,
          rowspan,
          colspan,
        });
        for (let r = 0; r < rowspan; r += 1) {
          if (!matrix[rIndex + r]) matrix[rIndex + r] = [];
          for (let c = 0; c < colspan; c += 1) {
            matrix[rIndex + r][col + c] = cell;
          }
        }
        col += colspan;
        colCount = Math.max(colCount, col - 1);
      });
    });

    const colgroup = tableEl ? tableEl.querySelector('colgroup.combo-cols') : null;
    const colWidthsPx = {};
    if (colgroup) {
      const cols = Array.from(colgroup.children);
      let visibleIndex = 1;
      cols.forEach((colEl) => {
        if (skipHidden && colEl.style.display === 'none') return;
        const width = parseFloat(colEl.style.width || '');
        if (Number.isFinite(width) && width > 0) {
          colWidthsPx[visibleIndex] = width;
        }
        visibleIndex += 1;
      });
    }

    const rowHeightsPx = {};
    rows.forEach((row, idx) => {
      const rect = row.getBoundingClientRect();
      if (rect.height) rowHeightsPx[idx + 1] = rect.height;
    });

    return { matrix, cellPositions, colCount, rowHeightsPx, colWidthsPx };
  }

  function getCellDisplayText(cell) {
    if (!cell) return '';
    const select = cell.querySelector('select');
    if (select) {
      const option = select.selectedOptions && select.selectedOptions[0];
      return option ? option.textContent.trim() : '';
    }
    const input = cell.querySelector('input, textarea');
    if (input) return String(input.value || '').trim();
    const editable = cell.querySelector('.cmd-input');
    if (editable) return String(editable.textContent || '').trim();
    if (cell.querySelector('.btn-token')) {
      const tokens = Array.from(cell.querySelectorAll('.btn-token'))
        .map((el) => el.dataset.token)
        .filter(Boolean);
      return tokens.join(' ');
    }
    return String(cell.innerText || cell.textContent || '').trim();
  }

  function applyExcelCellStyle(worksheet, row, col, rowspan, colspan, sourceCell) {
    if (!worksheet || !sourceCell) return;
    const style = window.getComputedStyle(sourceCell);
    const fill = cssColorToExcelFill(style.backgroundColor);
    const fontColor = cssColorToArgb(style.color);
    const isCommandCell = Boolean(sourceCell.querySelector('.cmd-input[data-field="command"]'));
    const fontSize = isCommandCell ? 9 : 7;
    const fontName = style.fontFamily ? style.fontFamily.split(',')[0].replace(/["']/g, '').trim() : undefined;
    const bold = Number.parseInt(style.fontWeight, 10) >= 600;
    const alignment = {
      horizontal: isCommandCell ? 'left' : mapExcelAlign(style.textAlign),
      vertical: mapExcelVertical(style.verticalAlign),
      wrapText: true,
    };
    const border = cssBorderToExcelBorder(style);
    const hasSeparatorRight = sourceCell.classList.contains('combo-sep-right');

    for (let r = row; r < row + rowspan; r += 1) {
      for (let c = col; c < col + colspan; c += 1) {
        const cell = worksheet.getCell(r, c);
        if (fill) cell.fill = fill;
        if (fontName || fontColor || fontSize || bold) {
          cell.font = {
            name: fontName || undefined,
            size: fontSize,
            color: fontColor ? { argb: fontColor } : undefined,
            bold,
          };
        }
        cell.alignment = alignment;
        if (border) {
          const nextBorder = { ...border };
          if (hasSeparatorRight) {
            const rightColor = cssColorToArgb(style.borderRightColor) || 'FF555555';
            nextBorder.right = { style: 'medium', color: { argb: rightColor } };
          }
          cell.border = nextBorder;
        }
      }
    }
  }

  function mapExcelAlign(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('center')) return 'center';
    if (v.includes('right') || v.includes('end')) return 'right';
    return 'left';
  }

  function mapExcelVertical(value) {
    const v = String(value || '').toLowerCase();
    if (v.includes('middle')) return 'middle';
    if (v.includes('bottom')) return 'bottom';
    return 'top';
  }

  function cssBorderToExcelBorder(style) {
    const topColor = cssColorToArgb(style.borderTopColor);
    const rightColor = cssColorToArgb(style.borderRightColor);
    const bottomColor = cssColorToArgb(style.borderBottomColor);
    const leftColor = cssColorToArgb(style.borderLeftColor);
    const hasBorder = (sideStyle, sideColor) =>
      String(sideStyle || '').toLowerCase() !== 'none' && !!sideColor;
    const hasTop = hasBorder(style.borderTopStyle, topColor);
    const hasRight = hasBorder(style.borderRightStyle, rightColor);
    const hasBottom = hasBorder(style.borderBottomStyle, bottomColor);
    const hasLeft = hasBorder(style.borderLeftStyle, leftColor);
    if (!hasTop && !hasRight && !hasBottom && !hasLeft) {
      return null;
    }
    const makeSide = (color) => ({
      style: 'thin',
      color: color ? { argb: color } : undefined,
    });
    return {
      top: hasTop ? makeSide(topColor) : undefined,
      right: hasRight ? makeSide(rightColor) : undefined,
      bottom: hasBottom ? makeSide(bottomColor) : undefined,
      left: hasLeft ? makeSide(leftColor) : undefined,
    };
  }

  function cssColorToExcelFill(color) {
    const argb = cssColorToArgb(color);
    if (!argb) return null;
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb },
    };
  }

  function cssColorToArgb(color) {
    if (!color) return null;
    const normalized = color.trim().toLowerCase();
    if (normalized === 'transparent' || normalized === 'rgba(0, 0, 0, 0)') return null;
    const rgbMatch = normalized.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)$/);
    if (!rgbMatch) return null;
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const a = rgbMatch[4] != null ? Math.round(Number(rgbMatch[4]) * 255) : 255;
    const toHex = (v) => v.toString(16).padStart(2, '0');
    return `${toHex(a)}${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  async function addImagesToWorksheet(workbook, worksheet, cellPositions, rowHeightsPx, colWidthsPx) {
    if (!workbook || !worksheet) return;
    const cache = new Map();
    const imageOffsetX = 0;
    const imageOffsetY = 0;
    const tokenPaddingX = 6;
    const tokenPaddingY = 2;
    const tokenRowHeightScale = 1.6;
    for (const [cell, pos] of cellPositions.entries()) {
      const imgs = Array.from(cell.querySelectorAll('img'));
      if (!imgs.length) continue;
      const cellRect = cell.getBoundingClientRect();
      const rowHeight = rowHeightsPx[pos.row] || cellRect.height || 16;
      const colWidth = colWidthsPx[pos.col] || cellRect.width || 80;
      const tokenImages = Array.from(cell.querySelectorAll('.btn-token img'));
      if (tokenImages.length) {
        const gap = 4;
        const sizes = tokenImages.map((img) => ({
          w: img.getBoundingClientRect().width || 16,
          h: img.getBoundingClientRect().height || 16,
          src: img.getAttribute('src') || '',
        }));
        const maxHeight = Math.max(...sizes.map((item) => item.h));
        const maxWidth = Math.max(10, colWidth - (tokenPaddingX * 2));
        const sprite = await buildTokenSprite(sizes, gap, maxHeight, cache, maxWidth);
        if (sprite) {
          const scale = sprite.width > maxWidth ? maxWidth / sprite.width : 1;
          const renderWidth = sprite.width * scale;
          const renderHeight = sprite.height * scale;
          const startX = Math.max(0, tokenPaddingX);
          const startY = Math.max(0, tokenPaddingY);
          const tlCol = Math.max(0, (pos.col - 1) + (startX / colWidth));
          const tlRow = Math.max(0, (pos.row - 1) + (startY / rowHeight));
          const contentHeight = (renderHeight + (tokenPaddingY * 2)) * 0.75 * tokenRowHeightScale;
          const scaledBaseHeight = rowHeight * 0.75 * tokenRowHeightScale;
          const excelHeight = Math.max(contentHeight, scaledBaseHeight);
          const worksheetRow = worksheet.getRow(pos.row);
          worksheetRow.height = Math.max(Number(worksheetRow.height) || 0, excelHeight);
          const imageId = workbook.addImage({ base64: sprite.base64, extension: 'png' });
          worksheet.addImage(imageId, {
            tl: {
              col: tlCol,
              row: tlRow,
            },
            ext: { width: renderWidth, height: renderHeight },
          });
        }
        continue;
      }
      for (const img of imgs) {
        const rect = img.getBoundingClientRect();
        const src = img.getAttribute('src');
        if (!src) continue;
        const cacheKey = src;
        if (!cache.has(cacheKey)) {
          cache.set(cacheKey, fetchAsDataUrl(src));
        }
        const dataUrl = await cache.get(cacheKey);
        if (!dataUrl) continue;
        const extension = src.toLowerCase().includes('.jpg') || src.toLowerCase().includes('.jpeg') ? 'jpeg' : 'png';
        const base64 = String(dataUrl).split(',')[1] || '';
        if (!base64) continue;
        const imageId = workbook.addImage({ base64, extension });
        const tlCol = Math.max(
          0,
          (pos.col - 1) + (((colWidth - (rect.width || 16)) / 2 + imageOffsetX) / colWidth),
        );
        const tlRow = Math.max(
          0,
          (pos.row - 1) + (((rowHeight - (rect.height || 16)) / 2 + imageOffsetY) / rowHeight),
        );
        worksheet.addImage(imageId, {
          tl: {
            col: tlCol,
            row: tlRow,
          },
          ext: { width: rect.width || 16, height: rect.height || 16 },
        });
      }
    }
  }

  async function buildTokenSprite(items, gap, height, cache, maxWidth = 0) {
    const sources = await Promise.all(items.map(async (item) => {
      if (!item.src) return null;
      if (!cache.has(item.src)) {
        cache.set(item.src, fetchAsDataUrl(item.src));
      }
      return cache.get(item.src);
    }));
    const dataUrls = await Promise.all(sources);
    const valid = items
      .map((item, idx) => ({ ...item, dataUrl: dataUrls[idx] }))
      .filter((item) => item.dataUrl);
    if (!valid.length) return null;

    const rowLimit = Math.max(0, Number(maxWidth) || 0);
    const rows = [];
    if (rowLimit > 0) {
      let current = [];
      let currentWidth = 0;
      valid.forEach((item) => {
        const itemWidth = item.w;
        const nextWidth = current.length ? (currentWidth + gap + itemWidth) : itemWidth;
        if (current.length && nextWidth > rowLimit) {
          rows.push(current);
          current = [item];
          currentWidth = itemWidth;
        } else {
          current.push(item);
          currentWidth = nextWidth;
        }
      });
      if (current.length) rows.push(current);
    } else {
      rows.push(valid);
    }

    const rowWidths = rows.map((row) => row.reduce((sum, item, idx) => sum + item.w + (idx ? gap : 0), 0));
    const spriteWidth = Math.max(1, Math.round(Math.max(...rowWidths)));
    const spriteHeight = Math.max(1, Math.round(rows.length * height + Math.max(0, rows.length - 1) * gap));
    const canvas = document.createElement('canvas');
    canvas.width = spriteWidth;
    canvas.height = spriteHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const row = rows[rowIndex];
      let offsetX = 0;
      const rowY = rowIndex * (height + gap);
      for (const item of row) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const y = rowY + Math.max(0, (height - item.h) / 2);
            ctx.drawImage(img, offsetX, y, item.w, item.h);
            offsetX += item.w + gap;
            resolve();
          };
          img.onerror = () => {
            offsetX += item.w + gap;
            resolve();
          };
          img.src = item.dataUrl;
        });
      }
    }
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1] || '';
    return { base64, width: canvas.width, height: canvas.height };
  }

  function hasSelectedCharacter() {
    const slug = resolveCharacterSlug(state.currentCharacter || getCharacterSlugFromUi()) || '';
    return !!String(slug).trim();
  }

  function ensureXlsxMapModal() {
    let modal = qs('comboXlsxMapModal');
    if (modal) return modal;
    const lang = getComboLang();
    modal = document.createElement('div');
    modal.id = 'comboXlsxMapModal';
    modal.className = 'combo-keymap-modal combo-xlsx-map-modal hidden';
    modal.innerHTML = `
      <div class="combo-keymap-content combo-xlsx-map-content">
        <header>
          <h3 data-xlsx-label="xlsx_map_title">${comboT('ui.xlsx_map_title', lang) || 'XLSX Column Mapping'}</h3>
        </header>
        <p class="combo-xlsx-map-desc" data-xlsx-label="xlsx_map_desc">${comboT('ui.xlsx_map_desc', lang) || ''}</p>
        <div class="combo-xlsx-map-top">
          <label>
            <span data-xlsx-label="xlsx_map_header_row">${comboT('ui.xlsx_map_header_row', lang) || 'Header row'}</span>
            <select id="comboXlsxMapHeaderRow"></select>
          </label>
          <label class="combo-xlsx-map-save">
            <input type="checkbox" id="comboXlsxMapSavePreset">
            <span data-xlsx-label="xlsx_map_save_preset">${comboT('ui.xlsx_map_save_preset', lang) || 'Save this mapping'}</span>
          </label>
        </div>
        <div class="combo-xlsx-map-groups">
          <h4 data-xlsx-label="xlsx_map_basic">${comboT('ui.xlsx_map_basic', lang) || 'Basic fields'}</h4>
          <table class="combo-xlsx-map-table">
            <thead>
              <tr>
                <th data-xlsx-label="xlsx_map_field">${comboT('ui.xlsx_map_field', lang) || 'Field'}</th>
                <th data-xlsx-label="xlsx_map_column">${comboT('ui.xlsx_map_column', lang) || 'Column'}</th>
              </tr>
            </thead>
            <tbody id="comboXlsxMapBasicBody"></tbody>
          </table>
          <details class="combo-xlsx-map-advanced">
            <summary data-xlsx-label="xlsx_map_advanced">${comboT('ui.xlsx_map_advanced', lang) || 'Advanced fields'}</summary>
            <table class="combo-xlsx-map-table">
              <thead>
                <tr>
                  <th data-xlsx-label="xlsx_map_field">${comboT('ui.xlsx_map_field', lang) || 'Field'}</th>
                  <th data-xlsx-label="xlsx_map_column">${comboT('ui.xlsx_map_column', lang) || 'Column'}</th>
                </tr>
              </thead>
              <tbody id="comboXlsxMapAdvancedBody"></tbody>
            </table>
          </details>
        </div>
        <div class="combo-xlsx-map-preview-wrap">
          <h4 data-xlsx-label="xlsx_map_preview">${comboT('ui.xlsx_map_preview', lang) || 'Preview (first 5 rows)'}</h4>
          <table class="combo-xlsx-map-preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th data-xlsx-label="xlsx_map_raw_command">${comboT('ui.xlsx_map_raw_command', lang) || 'Raw command'}</th>
                <th data-xlsx-label="xlsx_map_norm_command">${comboT('ui.xlsx_map_norm_command', lang) || 'Normalized command'}</th>
                <th data-xlsx-label="xlsx_map_summary">${comboT('ui.xlsx_map_summary', lang) || 'Imported fields'}</th>
              </tr>
            </thead>
            <tbody id="comboXlsxMapPreviewBody"></tbody>
          </table>
        </div>
        <div class="combo-keymap-actions combo-xlsx-map-actions">
          <button type="button" data-action="apply">${comboT('ui.xlsx_map_apply', lang) || 'Import'}</button>
          <button type="button" data-action="cancel">${comboT('ui.xlsx_map_cancel', lang) || 'Cancel'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        closeXlsxMapModal(null);
        return;
      }
      const action = ev.target && ev.target.dataset && ev.target.dataset.action;
      if (!action) return;
      if (action === 'cancel') {
        closeXlsxMapModal(null);
        return;
      }
      if (action === 'apply') {
        const ctx = modal._ctx || null;
        if (!ctx) {
          closeXlsxMapModal(null);
          return;
        }
        if (!ctx.mapping || !ctx.mapping.command) {
          window.alert(comboMsg('xlsx_map_required_command'));
          return;
        }
        const savePresetInput = modal.querySelector('#comboXlsxMapSavePreset');
        closeXlsxMapModal({
          headerRow: ctx.headerRow,
          mapping: { ...ctx.mapping },
          savePreset: !!(savePresetInput && savePresetInput.checked),
        });
      }
    });

    modal.addEventListener('change', (ev) => {
      const target = ev.target;
      if (!target) return;
      const ctx = modal._ctx || null;
      if (!ctx) return;
      if (target.id === 'comboXlsxMapHeaderRow') {
        const nextHeaderRow = Number(target.value) === 2 ? 2 : 1;
        ctx.headerRow = nextHeaderRow;
        applyBestMappingForHeaderRow(ctx, false);
        renderXlsxMapFieldTables(modal);
        renderXlsxMapPreview(modal);
        return;
      }
      if (target.classList.contains('combo-xlsx-map-select')) {
        const field = target.dataset.field || '';
        if (!field) return;
        const value = String(target.value || '');
        if (value) ctx.mapping[field] = value;
        else delete ctx.mapping[field];
        renderXlsxMapPreview(modal);
      }
    });

    return modal;
  }

  function closeXlsxMapModal(result) {
    const modal = qs('comboXlsxMapModal');
    if (!modal) return;
    modal.classList.add('hidden');
    const resolve = modal._resolve;
    modal._resolve = null;
    modal._ctx = null;
    if (typeof resolve === 'function') resolve(result || null);
  }

  function getXlsxColumnOptionHtml(entries, selectedValue, lang) {
    const noneLabel = comboT('ui.xlsx_map_none', lang) || '(none)';
    const selected = String(selectedValue || '');
    const options = [`<option value="${XLSX_MAP_NONE_VALUE}"${selected ? '' : ' selected'}>${escapeHtml(noneLabel)}</option>`];
    (entries || []).forEach((entry) => {
      const isSelected = selected === String(entry.value) ? ' selected' : '';
      options.push(`<option value="${escapeHtml(entry.value)}"${isSelected}>${escapeHtml(entry.label)}</option>`);
    });
    return options.join('');
  }

  function renderXlsxMapFieldTables(modal) {
    const ctx = modal && modal._ctx;
    if (!ctx) return;
    const lang = getComboLang();
    const entries = ctx.entriesByRow[ctx.headerRow] || [];
    const basicBody = modal.querySelector('#comboXlsxMapBasicBody');
    const advancedBody = modal.querySelector('#comboXlsxMapAdvancedBody');
    if (!basicBody || !advancedBody) return;
    const buildRow = (field) => {
      const selected = ctx.mapping[field] || XLSX_MAP_NONE_VALUE;
      const required = field === 'command' ? ' <span class="req">*</span>' : '';
      const selectHtml = getXlsxColumnOptionHtml(entries, selected, lang);
      return `<tr>
        <td>${escapeHtml(getXlsxFieldLabel(field, lang))}${required}</td>
        <td><select class="combo-xlsx-map-select" data-field="${escapeHtml(field)}">${selectHtml}</select></td>
      </tr>`;
    };
    basicBody.innerHTML = XLSX_MAP_BASIC_FIELDS.map(buildRow).join('');
    const advancedFields = XLSX_MAP_ALL_FIELDS.filter((field) => !XLSX_MAP_BASIC_FIELDS.includes(field));
    advancedBody.innerHTML = advancedFields.map(buildRow).join('');
  }

  function renderXlsxMapPreview(modal) {
    const ctx = modal && modal._ctx;
    if (!ctx) return;
    const body = modal.querySelector('#comboXlsxMapPreviewBody');
    if (!body) return;
    const { sheet, headerRow, mapping } = ctx;
    const previewRows = [];
    const maxRow = Number(sheet && sheet.rowCount) || 0;
    let added = 0;
    for (let rowNumber = headerRow + 1; rowNumber <= maxRow && added < 5; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      if (!row) continue;
      const rawCommand = getMappedCellValue(row, mapping.command);
      const normalized = rawCommand ? normalizeCommandWithNotation(rawCommand).canonical : '';
      const summaryParts = [];
      XLSX_MAP_ALL_FIELDS.forEach((field) => {
        if (field === 'command' || field === 'buttons') return;
        const mapValue = mapping[field];
        if (!mapValue) return;
        const raw = getMappedCellValue(row, mapValue);
        if (!raw) return;
        summaryParts.push(`${getXlsxFieldLabel(field)}: ${raw}`);
      });
      const hasData = rawCommand || summaryParts.length;
      if (!hasData) continue;
      previewRows.push({
        rowNumber,
        rawCommand,
        normalized,
        summary: summaryParts.join(' / '),
      });
      added += 1;
    }
    if (!previewRows.length) {
      body.innerHTML = '<tr><td colspan="4">-</td></tr>';
      return;
    }
    body.innerHTML = previewRows.map((item) => `<tr>
      <td>${item.rowNumber}</td>
      <td>${escapeHtml(item.rawCommand || '-')}</td>
      <td>${escapeHtml(localizeCommandForDisplay(item.normalized || '-', getComboLang()))}</td>
      <td>${escapeHtml(item.summary || '-')}</td>
    </tr>`).join('');
  }

  function applyBestMappingForHeaderRow(ctx, preserve = true) {
    if (!ctx) return;
    const entries = ctx.entriesByRow[ctx.headerRow] || [];
    const signature = ctx.signatureByRow[ctx.headerRow] || '';
    const preset = findXlsxPresetBySignature(signature);
    const suggested = preset
      ? sanitizeXlsxMapping(preset.map || {}, entries)
      : sanitizeXlsxMapping(suggestXlsxMapping(entries), entries);
    const current = preserve ? sanitizeXlsxMapping(ctx.mapping || {}, entries) : {};
    ctx.mapping = { ...suggested, ...current };
    ctx.activeSignature = signature;
    ctx.activePreset = preset || null;
  }

  async function openXlsxMapModal(context) {
    const modal = ensureXlsxMapModal();
    return await new Promise((resolve) => {
      const ctx = {
        sheet: context.sheet,
        sheetName: context.sheetName || '',
        entriesByRow: context.entriesByRow || {},
        signatureByRow: context.signatureByRow || {},
        headerRow: Number(context.headerRow) === 2 ? 2 : 1,
        mapping: sanitizeXlsxMapping(context.initialMap || {}, context.entriesByRow[Number(context.headerRow) === 2 ? 2 : 1] || []),
        activeSignature: '',
        activePreset: null,
      };
      modal._resolve = resolve;
      modal._ctx = ctx;
      const headerSelect = modal.querySelector('#comboXlsxMapHeaderRow');
      if (headerSelect) {
        const rowOptions = [1, 2]
          .filter((rowNum) => (ctx.entriesByRow[rowNum] || []).some((entry) => String(entry.header || '').trim()));
        const options = (rowOptions.length ? rowOptions : [1]).map((rowNum) =>
          `<option value="${rowNum}">${rowNum}</option>`);
        headerSelect.innerHTML = options.join('');
        headerSelect.value = rowOptions.includes(ctx.headerRow) ? String(ctx.headerRow) : String(rowOptions[0] || 1);
        ctx.headerRow = Number(headerSelect.value) === 2 ? 2 : 1;
      }
      applyBestMappingForHeaderRow(ctx, true);
      const savePresetInput = modal.querySelector('#comboXlsxMapSavePreset');
      if (savePresetInput) savePresetInput.checked = !ctx.activePreset;
      renderXlsxMapFieldTables(modal);
      renderXlsxMapPreview(modal);
      applyComboUiLabels(getComboLang());
      modal.classList.remove('hidden');
    });
  }

  async function resolveSheetMapping(sheet) {
    const maxCol = getSheetMaxColumn(sheet, [1, 2]);
    const entriesByRow = {
      1: buildSheetHeaderEntries(sheet, 1, maxCol),
      2: buildSheetHeaderEntries(sheet, 2, maxCol),
    };
    const signatureByRow = {
      1: buildHeaderSignatureFromEntries(entriesByRow[1]),
      2: buildHeaderSignatureFromEntries(entriesByRow[2]),
    };
    const preferredHeaderRow = chooseLikelyHeaderRow(entriesByRow);
    const rowOrder = preferredHeaderRow === 2 ? [2, 1] : [1, 2];
    for (let i = 0; i < rowOrder.length; i += 1) {
      const rowNum = rowOrder[i];
      const signature = signatureByRow[rowNum];
      const preset = findXlsxPresetBySignature(signature);
      if (!preset) continue;
      const mapping = sanitizeXlsxMapping(preset.map || {}, entriesByRow[rowNum]);
      if (!mapping.command) continue;
      return {
        headerRow: rowNum,
        mapping,
        signature,
        savePreset: false,
      };
    }

    const defaultEntries = entriesByRow[preferredHeaderRow] || [];
    const initialMap = sanitizeXlsxMapping(suggestXlsxMapping(defaultEntries), defaultEntries);
    const selected = await openXlsxMapModal({
      sheet,
      entriesByRow,
      signatureByRow,
      headerRow: preferredHeaderRow,
      initialMap,
    });
    if (!selected) return null;
    const headerRow = Number(selected.headerRow) === 2 ? 2 : 1;
    const entries = entriesByRow[headerRow] || [];
    const signature = signatureByRow[headerRow] || '';
    const mapping = sanitizeXlsxMapping(selected.mapping || {}, entries);
    if (!mapping.command) {
      window.alert(comboMsg('xlsx_map_required_command'));
      return null;
    }
    if (selected.savePreset) {
      upsertXlsxPreset({
        name: `Sheet ${sheet && sheet.name ? sheet.name : ''}`.trim() || 'Preset',
        headerSignature: signature,
        headerRow,
        map: mapping,
      });
    }
    return {
      headerRow,
      mapping,
      signature,
      savePreset: !!selected.savePreset,
    };
  }

  function handleImport(ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    flushAutosaveNow();
    if (!hasSelectedCharacter()) {
      window.alert(comboMsg('import_select_character'));
      if (ui.importInput) ui.importInput.value = '';
      return;
    }
    const name = file.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        state.notationUnknownTerms = new Set();
        const notationReady = await ensureNotationDictionaryLoaded();
        if (!notationReady) {
          showExportToast(comboMsg('notation_load_failed'), true, { dim: false });
        }
        if (name.endsWith('.json')) {
          const text = String(reader.result || '');
          importJson(text);
        } else if (name.endsWith('.xlsx')) {
          const buffer = reader.result;
          await importXlsx(buffer);
        } else {
          window.alert(comboMsg('import_filetype_only'));
        }
        notifyNotationUnknown(state.notationUnknownTerms);
      } finally {
        ui.importInput.value = '';
      }
    };
    if (name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }

  function importJson(text) {
    try {
      const data = JSON.parse(text);
      const normalize = (c) => ({ ...defaultCombo(), ...c });
      const currentSlug = state.currentCharacter || getCharacterSlugFromUi();
      const unknownCollector = state.notationUnknownTerms || null;
      if (Array.isArray(data)) {
        snapshotImportBackup(currentSlug);
        applyImportedCombos(normalizeImportedCombos(data.map((c) => normalize(c)), unknownCollector));
      } else if (data && Array.isArray(data.combos)) {
        snapshotImportBackup(currentSlug);
        applyImportedCombos(normalizeImportedCombos(data.combos.map((c) => normalize(c)), unknownCollector));
      } else if (data && Array.isArray(data.characters)) {
        const touched = new Set();
        data.characters.forEach((entry) => {
          if (!entry || !entry.character || !Array.isArray(entry.combos)) return;
          const slug = resolveCharacterSlug(entry.character) || entry.character;
          if (!slug) return;
          if (!touched.has(slug)) {
            snapshotImportBackup(slug);
            touched.add(slug);
          }
          const normalized = normalizeImportedCombos(entry.combos.map((c) => normalize(c)), unknownCollector);
          if (slug === currentSlug) {
            appendImportedCombos(normalized);
          } else {
            appendCombosToStorage(slug, normalized);
          }
        });
      }
    } catch { }
  }

  async function importXlsx(buffer) {
    try {
      await ensureVendorLoaded({ excel: true });
    } catch { }
    if (!window.ExcelJS) {
      window.alert(comboMsg('import_exceljs_missing'));
      return;
    }
    try {
      const workbook = new window.ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      if (!workbook.worksheets.length) {
        window.alert(comboMsg('import_sheet_not_found'));
        return;
      }
      const sheetCombos = new Map();
      const unknownSheets = [];
      let canceled = false;
      for (const sheet of workbook.worksheets) {
        const slug = resolveCharacterSlug(sheet.name);
        if (!slug) {
          unknownSheets.push(sheet.name || '(no name)');
          continue;
        }
        const combos = await parseSheetToCombos(sheet);
        if (combos == null) {
          canceled = true;
          break;
        }
        if (!combos.length) continue;
        if (!sheetCombos.has(slug)) sheetCombos.set(slug, []);
        sheetCombos.get(slug).push(...combos);
      }
      if (canceled) return;
      if (unknownSheets.length) {
        window.alert(comboMsg('import_unknown_sheets', { sheets: unknownSheets.join(', ') }));
        return;
      }
      if (!sheetCombos.size) {
        window.alert(comboMsg('import_no_importable'));
        return;
      }
      const currentSlug = state.currentCharacter || getCharacterSlugFromUi();
      sheetCombos.forEach((combos, slug) => {
        snapshotImportBackup(slug);
      });
      sheetCombos.forEach((combos, slug) => {
        if (slug === currentSlug) {
          appendImportedCombos(combos);
        } else {
          appendCombosToStorage(slug, combos);
        }
      });
    } catch {
      window.alert(comboMsg('import_xlsx_failed'));
    }
  }

  function applyImportedCombos(combos) {
    if (!Array.isArray(combos)) return;
    ensureGroupCount(combos.length);
    state.combos = combos.map((c) => ({ ...defaultCombo(), ...c }));
    if (state.combos.length < state.groups.length) {
      const missing = state.groups.length - state.combos.length;
      for (let i = 0; i < missing; i += 1) {
        state.combos.push(defaultCombo());
      }
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedGroup(0);
  }

  function appendImportedCombos(combos) {
    if (!Array.isArray(combos) || !combos.length) return;
    const next = combos.map((c) => ({ ...defaultCombo(), ...c, _manual: true }));
    state.combos = state.combos.concat(next);
    ensureGroupCount(state.combos.length);
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedGroup(0);
  }

  function appendCombosToStorage(slug, combos) {
    if (!slug || !Array.isArray(combos) || !combos.length) return;
    try {
      const key = getStorageKey(slug);
      const raw = localStorage.getItem(key);
      let existing = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.combos)) {
          existing = parsed.combos.map((c) => ({ ...defaultCombo(), ...c }));
        }
      }
      const next = combos.map((c) => ({ ...defaultCombo(), ...c, _manual: true }));
      localStorage.setItem(key, JSON.stringify({ combos: existing.concat(next) }));
    } catch { }
  }

  async function parseSheetToCombos(sheet) {
    if (!sheet) return [];
    const headerRow = sheet.getRow(1);
    const subHeaderRow = sheet.getRow(2);
    const exportLike = rowHasText(subHeaderRow, ['操作方法', 'M/C', 'Control'])
      || (rowHasText(headerRow, ['コンボ', 'Combo']) && rowHasText(headerRow, ['条件', 'Conditions']));
    if (exportLike) {
      return parseExportSheetToCombos(sheet, headerRow, subHeaderRow);
    }
    const selected = await resolveSheetMapping(sheet);
    if (!selected) return null;
    return parseMappedSheetToCombos(sheet, selected.headerRow, selected.mapping);
  }

  function parseMappedSheetToCombos(sheet, headerRow, mapping) {
    const combos = [];
    if (!sheet || !mapping || !mapping.command) return combos;
    const unknownCollector = state.notationUnknownTerms || null;
    const maxRow = Number(sheet.rowCount) || 0;
    for (let rowNumber = Number(headerRow || 1) + 1; rowNumber <= maxRow; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      if (!row) continue;
      const combo = defaultCombo();
      let hasValue = false;
      XLSX_MAP_ALL_FIELDS.forEach((field) => {
        const mapValue = mapping[field];
        if (!mapValue) return;
        const rawValue = getMappedCellValue(row, mapValue);
        if (!rawValue) return;
        hasValue = true;
        if (field === 'command' || field === 'buttons') {
          const normalized = normalizeCommandWithNotation(rawValue, unknownCollector);
          combo[field] = normalized.canonical;
          return;
        }
        if (field === 'control_mode') {
          combo[field] = normalizeControlModeValue(rawValue);
          return;
        }
        if (NUMERIC_FIELDS.has(field)) {
          combo[field] = formatNumberText(rawValue);
          return;
        }
        combo[field] = String(rawValue).trim();
      });
      if (!hasValue) continue;
      if (!String(combo.command || '').trim()) continue;
      if (!String(combo.buttons || '').trim()) combo.buttons = combo.command;
      ensureComboControlMode(combo);
      combo._manual = true;
      combos.push(combo);
    }
    return combos;
  }

  function parseExportSheetToCombos(sheet, headerRow, subHeaderRow) {
    const combos = [];
    const unknownCollector = state.notationUnknownTerms || null;
    const fieldStartCol = findColumnIndex(subHeaderRow, ['操作方法', 'M/C', 'Control']) || 3;
    const versionCol = findColumnIndex(headerRow, ['Ver', 'Ver.']);
    const dataStart = findFirstDataRow(sheet);
    let current = null;

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < dataStart) return;
      const label = normalizeLabel(getCellText(row.getCell(1)));
      if (!label) return;
      if (label.includes('コマンド') || label.includes('command')) {
        const command = getCellText(row.getCell(2));
        if (!command) return;
        current = defaultCombo();
        const normalized = normalizeCommandWithNotation(command, unknownCollector);
        current.command = normalized.canonical;
        current.buttons = normalized.canonical;
        FIELD_ORDER.forEach((field, idx) => {
          const col = fieldStartCol + idx;
          const value = getCellText(row.getCell(col));
          if (!value) return;
          if (NUMERIC_FIELDS.has(field)) {
            current[field] = formatNumberText(value);
          } else {
            current[field] = value;
          }
        });
        if (versionCol) {
          const versionValue = getCellText(row.getCell(versionCol));
          if (versionValue) current.game_version = versionValue;
        }
        ensureComboControlMode(current);
        current._manual = true;
        combos.push(current);
        return;
      }
      if ((label.includes('備考') || label.includes('note')) && current) {
        const notes = getCellText(row.getCell(2));
        if (notes) current.combo_notes = notes;
      }
    });
    return combos;
  }

  function findFirstDataRow(sheet) {
    const max = sheet.rowCount || 0;
    for (let rowNumber = 3; rowNumber <= max; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      const label = normalizeLabel(getCellText(row.getCell(1)));
      if (label && (label.includes('コマンド') || label.includes('フレーム') || label.includes('備考'))) {
        return rowNumber;
      }
    }
    return 3;
  }

  function getCellText(cell) {
    if (!cell) return '';
    const text = cell.text != null ? cell.text : cell.value;
    return String(text == null ? '' : text).trim();
  }

  function rowHasText(row, candidates) {
    if (!row) return false;
    const terms = (candidates || []).map((c) => String(c));
    let found = false;
    row.eachCell({ includeEmpty: false }, (cell) => {
      const value = getCellText(cell);
      if (!value) return;
      if (terms.some((term) => value.includes(term))) {
        found = true;
      }
    });
    return found;
  }

  function findColumnIndex(row, candidates) {
    if (!row) return null;
    const terms = (candidates || []).map((c) => normalizeLabel(c));
    let match = null;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const value = normalizeLabel(getCellText(cell));
      if (!value) return;
      if (terms.some((term) => value.includes(term))) {
        if (match == null) match = colNumber;
      }
    });
    return match;
  }

  function normalizeLabel(value) {
    return String(value || '')
      .replace(/\s+/g, '')
      .replace(/\u00a0/g, '')
      .toLowerCase();
  }

  function resolveCharacterSlug(name) {
    const raw = String(name || '').trim();
    if (!raw) return '';
    const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = normalize(raw);
    const aliases = {
      viper: 'cviper',
      honda: 'ehonda',
      vega: 'vega_mbison',
      gouki: 'gouki_akuma',
      akuma: 'gouki_akuma',
      bison: 'vega_mbison',
    };
    if (aliases[target]) return aliases[target];
    const cards = Array.from(document.querySelectorAll('.char-card'));
    const direct = cards.find((card) => normalize(card.getAttribute('data-char')) === target);
    if (direct) return direct.getAttribute('data-char');
    const byLabel = cards.find((card) => {
      const label = card.querySelector('span')?.textContent || '';
      const alt = card.querySelector('img')?.getAttribute('alt') || '';
      return normalize(label) === target || normalize(alt) === target;
    });
    if (byLabel) return byLabel.getAttribute('data-char');
    const fallback = raw.toLowerCase();
    if (/^[a-z0-9_-]+$/.test(fallback) && !/select_character|selectchar/.test(fallback)) {
      return fallback;
    }
    return '';
  }


  function downloadFile(name, type, content) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function buildExportFilename(base, ext, slugOverride) {
    const raw = slugOverride || state.currentCharacter || getCharacterSlugFromUi();
    const safe = String(raw || 'unknown')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '_');
    return `${base}_${safe}.${ext}`;
  }

  function loadKeymaps() {
    if (state.keymaps) return;
    const raw = localStorage.getItem(KEYMAP_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          state.keymaps = {
            keyboard: normalizeDeviceKeymap('keyboard', parsed.keyboard),
            ps5: normalizeDeviceKeymap('ps5', parsed.ps5),
            xbox: normalizeDeviceKeymap('xbox', {
              ...(parsed.xinput || {}),
              ...(parsed.xbox || {}),
            }),
            dinput: normalizeDeviceKeymap('dinput', parsed.dinput),
          };
          return;
        }
      } catch { }
    }
    state.keymaps = {
      keyboard: normalizeDeviceKeymap('keyboard', null),
      ps5: normalizeDeviceKeymap('ps5', null),
      xbox: normalizeDeviceKeymap('xbox', null),
      dinput: normalizeDeviceKeymap('dinput', null),
    };
  }

  function saveKeymaps() {
    if (!state.keymaps) return;
    localStorage.setItem(KEYMAP_KEY, JSON.stringify(state.keymaps));
  }

  function openKeymapModal() {
    let modal = qs('comboKeymapModal');
    if (!modal) {
      const active = getComboLang();
      const title = comboT('ui.keymap_title', active) || 'Customize Input';
      const saveLabel = comboT('ui.keymap_save', active) || 'Save';
      const cancelLabel = comboT('ui.keymap_cancel', active) || 'Cancel';
      modal = document.createElement('div');
      modal.id = 'comboKeymapModal';
      modal.className = 'combo-keymap-modal hidden';
      modal.innerHTML = `
        <div class="combo-keymap-content">
          <header>
            <h3>${title}</h3>
            <button type="button" class="close" data-action="close">×</button>
          </header>
          <div id="comboKeymapGrid" class="combo-keymap-grid"></div>
          <div class="combo-keymap-actions">
            <button type="button" data-action="save">${saveLabel}</button>
            <button type="button" data-action="close">${cancelLabel}</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (ev) => {
        if (ev.target === modal) closeKeymapModal();
        const action = ev.target && ev.target.dataset && ev.target.dataset.action;
        if (action === 'close') closeKeymapModal();
        if (action === 'save') saveKeymapModal();
      });
    }
    modal.classList.remove('hidden');
    renderKeymapGrid();
  }

  function closeKeymapModal() {
    const modal = qs('comboKeymapModal');
    if (modal) modal.classList.add('hidden');
    if (state.keymapNoticeTimer) {
      window.clearTimeout(state.keymapNoticeTimer);
      state.keymapNoticeTimer = null;
    }
  }

  function renderKeymapGrid() {
    const grid = qs('comboKeymapGrid');
    if (!grid) return;
    if (state.keymapNoticeTimer) {
      window.clearTimeout(state.keymapNoticeTimer);
      state.keymapNoticeTimer = null;
    }
    loadKeymaps();
    const activeDevice = state.activeDevice || 'keyboard';
    const keymap = getActiveKeymap(activeDevice, state.controlMode);
    const { layout, iconMap, fallbackIcon, descRows, directionalTokens, mixedDescRow } = getUiButtonLayoutData(state.controlMode);
    const keyTokens = Object.keys({ ...DEFAULT_KEYMAP, ...DEFAULT_MODERN_KEYMAP });
    const normalize = (value) =>
      String(value || '')
        .toLowerCase()
        .replace(/\s+/g, '');
    const findTokenForLabel = (label, fallback) => {
      const desired = normalize(label);
      if (!desired) return fallback || label;
      const matchByToken = keyTokens.find((token) => normalize(token) === desired);
      if (matchByToken) return matchByToken;
      const matchByLabel = keyTokens.find((token) => normalize(displayLabelForToken(token)) === desired);
      if (matchByLabel) return matchByLabel;
      return fallback || label;
    };
    const getIconForToken = (token, fallbackValue) => {
      const label = displayLabelForToken(token);
      const cleaned = String(label || '').trim();
      const modernOverride = state.controlMode === 'modern' ? iconMap[cleaned] : null;
      return modernOverride || getButtonIcon(cleaned) || iconMap[fallbackValue] || fallbackIcon;
    };

    const buildTable = (startCol, colCount, opts = {}) => {
      const { descLogic = () => false, rowFilter = () => true, className = '', rowClassFn = () => '' } = opts;
      const rows = layout
        .map((row, rIdx) => {
          if (!rowFilter(row, rIdx)) return '';
          const rowClass = rowClassFn(rIdx);
          const cells = [];
          for (let c = 0; c < colCount; c += 1) {
            const value = row[startCol + c] || '';
            const isDesc = descLogic(rIdx, c);
            if (!value) {
              cells.push('<td></td>');
              continue;
            }
            if (isDesc) {
              const text = String(value || '').trim();
              const translated = translateUiLabel(text, getComboLang());
              const desc = directionalTokens.has(text) || text === 'ニュートラル' ? '' : translated;
              cells.push(`<td><div class="ui-btn-desc">${desc.replace(/\n/g, '<br/>')}</div></td>`);
              continue;
            }
            const tokenLabel = displayLabelForToken(String(value || '').trim());
            const token = findTokenForLabel(tokenLabel, tokenLabel);
            const icon = getIconForToken(tokenLabel, value);
            const hotkey = keymap[token] || '';
            cells.push(`
              <td class="combo-keymap-cell" data-token="${token}">
                <div class="ui-btn-keycell">
                  <img alt="" width="${icon.w || 20}" height="${icon.h || 20}" src="${icon.src}">
                  <input type="text" class="combo-keymap-input" data-token="${token}" value="${hotkey}">
                </div>
              </td>
            `);
          }
          return `<tr class="${rowClass}">${cells.join('')}</tr>`;
        })
        .filter(Boolean)
        .join('');
      return `<table class="combo-keymap-table ${className}">${rows}</table>`;
    };

    const leftTable = buildTable(0, 3, {
      descLogic: () => false,
      rowFilter: (row) => row.slice(0, 3).some((val) => String(val || '').trim()),
      className: 'combo-keymap-table-left',
      rowClassFn: () => 'keymap-icon-row',
    });
    const rightTable = buildTable(4, 7, {
      descLogic: (rIdx) => descRows.has(rIdx) || rIdx === mixedDescRow,
      className: 'combo-keymap-table-right',
      rowClassFn: (rIdx) =>
        descRows.has(rIdx) || rIdx === mixedDescRow ? 'keymap-desc-row' : 'keymap-icon-row',
    });
    grid.innerHTML = `
      <div id="comboKeymapNotice" class="combo-keymap-notice"></div>
      <div class="combo-keymap-layout">${leftTable}${rightTable}</div>
    `;
    const keymapNotice = qs('comboKeymapNotice');
    const hideKeymapNotice = () => {
      if (!keymapNotice) return;
      keymapNotice.classList.remove('show');
      if (state.keymapNoticeTimer) {
        window.clearTimeout(state.keymapNoticeTimer);
        state.keymapNoticeTimer = null;
      }
    };
    const showKeymapNotice = (message) => {
      if (!keymapNotice || !message) return;
      keymapNotice.textContent = message;
      keymapNotice.classList.add('show');
      if (state.keymapNoticeTimer) window.clearTimeout(state.keymapNoticeTimer);
      state.keymapNoticeTimer = window.setTimeout(() => {
        keymapNotice.classList.remove('show');
        state.keymapNoticeTimer = null;
      }, 1800);
    };
    const formatText = (template, vars) =>
      String(template || '').replace(/\{(\w+)\}/g, (_, key) => (vars[key] != null ? vars[key] : ''));
    grid.querySelectorAll('.combo-keymap-cell').forEach((cell) => {
      cell.addEventListener('click', (ev) => {
        const input = cell.querySelector('.combo-keymap-input');
        if (input && ev.target !== input) input.focus();
      });
    });
    grid.querySelectorAll('.combo-keymap-input').forEach((input) => {
      const normalizeAssignedHotkey = (value) =>
        String(value || '')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '');
      const clearDuplicateHotkey = (currentInput, assignedHotkey) => {
        const target = normalizeAssignedHotkey(assignedHotkey);
        if (!target) return [];
        const duplicates = [];
        grid.querySelectorAll('.combo-keymap-input').forEach((other) => {
          if (other === currentInput) return;
          if (normalizeAssignedHotkey(other.value) === target) {
            duplicates.push(other.dataset.token || '');
            other.value = '';
          }
        });
        return duplicates;
      };
      input.addEventListener('focus', () => {
        input.select();
      });
      input.addEventListener('click', () => {
        input.select();
      });
      input.addEventListener('blur', () => {
        hideKeymapNotice();
      });
      input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Tab') return;
        ev.preventDefault();
        if (ev.key === 'Backspace' || ev.key === 'Delete') {
          input.value = '';
          return;
        }
        const hotkey = keyEventToHotkeyString(ev);
        if (!hotkey) return;
        const duplicateTokens = clearDuplicateHotkey(input, hotkey);
        input.value = hotkey;
        if (duplicateTokens.length) {
          const lang = getComboLang();
          const fromLabel = displayLabelForToken(duplicateTokens[0]);
          const toLabel = displayLabelForToken(input.dataset.token || '');
          const template = comboT('ui.keymap_reassigned', lang) || 'Moved {key} from {from} to {to}.';
          const message = formatText(template, {
            key: hotkey,
            from: fromLabel,
            to: toLabel,
          });
          showKeymapNotice(message);
        } else {
          hideKeymapNotice();
        }
      });
    });
  }

  function saveKeymapModal() {
    const grid = qs('comboKeymapGrid');
    if (!grid) return;
    loadKeymaps();
    const map = {};
    grid.querySelectorAll('input[data-token]').forEach((input) => {
      const token = input.dataset.token;
      map[token] = input.value.trim();
    });
    const activeDevice = state.activeDevice || 'keyboard';
    setActiveKeymap(activeDevice, state.controlMode, map);
    saveKeymaps();
    applyKeymapToButtons();
    closeKeymapModal();
  }

  function applyKeymapToButtons() {
    loadKeymaps();
    const activeDevice = state.activeDevice || 'keyboard';
    const map = getActiveKeymap(activeDevice, state.controlMode);
    document.querySelectorAll('#Table2 td[data-token], #Table4 td[data-token], #Table5 td[data-token]').forEach((cell) => {
      const token = cell.dataset.token;
      const label = displayLabelForToken(token);
      const key = findHotkeyForLabel(label, map);
      const keyLabel = key ? String(key) : '';
      const keyEl = cell.querySelector('.ui-btn-key');
      if (keyEl) {
        const hotkeyMarkup = buildDeviceHotkeyMarkup(keyLabel, activeDevice);
        if (hotkeyMarkup) {
          keyEl.innerHTML = hotkeyMarkup;
        } else {
          keyEl.textContent = keyLabel;
        }
      }
      cell.title = key ? `${token} (Key: ${keyLabel})` : token;
    });
  }

  const DEVICE_HOTKEY_ICONS = {
    ps5: {
      square: 'assets/images/icons/PS/Square.png',
      triangle: 'assets/images/icons/PS/Triangle.png',
      circle: 'assets/images/icons/PS/Circle.png',
      cross: 'assets/images/icons/PS/Cross.png',
      l1: 'assets/images/icons/PS/L1.png',
      l2: 'assets/images/icons/PS/L2.png',
      r1: 'assets/images/icons/PS/R1.png',
      r2: 'assets/images/icons/PS/R2.png',
      l3: 'assets/images/icons/PS/Left Stick Click.png',
      r3: 'assets/images/icons/PS/Right Stick Click.png',
      touchpad: 'assets/images/icons/PS/Touch Pad Press.png',
      touchpadpress: 'assets/images/icons/PS/Touch Pad Press.png',
      create: 'assets/images/icons/PS/Create.png',
      share: 'assets/images/icons/PS/Create.png',
      options: 'assets/images/icons/PS/Options.png',
      home: 'assets/images/icons/PS/Home.png',
      up: 'assets/images/icons/PS/D-Pad Up.png',
      down: 'assets/images/icons/PS/D-Pad Down.png',
      left: 'assets/images/icons/PS/D-Pad Left.png',
      right: 'assets/images/icons/PS/D-Pad Right.png',
      '↑': 'assets/images/icons/PS/D-Pad Up.png',
      '↓': 'assets/images/icons/PS/D-Pad Down.png',
      '←': 'assets/images/icons/PS/D-Pad Left.png',
      '→': 'assets/images/icons/PS/D-Pad Right.png',
      dpadup: 'assets/images/icons/PS/D-Pad Up.png',
      dpaddown: 'assets/images/icons/PS/D-Pad Down.png',
      dpadleft: 'assets/images/icons/PS/D-Pad Left.png',
      dpadright: 'assets/images/icons/PS/D-Pad Right.png',
    },
    xbox: {
      a: 'assets/images/icons/Xbox/A.png',
      b: 'assets/images/icons/Xbox/B.png',
      x: 'assets/images/icons/Xbox/X.png',
      y: 'assets/images/icons/Xbox/Y.png',
      lb: 'assets/images/icons/Xbox/Left Bumper.png',
      rb: 'assets/images/icons/Xbox/Right Bumper.png',
      lt: 'assets/images/icons/Xbox/Left Trigger.png',
      rt: 'assets/images/icons/Xbox/Right Trigger.png',
      ls: 'assets/images/icons/Xbox/Left Stick.png',
      rs: 'assets/images/icons/Xbox/Right Stick Click.png',
      view: 'assets/images/icons/Xbox/View.png',
      menu: 'assets/images/icons/Xbox/Menu.png',
      share: 'assets/images/icons/Xbox/Share.png',
      up: 'assets/images/icons/Xbox/D-Pad Up.png',
      down: 'assets/images/icons/Xbox/D-Pad Down.png',
      left: 'assets/images/icons/Xbox/D-Pad Left.png',
      right: 'assets/images/icons/Xbox/D-Pad Right.png',
      '↑': 'assets/images/icons/Xbox/D-Pad Up.png',
      '↓': 'assets/images/icons/Xbox/D-Pad Down.png',
      '←': 'assets/images/icons/Xbox/D-Pad Left.png',
      '→': 'assets/images/icons/Xbox/D-Pad Right.png',
      dpadup: 'assets/images/icons/Xbox/D-Pad Up.png',
      dpaddown: 'assets/images/icons/Xbox/D-Pad Down.png',
      dpadleft: 'assets/images/icons/Xbox/D-Pad Left.png',
      dpadright: 'assets/images/icons/Xbox/D-Pad Right.png',
    },
  };

  function normalizeHotkeyToken(token) {
    const raw = String(token || '').trim();
    if (!raw) return '';
    if (raw === '↑' || raw === '↓' || raw === '←' || raw === '→') return raw;
    return raw
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/d[-_]?pad/gi, 'dpad');
  }

  function buildDeviceHotkeyMarkup(label, device) {
    if (!label) return '';
    const map = DEVICE_HOTKEY_ICONS[device];
    if (!map) return '';
    const parts = String(label)
      .split('+')
      .map((part) => part.trim())
      .filter(Boolean);
    if (!parts.length) return '';
    const icons = parts.map((part) => map[normalizeHotkeyToken(part)] || '');
    if (icons.some((src) => !src)) return '';
    return icons
      .map((src, idx) => {
        const plus = idx > 0 ? '<span class="ui-btn-hotkey-plus">+</span>' : '';
        return `${plus}<img alt="" class="ui-btn-hotkey-icon" src="${src}">`;
      })
      .join('');
  }

  function loadCustomShortcuts() {
    const raw = localStorage.getItem(SHORTCUT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) state.customShortcuts = parsed;
    } catch { }
  }

  function saveCustomShortcuts() {
    localStorage.setItem(SHORTCUT_KEY, JSON.stringify(state.customShortcuts));
  }

  function applyCustomShortcuts() {
    const table5 = qs('Table5');
    if (!table5) return;
    const customSlots = Array.from(table5.querySelectorAll('td[data-shortcut-slot="true"]'));
    if (!customSlots.length) return;
    customSlots.forEach((cell) => {
      if (cell.dataset.shortcutAdd === 'true') return;
      if (cell.dataset.token && cell.dataset.token !== '') return;
      cell.dataset.token = '';
      const p = cell.querySelector('p') || cell;
      p.textContent = '';
    });
    (state.customShortcuts || []).slice(0, customSlots.length).forEach((shortcut, idx) => {
      const cell = customSlots[idx];
      if (!cell) return;
      cell.dataset.token = shortcut;
      cell.style.cursor = 'pointer';
    });
    renderTable5Tokens();
  }

  function decorateTokenTables() {
    applyUiButtonLayout();
    const table5 = qs('Table5');
    if (table5) {
      pruneShortcutTable(table5);
      const tokenLayout = [
        ['236', '41236', '236236'],
        ['214', '63214', '214214'],
        ['623', 'AnyorDIorDPor投げ', '4(タメ)646',],
      ];
      const rows = Array.from(table5.querySelectorAll('tr'));
      rows.forEach((row, rowIdx) => {
        const cells = Array.from(row.querySelectorAll('td'));
        cells.forEach((cell, colIdx) => {
          const token = tokenLayout[rowIdx] && tokenLayout[rowIdx][colIdx];
          const p = cell.querySelector('p') || cell;
          if (token) {
            cell.dataset.token = token;
            p.textContent = token;
          } else if (p) {
            p.textContent = '';
          }
        });
      });
    }

    ['Table2', 'Table4', 'Table5'].forEach((id) => {
      const table = qs(id);
      if (!table) return;
      table.querySelectorAll('td').forEach((cell) => {
        if (cell.dataset.token) return;
        const token = tokenFromCell(cell);
        if (token) cell.dataset.token = token;
      });
    });

    applyKeymapToButtons();
    applyCustomShortcuts();
    renderTable5Tokens();
  }

  function getUiButtonLayoutData(controlMode = 'classic') {
    const baseLayout = [
      ['7', '8', '9', '', 'y', 'u', 'i', 'o', 't', '-', 'D'],
      ['', '', '', '', 'LP', 'MP', 'HP', 'P', '投げ', 'タゲコン等', 'ディレイ'],
      ['4', '5', '6', '', 'h', 'j', 'k', 'l', 'a', 'H', '>'],
      ['1', '2', '3', '', 'LK', 'MK', 'HK', 'K', 'Any', 'ホールド', 'キャンセル'],
      ['q', 'w', 'e', '', 'J', 'O', 'DP', 'I', 'R', 'C', '<'],
      ['', '', '', '', 'ジャンプ', 'Or', 'パリィ', 'インパクト', 'ドライブ\nラッシュ', 'キャンセル\nラッシュ', '未キャンセル'],
    ];
    const layout = baseLayout.map((row) => row.slice());
    if (controlMode === 'modern') {
      if (layout[0]) layout[0][7] = '';
      if (layout[1]) {
        layout[1][4] = 'L';
        layout[1][5] = 'M';
        layout[1][6] = 'H';
        layout[1][7] = '';
      }
      if (layout[2]) {
        layout[2][4] = 'SP';
        layout[2][5] = 'Auto';
        layout[2][6] = '';
        layout[2][7] = '';
      }
      if (layout[3]) {
        layout[3][4] = 'SP';
        layout[3][5] = 'AUTO';
        layout[3][6] = '';
        layout[3][7] = '';
      }
    }

    const iconMap = {
      '7': { src: 'assets/images/icons/key-ul.png', w: 28, h: 28 },
      '8': { src: 'assets/images/icons/key-u.png', w: 30, h: 30 },
      '9': { src: 'assets/images/icons/key-ur.png', w: 30, h: 30 },
      '4': { src: 'assets/images/icons/key-l.png', w: 30, h: 30 },
      '5': { src: 'assets/images/icons/key-nutral.png', w: 32, h: 32 },
      '6': { src: 'assets/images/icons/key-r.png', w: 30, h: 30 },
      '1': { src: 'assets/images/icons/key-dl.png', w: 30, h: 30 },
      '2': { src: 'assets/images/icons/key-d.png', w: 30, h: 30 },
      '3': { src: 'assets/images/icons/key-dr.png', w: 30, h: 30 },
      'q': { src: 'assets/images/icons/key-lc.png', w: 33, h: 33 },
      'w': { src: 'assets/images/icons/key-dc.png', w: 20, h: 20 },
      'e': { src: 'assets/images/icons/key-circle.png', w: 33, h: 33 },

      'y': { src: 'assets/images/icons/icon_punch_l.png', w: 22, h: 22 },
      'u': { src: 'assets/images/icons/icon_punch_m.png', w: 22, h: 22 },
      'i': { src: 'assets/images/icons/icon_punch_h.png', w: 22, h: 22 },
      'o': { src: 'assets/images/icons/icon_punch.png', w: 22, h: 22 },
      't': { src: 'assets/images/icons/icon_throw.png', w: 22, h: 22 },
      '-': { src: 'assets/images/icons/arrow_3.png', w: 24, h: 24 },
      'D': { src: 'assets/images/icons/delay.png', w: 33, h: 33 },

      'h': { src: 'assets/images/icons/icon_kick_l.png', w: 22, h: 22 },
      'j': { src: 'assets/images/icons/icon_kick_m.png', w: 22, h: 22 },
      'k': { src: 'assets/images/icons/icon_kick_h.png', w: 22, h: 22 },
      'l': { src: 'assets/images/icons/icon_kick.png', w: 22, h: 22 },
      'a': { src: 'assets/images/icons/key-all.png', w: 24, h: 24 },
      'H': { src: 'assets/images/icons/key-barrage.png', w: 26, h: 26 },
      '>': { src: 'assets/images/icons/arrow_single.png', w: 22, h: 22 },

      'J': { src: 'assets/images/icons/jump.png', w: 22, h: 22 },
      'O': { src: 'assets/images/icons/key-or.png', w: 24, h: 24 },
      'P': { src: 'assets/images/icons/icon_punch.png', w: 22, h: 22 },
      'DP': { src: 'assets/images/icons/modern_dp.png', w: 20, h: 20 },
      'I': { src: 'assets/images/icons/modern_dl.png', w: 22, h: 22 },
      'R': { src: 'assets/images/icons/modern_dr.png', w: 24, h: 24 },
      'C': { src: 'assets/images/icons/modern_cr.png', w: 24, h: 24 },
      '<': { src: 'assets/images/icons/arrow_double.png', w: 22, h: 22 },
    };

    if (controlMode === 'modern') {
      const modernL = { src: 'assets/images/icons/modern_l.png', w: 22, h: 22 };
      const modernM = { src: 'assets/images/icons/modern_m.png', w: 22, h: 22 };
      const modernH = { src: 'assets/images/icons/modern_h.png', w: 22, h: 22 };
      const modernSP = { src: 'assets/images/icons/modern_sp.png', w: 22, h: 22 };
      const modernAuto = { src: 'assets/images/icons/modern_auto.png', w: 22, h: 22 };
      iconMap.y = modernL;
      iconMap.u = modernM;
      iconMap.i = modernH;
      iconMap.LP = modernL;
      iconMap.MP = modernM;
      iconMap.HP = modernH;
      iconMap.L = modernL;
      iconMap.M = modernM;
      iconMap.SP = modernSP;
      iconMap.Auto = modernAuto;
      iconMap.AUTO = modernAuto;
    }

    const fallbackIcon = { src: 'assets/images/icons/key-all.png', w: 20, h: 20 };
    const descRows = new Set([1, 5]);
    const directionalTokens = new Set(['7', '8', '9', '4', '5', '6', '1', '2', '3']);
    const mixedDescRow = 3;

    return {
      layout,
      iconMap,
      fallbackIcon,
      descRows,
      directionalTokens,
      mixedDescRow,
    };
  }

  function pruneShortcutTable(table) {
    if (!table) return;
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows[3]) rows[3].remove();
    rows.forEach((row) => {
      const cells = Array.from(row.querySelectorAll('td'));
      [5, 4, 3].forEach((idx) => {
        const cell = cells[idx];
        if (cell) cell.remove();
      });
    });
  }

  function renderTable5Tokens() {
    const table5 = qs('Table5');
    if (!table5) return;
    table5.querySelectorAll('td').forEach((cell) => {
      if (cell.dataset.shortcutAdd === 'true') return;
      const token = cell.dataset.token;
      if (!token) return;
      renderShortcutSequence(cell, token);
    });
  }

  function renderShortcutSequence(cell, value) {
    if (!cell) return;
    const p = cell.querySelector('p') || cell;
    const tokens = parseButtonsValue(value);
    p.innerHTML = '';
    p.classList.add('shortcut-seq');
    if (!tokens.length) {
      p.classList.remove('shortcut-seq');
      p.textContent = value || '';
      return;
    }
    tokens.forEach((token) => {
      const icon = getButtonIcon(token);
      if (icon) {
        const span = document.createElement('span');
        span.className = 'btn-token';
        span.dataset.token = token;
        const img = document.createElement('img');
        img.alt = '';
        img.src = icon.src;
        img.width = 16;
        img.height = 16;
        span.appendChild(img);
        p.appendChild(span);
      } else {
        const text = document.createElement('span');
        text.className = 'btn-token-fallback';
        text.textContent = token;
        p.appendChild(text);
      }
    });
  }

  function applyUiButtonLayout() {
    const table2 = qs('Table2');
    const table4 = qs('Table4');
    if (!table2 || !table4) return;

    const { layout, iconMap, fallbackIcon, descRows, directionalTokens, mixedDescRow } = getUiButtonLayoutData(state.controlMode);

    const setKeyCell = (cell, value) => {
      if (!cell) return;
      const p = cell.querySelector('p') || cell;
      cell.dataset.token = '';
      cell.dataset.shortcutAdd = '';
      if (!value) {
        p.textContent = '';
        return;
      }
      const text = String(value);
      const icon = iconMap[text] || fallbackIcon;
      p.innerHTML = `
        <div class="ui-btn-keycell">
          <img alt="" width="${icon.w}" height="${icon.h}" src="${icon.src}">
          <span class="ui-btn-key">${text}</span>
        </div>`;
      if (!/[\u3040-\u30ff\u4e00-\u9fff]/.test(text)) {
        cell.dataset.token = text;
      }
    };

    const setDescCell = (cell, value) => {
      if (!cell) return;
      const p = cell.querySelector('p') || cell;
      cell.dataset.token = '';
      cell.dataset.shortcutAdd = '';
      const rawText = String(value || '').trim();
      const text = translateUiLabel(rawText, getComboLang());
      if (!text) {
        p.textContent = '';
        return;
      }
      p.innerHTML = `<div class="ui-btn-desc">${text.replace(/\n/g, '<br/>')}</div>`;
    };

    const rows2 = Array.from(table2.querySelectorAll('tr'));
    const rows4 = Array.from(table4.querySelectorAll('tr'));

    layout.forEach((row, rIdx) => {
      const row2 = rows2[rIdx];
      const row4 = rows4[rIdx];
      if (row2) {
        row2.classList.remove('ui-icon-row', 'ui-desc-row');
        if (descRows.has(rIdx)) row2.classList.add('ui-desc-row');
        else row2.classList.add('ui-icon-row');
      }
      if (row4) {
        row4.classList.remove('ui-icon-row', 'ui-desc-row');
        if (descRows.has(rIdx) || rIdx === mixedDescRow) row4.classList.add('ui-desc-row');
        else row4.classList.add('ui-icon-row');
      }
      if (row2) {
        const cells2 = Array.from(row2.querySelectorAll('td'));
        for (let c = 0; c < 4; c += 1) {
          const value = row[c] || '';
          const isDesc = descRows.has(rIdx) || (rIdx === mixedDescRow && c >= 3);
          if (isDesc) {
            if (directionalTokens.has(value) || value === 'ニュートラル') {
              setDescCell(cells2[c], '');
            } else {
              setDescCell(cells2[c], value);
            }
          } else {
            setKeyCell(cells2[c], value);
          }
        }
      }
      if (row4) {
        const cells4 = Array.from(row4.querySelectorAll('td'));
        for (let c = 0; c < 7; c += 1) {
          const value = row[c + 4] || '';
          const isDesc = descRows.has(rIdx) || rIdx === mixedDescRow;
          if (isDesc) {
            if (directionalTokens.has(value) || value === 'ニュートラル') {
              setDescCell(cells4[c], '');
            } else {
              setDescCell(cells4[c], value);
            }
          } else {
            setKeyCell(cells4[c], value);
          }
        }
      }
    });

    rows2.slice(layout.length).forEach((row) => {
      row.querySelectorAll('td').forEach((cell) => setCell(cell, ''));
    });
    rows4.slice(layout.length).forEach((row) => {
      row.querySelectorAll('td').forEach((cell) => setCell(cell, ''));
    });
  }

  function tokenFromCell(cell) {
    if (!cell) return null;
    const raw = (cell.textContent || '').replace(/\s+/g, '');
    if (!raw) return null;
    const upper = raw.toUpperCase();
    if (/^\d+$/.test(upper)) return upper;
    if (upper === 'LP') return 'LP';
    if (upper === 'MP') return 'MP';
    if (upper === 'HP') return 'HP';
    if (upper === 'P') return 'P';
    if (upper === 'T') return 'T';
    if (upper === '-') return ' - ';
    if (upper === 'LK') return 'LK';
    if (upper === 'MK') return 'MK';
    if (upper === 'HK') return 'HK';
    if (upper === 'K') return 'K';
    if (upper === 'HK') return 'HK';
    if (upper === 'DI') return 'DI';
    if (upper === 'DR') return 'DR';
    if (upper === 'CR') return 'CR';
    if (upper === 'T') return 'T';
    if (upper === 'JUMP') return 'Jump';
    if (upper === 'HOLD') return 'Hold';
    if (upper === 'OR') return 'Or';
    if (upper === '>') return '>';
    if (upper === '>>') return '>>';
    if (upper === '-') return '-';
    if (upper === '+') return '+';
    if (upper === '.') return '.';
    return null;
  }

  function getCharacterOptions() {
    const cards = Array.from(document.querySelectorAll('.char-card'));
    if (!cards.length) return [];
    return cards.map((card) => {
      const slug = card.getAttribute('data-char');
      const label = (card.querySelector('span') && card.querySelector('span').textContent) || slug;
      return { value: slug, label };
    });
  }

  function getSpecialConditionOptions(lang) {
    const active = lang || getComboLang();
    const base = [
      { value: '-', key: 'none', fallback: '-' },
      { value: '毒', key: 'poison', fallback: '毒' },
      { value: '集中', key: 'focus', fallback: '集中' },
      { value: '酔1', key: 'drunk1', fallback: '酔1' },
      { value: '酔2', key: 'drunk2', fallback: '酔2' },
      { value: '酔3', key: 'drunk3', fallback: '酔3' },
      { value: '酔4', key: 'drunk4', fallback: '酔4' },
      { value: '焔1', key: 'flame1', fallback: '焔1' },
      { value: '焔2', key: 'flame2', fallback: '焔2' },
      { value: '焔3', key: 'flame3', fallback: '焔3' },
      { value: '焔4', key: 'flame4', fallback: '焔4' },
      { value: '焔5', key: 'flame5', fallback: '焔5' },
      { value: 'マイン', key: 'mine', fallback: 'マイン' },
      { value: 'SA1時', key: 'sa1', fallback: 'SA1時' },
      { value: 'SA2時', key: 'sa2', fallback: 'SA2時' },
      { value: '人形1', key: 'doll1', fallback: '人形1' },
      { value: '人形2', key: 'doll2', fallback: '人形2' },
      { value: '人形3', key: 'doll3', fallback: '人形3' },
      { value: '風1', key: 'wind1', fallback: '風1' },
      { value: '風2', key: 'wind2', fallback: '風2' },
      { value: '風3', key: 'wind3', fallback: '風3' },
      { value: 'スプレー1', key: 'spray1', fallback: 'スプレー1' },
      { value: 'スプレー2', key: 'spray2', fallback: 'スプレー2' },
      { value: 'スプレー3', key: 'spray3', fallback: 'スプレー3' },
    ];
    return base.map((entry) => ({
      value: entry.value,
      label: comboT(`special_conditions.${entry.key}`, active) || entry.fallback,
    }));
  }

  function getGameVersionOptions(lang) {
    const active = lang || getComboLang();
    const currentVersion = getCurrentFrameVersionForCombo();
    const versionValues = ['2025.12.16', currentVersion]
      .map((v) => String(v || '').trim())
      .filter(Boolean);
    const uniqueVersions = [...new Set(versionValues)];
    const options = [
      { value: '', label: '-' },
      ...uniqueVersions.map((value) => ({ value, label: value })),
      { value: 'Other', label: comboValueLabel('other', 'Other', active) },
    ];
    return options;
  }

  function openMultiSelect(input) {
    if (!input || !input.classList.contains('multi-input')) return;
    let panel = qs('comboMultiPanel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'comboMultiPanel';
      panel.className = 'combo-multi-panel';
      document.body.appendChild(panel);
    }
    const rect = input.getBoundingClientRect();
    panel.style.left = `${rect.left + window.scrollX}px`;
    panel.style.top = `${rect.bottom + window.scrollY + 4}px`;
    panel.dataset.targetRow = input.dataset.row;
    panel.dataset.field = input.dataset.field;

    const activeLang = getComboLang();
    let options = [];
    try {
      options = JSON.parse(input.dataset.options || '[]');
    } catch { }
    if (input.dataset.field === 'special_condition') {
      options = getSpecialConditionOptions(activeLang);
      input.dataset.options = JSON.stringify(options);
    }
    const rawValue = getMultiInputRawValue(input);
    const selected = new Set(parseMultiValue(rawValue));
    const applyLabel = comboT('ui.multi_apply', activeLang) || 'Apply';
    const clearLabel = comboT('ui.multi_clear', activeLang) || 'Clear';
    panel.innerHTML = `
      <div class="combo-multi-body">
        ${options
        .map((opt) => {
          const checked = selected.has(opt.value) ? 'checked' : '';
          return `<label><input type="checkbox" value="${opt.value}" ${checked}/> ${opt.label}</label>`;
        })
        .join('')}
      </div>
      <div class="combo-multi-actions">
        <button type="button" data-action="apply">${applyLabel}</button>
        <button type="button" data-action="clear">${clearLabel}</button>
      </div>
    `;
    panel.classList.add('active');

    panel.onclick = (ev) => {
      const action = ev.target && ev.target.dataset && ev.target.dataset.action;
      if (action === 'apply') {
        const values = Array.from(panel.querySelectorAll('input[type="checkbox"]'))
          .filter((chk) => chk.checked)
          .map((chk) => chk.value);
        const raw = values.join(', ');
        input.dataset.rawValue = raw;
        if (input.dataset.field === 'special_condition') {
          input.value = formatSpecialConditionDisplay(raw, getComboLang());
        } else {
          input.value = raw;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        closeMultiSelect();
      }
      if (action === 'clear') {
        input.dataset.rawValue = '';
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        closeMultiSelect();
      }
    };

    const onDoc = (ev) => {
      if (panel.contains(ev.target) || ev.target === input) return;
      closeMultiSelect();
    };
    document.addEventListener('click', onDoc, { once: true });
  }

  function refreshMultiSelectPanel(lang) {
    const panel = qs('comboMultiPanel');
    if (!panel || !panel.classList.contains('active')) return;
    const field = panel.dataset.field || '';
    const row = panel.dataset.targetRow || '';
    const input = ui.table
      ? ui.table.querySelector(`input.multi-input[data-field="${field}"][data-row="${row}"]`)
      : null;
    if (!input) return;
    const active = lang || getComboLang();
    let options = [];
    try {
      options = JSON.parse(input.dataset.options || '[]');
    } catch { }
    if (field === 'special_condition') {
      options = getSpecialConditionOptions(active);
      input.dataset.options = JSON.stringify(options);
    }
    const rawValue = getMultiInputRawValue(input);
    const selected = new Set(parseMultiValue(rawValue));
    const body = panel.querySelector('.combo-multi-body');
    if (body) {
      body.innerHTML = options
        .map((opt) => {
          const checked = selected.has(opt.value) ? 'checked' : '';
          return `<label><input type="checkbox" value="${opt.value}" ${checked}/> ${opt.label}</label>`;
        })
        .join('');
    }
  }

  function closeMultiSelect() {
    const panel = qs('comboMultiPanel');
    if (!panel) return;
    panel.classList.remove('active');
  }

  function parseMultiValue(value) {
    if (!value) return [];
    return String(value)
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  function getSelectedComboReportContext() {
    const index = Number.isFinite(state.selectedGroup) ? state.selectedGroup : -1;
    const combo = index >= 0 ? (state.combos[index] || null) : null;
    if (!combo) return null;
    const snippet = {
      command: String(combo.command || ''),
      notes: String(combo.combo_notes || ''),
      mode: String(state.controlMode || 'classic'),
      authoredVersion: String(combo.game_version || ''),
    };
    return { row: index + 1, snippet };
  }

  window.applyComboLanguage = applyComboLanguage;
  window.getComboReportContext = getSelectedComboReportContext;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('resize', () => {
    if (ui.comboView && ui.table) {
      ensureTableScrollContainer();
      layoutInputButtons();
      layoutHeaderActions();
      applyComboColumnWidths();
    }
  });

  function switchCharacterCombos(slug) {
    if (!slug) return;
    const current = state.currentCharacter || getCharacterSlugFromUi();
    if (slug === current) return;
    persist({ immediate: true, dirty: false });
    state.currentCharacter = slug;
    persistComboCharacter(slug);
    if (ui.comboView) ui.comboView.dataset.character = slug;
    loadState({ resetIfMissing: true });
    ensureGroupCount(state.combos.length);
    ensureSampleCombo();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedGroup(0);
  }

  window.switchComboCharacter = (slug) => {
    const resolved = resolveCharacterSlug(slug) || '';
    if (!resolved) return;
    applyComboPortrait(resolved);
    switchCharacterCombos(resolved);
  };
})();
