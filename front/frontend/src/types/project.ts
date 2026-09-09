export type ProjectStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type ExperienceLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "EXPERT";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Skill {
  id: number;
  name: string;
  slug: string;
}

export interface Project {
  id: number;
  client: number;
  title: string;
  description: string;
  category: number;
  skills: number[];
  budget_min: string;
  budget_max: string;
  deadline: string;
  experience_level: ExperienceLevel;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  category: number;
  skills: number[];
  budget_min: string;
  budget_max: string;
  deadline: string;
  experience_level: ExperienceLevel;
}