# Job Platform Backend

A Spring Boot REST API for a job/internship platform with MySQL persistence.

## Tech Stack

- Spring Boot 3.2.0
- Spring Data JPA (Hibernate)
- MySQL 8.0
- Maven
- Java 17

## Prerequisites

1. **Java 17** or higher
2. **Maven 3.6+**
3. **XAMPP** with MySQL running on port 3306
4. **MySQL Database**: Create a database named `job_platform`

## Database Setup

1. Start XAMPP and ensure MySQL is running
2. Open phpMyAdmin (http://localhost/phpmyadmin)
3. Create a new database named `job_platform`
4. The application will automatically create tables on startup

## Running the Application

1. **Clone and navigate to the project directory:**
   ```bash
   cd job-platform-backend
   ```

2. **Install dependencies:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

4. **The API will be available at:** `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/users` - Get all users (admin only)
- `PUT /auth/users/{id}/activate` - Activate/deactivate user (admin only)

### Postings
- `POST /postings` - Create new posting
- `GET /postings/mine/{posterId}` - Get postings by poster
- `PUT /postings/{id}` - Update posting
- `DELETE /postings/{id}` - Delete posting
- `GET /postings/search` - Search postings with filters
- `GET /postings` - Get all postings
- `GET /postings/{id}` - Get posting by ID

### Favorites
- `POST /favorites` - Add posting to favorites
- `GET /favorites/{seekerId}` - Get seeker's favorites
- `DELETE /favorites/{id}` - Remove favorite
- `DELETE /favorites/by-posting` - Remove favorite by posting

### Admin
- `GET /admin/stats` - Get admin statistics

## Database Schema

### Users Table
- `id` (Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM: POSTER, SEEKER, ADMIN)
- `active` (BOOLEAN)

### Postings Table
- `id` (Primary Key)
- `poster_id` (Foreign Key → Users)
- `title` (VARCHAR)
- `company` (VARCHAR)
- `location` (VARCHAR)
- `contract_type` (VARCHAR)
- `domain` (VARCHAR)
- `skills` (TEXT)
- `salary` (DOUBLE)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

### Favorites Table
- `id` (Primary Key)
- `seeker_id` (Foreign Key → Users)
- `posting_id` (Foreign Key → Postings)
- Unique constraint on (seeker_id, posting_id)

## Example API Usage

### Register a new user
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "POSTER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create a posting
```bash
curl -X POST "http://localhost:8080/postings?posterId=1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Java Developer",
    "company": "Tech Corp",
    "location": "New York",
    "contractType": "full-time",
    "domain": "Technology",
    "skills": "Java, Spring Boot, MySQL",
    "salary": 120000.0,
    "description": "We are looking for an experienced Java developer..."
  }'
```

### Search postings
```bash
curl "http://localhost:8080/postings/search?keyword=java&domain=Technology&location=New York"
```

## CORS Configuration

The application is configured to allow requests from `http://localhost:4200` (Angular frontend).

## Notes

- Passwords are stored as plain text (for simplicity). In production, use proper password hashing.
- The application uses `spring.jpa.hibernate.ddl-auto=update` to automatically create/update database schema.
- All API responses include proper error handling and validation messages.
- The application includes comprehensive logging for debugging.
