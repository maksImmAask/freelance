import api from "./axios";
import type {
  Review,
  ReviewFormData,
} from "../types/review";

interface ReviewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export const getReviewsRequest =
  async (): Promise<ReviewsResponse> => {
    const response = await api.get<
      ReviewsResponse | Review[]
    >("/reviews/");

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

export const getReviewRequest =
  async (
    id: number
  ): Promise<Review> => {
    const response =
      await api.get<Review>(
        `/reviews/${id}/`
      );

    return response.data;
  };

export const createReviewRequest =
  async (
    data: ReviewFormData
  ): Promise<Review> => {
    const response =
      await api.post<Review>(
        "/reviews/",
        data
      );

    return response.data;
  };

export const updateReviewRequest =
  async (
    id: number,
    data: Partial<ReviewFormData>
  ): Promise<Review> => {
    const response =
      await api.patch<Review>(
        `/reviews/${id}/`,
        data
      );

    return response.data;
  };

export const deleteReviewRequest =
  async (
    id: number
  ): Promise<void> => {
    await api.delete(
      `/reviews/${id}/`
    );
  };