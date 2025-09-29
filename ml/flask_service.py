from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import re
from datetime import datetime
from typing import Dict, Any, List
import os
import sys

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
        """Extract location from text"""
        patterns = [
            r'(?:location|based in|office in):\s*([^\n]+)',
            r'(?:remote|hybrid|on-site)',
            r'(?:in|at)\s+([A-Z][^,\n]+(?:,\s*[A-Z][^,\n]+)?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
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
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:per\s+)?(?:hour|hr)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:to|-)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:k|K)?',
            r'(?:salary|compensation|pay):\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) == 2:  # Range
                    return f"${match.group(1)} - ${match.group(2)}"
                else:
                    return f"${match.group(1)}"
        
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
        
        # Read file content
        if file.filename.lower().endswith('.txt'):
            text = file.read().decode('utf-8')
        elif file.filename.lower().endswith('.pdf'):
            # For PDF files, we'll extract text (simplified)
            text = f"PDF file: {file.filename}\n\nThis is a job posting document. Please extract relevant information manually."
        else:
            text = f"Document: {file.filename}\n\nThis is a job posting document. Please extract relevant information manually."
        
        # Extract job information
        result = extractor.extract_job_info(text)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Job Information Extractor Service...")
    print("Available endpoints:")
    print("   GET  /health - Health check")
    print("   POST /api/extract - Extract from text")
    print("   POST /api/batch-extract - Extract from file")
    print("Service will be available at: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)

