-- Clear existing data
DELETE FROM applications;
DELETE FROM job_offers;
DELETE FROM users;

-- Reset auto-increment counters
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE job_offers AUTO_INCREMENT = 1;
ALTER TABLE applications AUTO_INCREMENT = 1;

-- Create example users
INSERT INTO users (name, email, password, role, is_active, created_at) VALUES
('John Smith', 'john.smith@email.com', '$2a$10$example', 'SEEKER', true, '2024-01-15 10:00:00'),
('Sarah Johnson', 'sarah.johnson@email.com', '$2a$10$example', 'OFFERER', true, '2024-01-20 14:30:00');

-- Create job offers with different dates and titles
INSERT INTO job_offers (offerer_id, title, company, location, contract_type, domain, skills, salary, duration, deadline, description, raw_text, extracted_data, is_active, created_at) VALUES
(2, 'Cloud Solutions Architect', 'MegaCorp Digital', 'Paris, France', 'Full-time', 'Cloud Computing', 'AWS, Azure, Kubernetes, DevOps', '€95,000 - €120,000', 'Permanent', '2024-12-15', 'Senior cloud architect position for digital transformation', 'POSTE : Architecte Solutions Cloud Hybrides & DevOps
ENTREPRISE : MegaCorp Digital Transformation (Filiale du CAC 40)
LIEUX : Multi-sites (Paris-La Défense, Lyon, Toulouse) + Télétravail Flexible + Clientèle Internationale

DESCRIPTIF COMPLEXE :
Notre département Digital Innovation recherche un architecte pour piloter la transformation cloud 
de 5 business units simultanément, avec des contraintes réglementaires multiples (ANSSI, FedRAMP, HIPAA).

Environnement Technique Hétérogène :
- Cloud Public : AWS (60%), Azure (30%), Google Cloud (10%)
- On-Premise : VMware, OpenStack, systèmes legacy mainframe
- Containers : OpenShift, Rancher, Kubernetes (multi-cluster)
- DevOps : GitLab CI/CD, ArgoCD, Tekton, Spinnaker
- Monitoring : Dynatrace, AppDynamics, New Relic, Datadog
- Sécurité : HashiCorp Vault, Aqua Security, Prisma Cloud

Responsabilités Transverses :
- Design d''architectures multi-cloud avec réplication de données transatlantique
- Migration de workloads sensibles (données santé, financières)
- Optimisation des coûts cloud (budget annuel : 4M€)
- Formation et coaching de 15 équipes de développement
- Veille technologique et proof-of-concepts innovants

Exigences Spécifiques :
- 8+ ans d''expérience en architecture enterprise
- Certifications : AWS Solutions Architect Professional, Kubernetes CKA/CKS
- Expérience en management d''équipes pluridisciplinaires
- Maîtrise des frameworks ITIL, Agile SAFe, DevOps DASA
- Langues : Français courant, Anglais business, Allemand apprécié

Package Rémunération Haut de Gamme :
- Salaire annuel brut : 95 000 € - 120 000 € (selon profil)
- Bonus performance : 20% - 30% du fixe
- Intéressement : 10 000 € - 15 000 € annuels
- Voiture de fonction électrique (Tesla Model 3 ou équivalent)
- Abonnement premium transport + électroménager connecté
- CSE avantageux (600 €/an culture + 800 €/an vacances)

Processus de Recrutement :
- Phase 1 : Screening RH (30 min)
- Phase 2 : Cas technique architecture (4h)
- Phase 3 : Présentation au comité directeur (1h)
- Phase 4 : Négociation package avec DRH

Dates Clés :
- Publication : 10/11/2024
- Clôture des candidatures : 15/12/2024
- Début de mission : 06/01/2025 ou 03/02/2025

Contacts Professionnels :
- Responsable Recrutement : Marie Dubois - mdubois@megacorp-digital.com
- Réseaux : LinkedIn MegaCorp Digital Transformation
- Tel : 01 47 65 89 32 (Poste 245)', '{"job_title":{"value":"Architecte Solutions Cloud Hybrides & DevOps","confidence":0.95},"company":{"value":"MegaCorp Digital Transformation","confidence":0.95},"location":{"value":["Paris-La Défense","Lyon","Toulouse"],"confidence":0.9},"contract_type":["Full-time"],"salary":["€95,000 - €120,000"],"skills":[{"skill":"AWS","confidence":0.9},{"skill":"Azure","confidence":0.9},{"skill":"Kubernetes","confidence":0.8},{"skill":"DevOps","confidence":0.8}]}', true, '2024-11-10 09:00:00'),

(2, 'Python Data Science Intern', 'TechNova Solutions', 'Paris, France', 'Internship', 'Data Science', 'Python, Pandas, SQL, Machine Learning', '€1,200/month', '6 months', '2024-10-15', 'Data science internship for students', 'Titre du poste : Stagiaire Développeur Python / Data
Entreprise : TechNova Solutions
Lieu : Paris, France

Nous recherchons un(e) stagiaire motivé(e) pour rejoindre notre équipe Data Science.
Missions principales :
- Développement de scripts en Python pour automatiser le traitement de données
- Manipulation de bases SQL et nettoyage de données
- Contribution à des modèles de Machine Learning (NLP, classification)

Profil recherché :
- Étudiant(e) en informatique ou équivalent
- Connaissances en Python, Pandas, SQL
- Intérêt pour l''intelligence artificielle et le Machine Learning

Type de contrat : Stage de 6 mois
Début : 15/10/2025
Rémunération : 1200 € / mois
Contact : recrutement@technova.fr', '{"job_title":{"value":"Stagiaire Développeur Python / Data","confidence":0.95},"company":{"value":"TechNova Solutions","confidence":0.95},"location":{"value":["Paris, France"],"confidence":0.9},"contract_type":["Internship"],"salary":["€1,200/month"],"skills":[{"skill":"Python","confidence":0.9},{"skill":"Pandas","confidence":0.8},{"skill":"SQL","confidence":0.8},{"skill":"Machine Learning","confidence":0.8}]}', true, '2024-10-05 14:20:00'),

(2, 'Software Engineer Intern', 'GlobalSoft Ltd', 'London, UK', 'Internship', 'Software Development', 'Java, Spring Boot, React, TypeScript', '£1,200/month', '3 months', '2024-11-01', 'Software engineering internship', 'Job Title: Software Engineer Intern
Company: GlobalSoft Ltd
Location: London, United Kingdom

We are looking for a passionate intern to join our software engineering team.
Responsibilities include:
- Building REST APIs with Java and Spring Boot
- Collaborating with frontend developers (React, TypeScript)
- Writing unit tests and improving CI/CD pipelines

Requirements:
- Undergraduate in Computer Science or related field
- Strong knowledge of Java
- Familiarity with Docker and Kubernetes is a plus

Contract Type: Internship, 3 months
Start Date: 2025-11-01
Salary: £1,200 per month
Please send your CV to hr@globalsoft.co.uk', '{"job_title":{"value":"Software Engineer Intern","confidence":0.95},"company":{"value":"GlobalSoft Ltd","confidence":0.95},"location":{"value":["London, United Kingdom"],"confidence":0.9},"contract_type":["Internship"],"salary":["£1,200/month"],"skills":[{"skill":"Java","confidence":0.9},{"skill":"Spring Boot","confidence":0.8},{"skill":"React","confidence":0.8},{"skill":"TypeScript","confidence":0.8}]}', true, '2024-09-25 11:15:00'),

(2, 'Data Science & DevOps Intern', 'Quantum Analytics Group', 'Boston, MA', 'Internship', 'Data Science', 'Python, R, SQL, Machine Learning, DevOps', '$4,500-$5,200/month', '6-12 months', '2025-03-15', 'Dual role internship in data science and DevOps', 'Position: Data Science & DevOps Intern (Dual Role)
Organization: Quantum Analytics Group - A subsidiary of TechGlobal Partners LLC
Locations: Multiple - Boston, MA (HQ) | London, UK | Singapore | Hybrid Options

Internship Program Details:
This is a unique 6-12 month rotational internship exposing candidates to both data science and infrastructure domains.

Technical Stack Exposure:
- Machine Learning: Scikit-learn, XGBoost, LightGBM, Hugging Face transformers
- Big Data: Apache Spark, Hadoop, Databricks, Snowflake
- DevOps: Terraform, Ansible, Prometheus, Grafana, ELK stack
- Cloud: Multi-cloud (AWS, GCP, Azure) with focus on Azure ML Services
- Databases: MongoDB, Cassandra, Redis, Neo4j

Project Rotations:
1. Predictive maintenance for IoT devices (Python, TensorFlow, Kafka)
2. Real-time anomaly detection in financial transactions
3. Infrastructure-as-code implementation for client deployments

Requirements:
- Current MSc/PhD student in Data Science, Computer Engineering, or related field
- Proficiency in Python, R, SQL, Bash scripting
- Familiarity with Git, Linux administration, network protocols
- GPA 3.5+ required

Stipend & Perks:
- Monthly stipend: $4,500 - $5,200 (based on location and experience)
- Housing allowance: $1,500/month if relocating
- Travel budget for conferences: $3,000
- Mentorship from senior data scientists and architects

Duration: 6 months (extendable to 12)
Start: June 1, 2025 or September 1, 2025
Application: Rolling admissions until March 15, 2025

Contact: internship.coordinator@quantumanalytics.io | http://quantum-analytics.org/internships
Reference Code: QAG-DS-DEVOPS-2025', '{"job_title":{"value":"Data Science & DevOps Intern","confidence":0.95},"company":{"value":"Quantum Analytics Group","confidence":0.95},"location":{"value":["Boston, MA","London, UK","Singapore"],"confidence":0.9},"contract_type":["Internship"],"salary":["$4,500-$5,200/month"],"skills":[{"skill":"Python","confidence":0.9},{"skill":"R","confidence":0.8},{"skill":"SQL","confidence":0.8},{"skill":"Machine Learning","confidence":0.8},{"skill":"DevOps","confidence":0.8}]}', true, '2024-08-20 16:45:00'),

(2, 'Senior Full-Stack Developer & AI Specialist', 'InnovateTech Solutions', 'Remote (Global)', 'Full-time', 'Software Development', 'Python, JavaScript, React, AI/ML, Blockchain', '$145,000-$185,000', 'Permanent', '2024-12-31', 'Senior developer role with AI specialization', 'Job Title: Senior Full-Stack Developer & AI Specialist
Company: InnovateTech Solutions Inc. (NYSE: INVT)
Location: Remote (Global) with optional offices in San Francisco, CA or Austin, TX

About Us: We''re a rapidly scaling fintech startup revolutionizing blockchain-based payment solutions. 
We process over $2B+ annually and are backed by Sequoia Capital.

Position Overview:
We seek a versatile developer to lead our AI integration initiatives while maintaining core platform development.

Key Responsibilities:
- Develop and deploy machine learning models using PyTorch and TensorFlow
- Architect microservices with Python FastAPI and Node.js
- Implement real-time data pipelines with Apache Kafka and Airflow
- Optimize PostgreSQL databases handling 10M+ records
- Containerize applications using Docker and orchestrate with Kubernetes on AWS EKS
- Implement CI/CD with GitHub Actions and Jenkins

Technical Requirements:
- 5+ years with Python, JavaScript/TypeScript, React, Vue.js
- Expertise in AWS (EC2, S3, RDS, Lambda), Azure, or GCP
- Experience with blockchain technologies (Ethereum, Solidity)
- Master''s degree in Computer Science or equivalent

Compensation & Benefits:
- Base Salary: $145,000 - $185,000 annually
- Equity: 0.1% - 0.5% stock options
- Bonus: 15-25% performance-based
- Benefits: Full medical, dental, vision; 401(k) with 5% matching

Contract: Full-time, Permanent
Start Date: Flexible between 2025-01-15 and 2025-02-28
Application Deadline: 2024-12-31

Contact: careers+dev@innovatetech.com | https://innovatetech.com/careers/senior-dev
Phone: +1 (415) 555-7890', '{"job_title":{"value":"Senior Full-Stack Developer & AI Specialist","confidence":0.95},"company":{"value":"InnovateTech Solutions Inc.","confidence":0.95},"location":{"value":["Remote (Global)","San Francisco, CA","Austin, TX"],"confidence":0.9},"contract_type":["Full-time"],"salary":["$145,000-$185,000"],"skills":[{"skill":"Python","confidence":0.9},{"skill":"JavaScript","confidence":0.9},{"skill":"React","confidence":0.8},{"skill":"AI/ML","confidence":0.8},{"skill":"Blockchain","confidence":0.7}]}', true, '2024-07-15 13:30:00'),

(2, 'Frontend Developer', 'TechStart Inc', 'New York, NY', 'Full-time', 'Web Development', 'React, TypeScript, CSS, HTML', '$80,000-$100,000', 'Permanent', '2024-11-30', 'Frontend developer position', 'Job Title: Frontend Developer
Company: TechStart Inc
Location: New York, NY

We are looking for a skilled Frontend Developer to join our growing team.

Responsibilities:
- Develop user-facing features using React and TypeScript
- Build reusable components and front-end libraries
- Optimize applications for maximum speed and scalability
- Collaborate with back-end developers and web designers

Requirements:
- 3+ years of experience with React and TypeScript
- Strong knowledge of CSS, HTML, and JavaScript
- Experience with modern frontend build tools
- Bachelor''s degree in Computer Science or related field

Salary: $80,000 - $100,000
Benefits: Health insurance, 401(k), flexible PTO
Start Date: Immediate
Contact: careers@techstart.com', '{"job_title":{"value":"Frontend Developer","confidence":0.95},"company":{"value":"TechStart Inc","confidence":0.95},"location":{"value":["New York, NY"],"confidence":0.9},"contract_type":["Full-time"],"salary":["$80,000-$100,000"],"skills":[{"skill":"React","confidence":0.9},{"skill":"TypeScript","confidence":0.9},{"skill":"CSS","confidence":0.8},{"skill":"HTML","confidence":0.8}]}', true, '2024-06-10 10:00:00');

-- Create applications with different dates
INSERT INTO applications (seeker_id, job_offer_id, status, created_at) VALUES
(1, 1, 'PENDING', '2024-11-12 14:30:00'),
(1, 2, 'ACCEPTED', '2024-10-08 09:15:00'),
(1, 3, 'REJECTED', '2024-09-28 16:45:00'),
(1, 4, 'PENDING', '2024-08-25 11:20:00'),
(1, 5, 'ACCEPTED', '2024-07-20 13:10:00'),
(1, 6, 'PENDING', '2024-06-15 15:30:00');
