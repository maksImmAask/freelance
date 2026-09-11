import api from "./axios";

import type { User } from "./auth";

export interface AdminDashboard {
  users: number;
  clients: number;
  freelancers: number;
  projects: number;
  published_projects: number;
  proposals: number;
  contracts: number;
  active_contracts: number;
  reviews: number;
  open_disputes: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: User["role"];
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
}

interface AdminUsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export const getAdminDashboardRequest =
  async (): Promise<AdminDashboard> => {
    const response =
      await api.get<AdminDashboard>(
        "/admin/dashboard/"
      );

    return response.data;
  };

export const getAdminUsersRequest =
  async (): Promise<AdminUsersResponse> => {
    const response =
      await api.get<
        AdminUsersResponse | AdminUser[]
      >("/admin/users/");

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

export const blockAdminUserRequest =
  async (
    id: number
  ): Promise<AdminUser> => {
    const response =
      await api.post<AdminUser>(
        `/admin/users/${id}/block/`
      );

    return response.data;
  };

export const unblockAdminUserRequest =
  async (
    id: number
  ): Promise<AdminUser> => {
    const response =
      await api.post<AdminUser>(
        `/admin/users/${id}/unblock/`
      );

    return response.data;
  };