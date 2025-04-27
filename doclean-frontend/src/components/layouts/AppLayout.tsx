import { Outlet } from "react-router-dom";

import Layout from "@/components/layouts/layout";
import LayoutAuth from "@/components/layouts/layout-auth";
import LayoutAuthenticated from "@/components/layouts/layout-authenticated";
import { useAuth } from "@/context/AuthProvider";

const AppLayout = () => {
  // const { isAuthenticated } = useAuth(); // Your auth hook/context

  return (
    <Layout>
      <Outlet />
    </Layout>
  );

  // return isAuthenticated ? (
  //   <LayoutAuthenticated>
  //     <Outlet />
  //   </LayoutAuthenticated>
  // ) : isAuthenticated !== null ? (
  //   <Layout>
  //     <Outlet />
  //   </Layout>
  // ) : null;
};

export default AppLayout;
