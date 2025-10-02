import re
import json
import requests
from bs4 import BeautifulSoup

def parse_nba_salaries(html_content):
    """
    Parse NBA player salaries from HTML table content.
    Returns a dictionary with player names as keys and current year salaries as values.
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find all table rows in the tbody
    rows = soup.find_all('tr')
    
    player_salaries = {}
    
    for row in rows:
        # Skip empty rows or header rows
        cells = row.find_all('td')
        if len(cells) < 4:
            continue
            
        # Extract player name from the first cell
        player_cell = cells[0]
        player_link = player_cell.find('a', class_='link')
        if player_link:
            player_name = player_link.text.strip()
        else:
            continue
            
        # Extract salary from the fourth cell (2025-26 column)
        # Look for the data-export attribute which contains the clean salary number
        salary_cell = cells[3]
        salary_export = salary_cell.get('data-export')
        
        if salary_export and salary_export.isdigit():
            salary = int(salary_export)
            player_salaries[player_name] = salary
    
    return player_salaries

def parse_from_file(filename):
    """
    Parse NBA salaries from an HTML file.
    """
    with open(filename, 'r', encoding='utf-8') as file:
        html_content = file.read()
    return parse_nba_salaries(html_content)

def parse_from_string(html_string):
    """
    Parse NBA salaries from an HTML string.
    """
    return parse_nba_salaries(html_string)

def parse_from_url(url, headers=None, timeout=30):
    """
    Parse NBA salaries from a URL.
    
    Args:
        url (str): The URL to fetch the HTML from
        headers (dict): Optional headers to include in the request
        timeout (int): Request timeout in seconds (default: 30)
    
    Returns:
        dict: Dictionary with player names as keys and salaries as values
    """
    if headers is None:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    try:
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Parse the HTML content
        return parse_nba_salaries(response.text)
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return {}
    except Exception as e:
        print(f"Error parsing content: {e}")
        return {}

# Example usage with the provided HTML content
if __name__ == "__main__":

    teamNameToURLMap = {}
    
    teamNameToURLMap["Lakers"] = "https://www.spotrac.com/nba/los-angeles-lakers/yearly"
    teamNameToURLMap["Nets"] = "https://www.spotrac.com/nba/brooklyn-nets/yearly"
    teamNameToURLMap["Jazz"] = "https://www.spotrac.com/nba/utah-jazz/yearly"
    teamNameToURLMap["Bucks"] = "https://www.spotrac.com/nba/milwaukee-bucks/yearly"
    teamNameToURLMap["Pistons"] = "https://www.spotrac.com/nba/detroit-pistons/yearly"
    teamNameToURLMap["Bulls"] = "https://www.spotrac.com/nba/chicago-bulls/yearly"
    teamNameToURLMap["Grizzlies"] = "https://www.spotrac.com/nba/memphis-grizzlies/yearly"
    teamNameToURLMap["Pacers"] = "https://www.spotrac.com/nba/indiana-pacers/yearly"
    teamNameToURLMap["Hornets"] = "https://www.spotrac.com/nba/charlotte-hornets/yearly"
    teamNameToURLMap["Thunder"] = "https://www.spotrac.com/nba/oklahoma-city-thunder/yearly"
    teamNameToURLMap["Hawks"] = "https://www.spotrac.com/nba/atlanta-hawks/yearly"
    teamNameToURLMap["Magic"] = "https://www.spotrac.com/nba/orlando-magic/yearly"
    teamNameToURLMap["Rockets"] = "https://www.spotrac.com/nba/houston-rockets/yearly"
    teamNameToURLMap["Trailblazers"] = "https://www.spotrac.com/nba/portland-trail-blazers/yearly"
    teamNameToURLMap["Heat"] = "https://www.spotrac.com/nba/miami-heat/yearly"
    teamNameToURLMap["Spurs"] = "https://www.spotrac.com/nba/san-antonio-spurs/yearly"
    teamNameToURLMap["Pelicans"] = "https://www.spotrac.com/nba/new-orleans-pelicans/yearly"
    teamNameToURLMap["Sixers"] = "https://www.spotrac.com/nba/philadelphia-76ers/yearly"
    teamNameToURLMap["Nuggets"] = "https://www.spotrac.com/nba/denver-nuggets/yearly"
    teamNameToURLMap["Clippers"] = "https://www.spotrac.com/nba/la-clippers/yearly"
    teamNameToURLMap["Kings"] = "https://www.spotrac.com/nba/sacramento-kings/yearly"
    teamNameToURLMap["Suns"] = "https://www.spotrac.com/nba/phoenix-suns/yearly"
    teamNameToURLMap["Raptors"] = "https://www.spotrac.com/nba/toronto-raptors/yearly"
    teamNameToURLMap["Mavs"] = "https://www.spotrac.com/nba/dallas-mavericks/yearly"
    teamNameToURLMap["Knicks"] = "https://www.spotrac.com/nba/new-york-knicks/yearly"
    teamNameToURLMap["Celtics"] = "https://www.spotrac.com/nba/boston-celtics/yearly"
    teamNameToURLMap["Wizards"] = "https://www.spotrac.com/nba/washington-wizards/yearly"
    teamNameToURLMap["Timberwolves"] = "https://www.spotrac.com/nba/minnesota-timberwolves/yearly"
    teamNameToURLMap["Cavaliers"] = "https://www.spotrac.com/nba/cleveland-cavaliers/yearly"
    teamNameToURLMap["Warriors"] = "https://www.spotrac.com/nba/golden-state-warriors/yearly"
    
    # Parse the HTML and get player salaries
    result = {}
    for key in teamNameToURLMap:
        result[key] = parse_from_url(teamNameToURLMap[key] + "/cash_total/view/roster")
        print("Finished parsing " + key)

    with open("nba_salaries.json", "w") as f:
        json.dump(result, f, indent=2)
    

