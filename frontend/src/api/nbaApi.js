import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });

export const getLiveScores = () => api.get("/games/live");
export const getBoxscore = (gameId) => api.get(`/games/${gameId}/boxscore`);
export const searchPlayers = (name) => api.get(`/players/search?name=${name}`);
export const getPlayerInfo = (id) => api.get(`/players/${id}`);
export const getCareerStats = (id) => api.get(`/players/${id}/career`);
export const getGameLog = (id, season) => api.get(`/players/${id}/gamelog?season=${season}`);
export const getLeagueLeaders = (season, stat) => api.get(`/players/leaders?season=${season}&stat=${stat}`);
export const getAllTeams = () => api.get("/teams");
export const getTeamRoster = (id, season) => api.get(`/teams/${id}/roster?season=${season}`);
export const getTeamGameLog = (id, season) => api.get(`/teams/${id}/gamelog?season=${season}`);
export const getStandings = (season) => api.get(`/standings?season=${season}`);
export const getNews = () => api.get("/news/news");
export const getInjuries = () => api.get("/news/injuries");
export const getTransactions = () => api.get("/news/transactions");