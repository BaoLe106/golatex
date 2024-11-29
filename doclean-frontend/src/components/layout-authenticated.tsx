import { ReactNode } from "react";
import { Settings  } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
// import { v4 as uuidv4 } from "uuid";
type LayoutProps = {
  children: ReactNode;
};

const LayoutAuthenticated: React.FC<LayoutProps> = ({ children }) => {
  // const sessionId = uuidv4();

  return (
    <div className="min-h-screen min-w-[100vw] flex flex-col">
      {/* Header */}
      <header className="min-w-full max-h-16 items-center bg-white dark:bg-black sticky top-0 p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 ml-3">
            <a href="/">
              <h1 className="text-3xl">Doclean</h1>
            </a>
            {/* <a href="/about">
              <Button className="bg-inherit" variant="ghost">
                About
              </Button>
            </a>
            <a href={`/playground/${sessionId}`}>
              <Button className="bg-inherit" variant="ghost">
                Playground
              </Button>
            </a> */}
          </div>
          <div className="flex space-x-2 mr-3">
          {/* border-solid border-inherit */}
            <Button className="border-black dark:border-white" variant="outline">
              Save
            </Button>
            <Button className="bg-inherit" variant="ghost">
              Share
            </Button>
            <Button className="bg-inherit" variant="ghost">
              <Settings/>
            </Button>
            
            {/* <Button>Start Writing</Button> */}
            <ThemeToggle></ThemeToggle>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <div className="container mx-auto">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-3 border-t">
        <div className="container mx-auto text-center">
          <p>©2024 Doclean. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LayoutAuthenticated;
