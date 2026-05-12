from fastapi import APIRouter, HTTPException
import httpx
import os
from datetime import date
import cache

router = APIRouter()

BDLAPI = "https://api.balldontlie.io/v1"

def get_headers():
    return {"Authorization": os.getenv("BALLDONTLIE_API_KEY", "")}

@router.get("/live")
async def get_live_scores():
    key = "live_scores"
    cached = cache.get(key)
    if cached:
        return cached
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(
                f"{BDLAPI}/games",
                headers=get_headers(),
                params={"dates[]": date.today().isoformat()}
            )
            data = res.json()
            cache.set(key, data, ttl=30)
            return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{game_id}/boxscore")
async def get_boxscore(game_id: str):
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.get(
                f"{BDLAPI}/box_scores/live",
                headers=get_headers(),
                params={"game_ids[]": game_id}
            )
            return res.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))