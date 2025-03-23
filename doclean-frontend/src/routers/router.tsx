import { createBrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import ProtectedRoutes from "@/routers/ProtectedRoutes";
import AppLayout from "@/components/layouts/AppLayout";
import Layout from "@/components/layouts/layout";
import LayoutAuth from "@/components/layouts/layout-auth";
import LayoutAuthenticated from "@/components/layouts/layout-authenticated";

import AboutView from "@/components/view/AboutView";
import PlaygroundView from "@/components/view/PlaygroundView";
import ProjectView from "@/components/view/ProjectView";
import LatexView from "@/components/view/LatexView";
import LoginView from "@/components/view/LoginView";
import RegisterView from "@/components/view/RegisterView";
import UserConfirmationView from "@/components/view/UserConfirmationView";
import ProjectManagementView from "@/components/view/ProjectManagementView";

import ForbiddenView from "@/components/view/ForbiddenView";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/about", element: <AboutView /> },
      { path: "/playground/:sessionId", element: <PlaygroundView /> },
      { path: "/project/:sessionId", element: <ProjectView /> },
      { path: "/forbidden", element: <ForbiddenView /> },
      { path: "/login", element: <LoginView /> },
      { path: "/register", element: <RegisterView /> },
      { path: "/confirm", element: <UserConfirmationView /> },
      { path: "/project", element: <ProjectManagementView /> },
      // { path: "/login", element: <LoginView /> },
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
