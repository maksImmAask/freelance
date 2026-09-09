export type ProposalStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Proposal {
  id: number;
  project: number;
  freelancer: number;
  cover_letter: string;
  price: string;
  delivery_days: number;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalFormData {
  project: number;
  cover_letter: string;
  price: string;
  delivery_days: number;
}