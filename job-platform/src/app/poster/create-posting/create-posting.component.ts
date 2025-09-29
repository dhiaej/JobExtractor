import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../shared/services/auth.service';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-create-posting',
  templateUrl: './create-posting.component.html',
  styleUrls: ['./create-posting.component.scss']
})
export class CreatePostingComponent implements OnInit {
  textForm!: FormGroup;
  fileForm!: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.textForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(50)]]
    });
    
    this.fileForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onTextSubmit(): void {
    if (this.textForm.valid) {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      const description = this.textForm.value.description;
      
      // Send text to extractor service
      this.apiService.extractFromText(description).subscribe({
        next: (extractedData) => {
          // Create job offer with extracted data
          this.createJobFromExtractedData(extractedData, currentUser.id);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to process job description. Please try again.', 'Close', { duration: 3000 });
          console.error('Error extracting from text:', error);
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && this.fileForm.valid) {
      this.selectedFile = file;
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      
      if (!currentUser) {
        this.snackBar.open('User not authenticated', 'Close', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      // Create FormData with offererId and title
      const formData = new FormData();
      formData.append('offererId', currentUser.id.toString());
      formData.append('title', this.fileForm.value.title);
      formData.append('file', file);
      // Ensure new offers are active by default so they appear and count
      formData.append('isActive', 'true');

      // Use the correct endpoint
      this.apiService.uploadJobFileWithOfferer(formData).subscribe({
        next: (jobOffer) => {
          this.isLoading = false;
          this.snackBar.open(`Job offer created from file: ${file.name}`, 'Close', { duration: 3000 });
          this.router.navigate(['/poster/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.snackBar.open('Failed to upload file. Please try again.', 'Close', { duration: 3000 });
          console.error('Error uploading file:', error);
        }
      });
    } else if (file && !this.fileForm.valid) {
      this.snackBar.open('Please enter a job title before uploading', 'Close', { duration: 3000 });
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  private createJobFromExtractedData(extractedData: any, offererId: number): void {
    // Create job offer with extracted data
    const title = this.textForm.value.title; // Use user-provided title
    const company = extractedData.company?.value || 'Unknown Company';
    const description = extractedData.raw_text || this.textForm.value.description;

    // Create FormData to send as form parameters
    const formData = new FormData();
    formData.append('offererId', offererId.toString());
    formData.append('title', title);
    formData.append('company', company);
    formData.append('description', description);
          // Ensure new offers are active by default so they appear and count
          formData.append('isActive', 'true');

    this.apiService.createJobOfferFromForm(formData).subscribe({
      next: (jobOffer) => {
        this.isLoading = false;
        this.snackBar.open('Job offer created successfully from text!', 'Close', { duration: 3000 });
        this.router.navigate(['/poster/dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to create job offer. Please try again.', 'Close', { duration: 3000 });
        console.error('Error creating job offer:', error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/poster/dashboard']);
  }
}