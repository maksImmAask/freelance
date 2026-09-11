export type DisputeStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "RESOLVED_CLIENT"
  | "RESOLVED_FREELANCER"
  | "REJECTED";

export interface Dispute {
  id: number;
  contract: number;
  opened_by: number;
  reason: string;
  status: DisputeStatus;
  resolution: string;
  resolved_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeFormData {
  contract: number;
  reason: string;
}