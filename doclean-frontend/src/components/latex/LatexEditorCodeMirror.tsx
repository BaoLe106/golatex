import React, { useEffect, useState, useRef, useCallback } from "react";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { cloneDeep } from "lodash";

import { useParams } from "react-router-dom";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-ocean.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/stex/stex";
import "codemirror/keymap/sublime";
import CodeMirror from "codemirror";

import { useTheme } from "@/components/theme-provider";
import { TexFileService } from "@/services/texFileService";

const LatexEditorCodeMirror: React.FC = () => {
  const { theme } = useTheme();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [codeMirrorComponent, setCodeMirrorComponent] = useState<HTMLElement>();
  const { sessionId } = useParams<{ sessionId: string }>();
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
      (CodeMirrorGuttersTheme[0] as HTMLElement).style.background = "#F0F0F0";
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
      lineNumbers: true,
      keyMap: "sublime",
      theme: "material-ocean",
      mode: "stex",
    });
    const CodeMirrorComponent = document.getElementsByClassName("CodeMirror");
    setCodeMirrorComponent(CodeMirrorComponent[0] as HTMLElement);
    (CodeMirrorComponent[0] as HTMLElement).style.width = "40%";
    (CodeMirrorComponent[0] as HTMLElement).style.height = "89vh";

    const getTEXFromS3 = async () => {
      const s3Client = new S3Client({
        region: import.meta.env.VITE_AWS_BUCKET_REGION,
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

    const socket = new WebSocket(
      `ws://localhost:8080/api/v1/latex/${sessionId}`
    );

    socket.onmessage = (event: any) => {
      const { data } = event;

      editor.setValue(data);
      setEditorContent(data);
    };

    if (!editorContent) {
      getTEXFromS3();
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

    editor.on("change", (instance, changes) => {
      const { origin } = changes;
      // if (origin === '+input' || origin === '+delete' || origin === 'cut') {
      if (origin !== "setValue") {
        setEditorContent(instance.getValue());
        socket.send(instance.getValue());
      }
    });
    editor.on("cursorActivity", (instance) => {
      // console.log(instance.cursorCoorcode-editor())
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        { type: "latex", editorContent },
        "*"
      );
    }
  }, [editorContent]);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(
        { type: "theme", theme },
        "*"
      );
    }
  }, [theme]);

  const getPDFFromS3 = async () => {
    const s3Client = new S3Client({
      region: import.meta.env.VITE_AWS_BUCKET_REGION,
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const getPdfCommand = new GetObjectCommand({
        Bucket: "golatex--tex-and-pdf-files",
        Key: `pdf/${sessionId}/sample.pdf`,
        ResponseContentType: "application/pdf",
        ResponseContentDisposition: "inline",
      });

      const signedUrl = await getSignedUrl(s3Client, getPdfCommand, {
        expiresIn: 3600,
      }); // Expires in 1 hour

      setPdfUrl(signedUrl);
    } catch (err) {
      console.log("debug catch err", err);
    }
  };

  const convertToTex = async () => {
    if (!sessionId) return;
    const res = await TexFileService.createTexFile({
      sessionId,
      data: { content: editorContent },
    });
    if (res.status === 200) {
    }
    console.log(res);
  };

  return (
    <div>
      <div style={{ width: "100%", backgroundColor: "red" }}>
        <div
          style={{ backgroundColor: "green", width: "120px" }}
          onClick={convertToTex}
          // onClick={showPreview}
        >
          Create TEX
        </div>
        <div
          style={{ backgroundColor: "yellow", width: "120px" }}
          onClick={getPDFFromS3}
          // onClick={showPreview}
        >
          Get files
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "row" }}>
        <textarea id="code-editor" />
        <iframe
          id="preview"
          src={pdfUrl}
          style={{ width: "60%", height: "89vh" }}
        ></iframe>
      </div>
    </div>
  );
};

export default LatexEditorCodeMirror;
