'use client'

import React, { useState } from "react";
import nbaSalaries from "../data/nba_salaries.json";

const colorPool = [
  "bg-red-500",
  "bg-blue-600",
  "bg-green-600",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
];

function assignRandomColors(players: { name: string; value: number }[]) {
  return players.map((p, idx) => ({
    ...p,
    color: colorPool[idx % colorPool.length],
  }));
}

const totalCap = 270_000_000; // Visualized cap range

// Cap thresholds (in millions)
const thresholds = [
  { label: "Salary Cap", value: 154_647_000 },
  { label: "Luxury Tax", value: 187_895_000 },
  { label: "First Apron", value: 195_945_000 },
  { label: "Second Apron", value: 207_824_000 },
];

export default function CapBarHorizontal() {
  const teamNames = Object.keys(nbaSalaries);
  const [selectedTeam, setSelectedTeam] = useState(teamNames[0]);

  const rawTeamData = nbaSalaries[selectedTeam];
  const playerContracts = assignRandomColors(
    Object.entries(rawTeamData)
      .map(([name, value]) => ({
        name,
        value: Number(value),
      }))
      .sort((a, b) => a.value - b.value)
  );

  const totalSalary = playerContracts.reduce((sum, p) => sum + p.value, 0);
  const capSpace = totalCap - totalSalary;

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-xl rounded-xl w-[80%] mx-auto">
      {/* Team Selector */}
      <select
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        className="mb-6 border rounded p-2 text-lg"
      >
        {teamNames.map((team) => (
          <option key={team} value={team}>
            {team}
          </option>
        ))}
      </select>

      {/* Title */}
      <div className="text-3xl font-bold mb-1">{selectedTeam}</div>
      <div className="text-md mb-6 text-gray-600">2025 Cap Breakdown</div>

      {/* Bar */}
      <div className="relative w-full h-12 bg-gray-200 rounded-md overflow-visible flex mb-8">
        {/* Player Contracts */}
        {playerContracts.map((p) => {
          const widthPercent = (p.value / totalCap) * 100;
          return (
            <div
              key={p.name}
              className={`${p.color} h-full flex items-center justify-center text-xs text-white font-semibold`}
              style={{ width: `${widthPercent}%` }}
              title={`${p.name}: $${p.value}M`}
            >
              {p.name}
            </div>
          );
        })}

        {/* Cap Space */}
        {capSpace > 0 && (
          <div
            className="bg-gray-300 h-full text-xs text-black flex items-center justify-center font-semibold"
            style={{ width: `${(capSpace / totalCap) * 100}%` }}
            title={`Cap Space: $${capSpace}M`}
          >
            Cap Space
          </div>
        )}

        {/* Threshold Lines */}
        {thresholds.map((t) => {
          const leftPercent = (t.value / totalCap) * 100;
          return (
            <div
              key={t.label}
              className="absolute top-0 h-full border-l-2 border-dashed border-black"
              style={{ left: `${leftPercent}%` }}
              title={`${t.label}: $${t.value}M`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-black whitespace-nowrap">
                {t.label} <br /> ${t.value / 1_000_000}M
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="text-md font-medium">
        <span>Total Salary: ${totalSalary}M</span>
        <span className="ml-8">Cap Space: ${capSpace}M</span>
      </div>
    </div>
  );
}