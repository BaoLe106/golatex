import React, { useEffect, useState, useCallback, useRef } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
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
  const { theme } = useTheme();
  const documentEditorRef = useRef<DocumentEditorContainerComponent>(null);
  const [previousContent, setPreviousContent] = useState<string>('');
  const [cssTheme, setCssTheme] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // const [quill, setQuill] = useState<Quill>();
  const { sessionId } = useParams<{ sessionId: string }>();

  // fluent

  useEffect(() => {
    if (theme === "light") {
      setCssTheme(`
        @import "../../../node_modules/@syncfusion/ej2-base/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-buttons/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-inputs/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-popups/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-lists/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-navigations/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-splitbuttons/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-dropdowns/styles/material.css";
        @import "../../../node_modules/@syncfusion/ej2-documenteditor/styles/material.css";
      `)
    } else {
      setCssTheme(`
        @import "../../../node_modules/@syncfusion/ej2-base/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-buttons/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-inputs/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-popups/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-lists/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-navigations/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-splitbuttons/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-dropdowns/styles/material-dark.css";
        @import "../../../node_modules/@syncfusion/ej2-documenteditor/styles/material-dark.css";  
      `)
    }
  }, [theme]);

  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    
    // Create WebSocket connection to the backend
    const socketConnection = new WebSocket(
      `ws://localhost:8080/api/v1/doc/${sessionId}`
    );
    console.log("debug here", socketConnection)
    // Set the WebSocket connection to state
    setSocket(socketConnection);

    return () => {
      socketConnection.close();
    };
  }, []);

  const handleContentChange = () => {
    if (!documentEditorRef.current || !socket) return; 
    const editorInstance = documentEditorRef.current.documentEditor
    const documentContent = editorInstance.serialize();
    setPreviousContent(documentContent)
    console.log("debug hi", socket)
    socket.send(
      JSON.stringify({
        content: JSON.parse(documentContent ?? ''),
      })
    );
  }
  // useEffect(() => {
  //   if (!documentEditorRef.current || !socket) return; 
  //   const editorInstance = documentEditorRef.current.documentEditor
  //   console.log('debug hello')
  //     // documentEditorRef.current.documentEditor.showRevisions = false;

  //   editorInstance.contentChange = () => {
    
  //     const documentContent = editorInstance.serialize();
  //     console.log("debug hi", documentContent)
  //     socket.send(
  //       JSON.stringify({
  //         type: 'contentUpdate',
  //         content: JSON.parse(documentContent ?? ''),
  //       })
  //     );
    
  //   };
    
  // });

  useEffect(() => {
    if (!socket) return;
    socket.onmessage = (event) => {
      console.log("debug event", event)
      const data = JSON.parse(event.data);
      console.log("debug data", data)
      if (documentEditorRef.current && data && data.content) {
        documentEditorRef.current.documentEditor.open(JSON.stringify(data.content));
      }
    };

    return () => {
      socket.close();
    };
  }, [previousContent])

  return (
    <div>
      <style>
        {cssTheme}
      </style>
      <DocumentEditorContainerComponent
        ref={documentEditorRef}
        height="590"
        enableToolbar={true}
        // enableTrackChanges={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        // beforeAcceptRejectChanges={beforeAcceptRejectChanges}
        contentChange={handleContentChange}
      >
        <Inject services={[Toolbar]}></Inject>
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
