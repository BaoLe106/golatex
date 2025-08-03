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

  return {
    sendInviteMemberMail,
  };
})();
