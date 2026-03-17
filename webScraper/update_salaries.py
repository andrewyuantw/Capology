import json
import requests
from bs4 import BeautifulSoup
from config import CURRENT_SEASON

def parse_nba_salaries(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    capHoldTableIndicator = "Qualifying Offer"
    tables = soup.find_all('table')
    player_salaries = {}

    for table in tables:
        # Check header row
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        if not headers or len(headers) < 9:
            continue
        if any(capHoldTableIndicator in h for h in headers):
            continue

        # Parse rows
        for row in table.find_all('tr'):
            cells = row.find_all('td')
            if len(cells) < 9:
                continue

            player_link = cells[0].find('a', class_='link')
            if not player_link:
                continue

            player_name = player_link.text.strip()
            salary_export = cells[4].get('data-sort')

            if salary_export and salary_export.isdigit():
                player_salaries[player_name] = int(salary_export)

    return player_salaries

def parse_from_url(url, headers=None, timeout=30):
    headers = headers or {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/91.0.4472.124 Safari/537.36'
        )
    }
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return parse_nba_salaries(response.text)
    except Exception as e:
        print(f"Error fetching/parsing {url}: {e}")
        return {}

if __name__ == "__main__":
    SPOTRAC_BASE = f"https://www.spotrac.com/nba/{{slug}}/cap/_/year/{CURRENT_SEASON}"

    team_slugs = {
        "Lakers": "los-angeles-lakers",
        "Nets": "brooklyn-nets",
        "Jazz": "utah-jazz",
        "Bucks": "milwaukee-bucks",
        "Pistons": "detroit-pistons",
        "Bulls": "chicago-bulls",
        "Grizzlies": "memphis-grizzlies",
        "Pacers": "indiana-pacers",
        "Hornets": "charlotte-hornets",
        "Thunder": "oklahoma-city-thunder",
        "Hawks": "atlanta-hawks",
        "Magic": "orlando-magic",
        "Rockets": "houston-rockets",
        "Trailblazers": "portland-trail-blazers",
        "Heat": "miami-heat",
        "Spurs": "san-antonio-spurs",
        "Pelicans": "new-orleans-pelicans",
        "Sixers": "philadelphia-76ers",
        "Nuggets": "denver-nuggets",
        "Clippers": "la-clippers",
        "Kings": "sacramento-kings",
        "Suns": "phoenix-suns",
        "Raptors": "toronto-raptors",
        "Mavs": "dallas-mavericks",
        "Knicks": "new-york-knicks",
        "Celtics": "boston-celtics",
        "Wizards": "washington-wizards",
        "Timberwolves": "minnesota-timberwolves",
        "Cavaliers": "cleveland-cavaliers",
        "Warriors": "golden-state-warriors",
    }

    team_urls = {team: SPOTRAC_BASE.format(slug=slug) for team, slug in team_slugs.items()}

    result = {}
    for team, url in team_urls.items():
        result[team] = parse_from_url(url)
        print(f"Finished parsing {team}")

    with open("../capology/src/data/nba_salaries.json", "w") as f:
        json.dump(result, f, indent=2)

    print("Saved ../capology/src/data/nba_salaries.json")
