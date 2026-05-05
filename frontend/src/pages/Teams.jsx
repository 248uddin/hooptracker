import { useEffect, useState } from "react";
import { getAllTeams, getTeamRoster, getTeamGameLog } from "../api/nbaApi";

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState(null);
  const [gameLog, setGameLog] = useState(null);
  const [view, setView] = useState("roster");
  const [loading, setLoading] = useState(false);
  const [season] = useState("2024-25");

  useEffect(() => {
    getAllTeams().then((res) => setTeams(res.data));
  }, []);

  const handleSelectTeam = async (team) => {
    setSelectedTeam(team);
    setRoster(null);
    setGameLog(null);
    setLoading(true);
    try {
      const [rosterRes, gameLogRes] = await Promise.all([
        getTeamRoster(team.id, season),
        getTeamGameLog(team.id, season),
      ]);
      const rosterRows = rosterRes.data?.resultSets?.[0]?.rowSet || [];
      const rosterHeaders = rosterRes.data?.resultSets?.[0]?.headers || [];
      setRoster({ rows: rosterRows, headers: rosterHeaders });

      const glRows = gameLogRes.data?.resultSets?.[0]?.rowSet || [];
      const glHeaders = gameLogRes.data?.resultSets?.[0]?.headers || [];
      setGameLog({ rows: glRows, headers: glHeaders });
    } catch {
      setRoster(null);
    } finally {
      setLoading(false);
    }
  };

  const rosterCols = ["PLAYER", "NUM", "POSITION", "HEIGHT", "WEIGHT", "AGE"];
  const gameLogCols = ["GAME_DATE", "MATCHUP", "WL", "PTS", "REB", "AST", "FG_PCT"];

  const conferences = {
    East: teams.filter((t) =>
      ["ATL","BOS","BKN","CHA","CHI","CLE","DET","IND","MIA","MIL","NYK","ORL","PHI","TOR","WAS"].includes(t.abbreviation)
    ),
    West: teams.filter((t) =>
      ["DAL","DEN","GSW","HOU","LAC","LAL","MEM","MIN","NOP","OKC","PHX","POR","SAC","SAS","UTA"].includes(t.abbreviation)
    ),
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Teams</h1>

      {!selectedTeam ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(conferences).map(([conf, confTeams]) => (
            <div key={conf}>
              <h2 className="text-hardwood font-bold text-lg mb-3">{conf}ern Conference</h2>
              <div className="grid grid-cols-3 gap-2">
                {confTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleSelectTeam(team)}
                    className="bg-gray-800 hover:bg-nbaBlue border border-gray-700 hover:border-nbaBlue rounded-lg px-3 py-3 text-left transition-colors"
                  >
                    <p className="font-bold text-white text-sm">{team.abbreviation}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{team.full_name}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setSelectedTeam(null)}
              className="text-gray-400 hover:text-white text-sm"
            >
              ← Back to teams
            </button>
            <h2 className="text-xl font-bold text-hardwood">{selectedTeam.full_name}</h2>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setView("roster")}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                view === "roster" ? "bg-nbaBlue text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Roster
            </button>
            <button
              onClick={() => setView("gamelog")}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                view === "gamelog" ? "bg-nbaBlue text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Game Log
            </button>
          </div>

          {loading && <p className="text-gray-400">Loading...</p>}

          {/* Roster Table */}
          {!loading && view === "roster" && roster && (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-nbaBlue text-white">
                  <tr>
                    {rosterCols.map((col) => (
                      <th key={col} className="px-3 py-2 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.rows.map((row, i) => {
                    const obj = Object.fromEntries(roster.headers.map((h, j) => [h, row[j]]));
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                        {rosterCols.map((col) => (
                          <td key={col} className="px-3 py-2 text-gray-200">{obj[col] ?? "—"}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Game Log Table */}
          {!loading && view === "gamelog" && gameLog && (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-nbaBlue text-white">
                  <tr>
                    {gameLogCols.map((col) => (
                      <th key={col} className="px-3 py-2 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameLog.rows.map((row, i) => {
                    const obj = Object.fromEntries(gameLog.headers.map((h, j) => [h, row[j]]));
                    return (
                      <tr key={i} className={i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"}>
                        {gameLogCols.map((col) => (
                          <td key={col} className={`px-3 py-2 ${col === "WL" ? (obj[col] === "W" ? "text-green-400" : "text-red-400") : "text-gray-200"}`}>
                            {col === "FG_PCT" && obj[col] ? (parseFloat(obj[col]) * 100).toFixed(1) + "%" : obj[col] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}