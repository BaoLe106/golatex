import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

// import { AuthProvider } from "@/context/authContext";
import router from "@/routers/router";
import { store } from "@/stores/main";
import "@/index.css";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  </Provider>
  // </StrictMode>
);
