import ContainerLayout from "@/components/ContainerLayout";

import LatexEditorCodeMirror from "@/components/latex/LatexEditorCodeMirror";

const PlaygroundView: React.FC = () => {
  return (
    <ContainerLayout className="w-full">
      <div className="w-full flex flex-col">
        <LatexEditorCodeMirror projectShareType={0}/>
      </div>
    </ContainerLayout>
  );
};

export default PlaygroundView;
