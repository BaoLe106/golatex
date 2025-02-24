import { createBrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import ProtectedRoutes from "@/routers/ProtectedRoutes";

import Layout from "@/components/layouts/layout";
import LayoutAuth from "@/components/layouts/layout-auth";
import LayoutAuthenticated from "@/components/layouts/layout-authenticated";

import AboutView from "@/components/view/AboutView";
import PlaygroundView from "@/components/view/PlaygroundView";
import LatexView from "@/components/view/LatexView";
import LoginView from "@/components/view/LoginView";
import RegisterView from "@/components/view/RegisterView";
import UserConfirmationView from "@/components/view/UserConfirmationView";
import ProjectManagementView from "@/components/view/ProjectManagementView";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <App />
      </Layout>
    ),
  },
  {
    path: "/about",
    element: (
      <Layout>
        <AboutView />
      </Layout>
    ),
  },
  {
    path: "/playground/:sessionId",
    element: (
      <Layout>
        <PlaygroundView />
      </Layout>
    ),
  },
  {
    path: "/login",
    element: (
      <LayoutAuth>
        <LoginView />
      </LayoutAuth>
    ),
  },
  {
    path: "/register",
    element: (
      <LayoutAuth>
        <RegisterView />
      </LayoutAuth>
    ),
  },
  {
    path: "/confirm",
    element: (
      <LayoutAuth>
        <UserConfirmationView />
      </LayoutAuth>
    ),
  },
  {
    path: "/",
    element: <ProtectedRoutes />,
    children: [
      {
        path: "/project",
        element: (
          <LayoutAuthenticated>
            <ProjectManagementView />
          </LayoutAuthenticated>
        ),
      },
    ],
  },
  // {
  //   path: "/writing",
  //   element: <MdWritingView />,
  // },
]);

export default router;
