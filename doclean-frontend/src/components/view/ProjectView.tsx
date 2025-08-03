import ContainerLayout from "@/components/ContainerLayout";
import LatexEditorCodeMirror from "@/components/latex/LatexEditorCodeMirror";
import { useAuth } from "@/context/AuthProvider";

// interface ProjectSchema {
//   projectId: string;
//   projectName: string;
//   projectTier: string;
//   projectShareType: number;
//   lastUpdatedBy: string | null;
//   lastUpdatedAt: string;
// }

const ProjectView: React.FC = () => {
  const { projectShareType } = useAuth();
  // const [isProjectAccessForbidden, setIsProjectAccessForbidden] =
  //   useState<boolean>(false);

  

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
