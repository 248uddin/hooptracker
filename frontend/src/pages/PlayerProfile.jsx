import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getCareerStats, getPlayerInfo, getGameLog } from "../api/nbaApi";

const GOLD = "#c8a96e", BLUE = "#1d428a", DARK = "#0a0e1a";

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playerName = searchParams.get("name") || "Player";
  const [info, setInfo] = useState(null);
  const [careerStats, setCareerStats] = useState(null);
  const [gameLog, setGameLog] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [activeTab, setActiveTab] = useState("career");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [infoRes, careerRes] = await Promise.all([getPlayerInfo(id), getCareerStats(id)]);
        const ih = infoRes.data?.resultSets?.[0]?.headers || [];
        const ir = infoRes.data?.resultSets?.[0]?.rowSet?.[0] || [];
        setInfo(Object.fromEntries(ih.map((h, i) => [h, ir[i]])));
        const ch = careerRes.data?.resultSets?.[0]?.headers || [];
        const cr = careerRes.data?.resultSets?.[0]?.rowSet || [];
        const parsed = cr.map(row => Object.fromEntries(ch.map((h, i) => [h, row[i]])));
        setCareerStats(parsed);
        if (parsed.length > 0) setSelectedSeason(parsed[parsed.length - 1].SEASON_ID);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (!selectedSeason || activeTab !== "gamelog") return;
    setGameLog(null);
    getGameLog(id, selectedSeason).then(r => {
      const h = r.data?.resultSets?.[0]?.headers || [];
      const rows = r.data?.resultSets?.[0]?.rowSet || [];
      setGameLog(rows.map(row => Object.fromEntries(h.map((hh, i) => [hh, row[i]]))));
    });
  }, [selectedSeason, activeTab]);

  const tabBtn = (key, label) => (
    <button key={key} onClick={() => setActiveTab(key)} style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 20px", borderRadius: 6, border: `1px solid ${activeTab === key ? BLUE : "rgba(255,255,255,0.08)"}`, background: activeTab === key ? BLUE : "transparent", color: activeTab === key ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif" }}>{label}</button>
  );

  if (loading) return <div style={{ padding: 40, color: GOLD, letterSpacing: 3, fontSize: 14 }}>LOADING PLAYER DATA...</div>;

  const latest = careerStats?.[careerStats.length - 1];

  return (
    <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <button onClick={() => navigate("/players")} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 12, fontFamily: "'Barlow',sans-serif", marginBottom: 20, letterSpacing: 1 }}>← BACK TO SEARCH</button>

      {/* Hero */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "linear-gradient(135deg,#0d1628 0%,#111827 100%)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(200,169,110,0.15)" }}>
        <div style={{ position: "relative", width: 220, minHeight: 260, background: "linear-gradient(to bottom,#1a2744,#0a0e1a)", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: BLUE }} />
          <img src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`} alt={playerName}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
          <div style={{ display: "none", alignItems: "center", justifyContent: "center", height: 260, fontSize: 64, color: "rgba(255,255,255,0.05)", fontWeight: 900 }}>
            {playerName.split(" ").map(w => w[0]).join("")}
          </div>
        </div>
        <div style={{ padding: "24px 28px", flex: 1 }}>
          <div style={{ fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>
            {info?.TEAM_CITY} {info?.TEAM_NAME} · {info?.POSITION}
          </div>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 2 }}>{playerName.split(" ").slice(-1)[0]}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, textTransform: "uppercase", marginBottom: 18, lineHeight: 1 }}>{playerName.split(" ").slice(0, -1).join(" ")}</div>
          <div style={{ display: "flex", gap: 28, marginBottom: 22, flexWrap: "wrap" }}>
            {[
              { label: "HEIGHT", val: info?.HEIGHT },
              { label: "WEIGHT", val: info?.WEIGHT ? info.WEIGHT + " lbs" : null },
              { label: "AGE", val: info?.BIRTHDATE ? new Date().getFullYear() - new Date(info.BIRTHDATE).getFullYear() : null },
              { label: "DRAFT", val: info?.DRAFT_YEAR ? `${info.DRAFT_YEAR} R${info.DRAFT_ROUND} #${info.DRAFT_NUMBER}` : "Undrafted" },
              { label: "COLLEGE", val: info?.SCHOOL || "—" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 2, marginBottom: 2, fontFamily: "'Barlow',sans-serif" }}>{s.label}</div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{s.val || "—"}</div>
              </div>
            ))}
          </div>
          {latest && (
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontWeight: 700, letterSpacing: 2, marginBottom: 10, fontFamily: "'Barlow',sans-serif" }}>{latest.SEASON_ID} PER GAME</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { l: "PTS", v: latest.PTS }, { l: "REB", v: latest.REB }, { l: "AST", v: latest.AST },
                  { l: "STL", v: latest.STL }, { l: "BLK", v: latest.BLK },
                  { l: "FG%", v: latest.FG_PCT ? (parseFloat(latest.FG_PCT) * 100).toFixed(1) + "%" : null },
                ].map(s => (
                  <div key={s.l} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 56 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: s.l === "PTS" ? GOLD : "#fff", textShadow: s.l === "PTS" ? "0 0 20px rgba(200,169,110,0.4)" : "none", lineHeight: 1 }}>{s.v ?? "—"}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: 1.5, marginTop: 3, fontFamily: "'Barlow',sans-serif" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {tabBtn("career", "CAREER STATS")}
        {tabBtn("gamelog", "GAME LOG")}
      </div>

      {activeTab === "career" && careerStats && (
        <div style={{ background: DARK, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: BLUE }}>
              {["SEASON","TEAM","GP","PTS","REB","AST","STL","BLK","FG%","3P%","FT%"].map(h => (
                <th key={h} style={{ padding: "11px 12px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: ["SEASON","TEAM"].includes(h) ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {careerStats.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#0d1529" : DARK, cursor: "pointer" }}
                  onClick={() => { setSelectedSeason(row.SEASON_ID); setActiveTab("gamelog"); }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0d1529" : DARK}>
                  <td style={{ padding: "9px 12px", color: GOLD, fontWeight: 700 }}>{row.SEASON_ID}</td>
                  <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 600 }}>{row.TEAM_ABBREVIATION}</td>
                  <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.GP}</td>
                  <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 700, textAlign: "center" }}>{row.PTS}</td>
                  <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.REB}</td>
                  <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.AST}</td>
                  <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.STL}</td>
                  <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.BLK}</td>
                  {["FG_PCT","FG3_PCT","FT_PCT"].map(k => <td key={k} style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row[k] ? (parseFloat(row[k]) * 100).toFixed(1) + "%" : "—"}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "8px 12px", fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow',sans-serif" }}>💡 Click any row to view that season's game log</div>
        </div>
      )}

      {activeTab === "gamelog" && (
        <div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {careerStats?.map(row => (
              <button key={row.SEASON_ID} onClick={() => setSelectedSeason(row.SEASON_ID)} style={{ fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20, border: `1px solid ${selectedSeason === row.SEASON_ID ? BLUE : "rgba(255,255,255,0.08)"}`, background: selectedSeason === row.SEASON_ID ? BLUE : "transparent", color: selectedSeason === row.SEASON_ID ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif" }}>{row.SEASON_ID}</button>
            ))}
          </div>
          {!gameLog ? <div style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontSize: 12 }}>LOADING GAME LOG...</div> : (
            <div style={{ background: DARK, border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: BLUE }}>
                  {["DATE","MATCHUP","W/L","MIN","PTS","REB","AST","STL","BLK","FG%"].map(h => (
                    <th key={h} style={{ padding: "11px 12px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: ["DATE","MATCHUP"].includes(h) ? "left" : "center" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {gameLog.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#0d1529" : DARK }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a2540"}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#0d1529" : DARK}>
                      <td style={{ padding: "9px 12px", color: GOLD, fontWeight: 700 }}>{row.GAME_DATE}</td>
                      <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 600 }}>{row.MATCHUP}</td>
                      <td style={{ padding: "9px 12px", textAlign: "center", fontWeight: 700, color: row.WL === "W" ? "#22c55e" : "#ef4444" }}>{row.WL}</td>
                      <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.MIN}</td>
                      <td style={{ padding: "9px 12px", color: "#fff", fontWeight: 700, textAlign: "center" }}>{row.PTS}</td>
                      {["REB","AST","STL","BLK"].map(k => <td key={k} style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row[k]}</td>)}
                      <td style={{ padding: "9px 12px", color: "#ccc", textAlign: "center" }}>{row.FG_PCT ? (parseFloat(row.FG_PCT) * 100).toFixed(1) + "%" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}