import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen min-w-[100vw] flex flex-col">
      {/* Header */}
      <header className="min-w-full max-h-16 items-center bg-white dark:bg-black sticky top-0 p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2 ml-3">
            <a href="/">
              <h1 className="text-3xl">Doclean</h1>
            </a>
            <a href="/about">
              <Button className="bg-inherit" variant="ghost">
                About
              </Button>
            </a>
            <Button className="bg-inherit" variant="ghost">
              Playground
            </Button>
          </div>
          <div className="flex space-x-2 mr-3">
            <Button className="bg-inherit" variant="ghost">
              Login
            </Button>
            <Button>Start Writing</Button>
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

export default Layout;
