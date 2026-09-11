export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAW"
  | "PAYMENT"
  | "REFUND"
  | "COMMISSION";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export type EscrowStatus =
  | "PENDING"
  | "FUNDED"
  | "RELEASED"
  | "REFUNDED";

export interface Wallet {
  id: number;
  user: number;
  balance: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  wallet: number;
  transaction_type: TransactionType;
  amount: string;
  status: TransactionStatus;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Escrow {
  id: number;
  contract: number;
  client: number;
  amount: string;
  status: EscrowStatus;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: number;
  contract: number;
  percentage: string;
  amount: string;
  created_at: string;
}