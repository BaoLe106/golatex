import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { cloneDeep } from "lodash";
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
import { TexFileService } from "@/services/latex/texFileService";

import { Search, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipWrapper } from "@/components/ui/tooltip-wrapper";
import { FileTreeRefHandle } from "@/components/latex/FileTreeComponent";
import FileTreeComponent from "@/components/latex/FileTreeComponent";

const LatexEditorCodeMirror: React.FC = () => {
  const { theme } = useTheme();
  const { sessionId } = useParams<{ sessionId: string }>();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileTreeRef = useRef<FileTreeRefHandle>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isCompileButtonLoading, setIsCompileButtonLoading] =
    useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [codeMirrorComponent, setCodeMirrorComponent] = useState<HTMLElement>();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [editorContent, setEditorContent] = useState<string>("");

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
    // (CodeMirrorComponent[0] as HTMLElement).style.width = "40%";
    (CodeMirrorComponent[0] as HTMLElement).style.height = "89vh";

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
          setEditorContent(fileContent);
        }
      } catch (err) {
        console.log("debug catch err", err);
      }
    };
    const accessToken = localStorage.getItem("accessToken");
    const socket = new WebSocket(
      `ws://localhost:8080/api/v1/latex/${sessionId}`
      // ["Authorization", `${accessToken ? accessToken : ""}`] // Pass token as a WebSocket protocol
    );
    setWs(socket);
    socket.onmessage = (event: any) => {
      const { data } = event;
      try {
        const dataFromInfoBroadcast = JSON.parse(data);
        console.log(dataFromInfoBroadcast);
        if (dataFromInfoBroadcast.sessionId !== sessionId) return;
        if (dataFromInfoBroadcast.infoType === "file_created") {
          if (fileTreeRef.current) {
            console.log("debug r u here");
            fileTreeRef.current.updateTreeData(
              dataFromInfoBroadcast.data.fileTree
            );
          }
        }
      } catch (err) {
        console.log("debug on hello");
        editor.setValue(data);
        setEditorContent(data);
      }

      // if ()
    };

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
    // editor.
    editor.on("change", (instance, changes) => {
      console.log("debug on change", changes);
      const { origin } = changes;
      // if (origin === '+input' || origin === '+delete' || origin === 'cut') {
      if (origin !== "setValue") {
        setEditorContent(instance.getValue());
        socket.send(instance.getValue());
      }
    });
    // editor.on("cursorActivity", (instance) => {
    // console.log(instance.cursorCoorcode-editor())
    // });

    return () => {
      socket.close();
    };
  }, []);

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
      const res = await TexFileService.compileToPdf({
        sessionId,
        data: { content: editorContent },
      });
      if (res.status !== 201) {
        throw new Error(res.data.error);
      }

      console.log(res.data.pdfUrl);
      setPdfUrl(res.data.pdfUrl);
    } catch (err) {
      console.log("debug catch err", err);
    } finally {
      setIsCompileButtonLoading(false);
    }
  };

  const setContent = (content: string) => {
    console.log("debug on set content", content);
    editorInstance.setValue(content);
    // setEditorContent(content);
  };

  return (
    <div>
      {/* <div
        className="grid grid-cols-3"
        style={{ width: "100%", backgroundColor: "red" }}
      >
        <div>1</div>
        <div>2</div>
        <div>3</div>
        <div
          style={{ backgroundColor: "green", width: "120px" }}
          onClick={convertToTex}
        >
          Create TEX
        </div>
        <div
          style={{ backgroundColor: "yellow", width: "120px" }}
          onClick={getPDFFromS3}
        >
          Get files
        </div>
      </div> */}

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={10}>
          <FileTreeComponent
            ref={fileTreeRef}
            theme={theme}
            sessionId={sessionId}
            setContent={setContent}
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
                  (theme === "dark" ? "hover:bg-accent" : "hover:bg-white")
                }
                variant="ghost"
                size="icon"
                onClick={triggerSearch}
              >
                <Search className="absolute h-[1.2rem] w-[1.2rem] stroke-[3px]" />
              </Button>
            </TooltipWrapper>
          </div>
          <textarea id="code-editor" />
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
          </div>
          <iframe
            id="preview"
            src={pdfUrl}
            style={{ height: "89vh", width: "100%" }}
          ></iframe>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LatexEditorCodeMirror;
