import React, { useEffect } from "react";
import ContainerLayout from "@/components/ContainerLayout";
import { Separator } from "@/components/ui/separator";
import LatexEditorCodeMirror from "@/components/latex/LatexEditorCodeMirror";
const LatexView: React.FC = () => {
  useEffect(() => {
    //implement authentication if needed
    //if not authenticated -> navigate to /login
    //else if authenticated -> allow access
  }, []);

  return (
    <ContainerLayout className="w-full">
      {/* <div className="w-2/3 flex">
          <p className="font-medium text-3xl">About Doclean</p>
        </div> */}
      <div className="w-full flex flex-col">
        {/* <p>abc</p> */}
        <LatexEditorCodeMirror />
      </div>
    </ContainerLayout>
  );
};

export default LatexView;
