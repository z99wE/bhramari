# 🐝 BHRAMARI — Technical Requirements Document
## The Swarm Intelligence Architecture Blueprint

---

## 1. 🏗️ ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BHRAMARI ARCHITECTURE                                 │
│                                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐        ┌──────────────────────┐   │
│  │  Web     │   │ Mobile   │   │ Google   │        │  ASTRYX UI           │   │
│  │  Client  │   │  (PWA)   │   │ ADK      │        │  • Glassmorphism     │   │
│  │ React 19 │   │          │   │ Voice    │        │  • Neon honeycomb    │   │
│  │ + TS     │   │          │   │ Trigger  │        │  • Pulsing nodes     │   │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘        │  • Zero-config theme │   │
│       │              │              │               └──────────────────────┘   │
│       └──────────────┼──────────────┘                                            │
│                      │                                                          │
│              ┌───────▼────────┐                                                │
│              │  Cloud Armor   │  ← DDoS protection + WAF                       │
│              │  + CDN         │  ← Edge caching for static assets              │
│              └───────┬────────┘                                                │
│                      │                                                          │
│         ┌────────────▼────────────┐                                            │
│         │    API Gateway +        │                                            │
│         │    Cloud Run (North)    │  ← Main API service (auto-scaling)         │
│         └────────────┬────────────┘                                            │
│                      │                                                          │
│    ┌─────────────────┼─────────────────┐                                       │
│    │                 │                 │                                       │
│ ┌──▼──┐       ┌─────▼─────┐      ┌────▼────┐                                  │
│ │Auth │       │ Hive Mind │      │ Swarm    │                                  │
│ │Svc  │       │ Agent     │      │ Pattern  │                                  │
│ │     │       │(Vertex AI)│      │ Engine   │                                  │
│ └──┬──┘       └─────┬─────┘      └────┬────┘                                  │
│    │                │                 │                                        │
│    │        ┌───────▼─────────────────▼──────┐                                 │
│    │        │         Pub/Sub                │  ← Event streaming             │
│    │        │    (Swarm findings)            │                                 │
│    │        └───────┬─────────────────┬──────┘                                 │
│    │                │                 │                                        │
│    │        ┌───────▼──────┐   ┌──────▼──────┐                                │
│    │        │  Cloud Tasks  │   │ Memorystore  │  ← Redis cache               │
│    │        │ (Async jobs)  │   │ (Sessions)   │                                │
│    │        └───────┬──────┘   └──────┬──────┘                                │
│    │                │                 │                                        │
│    │        ┌───────▼─────────────────▼──────┐                                 │
│    │        │         Cloud SQL               │  ← PostgreSQL (primary)        │
│    │        │       + Firestore               │  ← NoSQL (sessions/chat)       │
│    │        └───────┬─────────────────┬──────┘                                 │
│    │                │                 │                                        │
│    │        ┌───────▼──────┐   ┌──────▼──────┐                                │
│    │        │ BigQuery      │   │ Spanner      │  ← Global scale              │
│    │        │ (Analytics)   │   │ (Leaderboard)│                                │
│    │        └──────────────┘   └──────────────┘                                │
│    │                                                                                │
│    └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                    VOICE & LANGUAGE LAYER                                 │    │
│  │  Speech-to-Text │ Translation │ Text-to-Speech │ Google ADK              │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                    OBSERVABILITY & SECURITY                               │    │
│  │  Cloud Logging │ Monitoring │ Error Reporting │ Cloud Trace │ Secret Mgr  │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────┐    │
│  │                    DEPLOYMENT & CI/CD                                     │    │
│  │  Cloud Build │ Artifact Registry │ Cloud Deploy                          │    │
│  └──────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ☁️ GOOGLE CLOUD PRODUCT INVENTORY (20 Products)

| # | Product | Role in Bhramari | Why It Matters |
|---|---------|-------------------|----------------|
| 1 | **Cloud Run** | Core API orchestration | Auto-scaling serverless containers, zero idle cost |
| 2 | **Vertex AI** | Swarm intelligence engine | Multi-agent reasoning pipeline with Gemini 2.0 Flash |
| 3 | **Google ADK** | Voice/action integration | Natural language intent parsing for voice-first workflows |
| 4 | **Cloud Translation** | Dynamic localization | Real-time translation across 50+ languages for findings |
| 5 | **Speech-to-Text** | Audio ingestion | Vernacular voice prompt transcription (Hindi, Tamil, Bengali...) |
| 6 | **Text-to-Speech** | Audio output | Natural voice synthesis for finding narration |
| 7 | **Cloud SQL** | Relational DB | PostgreSQL store with JSONB for users, submissions, findings |
| 8 | **Firestore** | Real-time sync | Sub-millisecond state for live UI, guild chats, streaming |
| 9 | **Memorystore** | High-speed cache | Redis for rate-limiting, leaderboards, session cache |
| 10 | **Pub/Sub** | Event streaming | High-throughput distributed bus coordinating swarm agents |
| 11 | **Cloud Tasks** | Background queues | Async execution for long-running swarm calculations |
| 12 | **Spanner** | Global scalability | Horizontally scalable, strongly consistent leaderboard |
| 13 | **BigQuery** | Analytics & insights | Cross-sectional pattern analysis across millions of reviews |
| 14 | **Cloud Armor** | Edge WAF | Web Application Firewall filtering malicious payloads |
| 15 | **Cloud CDN** | Asset distribution | Ultra-low latency edge caching for Astryx React bundle |
| 16 | **Secret Manager** | Zero-secret store | Dynamic retrieval of runtime secrets and API keys |
| 17 | **Cloud Build** | Automated CI/CD | Test → Build → Deploy pipeline |
| 18 | **Artifact Registry** | Container depot | Secure Docker image storage with vulnerability scanning |
| 19 | **Cloud Logging & Monitoring** | Observability | Live dashboards, alert triggers, SLI tracking |
| 20 | **Cloud Trace** | Distributed tracing | End-to-end latency analysis across API Gateway → Vertex AI |

---

## 3. 🗄️ DATABASE SCHEMA

### PostgreSQL (Cloud SQL)

```sql
-- ─── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    oauth_provider VARCHAR(20),
    oauth_id VARCHAR(255),
    
    -- Swarm progression
    swarm_level INT DEFAULT 1,
    nectar_points INT DEFAULT 0,
    xp INT DEFAULT 0,
    reputation_score DECIMAL(5,2) DEFAULT 0.00,
    spiral_level INT DEFAULT 1,
    streak_count INT DEFAULT 0,
    
    -- Language preferences
    preference_language VARCHAR(10) DEFAULT 'en-IN',
    preferred_voice_language VARCHAR(10) DEFAULT 'en-IN',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ─── Hive Submissions ────────────────────────────────────────────────────────
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    source_language VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    
    -- Review results
    quality_score DECIMAL(3,1),
    percentile_rank INT,
    hive_title VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    review_data JSONB,
    patterns_matched JSONB DEFAULT '[]',
    voice_prompt TEXT,       -- Original voice prompt if submitted via voice
    voice_language VARCHAR(10),
    
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- ─── Swarm Findings ──────────────────────────────────────────────────────────
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    agent_type VARCHAR(50) NOT NULL,   -- security, logic, style, cultural, growth
    severity VARCHAR(20) NOT NULL,
    line_number INT,
    description TEXT NOT NULL,
    suggestion TEXT,
    historical_rule_id UUID REFERENCES historical_rules(id),
    translated_to VARCHAR(10),  -- Language this finding was translated to
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─── Historical Swarm Patterns ───────────────────────────────────────────────
CREATE TABLE historical_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    rule_text TEXT NOT NULL,
    example_before TEXT,
    example_after TEXT,
    language_filter VARCHAR(50),
    usage_count INT DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rules_category ON historical_rules(category);
CREATE INDEX idx_rules_lang ON historical_rules(language_filter);

-- ─── Achievements ────────────────────────────────────────────────────────────
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_key VARCHAR(100) NOT NULL,
    earned_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(user_id, achievement_key)
);

-- ─── Colonies (Teams) ────────────────────────────────────────────────────────
CREATE TABLE colonies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id),
    max_members INT DEFAULT 10,
    weekly_nectar_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE colony_members (
    colony_id UUID REFERENCES colonies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (colony_id, user_id)
);

-- ─── Leaderboard Cache ───────────────────────────────────────────────────────
CREATE TABLE leaderboard_cache (
    rank INT PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    nectar_points INT,
    quality_avg DECIMAL(3,1),
    streak_count INT,
    swarm_level INT,
    calculated_at TIMESTAMP DEFAULT NOW()
);
```

### Firestore Schema (Real-Time Features)

```javascript
// Collections for real-time sync

/users/{userId}/
  ├── profile: { username, swarmLevel, nectarPoints, ... }
  ├── stats: { languages: {python: 42, go: 17}, ... }
  └── voice_history: [{ prompt, transcription, language, timestamp }]

/colonies/{colonyId}/
  ├── meta: { name, memberCount, weeklyScore, ... }
  └── members/{userId}: { role, joinedAt, contributionScore }

/sessions/{submissionId}/
  ├── status: "swarming" | "complete" | "failed"
  ├── findings: [/* real-time array — agents push as they complete */]
  └── createdAt: timestamp

/leaderboard/global/
  └── entries: [{ userId, nectarPoints, swarmLevel, rank }]  //实时更新
```

---

## 4. 🤖 VERTEX AI SWARM PIPELINE

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                     BHRAMARI SWARM ORCHESTRATION                               │
│                                                                               │
│   ┌──────────────────┐                                                        │
│   │  HiveQueen       │  ← Orchestrator agent that coordinates the entire swarm│
│   │  (Orchestrator)  │    and synthesizes consensus                           │
│   └────────┬─────────┘                                                        │
│            │                                                                   │
│    ┌───────┴────────┬──────────┬──────────┬──────────┐                        │
│    │                │          │          │          │                        │
│ ┌──▼──┐       ┌───▼───┐  ┌───▼───┐  ┌───▼───┐  ┌──▼───┐                      │
│ │Drone │       │ Wasp  │  │ Bee   │  │ Drone │  │ Queen│                      │
│ │Security│     │Logic │  │Style  │  │Cultural│  │Growth│                      │
│ │      │       │      │  │      │  │       │  │      │                      │
│ │OWASP │       │Big-O │  │PEP-8 │  │India- │  │Trend│                      │
│ │CWE   │       │Mem   │  │Naming │  │norms │  │Track│                      │
│ │SAST  │       │Num   │  │Linter │  │Hinglish│  │Next │                      │
│ └──┬───┘       └───┬───┘  └───┬───┘  └───┬───┘  └──┬───┘                      │
│    │               │          │          │          │                          │
│    └───────────────┴────┬─────┴──────────┴──────────┘                         │
│                         │                                                       │
│                  ┌──────▼──────┐                                                │
│                  │  Consensus  │  ← Merges all agent findings                   │
│                  │  Synthesizer│    into unified review                         │
│                  └──────┬──────┘                                                │
│                         │                                                       │
│                  ┌──────▼──────┐                                                │
│                  │  Score &    │  ← Calculates quality score + hive title       │
│                  │  Title      │    (Dead Colony → Eternal Hive)                │
│                  └─────────────┘                                                │
│                                                                                   │
│  Each agent uses Gemini 2.0 Flash via Vertex AI with:                              │
│  • Role-specific system prompts                                                    │
│  • Tool calling for pattern matching                                               │
│  • Streaming output back to client                                                 │
│  • Context window: 128K tokens per agent                                           │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### Agent System Prompts

```python
"""
Bhramari Swarm Agents — Vertex AI Multi-Agent Pipeline
Each agent is a specialized Gemini model with role-specific expertise.
"""

SWARM_AGENTS = {
    "security_drone": {
        "prompt": """You are the SECURITY DRONE of the BHRAMARI hive.
Analyze code for zero-trust security vulnerabilities: OWASP Top 10, CWE, SAST patterns.
Focus on: injection attacks, broken auth, sensitive data exposure, XXE, CSRF, SSRF.
For each finding: severity (critical/high/medium/low/info), line number, 
description, and exact fix suggestion. Return as JSON array.""",
        "model": "gemini-2.0-flash"
    },
    "logic_wasp": {
        "prompt": """You are the LOGIC WASP of the BHRAMARI hive.
Analyze algorithmic correctness: time/space complexity, edge cases,
race conditions, off-by-one errors, null pointer risks.
Return findings as JSON array with type, severity, line, description, suggestion.""",
        "model": "gemini-2.0-flash"
    },
    "style_bee": {
        "prompt": """You are the STYLE BEE of the BHRAMARI hive.
Analyze code against language-specific community standards:
Python: PEP 8, type hints, context managers
JavaScript: Airbnb config, immutability, async patterns
Go: Effective Go, error handling idioms
Rust: Clippy, ownership patterns
Java: Effective Java, stream API best practices
Return findings as JSON array.""",
        "model": "gemini-2.0-flash"
    },
    "cultural_drone": {
        "prompt": """You are the CULTURAL DRONE of the BHRAMARI hive.
You understand how coding norms differ across regions and languages:
- Indian engineering teams (Hinglish): prefer explanatory names, mixed-language comments
- Silicon Valley: aggressive optimization, TDD culture, minimal comments
- European enterprise: explicit contracts, defensive programming
- Japanese engineering: minimalism, ceremony in code structure
Contextualize your review. Detect when developers mix languages naturally.
Return findings as JSON array.""",
        "model": "gemini-2.0-flash"
    },
    "growth_queen": {
        "prompt": """You are the GROWTH QUEEN of the BHRAMARI hive.
You see the developer behind the code. Identify:
1. What pattern is this developer repeatedly missing?
2. What's the SINGLE most impactful improvement?
3. Does this show growth compared to their history?
4. What should they practice next?
Return growth_analysis as JSON with insights, priority_improvement, next_practice.""",
        "model": "gemini-2.0-flash"
    }
}

class SwarmOrchestrator:
    """
    Coordinates the multi-agent hive mind pipeline.
    All agents run in parallel; findings are streamed via Pub/Sub.
    """
    
    def __init__(self):
        self.agents = {}
        for name, config in SWARM_AGENTS.items():
            self.agents[name] = GenerativeModel(config["model"])
    
    async def swarm_review(
        self,
        code: str,
        language: str,
        historical_patterns: List[Dict],
        target_language: str = "en"
    ) -> Dict:
        """Run the full swarm and return synthesized review."""
        
        context = self._build_context(code, language, historical_patterns)
        
        # Launch all agents in parallel
        tasks = {
            name: asyncio.create_task(self._agentBuzz(name, context))
            for name in SWARM_AGENTS.keys()
        }
        results = await asyncio.gather(*[t for t in tasks.values()])
        
        # Synthesize consensus
        return self._synthesizeConsensus(
            dict(zip(SWARM_AGENTS.keys(), results)),
            code, language, target_language
        )
    
    async def _agentBuzz(self, agent_name: str, context: str) -> Dict:
        """Single agent buzzes its findings."""
        agent = self.agents[agent_name]
        config = SWARM_AGENTS[agent_name]
        
        response = await agent.generate_content_async(
            f"{config['prompt']}\n\nCode:\n```\n{context}\n```",
            generation_config={"temperature": 0.2, "max_output_tokens": 2048},
            safety_settings=[
                SafetySetting(HarmCategory.HARM_CATEGORY_HATE_SPEECH, HarmBlockThreshold.BLOCK_NONE),
                SafetySetting(HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, HarmBlockThreshold.BLOCK_NONE),
            ]
        )
        
        try:
            return json.loads(response.text)
        except:
            return {"findings": [], "error": "parse_failed"}
    
    def _synthesizeConsensus(self, agent_results: Dict, code: str, lang: str, target_lang: str) -> Dict:
        """Merge all agent findings into unified review."""
        all_findings = []
        for agent_name, result in agent_results.items():
            for f in result.get("findings", []):
                f["agent"] = agent_name
                # Translate if needed
                if target_lang != "en":
                    f["description"] = translate_text(f["description"], target_lang)
                    f["suggestion"] = translate_text(f.get("suggestion", ""), target_lang)
                all_findings.append(f)
        
        score, percentile, title, emoji = calculate_swarm_score(all_findings)
        
        return {
            "quality_score": score,
            "percentile": percentile,
            "hive_title": title,
            "hive_emoji": emoji,
            "findings": all_findings,
            "strengths": extract_strengths(agent_results),
            "improvements": sorted(findings, key=severity_order)[:5],
            "growth_tip": agent_results.get("growth_queen", {}).get("insights", {}).get("priority_improvement", ""),
            "agent_breakdown": {name: len(r.get("findings", [])) for name, r in agent_results.items()},
            "target_language": target_lang,
        }
    
    def _build_context(self, code: str, language: str, patterns: List[Dict]) -> str:
        pattern_text = "\n".join([p["rule_text"] for p in patterns[:5]]) if patterns else "No historical patterns loaded."
        return f"Language: {language}\n\n{code}\n\nHistorical swarm patterns:\n{pattern_text}"
```

---

## 5. 🔊 VOICE & LANGUAGE LAYER

### Google ADK + Speech Pipeline

```python
"""
Voice-first interaction layer using Google ADK, Speech-to-Text, 
Translation, and Text-to-Speech.
"""

from google.cloud import speech, translate_v2, texttospeech
from vertexai.language_models import TextGenerationModel
import google.auth


class VoicePipeline:
    """
    End-to-end voice processing: audio → transcription → intent → review → speech output.
    Supports 50+ languages via Cloud Translation.
    """
    
    def __init__(self):
        self.stt_client = speech.SpeechClient()
        self.tts_client = texttospeech.TextToSpeechClient()
        self.translate_client = translate_v2.Client()
    
    async def process_voice_prompt(
        self, 
        audio_bytes: bytes, 
        source_language: str = "hi-IN",
        target_language: str = "en"
    ) -> Dict:
        """
        Complete voice-to-review pipeline:
        1. Transcribe audio (Speech-to-Text)
        2. Translate to English if needed (Cloud Translation)
        3. Parse intent (Google ADK / Vertex AI)
        4. Trigger swarm review
        5. Translate findings back to source language (optional)
        6. Generate TTS audio for findings narration
        """
        
        # Step 1: Speech-to-Text
        transcription = await self._transcribe(audio_bytes, source_language)
        
        # Step 2: Translate to English for analysis
        if source_language != "en":
            translated = self.translate_client.translate(transcription, target_language="en")
            analysis_text = translated["translatedText"]
        else:
            analysis_text = transcription
        
        # Step 3: Intent parsing via Google ADK / Vertex AI
        intent = await self._parse_intent(analysis_text)
        
        # Step 4: Route to appropriate swarm
        if intent["type"] == "review_code":
            review = await self._trigger_swarm(intent["code"], intent.get("language", "python"))
        elif intent["type"] == "explain_pattern":
            review = await self._explain_pattern(intent["pattern"])
        else:
            review = {"findings": [], "error": "Unknown intent"}
        
        # Step 5: Translate findings back to source language
        if source_language != "en":
            for finding in review.get("findings", []):
                finding["description"] = self.translate_client.translate(
                    finding["description"], target_language=source_language
                )["translatedText"]
                finding["suggestion"] = self.translate_client.translate(
                    finding.get("suggestion", ""), target_language=source_language
                )["translatedText"]
        
        # Step 6: Generate TTS narration
        narration_audio = await self._generate_tts(review, source_language)
        
        return {
            "transcription": transcription,
            "translated_text": analysis_text,
            "intent": intent,
            "review": review,
            "narration_audio_url": narration_audio,
            "source_language": source_language,
        }
    
    async def _transcribe(self, audio_bytes: bytes, language: str) -> str:
        """Transcribe audio using Cloud Speech-to-Text."""
        audio = speech.RecognitionAudio(content=audio_bytes)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            language_code=language,
            model="default",
        )
        operation = self.stt_client.recognize(config=config, audio=audio)
        full_transcript = ""
        for result in operation.results:
            full_transcript += result.alternatives[0].transcript + " "
        return full_transcript.strip()
    
    async def _parse_intent(self, text: str) -> Dict:
        """Parse user intent using Google ADK or Vertex AI."""
        # In production, use Google ADK agent framework
        # For MVP, use a simple regex/classifier approach
        intents = {
            "review_code": re.compile(r"(review|check|analyze|find issues)\s+(this|my|the)?\s*(code)?"),
            "explain_pattern": re.compile(r"(explain|what is|tell me about)\s+(pattern|antipattern|rule)"),
            "compare": re.compile(r"(compare|vs|versus)\s+(code|this)"),
        }
        
        for intent_type, pattern in intents.items():
            if pattern.search(text.lower()):
                return {"type": intent_type, "text": text}
        
        return {"type": "unknown", "text": text}
    
    async def _trigger_swarm(self, code: str, language: str) -> Dict:
        """Trigger the multi-agent swarm review."""
        # Import and call SwarmOrchestrator
        from swarm import SwarmOrchestrator
        orchestrator = SwarmOrchestrator()
        return await orchestrator.swarm_review(code, language, [])
    
    async def _generate_tts(self, review: Dict, language: str) -> str:
        """Generate speech narration of review findings."""
        # Build narration text
        narrative = f"Your code scored {review['quality_score']} out of 10. "
        narrative += f"You are classified as {review['hive_title']}. "
        narrative += "Key findings: "
        for i, finding in enumerate(review.get("findings", [])[:3]):
            narrative += f"Finding {i+1}: {finding['description']}. "
            if finding.get("suggestion"):
                narrative += f"Fix: {finding['suggestion']}. "
        
        # Generate audio
        response = self.tts_client.synthesize_speech(
            input=texttospeech.SynthesisInput(text=narrative),
            voice=texttospeech.VoiceSelectionParams(language_code=language),
            audio_config=texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)
        )
        
        # Save to Cloud Storage
        from google.cloud import storage
        client = storage.Client()
        bucket = client.bucket("bhramari-tts-audio")
        blob = bucket.blob(f"reviews/{uuid4().hex}.mp3")
        blob.upload_from_string(response.audio_content)
        
        return blob.public_url
    
    def translate_text(self, text: str, target_lang: str) -> str:
        """Quick text translation helper."""
        result = self.translate_client.translate(text, target_language=target_lang)
        return result["translatedText"]
```

---

## 6. 🔌 API DESIGN

### REST Endpoints

```
AUTHENTICATION
  POST   /api/v1/auth/register              # Email/password registration
  POST   /api/v1/auth/oauth/google          # Google OAuth
  POST   /api/v1/auth/oauth/github          # GitHub OAuth
  GET    /api/v1/auth/me                    # Current user profile

CODE SUBMISSIONS
  POST   /api/v1/submissions                # Submit code → async swarm
  GET    /api/v1/submissions/:id            # Get review result
  GET    /api/v1/submissions/:id/stream     # SSE: real-time streaming findings
  WS     /ws/review/:id                     # WebSocket fallback for streaming

VOICE INTEGRATION (Google ADK Layer)
  POST   /api/v1/voice/transcribe           # Upload audio → transcription
  POST   /api/v1/voice/review               # Full voice-to-review pipeline
  GET    /api/v1/voice/narrate/:id          # Get TTS audio for findings

PATTERNS (Historical Hive Memory)
  POST   /api/v1/patterns/import            # Upload CSV of historical patterns
  GET    /api/v1/patterns                   # Browse pattern library
  GET    /api/v1/patterns/search            # Semantic search

LEADERBOARD
  GET    /api/v1/leaderboard                # Global ranking
  GET    /api/v1/leaderboard/lang/:lang     # Language-specific ranking
  GET    /api/v1/leaderboard/colony/:id     # Colony ranking

USER PROFILES
  GET    /api/v1/users/:id                  # Public profile
  GET    /api/v1/users/:id/stats            # Detailed statistics
  GET    /api/v1/users/:id/history          # Submission history

COLONIES (Teams)
  POST   /api/v1/colonies                   # Create colony
  GET    /api/v1/colonies/:id               # Colony details
  POST   /api/v1/colonies/:id/members       # Invite member
  GET    /api/v1/colonies/:id/challenges    # Active challenges

TRANSLATION
  POST   /api/v1/translate                  # Translate text between languages
  GET    /api/v1/languages                  # Supported language list
```

---

## 7. 💾 CACHING STRATEGY (Memorystore)

```python
"""
Redis caching layer on Memorystore for high-frequency reads.
"""

import redis
import json

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True,
    ssl=True
)

# Cache TTLs
CACHE_TTL_LEADERBOARD = 300      # 5 min
CACHE_TTL_USER_PROFILE = 600     # 10 min
CACHE_TTL_PATTERNS = 3600        # 1 hour
CACHE_TTL_VOICE = 1800           # 30 min

def cache_result(ttl: int = 300):
    """Decorator for caching function results in Redis."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"bhramari:{func.__name__}:{hash(str(args) + str(kwargs))}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator
```

---

## 8. 📊 ANALYTICS PIPELINE (BigQuery)

```python
"""
Analytics pipeline: reviews flow into BigQuery for cross-sectional analysis.
Enables: "What patterns do Go devs in Bangalore have vs Berlin?"
"""

from google.cloud import bigquery

class AnalyticsIngestor:
    def __init__(self):
        self.client = bigquery.Client(project=os.getenv("GCP_PROJECT"))
        self.dataset_id = f"{os.getenv('GCP_PROJECT')}.bhramari_analytics"
    
    def ingest_review(self, submission: Dict, findings: List[Dict]):
        row = {
            "submission_id": submission["id"],
            "user_id": submission["user_id"],
            "source_language": submission["language"],
            "quality_score": submission["quality_score"],
            "hive_title": submission.get("hive_title"),
            "patterns_matched_count": len(findings),
            "timestamp": submission["created_at"],
            "submitted_via_voice": submission.get("voice_prompt") is not None,
            "voice_language": submission.get("voice_language"),
        }
        table_ref = self.client.dataset(self.dataset_id).table("reviews")
        errors = self.client.insert_rows_json(table_ref, [row])
        if errors:
            logger.error(f"BigQuery insert errors: {errors}")
    
    def get_trending_patterns(self, days: int = 30) -> List[Dict]:
        query = f"""
        SELECT finding_type, severity, COUNT(*) as occurrence_count
        FROM `{self.dataset_id}.findings`
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL {days} DAY)
        GROUP BY finding_type, severity
        ORDER BY occurrence_count DESC LIMIT 20
        """
        return [dict(row) for row in self.client.query(query).result()]
```

---

## 9. 🔐 SECURITY IMPLEMENTATION

```python
"""
Multi-layer security using GCP security services.
"""

from google.cloud import secretmanager
import hashlib
import re

# ─── Secret Manager Integration ──────────────────────────────────────────────

class SecretManager:
    def __init__(self, project_id: str):
        self.client = secretmanager.SecretManagerServiceClient()
        self.project_id = project_id
    
    def get_secret(self, secret_name: str, version: str = "latest") -> str:
        name = self.client.secret_version_path(self.project_id, secret_name, version)
        response = self.client.access_secret_version(name=request={"name": name})
        return response.payload.data.decode("UTF-8")

# ─── Pre-Review Secret Scanner ───────────────────────────────────────────────

SECRET_PATTERNS = {
    "aws_access_key": re.compile(r"(?:AKIA|A3T)[A-Z0-9]{16,}"),
    "github_token": re.compile(r"gh[pousr]_[A-Za-z0-9_]{36,}"),
    "private_key": re.compile(r"-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----"),
    "generic_api_key": re.compile(r"(?i)(api[_-]?key)['\"]?\s*[:=]\s*['\"]?([A-Za-z0-9]{20,})"),
    "password_assignment": re.compile(r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"]?\S{8,}"),
    "jwt_token": re.compile(r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+"),
}

async def scan_for_secrets(code: str) -> List[Dict]:
    findings = []
    for line_num, line in enumerate(code.split("\n"), 1):
        for secret_type, pattern in SECRET_PATTERNS.items():
            if pattern.search(line):
                findings.append({
                    "type": "security",
                    "severity": "critical",
                    "line": line_num,
                    "description": f"Potential {secret_type.replace('_', ' ')} detected",
                    "suggestion": "Remove this credential before submitting.",
                    "agent": "security_drone"
                })
    return findings
```

---

## 10. 🚀 DEPLOYMENT (Cloud Build)

```yaml
# cloudbuild.yaml
steps:
  - name: 'python:3.11-slim'
    id: 'run-tests'
    entrypoint: 'pytest'
    args: ['tests/', '-v']
  
  - name: 'gcr.io/cloud-builders/docker'
    id: 'build-image'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/bhramari-api', '.']
    waitFor: ['run-tests']
  
  - name: 'gcr.io/cloud-builders/docker'
    id: 'push-image'
    args: ['push', 'gcr.io/$PROJECT_ID/bhramari-api']
    waitFor: ['build-image']
  
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    id: 'deploy'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'bhramari-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/bhramari-api'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
    waitFor: ['push-image']

images:
  - 'gcr.io/$PROJECT_ID/bhramari-api'
```

---

## 11. 🧩 COMPLETE TECH STACK

| Component | Technology | GCP Product | Purpose |
|-----------|-----------|-------------|---------|
| Frontend | React 19 + TypeScript | Cloud CDN | Ultra-fast global delivery |
| UI Framework | Astryx Design System | — | Meta-quality glassmorphic components |
| Animations | ReactBits | — | Pulsing swarm nodes, spring cards |
| Backend | FastAPI + Python 3.11 | Cloud Run | High-performance API |
| Auth | OAuth2 + JWT | Cloud IAM | Secure identity |
| Primary DB | PostgreSQL | Cloud SQL | Relational data |
| NoSQL DB | Firestore | Firestore | Real-time features |
| Cache | Redis 7 | Memorystore | Sub-ms lookups |
| Queue | Cloud Tasks | Cloud Tasks | Async processing |
| Streaming | Server-Sent Events | Cloud Run | Real-time UI |
| AI/ML | Gemini 2.0 Flash | Vertex AI | Multi-agent swarm |
| Event Bus | Pub/Sub | Pub/Sub | Decoupled architecture |
| Analytics | BigQuery | BigQuery | Cross-sectional insights |
| Scale DB | Spanner | Spanner | Global leaderboard |
| CI/CD | GitHub Actions | Cloud Build | Automated deploys |
| WAF | Custom rules | Cloud Armor | DDoS + injection protection |
| Secrets | Encrypted values | Secret Manager | Zero-secret policy |
| Logging | Structured JSON | Cloud Logging | Full observability |
| Tracing | Distributed traces | Cloud Trace | Latency debugging |
| Voice STT | Cloud Speech-to-Text | Speech-to-Text API | Vernacular transcription |
| Voice TTS | Cloud Text-to-Speech | Text-to-Speech API | Finding narration |
| Translation | Cloud Translation | Translation API | 50+ language support |
| Voice ADK | Google Assistant SDK | Google ADK | Intent parsing |
| Containers | Docker images | Artifact Registry | Secure image storage |

**Total GCP + Google products leveraged: 24** ✅ (Target was 12+)

---

## 12. 📈 MONITORING

```yaml
alerts:
  - name: "Swarm Pipeline Latency"
    condition: "vertex_ai_latency_p99 > 8s for 5min"
    channels: ["slack", "pagerduty"]
  
  - name: "Voice Transcription Failures"
    condition: "speech_to_text_errors > 5 for 5min"
    channels: ["slack"]
  
  - name: "Database Connection Pool"
    condition: "cloudsql_connections > 90%"
    channels: ["slack", "pagerduty"]

dashboards:
  - name: "Bhramari Swarm Health"
    tiles:
      - metric: "custom/bhramari/reviews_completed"
        aggregation: "COUNT_PER_HOUR"
      - metric: "custom/bhramari/avg_quality_score"
        target: 7.0
      - metric: "custom/bhramari/voice_submissions"
        aggregation: "COUNT_PER_HOUR"
      - metric: "custom/bhramari/trending_patterns"
```

---

*Every bee has a role. Every finding matters. This is Bhramari.* 🐝
