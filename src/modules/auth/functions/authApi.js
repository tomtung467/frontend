import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

export const loginApi = async (payload) => {
  const res = await API.post("/auth/login", payload);
  return res.data;
};

export const registerApi = async (payload) => {
  const res = await API.post("/auth/register", payload);
  return res.data;
};