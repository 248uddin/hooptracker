import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getCareerStats, getPlayerInfo, getGameLog } from "../api/nbaApi";

const GOLD = "#c8a96e";
const BLUE = "#1d428a";
const DARK = "#0a0e1a";

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
        const [infoRes, careerRes] = await Promise.all([
          getPlayerInfo(id),
          getCareerStats(id),
        ]);

        const infoHeaders = infoRes.data?.resultSets?.[0]?.headers || [];
        const infoRow = infoRes.data?.resultSets?.[0]?.rowSet?.[0] || [];
        const infoObj = Object.fromEntries(infoHeaders.map((h, i) => [h, infoRow[i]]));
        setInfo(infoObj);

        const headers = careerRes.data?.resultSets?.[0]?.headers || [];
        const rows = careerRes.data?.resultSets?.[0]?.rowSet || [];
        const parsed = rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
        setCareerStats(parsed);

        if (parsed.length > 0) {
          setSelectedSeason(parsed[parsed.length - 1].SEASON_ID);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (!selectedSeason || activeTab !== "gamelog") return;
    getGameLog(id, selectedSeason).then((res) => {
      const headers = res.data?.resultSets?.[0]?.headers || [];
      const rows = res.data?.resultSets?.[0]?.rowSet || [];
      const parsed = rows.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
      setGameLog(parsed);
    });
  }, [selectedSeason, activeTab]);

  if (loading) return (
    <div style={{ color: GOLD, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 20, letterSpacing: 2, padding: 40 }}>
      LOADING PLAYER DATA...
    </div>
  );

  const latestSeason = careerStats?.[careerStats.length - 1];

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", maxWidth: 1100, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .stat-card { background: #0d1529; border: 1px solid #1e2a4a; border-radius: 12px; padding: 16px 20px; text-align: center; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 1.5px; padding: 10px 20px; border-radius: 8px; transition: all .15s; }
        .career-row:hover { background: #1a2540 !important; }
        .season-chip { background: #0d1529; border: 1px solid #1e2a4a; color: #fff; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 1px; transition: all .15s; }
        .season-chip:hover, .season-chip.active { background: #1d428a; border-color: #1d428a; color: #fff; }
        .gl-row:hover { background: #1a2540 !important; }
      `}</style>

      {/* Back Button */}
      <button
        onClick={() => navigate("/players")}
        style={{ background: "none", border: "none", color: "#5a6a8a", cursor: "pointer", fontSize: 14, fontFamily: "'Barlow', sans-serif", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}
      >
        ← BACK TO SEARCH
      </button>

      {/* Hero Section */}
      <div style={{ display: "flex", gap: 32, marginBottom: 40, background: "linear-gradient(135deg, #0d1529 0%, #111827 100%)", borderRadius: 20, overflow: "hidden", border: "1px solid #1e2a4a" }}>
        {/* Player Image */}
        <div style={{ position: "relative", width: 240, minHeight: 280, background: "linear-gradient(to bottom, #1a2744, #0a0e1a)", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: BLUE }} />
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${id}.png`}
            alt={playerName}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div style={{ display: "none", alignItems: "center", justifyContent: "center", height: 280, fontSize: 72, color: "rgba(255,255,255,0.06)", fontWeight: 900 }}>
            {playerName.split(" ").map((w) => w[0]).join("")}
          </div>
        </div>

        {/* Player Info */}
        <div style={{ padding: "28px 28px 28px 0", flex: 1 }}>
          <div style={{ fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 3, marginBottom: 6 }}>
            {info?.TEAM_CITY} {info?.TEAM_NAME} · {info?.POSITION}
          </div>
          <div style={{ fontSize: 48, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 4 }}>
            {playerName.split(" ").slice(-1)[0]}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: GOLD, textTransform: "uppercase", marginBottom: 20 }}>
            {playerName.split(" ").slice(0, -1).join(" ")}
          </div>

          {/* Bio Row */}
          <div style={{ display: "flex", gap: 24, marginBottom: 24, fontFamily: "'Barlow', sans-serif" }}>
            {[
              { label: "HEIGHT", val: info?.HEIGHT },
              { label: "WEIGHT", val: info?.WEIGHT ? info.WEIGHT + " lbs" : null },
              { label: "AGE", val: info?.PERSON_ID ? new Date().getFullYear() - new Date(info?.BIRTHDATE).getFullYear() : null },
              { label: "DRAFT", val: info?.DRAFT_YEAR ? `${info.DRAFT_YEAR} R${info.DRAFT_ROUND} #${info.DRAFT_NUMBER}` : "Undrafted" },
              { label: "COLLEGE", val: info?.SCHOOL || "—" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ fontSize: 10, color: "#3a4a6a", fontWeight: 600, letterSpacing: 1.5, marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 15, color: "#fff", fontWeight: 600 }}>{item.val || "—"}</div>
              </div>
            ))}
          </div>

          {/* Latest Season Stats */}
          {latestSeason && (
            <div>
              <div style={{ fontSize: 11, color: "#3a4a6a", fontWeight: 600, letterSpacing: 2, marginBottom: 10 }}>
                {latestSeason.SEASON_ID} SEASON AVG
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { label: "PTS", val: latestSeason.PTS },
                  { label: "REB", val: latestSeason.REB },
                  { label: "AST", val: latestSeason.AST },
                  { label: "STL", val: latestSeason.STL },
                  { label: "BLK", val: latestSeason.BLK },
                  { label: "FG%", val: latestSeason.FG_PCT ? (parseFloat(latestSeason.FG_PCT) * 100).toFixed(1) + "%" : null },
                ].map((s) => (
                  <div key={s.label} className="stat-card">
                    <div style={{ fontSize: 28, fontWeight: 900, color: s.label === "PTS" ? GOLD : "#fff", textShadow: s.label === "PTS" ? `0 0 20px rgba(200,169,110,0.5)` : "none" }}>
                      {s.val ?? "—"}
                    </div>
                    <div style={{ fontSize: 10, color: "#5a6a8a", fontWeight: 600, letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[["career", "CAREER STATS"], ["gamelog", "GAME LOG"]].map(([key, label]) => (
          <button
            key={key}
            className="tab-btn"
            onClick={() => setActiveTab(key)}
            style={{ background: activeTab === key ? BLUE : "#0d1529", color: activeTab === key ? "#fff" : "#5a6a8a", border: `1px solid ${activeTab === key ? BLUE : "#1e2a4a"}` }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Career Stats Table */}
      {activeTab === "career" && careerStats && (
        <div style={{ background: DARK, border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: BLUE }}>
                {["SEASON", "TEAM", "GP", "PTS", "REB", "AST", "STL", "BLK", "FG%", "3P%", "FT%"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: h === "SEASON" || h === "TEAM" ? "left" : "center", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {careerStats.map((row, i) => (
                <tr
                  key={i}
                  className="career-row"
                  style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a", cursor: "pointer" }}
                  onClick={() => { setSelectedSeason(row.SEASON_ID); setActiveTab("gamelog"); }}
                >
                  <td style={{ padding: "10px 14px", color: GOLD, fontWeight: 700 }}>{row.SEASON_ID}</td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 600 }}>{row.TEAM_ABBREVIATION}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.GP}</td>
                  <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700, textAlign: "center" }}>{row.PTS}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.REB}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.AST}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.STL}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.BLK}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.FG_PCT ? (parseFloat(row.FG_PCT) * 100).toFixed(1) + "%" : "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.FG3_PCT ? (parseFloat(row.FG3_PCT) * 100).toFixed(1) + "%" : "—"}</td>
                  <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.FT_PCT ? (parseFloat(row.FT_PCT) * 100).toFixed(1) + "%" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "10px 14px", fontSize: 11, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif" }}>
            💡 Click any row to view that season's game log
          </div>
        </div>
      )}

      {/* Game Log */}
      {activeTab === "gamelog" && (
        <div>
          {/* Season Picker */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {careerStats?.map((row) => (
              <button
                key={row.SEASON_ID}
                className={`season-chip ${selectedSeason === row.SEASON_ID ? "active" : ""}`}
                onClick={() => setSelectedSeason(row.SEASON_ID)}
              >
                {row.SEASON_ID}
              </button>
            ))}
          </div>

          {!gameLog ? (
            <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>LOADING GAME LOG...</p>
          ) : (
            <div style={{ background: DARK, border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: BLUE }}>
                    {["DATE", "MATCHUP", "W/L", "MIN", "PTS", "REB", "AST", "STL", "BLK", "FG%"].map((h) => (
                      <th key={h} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, letterSpacing: 1, textAlign: h === "DATE" || h === "MATCHUP" ? "left" : "center" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gameLog.map((row, i) => (
                    <tr key={i} className="gl-row" style={{ background: i % 2 === 0 ? "#0d1529" : "#0a0e1a" }}>
                      <td style={{ padding: "10px 14px", color: GOLD, fontWeight: 700 }}>{row.GAME_DATE}</td>
                      <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 600 }}>{row.MATCHUP}</td>
                      <td style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: row.WL === "W" ? "#22c55e" : "#ef4444" }}>{row.WL}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.MIN}</td>
                      <td style={{ padding: "10px 14px", color: "#fff", fontWeight: 700, textAlign: "center" }}>{row.PTS}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.REB}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.AST}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.STL}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.BLK}</td>
                      <td style={{ padding: "10px 14px", color: "#ccc", textAlign: "center" }}>{row.FG_PCT ? (parseFloat(row.FG_PCT) * 100).toFixed(1) + "%" : "—"}</td>
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