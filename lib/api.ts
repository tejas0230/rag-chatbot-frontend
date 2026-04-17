import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
    validateStatus: (status) => status >= 200 && status < 300,
    transformRequest: (data, headers) => {
        return JSON.stringify(data);
    },
    transformResponse: (data) => {
        return JSON.parse(data);
    },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      window.location.href = "/sign-in"
    }
    return Promise.reject(error)
  },
)