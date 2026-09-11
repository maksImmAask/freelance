export type ContractStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type MilestoneStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export interface Contract {
  id: number;
  project: number;
  client: number;
  freelancer: number;
  proposal: number;
  total_amount: string;
  deadline: string;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: number;
  contract: number;
  title: string;
  description: string;
  amount: string;
  deadline: string;
  status: MilestoneStatus;
  created_at: string;
  updated_at: string;
}

export interface MilestoneFormData {
  contract: number;
  title: string;
  description: string;
  amount: string;
  deadline: string;
}