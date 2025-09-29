import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { LoginRequest } from '../../shared/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(loginRequest).subscribe({
        next: (user) => {
          this.isLoading = false;
          if (user) {
            // Redirect based on user role
            switch (user.role) {
              case 'ADMIN':
                this.router.navigate(['/admin/dashboard']);
                break;
              case 'OFFERER':
                this.router.navigate(['/poster/dashboard']);
                break;
              case 'SEEKER':
                this.router.navigate(['/seeker/dashboard']);
                break;
              default:
                this.router.navigate(['/']);
            }
          } else {
            this.errorMessage = 'Invalid email or password';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Login failed. Please try again.';
          console.error('Login error:', error);
        }
      });
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLanding(): void {
    this.router.navigate(['/auth/landing']);
  }
}
