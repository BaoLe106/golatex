import { Outlet } from "react-router-dom";
import LayoutAuth from "@/components/layouts/layout-auth";
const AppLayoutForAuthenticationPages = () => {
  return (
    <LayoutAuth>
      <Outlet />
    </LayoutAuth>
  );
};

export default AppLayoutForAuthenticationPages;
