import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Trash2,
  BookUser,
  Folders,
  Link2,
  Search,
  Settings,
  Plus,
} from "lucide-react";

interface AppSidebarProps {
  isOpen?: boolean;
  getCurrTabView: () => void;
}

const AppSidebar = ({ isOpen, getCurrTabView }: AppSidebarProps) => {
  const items = [
    {
      title: "All Projects",
      url: "#",
      onClick: () => {
        localStorage.setItem("sidebar", "allProjects");
        getCurrTabView();
      },
      icon: Folders,
    },
    {
      title: "Your Projects",
      url: "#",
      onClick: () => {
        localStorage.setItem("sidebar", "userProjects");
        getCurrTabView();
      },
      icon: BookUser,
    },
    {
      title: "Shared with you",
      url: "#",
      onClick: () => {
        localStorage.setItem("sidebar", "sharedProjects");
        getCurrTabView();
      },
      icon: Link2,
    },
    {
      title: "Trashed Projects",
      url: "#",
      onClick: () => {
        localStorage.setItem("sidebar", "trashedProjects");
        getCurrTabView();
      },
      icon: Trash2,
    },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings,
    // },
  ];

  return (
    <Sidebar className="top-[--header-height]" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={
                (isOpen ? "justify-center" : "") +
                " bg-primary hover:bg-primary/90 text-white hover:text-white dark:text-black dark:hover:text-black"
              }
            >
              <Plus />
              {isOpen && <span>New Project</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a onClick={item.onClick}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};

export default AppSidebar;
