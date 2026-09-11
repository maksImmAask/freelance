import api from "./axios";

import type {
  Notification,
  NotificationsResponse,
} from "../types/notification";

export const getNotificationsRequest =
  async (): Promise<NotificationsResponse> => {
    const response =
      await api.get<
        NotificationsResponse |
        Notification[]
      >("/notifications/");

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

export const markNotificationReadRequest =
  async (
    id: number
  ): Promise<Notification> => {
    const response =
      await api.post<Notification>(
        `/notifications/${id}/mark_read/`
      );

    return response.data;
  };

export const markAllNotificationsReadRequest =
  async (): Promise<void> => {
    await api.post(
      "/notifications/mark_all_read/"
    );
  };