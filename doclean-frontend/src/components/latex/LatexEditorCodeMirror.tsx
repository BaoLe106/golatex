import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cloneDeep, has, set } from "lodash";
import {
  getCurrentEditorData,
  setCurrFileIdForCurrUserIdInSessionId,
} from "@/stores/editorSlice";

import "@/components/latex/styles.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-ocean.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/stex/stex";
import "codemirror/keymap/sublime";
import "codemirror/addon/search/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/jump-to-line.js";
import "codemirror/addon/dialog/dialog.js";
import CodeMirror from "codemirror";

import { useTheme } from "@/context/ThemeProvider";
import useWebRTCConnection from "@/hooks/useWebRTCConnection";
import { TexFileService } from "@/services/latex/texFileService";

import { Search, Loader2, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { FileTreeRefHandle } from "@/components/latex/FileTreeComponent";
import FileTreeComponent from "@/components/latex/FileTreeComponent";

import {
  // CreateFilePayload,
  // CompileToPdfPayload,
  FileData,
} from "@/services/latex/models";

const LatexEditorCodeMirror: React.FC = () => {
  const { theme } = useTheme();
  const { sessionId } = useParams<{ sessionId: string }>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileTreeRef = useRef<FileTreeRefHandle>(null);
  const isLocalChange = useRef<boolean>(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const [isCompileButtonLoading, setIsCompileButtonLoading] =
    useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [codeMirrorComponent, setCodeMirrorComponent] = useState<HTMLElement>();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  const [compileFile, setCompileFile] = useState({
    compileFileId: "",
    compileFileName: "",
    compileFileType: "",
    compileFileDir: "",
  });
  // const [formData, setFormData] = useState({
  //     email: "",
  //     password: "",
  //     passwordAgain: "",
  //   });
  const [compileError, setCompileError] = useState<string>("");
  const [hasContentFromFile, setHasContentFromFile] = useState<boolean>(false);
  const [isThereABibFile, setIsThereABibFile] = useState<boolean>(false);

  const {
    connect,
    isConnected,
    sendData: sendDataToPeers,
  } = useWebRTCConnection({
    // peerId: compileFile.compileFileId,
    sessionId: compileFile.compileFileId
      ? compileFile.compileFileId
      : sessionId,
    // signalServerUrl: window.location.pathname.includes("/playground")
    //   ? `ws://localhost:8080/api/v1/latex/playground/${sessionId}`
    //   : `ws://localhost:8080/api/v1/latex/${sessionId}`,
    onConnectionEstablished: (peerId: string) => {
      console.log("WebRTC connection established:", peerId);
    },
    onDataReceived: (peerId: string, event: any) => {
      // Handle data from peers
      const { type, data } = event;
      // if (data.type === 'content_update' && data.fileId) {
      //   handleRemoteContentUpdate(data.fileId, data.content);
      // }
      switch (type) {
        case "content_update":
          handleRemoteContentUpdate(data.fileId, data.content);
          break;
        case "file_created":
          if (fileTreeRef.current) {
            fileTreeRef.current.updateTreeData(data.fileTree);
          }

          break;
        default:
          console.log("debug data at on receive", data);
          // const dataFromInfoBroadcast = JSON.parse(data);

          // try {
          //   if (dataFromInfoBroadcast.sessionId !== sessionId)
          //     throw new Error("sessionId not match");
          //   if (
          //     dataFromInfoBroadcast.infoType === "file_created" ||
          //     dataFromInfoBroadcast.infoType === "file_content_saved"
          //   ) {
          //     if (fileTreeRef.current) {
          //       fileTreeRef.current.updateTreeData(
          //         dataFromInfoBroadcast.data.fileTree
          //       );
          //     }
          //   }
          // } catch (err) {
          //   if (
          //     !compileFile.compileFileId ||
          //     compileFile.compileFileId !== dataFromInfoBroadcast.fileId
          //   )
          //     return;

          //   editorInstance.setValue(dataFromInfoBroadcast.fileContent);
          // }
          // };

          console.log("debug type on received:", type);
      }
    },
  });

  // Handle content updates received from WebRTC peers
  const handleRemoteContentUpdate = (fileId: string, newContent: string) => {
    // Make sure we're not processing our own changes
    if (isLocalChange.current) return;

    // Update editor with content from peer
    if (editorInstance) {
      editorInstance.setValue(newContent);
    }

    // Update state
    // setContent(newContent);
  };

  useEffect(() => {
    if (!codeMirrorComponent) {
      return;
    }
    const CodeMirrorTheme = document.getElementsByClassName(
      "cm-s-material-ocean CodeMirror"
    );
    const CodeMirrorGuttersTheme =
      document.getElementsByClassName("CodeMirror-gutters");
    if (!CodeMirrorTheme || !CodeMirrorGuttersTheme) {
      return;
    }
    if (theme === "light") {
      (CodeMirrorTheme[0] as HTMLElement).style.backgroundColor = "#FFFFFF";
      (CodeMirrorGuttersTheme[0] as HTMLElement).style.background = "#FFFFFF";
    } else {
      (CodeMirrorTheme[0] as HTMLElement).style.backgroundColor = "#0F111A";
      (CodeMirrorGuttersTheme[0] as HTMLElement).style.background = "#0F111A";
    }
  }, [codeMirrorComponent, theme]);

  useEffect(() => {
    const documentEditor = document.getElementById(
      "code-editor"
    ) as HTMLTextAreaElement;
    const editor = CodeMirror.fromTextArea(documentEditor, {
      extraKeys: { "Ctrl-F": "findPersistent" },
      lineWrapping: true,
      lineNumbers: true,
      keyMap: "sublime",
      theme: "material-ocean",
      mode: "stex",
    });

    setEditorInstance(editor);

    const originalOpenDialog = editor.openDialog;
    editor.openDialog = function (template, callback, options = {}) {
      return originalOpenDialog.call(editor, template, callback, {
        ...options,
        closeOnBlur: false,
      });
    };

    const codeMirrorDialog =
      document.getElementsByClassName("CodeMirror-dialog");
    if (codeMirrorDialog && codeMirrorDialog.length) {
      console.log("debug dialog", codeMirrorDialog);
      (codeMirrorDialog[0] as HTMLElement).style.position = "absolute";
      (codeMirrorDialog[0] as HTMLElement).style.top = "0";
    }

    var charWidth = editor.defaultCharWidth(),
      basePadding = 4;
    editor.on("renderLine", function (cm, line, elt) {
      var off =
        CodeMirror.countColumn(line.text, null, cm.getOption("tabSize") ?? 0) *
        charWidth;
      elt.style.textIndent = "-" + off + "px";
      elt.style.paddingLeft = basePadding + off + "px";
    });

    const CodeMirrorComponent = document.getElementsByClassName("CodeMirror");
    setCodeMirrorComponent(CodeMirrorComponent[0] as HTMLElement);

    (CodeMirrorComponent[0] as HTMLElement).style.height = "0vh";

    // if (!hasContentFromFile)
    //   (CodeMirrorComponent[0] as HTMLElement).style.display = "none";

    const getTEXFromS3 = async () => {
      const s3Client = new S3Client({
        region: import.meta.env.VITE_AWS_REGION,
        credentials: {
          accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
          secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
        },
      });

      try {
        const getTexCommand = new GetObjectCommand({
          Bucket: "golatex--tex-and-pdf-files",
          Key: `tex/${sessionId}/sample.tex`,
        });

        const response = await s3Client.send(getTexCommand);

        if (response.Body) {
          const stream = response.Body as ReadableStream;

          // Read stream data and convert to string
          const reader = stream.getReader();
          const decoder = new TextDecoder("utf-8");
          let fileContent = "";
          let done = false;

          while (!done) {
            const { value, done: streamDone } = await reader.read();
            if (value) {
              fileContent += decoder.decode(value, { stream: true });
            }
            done = streamDone;
          }

          editor.setValue(fileContent);
          // setEditorContent(fileContent);
        }
      } catch (err) {
        console.log("debug catch err", err);
      }
    };
    const accessToken = localStorage.getItem("accessToken");
    // let socket: WebSocket;
    const currPath = window.location.pathname;
    if (currPath.includes("/playground")) {
      connect(`ws://localhost:8080/api/v1/latex/playground/${sessionId}`);
      // ["Authorization", `${accessToken ? accessToken : ""}`] // Pass token as a WebSocket protocol
    } else {
      connect(`ws://localhost:8080/api/v1/latex/${sessionId}`);
      // ["Authorization", `${accessToken ? accessToken : ""}`] // Pass token as a WebSocket protocol
    }

    // setWs(socket);

    if (!editorContent) {
      // getTEXFromS3();
    }

    // socket.on('connect_error', (err) => {
    //   console.log(`connect_error due to ${err.message}`)
    // })

    // socket.on('connect', () => {
    //   socket.emit('CONNECTED_TO_ROOM', { roomId, username })
    // })

    // socket.on('disconnect', () => {
    //   socket.emit('DISSCONNECT_FROM_ROOM', { roomId, username })
    // })

    // socket.on('ROOM:CONNECTION', (users) => {
    //   setUsers(users)
    //   console.log(users)
    // })

    // editor.on("change", (instance, changes) => {
    //   // console.log("debug on change", changes);
    //   const { origin } = changes;
    //   // if (origin === '+input' || origin === '+delete' || origin === 'cut') {
    //   if (origin !== "setValue") {
    //     setEditorContent(instance.getValue());
    //     console.log("debug on change", compileFile);
    //     socket.send(
    //       JSON.stringify({
    //         fileId: compileFile.compileFileId,
    //         fileContent: instance.getValue(),
    //       })
    //     );
    //   }
    // });

    // editor.on("cursorActivity", (instance) => {
    // console.log(instance.cursorCoorcode-editor())
    // });

    // return () => {
    //   socket.close();
    // };
  }, []);

  useEffect(() => {
    if (!compileFile.compileFileId || !editorInstance) return;

    setTimeout(() => {
      editorInstance.refresh();
    }, 1);
    // Define the event handlers
    const handleEditorChange = (instance: any, changes: any) => {
      const { origin } = changes;
      console.log("debug on change", isConnected);
      if (origin !== "setValue") {
        isLocalChange.current = true;

        if (isConnected) {
          sendDataToPeers({
            type: "content_update",
            fileId: compileFile.compileFileId,
            content: instance.getValue(),
          });
        }

        // ws.send(
        //   JSON.stringify({
        //     fileId: compileFile.compileFileId,
        //     fileContent: instance.getValue(),
        //   })
        // );
      }
    };

    const handleWsMessage = (event: any) => {
      const { data } = event;
      const dataFromInfoBroadcast = JSON.parse(data);

      try {
        if (dataFromInfoBroadcast.sessionId !== sessionId)
          throw new Error("sessionId not match");
        if (
          dataFromInfoBroadcast.infoType === "file_created" ||
          dataFromInfoBroadcast.infoType === "file_content_saved"
        ) {
          if (fileTreeRef.current) {
            fileTreeRef.current.updateTreeData(
              dataFromInfoBroadcast.data.fileTree
            );
          }
        }
      } catch (err) {
        if (
          !compileFile.compileFileId ||
          compileFile.compileFileId !== dataFromInfoBroadcast.fileId
        )
          return;

        editorInstance.setValue(dataFromInfoBroadcast.fileContent);
      }
    };

    // Attach the event listeners
    editorInstance.on("change", handleEditorChange);
    // ws.addEventListener("message", handleWsMessage);

    // Cleanup function to remove event listeners when compileFile changes or component unmounts
    return () => {
      editorInstance.off("change", handleEditorChange);
      // ws.removeEventListener("message", handleWsMessage);
    };
  }, [compileFile, sessionId, editorInstance, isConnected]);
  // }, [compileFile, ws, sessionId, editorInstance, isConnected]);

  const triggerSearch = () => {
    const dialog = document.querySelector(".CodeMirror-dialog");

    if (dialog) {
      dialog.remove();
    } else {
      editorInstance.execCommand("findPersistent");
    }
  };

  const compileTexToPdf = async () => {
    if (!sessionId) return;
    setIsCompileButtonLoading(true);
    try {
      setCompileError("");
      const res = await TexFileService.compileToPdf({
        sessionId,
        data: {
          isThereABibFile: isThereABibFile,
          ...compileFile,
        },
      });
      if (res.status !== 201) {
        throw new Error(res.data.error);
      }

      console.log(res.data.pdfUrl);
      setPdfUrl(res.data.pdfUrl);
    } catch (err: any) {
      console.log("debug catch err", err);
      setCompileError(err.response.data.error);
    } finally {
      setIsCompileButtonLoading(false);
    }
  };

  const setContent = (data: FileData) => {
    console.log("debug on set content", data);
    setCompileFile({
      compileFileId: data.fileId,
      compileFileName: data.fileName,
      compileFileType: data.fileType,
      compileFileDir: data.fileDir,
    });

    if (!hasContentFromFile && codeMirrorComponent) {
      setHasContentFromFile(true);
      codeMirrorComponent.style.height = "89vh";
    }

    editorInstance.setValue(data.content);
  };

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={10}>
          <FileTreeComponent
            ref={fileTreeRef}
            theme={theme}
            sessionId={sessionId}
            setContent={setContent}
            setIsThereABibFile={(value: boolean) => setIsThereABibFile(value)}
            // sendFileOrFolderCreatedInfo={sendFileOrFolderCreatedInfo}
          />
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={theme === "dark" ? "bg-black" : ""}
        />
        <ResizablePanel defaultSize={40} minSize={20}>
          <div
            className={
              "flex items-center h-11 " +
              (theme === "light" ? "bg-[#F0F0F0]" : "bg-black")
            }
          >
            <TooltipWrapper tooltipContent={"Search this file"}>
              <Button
                className={
                  "bg-inherit " +
                  (theme === "dark" ? "hover:bg-accent" : "hover:bg-white") +
                  (!hasContentFromFile ? " hidden" : "")
                }
                variant="ghost"
                size="icon"
                onClick={triggerSearch}
              >
                <Search className="absolute h-[1.2rem] w-[1.2rem] stroke-[3px]" />
              </Button>
            </TooltipWrapper>
          </div>
          {/* <textarea
            id="code-editor"
            className={!hasContentFromFile ? `hidden` : ""}
          /> */}
          <textarea id="code-editor" />
          {!hasContentFromFile && (
            <Alert className="w-2/3 border-none justify-self-center">
              <Terminal className="h-6 w-6" />
              <AlertTitle className="text-2xl">Info:</AlertTitle>
              <AlertDescription className="text-base">
                No file is selected. Please select a file from the left panel.
              </AlertDescription>
            </Alert>
          )}
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={theme === "dark" ? "bg-black" : ""}
        />
        <ResizablePanel defaultSize={40} minSize={20} className="mr-4">
          <div
            className={
              "flex items-center h-11 " +
              (theme === "light" ? "bg-[#F0F0F0]" : "bg-black")
            }
          >
            <TooltipWrapper tooltipContent={"Compile to PDF"}>
              <Button
                className="mr-3"
                onClick={compileTexToPdf}
                disabled={isCompileButtonLoading}
              >
                {isCompileButtonLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-1" />
                    Compiling...
                  </>
                ) : (
                  "Compiles"
                )}
              </Button>
            </TooltipWrapper>
            <p className="text-sm text-gray-500 italic">
              to be compiled file:
              <span className="font-semibold text-gray-600">
                {" "}
                {compileFile.compileFileName +
                  "." +
                  compileFile.compileFileType}
              </span>
            </p>
          </div>
          {compileError ? (
            <Alert
              variant="destructive"
              className="w-11/12 border-none justify-self-center"
            >
              <Terminal className="h-6 w-6" />
              <AlertTitle className="text-2xl">Error:</AlertTitle>
              <AlertDescription className="text-base">
                {compileError}
              </AlertDescription>
            </Alert>
          ) : (
            // <div className="text-red-500 text-sm italic">{compileError}</div>
            <iframe
              id="preview"
              src={pdfUrl}
              style={{ height: "89vh", width: "100%" }}
            ></iframe>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LatexEditorCodeMirror;
