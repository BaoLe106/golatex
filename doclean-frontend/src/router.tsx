import { createBrowserRouter } from "react-router-dom";
import App from "@/App.tsx";
import AboutView from "@/components/view/AboutView";
// import DocumentEditor from "@/components/view/Document";
import PlaygroundView from "@/components/view/PlaygroundView";

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
  {
    path: "/playground/:sessionId",
    element: <PlaygroundView />,
  },
  // {
  //   path: "/writing",
  //   element: <MdWritingView />,
  // },
]);

export default router;
