import { useApiClient } from "@/services/base";
import {
  CreateFilePayload,
  UploadFilePayload,
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

  const uploadFiles = async (data: UploadFilePayload) => {
    const apiUrl = `/file/upload/${data.projectId}`;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return await apiClient.post(apiUrl, data.formData, config);
  };

  return {
    compileToPdf,
    getFilesByProjectId,
    createFile,
    uploadFiles,
  };
})();
