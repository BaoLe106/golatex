import React, { useEffect, useState, useRef, useCallback } from "react";
// import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];


const LatexEditor: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [quill, setQuill] = useState<Quill>();
  const [quillContent, setQuillContent] = useState<string>("");
  const { sessionId } = useParams<{ sessionId: string }>();

  // SET WEBSOCKET CONNECTION
  useEffect(() => {
    // Create WebSocket connection to the backend
    const socketConnection = new WebSocket(
      `ws://localhost:8080/api/v1/latex/${sessionId}`
    );

    // Set the WebSocket connection to state
    setSocket(socketConnection);

    return () => {
      socketConnection.close();
    };
  }, []);

  // LOAD DOCUMENT DATA
  useEffect(() => {
    if (!socket || !quill) return;
    socket.onopen = () => quill.enable();

    socket.onmessage = (event) => {
      // if (isBackendUpdate.current) return;
      const msg = JSON.parse(event.data);
      if (!msg.content) return;
      // quill.setContents(msg.content);
    };

    return () => {
      socket.close();
    };
  }, [socket, quill, sessionId]);

  // RECEIVE ONCHANGE DATA FROM BACKEND
  useEffect(() => {
    if (!socket || !quill) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (!data.content) return;

      if (data.content.messages) {
        const messages = data.content.messages;
        messages.forEach((msg: any) => {
          quill.updateContents(msg);
        });
      } else {
        const message = data.content;
        quill.updateContents(message);
      }
    };

    return () => {
      socket.close();
    };
  }, [socket, quill]);

  // SEND ONCHANGE DATA TO BACKEND
  useEffect(() => {
    if (!socket || !quill) return;
    const handler = (
      delta: {
        insert?: string | Record<string, unknown>;
        delete?: number;
        retain?: number | Record<string, unknown>;
        attributes?: {
          [key: string]: unknown;
        };
      },
      oldDelta: any,
      source: string
    ) => {
      setQuillContent(quill.getText());
      if (source !== "user") return;
      socket.send(JSON.stringify({ content: delta }));      
    };
    quill.on("text-change", handler);
    
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "latex", quillContent },
        "*"
      );
    }
  }, [quillContent]);

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: {
        toolbar: false,
      },
      // { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    // q.setText("Loading...");
    setQuill(q);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div
        className="container"
        style={{ width: "40%", height: "83vh" }}
        ref={wrapperRef}
      ></div>
      <iframe
        style={{ width: "60%", height: "83vh" }}
        ref={iframeRef}
        src="/latex.html"
      ></iframe>
    </div>
  );
};

export default LatexEditor;
