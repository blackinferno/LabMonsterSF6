// Combo List UI (rebuilt)
(() => {
  const STORAGE_KEY_BASE = 'sf6_combo_table_v3';
  const LEGACY_STORAGE_KEY = 'sf6_combo_table_v2';
  const UI_PREFS_KEY = 'sf6_combo_ui_prefs_v1';
  const KEYMAP_KEY = 'sf6_combo_keymap_v1';
  const SHORTCUT_KEY = 'sf6_combo_shortcuts_v1';
  const XLSX_IMPORT_MAPS_KEY = 'lm_xlsx_import_maps_v1';
  const NOTATION_UNKNOWN_RULES_KEY = 'sf6_notation_unknown_rules_v1';
  const UI_LAYOUT_MODES = new Set(['legacy', 'desktop']);
  const COMBO_CHARACTER_KEY = 'lm_combo_selected_char_v1';
  const COMBO_CONTROL_MODE_KEY = 'lm_combo_control_mode_v1';
  const NOTATION_DISPLAY_STYLES = new Set(['default']);
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
        range_group_conditions: '条件',
        range_group_damage: 'ダメージ',
        range_group_damage_ca: 'CAダメージ',
        range_group_d_gauge: 'Dゲージ',
        range_group_sa_gauge: 'SAゲージ',
        range_group_other: 'その他',
        control: '操作方法',
        distance: '距離',
        position: '位置',
        counter: 'カウンター',
        bo: 'BO/スタン',
        vs: '対応キャラ',
        interrupt: '割込',
        safe_jump: '詐欺飛び',
        special: '特殊条件',
        sa: 'SA',
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
        context_duplicate: 'コンボを複製',
        context_delete: 'コンボを削除',
        context_copy_command: 'コマンド文字列をコピー',
        context_lock_auto: '自動項目を全てロック',
        context_unlock_auto: '自動項目を全てアンロック',
        context_copy_rows: '行をコピー',
        context_paste_rows: '貼り付け',
        context_insert_copied_below: 'コピーを下に挿入',
        context_delete_rows: '行を削除',
        context_insert_rows: '行を挿入',
        context_clear_rows: '値をクリア',
        context_header_hide: '列を非表示',
        context_header_show: '列を表示',
        context_sort_asc: '昇順で並び替え',
        context_sort_desc: '降順で並び替え',
        context_clear_values: '値をクリア',
        context_convert_negative: '負の値に変換',
        layout_label: 'レイアウト:',
        layout_legacy: 'レガシー',
        layout_desktop: 'PC風',
        context_clear_filter: 'フィルターをクリア',
        context_filter_search: '検索',
        context_filter_select_all: '(すべて選択)',
        context_filter_blank: '(空白セル)',
        context_filter_numeric: '数値フィルター',
        context_filter_num_eq: '指定の値に等しい',
        context_filter_num_ne: '指定の値に等しくない',
        context_filter_num_gt: '指定の値より大きい',
        context_filter_num_gte: '指定の値以上',
        context_filter_num_lt: '指定の値より小さい',
        context_filter_num_lte: '指定の値以下',
        context_filter_num_between: '指定の範囲内',
        context_filter_num_v1: '値1',
        context_filter_num_v2: '値2',
        context_filter_ok: 'OK',
        context_filter_cancel: 'キャンセル',
        replace_title: '置換',
        replace_find: '検索文字列',
        replace_with: '置換後',
        replace_scope: '対象',
        replace_scope_selected: '選択行',
        replace_scope_all: '全コンボ',
        replace_apply: '置換',
        replace_close: '閉じる',
        replace_to_advanced: '詳細検索へ',
        dedupe: '重複削除',
        restore: '復元',
        rows_show_all: '全表示',
        rows_hide_all: '全非表示',
        notation_dict: '表記辞書',
        notation_display_title: '表示記法',
        notation_display_default: 'LM',
        notation_display_stcr: 'st./cr.',
        notation_display_jp_words: '立/屈',
        notation_title: '表記辞書',
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
        notation_display_lm: '表示対象LM (例: Jump)',
        notation_display_jp: '表示JP (例: J)',
        notation_display_en: '表示EN (例: j.)',
        notation_display_table_lm: 'LM',
        notation_display_table_jp: 'JP',
        notation_display_table_en: 'EN',
        notation_display_set: '表示上書き',
        notation_display_clear: '表示上書き削除',
        notation_display_edit: '表示編集',
        notation_map_title: '表記マッピング',
        notation_map_desc: 'User Notationを基準にLM表記とボタン表示を逆引きします（例: 屈強P -> 2HP）。',
        notation_map_buttons: 'Buttons',
        notation_map_lm: 'LM Notation',
        notation_map_user: 'User Notation',
        notation_map_apply: 'マッピングを保存',
        notation_import_preview_title: '既存コンボ表記プレビュー',
        notation_import_preview_desc: '現在のコンボ表記がLM正規化後にどう表示されるか確認できます。',
        notation_import_preview_idx: '#',
        notation_import_preview_input: '入力表記',
        notation_import_preview_canonical: 'LM正規化',
        notation_import_preview_display: '表示',
        notation_import_preview_buttons: 'ボタン',
        notation_import_preview_replacements: '置換',
        notation_import_preview_unknown: '未認識',
        notation_unknown_manage_title: '未認識トークンの処理',
        notation_unknown_manage_desc: '未認識語ごとに、無視・削除・置換（LM）を設定できます。',
        notation_unknown_term: '未認識',
        notation_unknown_settings: '設定',
        notation_unknown_ignore: '無視',
        notation_unknown_delete: '削除',
        notation_unknown_replace: '置換',
        notation_unknown_input: '入力(LM)',
        notation_unknown_test: 'テスト',
        notation_unknown_replace_to: '置換先LM',
        notation_unknown_action_ignore: '無視',
        notation_unknown_action_delete: '削除',
        notation_unknown_action_replace: '置換',
        notation_unknown_apply: '適用',
        notation_unknown_apply_existing: '適用',
        notation_preview_existing: '再読み込み',
        notation_test_placeholder: 'ここに入力して変換結果を確認 (例: 弱昇竜 > 236LP)',
        import_target_title: 'インポート対象の選択',
        import_target_desc: '複数キャラのデータが検出されました。取り込み対象を選択してください。',
        import_target_label: '対象キャラ',
        import_target_all: '検出した全キャラ',
        import_target_apply: '取り込み',
        import_target_cancel: '閉じる',
        xlsx_map_title: 'XLSX列マッピング',
        xlsx_map_desc: 'このシートの列を、読み込み先フィールドに割り当ててください。',
        xlsx_map_character: '割り当て中：',
        xlsx_map_header_row: 'ヘッダー行',
        xlsx_map_select_all: '全選択',
        xlsx_map_unselect_all: '全解除',
        xlsx_map_basic: '基本フィールド',
        xlsx_map_advanced: '詳細フィールド',
        xlsx_map_field: 'フィールド',
        xlsx_map_column: '列',
        xlsx_map_preview: 'プレビュー (先頭5行)',
        xlsx_map_raw_command: 'コマンド(元)',
        xlsx_map_norm_command: 'コマンド(正規化)',
        xlsx_map_buttons: 'ボタン',
        xlsx_map_summary: '取り込み内容',
        xlsx_map_notation: '表記変換',
        xlsx_map_apply: '取り込み',
        xlsx_map_cancel: '閉じる',
        xlsx_map_save_preset: 'このマッピングを保存',
        xlsx_map_none: '-',
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
        combo: 'コンボ入力列',
        conditions: 'コンボ開始時の条件',
        control_mode: 'コンボが可能な操作タイプ',
        distance: 'コンボ開始時の距離',
        position: 'コンボが可能な画面位置',
        counter: 'コンボが成立するカウンターヒット種別',
        bo_stun: 'バーンアウトやスタン状態が要求される場合',
        drive_req: 'コンボ開始時に必要な最小Dゲージ量',
        sa_req: 'コンボ開始時に必要なSAゲージ',
        vs_character: 'コンボが対応するキャラ',
        special: 'コンボに必要な特殊条件（例: 焔3、酔2、肩屋入りなど）',
        damage: 'ダメージ関連項目',
        damage_jp: 'コンボがジャストパリィ後の場合のダメージ',
        damage_bo_guard: 'コンボをBO中にガードさせた場合の削りダメージ',
        damage_normal: '開始が通常ヒットの場合のダメージ',
        damage_counter: '開始がカウンターの場合のダメージ',
        damage_punish: '開始がパニッシュカウンターの場合のダメージ',
        damage_normal_ca: '開始が通常ヒットの場合のダメージ（CA時）',
        damage_counter_ca: '開始がカウンターの場合のダメージ（CA時）',
        damage_punish_ca: '開始がパニッシュカウンターの場合のダメージ（CA時）',
        d_gauge_chip: '相手がバーンアウト時に与えるダメージ',
        d_guard: 'ガード時に相手のDゲージを削る量',
        d_normal: '通常ヒット時に相手のDゲージ削る量',
        d_pc: 'パニッシュカウンター時に相手のDゲージ削る量',
        d_delta: 'Dゲージの増減量',
        d_delta_self: '自分側のDゲージ増減量',
        d_delta_opp: '相手側のDゲージ増減量',
        d_eff: 'Dゲージ効率（通常ヒットダメージ/自分のDゲージ増減量）',
        sa_delta: 'SAゲージの増減量',
        sa_delta_self: '自分側のSAゲージ増減量',
        sa_delta_opp: '相手側のSAゲージ増量',
        carry: '運び距離（ヒット時）',
        end_distance: 'コンボ後の相対距離（ヒット時）',
        frame_adv: 'コンボ後のフレーム差（ヒット時）',
        safe_jump: 'コンボ後の詐欺飛びの可否',
        interrupt: '割込の可否。',
        oki: 'コンボの重ね記入欄（例: 立ちLP重ね、屈中P重ねなど）',
      },
      special_conditions: {
        none: '-',
        poison: '毒',
        focus: '集中',
        spirit: '肩屋入り',
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
        sa3: 'SA3時',
        doll1: '人形1',
        doll2: '人形2',
        doll3: '人形3',
        doll4: '人形4',
        doll5: '人形5',
        wind1: '風1',
        wind2: '風2',
        wind3: '風3',
        spray1: 'スプレー1',
        spray2: 'スプレー2',
        spray3: 'スプレー3',
        medal2: 'メダル2',
        medal3: 'メダル3',
        medal4: 'メダル4',
        medal5: 'メダル5',
        fuha1: '風破1',
        fuha2: '風破2',
        fuha3: '風破3',
      },
      sa_filters: {
        sa1: 'SA1',
        sa2: 'SA2',
        sa3: 'SA3',
        shungoku: '瞬獄殺',
        sin_sa2_1: 'Sin SA2-1',
        sin_sa2_2: 'Sin SA2-2',
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
        context_delete_confirm: 'このコンボを削除しますか？',
        context_delete_rows_confirm: '選択した{count}行を削除しますか？',
        context_clear_rows_confirm: '選択した{count}行の値をクリアしますか？',
        context_clear_values_confirm: '「{field}」列の値を全てクリアしますか？',
        context_text_filter_prompt: '「{field}」列の部分一致フィルターを入力してください（空欄で解除）。',
        context_copy_done: 'コマンドをコピーしました。',
        context_copy_failed: 'コピーに失敗しました。',
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
        notation_display_failed: '表示設定にはLMトークンが必要です。',
        notation_display_saved: '表示設定を保存しました。',
        notation_display_cleared: '表示設定を削除しました。',
        notation_apply_existing_none: '再正規化できる既存コンボがありません。',
        notation_apply_existing_done: '既存コンボを再正規化しました（{updated}/{total}件更新）。',
        xlsx_map_required_command: 'コマンド列の割り当てが必要です。',
        xlsx_map_required_target: '取り込み対象のキャラクターを1つ以上選択してください。',
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
        range_group_conditions: 'Conditions',
        range_group_damage: 'Damage',
        range_group_damage_ca: 'CA Damage',
        range_group_d_gauge: 'D Gauge',
        range_group_sa_gauge: 'SA Gauge',
        range_group_other: 'Other',
        control: 'Control',
        distance: 'Distance',
        position: 'Position',
        counter: 'Counter',
        bo: 'BO/Stun',
        vs: 'Opp Character',
        interrupt: 'Interrupt',
        safe_jump: 'Safe Jump',
        special: 'Special Conditions',
        sa: 'SA',
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
        context_duplicate: 'Duplicate Combo',
        context_delete: 'Delete Combo',
        context_copy_command: 'Copy Combo Command Text',
        context_lock_auto: 'Lock All Auto Fields',
        context_unlock_auto: 'Unlock All Auto Fields',
        context_copy_rows: 'Copy Rows',
        context_paste_rows: 'Paste',
        context_insert_copied_below: 'Insert Copied Below',
        context_delete_rows: 'Delete Rows',
        context_insert_rows: 'Insert Rows',
        context_clear_rows: 'Clear Values',
        context_header_hide: 'Hide Column',
        context_header_show: 'Show Columns',
        context_sort_asc: 'Sort Ascending',
        context_sort_desc: 'Sort Descending',
        context_clear_values: 'Clear Values',
        context_convert_negative: 'Convert to Negative',
        layout_label: 'Layout:',
        layout_legacy: 'Legacy',
        layout_desktop: 'Desktop',
        context_clear_filter: 'Clear Filter',
        context_filter_search: 'Search',
        context_filter_select_all: '(Select All)',
        context_filter_blank: '(Blanks)',
        context_filter_numeric: 'Number Filter',
        context_filter_num_eq: 'Equals',
        context_filter_num_ne: 'Does Not Equal',
        context_filter_num_gt: 'Greater Than',
        context_filter_num_gte: 'Greater Than or Equal',
        context_filter_num_lt: 'Less Than',
        context_filter_num_lte: 'Less Than or Equal',
        context_filter_num_between: 'Between',
        context_filter_num_v1: 'Value 1',
        context_filter_num_v2: 'Value 2',
        context_filter_ok: 'OK',
        context_filter_cancel: 'Cancel',
        replace_title: 'Replace',
        replace_find: 'Find',
        replace_with: 'Replace with',
        replace_scope: 'Scope',
        replace_scope_selected: 'Selected rows',
        replace_scope_all: 'All combos',
        replace_apply: 'Replace',
        replace_close: 'Close',
        replace_to_advanced: 'Advanced Search',
        dedupe: 'Dedupe',
        restore: 'Restore',
        rows_show_all: 'Show All',
        rows_hide_all: 'Hide All',
        notation_dict: 'Notation Dict',
        notation_display_title: 'Display Notation',
        notation_display_default: 'LM',
        notation_display_stcr: 'st./cr.',
        notation_display_jp_words: 'JP Stand/Crouch',
        notation_title: 'Notation Dictionary',
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
        notation_display_lm: 'Display LM (e.g. Jump)',
        notation_display_jp: 'Display JP (e.g. J)',
        notation_display_en: 'Display EN (e.g. j.)',
        notation_display_table_lm: 'LM',
        notation_display_table_jp: 'JP',
        notation_display_table_en: 'EN',
        notation_display_set: 'Set Display',
        notation_display_clear: 'Clear Display',
        notation_display_edit: 'Edit Display',
        notation_map_title: 'Notation Mapping',
        notation_map_desc: 'Use User Notation as the source and resolve LM/buttons from it (e.g. 屈強P -> 2HP).',
        notation_map_buttons: 'Buttons',
        notation_map_lm: 'LM Notation',
        notation_map_user: 'User Notation',
        notation_map_apply: 'Save Mapping',
        notation_import_preview_title: 'Existing Combo Notation Preview',
        notation_import_preview_desc: 'Review how current combo commands normalize into LM canonical notation and buttons.',
        notation_import_preview_idx: '#',
        notation_import_preview_input: 'Input',
        notation_import_preview_canonical: 'LM Canonical',
        notation_import_preview_display: 'Display',
        notation_import_preview_buttons: 'Buttons',
        notation_import_preview_replacements: 'Replacements',
        notation_import_preview_unknown: 'Unknown',
        notation_unknown_manage_title: 'Unknown Token Handling',
        notation_unknown_manage_desc: 'Choose how each unknown term should be handled: ignore, delete, or replace with LM notation.',
        notation_unknown_term: 'Unknown',
        notation_unknown_settings: 'Settings',
        notation_unknown_ignore: 'Ignore',
        notation_unknown_delete: 'Delete',
        notation_unknown_replace: 'Replace',
        notation_unknown_input: 'Input (LM)',
        notation_unknown_test: 'Test',
        notation_unknown_replace_to: 'Replace To (LM)',
        notation_unknown_action_ignore: 'Ignore',
        notation_unknown_action_delete: 'Delete',
        notation_unknown_action_replace: 'Replace',
        notation_unknown_apply: 'Apply',
        notation_unknown_apply_existing: 'Apply',
        notation_preview_existing: 'Reload',
        notation_test_placeholder: 'Type here to preview normalization (e.g. Light DP > 236LP)',
        import_target_title: 'Select Import Target',
        import_target_desc: 'Multiple character datasets were detected. Choose what to import.',
        import_target_label: 'Target Character',
        import_target_all: 'All detected characters',
        import_target_apply: 'Import',
        import_target_cancel: 'Close',
        xlsx_map_title: 'XLSX Column Mapping',
        xlsx_map_desc: 'Map this sheet columns to import fields.',
        xlsx_map_character: 'Mapping Target',
        xlsx_map_header_row: 'Header row',
        xlsx_map_select_all: 'Select all',
        xlsx_map_unselect_all: 'Unselect all',
        xlsx_map_basic: 'Basic fields',
        xlsx_map_advanced: 'Advanced fields',
        xlsx_map_field: 'Field',
        xlsx_map_column: 'Column',
        xlsx_map_preview: 'Preview (first 5 rows)',
        xlsx_map_raw_command: 'Raw command',
        xlsx_map_norm_command: 'Normalized command',
        xlsx_map_buttons: 'Buttons',
        xlsx_map_summary: 'Imported fields',
        xlsx_map_notation: 'Notation',
        xlsx_map_apply: 'Import',
        xlsx_map_cancel: 'Close',
        xlsx_map_save_preset: 'Save this mapping',
        xlsx_map_none: '-',
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
      sa_filters: {
        sa1: 'SA1',
        sa2: 'SA2',
        sa3: 'SA3',
        shungoku: 'Shungoku',
        sin_sa2_1: 'Sin SA2-1',
        sin_sa2_2: 'Sin SA2-2',
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
        context_delete_confirm: 'Delete this combo?',
        context_delete_rows_confirm: 'Delete {count} selected rows?',
        context_clear_rows_confirm: 'Clear values in {count} selected rows?',
        context_clear_values_confirm: 'Clear all values in column "{field}"?',
        context_text_filter_prompt: 'Enter a contains filter for "{field}" (leave empty to clear).',
        context_copy_done: 'Command copied.',
        context_copy_failed: 'Failed to copy command.',
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
        notation_display_failed: 'LM token is required for display mapping.',
        notation_display_saved: 'Display mapping saved.',
        notation_display_cleared: 'Display mapping cleared.',
        notation_apply_existing_none: 'No existing combos were available to renormalize.',
        notation_apply_existing_done: 'Renormalized existing combos ({updated}/{total} updated).',
        xlsx_map_required_command: 'Command column mapping is required.',
        xlsx_map_required_target: 'Select at least one import target character.',
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

  const SA_FILTER_DEFINITIONS = [
    { value: 'sa1', key: 'sa1', fallback: 'SA1' },
    { value: 'sa2', key: 'sa2', fallback: 'SA2' },
    { value: 'sa3', key: 'sa3', fallback: 'SA3' },
    { value: 'shungoku', key: 'shungoku', fallback: '瞬獄殺' },
    { value: 'sin_sa2_1', key: 'sin_sa2_1', fallback: 'Sin SA2-1' },
    { value: 'sin_sa2_2', key: 'sin_sa2_2', fallback: 'Sin SA2-2' },
  ];
  const SA_FILTER_BY_CHARACTER = {
    default: ['sa1', 'sa2', 'sa3'],
    gouki_akuma: ['sa1', 'sa2', 'sa3', 'shungoku', 'sin_sa2_1', 'sin_sa2_2'],
    vega_mbison: ['sa1', 'sa2', 'sa3', 'sin_sa2_1', 'sin_sa2_2'],
  };
  const SA_COMMAND_PATTERNS = {
    sa1: [
      /(?:236236|214214)(?:\s*\+\s*|\s*)(?:LP|LK|L)\b/i,
      // Modern compact SA1: H SP / 6HSP.
      // H SP is only valid at command start or after a separator token.
      /\b6\s*(?:\+\s*)?H(?:\s*\+\s*|\s*)SP\b/i,
      /^\s*H(?:\s*\+\s*|\s*)SP\b/i,
      /(?:^|[>,/xX+\-]|\bxx\b)\s*H(?:\s*\+\s*|\s*)SP\b/i,
    ],
    sa2: [
      /(?:236236|214214)(?:\s*\+\s*|\s*)(?:MP|MK|M)\b/i,
      // Modern compact SA2: 4H SP
      /\b4\s*(?:\+\s*)?H(?:\s*\+\s*|\s*)SP\b/i,
    ],
    sa3: [
      /(?:236236|214214)(?:\s*\+\s*|\s*)(?:HP|HK|H)\b/i,
      // Terry SA3 accepted input: 21416MKHP (and separated variants).
      /\b21416(?:\s*\+\s*|\s*)MK(?:\s*\+\s*|\s*)HP\b/i,
      // Modern compact SA3: 2H SP
      /\b2\s*(?:\+\s*)?H(?:\s*\+\s*|\s*)SP\b/i,
    ],
    shungoku: [
      /瞬獄|しゅんごく|SHUNGOKU|RAGING\s*DEMON/i,
      // Classic: LP LP 6LK HP (single move command, no route separators).
      /\bLP\b[\s+xX,/\-]*\bLP\b[\s+xX,/\-]*\b6(?:\s*\+\s*)?(?:LK|K)\b[\s+xX,/\-]*\b(?:HP|P)\b/i,
      /\bLPLP6(?:LK|K)(?:HP|P)\b/i,
      // Modern: L L M H (single move command, no route separators).
      /\bL\b[\s+xX,/\-]*\bL\b[\s+xX,/\-]*\bM\b[\s+xX,/\-]*\bH\b/i,
      // Modern short compact entry.
      /\bLLMH\b/i,
    ],
    sin_sa2_1: [
      // SA2-1: 214214P / 214214K / 22MH / 22LMH
      /\b214214(?:\s*\+\s*|\s*)(?:P|K)\b/i,
      /\b22(?:\s*\+\s*|\s*)M(?:\s*\+\s*|\s*)H\b/i,
      /\b22(?:\s*\+\s*|\s*)L(?:\s*\+\s*|\s*)M(?:\s*\+\s*|\s*)H\b/i,
    ],
    sin_sa2_2: [
      // SA2-2: 22PPP / 22LM
      /\b22(?:\s*\+\s*|\s*)PPP\b/i,
      /\b22(?:\s*\+\s*|\s*)L(?:\s*\+\s*|\s*)M\b/i,
    ],
  };
  const saFilterTagCache = new Map();

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

  const COMBO_RANGE_CATEGORIES = [
    { key: 'conditions', fields: ['drive_req', 'sa_req'] },
    { key: 'damage', fields: ['damage_jp', 'damage_bo_guard', 'damage_normal', 'damage_counter', 'damage_punish'] },
    { key: 'd_gauge', fields: ['d_guard', 'd_normal', 'd_pc', 'drive_delta', 'drive_delta_opponent', 'drive_efficiency'] },
    { key: 'sa_gauge', fields: ['sa_delta', 'sa_delta_opponent'] },
    { key: 'other', fields: ['carry_distance', 'end_distance', 'frame_adv'] },
  ];

  function ensureRangeCategoryLayout(panel) {
    const root = panel || qs('comboFilterPanel');
    if (!root) return;
    const grid = root.querySelector('.range-grid');
    if (!grid) return;
    if (grid.dataset.categorized === 'true') {
      const hasLatestLayout = !!grid.querySelector('.combo-range-layout-table');
      const hasDamageCaSection = !!grid.querySelector('[data-range-section="damage_ca"]');
      if (hasLatestLayout && hasDamageCaSection) return;
      // Rebuild if an older categorized layout was already applied.
      grid.dataset.categorized = 'false';
    }
    const buildRangeRowElement = (field) => {
      const row = document.createElement('div');
      row.className = 'range-row';
      row.dataset.field = field;
      row.innerHTML = `
        <span class="range-label"></span>
        <div class="range-inputs">
          <input type="text" inputmode="numeric" class="range-exact" placeholder="exact">
          <div class="range-minmax">
            <input type="text" inputmode="numeric" class="range-min" placeholder="min">
            <span class="range-sep">～</span>
            <input type="text" inputmode="numeric" class="range-max" placeholder="max">
          </div>
        </div>
      `;
      return row;
    };
    const rowMap = new Map();
    Array.from(grid.querySelectorAll('.range-row')).forEach((row) => {
      const field = String(row.dataset.field || '').trim();
      if (!field) return;
      rowMap.set(field, row);
    });
    const table = document.createElement('table');
    table.className = 'combo-xlsx-map-layout-table combo-range-layout-table';
    const tbody = document.createElement('tbody');
    const usedFields = new Set();
    const COLUMN_COUNT = 6;
    const createSectionRow = (categoryKey, split = null) => {
      const tr = document.createElement('tr');
      tr.className = `combo-xlsx-map-layout-section range-layout-section${split ? ' split' : ''}`;
      if (split && split.left && split.right) {
        const leftTh = document.createElement('th');
        leftTh.colSpan = Number(split.left.colspan) || 1;
        leftTh.dataset.rangeSection = split.left.key;
        tr.appendChild(leftTh);
        const rightTh = document.createElement('th');
        rightTh.colSpan = Number(split.right.colspan) || 1;
        if (split.right.key) {
          rightTh.dataset.rangeSection = split.right.key;
        } else {
          rightTh.className = 'empty';
        }
        tr.appendChild(rightTh);
        if (leftTh.colSpan + rightTh.colSpan < COLUMN_COUNT) {
          const emptyTh = document.createElement('th');
          emptyTh.className = 'empty';
          emptyTh.colSpan = COLUMN_COUNT - leftTh.colSpan - rightTh.colSpan;
          tr.appendChild(emptyTh);
        }
        return tr;
      }
      const th = document.createElement('th');
      th.colSpan = COLUMN_COUNT;
      th.dataset.rangeSection = categoryKey;
      tr.appendChild(th);
      return tr;
    };
    const appendFieldRows = (fields) => {
      const normalized = (fields || []).filter(Boolean);
      if (!normalized.length) return;
      for (let i = 0; i < normalized.length; i += COLUMN_COUNT) {
        const chunk = normalized.slice(i, i + COLUMN_COUNT);
        const tr = document.createElement('tr');
        tr.className = 'range-layout-data-row';
        chunk.forEach((field) => {
          const td = document.createElement('td');
          td.className = 'combo-xlsx-map-layout-cell range-layout-cell';
          td.dataset.field = field;
          const row = rowMap.get(field);
          if (row) {
            td.appendChild(row);
            usedFields.add(field);
          }
          tr.appendChild(td);
        });
        for (let pad = chunk.length; pad < COLUMN_COUNT; pad += 1) {
          const empty = document.createElement('td');
          empty.className = 'combo-xlsx-map-layout-empty range-layout-empty';
          tr.appendChild(empty);
        }
        tbody.appendChild(tr);
      }
    };
    const appendFixedFieldRow = (fields) => {
      const tr = document.createElement('tr');
      tr.className = 'range-layout-data-row';
      const normalized = (Array.isArray(fields) ? fields.slice(0, COLUMN_COUNT) : []);
      normalized.forEach((field) => {
        if (!field) {
          const empty = document.createElement('td');
          empty.className = 'combo-xlsx-map-layout-empty range-layout-empty';
          tr.appendChild(empty);
          return;
        }
        const td = document.createElement('td');
        td.className = 'combo-xlsx-map-layout-cell range-layout-cell';
        td.dataset.field = field;
        let row = rowMap.get(field);
        if (!row && COMBO_RANGE_LABELS[field]) {
          row = buildRangeRowElement(field);
          rowMap.set(field, row);
        }
        if (row) {
          td.appendChild(row);
          usedFields.add(field);
        }
        tr.appendChild(td);
      });
      for (let i = normalized.length; i < COLUMN_COUNT; i += 1) {
        const empty = document.createElement('td');
        empty.className = 'combo-xlsx-map-layout-empty range-layout-empty';
        tr.appendChild(empty);
      }
      tbody.appendChild(tr);
    };

    // Top: Conditions + Other (same row)
    tbody.appendChild(createSectionRow(null, {
      left: { key: 'conditions', colspan: 2 },
      right: { key: 'other', colspan: 4 },
    }));
    appendFixedFieldRow(['drive_req', 'sa_req', 'carry_distance', 'end_distance', 'frame_adv', null]);

    // Damage
    tbody.appendChild(createSectionRow('damage'));
    appendFixedFieldRow(['damage_jp', 'damage_bo_guard', 'damage_normal', 'damage_counter', 'damage_punish', null]);
    tbody.appendChild(createSectionRow('damage_ca'));
    appendFixedFieldRow(['damage_normal_ca', 'damage_counter_ca', 'damage_punish_ca', null, null, null]);

    // Drive Gauge
    tbody.appendChild(createSectionRow('d_gauge'));
    appendFixedFieldRow(['d_guard', 'd_normal', 'd_pc', 'drive_delta', 'drive_delta_opponent', 'drive_efficiency']);

    // SA Gauge
    tbody.appendChild(createSectionRow(null, {
      left: { key: 'sa_gauge', colspan: 2 },
      right: { key: '', colspan: 4 },
    }));
    appendFixedFieldRow(['sa_delta', 'sa_delta_opponent', null, null, null, null]);

    const leftovers = Array.from(rowMap.entries())
      .filter(([field]) => !usedFields.has(field))
      .map(([field]) => field);
    if (leftovers.length) {
      tbody.appendChild(createSectionRow('other'));
      appendFieldRows(leftovers);
    }

    grid.innerHTML = '';
    table.appendChild(tbody);
    grid.appendChild(table);
    grid.classList.add('range-grid-categorized');
    grid.dataset.categorized = 'true';
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

  function normalizeCanonicalTokenCase(text) {
    let out = String(text || '');
    out = out.replace(
      /(^|[^A-Za-z0-9_])(lp|mp|hp|lk|mk|hk|pp|kk|p|k|l|m|h|sp|auto|dp|di|dr|cr)(?=$|[^A-Za-z0-9_])/gi,
      (_, prefix = '', token = '') => `${prefix}${String(token).toUpperCase()}`,
    );
    out = out
      .replace(/\bjump\b/gi, 'Jump')
      .replace(/\bhold\b/gi, 'Hold')
      .replace(/\bany\b/gi, 'Any')
      .replace(/\bor\b/gi, 'or');
    return out;
  }

  function normalizeNotationDisplayStyle(raw) {
    const value = String(raw || '').trim().toLowerCase();
    if (NOTATION_DISPLAY_STYLES.has(value)) return value;
    return 'default';
  }

  function normalizeUiLayoutMode(raw) {
    const value = String(raw || '').trim().toLowerCase();
    if (UI_LAYOUT_MODES.has(value)) return value;
    return 'legacy';
  }

  const COMMAND_DISPLAY_TOKEN_REGEX = /((?:236236|214214|41236|63214|623|421|236|214|22|44|66)(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)|4\(タメ\)|2\(タメ\)|360 360|360|236236|214214|41236|63214|623|421|236|214|22|44|66|[1-9](?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)|LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|DP|DI|DR|CR|JUMP|HOLD|投げ)/gi;

  function mapTokenToStCrDisplay(token) {
    const raw = String(token || '');
    const upper = raw.toUpperCase();
    const motionAttack = upper.match(/^(236236|214214|41236|63214|623|421|236|214|22|44|66)(LP|MP|HP|LK|MK|HK|PP|KK|P|K)$/);
    if (motionAttack) {
      const motionMap = {
        '236236': 'qcfx2',
        '214214': 'qcbx2',
        '41236': 'hcf',
        '63214': 'hcb',
        '623': 'dp',
        '421': 'rdp',
        '236': 'qcf',
        '214': 'qcb',
        '22': 'dd',
        '44': 'backdash',
        '66': 'dash',
      };
      const motion = motionMap[motionAttack[1]] || motionAttack[1];
      return `${motion}.${motionAttack[2]}`;
    }
    const normal = upper.match(/^([1-9])?(LP|MP|HP|LK|MK|HK|PP|KK|P|K)$/);
    if (normal) {
      const dir = normal[1] || '5';
      const attack = normal[2];
      const prefixMap = {
        '5': 'st.',
        '2': 'cr.',
        '6': 'f.',
        '4': 'b.',
        '8': 'j.',
        '7': 'j.',
        '9': 'j.',
        '1': 'd/b.',
        '3': 'd/f.',
      };
      const prefix = prefixMap[dir];
      if (!prefix) return raw;
      return `${prefix}${attack}`;
    }
    if (raw === '投げ') return 'Throw';
    if (upper === 'JUMP') return 'j.';
    if (upper === '4(タメ)') return '[4]';
    if (upper === '2(タメ)') return '[2]';
    return raw;
  }

  function mapTokenToJpWordsDisplay(token) {
    const raw = String(token || '');
    const upper = raw.toUpperCase();
    const normal = upper.match(/^([1-9])?(LP|MP|HP|LK|MK|HK|PP|KK|P|K)$/);
    if (normal) {
      const dir = normal[1] || '5';
      const attack = normal[2];
      const attackMap = {
        LP: '弱P',
        MP: '中P',
        HP: '強P',
        LK: '弱K',
        MK: '中K',
        HK: '強K',
        PP: 'PP',
        KK: 'KK',
        P: 'P',
        K: 'K',
      };
      const prefixMap = {
        '5': '立',
        '2': '屈',
        '6': '前',
        '4': '後',
        '8': 'J',
        '7': 'J',
        '9': 'J',
        '1': '屈',
        '3': '屈',
      };
      const prefix = prefixMap[dir] || '';
      const body = attackMap[attack] || attack;
      return `${prefix}${body}`;
    }
    if (raw === '投げ' || upper === 'THROW') return '投げ';
    if (upper === 'JUMP') return 'ジャンプ';
    return raw;
  }

  function escapeForRegex(text) {
    return String(text || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function applyCustomDisplayMappingsForInput(rawText) {
    const api = getNotationDictApi();
    if (!api || typeof api.getCustomDisplayRows !== 'function') return String(rawText || '');
    let out = String(rawText || '');
    let rows = [];
    try {
      rows = Array.isArray(api.getCustomDisplayRows()) ? api.getCustomDisplayRows() : [];
    } catch {
      rows = [];
    }
    if (!rows.length) return out;
    const mappings = [];
    rows.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const lmToken = String(row.lmToken || '').trim();
      if (!lmToken) return;
      const jp = String(row.jp || '').trim();
      const en = String(row.en || '').trim();
      if (jp && jp !== lmToken) mappings.push({ from: jp, to: lmToken });
      if (en && en !== lmToken) mappings.push({ from: en, to: lmToken });
    });
    if (!mappings.length) return out;

    const isProtectedInputAlias = (text) => {
      const value = String(text || '').trim();
      if (!value) return true;
      const upper = value.toUpperCase();
      if (/^(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|JUMP|HOLD|ANY|THROW|投げ|DI|DR|CR|DP|OR)$/.test(upper)) return true;
      if (/^(?:[1-9]|22|44|66|236|214|623|421|41236|63214|236236|214214|360|720)$/.test(upper)) return true;
      if (/^(?:4\(タメ\)|2\(タメ\)|\[4\]|\[2\])$/i.test(value)) return true;
      if (/^(?:st|s|cr|c|j|jump|f|b)\.?(?:lp|mp|hp|lk|mk|hk|pp|kk|p|k)?$/i.test(value)) return true;
      return false;
    };

    mappings
      .sort((a, b) => b.from.length - a.from.length)
      .forEach((pair) => {
        const from = pair.from;
        const to = pair.to;
        if (!from) return;
        if (isProtectedInputAlias(from)) return;
        // Guard against stale custom display rows forcing utility tokens to directions
        // (e.g. "Jump" -> "8"), which breaks command intent.
        if (/^(?:j|jump)$/i.test(from) && /^[1-9]$/.test(String(to || '').trim())) return;
        const escaped = escapeForRegex(from);
        if (!escaped) return;
        const isAsciiWord = /^[A-Za-z0-9._/-]+$/.test(from);
        if (isAsciiWord) {
          out = out.replace(
            new RegExp(`(^|[^A-Za-z0-9_])${escaped}(?=$|[^A-Za-z0-9_])`, 'gi'),
            (_, prefix) => `${prefix}${to}`,
          );
        } else {
          out = out.replace(new RegExp(escaped, 'g'), to);
        }
      });
    return out;
  }

  function normalizeNotationUnknownRuleAction(value) {
    const action = String(value || '').trim().toLowerCase();
    if (action === 'ignore' || action === 'delete' || action === 'replace') return action;
    return '';
  }

  function normalizeNotationUnknownRuleKey(term) {
    return String(term || '').trim().toLowerCase();
  }

  function sanitizeNotationUnknownRules(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object') return out;
    Object.entries(raw).forEach(([fallbackKey, value]) => {
      const source = value && typeof value === 'object' ? value : {};
      const term = String(source.term || fallbackKey || '').trim();
      const key = normalizeNotationUnknownRuleKey(term);
      if (!term || !key) return;
      const action = normalizeNotationUnknownRuleAction(source.action);
      if (!action) return;
      const replaceTo = action === 'replace'
        ? canonicalizeCommandForStorage(String(source.replaceTo || '').trim())
        : '';
      if (action === 'replace' && !replaceTo) return;
      out[key] = { term, action, replaceTo };
    });
    return out;
  }

  function loadNotationUnknownRules() {
    try {
      const raw = localStorage.getItem(NOTATION_UNKNOWN_RULES_KEY);
      if (!raw) {
        state.notationUnknownRules = {};
        return;
      }
      const parsed = JSON.parse(raw);
      state.notationUnknownRules = sanitizeNotationUnknownRules(parsed);
    } catch {
      state.notationUnknownRules = {};
    }
  }

  function saveNotationUnknownRules() {
    try {
      const payload = sanitizeNotationUnknownRules(state.notationUnknownRules || {});
      localStorage.setItem(NOTATION_UNKNOWN_RULES_KEY, JSON.stringify(payload));
      state.notationUnknownRules = payload;
    } catch { }
  }

  function getNotationUnknownRule(term) {
    const key = normalizeNotationUnknownRuleKey(term);
    if (!key) return null;
    const rules = state.notationUnknownRules && typeof state.notationUnknownRules === 'object'
      ? state.notationUnknownRules
      : {};
    return rules[key] || null;
  }

  function setNotationUnknownRule(term, action, replaceTo = '') {
    const text = String(term || '').trim();
    const key = normalizeNotationUnknownRuleKey(text);
    if (!text || !key) return;
    const normalizedAction = normalizeNotationUnknownRuleAction(action);
    if (!normalizedAction) {
      if (state.notationUnknownRules && typeof state.notationUnknownRules === 'object') {
        delete state.notationUnknownRules[key];
      }
      saveNotationUnknownRules();
      return;
    }
    const normalizedReplaceTo = normalizedAction === 'replace'
      ? canonicalizeCommandForStorage(String(replaceTo || '').trim())
      : '';
    if (normalizedAction === 'replace' && !normalizedReplaceTo) {
      if (state.notationUnknownRules && typeof state.notationUnknownRules === 'object') {
        delete state.notationUnknownRules[key];
      }
      saveNotationUnknownRules();
      return;
    }
    if (!state.notationUnknownRules || typeof state.notationUnknownRules !== 'object') {
      state.notationUnknownRules = {};
    }
    state.notationUnknownRules[key] = {
      term: text,
      action: normalizedAction,
      replaceTo: normalizedReplaceTo,
    };
    saveNotationUnknownRules();
  }

  function replaceAliasInInputText(sourceText, alias, toText, onReplace = null) {
    const from = String(alias || '').trim();
    if (!from) return String(sourceText || '');
    const to = String(toText != null ? toText : '');
    const escaped = escapeForRegex(from);
    if (!escaped) return String(sourceText || '');
    const applyTrace = (matchedValue) => {
      if (typeof onReplace === 'function') onReplace(String(matchedValue || from), to);
    };
    const isAsciiWord = /^[A-Za-z0-9._/+:-]+$/.test(from);
    const hasWordChar = /[A-Za-z0-9_]/.test(from);
    const useWordBoundary = isAsciiWord && hasWordChar;
    if (useWordBoundary) {
      return String(sourceText || '').replace(
        new RegExp(`(^|[^A-Za-z0-9_])${escaped}(?=$|[^A-Za-z0-9_])`, 'gi'),
        (matched, prefix = '') => {
          const core = matched.slice(String(prefix).length) || from;
          applyTrace(core);
          return `${prefix}${to}`;
        },
      );
    }
    return String(sourceText || '').replace(new RegExp(escaped, 'g'), (matched) => {
      applyTrace(matched);
      return to;
    });
  }

  function applyNotationUnknownRulesToInput(rawText, onReplace = null) {
    const resolveDeletionReplacement = (term) => {
      const token = String(term || '').trim();
      // Keep token boundaries when removing "+" so recognized parts
      // (e.g. 214 and HP) do not collapse into harder-to-parse forms.
      if (/^\+$/.test(token) || /^plus$/i.test(token)) return ' ';
      return '';
    };

    let out = String(rawText || '');
    const rules = state.notationUnknownRules && typeof state.notationUnknownRules === 'object'
      ? state.notationUnknownRules
      : {};
    const entries = Object.values(rules)
      .map((item) => ({
        term: String(item && item.term ? item.term : '').trim(),
        action: normalizeNotationUnknownRuleAction(item && item.action),
        replaceTo: canonicalizeCommandForStorage(String(item && item.replaceTo ? item.replaceTo : '').trim()),
      }))
      .filter((item) => item.term && item.action)
      .sort((a, b) => b.term.length - a.term.length);
    entries.forEach((entry) => {
      if (entry.action === 'ignore') return;
      if (entry.action === 'replace' && !entry.replaceTo) return;
      const to = entry.action === 'delete'
        ? resolveDeletionReplacement(entry.term)
        : entry.replaceTo;
      out = replaceAliasInInputText(out, entry.term, to, onReplace);
    });
    return out;
  }

  function shouldSuppressUnknownNotationTerm(term) {
    const rule = getNotationUnknownRule(term);
    if (!rule) return false;
    const action = normalizeNotationUnknownRuleAction(rule.action);
    return action === 'ignore' || action === 'delete' || action === 'replace';
  }

  function normalizeDisplayCommandInput(rawText, options = {}) {
    const useCustomDisplay = !(options && options.applyCustomDisplay === false);
    const useUnknownRules = !(options && options.applyUnknownRules === false);
    const replacementTrace = Array.isArray(options && options.replacementTrace)
      ? options.replacementTrace
      : null;
    const pushReplacementTrace = (from, to) => {
      if (!replacementTrace) return;
      const fromText = String(from || '').trim();
      const toText = canonicalizeCommandForStorage(String(to || '').trim());
      if (!fromText || !toText) return;
      if (fromText.toLowerCase() === toText.toLowerCase()) return;
      replacementTrace.push({ from: fromText, to: toText });
    };
    const traceReplace = (regex, replacer) => {
      out = out.replace(regex, (...args) => {
        const matched = String(args[0] || '');
        const replaced = String(replacer(...args) || '');
        if (replaced && replaced !== matched) {
          pushReplacementTrace(matched, replaced);
        }
        return replaced || matched;
      });
    };
    let out = String(rawText || '').replace(/\u00a0/g, ' ');
    if (useCustomDisplay) {
      out = applyCustomDisplayMappingsForInput(out);
    }
    if (useUnknownRules) {
      out = applyNotationUnknownRulesToInput(out, (from, to) => {
        pushReplacementTrace(from, to);
      });
    }
    // Treat common separators consistently before notation recovery.
    out = out
      .replace(/[，、]/g, ',')
      .replace(/\s*,\s*/g, () => {
        pushReplacementTrace(',', '>');
        return ' > ';
      })
      .replace(/\s*xx\s*/gi, ' xx ');
    const attackTokens = '(LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|Auto)';
    const jpAttackTokens = '(?:弱P|中P|強P|弱K|中K|強K|PP|KK|P|K)';
    const toUpper = (value) => String(value || '').toUpperCase();

    // Recover canonical input from st./cr. style display.
    traceReplace(new RegExp(`\\bqcfx2\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `236236${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bqcbx2\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `214214${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bqcf\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `236${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bqcb\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `214${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bhcf\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `41236${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bhcb\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `63214${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bdp\\.\\s*${attackTokens}\\b`, 'gi'), (full, atk) => (
      /^\s*DP\./.test(String(full || ''))
        ? `DP.${toUpper(atk)}`
        : `623${toUpper(atk)}`
    ));
    traceReplace(new RegExp(`\\brdp\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `421${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bdd\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `22${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bd\\/b\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `1${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bd\\/f\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `3${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bst\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => toUpper(atk));
    traceReplace(new RegExp(`\\bcr\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `2${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bf\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `6${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bb\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `4${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bj\\.\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `Jump ${toUpper(atk)}`);
    // Support compact jump notation without separators (e.g. JumpHK, JUMPHP).
    traceReplace(new RegExp(`\\bjump\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `Jump ${toUpper(atk)}`);
    // Also support + attack suffix forms commonly used in imports (qcb+hp, dp+lp, etc.).
    traceReplace(new RegExp(`\\bqcf\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `236+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bqcb\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `214+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bhcf\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `41236+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bhcb\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `63214+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bdp\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (full, atk) => (
      /^\s*DP\s*\+/.test(String(full || ''))
        ? `DP+${toUpper(atk)}`
        : `623+${toUpper(atk)}`
    ));
    traceReplace(new RegExp(`\\bsrk\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `623+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\brdp\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `421+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bdd\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `22+${toUpper(atk)}`);
    // Compound diagonals must be normalized before generic f+/b+ rules.
    traceReplace(new RegExp(`\\bd\\s*\\/\\s*f\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `3+${toUpper(atk)}`);
    traceReplace(new RegExp(`\\bd\\s*\\/\\s*b\\s*\\+\\s*${attackTokens}\\b`, 'gi'), (_, atk) => `1+${toUpper(atk)}`);
    traceReplace(/\bd\s*\/\s*f\b/gi, () => '3');
    traceReplace(/\bd\s*\/\s*b\b/gi, () => '1');
    // Numeric diagonal shorthand aliases sometimes found in imports.
    traceReplace(/\b2\s*\/\s*6\b/gi, () => '3');
    traceReplace(/\b2\s*\/\s*4\b/gi, () => '1');
    // Shorthand directional + attack forms (e.g. d+pp, f+p).
    traceReplace(/\bd\s*\+\s*/gi, () => '2+');
    traceReplace(/\bf\s*\+\s*/gi, () => '6+');
    traceReplace(/\bb\s*\+\s*/gi, () => '4+');
    traceReplace(/\bu\s*\+\s*/gi, () => '8+');
    // Common lowercase attack aliases.
    traceReplace(/\bpp\b/gi, () => 'PP');
    traceReplace(/\bkk\b/gi, () => 'KK');
    // Bare motion aliases that should normalize even without explicit attack suffix.
    traceReplace(/\bqcfx2\b/gi, () => '236236');
    traceReplace(/\bqcbx2\b/gi, () => '214214');
    // Numeric x2 aliases.
    traceReplace(/\b236x2\b/gi, () => '236236');
    traceReplace(/\b214x2\b/gi, () => '214214');
    traceReplace(/\bqcf\b/gi, () => '236');
    traceReplace(/\bqcb\b/gi, () => '214');
    traceReplace(/\bhcf\b/gi, () => '41236');
    traceReplace(/\bhcb\b/gi, () => '63214');
    traceReplace(/\bsrk\b/gi, () => '623');
    traceReplace(/\bdp\b/gi, (m) => (m === 'DP' ? 'DP' : '623'));
    traceReplace(/\brdp\b/gi, () => '421');
    traceReplace(/\bdd\b/gi, () => '22');
    traceReplace(/\bbackdash\b/gi, () => '44');
    traceReplace(/\bdash\b/gi, () => '66');
    // Single-letter direction aliases.
    traceReplace(/\bd\b/gi, () => '2');
    traceReplace(/\bf\b/gi, () => '6');
    traceReplace(/\bb\b/gi, () => '4');
    traceReplace(/\bu\b/gi, () => '8');
    traceReplace(/\bj\.(?!\s*(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)\b)/gi, () => 'Jump');
    traceReplace(/\bjump\b/gi, () => 'Jump');

    // Recover canonical input from JP words display (立/屈 style).
    const jpAttackMap = {
      '弱P': 'LP',
      '中P': 'MP',
      '強P': 'HP',
      '弱K': 'LK',
      '中K': 'MK',
      '強K': 'HK',
      PP: 'PP',
      KK: 'KK',
      P: 'P',
      K: 'K',
    };
    const replaceJpPrefix = (prefix, digit) => {
      const rx = new RegExp(`${prefix}(${jpAttackTokens})`, 'g');
      out = out.replace(rx, (_, atk) => `${digit}${jpAttackMap[atk] || atk}`);
    };
    for (let i = 0; i < 4; i += 1) {
      const before = out;
      out = out.replace(new RegExp(`(?:立|屈|前|後|J){2,}(?=${jpAttackTokens})`, 'g'), (m) => m.charAt(0));
      replaceJpPrefix('立', '');
      replaceJpPrefix('屈', '2');
      replaceJpPrefix('前', '6');
      replaceJpPrefix('後', '4');
      replaceJpPrefix('J', 'Jump ');
      if (out === before) break;
    }
    out = out.replace(/ジャンプ/g, 'Jump');

    return out;
  }

  function isCanonicalCommandLike(text) {
    const source = String(text || '').trim();
    if (!source) return true;
    const stripped = source
      .replace(/\s+/g, '')
      .replace(
        /(236236|214214|41236|63214|623|421|236|214|66|44|22|360|4\(タメ\)|2\(タメ\)|[1-9]|LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|DP|DI|DR|CR|Jump|Hold|Any|or|投げ|xx|XX|>|,|\+|-|\[|\]|\(|\)|\/)+/gi,
        '',
      );
    return stripped.length === 0;
  }

  function getCustomDisplayForLmToken(lmToken, lang) {
    const api = getNotationDictApi();
    if (!api || typeof api.getCustomDisplayForLM !== 'function') return '';
    const token = canonicalizeCommandForStorage(String(lmToken || '')).trim();
    try {
      const display = String(api.getCustomDisplayForLM(token, lang) || '').trim();
      // Guard against stale overrides that collapse utility tokens to directions.
      if (/^jump$/i.test(token) && /^[1-9]$/.test(display)) return '';
      return display;
    } catch {
      return '';
    }
  }

  function applyNotationDisplayStyleToCommand(text, style, lang = 'jp') {
    const canonical = canonicalizeCommandForStorage(normalizeDisplayCommandInput(text, { applyUnknownRules: false }));
    const mode = normalizeNotationDisplayStyle(style);
    if (!canonical) return canonical;
    let usedCustom = false;
    let out = canonical.replace(COMMAND_DISPLAY_TOKEN_REGEX, (token) => {
      const custom = getCustomDisplayForLmToken(token, lang);
      if (custom) {
        usedCustom = true;
        return custom;
      }
      if (mode === 'stcr') return mapTokenToStCrDisplay(token);
      if (mode === 'jp_words') return mapTokenToJpWordsDisplay(token);
      return token;
    });
    if (mode === 'default' && !usedCustom) return canonical;
    out = out.replace(/\bj\.\s+(LP|MP|HP|LK|MK|HK|PP|KK|P|K)\b/gi, (m, atk) => `j.${String(atk || '').toUpperCase()}`);
    out = out.replace(/ジャンプ\s*(弱P|中P|強P|弱K|中K|強K|PP|KK|P|K)/g, (_, atk) => `J${atk}`);
    return out;
  }

  function formatCommandForDisplay(text, lang, styleOverride = '') {
    const active = lang || getComboLang();
    const style = normalizeNotationDisplayStyle(styleOverride || (state && state.notationDisplayStyle));
    const styled = applyNotationDisplayStyleToCommand(text, style, active);
    return localizeCommandForDisplay(styled, active);
  }

  function getNotationDictApi() {
    return window.LMNotationDict && typeof window.LMNotationDict === 'object'
      ? window.LMNotationDict
      : null;
  }

  const CANONICAL_TOKEN_PROTECT_REGEX = /(?:236236|214214|41236|63214|623|421|236|214|66|44|22|360|4\(タメ\)|2\(タメ\)|[1-9](?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)?|(?<![A-Za-z])(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|DP|DI|DR|CR|Jump|Hold|Any|or|xx)(?![A-Za-z])|投げ|>>|>|\+|-|\/)/gi;
  const CANONICAL_ATTACK_TOKEN_REGEX = /\b(?:LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|DP|DI|DR|CR)\b/gi;
  const CANONICAL_PLACEHOLDER_REGEX = /__LMTOK_(\d+)__/g;

  function protectCanonicalTokens(text) {
    const source = String(text || '');
    const tokens = [];
    const protectedText = source.replace(CANONICAL_TOKEN_PROTECT_REGEX, (match) => {
      const id = tokens.length;
      tokens.push(match);
      return `__LMTOK_${id}__`;
    });
    return { protectedText, tokens };
  }

  function restoreCanonicalTokens(text, tokens) {
    if (!tokens || !tokens.length) return String(text || '');
    return String(text || '').replace(CANONICAL_PLACEHOLDER_REGEX, (full, idxText) => {
      const idx = Number(idxText);
      if (!Number.isFinite(idx) || idx < 0 || idx >= tokens.length) return full;
      return tokens[idx];
    });
  }

  function countCanonicalAttackTokens(text) {
    const hit = String(text || '').match(CANONICAL_ATTACK_TOKEN_REGEX);
    return hit ? hit.length : 0;
  }

  function dedupeReplacementPairs(pairs) {
    const src = Array.isArray(pairs) ? pairs : [];
    const seen = new Set();
    const out = [];
    src.forEach(pair => {
      const from = String(pair && pair.from ? pair.from : '').trim();
      const to = canonicalizeCommandForStorage(String(pair && pair.to ? pair.to : '').trim());
      if (!from || !to) return;
      if (from.toLowerCase() === to.toLowerCase()) return;
      const key = `${from.toLowerCase()}=>${to.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ from, to });
    });
    return out;
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

  function normalizeCommandWithNotation(rawText, unknownCollector = null, options = {}) {
    const api = getNotationDictApi();
    const preReplacements = dedupeReplacementPairs(options && options.preReplacements);
    let normalized = typeof (options && options.baseNormalized) === 'string'
      ? normalizeCanonicalTokenCase(canonicalizeCommandForStorage(options.baseNormalized))
      : normalizeCanonicalTokenCase(canonicalizeCommandForStorage(normalizeDisplayCommandInput(String(rawText || ''), { applyCustomDisplay: false })));
    let unknown = [];
    let replacements = preReplacements.slice();
    if (api && typeof api.normalizeCommandText === 'function') {
      const baseAttackCount = countCanonicalAttackTokens(normalized);
      const protectedState = protectCanonicalTokens(normalized);
      const result = api.normalizeCommandText(protectedState.protectedText);
      if (result && typeof result === 'object') {
        if (typeof result.normalizedText === 'string') {
          normalized = restoreCanonicalTokens(result.normalizedText, protectedState.tokens);
        }
        if (Array.isArray(result.unknown)) {
          unknown = result.unknown
            .map((term) => String(term || '').trim())
            // Drop placeholder-derived artifacts before restore.
            .filter((term) => term && !/__LMTOK_\d+__/i.test(term))
            .map((term) => restoreCanonicalTokens(term, protectedState.tokens))
            // Keep only genuinely unknown pieces (e.g. bloom), not canonical tokens.
            .filter((term) => {
              const value = String(term || '').trim();
              if (!value) return false;
              // Drop malformed aggregate artifacts (full command chunks).
              if (/[>\s,+\-\/()]/.test(value)) return false;
              return !isCanonicalCommandLike(value);
            });
        }
        if (Array.isArray(result.replacements)) {
          const notationReplacements = result.replacements
            .map((pair) => ({
              rawFrom: String(pair && pair.from ? pair.from : ''),
              rawTo: String(pair && pair.to ? pair.to : ''),
            }))
            // Drop placeholder-derived artifacts before restore.
            .filter((pair) => pair.rawFrom && pair.rawTo && !/__LMTOK_\d+__/i.test(pair.rawFrom) && !/__LMTOK_\d+__/i.test(pair.rawTo))
            .map((pair) => ({
              from: restoreCanonicalTokens(pair.rawFrom, protectedState.tokens),
              to: restoreCanonicalTokens(pair.rawTo, protectedState.tokens),
            }))
            .filter((pair) => pair.from && pair.to && !/__LMTOK_\d+__/i.test(pair.from) && !/__LMTOK_\d+__/i.test(pair.to));
          replacements = dedupeReplacementPairs([...(preReplacements || []), ...notationReplacements]);
        }
      }
      const normalizedAttackCount = countCanonicalAttackTokens(normalized);
      if (baseAttackCount > 0 && normalizedAttackCount < baseAttackCount) {
        // If dictionary replacement reduced already-canonical attack tokens, keep the protected base.
        normalized = restoreCanonicalTokens(protectedState.protectedText, protectedState.tokens);
        unknown = [];
        replacements = preReplacements.slice();
      }
    }
    if (unknown.length) {
      unknown = unknown.filter((term) => !shouldSuppressUnknownNotationTerm(term));
    }
    if (unknownCollector && unknown.length) {
      unknown.forEach((term) => unknownCollector.add(term));
    }
    return {
      canonical: normalizeCanonicalTokenCase(canonicalizeCommandForStorage(normalized)),
      unknown,
      replacements,
    };
  }

  function normalizeCommandForStorage(rawText, unknownCollector = null, options = {}) {
    const preReplacements = [];
    const base = normalizeCanonicalTokenCase(canonicalizeCommandForStorage(
      normalizeDisplayCommandInput(String(rawText || ''), {
        applyCustomDisplay: false,
        replacementTrace: preReplacements,
      }),
    ));
    const normalizedPreReplacements = dedupeReplacementPairs(preReplacements);
    const applyNotation = options && options.applyNotation === false ? false : true;
    if (!applyNotation) {
      return { canonical: base, unknown: [], replacements: normalizedPreReplacements };
    }
    if (isCanonicalCommandLike(base)) {
      return { canonical: base, unknown: [], replacements: normalizedPreReplacements };
    }
    return normalizeCommandWithNotation(rawText, unknownCollector, {
      baseNormalized: base,
      preReplacements: normalizedPreReplacements,
    });
  }

  function normalizeButtonsForStorage(rawText, unknownCollector = null, options = {}) {
    return normalizeCommandForStorage(rawText, unknownCollector, options).canonical;
  }

  function notifyNotationUnknown(terms) {
    if (!terms || !terms.size) return;
    const list = Array.from(terms).slice(0, 8);
    const suffix = terms.size > list.length ? ' ...' : '';
    showExportToast(comboMsg('import_notation_partial', { items: `${list.join(', ')}${suffix}` }), false, { dim: false });
  }

  function resetNotationImportPreview() {
    state.notationImportPreview = {
      total: 0,
      rows: [],
      importedAt: 0,
      source: '',
      mode: '',
    };
  }

  function recordNotationImportPreview(rawCommand, normalizedResult) {
    if (!state.notationImportPreview || typeof state.notationImportPreview !== 'object') {
      resetNotationImportPreview();
    }
    const preview = state.notationImportPreview;
    preview.source = 'import';
    preview.mode = '';
    const raw = String(rawCommand || '').trim();
    const canonical = String((normalizedResult && normalizedResult.canonical) || '').trim();
    if (!raw && !canonical) return;
    preview.total += 1;
    preview.importedAt = Date.now();
    if (!Array.isArray(preview.rows)) preview.rows = [];
    if (preview.rows.length >= 120) return;
    const replacements = Array.isArray(normalizedResult && normalizedResult.replacements)
      ? normalizedResult.replacements
      : [];
    const unknown = Array.isArray(normalizedResult && normalizedResult.unknown)
      ? normalizedResult.unknown
      : [];
    const replacementSummary = replacements.map((pair) => {
      if (!pair || typeof pair !== 'object') return '';
      const from = String(pair.from || '').trim();
      const to = canonicalizeCommandForStorage(String(pair.to || '').trim());
      if (!from || !to) return '';
      return `${from} -> ${to}`;
    }).filter(Boolean);
    preview.rows.push({
      index: preview.total,
      raw,
      canonical,
      replacementSummary,
      unknown,
    });
  }

  function buildNotationPreviewFromExistingCombos() {
    resetNotationImportPreview();
    state.notationImportPreview.source = 'existing';
    state.notationImportPreview.mode = state.controlMode || 'classic';
    const allCombos = Array.isArray(state.combos) ? state.combos : [];
    const combos = filterCombosByMode(allCombos, 'current');
    const unknown = new Set();
    let count = 0;
    combos.forEach((combo) => {
      const rawCommand = String(combo && combo.command ? combo.command : '').trim();
      if (!rawCommand) return;
      const normalized = normalizeCommandForStorage(rawCommand, unknown);
      recordNotationImportPreview(rawCommand, normalized);
      count += 1;
    });
    return { count, unknown };
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

  const XLSX_MAP_LAYOUT_FIELDS = [
    'command',
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
    'game_version',
    'buttons',
    'combo_notes',
    'frame_meter',
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
    damage_counter: { jp: 'カンター時', en: 'C' },
    damage_punish: { jp: 'パニカン時', en: 'PC' },
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
  const COMBO_HISTORY_LIMIT = 80;
  // Auto-lock target fields (currently only derived D Gauge efficiency).
  const AUTO_LOCK_FIELD_KEYS = ['drive_efficiency'];
  const NEGATIVE_CONVERT_FIELDS = new Set([
    'drive_delta',
    'drive_delta_opponent',
    'sa_delta',
    'sa_delta_opponent',
  ]);
  const ROW_CONTEXT_MENU_ITEMS = [
    { action: 'copy-rows', labelKey: 'context_copy_rows', group: 'clipboard' },
    { action: 'paste-rows', labelKey: 'context_paste_rows', group: 'clipboard' },
    { action: 'insert-copied-below', labelKey: 'context_insert_copied_below', group: 'clipboard' },
    { action: 'insert-rows', labelKey: 'context_insert_rows', group: 'edit' },
    { action: 'delete-rows', labelKey: 'context_delete_rows', group: 'edit' },
    { action: 'clear-rows', labelKey: 'context_clear_rows', group: 'edit' },
  ];
  const HEADER_CONTEXT_MENU_ITEMS = [
    { action: 'sort-asc', labelKey: 'context_sort_asc' },
    { action: 'sort-desc', labelKey: 'context_sort_desc' },
    { action: 'show-column', labelKey: 'context_header_show' },
    { action: 'hide-column', labelKey: 'context_header_hide' },
    { action: 'clear-values', labelKey: 'context_clear_values' },
    { action: 'to-negative', labelKey: 'context_convert_negative' },
    { action: 'open-numeric-filter', labelKey: 'context_filter_numeric' },
    { action: 'clear-filter', labelKey: 'context_clear_filter' },
  ];
  let comboIdSeed = 0;
  let rowContextMenuBound = false;
  let headerContextMenuBound = false;
  let comboGlobalShortcutsBound = false;
  let comboGridPasteBound = false;

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
    renderLimit: 0,
    hydrationPromise: null,
    hydrationQueued: false,
    hydrationSession: 0,
    warningSweepQueued: false,
    hydrationLoading: false,
    importLoading: false,
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
      headerField: '',
      headerQuery: '',
      headerValues: [],
      headerNumeric: {
        field: '',
        op: '',
        v1: '',
        v2: '',
      },
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
      sa: [],
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
    uiLayout: 'legacy',
    selectedRows: new Set(),
    rowSelectAnchor: -1,
    selectedColumns: new Set(),
    colSelectAnchor: -1,
    notationDisplayStyle: 'default',
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
    notationImportPreview: {
      total: 0,
      rows: [],
      importedAt: 0,
    },
    notationUnknownRules: {},
    notationManagerRows: [],
    xlsxMapPresets: null,
    xlsxMapModalContext: null,
    rowContextMenu: {
      open: false,
      comboId: '',
      rowIndex: -1,
      rowEl: null,
      returnFocusEl: null,
    },
    headerContextMenu: {
      open: false,
      field: '',
      filterField: '',
      label: '',
      columns: [],
      filterOptions: [],
      selectedValues: [],
      searchText: '',
      numericEnabled: false,
      numericOp: 'eq',
      numericV1: '',
      numericV2: '',
      headerEl: null,
      tableEl: null,
      returnFocusEl: null,
    },
    comboClipboard: null,
    historyApplying: false,
    undoStack: [],
    redoStack: [],
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
  const PERF_ENABLED = (() => {
    try {
      const params = new URLSearchParams(window.location.search || '');
      if (params.get('perf') === '1') return true;
      return localStorage.getItem('lm_perf') === '1';
    } catch {
      return false;
    }
  })();

  const qs = (id) => document.getElementById(id);

  function createPerfLogger(scope) {
    if (!PERF_ENABLED || typeof performance === 'undefined') return () => { };
    const start = performance.now();
    let last = start;
    return (label) => {
      const now = performance.now();
      const delta = (now - last).toFixed(1);
      const total = (now - start).toFixed(1);
      // eslint-disable-next-line no-console
      console.info(`[LM PERF:${scope}] ${label} +${delta}ms (total ${total}ms)`);
      last = now;
    };
  }

  // Render full dataset so search/filter always apply to all combos.
  const GROUP_BUILD_CHUNK = 32;
  const TABLE_APPLY_CHUNK = 64;
  const CHUNKED_APPLY_THRESHOLD = 180;
  const WARNING_SWEEP_THRESHOLD = 320;
  const WARNING_SWEEP_CHUNK = 140;
  const FAST_BOOT_THRESHOLD = 320;
  const FAST_BOOT_ROWS = 160;
  const BACKGROUND_HYDRATE_STEP = 220;

  function yieldToBrowser() {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(() => resolve());
        return;
      }
      window.setTimeout(resolve, 0);
    });
  }

  function resetRenderLimitForCurrentData() {
    const total = Array.isArray(state.combos) ? state.combos.length : 0;
    state.renderLimit = total;
  }

  function getRenderTargetCount() {
    const total = Array.isArray(state.combos) ? state.combos.length : 0;
    return total > 0 ? total : 0;
  }

  function getFastBootTarget(total) {
    const count = Math.max(0, Number(total) || 0);
    if (count <= FAST_BOOT_THRESHOLD) return count;
    return Math.min(FAST_BOOT_ROWS, count);
  }

  function resetHydrationState() {
    state.hydrationSession = (Number(state.hydrationSession) || 0) + 1;
    state.hydrationPromise = null;
    state.hydrationQueued = false;
    state.warningSweepQueued = false;
    updateHydrationStatusUi(false);
  }

  function createComboId() {
    comboIdSeed += 1;
    return `cmb_${Date.now().toString(36)}_${comboIdSeed.toString(36)}`;
  }

  function normalizeComboAutoLocks(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const out = {};
    AUTO_LOCK_FIELD_KEYS.forEach((field) => {
      out[field] = source[field] === true;
    });
    return out;
  }

  function ensureComboIdentity(combo) {
    if (!combo || typeof combo !== 'object') return '';
    if (!String(combo._id || '').trim()) {
      combo._id = createComboId();
    }
    combo._autoLocks = normalizeComboAutoLocks(combo._autoLocks);
    return combo._id;
  }

  function getComboIndexById(comboId) {
    const target = String(comboId || '').trim();
    if (!target) return -1;
    for (let i = 0; i < state.combos.length; i += 1) {
      const combo = state.combos[i];
      if (!combo) continue;
      if (String(combo._id || '') === target) return i;
    }
    return -1;
  }

  function getGroupIndexFromRow(row) {
    if (!row) return -1;
    const fromDataset = Number(row.dataset && row.dataset.row != null ? row.dataset.row : NaN);
    if (Number.isFinite(fromDataset) && fromDataset >= 0) return fromDataset;
    return state.groups.findIndex((group) => group && Array.isArray(group.rowList) && group.rowList.includes(row));
  }

  function queueCommandWarningSweep() {
    if (state.warningSweepQueued) return;
    state.warningSweepQueued = true;
    const session = state.hydrationSession;
    window.setTimeout(async () => {
      if (session !== state.hydrationSession) {
        state.warningSweepQueued = false;
        return;
      }
      const total = state.groups.length;
      if (!total) {
        state.warningSweepQueued = false;
        return;
      }
      const step = Math.max(1, Number(WARNING_SWEEP_CHUNK) || 140);
      for (let i = 0; i < total; i += step) {
        if (session !== state.hydrationSession) {
          state.warningSweepQueued = false;
          return;
        }
        const end = Math.min(total, i + step);
        for (let j = i; j < end; j += 1) {
          const group = state.groups[j];
          if (!group) continue;
          refreshCommandWarning(group.index);
        }
        if (end < total) await yieldToBrowser();
      }
      state.warningSweepQueued = false;
    }, 0);
  }

  async function hydrateGroupsToTarget(targetCount, options = {}) {
    const count = Math.max(0, Number(targetCount) || 0);
    if (!count || state.groups.length >= count) {
      updateHydrationStatusUi(false);
      return;
    }
    updateHydrationStatusUi(true);
    if (state.hydrationPromise) {
      await state.hydrationPromise;
      if (state.groups.length >= count) return;
    }
    const session = state.hydrationSession;
    const stepSize = Math.max(1, Number(options.stepSize) || BACKGROUND_HYDRATE_STEP);
    const promise = (async () => {
      while (state.groups.length < count) {
        if (session !== state.hydrationSession) return;
        const start = state.groups.length;
        const next = Math.min(count, start + stepSize);
        await ensureGroupCountChunked(next, GROUP_BUILD_CHUNK);
        if (session !== state.hydrationSession) return;
        if (next > start) {
          if (next > CHUNKED_APPLY_THRESHOLD) {
            await applyStateToTableChunked(TABLE_APPLY_CHUNK, null, start, next);
          } else {
            applyStateToTable({ rangeStart: start, rangeEnd: next, finalize: true });
          }
        }
        if (session !== state.hydrationSession) return;
        await yieldToBrowser();
      }
    })();
    state.hydrationPromise = promise;
    try {
      await promise;
    } finally {
      if (state.hydrationPromise === promise) state.hydrationPromise = null;
      if (session === state.hydrationSession && !state.hydrationPromise && !state.hydrationQueued) {
        updateHydrationStatusUi(false);
      }
    }
    if (session !== state.hydrationSession) return;
    if (options.reapplyFilters !== false) applyFilters();
  }

  function queueBackgroundHydrationToFull() {
    const total = Array.isArray(state.combos) ? state.combos.length : 0;
    if (!total || state.groups.length >= total) return;
    if (state.hydrationQueued || state.hydrationPromise) return;
    const session = state.hydrationSession;
    state.hydrationQueued = true;
    updateHydrationStatusUi(true);
    window.setTimeout(() => {
      state.hydrationQueued = false;
      if (session !== state.hydrationSession) return;
      void hydrateGroupsToTarget(total, { reapplyFilters: true });
    }, 0);
  }

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

  function ensureHydrationStatusUi() {
    if (ui.hydrationStatus) return;
    const host = ui.comboView || qs('comboView');
    if (!host) return;
    let el = qs('comboLoadingStatus');
    if (!el) {
      el = document.createElement('div');
      el.id = 'comboLoadingStatus';
      el.className = 'combo-loading-status hidden';
      el.setAttribute('aria-live', 'polite');
      el.textContent = 'Loading...';
      host.appendChild(el);
    }
    ui.hydrationStatus = el;
  }

  function positionHydrationStatusUi() {
    ensureHydrationStatusUi();
    if (!ui.hydrationStatus) return;
    const tableScroll = qs('comboTableScroll');
    if (tableScroll && tableScroll.parentElement) {
      const centerX = tableScroll.offsetLeft + (tableScroll.clientWidth / 2);
      const centerY = tableScroll.offsetTop + (tableScroll.clientHeight / 2);
      ui.hydrationStatus.style.left = `${Math.round(centerX)}px`;
      ui.hydrationStatus.style.top = `${Math.round(centerY)}px`;
      return;
    }
    ui.hydrationStatus.style.left = '50%';
    ui.hydrationStatus.style.top = '50%';
  }

  function syncLoadingStatusUi() {
    ensureHydrationStatusUi();
    if (!ui.hydrationStatus) return;
    const loading = !!state.importLoading || !!state.hydrationLoading;
    if (loading) {
      positionHydrationStatusUi();
      ui.hydrationStatus.textContent = 'Loading...';
      ui.hydrationStatus.classList.remove('hidden');
      return;
    }
    ui.hydrationStatus.classList.add('hidden');
  }

  function setImportLoadingUi(loading) {
    state.importLoading = !!loading;
    syncLoadingStatusUi();
  }

  function updateHydrationStatusUi(loading) {
    state.hydrationLoading = !!loading;
    syncLoadingStatusUi();
  }

  function refreshCommandDisplayOnly() {
    const active = getComboLang();
    state.groups.forEach((group) => {
      const commandInput = group && group.inputs ? group.inputs.command : null;
      if (!commandInput || !commandInput.classList || !commandInput.classList.contains('cmd-input')) return;
      const combo = state.combos[group.index] || defaultCombo();
      commandInput.textContent = formatCommandForDisplay(combo.command || '', active);
    });
  }

  function ensureNotationDisplayControl() {
    // Display style selector has been retired. Keep canonical/buttons display only.
    const legacy = qs('comboNotationStyleSelect');
    if (legacy && legacy.parentElement) legacy.parentElement.removeChild(legacy);
    ui.notationStyleSelect = null;
    state.notationDisplayStyle = 'default';
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

  async function init() {
    const perfMark = createPerfLogger('init');
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
    ui.notationStyleSelect = null;
    ui.exportMenu = qs('comboExportMenu');
    ui.exportWrapper = qs('comboExportWrapper');
    ui.saveStatus = qs('comboSaveStatus');
    ui.hydrationStatus = qs('comboLoadingStatus');
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
    ensureHydrationStatusUi();
    ensureNotationDisplayControl();
    ensureGameVersionUi();
    ensureGlobalLayoutControl();
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
    perfMark('base table prep');
    buildGroups();
    perfMark('buildGroups');
    buildInputs();
    perfMark('buildInputs');
    initSortHeaders();
    bindComboHeaderContextMenu(ui.table);
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
    perfMark('cleanupStorageBuckets');
    resetHydrationState();
    loadState();
    perfMark('loadState');
    loadUiPrefs();
    setUiLayoutMode(state.uiLayout, { save: false });
    loadNotationUnknownRules();
    ensureSampleCombo();
    syncFirstRowSampleForCurrentMode();
    perfMark('load prefs/sample');
    resetRenderLimitForCurrentData();
    const fullTarget = getRenderTargetCount();
    const initialTarget = getFastBootTarget(fullTarget);
    trimGroupCount(initialTarget);
    if (initialTarget > CHUNKED_APPLY_THRESHOLD) {
      await ensureGroupCountChunked(initialTarget, GROUP_BUILD_CHUNK, perfMark);
    } else {
      ensureGroupCount(initialTarget);
    }
    perfMark(`ensureGroupCount (${initialTarget}/${state.combos.length} combos)`);
    if (state.groups.length > CHUNKED_APPLY_THRESHOLD) {
      await applyStateToTableChunked(TABLE_APPLY_CHUNK, perfMark);
    } else {
      applyStateToTable();
    }
    perfMark('applyStateToTable');
    bindEvents();
    bindRowToggles();
    bindCrudButtons();
    ensureColumnPresetControls();
    applyColumnPreset(state.columnPreset);
    applyFilters();
    perfMark('applyFilters');
    ensureTableScrollContainer();
    initComboDragScroll();
    layoutInputButtons();
    layoutHeaderActions();
    perfMark('layout');
    ensureLoadMoreControl();
    updateLoadMoreControl();
    bindComboTabSizing();
    setControlMode(state.controlMode || 'classic');
    perfMark('setControlMode');
    updateGamepadPolling();
    applyComboLanguage(getComboLang());
    queueBackgroundHydrationToFull();
    perfMark(`done (groups=${state.groups.length})`);
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
    state.combos = groups.map((_, idx) => (idx === 0 ? buildDefaultFirstCombo() : defaultCombo()));
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
      if (cell.tabIndex < 0) cell.tabIndex = 0;
      cell.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        handleColumnSelectionRequest(cell, ev);
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
    if (!field || !state.combos.length) return;
    const dir = direction || 1;
    const currentSelectedCombo = Number.isFinite(state.selectedGroup)
      ? state.combos[state.selectedGroup]
      : null;
    const sorted = state.combos.map((combo, idx) => ({
      combo: state.combos[idx] || defaultCombo(),
      originalIndex: idx,
    }));

    sorted.sort((a, b) => {
      const result = compareComboField(a.combo, b.combo, field);
      if (result !== 0) return result * dir;
      return (a.originalIndex - b.originalIndex) * dir;
    });

    state.combos = sorted.map((item) => item.combo);

    state.groups.forEach((group, idx) => {
      group.index = idx;
      const isEven = idx % 2 === 0;
      group.rowList.forEach((row) => {
        row.dataset.row = String(idx);
        row.classList.toggle('combo-group-even', isEven);
        row.classList.toggle('combo-group-odd', !isEven);
        row.classList.toggle('selected', false);
      });
      Object.values(group.inputs).forEach((input) => {
        if (input && input.dataset) input.dataset.row = String(idx);
      });
    });

    applyStateToTable({ rangeStart: 0, rangeEnd: state.groups.length, finalize: true });
    applyFilters();

    if (currentSelectedCombo) {
      const newIndex = state.combos.findIndex((combo) => combo === currentSelectedCombo);
      if (newIndex >= 0 && newIndex < state.groups.length) {
        state.selectedGroup = newIndex;
        setSelectedGroup(newIndex, { scroll: false });
      } else {
        state.selectedGroup = -1;
        setSelectedGroup(-1, { scroll: false });
      }
    } else {
      state.selectedGroup = -1;
      setSelectedGroup(-1, { scroll: false });
    }

    state.sort.field = field;
    state.sort.direction = dir;
    updateSortIndicators();
    updateLoadMoreControl();
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
        control = buildSpecialConditionTableControl(group);
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
    refreshSelectedHeaderColumns();
  }

  function bindComboHeaderSort() {
    if (!ui.headerTable || ui.headerTable.dataset.sortBound === 'true') return;
    ui.headerTable.addEventListener('click', (ev) => {
      const cell = ev.target.closest('.combo-sortable');
      if (!cell) return;
      ev.preventDefault();
      ev.stopPropagation();
      handleColumnSelectionRequest(cell, ev);
    });
    ui.headerTable.dataset.sortBound = 'true';
    bindComboHeaderContextMenu(ui.headerTable);
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
    // Keep the row-toggle guide button pinned to the right of column preset buttons
    // regardless of which tutorial flow it opens.
    const tableGuideTrigger = rowToggles.querySelector('.tutorial-flow-trigger');
    let controls = qs('comboColumnControls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'comboColumnControls';
      controls.className = 'combo-col-controls';
      rowToggles.appendChild(controls);
    }
    if (controls.dataset.built === 'true') {
      if (tableGuideTrigger && tableGuideTrigger.parentElement === rowToggles) {
        rowToggles.appendChild(tableGuideTrigger);
      }
      return;
    }
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
    if (tableGuideTrigger && tableGuideTrigger.parentElement === rowToggles) {
      rowToggles.appendChild(tableGuideTrigger);
    }
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

  function setUiLayoutMode(mode, options = {}) {
    const next = normalizeUiLayoutMode(mode);
    state.uiLayout = next;
    if (ui.comboView) {
      ui.comboView.dataset.layout = next;
    }
    updateUiLayoutControls();
    if (!options || options.save !== false) {
      saveUiPrefs();
    }
  }

  function updateUiLayoutControls(lang) {
    const root = qs('comboLayoutGlobal');
    // Layout toggle is intentionally removed for now.
    if (root && root.parentElement) root.parentElement.removeChild(root);
  }

  function ensureGlobalLayoutControl() {
    // Layout toggle is intentionally removed for now.
    const root = qs('comboLayoutGlobal');
    if (root && root.parentElement) root.parentElement.removeChild(root);
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
    ensureRangeCategoryLayout(panel);
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
      sa: comboT('filter.sa', active),
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
        else if (text.toLowerCase() === 'sa') label.dataset.i18nKey = 'sa';
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

    refreshSaFilterGroup(panel, active);
    refreshSpecialConditionFilterGroup(panel, active);
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
    panel.querySelectorAll('[data-range-section]').forEach((th) => {
      const key = th.dataset.rangeSection;
      if (!key) return;
      const text = comboT(`filter.range_group_${key}`, active);
      if (text) th.textContent = text;
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
        if (field === 'special_condition') return;
        Array.from(select.options).forEach((option) => {
          const label = getSelectOptionLabel(field, option.value, active);
          if (label != null) option.textContent = label;
        });
      });
    }
    if (ui.headerTable) {
      ui.headerTable.querySelectorAll('select[data-field]').forEach((select) => {
        const field = select.dataset.field;
        if (field === 'special_condition') return;
        Array.from(select.options).forEach((option) => {
          const label = getSelectOptionLabel(field, option.value, active);
          if (label != null) option.textContent = label;
        });
      });
    }
    refreshSpecialConditionTableInputs(active);
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
      const cancelBtn = keymap.querySelector('.combo-keymap-actions button[data-action="close"]');
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

    const importTargetModal = qs('comboImportTargetModal');
    if (importTargetModal) {
      const labels = importTargetModal.querySelectorAll('[data-import-target-label]');
      labels.forEach((el) => {
        const key = el.dataset.importTargetLabel || '';
        const text = comboT(`ui.${key}`, active);
        if (text) el.textContent = text;
      });
      const xlsxLabels = importTargetModal.querySelectorAll('[data-xlsx-label]');
      xlsxLabels.forEach((el) => {
        const key = el.dataset.xlsxLabel || '';
        const text = comboT(`ui.${key}`, active);
        if (text) el.textContent = text;
      });
      const applyBtn = importTargetModal.querySelector('button[data-action="apply"]');
      if (applyBtn) applyBtn.textContent = comboT('ui.import_target_apply', active) || applyBtn.textContent;
      const cancelBtn = importTargetModal.querySelector('button[data-action="cancel"]');
      if (cancelBtn) cancelBtn.textContent = comboT('ui.import_target_cancel', active) || cancelBtn.textContent;
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
      const displayLmInput = notationModal.querySelector('#comboNotationDisplayLmInput');
      if (displayLmInput) displayLmInput.placeholder = comboT('ui.notation_display_lm', active) || displayLmInput.placeholder;
      const displayJpInput = notationModal.querySelector('#comboNotationDisplayJpInput');
      if (displayJpInput) displayJpInput.placeholder = comboT('ui.notation_display_jp', active) || displayJpInput.placeholder;
      const displayEnInput = notationModal.querySelector('#comboNotationDisplayEnInput');
      if (displayEnInput) displayEnInput.placeholder = comboT('ui.notation_display_en', active) || displayEnInput.placeholder;
      const setDisplayBtn = notationModal.querySelector('button[data-action="set-display"]');
      if (setDisplayBtn) setDisplayBtn.textContent = comboT('ui.notation_display_set', active) || setDisplayBtn.textContent;
      const clearDisplayBtn = notationModal.querySelector('button[data-action="clear-display"]');
      if (clearDisplayBtn) clearDisplayBtn.textContent = comboT('ui.notation_display_clear', active) || clearDisplayBtn.textContent;
      const testInput = notationModal.querySelector('#comboNotationTestInput');
      if (testInput) testInput.placeholder = comboT('ui.notation_test_placeholder', active) || testInput.placeholder;
      const labels = notationModal.querySelectorAll('[data-notation-label]');
      labels.forEach((el) => {
        const key = el.dataset.notationLabel || '';
        const text = comboT(`ui.${key}`, active);
        if (text) el.textContent = text;
      });
      renderNotationMappingRows();
      renderNotationManagerRows();
      renderNotationDisplayRows();
      renderNotationImportPreviewRows();
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
      const notationLabels = xlsxModal.querySelectorAll('[data-notation-label]');
      notationLabels.forEach((el) => {
        const key = el.dataset.notationLabel || '';
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
        renderXlsxMapUnknownManage(xlsxModal);
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
    refreshRowContextMenuLabels();
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
        commandInput.textContent = formatCommandForDisplay(combo.command || '', active);
        refreshCommandWarning(group.index);
      }
      if (notesInput && Object.prototype.hasOwnProperty.call(notesInput, 'value')) {
        notesInput.value = combo.combo_notes || '';
        if (notesInput.tagName === 'TEXTAREA') autoResizeNotesInput(notesInput);
      }
    });
    applyUiButtonLayout();
    applyKeymapToButtons();
    if (qs('comboKeymapGrid')) renderKeymapGrid();
    const bottomToggle = qs('comboBottomToggle');
    if (bottomToggle) updateBottomToggleState(bottomToggle);
    updateSaveStatusUI(state.isDirty, !!state.recoverySource);
  }

  function applySampleComboLocalization(lang) {
    const active = lang || getComboLang();
    const sampleCommands = new Set([
      canonicalizeCommandForStorage('Jump H > H > 236L'),
      canonicalizeCommandForStorage('Jump HP > HP > 236LP'),
    ]);
    const jpSampleNotes = comboT('sample_notes', 'jp') || '基本コンボ';
    const enSampleNotes = comboT('sample_notes', 'en') || 'Basic Combo';
    let changed = false;

    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      const command = canonicalizeCommandForStorage(combo.command || '');
      const buttons = canonicalizeCommandForStorage(combo.buttons || '');
      const notes = String(combo.combo_notes || '').trim();
      const isSampleRoute = sampleCommands.has(command) && (!buttons || buttons === command);
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
    const sampleCommand = getSampleCommandForMode();
    const combo = {
      _id: '',
      _autoLocks: {},
      command: useSample ? sampleCommand : '',
      buttons: useSample ? sampleCommand : '',
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

  function getEffectiveControlModeForSample(mode) {
    const current = canonicalControlMode(mode || state.controlMode || '');
    if (current === 'classic' || current === 'modern') return current;
    const persisted = canonicalControlMode(loadPersistedComboControlMode());
    return persisted === 'modern' ? 'modern' : 'classic';
  }

  function getSampleCommandForMode(mode) {
    const activeMode = getEffectiveControlModeForSample(mode);
    return activeMode === 'modern'
      ? 'Jump H > H > 236L'
      : 'Jump HP > HP > 236LP';
  }

  function isBlankComboRowForSample(combo) {
    if (!combo || typeof combo !== 'object') return true;
    const coreFields = ['command', 'buttons', 'combo_notes'];
    const extraFields = ['frame_meter', 'game_version', ...FIELD_ORDER];
    const hasCore = coreFields.some((field) => String(combo[field] || '').trim().length > 0);
    const hasExtra = extraFields.some((field) => String(combo[field] || '').trim().length > 0);
    return !hasCore && !hasExtra;
  }

  function hasSelectedCharacterForCombos() {
    return !!resolveCharacterSlug(state.currentCharacter || getCharacterSlugFromUi());
  }

  function shouldUseSampleComboForFirstRow() {
    return hasSelectedCharacterForCombos();
  }

  function buildDefaultFirstCombo() {
    return defaultCombo(shouldUseSampleComboForFirstRow());
  }

  function isDefaultSampleCombo(combo) {
    if (!combo || typeof combo !== 'object') return false;
    if (combo._manual) return false;
    const sampleCommands = new Set([
      canonicalizeCommandForStorage('Jump H > H > 236L'),
      canonicalizeCommandForStorage('Jump HP > HP > 236LP'),
    ]);
    const command = canonicalizeCommandForStorage(combo.command || '');
    const buttons = canonicalizeCommandForStorage(combo.buttons || '');
    if (!sampleCommands.has(command)) return false;
    if (buttons && buttons !== command) return false;
    const notes = String(combo.combo_notes || '').trim();
    const jpSampleNotes = comboT('sample_notes', 'jp') || '基本コンボ';
    const enSampleNotes = comboT('sample_notes', 'en') || 'Basic Combo';
    if (notes && notes !== jpSampleNotes && notes !== enSampleNotes) return false;
    const extraFields = ['frame_meter', 'game_version', ...FIELD_ORDER];
    return !extraFields.some((field) => String(combo[field] || '').trim().length > 0);
  }

  function syncFirstRowSampleForCurrentMode() {
    if (!Array.isArray(state.combos) || !state.combos.length) return false;
    const first = state.combos[0] || defaultCombo();
    if (!shouldUseSampleComboForFirstRow()) {
      if (isDefaultSampleCombo(first)) {
        state.combos[0] = defaultCombo();
        return true;
      }
      return false;
    }
    const shouldReplace = isBlankComboRowForSample(first) || isDefaultSampleCombo(first);
    if (!shouldReplace) return false;
    const sample = defaultCombo(true);
    state.combos[0] = { ...defaultCombo(), ...sample };
    return true;
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
    const parserUnknown = collectButtonParseUnknowns(normalized);
    if (parserUnknown.length) {
      warnings.push(comboMsg('warn_unknown_notation', { value: parserUnknown.join(' | ') }));
      return warnings;
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
      state.combos = [buildDefaultFirstCombo()];
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
      state.combos[0] = { ...defaultCombo(), ...buildDefaultFirstCombo() };
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
      ensureComboIdentity(merged);
      merged.command = canonicalizeCommandForStorage(normalizeDisplayCommandInput(merged.command || '', { applyUnknownRules: false }));
      if (merged.buttons) merged.buttons = canonicalizeCommandForStorage(normalizeDisplayCommandInput(merged.buttons, { applyUnknownRules: false }));
      ensureComboControlMode(merged, fallbackMode);
      return merged;
    });
    const hasComboData = (combo) => {
      if (!combo) return false;
      if (!shouldUseSampleComboForFirstRow() && isDefaultSampleCombo(combo)) return false;
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
    if (lastDataIndex < 0) return [buildDefaultFirstCombo()];
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

  function hasImportableCommandText(value) {
    const canonical = normalizeCanonicalTokenCase(canonicalizeCommandForStorage(String(value || '').trim()));
    if (!canonical) return false;
    const compact = canonical
      .replace(/[\s\u00a0\u3000]/g, '')
      .replace(/[-‐‑‒–—―ー_~〜～・･,，.。/\\|]/g, '');
    if (!compact) return false;
    if (/^(?:n\/?a|none|null)$/i.test(compact)) return false;
    // Require at least one meaningful command token. This avoids importing
    // separator-only/noise rows as blank combos.
    return /(236236|214214|41236|63214|623|421|236|214|66|44|22|360|4\(タメ\)|2\(タメ\)|[1-9](?:LP|MP|HP|LK|MK|HK|PP|KK|P|K)?|LP|MP|HP|LK|MK|HK|PP|KK|P|K|L|M|H|SP|AUTO|DP|DI|DR|CR|投げ)/i.test(canonical);
  }

  function normalizeImportedCombos(combos, unknownCollector = null, previewRecorder = null) {
    if (!Array.isArray(combos)) return [];
    const normalized = [];
    combos.forEach((combo) => {
      const merged = { ...defaultCombo(), ...(combo || {}) };
      ensureComboIdentity(merged);
      const rawCommand = String(merged.command || '');
      const normalizedCommand = normalizeCommandForStorage(merged.command || '', unknownCollector);
      merged.command = normalizedCommand.canonical;
      if (!hasImportableCommandText(merged.command)) return;
      if (typeof previewRecorder === 'function') {
        previewRecorder(rawCommand, normalizedCommand);
      }
      if (String(merged.buttons || '').trim()) {
        merged.buttons = normalizeButtonsForStorage(merged.buttons || '', unknownCollector);
      } else {
        merged.buttons = merged.command;
      }
      ensureComboControlMode(merged);
      normalized.push(merged);
    });
    return normalized;
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
          state.combos = state.groups.map((_, idx) => (idx === 0 ? buildDefaultFirstCombo() : defaultCombo()));
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

      state.notationDisplayStyle = normalizeNotationDisplayStyle(parsed.notationDisplayStyle);
      // Keep legacy layout as default until desktop/classic UI switching is reintroduced.
      state.uiLayout = 'legacy';

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
        notationDisplayStyle: normalizeNotationDisplayStyle(state.notationDisplayStyle),
        uiLayout: normalizeUiLayoutMode(state.uiLayout),
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

  function cloneCombosForHistory(combos) {
    try {
      return JSON.parse(JSON.stringify(Array.isArray(combos) ? combos : []));
    } catch {
      return (Array.isArray(combos) ? combos : []).map((combo) => ({ ...defaultCombo(), ...(combo || {}) }));
    }
  }

  function captureComboHistorySnapshot() {
    return {
      slug: state.currentCharacter || getCharacterSlugFromUi(),
      combos: cloneCombosForHistory(state.combos),
      selectedGroup: Number.isFinite(state.selectedGroup) ? Number(state.selectedGroup) : -1,
      selectedRows: getSelectedRowIndexes(),
    };
  }

  function sameHistorySnapshot(a, b) {
    if (!a || !b) return false;
    if (String(a.slug || '') !== String(b.slug || '')) return false;
    if (Number(a.selectedGroup) !== Number(b.selectedGroup)) return false;
    const rowsA = Array.isArray(a.selectedRows) ? a.selectedRows : [];
    const rowsB = Array.isArray(b.selectedRows) ? b.selectedRows : [];
    if (rowsA.length !== rowsB.length) return false;
    for (let i = 0; i < rowsA.length; i += 1) {
      if (Number(rowsA[i]) !== Number(rowsB[i])) return false;
    }
    try {
      return JSON.stringify(a.combos || []) === JSON.stringify(b.combos || []);
    } catch {
      return false;
    }
  }

  function pushUndoHistory(reason = 'edit') {
    void reason;
    if (state.historyApplying) return;
    const snapshot = captureComboHistorySnapshot();
    const top = state.undoStack.length ? state.undoStack[state.undoStack.length - 1] : null;
    if (top && sameHistorySnapshot(top, snapshot)) return;
    state.undoStack.push(snapshot);
    if (state.undoStack.length > COMBO_HISTORY_LIMIT) {
      state.undoStack.splice(0, state.undoStack.length - COMBO_HISTORY_LIMIT);
    }
    state.redoStack = [];
  }

  function applyComboHistorySnapshot(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.combos)) return false;
    const slug = state.currentCharacter || getCharacterSlugFromUi();
    if (String(snapshot.slug || '') !== String(slug || '')) return false;
    state.historyApplying = true;
    try {
      state.combos = normalizeStoredCombos(cloneCombosForHistory(snapshot.combos), {
        fallbackMode: state.controlMode,
      });
      resetRenderLimitForCurrentData();
      const renderTarget = getRenderTargetCount();
      trimGroupCount(renderTarget);
      ensureGroupCount(renderTarget);
      while (state.combos.length < state.groups.length) {
        state.combos.push(defaultCombo());
      }
      persist();
      applyStateToTable();
      updateEmptyGroups();
      applyFilters();
      updateLoadMoreControl();
      const rows = normalizeRowIndexes(Array.isArray(snapshot.selectedRows) ? snapshot.selectedRows : []);
      if (rows.length) {
        const active = rows.includes(Number(snapshot.selectedGroup))
          ? Number(snapshot.selectedGroup)
          : rows[rows.length - 1];
        setSelectedRows(rows, { scroll: false, activeIndex: active, anchorIndex: active });
      } else {
        const idx = Number(snapshot.selectedGroup);
        if (Number.isFinite(idx) && idx >= 0) setSelectedGroup(idx, { scroll: false });
        else setSelectedRows([], { scroll: false });
      }
      return true;
    } finally {
      state.historyApplying = false;
    }
  }

  function popHistorySnapshotForCurrentSlug(stack) {
    const slug = String(state.currentCharacter || getCharacterSlugFromUi() || '');
    if (!Array.isArray(stack) || !stack.length) return null;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const item = stack[i];
      if (String(item && item.slug ? item.slug : '') !== slug) continue;
      stack.splice(i, 1);
      return item;
    }
    return null;
  }

  function undoComboHistory() {
    const target = popHistorySnapshotForCurrentSlug(state.undoStack);
    if (!target) return false;
    const current = captureComboHistorySnapshot();
    state.redoStack.push(current);
    if (state.redoStack.length > COMBO_HISTORY_LIMIT) {
      state.redoStack.splice(0, state.redoStack.length - COMBO_HISTORY_LIMIT);
    }
    return applyComboHistorySnapshot(target);
  }

  function redoComboHistory() {
    const target = popHistorySnapshotForCurrentSlug(state.redoStack);
    if (!target) return false;
    const current = captureComboHistorySnapshot();
    state.undoStack.push(current);
    if (state.undoStack.length > COMBO_HISTORY_LIMIT) {
      state.undoStack.splice(0, state.undoStack.length - COMBO_HISTORY_LIMIT);
    }
    return applyComboHistorySnapshot(target);
  }

  function finalizeApplyStateToTable(skipWarningSweep) {
    if (skipWarningSweep) {
      const idx = Number(state.selectedGroup);
      if (Number.isFinite(idx) && idx >= 0) refreshCommandWarning(idx);
      else if (state.groups.length) refreshCommandWarning(0);
      queueCommandWarningSweep();
    }
    updateEmptyGroups();
    applyCommandFontSize();
  }

  function applyStateToTable(options = {}) {
    const opts = options || {};
    const start = Math.max(0, Number(opts.rangeStart) || 0);
    const end = Math.min(
      state.groups.length,
      Number.isFinite(Number(opts.rangeEnd)) ? Number(opts.rangeEnd) : state.groups.length,
    );
    const finalize = opts.finalize !== false;
    const skipWarningSweep = state.groups.length > WARNING_SWEEP_THRESHOLD;
    for (let i = start; i < end; i += 1) {
      const group = state.groups[i];
      const combo = state.combos[group.index] || defaultCombo();
      const comboId = ensureComboIdentity(combo);
      state.combos[group.index] = combo;
      // Row-scoped actions use this stable identifier so operations target the
      // correct combo even after sort/filter/re-render.
      group.rowList.forEach((rowEl) => {
        if (!rowEl || !rowEl.dataset) return;
        rowEl.dataset.comboId = comboId;
        rowEl.dataset.row = String(group.index);
        rowEl.tabIndex = -1;
      });
      syncDerivedComboFields(combo);
      if (combo && typeof combo.command === 'string') {
        const canonical = canonicalizeCommandForStorage(normalizeDisplayCommandInput(combo.command, { applyUnknownRules: false }));
        if (canonical !== combo.command) {
          combo.command = canonical;
          if (!combo.buttons || canonicalizeCommandForStorage(normalizeDisplayCommandInput(combo.buttons, { applyUnknownRules: false })) === combo.command) {
            combo.buttons = canonical;
          }
        }
      }
      Object.keys(group.inputs).forEach((field) => {
        const input = group.inputs[field];
        if (!input) return;
        if (input.tagName === 'SELECT') {
          if (field === 'special_condition') {
            setSpecialConditionSelectOptions(input, getSpecialConditionOptions(getComboLang()), combo[field] || '');
          } else {
            input.value = combo[field] || '';
          }
        } else if (input.classList.contains('cmd-input')) {
          if (field === 'buttons') {
            renderButtonsInput(input, combo[field] || '');
          } else {
            if (field === 'command') {
              input.textContent = formatCommandForDisplay(combo[field] || '', getComboLang());
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
          const noteText = String(combo[field] || '');
          if (noteText.includes('\n') || noteText.length > 48) {
            autoResizeNotesInput(input);
          } else {
            input.style.height = '18px';
          }
        }
        const locked = isComboFieldLocked(combo, field);
        input.classList.toggle('combo-input-locked', locked);
        const cell = input.closest('td,th');
        setLockBadgeForCell(cell, locked);
      });
      if (!skipWarningSweep) refreshCommandWarning(group.index);
    }
    if (finalize) finalizeApplyStateToTable(skipWarningSweep);
  }

  async function ensureGroupCountChunked(targetCount, chunkSize = GROUP_BUILD_CHUNK, perfMark = null) {
    const count = Math.max(0, Number(targetCount) || 0);
    while (state.groups.length < count) {
      const limit = Math.min(count, state.groups.length + Math.max(1, Number(chunkSize) || GROUP_BUILD_CHUNK));
      while (state.groups.length < limit) {
        const idx = appendEmptyGroup();
        if (idx == null) break;
      }
      if (typeof perfMark === 'function') perfMark(`ensureGroupCount chunk (${state.groups.length}/${count})`);
      if (state.groups.length < count) await yieldToBrowser();
    }
  }

  async function applyStateToTableChunked(chunkSize = TABLE_APPLY_CHUNK, perfMark = null, rangeStart = 0, rangeEnd = null) {
    const total = state.groups.length;
    const startAt = Math.max(0, Number(rangeStart) || 0);
    const endAt = Math.min(total, rangeEnd == null ? total : Number(rangeEnd));
    const size = Math.max(1, Number(chunkSize) || TABLE_APPLY_CHUNK);
    for (let start = startAt; start < endAt; start += size) {
      const end = Math.min(endAt, start + size);
      applyStateToTable({ rangeStart: start, rangeEnd: end, finalize: false });
      if (typeof perfMark === 'function') perfMark(`applyState chunk (${end}/${endAt})`);
      if (end < endAt) await yieldToBrowser();
    }
    finalizeApplyStateToTable(state.groups.length > WARNING_SWEEP_THRESHOLD);
  }

  function applyCommandFontSize() {
    if (!ui.comboView || !ui.table) return;
    const rawSize = getComputedStyle(ui.comboView).getPropertyValue('--command-font-size').trim();
    const size = rawSize || '12px';
    const commandCount = state.groups.length;
    if (state._commandFontSize === size && state._commandFontCount === commandCount) return;
    ui.table.querySelectorAll('.cmd-input[data-field="command"]').forEach((el) => {
      el.style.setProperty('font-size', size, 'important');
      el.style.setProperty('line-height', '1.1', 'important');
    });
    state._commandFontSize = size;
    state._commandFontCount = commandCount;
  }

  function ensureLoadMoreControl() {
    const wrap = qs('comboLoadMoreWrap');
    if (wrap) wrap.classList.add('hidden');
    ui.loadMoreWrap = wrap || null;
    ui.loadMoreInfo = qs('comboLoadMoreInfo');
    ui.loadMoreBtn = qs('comboLoadMoreBtn');
  }

  function updateLoadMoreControl() {
    if (!ui.loadMoreWrap) return;
    ui.loadMoreWrap.classList.add('hidden');
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

    ui.table.addEventListener('mousedown', (ev) => {
      if (!ev.shiftKey) return;
      const target = ev.target;
      if (!target || !target.closest) return;
      const row = target.closest('tr');
      if (!row || getGroupIndexFromRow(row) < 0) return;
      const editable = target.closest('input, textarea, select, [contenteditable="true"], .cmd-input');
      if (editable) return;
      ev.preventDefault();
      const selection = window.getSelection ? window.getSelection() : null;
      if (selection && typeof selection.removeAllRanges === 'function') selection.removeAllRanges();
    });

    ui.table.addEventListener('input', handleInputChange);
    ui.table.addEventListener('change', handleInputChange);
    ui.table.addEventListener('click', (ev) => {
      const target = ev.target;
      const inHeader = target && target.closest ? target.closest('.combo-sortable[data-sort-field]') : null;
      if (!inHeader && getSelectedColumnIndexes().length) {
        setSelectedColumns([], { anchorIndex: -1 });
      }
      if (target && target.classList && target.classList.contains('cmd-input') && target.dataset.field === 'command') {
        setActiveCell(target);
      }
      if (target && target.classList && target.classList.contains('multi-input')) {
        openMultiSelect(target);
      }
      const row = target && target.closest ? target.closest('tr') : null;
      if (row) {
        const groupIndex = getGroupIndexFromRow(row);
        if (groupIndex >= 0) handleRowSelectionRequest(groupIndex, ev, { scroll: false });
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
        const inTableRow = ev.target && ev.target.closest
          ? ev.target.closest('tr')
          : null;
        const inGroup = getGroupIndexFromRow(inTableRow) >= 0;
        if (!inGroup) setSelectedRows([], { scroll: false });
        const inHeader = ev.target && ev.target.closest
          ? ev.target.closest('.combo-sortable[data-sort-field]')
          : null;
        if (!inHeader && getSelectedColumnIndexes().length) {
          setSelectedColumns([], { anchorIndex: -1 });
        }
      });
    }
    document.addEventListener('keydown', handleKeymapInput);
    if (!comboGlobalShortcutsBound) {
      comboGlobalShortcutsBound = true;
      document.addEventListener('keydown', handleComboGlobalShortcuts, true);
    }
    if (!comboGridPasteBound) {
      comboGridPasteBound = true;
      document.addEventListener('paste', handleComboGridPaste, true);
    }
    bindRowContextMenu();

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
      if (!keys.length) return;
      const known = new Set(getAllCharacterSlugs());
      const buckets = new Map();
      let requiresMigration = false;

      keys.forEach((key) => {
        const rawSlug = key.slice(prefix.length);
        if (!rawSlug) return;
        const canonical = known.has(rawSlug) ? rawSlug : (resolveCharacterSlug(rawSlug) || rawSlug);
        if (!buckets.has(canonical)) {
          buckets.set(canonical, []);
        }
        buckets.get(canonical).push(key);
        if (canonical !== rawSlug) requiresMigration = true;
      });

      const targets = [];
      buckets.forEach((bucketKeys, canonical) => {
        const targetKey = `${prefix}${canonical}`;
        const shouldMerge = bucketKeys.length > 1 || bucketKeys[0] !== targetKey;
        if (shouldMerge) {
          requiresMigration = true;
          targets.push({ canonical, keys: bucketKeys, targetKey });
        }
      });
      if (!requiresMigration || !targets.length) return;

      targets.forEach((target) => {
        const seen = new Set();
        const merged = [];
        target.keys.forEach((key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.combos)) return;
            parsed.combos.forEach((combo) => {
              const normalized = { ...defaultCombo(), ...(combo || {}) };
              const { _manual, ...rest } = normalized;
              const signature = JSON.stringify(rest);
              if (seen.has(signature)) return;
              seen.add(signature);
              merged.push(normalized);
            });
          } catch { }
        });
        localStorage.setItem(target.targetKey, JSON.stringify({ combos: merged }));
        target.keys.forEach((key) => {
          if (key !== target.targetKey) localStorage.removeItem(key);
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
    const bind = (el, handler) => {
      if (!el) return;
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        handler();
      });
    };
    bind(createBtn, handleCreateCombo);
    bind(duplicateBtn, handleDuplicateCombo);
    bind(deleteBtn, handleDeleteCombo);
    bind(dedupeBtn, handleDedupeCombos);
    bind(restoreBtn, handleRestoreCombos);
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
    if (newIndex >= state.combos.length) {
      state.combos.push(defaultCombo());
    } else if (!state.combos[newIndex]) {
      state.combos[newIndex] = defaultCombo();
    }

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

  function trimGroupCount(targetCount) {
    const count = Math.max(0, Number(targetCount) || 0);
    while (state.groups.length > count) {
      const group = state.groups.pop();
      if (!group || !Array.isArray(group.rowList)) continue;
      group.rowList.forEach((row) => {
        if (row && row.parentNode) row.parentNode.removeChild(row);
      });
    }
  }

  function preserveTableScrollPosition() {
    const scroll = qs('comboTableScroll');
    if (!scroll) return () => { };
    const top = scroll.scrollTop;
    const left = scroll.scrollLeft;
    return () => {
      scroll.scrollTop = top;
      scroll.scrollLeft = left;
    };
  }

  function insertComboAt(index, comboData, options = {}) {
    if (options && options.skipHistory !== true) pushUndoHistory('insert-combo');
    const insertAt = Math.max(0, Math.min(Number(index) || 0, state.combos.length));
    const nextCombo = { ...defaultCombo(), ...(comboData || {}) };
    nextCombo._id = '';
    ensureComboIdentity(nextCombo);
    state.combos.splice(insertAt, 0, nextCombo);
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    const scrollToRow = options && options.scrollToRow === true;
    setSelectedGroup(insertAt, { scroll: scrollToRow });
    if (scrollToRow && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        setSelectedGroup(insertAt, { scroll: true });
      });
    }
    return insertAt;
  }

  function duplicateComboFromIndex(sourceIndex) {
    const idx = Number(sourceIndex);
    if (!Number.isFinite(idx) || idx < 0 || idx >= state.combos.length) return null;
    const source = state.combos[idx] || defaultCombo();
    const insertAt = Math.min(state.combos.length, idx + 1);
    return insertComboAt(insertAt, { ...source, _manual: true }, { scrollToRow: false });
  }

  function deleteComboAtIndex(index, options = {}) {
    const idx = Number(index);
    if (!Number.isFinite(idx) || idx < 0 || idx >= state.combos.length) return false;
    if (!options || options.skipHistory !== true) pushUndoHistory('delete-combo');
    const restoreScroll = options && options.preserveScroll !== false
      ? preserveTableScrollPosition()
      : () => { };
    state.combos[idx] = defaultCombo();
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedGroup(idx, { scroll: false });
    restoreScroll();
    return true;
  }

  function normalizeRowIndexes(indexes) {
    const max = state.groups.length;
    return Array.from(new Set((indexes || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value >= 0 && value < max)))
      .sort((a, b) => a - b);
  }

  function getSelectedRowIndexes(fallbackIndex = null) {
    const fromSet = normalizeRowIndexes(Array.from(state.selectedRows || []));
    if (fromSet.length) return fromSet;
    const idx = fallbackIndex == null ? Number(state.selectedGroup) : Number(fallbackIndex);
    if (Number.isFinite(idx) && idx >= 0 && idx < state.groups.length) return [idx];
    return [];
  }

  function refreshSelectedGroupStyles() {
    const selected = new Set(getSelectedRowIndexes());
    state.groups.forEach((group, idx) => {
      const on = selected.has(idx);
      group.rowList.forEach((row) => {
        row.classList.toggle('selected', on);
      });
    });
  }

  function setSelectedRows(indexes, options = {}) {
    if (!state.groups.length) return;
    const normalized = normalizeRowIndexes(indexes);
    const activeIndex = Number(options.activeIndex);
    const hasActive = Number.isFinite(activeIndex) && normalized.includes(activeIndex);
    const nextActive = hasActive
      ? activeIndex
      : (normalized.length ? normalized[normalized.length - 1] : -1);
    if (state.rowContextMenu && state.rowContextMenu.open && !normalized.includes(state.rowContextMenu.rowIndex)) {
      closeRowContextMenu();
    }
    state.selectedRows = new Set(normalized);
    state.selectedGroup = nextActive;
    if (normalized.length) {
      state.rowSelectAnchor = Number.isFinite(Number(options.anchorIndex))
        ? Number(options.anchorIndex)
        : nextActive;
    } else {
      state.rowSelectAnchor = -1;
    }
    if (!state.groups.length) return;
    updateComboGameVersionInfo(getComboLang());
    refreshSelectedGroupStyles();
    const shouldScroll = options && Object.prototype.hasOwnProperty.call(options, 'scroll')
      ? Boolean(options.scroll)
      : true;
    if (nextActive < 0 || !shouldScroll) return;
    const scroll = qs('comboTableScroll');
    const firstRow = state.groups[nextActive] && state.groups[nextActive].rowList[0];
    if (scroll && firstRow) {
      const rowStyle = window.getComputedStyle(firstRow);
      if (rowStyle && rowStyle.display === 'none') return;
      const scrollRect = scroll.getBoundingClientRect();
      const rowRect = firstRow.getBoundingClientRect();
      const offset = scrollRect && rowRect && scrollRect.height > 0
        ? (rowRect.top - scrollRect.top + scroll.scrollTop - 6)
        : (firstRow.offsetTop - 6);
      scroll.scrollTop = offset > 0 ? Math.round(offset) : 0;
    }
  }

  function setSelectedGroup(index, options = {}) {
    const idx = Number(index);
    if (!Number.isFinite(idx) || idx < 0) {
      setSelectedRows([], options);
      return;
    }
    setSelectedRows([idx], { ...options, activeIndex: idx, anchorIndex: idx });
  }

  function handleRowSelectionRequest(index, ev, options = {}) {
    const idx = Number(index);
    if (!Number.isFinite(idx) || idx < 0 || idx >= state.groups.length) return;
    const keepScroll = options && options.scroll === false ? false : true;
    const shift = !!(ev && ev.shiftKey);
    const toggle = !!(ev && (ev.ctrlKey || ev.metaKey));
    if (shift && state.rowSelectAnchor >= 0) {
      const start = Math.min(state.rowSelectAnchor, idx);
      const end = Math.max(state.rowSelectAnchor, idx);
      const range = [];
      for (let i = start; i <= end; i += 1) range.push(i);
      setSelectedRows(range, { scroll: keepScroll, activeIndex: idx, anchorIndex: state.rowSelectAnchor });
      return;
    }
    if (toggle) {
      const next = new Set(getSelectedRowIndexes());
      if (next.has(idx) && next.size > 1) next.delete(idx);
      else next.add(idx);
      setSelectedRows(Array.from(next), { scroll: false, activeIndex: idx, anchorIndex: idx });
      return;
    }
    setSelectedGroup(idx, { scroll: keepScroll });
  }

  function handleCreateCombo() {
    const newIndex = insertComboAt(state.combos.length, { _manual: true }, { scrollToRow: true });
    if (newIndex == null) {
      window.alert(comboMsg('no_empty_rows'));
    }
  }

  function handleDuplicateCombo() {
    const sourceIndex = getActiveGroupIndex();
    const inserted = duplicateComboFromIndex(sourceIndex);
    if (inserted == null) {
      window.alert(comboMsg('no_empty_rows'));
    }
  }

  function handleDeleteCombo() {
    const targetIndex = getActiveGroupIndex();
    deleteComboAtIndex(targetIndex, { preserveScroll: true });
  }

  function insertRowsAfterIndexes(indexes) {
    const selected = normalizeRowIndexes(indexes);
    const count = selected.length || 1;
    pushUndoHistory('insert-rows');
    const insertAt = selected.length ? selected[selected.length - 1] + 1 : state.combos.length;
    const rows = [];
    for (let i = 0; i < count; i += 1) {
      const combo = { ...defaultCombo(), _manual: true };
      ensureComboIdentity(combo);
      rows.push(combo);
    }
    state.combos.splice(insertAt, 0, ...rows);
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    const nextSelection = [];
    for (let i = 0; i < count; i += 1) nextSelection.push(insertAt + i);
    setSelectedRows(nextSelection, { scroll: true, activeIndex: insertAt + count - 1, anchorIndex: insertAt });
    return true;
  }

  function deleteRowsByIndexes(indexes) {
    const selected = normalizeRowIndexes(indexes);
    if (!selected.length) return false;
    pushUndoHistory('delete-rows');
    const restoreScroll = preserveTableScrollPosition();
    for (let i = selected.length - 1; i >= 0; i -= 1) {
      const idx = selected[i];
      if (idx >= 0 && idx < state.combos.length) {
        state.combos.splice(idx, 1);
      }
    }
    if (!state.combos.length) {
      state.combos.push(defaultCombo());
    }
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    const nextIndex = Math.max(0, Math.min(selected[0], state.combos.length - 1));
    setSelectedGroup(nextIndex, { scroll: false });
    restoreScroll();
    return true;
  }

  function clearRowsByIndexes(indexes) {
    const selected = normalizeRowIndexes(indexes);
    if (!selected.length) return false;
    pushUndoHistory('clear-rows');
    const restoreScroll = preserveTableScrollPosition();
    selected.forEach((idx) => {
      if (idx >= 0 && idx < state.combos.length) {
        state.combos[idx] = defaultCombo();
      }
    });
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedRows(selected, { scroll: false, activeIndex: selected[selected.length - 1] });
    restoreScroll();
    return true;
  }

  function isEditableTargetElement(target) {
    if (!target || !(target instanceof Element)) return false;
    if (target.closest('input, textarea, select')) return true;
    if (target.closest('[contenteditable="true"], [contenteditable=""], .cmd-input')) return true;
    return false;
  }

  function isComboModalOpen() {
    return !!document.querySelector('.combo-keymap-modal:not(.hidden)');
  }

  function getPrimarySelectedRowIndex() {
    const selected = getSelectedRowIndexes();
    if (!selected.length) return -1;
    const active = Number(state.selectedGroup);
    if (Number.isFinite(active) && selected.includes(active)) return active;
    return selected[0];
  }

  function cloneComboForClipboard(combo) {
    const base = { ...defaultCombo(), ...(combo || {}) };
    const cloned = cloneCombosForHistory([base])[0] || base;
    cloned._id = '';
    return cloned;
  }

  function copySelectedCombo(options = {}) {
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    const validRows = rows.filter((idx) => idx >= 0 && idx < state.combos.length);
    if (!validRows.length) return false;
    const combos = validRows.map((idx) => cloneComboForClipboard(state.combos[idx] || defaultCombo()));
    state.comboClipboard = {
      combos,
      cut: options && options.cut === true,
      sourceIndexes: validRows.slice(),
      slug: state.currentCharacter || getCharacterSlugFromUi(),
      copiedAt: Date.now(),
    };
    return true;
  }

  function cutSelectedCombo() {
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    if (!copySelectedCombo({ cut: true })) return false;
    return clearRowsByIndexes(rows);
  }

  function pasteComboClipboardToSelection() {
    const clip = state.comboClipboard;
    const clipCombos = Array.isArray(clip && clip.combos) ? clip.combos : [];
    if (!clipCombos.length) return false;
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    const targetRows = rows.slice().sort((a, b) => a - b);
    const pasteRows = (() => {
      if (targetRows.length === 1 && clipCombos.length > 1) {
        const start = targetRows[0];
        const out = [];
        for (let i = 0; i < clipCombos.length; i += 1) {
          out.push(start + i);
        }
        return out;
      }
      return targetRows;
    })();
    const maxRow = pasteRows.length ? pasteRows[pasteRows.length - 1] : -1;
    while (maxRow >= state.combos.length) {
      state.combos.push(defaultCombo());
    }
    pushUndoHistory('paste-combo');
    pasteRows.forEach((row, idx) => {
      if (row < 0 || row >= state.combos.length) return;
      const source = clipCombos[idx % clipCombos.length];
      const next = cloneComboForClipboard(source);
      ensureComboIdentity(next);
      state.combos[row] = next;
      syncDerivedComboFields(state.combos[row]);
    });
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    setSelectedRows(pasteRows, {
      scroll: false,
      activeIndex: pasteRows[pasteRows.length - 1],
      anchorIndex: pasteRows[pasteRows.length - 1],
    });
    if (clip.cut) state.comboClipboard = null;
    return true;
  }

  function insertClipboardCombosBelowSelection() {
    const clip = state.comboClipboard;
    const clipCombos = Array.isArray(clip && clip.combos) ? clip.combos : [];
    if (!clipCombos.length) return false;
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    const active = Number(state.selectedGroup);
    const anchor = Number.isFinite(active) && rows.includes(active)
      ? active
      : rows[rows.length - 1];
    const insertAt = Math.max(0, Math.min(state.combos.length, anchor + 1));
    const insertItems = clipCombos.map((source) => {
      const next = cloneComboForClipboard(source);
      ensureComboIdentity(next);
      syncDerivedComboFields(next);
      return next;
    });
    if (!insertItems.length) return false;
    pushUndoHistory('insert-copied-below');
    state.combos.splice(insertAt, 0, ...insertItems);
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    const selection = Array.from({ length: insertItems.length }, (_, i) => insertAt + i);
    setSelectedRows(selection, {
      scroll: false,
      activeIndex: selection[selection.length - 1],
      anchorIndex: selection[selection.length - 1],
    });
    if (clip.cut) state.comboClipboard = null;
    return true;
  }

  function deleteSelectedComboRows() {
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    if (rows.length === 1) return deleteComboAtIndex(rows[0], { preserveScroll: true });
    return clearRowsByIndexes(rows);
  }

  function toggleAutoLockForSelectedRows() {
    const rows = getSelectedRowIndexes();
    if (!rows.length) return false;
    const allLocked = rows.every((row) => {
      const combo = state.combos[row];
      if (!combo) return false;
      return AUTO_LOCK_FIELD_KEYS.every((field) => isComboFieldLocked(combo, field));
    });
    return setAllAutoLocksForRows(rows, !allLocked);
  }

  function openSimpleSearch() {
    if (!ui.search) return;
    const panel = qs('comboFilterPanel');
    if (panel && !panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      const wrapper = qs('comboAdvancedFilters');
      if (wrapper) wrapper.removeAttribute('open');
    }
    ui.search.focus({ preventScroll: true });
    if (typeof ui.search.select === 'function') ui.search.select();
  }

  function replaceAllInScope(findText, replaceText, scope) {
    const needle = String(findText || '');
    if (!needle) return 0;
    const replacement = String(replaceText || '');
    const selectedRows = getSelectedRowIndexes();
    const targets = scope === 'selected' && selectedRows.length
      ? selectedRows
      : Array.from({ length: state.combos.length }, (_, i) => i);
    const hitRows = targets.filter((row) => {
      if (row < 0 || row >= state.combos.length) return false;
      const combo = state.combos[row] || defaultCombo();
      return String(combo.command || '').includes(needle);
    });
    if (!hitRows.length) return 0;
    pushUndoHistory('replace');
    let changed = 0;
    hitRows.forEach((row) => {
      if (row < 0 || row >= state.combos.length) return;
      const combo = state.combos[row] || defaultCombo();
      const current = String(combo.command || '');
      if (!current.includes(needle)) return;
      const nextRaw = current.split(needle).join(replacement);
      const normalized = normalizeCommandForStorage(nextRaw).canonical;
      if (normalized === current) return;
      combo.command = normalized;
      syncCommandButtons(row, 'command');
      syncDerivedComboFields(combo);
      changed += 1;
    });
    if (!changed) return 0;
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    return changed;
  }

  function openReplaceWindow() {
    let modal = qs('comboReplaceModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'comboReplaceModal';
      modal.className = 'combo-keymap-modal hidden';
      modal.innerHTML = `
        <div class="combo-keymap-content combo-replace-content">
          <header>
            <h3 data-replace-label="replace_title">Replace</h3>
            <button type="button" class="close" data-action="close" aria-label="close">&times;</button>
          </header>
          <div class="combo-keymap-body">
            <label class="combo-keymap-item">
              <span data-replace-label="replace_find">Find</span>
              <input id="comboReplaceFind" type="text" autocomplete="off" />
            </label>
            <label class="combo-keymap-item">
              <span data-replace-label="replace_with">Replace with</span>
              <input id="comboReplaceWith" type="text" autocomplete="off" />
            </label>
            <label class="combo-keymap-item">
              <span data-replace-label="replace_scope">Scope</span>
              <select id="comboReplaceScope">
                <option value="selected" data-replace-label="replace_scope_selected">Selected rows</option>
                <option value="all" data-replace-label="replace_scope_all">All combos</option>
              </select>
            </label>
          </div>
          <div class="combo-keymap-actions">
            <button type="button" data-action="to-advanced" data-replace-label="replace_to_advanced">Advanced Search</button>
            <button type="button" data-action="apply" data-replace-label="replace_apply">Replace</button>
            <button type="button" data-action="close" data-replace-label="replace_close">Close</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', (ev) => {
        const actionEl = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
        if (!actionEl) {
          if (ev.target === modal) modal.classList.add('hidden');
          return;
        }
        const action = String(actionEl.dataset.action || '');
        if (action === 'close') {
          modal.classList.add('hidden');
          return;
        }
        if (action === 'to-advanced') {
          modal.classList.add('hidden');
          const details = qs('comboAdvancedFilters');
          if (details) details.setAttribute('open', 'open');
          const panel = qs('comboFilterPanel');
          if (panel) panel.classList.remove('hidden');
          return;
        }
        if (action === 'apply') {
          const findInput = modal.querySelector('#comboReplaceFind');
          const replaceInput = modal.querySelector('#comboReplaceWith');
          const scopeSelect = modal.querySelector('#comboReplaceScope');
          const findValue = findInput ? String(findInput.value || '') : '';
          const replaceValue = replaceInput ? String(replaceInput.value || '') : '';
          const scopeValue = scopeSelect ? String(scopeSelect.value || 'selected') : 'selected';
          if (!findValue) return;
          replaceAllInScope(findValue, replaceValue, scopeValue);
        }
      });
      modal.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
          ev.preventDefault();
          modal.classList.add('hidden');
          return;
        }
        if (ev.key === 'Enter' && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
          ev.preventDefault();
          const applyBtn = modal.querySelector('[data-action="apply"]');
          if (applyBtn) applyBtn.click();
        }
      });
    }
    const lang = getComboLang();
    modal.querySelectorAll('[data-replace-label]').forEach((el) => {
      const key = String(el.dataset.replaceLabel || '');
      const text = comboT(`ui.${key}`, lang) || el.textContent || key;
      if (el.tagName === 'OPTION' || el.tagName === 'BUTTON' || el.tagName === 'SPAN' || el.tagName === 'H3') {
        el.textContent = text;
      }
    });
    const scopeSelect = modal.querySelector('#comboReplaceScope');
    if (scopeSelect) {
      scopeSelect.value = getSelectedRowIndexes().length ? 'selected' : 'all';
    }
    modal.classList.remove('hidden');
    const findInput = modal.querySelector('#comboReplaceFind');
    if (findInput) {
      findInput.focus({ preventScroll: true });
      if (typeof findInput.select === 'function') findInput.select();
    }
  }

  function handleComboGlobalShortcuts(ev) {
    if (ev.defaultPrevented) return;
    if (!ui.comboView || !document.body.contains(ui.comboView)) return;
    const key = String(ev.key || '');
    const ctrlOrMeta = !!(ev.ctrlKey || ev.metaKey);
    const editable = isEditableTargetElement(ev.target);
    if (isComboModalOpen()) return;
    if (state.rowContextMenu && state.rowContextMenu.open) return;
    if (state.headerContextMenu && state.headerContextMenu.open) return;

    if (ctrlOrMeta) {
      const lower = key.toLowerCase();
      if (lower === 'f') {
        ev.preventDefault();
        openSimpleSearch();
        return;
      }
      if (lower === 'h') {
        ev.preventDefault();
        openReplaceWindow();
        return;
      }
      if (lower === 'n') {
        ev.preventDefault();
        if (!editable) handleCreateCombo();
        return;
      }
      if (key === '+' || (ev.code === 'Equal' && ev.shiftKey) || ev.code === 'NumpadAdd') {
        ev.preventDefault();
        if (!editable) insertClipboardCombosBelowSelection();
        return;
      }
      if (editable) return;
      if (lower === 'c') {
        if (copySelectedCombo()) ev.preventDefault();
        return;
      }
      if (lower === 'x') {
        if (cutSelectedCombo()) ev.preventDefault();
        return;
      }
      if (lower === 'v') {
        if (pasteComboClipboardToSelection()) ev.preventDefault();
        return;
      }
      if (lower === 'z' && !ev.shiftKey) {
        if (undoComboHistory()) ev.preventDefault();
        return;
      }
      if (lower === 'y' || (lower === 'z' && ev.shiftKey)) {
        if (redoComboHistory()) ev.preventDefault();
        return;
      }
      if (lower === 'l') {
        ev.preventDefault();
        toggleAutoLockForSelectedRows();
      }
      return;
    }

    if (!editable && key === 'Delete') {
      if (deleteSelectedComboRows()) {
        ev.preventDefault();
      }
    }
  }

  function getRowContextMenuCombo(groupIndex) {
    if (!Number.isFinite(groupIndex) || groupIndex < 0 || groupIndex >= state.combos.length) return null;
    const combo = state.combos[groupIndex] || null;
    if (!combo) return null;
    ensureComboIdentity(combo);
    return combo;
  }

  function getRowContextTargetRow(groupIndex, preferredRow = null) {
    if (preferredRow && preferredRow.classList && preferredRow.classList.contains('combo-group-row')) {
      return preferredRow;
    }
    const group = state.groups[groupIndex];
    if (!group || !Array.isArray(group.rowList) || !group.rowList.length) return null;
    return group.rowList.find((row) => row.classList.contains('combo-row-command'))
      || group.rowList[0]
      || null;
  }

  function copyTextToClipboard(text) {
    const value = String(text || '');
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      return navigator.clipboard.writeText(value);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', 'true');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        if (ok) resolve();
        else reject(new Error('copy-failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  function setAllAutoLocksForComboById(comboId, locked) {
    const index = getComboIndexById(comboId);
    if (index < 0) return false;
    const combo = state.combos[index];
    if (!combo) return false;
    ensureComboIdentity(combo);
    combo._autoLocks = normalizeComboAutoLocks(combo._autoLocks);
    let changed = false;
    AUTO_LOCK_FIELD_KEYS.forEach((field) => {
      const next = !!locked;
      if (combo._autoLocks[field] !== next) {
        combo._autoLocks[field] = next;
        changed = true;
      }
    });
    if (!changed) return false;
    pushUndoHistory('toggle-auto-lock');
    persist();
    applyStateToTable({ rangeStart: index, rangeEnd: index + 1 });
    return true;
  }

  function setAllAutoLocksForRows(indexes, locked) {
    const rows = normalizeRowIndexes(indexes);
    if (!rows.length) return false;
    let changed = false;
    rows.forEach((row) => {
      const combo = state.combos[row];
      if (!combo) return;
      ensureComboIdentity(combo);
      combo._autoLocks = normalizeComboAutoLocks(combo._autoLocks);
      AUTO_LOCK_FIELD_KEYS.forEach((field) => {
        const next = !!locked;
        if (combo._autoLocks[field] !== next) {
          combo._autoLocks[field] = next;
          changed = true;
        }
      });
    });
    if (!changed) return false;
    pushUndoHistory('toggle-auto-lock');
    const min = rows[0];
    const max = rows[rows.length - 1];
    persist();
    applyStateToTable({ rangeStart: min, rangeEnd: max + 1 });
    return true;
  }

  function isComboFieldLocked(combo, field) {
    if (!combo || typeof combo !== 'object') return false;
    const key = String(field || '').trim();
    if (!key) return false;
    const locks = combo._autoLocks && typeof combo._autoLocks === 'object' ? combo._autoLocks : null;
    if (!locks) return false;
    return locks[key] === true;
  }

  function setLockBadgeForCell(cell, locked) {
    if (!cell) return;
    const current = cell.querySelector('.combo-lock-badge');
    if (!locked) {
      if (current) current.remove();
      cell.classList.remove('combo-cell-locked');
      return;
    }
    cell.classList.add('combo-cell-locked');
    if (current) return;
    const badge = document.createElement('span');
    badge.className = 'combo-lock-badge';
    badge.textContent = '🔒';
    badge.setAttribute('aria-hidden', 'true');
    cell.appendChild(badge);
  }

  function ensureRowContextMenu() {
    let menu = qs('comboRowContextMenu');
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = 'comboRowContextMenu';
    menu.className = 'combo-row-context-menu hidden';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-hidden', 'true');

    let currentGroup = '';
    const parts = [];
    // Action map for row-scoped operations. Add new items in ROW_CONTEXT_MENU_ITEMS.
    ROW_CONTEXT_MENU_ITEMS.forEach((item) => {
      if (currentGroup && currentGroup !== item.group) {
        parts.push('<div class="combo-row-context-sep" role="separator"></div>');
      }
      currentGroup = item.group;
      parts.push(`<button type="button" class="combo-row-context-item" role="menuitem" tabindex="-1" data-action="${item.action}" data-label-key="${item.labelKey}"></button>`);
    });
    menu.innerHTML = parts.join('');
    document.body.appendChild(menu);

    menu.addEventListener('click', (ev) => {
      const item = ev.target && ev.target.closest ? ev.target.closest('.combo-row-context-item[data-action]') : null;
      if (!item || item.disabled) return;
      ev.preventDefault();
      handleRowContextAction(String(item.dataset.action || ''));
    });

    menu.addEventListener('keydown', (ev) => {
      const items = Array.from(menu.querySelectorAll('.combo-row-context-item:not([disabled])'));
      if (!items.length) return;
      const currentIndex = Math.max(0, items.indexOf(document.activeElement));
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
        ev.preventDefault();
        const next = (currentIndex + 1) % items.length;
        items[next].focus();
        return;
      }
      if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        const next = (currentIndex - 1 + items.length) % items.length;
        items[next].focus();
        return;
      }
      if (ev.key === 'Home') {
        ev.preventDefault();
        items[0].focus();
        return;
      }
      if (ev.key === 'End') {
        ev.preventDefault();
        items[items.length - 1].focus();
        return;
      }
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        const active = document.activeElement && document.activeElement.classList
          ? document.activeElement
          : items[currentIndex];
        if (active && !active.disabled) active.click();
        return;
      }
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeRowContextMenu({ restoreFocus: true });
      }
    });
    return menu;
  }

  function refreshRowContextMenuLabels() {
    const menu = qs('comboRowContextMenu');
    if (!menu) return;
    const lang = getComboLang();
    menu.querySelectorAll('.combo-row-context-item[data-label-key]').forEach((item) => {
      const labelKey = String(item.dataset.labelKey || '').trim();
      item.textContent = comboT(`ui.${labelKey}`, lang) || labelKey;
    });
  }

  function getRowContextEnabledItems(menu) {
    return Array.from(menu.querySelectorAll('.combo-row-context-item')).filter((item) => !item.disabled);
  }

  function positionRowContextMenu(menu, clientX, clientY) {
    if (!menu) return;
    const margin = 6;
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.classList.remove('hidden');
    menu.setAttribute('aria-hidden', 'false');
    menu.style.visibility = 'hidden';
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxX = Math.max(margin, vw - rect.width - margin);
    const maxY = Math.max(margin, vh - rect.height - margin);
    const x = Math.min(Math.max(margin, Math.round(clientX || margin)), maxX);
    const y = Math.min(Math.max(margin, Math.round(clientY || margin)), maxY);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.visibility = '';
  }

  function openRowContextMenuForGroup(groupIndex, options = {}) {
    const index = Number(groupIndex);
    if (!Number.isFinite(index) || index < 0 || index >= state.groups.length) return;
    if (state.headerContextMenu && state.headerContextMenu.open) {
      closeHeaderContextMenu();
    }
    const combo = getRowContextMenuCombo(index);
    if (!combo) return;
    const menu = ensureRowContextMenu();
    const rowEl = getRowContextTargetRow(index, options.rowEl || null);
    if (!rowEl) return;
    const selectedRows = getSelectedRowIndexes(index);
    if (!selectedRows.includes(index)) {
      setSelectedGroup(index, { scroll: false });
    } else {
      refreshSelectedGroupStyles();
    }
    rowEl.focus({ preventScroll: true });

    const comboId = String(combo._id || '');
    const targetRows = getSelectedRowIndexes(index);
    const hasClipboard = !!(state.comboClipboard && Array.isArray(state.comboClipboard.combos) && state.comboClipboard.combos.length);
    refreshRowContextMenuLabels();
    menu.querySelectorAll('.combo-row-context-item').forEach((item) => {
      const action = String(item.dataset.action || '');
      if (action === 'paste-rows' || action === 'insert-copied-below') {
        item.disabled = !targetRows.length || !hasClipboard;
      } else {
        item.disabled = !targetRows.length;
      }
    });

    state.rowContextMenu.open = true;
    state.rowContextMenu.comboId = comboId;
    state.rowContextMenu.rowIndex = index;
    state.rowContextMenu.rowEl = rowEl;
    state.rowContextMenu.returnFocusEl = options.returnFocusEl || rowEl;

    let anchorX = Number(options.clientX);
    let anchorY = Number(options.clientY);
    if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) {
      const rect = rowEl.getBoundingClientRect();
      anchorX = rect.left + Math.min(24, Math.max(12, rect.width * 0.15));
      anchorY = rect.top + Math.max(10, rect.height * 0.5);
    }

    positionRowContextMenu(menu, anchorX, anchorY);
    if (options.focusMenu) {
      const items = getRowContextEnabledItems(menu);
      if (items.length) items[0].focus();
    }
  }

  function closeRowContextMenu(options = {}) {
    const menu = qs('comboRowContextMenu');
    if (menu) {
      menu.classList.add('hidden');
      menu.setAttribute('aria-hidden', 'true');
      menu.style.visibility = '';
    }
    const restoreFocus = options && options.restoreFocus === true;
    const focusTarget = state.rowContextMenu.returnFocusEl;
    state.rowContextMenu.open = false;
    state.rowContextMenu.comboId = '';
    state.rowContextMenu.rowIndex = -1;
    state.rowContextMenu.rowEl = null;
    state.rowContextMenu.returnFocusEl = null;
    if (restoreFocus && focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }

  async function handleRowContextAction(action) {
    const comboId = String(state.rowContextMenu.comboId || '').trim();
    if (!comboId) {
      closeRowContextMenu();
      return;
    }
    const rowIndex = state.rowContextMenu.rowIndex;
    const selectedRows = getSelectedRowIndexes(rowIndex);
    if (!selectedRows.length) {
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'insert-rows') {
      insertRowsAfterIndexes(selectedRows);
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'copy-rows') {
      copySelectedCombo();
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'paste-rows') {
      pasteComboClipboardToSelection();
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'insert-copied-below') {
      insertClipboardCombosBelowSelection();
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'delete-rows') {
      const ok = window.confirm(comboMsg('context_delete_rows_confirm', { count: selectedRows.length }));
      if (ok) deleteRowsByIndexes(selectedRows);
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'clear-rows') {
      const ok = window.confirm(comboMsg('context_clear_rows_confirm', { count: selectedRows.length }));
      if (ok) clearRowsByIndexes(selectedRows);
      closeRowContextMenu({ restoreFocus: true });
      return;
    }
    closeRowContextMenu({ restoreFocus: true });
  }

  function handleRowContextMenuRequest(ev) {
    const row = ev.target && ev.target.closest ? ev.target.closest('tr') : null;
    if (!row) return;
    ev.preventDefault();
    const groupIndex = getGroupIndexFromRow(row);
    if (groupIndex < 0) return;
    if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
      handleRowSelectionRequest(groupIndex, ev, { scroll: false });
    } else {
      const selectedRows = getSelectedRowIndexes(groupIndex);
      if (!selectedRows.includes(groupIndex) || selectedRows.length <= 1) {
        setSelectedGroup(groupIndex, { scroll: false });
      }
    }
    openRowContextMenuForGroup(groupIndex, {
      rowEl: row,
      clientX: ev.clientX,
      clientY: ev.clientY,
      returnFocusEl: row,
      focusMenu: false,
    });
  }

  function handleRowContextMenuKeyboardOpen(ev) {
    if (isEditableTargetElement(ev.target)) return;
    const isShiftF10 = ev.shiftKey && ev.key === 'F10';
    const isContextKey = ev.key === 'ContextMenu' || ev.key === 'Apps';
    if (!isShiftF10 && !isContextKey) return;
    const fromRow = ev.target && ev.target.closest ? ev.target.closest('tr') : null;
    const selectedIndex = Number.isFinite(state.selectedGroup) ? state.selectedGroup : -1;
    const selectedRow = selectedIndex >= 0 ? getRowContextTargetRow(selectedIndex, null) : null;
    const row = fromRow || selectedRow;
    if (!row) return;
    const groupIndex = getGroupIndexFromRow(row);
    if (groupIndex < 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    openRowContextMenuForGroup(groupIndex, {
      rowEl: row,
      returnFocusEl: row,
      focusMenu: true,
    });
  }

  function handleRowContextMenuOutsideClick(ev) {
    if (!state.rowContextMenu.open) return;
    const menu = qs('comboRowContextMenu');
    if (menu && menu.contains(ev.target)) return;
    if (menu && Number.isFinite(Number(ev.clientX)) && Number.isFinite(Number(ev.clientY))) {
      const rect = menu.getBoundingClientRect();
      if (rect
        && ev.clientX >= rect.left
        && ev.clientX <= rect.right
        && ev.clientY >= rect.top
        && ev.clientY <= rect.bottom) {
        return;
      }
    }
    closeRowContextMenu();
  }

  function handleRowContextMenuGlobalKeydown(ev) {
    if (!state.rowContextMenu.open) return;
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    closeRowContextMenu({ restoreFocus: true });
  }

  function bindRowContextMenu() {
    if (rowContextMenuBound || !ui.table) return;
    rowContextMenuBound = true;
    ui.table.addEventListener('contextmenu', handleRowContextMenuRequest);
    ui.table.addEventListener('keydown', handleRowContextMenuKeyboardOpen);
    document.addEventListener('pointerdown', handleRowContextMenuOutsideClick, true);
    document.addEventListener('keydown', handleRowContextMenuGlobalKeydown, true);
    window.addEventListener('resize', () => closeRowContextMenu());
    window.addEventListener('scroll', () => closeRowContextMenu(), true);
    const tableScroll = qs('comboTableScroll');
    if (tableScroll) {
      tableScroll.addEventListener('scroll', () => closeRowContextMenu(), { passive: true });
    }
  }

  function ensureHeaderContextMenu() {
    let menu = qs('comboHeaderContextMenu');
    if (menu) return menu;
    menu = document.createElement('div');
    menu.id = 'comboHeaderContextMenu';
    menu.className = 'combo-header-context-menu hidden';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-hidden', 'true');

    const actionsHtml = HEADER_CONTEXT_MENU_ITEMS
      .map((item) => `<button type="button" class="combo-header-context-item" role="menuitem" tabindex="-1" data-action="${item.action}" data-label-key="${item.labelKey}"></button>`)
      .join('');
    menu.innerHTML = `
      <div class="combo-header-context-actions">${actionsHtml}</div>
      <div class="combo-header-context-divider" role="separator"></div>
      <div class="combo-header-filter-wrap">
        <label class="combo-header-filter-search-label" for="comboHeaderFilterSearch" data-label-key="context_filter_search"></label>
        <input id="comboHeaderFilterSearch" class="combo-header-filter-search" type="text" autocomplete="off" />
        <div id="comboHeaderFilterOptions" class="combo-header-filter-options"></div>
        <div class="combo-header-filter-actions">
          <button type="button" class="combo-header-filter-btn" data-action="apply-filter" data-label-key="context_filter_ok"></button>
          <button type="button" class="combo-header-filter-btn" data-action="cancel-filter" data-label-key="context_filter_cancel"></button>
        </div>
      </div>
    `;
    document.body.appendChild(menu);

    menu.addEventListener('click', (ev) => {
      const item = ev.target && ev.target.closest ? ev.target.closest('.combo-header-context-item[data-action]') : null;
      if (item && !item.disabled) {
        ev.preventDefault();
        handleHeaderContextAction(String(item.dataset.action || ''));
        return;
      }
      const filterAction = ev.target && ev.target.closest ? ev.target.closest('.combo-header-filter-btn[data-action]') : null;
      if (!filterAction || filterAction.disabled) return;
      ev.preventDefault();
      const action = String(filterAction.dataset.action || '');
      if (action === 'apply-filter') {
        applyHeaderContextFilterSelection();
      } else if (action === 'cancel-filter') {
        closeHeaderContextMenu({ restoreFocus: true });
      }
    });

    menu.addEventListener('change', (ev) => {
      const input = ev.target;
      if (!input || input.tagName !== 'INPUT' || input.type !== 'checkbox') return;
      const role = String(input.dataset.role || '');
      if (role === 'select-all') {
        toggleHeaderContextSelectAll(!!input.checked);
        return;
      }
      if (role !== 'value') return;
      const value = String(input.dataset.value || '');
      const current = new Set(Array.isArray(state.headerContextMenu.selectedValues) ? state.headerContextMenu.selectedValues : []);
      if (input.checked) current.add(value);
      else current.delete(value);
      state.headerContextMenu.selectedValues = Array.from(current);
      renderHeaderContextFilterOptions();
    });

    const searchInput = menu.querySelector('#comboHeaderFilterSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (ev) => {
        state.headerContextMenu.searchText = String(ev.target.value || '');
        renderHeaderContextFilterOptions();
      });
    }

    menu.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeHeaderContextMenu({ restoreFocus: true });
        return;
      }
      if (ev.key === 'Enter' && ev.target && ev.target.id === 'comboHeaderFilterSearch') {
        ev.preventDefault();
        applyHeaderContextFilterSelection();
      }
    });
    ensureHeaderFilterFlyout();
    return menu;
  }

  function refreshHeaderContextMenuLabels() {
    const menu = qs('comboHeaderContextMenu');
    const lang = getComboLang();
    if (menu) {
      menu.querySelectorAll('.combo-header-context-item[data-label-key]').forEach((item) => {
        const labelKey = String(item.dataset.labelKey || '').trim();
        item.textContent = comboT(`ui.${labelKey}`, lang) || labelKey;
      });
      menu.querySelectorAll('[data-label-key].combo-header-filter-btn, [data-label-key].combo-header-filter-search-label').forEach((item) => {
        const labelKey = String(item.dataset.labelKey || '').trim();
        item.textContent = comboT(`ui.${labelKey}`, lang) || labelKey;
      });
      const searchInput = menu.querySelector('#comboHeaderFilterSearch');
      if (searchInput) {
        searchInput.setAttribute('placeholder', comboT('ui.context_filter_search', lang) || 'Search');
      }
    }
    const flyout = qs('comboHeaderFilterFlyout');
    if (flyout) {
      flyout.querySelectorAll('[data-label-key]').forEach((item) => {
        const labelKey = String(item.dataset.labelKey || '').trim();
        item.textContent = comboT(`ui.${labelKey}`, lang) || labelKey;
      });
    }
  }

  function getHeaderContextEnabledItems(menu) {
    return Array.from(menu.querySelectorAll('.combo-header-context-item')).filter((item) => !item.disabled);
  }

  function getHeaderFilterRawValue(combo, field) {
    const normalizedField = resolveHeaderOperationField(field);
    if (!normalizedField) return '';
    if (normalizedField === 'command' || normalizedField === 'buttons') {
      return String(combo && combo[normalizedField] ? combo[normalizedField] : '').trim();
    }
    const raw = combo && Object.prototype.hasOwnProperty.call(combo, normalizedField)
      ? combo[normalizedField]
      : '';
    return String(Array.isArray(raw) ? raw.join(',') : (raw == null ? '' : raw)).trim();
  }

  function parseHeaderFilterNumber(value) {
    const raw = String(value == null ? '' : value).replace(/,/g, '').trim();
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }

  function isSpreadsheetErrorToken(value) {
    const raw = String(value == null ? '' : value).trim();
    if (!raw) return false;
    return /^#(?:DIV\/0!|VALUE!|N\/A|NUM!|NAME\?|REF!|NULL!)$/i.test(raw);
  }

  function getHeaderNumericMeta(field) {
    const normalizedField = resolveHeaderOperationField(field);
    if (!normalizedField) return { enabled: false, count: 0, min: null, max: null };
    let count = 0;
    let min = null;
    let max = null;
    for (let i = 0; i < state.combos.length; i += 1) {
      const combo = state.combos[i];
      if (!combo || typeof combo !== 'object') continue;
      const raw = getHeaderFilterRawValue(combo, normalizedField);
      if (!raw) continue;
      const num = parseHeaderFilterNumber(raw);
      if (num == null) {
        if (isSpreadsheetErrorToken(raw)) continue;
        return { enabled: false, count: 0, min: null, max: null };
      }
      count += 1;
      if (min == null || num < min) min = num;
      if (max == null || num > max) max = num;
    }
    return { enabled: count > 0, count, min, max };
  }

  function isValidHeaderNumericFilter(op, v1, v2) {
    const key = String(op || '').trim().toLowerCase();
    const n1 = parseHeaderFilterNumber(v1);
    const n2 = parseHeaderFilterNumber(v2);
    if (!key) return false;
    if (key === 'between') {
      return n1 != null && n2 != null;
    }
    return n1 != null;
  }

  function ensureHeaderFilterFlyout() {
    let flyout = qs('comboHeaderFilterFlyout');
    if (flyout) return flyout;
    flyout = document.createElement('div');
    flyout.id = 'comboHeaderFilterFlyout';
    flyout.className = 'combo-header-filter-flyout hidden';
    flyout.innerHTML = `
      <div class="combo-header-filter-numeric">
        <div class="combo-header-filter-numeric-title" data-label-key="context_filter_numeric"></div>
        <div class="combo-header-filter-numeric-row">
          <select id="comboHeaderFlyoutNumericOp" class="combo-header-filter-numeric-op"></select>
          <input id="comboHeaderFlyoutNumericV1" class="combo-header-filter-numeric-input" type="text" inputmode="decimal" autocomplete="off" />
          <input id="comboHeaderFlyoutNumericV2" class="combo-header-filter-numeric-input" type="text" inputmode="decimal" autocomplete="off" />
        </div>
      </div>
      <div class="combo-header-filter-actions">
        <button type="button" class="combo-header-filter-btn" data-action="apply-numeric-filter" data-label-key="context_filter_ok"></button>
        <button type="button" class="combo-header-filter-btn" data-action="cancel-numeric-filter" data-label-key="context_filter_cancel"></button>
      </div>
    `;
    document.body.appendChild(flyout);

    flyout.addEventListener('click', (ev) => {
      const btn = ev.target && ev.target.closest ? ev.target.closest('.combo-header-filter-btn[data-action]') : null;
      if (!btn || btn.disabled) return;
      ev.preventDefault();
      const action = String(btn.dataset.action || '');
      if (action === 'apply-numeric-filter') {
        applyHeaderNumericFilterSelection();
      } else if (action === 'cancel-numeric-filter') {
        closeHeaderFilterFlyout();
      }
    });
    flyout.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeHeaderFilterFlyout();
        return;
      }
      if (ev.key === 'Enter') {
        ev.preventDefault();
        applyHeaderNumericFilterSelection();
      }
    });

    const op = flyout.querySelector('#comboHeaderFlyoutNumericOp');
    if (op) {
      op.addEventListener('change', (ev) => {
        state.headerContextMenu.numericOp = String(ev.target.value || 'eq');
        renderHeaderNumericFilterControls();
      });
    }
    const v1 = flyout.querySelector('#comboHeaderFlyoutNumericV1');
    if (v1) {
      v1.addEventListener('input', (ev) => {
        state.headerContextMenu.numericV1 = String(ev.target.value || '');
        updateHeaderNumericFlyoutApplyButtonState();
      });
    }
    const v2 = flyout.querySelector('#comboHeaderFlyoutNumericV2');
    if (v2) {
      v2.addEventListener('input', (ev) => {
        state.headerContextMenu.numericV2 = String(ev.target.value || '');
        updateHeaderNumericFlyoutApplyButtonState();
      });
    }
    return flyout;
  }

  function positionHeaderFilterFlyout(flyout, anchorEl) {
    if (!flyout) return;
    const menu = qs('comboHeaderContextMenu');
    const anchorRect = anchorEl && anchorEl.getBoundingClientRect
      ? anchorEl.getBoundingClientRect()
      : (menu ? menu.getBoundingClientRect() : null);
    if (!anchorRect) return;
    const margin = 6;
    flyout.classList.remove('hidden');
    flyout.style.visibility = 'hidden';
    flyout.style.left = '0px';
    flyout.style.top = '0px';
    const rect = flyout.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    let x = anchorRect.right + 4;
    let y = anchorRect.top - 4;
    if (x + rect.width > vw - margin) {
      x = anchorRect.left - rect.width - 4;
    }
    x = Math.max(margin, Math.min(x, vw - rect.width - margin));
    y = Math.max(margin, Math.min(y, vh - rect.height - margin));
    flyout.style.left = `${Math.round(x)}px`;
    flyout.style.top = `${Math.round(y)}px`;
    flyout.style.visibility = '';
  }

  function closeHeaderFilterFlyout() {
    const flyout = qs('comboHeaderFilterFlyout');
    if (!flyout) return;
    flyout.classList.add('hidden');
    flyout.style.visibility = '';
  }

  function updateHeaderNumericFlyoutApplyButtonState() {
    const flyout = qs('comboHeaderFilterFlyout');
    if (!flyout) return;
    const applyBtn = flyout.querySelector('.combo-header-filter-btn[data-action="apply-numeric-filter"]');
    if (!applyBtn) return;
    const valid = state.headerContextMenu.numericEnabled
      && isValidHeaderNumericFilter(
        state.headerContextMenu.numericOp,
        state.headerContextMenu.numericV1,
        state.headerContextMenu.numericV2,
      );
    applyBtn.disabled = !valid;
  }

  function renderHeaderNumericFilterControls() {
    const flyout = ensureHeaderFilterFlyout();
    const opSelect = flyout.querySelector('#comboHeaderFlyoutNumericOp');
    const v1Input = flyout.querySelector('#comboHeaderFlyoutNumericV1');
    const v2Input = flyout.querySelector('#comboHeaderFlyoutNumericV2');
    if (!opSelect || !v1Input || !v2Input) return;
    const lang = getComboLang();
    const options = [
      { value: 'eq', key: 'context_filter_num_eq' },
      { value: 'ne', key: 'context_filter_num_ne' },
      { value: 'gt', key: 'context_filter_num_gt' },
      { value: 'gte', key: 'context_filter_num_gte' },
      { value: 'lt', key: 'context_filter_num_lt' },
      { value: 'lte', key: 'context_filter_num_lte' },
      { value: 'between', key: 'context_filter_num_between' },
    ];
    const selectedOp = String(state.headerContextMenu.numericOp || 'eq');
    opSelect.innerHTML = options
      .map((opt) => `<option value="${opt.value}" ${opt.value === selectedOp ? 'selected' : ''}>${escapeHtml(comboT(`ui.${opt.key}`, lang) || opt.value)}</option>`)
      .join('');
    v1Input.value = String(state.headerContextMenu.numericV1 || '');
    v2Input.value = String(state.headerContextMenu.numericV2 || '');
    v1Input.placeholder = comboT('ui.context_filter_num_v1', lang) || 'Value 1';
    v2Input.placeholder = comboT('ui.context_filter_num_v2', lang) || 'Value 2';
    const between = String(opSelect.value || '') === 'between';
    v2Input.classList.toggle('hidden', !between);
    v2Input.disabled = !between;
    updateHeaderNumericFlyoutApplyButtonState();
    refreshHeaderContextMenuLabels();
  }

  function openHeaderNumericFilterFlyout(anchorEl) {
    if (!state.headerContextMenu.open || !state.headerContextMenu.numericEnabled) return;
    renderHeaderNumericFilterControls();
    const flyout = ensureHeaderFilterFlyout();
    positionHeaderFilterFlyout(flyout, anchorEl);
    const firstInput = flyout.querySelector('#comboHeaderFlyoutNumericV1');
    if (firstInput) firstInput.focus({ preventScroll: true });
  }

  function applyHeaderNumericFilterSelection() {
    const field = resolveHeaderOperationField(state.headerContextMenu.filterField || '');
    const op = String(state.headerContextMenu.numericOp || '').trim();
    const v1 = String(state.headerContextMenu.numericV1 || '').trim();
    const v2 = String(state.headerContextMenu.numericV2 || '').trim();
    if (!field || !state.headerContextMenu.numericEnabled || !isValidHeaderNumericFilter(op, v1, v2)) {
      return;
    }
    state.filters.headerField = field;
    state.filters.headerValues = [];
    state.filters.headerQuery = '';
    state.filters.headerNumeric = {
      field,
      op,
      v1,
      v2,
    };
    applyFilters();
    closeHeaderContextMenu({ restoreFocus: true });
  }

  function updateHeaderContextApplyButtonState() {
    const menu = qs('comboHeaderContextMenu');
    if (!menu) return;
    const applyBtn = menu.querySelector('.combo-header-filter-btn[data-action="apply-filter"]');
    if (!applyBtn) return;
    const selected = new Set(Array.isArray(state.headerContextMenu.selectedValues) ? state.headerContextMenu.selectedValues : []);
    applyBtn.disabled = selected.size === 0;
  }

  function comboMatchesHeaderNumericFilter(combo, filterField, numericFilter) {
    const field = resolveHeaderOperationField(filterField);
    if (!field) return true;
    if (!numericFilter || typeof numericFilter !== 'object') return true;
    const op = String(numericFilter.op || '').trim().toLowerCase();
    const v1 = parseHeaderFilterNumber(numericFilter.v1);
    const v2 = parseHeaderFilterNumber(numericFilter.v2);
    if (!isValidHeaderNumericFilter(op, v1, v2)) return true;
    const value = parseHeaderFilterNumber(getHeaderFilterRawValue(combo, field));
    if (value == null) return false;
    if (op === 'eq') return value === Number(v1);
    if (op === 'ne') return value !== Number(v1);
    if (op === 'gt') return value > Number(v1);
    if (op === 'gte') return value >= Number(v1);
    if (op === 'lt') return value < Number(v1);
    if (op === 'lte') return value <= Number(v1);
    if (op === 'between') {
      const min = Math.min(Number(v1), Number(v2));
      const max = Math.max(Number(v1), Number(v2));
      return value >= min && value <= max;
    }
    return true;
  }

  function getHeaderFilterOptions(field) {
    const lang = getComboLang();
    const blankLabel = comboT('ui.context_filter_blank', lang) || '(Blank)';
    const valueSet = new Set();
    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      valueSet.add(getHeaderFilterRawValue(combo, field));
    });
    const options = Array.from(valueSet).map((value) => ({
      value,
      label: value || blankLabel,
      isBlank: !value,
    }));
    options.sort((a, b) => {
      if (a.isBlank && !b.isBlank) return -1;
      if (!a.isBlank && b.isBlank) return 1;
      return String(a.label || '').localeCompare(String(b.label || ''), 'ja', { numeric: true, sensitivity: 'base' });
    });
    return options;
  }

  function getHeaderContextFilteredOptions() {
    const options = Array.isArray(state.headerContextMenu.filterOptions) ? state.headerContextMenu.filterOptions : [];
    const query = String(state.headerContextMenu.searchText || '').trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => {
      const label = String(opt.label || '').toLowerCase();
      const value = String(opt.value || '').toLowerCase();
      return label.includes(query) || value.includes(query);
    });
  }

  function toggleHeaderContextSelectAll(checked) {
    const visibleOptions = getHeaderContextFilteredOptions();
    const current = new Set(Array.isArray(state.headerContextMenu.selectedValues) ? state.headerContextMenu.selectedValues : []);
    visibleOptions.forEach((opt) => {
      if (checked) current.add(opt.value);
      else current.delete(opt.value);
    });
    state.headerContextMenu.selectedValues = Array.from(current);
    renderHeaderContextFilterOptions();
  }

  function renderHeaderContextFilterOptions() {
    const menu = qs('comboHeaderContextMenu');
    if (!menu) return;
    const optionsWrap = menu.querySelector('#comboHeaderFilterOptions');
    if (!optionsWrap) return;
    const visibleOptions = getHeaderContextFilteredOptions();
    const selected = new Set(Array.isArray(state.headerContextMenu.selectedValues) ? state.headerContextMenu.selectedValues : []);
    const lang = getComboLang();
    optionsWrap.innerHTML = '';

    const selectAllRow = document.createElement('label');
    selectAllRow.className = 'combo-header-filter-option combo-header-filter-option-all';
    const selectAllInput = document.createElement('input');
    selectAllInput.type = 'checkbox';
    selectAllInput.dataset.role = 'select-all';
    const visibleCount = visibleOptions.length;
    const selectedVisibleCount = visibleOptions.reduce((sum, opt) => sum + (selected.has(opt.value) ? 1 : 0), 0);
    selectAllInput.checked = visibleCount > 0 && selectedVisibleCount === visibleCount;
    selectAllInput.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleCount;
    const selectAllText = document.createElement('span');
    selectAllText.textContent = comboT('ui.context_filter_select_all', lang) || '(Select All)';
    selectAllRow.appendChild(selectAllInput);
    selectAllRow.appendChild(selectAllText);
    optionsWrap.appendChild(selectAllRow);

    visibleOptions.forEach((opt) => {
      const row = document.createElement('label');
      row.className = 'combo-header-filter-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.role = 'value';
      input.dataset.value = opt.value;
      input.checked = selected.has(opt.value);
      const text = document.createElement('span');
      text.textContent = opt.label;
      row.appendChild(input);
      row.appendChild(text);
      optionsWrap.appendChild(row);
    });

    updateHeaderContextApplyButtonState();
  }

  function applyHeaderContextFilterSelection() {
    const field = resolveHeaderOperationField(state.headerContextMenu.filterField || '');
    const options = Array.isArray(state.headerContextMenu.filterOptions) ? state.headerContextMenu.filterOptions : [];
    const selected = Array.isArray(state.headerContextMenu.selectedValues) ? state.headerContextMenu.selectedValues.slice() : [];
    if (!field) {
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (!selected.length || selected.length === options.length) {
      state.filters.headerField = '';
      state.filters.headerValues = [];
      state.filters.headerQuery = '';
      state.filters.headerNumeric = { field: '', op: '', v1: '', v2: '' };
    } else {
      state.filters.headerField = field;
      state.filters.headerValues = selected;
      state.filters.headerQuery = '';
      state.filters.headerNumeric = { field: '', op: '', v1: '', v2: '' };
    }
    applyFilters();
    closeHeaderContextMenu({ restoreFocus: true });
  }

  function positionHeaderContextMenu(menu, clientX, clientY) {
    if (!menu) return;
    const margin = 6;
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.classList.remove('hidden');
    menu.setAttribute('aria-hidden', 'false');
    menu.style.visibility = 'hidden';
    const rect = menu.getBoundingClientRect();
    const vw = window.innerWidth || document.documentElement.clientWidth || 0;
    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    const maxX = Math.max(margin, vw - rect.width - margin);
    const maxY = Math.max(margin, vh - rect.height - margin);
    const x = Math.min(Math.max(margin, Math.round(clientX || margin)), maxX);
    const y = Math.min(Math.max(margin, Math.round(clientY || margin)), maxY);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.visibility = '';
  }

  function getHeaderContextColumns(field, headerCell) {
    // Prefer stable base column metadata so hidden/compacted columns do not shift mapping.
    if (headerCell && headerCell.dataset) {
      const baseStart = Number.parseInt(headerCell.dataset.baseColStart || '', 10);
      const baseSpan = Math.max(1, Number.parseInt(headerCell.dataset.baseColspan || '', 10) || 1);
      if (Number.isFinite(baseStart) && baseStart > 0) {
        const columns = [];
        for (let col = baseStart; col < baseStart + baseSpan; col += 1) {
          if (col > 1) columns.push(col);
        }
        if (columns.length) return columns;
      }
    }

    // Fallback to matrix position when base metadata is unavailable.
    const table = headerCell && headerCell.closest ? headerCell.closest('table') : null;
    if (table && headerCell) {
      const rows = Array.from(table.rows || []);
      if (rows.length) {
        const { cellPositions } = buildCellMatrixFromRows(rows, { table });
        const pos = cellPositions.get(headerCell);
        if (pos) {
          const columns = [];
          const start = Number(pos.col) || 0;
          const span = Math.max(1, Number(pos.colspan) || 1);
          for (let col = start; col < start + span; col += 1) {
            if (col > 1) columns.push(col);
          }
          if (columns.length) return columns;
        }
      }
    }

    const fieldMap = getFieldColumnMap();
    const mappedCol = Number(fieldMap.get(field) || 0);
    if (mappedCol > 1) return [mappedCol];
    return [];
  }

  function normalizeColumnIndexes(columns) {
    return Array.from(new Set((columns || [])
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 1)))
      .sort((a, b) => a - b);
  }

  function getSelectedColumnIndexes(fallbackColumns = []) {
    const selected = normalizeColumnIndexes(Array.from(state.selectedColumns || []));
    if (selected.length) return selected;
    return normalizeColumnIndexes(fallbackColumns);
  }

  function refreshSelectedHeaderColumns() {
    const getStableColumnRange = (cell, pos) => {
      const baseStart = Number.parseInt(cell && cell.dataset ? cell.dataset.baseColStart || '' : '', 10);
      const baseSpan = Math.max(1, Number.parseInt(cell && cell.dataset ? cell.dataset.baseColspan || '' : '', 10) || 1);
      if (Number.isFinite(baseStart) && baseStart > 0) {
        return { start: baseStart, span: baseSpan };
      }
      if (!pos) return null;
      const start = Number(pos.col) || 0;
      const span = Math.max(1, Number(pos.colspan) || 1);
      if (start <= 0) return null;
      return { start, span };
    };

    const selected = new Set(getSelectedColumnIndexes());
    const tables = [ui.table, ui.headerTable].filter(Boolean);
    tables.forEach((table) => {
      table.querySelectorAll('.combo-sortable[data-sort-field]').forEach((cell) => {
        const field = String(cell.dataset ? cell.dataset.sortField || '' : '').trim();
        const columns = getHeaderContextColumns(field, cell);
        const on = columns.some((col) => selected.has(col));
        cell.classList.toggle('combo-header-selected', on);
      });
      table.querySelectorAll('.combo-column-selected').forEach((cell) => {
        cell.classList.remove('combo-column-selected');
      });
      if (!selected.size) return;
      const rows = Array.from(table.rows || []);
      if (!rows.length) return;
      const { cellPositions } = buildCellMatrixFromRows(rows, { table });
      rows.forEach((row) => {
        Array.from(row.children || []).forEach((cell) => {
          const pos = cellPositions.get(cell);
          const range = getStableColumnRange(cell, pos);
          if (!range) return;
          let hit = false;
          for (let col = range.start; col < range.start + range.span; col += 1) {
            if (selected.has(col)) {
              hit = true;
              break;
            }
          }
          if (hit) cell.classList.add('combo-column-selected');
        });
      });
    });
  }

  function setSelectedColumns(columns, options = {}) {
    const normalized = normalizeColumnIndexes(columns);
    state.selectedColumns = new Set(normalized);
    if (normalized.length) {
      state.colSelectAnchor = Number.isFinite(Number(options.anchorIndex))
        ? Number(options.anchorIndex)
        : normalized[normalized.length - 1];
    } else {
      state.colSelectAnchor = -1;
    }
    refreshSelectedHeaderColumns();
  }

  function handleColumnSelectionRequest(cell, ev) {
    if (!cell) return;
    const field = String(cell.dataset ? cell.dataset.sortField || '' : '').trim();
    const currentCols = normalizeColumnIndexes(getHeaderContextColumns(field, cell));
    if (!currentCols.length) return;
    const pivot = currentCols[0];
    const shift = !!(ev && ev.shiftKey);
    const toggle = !!(ev && (ev.ctrlKey || ev.metaKey));
    if (shift && state.colSelectAnchor > 1) {
      const min = Math.min(state.colSelectAnchor, pivot);
      const max = Math.max(state.colSelectAnchor, pivot);
      const range = [];
      for (let c = min; c <= max; c += 1) range.push(c);
      setSelectedColumns(range, { anchorIndex: state.colSelectAnchor });
      return;
    }
    if (toggle) {
      const next = new Set(getSelectedColumnIndexes(currentCols));
      currentCols.forEach((col) => {
        if (next.has(col) && next.size > 1) next.delete(col);
        else next.add(col);
      });
      setSelectedColumns(Array.from(next), { anchorIndex: pivot });
      return;
    }
    setSelectedColumns(currentCols, { anchorIndex: pivot });
  }

  function getColumnSelectionRange(columns) {
    const normalized = normalizeColumnIndexes(columns);
    if (!normalized.length) return [];
    const min = normalized[0];
    const max = normalized[normalized.length - 1];
    const out = [];
    for (let c = min; c <= max; c += 1) out.push(c);
    return out;
  }

  function clearComboFieldsByColumns(columns) {
    const normalizedCols = normalizeColumnIndexes(columns);
    if (!normalizedCols.length) return false;
    pushUndoHistory('clear-columns');
    const colSet = new Set(normalizedCols);
    const fields = [];
    const fieldMap = getFieldColumnMap();
    fieldMap.forEach((colIndex, field) => {
      if (colSet.has(colIndex)) fields.push(field);
    });
    const uniqueFields = Array.from(new Set(fields));
    if (!uniqueFields.length) return false;
    let changed = false;
    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      uniqueFields.forEach((field) => {
        if (field === 'command') {
          if (String(combo.command || '') !== '') {
            combo.command = '';
            changed = true;
          }
          if (String(combo.buttons || '') !== '') {
            combo.buttons = '';
            changed = true;
          }
          return;
        }
        if (String(combo[field] || '') !== '') {
          combo[field] = '';
          changed = true;
        }
      });
    });
    if (!changed) return false;
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    return true;
  }

  function getConvertibleNegativeFieldsByColumns(columns) {
    const normalizedCols = normalizeColumnIndexes(columns);
    if (!normalizedCols.length) return [];
    const fields = normalizedCols
      .map((col) => getFieldByColumnIndex(col))
      .filter((field) => NEGATIVE_CONVERT_FIELDS.has(String(field || '')));
    return Array.from(new Set(fields));
  }

  function convertComboFieldsToNegativeByColumns(columns) {
    const targetFields = getConvertibleNegativeFieldsByColumns(columns);
    if (!targetFields.length) return false;
    let historyPushed = false;
    let changed = false;
    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      targetFields.forEach((field) => {
        const currentRaw = String(combo[field] == null ? '' : combo[field]).trim();
        if (!currentRaw) return;
        const num = parseNumericText(currentRaw);
        if (num == null) return;
        const nextValue = formatNumberText(String(-Math.abs(num)));
        if (nextValue === currentRaw) return;
        if (!historyPushed) {
          pushUndoHistory('to-negative');
          historyPushed = true;
        }
        combo[field] = nextValue;
        changed = true;
      });
    });
    if (!changed) return false;
    const restoreScroll = preserveTableScrollPosition();
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    restoreScroll();
    return true;
  }

  function getFieldByColumnIndex(columnIndex) {
    const target = Number(columnIndex);
    if (!Number.isFinite(target) || target <= 0) return '';
    const fieldMap = getFieldColumnMap();
    for (const [field, col] of fieldMap.entries()) {
      if (Number(col) === target) return String(field || '');
    }
    return '';
  }

  function resolveHeaderOperationField(field) {
    const raw = String(field || '').trim();
    if (!raw) return '';
    if (raw === '__combo_first__') return 'command';
    return raw;
  }

  function getHeaderContextLabel(headerEl, field) {
    const fromData = headerEl && headerEl.dataset
      ? String(headerEl.dataset.baseLabel || '').trim()
      : '';
    if (fromData) return fromData;
    const fromText = normalizeHeaderLabel(headerEl && headerEl.textContent ? headerEl.textContent : '');
    if (fromText) return fromText;
    return resolveHeaderOperationField(field) || '-';
  }

  function isHeaderFieldEditable(field) {
    const normalized = resolveHeaderOperationField(field);
    if (!normalized) return false;
    if (normalized === 'frame_meter' || normalized === 'command' || normalized === 'buttons' || normalized === 'combo_notes') {
      return true;
    }
    return FIELD_ORDER.includes(normalized);
  }

  function matchesHeaderTextFilter(combo, field, query) {
    const normalizedField = resolveHeaderOperationField(field);
    const queryText = String(query || '').toLowerCase();
    if (!normalizedField || !queryText) return true;
    if (normalizedField === 'command' || normalizedField === 'buttons') {
      const raw = String(combo && combo[normalizedField] ? combo[normalizedField] : '');
      if (!raw) return false;
      const canonical = canonicalizeCommandForStorage(raw);
      const localizedJp = localizeCommandForDisplay(canonical, 'jp');
      const localizedEn = localizeCommandForDisplay(canonical, 'en');
      return [raw, canonical, localizedJp, localizedEn].some((text) => String(text || '').toLowerCase().includes(queryText));
    }
    const value = combo && Object.prototype.hasOwnProperty.call(combo, normalizedField) ? combo[normalizedField] : '';
    const text = Array.isArray(value) ? value.join(',') : String(value || '');
    return text.toLowerCase().includes(queryText);
  }

  function clearComboFieldValuesByHeader(field) {
    const normalizedField = resolveHeaderOperationField(field);
    if (!isHeaderFieldEditable(normalizedField)) return false;
    pushUndoHistory('clear-header-field');
    let changed = false;
    state.combos.forEach((combo) => {
      if (!combo || typeof combo !== 'object') return;
      if (normalizedField === 'command') {
        if (String(combo.command || '') !== '') {
          combo.command = '';
          changed = true;
        }
        if (String(combo.buttons || '') !== '') {
          combo.buttons = '';
          changed = true;
        }
        return;
      }
      if (normalizedField === 'buttons') {
        if (String(combo.buttons || '') !== '') {
          combo.buttons = '';
          changed = true;
        }
        return;
      }
      if (String(combo[normalizedField] || '') !== '') {
        combo[normalizedField] = '';
        changed = true;
      }
    });
    if (!changed) return false;
    const restoreScroll = preserveTableScrollPosition();
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    restoreScroll();
    return true;
  }

  function getHeaderContextCellFromEvent(ev, table) {
    if (!table || !ev || !ev.target || !ev.target.closest) return null;
    const cell = ev.target.closest('.combo-sortable[data-sort-field], th[data-sort-field], td[data-sort-field]');
    if (!cell || !table.contains(cell)) return null;
    return cell;
  }

  function openHeaderContextMenu(options = {}) {
    const headerEl = options.headerEl || null;
    if (!headerEl) return;
    const field = String((headerEl.dataset && headerEl.dataset.sortField) || '').trim();
    if (!field) return;
    if (state.rowContextMenu && state.rowContextMenu.open) {
      closeRowContextMenu();
    }
    const fallbackColumns = getHeaderContextColumns(field, headerEl);
    const columns = getSelectedColumnIndexes(fallbackColumns);
    const operationField = resolveHeaderOperationField(field);
    const filterField = columns.length === 1
      ? resolveHeaderOperationField(getFieldByColumnIndex(columns[0]))
      : '';
    const headerLabel = getHeaderContextLabel(headerEl, field);
    const menu = ensureHeaderContextMenu();
    refreshHeaderContextMenuLabels();
    const isComboColumnContext = field === '__combo_first__';
    const hasHideTarget = columns.length > 0;
    const alreadyHidden = hasHideTarget && columns.every((col) => state.hiddenColumns.has(col));
    const canClearValues = columns.length > 0;
    const selectedFieldsForNegative = columns
      .map((col) => getFieldByColumnIndex(col))
      .filter((field) => String(field || '').trim().length > 0);
    const canConvertNegative = selectedFieldsForNegative.length > 0
      && selectedFieldsForNegative.every((field) => NEGATIVE_CONVERT_FIELDS.has(field));
    const multiColumn = columns.length > 1;
    const canUseTextFilter = !!filterField;
    const numericMeta = canUseTextFilter ? getHeaderNumericMeta(filterField) : { enabled: false };
    const rangeColumns = getColumnSelectionRange(columns);
    const hasHiddenInRange = rangeColumns.some((col) => state.hiddenColumns.has(col));
    const currentNumeric = state.filters && state.filters.headerNumeric && typeof state.filters.headerNumeric === 'object'
      ? state.filters.headerNumeric
      : {};
    const hasValueFilter = canUseTextFilter
      && String(state.filters.headerField || '') === filterField
      && Array.isArray(state.filters.headerValues)
      && state.filters.headerValues.length > 0;
    const hasNumericFilter = canUseTextFilter
      && numericMeta.enabled
      && String(currentNumeric.field || '') === filterField
      && isValidHeaderNumericFilter(currentNumeric.op, currentNumeric.v1, currentNumeric.v2);
    menu.querySelectorAll('.combo-header-context-item').forEach((item) => {
      const action = String(item.dataset.action || '');
      item.classList.toggle('has-submenu', action === 'open-numeric-filter');
      if (action === 'hide-column') {
        item.style.display = isComboColumnContext ? 'none' : '';
        item.disabled = !hasHideTarget || alreadyHidden;
      } else if (action === 'show-column') {
        item.style.display = '';
        item.disabled = !hasHideTarget || !hasHiddenInRange;
      } else if (action === 'sort-asc' || action === 'sort-desc') {
        item.style.display = multiColumn ? 'none' : '';
        item.disabled = !field || multiColumn;
      } else if (action === 'clear-values') {
        item.style.display = '';
        item.disabled = !canClearValues;
      } else if (action === 'to-negative') {
        item.style.display = '';
        item.disabled = !canConvertNegative;
      } else if (action === 'clear-filter') {
        item.style.display = canUseTextFilter ? '' : 'none';
        item.disabled = !(hasValueFilter || hasNumericFilter);
        item.classList.toggle('is-active', hasValueFilter || hasNumericFilter);
      } else if (action === 'open-numeric-filter') {
        item.style.display = canUseTextFilter && numericMeta.enabled ? '' : 'none';
        item.disabled = !numericMeta.enabled;
        item.classList.toggle('is-active', hasNumericFilter);
      } else {
        item.style.display = '';
        item.disabled = false;
      }
    });

    const filterOptions = getHeaderFilterOptions(filterField);
    const selectedValues = (() => {
      const all = filterOptions.map((item) => item.value);
      if (!filterField) return [];
      const activeField = String(state.filters.headerField || '');
      const activeValues = Array.isArray(state.filters.headerValues) ? state.filters.headerValues : [];
      if (activeField !== filterField || !activeValues.length) {
        return all.slice();
      }
      const allowed = new Set(all);
      const selected = activeValues.filter((value) => allowed.has(String(value)));
      return selected.length ? selected : all.slice();
    })();

    state.headerContextMenu.open = true;
    state.headerContextMenu.field = field;
    state.headerContextMenu.filterField = filterField;
    state.headerContextMenu.label = headerLabel;
    state.headerContextMenu.columns = columns.slice();
    state.headerContextMenu.filterOptions = filterOptions;
    state.headerContextMenu.selectedValues = selectedValues;
    state.headerContextMenu.searchText = '';
    state.headerContextMenu.numericEnabled = !!numericMeta.enabled;
    state.headerContextMenu.numericOp = hasNumericFilter ? String(currentNumeric.op || 'eq') : 'eq';
    state.headerContextMenu.numericV1 = hasNumericFilter ? String(currentNumeric.v1 || '') : '';
    state.headerContextMenu.numericV2 = hasNumericFilter ? String(currentNumeric.v2 || '') : '';
    state.headerContextMenu.headerEl = headerEl;
    state.headerContextMenu.tableEl = options.tableEl || null;
    state.headerContextMenu.returnFocusEl = options.returnFocusEl || headerEl;

    let anchorX = Number(options.clientX);
    let anchorY = Number(options.clientY);
    if (!Number.isFinite(anchorX) || !Number.isFinite(anchorY)) {
      const rect = headerEl.getBoundingClientRect();
      anchorX = rect.left + Math.min(24, Math.max(12, rect.width * 0.2));
      anchorY = rect.top + Math.max(10, rect.height * 0.5);
    }
    positionHeaderContextMenu(menu, anchorX, anchorY);
    const filterWrap = menu.querySelector('.combo-header-filter-wrap');
    if (filterWrap) filterWrap.style.display = canUseTextFilter ? '' : 'none';
    const divider = menu.querySelector('.combo-header-context-divider');
    if (divider) divider.style.display = canUseTextFilter ? '' : 'none';
    const searchInput = menu.querySelector('#comboHeaderFilterSearch');
    if (searchInput) searchInput.value = '';
    closeHeaderFilterFlyout();
    if (canUseTextFilter) {
      renderHeaderContextFilterOptions();
    }
    if (options.focusMenu) {
      const items = getHeaderContextEnabledItems(menu);
      if (items.length) items[0].focus();
      else if (canUseTextFilter && searchInput) searchInput.focus();
    }
  }

  function closeHeaderContextMenu(options = {}) {
    const menu = qs('comboHeaderContextMenu');
    if (menu) {
      menu.classList.add('hidden');
      menu.setAttribute('aria-hidden', 'true');
      menu.style.visibility = '';
    }
    closeHeaderFilterFlyout();
    const restoreFocus = options && options.restoreFocus === true;
    const focusTarget = state.headerContextMenu.returnFocusEl;
    state.headerContextMenu.open = false;
    state.headerContextMenu.field = '';
    state.headerContextMenu.filterField = '';
    state.headerContextMenu.label = '';
    state.headerContextMenu.columns = [];
    state.headerContextMenu.filterOptions = [];
    state.headerContextMenu.selectedValues = [];
    state.headerContextMenu.searchText = '';
    state.headerContextMenu.numericEnabled = false;
    state.headerContextMenu.numericOp = 'eq';
    state.headerContextMenu.numericV1 = '';
    state.headerContextMenu.numericV2 = '';
    state.headerContextMenu.headerEl = null;
    state.headerContextMenu.tableEl = null;
    state.headerContextMenu.returnFocusEl = null;
    if (restoreFocus && focusTarget && typeof focusTarget.focus === 'function') {
      focusTarget.focus({ preventScroll: true });
    }
  }

  function handleHeaderContextAction(action) {
    const field = String(state.headerContextMenu.field || '').trim();
    if (!field) {
      closeHeaderContextMenu();
      return;
    }
    const opField = resolveHeaderOperationField(field);
    const headerLabel = String(state.headerContextMenu.label || opField || '-');
    const selectedColumns = normalizeColumnIndexes(state.headerContextMenu.columns);
    if (action === 'sort-asc' || action === 'sort-desc') {
      applySort(field, action === 'sort-asc' ? 1 : -1);
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'show-column') {
      const rangeColumns = getColumnSelectionRange(selectedColumns);
      if (rangeColumns.length) {
        setComboColumnsHidden(rangeColumns, false);
      }
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'clear-values') {
      if (!selectedColumns.length) {
        closeHeaderContextMenu({ restoreFocus: true });
        return;
      }
      const lang = getComboLang();
      const clearLabel = selectedColumns.length > 1
        ? (lang === 'jp' ? `${selectedColumns.length}列` : `${selectedColumns.length} columns`)
        : headerLabel;
      const ok = window.confirm(comboMsg('context_clear_values_confirm', { field: clearLabel }));
      if (ok) {
        clearComboFieldsByColumns(selectedColumns);
      }
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'to-negative') {
      if (selectedColumns.length) {
        convertComboFieldsToNegativeByColumns(selectedColumns);
      }
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'clear-filter') {
      const filterField = resolveHeaderOperationField(state.headerContextMenu.filterField || '');
      const numeric = state.filters && state.filters.headerNumeric && typeof state.filters.headerNumeric === 'object'
        ? state.filters.headerNumeric
        : {};
      const hasValue = filterField && String(state.filters.headerField || '') === filterField;
      const hasNumeric = filterField && String(numeric.field || '') === filterField;
      if (hasValue || hasNumeric) {
        state.filters.headerField = '';
        state.filters.headerValues = [];
        state.filters.headerQuery = '';
        state.filters.headerNumeric = { field: '', op: '', v1: '', v2: '' };
        applyFilters();
      }
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    if (action === 'open-numeric-filter') {
      const menu = qs('comboHeaderContextMenu');
      const trigger = menu
        ? menu.querySelector('.combo-header-context-item[data-action="open-numeric-filter"]')
        : null;
      openHeaderNumericFilterFlyout(trigger || menu);
      return;
    }
    if (action === 'hide-column') {
      const columns = Array.isArray(state.headerContextMenu.columns)
        ? state.headerContextMenu.columns.filter((col) => Number.isFinite(Number(col)))
        : [];
      if (columns.length) {
        if (state.columnPreset !== 'custom') {
          state.columnPreset = 'custom';
        }
        setComboColumnsHidden(columns, true);
      }
      closeHeaderContextMenu({ restoreFocus: true });
      return;
    }
    closeHeaderContextMenu({ restoreFocus: true });
  }

  function handleHeaderContextMenuRequest(ev) {
    const table = ev.currentTarget;
    const cell = getHeaderContextCellFromEvent(ev, table);
    if (!cell) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.shiftKey || ev.ctrlKey || ev.metaKey) {
      handleColumnSelectionRequest(cell, ev);
    } else {
      const field = String(cell.dataset ? cell.dataset.sortField || '' : '').trim();
      const cellCols = normalizeColumnIndexes(getHeaderContextColumns(field, cell));
      const selectedCols = getSelectedColumnIndexes(cellCols);
      const allInSelection = cellCols.length && cellCols.every((col) => selectedCols.includes(col));
      if (!allInSelection || selectedCols.length <= 1) {
        setSelectedColumns(cellCols, { anchorIndex: cellCols[0] || -1 });
      }
    }
    openHeaderContextMenu({
      headerEl: cell,
      tableEl: table,
      clientX: ev.clientX,
      clientY: ev.clientY,
      returnFocusEl: cell,
      focusMenu: false,
    });
  }

  function handleHeaderContextMenuKeyboardOpen(ev) {
    if (isEditableTargetElement(ev.target)) return;
    const isShiftF10 = ev.shiftKey && ev.key === 'F10';
    const isContextKey = ev.key === 'ContextMenu' || ev.key === 'Apps';
    if (!isShiftF10 && !isContextKey) return;
    const table = ev.currentTarget;
    const target = ev.target && ev.target.closest
      ? ev.target.closest('.combo-sortable[data-sort-field]')
      : null;
    if (!target || !table || !table.contains(target)) return;
    const row = target.closest('tr');
    if (!row || !row.parentElement || row.parentElement.tagName !== 'THEAD') return;
    ev.preventDefault();
    ev.stopPropagation();
    const field = String(target.dataset ? target.dataset.sortField || '' : '').trim();
    const targetCols = normalizeColumnIndexes(getHeaderContextColumns(field, target));
    const selectedCols = getSelectedColumnIndexes(targetCols);
    const allInSelection = targetCols.length && targetCols.every((col) => selectedCols.includes(col));
    if (!allInSelection || selectedCols.length <= 1) {
      setSelectedColumns(targetCols, { anchorIndex: targetCols[0] || -1 });
    }
    openHeaderContextMenu({
      headerEl: target,
      tableEl: table,
      returnFocusEl: target,
      focusMenu: true,
    });
  }

  function handleHeaderContextMenuOutsideClick(ev) {
    if (!state.headerContextMenu.open) return;
    const menu = qs('comboHeaderContextMenu');
    if (menu && menu.contains(ev.target)) return;
    const flyout = qs('comboHeaderFilterFlyout');
    if (flyout && flyout.contains(ev.target)) return;
    if (menu && Number.isFinite(Number(ev.clientX)) && Number.isFinite(Number(ev.clientY))) {
      const rect = menu.getBoundingClientRect();
      if (rect
        && ev.clientX >= rect.left
        && ev.clientX <= rect.right
        && ev.clientY >= rect.top
        && ev.clientY <= rect.bottom) {
        return;
      }
    }
    if (flyout && Number.isFinite(Number(ev.clientX)) && Number.isFinite(Number(ev.clientY))) {
      const flyRect = flyout.getBoundingClientRect();
      if (flyRect
        && ev.clientX >= flyRect.left
        && ev.clientX <= flyRect.right
        && ev.clientY >= flyRect.top
        && ev.clientY <= flyRect.bottom) {
        return;
      }
    }
    closeHeaderContextMenu();
  }

  function handleHeaderContextMenuGlobalKeydown(ev) {
    if (!state.headerContextMenu.open) return;
    if (ev.key !== 'Escape') return;
    ev.preventDefault();
    closeHeaderContextMenu({ restoreFocus: true });
  }

  function bindHeaderContextGlobalEvents() {
    if (headerContextMenuBound) return;
    headerContextMenuBound = true;
    document.addEventListener('pointerdown', handleHeaderContextMenuOutsideClick, true);
    document.addEventListener('keydown', handleHeaderContextMenuGlobalKeydown, true);
    window.addEventListener('resize', () => closeHeaderContextMenu());
    window.addEventListener('scroll', () => closeHeaderContextMenu(), true);
  }

  function bindComboHeaderContextMenu(table) {
    if (!table) return;
    bindHeaderContextGlobalEvents();
    const tableScroll = qs('comboTableScroll');
    if (tableScroll && tableScroll.dataset.headerContextBound !== 'true') {
      tableScroll.addEventListener('scroll', () => closeHeaderContextMenu(), { passive: true });
      tableScroll.dataset.headerContextBound = 'true';
    }
    if (table.dataset.headerContextBound === 'true') return;
    table.addEventListener('contextmenu', handleHeaderContextMenuRequest);
    table.addEventListener('keydown', handleHeaderContextMenuKeyboardOpen);
    table.dataset.headerContextBound = 'true';
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
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
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

  function ensureImportTargetModal() {
    let modal = qs('comboImportTargetModal');
    if (modal) return modal;
    const lang = getComboLang();
    modal = document.createElement('div');
    modal.id = 'comboImportTargetModal';
    modal.className = 'combo-keymap-modal combo-import-target-modal hidden';
    modal.innerHTML = `
      <div class="combo-keymap-content combo-import-target-content">
        <header>
          <h3 data-import-target-label="import_target_title">${comboT('ui.import_target_title', lang) || 'Select Import Target'}</h3>
        </header>
        <p class="combo-import-target-desc" data-import-target-label="import_target_desc">${comboT('ui.import_target_desc', lang) || ''}</p>
        <div class="combo-xlsx-map-target-section">
          <div class="combo-xlsx-map-target-heading" data-import-target-label="import_target_label">${comboT('ui.import_target_label', lang) || 'Target Character'}</div>
          <div class="combo-xlsx-map-target-panel">
            <div class="combo-xlsx-map-target">
              <div id="comboImportTargetList" class="combo-xlsx-map-target-list"></div>
            </div>
          </div>
          <div class="combo-xlsx-map-target-actions">
            <button type="button" data-action="target-select-all" data-xlsx-label="xlsx_map_select_all">${comboT('ui.xlsx_map_select_all', lang) || 'Select all'}</button>
            <button type="button" data-action="target-unselect-all" data-xlsx-label="xlsx_map_unselect_all">${comboT('ui.xlsx_map_unselect_all', lang) || 'Unselect all'}</button>
          </div>
        </div>
        <div class="combo-keymap-actions combo-import-target-actions">
          <button type="button" data-action="apply">${comboT('ui.import_target_apply', lang) || 'Import'}</button>
          <button type="button" data-action="cancel">${comboT('ui.import_target_cancel', lang) || 'Close'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        closeImportTargetModal(null);
        return;
      }
      const actionEl = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
      const action = actionEl && actionEl.dataset ? actionEl.dataset.action : '';
      if (!action) return;
      if (action === 'cancel') {
        closeImportTargetModal(null);
        return;
      }
      if (action === 'target-select-all' || action === 'target-unselect-all') {
        const list = modal.querySelector('#comboImportTargetList');
        if (!list) return;
        const checked = action === 'target-select-all';
        list.querySelectorAll('input.combo-xlsx-map-target-check').forEach((el) => {
          el.checked = checked;
        });
        return;
      }
      if (action === 'apply') {
        const list = modal.querySelector('#comboImportTargetList');
        const values = list
          ? Array.from(list.querySelectorAll('input.combo-xlsx-map-target-check'))
            .filter((el) => el.checked)
            .map((el) => String(el.value || '').trim())
            .filter(Boolean)
          : [];
        if (!values.length) {
          window.alert(comboMsg('xlsx_map_required_target'));
          return;
        }
        closeImportTargetModal(values);
      }
    });
    return modal;
  }

  function closeImportTargetModal(selectedValue) {
    const modal = qs('comboImportTargetModal');
    if (!modal) return;
    modal.classList.add('hidden');
    const resolve = modal._resolve;
    modal._resolve = null;
    modal._options = [];
    if (typeof resolve === 'function') {
      resolve(selectedValue);
    }
  }

  async function chooseImportTarget(slugs) {
    const candidates = Array.isArray(slugs)
      ? slugs.map((slug) => String(slug || '').trim()).filter(Boolean)
      : [];
    const unique = Array.from(new Set(candidates));
    if (!unique.length) return [];
    const modal = ensureImportTargetModal();
    const list = modal.querySelector('#comboImportTargetList');
    if (!list) return unique;
    const currentSlug = resolveCharacterSlug(state.currentCharacter || getCharacterSlugFromUi()) || '';
    const selectedSet = new Set(currentSlug && unique.includes(currentSlug) ? [currentSlug] : unique);
    const rows = unique.map((slug) => {
      const label = getCharacterLabel(slug) || slug;
      const checked = selectedSet.has(slug) ? 'checked' : '';
      return `<label class="combo-xlsx-map-target-item">
        <input type="checkbox" class="combo-xlsx-map-target-check" value="${escapeHtml(slug)}" ${checked}>
        <span>${escapeHtml(label)}</span>
      </label>`;
    });
    list.innerHTML = rows.join('');
    return await new Promise((resolve) => {
      modal._resolve = resolve;
      applyComboUiLabels(getComboLang());
      modal.classList.remove('hidden');
      const first = list.querySelector('input.combo-xlsx-map-target-check');
      if (first) first.focus();
    });
  }

  function getNotationManagerRows(lang) {
    const api = getNotationDictApi();
    if (!api || typeof api.getNotationManagerRows !== 'function') return [];
    return api.getNotationManagerRows(lang || getComboLang());
  }

  function getNotationCanonicalRows(lang) {
    const api = getNotationDictApi();
    if (!api || typeof api.getCanonicalNotationRows !== 'function') return [];
    try {
      const rows = api.getCanonicalNotationRows(lang || getComboLang());
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function getNotationCustomDisplayRows() {
    const api = getNotationDictApi();
    if (!api || typeof api.getCustomDisplayRows !== 'function') return [];
    try {
      const rows = api.getCustomDisplayRows();
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function decodeNotationDataValue(value) {
    const raw = String(value || '');
    if (!raw) return '';
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  function normalizeDisplayLmTokenInput(rawValue) {
    const raw = String(rawValue || '').replace(/\u00a0/g, ' ').trim();
    if (!raw) return '';
    return canonicalizeCommandForStorage(normalizeDisplayCommandInput(raw, { applyUnknownRules: false })).trim();
  }

  function fillNotationDisplayInputs(lmToken) {
    const modal = qs('comboNotationModal');
    if (!modal) return;
    const api = getNotationDictApi();
    const lmInput = modal.querySelector('#comboNotationDisplayLmInput');
    const jpInput = modal.querySelector('#comboNotationDisplayJpInput');
    const enInput = modal.querySelector('#comboNotationDisplayEnInput');
    const token = normalizeDisplayLmTokenInput(lmToken);
    if (lmInput) lmInput.value = token;
    if (jpInput) jpInput.value = '';
    if (enInput) enInput.value = '';
    if (!token || !api || typeof api.getCustomDisplayForLM !== 'function') return;
    try {
      if (jpInput) jpInput.value = String(api.getCustomDisplayForLM(token, 'jp') || '');
      if (enInput) enInput.value = String(api.getCustomDisplayForLM(token, 'en') || '');
    } catch {
      if (jpInput) jpInput.value = '';
      if (enInput) enInput.value = '';
    }
  }

  function ensureNotationManagerModal() {
    const ensurePreviewActionPlacement = (root) => {
      if (!root) return;
      const section = root.querySelector('.combo-notation-import-preview');
      if (!section) return;
      const wrap = section.querySelector('.combo-notation-import-preview-wrap');
      const actions = section.querySelector('.combo-notation-import-preview-actions');
      if (!wrap || !actions) return;
      if (actions.previousElementSibling === wrap) return;
      section.insertBefore(actions, wrap.nextSibling);
    };
    let modal = qs('comboNotationModal');
    if (modal) {
      ensurePreviewActionPlacement(modal);
      return modal;
    }
    const lang = getComboLang();
    const title = comboT('ui.notation_title', lang) || 'Notation Dictionary (Import)';
    const closeLabel = comboT('ui.notation_close', lang) || 'Close';

    modal = document.createElement('div');
    modal.id = 'comboNotationModal';
    modal.className = 'combo-keymap-modal combo-notation-modal hidden';
    modal.innerHTML = `
      <div class="combo-keymap-content combo-notation-content">
        <header>
          <button type="button" class="tutorial-flow-trigger tutorial-flow-trigger-modal combo-notation-help-trigger"
            data-tutorial-flow="import-notation" aria-label="Notation dictionary guide"
            title="Notation dictionary guide">?</button>
          <h3>${title}</h3>
        </header>
        <div class="combo-notation-import-preview">
          <h4 class="combo-notation-section-title" data-notation-label="notation_import_preview_title">${comboT('ui.notation_import_preview_title', lang) || 'Import Notation Preview'}</h4>
          <p class="combo-notation-test-desc" data-notation-label="notation_import_preview_desc">${comboT('ui.notation_import_preview_desc', lang) || ''}</p>
          <div class="combo-notation-import-preview-wrap">
            <table class="combo-notation-import-preview-table">
              <thead>
                <tr>
                  <th data-notation-label="notation_import_preview_idx">${comboT('ui.notation_import_preview_idx', lang) || '#'}</th>
                  <th data-notation-label="notation_import_preview_input">${comboT('ui.notation_import_preview_input', lang) || 'Input'}</th>
                  <th data-notation-label="notation_import_preview_canonical">${comboT('ui.notation_import_preview_canonical', lang) || 'LM Canonical'}</th>
                  <th data-notation-label="notation_import_preview_buttons">${comboT('ui.notation_import_preview_buttons', lang) || 'Buttons'}</th>
                  <th data-notation-label="notation_import_preview_unknown">${comboT('ui.notation_import_preview_unknown', lang) || 'Unknown'}</th>
                </tr>
              </thead>
              <tbody id="comboNotationImportPreviewBody"></tbody>
            </table>
          </div>
          <div class="combo-notation-import-preview-actions">
            <button type="button" data-action="preview-existing" data-notation-label="notation_preview_existing">${comboT('ui.notation_preview_existing', lang) || 'Reload'}</button>
          </div>
        </div>
        <div class="combo-notation-unknown-manage">
          <h4 class="combo-notation-section-title" data-notation-label="notation_unknown_manage_title">${comboT('ui.notation_unknown_manage_title', lang) || 'Unknown Token Handling'}</h4>
          <p class="combo-notation-test-desc" data-notation-label="notation_unknown_manage_desc">${comboT('ui.notation_unknown_manage_desc', lang) || ''}</p>
          <div class="combo-notation-unknown-wrap">
            <div id="comboNotationUnknownManageBody" class="combo-notation-unknown-grid"></div>
          </div>
          <div class="combo-notation-unknown-actions">
            <button type="button" data-action="unknown-apply" data-notation-label="notation_unknown_apply_existing">${comboT('ui.notation_unknown_apply_existing', lang) || 'Apply'}</button>
          </div>
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
      if (action === 'set-display') {
        handleNotationDisplaySet();
        return;
      }
      if (action === 'clear-display') {
        handleNotationDisplayClear(ev.target.dataset.lm || '');
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
      if (action === 'display-edit') {
        handleNotationDisplayEdit(ev.target.dataset.lm || '');
        return;
      }
      if (action === 'delete') {
        handleNotationDelete(ev.target.dataset.alias || '');
        return;
      }
      if (action === 'toggle-default') {
        handleNotationToggleDefault(ev.target.dataset.alias || '', ev.target.checked);
        return;
      }
      if (action === 'unknown-apply') {
        handleNotationUnknownApplyAll({ applyExisting: true }, modal);
        return;
      }
      if (action === 'preview-existing') {
        buildNotationPreviewFromExistingCombos();
        renderNotationImportPreviewRows();
      }
    });

    modal.addEventListener('change', (ev) => {
      const target = ev.target;
      if (!target || !target.classList) return;
      if (target.classList.contains('combo-notation-unknown-check')) {
        handleNotationUnknownCheckboxToggle(target);
        return;
      }
      if (target.classList.contains('combo-notation-unknown-input')) {
        handleNotationUnknownInputDraft(target);
      }
    });

    modal.addEventListener('input', (ev) => {
      const target = ev.target;
      if (!target || !target.classList) return;
      if (target.classList.contains('combo-notation-unknown-input')) {
        handleNotationUnknownInputDraft(target);
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
    const rows = getNotationManagerRows(lang).filter((row) => row.source === 'user');
    state.notationManagerRows = rows.slice();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4">-</td></tr>';
      return;
    }
    body.innerHTML = rows.map((row) => {
      const aliasEsc = escapeHtml(row.alias);
      const lmLabel = formatCommandForDisplay(row.lmToken, lang, 'default');
      const lmEsc = escapeHtml(lmLabel);
      const displayHtml = renderNotationButtonsFromCanonical(row.lmToken, lang);
      const lmData = escapeHtml(encodeURIComponent(String(row.lmToken || '')));
      const displayEditBtn = `<button type="button" data-action="display-edit" data-lm="${lmData}">${comboT('ui.notation_display_edit', lang) || 'Edit Display'}</button>`;
      const actions = `${displayEditBtn}
           <button type="button" data-action="edit" data-alias="${aliasEsc}">${comboT('ui.notation_action_edit', lang) || 'Edit'}</button>
           <button type="button" data-action="delete" data-alias="${aliasEsc}">${comboT('ui.notation_action_delete', lang) || 'Delete'}</button>`;
      return `<tr>
        <td>${aliasEsc}</td>
        <td>${lmEsc}</td>
        <td class="combo-notation-buttons"><div class="combo-notation-buttons-wrap">${displayHtml}</div></td>
        <td>${actions}</td>
      </tr>`;
    }).join('');
  }

  function collectDetectedNotationAliasMap() {
    const out = new Map();
    const preview = state.notationImportPreview && typeof state.notationImportPreview === 'object'
      ? state.notationImportPreview
      : null;
    const rows = preview && Array.isArray(preview.rows) ? preview.rows : [];
    rows.forEach((row) => {
      const list = Array.isArray(row && row.replacementSummary) ? row.replacementSummary : [];
      list.forEach((item) => {
        const text = String(item || '').trim();
        const match = text.match(/^(.*?)\s*->\s*(.+)$/);
        if (!match) return;
        const alias = String(match[1] || '').trim();
        const lmToken = canonicalizeCommandForStorage(String(match[2] || '').trim());
        if (!alias || !lmToken) return;
        if (!out.has(lmToken)) out.set(lmToken, new Set());
        out.get(lmToken).add(alias);
      });
    });
    return out;
  }

  function collectUserNotationAliases(lang) {
    return getNotationManagerRows(lang)
      .filter((row) => row.source === 'user')
      .map((row) => String(row && row.alias ? row.alias : '').trim())
      .filter(Boolean);
  }

  function collectDetectedNotationAliases() {
    const out = [];
    const seen = new Set();
    const push = (value) => {
      const alias = String(value || '').trim();
      if (!alias) return;
      const key = alias.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(alias);
    };

    const detectedMap = collectDetectedNotationAliasMap();
    detectedMap.forEach((aliasSet) => {
      Array.from(aliasSet || []).forEach((alias) => push(alias));
    });

    const preview = state.notationImportPreview && typeof state.notationImportPreview === 'object'
      ? state.notationImportPreview
      : null;
    const rows = preview && Array.isArray(preview.rows) ? preview.rows : [];
    rows.forEach((row) => {
      const raw = String(row && row.raw ? row.raw : '');
      if (!raw) return;
      raw
        .split(/[>\n\r,+＋/／|｜→⇒]+/g)
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .forEach((part) => {
          const resolved = canonicalizeCommandForStorage(String(normalizeCommandForStorage(part).canonical || ''));
          const direct = canonicalizeCommandForStorage(part);
          const looksJp = /[\u3040-\u30ff\u3400-\u9fff]/.test(part);
          const looksStCr = /\b(?:st|cr|j|jump|f|b)\s*[.,]/i.test(part);
          if (!resolved) return;
          if (resolved !== direct || looksJp || looksStCr) push(part);
        });
    });
    return out;
  }

  function resolveNotationAliasToLmToken(aliasText) {
    const alias = String(aliasText || '').trim();
    if (!alias) return '';
    const normalized = normalizeCommandForStorage(alias);
    return canonicalizeCommandForStorage(String(normalized && normalized.canonical ? normalized.canonical : '')).trim();
  }

  function getNotationInputIconRows(lang) {
    const aliases = [];
    const seen = new Set();
    const pushAlias = (value) => {
      const alias = String(value || '').trim();
      if (!alias) return;
      const key = alias.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      aliases.push(alias);
    };

    collectDetectedNotationAliases().forEach(pushAlias);
    collectUserNotationAliases(lang).forEach(pushAlias);

    const rows = aliases.map((alias) => {
      const lmToken = resolveNotationAliasToLmToken(alias);
      return {
        alias,
        lmToken,
        label: lmToken ? localizeCommandForDisplay(lmToken, lang) : '-',
      };
    });

    const MIN_EDITABLE_ROWS = 12;
    while (rows.length < MIN_EDITABLE_ROWS) {
      rows.push({ alias: '', lmToken: '', label: '-' });
    }

    const notationMapPreferredOrder = [
      // Directional
      '7', '8', '9', '4', '5', '6', '1', '2', '3', '4(タメ)', '2(タメ)', '360',
      // Attack
      'LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'L', 'M', 'H', 'P', 'K', 'SP', 'Auto', '投げ', 'Any',
      // Utility
      'Jump', 'Hold', 'or', '-', '>', '>>', 'DP', 'DI', 'DR', 'CR', '[]',
    ];
    const orderMap = new Map(notationMapPreferredOrder.map((token, idx) => [String(token), idx]));
    const sectionRank = { directional: 0, attack: 1, utility: 2, unmapped: 3 };
    rows.sort((a, b) => {
      const aToken = String(a && a.lmToken ? a.lmToken : '');
      const bToken = String(b && b.lmToken ? b.lmToken : '');
      const aSection = getNotationMapSectionKey(aToken);
      const bSection = getNotationMapSectionKey(bToken);
      const aRank = Object.prototype.hasOwnProperty.call(sectionRank, aSection) ? sectionRank[aSection] : 9;
      const bRank = Object.prototype.hasOwnProperty.call(sectionRank, bSection) ? sectionRank[bSection] : 9;
      if (aRank !== bRank) return aRank - bRank;
      const aIdx = orderMap.has(aToken) ? orderMap.get(aToken) : Number.MAX_SAFE_INTEGER;
      const bIdx = orderMap.has(bToken) ? orderMap.get(bToken) : Number.MAX_SAFE_INTEGER;
      if (aIdx !== bIdx) return aIdx - bIdx;
      const aAlias = String(a && a.alias ? a.alias : '');
      const bAlias = String(b && b.alias ? b.alias : '');
      return aAlias.localeCompare(bAlias, 'en');
    });

    return rows;
  }

  function getNotationMapSectionKey(lmToken) {
    const raw = String(lmToken || '').trim();
    if (!raw) return 'unmapped';
    const token = raw.toUpperCase();
    if (/^[1-9]$/.test(raw) || raw === '4(タメ)' || raw === '2(タメ)' || raw === '360') {
      return 'directional';
    }
    if (
      ['LP', 'MP', 'HP', 'LK', 'MK', 'HK', 'P', 'K', 'L', 'M', 'H', 'SP', 'AUTO', 'PP', 'KK', 'ANY', 'THROW'].includes(token)
      || raw === '投げ'
    ) {
      return 'attack';
    }
    return 'utility';
  }

  function getNotationMapSectionLabel(sectionKey, lang) {
    const active = String(lang || getComboLang() || 'jp').toLowerCase();
    if (active === 'en') {
      if (sectionKey === 'directional') return 'Directional';
      if (sectionKey === 'attack') return 'Attack';
      if (sectionKey === 'unmapped') return 'Unmapped';
      return 'Utility';
    }
    if (sectionKey === 'directional') return '方向';
    if (sectionKey === 'attack') return '攻撃';
    if (sectionKey === 'unmapped') return '未割り当て';
    return 'ユーティリティ';
  }

  function renderNotationMappingRows() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationMappingBody');
    if (!body) return;
    const lang = getComboLang();
    const iconRows = getNotationInputIconRows(lang);
    const setsPerRow = 6;
    const colCount = setsPerRow * 3;
    if (!iconRows.length) {
      body.innerHTML = `<tr><td colspan="${colCount}">-</td></tr>`;
      return;
    }
    const userPlaceholder = '-';
    const sectionOrder = ['directional', 'attack', 'utility', 'unmapped'];
    const grouped = new Map(sectionOrder.map((key) => [key, []]));
    iconRows.forEach((row) => {
      const lmToken = canonicalizeCommandForStorage(String(row && row.lmToken ? row.lmToken : ''));
      const section = getNotationMapSectionKey(lmToken);
      if (!grouped.has(section)) grouped.set(section, []);
      grouped.get(section).push(row);
    });
    const rowsHtml = [];
    let mapCounter = 0;
    sectionOrder.forEach((sectionKey) => {
      const sectionRows = grouped.get(sectionKey) || [];
      if (!sectionRows.length) return;
      const sectionLabel = escapeHtml(getNotationMapSectionLabel(sectionKey, lang));
      rowsHtml.push(`<tr class="combo-notation-map-section"><td colspan="${colCount}">${sectionLabel}</td></tr>`);
      for (let i = 0; i < sectionRows.length; i += setsPerRow) {
        const chunk = sectionRows.slice(i, i + setsPerRow);
        const cells = [];
        for (let c = 0; c < setsPerRow; c += 1) {
          const row = chunk[c];
          if (!row) {
            cells.push('<td class="combo-notation-map-cell empty"></td><td class="combo-notation-map-cell empty"></td><td class="combo-notation-map-cell empty"></td>');
            continue;
          }
          const aliasValue = String(row && row.alias ? row.alias : '').trim();
          const lmToken = resolveNotationAliasToLmToken(aliasValue);
          const buttonHtml = lmToken ? renderSingleNotationIconFromCanonical(lmToken, lang) : '-';
          const lmLabel = escapeHtml(lmToken ? formatCommandForDisplay(lmToken, lang, 'default') : '-');
          const mapId = `nmap-${mapCounter++}`;
          cells.push(`
          <td class="combo-notation-map-cell combo-notation-map-cell-buttons combo-notation-buttons" data-map-id="${mapId}"><div class="combo-notation-buttons-wrap">${buttonHtml}</div></td>
          <td class="combo-notation-map-cell combo-notation-map-cell-lm" data-map-id="${mapId}">${lmLabel}</td>
          <td class="combo-notation-map-cell combo-notation-map-cell-user"><input type="text" class="combo-notation-map-input" data-map-id="${mapId}" value="${escapeHtml(aliasValue)}" placeholder="${userPlaceholder}"></td>
        `);
        }
        rowsHtml.push(`<tr>${cells.join('')}</tr>`);
      }
    });
    body.innerHTML = rowsHtml.join('');
  }

  function renderNotationButtonsFromCanonical(canonicalCommand, lang) {
    const canonical = canonicalizeCommandForStorage(String(canonicalCommand || ''));
    const tokens = parseButtonsValue(canonical);
    if (!tokens.length) {
      return escapeHtml(formatCommandForDisplay(canonical, lang, 'default'));
    }
    return tokens.map((token) => {
      const icon = getButtonIcon(token);
      const label = localizeCommandForDisplay(displayLabelForToken(token), lang);
      if (!icon) {
        return `<span class="btn-token btn-token-fallback">${escapeHtml(label)}</span>`;
      }
      return `<span class="btn-token" title="${escapeHtml(label)}"><img alt="${escapeHtml(label)}" src="${icon.src}"><span class="btn-token-text">${escapeHtml(label)}</span></span>`;
    }).join('');
  }

  function pickSingleNotationIconToken(canonicalCommand) {
    const canonical = canonicalizeCommandForStorage(String(canonicalCommand || ''));
    if (!canonical) return '';
    if (getButtonIcon(canonical)) return canonical;
    const tokens = parseButtonsValue(canonical);
    if (!tokens.length) return '';
    const withIcon = tokens.filter((token) => !!getButtonIcon(token));
    if (!withIcon.length) return '';
    const nonDirectional = withIcon.filter((token) => !/^[1-9]$/.test(String(token || '')));
    if (nonDirectional.length) return String(nonDirectional[nonDirectional.length - 1] || '');
    return String(withIcon[withIcon.length - 1] || '');
  }

  function renderSingleNotationIconFromCanonical(canonicalCommand, lang) {
    const token = pickSingleNotationIconToken(canonicalCommand);
    if (!token) {
      return escapeHtml(formatCommandForDisplay(canonicalCommand, lang, 'default') || '-');
    }
    const icon = getButtonIcon(token);
    const label = localizeCommandForDisplay(displayLabelForToken(token), lang);
    if (!icon) {
      return `<span class="btn-token btn-token-fallback">${escapeHtml(label)}</span>`;
    }
    return `<span class="btn-token" title="${escapeHtml(label)}"><img alt="${escapeHtml(label)}" src="${icon.src}"><span class="btn-token-text">${escapeHtml(label)}</span></span>`;
  }

  function updateNotationMappingPreviewForInput(input) {
    const modal = qs('comboNotationModal');
    if (!modal || !input) return;
    const mapId = String(input.dataset.mapId || '').trim();
    if (!mapId) return;
    const row = input.closest('tr');
    if (!row) return;
    const buttonsCell = row.querySelector(`td.combo-notation-map-cell-buttons[data-map-id="${mapId}"]`);
    const lmCell = row.querySelector(`td.combo-notation-map-cell-lm[data-map-id="${mapId}"]`);
    if (!buttonsCell || !lmCell) return;
    const alias = String(input.value || '').trim();
    const lmToken = resolveNotationAliasToLmToken(alias);
    const lang = getComboLang();
    lmCell.textContent = lmToken ? formatCommandForDisplay(lmToken, lang, 'default') : '-';
    const wrap = buttonsCell.querySelector('.combo-notation-buttons-wrap');
    if (wrap) {
      wrap.innerHTML = lmToken ? renderSingleNotationIconFromCanonical(lmToken, lang) : '-';
    }
  }

  function renderNotationImportPreviewRows() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationImportPreviewBody');
    if (!body) return;
    const preview = state.notationImportPreview && typeof state.notationImportPreview === 'object'
      ? state.notationImportPreview
      : null;
    const rows = preview && Array.isArray(preview.rows) ? preview.rows : [];
    const lang = getComboLang();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="5">-</td></tr>';
      renderNotationUnknownManageRows();
      return;
    }
    body.innerHTML = rows.map((row) => {
      const rowInfo = getNotationImportPreviewRowInfo(row, lang);
      const unknownHtml = rowInfo.unknown.length
        ? rowInfo.unknown.map((item) => `<span class="chip unknown">${escapeHtml(item)}</span>`).join(' <span class="chip-sep">|</span> ')
        : '-';
      return `<tr>
        <td>${Number(row && row.index ? row.index : 0) || '-'}</td>
        <td>${escapeHtml(rowInfo.raw || '-')}</td>
        <td>${escapeHtml(rowInfo.canonical || '-')}</td>
        <td class="combo-notation-buttons"><div class="combo-notation-buttons-wrap">${rowInfo.buttonsHtml}</div></td>
        <td>${unknownHtml}</td>
      </tr>`;
    }).join('');
    renderNotationUnknownManageRows();
  }

  function getNotationImportPreviewRowInfo(row, lang, options = {}) {
    const raw = String(row && row.raw ? row.raw : '').trim();
    const liveNormalized = raw ? normalizeCommandForStorage(raw) : null;
    const canonical = canonicalizeCommandForStorage(String(
      (liveNormalized && liveNormalized.canonical)
      || (row && row.canonical)
      || '',
    ));
    const display = formatCommandForDisplay(canonical, lang);
    const buttonsHtml = renderNotationButtonsFromCanonical(canonical, lang);
    const unknownFromNormalize = Array.isArray(liveNormalized && liveNormalized.unknown)
      ? liveNormalized.unknown
      : [];
    const includeSuppressed = options && options.includeSuppressed === true;
    let unknown = Array.from(new Set([
      ...unknownFromNormalize.map((item) => String(item || '').trim()).filter(Boolean),
      ...collectPreviewSyntaxUnknowns(raw, canonical),
      ...collectButtonParseUnknowns(canonical),
    ])).filter((term) => (
      includeSuppressed
      || !shouldSuppressUnknownNotationTerm(term)
    ));
    unknown = dedupeBracketUnknownTerms(unknown, raw, canonical);
    return {
      raw,
      canonical,
      display,
      buttonsHtml,
      unknown,
    };
  }

  function collectNotationImportUnknownTerms() {
    const preview = state.notationImportPreview && typeof state.notationImportPreview === 'object'
      ? state.notationImportPreview
      : null;
    const rows = preview && Array.isArray(preview.rows) ? preview.rows : [];
    if (!rows.length) return [];
    const lang = getComboLang();
    const terms = [];
    const seen = new Set();
    const push = (value) => {
      const term = String(value || '').trim();
      if (!term) return;
      const key = normalizeNotationUnknownRuleKey(term);
      if (!key || seen.has(key)) return;
      seen.add(key);
      terms.push(term);
    };
    rows.forEach((row) => {
      const info = getNotationImportPreviewRowInfo(row, lang, { includeSuppressed: false });
      info.unknown.forEach((term) => push(term));
    });
    return terms;
  }

  function getNotationUnknownDraftMode(row) {
    if (!row) return '';
    const selected = row.querySelector('.combo-notation-unknown-check:checked');
    return selected ? String(selected.dataset.mode || '').trim() : '';
  }

  function resolveNotationUnknownTestValue(term, mode, replaceInput) {
    const text = String(term || '').trim();
    if (!text) return '';
    const action = normalizeNotationUnknownRuleAction(mode);
    if (action === 'delete') return '';
    if (action === 'replace') {
      return canonicalizeCommandForStorage(String(replaceInput || '').trim());
    }
    return text;
  }

  function buildNotationUnknownTestPreviewHtml(term, mode, replaceInput, lang) {
    const testValue = resolveNotationUnknownTestValue(term, mode, replaceInput);
    if (!testValue) return '';
    const action = normalizeNotationUnknownRuleAction(mode);
    if (action === 'replace') {
      const canonical = canonicalizeCommandForStorage(testValue);
      const buttonsHtml = renderNotationButtonsFromCanonical(canonical, lang);
      if (buttonsHtml && buttonsHtml !== '-') {
        return `<div class="combo-notation-buttons-wrap">${buttonsHtml}</div>`;
      }
      return escapeHtml(canonical);
    }
    return escapeHtml(testValue);
  }

  function updateNotationUnknownDraftRow(row) {
    if (!row) return;
    const mode = getNotationUnknownDraftMode(row);
    const input = row.querySelector('.combo-notation-unknown-input');
    const out = row.querySelector('.combo-notation-unknown-test');
    if (input) input.disabled = false;
    if (!out) return;
    const term = decodeNotationDataValue(String(out.dataset.term || ''));
    const replaceInput = input ? String(input.value || '').trim() : '';
    const previewHtml = buildNotationUnknownTestPreviewHtml(term, mode, replaceInput, getComboLang());
    out.innerHTML = previewHtml;
  }

  function renderNotationUnknownManageRows(modalRoot = null) {
    const modal = modalRoot || qs('comboNotationModal');
    if (!modal) return;
    if (!modalRoot && modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationUnknownManageBody')
      || modal.querySelector('#comboXlsxUnknownManageBody');
    if (!body) return;
    const lang = getComboLang();
    const terms = collectNotationImportUnknownTerms();
    if (!terms.length) {
      body.innerHTML = '<div class="combo-notation-unknown-empty">-</div>';
      return;
    }
    const buildRowsHtml = (subset) => subset.map((term) => {
      const rule = getNotationUnknownRule(term);
      const action = normalizeNotationUnknownRuleAction(rule && rule.action) || '';
      const replaceTo = canonicalizeCommandForStorage(String(rule && rule.replaceTo ? rule.replaceTo : '').trim());
      const termData = escapeHtml(encodeURIComponent(term));
      const testHtml = buildNotationUnknownTestPreviewHtml(term, action, replaceTo, lang);
      return `<tr>
        <td data-term-row="1"><span class="chip unknown">${escapeHtml(term)}</span></td>
        <td class="combo-notation-unknown-check-cell" data-term-row="1">
          <input type="checkbox" class="combo-notation-unknown-check" data-mode="ignore" data-term="${termData}"${action === 'ignore' ? ' checked' : ''}>
        </td>
        <td class="combo-notation-unknown-check-cell" data-term-row="1">
          <input type="checkbox" class="combo-notation-unknown-check" data-mode="delete" data-term="${termData}"${action === 'delete' ? ' checked' : ''}>
        </td>
        <td class="combo-notation-unknown-check-cell" data-term-row="1">
          <input type="checkbox" class="combo-notation-unknown-check" data-mode="replace" data-term="${termData}"${action === 'replace' ? ' checked' : ''}>
        </td>
        <td data-term-row="1">
          <input type="text" class="combo-notation-unknown-input" data-term="${termData}" value="${escapeHtml(replaceTo)}" placeholder="e.g. 2LP">
        </td>
        <td class="combo-notation-unknown-test" data-term="${termData}" data-term-row="1">${testHtml}</td>
      </tr>`;
    }).join('');

    const buildTableHtml = (subset) => `
      <table class="combo-notation-unknown-table">
        <thead>
          <tr>
            <th data-notation-label="notation_unknown_term">${comboT('ui.notation_unknown_term', lang) || 'Unknown'}</th>
            <th data-notation-label="notation_unknown_ignore">${comboT('ui.notation_unknown_ignore', lang) || 'Ignore'}</th>
            <th data-notation-label="notation_unknown_delete">${comboT('ui.notation_unknown_delete', lang) || 'Delete'}</th>
            <th data-notation-label="notation_unknown_replace">${comboT('ui.notation_unknown_replace', lang) || 'Replace'}</th>
            <th data-notation-label="notation_unknown_input">${comboT('ui.notation_unknown_input', lang) || 'Input (LM)'}</th>
            <th data-notation-label="notation_unknown_test">${comboT('ui.notation_unknown_test', lang) || 'Test'}</th>
          </tr>
        </thead>
        <tbody>${buildRowsHtml(subset)}</tbody>
      </table>
    `;

    const splitAt = Math.ceil(terms.length / 2);
    const left = terms.slice(0, splitAt);
    const right = terms.slice(splitAt);
    const tables = [left];
    if (right.length) tables.push(right);
    body.innerHTML = tables.map((subset) => buildTableHtml(subset)).join('');
  }

  function setNotationUnknownDraftMode(row, mode, checked) {
    if (!row) return;
    const checks = Array.from(row.querySelectorAll('.combo-notation-unknown-check'));
    if (checked) {
      checks.forEach((cb) => {
        cb.checked = cb.dataset.mode === mode;
      });
    } else {
      checks.forEach((cb) => {
        if (cb.dataset.mode === mode) cb.checked = false;
      });
    }
    updateNotationUnknownDraftRow(row);
  }

  function handleNotationUnknownCheckboxToggle(inputEl) {
    if (!inputEl) return;
    const row = inputEl.closest('tr');
    if (!row) return;
    const mode = String(inputEl.dataset.mode || '').trim();
    if (!mode) return;
    setNotationUnknownDraftMode(row, mode, !!inputEl.checked);
  }

  function handleNotationUnknownInputDraft(inputEl) {
    if (!inputEl) return;
    const row = inputEl.closest('tr');
    if (!row) return;
    if (String(inputEl.value || '').trim()) {
      const replaceCheck = row.querySelector('.combo-notation-unknown-check[data-mode="replace"]');
      if (replaceCheck && !replaceCheck.checked) {
        setNotationUnknownDraftMode(row, 'replace', true);
      }
    }
    updateNotationUnknownDraftRow(row);
  }

  function applyNotationRulesToExistingCombos() {
    const combos = Array.isArray(state.combos) ? state.combos : [];
    if (!combos.length) {
      resetNotationImportPreview();
      return { total: 0, updated: 0 };
    }
    resetNotationImportPreview();
    const lang = getComboLang();
    let total = 0;
    let updated = 0;
    combos.forEach((combo, row) => {
      const rawCommand = String(combo && combo.command ? combo.command : '').trim();
      if (!rawCommand) return;
      const normalized = normalizeCommandForStorage(rawCommand);
      const canonical = canonicalizeCommandForStorage(String(normalized && normalized.canonical ? normalized.canonical : ''));
      recordNotationImportPreview(rawCommand, { ...normalized, canonical });
      total += 1;
      if (canonical !== rawCommand) updated += 1;
      combo.command = canonical;
      combo.buttons = canonical;
      const group = state.groups[row];
      if (group && group.inputs) {
        const commandInput = group.inputs.command;
        if (commandInput && commandInput.classList && commandInput.classList.contains('cmd-input')) {
          commandInput.textContent = formatCommandForDisplay(canonical, lang);
        }
        const buttonsInput = group.inputs.buttons;
        if (buttonsInput) renderButtonsInput(buttonsInput, canonical);
      }
      if (canonical.trim()) {
        combo._manual = false;
        ensureComboControlMode(combo, state.controlMode);
        ensureComboAuthoredVersion(combo);
        syncAuthoredVersionInput(row);
      }
      refreshCommandWarning(row);
    });
    if (total > 0) {
      persist();
      updateEmptyGroups();
      applyFilters();
    }
    return { total, updated };
  }

  function handleNotationUnknownApplyAll(options = {}, modalRoot = null) {
    const opts = options || {};
    const applyExisting = opts.applyExisting === true;
    const modal = modalRoot || qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationUnknownManageBody')
      || modal.querySelector('#comboXlsxUnknownManageBody');
    if (!body) return;
    const api = getNotationDictApi();
    const rows = Array.from(body.querySelectorAll('.combo-notation-unknown-table tbody tr'));
    rows.forEach((row) => {
      const checkboxes = Array.from(row.querySelectorAll('.combo-notation-unknown-check'));
      if (!checkboxes.length) return;
      const selected = checkboxes.find((cb) => cb.checked);
      const term = decodeNotationDataValue(String((selected || checkboxes[0]).dataset.term || ''));
      if (!term) return;
      const mode = selected ? String(selected.dataset.mode || '').trim() : '';
      if (!mode) {
        setNotationUnknownRule(term, '');
        return;
      }
      if (mode === 'ignore' || mode === 'delete') {
        setNotationUnknownRule(term, mode, '');
        return;
      }
      if (mode === 'replace') {
        const replaceInput = row.querySelector('.combo-notation-unknown-input');
        const lmToken = canonicalizeCommandForStorage(String(replaceInput && replaceInput.value ? replaceInput.value : '').trim());
        if (!lmToken) {
          setNotationUnknownRule(term, '');
          return;
        }
        setNotationUnknownRule(term, 'replace', lmToken);
        if (api && typeof api.addOrUpdateUserAlias === 'function') {
          try {
            api.addOrUpdateUserAlias(term, lmToken);
          } catch { }
        }
      }
    });
    if (applyExisting) {
      const result = applyNotationRulesToExistingCombos();
      if (!result.total) {
        showExportToast(comboMsg('notation_apply_existing_none'), false, { dim: false });
      } else {
        showExportToast(comboMsg('notation_apply_existing_done', {
          updated: result.updated,
          total: result.total,
        }), false, { dim: false });
      }
    }
    // Preview rows are derived from normalization rules, so refresh after applying.
    renderNotationImportPreviewRows();
    if (modalRoot && modalRoot.id === 'comboXlsxMapModal') {
      renderXlsxMapPreview(modalRoot);
      renderXlsxMapUnknownManage(modalRoot);
    }
  }

  function renderNotationDisplayRows() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const body = modal.querySelector('#comboNotationDisplayTableBody');
    if (!body) return;
    const rows = getNotationCustomDisplayRows();
    const lang = getComboLang();
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="4">-</td></tr>';
      return;
    }
    body.innerHTML = rows.map((row) => {
      const lmToken = normalizeDisplayLmTokenInput(row && row.lmToken ? row.lmToken : '');
      const lmValue = lmToken || String((row && row.lmToken) || '').trim();
      const jp = String((row && row.jp) || '').trim();
      const en = String((row && row.en) || '').trim();
      const lmEsc = escapeHtml(formatCommandForDisplay(lmValue, lang, 'default'));
      const jpEsc = escapeHtml(jp || '-');
      const enEsc = escapeHtml(en || '-');
      const lmData = escapeHtml(encodeURIComponent(lmValue));
      const editLabel = comboT('ui.notation_display_edit', lang) || 'Edit Display';
      const clearLabel = comboT('ui.notation_display_clear', lang) || 'Clear Display';
      return `<tr>
        <td>${lmEsc}</td>
        <td>${jpEsc}</td>
        <td>${enEsc}</td>
        <td>
          <button type="button" data-action="display-edit" data-lm="${lmData}">${escapeHtml(editLabel)}</button>
          <button type="button" data-action="clear-display" data-lm="${lmData}">${escapeHtml(clearLabel)}</button>
        </td>
      </tr>`;
    }).join('');
  }

  function runNotationTestPreview() {
    const modal = qs('comboNotationModal');
    if (!modal || modal.classList.contains('hidden')) return;
    const input = modal.querySelector('#comboNotationTestInput');
    const outNormalized = modal.querySelector('#comboNotationPreviewNormalized');
    const outReplacements = modal.querySelector('#comboNotationPreviewReplacements');
    const outUnknown = modal.querySelector('#comboNotationPreviewUnknown');
    if (!input || !outNormalized || !outReplacements || !outUnknown) return;
    const raw = String(input.value || '');
    const result = normalizeCommandForStorage(raw);
    const normalizedText = String((result && result.canonical) || '');
    outNormalized.textContent = formatCommandForDisplay(normalizedText, getComboLang());
    const replacements = Array.isArray(result && result.replacements) ? result.replacements : [];
    outReplacements.innerHTML = replacements.length
      ? replacements.map((pair) => `<span class="chip">${escapeHtml(pair.from)} -> ${escapeHtml(formatCommandForDisplay(pair.to, getComboLang()))}</span>`).join(' ')
      : '-';
    const unknown = Array.isArray(result && result.unknown) ? result.unknown : [];
    outUnknown.innerHTML = unknown.length
      ? unknown.map((term) => `<span class="chip unknown">${escapeHtml(term)}</span>`).join(' ')
      : '-';
  }

  function handleNotationDisplaySet() {
    const api = getNotationDictApi();
    if (!api || typeof api.setCustomDisplay !== 'function') return;
    const lmInput = qs('comboNotationDisplayLmInput');
    const jpInput = qs('comboNotationDisplayJpInput');
    const enInput = qs('comboNotationDisplayEnInput');
    const lmToken = normalizeDisplayLmTokenInput(lmInput ? lmInput.value : '');
    const jpLabel = String((jpInput && jpInput.value) || '').trim();
    const enLabel = String((enInput && enInput.value) || '').trim();
    if (!lmToken) {
      window.alert(comboMsg('notation_display_failed'));
      return;
    }
    api.setCustomDisplay(lmToken, jpLabel, enLabel);
    if (lmInput) lmInput.value = lmToken;
    refreshCommandDisplayOnly();
    renderNotationManagerRows();
    renderNotationDisplayRows();
    renderNotationImportPreviewRows();
    runNotationTestPreview();
    showExportToast(comboMsg('notation_display_saved'), false, { dim: false });
  }

  function handleNotationDisplayClear(fromActionValue = '') {
    const api = getNotationDictApi();
    if (!api || typeof api.clearCustomDisplay !== 'function') return;
    const actionToken = normalizeDisplayLmTokenInput(decodeNotationDataValue(fromActionValue));
    const lmInput = qs('comboNotationDisplayLmInput');
    const jpInput = qs('comboNotationDisplayJpInput');
    const enInput = qs('comboNotationDisplayEnInput');
    const inputToken = normalizeDisplayLmTokenInput(lmInput ? lmInput.value : '');
    const lmToken = actionToken || inputToken;
    if (!lmToken) {
      window.alert(comboMsg('notation_display_failed'));
      return;
    }
    api.clearCustomDisplay(lmToken);
    if (lmInput) lmInput.value = lmToken;
    if (jpInput) jpInput.value = '';
    if (enInput) enInput.value = '';
    refreshCommandDisplayOnly();
    renderNotationManagerRows();
    renderNotationDisplayRows();
    renderNotationImportPreviewRows();
    runNotationTestPreview();
    showExportToast(comboMsg('notation_display_cleared'), false, { dim: false });
  }

  function handleNotationDisplayEdit(encodedLmValue) {
    const lmToken = normalizeDisplayLmTokenInput(decodeNotationDataValue(encodedLmValue));
    if (!lmToken) return;
    fillNotationDisplayInputs(lmToken);
    const lmInput = qs('comboNotationDisplayLmInput');
    if (lmInput) lmInput.focus();
  }

  function handleNotationMappingApply() {
    const api = getNotationDictApi();
    if (!api || typeof api.addOrUpdateUserAlias !== 'function') return;
    const modal = qs('comboNotationModal');
    if (!modal) return;
    const inputs = Array.from(modal.querySelectorAll('#comboNotationMappingBody input.combo-notation-map-input'));
    let updated = false;
    inputs.forEach((input) => {
      const alias = String(input && input.value ? input.value : '')
        .split(/[\n,;、]+/)[0];
      const singleAlias = String(alias || '').trim();
      if (!singleAlias) return;
      const lmToken = resolveNotationAliasToLmToken(singleAlias);
      if (!lmToken) return;
      const result = api.addOrUpdateUserAlias(singleAlias, lmToken);
      if (result && result.ok) updated = true;
    });
    if (!updated) return;
    renderNotationMappingRows();
    renderNotationManagerRows();
    runNotationTestPreview();
    showExportToast(comboMsg('notation_add_done'), false, { dim: false });
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
    renderNotationMappingRows();
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
    renderNotationMappingRows();
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
    refreshCommandDisplayOnly();
    fillNotationDisplayInputs('');
    renderNotationMappingRows();
    renderNotationManagerRows();
    renderNotationDisplayRows();
    renderNotationImportPreviewRows();
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
      refreshCommandDisplayOnly();
      renderNotationMappingRows();
      renderNotationManagerRows();
      renderNotationDisplayRows();
      fillNotationDisplayInputs('');
      renderNotationImportPreviewRows();
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
    loadNotationUnknownRules();
    const modal = ensureNotationManagerModal();
    if (!modal) return;
    modal.classList.remove('hidden');
    applyComboUiLabels(getComboLang());
    const preview = state.notationImportPreview && typeof state.notationImportPreview === 'object'
      ? state.notationImportPreview
      : null;
    const hasRows = preview && Array.isArray(preview.rows) && preview.rows.length > 0;
    const needsModeRefresh = !!(hasRows
      && preview
      && preview.source === 'existing'
      && String(preview.mode || '') !== String(state.controlMode || 'classic'));
    if (!hasRows || needsModeRefresh) {
      buildNotationPreviewFromExistingCombos();
    }
    renderNotationImportPreviewRows();
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
      resetRenderLimitForCurrentData();
      const renderTarget = getRenderTargetCount();
      trimGroupCount(renderTarget);
      ensureGroupCount(renderTarget);
      while (state.combos.length < state.groups.length) {
        state.combos.push(defaultCombo());
      }
      state.isDirty = false;
      state.recoverySource = '';
      commitSaveNow(slug);
      applyStateToTable();
      updateEmptyGroups();
      applyFilters();
      updateLoadMoreControl();
      setSelectedGroup(0);
      window.alert(comboMsg('restore_done'));
    } catch {
      window.alert(comboMsg('restore_failed'));
    }
  }

  function handleInputChange(ev) {
    const el = ev.target;
    if (!el || !el.dataset || el.dataset.row == null || !el.dataset.field) return;
    if (ev.type === 'change') pushUndoHistory('edit-field');
    const row = Number(el.dataset.row);
    if (!state.combos[row]) state.combos[row] = defaultCombo();
    if (el.classList && el.classList.contains('cmd-input')) {
      // ContentEditable command/buttons are committed on blur.
      // Still refresh command warnings live while typing.
      if (el.dataset.field === 'command') {
        const liveText = normalizeDisplayCommandInput(
          (el.textContent || '').replace(/\u00a0/g, ' '),
          { applyUnknownRules: false },
        );
        const warnings = getCommandWarnings(liveText, getWarningModeForCombo(state.combos[row]));
        applyCommandWarningToInput(el, warnings);
      }
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

  function isComboViewPasteScopeActive(target) {
    if (!ui.comboView || !ui.table) return false;
    if (!ui.comboView.isConnected || !ui.table.isConnected) return false;
    const viewVisible = !!(ui.comboView.getClientRects && ui.comboView.getClientRects().length);
    if (!viewVisible) return false;
    if (target instanceof Element && ui.comboView.contains(target)) return true;
    const activeEl = document.activeElement;
    if (activeEl instanceof Element && ui.comboView.contains(activeEl)) return true;
    if (getSelectedRowIndexes().length || getSelectedColumnIndexes().length) return true;
    return false;
  }

  function readClipboardTextFromPasteEvent(ev) {
    const dt = ev && ev.clipboardData ? ev.clipboardData : null;
    if (!dt || typeof dt.getData !== 'function') return '';
    const text = dt.getData('text/plain');
    return String(text || '');
  }

  function parseClipboardGridText(text) {
    const normalized = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    while (lines.length && lines[lines.length - 1] === '') lines.pop();
    const rows = lines.map((line) => line.split('\t'));
    const colCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
    return {
      rows,
      rowCount: rows.length,
      colCount,
      hasTab: /\t/.test(normalized),
    };
  }

  function getGridPasteAnchor(target) {
    const selectedRows = getSelectedRowIndexes().slice().sort((a, b) => a - b);
    const selectedColumns = getSelectedColumnIndexes().slice().sort((a, b) => a - b);
    const fieldMap = getFieldColumnMap();
    const anchorEl = target instanceof Element
      ? target.closest('[data-row][data-field]')
      : null;
    const anchorRow = anchorEl ? Number(anchorEl.dataset.row) : NaN;
    const anchorField = anchorEl ? String(anchorEl.dataset.field || '').trim() : '';
    let row = Number.isFinite(anchorRow) && anchorRow >= 0 ? anchorRow : -1;
    let col = anchorField ? Number(fieldMap.get(anchorField) || 0) : 0;
    if (row < 0) {
      const selectedGroup = Number(state.selectedGroup);
      if (selectedRows.length) row = selectedRows[0];
      else if (Number.isFinite(selectedGroup) && selectedGroup >= 0) row = selectedGroup;
      else row = 0;
    }
    if (!col || col <= 0) {
      if (selectedColumns.length) col = selectedColumns[0];
      else col = Number(fieldMap.get('command') || 0);
    }
    if (!col || col <= 0) return null;
    const explicitRows = !anchorEl && selectedRows.length > 1 ? selectedRows : [];
    const explicitColumns = !anchorEl && selectedColumns.length > 1 ? selectedColumns : [];
    return {
      anchorRow: row,
      anchorCol: col,
      explicitRows,
      explicitColumns,
    };
  }

  function resolvePastedSelectValue(field, rawValue) {
    const value = String(rawValue == null ? '' : rawValue).trim();
    if (!value) return '';
    if (field === 'control_mode') {
      const canonical = canonicalControlMode(value);
      if (canonical) return canonical;
    }
    const firstGroup = state.groups && state.groups[0];
    const input = firstGroup && firstGroup.inputs ? firstGroup.inputs[field] : null;
    if (!input || input.tagName !== 'SELECT') return value;
    const normValue = normalizeLabel(value);
    const options = Array.from(input.options || []);
    for (let i = 0; i < options.length; i += 1) {
      const option = options[i];
      if (!option) continue;
      const optionValue = String(option.value || '').trim();
      if (value === optionValue) return optionValue;
      const optionText = String(option.textContent || '').trim();
      if (value === optionText) return optionValue;
      if (normValue && (normalizeLabel(optionValue) === normValue || normalizeLabel(optionText) === normValue)) {
        return optionValue;
      }
    }
    return value;
  }

  function resolvePastedFieldValue(field, rawValue) {
    const text = String(rawValue == null ? '' : rawValue).replace(/\u00a0/g, ' ');
    if (field === 'command') {
      const normalized = normalizeCommandForStorage(text);
      return normalized.canonical;
    }
    if (field === 'buttons') return null;
    if (field === 'special_condition') return text.trim();
    if (NUMERIC_FIELDS.has(field)) return formatNumberText(text.trim());
    return resolvePastedSelectValue(field, text);
  }

  async function applyGridClipboardPaste(rawText, target) {
    const parsed = parseClipboardGridText(rawText);
    if (!parsed.rowCount || !parsed.colCount) return false;
    const matrixLooksGrid = parsed.hasTab || parsed.rowCount > 1;
    if (!matrixLooksGrid) return false;
    const anchor = getGridPasteAnchor(target);
    if (!anchor) return false;
    await ensureNotationDictionaryLoaded();
    const touchedRows = new Set();
    let historyPushed = false;
    let changed = false;
    for (let r = 0; r < parsed.rowCount; r += 1) {
      const rowData = Array.isArray(parsed.rows[r]) ? parsed.rows[r] : [];
      const targetRow = Number.isFinite(anchor.explicitRows[r])
        ? anchor.explicitRows[r]
        : (anchor.anchorRow + r);
      if (!Number.isFinite(targetRow) || targetRow < 0) continue;
      let combo = state.combos[targetRow] || defaultCombo();
      let needsAttach = targetRow >= state.combos.length || !state.combos[targetRow];
      let rowChanged = false;
      for (let c = 0; c < rowData.length; c += 1) {
        const targetCol = Number.isFinite(anchor.explicitColumns[c])
          ? anchor.explicitColumns[c]
          : (anchor.anchorCol + c);
        if (!Number.isFinite(targetCol) || targetCol <= 0) continue;
        const field = getFieldByColumnIndex(targetCol);
        if (!field || field === 'buttons') continue;
        const nextValue = resolvePastedFieldValue(field, rowData[c]);
        if (nextValue == null) continue;
        if (field === 'command') {
          const prevCommand = String(combo.command || '');
          if (prevCommand !== nextValue) {
            if (!historyPushed) {
              pushUndoHistory('paste-grid');
              historyPushed = true;
            }
            if (needsAttach) {
              while (targetRow >= state.combos.length) state.combos.push(defaultCombo());
              combo = state.combos[targetRow] || defaultCombo();
              state.combos[targetRow] = combo;
              needsAttach = false;
            }
            combo.command = nextValue;
            combo.buttons = nextValue;
            rowChanged = true;
          }
          if (String(nextValue || '').trim()) {
            combo._manual = false;
            ensureComboControlMode(combo, state.controlMode);
            ensureComboAuthoredVersion(combo);
          }
          continue;
        }
        const prevValue = String(combo[field] || '');
        if (prevValue !== String(nextValue || '')) {
          if (!historyPushed) {
            pushUndoHistory('paste-grid');
            historyPushed = true;
          }
          if (needsAttach) {
            while (targetRow >= state.combos.length) state.combos.push(defaultCombo());
            combo = state.combos[targetRow] || defaultCombo();
            state.combos[targetRow] = combo;
            needsAttach = false;
          }
          combo[field] = nextValue;
          rowChanged = true;
        }
        if (String(nextValue || '').trim()) {
          combo._manual = false;
          if (field !== 'game_version') ensureComboAuthoredVersion(combo);
        }
      }
      if (rowChanged) {
        syncDerivedComboFields(combo);
        touchedRows.add(targetRow);
        changed = true;
      }
    }
    if (!changed) return false;
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    while (state.combos.length < state.groups.length) {
      state.combos.push(defaultCombo());
    }
    const touched = Array.from(touchedRows).sort((a, b) => a - b);
    const rangeStart = touched.length ? touched[0] : 0;
    const rangeEnd = touched.length ? (touched[touched.length - 1] + 1) : state.groups.length;
    persist();
    applyStateToTable({ rangeStart, rangeEnd });
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    if (touched.length) {
      const active = touched[touched.length - 1];
      setSelectedRows(touched, { scroll: false, activeIndex: active, anchorIndex: active });
    }
    return true;
  }

  function handleComboGridPaste(ev) {
    if (ev.defaultPrevented) return;
    if (!isComboViewPasteScopeActive(ev.target)) return;
    if (isComboModalOpen()) return;
    const text = readClipboardTextFromPasteEvent(ev);
    if (!text) return;
    const parsed = parseClipboardGridText(text);
    const targetEditable = isEditableTargetElement(ev.target);
    const matrixLooksGrid = parsed.hasTab || (parsed.rowCount > 1 && !targetEditable);
    if (!matrixLooksGrid) return;
    ev.preventDefault();
    void applyGridClipboardPaste(text, ev.target);
  }

  function handleCommandPaste(ev) {
    if (ev.defaultPrevented) return;
    const target = ev.target;
    if (!target || !target.classList || !target.classList.contains('cmd-input')) return;
    if (target.dataset.field !== 'command') return;
    const row = Number(target.dataset.row);
    if (!Number.isFinite(row) || row < 0) return;
    window.setTimeout(async () => {
      await ensureNotationDictionaryLoaded();
      const currentText = (target.textContent || '').replace(/\u00a0/g, ' ');
      const unknownSet = new Set();
      const normalized = normalizeCommandForStorage(currentText, unknownSet);
      const localized = formatCommandForDisplay(normalized.canonical, getComboLang());
      if (localized !== currentText) {
        target.textContent = localized;
      }
      if (!state.combos[row]) state.combos[row] = defaultCombo();
      const prevCommand = String(state.combos[row].command || '');
      if (prevCommand !== normalized.canonical) {
        pushUndoHistory('paste-command');
      }
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
      const raw = normalizeDisplayCommandInput((el.textContent || '').replace(/\u00a0/g, ' '));
      if (el.dataset.field === 'command') {
        const normalized = normalizeCommandForStorage(raw);
        const canonical = normalized.canonical;
        const prevValue = String(state.combos[row][el.dataset.field] || '');
        if (prevValue !== canonical) {
          pushUndoHistory('edit-command');
        }
        state.combos[row][el.dataset.field] = canonical;
        const localized = formatCommandForDisplay(canonical, getComboLang());
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
        const prevValue = String(state.combos[row][el.dataset.field] || '');
        if (prevValue !== raw) {
          pushUndoHistory('edit-field');
        }
        state.combos[row][el.dataset.field] = raw;
        if (raw.trim()) {
          state.combos[row]._manual = false;
          ensureComboAuthoredVersion(state.combos[row]);
          syncAuthoredVersionInput(row);
        }
      }
    }
    persist();
    refreshCommandWarning(row);
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

  function normalizeKeymapTokenName(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return '';
    if (trimmed === '投げ') return 'THROW';
    return trimmed.replace(/\s+/g, '').toUpperCase();
  }

  function isPlaceholderHotkeyValue(token, hotkey) {
    const tokenName = normalizeKeymapTokenName(token);
    const hotkeyName = normalizeKeymapTokenName(hotkey);
    if (!tokenName || !hotkeyName) return false;
    if (tokenName === 'THROW') return hotkeyName === 'THROW';
    return hotkeyName === tokenName;
  }

  function sanitizeKeymapOverrides(map) {
    if (!map || typeof map !== 'object') return {};
    const out = {};
    Object.entries(map).forEach(([token, hotkey]) => {
      if (hotkey == null) return;
      const value = String(hotkey).trim();
      if (!value) return;
      if (isPlaceholderHotkeyValue(token, value)) return;
      out[token] = value;
    });
    return out;
  }

  function normalizeDeviceKeymap(deviceKey, raw) {
    const defaults = DEFAULT_KEYMAPS[deviceKey] || { classic: {}, modern: {} };
    const classicDefaults = defaults.classic || {};
    const modernDefaults = defaults.modern || {};
    if (raw && (raw.classic || raw.modern)) {
      const classicOverrides = sanitizeKeymapOverrides(raw.classic || {});
      const modernOverrides = sanitizeKeymapOverrides(raw.modern || {});
      return {
        classic: { ...classicDefaults, ...classicOverrides },
        modern: { ...modernDefaults, ...modernOverrides },
      };
    }
    const rawMap = sanitizeKeymapOverrides(raw || {});
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
    const headerFilterField = resolveHeaderOperationField(state.filters.headerField || '');
    const headerFilterQuery = String(state.filters.headerQuery || '').toLowerCase();
    const headerFilterValues = Array.isArray(state.filters.headerValues) ? state.filters.headerValues : [];
    const headerNumericFilter = state.filters && state.filters.headerNumeric && typeof state.filters.headerNumeric === 'object'
      ? state.filters.headerNumeric
      : { field: '', op: '', v1: '', v2: '' };
    const headerNumericField = resolveHeaderOperationField(headerNumericFilter.field || '');
    const hasHeaderValueFilter = !!(headerFilterField && headerFilterValues.length);
    const hasHeaderNumericFilter = !!(
      headerNumericField
      && isValidHeaderNumericFilter(headerNumericFilter.op, headerNumericFilter.v1, headerNumericFilter.v2)
    );
    const commandScopeFilters = state.filters.command_scope || [];
    const modeFilters = state.filters.mode || [];
    const positionFilters = state.filters.position || [];
    const distanceFilters = state.filters.distance || [];
    const counterFilters = state.filters.counter || [];
    const boFilters = state.filters.bo || [];
    const vsFilters = state.filters.vs || [];
    const interruptFilters = state.filters.interrupt || [];
    const saFilters = state.filters.sa || [];
    const specialFilters = state.filters.special || [];
    const versionFilters = state.filters.version || [];
    const safeJumpFilters = state.filters.safe_jump || [];
    const rangeFilters = state.filters.ranges || {};
    const searchExclude = new Set(['buttons', 'frame_meter']);
    const activeMode = state.controlMode === 'modern' ? 'modern' : 'classic';
    const hasComplexFilters = Boolean(
      search
      || fieldQuery
      || (headerFilterField && headerFilterQuery)
      || hasHeaderValueFilter
      || hasHeaderNumericFilter
      || modeFilters.length
      || positionFilters.length
      || distanceFilters.length
      || counterFilters.length
      || boFilters.length
      || vsFilters.length
      || interruptFilters.length
      || saFilters.length
      || specialFilters.length
      || versionFilters.length
      || safeJumpFilters.length
      || Object.keys(rangeFilters).length,
    );

    if (hasComplexFilters && state.groups.length < state.combos.length) {
      queueBackgroundHydrationToFull();
    }

    // Fast path for the common startup case (no text/range/value filters).
    // This avoids building large concatenated haystacks for every combo row.
    if (!hasComplexFilters) {
      state.groups.forEach((group) => {
        const combo = state.combos[group.index] || defaultCombo();
        const visible = matchesComboMode(combo, activeMode);
        group.rowList.forEach((row) => {
          row.style.display = visible ? '' : 'none';
        });
      });
      refreshVisibleGroupRowClasses();
      return;
    }

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
      if (visible && hasHeaderValueFilter) {
        const value = getHeaderFilterRawValue(combo, headerFilterField);
        visible = headerFilterValues.includes(value);
      }
      if (visible && hasHeaderNumericFilter) {
        visible = comboMatchesHeaderNumericFilter(combo, headerNumericField, headerNumericFilter);
      }
      if (visible && headerFilterField && headerFilterQuery) {
        visible = matchesHeaderTextFilter(combo, headerFilterField, headerFilterQuery);
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
      if (visible && saFilters.length) {
        visible = comboMatchesSaFilter(combo, saFilters);
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
    const sampleChanged = syncFirstRowSampleForCurrentMode();
    if (sampleChanged) {
      persist();
      applyStateToTable({ rangeStart: 0, rangeEnd: 1 });
    }
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
    if (ui.hydrationStatus && !ui.hydrationStatus.classList.contains('hidden')) {
      positionHydrationStatusUi();
    }
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
      refreshSaFilterGroup(panel);
      refreshSpecialConditionFilterGroup(panel);
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
    ensureRangeCategoryLayout(panel);
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
        state.filters.sa = readChecks('sa');
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
        state.filters.headerField = '';
        state.filters.headerQuery = '';
        state.filters.headerValues = [];
        state.filters.headerNumeric = { field: '', op: '', v1: '', v2: '' };
        state.filters.command_scope = [];
        state.filters.mode = [];
        state.filters.position = [];
        state.filters.distance = [];
        state.filters.counter = [];
        state.filters.bo = [];
        state.filters.vs = [];
        state.filters.interrupt = [];
        state.filters.sa = [];
        state.filters.special = [];
        state.filters.version = [];
        state.filters.safe_jump = [];
        state.filters.ranges = {};
        applyFilters();
      });
    }
    panel.addEventListener('click', (ev) => {
      const guideTrigger = ev.target && ev.target.closest ? ev.target.closest('[data-tutorial-flow]') : null;
      if (guideTrigger) {
        const flow = guideTrigger.getAttribute('data-tutorial-flow') || '';
        const parsedStart = Number.parseInt(guideTrigger.getAttribute('data-tutorial-start') || '0', 10);
        if (typeof window.openTutorialOverlay === 'function') {
          ev.preventDefault();
          ev.stopPropagation();
          window.openTutorialOverlay({
            flow,
            startIndex: Number.isFinite(parsedStart) ? parsedStart : 0,
          });
          return;
        }
        // Fallback: allow the global delegated tutorial click handler to run.
        return;
      }
      ev.stopPropagation();
    });
    document.addEventListener('click', (ev) => {
      if (panel.classList.contains('hidden')) return;
      if (ui.filterBtn && ui.filterBtn.contains(ev.target)) return;
      if (ev.target && ev.target.closest && ev.target.closest('[data-tutorial-flow]')) return;
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

  function createButtonTokenNode(token) {
    if (!token) return null;
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
    return span;
  }

  function insertButtonToken(target, token) {
    if (!target) return;
    const span = createButtonTokenNode(token);
    if (!span) return;
    target.appendChild(span);
  }

  const BUTTON_HTML_CACHE = new Map();
  const BUTTON_HTML_CACHE_KEY = 'lm_btn_html_cache_v2';
  const BUTTON_HTML_CACHE_LIMIT = 500;
  let buttonHtmlCacheLoaded = false;
  let buttonHtmlCacheTimer = null;

  function loadButtonHtmlCache() {
    if (buttonHtmlCacheLoaded) return;
    buttonHtmlCacheLoaded = true;
    try {
      let raw = localStorage.getItem(BUTTON_HTML_CACHE_KEY);
      if (!raw) {
        // One-time migration path from the previous sessionStorage-backed cache.
        raw = sessionStorage.getItem(BUTTON_HTML_CACHE_KEY);
        if (raw) {
          try {
            localStorage.setItem(BUTTON_HTML_CACHE_KEY, raw);
          } catch { }
        }
      }
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      parsed.forEach((entry) => {
        if (!Array.isArray(entry) || entry.length < 2) return;
        const key = String(entry[0] || '');
        const html = String(entry[1] || '');
        if (!key || !html) return;
        if (BUTTON_HTML_CACHE.size >= BUTTON_HTML_CACHE_LIMIT) return;
        BUTTON_HTML_CACHE.set(key, html);
      });
    } catch { }
  }

  function scheduleButtonHtmlCacheSave() {
    if (buttonHtmlCacheTimer != null) return;
    buttonHtmlCacheTimer = window.setTimeout(() => {
      buttonHtmlCacheTimer = null;
      try {
        const payload = JSON.stringify(Array.from(BUTTON_HTML_CACHE.entries()));
        localStorage.setItem(BUTTON_HTML_CACHE_KEY, payload);
      } catch { }
    }, 250);
  }

  function getCachedButtonHtml(raw) {
    loadButtonHtmlCache();
    if (!BUTTON_HTML_CACHE.has(raw)) return '';
    const html = BUTTON_HTML_CACHE.get(raw);
    BUTTON_HTML_CACHE.delete(raw);
    BUTTON_HTML_CACHE.set(raw, html);
    return html || '';
  }

  function cacheButtonHtml(raw, html) {
    const key = String(raw || '');
    const value = String(html || '');
    if (!key || !value) return;
    loadButtonHtmlCache();
    if (BUTTON_HTML_CACHE.has(key)) BUTTON_HTML_CACHE.delete(key);
    BUTTON_HTML_CACHE.set(key, value);
    while (BUTTON_HTML_CACHE.size > BUTTON_HTML_CACHE_LIMIT) {
      const oldest = BUTTON_HTML_CACHE.keys().next();
      if (oldest.done) break;
      BUTTON_HTML_CACHE.delete(oldest.value);
    }
    scheduleButtonHtmlCacheSave();
  }

  function renderButtonsInput(target, value) {
    if (!target) return;
    const rawValue = String(value || '');
    if (target.dataset.renderedValue === rawValue) return;
    target.dataset.renderedValue = rawValue;
    if (!rawValue) {
      target.textContent = '';
      return;
    }
    const cachedHtml = getCachedButtonHtml(rawValue);
    if (cachedHtml) {
      target.innerHTML = cachedHtml;
      return;
    }
    target.innerHTML = '';
    const tokens = parseButtonsValue(rawValue);
    if (!tokens.length && rawValue) {
      target.textContent = rawValue;
      return;
    }
    const fragment = document.createDocumentFragment();
    tokens.forEach((token) => {
      const node = createButtonTokenNode(token);
      if (node) fragment.appendChild(node);
    });
    target.appendChild(fragment);
    if (tokens.length) cacheButtonHtml(rawValue, target.innerHTML);
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
    const rawToken = String(token || '');
    const trimmedToken = rawToken.trim();
    if (typeof token === 'string' && /^\[\s*\]$/.test(trimmedToken)) {
      return '[ ]';
    }
    if (typeof token === 'string' && /^\[\d+F?\]$/i.test(trimmedToken)) {
      return trimmedToken;
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
    return map[trimmedToken] || map[rawToken] || trimmedToken || rawToken;
  }

  function normalizeKeyLabel(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/\s+/g, '');
  }

  function findHotkeyForLabel(label, map) {
    if (!map) return '';
    const raw = String(label || '');
    if (!raw) return '';
    const target = normalizeKeyLabel(raw);
    const targetCanonical = normalizeKeyLabel(canonicalizeCommandForStorage(raw));
    if (!target && !targetCanonical) return '';
    const key = Object.keys(map).find((mapKey) => {
      const keyNorm = normalizeKeyLabel(mapKey);
      if (keyNorm === target || keyNorm === targetCanonical) return true;
      const keyCanonical = normalizeKeyLabel(canonicalizeCommandForStorage(mapKey));
      return keyCanonical === target || keyCanonical === targetCanonical;
    });
    return key ? map[key] : '';
  }

  function getDefaultHotkeyForToken(device, mode, token) {
    const resolvedDevice = resolveKeymapDevice(device || 'keyboard');
    const defaults = DEFAULT_KEYMAPS[resolvedDevice] || {};
    const modeKey = mode === 'modern' ? 'modern' : 'classic';
    const defaultMap = defaults[modeKey] || {};
    const raw = String(token || '').trim();
    if (!raw) return '';
    const upper = raw.toUpperCase();
    const keys = [raw];
    if (upper === 'AUTO') keys.push('Auto');
    if (upper === 'OR' || upper === 'O') keys.push(' or ', 'or');
    if (upper === 'JUMP' || upper === 'J') keys.push(' Jump ', 'jump');
    if (upper === 'HOLD' || upper === 'H') keys.push(' Hold ', 'hold');
    if (upper === 'ANY' || upper === 'A') keys.push(' Any ', 'any');
    if (upper === 'THROW' || raw === '投げ' || upper === 'T') keys.push(' 投げ ', '投げ', 'Throw');
    if (raw === '>') keys.push(' > ');
    if (raw === '>>') keys.push(' >> ');
    if (raw === '-') keys.push(' - ');
    if (raw === '[]') keys.push(' [] ');
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(defaultMap, key)) {
        const value = String(defaultMap[key] || '').trim();
        if (value) return value;
      }
    }
    return '';
  }

  function findHotkeyForToken(token, map, device = '') {
    if (!map) return '';
    const raw = String(token || '').trim();
    if (!raw) return '';
    const upper = raw.toUpperCase();
    const readMappedHotkey = (mapKey, fallbackToken = mapKey) => {
      if (!Object.prototype.hasOwnProperty.call(map, mapKey)) return '';
      const assigned = String(map[mapKey] || '').trim();
      if (!assigned || isPlaceholderHotkeyValue(fallbackToken, assigned)) {
        return getDefaultHotkeyForToken(device, state.controlMode, fallbackToken);
      }
      return assigned;
    };
    if (upper === 'SP') {
      return readMappedHotkey('SP', 'SP') || getDefaultHotkeyForToken(device, state.controlMode, 'SP');
    }
    if (upper === 'AUTO') {
      const auto = readMappedHotkey('Auto', 'Auto') || readMappedHotkey('AUTO', 'Auto');
      if (auto) return auto;
      return getDefaultHotkeyForToken(device, state.controlMode, 'Auto');
    }
    if (upper === 'DI' || upper === 'DR' || upper === 'CR' || upper === 'DP') {
      if (Object.prototype.hasOwnProperty.call(map, raw)) {
        const assigned = String(map[raw] || '').trim();
        if (assigned) return assigned;
      }
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, raw);
      if (fallback) return fallback;
    }
    if (upper === 'OR') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, 'or');
      if (fallback) return fallback;
    }
    if (upper === 'JUMP') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, 'Jump');
      if (fallback) return fallback;
    }
    if (upper === 'HOLD') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, 'Hold');
      if (fallback) return fallback;
    }
    if (upper === 'ANY') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, 'Any');
      if (fallback) return fallback;
    }
    if (raw === '投げ') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, '投げ');
      if (fallback) return fallback;
    }
    if (raw === '>' || raw === '>>' || raw === '-' || raw === '[]') {
      const fallback = getDefaultHotkeyForToken(device, state.controlMode, raw);
      if (fallback) return fallback;
    }
    if (Object.prototype.hasOwnProperty.call(map, raw)) {
      const assigned = readMappedHotkey(raw, raw);
      if (assigned) return assigned;
      return '';
    }
    if (Object.prototype.hasOwnProperty.call(map, upper)) {
      const assigned = readMappedHotkey(upper, upper);
      if (assigned) return assigned;
      return '';
    }
    const candidateKeys = [raw];
    if (upper === 'AUTO') candidateKeys.push('Auto');
    if (upper === 'O' || upper === 'OR') candidateKeys.push(' or ', 'or');
    if (upper === 'J' || upper === 'JUMP') candidateKeys.push(' Jump ', 'jump');
    if (upper === 'H' || upper === 'HOLD') candidateKeys.push(' Hold ', 'hold');
    if (upper === 'A' || upper === 'ANY') candidateKeys.push(' Any ', 'any');
    if (upper === 'T' || raw === '投げ' || upper === 'THROW') candidateKeys.push(' 投げ ', '投げ', 'Throw');
    if (raw === '>') candidateKeys.push(' > ');
    if (raw === '>>') candidateKeys.push(' >> ');
    if (raw === '-') candidateKeys.push(' - ');
    if (raw === '[]') candidateKeys.push(' [] ');
    const wanted = new Set(candidateKeys.map((key) => normalizeKeyLabel(key)).filter(Boolean));
    if (!wanted.size) return '';
    const mapKey = Object.keys(map).find((key) => wanted.has(normalizeKeyLabel(key)));
    if (mapKey) {
      const assigned = readMappedHotkey(mapKey, mapKey);
      if (assigned) return assigned;
    }
    return '';
  }

  function resolveTokenFromHotkey(hotkey, map) {
    const target = normalizeKeyLabel(hotkey);
    if (!target || !map) return '';
    const matches = Object.keys(map).filter((key) => normalizeKeyLabel(map[key]) === target);
    if (!matches.length) return '';
    const preferred = matches.find((key) => !/^\d+$/.test(String(key || '').trim()));
    return preferred || matches[0] || '';
  }

  function tokensToCommandString(tokens) {
    return (tokens || []).map((token) => displayLabelForToken(token)).join('');
  }


  function displayLabelForIcon(src) {
    if (!src) return '';
    const name = String(src).split('/').pop();
    return BUTTON_ICON_LABEL_MAP[name] || '';
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

  const BUTTON_PARSE_CACHE = new Map();
  const BUTTON_PARSE_CACHE_LIMIT = 1200;

  function getCachedButtonTokens(raw) {
    if (!BUTTON_PARSE_CACHE.has(raw)) return null;
    const hit = BUTTON_PARSE_CACHE.get(raw);
    // refresh recency in insertion-order Map
    BUTTON_PARSE_CACHE.delete(raw);
    BUTTON_PARSE_CACHE.set(raw, hit);
    return Array.isArray(hit) ? hit.slice() : null;
  }

  function cacheButtonTokens(raw, tokens) {
    if (BUTTON_PARSE_CACHE.size >= BUTTON_PARSE_CACHE_LIMIT) {
      const oldest = BUTTON_PARSE_CACHE.keys().next();
      if (!oldest.done) BUTTON_PARSE_CACHE.delete(oldest.value);
    }
    BUTTON_PARSE_CACHE.set(raw, Array.isArray(tokens) ? tokens.slice() : []);
  }

  function parseButtonsValue(value) {
    const raw = String(value || '').trim();
    if (!raw) return [];
    const cached = getCachedButtonTokens(raw);
    if (cached && !/[,+xX×＋]/.test(raw)) return cached;

    const tokens = [];
    const source = raw;
    const tokenRegex = /(>>|>|-|360|\[\s*\]|\[\d+F?\]|投げ|4\(タメ\)|2\(タメ\)|[0-9]|(?<![A-Za-z])(LP|MP|HP|LK|MK|HK|PP|KK|SP|DP|DI|DR|CR|Auto|Any|Jump|Hold|or|xx|[LMH]{2,3}|L|M|H|P|K)(?![A-Za-z]))/gi;
    const appendUnknownChunk = (chunk) => {
      const text = String(chunk || '');
      if (!text.trim()) return;
      text
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean)
        .forEach((part) => tokens.push(part));
    };
    let cursor = 0;
    let match;
    while ((match = tokenRegex.exec(source)) !== null) {
      if (match.index > cursor) {
        appendUnknownChunk(source.slice(cursor, match.index));
      }
      const rawToken = String(match[0] || '');
      let token = rawToken;
      if (/^\[\s*\]$/.test(token)) token = '[]';
      const upperToken = String(token || '').toUpperCase();
      if (upperToken === 'PP') {
        tokens.push('P', 'P');
      } else if (upperToken === 'KK') {
        tokens.push('K', 'K');
      } else if (/^[LMH]{2,3}$/.test(upperToken)) {
        upperToken.split('').forEach((part) => tokens.push(part));
      } else {
        tokens.push(token);
      }
      cursor = match.index + rawToken.length;
    }
    if (cursor < source.length) {
      appendUnknownChunk(source.slice(cursor));
    }
    if (tokens.length) {
      cacheButtonTokens(raw, tokens);
      return tokens;
    }

    const fallback = raw.split(/\s+/).filter(Boolean);
    cacheButtonTokens(raw, fallback);
    return fallback;
  }

  function collectPreviewSyntaxUnknowns(raw, canonical) {
    const out = [];
    const seen = new Set();
    const push = (value) => {
      const token = String(value || '').trim();
      if (!token) return;
      const key = token.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(token);
    };
    const rawText = String(raw || '');
    const canonicalText = String(canonical || '');
    if (/\bxx\b/i.test(rawText) || /\bxx\b/i.test(canonicalText)) push('xx');
    if (/\+/.test(rawText) || /\+/.test(canonicalText)) push('+');
    if (/\bplus\b/i.test(rawText)) push('plus');
    const bracketPattern = /(\([^()]+\)|\[[^\[\]]+\])/g;
    const scanBracketed = (text) => {
      String(text || '').replace(bracketPattern, (full) => {
        const token = String(full || '').trim();
        // Keep special unknown bracketed notes (e.g. "(bloom)") visible as-is.
        // Skip canonical delay token [].
        if (token && token !== '[]') push(token);
        return full;
      });
    };
    scanBracketed(rawText);
    scanBracketed(canonicalText);
    return out;
  }

  function collectButtonParseUnknowns(text) {
    const out = [];
    const seen = new Set();
    parseButtonsValue(text).forEach((token) => {
      const term = String(token || '').trim();
      if (!term) return;
      if (getButtonIcon(term)) return;
      if (/^[,;:]+$/.test(term)) return;
      const key = term.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      out.push(term);
    });
    return out;
  }

  function isPreviewSyntaxUnknownToken(value) {
    const token = String(value || '').trim();
    if (!token) return false;
    if (/^xx$/i.test(token)) return true;
    if (/^\+$/.test(token)) return true;
    if (/^plus$/i.test(token)) return true;
    if (/^[(){}\[\]（）［］｛｝]+$/.test(token)) return true;
    if (/[(){}\[\]（）［］｛｝]/.test(token) && !/^\([^()]+\)$/.test(token) && !/^\[[^\[\]]+\]$/.test(token)) return true;
    if (/^\([^()]+\)$/.test(token)) return true;
    if (/^\[[^\[\]]+\]$/.test(token) && token !== '[]') return true;
    return false;
  }

  function hasStandaloneUnknownTerm(text, term) {
    const source = String(text || '');
    const token = String(term || '').trim();
    if (!source || !token) return false;
    const escaped = escapeForRegex(token);
    if (!escaped) return false;
    const re = new RegExp(escaped, 'ig');
    let match = re.exec(source);
    while (match) {
      const start = Number(match.index);
      const end = start + String(match[0] || '').length;
      const prev = start > 0 ? source.charAt(start - 1) : '';
      const next = end < source.length ? source.charAt(end) : '';
      const tokenBoundary = !/[A-Za-z0-9_]/.test(prev) && !/[A-Za-z0-9_]/.test(next);
      const wrapped = (prev === '(' && next === ')') || (prev === '[' && next === ']');
      if (tokenBoundary && !wrapped) return true;
      match = re.exec(source);
    }
    return false;
  }

  function dedupeBracketUnknownTerms(terms, raw, canonical) {
    const source = Array.isArray(terms) ? terms : [];
    let out = source.slice();
    const hasExplicitBracketToken = out.some((item) => {
      const value = String(item || '').trim();
      return /^\([^()]+\)$/.test(value) || (/^\[[^\[\]]+\]$/.test(value) && value !== '[]');
    });
    if (hasExplicitBracketToken) {
      // Prefer full bracket tokens (e.g. "(2F)") and drop parser fragments ("(", "F)").
      out = out.filter((item) => {
        const value = String(item || '').trim();
        if (!value) return false;
        if (/^\([^()]+\)$/.test(value)) return true;
        if (/^\[[^\[\]]+\]$/.test(value) && value !== '[]') return true;
        if (/[()\[\]]/.test(value)) return false;
        return true;
      });
    }
    const lowerSet = new Set(out.map((item) => String(item || '').trim().toLowerCase()).filter(Boolean));
    const remove = new Set();
    out.forEach((item) => {
      const value = String(item || '').trim();
      if (!value) return;
      const round = value.match(/^\(([^()]+)\)$/);
      const square = value.match(/^\[([^\[\]]+)\]$/);
      const core = round ? String(round[1] || '').trim() : square ? String(square[1] || '').trim() : '';
      if (!core) return;
      const coreKey = core.toLowerCase();
      if (!lowerSet.has(coreKey)) return;
      const explicitStandalone = hasStandaloneUnknownTerm(raw, core) || hasStandaloneUnknownTerm(canonical, core);
      if (!explicitStandalone) remove.add(coreKey);
    });
    if (!remove.size) return out;
    return out.filter((item) => !remove.has(String(item || '').trim().toLowerCase()));
  }

  const BUTTON_ICON_MAP = {
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

  const BUTTON_ICON_LABEL_MAP = {
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
    'modern_dp.png': 'DP',
    'modern_dl.png': 'DI',
    'modern_dr.png': 'DR',
    'modern_cr.png': 'CR',
  };

  function getButtonIcon(token) {
    const src = BUTTON_ICON_MAP[token]
      || BUTTON_ICON_MAP[String(token).toUpperCase()]
      || BUTTON_ICON_MAP[String(token).toLowerCase()];
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
    if (!/^[A-Za-z]$/.test(rawKey)) {
      const key = rawKey.toLowerCase();
      const direct = Object.keys(map).find((token) => {
        const hotkey = String(map[token] || '');
        if (!hotkey) return false;
        return hotkey.toLowerCase() === key;
      });
      if (direct) return direct;
    }
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

    // Preserve literal plain-key bindings (including uppercase) instead of
    // encoding them as Shift+key.
    if (!ev.ctrlKey && !ev.altKey && !ev.metaKey && key.length === 1) {
      return key;
    }

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
    const ensureSavePresetPlacement = (root) => {
      if (!root) return;
      const groups = root.querySelector('#comboXlsxMapFieldColumns');
      if (!groups || !groups.parentNode) return;

      let row = root.querySelector('.combo-xlsx-map-preset-row');
      if (!row) {
        row = document.createElement('div');
        row.className = 'combo-xlsx-map-preset-row';
        groups.parentNode.insertBefore(row, groups);
      }

      let label = root.querySelector('.combo-xlsx-map-save-preset');
      if (!label || !label.querySelector('#comboXlsxMapSavePreset')) {
        const lang = getComboLang();
        label = document.createElement('label');
        label.className = 'combo-xlsx-map-save-preset';
        label.innerHTML = `<input type="checkbox" id="comboXlsxMapSavePreset" /> <span data-xlsx-label="xlsx_map_save_preset">${comboT('ui.xlsx_map_save_preset', lang) || 'Save this mapping'}</span>`;
      }
      row.appendChild(label);

      const actions = root.querySelector('.combo-xlsx-map-actions');
      if (actions) {
        Array.from(actions.querySelectorAll('.combo-xlsx-map-save-preset')).forEach((node) => {
          if (node !== label) node.remove();
        });
      }
    };
    if (modal) {
      ensureSavePresetPlacement(modal);
      return modal;
    }
    const lang = getComboLang();
    modal = document.createElement('div');
    modal.id = 'comboXlsxMapModal';
    modal.className = 'combo-keymap-modal combo-xlsx-map-modal hidden';
    modal.innerHTML = `
      <div class="combo-keymap-content combo-xlsx-map-content">
        <header>
          <button type="button" class="tutorial-flow-trigger tutorial-flow-trigger-modal combo-xlsx-help-trigger"
            data-tutorial-flow="import-flow" aria-label="Import guide"
            title="Import guide">?</button>
          <h3 data-xlsx-label="xlsx_map_title">${comboT('ui.xlsx_map_title', lang) || 'XLSX Column Mapping'}</h3>
        </header>
        <div class="combo-xlsx-map-meta-section">
          <p class="combo-xlsx-map-sheet">
            <span data-xlsx-label="xlsx_map_character">${comboT('ui.xlsx_map_character', lang) || 'Mapping Target'}</span>
            <strong id="comboXlsxMapSheetName">-</strong>
          </p>
          <p class="combo-xlsx-map-desc" data-xlsx-label="xlsx_map_desc">${comboT('ui.xlsx_map_desc', lang) || ''}</p>
          <div class="combo-xlsx-map-meta-row">
            <label class="combo-xlsx-map-header-label">
              <span data-xlsx-label="xlsx_map_header_row">${comboT('ui.xlsx_map_header_row', lang) || 'Header row'}</span>
              <select id="comboXlsxMapHeaderRow"></select>
            </label>
          </div>
        </div>
        <div class="combo-xlsx-map-preset-row">
          <label class="combo-xlsx-map-save-preset"><input type="checkbox" id="comboXlsxMapSavePreset" /> <span data-xlsx-label="xlsx_map_save_preset">${comboT('ui.xlsx_map_save_preset', lang) || 'Save this mapping'}</span></label>
        </div>
        <div class="combo-xlsx-map-groups" id="comboXlsxMapFieldColumns"></div>
        <div class="combo-xlsx-map-preview-wrap">
          <h4 data-xlsx-label="xlsx_map_preview">${comboT('ui.xlsx_map_preview', lang) || 'Preview (first 5 rows)'}</h4>
          <table class="combo-xlsx-map-preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th data-xlsx-label="xlsx_map_raw_command">${comboT('ui.xlsx_map_raw_command', lang) || 'Raw command'}</th>
                <th data-xlsx-label="xlsx_map_norm_command">${comboT('ui.xlsx_map_norm_command', lang) || 'Normalized command'}</th>
                <th data-xlsx-label="xlsx_map_buttons">${comboT('ui.xlsx_map_buttons', lang) || 'Buttons'}</th>
                <th data-xlsx-label="xlsx_map_summary">${comboT('ui.xlsx_map_summary', lang) || 'Imported fields'}</th>
              </tr>
            </thead>
            <tbody id="comboXlsxMapPreviewBody"></tbody>
          </table>
        </div>
        <div class="combo-notation-unknown-manage">
          <h4 class="combo-notation-section-title" data-notation-label="notation_unknown_manage_title">${comboT('ui.notation_unknown_manage_title', lang) || 'Unknown Token Handling'}</h4>
          <p class="combo-notation-test-desc" data-notation-label="notation_unknown_manage_desc">${comboT('ui.notation_unknown_manage_desc', lang) || ''}</p>
          <div class="combo-notation-unknown-wrap">
            <div id="comboXlsxUnknownManageBody" class="combo-notation-unknown-grid"></div>
          </div>
          <div class="combo-notation-unknown-actions">
            <button type="button" data-action="unknown-apply" data-notation-label="notation_unknown_apply">${comboT('ui.notation_unknown_apply', lang) || 'Apply'}</button>
          </div>
        </div>
        <div class="combo-keymap-actions combo-xlsx-map-actions">
          <button type="button" data-action="apply">${comboT('ui.xlsx_map_apply', lang) || 'Import'}</button>
          <button type="button" data-action="cancel">${comboT('ui.xlsx_map_cancel', lang) || 'Close'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    ensureSavePresetPlacement(modal);

    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        closeXlsxMapModal(null);
        return;
      }
      const actionEl = ev.target && ev.target.closest ? ev.target.closest('[data-action]') : null;
      const action = actionEl && actionEl.dataset ? actionEl.dataset.action : '';
      if (!action) return;
      const ctx = modal._ctx || null;
      if (action === 'unknown-apply') {
        handleNotationUnknownApplyAll({}, modal);
        return;
      }
      if (action === 'cancel') {
        closeXlsxMapModal(null);
        return;
      }
      if (action === 'apply') {
        if (!ctx) {
          closeXlsxMapModal(null);
          return;
        }
        if (!ctx.mapping || !ctx.mapping.command) {
          window.alert(comboMsg('xlsx_map_required_command'));
          return;
        }
        closeXlsxMapModal({
          headerRow: ctx.headerRow,
          mapping: { ...ctx.mapping },
          savePreset: !!(modal.querySelector('#comboXlsxMapSavePreset') && modal.querySelector('#comboXlsxMapSavePreset').checked),
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
        renderXlsxMapUnknownManage(modal);
        return;
      }
      if (target.classList.contains('combo-notation-unknown-check')) {
        handleNotationUnknownCheckboxToggle(target);
        return;
      }
      if (target.classList.contains('combo-xlsx-map-select')) {
        const field = target.dataset.field || '';
        if (!field) return;
        const value = String(target.value || '');
        if (value) ctx.mapping[field] = value;
        else delete ctx.mapping[field];
        renderXlsxMapPreview(modal);
        renderXlsxMapUnknownManage(modal);
        return;
      }
      if (target.classList.contains('combo-notation-unknown-input')) {
        handleNotationUnknownInputDraft(target);
      }
    });

    modal.addEventListener('input', (ev) => {
      const target = ev.target;
      if (!target || !target.classList) return;
      if (target.classList.contains('combo-notation-unknown-input')) {
        handleNotationUnknownInputDraft(target);
      }
    });

    window.addEventListener('resize', () => {
      const current = modal._ctx || null;
      if (!current || modal.classList.contains('hidden')) return;
      renderXlsxMapFieldTables(modal);
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
    const noneLabel = comboT('ui.xlsx_map_none', lang) || '-';
    const selected = String(selectedValue || '');
    const options = [`<option value="${XLSX_MAP_NONE_VALUE}"${selected ? '' : ' selected'}>${escapeHtml(noneLabel)}</option>`];
    (entries || []).forEach((entry) => {
      const isSelected = selected === String(entry.value) ? ' selected' : '';
      options.push(`<option value="${escapeHtml(entry.value)}"${isSelected}>${escapeHtml(entry.label)}</option>`);
    });
    return options.join('');
  }

  function normalizeImportSelectedTargets(targets, selected, options = null) {
    const allowEmpty = !!(options && options.allowEmpty);
    const allTargets = Array.isArray(targets)
      ? Array.from(new Set(targets.map((slug) => String(slug || '').trim()).filter(Boolean)))
      : [];
    if (!allTargets.length) return [];
    const source = Array.isArray(selected) ? selected : [];
    const cleaned = Array.from(new Set(
      source
        .map((slug) => String(slug || '').trim())
        .filter((slug) => slug && allTargets.includes(slug)),
    ));
    if (cleaned.length) return cleaned;
    if (allowEmpty) return [];
    return allTargets.slice();
  }

  function setXlsxImportTargetSelection(modal, ctx, selected) {
    const targets = Array.isArray(ctx.importTargets) ? ctx.importTargets : [];
    ctx.importSelected = normalizeImportSelectedTargets(targets, selected, { allowEmpty: true });
    const list = modal && modal.querySelector('#comboXlsxMapTargetList');
    if (!list) return;
    const selectedSet = new Set(ctx.importSelected);
    list.querySelectorAll('input.combo-xlsx-map-target-check').forEach((input) => {
      const value = String(input.value || '').trim();
      input.checked = !!value && selectedSet.has(value);
    });
  }

  function renderXlsxImportTargetChecklist(modal, ctx) {
    const panel = modal.querySelector('.combo-xlsx-map-target-panel');
    const actions = modal.querySelector('.combo-xlsx-map-target-actions');
    const wrap = modal.querySelector('#comboXlsxMapTargetWrap');
    const list = modal.querySelector('#comboXlsxMapTargetList');
    if (!wrap || !list) return;
    const targets = Array.isArray(ctx.importTargets) ? ctx.importTargets : [];
    if (!targets.length) {
      if (panel) panel.classList.add('hidden');
      if (actions) actions.classList.add('hidden');
      wrap.classList.add('hidden');
      list.innerHTML = '';
      ctx.importSelected = [];
      return;
    }
    if (panel) panel.classList.remove('hidden');
    if (actions) actions.classList.remove('hidden');
    wrap.classList.remove('hidden');
    ctx.importSelected = normalizeImportSelectedTargets(targets, ctx.importSelected, { allowEmpty: true });
    const selectedSet = new Set(ctx.importSelected);
    const rows = [];
    targets.forEach((slug) => {
      const label = getCharacterLabel(slug) || slug;
      const checked = selectedSet.has(slug) ? 'checked' : '';
      rows.push(`<label class="combo-xlsx-map-target-item">
        <input type="checkbox" class="combo-xlsx-map-target-check" value="${escapeHtml(slug)}" ${checked}>
        <span>${escapeHtml(label)}</span>
      </label>`);
    });
    list.innerHTML = rows.join('');
  }

  function updateXlsxImportTargetSelection(modal, ctx, changedInput) {
    void changedInput;
    const targets = Array.isArray(ctx.importTargets) ? ctx.importTargets : [];
    const list = modal.querySelector('#comboXlsxMapTargetList');
    if (!list || !targets.length) return;
    const selected = Array.from(list.querySelectorAll('input.combo-xlsx-map-target-check'))
      .filter((el) => el.checked)
      .map((el) => String(el.value || '').trim())
      .filter(Boolean);
    setXlsxImportTargetSelection(modal, ctx, selected);
  }

  function getXlsxMapFieldColumnCount(modal) {
    const content = modal.querySelector('.combo-xlsx-map-content');
    const width = content && content.clientWidth ? content.clientWidth : (window.innerWidth || 1200);
    if (width >= 1800) return 5;
    if (width >= 1450) return 4;
    if (width >= 1080) return 3;
    if (width >= 780) return 2;
    return 1;
  }

  function getXlsxMapSheetLabel(sheetName) {
    const raw = String(sheetName || '').trim();
    const slug = resolveCharacterSlug(raw) || '';
    const label = slug ? (getCharacterLabel(slug) || slug) : '';
    if (!label && !raw) return '-';
    if (label && raw && label !== raw) return `${label} (${raw})`;
    return label || raw;
  }

  function renderXlsxMapFieldTables(modal) {
    const ctx = modal && modal._ctx;
    if (!ctx) return;
    const lang = getComboLang();
    const entries = ctx.entriesByRow[ctx.headerRow] || [];
    const columnWrap = modal.querySelector('#comboXlsxMapFieldColumns');
    if (!columnWrap) return;
    const content = modal.querySelector('.combo-xlsx-map-content');
    const contentWidth = content && content.clientWidth ? content.clientWidth : (window.innerWidth || 1200);
    const estimatedCellWidth = Math.max(1, Math.floor(contentWidth / 9));
    const shouldStackPulldown = estimatedCellWidth < 165;
    const buildLayoutCell = (field, colspan = 1) => {
      if (!field) return `<td class="combo-xlsx-map-layout-empty" colspan="${Math.max(1, colspan)}"></td>`;
      const selected = ctx.mapping[field] || XLSX_MAP_NONE_VALUE;
      const required = field === 'command' ? ' <span class="req">*</span>' : '';
      const selectHtml = getXlsxColumnOptionHtml(entries, selected, lang);
      return `<td class="combo-xlsx-map-layout-cell" colspan="${Math.max(1, colspan)}" data-field="${escapeHtml(field)}">
        <div class="combo-xlsx-map-layout-cell-inner">
          <span class="combo-xlsx-map-layout-label">${escapeHtml(getXlsxFieldLabel(field, lang))}${required}</span>
          <select class="combo-xlsx-map-select" data-field="${escapeHtml(field)}">${selectHtml}</select>
        </div>
      </td>`;
    };
    const sectionLabel = (jp, en) => escapeHtml(lang === 'en' ? en : jp);
    columnWrap.innerHTML = `
      <table class="combo-xlsx-map-layout-table${shouldStackPulldown ? ' stack' : ''}">
        <tbody>
          <tr>
            ${buildLayoutCell('command', 2)}
            ${buildLayoutCell('combo_notes', 1)}
            ${buildLayoutCell(null, 6)}
          </tr>
          <tr class="combo-xlsx-map-layout-section">
            <th colspan="9">${sectionLabel('条件', 'Conditions')}</th>
          </tr>
          <tr>
            ${buildLayoutCell('control_mode')}
            ${buildLayoutCell('distance')}
            ${buildLayoutCell('position')}
            ${buildLayoutCell('counter_type')}
            ${buildLayoutCell('bo_state')}
            ${buildLayoutCell('drive_req')}
            ${buildLayoutCell('sa_req')}
            ${buildLayoutCell('vs_character')}
            ${buildLayoutCell('special_condition')}
          </tr>
          <tr class="combo-xlsx-map-layout-section">
            <th colspan="8">${sectionLabel('ダメージ', 'Damage')}</th>
            <th class="empty"></th>
          </tr>
          <tr>
            ${buildLayoutCell('damage_jp')}
            ${buildLayoutCell('damage_bo_guard')}
            ${buildLayoutCell('damage_normal')}
            ${buildLayoutCell('damage_counter')}
            ${buildLayoutCell('damage_punish')}
            ${buildLayoutCell('damage_normal_ca')}
            ${buildLayoutCell('damage_counter_ca')}
            ${buildLayoutCell('damage_punish_ca')}
            ${buildLayoutCell(null)}
          </tr>
          <tr class="combo-xlsx-map-layout-section split">
            <th colspan="6">${sectionLabel('Dゲージ', 'D Gauge')}</th>
            <th colspan="2">${sectionLabel('SAゲージ', 'SA Gauge')}</th>
            <th class="empty"></th>
          </tr>
          <tr>
            ${buildLayoutCell('d_guard')}
            ${buildLayoutCell('d_normal')}
            ${buildLayoutCell('d_pc')}
            ${buildLayoutCell('drive_delta')}
            ${buildLayoutCell('drive_delta_opponent')}
            ${buildLayoutCell('drive_efficiency')}
            ${buildLayoutCell('sa_delta')}
            ${buildLayoutCell('sa_delta_opponent')}
            ${buildLayoutCell(null)}
          </tr>
          <tr class="combo-xlsx-map-layout-section">
            <th colspan="7">${sectionLabel('その他', 'Other')}</th>
            <th class="empty" colspan="2"></th>
          </tr>
          <tr>
            ${buildLayoutCell('carry_distance')}
            ${buildLayoutCell('end_distance')}
            ${buildLayoutCell('frame_adv')}
            ${buildLayoutCell('safe_jump')}
            ${buildLayoutCell('interrupt')}
            ${buildLayoutCell('oki')}
            ${buildLayoutCell('game_version')}
            ${buildLayoutCell(null)}
            ${buildLayoutCell(null)}
          </tr>
        </tbody>
      </table>
    `;
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
      const rawCommand = String(getMappedCellValue(row, mapping.command) || '').trim();
      if (!rawCommand) continue;
      const normalized = normalizeCommandForStorage(rawCommand).canonical;
      const normalizedCanonical = canonicalizeCommandForStorage(String(normalized || ''));
      if (!hasImportableCommandText(normalizedCanonical)) continue;
      const buttonsHtml = normalizedCanonical
        ? renderNotationButtonsFromCanonical(normalizedCanonical, getComboLang())
        : '-';
      const summaryParts = [];
      XLSX_MAP_ALL_FIELDS.forEach((field) => {
        if (field === 'command' || field === 'buttons') return;
        const mapValue = mapping[field];
        if (!mapValue) return;
        const raw = getMappedCellValue(row, mapValue);
        if (!raw) return;
        summaryParts.push(`${getXlsxFieldLabel(field)}: ${raw}`);
      });
      previewRows.push({
        rowNumber,
        rawCommand,
        normalized: normalizedCanonical,
        buttonsHtml,
        summary: summaryParts.join(' / '),
      });
      added += 1;
    }
    if (!previewRows.length) {
      body.innerHTML = '<tr><td colspan="5">-</td></tr>';
      return;
    }
    body.innerHTML = previewRows.map((item) => `<tr>
      <td>${item.rowNumber}</td>
      <td>${escapeHtml(item.rawCommand || '-')}</td>
      <td>${escapeHtml(item.normalized || '-')}</td>
      <td class="combo-notation-buttons"><div class="combo-notation-buttons-wrap">${item.buttonsHtml || '-'}</div></td>
      <td>${escapeHtml(item.summary || '-')}</td>
    </tr>`).join('');
  }

  function renderXlsxMapUnknownManage(modal) {
    const ctx = modal && modal._ctx ? modal._ctx : null;
    if (!ctx) return;
    buildNotationPreviewFromXlsxContext(ctx, 120);
    renderNotationUnknownManageRows(modal);
  }

  function buildNotationPreviewFromXlsxContext(ctx, maxRows = 120) {
    if (!ctx || !ctx.sheet || !ctx.mapping || !ctx.mapping.command) {
      resetNotationImportPreview();
      return { count: 0, unknown: new Set() };
    }
    resetNotationImportPreview();
    const unknown = new Set();
    const rowLimit = Math.max(1, Number(maxRows) || 120);
    const headerRow = Number(ctx.headerRow) === 2 ? 2 : 1;
    const maxRow = Number(ctx.sheet.rowCount) || 0;
    let added = 0;
    for (let rowNumber = headerRow + 1; rowNumber <= maxRow && added < rowLimit; rowNumber += 1) {
      const row = ctx.sheet.getRow(rowNumber);
      if (!row) continue;
      const rawCommand = String(getMappedCellValue(row, ctx.mapping.command) || '').trim();
      if (!rawCommand) continue;
      const normalized = normalizeCommandForStorage(rawCommand, unknown);
      if (!hasImportableCommandText(normalized && normalized.canonical ? normalized.canonical : '')) continue;
      recordNotationImportPreview(rawCommand, normalized);
      added += 1;
    }
    return { count: added, unknown };
  }

  async function openNotationManagerFromXlsxModal(modal) {
    const ctx = modal && modal._ctx ? modal._ctx : null;
    if (!ctx || !ctx.mapping || !ctx.mapping.command) {
      window.alert(comboMsg('xlsx_map_required_command'));
      return;
    }
    const loaded = await ensureNotationDictionaryLoaded();
    if (!loaded) {
      window.alert(comboMsg('notation_load_failed'));
      return;
    }
    const previewInfo = buildNotationPreviewFromXlsxContext(ctx, 120);
    await openNotationManager();
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
      const sheetNameEl = modal.querySelector('#comboXlsxMapSheetName');
      if (sheetNameEl) sheetNameEl.textContent = getXlsxMapSheetLabel(ctx.sheetName);
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
      const savePresetCheck = modal.querySelector('#comboXlsxMapSavePreset');
      if (savePresetCheck) savePresetCheck.checked = false;
      applyBestMappingForHeaderRow(ctx, true);
      renderXlsxMapFieldTables(modal);
      renderXlsxMapPreview(modal);
      renderXlsxMapUnknownManage(modal);
      applyComboUiLabels(getComboLang());
      modal.classList.remove('hidden');
    });
  }

  async function resolveSheetMapping(sheet, importSelection = null) {
    void importSelection;
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
      sheetName: sheet && sheet.name ? sheet.name : '',
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
    resetNotationImportPreview();
    const reader = new FileReader();
    reader.onload = async () => {
      setImportLoadingUi(true);
      try {
        state.notationUnknownTerms = new Set();
        const notationReady = await ensureNotationDictionaryLoaded();
        if (!notationReady) {
          showExportToast(comboMsg('notation_load_failed'), true, { dim: false });
        }
        if (name.endsWith('.json')) {
          const text = String(reader.result || '');
          await importJson(text);
        } else if (name.endsWith('.xlsx')) {
          const buffer = reader.result;
          await importXlsx(buffer);
        } else {
          window.alert(comboMsg('import_filetype_only'));
        }
        renderNotationImportPreviewRows();
      } finally {
        setImportLoadingUi(false);
        ui.importInput.value = '';
      }
    };
    if (name.endsWith('.xlsx')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }

  async function importJson(text) {
    try {
      const data = JSON.parse(text);
      const normalize = (c) => ({ ...defaultCombo(), ...c });
      const currentSlug = state.currentCharacter || getCharacterSlugFromUi();
      const unknownCollector = state.notationUnknownTerms || null;
      const previewRecorder = recordNotationImportPreview;
      if (Array.isArray(data)) {
        snapshotImportBackup(currentSlug);
        applyImportedCombos(normalizeImportedCombos(data.map((c) => normalize(c)), unknownCollector, previewRecorder));
      } else if (data && Array.isArray(data.combos)) {
        snapshotImportBackup(currentSlug);
        applyImportedCombos(normalizeImportedCombos(data.combos.map((c) => normalize(c)), unknownCollector, previewRecorder));
      } else if (data && Array.isArray(data.characters)) {
        const detected = [];
        data.characters.forEach((entry) => {
          if (!entry || !entry.character || !Array.isArray(entry.combos) || !entry.combos.length) return;
          const slug = resolveCharacterSlug(entry.character) || entry.character;
          if (!slug) return;
          detected.push(slug);
        });
        const selectedTargetsList = await chooseImportTarget(detected);
        if (selectedTargetsList == null) return;
        const selectedTargets = new Set(
          Array.isArray(selectedTargetsList) ? selectedTargetsList : [],
        );
        if (!selectedTargets.size) return;
        const touched = new Set();
        data.characters.forEach((entry) => {
          if (!entry || !entry.character || !Array.isArray(entry.combos)) return;
          const slug = resolveCharacterSlug(entry.character) || entry.character;
          if (!slug) return;
          if (!selectedTargets.has(slug)) return;
          if (!touched.has(slug)) {
            snapshotImportBackup(slug);
            touched.add(slug);
          }
          const normalized = normalizeImportedCombos(entry.combos.map((c) => normalize(c)), unknownCollector, previewRecorder);
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
      const detectedSlugs = Array.from(new Set(
        workbook.worksheets
          .map((sheet) => resolveCharacterSlug(sheet.name))
          .filter(Boolean),
      ));
      const selectedTargetsList = await chooseImportTarget(detectedSlugs);
      if (selectedTargetsList == null) return;
      const selectedTargets = new Set(
        Array.isArray(selectedTargetsList) ? selectedTargetsList : [],
      );
      if (!selectedTargets.size) return;
      const sheetCombos = new Map();
      const unknownSheetsDetected = [];
      let canceled = false;
      for (const sheet of workbook.worksheets) {
        const slug = resolveCharacterSlug(sheet.name);
        if (!slug) {
          unknownSheetsDetected.push(sheet.name || '(no name)');
          continue;
        }
        if (!selectedTargets.has(slug)) {
          continue;
        }
        const combos = await parseSheetToCombos(sheet, null);
        if (combos == null) {
          canceled = true;
          break;
        }
        if (!combos.length) continue;
        if (!sheetCombos.has(slug)) sheetCombos.set(slug, []);
        sheetCombos.get(slug).push(...combos);
      }
      if (canceled) return;
      if (unknownSheetsDetected.length && selectedTargets.size === detectedSlugs.length) {
        window.alert(comboMsg('import_unknown_sheets', { sheets: unknownSheetsDetected.join(', ') }));
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
    const sanitized = combos
      .map((c) => ({ ...defaultCombo(), ...(c || {}) }))
      .filter((combo) => hasImportableCommandText(combo.command));
    if (!sanitized.length) return;
    resetHydrationState();
    state.combos = sanitized;
    resetRenderLimitForCurrentData();
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
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
    updateLoadMoreControl();
    setSelectedGroup(0);
  }

  function appendImportedCombos(combos) {
    if (!Array.isArray(combos) || !combos.length) return;
    const sanitized = combos
      .map((c) => ({ ...defaultCombo(), ...(c || {}) }))
      .filter((combo) => hasImportableCommandText(combo.command));
    if (!sanitized.length) return;
    resetHydrationState();
    const next = sanitized.map((c) => ({ ...defaultCombo(), ...c, _manual: true }));
    const current = Array.isArray(state.combos) ? state.combos.slice() : [];
    while (current.length && isComboBlank(current[current.length - 1])) {
      current.pop();
    }
    state.combos = current.concat(next);
    state.renderLimit = state.combos.length;
    const renderTarget = getRenderTargetCount();
    trimGroupCount(renderTarget);
    ensureGroupCount(renderTarget);
    persist();
    applyStateToTable();
    updateEmptyGroups();
    applyFilters();
    updateLoadMoreControl();
    setSelectedGroup(0);
  }

  function appendCombosToStorage(slug, combos) {
    if (!slug || !Array.isArray(combos) || !combos.length) return;
    const sanitized = combos
      .map((c) => ({ ...defaultCombo(), ...(c || {}) }))
      .filter((combo) => hasImportableCommandText(combo.command));
    if (!sanitized.length) return;
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
      while (existing.length && isComboBlank(existing[existing.length - 1])) {
        existing.pop();
      }
      const next = sanitized.map((c) => ({ ...defaultCombo(), ...c, _manual: true }));
      localStorage.setItem(key, JSON.stringify({ combos: existing.concat(next) }));
    } catch { }
  }

  async function parseSheetToCombos(sheet, importSelection = null) {
    if (!sheet) return [];
    const headerRow = sheet.getRow(1);
    const subHeaderRow = sheet.getRow(2);
    const exportLike = rowHasText(subHeaderRow, ['操作方法', 'M/C', 'Control'])
      || (rowHasText(headerRow, ['コンボ', 'Combo']) && rowHasText(headerRow, ['条件', 'Conditions']));
    if (exportLike) {
      return parseExportSheetToCombos(sheet, headerRow, subHeaderRow);
    }
    const selected = await resolveSheetMapping(sheet, importSelection);
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
        if (field === 'command') {
          const normalized = normalizeCommandForStorage(rawValue, unknownCollector);
          if (!hasImportableCommandText(normalized && normalized.canonical ? normalized.canonical : '')) return;
          combo.command = normalized.canonical;
          recordNotationImportPreview(rawValue, normalized);
          return;
        }
        if (field === 'buttons') {
          combo.buttons = normalizeButtonsForStorage(rawValue, unknownCollector);
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
      if (!hasImportableCommandText(combo.command)) continue;
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
        const normalized = normalizeCommandForStorage(command, unknownCollector);
        if (!hasImportableCommandText(normalized && normalized.canonical ? normalized.canonical : '')) {
          current = null;
          return;
        }
        current.command = normalized.canonical;
        current.buttons = normalized.canonical;
        recordNotationImportPreview(command, normalized);
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
            <button type="button" class="tutorial-flow-trigger tutorial-flow-trigger-modal combo-keymap-help-trigger"
              data-tutorial-flow="hotkey-customize" aria-label="Hotkey customize guide"
              title="Hotkey customize guide">?</button>
            <h3>${title}</h3>
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
      const desiredCanonical = normalize(canonicalizeCommandForStorage(
        normalizeDisplayCommandInput(String(label || ''), { applyUnknownRules: false }),
      ));
      if (!desired) return fallback || label;
      const matchByToken = keyTokens.find((token) => normalize(token) === desired);
      if (matchByToken) return matchByToken;
      if (desiredCanonical) {
        const matchByCanonicalToken = keyTokens.find((token) => normalize(token) === desiredCanonical);
        if (matchByCanonicalToken) return matchByCanonicalToken;
      }
      const matchByLabel = keyTokens.find((token) => normalize(displayLabelForToken(token)) === desired);
      if (matchByLabel) return matchByLabel;
      if (desiredCanonical) {
        const matchByCanonicalLabel = keyTokens.find((token) => (
          normalize(canonicalizeCommandForStorage(displayLabelForToken(token))) === desiredCanonical
        ));
        if (matchByCanonicalLabel) return matchByCanonicalLabel;
      }
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
            const hotkey = findHotkeyForToken(token, keymap, activeDevice) || '';
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
      // Resolve by semantic label first (e.g. token "o" => label "P"), then
      // fall back to raw token lookup for explicit canonical tokens.
      const key = findHotkeyForLabel(label, map) || findHotkeyForToken(token, map, activeDevice);
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
        ['623', 'Any or DI or DP or 投げ', '4(タメ)646',],
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
    tokens.forEach((token, idx) => {
      if (idx > 0) {
        const spacer = document.createElement('span');
        spacer.className = 'shortcut-sep';
        spacer.textContent = ' ';
        p.appendChild(spacer);
      }
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

  const SPECIAL_CONDITION_DEFINITIONS = [
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
    { value: 'メダル2', key: 'medal2', fallback: 'メダル2' },
    { value: 'メダル3', key: 'medal3', fallback: 'メダル3' },
    { value: 'メダル4', key: 'medal4', fallback: 'メダル4' },
    { value: 'メダル5', key: 'medal5', fallback: 'メダル5' },
    { value: '風破1', key: 'fuha1', fallback: '風破1' },
    { value: '風破2', key: 'fuha2', fallback: '風破2' },
    { value: '風破3', key: 'fuha3', fallback: '風破3' },
  ];

  const SPECIAL_CONDITION_BY_CHARACTER = {
    aki: ['none', 'poison'],
    blanka: ['none', 'sa2', 'doll1', 'doll2', 'doll3', 'doll4', 'doll5'],
    cviper: ['none', 'sa1'],
    ehonda: ['none', 'spirit'],
    guile: ['none', 'sa2'],
    jamie: ['none', 'drunk1', 'drunk2', 'drunk3', 'drunk4', 'sa2'],
    juri: ['none', 'sa2', 'fuha1', 'fuha2', 'fuha3'],
    kimberly: ['none', 'spray1', 'spray2', 'spray3', 'sa3'],
    lily: ['none', 'wind1', 'wind2', 'wind3'],
    mai: ['none', 'flame1', 'flame2', 'flame3', 'flame4', 'flame5'],
    manon: ['none', 'medal2', 'medal3', 'medal4', 'medal5'],
    vega_mbison: ['none', 'mine'],
    rashid: ['none', 'sa2'],
    ryu: ['none', 'focus'],
  };

  const SPECIAL_CONDITION_TABLE_MULTI_CHARACTERS = new Set(['blanka', 'juri', 'kimberly']);
  const SPECIAL_CONDITION_DEFAULT_KEYS = ['none'];

  function getActiveCharacterSlug() {
    const current = resolveCharacterSlug(state.currentCharacter || '');
    if (current) return current;
    return resolveCharacterSlug(getCharacterSlugFromUi()) || '';
  }

  function getSpecialConditionOptions(lang, characterSlug = '') {
    const active = lang || getComboLang();
    const entryByKey = new Map(SPECIAL_CONDITION_DEFINITIONS.map((entry) => [entry.key, entry]));
    const activeSlug = resolveCharacterSlug(characterSlug || '') || getActiveCharacterSlug();
    const configured = Array.isArray(SPECIAL_CONDITION_BY_CHARACTER[activeSlug])
      ? SPECIAL_CONDITION_BY_CHARACTER[activeSlug]
      : null;
    const keys = (configured && configured.length
      ? configured
      : SPECIAL_CONDITION_DEFAULT_KEYS)
      .map((key) => String(key || '').trim())
      .filter((key, index, arr) => key && arr.indexOf(key) === index && entryByKey.has(key));
    return keys.map((key) => {
      const entry = entryByKey.get(key);
      return {
        value: entry.value,
        label: comboT(`special_conditions.${entry.key}`, active) || entry.fallback,
      };
    });
  }

  function shouldUseSpecialConditionTableMultiInput(characterSlug = '') {
    const slug = resolveCharacterSlug(characterSlug || '') || getActiveCharacterSlug();
    return SPECIAL_CONDITION_TABLE_MULTI_CHARACTERS.has(slug);
  }

  function normalizeSpecialConditionSingleValue(value, options) {
    const normalizedOptions = Array.isArray(options) ? options : [];
    const allowed = new Set(
      normalizedOptions
        .map((opt) => String((opt && opt.value) || '').trim())
        .filter(Boolean),
    );
    const raw = String(value || '').trim();
    if (raw && allowed.has(raw)) return raw;
    const tokens = parseMultiValue(raw);
    for (const token of tokens) {
      if (allowed.has(token)) return token;
    }
    if (allowed.has('-')) return '-';
    return '';
  }

  function setSpecialConditionSelectOptions(select, options, selectedValue = '') {
    if (!select) return;
    const normalized = Array.isArray(options) ? options : [];
    const nextValue = normalizeSpecialConditionSingleValue(selectedValue, normalized);
    select.innerHTML = '';
    normalized.forEach((opt) => {
      select.appendChild(new Option(String(opt.label || opt.value || ''), String(opt.value || '')));
    });
    if (nextValue && !normalized.some((opt) => String((opt && opt.value) || '').trim() === nextValue)) {
      select.appendChild(new Option(nextValue, nextValue));
    }
    select.value = nextValue;
  }

  function buildSpecialConditionTableControl(group, lang) {
    const active = lang || getComboLang();
    const options = getSpecialConditionOptions(active);
    if (shouldUseSpecialConditionTableMultiInput()) {
      return buildMultiInput('special_condition', group, options);
    }
    return buildSelect('special_condition', group, options);
  }

  function refreshSpecialConditionTableInputs(lang) {
    const active = lang || getComboLang();
    const options = getSpecialConditionOptions(active);
    const useMulti = shouldUseSpecialConditionTableMultiInput();
    state.groups.forEach((group) => {
      if (!group || !group.inputs) return;
      const current = group.inputs.special_condition;
      if (!current) return;
      const combo = state.combos[group.index] || defaultCombo();
      const raw = String(combo.special_condition || '').trim();
      const isMulti = current.classList && current.classList.contains('multi-input');
      const wantsMulti = !!useMulti;
      const keepType = wantsMulti ? isMulti : current.tagName === 'SELECT';
      if (keepType) {
        if (wantsMulti) {
          current.dataset.options = JSON.stringify(options);
          current.dataset.rawValue = raw;
          current.value = formatSpecialConditionDisplay(raw, active);
        } else {
          setSpecialConditionSelectOptions(current, options, raw);
        }
        return;
      }
      const hostCell = current.closest('td,th');
      if (!hostCell) return;
      const locked = isComboFieldLocked(combo, 'special_condition');
      let nextControl;
      if (wantsMulti) {
        nextControl = buildMultiInput('special_condition', group, options);
        nextControl.dataset.rawValue = raw;
        nextControl.value = formatSpecialConditionDisplay(raw, active);
      } else {
        nextControl = buildSelect('special_condition', group, options);
        setSpecialConditionSelectOptions(nextControl, options, raw);
      }
      placeControl(hostCell, nextControl);
      nextControl.classList.toggle('combo-input-locked', locked);
      setLockBadgeForCell(hostCell, locked);
    });
  }

  function refreshSpecialConditionFilterGroup(panel, lang) {
    const root = panel || qs('comboFilterPanel');
    if (!root) return false;
    const container = root.querySelector('#comboFilterSpecialGroup');
    if (!container) return false;
    const active = lang || getComboLang();
    const options = getSpecialConditionOptions(active)
      .filter((opt) => opt && opt.value && opt.value !== '-');
    const fromDom = Array.from(container.querySelectorAll('input[name="comboFilter-special"]:checked'))
      .map((input) => String(input.value || '').trim())
      .filter(Boolean);
    const fromState = Array.isArray(state.filters && state.filters.special) ? state.filters.special : [];
    const selected = new Set([...fromState, ...fromDom].map((value) => String(value || '').trim()).filter(Boolean));
    const allowed = new Set(options.map((opt) => String(opt.value || '').trim()).filter(Boolean));
    const nextSelected = Array.from(selected).filter((value) => allowed.has(value));
    const prevSelected = Array.isArray(state.filters && state.filters.special) ? state.filters.special.slice() : [];
    state.filters.special = nextSelected;
    container.innerHTML = '';
    options.forEach((opt) => {
      const value = String(opt.value || '').trim();
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'comboFilter-special';
      input.value = value;
      input.checked = nextSelected.includes(value);
      const span = document.createElement('span');
      span.textContent = String(opt.label || value);
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
    container.dataset.built = 'true';
    if (prevSelected.length !== nextSelected.length) return true;
    return prevSelected.some((value, index) => String(value || '') !== String(nextSelected[index] || ''));
  }

  function getSaFilterOptions(lang, characterSlug) {
    const active = lang || getComboLang();
    const entryByKey = new Map(SA_FILTER_DEFINITIONS.map((entry) => [entry.key, entry]));
    const activeSlug = resolveCharacterSlug(characterSlug || '') || getComboSaFilterCharacterSlug();
    const configured = Array.isArray(SA_FILTER_BY_CHARACTER[activeSlug])
      ? SA_FILTER_BY_CHARACTER[activeSlug]
      : SA_FILTER_BY_CHARACTER.default;
    const keys = (configured && configured.length
      ? configured
      : SA_FILTER_BY_CHARACTER.default)
      .map((key) => String(key || '').trim())
      .filter((key, index, arr) => key && arr.indexOf(key) === index && entryByKey.has(key));
    return keys.map((key) => {
      const entry = entryByKey.get(key);
      return {
        value: entry.value,
        label: comboT(`sa_filters.${entry.key}`, active) || entry.fallback,
      };
    });
  }

  function refreshSaFilterGroup(panel, lang) {
    const root = panel || qs('comboFilterPanel');
    if (!root) return false;
    const container = root.querySelector('#comboFilterSaGroup');
    if (!container) return false;
    const active = lang || getComboLang();
    const options = getSaFilterOptions(active);
    const fromDom = Array.from(container.querySelectorAll('input[name="comboFilter-sa"]:checked'))
      .map((input) => String(input.value || '').trim())
      .filter(Boolean);
    const fromState = Array.isArray(state.filters && state.filters.sa) ? state.filters.sa : [];
    const selected = new Set([...fromState, ...fromDom].map((value) => String(value || '').trim()).filter(Boolean));
    const allowed = new Set(options.map((opt) => String(opt.value || '').trim()).filter(Boolean));
    const nextSelected = Array.from(selected).filter((value) => allowed.has(value));
    const prevSelected = Array.isArray(state.filters && state.filters.sa) ? state.filters.sa.slice() : [];
    state.filters.sa = nextSelected;
    container.innerHTML = '';
    options.forEach((opt) => {
      const value = String(opt.value || '').trim();
      const label = document.createElement('label');
      label.className = 'checkbox-item';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'comboFilter-sa';
      input.value = value;
      input.checked = nextSelected.includes(value);
      const span = document.createElement('span');
      span.textContent = String(opt.label || value);
      label.appendChild(input);
      label.appendChild(span);
      container.appendChild(label);
    });
    container.dataset.built = 'true';
    if (prevSelected.length !== nextSelected.length) return true;
    return prevSelected.some((value, index) => String(value || '') !== String(nextSelected[index] || ''));
  }

  function getComboSaFilterCharacterSlug() {
    return resolveCharacterSlug(state.currentCharacter || getCharacterSlugFromUi()) || '';
  }

  function matchesAnyRegex(text, patterns) {
    const source = String(text || '');
    if (!source) return false;
    const list = Array.isArray(patterns) ? patterns : [];
    return list.some((pattern) => {
      if (!(pattern instanceof RegExp)) return false;
      const flags = pattern.flags.replace(/g/g, '');
      const re = new RegExp(pattern.source, flags);
      return re.test(source);
    });
  }

  function getComboSaTags(combo, characterSlug) {
    const slug = resolveCharacterSlug(characterSlug || getComboSaFilterCharacterSlug()) || '';
    const raw = String(combo && combo.command ? combo.command : '').trim();
    if (!raw) return new Set();
    const canonical = canonicalizeCommandForStorage(raw);
    const cacheKey = `${slug}::${canonical}`;
    if (saFilterTagCache.has(cacheKey)) {
      return new Set(saFilterTagCache.get(cacheKey));
    }
    const tags = new Set();
    const configured = Array.isArray(SA_FILTER_BY_CHARACTER[slug])
      ? SA_FILTER_BY_CHARACTER[slug]
      : SA_FILTER_BY_CHARACTER.default;
    const optionKeys = (configured && configured.length ? configured : SA_FILTER_BY_CHARACTER.default)
      .map((key) => String(key || '').trim())
      .filter(Boolean);
    optionKeys.forEach((key) => {
      const patterns = SA_COMMAND_PATTERNS[key];
      if (!Array.isArray(patterns) || !patterns.length) return;
      if (matchesAnyRegex(canonical, patterns)) {
        tags.add(key);
      }
    });
    const frozen = Object.freeze(Array.from(tags));
    saFilterTagCache.set(cacheKey, frozen);
    return new Set(frozen);
  }

  function comboMatchesSaFilter(combo, selectedValues) {
    const filters = Array.isArray(selectedValues) ? selectedValues : [];
    if (!filters.length) return true;
    const activeFilters = filters
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    if (!activeFilters.length) return true;
    const tags = getComboSaTags(combo, getComboSaFilterCharacterSlug());
    return activeFilters.some((value) => tags.has(value));
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
      if (ui.hydrationStatus && !ui.hydrationStatus.classList.contains('hidden')) {
        positionHydrationStatusUi();
      }
    }
  });

  async function switchCharacterCombos(slug) {
    if (!slug) return;
    const current = state.currentCharacter || getCharacterSlugFromUi();
    if (slug === current) return;
    persist({ immediate: true, dirty: false });
    state.currentCharacter = slug;
    persistComboCharacter(slug);
    if (ui.comboView) ui.comboView.dataset.character = slug;
    resetHydrationState();
    loadState({ resetIfMissing: true });
    ensureSampleCombo();
    syncFirstRowSampleForCurrentMode();
    resetRenderLimitForCurrentData();
    const fullTarget = getRenderTargetCount();
    const initialTarget = getFastBootTarget(fullTarget);
    trimGroupCount(initialTarget);
    if (initialTarget > CHUNKED_APPLY_THRESHOLD) {
      await ensureGroupCountChunked(initialTarget);
    } else {
      ensureGroupCount(initialTarget);
    }
    if (state.groups.length > CHUNKED_APPLY_THRESHOLD) {
      await applyStateToTableChunked();
    } else {
      applyStateToTable();
    }
    refreshSpecialConditionTableInputs(getComboLang());
    applyComboFilterLabels(getComboLang());
    updateEmptyGroups();
    applyFilters();
    queueBackgroundHydrationToFull();
    updateLoadMoreControl();
    setSelectedGroup(0);
  }

  window.switchComboCharacter = (slug) => {
    const resolved = resolveCharacterSlug(slug) || '';
    if (!resolved) return;
    applyComboPortrait(resolved);
    void switchCharacterCombos(resolved);
  };
})();
