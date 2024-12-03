import React, { useEffect, useState, useCallback } from "react";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import "./styles.css";

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

let PAGE_HEIGHT: number = 862;

const DocEditor: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [quill, setQuill] = useState<Quill>();
  const [qlContainerState, setQlContainerState] = useState<any>();
  const [qlEditorState, setQlEditorState] = useState<any>();
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

  // LOAD DOCUMENT DATA
  useEffect(() => {
    if (!socket || !quill) return;
    socket.onopen = () => quill.enable();

    // socket.onmessage = (event) => {
    //     // if (isBackendUpdate.current) return;
    //     const msg = JSON.parse(event.data);
    //     console.log("debug msg receive from backend", msg);
    //     console.log("debug msg content receive from backend", msg.content);
    //     if (!msg.content) return;
    //     // quill.setContents(msg.content);
    // };

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
      console.log("debug close socket");
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
      if (source !== "user") return;
      socket.send(JSON.stringify({ content: delta }));
    };
    quill.on("text-change", handler);
    quill.on("text-change", updatePages);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  const updatePages = useCallback(() => {
    if (!quill) return;
    let currentPageHeight = 0;
    // const content = quill.root.innerHTML;
    // console.log("debug quill", quill.root);
    console.log("debug ql container", qlContainerState);
    console.log("debug ql editor", qlEditorState);
    Array.from(quill.root.childNodes).forEach((node) => {
      // const rect = node.getBoundingClientRect();
      const nodeHeight = node.offsetHeight;
      console.log("debug node", node.offsetHeight);
      console.log("debug sum", currentPageHeight + nodeHeight);
      if (currentPageHeight + nodeHeight > PAGE_HEIGHT) {
        quill.disable();
        // qlContainer.appendChild(qlEditorClone);
        console.log("debug > max height");
        // Create a new page if height exceeds
        // pages.push(currentPage.innerHTML);
        // currentPage = document.createElement("div");
        currentPageHeight = 0;
      }

      // currentPage.appendChild(node.cloneNode(true));
      currentPageHeight += nodeHeight;
    });
  }, [quill]);

  const wrapperRef = useCallback((wrapper: any) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    // q.setText("Loading...");
    setQuill(q);

    const qlContainer = document.getElementsByClassName("ql-container");
    const qlToolbar = document.getElementsByClassName("ql-toolbar");
    const qlEditor = document.getElementsByClassName("ql-editor");
    const qlContainerClone = cloneDeep(qlContainer[0]);
    const qlEditorClone = cloneDeep(qlEditor[0]);
    console.log("debug clone", qlContainerClone);
    setQlContainerState(qlContainerClone);
    setQlEditorState(qlEditorClone);
    console.log("debug hi");
    if (qlContainer[0]) qlContainer[0].style.marginTop = "64px";
    if (qlToolbar[0]) {
      qlToolbar[0].style.width = "99%";
      qlToolbar[0].style.position = "fixed";
      qlToolbar[0].style.top = "80px";
      qlToolbar[0].style.left = "0px";
      qlToolbar[0].style.marginLeft = "8px";
      qlToolbar[0].style.marginRight = "8px";
    }
    if (qlEditor[0]) {
      qlEditor[0].style.height = "11in";

      qlEditor[0].style.borderTopWidth = "2px";

      qlEditor[0].style.paddingTop = "96px";
      qlEditor[0].style.paddingBottom = "96px";
      qlEditor[0].style.paddingLeft = "72px";
      qlEditor[0].style.paddingRight = "72px";
      // qlEditor[0].style.paddingBottom = "72px";

      qlEditor[0].style.overflowY = "hidden";
      qlEditor[0].style.position = "relative";
      // console.log("debug qlEditor[0].offsetHeight;", qlEditor[0].offsetHeight);
      // PAGE_HEIGHT = qlEditor[0].offsetHeight;
    }
    // qlEditor.style =
  }, []);

  return <div className="container" ref={wrapperRef}></div>;
};

export default DocEditor;
