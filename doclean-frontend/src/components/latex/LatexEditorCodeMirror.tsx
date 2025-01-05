import React, { useEffect, useState, useRef, useCallback } from "react";
// import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";
import "codemirror/lib/codemirror.css";
// import 'codemirror/lib/codemirror'
import "codemirror/theme/material-ocean.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/keymap/sublime";
import CodeMirror from "codemirror";

const LatexEditorCodeMirror: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editorContent, setEditorContent] = useState<string>("");
  // const [socket, setSocket] = useState<WebSocket | undefined>(undefined);

  const { sessionId } = useParams<{ sessionId: string }>();

  // let updates: Update[] = [];
  // SET WEBSOCKET CONNECTION
  // useEffect(() => {
  //   // Create WebSocket connection to the backend

  // }, []);

  useEffect(() => {
    const documentEditor = document.getElementById("ds") as HTMLTextAreaElement;
    const editor = CodeMirror.fromTextArea(documentEditor, {
      lineNumbers: true,
      keyMap: "sublime",
      theme: "material-ocean",
      mode: "javascript",
    });
    const sizeComponent = document.getElementsByClassName("CodeMirror");
    console.log(sizeComponent);
    sizeComponent[0].style.width = "40%";
    // sizeComponent[0].style.minHeight = "83vh";
    // sizeComponent[0].style.width = '40%';
    sizeComponent[0].style.height = "84vh";
    // const bookMark = editor.setBookmark({ line: 1, pos: 1 }, { widget })
    // widget.onclick = () => bookMark.clear()
    // console.log(editor.getAllMarks())

    const socket = new WebSocket(
      `ws://localhost:8080/api/v1/latex/${sessionId}`
    );

    // Set the WebSocket connection to state
    // setSocket(socketConnection);

    socket.onmessage = (event: any) => {
      console.log("debug on message", event);
      const { data } = event;
      editor.setValue(data);
      setEditorContent(data);
      // const receivedDataAsNewClient = JSON.parse(event.data);
      // if (
      //   receivedDataAsNewClient.type &&
      //   receivedDataAsNewClient.type === "new_client"
      // ) {
      //   const { data } = receivedDataAsNewClient;
      //   editor.setValue(data);
      // } else {

      // }
    };

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
        console.log("debug origin", origin);
        console.log("debug instance", instance.getValue());
        setEditorContent(instance.getValue());
        socket.send(instance.getValue());
        // socket.emit('CODE_CHANGED', instance.getValue())
      }
    });
    editor.on("cursorActivity", (instance) => {
      // console.log(instance.cursorCoords())
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "latex", editorContent },
        "*"
      );
    }
  }, [editorContent]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* <div className="container" style={{ width: "40%", height: "83vh" }} ref={wrapperRef}></div> */}
      <textarea id="ds" style={{ width: "500px", height: "83vh" }} />
      <iframe
        style={{ width: "60%", height: "83vh" }}
        ref={iframeRef}
        src="/latex.html"
      ></iframe>
    </div>
  );
};

export default LatexEditorCodeMirror;
