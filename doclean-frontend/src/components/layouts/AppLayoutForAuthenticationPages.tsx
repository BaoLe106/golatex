import { Outlet } from "react-router-dom";
import LayoutAuth from "@/components/layouts/layout-auth";
import Layout from "@/components/layouts/layout";
const AppLayoutForAuthenticationPages = () => {
  return (
    <LayoutAuth>
      <Outlet />
    </LayoutAuth>
  );
};

export default AppLayoutForAuthenticationPages;
