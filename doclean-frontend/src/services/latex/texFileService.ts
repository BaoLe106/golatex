import { useApiClient } from "@/services/base";
import {
  CreateFilePayload,
  UploadFilePayload,
  CompileToPdfPayload,
  DownloadFilePayload,
} from "@/services/latex/models";

export const TexFileService = (() => {
  const apiClient = useApiClient();

  const checkPlaygroundConnection = async (sessionId: string) => {
    const apiUrl = `/latex/playground/check/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    await apiClient.get(apiUrl, config);
  };

  const checkConnection = async (sessionId: string) => {
    const apiUrl = `/latex/check/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    await apiClient.get(apiUrl, config);
  };

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

  const downloadFile = async (data: DownloadFilePayload) => {
    const apiUrl = `/file/download`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, data, config);
  };

  const deleteFile = async (sessionId: string, fileId: string) => {
    const apiUrl = `/file/${sessionId}/${fileId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.delete(apiUrl, config);
  };

  return {
    checkPlaygroundConnection,
    checkConnection,
    compileToPdf,
    getFilesByProjectId,
    createFile,
    uploadFiles,
    downloadFile,
    deleteFile,
  };
})();
