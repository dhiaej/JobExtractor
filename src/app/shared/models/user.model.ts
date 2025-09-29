export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'poster' | 'seeker' | 'admin';
  isActive: boolean;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'poster' | 'seeker';
}
