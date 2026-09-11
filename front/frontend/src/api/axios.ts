import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedRequest[] = [];

const processQueue = (
  error: unknown,
  token: string | null
) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });

  failedQueue = [];
};

const logout = () => {
  storage.clearTokens();

  window.dispatchEvent(
    new Event("auth:logout")
  );
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/auth/refresh/")
    ) {
      logout();

      return Promise.reject(error);
    }

    const refreshToken =
      storage.getRefreshToken();

    if (!refreshToken) {
      logout();

      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>(
        (resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        }
      ).then((token) => {
        originalRequest.headers.Authorization =
          `Bearer ${token}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response =
        await refreshApi.post<{
          access: string;
          refresh?: string;
        }>("/auth/refresh/", {
          refresh: refreshToken,
        });

      const newAccessToken =
        response.data.access;

      const newRefreshToken =
        response.data.refresh;

      if (newRefreshToken) {
        storage.setTokens(
          newAccessToken,
          newRefreshToken
        );
      } else {
        localStorage.setItem(
          "access_token",
          newAccessToken
        );
      }

      processQueue(
        null,
        newAccessToken
      );

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(
        refreshError,
        null
      );

      logout();

      return Promise.reject(
        refreshError
      );
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;