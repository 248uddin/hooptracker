from fastapi import APIRouter, HTTPException, Query
from services import nba_service

router = APIRouter()


@router.get("/search", summary="Search players by name")
def search_players(name: str = Query(..., min_length=2)):
    results = nba_service.search_players(name)
    if not results:
        raise HTTPException(status_code=404, detail=f"No players found matching '{name}'")
    return results


@router.get("/leaders", summary="Get league leaders by stat category")
def get_league_leaders(
    season: str = Query("2024-25"),
    stat: str = Query("PTS"),
):
    try:
        return nba_service.get_league_leaders(season=season, stat_category=stat)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{player_id}", summary="Get player bio and info")
def get_player_info(player_id: int):
    try:
        return nba_service.get_player_info(player_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Player {player_id} not found")


@router.get("/{player_id}/career", summary="Get full career stats")
def get_career_stats(player_id: int):
    try:
        return nba_service.get_player_career_stats(player_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{player_id}/gamelog", summary="Get game log for a season")
def get_game_log(
    player_id: int,
    season: str = Query("2024-25"),
):
    try:
        return nba_service.get_player_game_log(player_id, season)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))