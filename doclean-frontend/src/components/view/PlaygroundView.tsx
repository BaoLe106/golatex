import ContainerLayout from "@/components/ContainerLayout";

import LatexEditorCodeMirror from "@/components/latex/LatexEditorCodeMirror";

const PlaygroundView: React.FC = () => {
  return (
    <ContainerLayout className="w-full">
      <div className="w-full flex flex-col">
        {/* <LatexEditor /> */}
        <LatexEditorCodeMirror />
      </div>
    </ContainerLayout>
  );
};

export default PlaygroundView;
