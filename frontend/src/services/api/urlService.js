// services/api/index.js

import { axiosInstance } from "../../utils/apiService";

export const tagAPI = {
  fetchAll: () => axiosInstance.get("/tags"),
  create: (tagData) => axiosInstance.post("/tags", tagData),
  update: (id, tagData) => axiosInstance.put(`/tags/${id}`, tagData),
  delete: (id) => axiosInstance.delete(`/tags/${id}`),
};
