import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ApiService, JobOffer } from '../../shared/services/api.service';

export interface ExtractedJobData {
  jobId: number;
  jobTitle: string;
  extractedData: any;
  extractedAt: Date;
}

@Component({
  selector: 'app-extraction',
  templateUrl: './extraction.component.html',
  styleUrls: ['./extraction.component.scss']
})
export class ExtractionComponent implements OnInit, AfterViewInit {
  @ViewChild('extractionResultsDialog') extractionResultsDialog!: TemplateRef<any>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Form for filters
  filterForm!: FormGroup;
  
  // Data
  allJobs: JobOffer[] = [];
  filteredJobs: JobOffer[] = [];
  extractedJobs: ExtractedJobData[] = [];
  selectedJobs: Set<number> = new Set();
  
  // Table data sources
  jobsDataSource = new MatTableDataSource<JobOffer>([]);
  extractedDataSource = new MatTableDataSource<ExtractedJobData>([]);
  
  // Table columns
  jobsColumns: string[] = ['select', 'title', 'company', 'location', 'contractType', 'salary', 'createdAt', 'actions'];
  extractedColumns: string[] = ['jobTitle', 'company', 'location', 'contractType', 'salary', 'extractedAt', 'actions'];
  
  // Loading states
  loadingJobs = false;
  extractingJobs = false;
  
  // Filter options
  contractTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  // Removed salary range filter per request
  
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllJobs();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      searchKeyword: [''],
      contractType: [''],
      dateRange: ['']
    });
  }

  private loadAllJobs(): void {
    this.loadingJobs = true;
    this.apiService.getAllJobOffers().subscribe({
      next: (response) => {
        this.allJobs = (response.content || response).filter((job: JobOffer) => job.isActive);
        this.filteredJobs = [...this.allJobs];
        this.jobsDataSource.data = this.filteredJobs;
        this.loadingJobs = false;
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.snackBar.open('Failed to load jobs', 'Close', { duration: 3000 });
        this.loadingJobs = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.allJobs];
    const filters = this.filterForm.value;

    // Filter by keyword
    if (filters.searchKeyword?.trim()) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.searchKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.searchKeyword.toLowerCase())
      );
    }

    // Filter by contract type
    if (filters.contractType) {
      filtered = filtered.filter(job => 
        job.contractType?.toLowerCase() === filters.contractType.toLowerCase()
      );
    }

    // Salary range filter removed

    // Filter by date range
    if (filters.dateRange) {
      const now = new Date();
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        switch (filters.dateRange) {
          case 'today':
            return jobDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return jobDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return jobDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    this.filteredJobs = filtered;
    this.jobsDataSource.data = filtered;
    this.selectedJobs.clear();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.filteredJobs = [...this.allJobs];
    this.jobsDataSource.data = this.filteredJobs;
    this.selectedJobs.clear();
  }

  toggleJobSelection(jobId: number): void {
    if (this.selectedJobs.has(jobId)) {
      this.selectedJobs.delete(jobId);
    } else {
      this.selectedJobs.add(jobId);
    }
  }

  isJobSelected(jobId: number): boolean {
    return this.selectedJobs.has(jobId);
  }

  selectAllJobs(): void {
    if (this.selectedJobs.size === this.filteredJobs.length) {
      this.selectedJobs.clear();
    } else {
      this.selectedJobs.clear();
      this.filteredJobs.forEach(job => this.selectedJobs.add(job.id));
    }
  }

  isAllSelected(): boolean {
    return this.filteredJobs.length > 0 && this.selectedJobs.size === this.filteredJobs.length;
  }

  extractSelectedJobs(): void {
    if (this.selectedJobs.size === 0) {
      this.snackBar.open('Please select at least one job to extract', 'Close', { duration: 3000 });
      return;
    }

    this.extractingJobs = true;
    const selectedJobsList = this.filteredJobs.filter(job => this.selectedJobs.has(job.id));
    let completedExtractions = 0;

    selectedJobsList.forEach(job => {
      this.apiService.extractFromText(job.rawText).subscribe({
        next: (extractedData) => {
          const extractedJob: ExtractedJobData = {
            jobId: job.id,
            jobTitle: job.title,
            extractedData: extractedData,
            extractedAt: new Date()
          };
          
          // Remove existing extraction for this job if any
          this.extractedJobs = this.extractedJobs.filter(ej => ej.jobId !== job.id);
          this.extractedJobs.push(extractedJob);
          
          completedExtractions++;
          if (completedExtractions === selectedJobsList.length) {
            this.extractedDataSource.data = [...this.extractedJobs];
            this.extractingJobs = false;
            this.snackBar.open(`Successfully extracted ${selectedJobsList.length} job(s)`, 'Close', { duration: 3000 });
            this.dialog.open(this.extractionResultsDialog, { 
              width: '1400px',
              maxHeight: '90vh'
            });
          }
        },
        error: (error) => {
          console.error('Error extracting job data:', error);
          completedExtractions++;
          if (completedExtractions === selectedJobsList.length) {
            this.extractingJobs = false;
            this.snackBar.open('Some extractions failed. Please try again.', 'Close', { duration: 3000 });
          }
        }
      });
    });
  }

  viewExtractionDetails(extractedJob: ExtractedJobData): void {
    // Open a dialog to show detailed extraction results
    this.snackBar.open(`Viewing extraction details for: ${extractedJob.jobTitle}`, 'Close', { duration: 2000 });
  }

  removeExtraction(extractedJob: ExtractedJobData): void {
    this.extractedJobs = this.extractedJobs.filter(ej => ej.jobId !== extractedJob.jobId);
    this.extractedDataSource.data = [...this.extractedJobs];
    this.snackBar.open('Extraction removed', 'Close', { duration: 2000 });
  }

  exportAllExtractions(): void {
    if (this.extractedJobs.length === 0) {
      this.snackBar.open('No extractions to export', 'Close', { duration: 3000 });
      return;
    }

    const csvData = this.convertExtractionsToCSV(this.extractedJobs);
    this.downloadCSV(csvData, 'all-job-extractions.csv');
    this.snackBar.open('All extractions exported successfully!', 'Close', { duration: 3000 });
  }

  private convertExtractionsToCSV(extractions: ExtractedJobData[]): string {
    const headers = ['Job Title', 'Company', 'Location', 'Contract Type', 'Domain', 'Type', 'Salary', 'Duration', 'Deadline', 'Language', 'Skills', 'Extracted At'];
    const rows = [headers];

    extractions.forEach(extraction => {
      const data = extraction.extractedData;
      const skills = data.skills && Array.isArray(data.skills) 
        ? data.skills.map((s: any) => s.skill).join('; ') 
        : '';
      
      rows.push([
        data.job_title?.value || extraction.jobTitle,
        data.company?.value || '',
        Array.isArray(data.location?.value) ? data.location.value.join(', ') : data.location?.value || '',
        Array.isArray(data.contract_type) ? data.contract_type.join(', ') : data.contract_type || '',
        data.inferred_domain || '',
        data.type || '',
        Array.isArray(data.salary) ? data.salary.join(', ') : data.salary || '',
        Array.isArray(data.duration) ? data.duration.join(', ') : data.duration || '',
        Array.isArray(data.deadline) ? data.deadline.join(', ') : data.deadline || '',
        data.language || '',
        skills,
        extraction.extractedAt.toISOString()
      ]);
    });

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

  ngAfterViewInit(): void {
    this.jobsDataSource.paginator = this.paginator;
    this.jobsDataSource.sort = this.sort;
  }

  getContractTypeColor(contractType: string): string {
    switch (contractType?.toLowerCase()) {
      case 'full-time':
        return 'primary';
      case 'part-time':
        return 'accent';
      case 'contract':
        return 'warn';
      case 'freelance':
        return 'basic';
      case 'internship':
        return 'basic';
      default:
        return 'basic';
    }
  }

  formatArrayValue(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || 'N/A';
  }
}
