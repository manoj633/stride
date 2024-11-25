// utils/api.js
import axios from "axios";

const BASE_URL = "https://stride-qd71.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
