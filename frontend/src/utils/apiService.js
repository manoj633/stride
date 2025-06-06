// utils/api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
