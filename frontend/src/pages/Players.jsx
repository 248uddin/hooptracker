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
    try {
      const res = await searchPlayers(query);
      setResults(res.data);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .player-card {
          width: 220px; border-radius: 16px; overflow: hidden; cursor: pointer;
          background: #0a0e1a; border: 1px solid #1e2a4a;
          transition: transform .2s, box-shadow .2s;
        }
        .player-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 0 32px rgba(29,66,138,0.7);
        }
        .card-header {
          position: relative; height: 180px; overflow: hidden;
          background: linear-gradient(135deg, #0d1529 0%, #1a2744 50%, #0d1529 100%);
        }
        .card-img {
          width: 100%; height: 100%; object-fit: cover; object-position: top center;
          filter: contrast(1.1) saturate(1.2);
        }
        .card-overlay {
          position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
          background: linear-gradient(to top, #0a0e1a 0%, transparent 100%);
        }
        .card-pos-badge {
          position: absolute; top: 10px; left: 10px;
          background: #1d428a; color: #fff;
          font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;
          letter-spacing: 1px;
        }
        .stat-val { font-size: 24px; font-weight: 900; color: #fff; line-height: 1; }
        .stat-val.gold { color: #c8a96e; text-shadow: 0 0 16px rgba(200,169,110,0.5); }
        .stat-label { font-size: 10px; color: #5a6a8a; font-weight: 600; letter-spacing: 1px; margin-top: 2px; font-family: 'Barlow', sans-serif; }
      `}</style>

      <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 1, marginBottom: 24, textTransform: "uppercase" }}>
        Player Search
      </h1>

      {/* Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="SEARCH PLAYER..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          style={{
            flex: 1, background: "#0a0e1a", border: "1px solid #1e2a4a",
            color: "#fff", padding: "12px 16px", borderRadius: 8,
            fontSize: 15, outline: "none", fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: 1,
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            background: "#1d428a", color: "#fff", border: "none",
            padding: "12px 28px", borderRadius: 8, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16, letterSpacing: 1,
          }}
        >
          SEARCH
        </button>
      </div>

      {/* Loading */}
      {loading && <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>SEARCHING...</p>}

      {/* No Results */}
      {searched && !loading && results.length === 0 && (
        <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>NO PLAYERS FOUND</p>
      )}

      {/* Cards Grid */}
      {results.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: "#3a4a6a", fontWeight: 600, letterSpacing: 2, marginBottom: 16, fontFamily: "'Barlow', sans-serif" }}>
            {results.length} RESULT{results.length > 1 ? "S" : ""}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {results.slice(0, 12).map((p) => (
              <div key={p.id} className="player-card" onClick={() => navigate(`/players/${p.id}?name=${encodeURIComponent(p.full_name)}`)}>
                <div className="card-header">
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#1d428a" }} />
                  <div style={{ position: "absolute", top: 10, right: 12, fontSize: 42, fontWeight: 900, color: "rgba(255,255,255,0.06)", lineHeight: 1 }}>
                    {p.id % 99 + 1}
                  </div>
                  <div className="card-pos-badge">NBA</div>
                  <img
                    className="card-img"
                    src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${p.id}.png`}
                    alt={p.full_name}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div style={{
                    display: "none", alignItems: "center", justifyContent: "center",
                    height: "100%", fontSize: 52, color: "rgba(255,255,255,0.08)", fontWeight: 900,
                  }}>
                    {p.full_name.split(" ").map((w) => w[0]).join("")}
                  </div>
                  <div className="card-overlay" />
                </div>

                <div style={{ padding: "10px 14px 14px" }}>
                  <div style={{ fontSize: 11, color: "#c8a96e", fontWeight: 700, letterSpacing: 2, marginBottom: 2, fontFamily: "'Barlow', sans-serif" }}>
                    {p.is_active ? "● ACTIVE" : "● RETIRED"}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 10 }}>
                    {p.full_name}
                  </div>
                  <div style={{ height: 1, background: "linear-gradient(to right, #1e2a4a, transparent)", marginBottom: 10 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#3a4a6a", fontWeight: 600, fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>
                      VIEW PROFILE →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}