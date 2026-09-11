import api from "./axios";

import type {
  Chat,
  Message,
  MessageFormData,
} from "../types/chat";

interface ChatsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Chat[];
}

interface MessagesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

export const getChatsRequest =
  async (): Promise<ChatsResponse> => {
    const response =
      await api.get<
        ChatsResponse | Chat[]
      >("/chats/");

    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    }

    return response.data;
  };

export const getChatRequest =
  async (
    id: number
  ): Promise<Chat> => {
    const response =
      await api.get<Chat>(
        `/chats/${id}/`
      );

    return response.data;
  };

export const getMessagesRequest =
  async (
    chatId: number
  ): Promise<MessagesResponse> => {
    const response =
      await api.get<
        MessagesResponse | Message[]
      >("/messages/", {
        params: {
          chat: chatId,
        },
      });

    if (Array.isArray(response.data)) {
      return {
        count: response.data.length,
        next: null,
        previous: null,
        results: response.data,
      };
    }

    return response.data;
  };

export const createMessageRequest =
  async (
    data: MessageFormData
  ): Promise<Message> => {
    const response =
      await api.post<Message>(
        "/messages/",
        data
      );

    return response.data;
  };

export const markMessageReadRequest =
  async (
    id: number
  ): Promise<Message> => {
    const response =
      await api.post<Message>(
        `/messages/${id}/mark_read/`
      );

    return response.data;
  };