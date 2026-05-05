import { useEffect, useState } from "react";
import { getStandings } from "../api/nbaApi";

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conference, setConference] = useState("East");
  const [season] = useState("2024-25");

  useEffect(() => {
    getStandings(season)
      .then((res) => {
        const rows = res.data?.resultSets?.[0]?.rowSet || [];
        const headers = res.data?.resultSets?.[0]?.headers || [];
        const parsed = rows.map((row) =>
          Object.fromEntries(headers.map((h, i) => [h, row[i]]))
        );
        setStandings(parsed);
      })
      .catch(() => setError("Could not load standings."))
      .finally(() => setLoading(false));
  }, [season]);

  if (loading) return <p className="text-gray-400">Loading standings...</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const filtered = standings
    .filter((t) => t.Conference === conference)
    .sort((a, b) => parseInt(a.PlayoffRank) - parseInt(b.PlayoffRank));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Standings</h1>

      {/* Conference Tabs */}
      <div className="flex gap-3 mb-6">
        {["East", "West"].map((conf) => (
          <button
            key={conf}
            onClick={() => setConference(conf)}
            className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
              conference === conf
                ? "bg-nbaBlue text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {conf}ern Conference
          </button>
        ))}
      </div>

      {/* Standings Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="bg-nbaBlue text-white">
            <tr>
              <th className="px-3 py-3 font-semibold">Rank</th>
              <th className="px-3 py-3 font-semibold">Team</th>
              <th className="px-3 py-3 font-semibold">W</th>
              <th className="px-3 py-3 font-semibold">L</th>
              <th className="px-3 py-3 font-semibold">WIN%</th>
              <th className="px-3 py-3 font-semibold">GB</th>
              <th className="px-3 py-3 font-semibold">Home</th>
              <th className="px-3 py-3 font-semibold">Away</th>
              <th className="px-3 py-3 font-semibold">Last 10</th>
              <th className="px-3 py-3 font-semibold">Streak</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((team, i) => (
              <tr
                key={team.TeamID}
                className={`${
                  i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                } ${i === 5 ? "border-t-2 border-hardwood" : ""}`}
              >
                <td className="px-3 py-2 text-gray-400 font-semibold">{team.PlayoffRank}</td>
                <td className="px-3 py-2 font-bold text-white">{team.TeamCity} {team.TeamName}</td>
                <td className="px-3 py-2 text-green-400 font-semibold">{team.WINS}</td>
                <td className="px-3 py-2 text-red-400 font-semibold">{team.LOSSES}</td>
                <td className="px-3 py-2 text-hardwood font-semibold">
                  {team.WinPCT ? (parseFloat(team.WinPCT) * 100).toFixed(1) + "%" : "—"}
                </td>
                <td className="px-3 py-2 text-gray-300">{team.GamesBehind ?? "—"}</td>
                <td className="px-3 py-2 text-gray-300">{team.HOME ?? "—"}</td>
                <td className="px-3 py-2 text-gray-300">{team.ROAD ?? "—"}</td>
                <td className="px-3 py-2 text-gray-300">{team.L10 ?? "—"}</td>
                <td className={`px-3 py-2 font-semibold ${
                  team.strCurrentStreak?.startsWith("W") ? "text-green-400" : "text-red-400"
                }`}>
                  {team.strCurrentStreak ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">— Line separates play-in teams (7-10 seeds)</p>
    </div>
  );
}