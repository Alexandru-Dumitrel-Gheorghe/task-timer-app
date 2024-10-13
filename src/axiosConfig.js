// src/axiosConfig.js
import axios from "axios";

// Basis-URL Ihres Backends
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Erstellen einer neuen Axios-Instanz
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Hinzufügen eines Interceptors, um den JWT-Token zu jedem Request hinzuzufügen
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
