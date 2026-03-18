"use client";

import React, { useState } from "react";
import nbaSalaries from "../data/nba_salaries.json";
import playerImages from "../data/player_images.json";

// === Constants ===
const TOTAL_CAP = 240_000_000;

const THRESHOLDS = [
  { label: "Salary Cap", value: 154_647_000, color: "#22c55e" },
  { label: "Luxury Tax", value: 187_895_000, color: "#f59e0b" },
  { label: "First Apron", value: 195_945_000, color: "#f97316" },
  { label: "Second Apron", value: 207_824_000, color: "#ef4444" },
];

const TEAM_META: Record<
  string,
  { abbr: string; primary: string; secondary: string }
> = {
  Lakers: { abbr: "LAL", primary: "#552583", secondary: "#FDB927" },
  Nets: { abbr: "BKN", primary: "#222222", secondary: "#FFFFFF" },
  Jazz: { abbr: "UTA", primary: "#002B5C", secondary: "#F9A01B" },
  Bucks: { abbr: "MIL", primary: "#00471B", secondary: "#EEE1C6" },
  Pistons: { abbr: "DET", primary: "#C8102E", secondary: "#006BB6" },
  Bulls: { abbr: "CHI", primary: "#CE1141", secondary: "#000000" },
  Grizzlies: { abbr: "MEM", primary: "#12173F", secondary: "#5D76A9" },
  Pacers: { abbr: "IND", primary: "#002D62", secondary: "#FDBB30" },
  Hornets: { abbr: "CHA", primary: "#1D1160", secondary: "#00788C" },
  Thunder: { abbr: "OKC", primary: "#007AC1", secondary: "#EF3B24" },
  Hawks: { abbr: "ATL", primary: "#E03A3E", secondary: "#C1D32F" },
  Magic: { abbr: "ORL", primary: "#0077C0", secondary: "#C4CED4" },
  Rockets: { abbr: "HOU", primary: "#CE1141", secondary: "#C4CED4" },
  Trailblazers: { abbr: "POR", primary: "#E03A3E", secondary: "#000000" },
  Heat: { abbr: "MIA", primary: "#98002E", secondary: "#F9A01B" },
  Spurs: { abbr: "SAS", primary: "#8A8D8F", secondary: "#FFFFFF" },
  Pelicans: { abbr: "NOP", primary: "#0C2340", secondary: "#C8102E" },
  Sixers: { abbr: "PHI", primary: "#006BB6", secondary: "#ED174C" },
  Nuggets: { abbr: "DEN", primary: "#0E2240", secondary: "#FEC524" },
  Clippers: { abbr: "LAC", primary: "#C8102E", secondary: "#1D428A" },
  Kings: { abbr: "SAC", primary: "#5A2D81", secondary: "#63727A" },
  Suns: { abbr: "PHX", primary: "#1D1160", secondary: "#E56020" },
  Raptors: { abbr: "TOR", primary: "#CE1141", secondary: "#C4CED4" },
  Mavs: { abbr: "DAL", primary: "#00538C", secondary: "#B8C4CA" },
  Knicks: { abbr: "NYK", primary: "#006BB6", secondary: "#F58426" },
  Celtics: { abbr: "BOS", primary: "#007A33", secondary: "#BA9653" },
  Wizards: { abbr: "WAS", primary: "#002B5C", secondary: "#E31837" },
  Timberwolves: { abbr: "MIN", primary: "#0C2340", secondary: "#236192" },
  Cavaliers: { abbr: "CLE", primary: "#860038", secondary: "#FDBB30" },
  Warriors: { abbr: "GSW", primary: "#1D428A", secondary: "#FFC72C" },
};

const BAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#f97316",
  "#06b6d4",
  "#84cc16",
  "#6366f1",
  "#14b8a6",
  "#ef4444",
  "#a855f7",
  "#0ea5e9",
  "#d946ef",
  "#64748b",
];

const imageMap = playerImages as Record<string, string>;

// Normalize: strip accents (handles East European names like Jokić) and lowercase
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Precomputed once at module load
const normalizedImageMap = Object.fromEntries(
  Object.entries(imageMap).map(([k, v]) => [norm(k), v])
);

function lookupPlayerImage(name: string): string | null {
  // Explicit Spotrac -> ESPN name corrections
  const aliases: Record<string, string> = {
    "Nikola Djurisic": "Nikola Durisic",
    "Nah'Shon Hyland": "Bones Hyland",
  };

  const resolved = aliases[name] ?? name;

  // Exact match
  if (imageMap[resolved]) return imageMap[resolved];

  // Accent-normalized match
  if (normalizedImageMap[norm(resolved)]) return normalizedImageMap[norm(resolved)];

  // Strip trailing Jr. and retry
  const stripped = resolved.replace(/\s+Jr\.?$/i, "").trim();
  if (stripped !== resolved) return lookupPlayerImage(stripped);

  // Fuzzy: match on first initial + last name
  // Handles most cases of minor difference between names between ESPN and Spotrac
  const parts = resolved.trim().split(" ");
  if (parts.length < 2) return null;
  const initial = parts[0][0].toLowerCase();
  const last = parts[parts.length - 1];

  const matches = Object.keys(imageMap).filter((key) => {
    const k = key.trim().split(" ");
    return k[0][0].toLowerCase() === initial && norm(k[k.length - 1]) === norm(last);
  });

  if (matches.length > 1)
    console.warn(`Ambiguous image lookup for "${name}": ${matches.join(", ")}`);

  return matches.length >= 1 ? imageMap[matches[0]] : null;
}

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n > 0) return `$${n.toLocaleString()}`;
  return "—";
}

// === Sub-components ===

function TeamCard({
  name,
  selected,
  onClick,
}: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = TEAM_META[name] ?? {
    abbr: name.slice(0, 3).toUpperCase(),
    primary: "#334155",
    secondary: "#94a3b8",
  };
  return (
    <button
      onClick={onClick}
      className="relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 group"
      style={{
        background: selected ? meta.primary : "#1e293b",
        border: `2px solid ${selected ? meta.secondary : "transparent"}`,
        boxShadow: selected ? `0 0 20px ${meta.primary}99` : "none",
      }}
    >
      <div className="py-2.5 px-1 flex flex-col items-center gap-0.5">
        <div
          className="text-sm font-extrabold tracking-wide transition-colors"
          style={{ color: selected ? meta.secondary : "#94a3b8" }}
        >
          {meta.abbr}
        </div>
        <div className="text-[9px] text-gray-500 group-hover:text-gray-300 transition-colors leading-tight text-center">
          {name}
        </div>
      </div>
      {selected && (
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: meta.secondary }}
        />
      )}
    </button>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-[#1e293b] rounded-xl px-5 py-4 flex flex-col gap-1 min-w-[150px]">
      <div className="text-[10px] text-gray-500 uppercase tracking-widest">
        {label}
      </div>
      <div className="text-lg font-bold" style={{ color: accent ?? "#f1f5f9" }}>
        {value}
      </div>
    </div>
  );
}

// === Main ===
export default function CapDashboard() {
  const teamNames = Object.keys(nbaSalaries).sort((a, b) =>
    (TEAM_META[a]?.abbr ?? a).localeCompare(TEAM_META[b]?.abbr ?? b)
  );
  const [selectedTeam, setSelectedTeam] = useState(teamNames[0]);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  const rawTeamData = nbaSalaries[selectedTeam as keyof typeof nbaSalaries];
  const players = Object.entries(rawTeamData)
    .map(([name, value], idx) => ({
      name,
      value: Number(value),
      color: BAR_COLORS[idx % BAR_COLORS.length],
      image: lookupPlayerImage(name),
    }))
    .sort((a, b) => b.value - a.value);

  const totalSalary = players.reduce((s, p) => s + p.value, 0);
  const capSpace = Math.max(0, TOTAL_CAP - totalSalary);
  const salaryCap = THRESHOLDS[0].value;
  const capOverage = totalSalary - salaryCap;
  const meta = TEAM_META[selectedTeam] ?? {
    abbr: selectedTeam,
    primary: "#334155",
    secondary: "#94a3b8",
  };

  let taxStatus = "Under Cap";
  let taxColor = "#22c55e";
  if (totalSalary > THRESHOLDS[3].value) {
    taxStatus = "Second Apron";
    taxColor = "#ef4444";
  } else if (totalSalary > THRESHOLDS[2].value) {
    taxStatus = "First Apron";
    taxColor = "#f97316";
  } else if (totalSalary > THRESHOLDS[1].value) {
    taxStatus = "Luxury Tax";
    taxColor = "#f59e0b";
  } else if (totalSalary > THRESHOLDS[0].value) {
    taxStatus = "Over Cap";
    taxColor = "#facc15";
  }

  return (
    <div
      className="min-h-screen bg-[#0f172a] text-white"
      style={{ fontFamily: "'Inter', 'Geist', sans-serif" }}
    >
      {/* Header */}
      <header className="border-b border-[#1e293b] px-8 py-4 flex items-center gap-4">
        <div className="text-2xl font-black tracking-tight">
          <span className="text-white">CAP</span>
          <span style={{ color: "#f59e0b" }}>OLOGY</span>
        </div>
        <div className="h-4 w-px bg-[#334155]" />
        <div className="text-gray-500 text-sm">
          NBA Salary Cap Dashboard · 2025–26
        </div>
      </header>

      <main className="px-8 py-7 flex flex-col gap-8 max-w-[1600px] mx-auto">
        {/* Team Grid */}
        <section>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-semibold">
            Select Team
          </div>
          <div className="grid grid-cols-10 gap-2">
            {teamNames.map((t) => (
              <TeamCard
                key={t}
                name={t}
                selected={t === selectedTeam}
                onClick={() => setSelectedTeam(t)}
              />
            ))}
          </div>
        </section>

        {/* Team Header + Stats */}
        <section className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-1 font-semibold">
              {meta.abbr}
            </div>
            <div
              className="text-4xl font-extrabold tracking-tight"
              style={{ color: meta.secondary }}
            >
              {selectedTeam}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              2025–26 Season · Salary Breakdown
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <StatCard label="Total Salary" value={fmt(totalSalary)} />
            <StatCard
              label={capOverage > 0 ? "Cap Overage" : "Cap Space"}
              value={capOverage > 0 ? `+${fmt(capOverage)}` : fmt(-capOverage)}
            />
            <StatCard label="Tax Status" value={taxStatus} accent={taxColor} />
          </div>
        </section>

        {/* Cap Bar */}
        <section>
          {/* Threshold labels sit above the bar */}
          <div className="relative w-full h-6 mb-1">
            {THRESHOLDS.map((t) => (
              <div
                key={t.label}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${(t.value / TOTAL_CAP) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span
                  className="text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: t.color }}
                >
                  {t.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative w-full h-12 bg-[#1e293b] rounded-xl flex overflow-visible">
            {players.map((p) => {
              const w = (p.value / TOTAL_CAP) * 100;
              if (w === 0) return null;
              const dimmed = hoveredPlayer !== null && hoveredPlayer !== p.name;
              return (
                <div
                  key={p.name}
                  className="relative h-full flex items-center justify-center text-[11px] font-semibold text-white/90 cursor-pointer first:rounded-l-xl transition-opacity duration-100"
                  style={{
                    width: `${w}%`,
                    background: p.color,
                    opacity: dimmed ? 0.25 : 1,
                  }}
                  onMouseEnter={() => setHoveredPlayer(p.name)}
                  onMouseLeave={() => setHoveredPlayer(null)}
                  title={`${p.name}: ${fmt(p.value)}`}
                >
                  {w > 6 && (
                    <span className="truncate px-1 drop-shadow-sm">
                      {p.name.split(" ").pop()}
                    </span>
                  )}
                </div>
              );
            })}

            {capSpace > 0 && (
              <div
                className="h-full flex items-center justify-center text-xs text-gray-600 font-medium last:rounded-r-xl"
                style={{ width: `${(capSpace / TOTAL_CAP) * 100}%` }}
              >
                {(capSpace / TOTAL_CAP) * 100 > 5 ? "Available" : ""}
              </div>
            )}

            {/* Threshold lines */}
            {THRESHOLDS.map((t) => (
              <div
                key={t.label}
                className="absolute top-0 h-full w-px"
                style={{
                  left: `${(t.value / TOTAL_CAP) * 100}%`,
                  background: t.color + "cc",
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-5 mt-3 flex-wrap">
            {THRESHOLDS.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: t.color }}
                />
                {t.label}: {fmt(t.value)}
              </div>
            ))}
          </div>
        </section>

        {/* Player Table */}
        <section>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest mb-3 font-semibold">
            Player Contracts
          </div>
          <div className="bg-[#1e293b] rounded-xl overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#0f172a]">
                  <th className="py-3 px-5 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold w-10">
                    #
                  </th>
                  <th className="py-3 px-4 text-left text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Player
                  </th>
                  <th className="py-3 px-4 text-right text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Salary
                  </th>
                  <th className="py-3 px-4 text-right text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    % of Cap
                  </th>
                  <th className="py-3 px-6 text-right text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Team Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((p, i) => {
                  const pctOfCap = (p.value / TOTAL_CAP) * 100;
                  const pctOfTeam =
                    totalSalary > 0 ? (p.value / totalSalary) * 100 : 0;
                  const isHovered = hoveredPlayer === p.name;
                  return (
                    <tr
                      key={p.name}
                      className="border-b border-[#0f172a] last:border-0 transition-colors duration-75 cursor-default"
                      style={{
                        background: isHovered ? "#263448" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredPlayer(p.name)}
                      onMouseLeave={() => setHoveredPlayer(null)}
                    >
                      {/* Rank */}
                      <td className="py-3 px-5 text-gray-600 font-mono text-xs">
                        {i + 1}
                      </td>

                      {/* Player */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              background: p.value > 0 ? p.color : "#374151",
                            }}
                          />
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#334155] shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center text-[9px] text-gray-400 shrink-0 font-semibold">
                              {p.name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                          )}
                          <span className="font-medium text-gray-100">
                            {p.name}
                          </span>
                        </div>
                      </td>

                      {/* Salary */}
                      <td className="py-3 px-4 text-right font-mono text-gray-200 tabular-nums">
                        {fmt(p.value)}
                      </td>

                      {/* % of cap */}
                      <td className="py-3 px-4 text-right text-gray-400 tabular-nums">
                        {p.value > 0 ? `${pctOfCap.toFixed(1)}%` : "—"}
                      </td>

                      {/* Team share mini-bar */}
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-28 h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${pctOfTeam}%`,
                                background:
                                  p.value > 0 ? p.color : "transparent",
                              }}
                            />
                          </div>
                          <span className="text-gray-400 text-xs w-10 text-right tabular-nums">
                            {p.value > 0 ? `${pctOfTeam.toFixed(1)}%` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
