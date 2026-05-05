import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import LiveScores from "./pages/LiveScores";
import Players from "./pages/Players";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import PlayerProfile from "./pages/PlayerProfile";

function Navbar() {
  const location = useLocation();
  const links = [
    { to: "/", label: "🏀 Live Scores" },
    { to: "/players", label: "Players" },
    { to: "/teams", label: "Teams" },
    { to: "/standings", label: "Standings" },
  ];

  return (
    <nav className="bg-nbaBlue px-6 py-4 flex items-center gap-8 shadow-lg">
      <span className="text-xl font-bold text-white tracking-wide mr-4">HoopTracker</span>
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className={`text-sm font-semibold transition-colors ${
            location.pathname === l.to
              ? "text-hardwood border-b-2 border-hardwood pb-0.5"
              : "text-white hover:text-hardwood"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-court">
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<LiveScores />} />
            <Route path="/players" element={<Players />} />
            <Route path="/players/:id" element={<PlayerProfile />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/standings" element={<Standings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}