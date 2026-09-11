import api from "./axios";

import type {
  Contract,
} from "../types/contract";

interface ContractsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Contract[];
}

export const getContractsRequest =
  async (): Promise<ContractsResponse> => {
    const response =
      await api.get<
        ContractsResponse | Contract[]
      >("/contracts/");

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

export const getContractRequest =
  async (
    id: number
  ): Promise<Contract> => {
    const response =
      await api.get<Contract>(
        `/contracts/${id}/`
      );

    return response.data;
  };

export const completeContractRequest =
  async (
    id: number
  ): Promise<Contract> => {
    const response =
      await api.post<Contract>(
        `/contracts/${id}/complete/`
      );

    return response.data;
  };