import { useApiClient } from "@/services/base";
import { SendInviteMemberMailPayload } from "@/services/mail/models";

export const MailService = (() => {
  const apiClient = useApiClient();

  const sendInviteMemberMail = async (payload: SendInviteMemberMailPayload) => {
    const apiUrl = `/mail/invite`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.post(apiUrl, payload, config);
  };

  const getProjectMember = async (projectId: string) => {
    const apiUrl = `/mail/member/${projectId}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    return await apiClient.get(apiUrl, config);
  };

  return {
    sendInviteMemberMail,
    getProjectMember,
  };
})();
