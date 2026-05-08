import { useEffect, useState } from "react";
import { getAllTeams, getTeamRoster, getTeamGameLog } from "../api/nbaApi";
import { TEAM_DATA } from "../data/teamData";

const TEAM_IDS = {
  ATL:1610612737,BOS:1610612738,BKN:1610612751,CHA:1610612766,CHI:1610612741,
  CLE:1610612739,DAL:1610612742,DEN:1610612743,DET:1610612765,GSW:1610612744,
  HOU:1610612745,IND:1610612754,LAC:1610612746,LAL:1610612747,MEM:1610612763,
  MIA:1610612748,MIL:1610612749,MIN:1610612750,NOP:1610612740,NYK:1610612752,
  OKC:1610612760,ORL:1610612753,PHI:1610612755,PHX:1610612756,POR:1610612757,
  SAC:1610612758,SAS:1610612759,TOR:1610612761,UTA:1610612762,WAS:1610612764,
};

function Logo({ abbr, size = 48 }) {
  const [err, setErr] = useState(false);
  const id = TEAM_IDS[abbr];
  const color = TEAM_DATA[abbr]?.color || "#1d428a";
  return err || !id ? (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.27, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{abbr}</div>
  ) : (
    <img src={`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} onError={() => setErr(true)} />
  );
}

const EAST = ["ATL","BOS","BKN","CHA","CHI","CLE","DET","IND","MIA","MIL","NYK","ORL","PHI","TOR","WAS"];
const WEST = ["DAL","DEN","GSW","HOU","LAC","LAL","MEM","MIN","NOP","OKC","PHX","POR","SAC","SAS","UTA"];

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [roster, setRoster] = useState(null);
  const [gameLog, setGameLog] = useState(null);
  const [view, setView] = useState("history");
  const [loading, setLoading] = useState(false);
  const season = "2025-26";

  useEffect(() => { getAllTeams().then(r => setTeams(r.data)); }, []);

  const handleSelect = async (team) => {
    setSelected(team); setRoster(null); setGameLog(null); setView("history"); setLoading(true);
    try {
      const [rr, gr] = await Promise.all([getTeamRoster(team.id, season), getTeamGameLog(team.id, season)]);
      const rh = rr.data?.resultSets?.[0]?.headers || [];
      const rrows = rr.data?.resultSets?.[0]?.rowSet || [];
      setRoster({ rows: rrows, headers: rh });
      const gh = gr.data?.resultSets?.[0]?.headers || [];
      const grows = gr.data?.resultSets?.[0]?.rowSet || [];
      setGameLog({ rows: grows, headers: gh });
    } catch { } finally { setLoading(false); }
  };

  const tabBtn = (key, label) => (
    <button key={key} onClick={() => setView(key)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 18px", borderRadius: 6, border: `1px solid ${view === key ? "#1d428a" : "rgba(255,255,255,0.08)"}`, background: view === key ? "#1d428a" : "transparent", color: view === key ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif" }}>{label}</button>
  );

  const data = selected ? TEAM_DATA[selected.abbreviation] : null;

  if (selected) {
    return (
      <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, background: "linear-gradient(135deg,#0d1628,#111827)", borderRadius: 14, padding: "20px 24px", border: "1px solid rgba(200,169,110,0.15)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: data?.color || "#1d428a" }} />
          <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow',sans-serif", letterSpacing: 1, flexShrink: 0 }}>← BACK</button>
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
          <Logo abbr={selected.abbreviation} size={70} />
          <div>
            <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>{season} SEASON · EST. {data?.founded}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, lineHeight: 1 }}>{selected.full_name}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4, fontFamily: "'Barlow',sans-serif" }}>{data?.arena}</div>
          </div>
          {data?.championships.length > 0 && (
            <div style={{ marginLeft: "auto", textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#c8a96e", lineHeight: 1 }}>🏆 {data.championships.length}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontFamily: "'Barlow',sans-serif" }}>CHAMPIONSHIPS</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {tabBtn("history", "HISTORY")}
          {tabBtn("roster", "ROSTER")}
          {tabBtn("gamelog", "GAME LOG")}
        </div>

        {loading && <div style={{ color: "#c8a96e", letterSpacing: 3, fontSize: 12 }}>LOADING...</div>}

        {/* History Tab */}
        {view === "history" && data && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {/* Championships */}
            <div style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>🏆 CHAMPIONSHIPS <div style={{ flex: 1, height: 1, background: "rgba(200,169,110,0.2)" }} /></div>
              {data.championships.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: "'Barlow',sans-serif" }}>No championships yet</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {data.championships.map(y => (
                    <div key={y} style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", borderRadius: 6, padding: "6px 12px", fontSize: 14, fontWeight: 900, color: "#c8a96e" }}>{y}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Accomplishments */}
            <div style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>⭐ ACCOMPLISHMENTS <div style={{ flex: 1, height: 1, background: "rgba(200,169,110,0.2)" }} /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.accomplishments.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a96e", marginTop: 5, flexShrink: 0 }} />
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontFamily: "'Barlow',sans-serif", lineHeight: 1.4 }}>{a}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retired Jerseys */}
            <div style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px", gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>👕 RETIRED JERSEYS <div style={{ flex: 1, height: 1, background: "rgba(200,169,110,0.2)" }} /></div>
              {data.retired.length === 0 ? (
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontFamily: "'Barlow',sans-serif" }}>No retired jerseys</div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {data.retired.map((r, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: data.color || "#1d428a", lineHeight: 1, marginBottom: 4 }}>#{r.number}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, fontFamily: "'Barlow',sans-serif", lineHeight: 1.3 }}>{r.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {view === "roster" && !loading && roster && (
          <div style={{ background: "#0a0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#1d428a" }}>
                {["PLAYER","#","POSITION","HEIGHT","WEIGHT","AGE"].map(h => <th key={h} style={{ padding: "11px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: "left" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {roster.rows.map((row, i) => {
                  const obj = Object.fromEntries(roster.headers.map((h, j) => [h, row[j]]));
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0d1529" : "#0a0e1a"}>
                      {["PLAYER","NUM","POSITION","HEIGHT","WEIGHT","AGE"].map(k => (
                        <td key={k} style={{ padding: "10px 14px", color: k === "PLAYER" ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: k === "PLAYER" ? 700 : 400 }}>{obj[k] ?? "—"}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Game Log Tab */}
        {view === "gamelog" && !loading && gameLog && (
          <div style={{ background: "#0a0e1a", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ background: "#1d428a" }}>
                {["GAME_DATE","MATCHUP","WL","PTS","REB","AST","FG_PCT"].map(h => <th key={h} style={{ padding: "11px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: "left" }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {gameLog.rows.map((row, i) => {
                  const obj = Object.fromEntries(gameLog.headers.map((h, j) => [h, row[j]]));
                  return (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0d1529" : "#0a0e1a"}>
                      <td style={{ padding: "10px 14px", color: "#c8a96e", fontWeight: 700 }}>{obj.GAME_DATE}</td>
                      <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 600 }}>{obj.MATCHUP}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700, color: obj.WL === "W" ? "#22c55e" : "#ef4444" }}>{obj.WL}</td>
                      <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700 }}>{obj.PTS}</td>
                      <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{obj.REB}</td>
                      <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{obj.AST}</td>
                      <td style={{ padding: "10px 14px", color: "rgba(255,255,255,0.5)" }}>{obj.FG_PCT ? (parseFloat(obj.FG_PCT) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // Team Selection Grid
  const byAbbr = Object.fromEntries(teams.map(t => [t.abbreviation, t]));
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 6 }}>HOOPTRACK</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 28, lineHeight: 1 }}>Teams</div>
      {[["EASTERN CONFERENCE", EAST], ["WESTERN CONFERENCE", WEST]].map(([label, abbs]) => (
        <div key={label} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            {label} <div style={{ flex: 1, height: 1, background: "linear-gradient(to right,rgba(200,169,110,0.3),transparent)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10 }}>
            {abbs.map(abbr => {
              const team = byAbbr[abbr];
              const d = TEAM_DATA[abbr];
              if (!team) return null;
              return (
                <div key={abbr} onClick={() => handleSelect(team)}
                  style={{ background: "rgba(13,20,40,0.8)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all .2s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"; e.currentTarget.style.boxShadow = `0 8px 28px ${d?.color || "#1d428a"}44`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.boxShadow = ""; }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: d?.color || "#1d428a" }} />
                  <Logo abbr={abbr} size={48} />
                  <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{abbr}</div>
                  {d?.championships.length > 0 && <div style={{ fontSize: 10, color: "#c8a96e", fontWeight: 700 }}>🏆 {d.championships.length}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}