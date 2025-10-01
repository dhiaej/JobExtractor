import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService, JobOffer, Application } from '../../shared/services/api.service';
import { User } from '../../shared/models/user.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  // Summary data
  totalJobs = 0;
  applicationsSent = 0;
  acceptedApplications = 0;
  pendingApplications = 0;

  // Job offers
  jobOffers: JobOffer[] = [];

  // My applications
  myApplications: Application[] = [];
  applicationColumns: string[] = ['job', 'status', 'appliedDate'];

  // Chart data
  applicationStatusData: number[] = [];
  applicationStatusLabels: string[] = [];

  // Loading states
  loadingJobs = false;
  loadingApplications = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        if (user) {
          this.loadDashboardData();
        }
      });
    
    // Listen for route changes to refresh data when returning from search
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.currentUser) {
          this.loadDashboardData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loadJobOffers();
    this.loadMyApplications();
    this.loadChartData();
  }

  private loadJobOffers(): void {
    this.loadingJobs = true;
    console.log('Loading job offers...');
    this.apiService.getAllJobOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobOffers) => {
          console.log('Job offers received:', jobOffers);
          this.jobOffers = jobOffers.filter((job: any) => job.isActive);
          this.totalJobs = this.jobOffers.length;
          console.log('Active job offers:', this.jobOffers.length);
          this.loadingJobs = false;
        },
        error: (error) => {
          console.error('Error loading job offers:', error);
          // Use mock data if API fails
          const mockJobOffers: JobOffer[] = [
            { 
              id: 1, 
              title: 'Frontend Developer', 
              company: 'TechCorp', 
              location: 'Remote',
              contractType: 'Full-time',
              domain: 'Technology',
              skills: ['React', 'TypeScript'],
              salary: '$80,000 - $100,000',
              duration: 'Permanent',
              deadline: '2024-12-31',
              description: 'Frontend developer position',
              rawText: 'Frontend Developer at TechCorp',
              offererId: 1,
              offererName: 'TechCorp',
              isActive: true,
              createdAt: new Date().toISOString()
            },
            { 
              id: 2, 
              title: 'Frontend Developer', 
              company: 'WebSolutions', 
              location: 'New York',
              contractType: 'Full-time',
              domain: 'Web Development',
              skills: ['React', 'TypeScript'],
              salary: '$70,000 - $90,000',
              duration: 'Permanent',
              deadline: '2024-11-30',
              description: 'Frontend developer position',
              rawText: 'Frontend Developer at WebSolutions',
              offererId: 2,
              offererName: 'WebSolutions',
              isActive: true,
              createdAt: new Date().toISOString()
            },
            { 
              id: 3, 
              title: 'Data Scientist', 
              company: 'DataTech', 
              location: 'San Francisco',
              contractType: 'Full-time',
              domain: 'Data Science',
              skills: ['Python', 'Machine Learning'],
              salary: '$90,000 - $110,000',
              duration: 'Permanent',
              deadline: '2024-10-31',
              description: 'Data scientist position',
              rawText: 'Data Scientist at DataTech',
              offererId: 3,
              offererName: 'DataTech',
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ];
          this.jobOffers = mockJobOffers;
          this.totalJobs = mockJobOffers.length;
          console.log('Using mock job offers due to API error');
          this.loadingJobs = false;
        }
      });
  }

  private loadMyApplications(): void {
    if (!this.currentUser) {
      console.log('No current user, skipping applications load');
      return;
    }
    
    this.loadingApplications = true;
    console.log('Loading applications for user:', this.currentUser.id);
    
    this.apiService.getApplicationsBySeeker(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications) => {
          console.log('Applications received:', applications);
          this.myApplications = applications;
          this.applicationsSent = applications.length;
          this.acceptedApplications = applications.filter(app => app.status === 'ACCEPTED').length;
          this.pendingApplications = applications.filter(app => app.status === 'PENDING').length;
          console.log('Applications count:', this.applicationsSent);
          this.loadingApplications = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          // Use mock data as fallback if API fails
          const mockApplications: Application[] = [
            {
              id: 1,
              seekerId: this.currentUser!.id,
              seekerName: this.currentUser!.name,
              seekerEmail: this.currentUser!.email,
              jobOfferId: 1,
              jobTitle: 'Frontend Developer',
              company: 'TechCorp',
              status: 'PENDING',
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              seekerId: this.currentUser!.id,
              seekerName: this.currentUser!.name,
              seekerEmail: this.currentUser!.email,
              jobOfferId: 2,
              jobTitle: 'Frontend Developer',
              company: 'WebSolutions',
              status: 'ACCEPTED',
              createdAt: new Date().toISOString()
            },
            {
              id: 3,
              seekerId: this.currentUser!.id,
              seekerName: this.currentUser!.name,
              seekerEmail: this.currentUser!.email,
              jobOfferId: 3,
              jobTitle: 'Data Scientist',
              company: 'DataTech',
              status: 'REJECTED',
              createdAt: new Date().toISOString()
            }
          ];
          
          console.log('Using mock applications due to API error:', mockApplications);
          this.myApplications = mockApplications;
          this.applicationsSent = mockApplications.length;
          this.acceptedApplications = mockApplications.filter(app => app.status === 'ACCEPTED').length;
          this.pendingApplications = mockApplications.filter(app => app.status === 'PENDING').length;
          this.loadingApplications = false;
        }
      });
  }

  private loadChartData(): void {
    // Load application status data
    this.loadApplicationStatusData();
  }

  private loadApplicationStatusData(): void {
    if (!this.currentUser) {
      console.log('No current user, skipping chart data load');
      return;
    }

    console.log('Loading chart data for user:', this.currentUser.id);
    
    this.apiService.getApplicationsBySeeker(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications) => {
          console.log('Chart data applications received:', applications);
          this.processApplicationStatusData(applications);
        },
        error: (error) => {
          console.error('Error loading application status data:', error);
          // Set default data if API fails
          this.applicationStatusData = [0, 0, 0];
          this.applicationStatusLabels = ['Pending', 'Accepted', 'Refused'];
          console.log('Using default chart data due to error');
        }
      });
  }

  private processApplicationStatusData(applications: Application[]): void {
    console.log('Processing application status data for', applications.length, 'applications');
    const statusCounts = applications.reduce((acc, app) => {
      const status = app.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('Status counts:', statusCounts);
    this.applicationStatusData = [
      statusCounts['PENDING'] || 0,
      statusCounts['ACCEPTED'] || 0,
      statusCounts['REJECTED'] || 0
    ];
    this.applicationStatusLabels = ['Pending', 'Accepted', 'Rejected'];
    console.log('Final chart data:', this.applicationStatusData);
  }



  getStatusColor(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'primary';
      case 'PENDING': return 'accent';
      case 'REJECTED': return 'warn';
      default: return 'basic';
    }
  }

}