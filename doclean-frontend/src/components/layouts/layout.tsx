import { ReactNode } from "react";
import { ProjectService } from "@/services/projects/projectService";
import { AppName } from "@/const/layout-const";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { v4 as uuidv4 } from "uuid";
import { useTheme } from "@/context/ThemeProvider";
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const sessionId = uuidv4();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const createProject = async (sessionId: string) => {
    if (!sessionId) return;
    try {
      await ProjectService.createProject(sessionId, "GUEST");
      navigate(`/project/${sessionId}`);
    } catch (err: any) {}
  };

  return (
    <div className="min-h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="w-full max-h-16 items-center bg-white dark:bg-black sticky top-0 p-4 border-b z-50">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 ml-3 items-center">
            <a href="/">
              <h1 className="text-3xl pb-1">{AppName}</h1>
            </a>

            <a href="/about">
              <Button className="bg-inherit" variant="ghost">
                About
              </Button>
            </a>
            <a href={`/playground/${sessionId}`}>
              <Button className="bg-inherit" variant="ghost">
                Playground
              </Button>
            </a>
          </div>
          <div className="flex space-x-2 mr-3 items-center">
            {/* <a href="/login">
              <Button className="bg-inherit" variant="ghost">
                Login
              </Button>
            </a> */}
            {/* <a href={`/project/${sessionId}`}> */}
            <Button onClick={() => createProject(sessionId)}>
              Start Writing
            </Button>
            {/* </a> */}

            <ThemeToggle></ThemeToggle>
          </div>
        </div>
      </header>

      {/* <div className="flex flex-1">
        Sidebar
        <aside className="w-64 bg-gray-800 text-white p-4">
          <nav>
            <ul>
              <li className="mb-2">
                <a href="/" className="block p-2 hover:bg-gray-700 rounded">
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/about"
                  className="block p-2 hover:bg-gray-700 rounded"
                >
                  About
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="/contact"
                  className="block p-2 hover:bg-gray-700 rounded"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        Main Content
        */}
      <div className="flex flex-1">
        <main className="flex-1 justify-items-center w-full">
          <div className="w-full">{children}</div>
          <Toaster
            theme={theme}
            richColors
            closeButton
            position="bottom-right"
            toastOptions={{}}
          />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t p-3 bg-white dark:bg-black">
        <div className="text-center">
          <p className="">©2024 {AppName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
