import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";

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
import useWebsocket from "@/hooks/useWebsocket";
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
import ShareProjectDropdownComponent from "@/components/latex/ShareProjectDropdownComponent";

import { FileData } from "@/services/latex/models";

interface LatexEditorCodeMirrorProps {
  projectShareType: number;
}

const LatexEditorCodeMirror = ({
  projectShareType,
}: LatexEditorCodeMirrorProps) => {
  const { theme } = useTheme();
  const { sessionId } = useParams<{ sessionId: string }>();

  const editorInstanceRef = useRef<any>(null);
  const compileFileRef = useRef<{
    compileFileId: string;
    compileFileName: string;
    compileFileType: string;
    compileFileDir: string;
  }>({
    compileFileId: "",
    compileFileName: "",
    compileFileType: "",
    compileFileDir: "",
  });
  const fileTreeRef = useRef<FileTreeRefHandle>(null);

  const [isCompileButtonLoading, setIsCompileButtonLoading] =
    useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [codeMirrorComponent, setCodeMirrorComponent] = useState<HTMLElement>();
  const [editorInstance, setEditorInstance] = useState<any>(null);
  // const [editorContent, setEditorContent] = useState<string>("");
  const [compileFile, setCompileFile] = useState({
    compileFileId: "",
    compileFileName: "",
    compileFileType: "",
    compileFileDir: "",
  });
  const [mediaFile, setMediaFile] = useState({
    fileId: "",
    fileType: "",
    contentType: "",
    url: "",
  });
  const [isFirstTimeCompile, setIsFirstTimeCompile] = useState<boolean>(true);
  const [compileError, setCompileError] = useState<string>("");
  const [hasContentFromFile, setHasContentFromFile] = useState<boolean>(false);
  const [isThereABibFile, setIsThereABibFile] = useState<boolean>(false);

  // Update the ref whenever states changes
  useEffect(() => {
    editorInstanceRef.current = editorInstance;
  }, [editorInstance]);

  useEffect(() => {
    compileFileRef.current = compileFile;
  }, [compileFile]);

  const onDataReceived = useCallback((receivedData: any) => {
    const { type, data } = receivedData;

    switch (type) {
      case "update_content":
        try {
          if (!editorInstanceRef.current) return;

          const currentCompileFile = compileFileRef.current;
          if (
            !currentCompileFile.compileFileId ||
            currentCompileFile.compileFileId !== data.fileId
          )
            return;
          const { replacement, from, to } = data.replaceRange;
          editorInstanceRef.current?.replaceRange(
            replacement, //replacement
            from, //from
            to, //to
            "setValue" //origin
          );
        } catch (err) {}
        break;
      // case "file_created":
      //   if (fileTreeRef.current) {
      //     fileTreeRef.current.updateTreeData(data.fileTree);
      //   }
      //   break;
      // case "file_uploaded":
      //   if (fileTreeRef.current) {
      //     fileTreeRef.current.updateTreeData(data.fileTree);
      //   }
      //   break;
      // case "update_content_with_file":
      //   if (fileTreeRef.current) {
      //     fileTreeRef.current.updateTreeData(data.fileTree);
      //   }
      //   break;
      // case "file_deleted":
      //   if (fileTreeRef.current) {
      //     fileTreeRef.current.updateTreeData(data.fileTree);
      //   }
      //   break;
      default:
        if (fileTreeRef.current) {
          fileTreeRef.current.updateTreeData(data.fileTree);
        }
        break;
      //any
    }
  }, []); // Only include dependencies that are used in the callback

  const { currentPeerId, handleSendingMessage, connect } = useWebsocket({
    sessionId: compileFile.compileFileId
      ? compileFile.compileFileId
      : sessionId,
    onDataReceived: onDataReceived,
  });

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

    const previewComponent = document.getElementById("preview");
    if (previewComponent) {
      previewComponent.style.height = "0";
      // previewComponent.style.height = "89vh";
    }

    const currPath = window.location.pathname;
    if (currPath.includes("/playground")) {
      connect(
        `wss://${import.meta.env.VITE_API_ENDPOINT}/latex/playground/${sessionId}`
      );
    } else {
      connect(`wss://${import.meta.env.VITE_API_ENDPOINT}/latex/${sessionId}`);
    }
  }, []);

  useEffect(() => {
    if (!compileFile.compileFileId || !editorInstance) return;

    setTimeout(() => {
      editorInstance.refresh();
    }, 1);
    // Define the event handlers
    const handleEditorChange = (instance: any, changes: any) => {
      const { origin, from, to, text } = changes;
      if (origin !== "setValue") {
        handleSendingMessage(
          JSON.stringify({
            type: "update_content",
            peerId: currentPeerId,
            sessionId: sessionId,
            updateContentData: {
              fileId: compileFile.compileFileId,
              fileContent: instance.getValue(),
              replaceRange: {
                replacement:
                  text[0] === text[1] && text[0] === "" ? "\n" : text[0],
                from: {
                  line: from.line,
                  ch: from.ch,
                },
                to: {
                  line: to.line,
                  ch: to.ch,
                },
              },
            },
          })
        );
      }
    };

    // Attach the event listeners
    editorInstance.on("change", handleEditorChange);

    // Cleanup function to remove event listeners when compileFile changes or component unmounts
    return () => {
      editorInstance.off("change", handleEditorChange);
    };
  }, [compileFile, sessionId, editorInstance]);

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

      setPdfUrl(res.data.pdfUrl);
    } catch (err: any) {
      setCompileError(err.response.data.error);
    } finally {
      setIsCompileButtonLoading(false);
      if (isFirstTimeCompile) {
        const previewComponent = document.getElementById("preview");
        if (previewComponent) {
          previewComponent.style.height = "89vh";
        }
        setIsFirstTimeCompile(false);
      }
    }
  };

  const setContent = (data: FileData) => {
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
    setMediaFile({ fileId: "", fileType: "", contentType: "", url: "" });
  };

  const setMedia = (data: any) => {
    if (codeMirrorComponent) {
      setHasContentFromFile(false);
      codeMirrorComponent.style.height = "0vh";
    }
    setMediaFile(data);
  };

  const downloadFile = () => {
    if (!mediaFile.fileId) return;
    fileTreeRef.current?.downloadFile(mediaFile.fileId);
  };

  return (
    <div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={10}>
          <FileTreeComponent
            ref={fileTreeRef}
            theme={theme}
            currentPeerId={currentPeerId}
            sessionId={sessionId}
            setContent={setContent}
            setMedia={setMedia}
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
          {!hasContentFromFile && !mediaFile.fileType ? (
            <Alert className="w-2/3 border-none justify-self-center">
              <Terminal className="h-6 w-6" />
              <AlertTitle className="text-2xl">Info:</AlertTitle>
              <AlertDescription className="text-base">
                No file is selected. Please select a file from the left panel.
              </AlertDescription>
            </Alert>
          ) : !hasContentFromFile && mediaFile.contentType.includes("image") ? (
            <div className="justify-self-center flex-col justify-items-center">
              <Button className="mb-2" onClick={downloadFile}>
                Download
              </Button>
              <img src={mediaFile.url}></img>
            </div>
          ) : !hasContentFromFile && mediaFile.fileType === "pdf" ? (
            <iframe
              src={mediaFile.url}
              style={{ height: "89vh", width: "100%" }}
            ></iframe>
          ) : null}
        </ResizablePanel>
        <ResizableHandle
          withHandle
          className={theme === "dark" ? "bg-black" : ""}
        />
        <ResizablePanel defaultSize={40} minSize={20} className="">
          <div
            className={
              "flex justify-between items-center h-11 " +
              (theme === "light" ? "bg-[#F0F0F0]" : "bg-black")
            }
          >
            <div className="flex items-center">
              <TooltipWrapper tooltipContent={"Compile to PDF"}>
                <Button
                  className="mr-3 ml-2"
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
            <ShareProjectDropdownComponent
              sessionId={sessionId}
              projectShareType={projectShareType}
            />
          </div>
          {compileError ? (
            <Alert
              variant="destructive"
              className="w-full border-none justify-self-center"
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
              className="w-full"
              style={{ height: "89vh" }}
            ></iframe>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default LatexEditorCodeMirror;
