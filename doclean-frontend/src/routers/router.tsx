import { createBrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import ProtectedRoutes from "@/routers/ProtectedRoutes";
import AppLayout from "@/components/layouts/AppLayout";
import AppLayoutForAuthenticationPages from "@/components/layouts/AppLayoutForAuthenticationPages";

import AboutView from "@/components/view/AboutView";
import PlaygroundView from "@/components/view/PlaygroundView";
import ProjectView from "@/components/view/ProjectView";
import LatexView from "@/components/view/LatexView";
import LoginView from "@/components/view/LoginView";
import RegisterView from "@/components/view/RegisterView";
import UserConfirmationView from "@/components/view/UserConfirmationView";
import ProjectManagementView from "@/components/view/ProjectManagementView";

import NotFoundView from "@/components/view/NotFoundView";
import ForbiddenView from "@/components/view/ForbiddenView";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // errorElement: <NotFoundView />,
    children: [
      { path: "/", element: <App /> },
      { path: "/about", element: <AboutView /> },
      { path: "/playground/:sessionId", element: <PlaygroundView /> },
      { path: "/forbidden", element: <ForbiddenView /> },
      {
        // element: <ProtectedRoutes />,
        children: [
          { path: "/project/:sessionId", element: <ProjectView /> },
          // { path: "/project", element: <ProjectManagementView /> },
        ],
      },
      { path: "*", element: <NotFoundView /> },

      // { path: "/login", element: <LoginView /> },
    ],
  },
  {
    element: <AppLayoutForAuthenticationPages />,
    children: [
      { path: "/login", element: <LoginView /> },
      { path: "/register", element: <RegisterView /> },
      { path: "/confirm", element: <UserConfirmationView /> },
    ],
  },
]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: (
//       // <Layout>
//       <App />
//       // </Layout>
//     ),
//   },
//   {
//     path: "/about",
//     element: (
//       // <Layout>
//       <AboutView />
//       // </Layout>
//     ),
//   },
//   {
//     path: "/playground/:sessionId",
//     //will render layout depends on auth state
//     element: (
//       // <Layout>
//       <PlaygroundView />
//       // </Layout>
//     ),
//   },
//   {
//     path: "/project/:sessionId",
//     element: (
//       // <Layout>
//       <ProjectView />
//       // </Layout>
//     ),
//   },
//   {
//     path: "/forbidden",
//     element: (
//       // <Layout>
//       <ForbiddenView />
//       // </Layout>
//     ),
//   },
//   {
//     path: "/login",
//     element: (
//       // <LayoutAuth>
//       <LoginView />
//       // </LayoutAuth>
//     ),
//   },
//   {
//     path: "/register",
//     element: (
//       // <LayoutAuth>
//       <RegisterView />
//       // </LayoutAuth>
//     ),
//   },
//   {
//     path: "/confirm",
//     element: (
//       // <LayoutAuth>
//       <UserConfirmationView />
//       // </LayoutAuth>
//     ),
//   },
//   {
//     path: "/",
//     // element: <ProtectedRoutes />,
//     children: [
//       {
//         path: "/project",
//         element: (
//           // <LayoutAuthenticated>
//           <ProjectManagementView />
//           // </LayoutAuthenticated>
//         ),
//       },
//     ],
//   },
//   // {
//   //   path: "/writing",
//   //   element: <MdWritingView />,
//   // },
// ]);

export default router;
