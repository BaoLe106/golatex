interface SendInviteMemberMailPayload {
  from: string;
  to: string | string[];
  subject: string;
  html: string;
}

export type { SendInviteMemberMailPayload };