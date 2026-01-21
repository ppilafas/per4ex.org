import time
import logging
import re
from typing import List, Optional, Dict, Any
from collections import OrderedDict
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict
import httpx

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration using Pydantic Settings
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    
    catalyst_base_url: str = "http://localhost:8001/v1"
    catalyst_api_key: str = ""
    catalyst_tenant_id: str = "default"
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,https://per4ex.org,https://www.per4ex.org"
    cache_max_size: int = 100
    cache_ttl: int = 3600  # 1 hour

settings = Settings()

app = FastAPI(title="Per4ex API")

# Configure CORS with environment-based origins
def get_cors_origins() -> List[str]:
    """Parse CORS origins from environment variable or use defaults."""
    if settings.cors_origins:
        origins = [origin.strip() for origin in settings.cors_origins.split(",")]
        # Always include localhost for development
        dev_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002"
        ]
        # Merge and deduplicate
        all_origins = list(dict.fromkeys(dev_origins + origins))
        return all_origins
    return [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://per4ex.org",
        "https://www.per4ex.org"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
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

# GitHub username validation
GITHUB_USERNAME_PATTERN = re.compile(r'^[a-zA-Z0-9]([a-zA-Z0-9]|-(?![.-])){0,38}$')

def validate_github_username(username: str) -> str:
    """Validate GitHub username format and length."""
    if not username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    
    if len(username) > 39:
        raise HTTPException(status_code=400, detail="Username exceeds maximum length of 39 characters")
    
    if not GITHUB_USERNAME_PATTERN.match(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid username format. Must contain only alphanumeric characters, hyphens, and underscores, and cannot start or end with a hyphen."
        )
    
    return username

# LRU Cache implementation with TTL
class LRUCache:
    def __init__(self, max_size: int = 100, ttl: int = 3600):
        self.max_size = max_size
        self.ttl = ttl
        self.cache: OrderedDict[str, tuple[float, Any]] = OrderedDict()
    
    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        
        timestamp, value = self.cache[key]
        current_time = time.time()
        
        # Check if expired
        if current_time - timestamp > self.ttl:
            del self.cache[key]
            return None
        
        # Move to end (most recently used)
        self.cache.move_to_end(key)
        return value
    
    def set(self, key: str, value: Any) -> None:
        current_time = time.time()
        
        # If key exists, update it
        if key in self.cache:
            self.cache[key] = (current_time, value)
            self.cache.move_to_end(key)
            return
        
        # If at capacity, remove oldest
        if len(self.cache) >= self.max_size:
            self.cache.popitem(last=False)
        
        self.cache[key] = (current_time, value)
    
    def clear_expired(self) -> int:
        """Remove expired entries. Returns count of removed entries."""
        current_time = time.time()
        expired_keys = [
            key for key, (timestamp, _) in self.cache.items()
            if current_time - timestamp > self.ttl
        ]
        for key in expired_keys:
            del self.cache[key]
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics for monitoring."""
        current_time = time.time()
        expired_count = sum(
            1 for timestamp, _ in self.cache.values()
            if current_time - timestamp > self.ttl
        )
        return {
            "size": len(self.cache),
            "max_size": self.max_size,
            "expired_entries": expired_count,
            "ttl_seconds": self.ttl
        }

_repos_cache = LRUCache(max_size=settings.cache_max_size, ttl=settings.cache_ttl)

@app.get("/health")
def health_check():
    """Health check endpoint with cache statistics."""
    cache_stats = _repos_cache.get_stats()
    return {
        "status": "ok",
        "service": "per4ex-api",
        "cache": cache_stats
    }

@app.get("/api/github/repos", response_model=RepoResponse)
async def get_github_repos(user: str = Query(default="ppilafas", description="GitHub username")):
    """
    Fetch GitHub repositories for a user.
    
    - Validates username format and length
    - Uses caching with TTL
    - Returns proper error responses
    """
    # Validate username
    try:
        validated_user = validate_github_username(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected validation error for user '{user}': {e}")
        raise HTTPException(status_code=500, detail="Internal validation error")
    
    # Check cache
    cached_result = _repos_cache.get(validated_user)
    if cached_result is not None:
        logger.info(f"Cache hit for user: {validated_user}")
        return cached_result
    
    # Clean expired entries periodically
    expired_count = _repos_cache.clear_expired()
    if expired_count > 0:
        logger.info(f"Cleared {expired_count} expired cache entries")
    
    # Fetch from GitHub API
    url = f"https://api.github.com/users/{validated_user}/repos"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get(
                url,
                params={"sort": "updated", "per_page": 100},
                timeout=10.0
            )
            resp.raise_for_status()
            repos_data = resp.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub API error for user '{validated_user}': {e.response.status_code} - {e.response.text}")
            # If cache exists but expired, return it as fallback
            cached_result = _repos_cache.get(validated_user)
            if cached_result is not None:
                logger.warning(f"Returning stale cache for user '{validated_user}' due to API error")
                return cached_result
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"User '{validated_user}' not found on GitHub")
            elif e.response.status_code == 403:
                raise HTTPException(status_code=503, detail="GitHub API rate limit exceeded. Please try again later.")
            else:
                raise HTTPException(status_code=503, detail=f"GitHub API error: {e.response.status_code}")
        except httpx.TimeoutException:
            logger.error(f"Timeout fetching repos for user '{validated_user}'")
            # Try to return stale cache if available
            cached_result = _repos_cache.get(validated_user)
            if cached_result is not None:
                logger.warning(f"Returning stale cache for user '{validated_user}' due to timeout")
                return cached_result
            raise HTTPException(status_code=503, detail="Request to GitHub API timed out")
        except httpx.RequestError as e:
            logger.error(f"Request error fetching repos for user '{validated_user}': {e}")
            # Try to return stale cache if available
            cached_result = _repos_cache.get(validated_user)
            if cached_result is not None:
                logger.warning(f"Returning stale cache for user '{validated_user}' due to request error")
                return cached_result
            raise HTTPException(status_code=503, detail="Failed to connect to GitHub API")
        except Exception as e:
            logger.error(f"Unexpected error fetching repos for user '{validated_user}': {e}", exc_info=True)
            # Try to return stale cache if available
            cached_result = _repos_cache.get(validated_user)
            if cached_result is not None:
                logger.warning(f"Returning stale cache for user '{validated_user}' due to unexpected error")
                return cached_result
            raise HTTPException(status_code=500, detail="Internal server error")

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
    
    result = {"user": validated_user, "repos": repos}
    _repos_cache.set(validated_user, result)
    logger.info(f"Cached repos for user: {validated_user} ({len(repos)} repos)")
    
    return result

# Note: Chat endpoint is handled by Next.js API route at apps/web/app/api/chat/route.ts
# This FastAPI service only handles GitHub repos and health checks
