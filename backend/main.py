import sqlite3
from typing import Annotated
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, constr
from dotenv import load_dotenv
import hashlib
import hmac
import os

app = FastAPI()
SECRET = ""

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bossadapt.org",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GetLeaderboardRequest(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)


class PostLeaderboardRequest(BaseModel):
    name: constr(min_length=1, max_length=5, strip_whitespace=True)
    level: int
    lines: int
    score: int = Field(gt=0)
    sec: str


def getConCur(fac: bool = False):
    con = sqlite3.connect("game.db")
    if fac:
        con.row_factory = sqlite3.Row
    return (con, con.cursor())


def basicTamperCheck(entry: PostLeaderboardRequest):
    if not SECRET:
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Server secret not configured",
        )

    message = f"{entry.name}:{entry.level}:{entry.lines}:{entry.score}"
    expected_signature = hmac.new(
        SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, entry.sec):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Tampering Failed!",
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    global SECRET
    load_dotenv("./../frontend/.env")
    SECRET = os.getenv("REACT_APP_LEADERBOARD_SECRET")
    if not SECRET:
        raise RuntimeError("REACT_APP_LEADERBOARD_SECRET missing")
    con, curs = getConCur()
    try:
        curs.execute(
            "CREATE TABLE IF NOT EXISTS leaderboard ( name TEXT, level INTEGER, lines INTEGER, score INTEGER, sec TEXT UNIQUE )"
        )
        existing_columns = {
            row[1] for row in curs.execute("PRAGMA table_info(leaderboard)")
        }
        if "sec" not in existing_columns:
            try:
                curs.execute("ALTER TABLE leaderboard ADD COLUMN sec TEXT")
            except sqlite3.OperationalError:
                pass
        curs.execute(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_sec ON leaderboard (sec)"
        )
        curs.execute("CREATE INDEX IF NOT EXISTS idx_score ON leaderboard (score)")
        con.commit()
    finally:
        curs.close()
        con.close()
    yield


app.router.lifespan_context = lifespan


@app.get("/leaderboard")
async def getLeaderboard(request: Annotated[GetLeaderboardRequest, Query()]):
    results = None
    con, curs = getConCur(True)
    try:
        curs.execute(
            "SELECT * FROM leaderboard ORDER BY score DESC LIMIT ? OFFSET ? ",
            (request.limit, request.offset),
        )
        results = curs.fetchall()
    finally:
        curs.close()
        con.close()
    return [
        {
            "rank": request.offset + idx + 1,
            "name": row["name"],
            "level": row["level"],
            "lines": row["lines"],
            "score": row["score"],
        }
        for idx, row in enumerate(results)
    ]


@app.post("/leaderboard")
async def addToLeaderboard(
    request: PostLeaderboardRequest,
):
    basicTamperCheck(request)
    con, curs = getConCur()
    try:
        curs.execute(
            "INSERT INTO leaderboard (name, level, lines, score, sec) VALUES (?,?,?,?,?)",
            (
                request.name,
                request.level,
                request.lines,
                request.score,
                request.sec,
            ),
        )
        con.commit()
    except sqlite3.IntegrityError as exc:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Score already submitted",
        ) from exc
    finally:
        curs.close()
        con.close()
    return
