import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService, JobOffer } from '../../shared/services/api.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('extractResultsDialog') extractResultsDialog!: TemplateRef<any>;
  @ViewChild('jobDetailsDialog') jobDetailsDialog!: TemplateRef<any>;

  searchForm!: FormGroup;
  searchResults: JobOffer[] = [];
  filteredResults: JobOffer[] = [];
  isSearching = false;
  hasSearched = false;
  selectedJob: JobOffer | null = null;
  extractedData: any = null;
  isExtracting = false;
  extractedDataTable = new MatTableDataSource<any>([]);
  extractedColumns: string[] = ['job_title', 'company', 'location', 'contract_type', 'domain', 'type', 'salary', 'duration', 'deadline', 'language'];
  
  // Filter properties
  searchKeyword = '';
  selectedDateFilter = '';
  
  // Track extracted jobs
  extractedJobs: Set<number> = new Set();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Load all active jobs initially
    this.loadAllJobs();
  }


  private loadAllJobs(): void {
    this.apiService.getAllJobOffers().subscribe({
      next: (response) => {
        // Filter for active jobs only
        this.searchResults = (response.content || response).filter((job: JobOffer) => job.isActive);
        this.filteredResults = [...this.searchResults];
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.snackBar.open('Failed to load jobs', 'Close', { duration: 3000 });
      }
    });
  }



  viewJobDetails(job: JobOffer): void {
    this.selectedJob = job;
    this.dialog.open(this.jobDetailsDialog, { 
      width: '800px',
      maxHeight: '90vh'
    });
  }

  extractJobData(job: JobOffer): void {
    this.isExtracting = true;
    this.selectedJob = job;
    
    // Call the extract API with the job's raw text
    this.apiService.extractFromText(job.rawText).subscribe({
      next: (extractedData) => {
        console.log('Extracted data:', extractedData);
        this.extractedData = extractedData;
        
        // Mark this job as extracted
        this.extractedJobs.add(job.id);
        
        // Create table data source with the extracted data
        this.extractedDataTable.data = [extractedData];
        
        this.isExtracting = false;
        this.dialog.open(this.extractResultsDialog, { 
          width: '1200px',
          maxHeight: '90vh'
        });
      },
      error: (error) => {
        console.error('Extraction error:', error);
        this.snackBar.open('Failed to extract job data', 'Close', { duration: 3000 });
        this.isExtracting = false;
      }
    });
  }

  applyToJob(job: JobOffer): void {
    if (!job.isActive) {
      this.snackBar.open('This job is no longer active', 'Close', { duration: 3000 });
      return;
    }

    if (!this.extractedJobs.has(job.id)) {
      this.snackBar.open('Please extract job data first before applying', 'Close', { duration: 3000 });
      return;
    }

    // Get current user ID from auth service
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.id) {
      this.snackBar.open('Please log in to apply for jobs', 'Close', { duration: 3000 });
      return;
    }

    this.apiService.applyToJob(job.id, currentUser.id).subscribe({
      next: (application) => {
        this.snackBar.open('Application submitted successfully!', 'Close', { duration: 3000 });
        console.log('Application created:', application);
      },
      error: (error) => {
        console.error('Application error:', error);
        this.snackBar.open('Failed to submit application', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.searchResults];

    // Filter by keyword
    if (this.searchKeyword.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }

    // Filter by date
    if (this.selectedDateFilter) {
      const now = new Date();
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        switch (this.selectedDateFilter) {
          case 'today':
            return jobDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return jobDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return jobDate >= monthAgo;
          case 'older':
            const monthAgo2 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return jobDate < monthAgo2;
          default:
            return true;
        }
      });
    }

    this.filteredResults = filtered;
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedDateFilter = '';
    this.filteredResults = [...this.searchResults];
  }

  isJobExtracted(jobId: number): boolean {
    return this.extractedJobs.has(jobId);
  }

  exportToCSV(): void {
    if (!this.extractedData) {
      this.snackBar.open('No data to export', 'Close', { duration: 3000 });
      return;
    }

    const csvData = this.convertToCSV(this.extractedData);
    this.downloadCSV(csvData, `job-extraction-${this.selectedJob?.title || 'data'}.csv`);
    this.snackBar.open('Data exported successfully!', 'Close', { duration: 3000 });
  }

  private convertToCSV(data: any): string {
    const headers = ['Field', 'Value'];
    const rows = [headers];

    // Add job title
    if (data.job_title) {
      rows.push(['Job Title', data.job_title.value || '']);
    }

    // Add company
    if (data.company) {
      rows.push(['Company', data.company.value || '']);
    }

    // Add location
    if (data.location) {
      const locationValue = Array.isArray(data.location.value) ? data.location.value.join(', ') : data.location.value;
      rows.push(['Location', locationValue || '']);
    }

    // Add contract type
    if (data.contract_type) {
      const contractValue = Array.isArray(data.contract_type) ? data.contract_type.join(', ') : data.contract_type;
      rows.push(['Contract Type', contractValue || '']);
    }

    // Add domain
    if (data.inferred_domain) {
      rows.push(['Domain', data.inferred_domain || '']);
    }

    // Add type
    if (data.type) {
      rows.push(['Type', data.type || '']);
    }

    // Add salary
    if (data.salary) {
      const salaryValue = Array.isArray(data.salary) ? data.salary.join(', ') : data.salary;
      rows.push(['Salary', salaryValue || '']);
    }

    // Add duration
    if (data.duration) {
      const durationValue = Array.isArray(data.duration) ? data.duration.join(', ') : data.duration;
      rows.push(['Duration', durationValue || '']);
    }

    // Add deadline
    if (data.deadline) {
      const deadlineValue = Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline;
      rows.push(['Deadline', deadlineValue || '']);
    }

    // Add language
    if (data.language) {
      rows.push(['Language', data.language || '']);
    }

    // Add skills
    if (data.skills && Array.isArray(data.skills)) {
      data.skills.forEach((skill: any, index: number) => {
        rows.push([`Skill ${index + 1}`, skill.skill || '']);
      });
    }

    // Add contacts
    if (data.contacts) {
      if (data.contacts.emails && data.contacts.emails.length > 0) {
        rows.push(['Email Contacts', data.contacts.emails.join(', ')]);
      }
      if (data.contacts.phones && data.contacts.phones.length > 0) {
        rows.push(['Phone Contacts', data.contacts.phones.join(', ')]);
      }
      if (data.contacts.urls && data.contacts.urls.length > 0) {
        rows.push(['URL Contacts', data.contacts.urls.join(', ')]);
      }
    }

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
