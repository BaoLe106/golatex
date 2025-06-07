import { ReactNode, useState } from "react";
import { AppName } from "@/const/layout-const";
import { Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
// import { v4 as uuidv4 } from "uuid";
interface LayoutProps {
  children: ReactNode;
}

const LayoutAuthenticated: React.FC<LayoutProps> = ({ children }) => {
  // const sessionId = uuidv4();
  const [currentUserEmail, _] = useState<string | null>(
    sessionStorage.getItem("currentUserEmail")
  );

  return (
    <div className="min-h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="w-full max-h-16 items-center bg-white dark:bg-black sticky top-0 p-4 border-b z-50">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 ml-3 items-center">
            <a href="/">
              <h1 className="text-3xl">{AppName}</h1>
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
          <div className="flex space-x-2 mr-3  items-center">
            <Button className="bg-inherit" variant="ghost">
              Pricing
            </Button>
            {/* <Button className="bg-inherit" variant="ghost">
              <Settings />
            </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-inherit !px-2" variant="ghost">
                  <div className="mr-2">Help </div>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Why GoLatex?</DropdownMenuItem>
                <DropdownMenuItem>Contact Us</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="!px-2">
                  <div className="mr-2">Account </div>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{currentUserEmail}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Account settings</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500 focus:text-red-600">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* <Button>Start Writing</Button> */}
            <ThemeToggle></ThemeToggle>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <main className="flex-1 justify-items-center w-full">
          <div className="w-full">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="p-3 border-t bg-white dark:bg-black z-50">
        <div className="text-center">
          <p>©2024 {AppName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LayoutAuthenticated;
