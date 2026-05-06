from fastapi import APIRouter, HTTPException, Query
from services import nba_service

router = APIRouter()


@router.get("/", summary="Get league standings")
def get_standings(
    season: str = Query("2025-26"),
):
    try:
        return nba_service.get_standings(season)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))