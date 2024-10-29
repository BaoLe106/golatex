import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "@/App.tsx";
import AboutView from "@/components/view/AboutView";
import { ThemeProvider } from "@/components/theme-provider";
import "@/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // errorElement:
  },
  {
    path: "/about",
    element: <AboutView />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);
