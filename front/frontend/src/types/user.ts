import type { UserRole } from "./auth";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  is_verified: boolean;
}

export interface FreelancerProfile {
  id: number;
  bio: string;
  specialization: string;
  hourly_rate: string | null;
  experience_years: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: number;
  company_name: string;
  bio: string;
  created_at: string;
  updated_at: string;
}