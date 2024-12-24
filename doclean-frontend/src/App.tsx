import Layout from "@/components/layout";
import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";
import read_notes from "@/assets/undraw_read_notes.svg";
import team_colab from "@/assets/undraw_team_colab.svg";
import share_link from "@/assets/undraw_share_link.svg";
function App() {
  return (
    <Layout>
      <ContainerLayout className="w-full">
        <br />
        <br />
        <h1 className="font-medium text-center">
          Your lightweight Latex editor.
        </h1>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div className="flex items-center">
          <ContainerLayout>
            <img
              style={{ width: "300px", height: "150px" }}
              src={read_notes}
              alt="Logo"
            />
            <p className="text-2xl">Easy to use</p>
          </ContainerLayout>
          <Separator className="min-h-64 w-0.5 mx-2" orientation="vertical" />
          <ContainerLayout>
            <img
              style={{ width: "300px", height: "150px" }}
              src={team_colab}
              alt="Logo"
            />
            <p className="text-2xl">Colaborative</p>
          </ContainerLayout>
          <Separator className="min-h-64 w-0.5 mx-2" orientation="vertical" />
          <ContainerLayout>
            <img
              style={{ width: "300px", height: "150px" }}
              src={share_link}
              alt="Logo"
            />
            <p className="text-2xl">For everyone</p>
          </ContainerLayout>
        </div>
      </ContainerLayout>
    </Layout>

    // </ThemeProvider>
  );
}

export default App;
