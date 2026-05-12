from fastapi import APIRouter, HTTPException
from services import nba_service

router = APIRouter()


@router.get("/live")
def get_live_scores():
    try:
        return nba_service.get_live_scoreboard()
    except Exception as e:
        return {"scoreboard": {"games": []}, "error": str(e)}


@router.get("/{game_id}/boxscore", summary="Get full boxscore for a game")
def get_boxscore(game_id: str):
    try:
        return nba_service.get_game_boxscore(game_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))