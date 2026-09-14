import api from "./axios";
import type {
  Dispute,
  DisputeFormData,
} from "../types/dispute";

interface DisputesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Dispute[];
}

const normalizeResponse = (
  data: DisputesResponse | Dispute[]
): DisputesResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }

  return data;
};

export const getDisputesRequest =
  async (): Promise<DisputesResponse> => {
    const response = await api.get<
      DisputesResponse | Dispute[]
    >("/disputes/");

    return normalizeResponse(response.data);
  };

export const getDisputeRequest =
  async (id: number): Promise<Dispute> => {
    const response = await api.get<Dispute>(
      `/disputes/${id}/`
    );

    return response.data;
  };

export const createDisputeRequest =
  async (
    data: DisputeFormData
  ): Promise<Dispute> => {
    const response = await api.post<Dispute>(
      "/disputes/",
      data
    );

    return response.data;
  };

export const startDisputeReviewRequest =
  async (id: number): Promise<Dispute> => {
    const response = await api.post<Dispute>(
      `/disputes/${id}/start_review/`
    );

    return response.data;
  };

export const resolveDisputeClientRequest =
  async (
    id: number,
    resolution: string
  ): Promise<Dispute> => {
    const response = await api.post<Dispute>(
      `/disputes/${id}/resolve_client/`,
      {
        resolution,
      }
    );

    return response.data;
  };

export const resolveDisputeFreelancerRequest =
  async (
    id: number,
    resolution: string
  ): Promise<Dispute> => {
    const response = await api.post<Dispute>(
      `/disputes/${id}/resolve_freelancer/`,
      {
        resolution,
      }
    );

    return response.data;
  };

export const rejectDisputeRequest =
  async (
    id: number,
    resolution: string
  ): Promise<Dispute> => {
    const response = await api.post<Dispute>(
      `/disputes/${id}/reject/`,
      {
        resolution,
      }
    );

    return response.data;
  };