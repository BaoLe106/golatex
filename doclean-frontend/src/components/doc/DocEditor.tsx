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

import { registerLicense, select } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_KEY);

DocumentEditorContainerComponent.Inject(CollaborativeEditingHandler);

const DocEditor: React.FC = () => {
  const { theme } = useTheme();
  const documentEditorRef = useRef<DocumentEditorContainerComponent | null>(
    null
  );
  // const collaborativeEditingHandler = useRef<CollaborativeEditingHandler | null>(null);
  // const [collaborativeEditingHandler, setCollaborativeEditingHandler] = useState<CollaborativeEditingHandler | null>(null);
  // const [collaborativeEditingHandler, setCollaborativeEditingHandler] =
  //   useState<CollaborativeEditingHandler | undefined>(undefined);
  const [cssTheme, setCssTheme] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const isReceivingData = useRef<Boolean>(false);
  const currentPosition = useRef<string>("");
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
      `);
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
      `);
    }
  }, [theme]);

  const initializeWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8080/api/v1/doc/${sessionId}`);

    ws.onopen = () => {
      console.log("WebSocket connection established.");
      // connectToRoom({ action: 'connect', roomName: currentRoomName, currentUser });
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // console.log("debug event", event)
      // console.log("debug data", data);
      handleDataReceived(data);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    setSocket(ws);

    // return () => {ws.close()}
  };

  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    console.log("debug hi");
    if (!socket) initializeWebSocket();

    if (documentEditorRef.current) {
      const documentEditor = documentEditorRef.current.documentEditor;
      documentEditor.enableCollaborativeEditing = true;
      currentPosition.current = documentEditor.selection.endOffset;

      // console.log("debug documentEditor", documentEditor);
      // const handler = documentEditor.collaborativeEditingHandlerModule;
      // setCollaborativeEditingHandler(handler);
    }
    if (socket)
      return () => {
        socket.close();
      };
  }, []);

  function replaceCharAt(str: string, index: number, replacement: string) {
    // if (index < 0 || index >= str.length) {
    //   throw new Error("Index out of range");
    // }
    return str.substring(0, index) + replacement + str.substring(index + 1);
  }

  const handleDataReceived = (data: any) => {
    console.log("debug data", data);
    if (documentEditorRef.current) {
      // setIsReceivingData(true);
      isReceivingData.current = true;

      const documentEditor = documentEditorRef.current.documentEditor;
      // documentEditor.editor.character
      console.log("debug test pos", documentEditor.selection);

      if (data.action === "Format") {
        console.log("debug data in format", data);
        documentEditor.selection.select(data.startPosition, data.endPosition);

        const format = JSON.parse(data.format);
        Object.entries(format).forEach(([key, value]) => {
          if (key in documentEditor.selection.characterFormat) {
            (documentEditor.selection.characterFormat as any)[key] = value;
          } else {
            console.warn(`debug Unsupported format property: ${key}`);
          }
        });
      } else if (data.action === "Delete") {
        const startDeletePosition = data.startPosition;
        const endDeletePosition = replaceCharAt(
          data.startPosition,
          4,
          (parseInt(data.startPosition[4]) + 1).toString()
        );
        documentEditor.selection.select(startDeletePosition, endDeletePosition);
        documentEditor.editor.delete();
      } else if (data.pasteContent) {
        documentEditor.selection.select(
          data.position,
          data.position
        );
        documentEditor.editor.paste(data.pasteContent);
      } else {
        documentEditor.selection.select(
          data.position,
          data.position
        );

        documentEditor.editor.insertText(data.text);
      }

      // const characterFormat = documentEditor.selection.characterFormat;
      // characterFormat.bold = true;

      documentEditor.selection.select(
        currentPosition.current,
        currentPosition.current
      );
    }
  };

  useEffect(() => {
    if (!socket) return;

    if (documentEditorRef.current) {
      const currentDocumentEditor = documentEditorRef.current;
      currentDocumentEditor.contentChange = (
        args: ContainerContentChangeEventArgs
      ) => {
        console.log("debug arg", args);
        console.log(
          "debug curr position",
          documentEditorRef?.current?.documentEditor.selection
          // .select()
        );
        if (isReceivingData.current) {
          isReceivingData.current = false;
          return;
        }
        if (args.operations) {
          let currPos = "";
          let pasteContent = "";
          if (args.operations[0].text === "\n") {
            if (!currentDocumentEditor.documentEditor.selection.editPosition) {
              const endOffset = cloneDeep(
                currentDocumentEditor.documentEditor.selection.endOffset
              );
              currPos = replaceCharAt(
                endOffset,
                2,
                (parseInt(endOffset[2]) - 1).toString()
              );
            } else {
              const editPosition = cloneDeep(
                currentDocumentEditor.documentEditor.selection.editPosition
              );
              currPos = replaceCharAt(
                editPosition,
                4,
                (parseInt(editPosition[4]) + 1).toString()
              );
            }
          } else if (args.operations[0].type === "Paste" && args.operations[0].pasteContent) {
            pasteContent = cloneDeep(args.operations[0].pasteContent)
            const selectionEditPositionCloneDeep = cloneDeep(currentDocumentEditor.documentEditor.selection.editPosition);

            currPos = replaceCharAt(
              selectionEditPositionCloneDeep,
              4,
              (parseInt(selectionEditPositionCloneDeep[4]) + 1).toString()
            );
          } else {
            currPos = cloneDeep(
              currentDocumentEditor.documentEditor.selection.editPosition
            );
          }
          currentPosition.current =
            currentDocumentEditor.documentEditor.selection.endOffset;
          // const currPos = currentDocumentEditor.documentEditor.selection
          //   .editPosition
          //   ? currentDocumentEditor.documentEditor.selection.editPosition
          //   : currentDocumentEditor.documentEditor.selection.endOffset;
          const selection = cloneDeep(
            currentDocumentEditor.documentEditor.selection
          );
          console.log(
            "debug start and end",
            selection.startOffset,
            selection.endOffset
          );
          const data: any = cloneDeep(args.operations[0]);
          data["position"] = currPos;
          data["startPosition"] = selection.startOffset;
          data["endPosition"] = selection.endOffset;
          if (pasteContent) {
            console.log("debug do we have paste content?", pasteContent);
            data["pasteContent"] = pasteContent;
          }
          console.log("debug send data", data);
          socket?.send(JSON.stringify(data));
        }

        // console.log("debug arg", args.operations[0])
        // socket?.send(JSON.stringify({ content: args.operations[0]}))

        // collaborativeEditingHandler?.sendActionToServer(args.operations as Operation[]);
      };
    }
  }, [socket]);

  return (
    <div>
      <style>{cssTheme}</style>
      <DocumentEditorContainerComponent
        ref={documentEditorRef}
        height="590"
        enableToolbar={true}
        // enableTrackChanges={true}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        // serviceUrl={`http://localhost:8080/api/v1/doc/${sessionId}`}
      >
        <Inject services={[Toolbar]}></Inject>
      </DocumentEditorContainerComponent>
    </div>
  );
};

export default DocEditor;
