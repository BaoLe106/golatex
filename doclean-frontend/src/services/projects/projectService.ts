import { useApiClient } from "@/services/base";

export const ProjectService = (() => {
  const apiClient = useApiClient();

  const getProjectByProjectId = async (sessionId: string) => {
    const apiUrl = `/project/${sessionId}`;
    // const config = {
    //   headers: {
    //     "x-role": roleId
    //   }
    // };
    const res = await apiClient.get(apiUrl);
    return res.data;
  };

  return {
    getProjectByProjectId,
  };
})();
