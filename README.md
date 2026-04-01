# Capology

An interactive NBA salary cap dashboard. Browse all 30 teams, visualize player contracts as a proportional cap bar, and see how each roster stacks up against the salary cap, luxury tax, and apron thresholds.

## Features

- **Team selector** — all 30 teams with real primary/secondary colors
- **Cap bar** — horizontal bar where each segment represents a player's salary, overlaid with threshold lines (Salary Cap, Luxury Tax, First Apron, Second Apron)
- **Player table** — ranked by salary with headshots, % of cap, and team share
- **Hover sync** — hovering a bar segment or table row highlights the same player across both

## Tech Stack

- [Next.js 15](https://nextjs.org/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Deployed on [Vercel](https://vercel.com/)

## Data

Salary data is sourced from [Spotrac](https://www.spotrac.com/) and player headshots from the ESPN API. Both are stored as static JSON and automatically refreshed via GitHub Actions:

- **Salaries** — every Tuesday at 8am UTC
- **Player images** — 1st of every month at 8am UTC

To update data manually, run the scrapers from the `webScraper/` directory:

```bash
cd webScraper
pip install -r requirements.txt
python update_salaries.py       # updates capology/src/data/nba_salaries.json
python update_player_images.py  # updates capology/src/data/player_images.json
```

## Development

```bash
cd capology
npm install
npm run dev    # start dev server at localhost:3000
npm run build  # production build
npm run lint   # ESLint
```
