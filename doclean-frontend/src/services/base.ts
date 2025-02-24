// import { AuthService } from "@/services/auth/authService";
import { createAxiosApiClient } from "@/services/config/axios-config";
const apiClient = createAxiosApiClient();

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;
    if (error.response?.status === 401) {
      prevRequest._retry = true; // Prevent infinite loop
      const refreshToken = localStorage.getItem("refreshToken");
      const currentUserEmail = sessionStorage.getItem("currentUserEmail");
      // if (!currentUserEmail) continue;
      try {
        const apiUrl = `/auth/refresh`;
        const config = {
          headers: {
            "Content-Type": "application/json",
          },
        };
        const data = {
          email: currentUserEmail ? currentUserEmail : "",
          refreshToken: refreshToken ? refreshToken : "",
        };
        const refreshResult = (await apiClient.post(apiUrl, data, config)).data;
        // return res.data;

        if (refreshResult) {
          localStorage.setItem("accessToken", refreshResult.AccessToken);
          localStorage.setItem("refreshToken", refreshResult.RefreshToken);

          prevRequest.headers[
            "Authorization"
          ] = `Bearer ${refreshResult.AccessToken}`;
          // Retry the failed request with the new token
          return (await apiClient(prevRequest)).data;
        } else {
          window.location.href = "localhost:3006/";
        }
      } catch (err) {
        console.error("Token refresh failed", err);
        window.location.href = "http://localhost:3006/";
      }
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  config.headers.Authorization = token ? `Bearer ${token}` : "";
  return config;
});

export function useApiClient() {
  return apiClient;
}
