# JobExtractor - AI-Powered Job Information Extraction Platform

A comprehensive full-stack application that uses advanced NLP and machine learning to automatically extract structured information from job postings and internship offers. The platform supports multiple languages (English/French) and provides intelligent skill extraction, contract type detection, and domain classification.

## 🚀 Features

### Core Functionality
- **Intelligent Text Extraction**: Automatically extracts job information from PDF, DOCX, and text files
- **Multi-language Support**: Handles both English and French job postings
- **Advanced NLP**: Uses transformer models and spaCy for sophisticated text analysis
- **Skill Extraction**: Identifies technical skills with confidence scores
- **Contract Type Detection**: Automatically categorizes job types (CDI, CDD, Full-time, Part-time, etc.)
- **Domain Classification**: Infers job domains (AI, Web Development, Cloud & DevOps, etc.)
- **Contact Information**: Extracts emails, phone numbers, and URLs
- **Salary & Duration**: Identifies compensation and contract duration

### Platform Components
- **Frontend**: Angular 16 with Material Design
- **Backend**: Spring Boot 3.2 with JPA/Hibernate
- **ML Service**: Flask API with advanced NLP models
- **Database**: MySQL for data persistence

## 🏗️ Architecture

```
JobExtractor/
├── job-platform/              # Angular Frontend
│   ├── src/app/
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Authentication
│   │   ├── poster/            # Job poster interface
│   │   ├── seeker/            # Job seeker interface
│   │   └── shared/          # Shared components
│   └── package.json
├── job-platform-backend/      # Spring Boot API
│   ├── src/main/java/com/jobplatform/
│   │   ├── controller/        # REST controllers
│   │   ├── entity/           # JPA entities
│   │   ├── service/          # Business logic
│   │   └── repository/       # Data access
│   └── pom.xml
└── ml/                        # Machine Learning Service
    ├── app.py                # Core NLP extraction logic
    ├── flask_service.py     # Flask API wrapper
    └── requirements.txt     # Python dependencies
```

## 🛠️ Technology Stack

### Frontend
- **Angular 16** - Modern web framework
- **Angular Material** - UI component library
- **Chart.js** - Data visualization
- **TypeScript** - Type-safe JavaScript

### Backend
- **Spring Boot 3.2** - Java framework
- **Spring Data JPA** - Database abstraction
- **MySQL 8.0** - Relational database
- **Maven** - Dependency management

### Machine Learning
- **Python 3.12** - Core ML language
- **Flask** - Lightweight web framework
- **Transformers** - Hugging Face models
- **spaCy** - NLP processing
- **Sentence Transformers** - Text embeddings
- **PDFplumber** - PDF text extraction
- **PyTesseract** - OCR capabilities

## 📋 Prerequisites

- **Java 17+**
- **Node.js 18+**
- **Python 3.12+**
- **MySQL 8.0+**
- **Maven 3.9+**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd JobExtractor
```

### 2. Database Setup
```sql
CREATE DATABASE job_platform;
CREATE USER 'jobuser'@'localhost' IDENTIFIED BY 'jobpass';
GRANT ALL PRIVILEGES ON job_platform.* TO 'jobuser'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup (Spring Boot)
```bash
cd job-platform-backend
mvn clean install
mvn spring-boot:run
```
The API will be available at `http://localhost:8080`

### 4. ML Service Setup (Python)
```bash
cd ml
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python flask_service.py
```
The ML service will be available at `http://localhost:5000`

### 5. Frontend Setup (Angular)
```bash
cd job-platform
npm install
ng serve
```
The frontend will be available at `http://localhost:4200`

## 🔧 Configuration

### Backend Configuration
Update `application.properties` in `job-platform-backend/src/main/resources/`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/job_platform
spring.datasource.username=jobuser
spring.datasource.password=jobpass
spring.jpa.hibernate.ddl-auto=update
```

### ML Service Configuration
The ML service automatically downloads required models on first run:
- **Skill Model**: `jjzha/jobberta-base` (for skill extraction)
- **Embedding Model**: `all-MiniLM-L6-v2` (for text embeddings)
- **spaCy Models**: `xx_ent_wiki_sm` (for NER)

## 📖 API Documentation

### Backend Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/job-offers` - List job offers
- `POST /api/job-offers` - Create job offer
- `POST /api/extractor/extract` - Extract from text
- `POST /api/extractor/extract-file` - Extract from file

### ML Service Endpoints
- `GET /health` - Health check
- `POST /api/extract` - Extract job information from text
- `POST /api/batch-extract` - Extract from uploaded file

## 🎯 Usage Examples

### Extract from Text
```bash
curl -X POST http://localhost:5000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "We are looking for a Python Developer at TechCorp..."}'
```

### Extract from File
```bash
curl -X POST http://localhost:5000/api/batch-extract \
  -F "file=@job_posting.pdf"
```

## 🧠 Machine Learning Features

### Advanced NLP Capabilities
- **Language Detection**: Automatically detects English/French content
- **Named Entity Recognition**: Extracts locations, organizations, and people
- **Skill Classification**: Uses transformer models for accurate skill identification
- **Text Embeddings**: Generates vector representations for similarity matching
- **Confidence Scoring**: Provides reliability metrics for extracted information

### Supported File Formats
- **PDF**: Text extraction with OCR fallback
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text files
- **DOC**: Legacy Word documents (conversion required)

## 🎨 Frontend Features

### User Roles
- **Job Seekers**: Browse and apply to job offers
- **Job Posters**: Create and manage job postings
- **Administrators**: Platform management and analytics

### Key Components
- **Dashboard**: Analytics and overview
- **Job Browser**: Search and filter job offers
- **Application Management**: Track applications
- **Profile Management**: User account settings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Data sanitization and validation
- **File Upload Security**: Secure file handling

## 📊 Data Models

### Job Offer Entity
```java
@Entity
public class JobOffer {
    private Long id;
    private String title;
    private String company;
    private String location;
    private String contractType;
    private String domain;
    private String skills;        // JSON array
    private String salary;
    private String duration;
    private String deadline;
    private String description;
    private String rawText;
    private String extractedData; // Full ML extraction result
    private String contacts;      // JSON object
    private String language;
    private String type;          // "Job" or "Internship"
}
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd job-platform
ng build --prod

# Backend
cd job-platform-backend
mvn clean package
java -jar target/job-platform-backend-0.0.1-SNAPSHOT.jar

# ML Service
cd ml
pip install -r requirements.txt
gunicorn flask_service:app
```

### Docker Deployment
```dockerfile
# Example Dockerfile for ML service
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "flask_service.py"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for transformer models
- **spaCy** for NLP processing
- **Angular Team** for the frontend framework
- **Spring Team** for the backend framework


---

**JobExtractor** - Making job information extraction intelligent and efficient! 🚀
