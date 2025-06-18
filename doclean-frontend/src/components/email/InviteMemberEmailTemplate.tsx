import {
  Body,
  Button,
  // Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  // Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface InviteMemberEmailTemplateProps {
  username?: string;
  userEmail?: string;
  userImage?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  teamImage?: string;
  projectLink?: string;
  inviteFromIp?: string;
  inviteFromLocation?: string;
}

// const baseUrl = process.env.VERCEL_URL
//   ? `https://${process.env.VERCEL_URL}`
//   : '';

export const InviteMemberEmailTemplate = ({
  // username,
  userEmail,
  // userImage,
  // invitedByUsername,
  invitedByEmail,
  // teamName,
  // teamImage,
  projectLink,
  inviteFromIp,
  inviteFromLocation,
}: InviteMemberEmailTemplateProps) => {
  const previewText = `Join with ${invitedByEmail} on Lattex`;

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Preview>{previewText}</Preview>
          <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-[#eaeaea] border-solid p-[20px]">
            <Section className="mt-[32px]">
              <Img
                // src={`${baseUrl}/static/vercel-logo.png`}
                src="/logo.png"
                width="40"
                height="37"
                alt="App Logo"
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-normal text-[24px] text-black">
              Join with <strong>{invitedByEmail}</strong> on{" "}
              <strong>Lattex</strong>
            </Heading>
            <Text className="text-[14px] text-black leading-[24px]">
              Hello {userEmail},
            </Text>
            <Text className="text-[14px] text-black leading-[24px]">
              <strong>
                <Link
                  href={`mailto:${invitedByEmail}`}
                  className="text-blue-600 no-underline"
                >
                  {invitedByEmail}{" "}
                </Link>
              </strong>
              has invited you to join them on <strong>Lattex</strong>.
            </Text>
            <Section className="mt-[32px] mb-[32px] text-center">
              <Button
                className="rounded bg-[#000000] px-5 py-3 text-center font-semibold text-[12px] text-white no-underline"
                href={projectLink}
              >
                Join the project
              </Button>
            </Section>
            <Text className="text-[14px] text-black leading-[24px]">
              or copy and paste this URL into your browser:{" "}
              <Link href={projectLink} className="text-blue-600 no-underline">
                {projectLink}
              </Link>
            </Text>
            <Hr className="mx-0 my-[26px] w-full border border-[#eaeaea] border-solid" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This invitation was intended for{" "}
              <span className="text-black">{userEmail}</span>. This invite was
              sent from <span className="text-black">{inviteFromIp}</span>
              <span className="text-black">{inviteFromLocation}</span>. If you
              were not expecting this invitation, you can ignore this email. If
              you are concerned about your account's safety, please reply to
              this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// InviteMemberEmailTemplate.PreviewProps = {
//   username: 'alanturing',
//   userImage: `${baseUrl}/static/vercel-user.png`,
//   invitedByUsername: 'Alan',
//   invitedByEmail: 'alan.turing@example.com',
//   teamName: 'Enigma',
//   teamImage: `${baseUrl}/static/vercel-team.png`,
//   projectLink: 'https://vercel.com',
//   inviteFromIp: '204.13.186.218',
//   inviteFromLocation: 'São Paulo, Brazil',
// } as InviteMemberEmailTemplateProps;

export default InviteMemberEmailTemplate;
