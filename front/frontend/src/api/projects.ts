import api from "./axios";
import type {
  Category,
  Project,
  ProjectFormData,
  Skill,
} from "../types/project";

interface ProjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export const getProjectsRequest = async (
  search?: string
): Promise<ProjectsResponse> => {
  const response = await api.get<ProjectsResponse>(
    "/projects/",
    {
      params: search ? { search } : undefined,
    }
  );

  return response.data;
};

export const getProjectRequest = async (
  id: number
): Promise<Project> => {
  const response = await api.get<Project>(
    `/projects/${id}/`
  );

  return response.data;
};

export const createProjectRequest = async (
  data: ProjectFormData
): Promise<Project> => {
  const response = await api.post<Project>(
    "/projects/",
    data
  );

  return response.data;
};

export const updateProjectRequest = async (
  id: number,
  data: Partial<ProjectFormData>
): Promise<Project> => {
  const response = await api.patch<Project>(
    `/projects/${id}/`,
    data
  );

  return response.data;
};

export const deleteProjectRequest = async (
  id: number
): Promise<void> => {
  await api.delete(`/projects/${id}/`);
};

export const publishProjectRequest = async (
  id: number
): Promise<Project> => {
  const response = await api.post<Project>(
    `/projects/${id}/publish/`
  );

  return response.data;
};

export const getCategoriesRequest = async (): Promise<
  Category[]
> => {
  const response = await api.get<Category[]>(
    "/projects/categories/"
  );

  return response.data;
};

export const getSkillsRequest = async (): Promise<
  Skill[]
> => {
  const response = await api.get<Skill[]>(
    "/projects/skills/"
  );

  return response.data;
};