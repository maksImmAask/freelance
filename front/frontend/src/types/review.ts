export interface Review {
  id: number;
  contract: number;
  author: number;
  recipient: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewFormData {
  contract: number;
  rating: number;
  comment: string;
}