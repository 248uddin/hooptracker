import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import LiveScores from "./pages/LiveScores";
import Players from "./pages/Players";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import PlayerProfile from "./pages/PlayerProfile";

function Navbar() {
  const location = useLocation();
  const links = [
    { to: "/", label: "Live Scores" },
    { to: "/players", label: "Players" },
    { to: "/teams", label: "Teams" },
    { to: "/standings", label: "Standings" },
  ];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(8,8,12,0.98)", borderBottom: "2px solid #c8a96e",
      padding: "0 24px", height: 52, display: "flex", alignItems: "center", gap: 0,
      backdropFilter: "blur(12px)",
    }}>
      <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", letterSpacing: 3, textTransform: "uppercase", marginRight: 32 }}>
        Hoop<span style={{ color: "#c8a96e" }}>Track</span>
      </div>
      {links.map((l) => (
        <Link key={l.to} to={l.to} style={{
          fontSize: 11, fontWeight: 700, color: location.pathname === l.to ? "#c8a96e" : "rgba(255,255,255,0.35)",
          letterSpacing: 2.5, textTransform: "uppercase", padding: "0 16px",
          height: 52, display: "flex", alignItems: "center", textDecoration: "none",
          borderBottom: location.pathname === l.to ? "3px solid #c8a96e" : "3px solid transparent",
          marginBottom: -2, transition: "all .15s",
        }}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", background: "#0c0c0f" }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<LiveScores />} />
          <Route path="/players" element={<Players />} />
          <Route path="/players/:id" element={<PlayerProfile />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/standings" element={<Standings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}