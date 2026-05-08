import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPlayers } from "../api/nbaApi";

export default function Players() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try { const r = await searchPlayers(query); setResults(r.data); setSearched(true); }
    catch { setResults([]); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ padding: "20px 24px", position: "relative" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%,rgba(29,66,138,0.15) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>HOOPTRACK</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24, lineHeight: 1 }}>Player Search</div>

      <div style={{ display: "flex", gap: 10, marginBottom: 32, maxWidth: 600 }}>
        <input type="text" placeholder="SEARCH PLAYER NAME..." value={query}
          onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()}
          style={{ flex: 1, background: "rgba(13,20,40,0.8)", border: "1px solid rgba(200,169,110,0.2)", color: "#fff", padding: "12px 16px", borderRadius: 8, fontSize: 14, fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 700, letterSpacing: 1, outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#c8a96e"} onBlur={e => e.target.style.borderColor = "rgba(200,169,110,0.2)"} />
        <button onClick={handleSearch} style={{ background: "#1d428a", color: "#fff", border: "none", padding: "12px 28px", borderRadius: 8, fontWeight: 900, cursor: "pointer", fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, letterSpacing: 2, textTransform: "uppercase" }}>SEARCH</button>
      </div>

      {loading && <div style={{ color: "#c8a96e", letterSpacing: 3, fontSize: 12 }}>SEARCHING...</div>}
      {searched && !loading && results.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontSize: 12 }}>NO PLAYERS FOUND</div>}

      {results.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 3, marginBottom: 16 }}>{results.length} RESULT{results.length > 1 ? "S" : ""}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {results.slice(0, 12).map(p => (
              <div key={p.id} onClick={() => navigate(`/players/${p.id}?name=${encodeURIComponent(p.full_name)}`)}
                style={{ width: 200, background: "rgba(13,20,40,0.9)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(29,66,138,0.4)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; e.currentTarget.style.borderColor = "rgba(200,169,110,0.15)"; }}>
                <div style={{ position: "relative", height: 170, background: "linear-gradient(135deg,#0d1628,#152240)", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#1d428a" }} />
                  <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, color: "rgba(255,255,255,0.04)", letterSpacing: -2 }}>
                    {p.full_name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <img src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${p.id}.png`} alt={p.full_name}
                    style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    onError={e => e.target.style.display = "none"} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: "linear-gradient(to top,rgba(13,20,40,1),transparent)" }} />
                </div>
                <div style={{ padding: "10px 14px 14px" }}>
                  <div style={{ fontSize: 10, color: p.is_active ? "#22c55e" : "#5a6a8a", fontWeight: 700, letterSpacing: 1.5, marginBottom: 3, fontFamily: "'Barlow',sans-serif" }}>
                    {p.is_active ? "● ACTIVE" : "● RETIRED"}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 8 }}>{p.full_name}</div>
                  <div style={{ height: 1, background: "linear-gradient(to right,rgba(200,169,110,0.3),transparent)", marginBottom: 8 }} />
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>VIEW PROFILE →</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}