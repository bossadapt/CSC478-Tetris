import sqlite3
from typing import Annotated
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.concurrency import asynccontextmanager
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import hashlib
import hmac
import os

app = FastAPI()
SECRET = ""


class GetLeaderboardRequest(BaseModel):
    limit: int = Field(100, gt=0, le=100)
    offset: int = Field(0, ge=0)


class PostLeaderboardRequest(BaseModel):
    name: str
    level: int
    lines: int
    score: int
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
    load_dotenv("./../../.env")
    SECRET = os.getenv("SECRET_SALT")
    if not SECRET:
        raise RuntimeError("SECRET_SALT missing")
    con, curs = getConCur()
    try:
        curs.execute(
            "CREATE TABLE IF NOT EXISTS leaderboard ( name TEXT, level INTEGER, lines INTEGER, score INTEGER )"
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
    return results


@app.post("/leaderboard")
async def addToLeaderboard(
    request: PostLeaderboardRequest,
):
    basicTamperCheck(request)
    con, curs = getConCur()
    try:
        curs.execute(
            "INSERT INTO leaderboard (name, level, lines, score) VALUES (?,?,?,?)",
            (request.name, request.level, request.lines, request.score),
        )
        con.commit()
    finally:
        curs.close()
        con.close()
    return
