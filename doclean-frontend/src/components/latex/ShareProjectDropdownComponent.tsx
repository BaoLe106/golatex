import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { renderToString } from 'react-dom/server';
import { toast } from "sonner";
import { ArrowLeft, CircleCheckBig, Copy, Share2, Link2, Loader2, Terminal, UserPlus, Plus, Settings, X } from "lucide-react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
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
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import InviteMemberEmailTemplate from "@/components/email/InviteMemberEmailTemplate";
import { MailService } from "@/services/mail/mailService";


const ShareProjectDropdownComponent: React.FC = () => {
  const inputComponentRef = useRef<HTMLInputElement>(null);

  const [isShareLinkDialogOpen, setIsShareLinkDialogOpen] = useState<boolean>(false)
  const [isLinkSettingDialogOpen, setIsLinkSettingDialogOpen] = useState<boolean>(false)
  const [radioValue, setRadioValue] = useState<string>("all");
  const [isBeingAddedMemberEmail, setIsBeingAddedMemberEmail] = useState<string>("");
  const [memberList, setMemberList] = useState<string[]>([]);

  const [inputError, setInputError] = useState<boolean>(false);

  // Handle click outside input component (to remove on error red border)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputComponentRef.current && !inputComponentRef.current.contains(event.target as Node)) {
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
      setRadioValue("all");
    }
  }, [isLinkSettingDialogOpen])

  const handleRadioChange = (value: string) => {
    setRadioValue(value);
  };

  const handleEmailInputChange =  (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsBeingAddedMemberEmail(e.target.value);
  };

  const handleAddMember = () => {
    if (!isBeingAddedMemberEmail) {
      setInputError(true);
      return;
    }

    if (memberList.includes(isBeingAddedMemberEmail)) {
      toast.error('Member existed');
      return;
    }
    
    setMemberList(prev => [...prev, isBeingAddedMemberEmail]);
    setIsBeingAddedMemberEmail("");
  }

  const removeMember = (removeEmail: string) => {
    setMemberList(prev => prev.filter(member => member !== removeEmail));
  }

  const handleApplyLinkSetting = () => {
    if (radioValue === "specific" && memberList.length === 0) {
      setInputError(true);
      toast.error("Please add at least 1 member")
      return;
    }

    const promises: Promise<any>[] = [];

    memberList.forEach(member => {
      promises.push(
        MailService.sendInviteMemberMail({
          from: 'lattex.info@gmail.com',
          to: member,
          subject: `Let's join us on Lattex`,
          html: renderToString(<InviteMemberEmailTemplate
            userEmail={member}
            invitedByEmail='le.giabao'
            projectLink={window.location.href}
          />)
        })
      )
    })
    
    Promise.all(promises).then((values) => {
      console.log(values);
    });

    setIsLinkSettingDialogOpen(false);
  }

  return (
    <>
      <Dialog open={isShareLinkDialogOpen} onOpenChange={setIsShareLinkDialogOpen}>
        {/* <DialogTrigger asChild>
          <Button variant="outline">Share</Button>
        </DialogTrigger> */}
        <DialogContent >
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-1">
              <CircleCheckBig />
              <span>Link Copied</span>
            </DialogTitle>
            <div className="flex items-center justify-between space-x-2">
              <DialogDescription>
                Anyone with the link can edit this project.
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
          {/* <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={window.location.href}
                readOnly
              />
            </div>
            <Button type="submit" size="sm" className="px-3">
              <span className="sr-only">Copy</span>
              <Copy />
            </Button>
          </div> */}
          {/* <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary" >
                Close
              </Button>
            </DialogClose>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkSettingDialogOpen} onOpenChange={setIsLinkSettingDialogOpen}>
        {/* <DialogTrigger asChild>
          <Button variant="outline">Share</Button>
        </DialogTrigger> */}
        <DialogContent >
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-1">
              <TooltipWrapper tooltipContent={"Back"}>
                <ArrowLeft 
                  className="cursor-pointer" 
                  onClick={() => {
                    setIsLinkSettingDialogOpen(false);
                    setIsShareLinkDialogOpen(true);
                  }}
                />
              </TooltipWrapper>
              <span>Link Settings</span>
            </DialogTitle>
            <DialogDescription>
              projectId
            </DialogDescription>
          </DialogHeader>
          <div className="flex-col items-center space-x-2 space-y-4">
            <div>The link is for</div>
            <RadioGroup defaultValue="all" onValueChange={handleRadioChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem className="bg-inherit p-0" value="all" id="all" />
                <Label htmlFor="all">Anyone on the internet</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem className="bg-inherit p-0" value="specific" id="specific" />
                <Label htmlFor="specific" className="flex flex-col space-y-1">
                  <span>People you choose</span>
                  {radioValue === "specific" &&  (
                    <span className="font-light">Share with specific people you choose using their email.</span>
                  )}
                </Label>
              </div>
              {radioValue === "specific" && memberList.length > 0 && (
                memberList.map((member, idx) => {
                  return (
                    <Badge key={idx} className="w-fit items-center space-x-2">
                      <span className="pb-1">{member}</span>
                      <TooltipWrapper tooltipContent={"Remove"} side="right">
                      <X
                        className='w-4 h-4 cursor-pointer'
                        onClick={() => removeMember(member)}
                      />
                      </TooltipWrapper>
                    </Badge>
                  )
                })
              )}
              {radioValue === "specific" && (
                <div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      ref={inputComponentRef} type="email" placeholder="Email" 
                      value={isBeingAddedMemberEmail} 
                      onChange={(e) => {
                        handleEmailInputChange(e);
                        setInputError(false);
                      }} 
                      error={inputError}
                    />

                    <TooltipWrapper tooltipContent={"Add member"}>
                      <Button 
                        size="sm" className="px-3" variant="secondary" 
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
                </div>
              )}
            </RadioGroup>
          </div>
          <DialogFooter className="sm:justify-end">
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
              <Share2/>
              <span>Share</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipWrapper>
        <DropdownMenuContent className="w-56" align="end">
          {/* <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={() => setTimeout(() => setIsShareLinkDialogOpen(true), 100)} //setTimeout important
            >
              <Link2 />
              <span>Copy link</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeout(() => setIsLinkSettingDialogOpen(true), 100)}>
              <UserPlus  />
              <span>Invite members via email</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
    
  )
}

export default ShareProjectDropdownComponent;