import React, { useEffect } from "react";
import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";
const ProjectManagementView: React.FC = () => {
  useEffect(() => {
    //implement authentication if needed
    //if not authenticated -> navigate to /login
    //else if authenticated -> allow access
  }, []);

  return (
    <ContainerLayout className="w-full">
      <div className="w-full flex flex-col">
        <p>Hi, Welcome</p>
      </div>
    </ContainerLayout>
  );
};

export default ProjectManagementView;
