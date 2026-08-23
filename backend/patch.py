import os
import re

with open("/Users/souvikchakraborty/bhramari/backend/main.py", "r") as f:
    content = f.read()

# 1. Add genai imports
import_addition = """
import logging
from google import genai
from google.genai import types

# Use Vertex AI backend if in GCP environment
try:
    _project = os.getenv("PROJECT_ID", "qwiklabs-gcp-00-56125d510400")
    # Vertex requires setting vertexai=True
    client = genai.Client(vertexai=True, project=_project, location="us-central1")
except Exception as e:
    logging.error(f"GenAI Vertex AI initialization failed: {e}")
    try:
        client = genai.Client()
    except Exception as inner_e:
        client = None
"""
content = re.sub(r'import logging', import_addition, content, count=1)

# 2. Add Form for File uploads
content = content.replace("from fastapi import (", "from fastapi import ( Form,\n")


# 3. Rewrite SwarmAgentPipeline
new_pipeline = """class FindingModel(BaseModel):
    severity: str
    line: Optional[int] = None
    description: str
    suggestion: str

class AgentResponseModel(BaseModel):
    findings: List[FindingModel]

class SwarmAgentPipeline:
    AGENT_PROMPTS = {
        "security_drone": "You are a Security Drone. Review this code for security vulnerabilities. Output your findings strictly in the provided JSON schema. Focus on injection, XSS, memory leaks, and unhandled panics.",
        "logic_wasp": "You are a Logic Wasp. Review this code for logic bugs and resource leaks. Output your findings strictly in the provided JSON schema. Focus on edge cases, race conditions, and unclosed resources.",
        "style_bee": "You are a Style Bee. Review this code for style and PEP8/idiomatic issues. Output your findings strictly in the provided JSON schema. Focus on variable naming, docstrings, and readability.",
        "cultural_drone": "You are a Cultural Drone. Review this code for cultural and teamwork contexts. Output your findings strictly in the provided JSON schema. Focus on comments context, idiomatic patterns, and team best practices.",
        "growth_queen": "You are a Growth Queen. Provide higher-level feedback and learning suggestions. Output your findings strictly in the provided JSON schema. Focus on architecture and long-term skill development."
    }

    @classmethod
    async def call_agent(cls, code: str, agent_name: str, system_prompt: str) -> List[Dict]:
        if not client:
            return []
        try:
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"Review this code:\\n\\n```\\n{code}\\n```",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=AgentResponseModel,
                    system_instruction=system_prompt,
                    temperature=0.2,
                ),
            )
            if response.parsed:
                findings = []
                for f in response.parsed.findings:
                    findings.append({
                        "type": agent_name.split("_")[0],
                        "severity": f.severity,
                        "line": f.line,
                        "description": f.description,
                        "suggestion": f.suggestion,
                        "agent": agent_name
                    })
                return findings
            return []
        except Exception as e:
            logging.error(f"Agent {agent_name} failed: {e}")
            return []

    @classmethod
    async def detect_language(cls, code: str) -> str:
        if not client: return "python"
        class LanguageDetection(BaseModel):
            language: str
        try:
            response = await client.aio.models.generate_content(
                model='gemini-2.5-flash',
                contents=f"Detect the programming language of this code. Only return the lowercase name of the language (e.g., 'python', 'javascript', 'go', 'java').\\n\\n```\\n{code[:1000]}\\n```",
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LanguageDetection,
                ),
            )
            return response.parsed.language if response.parsed else "python"
        except Exception as e:
            return "python"

    @classmethod
    async def swarm_review(cls, code: str, language: str, historical_patterns: List[Dict]) -> Dict:
        if not language or language == "unknown":
            language = await cls.detect_language(code)
            
        tasks = []
        for agent_name, prompt in cls.AGENT_PROMPTS.items():
            tasks.append(cls.call_agent(code, agent_name, prompt))
            
        results = await asyncio.gather(*tasks)
        all_findings = []
        for res in results:
            all_findings.extend(res)
            
        pattern_findings = []
        for pattern in historical_patterns[:3]:
            pattern_findings.append({
                "type": pattern["category"], "severity": "info", "line": None,
                "description": f"Historical pattern matched: {pattern['rule_text']}",
                "suggestion": pattern.get("example_after", "Review this pattern in your code."),
                "agent": "cultural_drone"
            })
        
        all_findings = all_findings + pattern_findings
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
            "detected_language": language
        }"""
content = re.sub(r'class SwarmAgentPipeline:.*?# ─── FastAPI App ──────────────────────────────────────────────────────────────', new_pipeline + "\n\n# ─── FastAPI App ──────────────────────────────────────────────────────────────", content, flags=re.DOTALL)


# 4. Add /upload endpoint
upload_endpoint = """
@app.post("/api/v1/submissions/upload", response_model=SubmissionResponse)
async def upload_code(
    file: UploadFile = File(...),
    target_language: str = Form("en"),
    voice_prompt: Optional[str] = Form(None),
    voice_language: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    if isinstance(content, bytes):
        content = content.decode('utf-8', errors='ignore')
        
    secret_findings = SecretScanner.scan(content)
    
    sub = Submission(
        id=str(uuid4()), user_id=current_user.id, title=f"Upload: {file.filename}",
        description="Uploaded via file.", content=content,
        source_language="unknown", file_name=file.filename,
        status="pending", voice_prompt=voice_prompt,
        voice_language=voice_language,
    )
    db.add(sub); db.commit(); db.refresh(sub)
    
    asyncio.create_task(process_swarm(sub.id, content, "unknown",
                                       current_user.id, db, target_language,
                                       voice_prompt, voice_language))
    
    return SubmissionResponse(id=sub.id, title=sub.title, source_language=sub.source_language,
                              status=sub.status, created_at=sub.created_at)

@app.post("/api/v1/submissions", response_model=SubmissionResponse)"""
content = content.replace('@app.post("/api/v1/submissions", response_model=SubmissionResponse)', upload_endpoint)

# 5. Update process_swarm to handle detected_language
content = content.replace("""        review = await SwarmAgentPipeline.swarm_review(code, language, patterns)
        
        for finding_data in review["findings"]:""", """        review = await SwarmAgentPipeline.swarm_review(code, language, patterns)
        
        sub.source_language = review.get("detected_language", language)
        
        for finding_data in review["findings"]:""")

with open("/Users/souvikchakraborty/bhramari/backend/main.py", "w") as f:
    f.write(content)

print("Backend main.py patched.")
