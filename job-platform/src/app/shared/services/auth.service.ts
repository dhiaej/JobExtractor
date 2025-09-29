import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { LoginRequest, RegisterRequest } from './api.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    // Load user from localStorage on initialization
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        console.log('Loaded user from localStorage:', user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
      }
    } else {
      this.currentUserSubject.next(null);
    }
  }

  login(loginRequest: LoginRequest): Observable<User | null> {
    return new Observable(observer => {
      this.apiService.login(loginRequest).subscribe({
        next: (response) => {
          // Backend returns UserDto directly, not wrapped in a user property
          if (response && response.id) {
            const user = response as User;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next(user);
          } else {
            observer.next(null);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Login error:', error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  register(registerRequest: RegisterRequest): Observable<User | null> {
    return new Observable(observer => {
      this.apiService.register(registerRequest).subscribe({
        next: (response) => {
          // Backend returns UserDto directly, not wrapped in a user property
          if (response && response.id) {
            const user = response as User;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            observer.next(user);
          } else {
            observer.next(null);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Registration error:', error);
          observer.next(null);
          observer.complete();
        }
      });
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}