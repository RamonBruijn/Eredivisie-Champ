#!/usr/bin/env python3

import json
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from typing import Any

NS = {"a": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
ALLOWED_POSITIONS = {"gk", "rb", "cb", "lb", "cm", "lm", "rm", "lw", "rw", "st"}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii").lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text).strip("-")
    return re.sub(r"-{2,}", "-", ascii_text)


def read_shared_strings(archive: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values = []
    for item in root:
        values.append(
            "".join(text.text or "" for text in item.iter("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"))
        )
    return values


def get_sheets(archive: zipfile.ZipFile) -> dict[str, str]:
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {rel.attrib["Id"]: rel.attrib["Target"].lstrip("/") for rel in rels}
    return {
        sheet.attrib["name"]: rel_map[sheet.attrib[REL_NS]]
        for sheet in workbook.find("a:sheets", NS)
    }


def cell_value(cell: ET.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")
    value = cell.find("a:v", NS)
    if value is None:
        return ""
    text = value.text or ""
    if cell_type == "s":
        return shared_strings[int(text)]
    return text


def read_sheet(archive: zipfile.ZipFile, path: str, shared_strings: list[str]) -> list[dict[str, str]]:
    root = ET.fromstring(archive.read(path))
    rows = root.find("a:sheetData", NS).findall("a:row", NS)
    headers = [cell_value(cell, shared_strings) for cell in rows[0].findall("a:c", NS)]
    data: list[dict[str, str]] = []

    for row in rows[1:]:
        values = [cell_value(cell, shared_strings) for cell in row.findall("a:c", NS)]
        if len(values) < len(headers):
            values.extend([""] * (len(headers) - len(values)))
        data.append(dict(zip(headers, values)))

    return data


def infer_tags(description: str, club: str) -> list[str]:
    text = description.lower()
    tags: list[str] = []
    keyword_map = [
        ("champions-league", ["champions league", "champions-league"]),
        ("european-cup", ["europa cup", "europacup", "europa cup i"]),
        ("unbeaten", ["ongeslagen"]),
        ("title", ["kampioen", "titel"]),
        ("treble", ["treble"]),
        ("legendary", ["legendar", "absolute piek", "dominantie"]),
        ("modern", ["moderne", "modern"]),
        ("attacking", ["goals", "aanvall", "aanval"]),
    ]

    for tag, needles in keyword_map:
        if any(needle in text for needle in needles):
            tags.append(tag)

    club_tag = slugify(club)
    if club_tag and club_tag not in tags:
        tags.append(club_tag)

    if "historic" not in tags:
        tags.append("historic")

    return tags[:4]


def get_first(row: dict[str, str], *keys: str, default: str = "") -> str:
    for key in keys:
        value = row.get(key)
        if value is not None and value != "":
            return value
    return default


def parse_team_row(row: dict[str, str]) -> dict[str, Any]:
    team_id = get_first(row, "team_id")
    club = get_first(row, "club")
    season = get_first(row, "season")
    description = get_first(row, "why_selected", "notes", default=f"{club} {season}").strip()
    rating_raw = get_first(row, "team_rating", "avg_rating", "max_rating", default="0")
    team_rating = int(round(float(rating_raw)))

    return {
        "id": team_id if team_id else f"{slugify(club)}-{season.replace('/', '-')}",
        "club": club,
        "season": season,
        "teamRating": team_rating,
        "description": description,
        "tags": infer_tags(description, club),
    }


def parse_player_row(
    row: dict[str, str],
    team_id_map: dict[str, str],
    duplicate_counters: dict[str, int],
) -> dict[str, Any]:
    name = get_first(row, "player_name", "player")
    positions = [position.strip() for position in get_first(row, "positions").split(",") if position.strip()]
    invalid = [position for position in positions if position not in ALLOWED_POSITIONS]
    if invalid:
        raise ValueError(f"Invalid positions for {name}: {invalid}")

    source_team_id = get_first(row, "team_id")
    team_id = team_id_map[source_team_id]
    provided_id = get_first(row, "player_id")
    player_slug = provided_id or f"{slugify(name)}-{team_id}"
    duplicate_counters[player_slug] += 1
    final_id = player_slug if duplicate_counters[player_slug] == 1 else f"{player_slug}-{duplicate_counters[player_slug]}"

    rating = int(float(get_first(row, "rating", "player_rating", default="0")))
    return {
        "id": final_id,
        "name": name,
        "teamId": team_id,
        "club": get_first(row, "club"),
        "season": get_first(row, "season"),
        "positions": positions,
        "rating": rating,
        "legendary": rating >= 90 or name == "Johan Cruijff",
    }


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: import_xlsx_data.py /path/to/file.xlsx")
        return 1

    source = Path(sys.argv[1]).expanduser()
    if not source.exists():
        print(f"File not found: {source}")
        return 1

    repo_root = Path(__file__).resolve().parent.parent
    teams_path = repo_root / "src" / "data" / "teams.json"
    players_path = repo_root / "src" / "data" / "players.json"

    with zipfile.ZipFile(source) as archive:
        shared_strings = read_shared_strings(archive)
        sheets = get_sheets(archive)
        teams_rows = read_sheet(archive, sheets["Teams"], shared_strings)
        players_rows = read_sheet(archive, sheets["Players"], shared_strings)

    team_id_map: dict[str, str] = {}
    teams_output = []

    for row in teams_rows:
        parsed_team = parse_team_row(row)
        team_id_map[str(get_first(row, "team_id"))] = str(parsed_team["id"])
        teams_output.append(parsed_team)

    duplicate_counters: dict[str, int] = defaultdict(int)
    players_output = []

    for row in players_rows:
        players_output.append(parse_player_row(row, team_id_map, duplicate_counters))

    teams_path.write_text(json.dumps(teams_output, ensure_ascii=False, indent=2) + "\n")
    players_path.write_text(json.dumps(players_output, ensure_ascii=False, indent=2) + "\n")

    print(f"Imported {len(teams_output)} teams and {len(players_output)} players.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
