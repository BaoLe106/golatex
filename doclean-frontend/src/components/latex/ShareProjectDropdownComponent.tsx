import { useEffect, useState, useRef } from "react";
import { renderToString } from "react-dom/server";
import { toast } from "sonner";
import {
  ArrowLeft,
  CircleCheckBig,
  Share2,
  Link2,
  Loader2,
  UserPlus,
  Plus,
  Settings,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import InviteMemberEmailTemplate from "@/components/email/InviteMemberEmailTemplate";
import { MailService } from "@/services/mail/mailService";
import { ProjectService } from "@/services/projects/projectService";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ShareProjectDropdownComponentProps {
  sessionId: string | undefined;
  projectShareType: number;
}

interface existedMemberProps {
  id: string;
  email: string;
}

const ShareProjectDropdownComponent = ({
  sessionId,
  projectShareType,
}: ShareProjectDropdownComponentProps) => {
  const inputComponentRef = useRef<HTMLInputElement>(null);

  const [isShareLinkDialogOpen, setIsShareLinkDialogOpen] =
    useState<boolean>(false);
  const [isLinkSettingDialogOpen, setIsLinkSettingDialogOpen] =
    useState<boolean>(false);
  const [radioValue, setRadioValue] = useState<string>("all");
  const [isBeingAddedMemberEmail, setIsBeingAddedMemberEmail] =
    useState<string>("");
  const [isModifyingMember, setIsModifyingMember] = useState<boolean>(false);
  const [memberList, setMemberList] = useState<string[]>([]);
  const [existedMember, setExistedMember] = useState<existedMemberProps[]>([]);
  const [showBackArrow, setShowBackArrow] = useState<boolean>(true);

  const [inputError, setInputError] = useState<boolean>(false);

  // Handle click outside input component (to remove on error red border)
  useEffect(() => {
    getProjectMembers();
    switch (projectShareType) {
      case 0:
        setRadioValue("none");
        break;
      case 1:
        setRadioValue("all");
        break;
      case 2:
        setRadioValue("specific");
        break;
      default:
      // code block
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputComponentRef.current &&
        !inputComponentRef.current.contains(event.target as Node)
      ) {
        setInputError(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isLinkSettingDialogOpen) {
      setMemberList([]);
      setShowBackArrow(true);
    }
  }, [isLinkSettingDialogOpen]);

  const getProjectMembers = async () => {
    try {
      if (!sessionId) return;
      const res = await ProjectService.getProjectMember(sessionId);
      if (res.data) {
        // let tempExistedMember: string[] = []
        setExistedMember(
          res.data.map((data: any) => {
            return {
              id: data.id,
              email: data.email,
            };
          })
        );
      }
    } catch (err) {}
  };

  const handleRadioChange = (value: string) => {
    setRadioValue(value);
  };

  const handleAddMember = () => {
    if (!isBeingAddedMemberEmail) {
      setInputError(true);
      return;
    }

    if (memberList.includes(isBeingAddedMemberEmail)) {
      toast.error("Member existed");
      return;
    }

    setMemberList((prev) => [...prev, isBeingAddedMemberEmail]);
    setIsBeingAddedMemberEmail("");
  };

  const removeMember = (removeEmail: string) => {
    setMemberList((prev) => prev.filter((member) => member !== removeEmail));
  };

  const removeExistingMember = async (memberId: string) => {
    try {
      if (!sessionId) return;
      setIsModifyingMember(true);
      await ProjectService.deleteProjectMember(sessionId, memberId);
      await getProjectMembers();
    } catch (err) {
    } finally {
      setIsModifyingMember(false);
    }
  };

  const handleApplyLinkSetting = async () => {
    if (!sessionId) return;

    if (radioValue === "specific" && memberList.length === 0) {
      setInputError(true);
      toast.error("Please add at least 1 member");
      return;
    }

    const promises: Promise<any>[] = [];

    promises.push(
      ProjectService.updateProjectInfo(sessionId, {
        project_share_type: radioValue === "all" ? 1 : 2,
      })
    );

    memberList.forEach((member) => {
      promises.push(
        MailService.sendInviteMemberMail({
          projectId: sessionId,
          from: import.meta.env.VITE_SENDER_MAIL,
          to: member,
          subject: `Let's join us on Lattex`,
          html: renderToString(
            <InviteMemberEmailTemplate
              userEmail={member}
              invitedByEmail="le.giabao"
              projectLink={window.location.href}
            />
          ),
        })
      );
    });

    await Promise.all(promises);
    setIsLinkSettingDialogOpen(false);
    await getProjectMembers();
  };

  return (
    <>
      <Dialog
        open={isShareLinkDialogOpen}
        onOpenChange={setIsShareLinkDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-1">
              <CircleCheckBig />
              <span>Link Copied</span>
            </DialogTitle>
            <div className="flex items-center justify-between space-x-2">
              <DialogDescription>
                {projectShareType !== 1 ? (
                  <span>
                    People with existing access can edit this project.
                  </span>
                ) : (
                  <span>Anyone with the link can edit this project.</span>
                )}
              </DialogDescription>
              <Button
                className="bg-inherit"
                variant="ghost"
                onClick={() => {
                  setIsShareLinkDialogOpen(false);
                  setIsLinkSettingDialogOpen(true);
                }}
              >
                <Settings />
                Setting
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isLinkSettingDialogOpen}
        onOpenChange={setIsLinkSettingDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-1">
              {showBackArrow && (
                <TooltipWrapper tooltipContent={"Back"}>
                  <ArrowLeft
                    className="cursor-pointer"
                    onClick={() => {
                      setIsLinkSettingDialogOpen(false);
                      setIsShareLinkDialogOpen(true);
                    }}
                  />
                </TooltipWrapper>
              )}
              {showBackArrow ? (
                <span>Link Settings</span>
              ) : (
                <span>Invite Members</span>
              )}
            </DialogTitle>
            <DialogDescription>Share this project to</DialogDescription>
          </DialogHeader>
          <div className="flex-col items-center space-x-2 space-y-4">
            <RadioGroup onValueChange={handleRadioChange} value={radioValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="bg-inherit p-0"
                  value="none"
                  id="none"
                />
                <Label htmlFor="none">None</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="bg-inherit p-0"
                  value="all"
                  id="all"
                />
                <Label htmlFor="all">Anyone on the internet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="bg-inherit p-0"
                  value="specific"
                  id="specific"
                />
                <Label htmlFor="specific" className="flex flex-col space-y-1">
                  <span>People you choose</span>
                  {radioValue === "specific" && (
                    <span className="font-light">
                      Share with specific people you choose using their email.
                    </span>
                  )}
                </Label>
              </div>
              {radioValue === "specific" &&
                memberList.length > 0 &&
                memberList.map((member, idx) => {
                  return (
                    <Badge key={idx} className="w-fit items-center space-x-2">
                      <span className="pb-1">{member}</span>
                      <TooltipWrapper tooltipContent={"Remove"} side="right">
                        <X
                          className="w-4 h-4 cursor-pointer"
                          onClick={() => removeMember(member)}
                        />
                      </TooltipWrapper>
                    </Badge>
                  );
                })}
              {radioValue === "specific" && (
                <div>
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={inputComponentRef}
                      type="email"
                      placeholder="Enter your members' email"
                      value={isBeingAddedMemberEmail}
                      onChange={(e) => {
                        setIsBeingAddedMemberEmail(e.target.value);
                        setInputError(false);
                      }}
                      error={inputError}
                    />

                    <TooltipWrapper tooltipContent={"Add member"}>
                      <Button
                        size="sm"
                        className="px-3"
                        variant="secondary"
                        // disabled={!isBeingAddedMemberEmail.length}
                        onClick={handleAddMember}
                      >
                        <Plus />
                      </Button>
                    </TooltipWrapper>
                  </div>
                  {inputError && (
                    <p className="text-red-700 text-sm">
                      Please input member's email
                    </p>
                  )}
                  <div className="!m-0">
                    <Separator className="my-4" />
                    <div className="flex text-sm font-medium space-x-2">
                      <span>
                        People with access (can edit){" "}
                        {projectShareType === 2
                          ? `(${existedMember.length}/3)`
                          : ""}
                      </span>
                      {isModifyingMember && (
                        <Loader2 className="animate-spin" />
                      )}
                    </div>
                    <div className="grid gap-2 mt-4">
                      {isModifyingMember && (
                        <div className="absolute inset-0 z-10 cursor-not-allowed" />
                      )}
                      {existedMember.length > 0 &&
                        existedMember.map((member, idx) => {
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between space-x-4"
                            >
                              <div className="flex items-center space-x-4">
                                <Avatar>
                                  <AvatarFallback>
                                    {member.email.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <TooltipWrapper tooltipContent={"Remove member"}>
                                <X
                                  className="w-4 h-4 cursor-pointer text-red-500"
                                  onClick={() =>
                                    removeExistingMember(member.id)
                                  }
                                />
                              </TooltipWrapper>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </RadioGroup>
          </div>
          <DialogFooter className="justify-end">
            {/* <DialogClose asChild> */}
            <Button type="button" onClick={handleApplyLinkSetting}>
              Apply
            </Button>
            {/* </DialogClose> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <TooltipWrapper tooltipContent={"Share your project"}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="mr-6">
              <Share2 />
              <span>Share</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipWrapper>
        <DropdownMenuContent className="w-56" align="end">
          {/* <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() =>
                setTimeout(() => setIsShareLinkDialogOpen(true), 100)
              } //setTimeout important
            >
              <Link2 />
              <span>Copy link</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setShowBackArrow(false);
                setTimeout(() => {
                  // setRadioValue("specific");
                  setIsLinkSettingDialogOpen(true);
                }, 100);
              }}
            >
              <UserPlus />
              <span>Invite members via email</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShareProjectDropdownComponent;
