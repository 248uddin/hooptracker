import { useEffect, useState } from "react";
import { getLiveScores } from "../api/nbaApi";

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

export default function LiveScores() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLiveScores()
      .then((res) => {
        const gameData = res.data?.scoreboard?.games || [];
        setGames(gameData);
      })
      .catch(() => setError("Could not load live scores."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 tracking-widest">LOADING SCORES...</p>;
  if (error) return <p className="text-red-400">{error}</p>;
  if (games.length === 0)
    return (
      <div className="text-center mt-20">
        <p className="text-4xl mb-4">🏀</p>
        <p className="text-xl text-gray-300 font-semibold">No games today</p>
        <p className="text-gray-500 mt-2">Check back on a game day!</p>
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">Today's Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => {
          const home = game.homeTeam;
          const away = game.awayTeam;
          const homeColor = TEAM_COLORS[home.teamTricode] || "#1d428a";
          const awayColor = TEAM_COLORS[away.teamTricode] || "#1d428a";
          const homeWinning = home.score > away.score;
          const awayWinning = away.score > home.score;

          return (
            <div
              key={game.gameId}
              style={{ background: "#0a0e1a", border: "1px solid #1e2a4a", borderRadius: 16, overflow: "hidden" }}
            >
              {/* Top color bar split by team colors */}
              <div style={{ height: 4, background: `linear-gradient(to right, ${awayColor} 50%, ${homeColor} 50%)` }} />

              <div style={{ padding: "16px 20px" }}>
                {/* Status */}
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 2,
                    color: game.gameStatusText?.includes("Q") || game.gameStatusText?.includes("Half") ? "#22c55e" : "#c8a96e",
                    fontFamily: "'Barlow Condensed', sans-serif",
                  }}>
                    {game.gameStatusText}
                  </span>
                </div>

                {/* Teams */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  {/* Away Team */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <TeamLogo teamId={away.teamId} tricode={away.teamTricode} size={52} />
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                      {away.teamTricode}
                    </div>
                    <div style={{
                      fontSize: 36, fontWeight: 900, lineHeight: 1,
                      color: awayWinning ? "#fff" : "#5a6a8a",
                      textShadow: awayWinning ? `0 0 20px ${awayColor}88` : "none",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {away.score ?? "—"}
                    </div>
                  </div>

                  {/* VS */}
                  <div style={{ fontSize: 13, color: "#3a4a6a", fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 2 }}>
                    VS
                  </div>

                  {/* Home Team */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <TeamLogo teamId={home.teamId} tricode={home.teamTricode} size={52} />
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
                      {home.teamTricode}
                    </div>
                    <div style={{
                      fontSize: 36, fontWeight: 900, lineHeight: 1,
                      color: homeWinning ? "#fff" : "#5a6a8a",
                      textShadow: homeWinning ? `0 0 20px ${homeColor}88` : "none",
                      fontFamily: "'Barlow Condensed', sans-serif",
                    }}>
                      {home.score ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Arena */}
                <div style={{ textAlign: "center", marginTop: 14, fontSize: 11, color: "#3a4a6a", fontFamily: "'Barlow', sans-serif", letterSpacing: 1 }}>
                  {game.arena?.arenaName}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}