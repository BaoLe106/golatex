import React, { useEffect, useState } from "react";
import ContainerLayout from "@/components/ContainerLayout";
import {
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// const { Header, Sider, Content } = Layout;
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/common/AppSidebar";

const ProjectManagementView: React.FC = () => {
  // const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [currTabView, setCurrTabView] = useState(
    localStorage.getItem("sidebar")
      ? localStorage.getItem("sidebar")
      : "allProjects"
  );
  // const {
  //   token: { colorBgContainer, borderRadiusLG },
  // } = antdTheme.useToken();

  useEffect(() => {
    //implement authentication if needed
    //if not authenticated -> navigate to /login
    //else if authenticated -> allow access
    if (!localStorage.getItem("sidebar")) {
      localStorage.setItem("sidebar", "allProjects");
    }
  }, []);

  const getCurrTabView = () => {
    setCurrTabView(localStorage.getItem("sidebar"));
  };

  return (
    // <div className="[--header-height:80px]">
    <ContainerLayout className="w-full">
      <SidebarProvider>
        <AppSidebar isOpen={isOpen} getCurrTabView={getCurrTabView} />
        <main className="w-full">
          <div>
            <div className="sticky top-16 bg-white dark:bg-black">
              <SidebarTrigger onClick={() => setIsOpen(!isOpen)} />
              {/* <Separator orientation="horizontal" className="mb-2" /> */}
            </div>
            {/* <Card className="m-2 mr-5 h-screen"> */}
            {currTabView === "allProjects" ? (
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
            ) : currTabView === "userProjects" ? (
              <div>userProjects</div>
            ) : currTabView === "sharedProjects" ? (
              <div>sharedProjects</div>
            ) : currTabView === "trashedProjects" ? (
              <div>trashedProjects</div>
            ) : null}
            {/* </Card> */}
          </div>
          {/* {children} */}
        </main>
      </SidebarProvider>
    </ContainerLayout>
  );
};

export default ProjectManagementView;
