import Layout from "@/components/layout";
import ContainerLayout from "@/components/ContainerLayout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@/components/ui/separator";
import DocEditor1 from "@/components/doc/DocEditor1";

const PlaygroundView: React.FC = () => {
  return (
    <Layout>
      <ContainerLayout className="w-full">
        {/* <div className="w-2/3 flex">
          <p className="font-medium text-3xl">About Doclean</p>
        </div> */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger className="fixed right-10 bottom-20" asChild>
            <Button variant="outline">Open</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuItem>Subscription</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
        <div className="w-full flex flex-col">
          <DocEditor1 />
        </div>
      </ContainerLayout>
    </Layout>

    // </ThemeProvider>
  );
};

export default PlaygroundView;
