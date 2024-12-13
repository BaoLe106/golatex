import React, { useEffect, useState, useCallback, useRef } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import "./styles.css";
import {
  DocumentEditorContainerComponent,
  CollaborativeEditingHandler,
  DocumentEditorComponent,
  Toolbar,
  Inject,
  ContainerContentChangeEventArgs,
  Operation,
  ActionInfo,
} from "@syncfusion/ej2-react-documenteditor";

import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_KEY);

DocumentEditorContainerComponent.Inject(CollaborativeEditingHandler);

const DocEditor: React.FC = () => {
  const { theme } = useTheme();
  const documentEditorRef = useRef<DocumentEditorContainerComponent | null>(null);
  // const collaborativeEditingHandler = useRef<CollaborativeEditingHandler | null>(null);
  // const [collaborativeEditingHandler, setCollaborativeEditingHandler] = useState<CollaborativeEditingHandler | null>(null);
  const [collaborativeEditingHandler, setCollaborativeEditingHandler] = useState<CollaborativeEditingHandler | undefined>(undefined);
  const [cssTheme, setCssTheme] = useState<string>('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const isReceivingData = useRef<Boolean>(false);
  const { sessionId } = useParams<{ sessionId: string }>();


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

  const initializeWebSocket = () => {
    const ws = new WebSocket(
      `ws://localhost:8080/api/v1/doc/${sessionId}`
    );

    ws.onopen = () => {
      console.log('WebSocket connection established.');
        // connectToRoom({ action: 'connect', roomName: currentRoomName, currentUser });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("debug event", event)
      console.log("debug data", data)
      handleDataReceived(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    setSocket(ws);

    // return () => {ws.close()}
  };

  const handleDataReceived = (data: any) => {
    console.log("debug data", data)
    if (documentEditorRef.current) {
      // setIsReceivingData(true);
      isReceivingData.current = true;
      const documentEditor = documentEditorRef.current.documentEditor;
      documentEditor.editor.insertText(data.text)
    }
    
    // if (collaborativeEditingHandler) {
    //   console.log("debug here", data)
      
    //   collaborativeEditingHandler.applyRemoteAction(
    //     "action",
    //     {operations: [data] as Operation[]} as ActionInfo
    //   );
      
    // }
  };


  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    console.log("debug hi")
    if (!socket) initializeWebSocket();

    if (documentEditorRef.current) {
      const documentEditor = documentEditorRef.current.documentEditor;
      documentEditor.enableCollaborativeEditing = true;
      
      const handler = documentEditor.collaborativeEditingHandlerModule;
      setCollaborativeEditingHandler(handler);
    }
    if (socket) return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    if (documentEditorRef.current) {
      documentEditorRef.current.contentChange = (args: ContainerContentChangeEventArgs) => {
        console.log("debug arg", args)
        if (isReceivingData.current) {
          isReceivingData.current = false;
          return;
        }
        if (args.operations) {
          console.log("debug r u here")
          socket?.send(JSON.stringify(args.operations[0]))
          
        }
          
          // console.log("debug arg", args.operations[0])
          // socket?.send(JSON.stringify({ content: args.operations[0]}))
          
        // collaborativeEditingHandler?.sendActionToServer(args.operations as Operation[]);
      };
    }
  }, [socket]);


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
        // serviceUrl={`http://localhost:8080/api/v1/doc/${sessionId}`}
      >
        <Inject services={[Toolbar, CollaborativeEditingHandler]}></Inject>
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
