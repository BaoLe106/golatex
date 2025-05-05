import { useState, useEffect, useRef, useCallback } from "react";

// Types for our WebRTC implementation
interface PeerMessage {
  type: string;
  data?: any;
}

interface WebRTCConnectionOptions {
  // peerId: string;
  sessionId: string | undefined;
  // signalServerUrl: string; // Your existing WebSocket server for signaling
  onConnectionEstablished?: (peerId: string) => void;
  onDataReceived: (peerId: string, data: any) => void;
}

// This is a custom hook, not a React component
const useWebRTCConnection = ({
  sessionId,
  // signalServerUrl,
  onConnectionEstablished,
  onDataReceived,
}: WebRTCConnectionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);
  const [peerConnections, setPeerConnections] = useState<
    Record<string, RTCPeerConnection>
  >({});
  const [peerDataChannels, setPeerDataChannels] = useState<
    Record<string, RTCDataChannel>
  >({});

  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});
  const signalSocket = useRef<WebSocket | null>(null);
  const localPeerId = useRef<string>(crypto.randomUUID());

  // WebRTC configuration with STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  // useEffect(() => {
  //   console.log("debug peerId change", peerId);
  //   if (!peerId) {
  //     localPeerId.current = crypto.randomUUID();
  //     return;
  //   }

  //   localPeerId.current = peerId;
  // }, [peerId]);

  // useEffect(() => {
  //   peerConnectionsRef.current = peerConnections;
  // }, [peerConnections]);

  // useEffect(() => {
  //   console.log("debug ws connect", localPeerId.current);
  //   if (!sessionId || !localPeerId.current) return;
  //   // Connect to the signaling server
  //   const socket = new WebSocket(signalServerUrl);
  //   signalSocket.current = socket;
  //   console.log("Initiating WebSocket connection to signaling server...");
  //   // On Open already join to the session server
  //   socket.onopen = () => {
  //     console.log("#debug Connected to signaling server");
  //     // Announce ourself to the signaling server
  //     socket.send(
  //       JSON.stringify({
  //         type: "join",
  //         peerId: localPeerId.current,
  //         sessionId: sessionId,
  //       })
  //     );
  //   };

  //   socket.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     console.log("#debug socket on message", message);
  //     handleSignalingMessage(message);
  //   };

  //   socket.onclose = () => {
  //     console.log("Disconnected from signaling server");
  //   };

  //   socket.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };

  //   return () => {
  //     // Clean up connections when component unmounts
  //     Object.values(peerConnections).forEach((pc) => pc.close());
  //     socket.close();
  //   };
  // }, [sessionId, signalServerUrl]);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
      signalSocket.current?.close();
    };
  }, []);

  const connect = useCallback((wsUrl: string) => {
    signalSocket.current = new WebSocket(wsUrl);

    signalSocket.current.onopen = () => {
      signalSocket.current?.send(
        JSON.stringify({
          type: "join",
          peerId: localPeerId.current,
          sessionId: sessionId,
        })
      );
    };

    signalSocket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleSignalingMessage(message);
    };
  }, []);

  const handleSignalingMessage = useCallback(async (message: any) => {
    if (!sessionId) return;
    const { type, peerId, sessionId: incomingSessionId, data } = message;
    // console.log("debug handleSignalingMessage", message);
    // console.log("debug handleSignalingMessage2", incomingSessionId);
    // Ignore messages from other sessions
    if (incomingSessionId !== sessionId) return;

    // Ignore our own messages
    // if (peerId === localPeerId.current) return;
    const currentPeerConnections = peerConnectionsRef.current;
    switch (type) {
      case "join":
        // console.log("#debug join", peerId, data);
        // A new peer joined, initiate connection
        handleNewPeers(peerId);
        break;

      case "offer":
        await handleOffer(peerId, data);
        // console.log("#debug offer", peerId, data);
        // console.log("#debug offer2", currentPeerConnections);
        // // Received an offer, create answer
        // if (!currentPeerConnections[peerId]) {
        //   createPeerConnection(peerId, false);
        // }

        // if (currentPeerConnections[peerId].signalingState !== "stable") {
        //   console.log("#debug Offer collision detected, rolling back");
        //   await currentPeerConnections[peerId].setLocalDescription({
        //     type: "rollback",
        //   });
        // }

        // const newRTCSessionDescription = new RTCSessionDescription(data);
        // console.log("#debug newRTCSessionDescription", peerId);
        // await currentPeerConnections[peerId].setRemoteDescription(
        //   newRTCSessionDescription
        // );
        // const answer = await currentPeerConnections[peerId].createAnswer();
        // await currentPeerConnections[peerId].setLocalDescription(answer);
        // sendSignalingMessage("answer", peerId, answer);
        break;

      case "answer":
        await handleAnswer(peerId, data);
        // Received an answer to our offer
        // if (currentPeerConnections[peerId]) {
        //   if (
        //     currentPeerConnections[peerId].signalingState !== "have-local-offer"
        //   ) {
        //     console.warn("Not in have-local-offer state, ignoring answer");
        //     return;
        //   }

        //   const newRTCSessionDescription = new RTCSessionDescription(data);
        //   console.log(
        //     "debug newRTCSessionDescription",
        //     newRTCSessionDescription
        //   );
        //   await currentPeerConnections[peerId].setRemoteDescription(
        //     newRTCSessionDescription
        //   );
        // }
        break;

      case "ice-candidate":
        await handleICECandidate(peerId, data);
        // Add ICE candidate received from peer
        // if (currentPeerConnections[peerId]) {
        //   try {
        //     await currentPeerConnections[peerId].addIceCandidate(
        //       new RTCIceCandidate(data)
        //     );
        //   } catch (err) {
        //     console.error("Error adding ICE candidate:", err);
        //   }
        // }
        break;

      case "leave":
        // Peer left, clean up connection
        handlerPeerLeave(peerId);
        // if (currentPeerConnections[peerId]) {
        //   currentPeerConnections[peerId].close();
        //   const updatedConnections = { ...currentPeerConnections };
        //   delete updatedConnections[peerId];
        //   setPeerConnections(updatedConnections);

        //   const updatedChannels = { ...peerDataChannels };
        //   delete updatedChannels[peerId];
        //   setPeerDataChannels(updatedChannels);
        // }
        break;
      default:
      // const handleWsMessage = (event: any) => {
      //   const { data } = event;
      // onDataReceived({ type: type, data: data });
    }
  }, []);

  const handleNewPeers = useCallback((newPeerIds: string[]) => {
    const peersToConnect = newPeerIds.filter(
      (peerId) =>
        peerId !== localPeerId.current && !peerConnectionsRef.current[peerId]
    );

    setPeers((prev) => {
      const updatedPeers = [...prev];
      newPeerIds.forEach((peerId) => {
        if (!updatedPeers.includes(peerId) && peerId !== localPeerId.current) {
          updatedPeers.push(peerId);
        }
      });
      return updatedPeers;
    });

    // Initiate connection with new peers
    peersToConnect.forEach((peerId) => initiateConnection(peerId));
  }, []);

  const initiateConnection = useCallback(
    async (peerId: string) => {
      const peerConnection = new RTCPeerConnection(rtcConfig);
      peerConnectionsRef.current[peerId] = peerConnection;

      const dataChannel = peerConnection.createDataChannel("dataChannel", {
        ordered: true, // Maintain order of changes
        maxRetransmits: 3, // Some reliability but not too much
      });

      dataChannel.onopen = () => {
        console.log(`Data channel with ${peerId} is open`);
        dataChannelsRef.current[peerId] = dataChannel;
        onConnectionEstablished?.(peerId);
        // setPeerDataChannels(prev => ({
        //   ...prev,
        //   [peerId]: dataChannel,
        // }));
      };
      dataChannel.onclose = () => {
        delete dataChannelsRef.current[peerId];
        // onPeerDisconnected?.(peerId);
        console.log(`Data channel closed with ${peerId}`);
      };

      dataChannel.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          onDataReceived(peerId, parsedData);
        } catch (e) {
          onDataReceived(peerId, event.data);
        }
      };
      // Set up ICE candidate handling
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignalingMessage("ice-candidate", peerId, event.candidate);
        }
      };

      // Connection state handling
      peerConnection.onconnectionstatechange = () => {
        console.log(
          `#debug Connection state change: ${peerConnection.connectionState}`
        );
        console.log(
          "#debug ICE connection state:",
          peerConnection.iceConnectionState
        );
        console.log("#debug Signaling state:", peerConnection.signalingState);
        // if (peerConnection.connectionState === "connected") {
        //   console.log("#debug r u here");
        //   setIsConnected(true);
        //   // onConnectionEstablished?.();
        // }
        if (
          ["disconnected", "failed", "closed"].includes(
            peerConnection.connectionState
          )
        ) {
          handlerPeerLeave(peerId);
        }
      };

      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        signalSocket.current?.send(
          JSON.stringify({
            type: "offer",
            peerId: peerId,
            offer: offer,
          })
        );
      } catch (err) {
        console.error("Error creating offer:", err);
        handlerPeerLeave(peerId);
      }
    },
    [onDataReceived, onConnectionEstablished]
  );

  const handleOffer = useCallback(
    async (peerId: string, offer: RTCSessionDescriptionInit) => {
      let pc = peerConnectionsRef.current[peerId];
      if (!pc) {
        pc = new RTCPeerConnection(rtcConfig);
        peerConnectionsRef.current[peerId] = pc;

        // Set up data channel handler for incoming channels
        pc.ondatachannel = (event) => {
          const dc = event.channel;
          dc.onopen = () => {
            dataChannelsRef.current[peerId] = dc;
            onConnectionEstablished?.(peerId);
          };
          dc.onmessage = (event) => {
            onDataReceived(peerId, JSON.parse(event.data));
          };
        };
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        signalSocket.current?.send(
          JSON.stringify({
            type: "answer",
            peerId: peerId,
            answer: answer,
          })
        );
      } catch (err) {
        console.error("Error handling offer:", err);
        handlerPeerLeave(peerId);
      }
    },
    [onDataReceived, onConnectionEstablished]
  );

  const handleAnswer = useCallback(
    async (peerId: string, answer: RTCSessionDescriptionInit) => {
      const pc = peerConnectionsRef.current[peerId];
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error("Error handling answer:", err);
        handlerPeerLeave(peerId);
      }
    },
    []
  );

  const handleICECandidate = useCallback(
    async (peerId: string, candidate: RTCIceCandidateInit) => {
      const pc = peerConnectionsRef.current[peerId];
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    },
    []
  );

  const handlerPeerLeave = useCallback((peerId: string) => {
    const pc = peerConnectionsRef.current[peerId];
    if (pc) {
      pc.close();
      delete peerConnectionsRef.current[peerId];
    }

    const dc = dataChannelsRef.current[peerId];
    if (dc) {
      dc.close();
      delete dataChannelsRef.current[peerId];
    }
    setPeers((prev) => prev.filter((id) => id !== peerId));
  }, []);
  // const createPeerConnection = (peerId: string, isInitiator: boolean) => {
  //   console.log(
  //     `#debug Creating ${
  //       isInitiator ? "initiator" : "receiver"
  //     } peer connection with ${peerId}`
  //   );

  //   if (peerConnectionsRef.current[peerId]) {
  //     console.log(`Connection to ${peerId} already exists`);
  //     return peerConnectionsRef.current[peerId];
  //   }

  //   const peerConnection = new RTCPeerConnection(rtcConfig);

  //   // Set up ICE candidate handling
  //   peerConnection.onicecandidate = (event) => {
  //     if (event.candidate) {
  //       sendSignalingMessage("ice-candidate", peerId, event.candidate);
  //     }
  //   };

  //   // Connection state handling
  //   peerConnection.onconnectionstatechange = () => {
  //     console.log(
  //       `#debug Connection state change: ${peerConnection.connectionState}`
  //     );
  //     console.log(
  //       "#debug ICE connection state:",
  //       peerConnection.iceConnectionState
  //     );
  //     console.log("#debug Signaling state:", peerConnection.signalingState);
  //     if (peerConnection.connectionState === "connected") {
  //       console.log("#debug r u here");
  //       setIsConnected(true);
  //       // onConnectionEstablished?.();
  //     }
  //   };

  //   // Create data channel or prepare to receive one
  //   if (isInitiator) {
  //     const dataChannel = peerConnection.createDataChannel("dataChannel");
  //     setupDataChannel(dataChannel, peerId);

  //     // Create and send offer
  //     peerConnection
  //       .createOffer()
  //       .then((offer) => peerConnection.setLocalDescription(offer))
  //       .then(() => {
  //         sendSignalingMessage(
  //           "offer",
  //           peerId,
  //           peerConnection.localDescription
  //         );
  //       })
  //       .catch((err) => console.error("Error creating offer:", err));
  //   } else {
  //     // Set up to receive data channel
  //     peerConnection.ondatachannel = (event) => {
  //       setupDataChannel(event.channel, peerId);
  //     };
  //   }

  //   // Store the new peer connection
  //   setPeerConnections((prev) => ({
  //     ...prev,
  //     [peerId]: peerConnection,
  //   }));

  //   return peerConnection;
  // };

  // const setupDataChannel = (dataChannel: RTCDataChannel, peerId: string) => {
  //   dataChannel.onopen = () => {
  //     console.log(`Data channel with ${peerId} is open`);
  //     setPeerDataChannels((prev) => ({
  //       ...prev,
  //       [peerId]: dataChannel,
  //     }));
  //   };

  //   dataChannel.onclose = () => {
  //     console.log(`Data channel with ${peerId} is closed`);
  //     setPeerDataChannels((prev) => {
  //       const updated = { ...prev };
  //       delete updated[peerId];
  //       return updated;
  //     });
  //   };

  //   dataChannel.onmessage = (event) => {
  //     console.log(`Received message from ${peerId}:`, event.data);
  //     try {
  //       const parsedData = JSON.parse(event.data);
  //       onDataReceived(peerId, parsedData);
  //     } catch (e) {
  //       onDataReceived(peerId, event.data);
  //     }
  //   };
  // };

  const sendSignalingMessage = (type: string, toPeerId: string, data?: any) => {
    if (signalSocket.current?.readyState === WebSocket.OPEN) {
      signalSocket.current.send(
        JSON.stringify({
          type: type,
          peerId: localPeerId.current,
          toPeerId: toPeerId,
          sessionId: sessionId,
          data: data,
        })
      );
    }
  };

  // Function to send data to all connected peers
  const sendDataToPeers = (data: any) => {
    console.log("debug Sending data to peers:", data);
    const dataString = typeof data === "string" ? data : JSON.stringify(data);
    Object.values(peerDataChannels).forEach((dataChannel) => {
      if (dataChannel.readyState === "open") {
        dataChannel.send(dataString);
      }
    });
  };

  // Return an object with connection state and methods
  return {
    connect,
    isConnected,
    sendData: sendDataToPeers,
    peerConnections,
    peerDataChannels,
  };
};

export default useWebRTCConnection;
