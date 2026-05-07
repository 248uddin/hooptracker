import { useEffect, useState } from "react";
import { getLiveScores, getNews, getInjuries } from "../api/nbaApi";

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

function NewsCard({ item, type }) {
  const colors = { news: "#1d428a", injuries: "#ef4444", transactions: "#c8a96e" };
  const labels = { news: "NEWS", injuries: "INJURY", transactions: "TRANSACTION" };
  
  return (
    <a // <-- MISSING TAG ADDED HERE
      href={item.link}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block", background: "#0a0e1a", border: "1px solid #1e2a4a",
        borderRadius: 12, padding: "14px 16px", textDecoration: "none",
        transition: "all .2s", cursor: "pointer",
      }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = colors[type]}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1e2a4a"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: "2px 8px",
          borderRadius: 4, background: colors[type] + "22", color: colors[type],
          fontFamily: "'Barlow Condensed', sans-serif",
        }}>
          {labels[type]}
        </span>
        <span style={{ fontSize: 10, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif" }}>
          {item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ""}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4, marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
        {item.title}
      </div>
      <div style={{ fontSize: 12, color: "#5a6a8a", lineHeight: 1.5, fontFamily: "'Barlow', sans-serif",
        overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      }}>
        {item.description?.replace(/<[^>]+>/g, "")}
      </div>
    </a>
  );
}

export default function LiveScores() {
  const [games, setGames] = useState([]);
  const [news, setNews] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [activeTab, setActiveTab] = useState("news");
  const [gamesLoading, setGamesLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchScores = () => {
    getLiveScores()
      .then((res) => {
        setGames(res.data?.scoreboard?.games || []);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setGamesLoading(false));
  };

  const fetchNews = () => {
    setNewsLoading(true);
    Promise.all([getNews(), getInjuries()])
      .then(([newsRes, injuriesRes]) => {
        setNews(newsRes.data || []);
        setInjuries(injuriesRes.data || []);
      })
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  };

  useEffect(() => {
    fetchScores();
    fetchNews();
    // Auto-refresh scores every 30 seconds
    const scoresInterval = setInterval(fetchScores, 30000);
    // Auto-refresh news every 5 minutes
    const newsInterval = setInterval(fetchNews, 300000);
    return () => {
      clearInterval(scoresInterval);
      clearInterval(newsInterval);
    };
  }, []);

  const feedItems = activeTab === "news" ? news : injuries;

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@400;500;600&display=swap');
        .chip { border: none; cursor: pointer; font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 1.5px; border-radius: 8px; transition: all .15s; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
          Today's Games
        </h1>
        {lastUpdated && (
          <div style={{ fontSize: 11, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>
            UPDATED {lastUpdated.toLocaleTimeString()} · AUTO-REFRESHES EVERY 30S
          </div>
        )}
      </div>

      {/* Scores */}
      {gamesLoading ? (
        <p style={{ color: "#5a6a8a", letterSpacing: 2, marginBottom: 32 }}>LOADING SCORES...</p>
      ) : games.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", marginBottom: 32, background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏀</div>
          <div style={{ fontSize: 16, color: "#9ca3af", fontWeight: 600 }}>No games today</div>
          <div style={{ fontSize: 12, color: "#3a4a6a", marginTop: 4, fontFamily: "'Barlow', sans-serif" }}>Check back on a game day!</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 40 }}>
          {games.map((game) => {
            const home = game.homeTeam;
            const away = game.awayTeam;
            const homeColor = TEAM_COLORS[home.teamTricode] || "#1d428a";
            const awayColor = TEAM_COLORS[away.teamTricode] || "#1d428a";
            const homeWinning = home.score > away.score;
            const awayWinning = away.score > home.score;
            const isLive = game.gameStatusText?.includes("Q") || game.gameStatusText?.includes("Half");

            return (
              <div key={game.gameId} style={{ background: "#0a0e1a", border: `1px solid ${isLive ? "#22c55e44" : "#1e2a4a"}`, borderRadius: 16, overflow: "hidden" }}>
                <div style={{ height: 4, background: `linear-gradient(to right, ${awayColor} 50%, ${homeColor} 50%)` }} />
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 2,
                      color: isLive ? "#22c55e" : "#c8a96e",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {isLive && <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#22c55e", marginRight: 6, boxShadow: "0 0 6px #22c55e" }} />}
                      {game.gameStatusText}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <TeamLogo teamId={away.teamId} tricode={away.teamTricode} size={52} />
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>{away.teamTricode}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: awayWinning ? "#fff" : "#5a6a8a", textShadow: awayWinning ? `0 0 20px ${awayColor}88` : "none", fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {away.score ?? "—"}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#3a4a6a", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>VS</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <TeamLogo teamId={home.teamId} tricode={home.teamTricode} size={52} />
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>{home.teamTricode}</div>
                      <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1, color: homeWinning ? "#fff" : "#5a6a8a", textShadow: homeWinning ? `0 0 20px ${homeColor}88` : "none", fontFamily: "'Barlow Condensed', sans-serif" }}>
                        {home.score ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>
                    {game.arena?.arenaName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* News Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
            NBA Updates
          </h2>
        </div>

        {/* News Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["news", "📰 NEWS"], ["injuries", "🚑 INJURIES"]].map(([key, label]) => (
            <button
              key={key}
              className="chip"
              onClick={() => setActiveTab(key)}
              style={{
                padding: "10px 20px", fontSize: 14,
                background: activeTab === key ? "#1d428a" : "#0a0e1a",
                color: activeTab === key ? "#fff" : "#5a6a8a",
                border: `1px solid ${activeTab === key ? "#1d428a" : "#1e2a4a"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {newsLoading ? (
          <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>LOADING UPDATES...</p>
        ) : feedItems.length === 0 ? (
          <p style={{ color: "#5a6a8a", letterSpacing: 2 }}>NO UPDATES AVAILABLE</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
            {feedItems.map((item, i) => (
              <NewsCard key={i} item={item} type={activeTab} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}