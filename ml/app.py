import os
import re
import json
import argparse
import hashlib
from collections import Counter, defaultdict
from datetime import datetime
from typing import List, Dict, Any

# NLP libs (some optional)
try:
    import spacy
except Exception:
    spacy = None

try:
    from transformers import pipeline
    HAS_TRANSFORMERS = True
except Exception:
    HAS_TRANSFORMERS = False

try:
    from sentence_transformers import SentenceTransformer
    HAS_SBERT = True
except Exception:
    HAS_SBERT = False

# PDF & OCR (optional)
try:
    import pdfplumber
except Exception:
    pdfplumber = None

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False

# plotting
try:
    import matplotlib.pyplot as plt
    HAS_MPL = True
except Exception:
    HAS_MPL = False

# --------- Config ---------
SKILL_MODEL = "jjzha/jobberta-base"   # domain skill extractor (if available)
EMBED_MODEL = "all-MiniLM-L6-v2"
CHUNK_SIZE = 800  # chars per chunk (rough)
CHUNK_OVERLAP = 200
MIN_CONF_DEFAULT = 0.3

# Basic skill vocab fallback (if skill model not available)
FALLBACK_SKILLS = [
    "python","java","javascript","typescript","angular","react","spring boot","node.js",
    "docker","kubernetes","sql","mysql","postgresql","tensorflow","pytorch","nlp",
    "machine learning","flask","django","html","css","aws","azure","gcp","graphql",
    "fastapi","kafka","airflow","spark","hadoop","terraform","ansible","prometheus",
    "grafana","mongodb","cassandra","redis","neo4j","solidity","blockchain","ethereum",
    "web3","git","linux","bash","powershell","ovh","openshift","rancher","gitlab",
    "argocd","tekton","spinnaker","dynatrace","elk","snowflake","databricks"
]

# Improved Regex patterns
EMAIL_RE = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+", re.I)
URL_RE = re.compile(r"https?://[^\s,;]+", re.I)

# Improved Phone Regex - more specific to avoid date false positives
PHONE_RE = re.compile(r"""
    (?:\+?(\d{1,3})[\s.-]?)?      # country code
    \(?(\d{2,4})\)?[\s.-]?        # area code
    (\d{2,4})[\s.-]?(\d{2,4})     # main number parts
    (?!\d{4})                     # don't match if followed by 4 digits (dates)
""", re.VERBOSE)

# Improved date regex
DATE_RE = re.compile(r"""
    (\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|        # DD/MM/YYYY or DD-MM-YYYY
    \b\d{4}-\d{2}-\d{2}\b|                     # YYYY-MM-DD
    \b(?:jan|fév|mar|avr|mai|jun|jui|aoû|sep|oct|nov|déc|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)[a-z]*\s+\d{1,2},?\s+\d{4}\b|  # French dates
    \b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)[a-z]*\s+\d{1,2},?\s+\d{4}\b)  # English dates
""", re.I | re.VERBOSE)

CONTRACT_PATTERNS_FR = {"CDI": r"\bCDI\b", "CDD": r"\bCDD\b", "Stage": r"\bstage\b|\balternance\b|\bapprentissage\b"}
CONTRACT_PATTERNS_EN = {
    "Full-time": r"\bfull[- ]?time\b|\bpermanent\b",
    "Part-time": r"\bpart[- ]?time\b", 
    "Internship": r"\binternship\b|\bintern\b|\btrainee\b"
}

# --------- Utilities ---------
def fingerprint(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode("utf-8")).hexdigest()

def read_text_from_pdf(path: str) -> str:
    text_parts = []
    if pdfplumber:
        try:
            with pdfplumber.open(path) as pdf:
                for p in pdf.pages:
                    page_text = p.extract_text()
                    if page_text:
                        text_parts.append(page_text)
        except Exception:
            pass
    # OCR fallback
    if (not text_parts or not "".join(text_parts).strip()) and OCR_AVAILABLE:
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(path)
            for img in images:
                text_parts.append(pytesseract.image_to_string(img))
        except Exception:
            pass
    return "\n".join(text_parts).strip()

def read_file(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        return read_text_from_pdf(path)
    else:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()

def chunk_text(text: str, chunk_size=CHUNK_SIZE, overlap=CHUNK_OVERLAP) -> List[str]:
    if len(text) <= chunk_size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start = max(end - overlap, end)
    return chunks

def merge_dict_lists(list_of_lists):
    merged = []
    seen = set()
    for item in list_of_lists:
        key = item.get("skill","").lower() if isinstance(item, dict) and "skill" in item else str(item).lower()
        if key and key not in seen:
            seen.add(key)
            merged.append(item)
    return merged

def looks_like_date(text: str) -> bool:
    """Check if text looks like a date rather than salary"""
    date_indicators = ['2024', '2025', 'jan', 'feb', 'mar', 'avr', 'may', 'jun', 
                      'jul', 'aug', 'sep', 'oct', 'nov', 'dec', '/', '-']
    return any(indicator in text.lower() for indicator in date_indicators)

def looks_like_phone(text: str) -> bool:
    """Check if text looks like a phone number"""
    phone_indicators = ['+', '(', ')', 'poste', 'ext', 'extension', 'tel', 'phone']
    return any(indicator in text.lower() for indicator in phone_indicators)

# --------- Models loading ---------
print("Initializing models (may download weights)...")
nlp_multilingual = None
nlp_en = None
nlp_fr = None
skill_pipe = None
embed_model = None

if spacy:
    try:
        # multilingual lightweight model for NER hints
        nlp_multilingual = spacy.load("xx_ent_wiki_sm")
    except Exception:
        try:
            nlp_multilingual = spacy.load("en_core_web_sm")
        except Exception:
            nlp_multilingual = None

# skill extraction pipeline (transformers)
if HAS_TRANSFORMERS:
    try:
        skill_pipe = pipeline("token-classification", model=SKILL_MODEL, aggregation_strategy="simple")
        print(f"Loaded skill model: {SKILL_MODEL}")
    except Exception as e:
        print(f"Skill model load failed ({SKILL_MODEL}): {e}. Falling back to simple keyword matching.")
        skill_pipe = None
else:
    print("Transformers not available -> fallback to keyword matching for skills.")

if HAS_SBERT:
    try:
        embed_model = SentenceTransformer(EMBED_MODEL)
        print("Loaded embedding model:", EMBED_MODEL)
    except Exception as e:
        embed_model = None
        print("Embedding model load failed:", e)

# --------- Extraction helpers ---------
def detect_language_simple(text: str) -> str:
    french_tokens = [" le ", " la ", " les ", " stage ", " CDI ", " CDD ", " salaire ", " rémunération ", " poste ", " mois ", " entreprise ", " société "]
    eng_tokens = [" the ", " and ", " for ", " internship ", " position ", " salary ", " experience ", " company ", " month ", " organization "]
    textl = " " + text.lower() + " "
    score_fr = sum(1 for t in french_tokens if t in textl)
    score_en = sum(1 for t in eng_tokens if t in textl)
    return "fr" if score_fr >= score_en else "en"

def extract_emails(text: str) -> List[str]:
    return list(set(m.group(0) for m in EMAIL_RE.finditer(text)))

def extract_urls(text: str) -> List[str]:
    return list(set(m.group(0) for m in URL_RE.finditer(text)))

def extract_phones(text: str) -> List[str]:
    phones = []
    
    # Specific patterns for different phone formats
    phone_patterns = [
        r"\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{3}[\s.-]?\d{4}",  # International +XX XXX XXX XXXX
        r"\(\d{3}\)[\s.-]?\d{3}[\s.-]?\d{4}",  # US format (555) 555-5555
        r"\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}",  # French 01 23 45 67 89
        r"0\d[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}",  # French with 0
        r"\d{3}[\s.-]?\d{3}[\s.-]?\d{4}",  # 555-555-5555
        r"\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{3,4}",  # More flexible international
    ]
    
    for pattern in phone_patterns:
        for m in re.finditer(pattern, text):
            phone = m.group(0).strip()
            # Additional validation to exclude dates and other false positives
            if not re.search(r'20\d{2}', phone) and len(phone) >= 8:  # Exclude if contains year like 2025
                phones.append(phone)
    
    return list(set(phones))

def extract_dates(text: str) -> List[str]:
    dates = []
    for m in DATE_RE.finditer(text):
        date_str = m.group(0).strip()
        # Filter out false positives (numbers that look like dates but aren't)
        if not re.search(r'\b(?:202\d|19\d\d)\b', date_str):  # Filter years that are likely real
            continue
        dates.append(date_str)
    return list(set(dates))

def extract_salary_matches(text: str) -> List[str]:
    salaries = []
    
    # French patterns
    fr_patterns = [
        (r"Salaire\s*fixe\s*:\s*(\d{1,3}(?:\s?\d{3})*)\s*€\s*[-–]\s*(\d{1,3}(?:\s?\d{3})*)\s*€.*?annuel", "{} € - {} € brut annuel"),
        (r"Rémunération\s*:\s*(\d{1,4})\s*€\s*/\s*mois", "{} € / mois"),
        (r"Gratification\s*:\s*(\d{1,4})\s*€", "{} € (gratification)"),
        (r"(\d{1,4})\s*€\s*/\s*mois", "{} € / mois"),
        (r"Salaire\s*annuel\s*brut\s*:\s*(\d{1,3}(?:\s?\d{3})*)\s*€\s*[-–]\s*(\d{1,3}(?:\s?\d{3})*)\s*€", "{} € - {} € brut annuel")
    ]
    
    # English patterns  
    en_patterns = [
        (r"Base Salary\s*:\s*\$(\d{1,3}(?:,\d{3})*)\s*[-–]\s*\$(\d{1,3}(?:,\d{3})*)\s*annually", "${} - ${} annually"),
        (r"Salary\s*:\s*£(\d{1,3}(?:,\d{3})*)\s*per\s*month", "£{} per month"),
        (r"Monthly stipend\s*:\s*\$(\d{1,3}(?:,\d{3})*)\s*[-–]\s*\$(\d{1,3}(?:,\d{3})*)", "${} - ${}"),
        (r"Stipend\s*:\s*\$(\d{1,3}(?:,\d{3})*)", "${}"),
        (r"Housing allowance\s*:\s*\$(\d{1,3}(?:,\d{3})*)", "${} (housing)"),
        (r"Travel budget\s*:\s*\$(\d{1,3}(?:,\d{3})*)", "${} (travel)")
    ]
    
    all_patterns = fr_patterns + en_patterns
    
    for pattern, template in all_patterns:
        for m in re.finditer(pattern, text, re.I):
            if m.lastindex == 2:  # Range
                salaries.append(template.format(m.group(1), m.group(2)))
            else:  # Single amount
                salaries.append(template.format(m.group(1)))
    
    # Filter out false positives and very short matches
    filtered_salaries = []
    for salary in salaries:
        # Remove salaries that are just "000 €" or similar partial numbers
        if not re.search(r'^\d{1,3}\s?[€\$£]$', salary) and len(salary) > 5:
            filtered_salaries.append(salary)
    
    return list(set(filtered_salaries))

def detect_contract_type(text: str, lang: str) -> List[str]:
    matches = []
    if lang == "fr":
        for k,p in CONTRACT_PATTERNS_FR.items():
            if re.search(p, text, re.I): matches.append(k)
    else:
        for k,p in CONTRACT_PATTERNS_EN.items():
            if re.search(p, text, re.I): matches.append(k)
    return matches

def extract_skills_transformer(text: str) -> List[Dict[str,Any]]:
    if not skill_pipe:
        # fallback: keyword search
        found = []
        textl = text.lower()
        seen = set()
        for s in FALLBACK_SKILLS:
            # Use word boundaries to avoid partial matches
            if re.search(r'\b' + re.escape(s.lower()) + r'\b', textl) and s.lower() not in seen:
                seen.add(s.lower())
                found.append({"skill": s, "score": 0.8})
        return found
    out = skill_pipe(text)
    results = []
    for e in out:
        skill = e.get("word")
        score = float(e.get("score", 0.5))
        grp = e.get("entity_group", "")
        results.append({"skill": skill.strip(), "score": score, "label": grp})
    # deduplicate preserving best score
    best = {}
    for r in results:
        k = r["skill"].lower()
        if k not in best or r["score"] > best[k]["score"]:
            best[k] = r
    return list(best.values())

def extract_title_and_company(text: str, lang: str, doc=None):
    title = None; title_conf = 0.0
    company = None; company_conf = 0.0
    
    # Improved title patterns with better context
    patterns_title_fr = [
        r"Titre\s*(?:du\s*)?poste\s*[:\-]\s*(.+?)(?=\s*(?:Entreprise|Lieu|$|\n))",
        r"Poste\s*[:\-]\s*(.+?)(?=\s*(?:Entreprise|Lieu|$|\n))",
        r"Intitulé\s*(?:du\s*)?(?:stage|poste)\s*[:\-]\s*(.+?)(?=\s*(?:Société|Localisation|$|\n))",
        r"Intitulé du Stage\s*[:\-]\s*(.+?)(?=\s*(?:Société|Localisation|$|\n))",
        r"Nous\s+recherchons\s+un[e]?\s+(.+?)(?=\s+(?:pour|afin|dans|$))"
    ]
    
    patterns_title_en = [
        r"Job\s*Title\s*[:\-]\s*(.+?)(?=\s*(?:Company|Location|$|\n))",
        r"Position\s*[:\-]\s*(.+?)(?=\s*(?:Company|Location|$|\n))",
        r"Role\s*[:\-]\s*(.+?)(?=\s*(?:Company|Location|$|\n))",
        r"We\s+are\s+looking\s+for\s+a[n]?\s+(.+?)(?=\s+(?:to|for|in|$))"
    ]
    
    patterns_company_fr = [
        r"Entreprise\s*[:\-]\s*(.+?)(?=\s*(?:Lieu|$|\n))",
        r"Société\s*[:\-]\s*(.+?)(?=\s*(?:Localisation|$|\n))",
        r"Soci[ée]t[ée]\s*[:\-]\s*(.+?)(?=\s*(?:Lieu|$|\n))",
        r"chez\s+(.+?)(?=\s*(?:Lieu|$|\n))"
    ]
    
    patterns_company_en = [
        r"Company\s*[:\-]\s*(.+?)(?=\s*(?:Location|$|\n))",
        r"Organization\s*[:\-]\s*(.+?)(?=\s*(?:Locations|$|\n))",
        r"Firm\s*[:\-]\s*(.+?)(?=\s*(?:Location|$|\n))",
        r"at\s+(.+?)(?=\s*(?:Location|$|\n))"
    ]
    
    # Try language-specific patterns first
    if lang == "fr":
        for p in patterns_title_fr:
            m = re.search(p, text, re.I | re.M | re.DOTALL)
            if m:
                title = m.group(1).strip()
                title_conf = 0.95
                break
        for p in patterns_company_fr:
            m = re.search(p, text, re.I | re.M | re.DOTALL)
            if m:
                company = m.group(1).strip()
                company_conf = 0.95
                break
    else:
        for p in patterns_title_en:
            m = re.search(p, text, re.I | re.M | re.DOTALL)
            if m:
                title = m.group(1).strip()
                title_conf = 0.95
                break
        for p in patterns_company_en:
            m = re.search(p, text, re.I | re.M | re.DOTALL)
            if m:
                company = m.group(1).strip()
                company_conf = 0.95
                break
    
    # Fallback: first line as title if it looks like a title
    if not title:
        first_line = text.split("\n")[0].strip()
        # Check if first line looks like a title (not too long, contains relevant keywords)
        title_keywords_fr = ["stage", "poste", "développeur", "ingénieur", "technicien", "architecte"]
        title_keywords_en = ["intern", "developer", "engineer", "analyst", "specialist", "architect"]
        
        if lang == "fr":
            if any(keyword in first_line.lower() for keyword in title_keywords_fr) and len(first_line.split()) <= 10:
                title = first_line
                title_conf = 0.7
        else:
            if any(keyword in first_line.lower() for keyword in title_keywords_en) and len(first_line.split()) <= 10:
                title = first_line
                title_conf = 0.7

    return (title, title_conf, company, company_conf)

def extract_locations(text: str, doc=None) -> List[str]:
    locations = set()
    
    # First try spaCy NER if available
    if doc:
        for ent in doc.ents:
            if ent.label_ in ("GPE", "LOC", "FAC", "ORG"):
                # Filter out common false positives
                if not any(false_pos in ent.text.lower() for false_pos in ["company", "entreprise", "solutions", "ltd", "inc", "group", "lab"]):
                    locations.add(ent.text)
    
    # Fallback: simple pattern matching for common location formats
    location_patterns = [
        r"\b(?:Paris|Lyon|Toulouse|Marseille|Londres|London|Zurich|Boston|Singapore|San Francisco|Austin)\b",
        r"\b(?:France|United Kingdom|UK|USA|Canada|Germany|Spain|Switzerland)\b",
        r"\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*(?:France|UK|United Kingdom|USA)\b",
        r"\bRemote\s*\(.*?\)",
        r"\bMulti-sites\b",
        r"\bHybrid\s+Options\b"
    ]
    
    for pattern in location_patterns:
        for match in re.finditer(pattern, text, re.I):
            locations.add(match.group(0))
    
    return list(locations)

def extract_durations(text: str) -> List[str]:
    """Extract contract durations specifically"""
    durations = set()
    
    # Look for duration patterns in context
    duration_patterns = [
        r"Contract Type:\s*[^,]+,\s*(\d+\s*months?)",
        r"Type de contrat:\s*[^,]+,\s*(\d+\s*mois)",
        r"Stage\s+de\s+(\d+\s*mois)",
        r"Internship,\s*(\d+\s*months)",
        r"Duration:\s*(\d+\s*months?)",
        r"Durée:\s*(\d+\s*mois)",
        r"Durée\s*:\s*(\d+\s*mois)",
        r"Contract\s*:\s*[^,]+,\s*(\d+\s*months)"
    ]
    
    for pattern in duration_patterns:
        for match in re.finditer(pattern, text, re.I):
            duration = match.group(1).strip()
            durations.add(duration)
    
    # Also look for duration mentioned separately
    separate_patterns = [
        r"(\d+\s*-\s*\d+\s*months?)",  # 6-12 months
        r"(\d+\s*months?\s*\(extendable\))",  # 6 months (extendable)
        r"(\d+\s*mois\s*\(prolongeable\))",  # 6 mois (prolongeable)
    ]
    
    for pattern in separate_patterns:
        for match in re.finditer(pattern, text, re.I):
            duration = match.group(1).strip()
            durations.add(duration)
    
    return list(durations)

def compute_embedding(text: str):
    if embed_model:
        try:
            vec = embed_model.encode([text])[0].tolist()
            return vec
        except Exception:
            return None
    return None

def process_text(text: str, min_conf=MIN_CONF_DEFAULT) -> Dict[str,Any]:
    if not text or len(text.strip())==0:
        return {"error":"empty"}
    
    # Clean text but preserve line breaks for structure
    text = re.sub(r'\n+', '\n', text)  # Replace multiple newlines with single
    text = re.sub(r'[ \t]+', ' ', text)  # Replace multiple spaces/tabs with single space
    text = text.strip()
    
    lang = detect_language_simple(text)
    chunks = chunk_text(text)
    all_skills = []
    titles = []; companies = []
    locations = set()
    dates = set(); salaries=set(); durations=set()
    emails=set(); urls=set(); phones=set()
    contracts=set()
    docs = []
    
    # create small spaCy docs for NER hints if possible
    for chunk in chunks:
        doc = None
        if nlp_multilingual:
            try:
                doc = nlp_multilingual(chunk)
            except Exception:
                doc = None
        docs.append(doc)
        
        # transform-based skills
        chunk_skills = extract_skills_transformer(chunk)
        all_skills.append(chunk_skills)
        
        # regex extractions
        for e in extract_emails(chunk): emails.add(e)
        for u in extract_urls(chunk): urls.add(u)
        for p in extract_phones(chunk): phones.add(p)
        for d in extract_dates(chunk): dates.add(d)
        for s in extract_salary_matches(chunk): 
            if s and len(s) > 2:  # Filter out very short matches
                salaries.add(s)
        
        # Extract durations using the new function
        chunk_durations = extract_durations(chunk)
        for dur in chunk_durations:
            durations.add(dur)
            
        for ct in detect_contract_type(chunk, lang): contracts.add(ct)
        
        # Extract locations
        chunk_locations = extract_locations(chunk, doc)
        for loc in chunk_locations:
            locations.add(loc)
            
        # titles & companies via heuristics
        t, tc, c, cc = extract_title_and_company(chunk, lang, doc)
        if t: titles.append((t,tc))
        if c: companies.append((c,cc))
    
    # merge skills (choose max score)
    flattened = {}
    for block in all_skills:
        for s in block:
            key = s["skill"].strip().lower()
            score = float(s.get("score", 0.5))
            if key not in flattened or score>flattened[key]['score']:
                flattened[key] = {"skill": s["skill"].strip(), "score": score}
    skills_list = sorted([{"skill":v["skill"], "confidence":v["score"]} for k,v in flattened.items()], key=lambda x:-x["confidence"])

    # merge titles/companies by highest confidence
    selected_title = None; title_conf = 0.0
    for t,tc in titles:
        if tc>title_conf:
            selected_title=t; title_conf=tc
    
    selected_company = None; company_conf=0.0
    for c,cc in companies:
        if cc>company_conf:
            selected_company=c; company_conf=cc

    # Clean company name (remove "Location" etc.)
    if selected_company:
        selected_company = re.sub(r'\s*(?:Lieu|Location|Locations).*$', '', selected_company, flags=re.I).strip()

    # domain inference (improved mapping)
    domain = None
    skill_names = [s["skill"].lower() for s in skills_list]
    skill_text = " ".join(skill_names)
    
    if any(k in skill_text for k in ["machine learning", "nlp", "tensorflow", "pytorch", "data science", "ai", "artificial intelligence", "gpt", "llm"]):
        domain = "Artificial Intelligence"
    elif any(k in skill_text for k in ["react", "angular", "vue", "next.js", "frontend", "javascript", "typescript", "html", "css", "d3.js"]):
        domain = "Web Development"
    elif any(k in skill_text for k in ["cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes", "terraform", "ansible"]):
        domain = "Cloud & DevOps"
    elif any(k in skill_text for k in ["java", "spring boot", "c#", ".net", "python", "backend", "microservices"]):
        domain = "Software Engineering"
    elif any(k in skill_text for k in ["sql", "mysql", "postgresql", "database", "data analysis", "spark", "hadoop"]):
        domain = "Data Engineering"
    elif any(k in skill_text for k in ["blockchain", "ethereum", "solidity", "web3", "smart contract"]):
        domain = "Blockchain & Web3"
    elif any(k in skill_text for k in ["security", "cybersecurity", "cissp", "ceh", "vault", "encryption"]):
        domain = "Cybersecurity"

    result = {
        "fingerprint": fingerprint(text),
        "embedding": compute_embedding(text),
        "raw_text": text,
        "language": lang,
        "job_title": {"value": selected_title, "confidence": round(title_conf,2)},
        "company": {"value": selected_company, "confidence": round(company_conf,2)},
        "location": {"value": list(locations), "confidence": 0.8 if locations else 0.0},
        "contract_type": list(contracts),
        "type": ("Internship" if any(ct.lower() in ("stage","internship","intern","alternance","apprentissage") for ct in contracts) else "Job"),
        "salary": list(salaries),
        "duration": list(durations),
        "deadline": list(dates),
        "contacts": {"emails": list(emails), "urls": list(urls), "phones": list(phones)},
        "skills": skills_list,
        "inferred_domain": domain,
        "metadata": {
            "chunks": len(chunks),
            "text_length": len(text),
            "processed_at": datetime.utcnow().isoformat()
        }
    }
    
    # apply min confidence filter on skills
    if min_conf > 0:
        result["skills"] = [s for s in result["skills"] if s["confidence"] >= min_conf]
    
    return result

# --------- Batch & CLI ---------
def process_file(path: str, outdir: str, min_conf: float):
    text = read_file(path)
    res = process_text(text, min_conf=min_conf)
    base = os.path.splitext(os.path.basename(path))[0]
    out_json = os.path.join(outdir, f"{base}.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2, ensure_ascii=False)
    print(f"Saved {out_json}")
    return res

def aggregate_results(results: List[Dict[str,Any]], outdir: str):
    # compute frequency of skills, contract types, locations
    skill_counter = Counter()
    contract_counter = Counter()
    loc_counter = Counter()
    for r in results:
        for s in r.get("skills",[]):
            skill_counter[s["skill"]] += 1
        for c in r.get("contract_type",[]):
            contract_counter[c] += 1
        for l in r.get("location", {}).get("value", []) if isinstance(r.get("location"), dict) else r.get("location", []):
            loc_counter[l] += 1
    # save aggregate json & csv
    agg = {
        "top_skills": skill_counter.most_common(40),
        "contract_counts": contract_counter.most_common(),
        "locations": loc_counter.most_common()
    }
    with open(os.path.join(outdir, "aggregate.json"), "w", encoding="utf-8") as f:
        json.dump(agg, f, indent=2, ensure_ascii=False)
    print("Saved aggregate.json")
    # plots
    if HAS_MPL:
        # top skills bar
        skills, counts = zip(*skill_counter.most_common(20)) if skill_counter else ([],[])
        if skills:
            plt.figure(figsize=(10,6))
            plt.barh(skills[::-1], counts[::-1])
            plt.title("Top skills")
            plt.tight_layout()
            plt.savefig(os.path.join(outdir, "top_skills.png"))
            plt.close()
        # contract pie
        if contract_counter:
            labels, vals = zip(*contract_counter.items())
            plt.figure(figsize=(6,6))
            plt.pie(vals, labels=labels, autopct="%1.1f%%")
            plt.title("Contract types")
            plt.savefig(os.path.join(outdir, "contracts.png"))
            plt.close()
        # locations bar
        locs, lcounts = zip(*loc_counter.most_common(20)) if loc_counter else ([],[])
        if locs:
            plt.figure(figsize=(10,6))
            plt.barh(locs[::-1], lcounts[::-1])
            plt.title("Top locations")
            plt.tight_layout()
            plt.savefig(os.path.join(outdir, "top_locations.png"))
            plt.close()
        print("Saved charts (top_skills.png, contracts.png, top_locations.png)")

def main():
    parser = argparse.ArgumentParser(description="Advanced extractor for job/internship offers (EN/FR)")
    parser.add_argument("--input", required=True, help="File or folder path to process (.txt or .pdf)")
    parser.add_argument("--outdir", required=True, help="Output directory to save JSON and charts")
    parser.add_argument("--charts", action="store_true", help="Generate aggregate charts")
    parser.add_argument("--min_conf", type=float, default=MIN_CONF_DEFAULT, help="Minimum skill confidence to keep (0-1)")
    args = parser.parse_args()

    os.makedirs(args.outdir, exist_ok=True)
    paths = []
    if os.path.isdir(args.input):
        for fname in os.listdir(args.input):
            if fname.lower().endswith((".txt", ".pdf")):
                paths.append(os.path.join(args.input, fname))
    elif os.path.isfile(args.input):
        paths.append(args.input)
    else:
        print("Input not found:", args.input)
        return

    results = []
    for p in paths:
        print("Processing:", p)
        r = process_file(p, args.outdir, args.min_conf)
        results.append(r)
    if args.charts:
        aggregate_results(results, args.outdir)
    print("Done. Outputs in", args.outdir)

if __name__ == "__main__":
    main()
