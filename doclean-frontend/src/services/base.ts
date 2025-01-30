import { createAxiosApiClient } from "@/services/config/axios-config";

const apiClient = createAxiosApiClient();

// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("accessToken");
//   config.headers.Authorization = token ? `Bearer ${token}` : "";
//   return config;
// });

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "localhost:3006/";
    }
    return Promise.reject(error);
  }
);

export function useApiClient() {
  return apiClient;
}
