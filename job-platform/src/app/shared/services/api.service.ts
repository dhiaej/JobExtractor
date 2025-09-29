import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface JobOffer {
  id: number;
  title: string;
  company: string;
  location: string;
  contractType: string;
  domain: string;
  skills: string[];
  salary: string;
  duration: string;
  deadline: string;
  description: string;
  rawText: string;
  offererId: number;
  offererName: string;
  isActive: boolean;
  createdAt: string;
}

export interface Application {
  id: number;
  seekerId: number;
  seekerName: string;
  seekerEmail: string;
  jobOfferId: number;
  jobTitle: string;
  company: string;
  status: string;
  createdAt: string;
}

// Lightweight job offer for poster views
export interface JobOfferLite {
  id: number;
  offererId: number;
  title: string;
  createdAt: string;
  isActive: boolean;
  rawText: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface JobOfferRequest {
  title: string;
  company: string;
  location: string;
  contractType: string;
  domain: string;
  skills: string;
  salary: string;
  duration: string;
  deadline: string;
  description: string;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/auth/me`);
  }

  // Job Offer endpoints
  getAllJobOffers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/job-offers`)
      .pipe(
        map(response => response.content || response)
      );
  }

  searchJobOffers(keyword?: string, domain?: string, location?: string, contractType?: string): Observable<any> {
    let params = new HttpParams();
    if (keyword) params = params.set('keyword', keyword);
    if (domain) params = params.set('domain', domain);
    if (location) params = params.set('location', location);
    if (contractType) params = params.set('contractType', contractType);
    
    return this.http.get<any>(`${this.baseUrl}/api/job-offers/search`, { params });
  }

  getJobOffersByOfferer(offererId: number): Observable<JobOffer[]> {
    return this.http.get<any>(`${this.baseUrl}/api/job-offers/offerer/${offererId}`)
      .pipe(
        map(response => response.content || response)
      );
  }

  // Lite endpoint returning minimal fields for poster UI
  getJobOffersByOffererLite(offererId: number): Observable<JobOfferLite[]> {
    return this.http.get<any>(`${this.baseUrl}/api/job-offers/offerer/${offererId}/lite`)
      .pipe(
        map(response => response.content || response)
      );
  }

  getJobOfferById(id: number): Observable<JobOffer> {
    return this.http.get<JobOffer>(`${this.baseUrl}/api/job-offers/${id}`);
  }

  createJobOffer(jobOffer: JobOfferRequest): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.baseUrl}/api/job-offers`, jobOffer);
  }

  createJobOfferFromForm(formData: FormData): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.baseUrl}/api/job-offers`, formData);
  }

  updateJobOffer(id: number, jobOffer: Partial<JobOfferRequest>): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.baseUrl}/api/job-offers/${id}`, jobOffer);
  }

  // Update only active status
  updateJobOfferStatus(id: number, isActive: boolean): Observable<JobOffer> {
    return this.http.put<JobOffer>(`${this.baseUrl}/api/job-offers/${id}/status`, { isActive });
  }

  deleteJobOffer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/job-offers/${id}`);
  }


  // File upload for job extraction
  uploadJobFile(file: File): Observable<JobOffer> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<JobOffer>(`${this.baseUrl}/api/job-offers/upload`, formData);
  }

  // File upload with offerer ID
  uploadJobFileWithOfferer(formData: FormData): Observable<JobOffer> {
    return this.http.post<JobOffer>(`${this.baseUrl}/api/job-offers/upload`, formData);
  }

  // Extract from text using Flask service directly
  extractFromText(text: string): Observable<any> {
    return this.http.post<any>('http://localhost:5000/api/extract', { text });
  }

  // Application endpoints
  applyToJob(jobOfferId: number, seekerId: number): Observable<Application> {
    return this.http.post<Application>(`${this.baseUrl}/api/applications/apply?seekerId=${seekerId}&jobOfferId=${jobOfferId}`, {});
  }

  getApplicationsBySeeker(seekerId: number): Observable<Application[]> {
    return this.http.get<any>(`${this.baseUrl}/api/applications/seeker/${seekerId}`)
      .pipe(
        map(response => response.content || response)
      );
  }

  getApplicationsByOfferer(offererId: number): Observable<Application[]> {
    return this.http.get<any>(`${this.baseUrl}/api/applications/offerer/${offererId}`)
      .pipe(
        map(response => response.content || response)
      );
  }

  updateApplicationStatus(applicationId: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/api/applications/${applicationId}/status?status=${status}`, {});
  }

  // Admin endpoints
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/users`);
  }

  updateUserStatus(userId: number, isActive: boolean): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/admin/users/${userId}/status`, { isActive });
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`);
  }

  // Extractor endpoints
  extractJobInfo(text: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/extractor/extract`, { text });
  }

  extractFromFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/extractor/extract-file`, formData);
  }
}
