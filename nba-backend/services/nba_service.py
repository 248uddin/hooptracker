import os
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
import cache

load_dotenv()
TTL = int(os.getenv("CACHE_TTL_SECONDS", 30))


def get_live_scoreboard() -> dict:
    key = "live_scoreboard"
    cached = cache.get(key)
    if cached:
        return cached
    data = scoreboard.ScoreBoard().get_dict()
    cache.set(key, data, ttl=TTL)
    return data


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