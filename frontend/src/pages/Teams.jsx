import { useEffect, useState } from "react";
import { getAllTeams, getTeamRoster, getTeamGameLog } from "../api/nbaApi";

const TEAM_COLORS = {
  ATL: "#C1071E", BOS: "#007A33", BKN: "#000000", CHA: "#1D1160",
  CHI: "#CE1141", CLE: "#860038", DAL: "#00538C", DEN: "#0E2240",
  DET: "#C8102E", GSW: "#1D428A", HOU: "#CE1141", IND: "#002D62",
  LAC: "#C8102E", LAL: "#552583", MEM: "#5D76A9", MIA: "#98002E",
  MIL: "#00471B", MIN: "#0C2340", NOP: "#0C2340", NYK: "#F58426",
  OKC: "#007AC1", ORL: "#0077C0", PHI: "#006BB6", PHX: "#1D1160",
  POR: "#E03A3E", SAC: "#5A2D81", SAS: "#C4CED4", TOR: "#CE1141",
  UTA: "#002B5C", WAS: "#002B5C",
};

function TeamLogo({ teamId, tricode, size = 48 }) {
  const [imgError, setImgError] = useState(false);
  return imgError ? (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: TEAM_COLORS[tricode] || "#1d428a",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.28, fontWeight: 900, color: "#fff",
      fontFamily: "'Barlow Condensed', sans-serif",
    }}>
      {tricode}
    </div>
  ) : (
    <img
      src={`https://cdn.nba.com/logos/nba/${teamId}/global/L/logo.svg`}
      alt={tricode}
      width={size} height={size}
      style={{ objectFit: "contain" }}
      onError={() => setImgError(true)}
    />
  );
}

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
    setView("roster");
    setLoading(true);
    try {
      const [rosterRes, gameLogRes] = await Promise.all([
        getTeamRoster(team.id, season),
        getTeamGameLog(team.id, season),
      ]);
      const rosterHeaders = rosterRes.data?.resultSets?.[0]?.headers || [];
      const rosterRows = rosterRes.data?.resultSets?.[0]?.rowSet || [];
      setRoster({ rows: rosterRows, headers: rosterHeaders });

      const glHeaders = gameLogRes.data?.resultSets?.[0]?.headers || [];
      const glRows = gameLogRes.data?.resultSets?.[0]?.rowSet || [];
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
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .team-card {
          background: #0a0e1a; border: 1px solid #1e2a4a; border-radius: 12px;
          padding: 16px 12px; cursor: pointer; transition: all .2s;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .team-card:hover { transform: translateY(-4px); box-shadow: 0 0 24px rgba(29,66,138,0.5); border-color: #1d428a; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1.5px; padding: 10px 20px; border-radius: 8px; transition: all .15s; }
        .tbl-row:hover { background: #1a2540 !important; }
      `}</style>

      <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 1, marginBottom: 28, textTransform: "uppercase" }}>Teams</h1>

      {!selectedTeam ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          {Object.entries(conferences).map(([conf, confTeams]) => (
            <div key={conf}>
              <div style={{ fontSize: 13, color: "#c8a96e", fontWeight: 700, letterSpacing: 3, marginBottom: 16, textTransform: "uppercase" }}>
                {conf}ern Conference
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 12 }}>
                {confTeams.map((team) => (
                  <div key={team.id} className="team-card" onClick={() => handleSelectTeam(team)}>
                    <TeamLogo teamId={team.id} tricode={team.abbreviation} size={52} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>{team.abbreviation}</div>
                    <div style={{ fontSize: 11, color: "#5a6a8a", textAlign: "center", fontFamily: "'Barlow', sans-serif", lineHeight: 1.3 }}>{team.full_name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28, background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16, padding: "20px 24px" }}>
            <button
              onClick={() => setSelectedTeam(null)}
              style={{ background: "none", border: "none", color: "#5a6a8a", cursor: "pointer", fontSize: 13, fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}
            >
              ← BACK
            </button>
            <div style={{ width: 1, height: 40, background: "#1e2a4a" }} />
            <TeamLogo teamId={selectedTeam.id} tricode={selectedTeam.abbreviation} size={64} />
            <div>
              <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{season} SEASON</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{selectedTeam.full_name}</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["roster", "ROSTER"], ["gamelog", "GAME LOG"]].map(([key, label]) => (
              <button
                key={key}
                className="tab-btn"
                onClick={() => setView(key)}
                style={{ background: view === key ? "#1d428a" : "#0d1529", color: view === key ? "#fff" : "#5a6a8a", border: `1px solid ${view === key ? "#1d428a" : "#1e2a4a"}` }}
              >
                {label}
              </button>
            ))}
          </div>

          {loading && <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>LOADING...</p>}

          {/* Roster Table */}
          {!loading && view === "roster" && roster && (
            <div style={{ background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#1d428a" }}>
                    {rosterCols.map((col) => (
                      <th key={col} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: "left" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roster.rows.map((row, i) => {
                    const obj = Object.fromEntries(roster.headers.map((h, j) => [h, row[j]]));
                    return (
                      <tr key={i} className="tbl-row" style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a" }}>
                        {rosterCols.map((col) => (
                          <td key={col} style={{ padding: "10px 14px", color: col === "PLAYER" ? "#fff" : "#9ca3af", fontWeight: col === "PLAYER" ? 700 : 400 }}>
                            {obj[col] ?? "—"}
                          </td>
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
            <div style={{ background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#1d428a" }}>
                    {gameLogCols.map((col) => (
                      <th key={col} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: "left" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameLog.rows.map((row, i) => {
                    const obj = Object.fromEntries(gameLog.headers.map((h, j) => [h, row[j]]));
                    return (
                      <tr key={i} className="tbl-row" style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a" }}>
                        {gameLogCols.map((col) => (
                          <td key={col} style={{
                            padding: "10px 14px",
                            color: col === "WL" ? (obj[col] === "W" ? "#22c55e" : "#ef4444") : col === "GAME_DATE" ? "#c8a96e" : "#9ca3af",
                            fontWeight: col === "WL" || col === "GAME_DATE" ? 700 : 400,
                          }}>
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