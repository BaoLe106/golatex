import Layout from "@/components/layout";
import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";
import DocEditor from "@/components/doc/DocEditor";

const PlaygroundView: React.FC = () => {
  return (
    <Layout>
      <ContainerLayout className="w-full">
        <div className="w-2/3 flex">
          <p className="font-medium text-3xl">About Doclean</p>
        </div>
        <div className="w-2/3 flex flex-col">
          <p>abc</p>
          <DocEditor />
        </div>
      </ContainerLayout>
    </Layout>

    // </ThemeProvider>
  );
};

export default PlaygroundView;
