export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SEEKER' | 'OFFERER' | 'ADMIN';
  active: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'SEEKER' | 'OFFERER';
}
