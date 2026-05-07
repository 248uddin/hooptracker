import { useEffect, useState } from "react";
import { getStandings } from "../api/nbaApi";

const SEASONS = [
  "2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21",
  "2019-20", "2018-19", "2017-18", "2016-17", "2015-16",
];

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conference, setConference] = useState("East");
  const [season, setSeason] = useState("2025-26");

  useEffect(() => {
    setLoading(true);
    setError(null);
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

  const filtered = standings
    .filter((t) => t.Conference === conference)
    .sort((a, b) => parseInt(a.PlayoffRank) - parseInt(b.PlayoffRank));

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .standings-row:hover { background: #1a2540 !important; }
        .chip { border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 1px; border-radius: 8px; transition: all .15s; }
      `}</style>

      <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 1, marginBottom: 24, textTransform: "uppercase" }}>
        Standings
      </h1>

      {/* Season Selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#3a4a6a", fontWeight: 600, letterSpacing: 2, marginBottom: 10, fontFamily: "'Barlow', sans-serif" }}>
          SEASON
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SEASONS.map((s) => (
            <button
              key={s}
              className="chip"
              onClick={() => setSeason(s)}
              style={{
                padding: "8px 16px", fontSize: 13,
                background: season === s ? "#1d428a" : "#0a0e1a",
                color: season === s ? "#fff" : "#5a6a8a",
                border: `1px solid ${season === s ? "#1d428a" : "#1e2a4a"}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Conference Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {["East", "West"].map((conf) => (
          <button
            key={conf}
            className="chip"
            onClick={() => setConference(conf)}
            style={{
              padding: "10px 24px", fontSize: 15,
              background: conference === conf ? "#c8a96e" : "#0a0e1a",
              color: conference === conf ? "#000" : "#5a6a8a",
              border: `1px solid ${conference === conf ? "#c8a96e" : "#1e2a4a"}`,
            }}
          >
            {conf.toUpperCase()}ERN CONFERENCE
          </button>
        ))}
      </div>

      {loading && <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>LOADING STANDINGS...</p>}
      {error && <p style={{ color: "#ef4444" }}>{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div style={{ background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: "#1d428a" }}>
                {["#", "TEAM", "W", "L", "WIN%", "GB", "HOME", "AWAY", "L10", "STREAK"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: h === "TEAM" || h === "#" ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((team, i) => (
                <tr
                  key={team.TeamID}
                  className="standings-row"
                  style={{
                    background: i % 2 === 0 ? "#0d1529" : "#0a0e1a",
                    borderTop: i === 6 ? "2px solid #c8a96e" : "none",
                  }}
                >
                  <td style={{ padding: "10px 14px", color: "#5a6a8a", fontWeight: 700 }}>{team.PlayoffRank}</td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700 }}>{team.TeamCity} {team.TeamName}</td>
                  <td style={{ padding: "10px 14px", color: "#22c55e", fontWeight: 700, textAlign: "center" }}>{team.WINS}</td>
                  <td style={{ padding: "10px 14px", color: "#ef4444", fontWeight: 700, textAlign: "center" }}>{team.LOSSES}</td>
                  <td style={{ padding: "10px 14px", color: "#c8a96e", fontWeight: 700, textAlign: "center" }}>
                    {team.WinPCT ? (parseFloat(team.WinPCT) * 100).toFixed(1) + "%" : "—"}
                  </td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", textAlign: "center" }}>{team.GamesBehind ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", textAlign: "center" }}>{team.HOME ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", textAlign: "center" }}>{team.ROAD ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#9ca3af", textAlign: "center" }}>{team.L10 ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, textAlign: "center", color: team.strCurrentStreak?.startsWith("W") ? "#22c55e" : "#ef4444" }}>
                    {team.strCurrentStreak ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "10px 14px", fontSize: 11, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif" }}>
            — Gold line separates play-in teams (seeds 7–10)
          </div>
        </div>
      )}
    </div>
  );
}