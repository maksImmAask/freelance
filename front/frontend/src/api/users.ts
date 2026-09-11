import api from "./axios";

import type {
  ClientProfile,
  FreelancerProfile,
  User,
} from "../types/user";

export const getMeRequest =
  async (): Promise<User> => {
    const response =
      await api.get<User>(
        "/auth/me/"
      );

    return response.data;
  };

export const getFreelancerProfileRequest =
  async (): Promise<FreelancerProfile> => {
    const response =
      await api.get<FreelancerProfile>(
        "/auth/freelancer/me/"
      );

    return response.data;
  };

export const updateFreelancerProfileRequest =
  async (
    data: Partial<FreelancerProfile>
  ): Promise<FreelancerProfile> => {
    const response =
      await api.patch<FreelancerProfile>(
        "/auth/freelancer/me/",
        data
      );

    return response.data;
  };

export const getClientProfileRequest =
  async (): Promise<ClientProfile> => {
    const response =
      await api.get<ClientProfile>(
        "/auth/client/me/"
      );

    return response.data;
  };

export const updateClientProfileRequest =
  async (
    data: Partial<ClientProfile>
  ): Promise<ClientProfile> => {
    const response =
      await api.patch<ClientProfile>(
        "/auth/client/me/",
        data
      );

    return response.data;
  };