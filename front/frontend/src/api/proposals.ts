import api from "./axios";
import type {
  Proposal,
  ProposalFormData,
} from "../types/proposal";

interface ProposalsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Proposal[];
}

export const getProposalsRequest = async (): Promise<ProposalsResponse> => {
  const response = await api.get<
    ProposalsResponse | Proposal[]
  >("/proposals/");

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

export const getProposalRequest = async (
  id: number
): Promise<Proposal> => {
  const response = await api.get<Proposal>(
    `/proposals/${id}/`
  );

  return response.data;
};

export const createProposalRequest = async (
  data: ProposalFormData
): Promise<Proposal> => {
  const response = await api.post<Proposal>(
    "/proposals/",
    data
  );

  return response.data;
};

export const updateProposalRequest = async (
  id: number,
  data: Partial<ProposalFormData>
): Promise<Proposal> => {
  const response = await api.patch<Proposal>(
    `/proposals/${id}/`,
    data
  );

  return response.data;
};

export const acceptProposalRequest = async (
  id: number
): Promise<Proposal> => {
  const response = await api.post<Proposal>(
    `/proposals/${id}/accept/`
  );

  return response.data;
};

export const rejectProposalRequest = async (
  id: number
): Promise<Proposal> => {
  const response = await api.post<Proposal>(
    `/proposals/${id}/reject/`
  );

  return response.data;
};