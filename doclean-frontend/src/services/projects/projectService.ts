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

  const getProjectMember = async (projectId: string) => {
    const apiUrl = `/project/member/${projectId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.get(apiUrl, config);
  };

  const createProject = async (sessionId: string, payload: {}) => {
    const apiUrl = `/project/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, payload, config);
  };

  const updateProjectInfo = async (sessionId: string, data: any) => {
    const apiUrl = `/project/${sessionId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.put(apiUrl, data, config);
  };

  const deleteProjectMember = async (sessionId: string, memberId: string) => {
    const apiUrl = `/project/member/${sessionId}/${memberId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.delete(apiUrl, config);
  };

  return {
    getProjectByProjectId,
    getProjectMember,
    createProject,
    updateProjectInfo,
    deleteProjectMember,
  };
})();
