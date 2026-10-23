from datetime import date, datetime, timezone
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.request import Request, urlopen


USERNAME = "josntndr"
SOURCE_URL = f"https://github.com/users/{USERNAME}/contributions"
ROOT = Path(__file__).resolve().parents[2]
OUTPUT_PATH = ROOT / "assets" / "contributions.svg"
README_PATH = ROOT / "README.md"


class ContributionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.days = {}
        self.id_to_date = {}
        self.tooltip_target = None
        self.tooltip_text = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = attributes.get("class", "").split()

        if tag == "td" and "ContributionCalendar-day" in classes:
            contribution_date = attributes.get("data-date")
            level = attributes.get("data-level")
            cell_id = attributes.get("id")
            if contribution_date and level is not None:
                self.days[contribution_date] = {
                    "date": contribution_date,
                    "level": max(0, min(4, int(level))),
                    "count": 0,
                }
                if cell_id:
                    self.id_to_date[cell_id] = contribution_date

        if tag == "tool-tip":
            target = attributes.get("for")
            if target in self.id_to_date:
                self.tooltip_target = target
                self.tooltip_text = []

    def handle_data(self, data):
        if self.tooltip_target:
            self.tooltip_text.append(data)

    def handle_endtag(self, tag):
        if tag != "tool-tip" or not self.tooltip_target:
            return

        text = "".join(self.tooltip_text).strip()
        match = re.search(r"([0-9,]+) contributions? on", text)
        contribution_date = self.id_to_date[self.tooltip_target]
        self.days[contribution_date]["count"] = int(match.group(1).replace(",", "")) if match else 0
        self.tooltip_target = None
        self.tooltip_text = []


def fetch_contributions():
    request = Request(
        SOURCE_URL,
        headers={
            "Accept": "text/html",
            "User-Agent": f"{USERNAME}-profile-contribution-updater",
        },
    )
    with urlopen(request, timeout=30) as response:
        document = response.read().decode("utf-8")

    parser = ContributionParser()
    parser.feed(document)
    days = sorted(parser.days.values(), key=lambda day: day["date"])

    if len(days) < 350:
        raise RuntimeError(f"Expected a rolling-year calendar, received only {len(days)} days")

    return days


def render_svg(days):
    parsed_dates = [date.fromisoformat(day["date"]) for day in days]
    first_date = min(parsed_dates)
    last_date = max(parsed_dates)
    first_sunday = first_date.fromordinal(first_date.toordinal() - ((first_date.weekday() + 1) % 7))
    week_count = ((last_date - first_sunday).days // 7) + 1
    total = sum(day["count"] for day in days)
    active_days = [day for day in days if day["count"] > 0]
    latest_active = date.fromisoformat(active_days[-1]["date"]) if active_days else last_date

    width = 1200
    height = 300
    grid_x = 112
    grid_y = 110
    cell_size = 14
    cell_gap = 4
    pitch = cell_size + cell_gap
    colors = {
        0: "#171B2B",
        1: "#26446F",
        2: "#3B82F6",
        3: "#8B5CF6",
        4: "#F472B6",
    }

    lines = [
        f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc" text-rendering="geometricPrecision">',
        f'  <title id="title">{total:,} GitHub contributions in the last year</title>',
        f'  <desc id="desc">Official rolling-year contribution calendar for {USERNAME}, sourced directly from GitHub.</desc>',
        "  <defs>",
        '    <linearGradient id="panel" x1="12" y1="12" x2="1188" y2="288" gradientUnits="userSpaceOnUse">',
        '      <stop stop-color="#081221"/>',
        '      <stop offset="0.55" stop-color="#10152A"/>',
        '      <stop offset="1" stop-color="#211333"/>',
        "    </linearGradient>",
        '    <linearGradient id="accent" x1="52" y1="0" x2="1148" y2="0" gradientUnits="userSpaceOnUse">',
        '      <stop stop-color="#5EEAD4"/>',
        '      <stop offset="0.52" stop-color="#A78BFA"/>',
        '      <stop offset="1" stop-color="#FB7185"/>',
        "    </linearGradient>",
        "    <style>",
        "      text { font-family: Inter, Segoe UI, Arial, sans-serif; }",
        "      .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; }",
        "    </style>",
        "  </defs>",
        '  <rect x="1" y="1" width="1198" height="298" rx="22" fill="url(#panel)" stroke="#334155" stroke-width="2"/>',
        '  <path d="M52 282H1148" stroke="url(#accent)" stroke-width="3" stroke-linecap="round"/>',
        '  <circle cx="58" cy="39" r="4" fill="#5EEAD4"/>',
        '  <text x="74" y="44" fill="#99F6E4" font-size="12" font-weight="700" letter-spacing="2" class="mono">OFFICIAL GITHUB ACTIVITY</text>',
        f'  <text x="52" y="77" fill="#F8FAFC" font-size="25" font-weight="750">{total:,} contributions</text>',
        f'  <text x="1148" y="42" fill="#94A3B8" font-size="11" text-anchor="end" letter-spacing="1.2" class="mono">AUTO-SYNC · EVERY 30 MINUTES</text>',
        f'  <text x="1148" y="68" fill="#CBD5E1" font-size="12" text-anchor="end">Latest contribution · {latest_active.strftime("%d %b %Y")}</text>',
    ]

    seen_months = set()
    for contribution_date in parsed_dates:
        month_key = (contribution_date.year, contribution_date.month)
        if month_key in seen_months:
            continue
        seen_months.add(month_key)
        if contribution_date.day > 7:
            continue
        week = (contribution_date - first_sunday).days // 7
        month_x = grid_x + week * pitch
        lines.append(
            f'  <text x="{month_x}" y="98" fill="#94A3B8" font-size="11" class="mono">{contribution_date.strftime("%b")}</text>'
        )

    for label, row in (("Mon", 1), ("Wed", 3), ("Fri", 5)):
        label_y = grid_y + row * pitch + 11
        lines.append(
            f'  <text x="78" y="{label_y}" fill="#718096" font-size="11" text-anchor="end" class="mono">{label}</text>'
        )

    for day in days:
        contribution_date = date.fromisoformat(day["date"])
        week = (contribution_date - first_sunday).days // 7
        weekday = (contribution_date.weekday() + 1) % 7
        x = grid_x + week * pitch
        y = grid_y + weekday * pitch
        count = day["count"]
        label = "No contributions" if count == 0 else f"{count} contribution{'s' if count != 1 else ''}"
        lines.extend(
            [
                f'  <rect x="{x}" y="{y}" width="{cell_size}" height="{cell_size}" rx="3" fill="{colors[day["level"]]}" stroke="#FFFFFF" stroke-opacity="0.025">',
                f'    <title>{escape(label)} on {contribution_date.strftime("%d %b %Y")}</title>',
                "  </rect>",
            ]
        )

    legend_x = 936
    lines.append('  <text x="830" y="266" fill="#718096" font-size="11" class="mono">LESS</text>')
    for level in range(5):
        x = legend_x + level * 20
        lines.append(f'  <rect x="{x}" y="254" width="14" height="14" rx="3" fill="{colors[level]}"/>')
    lines.extend(
        [
            '  <text x="1048" y="266" fill="#718096" font-size="11" class="mono">MORE</text>',
            '  <text x="52" y="266" fill="#718096" font-size="11" letter-spacing="1" class="mono">SOURCE: GITHUB · REFRESHES WHEN ACTIVITY CHANGES</text>',
            "</svg>",
            "",
        ]
    )

    return "\n".join(lines), total, latest_active


def update_readme_cache_key(total, latest_active):
    readme = README_PATH.read_text(encoding="utf-8")
    cache_key = f"{total}-{latest_active.isoformat()}"
    updated = re.sub(
        r"(\./assets/contributions\.svg)(?:\?v=[^\"]*)?",
        rf"\1?v={cache_key}",
        readme,
    )
    if updated != readme:
        README_PATH.write_text(updated, encoding="utf-8")


def main():
    days = fetch_contributions()
    svg, total, latest_active = render_svg(days)
    OUTPUT_PATH.write_text(svg, encoding="utf-8", newline="\n")
    update_readme_cache_key(total, latest_active)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"Rendered {total:,} contributions through {latest_active.isoformat()} at {timestamp}")


if __name__ == "__main__":
    main()
