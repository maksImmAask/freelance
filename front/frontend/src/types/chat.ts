export interface Chat {
  id: number;
  client: number;
  freelancer: number;
  contract: number | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  chat: number;
  sender: number;
  text: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageFormData {
  chat: number;
  text: string;
}