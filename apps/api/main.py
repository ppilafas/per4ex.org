import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="Per4ex API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "https://per4ex.org",
    "https://www.per4ex.org",
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Repo(BaseModel):
    name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stargazers_count: int
    updated_at: str

class RepoResponse(BaseModel):
    user: str
    repos: List[Repo]

# Simple in-memory cache
CACHE_TTL = 3600  # 1 hour
_repos_cache: Dict[str, Any] = {}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "per4ex-api"}

@app.get("/api/github/repos", response_model=RepoResponse)
async def get_github_repos(user: str = "ppilafas"):
    current_time = time.time()
    
    # Check cache
    if user in _repos_cache:
        timestamp, data = _repos_cache[user]
        if current_time - timestamp < CACHE_TTL:
            return data

    url = f"https://api.github.com/users/{user}/repos"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(url, params={"sort": "updated", "per_page": 100}, timeout=10.0)
            resp.raise_for_status()
            repos_data = resp.json()
        except Exception as e:
            # If cache exists but expired, return it as fallback
            if user in _repos_cache:
                return _repos_cache[user][1]
            print(f"Error fetching repos: {e}")
            return {"user": user, "repos": []}

    # Filter/Transform
    repos = []
    for r in repos_data:
        repos.append(Repo(
            name=r.get("name", ""),
            description=r.get("description"),
            html_url=r.get("html_url", ""),
            language=r.get("language"),
            stargazers_count=r.get("stargazers_count", 0),
            updated_at=r.get("updated_at", "")
        ))
    
    # Sort locally just in case
    repos.sort(key=lambda x: x.updated_at, reverse=True)
    
    result = {"user": user, "repos": repos}
    _repos_cache[user] = (current_time, result)
    
    return result
