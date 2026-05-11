import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import games, players, teams, standings, news

load_dotenv()

app = FastAPI(
    title="NBA App API",
    description="Live scores, player stats, team data, and standings powered by nba_api",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://hooptracker-fawn.vercel.app",  # replace with your actual Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(games.router,     prefix="/games",     tags=["Games"])
app.include_router(players.router,   prefix="/players",   tags=["Players"])
app.include_router(teams.router,     prefix="/teams",     tags=["Teams"])
app.include_router(standings.router, prefix="/standings", tags=["Standings"])
app.include_router(news.router, prefix="/news", tags=["News"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "NBA API is running 🏀"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}