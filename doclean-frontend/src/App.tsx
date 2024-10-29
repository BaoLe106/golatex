import Layout from "@/components/layout";
import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";
import man_using_computer from "@/assets/man_using_computer.png";
import colab from "@/assets/colab.png";
import everyone from "@/assets/everyone.png";
function App() {
  return (
    <Layout>
      <ContainerLayout className="w-full">
        <h1 className="font-medium text-center">
          Your lightweight text editor.
        </h1>
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className="w-4/6 flex items-center">
          <ContainerLayout>
            <img width="300" src={man_using_computer} alt="Logo" />
            <p className="text-2xl">Easy to use</p>
          </ContainerLayout>
          <Separator className="min-h-64 w-0.5 mx-2" orientation="vertical" />
          <ContainerLayout>
            <img width="300" src={colab} alt="Logo" />
            <p className="text-2xl">Colaborative</p>
          </ContainerLayout>
          <Separator className="min-h-64 w-0.5 mx-2" orientation="vertical" />
          <ContainerLayout>
            <img width="300" src={everyone} alt="Logo" />
            <p className="text-2xl">For everyone</p>
          </ContainerLayout>
        </div>
      </ContainerLayout>
    </Layout>

    // </ThemeProvider>
  );
}

export default App;
