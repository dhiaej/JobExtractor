import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService, JobOfferLite, JobOffer } from '../../shared/services/api.service';

@Component({
  selector: 'app-postings',
  templateUrl: './postings.component.html',
  styleUrls: ['./postings.component.scss']
})
export class PostingsComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('jobDetailsDialog') jobDetailsDialog!: TemplateRef<any>;

  dataSource = new MatTableDataSource<JobOfferLite>([]);
  displayedColumns: string[] = ['name', 'createdAt', 'status', 'actions'];
  selectedPosting: JobOfferLite | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('PostingsComponent ngOnInit called');
    
    // Check localStorage directly
    const storedUser = localStorage.getItem('currentUser');
    console.log('Stored user in localStorage:', storedUser);
    
    // Check if user is available immediately
    const currentUser = this.authService.getCurrentUser();
    console.log('Immediate user check:', currentUser);
    
    // Also subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      console.log('User changed:', user);
      if (user) {
        this.loadPostings();
      }
    });
    
    // Load postings if user is already available
    if (currentUser) {
      this.loadPostings();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadPostings(): void {
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user:', currentUser);
    if (!currentUser) {
      console.log('No current user found');
      return;
    }

    this.loading = true;
    console.log('Loading job offers for user ID:', currentUser.id);
    // Use the robust endpoint and map to lite fields client-side
    this.apiService.getJobOffersByOfferer(currentUser.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (jobOffers) => {
          console.log('Full job offers received:', jobOffers);
          const fullRows: JobOffer[] = Array.isArray(jobOffers) ? jobOffers : ((jobOffers as any)?.content ?? []);
          console.log('Full rows:', fullRows);
          const rows: JobOfferLite[] = fullRows
            .map(j => {
              console.log('Mapping job offer:', j);
              return {
                id: j.id,
                offererId: j.offererId,
                title: j.title || 'Untitled Job',
                createdAt: j.createdAt,
                isActive: j.isActive,
                rawText: (j as any).rawText || j.description || ''
              };
            });
          console.log('Mapped rows:', rows);
          // Recreate data source to ensure table renders
          this.dataSource = new MatTableDataSource<JobOfferLite>(rows);
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
          if (this.sort) {
            this.dataSource.sort = this.sort;
          }
          // Reset paginator after data load
          if (this.paginator) {
            this.paginator.firstPage();
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading job offers:', error);
          this.snackBar.open('Error loading job offers', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/poster/create']);
  }

  viewPosting(posting: JobOfferLite): void {
    this.selectedPosting = posting;
    const jobIndex = this.dataSource.data.indexOf(posting);
    this.snackBar.open(`Viewing Job ${jobIndex + 1}`, 'Close', { duration: 2000 });
    if (this.jobDetailsDialog) {
      this.dialog.open(this.jobDetailsDialog, { width: '700px' });
    }
  }

  editPosting(posting: JobOfferLite): void {
    this.router.navigate(['/poster/create'], { queryParams: { edit: posting.id } });
  }

  toggleStatus(posting: JobOfferLite): void {
    this.apiService.updateJobOfferStatus(posting.id, !posting.isActive).subscribe({
      next: (updatedJobOffer) => {
        // Update UI immediately
        posting.isActive = !!updatedJobOffer.isActive;
        this.snackBar.open(`Job offer ${posting.isActive ? 'activated' : 'deactivated'}`, 'Close', { duration: 2000 });
        // Keep the row; rebuild datasource so the table re-renders with new chip state
        const rows = this.dataSource.data.map(r => r.id === posting.id ? { ...r, isActive: posting.isActive } : r);
        this.dataSource = new MatTableDataSource<JobOfferLite>(rows);
        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;
      },
      error: (error) => {
        this.snackBar.open('Failed to update job offer status', 'Close', { duration: 3000 });
        console.error('Error updating job offer:', error);
      }
    });
  }

  deletePosting(posting: JobOfferLite): void {
    // Optional: keep delete as a hard delete call, but we can disable UI to avoid accidental deletions
    // For your requested behavior, prefer using toggleStatus to deactivate instead of delete
    if (confirm('Do you really want to permanently delete this job offer? This cannot be undone.')) {
      this.apiService.deleteJobOffer(posting.id).subscribe({
        next: () => {
          const rows = this.dataSource.data.filter(r => r.id !== posting.id);
          this.dataSource = new MatTableDataSource<JobOfferLite>(rows);
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
          this.snackBar.open('Job offer deleted permanently', 'Close', { duration: 2000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to delete job offer', 'Close', { duration: 3000 });
          console.error('Error deleting job offer:', error);
        }
      });
    }
  }

}
