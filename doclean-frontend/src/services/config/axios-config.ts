import axios from "axios";

export const createAxiosApiClient = () => {
  return axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
    withCredentials: true,
  });
};
