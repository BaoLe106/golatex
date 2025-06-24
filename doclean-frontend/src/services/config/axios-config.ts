import axios from "axios";

export const createAxiosApiClient = () => {
  return axios.create({
    baseURL: `https://${import.meta.env.VITE_API_ENDPOINT}`,
    withCredentials: true,
  });
};
