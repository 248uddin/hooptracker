import { useEffect, useState } from "react";
import { getStandings } from "../api/nbaApi";

const SEASONS = ["2025-26","2024-25","2023-24","2022-23","2021-22","2020-21","2019-20","2018-19","2017-18","2016-17","2015-16"];

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conf, setConf] = useState("East");
  const [season, setSeason] = useState("2025-26");

  useEffect(() => {
    setLoading(true); setError(null);
    getStandings(season)
      .then(r => {
        const h = r.data?.resultSets?.[0]?.headers || [];
        const rows = r.data?.resultSets?.[0]?.rowSet || [];
        setStandings(rows.map(row => Object.fromEntries(h.map((hh, i) => [hh, row[i]]))));
      })
      .catch(() => setError("Could not load standings."))
      .finally(() => setLoading(false));
  }, [season]);

  const filtered = standings.filter(t => t.Conference === conf).sort((a, b) => parseInt(a.PlayoffRank) - parseInt(b.PlayoffRank));

  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%,rgba(29,66,138,0.15) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 6 }}>HOOPTRACK</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24, lineHeight: 1 }}>Standings</div>

      {/* Season Selector */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 2, marginBottom: 10, fontFamily: "'Barlow',sans-serif" }}>SEASON</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SEASONS.map(s => (
            <button key={s} onClick={() => setSeason(s)} style={{ fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 6, border: `1px solid ${season === s ? "#1d428a" : "rgba(255,255,255,0.08)"}`, background: season === s ? "#1d428a" : "rgba(13,20,40,0.8)", color: season === s ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 1 }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Conference Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["East", "West"].map(c => (
          <button key={c} onClick={() => setConf(c)} style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "9px 24px", borderRadius: 8, border: `1px solid ${conf === c ? "#c8a96e" : "rgba(255,255,255,0.08)"}`, background: conf === c ? "rgba(200,169,110,0.15)" : "rgba(13,20,40,0.8)", color: conf === c ? "#c8a96e" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif" }}>
            {c.toUpperCase()}ERN CONFERENCE
          </button>
        ))}
      </div>

      {loading && <div style={{ color: "#c8a96e", letterSpacing: 3, fontSize: 12 }}>LOADING STANDINGS...</div>}
      {error && <div style={{ color: "#ef4444" }}>{error}</div>}

      {!loading && !error && (
        <div style={{ background: "#0a0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#1d428a" }}>
              {["#","TEAM","W","L","WIN%","GB","HOME","AWAY","L10","STREAK"].map(h => (
                <th key={h} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: ["#","TEAM"].includes(h) ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((team, i) => (
                <tr key={team.TeamID} style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a", borderTop: i === 6 ? "2px solid rgba(200,169,110,0.4)" : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0d1529" : "#0a0e1a"}>
                  <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{team.PlayoffRank}</td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700 }}>{team.TeamCity} {team.TeamName}</td>
                  <td style={{ padding: "10px 14px", color: "#22c55e", fontWeight: 700, textAlign: "center" }}>{team.WINS}</td>
                  <td style={{ padding: "10px 14px", color: "#ef4444", fontWeight: 700, textAlign: "center" }}>{team.LOSSES}</td>
                  <td style={{ padding: "10px 14px", color: "#c8a96e", fontWeight: 700, textAlign: "center" }}>{team.WinPCT ? (parseFloat(team.WinPCT) * 100).toFixed(1) + "%" : "—"}</td>
                  <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{team.GamesBehind ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{team.HOME ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{team.ROAD ?? "—"}</td>
                  <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>{team.L10 ?? "—"}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 700, textAlign: "center", color: team.strCurrentStreak?.startsWith("W") ? "#22c55e" : "#ef4444" }}>{team.strCurrentStreak ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "8px 14px", fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow',sans-serif" }}>— Gold line separates play-in teams (seeds 7–10)</div>
        </div>
      )}
    </div>
  );
}