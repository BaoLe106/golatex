import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { v4 as uuidv4 } from "uuid";
type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const sessionId = uuidv4();

  return (
    <div className="min-h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="w-full max-h-16 items-center bg-white dark:bg-black sticky top-0 p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 ml-3 items-center">
            <a href="/">
              <h1 className="text-3xl">GoLatex</h1>
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
            <Button className="bg-inherit" variant="ghost">
              Login
            </Button>
            <a href="/doc">
              <Button>Start Writing</Button>
            </a>
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
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t p-3 bg-white dark:bg-black">
        <div className="text-center">
          <p className="">©2024 GoLatex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
