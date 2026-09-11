import api from "./axios";

import type {
  Commission,
  Escrow,
  Transaction,
  Wallet,
} from "../types/payment";

interface WalletsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Wallet[];
}

interface TransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

interface EscrowsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Escrow[];
}

interface CommissionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Commission[];
}

export const getWalletsRequest =
  async (): Promise<WalletsResponse> => {
    const response = await api.get<
      WalletsResponse | Wallet[]
    >("/wallets/");

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

export const getMyWalletRequest =
  async (): Promise<Wallet | null> => {
    const response = await getWalletsRequest();

    return response.results[0] ?? null;
  };

export const getTransactionsRequest =
  async (): Promise<TransactionsResponse> => {
    const response = await api.get<
      TransactionsResponse | Transaction[]
    >("/transactions/");

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

export const getEscrowsRequest =
  async (): Promise<EscrowsResponse> => {
    const response = await api.get<
      EscrowsResponse | Escrow[]
    >("/escrows/");

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

export const getEscrowRequest =
  async (
    id: number
  ): Promise<Escrow> => {
    const response =
      await api.get<Escrow>(
        `/escrows/${id}/`
      );

    return response.data;
  };

export const fundEscrowRequest =
  async (
    id: number
  ): Promise<Escrow> => {
    const response =
      await api.post<Escrow>(
        `/escrows/${id}/fund/`
      );

    return response.data;
  };

export const releaseEscrowRequest =
  async (
    id: number
  ): Promise<Escrow> => {
    const response =
      await api.post<Escrow>(
        `/escrows/${id}/release/`
      );

    return response.data;
  };

export const refundEscrowRequest =
  async (
    id: number
  ): Promise<Escrow> => {
    const response =
      await api.post<Escrow>(
        `/escrows/${id}/refund/`
      );

    return response.data;
  };

export const getCommissionsRequest =
  async (): Promise<CommissionsResponse> => {
    const response =
      await api.get<
        CommissionsResponse | Commission[]
      >("/commissions/");

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