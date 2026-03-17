import requests
import time
import json
from config import CURRENT_SEASON

ESPN_GET_ALL_PLAYERS_URL = (
    "https://sports.core.api.espn.com/v3/sports/basketball/nba/athletes?limit=20000"
)
ESPN_GET_PLAYER_FROM_ID_URL = (
    f"https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/{CURRENT_SEASON}/athletes/"
)


def fetch_json(url):
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    resp.raise_for_status()
    time.sleep(0.05)  # avoid hammering ESPN
    return resp.json()


def extract_player_image(profile_json):
    if "headshot" in profile_json and profile_json["headshot"]:
        return profile_json["headshot"].get("href")

    if "image" in profile_json and isinstance(profile_json["image"], dict):
        return profile_json["image"].get("href")

    if "images" in profile_json and isinstance(profile_json["images"], list):
        for img in profile_json["images"]:
            if "href" in img:
                return img["href"]

    return None


def main():
    players = fetch_json(ESPN_GET_ALL_PLAYERS_URL).get("items", [])
    print(f"Found {len(players)} players")

    result = {}

    for p in players:
        profile = fetch_json(ESPN_GET_PLAYER_FROM_ID_URL + p["id"])
        image_url = extract_player_image(profile) or ""

        name = profile.get("displayName", "")
        if name:
            result[name] = image_url

        print(f"{name:<30} | Image: {image_url}")

    with open("../capology/src/data/player_images.json", "w") as f:
        json.dump(result, f, indent=2)

    print("\nSaved ../capology/src/data/player_images.json")


if __name__ == "__main__":
    main()
