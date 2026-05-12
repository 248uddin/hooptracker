import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import cache

from dotenv import load_dotenv
from nba_api.live.nba.endpoints import scoreboard, boxscore
from nba_api.stats.endpoints import (
    playercareerstats,
    commonplayerinfo,
    leaguestandings,
    playergamelog,
    leagueleaders,
    teamgamelog,
    commonteamroster,
)
from nba_api.stats.static import players, teams

from nba_api.library.http import NBAStatsHTTP

NBAStatsHTTP.HEADERS = {
    "Host": "stats.nba.com",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "x-nba-stats-origin": "stats",
    "x-nba-stats-token": "true",
    "Origin": "https://www.nba.com",
    "Referer": "https://www.nba.com/",
    "Connection": "keep-alive",
}

load_dotenv()
TTL = int(os.getenv("CACHE_TTL_SECONDS", 30))


def get_live_scoreboard() -> dict:
    key = "live_scoreboard"
    cached = cache.get(key)
    if cached:
        return cached
    try:
        from nba_api.stats.endpoints import scoreboardv2
        from datetime import date
        data = scoreboardv2.ScoreboardV2(
            game_date=date.today().strftime("%m/%d/%Y"),
            league_id="00",
            day_offset=0
        ).get_dict()
        cache.set(key, data, ttl=TTL)
        return data
    except Exception as e:
        return {"scoreboard": {"games": []}, "error": str(e)}


def get_game_boxscore(game_id: str) -> dict:
    key = f"boxscore_{game_id}"
    cached = cache.get(key)
    if cached:
        return cached
    data = boxscore.BoxScore(game_id=game_id).get_dict()
    cache.set(key, data, ttl=TTL)
    return data


def search_players(name: str) -> list[dict]:
    return players.find_players_by_full_name(name)


def get_player_info(player_id: int) -> dict:
    key = f"player_info_{player_id}"
    cached = cache.get(key)
    if cached:
        return cached
    data = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_dict()
    cache.set(key, data, ttl=3600)
    return data


def get_player_career_stats(player_id: int) -> dict:
    key = f"career_{player_id}"
    cached = cache.get(key)
    if cached:
        return cached
    data = playercareerstats.PlayerCareerStats(
        player_id=player_id,
        per_mode36="PerGame"
    ).get_dict()
    cache.set(key, data, ttl=3600)
    return data


def get_player_game_log(player_id: int, season: str) -> dict:
    key = f"gamelog_{player_id}_{season}"
    cached = cache.get(key)
    if cached:
        return cached
    data = playergamelog.PlayerGameLog(player_id=player_id, season=season).get_dict()
    cache.set(key, data, ttl=300)
    return data


def get_league_leaders(season: str, stat_category: str = "PTS") -> dict:
    key = f"leaders_{season}_{stat_category}"
    cached = cache.get(key)
    if cached:
        return cached
    data = leagueleaders.LeagueLeaders(
        season=season, stat_category_abbreviation=stat_category
    ).get_dict()
    cache.set(key, data, ttl=3600)
    return data


def get_all_teams() -> list[dict]:
    return teams.get_teams()


def search_teams(name: str) -> list[dict]:
    return teams.find_teams_by_full_name(name)


def get_team_roster(team_id: int, season: str) -> dict:
    key = f"roster_{team_id}_{season}"
    cached = cache.get(key)
    if cached:
        return cached
    data = commonteamroster.CommonTeamRoster(team_id=team_id, season=season).get_dict()
    cache.set(key, data, ttl=3600)
    return data


def get_team_game_log(team_id: int, season: str) -> dict:
    key = f"team_gamelog_{team_id}_{season}"
    cached = cache.get(key)
    if cached:
        return cached
    data = teamgamelog.TeamGameLog(team_id=team_id, season=season).get_dict()
    cache.set(key, data, ttl=300)
    return data


def get_standings(season: str) -> dict:
    key = f"standings_{season}"
    cached = cache.get(key)
    if cached:
        return cached
    data = leaguestandings.LeagueStandings(season=season).get_dict()
    cache.set(key, data, ttl=3600)
    return data