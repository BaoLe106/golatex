import React, { useEffect, useState, useCallback } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import "./styles.css";
import {
  DocumentEditorContainerComponent,
  Toolbar,
  Inject,
} from "@syncfusion/ej2-react-documenteditor";

import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_KEY);
let PAGE_HEIGHT: number = 862;

const DocEditor: React.FC = () => {
  let editorObj: DocumentEditorContainerComponent | null;
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [quill, setQuill] = useState<Quill>();
  const { sessionId } = useParams<{ sessionId: string }>();

  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    // Create WebSocket connection to the backend
    const socketConnection = new WebSocket(
      `ws://localhost:8080/api/v1/doc/${sessionId}`
    );

    // Set the WebSocket connection to state
    setSocket(socketConnection);

    return () => {
      socketConnection.close();
    };
  }, []);

  return (
    <div>
      <DocumentEditorContainerComponent
        ref={(ins: any) => (editorObj = ins)}
        height="590"
        enableToolbar={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
      >
        <Inject services={[Toolbar]}></Inject>
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
