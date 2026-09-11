export type NotificationType =
  | "PROPOSAL"
  | "CONTRACT"
  | "MILESTONE"
  | "PAYMENT"
  | "REVIEW"
  | "DISPUTE"
  | "SYSTEM";

export interface Notification {
  id: number;
  user: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}