import axios from 'axios';

const API_URL = "https://bank-server-4xw9.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // <--- CRITICAL: Enables sending/receiving cookies
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;