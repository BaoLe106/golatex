import { useApiClient } from "@/services/base";

interface CreateTexFileRequest {
  sessionId: string;
  data: any;
}

export const TexFileService = (() => {
  const apiClient = useApiClient();

  const createTexFile = async ({ sessionId, data }: CreateTexFileRequest) => {
    const apiUrl = `/latex/tex/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, data, config);
  };

  return {
    createTexFile,
  };
})();
