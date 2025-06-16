import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthService } from "@/services/auth/authService";
import ContainerLayout from "@/components/ContainerLayout";
import LatexEditorCodeMirror from "@/components/latex/LatexEditorCodeMirror";
import Forbidden from "@/components/common/Forbidden";
import { Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthProvider";

interface ProjectSchema {
  projectId: string;
  projectName: string;
  projectTier: string;
  projectShareType: number;
  lastUpdatedBy: string | null;
  lastUpdatedAt: string;
}

const ProjectView: React.FC = () => {
  const { projectShareType } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectSchema | any>(null);
  // const [isShowingSelectLoginMethodModal, setIsShowingSelectLoginMethodModal] =
  //   useState<boolean>(false);
  const [canRenderLatexEditorComponent, setCanRenderLatexEditorComponent] =
    useState<boolean>(false);
  // const [isProjectAccessForbidden, setIsProjectAccessForbidden] =
  //   useState<boolean>(false);

  useEffect(() => {
    // if (sessionId) getProjectByProjectId(sessionId);
  }, []);

  useEffect(() => {
    if (!project) return;
    console.log("debug project", project);
    // getUserInfoByUserEmail();
    setCanRenderLatexEditorComponent(true);
    // if (project.projectTier === "GUEST") {
    //   if (isAuthenticated) {
    //     setCanRenderLatexEditorComponent(true);
    //     return;
    //   }

    //   const guestId = sessionStorage.getItem("guestId");
    //   if (!guestId) {
    //     setIsShowingSelectLoginMethodModal(true);
    //   }
    // }
    // // else if (project.projectTier !== "GU") {

    // // }
    // else {
    //   if (!isAuthenticated) {
    //     setIsShowingSelectLoginMethodModal(false);
    //     setIsProjectAccessForbidden(true);
    //   } else {
    //     getUserInfoByUserEmail();
    //     setCanRenderLatexEditorComponent(true);
    //   }
    //   // navigate("/forbidden");
    // }
  }, [project]);

  // const getUserInfoByUserEmail = async () => {
  //   try {
  //     const res = await AuthService.getUserInfoByUserEmail();
  //     if (res.userTier) {
  //     }
  //   } catch (err) {
  //     console.log("debug err at get user", err);
  //   }
  // };

  

  // !IMPORTANT, OVERLAY MODAL IS HERE
  // !IMPORTANT, OVERLAY MODAL IS HERE
  // !IMPORTANT, OVERLAY MODAL IS HERE
  // if (isShowingSelectLoginMethodModal) {
  //   return (
  //     <Dialog
  //       open={true}
  //       onOpenChange={() => {
  //         setIsShowingSelectLoginMethodModal(false);
  //         // navigate("/");
  //       }}
  //     >
  //       <DialogContent className="w-96 h-72" overlay={true}>
  //         <DialogHeader>
  //           <DialogTitle className="text-2xl text-center">
  //             Join Golatex?
  //           </DialogTitle>
  //         </DialogHeader>
  //         <div className="grid w-full items-center gap-4">
  //           <div className="flex justify-center items-center space-x-4">
  //             <Button
  //               className="flex flex-col bg-inherit w-40 h-40 text-base text-wrap"
  //               variant="outline"
  //               onClick={() => {
  //                 setIsShowingSelectLoginMethodModal(false);
  //                 navigate("/login");
  //               }}
  //             >
  //               <User className="h-8 w-8 mb-2" />
  //               Register or Login
  //             </Button>
  //             <Button
  //               className="flex flex-col bg-inherit w-40 h-40 text-base text-wrap"
  //               variant="outline"
  //               onClick={() => {
  //                 setIsShowingSelectLoginMethodModal(false);
  //                 setCanRenderLatexEditorComponent(true);
  //               }}
  //             >
  //               <Bot className="h-8 w-8 mb-2" />
  //               Continue as Guest
  //             </Button>
  //           </div>
  //         </div>
  //       </DialogContent>
  //     </Dialog>
  //   );
  // } else
  // if (canRenderLatexEditorComponent) {
  return (
    <ContainerLayout className="w-full">
      <div className="w-full flex flex-col">
        {/* <LatexEditor /> */}
        {projectShareType !== null ? (
          <LatexEditorCodeMirror projectShareType={projectShareType}/>
        ) : null}
        
      </div>
    </ContainerLayout>
  );
  // }
  // else if (isProjectAccessForbidden) {
  //   return <Forbidden />;
  // }
};

export default ProjectView;
