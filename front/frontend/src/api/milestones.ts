import api from "./axios";

import type {
  Milestone,
  MilestoneFormData,
} from "../types/contract";

interface MilestonesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Milestone[];
}

export const getMilestonesRequest =
  async (
    contractId?: number
  ): Promise<MilestonesResponse> => {
    const response =
      await api.get<
        MilestonesResponse | Milestone[]
      >("/milestones/", {
        params: contractId
          ? { contract: contractId }
          : undefined,
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

export const getMilestoneRequest =
  async (
    id: number
  ): Promise<Milestone> => {
    const response =
      await api.get<Milestone>(
        `/milestones/${id}/`
      );

    return response.data;
  };

export const createMilestoneRequest =
  async (
    data: MilestoneFormData
  ): Promise<Milestone> => {
    const response =
      await api.post<Milestone>(
        "/milestones/",
        data
      );

    return response.data;
  };

export const updateMilestoneRequest =
  async (
    id: number,
    data: Partial<MilestoneFormData>
  ): Promise<Milestone> => {
    const response =
      await api.patch<Milestone>(
        `/milestones/${id}/`,
        data
      );

    return response.data;
  };

export const deleteMilestoneRequest =
  async (
    id: number
  ): Promise<void> => {
    await api.delete(
      `/milestones/${id}/`
    );
  };

export const startMilestoneRequest =
  async (
    id: number
  ): Promise<Milestone> => {
    const response =
      await api.post<Milestone>(
        `/milestones/${id}/start/`
      );

    return response.data;
  };

export const submitMilestoneRequest =
  async (
    id: number
  ): Promise<Milestone> => {
    const response =
      await api.post<Milestone>(
        `/milestones/${id}/submit/`
      );

    return response.data;
  };

export const approveMilestoneRequest =
  async (
    id: number
  ): Promise<Milestone> => {
    const response =
      await api.post<Milestone>(
        `/milestones/${id}/approve/`
      );

    return response.data;
  };

export const rejectMilestoneRequest =
  async (
    id: number
  ): Promise<Milestone> => {
    const response =
      await api.post<Milestone>(
        `/milestones/${id}/reject/`
      );

    return response.data;
  };