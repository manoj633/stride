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

export const taskAPI = {
  fetchAll: () => axiosInstance.get("/tasks"),
  fetchById: (id) => axiosInstance.get(`/tasks/${id}`),
  create: (taskData) => axiosInstance.post("/tasks", taskData),
  update: (id, taskData) => axiosInstance.put(`/tasks/${id}`, taskData),
  delete: (id) => axiosInstance.delete(`/tasks/${id}`),
  updateCompletion: (id, completionData) =>
    axiosInstance.put(`/tasks/${id}/completion`, completionData),
};

export const subtaskAPI = {
  fetchAll: () => axiosInstance.get("/subtasks"),
  fetchById: (id) => axiosInstance.get(`/subtasks/${id}`),
  create: (subtaskData) => axiosInstance.post("/subtasks", subtaskData),
  update: (id, subtaskData) =>
    axiosInstance.put(`/subtasks/${id}`, subtaskData),
  delete: (id) => axiosInstance.delete(`/subtasks/${id}`),
  markComplete: (id) => axiosInstance.patch(`/subtasks/${id}/complete`),
};

export const commentAPI = {
  create: (commentData) => axiosInstance.post("/comments", commentData),
  fetchByGoal: (goalId) => axiosInstance.get(`/comments/goal/${goalId}`),
  update: (id, commentData) =>
    axiosInstance.put(`/comments/${id}`, commentData),
  delete: (id) => axiosInstance.delete(`/comments/${id}`),
};

export const userAPI = {
  // Public routes
  register: (userData) => axiosInstance.post("/users", userData),
  login: (credentials) => axiosInstance.post("/users/login", credentials),

  // Protected routes
  logout: () => axiosInstance.post("/users/logout"),
  getProfile: () => axiosInstance.get("/users/profile"),
  updateProfile: (userData) => axiosInstance.put("/users/profile", userData),

  // Admin routes
  getAllUsers: () => axiosInstance.get("/users"),
  getUserById: (id) => axiosInstance.get(`/users/${id}`),
  updateUser: (id, userData) => axiosInstance.put(`/users/${id}`, userData),
  deleteUser: (id) => axiosInstance.delete(`/users/${id}`),
};
