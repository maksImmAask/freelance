import api from "./axios";
import type {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
} from "../types/auth";

export const loginRequest = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login/",
    data
  );

  return response.data;
};

export const registerRequest = async (
  data: RegisterData
): Promise<User> => {
  const response = await api.post<User>(
    "/auth/register/",
    data
  );

  return response.data;
};

export const refreshRequest = async (
  refresh: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/refresh/",
    { refresh }
  );

  return response.data;
};

export const getMeRequest = async (): Promise<User> => {
  const response = await api.get<User>("/auth/me/");

  return response.data;
};