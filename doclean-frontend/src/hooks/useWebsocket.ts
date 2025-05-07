import { useEffect, useRef, useCallback } from "react";
import { toast } from "sonner"
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
  const peerConnectionsRef = useRef<Record<string, boolean>>({})
  const wsConnectionRef = useRef<WebSocket | null>(null);
  const localPeerId = useRef<string>(crypto.randomUUID());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsConnectionRef.current?.close();
    };
  }, []);

  const connect = useCallback((wsUrl: string) => {
    wsConnectionRef.current = new WebSocket(wsUrl);

    wsConnectionRef.current.onopen = () => {
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
    wsConnectionRef.current?.send(data);
  }, [])



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
      default:
        if (type === "file_created") {
          handleNotifyFileCreated(message.additionalData)
        }
        onDataReceived({ 
          type: type, 
          peerId: peerId,
          sessionId: incomingSessionId,
          data: type === "update_content" ? message.updateContentData : message.createFileData
        });
    }
  }, []);

  const handleNewPeers = useCallback((newPeerId: string) => {
    // Notify to the session
    toast.info(`${newPeerId} join!`)
    peerConnectionsRef.current[newPeerId] = true;
  }, [])

  const handlerPeerLeave = useCallback((peerId: string) => {
    // Notify to the session
    toast.info(`${peerId} leave!`)
    delete peerConnectionsRef.current[peerId];
  }, [])

  const handleNotifyFileCreated = useCallback((data: any) => {
    if (!data) return;
    const toastMsg = data.fileType === 'folder' ? `New ${data.fileName} folder created`: `New ${data.fileName} file created`
    toast.info(toastMsg)
  }, [])


  // Return an object with connection state and methods
  return {
    currentPeerId: localPeerId.current,
    wsInstance: wsConnectionRef.current,
    connect,
    handleSendingMessage,
  };
};

export default useWebsocket;
