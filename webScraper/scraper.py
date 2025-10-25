import json
import requests
from bs4 import BeautifulSoup

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
    team_urls = {
        "Lakers": "https://www.spotrac.com/nba/los-angeles-lakers/cap/_/year/2025",
        "Nets": "https://www.spotrac.com/nba/brooklyn-nets/cap/_/year/2025",
        "Jazz": "https://www.spotrac.com/nba/utah-jazz/cap/_/year/2025",
        "Bucks": "https://www.spotrac.com/nba/milwaukee-bucks/cap/_/year/2025",
        "Pistons": "https://www.spotrac.com/nba/detroit-pistons/cap/_/year/2025",
        "Bulls": "https://www.spotrac.com/nba/chicago-bulls/cap/_/year/2025",
        "Grizzlies": "https://www.spotrac.com/nba/memphis-grizzlies/cap/_/year/2025",
        "Pacers": "https://www.spotrac.com/nba/indiana-pacers/cap/_/year/2025",
        "Hornets": "https://www.spotrac.com/nba/charlotte-hornets/cap/_/year/2025",
        "Thunder": "https://www.spotrac.com/nba/oklahoma-city-thunder/cap/_/year/2025",
        "Hawks": "https://www.spotrac.com/nba/atlanta-hawks/cap/_/year/2025",
        "Magic": "https://www.spotrac.com/nba/orlando-magic/cap/_/year/2025",
        "Rockets": "https://www.spotrac.com/nba/houston-rockets/cap/_/year/2025",
        "Trailblazers": "https://www.spotrac.com/nba/portland-trail-blazers/cap/_/year/2025",
        "Heat": "https://www.spotrac.com/nba/miami-heat/cap/_/year/2025",
        "Spurs": "https://www.spotrac.com/nba/san-antonio-spurs/cap/_/year/2025",
        "Pelicans": "https://www.spotrac.com/nba/new-orleans-pelicans/cap/_/year/2025",
        "Sixers": "https://www.spotrac.com/nba/philadelphia-76ers/cap/_/year/2025",
        "Nuggets": "https://www.spotrac.com/nba/denver-nuggets/cap/_/year/2025",
        "Clippers": "https://www.spotrac.com/nba/la-clippers/cap/_/year/2025",
        "Kings": "https://www.spotrac.com/nba/sacramento-kings/cap/_/year/2025",
        "Suns": "https://www.spotrac.com/nba/phoenix-suns/cap/_/year/2025",
        "Raptors": "https://www.spotrac.com/nba/toronto-raptors/cap/_/year/2025",
        "Mavs": "https://www.spotrac.com/nba/dallas-mavericks/cap/_/year/2025",
        "Knicks": "https://www.spotrac.com/nba/new-york-knicks/cap/_/year/2025",
        "Celtics": "https://www.spotrac.com/nba/boston-celtics/cap/_/year/2025",
        "Wizards": "https://www.spotrac.com/nba/washington-wizards/cap/_/year/2025",
        "Timberwolves": "https://www.spotrac.com/nba/minnesota-timberwolves/cap/_/year/2025",
        "Cavaliers": "https://www.spotrac.com/nba/cleveland-cavaliers/cap/_/year/2025",
        "Warriors": "https://www.spotrac.com/nba/golden-state-warriors/cap/_/year/2025"
    }

    result = {}
    for team, url in team_urls.items():
        result[team] = parse_from_url(url)
        print(f"Finished parsing {team}")

    with open("nba_salaries.json", "w") as f:
        json.dump(result, f, indent=2)
