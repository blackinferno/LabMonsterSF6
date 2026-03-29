from __future__ import annotations

import json
import re
import sqlite3
from collections import defaultdict
from pathlib import Path

from common import canonical_character_slug, load_csv_rows_with_header, parse_alternatives
from mmdk_calc_enrich import MmdkCalcResolver


ROOT = Path(__file__).resolve().parents[2]
IN_CSV = ROOT / "tools" / "moveset" / "Context" / "mmdk_action_mapping_enriched.csv"
OUT_JSON = ROOT / "sf6_viewer_unified" / "assets" / "data" / "combo_calc_index.json"
MOVESET_DB = ROOT / "tools" / "moveset" / "sf6_moveset.db"
PLAYERDATA_DIR = ROOT / "sf6_viewer_unified" / "assets" / "data" / "PlayerData"
MOVEMENT_OVERRIDE_CSV = ROOT / "tools" / "moveset" / "Context" / "movement_override_todo.csv"
FRAME_COMMAND_MAPPING_CSV = ROOT / "tools" / "moveset" / "Context" / "frame_command_mapping.csv"
MMDK_MAPPING_CSV = ROOT / "tools" / "moveset" / "Context" / "mmdk_action_mapping_enriched.csv"
WIDTH_PROFILE_CSV = ROOT / "tools" / "moveset" / "Context" / "character_width_profile.csv"
SELF_POS_TO_VS_SCALE = 100.0
TELEMETRY_LINK_MIN_ACTION_ID = 600
MMDK_ON_HIT_ADV_OVERRIDES: dict[tuple[str, str], int] = {
    # AKI snake-whip projectile mids/highs share KD/+44.
    ("aki", "SPA_Jatoben_M"): 44,
    ("aki", "SPA_Jatoben_H"): 44,
    # AKI 紫泡撒強 behaves as KD/+40.
    ("aki", "SPA_ShihouSan"): 40,
}

JAMIE_DRUNK_LEVEL_MAX = 4
JURI_FUHA_LEVEL_MAX = 3


def movement_override_source_key(row: dict[str, str]) -> str:
    return str(row.get("mmdk_distance_source_key") or row.get("mmdk_source_key") or "").strip()


def parse_float_from_row(row: dict[str, str], keys: list[str]) -> float | None:
    for key in keys:
        if key not in row:
            continue
        value = parse_float_like(row.get(key))
        if value is not None:
            return value
    return None


def load_manual_movement_overrides() -> dict[tuple[str, str, str], list[dict[str, object]]]:
    rows: list[dict[str, str]] = []
    if MMDK_MAPPING_CSV.exists():
        rows = load_csv_rows_with_header(
            MMDK_MAPPING_CSV,
            {"character_slug", "action_id"},
        )
    if not rows and FRAME_COMMAND_MAPPING_CSV.exists():
        rows = load_csv_rows_with_header(
            FRAME_COMMAND_MAPPING_CSV,
            {"character_slug", "control_type", "move_name_jp"},
        )
    if not rows and MOVEMENT_OVERRIDE_CSV.exists():
        rows = load_csv_rows_with_header(
            MOVEMENT_OVERRIDE_CSV,
            {"character_slug", "control_type", "move_name_jp"},
        )
    if not rows:
        return {}
    out: dict[tuple[str, str, str], list[dict[str, object]]] = defaultdict(list)
    for row in rows:
        character = canonical_character_slug(row.get("character_slug") or "")
        control = str(row.get("control_type") or "").strip().lower() or "classic"
        row_kind = str(row.get("row_kind") or "").strip().lower()
        move_name = str(row.get("move_name_jp") or "").strip()
        if not move_name:
            move_name = str(row.get("frame_link_move_name_jp") or "").strip()
        if not move_name:
            move_name = str((row.get("candidate_moves") or "").split("|")[0]).strip()
        if row_kind == "mmdk":
            # MMDK rows can still supply movement overrides for a frame-linked move.
            move_name = str(row.get("frame_link_move_name_jp") or move_name).strip()
        if not character or control not in {"classic", "modern"} or not move_name:
            continue

        self_start = parse_float_from_row(row, ["manual_self_pos_start_x", "manual_self_start_x"])
        self_end = parse_float_from_row(row, ["manual_self_pos_end_x", "manual_self_end_x"])
        opp_start = parse_float_from_row(
            row,
            [
                "manual_opp_pos_start_x",
                "manual_opponent_pos_start_x",
                "manual_target_pos_start_x",
            ],
        )
        opp_end = parse_float_from_row(
            row,
            [
                "manual_opp_pos_end_x",
                "manual_opponent_pos_end_x",
                "manual_target_pos_end_x",
            ],
        )
        vs_start = parse_float_from_row(row, ["manual_vs_distance_start", "manual_vs_start"])
        vs_end = parse_float_from_row(row, ["manual_vs_distance_end", "manual_vs_end"])
        calc_self_total = parse_float_like(row.get("calc_manual_self_move_x_total"))
        calc_target_sum = parse_float_like(row.get("calc_manual_target_move_x_sum"))

        self_total: float | None = None
        target_sum: float | None = None
        if self_start is not None and self_end is not None:
            # Position X delta (world space) to VS distance unit conversion.
            self_total = (self_end - self_start) * SELF_POS_TO_VS_SCALE
        elif calc_self_total is not None:
            self_total = calc_self_total

        if opp_start is not None and opp_end is not None:
            # Direct opponent X-position delta (world space) to VS unit conversion.
            target_sum = (opp_end - opp_start) * SELF_POS_TO_VS_SCALE
        elif self_total is not None and vs_start is not None and vs_end is not None:
            target_sum = self_total + (vs_end - vs_start)
        elif calc_target_sum is not None:
            target_sum = calc_target_sum

        # Keep rows where at least one side is manually defined.
        if self_total is None and target_sum is None:
            continue

        action_id = parse_number(row.get("mmdk_action_id") or row.get("action_id") or "")
        action_id_int = int(action_id) if isinstance(action_id, (int, float)) else None
        source_key = str(row.get("mmdk_source_key") or "").strip() or movement_override_source_key(row)

        out[(character, control, move_name)].append(
            {
                "action_id": action_id_int,
                "source_key": source_key,
                "self_start": self_start,
                "self_end": self_end,
                "opp_start": opp_start,
                "opp_end": opp_end,
                "self_total": self_total,
                "target_sum": target_sum,
            }
        )
    return out


def find_manual_movement_override(
    overrides: dict[tuple[str, str, str], list[dict[str, object]]],
    *,
    character: str,
    control: str,
    move_name: str,
    action_id: int | None,
    action_name: str,
    mmdk_source_key: str,
) -> dict[str, object] | None:
    action_name_key = str(action_name or "").strip()
    source_key = str(mmdk_source_key or "").strip()

    def pick_from_candidates(candidates: list[dict[str, object]]) -> dict[str, object] | None:
        if not candidates:
            return None

        # Priority 1: exact action_id match
        if action_id is not None:
            for row in candidates:
                row_action_id = row.get("action_id")
                if isinstance(row_action_id, int) and row_action_id == action_id:
                    return row

        # Priority 2: source-key match
        for row in candidates:
            row_source = str(row.get("source_key") or "").strip()
            if not row_source:
                continue
            if row_source == source_key or row_source == action_name_key:
                return row

        # Priority 3: if unique row for this move, use it.
        if len(candidates) == 1:
            return candidates[0]
        return None

    # Primary: same control type.
    primary = overrides.get((character, control, move_name), [])
    picked = pick_from_candidates(primary)
    if picked is not None:
        return picked

    # Fallback: movement is often shared between classic/modern.
    for fallback_control in ("classic", "modern"):
        if fallback_control == control:
            continue
        fallback_candidates = overrides.get((character, fallback_control, move_name), [])
        picked = pick_from_candidates(fallback_candidates)
        if picked is not None:
            return picked

    return None


def apply_manual_movement_override(entry: dict[str, object], override_row: dict[str, object]) -> None:
    self_total = parse_float_like(override_row.get("self_total"))
    target_sum = parse_float_like(override_row.get("target_sum"))
    self_start = parse_float_like(override_row.get("self_start"))
    self_end = parse_float_like(override_row.get("self_end"))
    source_key = str(override_row.get("source_key") or "").strip() or "MANUAL_OVERRIDE"

    entry["mmdk_distance_source_key"] = source_key
    entry["mmdk_distance_manual_override"] = True
    if self_total is not None:
        entry["mmdk_distance_self_move_x_total"] = self_total
    if self_start is not None:
        entry["mmdk_distance_self_move_x_start"] = self_start
    if self_end is not None:
        entry["mmdk_distance_self_move_x_end"] = self_end
    if target_sum is not None:
        entry["mmdk_distance_target_move_x_sum"] = target_sum


def load_character_width_profile() -> dict[str, dict[str, float]]:
    if not WIDTH_PROFILE_CSV.exists():
        return {}
    rows = load_csv_rows_with_header(
        WIDTH_PROFILE_CSV,
        {"character_slug"},
    )
    out: dict[str, dict[str, float]] = {}
    for row in rows:
        character = canonical_character_slug(row.get("character_slug") or "")
        if not character:
            continue
        width_front = (
            parse_float_like(row.get("width_front_vs"))
            or parse_float_like(row.get("front_width_vs"))
            or parse_float_like(row.get("character_width_front_vs"))
        )
        width_back = (
            parse_float_like(row.get("width_back_vs"))
            or parse_float_like(row.get("back_width_vs"))
            or parse_float_like(row.get("character_width_back_vs"))
        )
        width_half = (
            parse_float_like(row.get("width_half_vs"))
            or parse_float_like(row.get("half_width_vs"))
            or parse_float_like(row.get("character_width_half_vs"))
        )
        if width_front is None and width_half is not None:
            width_front = width_half
        if width_back is None and width_half is not None:
            width_back = width_half
        if (
            (width_front is None or width_front <= 0)
            and (width_back is None or width_back <= 0)
        ):
            continue
        profile: dict[str, float] = {}
        if width_front is not None and width_front > 0:
            profile["front_vs"] = float(width_front)
        if width_back is not None and width_back > 0:
            profile["back_vs"] = float(width_back)
        if profile:
            out[character] = profile
    return out


def parse_number(value: str) -> int | float | None:
    text = str(value or "").strip().replace(",", "")
    if not text:
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", text)
    if not m:
        return None
    raw = m.group(0)
    if "." in raw:
        try:
            return float(raw)
        except ValueError:
            return None
    try:
        return int(raw)
    except ValueError:
        return None


def parse_first_signed_number(value: str) -> int | float | None:
    text = str(value or "").strip().replace(",", "")
    if not text:
        return None
    m = re.search(r"[+-]?\d+(?:\.\d+)?", text)
    if not m:
        return None
    raw = m.group(0)
    if "." in raw:
        try:
            return float(raw)
        except ValueError:
            return None
    try:
        return int(raw)
    except ValueError:
        return None


def parse_first_positive_number(value: str) -> int | float | None:
    text = str(value or "").strip().replace(",", "")
    if not text:
        return None
    matches = re.findall(r"\d+(?:\.\d+)?", text)
    for raw in matches:
        if "." in raw:
            try:
                parsed: int | float = float(raw)
            except ValueError:
                continue
        else:
            try:
                parsed = int(raw)
            except ValueError:
                continue
        if parsed > 0:
            return parsed
    return None


def parse_all_positive_numbers(value: str) -> list[int | float]:
    text = str(value or "").strip().replace(",", "")
    if not text:
        return []
    out: list[int | float] = []
    for raw in re.findall(r"\d+(?:\.\d+)?", text):
        if "." in raw:
            try:
                parsed: int | float = float(raw)
            except ValueError:
                continue
        else:
            try:
                parsed = int(raw)
            except ValueError:
                continue
        if parsed > 0:
            out.append(parsed)
    return out


def movement_strength(payload: dict[str, object]) -> float:
    if not isinstance(payload, dict):
        return 0.0
    values: list[float] = []
    first = parse_float_like(payload.get("mmdk_target_move_x_first"))
    total = parse_float_like(payload.get("mmdk_target_move_x_sum"))
    if first is not None:
        values.append(abs(first))
    if total is not None:
        values.append(abs(total))
    return max(values) if values else 0.0


def parse_float_like(value) -> float | None:
    if isinstance(value, bool):
        return float(int(value))
    if isinstance(value, (int, float)):
        return float(value)
    if value is None:
        return None
    m = re.search(r"-?\d+(?:\.\d+)?", str(value))
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def normalize_active_ranges_text(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return ""
    prev = None
    # Fix concatenated ranges produced by source exports, e.g. "13-3813-15" -> "13-38,13-15".
    while text != prev:
        prev = text
        text = re.sub(
            r"(\d{1,3})-(\d{1,3})(\d{1,3})-(\d{1,3})",
            r"\1-\2,\3-\4",
            text,
        )
    return text


def row_last_active_frame(row: dict[str, str]) -> int | float | None:
    active_text = normalize_active_ranges_text(row.get("active") or "")
    if not active_text:
        return None
    values = parse_all_positive_numbers(active_text)
    if not values:
        return None
    startup = parse_first_positive_number(row.get("startup") or "")
    if startup is not None:
        upper = startup + 600
        filtered = [v for v in values if v <= upper]
        if filtered:
            return max(filtered)
    coarse_filtered = [v for v in values if v <= 600]
    if coarse_filtered:
        return max(coarse_filtered)
    return max(values)


def row_applies_poison_on_hit(row: dict[str, str]) -> bool:
    override = parse_bool_like(row.get("applies_poison_on_hit_override") or "")
    if override is not None:
        return bool(override)
    name = str(row.get("move_name_jp") or "").strip()
    if "炸裂" in name:
        # Consume/bloom variants should not be treated as poison-apply moves.
        return False
    note = str(row.get("note") or "").strip()
    if not note:
        return False
    if "ヒット時毒状態" in note:
        return True
    return False


def row_triggers_poison_bloom_on_hit(row: dict[str, str]) -> bool:
    override = parse_bool_like(row.get("triggers_poison_bloom_on_hit_override") or "")
    if override is not None:
        return bool(override)
    name = str(row.get("move_name_jp") or "").strip()
    if "炸裂" in name:
        return True
    note = str(row.get("note") or "").strip()
    if not note:
        return False
    return "毒破裂" in note


def row_poison_bloom_damage(row: dict[str, str]) -> int | float | None:
    override = parse_number(str(row.get("poison_bloom_damage_override") or ""))
    if isinstance(override, (int, float)) and override > 0:
        return override
    note = str(row.get("note") or "").strip()
    if not note:
        return None
    # e.g. "毒破裂時ダメージ800/..."
    m = re.search(r"毒破裂時ダメージ\s*([0-9]+(?:\.[0-9]+)?)", note)
    if not m:
        return None
    raw = m.group(1)
    if "." in raw:
        try:
            return float(raw)
        except ValueError:
            return None
    try:
        return int(raw)
    except ValueError:
        return None


def row_poison_bloom_on_hit(row: dict[str, str]) -> int | float | str | None:
    override_raw = str(row.get("poison_bloom_on_hit_override") or "").strip()
    if override_raw:
        if re.fullmatch(r"[dD]", override_raw):
            return "D"
        parsed = parse_number(override_raw)
        if isinstance(parsed, (int, float)):
            return parsed

    note = str(row.get("note") or "").strip()
    if not note or "毒破裂" not in note:
        return None

    # e.g. "...毒破裂時＋22"
    matches = list(re.finditer(r"毒破裂時[^。\n\r]*?[＋+]\s*([0-9]+(?:\.[0-9]+)?)", note))
    if matches:
        raw = matches[-1].group(1)
        if "." in raw:
            try:
                return float(raw)
            except ValueError:
                return None
        try:
            return int(raw)
        except ValueError:
            return None

    # Bloom variants that change hit result to knockdown/crumple/launch should
    # resolve to a down-state frame advantage instead of base numeric values.
    if re.search(r"毒破裂時[^。\n\r]*(?:膝崩れ|吹き飛び|ダウン|挙動変化)", note):
        return "D"

    return None


def dedupe_keep_order(values: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        key = str(value or "").strip()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def parse_special_key_list(value: str) -> list[str]:
    text = str(value or "").strip()
    if not text:
        return []
    raw_parts = re.split(r"[|,/]", text)
    out: list[str] = []
    seen: set[str] = set()
    for raw in raw_parts:
        key = str(raw or "").strip().lower()
        if not key or key == "-" or key == "none":
            continue
        if key in seen:
            continue
        seen.add(key)
        out.append(key)
    return out


def parse_bool_like(value: str) -> bool | None:
    text = str(value or "").strip().lower()
    if not text:
        return None
    if text in {"1", "true", "t", "yes", "y", "on"}:
        return True
    if text in {"0", "false", "f", "no", "n", "off"}:
        return False
    return None


def expand_level_keys(prefix: str, minimum: int, maximum: int) -> list[str]:
    if minimum <= 0 or maximum < minimum:
        return []
    return [f"{prefix}{value}" for value in range(minimum, maximum + 1)]


def parse_first_int_in_text(value: str) -> int | None:
    m = re.search(r"(\d+)", str(value or ""))
    if not m:
        return None
    try:
        return int(m.group(1))
    except ValueError:
        return None


def row_required_special_keys(character: str, row: dict[str, str]) -> list[str]:
    """
    Extract required special-state keys for move variants that share command tokens.
    This allows the calculator to pick the correct entry for install/drink/fuha routes.
    """
    explicit = parse_special_key_list(row.get("required_special_keys") or "")
    if explicit:
        return explicit

    name = str(row.get("move_name_jp") or "")
    note = str(row.get("note") or "")
    text = f"{name} {note}"
    keys: list[str] = []

    if character == "blanka":
        if "ライトニングビースト" in text or "SA2タイマー" in note:
            keys.append("sa2")

    if character == "guile":
        if "ソリッドパンチャー中" in text:
            keys.append("sa2")

    if character == "jamie":
        # e.g. （酔いLv2以上） / [酔いレベル4]
        level_match = re.search(r"(?:酔い(?:レベル|LV)?\s*([1-4]))\s*以上", name, re.IGNORECASE)
        if level_match:
            minimum = parse_first_int_in_text(level_match.group(1) or "")
            if minimum is not None:
                keys.extend(expand_level_keys("drunk", minimum, JAMIE_DRUNK_LEVEL_MAX))
        else:
            exact_level_match = re.search(r"(?:酔い(?:レベル|LV)?\s*([1-4]))", name, re.IGNORECASE)
            if exact_level_match:
                level = parse_first_int_in_text(exact_level_match.group(1) or "")
                if level is not None:
                    keys.append(f"drunk{level}")

        if not keys:
            note_level_match = re.search(
                r"酔い(?:レベル|LV)?\s*([1-4])\s*以上[^。\n\r]*発動可能",
                note,
                re.IGNORECASE,
            )
            if note_level_match:
                minimum = parse_first_int_in_text(note_level_match.group(1) or "")
                if minimum is not None:
                    keys.extend(expand_level_keys("drunk", minimum, JAMIE_DRUNK_LEVEL_MAX))

    if character == "juri":
        if "[チェーンコンボ]" in name or "チェーンコンボ" in name:
            keys.append("sa2")

        fuha_required = False
        if "[強化版]" in name:
            fuha_required = True
        elif "風破ストック" in text:
            # Requirement phrases ("stock available" / "stock >= N"), not gain text.
            if (
                re.search(r"風破ストック[^。\n\r]*(?:ある時|以上|発動可能)", text)
                and not re.search(r"風破ストック[^。\n\r]*増加", text)
            ):
                fuha_required = True

        if fuha_required:
            # "風破ストックがある時" implies stock >= 1.
            minimum = 1
            stock_count = re.search(r"風破ストック\s*([1-3])", text)
            if stock_count:
                parsed = parse_first_int_in_text(stock_count.group(1) or "")
                if parsed is not None:
                    minimum = max(1, min(parsed, JURI_FUHA_LEVEL_MAX))
            keys.extend(expand_level_keys("fuha", minimum, JURI_FUHA_LEVEL_MAX))

    return dedupe_keep_order(keys)


def build_low_manual_input_action_ids(rows: list[dict[str, str]]) -> dict[str, set[int]]:
    out: dict[str, set[int]] = defaultdict(set)
    for row in rows:
        character = canonical_character_slug(row.get("character_slug") or "")
        if not character:
            continue
        action_id = parse_first_int_in_text(str(row.get("action_id") or "").strip())
        if action_id is None or action_id >= TELEMETRY_LINK_MIN_ACTION_ID or action_id < 0:
            continue
        has_manual = bool(
            str(row.get("manual_tokens") or "").strip()
            or str(row.get("modern_full") or "").strip()
            or str(row.get("modern_short") or "").strip()
        )
        if has_manual:
            out[character].add(action_id)
    return out


def row_consume_special_keys(row: dict[str, str]) -> list[str]:
    return parse_special_key_list(row.get("consume_special_keys") or "")


def row_gain_special_keys(row: dict[str, str]) -> list[str]:
    return parse_special_key_list(row.get("gain_special_keys") or "")


def row_telemetry_action_ids(
    row: dict[str, str],
    key: str,
    *,
    character: str,
    allowed_low_manual_action_ids: dict[str, set[int]],
) -> list[int]:
    raw = str(row.get(key) or "").strip()
    if not raw:
        return []
    out: list[int] = []
    seen: set[int] = set()
    for part in raw.split("|"):
        part = str(part or "").strip()
        if not part:
            continue
        m = re.match(r"^-?\d+", part)
        if not m:
            continue
        try:
            aid = int(m.group(0))
        except Exception:
            continue
        if aid in seen:
            continue
        if aid < TELEMETRY_LINK_MIN_ACTION_ID:
            if aid not in allowed_low_manual_action_ids.get(character, set()):
                continue
        seen.add(aid)
        out.append(aid)
    return out


def row_telemetry_link_counts(row: dict[str, str], key: str) -> str:
    return str(row.get(key) or "").strip()


def row_telemetry_observed_starts(row: dict[str, str]) -> int | None:
    return parse_first_int_in_text(str(row.get("telemetry_observed_starts") or "").strip())


def row_first_active_frame(row: dict[str, str]) -> int | float | None:
    startup = parse_first_positive_number(row.get("startup") or "")
    if startup is not None:
        return startup
    return parse_first_positive_number(row.get("active") or "")


def row_total_frames(row: dict[str, str]) -> int | float | None:
    startup_text = str(row.get("startup") or "").strip()
    recovery_text = str(row.get("recovery") or "").strip()
    startup = parse_first_positive_number(startup_text)
    recovery = parse_first_positive_number(recovery_text)
    recovery_for_total = recovery
    # Dual recovery notation is hit(block). For total-frame baseline, use block side.
    dual_paren = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*[（(]\s*([0-9]+(?:\.[0-9]+)?)\s*[）)]", recovery_text)
    if dual_paren:
        parsed_block = parse_number(dual_paren.group(2))
        if parsed_block is not None:
            recovery_for_total = parsed_block
    else:
        dual_slash = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*/\s*([0-9]+(?:\.[0-9]+)?)", recovery_text)
        if dual_slash:
            parsed_block = parse_number(dual_slash.group(2))
            if parsed_block is not None:
                recovery_for_total = parsed_block
    last_active = row_last_active_frame(row)

    # `全体 N` in recovery is the most reliable total-frame source.
    if recovery_for_total is not None and "全体" in recovery_text:
        return recovery_for_total
    # When active ranges are present, compute total from the last active frame.
    if last_active is not None and recovery_for_total is not None:
        return last_active + recovery_for_total
    if startup is not None and recovery_for_total is not None:
        return startup + recovery_for_total
    if recovery_for_total is not None:
        return recovery_for_total
    if last_active is not None:
        return last_active
    if startup is not None:
        return startup

    active = parse_first_positive_number(normalize_active_ranges_text(row.get("active") or ""))
    return active


def row_opponent_recovery_frame_from_move_start(
    row: dict[str, str],
    first_active_frame: int | float | None = None,
    mmdk_hitstun_first: int | float | None = None,
    mmdk_on_hit_adv: int | float | None = None,
    mmdk_hitstun_inclusive: bool = False,
) -> int | float | None:
    total = row_total_frames(row)
    first = first_active_frame if (first_active_frame is not None and first_active_frame > 0) else row_first_active_frame(row)
    remaining_after_hit = None
    if total is not None and first is not None and first > 0:
        remaining_after_hit = total - first + 1
        if remaining_after_hit <= 0:
            remaining_after_hit = None

    on_hit = parse_first_signed_number(row.get("on_hit") or "")
    # Prefer explicit frame-advantage values when present.
    if on_hit is not None:
        if remaining_after_hit is not None:
            value = remaining_after_hit + on_hit
            if value > 0:
                return value
            return remaining_after_hit
        if total is not None:
            value = total + on_hit
            if value > 0:
                return value
            return total

    if mmdk_on_hit_adv is not None and mmdk_on_hit_adv > 0:
        if remaining_after_hit is not None:
            value = remaining_after_hit + mmdk_on_hit_adv
            if value > 0:
                return value
            return remaining_after_hit
        return mmdk_on_hit_adv

    # Fall back to MMDK-derived values.
    if mmdk_hitstun_first is not None and mmdk_hitstun_first > 0:
        if mmdk_hitstun_inclusive and remaining_after_hit is not None and first is not None and first > 0:
            # Projectile-style KD+N values behave like on-hit advantage values.
            mmdk_on_hit = first + mmdk_hitstun_first
            value = remaining_after_hit + mmdk_on_hit
            if value > 0:
                return value
        return mmdk_hitstun_first

    if remaining_after_hit is not None:
        return remaining_after_hit
    return total


def normalize_token(token: str) -> str:
    value = str(token or "").strip()
    if not value:
        return ""
    value = (
        value.replace("\u00a0", " ")
        .replace("，", ",")
        .replace("、", ",")
        .replace("＋", "+")
    )
    value = re.sub(r"\s+", "", value)
    value = value.replace(",", "").replace("+", "")
    value = re.sub(r"(?i)throw", "投げ", value)
    return value.upper()


def expand_or_tokens(token: str) -> list[str]:
    source = str(token or "").strip()
    if not source:
        return []
    # e.g. "5or6LM" -> ["5LM", "6LM"]
    parts = [p for p in re.split(r"(?i)or", source) if p]
    if len(parts) <= 1:
        return [source]
    return parts


def expand_pipe_tokens(token: str) -> list[str]:
    source = str(token or "").strip()
    if not source:
        return []
    parts = [part.strip() for part in source.split("|") if part.strip()]
    if len(parts) <= 1:
        return [source]
    return parts


def collect_row_tokens_with_variant(row: dict[str, str], target_control: str) -> list[tuple[str, str]]:
    control = str(target_control or "").strip().lower()
    if control not in {"classic", "modern"}:
        return []

    sources: list[tuple[str, str]] = []
    has_frame_columns = (
        "manual_classic" in row
        or "manual_modern_full" in row
        or "manual_modern_short" in row
        or "tokens_classic" in row
        or "tokens_modern" in row
    )
    if has_frame_columns:
        row_control = str(row.get("control_type") or "").strip().lower()
        if control == "classic":
            sources.append((row.get("manual_classic") or "", "classic"))
        else:
            sources.extend([
                (row.get("manual_modern_full") or "", "modern_full"),
                (row.get("manual_modern_short") or "", "modern_short"),
            ])
        if row_control not in {"classic", "modern"}:
            return []
    elif control == "classic":
        sources.append((row.get("manual_tokens") or "", "classic"))
    else:
        sources.extend([
            (row.get("modern_full") or "", "modern_full"),
            (row.get("modern_short") or "", "modern_short"),
        ])

    out: list[tuple[str, str]] = []
    seen: dict[str, str] = {}
    for source, variant in sources:
        for alt in parse_alternatives(source):
            for expanded in expand_or_tokens(alt):
                for piped in expand_pipe_tokens(expanded):
                    key = normalize_token(piped)
                    if not key:
                        continue
                    if key in seen:
                        continue
                    seen[key] = variant
                    out.append((key, variant))

    return out


def collect_row_tokens(row: dict[str, str], target_control: str) -> list[str]:
    return [token for token, _ in collect_row_tokens_with_variant(row, target_control)]


def row_controls_to_emit(row: dict[str, str]) -> list[str]:
    out: list[str] = []
    row_control = str(row.get("control_type") or "").strip().lower()
    if row_control in {"classic", "modern"}:
        out.append(row_control)

    if (
        str(row.get("manual_classic") or "").strip()
        or str(row.get("manual_tokens") or "").strip()
    ):
        out.append("classic")

    if (
        str(row.get("manual_modern_full") or "").strip()
        or str(row.get("manual_modern_short") or "").strip()
        or str(row.get("modern_full") or "").strip()
        or str(row.get("modern_short") or "").strip()
    ):
        out.append("modern")

    return dedupe_keep_order(out)


def parse_action_id_from_row(row: dict[str, str]) -> int | None:
    value = parse_number(row.get("mmdk_action_id") or row.get("action_id") or "")
    if isinstance(value, (int, float)):
        return int(value)
    return None


def parse_all_action_ids_from_row(row: dict[str, str]) -> list[int]:
    """Parse all action IDs from a possibly comma-separated mmdk_action_id field."""
    raw = str(row.get("mmdk_action_id") or row.get("action_id") or "").strip()
    if not raw:
        return []
    ids: list[int] = []
    for part in re.split(r"[,\s]+", raw):
        v = parse_number(part)
        if isinstance(v, (int, float)) and int(v) > 0:
            ids.append(int(v))
    return ids


def merged_row_prefer_non_empty(primary: dict[str, str] | None, fallback: dict[str, str] | None) -> dict[str, str]:
    out: dict[str, str] = dict(fallback or {})
    for row in (primary or {},):
        for key, value in row.items():
            if value is None:
                continue
            text = str(value)
            if text.strip() == "":
                continue
            out[key] = text
    return out


def resolve_row_move_name(row: dict[str, str], frame_ref_row: dict[str, str] | None = None) -> str:
    for key in ("frame_link_move_name_jp", "move_name_jp"):
        value = str(row.get(key) or "").strip()
        if value:
            return value

    if frame_ref_row is not None:
        frame_name = str(frame_ref_row.get("move_name_jp") or "").strip()
        if frame_name:
            return frame_name

    candidate_moves = str(row.get("candidate_moves") or "").strip()
    if candidate_moves:
        first = str(candidate_moves.split("|")[0]).strip()
        if first:
            return first

    action_name = str(row.get("action_name") or row.get("mmdk_action_name") or "").strip()
    if action_name:
        return action_name

    return ""


def build_frame_reference_index(
    frame_rows: list[dict[str, str]],
) -> tuple[dict[tuple[str, str, int], dict[str, str]], dict[tuple[str, int], list[dict[str, str]]]]:
    by_control: dict[tuple[str, str, int], dict[str, str]] = {}
    by_any_control: dict[tuple[str, int], list[dict[str, str]]] = defaultdict(list)
    for row in frame_rows:
        character = canonical_character_slug(row.get("character_slug") or "")
        control = str(row.get("control_type") or "").strip().lower()
        if not character or control not in {"classic", "modern"}:
            continue
        all_ids = parse_all_action_ids_from_row(row)
        if not all_ids:
            continue
        for action_id in all_ids:
            key = (character, control, action_id)
            if key not in by_control:
                by_control[key] = row
            if row not in by_any_control[(character, action_id)]:
                by_any_control[(character, action_id)].append(row)
    return by_control, by_any_control


def find_frame_reference_row(
    by_control: dict[tuple[str, str, int], dict[str, str]],
    by_any_control: dict[tuple[str, int], list[dict[str, str]]],
    *,
    character: str,
    control: str,
    action_id: int | None,
) -> dict[str, str] | None:
    if action_id is None:
        return None
    direct = by_control.get((character, control, action_id))
    if direct is not None:
        return direct
    candidates = by_any_control.get((character, action_id), [])
    if not candidates:
        return None
    for preferred in ("classic", "modern"):
        for row in candidates:
            if str(row.get("control_type") or "").strip().lower() == preferred:
                return row
    return candidates[0]


def main() -> None:
    if not IN_CSV.exists():
        raise SystemExit(f"Missing CSV: {IN_CSV}")

    rows = load_csv_rows_with_header(IN_CSV, {"character_slug", "action_id"})
    low_manual_action_ids_by_character = build_low_manual_input_action_ids(rows)
    frame_rows: list[dict[str, str]] = []
    if FRAME_COMMAND_MAPPING_CSV.exists():
        frame_rows = load_csv_rows_with_header(
            FRAME_COMMAND_MAPPING_CSV,
            {"character_slug", "control_type", "move_name_jp"},
        )
    frame_ref_by_control, frame_ref_by_any_control = build_frame_reference_index(frame_rows)
    mmdk_calc_resolver = MmdkCalcResolver(PLAYERDATA_DIR)
    manual_movement_overrides = load_manual_movement_overrides()
    character_width_profile = load_character_width_profile()

    # Build (character_slug, action_id) -> combo_sp_gain for SA moves where gain != 100.
    # combo_sp_gain is a % multiplier applied to SA gauge accumulated from prior hits when the SA fires.
    combo_sp_gain_lookup: dict[tuple[str, int], int] = {}
    if MOVESET_DB.exists():
        _con = sqlite3.connect(str(MOVESET_DB))
        _cur = _con.cursor()
        _cur.execute("SELECT character_slug, action_id, raw_json FROM mmdk_triggers WHERE raw_json IS NOT NULL")
        for _slug, _aid, _rj in _cur.fetchall():
            try:
                _data = json.loads(_rj)
            except Exception:
                continue
            _csg = _data.get("combo_sp_gain")
            if _csg is not None and int(_csg) != 100:
                _cslug = canonical_character_slug(_slug or "")
                if _cslug and _aid is not None:
                    combo_sp_gain_lookup[(_cslug, int(_aid))] = int(_csg)
        _con.close()

    # Manual overrides for SAs whose combo_sp_gain is 100 in the DB but suppress SA gain in-game.
    # Juri SA2, Blanka SA2, and Guile SA2 are custom-combo enablers: no SA gain during active frames.
    _COMBO_SP_GAIN_MANUAL: dict[tuple[str, int], int] = {
        ('juri', 1214): 0,
        ('juri', 1216): 0,
        ('blanka', 1210): 0,
        ('blanka', 1211): 0,
        ('guile', 1210): 0,
        ('guile', 1211): 0,
    }
    combo_sp_gain_lookup.update(_COMBO_SP_GAIN_MANUAL)

    # character -> control -> token -> [entries]
    bucket: dict[str, dict[str, dict[str, list[dict[str, object]]]]] = defaultdict(
        lambda: defaultdict(lambda: defaultdict(list))
    )

    dedupe: set[tuple[str, str, str, str]] = set()
    for row in rows:
        character = canonical_character_slug(row.get("character_slug") or "")
        if not character:
            continue

        controls_to_emit = row_controls_to_emit(row)
        if not controls_to_emit:
            continue

        action_id_from_row = parse_action_id_from_row(row)
        action_name_from_row = str(row.get("action_name") or row.get("mmdk_action_name") or "").strip()

        for control in controls_to_emit:
            token_items = collect_row_tokens_with_variant(row, control)
            if not token_items:
                continue

            action_id: int | None = action_id_from_row
            action_name = action_name_from_row
            mmdk_calc: dict[str, object] = {}
            frame_ref_row = find_frame_reference_row(
                frame_ref_by_control,
                frame_ref_by_any_control,
                character=character,
                control=control,
                action_id=action_id,
            )
            move_name = resolve_row_move_name(row, frame_ref_row)
            if not move_name:
                continue

            # MMDK mapping CSV is primary; frame table is fallback-only.
            row_for_frames = merged_row_prefer_non_empty(row, frame_ref_row)
            row_for_meta = merged_row_prefer_non_empty(row, frame_ref_row)

            if action_id is not None:
                resolved_calc = mmdk_calc_resolver.resolve(character, action_id, action_name)
                if isinstance(resolved_calc, dict):
                    mmdk_calc = resolved_calc
                distance_calc = mmdk_calc_resolver.resolve_distance_fallback(character, action_name, action_id)
                if isinstance(distance_calc, dict) and distance_calc:
                    source_strength = movement_strength(mmdk_calc)
                    fallback_strength = movement_strength(distance_calc)
                    if fallback_strength > source_strength:
                        mmdk_calc = dict(mmdk_calc)
                        mmdk_calc["mmdk_distance_source_key"] = str(distance_calc.get("mmdk_source_key") or "")
                        mmdk_calc["mmdk_distance_target_move_x_first"] = distance_calc.get("mmdk_target_move_x_first")
                        mmdk_calc["mmdk_distance_target_move_x_sum"] = distance_calc.get("mmdk_target_move_x_sum")
                        mmdk_calc["mmdk_distance_self_move_x_start"] = distance_calc.get("mmdk_self_move_x_start")
                        mmdk_calc["mmdk_distance_self_move_x_end"] = distance_calc.get("mmdk_self_move_x_end")
                        mmdk_calc["mmdk_distance_self_move_x_total"] = distance_calc.get("mmdk_self_move_x_total")
                        mmdk_calc["mmdk_distance_self_move_x_first_hit"] = distance_calc.get("mmdk_self_move_x_first_hit")

            entry = {
                "move_name_jp": move_name,
                "is_jump": ("ジャンプ" in move_name),
                "is_parry_move": ("パリィ" in move_name),
                "damage": parse_number(row_for_frames.get("damage") or row.get("candidate_damage") or ""),
                "combo_scale": str(row_for_frames.get("combo_scale") or "").strip(),
                "applies_poison_on_hit": row_applies_poison_on_hit(row_for_meta),
                "triggers_poison_bloom_on_hit": row_triggers_poison_bloom_on_hit(row_for_meta),
                "poison_bloom_damage": row_poison_bloom_damage(row_for_meta),
                "poison_bloom_on_hit": row_poison_bloom_on_hit(row_for_meta),
                "startup": str(row_for_frames.get("startup") or row.get("candidate_startup") or "").strip(),
                "active": str(row_for_frames.get("active") or "").strip(),
                "recovery": str(row_for_frames.get("recovery") or "").strip(),
                "on_hit": str(row_for_frames.get("on_hit") or "").strip(),
                "on_block": str(row_for_frames.get("on_block") or "").strip(),
                "cancel": str(row_for_frames.get("cancel") or "").strip(),
                "attribute": str(row_for_frames.get("attribute") or "").strip(),
                "note": str(row_for_meta.get("note") or "").strip(),
                "followup_parent_move_name_jp": str(row_for_frames.get("followup_parent_move_name_jp") or "").strip(),
                "followup_child_variant": str(row_for_frames.get("followup_child_variant") or "").strip(),
                "followup_window": str(row_for_frames.get("followup_window") or "").strip(),
                "required_special_keys": row_required_special_keys(character, row_for_meta),
                "consume_special_keys": row_consume_special_keys(row_for_meta),
                "gain_special_keys": row_gain_special_keys(row_for_meta),
                "first_active_frame": row_first_active_frame(row_for_frames),
                "total_frames": row_total_frames(row_for_frames),
                "opponent_recovery_frame": row_opponent_recovery_frame_from_move_start(row_for_frames),
                "drive_gain": parse_number(row_for_frames.get("drive_gain") or ""),
                "drive_loss_guard": parse_number(row_for_frames.get("drive_loss_guard") or ""),
                "drive_loss_punish": parse_number(row_for_frames.get("drive_loss_punish") or ""),
                "sa_gain": parse_number(row_for_frames.get("sa_gain") or ""),
                "combo_sp_gain": combo_sp_gain_lookup.get((character, action_id)) if action_id is not None else None,
                "mmdk_action_id": action_id,
                "mmdk_action_name": action_name,
                "telemetry_parent_action_ids": row_telemetry_action_ids(row_for_meta, "telemetry_parent_action_ids", character=character, allowed_low_manual_action_ids=low_manual_action_ids_by_character),
                "telemetry_parent_links": row_telemetry_link_counts(row_for_meta, "telemetry_parent_links"),
                "telemetry_child_action_ids": row_telemetry_action_ids(row_for_meta, "telemetry_child_action_ids", character=character, allowed_low_manual_action_ids=low_manual_action_ids_by_character),
                "telemetry_child_links": row_telemetry_link_counts(row_for_meta, "telemetry_child_links"),
                "telemetry_observed_starts": row_telemetry_observed_starts(row_for_meta),
            }

            # Preserve runtime telemetry fields (rt_*) when present in source CSV rows.
            for rt_key, rt_value in row_for_meta.items():
                if not str(rt_key).startswith("rt_"):
                    continue
                raw_rt = str(rt_value or "").strip()
                if not raw_rt:
                    continue
                parsed_rt = parse_number(raw_rt)
                entry[rt_key] = parsed_rt if parsed_rt is not None else raw_rt

            if mmdk_calc:
                entry.update(mmdk_calc)
                source_key = str(entry.get("mmdk_source_key") or "").strip()
                on_hit_override = MMDK_ON_HIT_ADV_OVERRIDES.get((character, source_key))
                if on_hit_override is not None:
                    entry["mmdk_on_hit_adv"] = on_hit_override
                entry["opponent_recovery_frame"] = row_opponent_recovery_frame_from_move_start(
                    row_for_frames,
                    first_active_frame=entry.get("first_active_frame"),
                    mmdk_hitstun_first=entry.get("mmdk_hitstun_first"),
                    mmdk_on_hit_adv=entry.get("mmdk_on_hit_adv"),
                    mmdk_hitstun_inclusive=bool(entry.get("mmdk_hitstun_inclusive")),
                )

            manual_override = find_manual_movement_override(
                manual_movement_overrides,
                character=character,
                control=control,
                move_name=move_name,
                action_id=action_id,
                action_name=action_name,
                mmdk_source_key=str(entry.get("mmdk_source_key") or action_name or ""),
            )
            if manual_override:
                apply_manual_movement_override(entry, manual_override)
            for token, token_variant in token_items:
                sig = (character, control, token, f"{action_id or ''}:{move_name}")
                if sig in dedupe:
                    continue
                dedupe.add(sig)
                entry_for_token = dict(entry)
                entry_for_token["input_token_variant"] = token_variant
                bucket[character][control][token].append(entry_for_token)

    characters: dict[str, dict[str, dict[str, list[dict[str, object]]]]] = {}
    for character in sorted(bucket.keys()):
        controls: dict[str, dict[str, list[dict[str, object]]]] = {}
        for control in sorted(bucket[character].keys()):
            token_map: dict[str, list[dict[str, object]]] = {}
            for token in sorted(bucket[character][control].keys()):
                entries = sorted(
                    bucket[character][control][token],
                    key=lambda item: (
                        1 if bool(item.get("is_jump")) else 0,
                        str(item.get("move_name_jp") or ""),
                    ),
                )
                token_map[token] = entries
            controls[control] = token_map
        characters[character] = controls

    payload_width_profile = {
        slug: character_width_profile[slug]
        for slug in sorted(characters.keys())
        if slug in character_width_profile
    }

    payload = {
        "version": 3,
        "source_csv": str(IN_CSV.relative_to(ROOT)).replace("\\", "/"),
        "source_frame_reference_csv": (
            str(FRAME_COMMAND_MAPPING_CSV.relative_to(ROOT)).replace("\\", "/")
            if FRAME_COMMAND_MAPPING_CSV.exists()
            else ""
        ),
        "source_mmdk": str(PLAYERDATA_DIR.relative_to(ROOT)).replace("\\", "/"),
        "source_character_width_profile": (
            str(WIDTH_PROFILE_CSV.relative_to(ROOT)).replace("\\", "/")
            if WIDTH_PROFILE_CSV.exists()
            else ""
        ),
        "character_width_profile_vs": payload_width_profile,
        "characters": characters,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON} ({len(characters)} characters)")


if __name__ == "__main__":
    main()

