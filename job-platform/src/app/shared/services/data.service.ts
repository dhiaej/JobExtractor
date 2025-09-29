import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { JobPosting, JobSearchFilters } from '../models/job.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private jobPostingsSubject = new BehaviorSubject<JobPosting[]>([]);
  public jobPostings$ = this.jobPostingsSubject.asObservable();

  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    // Initialize with empty data - components should use ApiService instead
    this.jobPostingsSubject.next([]);
    this.usersSubject.next([]);
  }

  // Job Posting Methods - DEPRECATED: Use ApiService instead
  getJobPostings(): Observable<JobPosting[]> {
    return this.jobPostings$;
  }

  getJobPostingById(id: string): JobPosting | undefined {
    return undefined; // Use ApiService.getJobOfferById() instead
  }

  createJobPosting(jobPosting: Omit<JobPosting, 'id' | 'createdAt' | 'isActive'>): Observable<JobPosting> {
    // Use ApiService.createJobOffer() instead
    return new Observable(observer => {
      observer.error('Use ApiService.createJobOffer() instead');
      observer.complete();
    });
  }

  updateJobPosting(id: string, updates: Partial<JobPosting>): Observable<JobPosting | null> {
    // Use ApiService.updateJobOffer() instead
    return new Observable(observer => {
      observer.error('Use ApiService.updateJobOffer() instead');
      observer.complete();
    });
  }

  deleteJobPosting(id: string): Observable<boolean> {
    // Use ApiService.deleteJobOffer() instead
    return new Observable(observer => {
      observer.error('Use ApiService.deleteJobOffer() instead');
      observer.complete();
    });
  }

  searchJobPostings(filters: JobSearchFilters): Observable<JobPosting[]> {
    // Use ApiService.searchJobOffers() instead
    return new Observable(observer => {
      observer.error('Use ApiService.searchJobOffers() instead');
      observer.complete();
    });
  }

  // User Methods - DEPRECATED: Use ApiService instead
  getUsers(): Observable<User[]> {
    return this.users$;
  }

  updateUserStatus(id: string, isActive: boolean): Observable<User | null> {
    // Use ApiService.updateUserStatus() instead
    return new Observable(observer => {
      observer.error('Use ApiService.updateUserStatus() instead');
      observer.complete();
    });
  }

  // Analytics Methods - DEPRECATED: Use ApiService instead
  getJobPostingsByDomain(): Observable<{domain: string, count: number}[]> {
    return new Observable(observer => {
      observer.error('Use ApiService.getAdminStats() instead');
      observer.complete();
    });
  }

  getJobPostingsByContractType(): Observable<{contractType: string, count: number}[]> {
    return new Observable(observer => {
      observer.error('Use ApiService.getAdminStats() instead');
      observer.complete();
    });
  }

  getJobPostingsByLocation(): Observable<{location: string, count: number}[]> {
    return new Observable(observer => {
      observer.error('Use ApiService.getAdminStats() instead');
      observer.complete();
    });
  }

  getJobPostingsOverTime(): Observable<{date: string, count: number}[]> {
    return new Observable(observer => {
      observer.error('Use ApiService.getAdminStats() instead');
      observer.complete();
    });
  }

  getUsersByRole(): Observable<{role: string, count: number}[]> {
    return new Observable(observer => {
      observer.error('Use ApiService.getAdminStats() instead');
      observer.complete();
    });
  }
}