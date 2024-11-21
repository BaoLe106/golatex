import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css";
// type Message = {
//   content: string;
// }

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

const DocEditor: React.FC = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    // const [messages, setMessages] = useState("");
    const [quill, setQuill] = useState<Quill>();
    const { sessionId } = useParams<{ sessionId: string }>();

    // SET WEBSOCKET CONNECTION
    useEffect(() => {
        // Create WebSocket connection to the backend
        const socketConnection = new WebSocket(
            `ws://localhost:8080/api/v1/md/${sessionId}`
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
        socket.onopen = (event: any) => {
            console.log("debug event", event);
            if (event.data) {
                const msg = JSON.parse(event.data);
                quill.setContents(msg.content);
            }

            quill.enable();
        };
        // socket.onmessage = (event) => {
        // const msg = JSON.parse(event.data);
        // console.log("debug msg content", msg.content);
        // quill.setContents(msg.content);

        // };
    }, [socket, quill, sessionId]);

    // RECEIVE ONCHANGE DATA FROM BACKEND
    useEffect(() => {
        if (!socket || !quill) return;

        socket.onmessage = (event) => {
            console.log("debug event receive from backend", event);
            const msg = JSON.parse(event.data);
            console.log("debug msg content receive from backend", msg.content);
            quill.updateContents(msg.content);
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
            // delta.ops[0].insert
            console.log("debug msg send to backend", delta);
            socket.send(JSON.stringify({ content: delta }));
            // quill.updateContents(delta)
        };
        quill.on("text-change", handler);

        return () => {
            quill.off("text-change", handler);
        };
    }, [socket, quill]);

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
    }, []);

    return <div className="container" ref={wrapperRef}></div>;
};

export default DocEditor;
