import { useApiClient } from "@/services/base";
import {
  CreateFilePayload,
  CompileToPdfPayload,
} from "@/services/latex/models";

export const TexFileService = (() => {
  const apiClient = useApiClient();

  const compileToPdf = async ({ sessionId, data }: CompileToPdfPayload) => {
    const apiUrl = `/latex/pdf/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, data, config);
  };

  const getFilesByProjectId = async (sessionId: string) => {
    const apiUrl = `/file/${sessionId}`;
    // const config = {
    //   headers: {
    //     "x-role": roleId
    //   }
    // };
    const res = await apiClient.get(apiUrl);
    console.log("debug res", res);
    return res.data;
  };

  const createFile = async (data: CreateFilePayload) => {
    const apiUrl = `/file/${data.projectId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, data, config);
  };

  return {
    compileToPdf,
    createFile,
    getFilesByProjectId,
  };
})();
