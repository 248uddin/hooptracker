import { useEffect, useState } from "react";
import { getLiveScores } from "../api/nbaApi";

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

  if (loading) return <p className="text-gray-400">Loading scores...</p>;
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
      <h1 className="text-2xl font-bold text-white mb-6">Today's Games</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.gameId} className="bg-nbaBlue rounded-xl p-5 shadow-lg">
            <p className="text-xs text-hardwood font-semibold uppercase mb-3">
              {game.gameStatusText}
            </p>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <p className="text-lg font-bold">{game.awayTeam.teamTricode}</p>
                <p className="text-3xl font-bold text-hardwood">{game.awayTeam.score}</p>
              </div>
              <p className="text-gray-400 text-sm font-semibold">VS</p>
              <div className="text-center">
                <p className="text-lg font-bold">{game.homeTeam.teamTricode}</p>
                <p className="text-3xl font-bold text-hardwood">{game.homeTeam.score}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">{game.arena?.arenaName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}