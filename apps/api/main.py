import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import os

app = FastAPI(title="Per4ex API")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
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

# Catalyst Configuration
CATALYST_BASE_URL = os.getenv("CATALYST_BASE_URL", "http://localhost:8001/v1")
CATALYST_API_KEY = os.getenv("CATALYST_API_KEY", "")
CATALYST_TENANT_ID = os.getenv("CATALYST_TENANT_ID", "default")

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

# Chat Proxy for Catalyst
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

@app.post("/api/chat")
async def proxy_chat(request: ChatRequest):
    if not CATALYST_API_KEY:
        raise HTTPException(status_code=503, detail="Catalyst API Key not configured")

    url = f"{CATALYST_BASE_URL}/chat/stream"
    headers = {
        "Authorization": f"Bearer {CATALYST_API_KEY}",
        "X-Tenant-Id": CATALYST_TENANT_ID,
        "Content-Type": "application/json"
    }
    
    # Forward the request to Catalyst
    # We use StreamingResponse to support SSE if we want to get fancy, 
    # but for now let's just forward the request and return the stream
    
    async def stream_generator():
        async with httpx.AsyncClient() as client:
            async with client.stream("POST", url, json=request.model_dump(), headers=headers, timeout=60.0) as resp:
                if resp.status_code != 200:
                    yield f"data: {{\"error\": \"Upstream error {resp.status_code}\"}}\n\n"
                    return
                    
                async for chunk in resp.aiter_bytes():
                    yield chunk

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
