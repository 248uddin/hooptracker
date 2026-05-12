import { useEffect, useState } from "react";
import { getLiveScores, getNews, getInjuries } from "../api/nbaApi";

const S = {
  wrap: { padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 },
  arenaGlow: { position: "fixed", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse at 50% 0%,rgba(29,66,138,0.18) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 },
  secLabel: { fontSize: 10, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 10 },
  secLabelLine: { flex: 1, height: 1, background: "linear-gradient(to right,rgba(200,169,110,0.3),transparent)" },
};

const TEAM_IDS = {
  ATL:1610612737,BOS:1610612738,BKN:1610612751,CHA:1610612766,CHI:1610612741,
  CLE:1610612739,DAL:1610612742,DEN:1610612743,DET:1610612765,GSW:1610612744,
  HOU:1610612745,IND:1610612754,LAC:1610612746,LAL:1610612747,MEM:1610612763,
  MIA:1610612748,MIL:1610612749,MIN:1610612750,NOP:1610612740,NYK:1610612752,
  OKC:1610612760,ORL:1610612753,PHI:1610612755,PHX:1610612756,POR:1610612757,
  SAC:1610612758,SAS:1610612759,TOR:1610612761,UTA:1610612762,WAS:1610612764,
};
const COLORS = {
  ATL:"#C1071E",BOS:"#007A33",BKN:"#000",CHA:"#1D1160",CHI:"#CE1141",CLE:"#860038",
  DAL:"#00538C",DEN:"#0E2240",DET:"#C8102E",GSW:"#1D428A",HOU:"#CE1141",IND:"#002D62",
  LAC:"#C8102E",LAL:"#552583",MEM:"#5D76A9",MIA:"#98002E",MIL:"#00471B",MIN:"#0C2340",
  NOP:"#0C2340",NYK:"#006BB6",OKC:"#007AC1",ORL:"#0077C0",PHI:"#006BB6",PHX:"#1D1160",
  POR:"#E03A3E",SAC:"#5A2D81",SAS:"#333",TOR:"#CE1141",UTA:"#002B5C",WAS:"#002B5C",
};

function Logo({ tricode, size = 44 }) {
  const [err, setErr] = useState(false);
  const id = TEAM_IDS[tricode];
  return err || !id ? (
    <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS[tricode] || "#1d428a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.27, fontWeight: 900, color: "#fff", flexShrink: 0 }}>{tricode}</div>
  ) : (
    <img src={`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`} width={size} height={size} style={{ objectFit: "contain", flexShrink: 0 }} onError={() => setErr(true)} />
  );
}

function NewsCard({ item, type }) {
  return (
    <a href={item.link} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none", background: "rgba(13,20,40,0.7)", border: "1px solid rgba(255,255,255,0.06)", borderLeft: `3px solid ${type === "injuries" ? "#ef4444" : "#1d428a"}`, borderRadius: 8, padding: "11px 14px", transition: "all .2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderLeftColor = type === "injuries" ? "#ef4444" : "#1d428a"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: "2px 7px", borderRadius: 3, background: type === "injuries" ? "rgba(239,68,68,0.15)" : "rgba(29,66,138,0.3)", color: type === "injuries" ? "#f87171" : "#60a5fa", textTransform: "uppercase" }}>
          {type === "injuries" ? "INJURY" : "NEWS"}
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'Barlow',sans-serif" }}>{item.pubDate ? new Date(item.pubDate).toLocaleDateString() : ""}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.35, marginBottom: 3 }}>{item.title}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Barlow',sans-serif", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.description?.replace(/<[^>]+>/g, "")}</div>
    </a>
  );
}

function parseScoreboard(data) {
  const resultSets = data?.resultSets || [];
  const gameHeader = resultSets.find(rs => rs.name === "GameHeader");
  const lineScore = resultSets.find(rs => rs.name === "LineScore");
  if (!gameHeader || !lineScore) return [];
  const ghRows = gameHeader.rowSet.map(row =>
    Object.fromEntries(gameHeader.headers.map((h, i) => [h, row[i]]))
  );
  const lsRows = lineScore.rowSet.map(row =>
    Object.fromEntries(lineScore.headers.map((h, i) => [h, row[i]]))
  );
  return ghRows.map(game => {
    const teams = lsRows.filter(r => r.GAME_ID === game.GAME_ID);
    const away = teams[0];
    const home = teams[1];
    return {
      gameId: game.GAME_ID,
      gameStatusText: game.GAME_STATUS_TEXT,
      arena: { arenaName: game.ARENA_NAME },
      awayTeam: { teamId: away?.TEAM_ID, teamTricode: away?.TEAM_ABBREVIATION, score: away?.PTS },
      homeTeam: { teamId: home?.TEAM_ID, teamTricode: home?.TEAM_ABBREVIATION, score: home?.PTS },
    };
  });
}

export default function LiveScores() {
  const [games, setGames] = useState([]);
  const [news, setNews] = useState([]);
  const [injuries, setInjuries] = useState([]);
  const [tab, setTab] = useState("news");
  const [gLoading, setGLoading] = useState(true);
  const [nLoading, setNLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [featIdx, setFeatIdx] = useState(0);

  const fetchScores = () => {
    getLiveScores()
      .then(r => {
        const parsed = parseScoreboard(r.data);
        setGames(parsed);
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setGLoading(false));
  };

  const fetchNews = () => {
    setNLoading(true);
    Promise.all([getNews(), getInjuries()])
      .then(([n]) => {
        const all = n.data || [];
        const kw = ["injur","strain","sprain","out","day-to-day","sidelined","surgery","knee","ankle","hamstring","ruled out"];
        setNews(all);
        setInjuries(all.filter(i => kw.some(k => i.title?.toLowerCase().includes(k) || i.description?.toLowerCase().includes(k))));
      })
      .catch(() => {})
      .finally(() => setNLoading(false));
  };

  useEffect(() => {
    fetchScores();
    fetchNews();
    const si = setInterval(fetchScores, 30000);
    const ni = setInterval(fetchNews, 300000);
    return () => { clearInterval(si); clearInterval(ni); };
  }, []);

  useEffect(() => {
    if (games.length > 1) {
      const t = setInterval(() => setFeatIdx(i => (i + 1) % games.length), 8000);
      return () => clearInterval(t);
    }
  }, [games]);

  const feat = games[featIdx];
  const feedItems = tab === "news" ? news : injuries;

  return (
    <div style={S.wrap}>
      <div style={S.arenaGlow} />

      {/* Featured Game Banner */}
      {gLoading ? (
        <div style={{ height: 170, background: "rgba(13,20,40,0.7)", borderRadius: 10, border: "1px solid rgba(200,169,110,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", letterSpacing: 3, fontSize: 12 }}>LOADING GAMES...</div>
      ) : feat ? (
        <div style={{ position: "relative", height: 170, background: "linear-gradient(105deg,#0d1628 0%,#152035 50%,#0d1628 100%)", borderRadius: 10, border: "1px solid rgba(200,169,110,0.25)", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(to right,#c8a96e,#f0d080,#c8a96e)" }} />
          <div style={{ position: "absolute", top: 10, left: 14, fontSize: 9, fontWeight: 700, color: "#c8a96e", letterSpacing: 3, textTransform: "uppercase" }}>Featured Game</div>
          {feat.gameStatusText?.includes("Q") || feat.gameStatusText?.includes("Half") ? (
            <div style={{ position: "absolute", top: 10, right: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", letterSpacing: 2 }}>LIVE</span>
            </div>
          ) : null}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase" }}>{feat.gameStatusText}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <Logo tricode={feat.awayTeam?.teamTricode} size={48} />
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{feat.awayTeam?.teamTricode}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: feat.awayTeam?.score > feat.homeTeam?.score ? "#fff" : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{feat.awayTeam?.score ?? "—"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>—</div>
                <div style={{ fontSize: 48, fontWeight: 900, color: feat.homeTeam?.score > feat.awayTeam?.score ? "#fff" : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{feat.homeTeam?.score ?? "—"}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <Logo tricode={feat.homeTeam?.teamTricode} size={48} />
                <div style={{ fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{feat.homeTeam?.teamTricode}</div>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1, fontFamily: "'Barlow',sans-serif" }}>{feat.arena?.arenaName}</div>
          </div>
          {games.length > 1 && (
            <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {games.map((_, i) => <div key={i} onClick={() => setFeatIdx(i)} style={{ width: i === featIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === featIdx ? "#c8a96e" : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all .3s" }} />)}
            </div>
          )}
        </div>
      ) : (
        <div style={{ height: 170, background: "rgba(13,20,40,0.7)", borderRadius: 10, border: "1px solid rgba(200,169,110,0.15)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 36 }}>🏀</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>NO GAMES TODAY</div>
        </div>
      )}

      {/* All Games Grid */}
      {games.length > 0 && (
        <>
          <div style={S.secLabel}>ALL GAMES <div style={S.secLabelLine} />
            {lastUpdated && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: 1, fontFamily: "'Barlow',sans-serif" }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10 }}>
            {games.map((g, i) => {
              const isLive = g.gameStatusText?.includes("Q") || g.gameStatusText?.includes("Half");
              const awayWin = g.awayTeam?.score > g.homeTeam?.score;
              const homeWin = g.homeTeam?.score > g.awayTeam?.score;
              return (
                <div key={g.gameId} onClick={() => setFeatIdx(i)}
                  style={{ background: "rgba(13,20,40,0.8)", border: `1px solid ${isLive ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.4)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isLive ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}>
                  <div style={{ textAlign: "center", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    {isLive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />}
                    <span style={{ fontSize: 10, fontWeight: 700, color: isLive ? "#22c55e" : "#c8a96e", letterSpacing: 2 }}>{g.gameStatusText}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <Logo tricode={g.awayTeam?.teamTricode} size={40} />
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{g.awayTeam?.teamTricode}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: awayWin ? "#fff" : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{g.awayTeam?.score ?? "—"}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontWeight: 700 }}>VS</div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <Logo tricode={g.homeTeam?.teamTricode} size={40} />
                      <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: 1 }}>{g.homeTeam?.teamTricode}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: homeWin ? "#fff" : "rgba(255,255,255,0.3)", lineHeight: 1 }}>{g.homeTeam?.score ?? "—"}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.15)", fontFamily: "'Barlow',sans-serif" }}>{g.arena?.arenaName}</div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* News */}
      <div style={S.secLabel}>NBA UPDATES <div style={S.secLabelLine} /></div>
      <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
        {[["news", "📰 NEWS"], ["injuries", "🚑 INJURIES"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "7px 16px", borderRadius: 6, border: `1px solid ${tab === k ? "#1d428a" : "rgba(255,255,255,0.08)"}`, background: tab === k ? "#1d428a" : "transparent", color: tab === k ? "#fff" : "rgba(255,255,255,0.3)", cursor: "pointer" }}>{l}</button>
        ))}
      </div>
      {nLoading ? (
        <div style={{ color: "rgba(255,255,255,0.3)", letterSpacing: 2, fontSize: 11 }}>LOADING...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 8 }}>
          {feedItems.map((item, i) => <NewsCard key={i} item={item} type={tab} />)}
        </div>
      )}
    </div>
  );
}