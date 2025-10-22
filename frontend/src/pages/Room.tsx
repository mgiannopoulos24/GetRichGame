import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

// Use a constant for the API base URL.
// In a real Vite app, this would be set in a .env file (e.g., VITE_API_BASE_URL=http://localhost:8000)
// For simplicity in this example, we assume the backend is available at the current host's /api/v1 path.
// If you must hardcode, use 'http://localhost:8000' for local dev:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

// Helper to clean up the base URL for consistency
const cleanBaseUrl = (url: string) => url.replace(/\/$/, '');

const getWsUrl = (roomId: string): string => {
    // Determine the protocol (ws or wss) from the HTTP URL's protocol (http or https)
    const protocol = cleanBaseUrl(API_BASE_URL).startsWith('https') ? 'wss:' : 'ws:';

    // Extract the host part and remove the protocol
    const hostAndPort = cleanBaseUrl(API_BASE_URL).replace(/^https?:\/\//, '');

    // Ensure the path is correct: /api/v1/ws/game/
    return `${protocol}//${hostAndPort}/api/v1/ws/game/?room_id=${roomId}`;
};

export const Room: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [wsStatus, setWsStatus] = useState<'Connecting...' | 'Connected' | 'Disconnected'>(
        'Connecting...',
    );
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        if (!roomId) return;

        const wsUrl = getWsUrl(roomId);
        console.log(`Attempting to connect to: ${wsUrl}`);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setWsStatus('Connected');
            setMessages((prev) => [...prev, 'SERVER: Connection established.']);

            // Example message send after connection
            const clientMsg = JSON.stringify({ message: `Hello from Room ${roomId}` });
            ws.send(clientMsg);
            setMessages((prev) => [...prev, `CLIENT: Sent initial message: '${clientMsg}'`]);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Based on backend models (StatusMessage, EchoResponse)
                if (data.type === 'echo') {
                    setMessages((prev) => [...prev, `SERVER ECHO: ${data.server_response}`]);
                } else if (data.type === 'status') {
                    setMessages((prev) => [...prev, `SERVER STATUS: ${data.message}`]);
                } else {
                    setMessages((prev) => [...prev, `SERVER RAW: ${event.data}`]);
                }
            } catch (error) {
                setMessages((prev) => [...prev, `SERVER RAW: ${event.data}`]);
            }
        };

        ws.onclose = () => {
            setWsStatus('Disconnected');
            setMessages((prev) => [...prev, 'SERVER: Connection closed.']);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setMessages((prev) => [...prev, 'ERROR: Check console for details.']);
        };

        // Cleanup: Close the connection when the component unmounts
        return () => {
            if (ws.readyState === 1) {
                ws.close();
            }
        };
    }, [roomId]);

    const pageAnimation = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    };

    return (
        <motion.div
            className="min-h-screen p-8 bg-gray-900 text-gray-100"
            initial={pageAnimation.initial}
            animate={pageAnimation.animate}
            transition={pageAnimation.transition}
        >
            <h1 className="text-4xl font-extrabold mb-4 text-orange-400">
                <span className="text-gray-400">Game Room:</span> {roomId}
            </h1>
            <p
                className={`text-xl font-semibold mb-6 ${wsStatus === 'Connected' ? 'text-green-400' : wsStatus === 'Disconnected' ? 'text-red-400' : 'text-yellow-400'}`}
            >
                Status: {wsStatus}
            </p>

            <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                <h2 className="text-xl font-semibold mb-3 border-b border-gray-700 pb-2">
                    WebSocket Log
                </h2>
                <div className="space-y-1">
                    {messages
                        .slice()
                        .reverse()
                        .map((msg, index) => (
                            <div
                                key={index}
                                className={`text-sm p-1 rounded ${
                                    msg.startsWith('SERVER:')
                                        ? 'bg-gray-700'
                                        : msg.startsWith('CLIENT:')
                                          ? 'bg-gray-600'
                                          : msg.startsWith('ERROR:')
                                            ? 'bg-red-900'
                                            : 'bg-gray-700'
                                }`}
                            >
                                {msg}
                            </div>
                        ))}
                </div>
            </div>
        </motion.div>
    );
};
