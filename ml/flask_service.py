from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
from datetime import datetime
from typing import Dict, Any, List
import os
import sys
from typing import Optional
import traceback
from werkzeug.utils import secure_filename
import tempfile

# Optional OCR/text extraction deps
try:
    import pdfplumber  # For PDF text extraction
except Exception:
    pdfplumber = None
try:
    import docx2txt  # For DOCX text extraction
except Exception:
    docx2txt = None
try:
    from docx import Document  # python-docx as alternative DOCX parser
except Exception:
    Document = None

# Add the current directory to Python path to import app.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app import process_text

app = Flask(__name__)
CORS(app)  # Enable CORS for Spring Boot integration

class JobExtractor:
    def __init__(self):
        self.skills_keywords = [
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'spring boot', 'django', 'flask', 'express', 'mysql', 'postgresql',
            'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
            'machine learning', 'ai', 'data science', 'analytics', 'sql',
            'html', 'css', 'bootstrap', 'tailwind', 'sass', 'less',
            'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'devops',
            'rest api', 'graphql', 'microservices', 'agile', 'scrum',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
            'tableau', 'power bi', 'excel', 'word', 'powerpoint',
            'photoshop', 'illustrator', 'figma', 'sketch', 'adobe',
            'salesforce', 'hubspot', 'marketo', 'seo', 'sem', 'ppc',
            'project management', 'leadership', 'communication', 'teamwork'
        ]
        
        self.contract_types = [
            'full-time', 'part-time', 'contract', 'freelance', 'internship',
            'temporary', 'permanent', 'remote', 'hybrid', 'on-site'
        ]
        
        self.domains = [
            'software development', 'web development', 'mobile development',
            'data science', 'machine learning', 'ai', 'cybersecurity',
            'devops', 'cloud computing', 'database administration',
            'ui/ux design', 'graphic design', 'digital marketing',
            'content marketing', 'seo', 'social media marketing',
            'sales', 'business development', 'project management',
            'product management', 'human resources', 'finance',
            'accounting', 'legal', 'healthcare', 'education',
            'consulting', 'customer service', 'operations'
        ]

    def extract_job_info(self, text: str) -> Dict[str, Any]:
        """Extract job information from text"""
        text_lower = text.lower()
        
        # Extract job title
        job_title = self._extract_job_title(text)
        
        # Extract company
        company = self._extract_company(text)
        
        # Extract location
        location = self._extract_location(text)
        
        # Extract contract type
        contract_type = self._extract_contract_type(text_lower)
        
        # Extract domain
        domain = self._extract_domain(text_lower)
        
        # Extract skills
        skills = self._extract_skills(text_lower)
        
        # Extract salary
        salary = self._extract_salary(text)
        
        # Extract duration
        duration = self._extract_duration(text)
        
        # Extract deadline
        deadline = self._extract_deadline(text)
        
        return {
            'job_title': job_title,
            'company': company,
            'location': location,
            'contract_type': contract_type,
            'domain': domain,
            'skills': skills,
            'salary': salary,
            'duration': duration,
            'deadline': deadline,
            'inferred_domain': domain,
            'extraction_confidence': self._calculate_confidence(text, job_title, company, skills)
        }

    def _extract_job_title(self, text: str) -> str:
        """Extract job title from text"""
        # Look for common job title patterns
        patterns = [
            r'(?:job title|position|role):\s*([^\n]+)',
            r'(?:we are looking for|seeking|hiring)\s+(?:a\s+)?([^,\n]+)',
            r'(?:title|position):\s*([^\n]+)',
            r'^([A-Z][^.\n]{10,50})\s*(?:job|position|role)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        
        # Fallback: look for capitalized words at the beginning
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            if len(line.strip()) > 10 and line.strip()[0].isupper():
                return line.strip()
        
        return "Software Developer"  # Default fallback

    def _extract_company(self, text: str) -> str:
        """Extract company name from text"""
        patterns = [
            r'(?:company|organization|firm):\s*([^\n]+)',
            r'(?:at|@)\s+([A-Z][^,\n]+)',
            r'(?:we|our company|our organization)\s+([A-Z][^,\n]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Look for capitalized words that might be company names
        words = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
        if words:
            return words[0]
        
        return "Tech Company"  # Default fallback

    def _extract_location(self, text: str) -> str:
        """Extract location from text (robust to patterns without capture groups)"""
        patterns = [
            r'(?:location|based in|office in):\s*([^\n]+)',
            r'(?:remote|hybrid|on-site)',
            r'(?:in|at)\s+([A-Z][^,\n]+(?:,\s*[A-Z][^,\n]+)?)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # If the regex has a capturing group, use it; otherwise, use the whole match
                try:
                    if match.lastindex and match.lastindex >= 1:
                        return match.group(1).strip()
                    return match.group(0).strip()
                except Exception:
                    # Safe fallback
                    return match.group(0)

        # Look for common location patterns
        location_pattern = r'\b(?:New York|San Francisco|Los Angeles|Chicago|Boston|Seattle|Austin|Denver|Miami|London|Paris|Berlin|Tokyo|Singapore|Toronto|Vancouver|Remote|Hybrid|On-site)\b'
        match = re.search(location_pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)

        return "Remote"  # Default fallback

    def _extract_contract_type(self, text_lower: str) -> str:
        """Extract contract type from text"""
        for contract_type in self.contract_types:
            if contract_type in text_lower:
                return contract_type.title()
        
        # Default based on keywords
        if 'intern' in text_lower:
            return 'Internship'
        elif 'part' in text_lower:
            return 'Part-time'
        elif 'contract' in text_lower:
            return 'Contract'
        elif 'freelance' in text_lower:
            return 'Freelance'
        else:
            return 'Full-time'  # Default

    def _extract_domain(self, text_lower: str) -> str:
        """Extract domain from text"""
        for domain in self.domains:
            if domain in text_lower:
                return domain.title()
        
        # Infer from skills
        if any(skill in text_lower for skill in ['python', 'java', 'javascript', 'react', 'angular']):
            return 'Software Development'
        elif any(skill in text_lower for skill in ['data', 'analytics', 'machine learning', 'ai']):
            return 'Data Science'
        elif any(skill in text_lower for skill in ['design', 'ui', 'ux', 'photoshop']):
            return 'Design'
        else:
            return 'Technology'  # Default

    def _extract_skills(self, text_lower: str) -> List[str]:
        """Extract skills from text"""
        found_skills = []
        
        for skill in self.skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        # Remove duplicates and limit to top 10
        unique_skills = list(dict.fromkeys(found_skills))
        return unique_skills[:10]

    def _extract_salary(self, text: str) -> str:
        """Extract salary information from text"""
        patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(?:year|annually|yr)',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(?:month|mo)',
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(?:hour|hr)',
            r'(?:salary|compensation|pay)\s*:?\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3})(?:k|K)\b',  # e.g., 120k
            r'\$\s?(\d{1,3}(?:,\d{3})*)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                # Prevent misclassifying duration or dates as salary
                window_start = max(match.start() - 20, 0)
                window_end = min(match.end() + 20, len(text))
                context = text[window_start:window_end].lower()
                if 'month' in context or 'months' in context:
                    continue
                if re.search(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', context):
                    continue
                if re.search(r'\b\d{4}-\d{2}-\d{2}\b', context):
                    continue

                if len(match.groups()) == 2:  # Range like 50 - 70
                    return f"${match.group(1)} - ${match.group(2)}"

                val = match.group(1)
                # Normalize k-suffix 
                if re.fullmatch(r'\d{1,3}', val) and re.search(r'k\b', match.group(0), re.IGNORECASE):
                    try:
                        return f"${int(val) * 1000}"
                    except Exception:
                        pass
                return f"${val}"
        
        return "Competitive"  # Default fallback

    def _extract_duration(self, text: str) -> str:
        """Extract duration from text"""
        patterns = [
            r'(\d+)\s*(?:months?|weeks?|days?|years?)',
            r'(?:duration|length):\s*(\d+\s*(?:months?|weeks?|days?|years?))',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return "6 months"  # Default fallback

    def _extract_deadline(self, text: str) -> str:
        """Extract deadline from text"""
        patterns = [
            r'(?:deadline|due date|apply by):\s*([^\n]+)',
            r'(?:before|by)\s+([^\n]+)',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return "Open until filled"  # Default fallback

    def _calculate_confidence(self, text: str, job_title: str, company: str, skills: List[str]) -> float:
        """Calculate extraction confidence score"""
        score = 0.0
        
        if job_title and job_title != "Software Developer":
            score += 0.3
        if company and company != "Tech Company":
            score += 0.2
        if skills:
            score += min(0.3, len(skills) * 0.05)
        if len(text) > 100:
            score += 0.2
        
        return min(1.0, score)

# Initialize extractor
extractor = JobExtractor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Job Information Extractor',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/extract', methods=['POST'])
def extract_text():
    """Extract job information from text using app.py model"""
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({'error': 'Text field is required'}), 400
        
        text = data['text']
        if not text.strip():
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Use the advanced app.py model for extraction
        result = process_text(text, min_conf=0.3)
        
        # Return the full result from app.py without transformation
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/batch-extract', methods=['POST'])
def extract_file():
    """Extract job information from uploaded file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        filename_lower = file.filename.lower()
        safe_name = secure_filename(file.filename)
        print(f"/api/batch-extract received file: name={safe_name}, content_type={getattr(file, 'content_type', None)}, mimetype={getattr(file, 'mimetype', None)}")

        # Read file content with best-effort extraction
        if filename_lower.endswith('.txt'):
            try:
                text = file.read().decode('utf-8', errors='ignore')
            finally:
                try:
                    file.stream.seek(0)
                except Exception:
                    pass
        elif filename_lower.endswith('.pdf'):
            # Use OCR/text extraction for PDFs if available
            text = ""
            try:
                if pdfplumber is not None:
                    try:
                        file.stream.seek(0)
                    except Exception:
                        pass
                    with pdfplumber.open(file.stream) as pdf:
                        pages_text = []
                        for page in pdf.pages:
                            page_text = page.extract_text() or ""
                            pages_text.append(page_text)
                        text = "\n".join(pages_text).strip()
                # Fallback placeholder if empty or pdfplumber not available
                if not text:
                    text = f"PDF file: {file.filename}\n\n(No OCR module available or empty text extracted.)"
            except Exception as e:
                print("PDF extraction error:", str(e))
                traceback.print_exc()
                text = f"PDF file: {file.filename}\n\n(OCR failed: {str(e)})"
        elif filename_lower.endswith('.docx'):
            try:
                if Document is not None:
                    try:
                        file.stream.seek(0)
                    except Exception:
                        pass
                    doc = Document(file.stream)
                    paragraphs = [p.text for p in doc.paragraphs if p.text]
                    text = "\n".join(paragraphs).strip()
                    if not text:
                        text = f"DOCX file: {file.filename}\n\n(Empty document or no extractable text)"
                elif docx2txt is not None:
                    # Save to a temporary file path for docx2txt to process
                    try:
                        file.stream.seek(0)
                    except Exception:
                        pass
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.docx') as tmp:
                        tmp.write(file.read())
                        tmp_path = tmp.name
                    try:
                        extracted = docx2txt.process(tmp_path) or ""
                        text = extracted.strip() if extracted else f"DOCX file: {file.filename}\n\n(Empty document or no extractable text)"
                    finally:
                        try:
                            os.remove(tmp_path)
                        except Exception:
                            pass
                else:
                    text = f"DOCX file: {file.filename}\n\n(Install python-docx or docx2txt to enable DOCX parsing.)"
            except Exception as e:
                print("DOCX parsing error:", str(e))
                traceback.print_exc()
                text = f"DOCX file: {file.filename}\n\n(Parsing failed: {str(e)})"
        elif filename_lower.endswith('.doc'):
            text = f"DOC file: {file.filename}\n\n(Parsing for .doc not implemented; convert to PDF or DOCX.)"
        else:
            # Generic fallback
            text = f"Document: {file.filename}\n\n(Unsupported type; provide TXT/PDF/DOCX for best results.)"
        
        # Extract job information
        try:
            result = extractor.extract_job_info(text)
        except Exception as ex:
            print("extract_job_info error:", str(ex))
            traceback.print_exc()
            return jsonify({'error': f'extraction failed: {str(ex)}', 'raw_text': text}), 500

        # Ensure raw_text and language are present for backend consumption
        result['raw_text'] = text
        result['language'] = result.get('language', 'en')
        
        return jsonify(result)
    
    except Exception as e:
        print("/api/batch-extract unhandled error:", str(e))
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Job Information Extractor Service...")
    print("Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /api/extract - Extract from text")
    print("   POST /api/batch-extract - Extract from file")
    print("Service will be available at: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

