from fastapi import APIRouter, HTTPException, Query
from services import nba_service

router = APIRouter()


@router.get("/", summary="Get all NBA teams")
def get_all_teams():
    return nba_service.get_all_teams()


@router.get("/search", summary="Search teams by name")
def search_teams(name: str = Query(..., min_length=2)):
    results = nba_service.search_teams(name)
    if not results:
        raise HTTPException(status_code=404, detail=f"No teams found matching '{name}'")
    return results


@router.get("/{team_id}/roster", summary="Get team roster")
def get_roster(
    team_id: int,
    season: str = Query("2024-25"),
):
    try:
        return nba_service.get_team_roster(team_id, season)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{team_id}/gamelog", summary="Get team game log")
def get_team_game_log(
    team_id: int,
    season: str = Query("2024-25"),
):
    try:
        return nba_service.get_team_game_log(team_id, season)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))