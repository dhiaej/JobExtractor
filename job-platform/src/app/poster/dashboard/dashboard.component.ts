import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
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
  activeJobOffers = 0;
  totalApplications = 0;
  acceptedApplications = 0;
  pendingApplications = 0;

  // Job offers
  myJobOffers: JobOffer[] = [];
  jobOffersColumns: string[] = ['title', 'company', 'location', 'contractType', 'domain', 'applications', 'status', 'createdAt', 'actions'];

  // Applications
  allApplications: Application[] = [];
  filteredApplications: Application[] = [];
  applicationColumns: string[] = ['applicantName', 'applicantEmail', 'jobTitle', 'status', 'appliedDate', 'actions'];

  // Chart data
  monthlyJobOffersData: number[] = [];
  monthlyJobOffersLabels: string[] = [];
  applicationStatusData: number[] = [];
  applicationStatusLabels: string[] = [];

  // Loading states
  loadingJobOffers = false;
  loadingApplications = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loadMyJobOffers();
    this.loadApplications();
    this.loadChartData();
  }

  private loadMyJobOffers(): void {
    if (!this.currentUser) return;
    
    this.loadingJobOffers = true;
    this.apiService.getJobOffersByOfferer(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobOffers) => {
          this.myJobOffers = jobOffers;
          this.activeJobOffers = jobOffers.filter(job => job.isActive).length;
          this.loadingJobOffers = false;
        },
        error: (error) => {
          console.error('Error loading job offers:', error);
          this.snackBar.open('Error loading job offers', 'Close', { duration: 3000 });
          this.loadingJobOffers = false;
        }
      });
  }

  private loadApplications(): void {
    if (!this.currentUser) return;
    
    this.loadingApplications = true;
    this.apiService.getApplicationsByOfferer(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications) => {
          this.allApplications = applications;
          this.filteredApplications = applications; // Show all applications without filtering
          this.totalApplications = applications.length;
          this.acceptedApplications = applications.filter(app => app.status === 'ACCEPTED').length;
          this.pendingApplications = applications.filter(app => app.status === 'PENDING').length;
          this.loadingApplications = false;
        },
        error: (error) => {
          console.error('Error loading applications:', error);
          this.snackBar.open('Error loading applications', 'Close', { duration: 3000 });
          this.loadingApplications = false;
        }
      });
  }

  private loadChartData(): void {
    // Load monthly job offers data
    this.loadMonthlyJobOffersData();
    // Load application status data
    this.loadApplicationStatusData();
  }

  private loadMonthlyJobOffersData(): void {
    if (!this.currentUser) return;
    
    this.apiService.getJobOffersByOfferer(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobOffers) => {
          this.processMonthlyJobOffersData(jobOffers);
        },
        error: (error) => {
          console.error('Error loading monthly job offers data:', error);
        }
      });
  }

  private processMonthlyJobOffersData(jobOffers: any[]): void {
    // Group job offers by month
    const monthlyData: { [key: string]: number } = {};
    
    jobOffers.forEach(job => {
      const date = new Date(job.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Sort by month and prepare data
    const sortedMonths = Object.keys(monthlyData).sort();
    this.monthlyJobOffersLabels = sortedMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
    });
    this.monthlyJobOffersData = sortedMonths.map(month => monthlyData[month]);
  }

  private loadApplicationStatusData(): void {
    if (!this.currentUser) return;
    
    this.apiService.getApplicationsByOfferer(this.currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (applications) => {
          this.processApplicationStatusData(applications);
        },
        error: (error) => {
          console.error('Error loading application status data:', error);
        }
      });
  }

  private processApplicationStatusData(applications: any[]): void {
    const statusCounts: { [key: string]: number } = {};
    
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    this.applicationStatusLabels = Object.keys(statusCounts);
    this.applicationStatusData = Object.values(statusCounts);
  }

  navigateToCreate(): void {
    this.router.navigate(['/poster/create']);
  }

  navigateToPostings(): void {
    this.router.navigate(['/poster/postings']);
  }

  navigateToApplications(): void {
    // Scroll to applications section
    const element = document.querySelector('.applications-management');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  openCreateJobDialog(): void {
    // In real app, this would open a dialog for creating job offers
    this.snackBar.open('Opening job creation form...', 'Close', { duration: 2000 });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      
      // Upload file and extract job information
      this.apiService.uploadJobFile(file)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (jobOffer) => {
            this.snackBar.open(`Job created from file: ${file.name}`, 'Close', { duration: 3000 });
            this.loadMyJobOffers(); // Refresh job offers
          },
          error: (error) => {
            console.error('Error uploading file:', error);
            this.snackBar.open('Error uploading file', 'Close', { duration: 3000 });
          }
        });
    }
  }

  viewJobDetails(job: JobOffer): void {
    console.log('Viewing job details:', job);
    this.snackBar.open(`Viewing details for: ${job.title}`, 'Close', { duration: 2000 });
  }

  editJob(job: JobOffer): void {
    console.log('Editing job:', job);
    this.snackBar.open(`Editing: ${job.title}`, 'Close', { duration: 2000 });
  }

  viewApplications(job: JobOffer): void {
    console.log('Viewing applications for job:', job);
    this.snackBar.open(`Viewing applications for: ${job.title}`, 'Close', { duration: 2000 });
  }

  toggleJobStatus(job: JobOffer): void {
    const updatedJob = { ...job, isActive: !job.isActive };
    
    this.apiService.updateJobOffer(job.id, { isActive: updatedJob.isActive })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          job.isActive = updatedJob.isActive;
          this.snackBar.open(`Job ${job.isActive ? 'activated' : 'deactivated'}: ${job.title}`, 'Close', { duration: 2000 });
          this.loadMyJobOffers(); // Refresh data
        },
        error: (error) => {
          console.error('Error updating job status:', error);
          this.snackBar.open('Error updating job status', 'Close', { duration: 3000 });
        }
      });
  }

  deleteJob(job: JobOffer): void {
    if (confirm(`Are you sure you want to delete "${job.title}"?`)) {
      this.apiService.deleteJobOffer(job.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`Job deleted: ${job.title}`, 'Close', { duration: 3000 });
            this.loadMyJobOffers(); // Refresh data
          },
          error: (error) => {
            console.error('Error deleting job:', error);
            this.snackBar.open('Error deleting job', 'Close', { duration: 3000 });
          }
        });
    }
  }



  acceptApplication(application: Application): void {
    this.apiService.updateApplicationStatus(application.id, 'ACCEPTED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          application.status = 'ACCEPTED';
          this.snackBar.open(`Application accepted: ${application.seekerName}`, 'Close', { duration: 3000 });
          this.loadApplications(); // Refresh data
        },
        error: (error) => {
          console.error('Error accepting application:', error);
          this.snackBar.open('Error accepting application', 'Close', { duration: 3000 });
        }
      });
  }

  rejectApplication(application: Application): void {
    this.apiService.updateApplicationStatus(application.id, 'REJECTED')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          application.status = 'REJECTED';
          this.snackBar.open(`Application rejected: ${application.seekerName}`, 'Close', { duration: 3000 });
          this.loadApplications(); // Refresh data
        },
        error: (error) => {
          console.error('Error rejecting application:', error);
          this.snackBar.open('Error rejecting application', 'Close', { duration: 3000 });
        }
      });
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