import { useState, useEffect, useRef } from 'react';

// Types for our WebRTC implementation
interface PeerMessage {
  type: string;
  data?: any;
}

interface WebRTCConnectionOptions {
  sessionId: string | undefined;
  signalServerUrl: string; // Your existing WebSocket server for signaling
  onConnectionEstablished?: () => void;
  onDataReceived: (data: any) => void;
}

// This is a custom hook, not a React component
const useWebRTCConnection = ({
  sessionId,
  signalServerUrl,
  onConnectionEstablished,
  onDataReceived
}: WebRTCConnectionOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [peerConnections, setPeerConnections] = useState<Record<string, RTCPeerConnection>>({});
  const [peerDataChannels, setPeerDataChannels] = useState<Record<string, RTCDataChannel>>({});
  
  const signalSocket = useRef<WebSocket | null>(null);
  const localPeerId = useRef<string>(crypto.randomUUID());

  // WebRTC configuration with STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    if (!sessionId) return;
    // Connect to the signaling server
    const socket = new WebSocket(signalServerUrl);
    signalSocket.current = socket;

    // On Open already join to the session server
    socket.onopen = () => {
      console.log('Connected to signaling server');
      // Announce ourself to the signaling server
      socket.send(JSON.stringify({
        type: 'join',
        peerId: localPeerId.current,
        sessionId: sessionId
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("debug socket on message", message)
      handleSignalingMessage(message);
    };

    socket.onclose = () => {
      console.log('Disconnected from signaling server');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      // Clean up connections when component unmounts
      Object.values(peerConnections).forEach(pc => pc.close());
      socket.close();
    };
  }, [sessionId, signalServerUrl]);

  const handleSignalingMessage = async (message: any) => {
    if (!sessionId) return;
    const { type, peerId, sessionId: incomingSessionId, data } = message;

    // Ignore messages from other sessions
    if (incomingSessionId !== sessionId) return;
    
    // Ignore our own messages
    if (peerId === localPeerId.current) return;

    switch (type) {
      case 'join':
        // A new peer joined, initiate connection
        createPeerConnection(peerId, true);
        break;
      
      case 'offer':
        // Received an offer, create answer
        if (!peerConnections[peerId]) {
          createPeerConnection(peerId, false);
        }
        await peerConnections[peerId].setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnections[peerId].createAnswer();
        await peerConnections[peerId].setLocalDescription(answer);
        sendSignalingMessage('answer', peerId, answer);
        break;
      
      case 'answer':
        // Received an answer to our offer
        if (peerConnections[peerId]) {
          await peerConnections[peerId].setRemoteDescription(new RTCSessionDescription(data));
        }
        break;
      
      case 'ice-candidate':
        // Add ICE candidate received from peer
        if (peerConnections[peerId]) {
          try {
            await peerConnections[peerId].addIceCandidate(new RTCIceCandidate(data));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
        break;
        
      case 'leave':
        // Peer left, clean up connection
        if (peerConnections[peerId]) {
          peerConnections[peerId].close();
          const updatedConnections = { ...peerConnections };
          delete updatedConnections[peerId];
          setPeerConnections(updatedConnections);
          
          const updatedChannels = { ...peerDataChannels };
          delete updatedChannels[peerId];
          setPeerDataChannels(updatedChannels);
        }
        break;
      default:
        // const handleWsMessage = (event: any) => {
        //   const { data } = event;
        onDataReceived({type: type, data: data})
        
    }
  };

  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    console.log(`Creating ${isInitiator ? 'initiator' : 'receiver'} peer connection with ${peerId}`);
    
    const peerConnection = new RTCPeerConnection(rtcConfig);
    
    // Set up ICE candidate handling
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage('ice-candidate', peerId, event.candidate);
      }
    };

    // Connection state handling
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state change: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'connected') {
        setIsConnected(true);
        onConnectionEstablished?.();
      }
    };

    // Create data channel or prepare to receive one
    if (isInitiator) {
      const dataChannel = peerConnection.createDataChannel('dataChannel');
      setupDataChannel(dataChannel, peerId);
      
      // Create and send offer
      peerConnection.createOffer()
        .then(offer => peerConnection.setLocalDescription(offer))
        .then(() => {
          sendSignalingMessage('offer', peerId, peerConnection.localDescription);
        })
        .catch(err => console.error('Error creating offer:', err));
    } else {
      // Set up to receive data channel
      peerConnection.ondatachannel = (event) => {
        setupDataChannel(event.channel, peerId);
      };
    }

    // Store the new peer connection
    setPeerConnections(prev => ({
      ...prev,
      [peerId]: peerConnection
    }));
    
    return peerConnection;
  };

  const setupDataChannel = (dataChannel: RTCDataChannel, peerId: string) => {
    dataChannel.onopen = () => {
      console.log(`Data channel with ${peerId} is open`);
      setPeerDataChannels(prev => ({
        ...prev,
        [peerId]: dataChannel
      }));
    };

    dataChannel.onclose = () => {
      console.log(`Data channel with ${peerId} is closed`);
      setPeerDataChannels(prev => {
        const updated = { ...prev };
        delete updated[peerId];
        return updated;
      });
    };
    
    dataChannel.onmessage = (event) => {
      console.log(`Received message from ${peerId}:`, event.data);
      try {
        const parsedData = JSON.parse(event.data);
        onDataReceived(parsedData);
      } catch (e) {
        onDataReceived(event.data);
      }
    };
  };

  const sendSignalingMessage = (type: string, toPeerId: string, data?: any) => {
    if (signalSocket.current?.readyState === WebSocket.OPEN) {
      signalSocket.current.send(JSON.stringify({
        type: type,
        peerId: localPeerId.current,
        toPeerId: toPeerId,
        sessionId: sessionId,
        data: data
      }));
    }
  };

  // Function to send data to all connected peers
  const sendDataToPeers = (data: any) => {
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    Object.values(peerDataChannels).forEach(dataChannel => {
      if (dataChannel.readyState === 'open') {
        dataChannel.send(dataString);
      }
    });
  };

  // Return an object with connection state and methods
  return {
    isConnected,
    sendData: sendDataToPeers,
    peerConnections,
    peerDataChannels
  };
};

export default useWebRTCConnection;