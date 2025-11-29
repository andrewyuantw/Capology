"use client";

import React, { useState } from "react";
import nbaSalaries from "../data/nba_salaries.json";
import playerImages from "../data/player_images.json";

// === Constants ===
const TOTAL_CAP = 240_000_000;

const COLOR_POOL = [
  "bg-red-500",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
];

const THRESHOLDS = [
  { label: "Salary Cap", value: 154_647_000 },
  { label: "Luxury Tax", value: 187_895_000 },
  { label: "First Apron", value: 195_945_000 },
  { label: "Second Apron", value: 207_824_000 },
];

// === Helpers ===
function assignColors(players: { name: string; value: number }[]) {
  return players.map((p, idx) => ({
    ...p,
    color: COLOR_POOL[idx % COLOR_POOL.length],
  }));
}

// === Components ===
function TeamSelector({
  teams,
  selected,
  onChange,
}: {
  teams: string[];
  selected: string;
  onChange: (team: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="mb-6 border rounded p-2 text-lg text-black"
    >
      {teams.map((team) => (
        <option key={team} value={team}>
          {team}
        </option>
      ))}
    </select>
  );
}

function PlayerBar({
  name,
  value,
  color,
  image,
}: {
  name: string;
  value: number;
  color: string;
  image?: string | null;
}) {
  const widthPercent = (value / TOTAL_CAP) * 100;
  const minLabelWidthPercent = 6; // prevents edge crowding
  const showLabel = widthPercent > minLabelWidthPercent;

  return (
    <div
      className={`${color} relative h-full flex items-center justify-center text-xs text-white font-semibold 
          transition-transform duration-200 ease-in-out hover:scale-105 hover:-translate-y-0.5 hover:shadow-lg 
          cursor-pointer group`}
      style={{ width: `${widthPercent}%` }}
    >
      {showLabel ? name : null}

      {/* Tooltip */}
      <div className="absolute z-50 hidden group-hover:flex flex-col items-center bottom-full mb-3">
        <div
          className="bg-black text-white rounded-xl p-4 shadow-2xl 
                  flex gap-4 items-center max-w-[260px] text-sm"
        >
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-600 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-700 rounded-lg flex items-center justify-center text-[10px] shrink-0">
              N/A
            </div>
          )}

          <div className="flex flex-col leading-tight break-words">
            <span className="font-bold text-base">{name}</span>
            <span className="opacity-80">${value.toLocaleString()}</span>
          </div>
        </div>

        {/* Tooltip arrow */}
        <div className="w-3 h-3 bg-black rotate-45 -mt-1"></div>
      </div>
    </div>
  );
}

function ThresholdLine({ label, value }: { label: string; value: number }) {
  const leftPercent = (value / TOTAL_CAP) * 100;
  return (
    <div
      className="absolute top-0 h-full border-l-2 border-dashed border-black"
      style={{ left: `${leftPercent}%` }}
      title={`${label}: $${value.toLocaleString()}`}
    >
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-black whitespace-nowrap">
        {label} <br /> ${Math.round(value / 1_000_000)}M
      </div>
    </div>
  );
}

// === Main ===
export default function CapBarHorizontal() {
  const teamNames = Object.keys(nbaSalaries);
  const [selectedTeam, setSelectedTeam] = useState(teamNames[0]);

  const rawTeamData = nbaSalaries[selectedTeam];
  const playerContracts = assignColors(
    Object.entries(rawTeamData)
      .map(([name, value]) => ({
        name,
        value: Number(value),
        image: playerImages[name] ?? null,
      }))
      .sort((a, b) => a.value - b.value),
  );

  const totalSalary = playerContracts.reduce((sum, p) => sum + p.value, 0);
  const capSpace = TOTAL_CAP - totalSalary;

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-xl w-[80%] mx-auto">
      {/* Team Selector */}
      <TeamSelector
        teams={teamNames}
        selected={selectedTeam}
        onChange={setSelectedTeam}
      />

      {/* Title */}
      <div className="text-3xl font-bold mb-1 text-black">{selectedTeam}</div>
      <div className="text-md mb-6 text-gray-600">2025 Cap Breakdown</div>

      {/* Salary Bar */}
      <div className="relative w-full h-12 bg-gray-200 rounded-md flex mb-8 overflow-visible">
        {playerContracts.map((p) => (
          <PlayerBar key={p.name} {...p} />
        ))}

        {capSpace > 0 && (
          <div
            className="bg-gray-300 h-full text-xs text-black flex items-center justify-center font-semibold"
            style={{ width: `${(capSpace / TOTAL_CAP) * 100}%` }}
            title={`Cap Space: $${capSpace.toLocaleString()}`}
          >
            Cap Space
          </div>
        )}

        {THRESHOLDS.map((t) => (
          <ThresholdLine key={t.label} {...t} />
        ))}
      </div>

      {/* Totals */}
      <div className="text-md font-medium text-black">
        <span>Total Salary: ${totalSalary.toLocaleString()}</span>
        <span className="ml-8">Cap Space: ${capSpace.toLocaleString()}</span>
      </div>
    </div>
  );
}
