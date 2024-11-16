// services/api/index.js

import { axiosInstance } from "../../utils/apiService";

export const tagAPI = {
  fetchAll: () => axiosInstance.get("/tags"),
  create: (tagData) => axiosInstance.post("/tags", tagData),
  update: (id, tagData) => axiosInstance.put(`/tags/${id}`, tagData),
  delete: (id) => axiosInstance.delete(`/tags/${id}`),
};

export const goalAPI = {
  fetchAll: () => axiosInstance.get("/goals"),
  fetchByTag: (tagId) => axiosInstance.get(`/goals/bytag/${tagId}`),
  //endpoint not defined in backend
  create: (goalData) => axiosInstance.post("/goals", goalData),
  update: (id, goalData) => axiosInstance.put(`/goals/${id}`, goalData),
  delete: (id) => axiosInstance.delete(`/goals/${id}`),
  deleteMultiple: (ids) =>
    axiosInstance.delete("/goals/bulk", { data: { ids } }),
  updateMultipleStatus: (ids, status) =>
    axiosInstance.put("/goals/bulk/status", { ids, status }),
  archiveMultiple: (ids) => axiosInstance.put("/goals/bulk/archive", { ids }),

  updateStatus: (id, data) => axiosInstance.patch(`/goals/${id}/status`, data),
  archive: (id) => axiosInstance.post(`/goals/${id}/archive`),
};

// services/api/urlService.js
export const taskAPI = {
  fetchAll: () => axiosInstance.get("/tasks"),
  fetchById: (id) => axiosInstance.get(`/tasks/${id}`),
  create: (taskData) => axiosInstance.post("/tasks", taskData),
  update: (id, taskData) => axiosInstance.put(`/tasks/${id}`, taskData),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
  updateCompletion: (id, completionData) =>
    axiosInstance.put(`/tasks/${id}/completion`, completionData),
};
