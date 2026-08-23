"""
BHRAMARI 🐝 — Production API
The Always-On Multi-Lingual Autonomous Hive Mind
"""

import asyncio
import csv
import io
import json
import math
import os
import re
import secrets
import logging
from datetime import datetime, timedelta
from functools import wraps
from typing import AsyncGenerator, Dict, List, Optional
from uuid import uuid4

import redis
import jwt
from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File, Header, Query
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from pydantic import BaseModel, field_validator, ConfigDict
from sqlalchemy import (desc, 
    create_engine, Column, String, Integer, Float, Text, DateTime,
    JSON, ForeignKey, func, select
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from dotenv import load_dotenv

# ─── Config ───────────────────────────────────────────────────────────────────

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bhramari.db")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
JWT_SECRET = os.getenv("JWT_SECRET", "bhramari-dev-secret-change-me")
JWT_ALGO = "HS256"
TOKEN_EXPIRY_MINUTES = int(os.getenv("TOKEN_EXPIRY_MINUTES", "30"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("bhramari")

# ─── Database ─────────────────────────────────────────────────────────────────

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=1)
    try:
        redis_client.ping()
        logger.info("Redis connected")
    except Exception:
        redis_client = None
        logger.warning("Redis unavailable — using in-memory mode")
except Exception:
    redis_client = None

# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=True)
    oauth_provider = Column(String(20), nullable=True)
    oauth_id = Column(String(255), nullable=True)
    swarm_level = Column(Integer, default=1)
    nectar_points = Column(Integer, default=0)
    xp = Column(Integer, default=0)
    reputation_score = Column(Float, default=0.0)
    streak_count = Column(Integer, default=0)
    spiral_level = Column(Integer, default=1)
    preference_language = Column(String(10), default="en-IN")
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Submission(Base):
    __tablename__ = "submissions"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    source_language = Column(String(50), nullable=False, index=True)
    file_name = Column(String(255), nullable=True)
    quality_score = Column(Float, nullable=True)
    percentile_rank = Column(Integer, nullable=True)
    hive_title = Column(String(50), nullable=True)
    status = Column(String(20), default="pending", index=True)
    review_data = Column(JSON, nullable=True)
    patterns_matched = Column(JSON, default=list)
    voice_prompt = Column(Text, nullable=True)
    voice_language = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=func.now())
    completed_at = Column(DateTime, nullable=True)
    findings = relationship("Finding", back_populates="submission", cascade="all, delete-orphan")


class Finding(Base):
    __tablename__ = "findings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    submission_id = Column(String(36), ForeignKey("submissions.id"), nullable=False, index=True)
    submission = relationship("Submission", back_populates="findings")
    agent_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    line_number = Column(Integer, nullable=True)
    description = Column(Text, nullable=False)
    suggestion = Column(Text, nullable=True)
    translated_to = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=func.now())


class HistoricalRule(Base):
    __tablename__ = "historical_rules"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    category = Column(String(50), nullable=False, index=True)
    rule_text = Column(Text, nullable=False)
    example_before = Column(Text, nullable=True)
    example_after = Column(Text, nullable=True)
    language_filter = Column(String(50), nullable=True)
    usage_count = Column(Integer, default=0)
    created_by = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=func.now())


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    achievement_key = Column(String(100), nullable=False)
    earned_at = Column(DateTime, default=func.now())
    meta_data = Column(JSON, nullable=True)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: str
    username: str
    display_name: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        if '@' not in v: raise ValueError('Invalid email')
        return v.lower()
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not re.match(r'^[a-zA-Z0-9_-]{3,30}$', v):
            raise ValueError('3-30 alphanumeric chars only')
        return v.lower()


class UserResponse(BaseModel):
    id: str; email: str; username: str; display_name: Optional[str]
    swarm_level: int; nectar_points: int; xp: int
    reputation_score: float; streak_count: int; spiral_level: int; created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class SubmissionCreate(BaseModel):
    title: str
    description: Optional[str] = None
    content: str
    source_language: str
    file_name: Optional[str] = None
    target_language: Optional[str] = "en"
    historical_patterns: Optional[List[Dict]] = None
    voice_prompt: Optional[str] = None
    voice_language: Optional[str] = None
    
    @field_validator('source_language')
    @classmethod
    def validate_lang(cls, v: str) -> str:
        supported = {'python','javascript','typescript','go','rust','java','csharp',
                     'ruby','php','swift','kotlin','dart','bash','scala'}
        if v.lower() not in supported:
            raise ValueError(f'Supported: {sorted(supported)}')
        return v.lower()
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        if len(v) > 100000: raise ValueError('Max 100KB')
        if not v.strip(): raise ValueError('Code cannot be empty')
        return v


class SubmissionResponse(BaseModel):
    id: str
    title: str
    source_language: str
    quality_score: Optional[float] = None
    percentile_rank: Optional[int] = None
    hive_title: Optional[str] = None
    hive_emoji: Optional[str] = None
    status: str
    summary: Optional[str] = None
    strengths: Optional[List[str]] = None
    improvements: Optional[List[str]] = None
    growth_tip: Optional[str] = None
    findings: Optional[List[Dict]] = None
    patterns_matched: Optional[List[Dict]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class LeaderboardEntry(BaseModel):
    rank: int; user_id: str; username: str; display_name: Optional[str]
    nectar_points: int; quality_avg: float; streak_count: int; swarm_level: int


# ─── Core Engines ─────────────────────────────────────────────────────────────

class SwarmScoreCalculator:
    PENALTIES = {"critical": -2.5, "high": -1.2, "medium": -0.6, "low": -0.2, "info": 0.0}
    
    TITLES = [
        (2.0, "Dead Colony", "☠️"),
        (4.0, "Failing Hive", "🐝"),
        (6.0, "Active Swarm", "⚡"),
        (8.0, "Strong Colony", "🏆"),
        (10.0, "Eternal Hive", "👑"),
    ]
    
    @classmethod
    def calculate(cls, findings: List[Dict]) -> tuple:
        score = 10.0
        for f in findings:
            score += cls.PENALTIES.get(f.get("severity", "info"), 0)
        score = max(1.0, min(10.0, round(score, 1)))
        
        z = (score - 5.5) / 2.0
        percentile = max(1, min(99, int((1 + math.erf(z / math.sqrt(2))) * 50)))
        
        title, emoji = cls.TITLES[-1][1], cls.TITLES[-1][2]
        for threshold, t, e in reversed(cls.TITLES):
            if score >= threshold:
                title, emoji = t, e
                break
        
        return score, percentile, title, emoji


class SecretScanner:
    PATTERNS = {
        "aws_access_key": re.compile(r"(?:AKIA|A3T)[A-Z0-9]{16,}"),
        "github_token": re.compile(r"gh[pousr]_[A-Za-z0-9_]{36,}"),
        "private_key": re.compile(r"-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----"),
        "generic_api_key": re.compile(r"(?i)(api[_-]?key)['\"]?\s*[:=]\s*['\"]?([A-Za-z0-9]{20,})"),
        "password_assignment": re.compile(r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"]?\S{8,}"),
    }
    
    @classmethod
    def scan(cls, code: str) -> List[Dict]:
        findings = []
        for i, line in enumerate(code.split('\n'), 1):
            for stype, pattern in cls.PATTERNS.items():
                if pattern.search(line):
                    findings.append({
                        "type": "security", "severity": "critical", "line": i,
                        "description": f"Potential {stype.replace('_', ' ')} detected",
                        "suggestion": "Remove this credential immediately.",
                        "agent": "security_drone"
                    })
        return findings


class PatternMatcher:
    CACHE_TTL = 3600
    
    @classmethod
    def match(cls, code: str, language: str, db: Session) -> List[Dict]:
        cache_key = f"patterns:{hash(code[:200])}:{language}"
        cached = redis_client.get(cache_key) if redis_client else None
        if cached:
            return json.loads(cached)
        
        stmt = select(HistoricalRule).where(
            (HistoricalRule.language_filter.is_(None)) |
            (HistoricalRule.language_filter == language)
        ).order_by(HistoricalRule.usage_count.desc()).limit(5)
        
        rules = db.execute(stmt).scalars().all()
        matched = []
        for rule in rules:
            if any(term.lower() in code.lower() for term in rule.rule_text.split()[:4]):
                matched.append({
                    "id": rule.id, "category": rule.category,
                    "rule_text": rule.rule_text,
                    "example_after": rule.example_after,
                })
                rule.usage_count += 1
        
        if redis_client:
            redis_client.setex(cache_key, cls.CACHE_TTL, json.dumps(matched))
        return matched
    
    @classmethod
    def ingest_csv(cls, rows: List[Dict], user_id: str) -> Dict:
        results = {"total": len(rows), "inserted": 0, "errors": []}
        db = SessionLocal()
        try:
            for i, row in enumerate(rows):
                try:
                    if not {"id", "type", "description"}.issubset(row.keys()):
                        results["errors"].append(f"Row {i+1}: missing fields")
                        continue
                    rule = HistoricalRule(
                        category=row["type"].strip().lower(),
                        rule_text=row["description"].strip(),
                        example_after=row.get("example_after", "").strip() or None,
                        created_by=user_id,
                    )
                    db.add(rule)
                    results["inserted"] += 1
                except Exception as e:
                    results["errors"].append(f"Row {i+1}: {e}")
            db.commit()
        finally:
            db.close()
        return results


class SwarmAgentPipeline:
    SIMULATED_FINDINGS = {
        "python": [
            {"type": "security", "severity": "critical", "line": None,
             "description": "SQL injection: string concatenation in query builds an attack vector",
             "suggestion": "Use parameterized queries: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))",
             "agent": "security_drone"},
            {"type": "logic", "severity": "medium", "line": 5,
             "description": "Consider using list comprehension instead of explicit append loop",
             "suggestion": "Use [x * 2 for x in items] for better performance and readability",
             "agent": "logic_wasp"},
            {"type": "style", "severity": "low", "line": 1,
             "description": "Function name should use snake_case per PEP 8",
             "suggestion": "Rename to process_data() following Python community conventions",
             "agent": "style_bee"},
            {"type": "cultural", "severity": "info", "line": None,
             "description": "Hinglish-speaking Indian teams prefer explanatory function names that describe WHY, not just WHAT",
             "suggestion": "Consider: transform_user_records_to_response_format()",
             "agent": "cultural_drone"},
            {"type": "growth", "severity": "info", "line": None,
             "description": "You repeat SQL injection patterns — this is your top recurring issue across 3 languages",
             "suggestion": "Practice parameterized queries in Python, Go, and JavaScript this week",
             "agent": "growth_queen"},
        ],
        "javascript": [
            {"type": "security", "severity": "high", "line": 3,
             "description": "XSS vulnerability: innerHTML with unsanitized user input",
             "suggestion": "Use textContent or sanitize with DOMPurify before setting innerHTML",
             "agent": "security_drone"},
            {"type": "logic", "severity": "medium", "line": 8,
             "description": "Event listener added without cleanup — potential memory leak",
             "suggestion": "Add cleanup: return () => window.removeEventListener('scroll', handler)",
             "agent": "logic_wasp"},
            {"type": "style", "severity": "low", "line": 1,
             "description": "Variable 'x' is unclear — use descriptive names",
             "suggestion": "Rename to totalAmount or userCount depending on context",
             "agent": "style_bee"},
            {"type": "cultural", "severity": "info", "line": None,
             "description": "Silicon Valley style favors minimal comments. European enterprise prefers explicit documentation.",
             "suggestion": "Consider your audience: add JSDoc for public APIs",
             "agent": "cultural_drone"},
        ],
        "go": [
            {"type": "security", "severity": "critical", "line": 3,
             "description": "Unhandled error from database query — will panic under load",
             "suggestion": "Check err: if err != nil { http.Error(w, err.Error(), 500); return }",
             "agent": "security_drone"},
            {"type": "logic", "severity": "high", "line": 10,
             "description": "Goroutine launched without context cancellation — goroutine leak",
             "suggestion": "Pass context.Context and use defer wg.Done() with proper cancellation",
             "agent": "logic_wasp"},
            {"type": "style", "severity": "low", "line": 1,
             "description": "Error handling could use sentinel errors for better comparison",
             "suggestion": "Define var ErrNotFound = errors.New(\"not found\") and use errors.Is()",
             "agent": "style_bee"},
            {"type": "cultural", "severity": "info", "line": None,
             "description": "Go code in Indian startups often omits error handling for speed — a known anti-pattern causing production incidents",
             "suggestion": "Always handle errors explicitly. A skipped error check is a future outage.",
             "agent": "cultural_drone"},
        ],
    }
    
    DEFAULT_FINDINGS = [
        {"type": "style", "severity": "info", "line": None,
         "description": "Consider adding documentation comments for complex logic blocks",
         "suggestion": "Add docstrings explaining the why behind non-obvious implementations",
         "agent": "style_bee"},
        {"type": "growth", "severity": "info", "line": None,
         "description": "Track progress: your last 3 submissions averaged similar quality",
         "suggestion": "Pick either security or performance and improve both over the next week",
         "agent": "growth_queen"},
    ]
    
    @classmethod
    async def swarm_review(cls, code: str, language: str, historical_patterns: List[Dict]) -> Dict:
        lang_findings = cls.SIMULATED_FINDINGS.get(language, cls.DEFAULT_FINDINGS[:])
        
        pattern_findings = []
        for pattern in historical_patterns[:3]:
            pattern_findings.append({
                "type": pattern["category"], "severity": "info", "line": None,
                "description": f"Historical pattern matched: {pattern['rule_text']}",
                "suggestion": pattern.get("example_after", "Review this pattern in your code."),
                "agent": "cultural_drone"
            })
        
        all_findings = lang_findings + pattern_findings
        score, percentile, title, emoji = SwarmScoreCalculator.calculate(all_findings)
        
        return {
            "quality_score": score, "percentile": percentile,
            "hive_title": title, "hive_emoji": emoji,
            "findings": all_findings,
            "strengths": ["Clean structure", "Good naming convention"],
            "improvements": sorted(all_findings, key=lambda x: {"critical":0,"high":1,"medium":2,"low":3}.get(x.get("severity","low"),4))[:5],
            "growth_tip": next((f["suggestion"] for f in all_findings if f.get("agent") == "growth_queen"), "Keep buzzing! 🐝"),
            "agent_breakdown": {a: sum(1 for f in all_findings if f.get("agent") == a) 
                               for a in set(f.get("agent","") for f in all_findings)},
            "pattern_matches": pattern_findings,
        }


# ─── FastAPI App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bhramari API",
    description="The Always-On Multi-Lingual Autonomous Hive Mind 🐝",
    version="1.0.0",
    docs_url="/docs", redoc_url="/redoc"
)

from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Serve frontend static files
STATIC_DIR = Path(__file__).parent / "static"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="static")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup_event():
    """Create database tables on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ready")
    except Exception as e:
        logger.warning(f"DB init skipped (will create on first request): {e}")


def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()


def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        user = db.query(User).filter(User.id == payload.get("sub")).first()
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    if not user: raise HTTPException(status_code=401, detail="User not found")
    return user


# ─── Root Endpoint ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "service": "Bhramari API",
        "version": "1.0.0",
        "status": "healthy",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "auth": "/api/v1/auth/register, /api/v1/auth/login",
            "submissions": "/api/v1/submissions",
            "leaderboard": "/api/v1/leaderboard"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "bhramari-api", "timestamp": datetime.utcnow().isoformat(), "version": "1.0.0"}


# ─── Auth Endpoints ───────────────────────────────────────────────────────────

@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username taken")
    user = User(id=str(uuid4()), email=user_data.email, username=user_data.username,
                display_name=user_data.display_name, oauth_provider="manual")
    db.add(user); db.commit(); db.refresh(user)
    return user


@app.post("/api/v1/auth/login")
async def login(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user: raise HTTPException(status_code=401, detail="Invalid credentials")
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_MINUTES)
    token = jwt.encode({"sub": user.id, "exp": expire, "iat": datetime.utcnow()},
                       JWT_SECRET, algorithm=JWT_ALGO)
    return {"access_token": token, "token_type": "bearer", "user": UserResponse.model_validate(user)}


@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ─── Submission Endpoints ─────────────────────────────────────────────────────

@app.post("/api/v1/submissions", response_model=SubmissionResponse)
async def submit_code(submission: SubmissionCreate, current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    secret_findings = SecretScanner.scan(submission.content)
    
    sub = Submission(
        id=str(uuid4()), user_id=current_user.id, title=submission.title,
        description=submission.description, content=submission.content,
        source_language=submission.source_language, file_name=submission.file_name,
        status="pending", voice_prompt=submission.voice_prompt,
        voice_language=submission.voice_language,
    )
    db.add(sub); db.commit(); db.refresh(sub)
    
    if submission.historical_patterns:
        PatternMatcher.ingest_csv(submission.historical_patterns, current_user.id)
    
    asyncio.create_task(process_swarm(sub.id, submission.content, submission.source_language,
                                       current_user.id, db, submission.target_language,
                                       submission.voice_prompt, submission.voice_language))
    
    return SubmissionResponse(id=sub.id, title=sub.title, source_language=sub.source_language,
                              status=sub.status, created_at=sub.created_at)


@app.get("/api/v1/submissions/{submission_id}", response_model=SubmissionResponse)
async def get_submission(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub: raise HTTPException(status_code=404, detail="Submission not found")
    
    from sqlalchemy import select as sa_select
    finding_rows = db.execute(sa_select(Finding).where(Finding.submission_id == submission_id)).scalars().all()
    findings = []
    for f in finding_rows:
        findings.append({
            "id": f.id, "agent_type": f.agent_type, "severity": f.severity,
            "line": f.line_number, "description": f.description,
            "suggestion": f.suggestion
        })
    
    review = sub.review_data or {}
    return SubmissionResponse(
        id=sub.id, title=sub.title, source_language=sub.source_language,
        quality_score=float(sub.quality_score) if sub.quality_score else None,
        percentile_rank=sub.percentile_rank,
        hive_title=sub.hive_title, hive_emoji="🐝",
        status=sub.status,
        summary=review.get("summary"),
        strengths=review.get("strengths"),
        improvements=[i["description"] if isinstance(i, dict) else i for i in (review.get("improvements") or [])],
        growth_tip=review.get("growth_tip"),
        findings=findings if findings else None,
        patterns_matched=review.get("pattern_matches") or sub.patterns_matched,
        created_at=sub.created_at,
        completed_at=sub.completed_at,
    )


@app.get("/api/v1/submissions/{submission_id}/stream")
async def stream_swarm(submission_id: str, db: Session = Depends(get_db)):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub: raise HTTPException(status_code=404, detail="Submission not found")
    
    agents = ["security_drone", "logic_wasp", "style_bee", "cultural_drone", "growth_queen"]
    
    async def event_stream() -> AsyncGenerator[str, None]:
        yield f"data: {json.dumps({'type': 'status', 'data': {'status': 'swarming', 'agents': agents}})}\n\n"
        
        for _ in range(60):
            await asyncio.sleep(0.5)
            db.refresh(sub)
            
            if sub.status == "completed":
                data = sub.review_data or {}
                findings_list = []
                for finding in sub.findings:
                    findings_list.append({
                        "id": finding.id,
                        "agent_type": finding.agent_type,
                        "severity": finding.severity,
                        "line": finding.line_number,
                        "description": finding.description,
                        "suggestion": finding.suggestion
                    })
                result_data = {
                    "type": "complete",
                    "data": {
                        "quality_score": sub.quality_score,
                        "percentile": sub.percentile_rank,
                        "hive_title": sub.hive_title,
                        "findings": findings_list,
                        "summary": data.get("summary", ""),
                        "strengths": data.get("strengths", []),
                        "growth_tip": data.get("growth_tip", ""),
                        "patterns_matched": data.get("pattern_matches", [])
                    }
                }
                yield "data: " + json.dumps(result_data) + "\n\n"
                yield "data: [DONE]\n\n"
                break
            elif sub.status == "failed":
                error_data = {"type": "error", "data": {"message": "Swarm failed"}}
                yield "data: " + json.dumps(error_data) + "\n\n"
                yield "data: [DONE]\n\n"
                break
        
        if sub.status == "completed":
            finding_rows = db.execute(sa_select(Finding).where(Finding.submission_id == sub.id)).scalars().all()
            for finding in finding_rows:
                finding_data = {
                    "type": "finding",
                    "data": {
                        "severity": finding.severity,
                        "agent_type": finding.agent_type,
                        "line": finding.line_number,
                        "description": finding.description,
                        "suggestion": finding.suggestion
                    }
                }
                yield "data: " + json.dumps(finding_data) + "\n\n"


@app.post("/api/v1/voice/transcribe")
async def transcribe_voice(
    audio_file: UploadFile = File(...),
    language: str = Query("hi-IN"),
    current_user: User = Depends(get_current_user),
):
    demo_transcriptions = {
        "hi-IN": "भामाई इस Python कोड में security issues check kar",
        "ta-IN": "இந்த code review பண்ணு",
        "bn-IN": "এই কোডে security vulnerability আছো কিনা দেখো",
        "mr-IN": "हा कोड रिव्हिऊ करा",
        "en": "Review this Python code for security issues",
    }
    transcription = demo_transcriptions.get(language, f"[Voice input in {language}]")
    return {"transcription": transcription, "language": language}


@app.post("/api/v1/voice/review")
async def voice_review(
    audio_file: UploadFile = File(...),
    language: str = Query("hi-IN"),
    code: str = Query(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    transcription = demo_transcriptions.get(language, "Review this code")
    intent = {"type": "review_code", "code": code or "def hello(): pass", "language": "python"}
    review = await SwarmAgentPipeline.swarm_review(intent["code"], intent["language"], [])
    narration_text = f"Your code scored {review['quality_score']} out of 10."
    return {
        "transcription": transcription,
        "review": review,
        "narration_text": narration_text,
        "language": language,
    }


# ─── Background Swarm Processor ──────────────────────────────────────────────

async def process_swarm(submission_id: str, code: str, language: str,
                        user_id: str, db: Session, target_lang: str = "en",
                        voice_prompt: Optional[str] = None, voice_language: Optional[str] = None):
    try:
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        sub.status = "swarming"
        db.commit()
        
        try:
            patterns = PatternMatcher.match(code, language, db)
        except Exception:
            patterns = []
        sub.patterns_matched = patterns
        db.commit()
        
        review = await SwarmAgentPipeline.swarm_review(code, language, patterns)
        
        for finding_data in review["findings"]:
            finding = Finding(
                submission_id=submission_id,
                agent_type=finding_data["agent"],
                severity=finding_data["severity"],
                line_number=finding_data.get("line"),
                description=finding_data["description"],
                suggestion=finding_data.get("suggestion", ""),
                translated_to=target_lang if target_lang != "en" else None,
            )
            db.add(finding)
        
        sub.status = "completed"
        sub.quality_score = review["quality_score"]
        sub.percentile_rank = review["percentile"]
        sub.hive_title = review["hive_title"]
        sub.review_data = review
        sub.completed_at = datetime.utcnow()
        
        user = db.query(User).filter(User.id == user_id).first()
        user.nectar_points += int(review["quality_score"] * 5)
        user.xp += int(review["quality_score"] * 10)
        
        xp_needed = user.swarm_level ** 2 * 100
        while user.xp >= xp_needed:
            user.xp -= xp_needed
            user.swarm_level += 1
            user.spiral_level = (user.swarm_level - 1) // 5 + 1
        
        if user.streak_count > 0:
            user.streak_count += 1
        else:
            user.streak_count = 1
        
        db.commit()
        logger.info(f"Swarm complete: {submission_id} → {review['quality_score']}/10 ({review['hive_title']})")
        
    except Exception as e:
        logger.error(f"Swarm failed {submission_id}: {e}")
        sub = db.query(Submission).filter(Submission.id == submission_id).first()
        sub.status = "failed"
        db.commit()


# ─── Pattern Import Endpoints ─────────────────────────────────────────────────

@app.post("/api/v1/patterns/import")
async def import_patterns(file: UploadFile = File(...), current_user: User = Depends(get_current_user),
                          db: Session = Depends(get_db)):
    content = await file.read()
    if isinstance(content, bytes): content = content.decode('utf-8')
    rows = list(csv.DictReader(io.StringIO(content)))
    if not rows: raise HTTPException(status_code=400, detail="Empty CSV")
    if not {"id", "type", "description"}.issubset(rows[0].keys()):
        raise HTTPException(status_code=400, detail=f"Missing required columns: id, type, description")
    results = PatternMatcher.ingest_csv(rows, current_user.id)
    return {"message": f"Imported {results['inserted']}/{results['total']} patterns", **results}


@app.get("/api/v1/patterns")
async def list_patterns(category: Optional[str] = None, language: Optional[str] = None,
                        db: Session = Depends(get_db)):
    query = db.query(HistoricalRule)
    if category: query = query.filter(HistoricalRule.category == category)
    if language: query = query.filter((HistoricalRule.language_filter.is_(None)) | (HistoricalRule.language_filter == language))
    rules = query.order_by(HistoricalRule.usage_count.desc()).limit(50).all()
    return [{"id": r.id, "category": r.category, "rule_text": r.rule_text,
             "language_filter": r.language_filter, "usage_count": r.usage_count} for r in rules]


# ─── Leaderboard ──────────────────────────────────────────────────────────────

@app.get("/api/v1/leaderboard")
async def get_leaderboard(limit: int = Query(50, ge=1, le=100),
                          db: Session = Depends(get_db)):
    from sqlalchemy import text
    rows = db.execute(text(
        "SELECT id, username, display_name, nectar_points, reputation_score, streak_count, swarm_level "
        "FROM users ORDER BY nectar_points DESC LIMIT :lim"
    ), {"lim": limit}).fetchall()
    return [{"rank": i+1, "user_id": r[0], "username": r[1], "display_name": r[2],
             "nectar_points": r[3] or 0, "quality_avg": r[4] or 0.0,
             "streak_count": r[5] or 0, "swarm_level": r[6] or 1}
            for i, r in enumerate(rows)]


# ─── User Stats ───────────────────────────────────────────────────────────────

@app.get("/api/v1/users/{user_id}")
async def get_user_profile(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    
    submissions = db.query(Submission).filter(Submission.user_id == user_id)\
        .order_by(Submission.created_at.desc()).limit(20).all()
    scores = [s.quality_score for s in submissions if s.quality_score]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    language_counts = {}
    for sub in submissions:
        language_counts[sub.source_language] = language_counts.get(sub.source_language, 0) + 1
    
    return {
        "user": {**{c.name: getattr(user, c.name) for c in User.__table__.columns if c.name != "password_hash"},
                 "average_quality": round(avg_score, 1), "languages": language_counts},
        "recent": [{"id": s.id, "title": s.title, "source_language": s.source_language,
                    "quality_score": s.quality_score, "created_at": s.created_at.isoformat()}
                   for s in submissions[:5]]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080)
