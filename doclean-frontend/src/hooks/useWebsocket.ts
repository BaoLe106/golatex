import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { TexFileService } from "@/services/latex/texFileService";
interface WebSocketConnectionProps {
  // peerId: string;
  sessionId: string | undefined;
  onDataReceived: (data: any) => void;
}

// This is a custom hook, not a React component
const useWebsocket = ({
  sessionId,
  onDataReceived,
}: WebSocketConnectionProps) => {
  const navigate = useNavigate();
  const peerConnectionsRef = useRef<Record<string, boolean>>({});
  const wsConnectionRef = useRef<WebSocket | null>(null);
  const localPeerId = useRef<string>(crypto.randomUUID());
  const messageQueue = useRef<{
    [sessionId: string]: string[];
  }>({});

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsConnectionRef.current?.close();
    };
  }, []);

  const connect = useCallback(async (wsUrl: string, isPlayground: boolean) => {
    if (!sessionId) {
      return;
    }
    try {
      if (isPlayground)
        await TexFileService.checkPlaygroundConnection(sessionId);
      else await TexFileService.checkConnection(sessionId);
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("WebSocket connection failed. Please try again later.");
      } else {
        toast.error("Something wrong. Please try again later.");
      }

      navigate("/");
      return;
    }
    wsConnectionRef.current = new WebSocket(wsUrl);
    wsConnectionRef.current.onerror = (event) => {
      console.log("debug WebSocket error:", event);

      // Custom error handling
      toast.error("WebSocket connection failed. Please try again later.");
    };
    wsConnectionRef.current.onopen = () => {
      const currentMessageQueue = messageQueue.current[sessionId] || [];
      while (currentMessageQueue.length > 0) {
        const msg = currentMessageQueue.shift();
        if (msg) {
          wsConnectionRef.current?.send(msg);
        }
      }
      handleSendingMessage(
        JSON.stringify({
          type: "join",
          peerId: localPeerId.current,
          sessionId: sessionId,
        })
      );
    };

    wsConnectionRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleReceivedMessage(message);
    };
  }, []);

  const handleSendingMessage = useCallback((data: string) => {
    console.log("debug state connection", wsConnectionRef.current?.readyState);
    if (wsConnectionRef.current?.readyState === WebSocket.OPEN) {
      wsConnectionRef.current.send(data);
    } else if (sessionId) {
      messageQueue.current[sessionId]?.push(data);
    }
  }, []);

  const handleReceivedMessage = useCallback(async (message: any) => {
    if (!sessionId) return;
    const { type, peerId, sessionId: incomingSessionId } = message;
    if (incomingSessionId !== sessionId) return;

    switch (type) {
      case "join":
        // A new peer joined, initiate connection
        handleNewPeers(peerId);
        break;

      case "offer":
        // await handleOffer(peerId, data);
        break;

      case "answer":
        // await handleAnswer(peerId, data);
        break;

      case "ice-candidate":
        // await handleICECandidate(peerId, data);
        break;

      case "leave":
        // Peer left, clean up connection
        handlerPeerLeave(peerId);
        break;
      case "file_created":
        handleNotifyFileCreated(message.additionalData);
        onDataReceived({
          type: type,
          sessionId: incomingSessionId,
          data: message.createFileData,
        });
        break;
      case "file_uploaded":
        handleNotifyFileUploaded();
        onDataReceived({
          type: type,
          sessionId: incomingSessionId,
          data: message.createFileData,
        });
        break;
      case "file_deleted":
        handleNotifyFileDeleted();
        onDataReceived({
          type: type,
          sessionId: incomingSessionId,
          data: message.createFileData,
        });
        break;
      case "update_content":
        onDataReceived({
          type: type,
          sessionId: incomingSessionId,
          data: message.updateContentData,
        });
        break;
      case "update_content_with_file":
        onDataReceived({
          type: type,
          sessionId: incomingSessionId,
          data: message.createFileData,
        });
        break;
      default:
    }
  }, []);

  const handleNewPeers = useCallback((newPeerId: string) => {
    // Notify to the session
    toast.info(`${newPeerId} join!`);
    peerConnectionsRef.current[newPeerId] = true;
  }, []);

  const handlerPeerLeave = useCallback((peerId: string) => {
    // Notify to the session
    toast.info(`${peerId} leave!`);
    delete peerConnectionsRef.current[peerId];
  }, []);

  const handleNotifyFileCreated = useCallback((data: any) => {
    if (!data) return;
    const toastMsg =
      data.fileType === "folder"
        ? `New ${data.fileName} folder created`
        : `New ${data.fileName} file created`;
    toast.info(toastMsg);
  }, []);

  const handleNotifyFileUploaded = useCallback(() => {
    toast.info(`Some files has been uploaded`);
  }, []);

  const handleNotifyFileDeleted = useCallback(() => {
    toast.info(`A file has been deleted`);
  }, []);

  // Return an object with connection state and methods
  return {
    currentPeerId: localPeerId.current,
    wsInstance: wsConnectionRef.current,
    connect,
    handleSendingMessage,
  };
};

export default useWebsocket;
