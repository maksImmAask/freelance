export type UserRole = "CLIENT" | "FREELANCER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  is_verified: boolean;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}