import React, { useEffect, useState } from 'react'; // RE-ADDED: useState
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
// NEW: Import Lightbulb icon for the Tip
import { Lightbulb } from 'lucide-react'; 


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

// SVG Component (The dice icon provided)
const GameIcon = ({ className = 'w-16 h-16' }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="32" 
        height="32" 
        viewBox="0 0 24 24"
        className={className}
    >
        <path fill="currentColor" d="M19 5v14H5V5zM5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm11.5 12a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M9 16.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3M10.5 9a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m4.5 1.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"/>
    </svg>
);


export const Room: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    
    // RE-ADDED: wsStatus state to manage loading/connection status for UI display
    const [wsStatus, setWsStatus] = useState<'Connecting...' | 'Connected' | 'Disconnected'>(
        'Connecting...',
    );

    useEffect(() => {
        if (!roomId) return;

        const wsUrl = getWsUrl(roomId);
        console.log(`[Room ${roomId}] Attempting to connect to: ${wsUrl}`);

        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            setWsStatus('Connected'); // SET STATUS
            console.log(`[Room ${roomId}] SERVER: Connection established.`);

            const clientMsg = JSON.stringify({ message: `Hello from Room ${roomId}` });
            ws.send(clientMsg);
            console.log(`[Room ${roomId}] CLIENT: Sent initial message: '${clientMsg}'`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'echo') {
                    console.log(`[Room ${roomId}] SERVER ECHO: ${data.server_response}`);
                } else if (data.type === 'status') {
                    console.log(`[Room ${roomId}] SERVER STATUS: ${data.message}`);
                } else {
                    console.log(`[Room ${roomId}] SERVER RAW: ${event.data}`);
                }
            } catch (error) {
                console.log(`[Room ${roomId}] SERVER RAW: ${event.data}`);
            }
        };

        ws.onclose = () => {
            setWsStatus('Disconnected'); // SET STATUS
            console.log(`[Room ${roomId}] SERVER: Connection closed.`);
        };

        ws.onerror = (error) => {
            // NOTE: setWsStatus is not strictly needed here as onclose usually follows,
            // but we log the error for immediate feedback.
            console.error(`[Room ${roomId}] WebSocket Error:`, error);
            console.log(`[Room ${roomId}] ERROR: Check console for details.`);
        };

        // Cleanup: Close the connection when the component unmounts
        return () => {
            if (ws.readyState === 1) {
                ws.close();
                console.log(`[Room ${roomId}] Cleanup: WebSocket closed.`);
            }
        };
    }, [roomId]);

    const pageAnimation = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
    };

    const loadingContent = (
        <div className="flex flex-col items-center justify-center space-y-8">
            {/* SVG with animation for dice rolling effect */}
            <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-gray-600" // Similar color to the image's spinner
            >
                <GameIcon className="w-16 h-16" />
            </motion.div>
            
            <h1 className="text-3xl font-light text-gray-200">
                Loading game...
            </h1>
            
            <div className="text-center text-sm text-gray-400 mt-4">
                <span className="flex items-center justify-center text-gray-500">
                    <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                    Tip | New updates are announced on Richup's Discord server
                </span>
            </div>
        </div>
    );

    const connectedContent = (
        <div className="flex flex-col items-center justify-center space-y-4">
            <h1 className="text-4xl font-extrabold text-green-400">
                Connected to Room {roomId}
            </h1>
            <p className="text-xl text-gray-400">
                Game has loaded. Check your browser console for WebSocket activity.
            </p>
        </div>
    );
    
    // Choose which content to display based on connection status
    const displayContent = wsStatus === 'Connecting...' ? loadingContent : connectedContent;

    return (
        <motion.div
            // Dark purple/black background for 'Room' component to match image aesthetic
            className="min-h-screen p-8 bg-[#18121a] text-gray-100 flex items-center justify-center" 
            initial={pageAnimation.initial}
            animate={pageAnimation.animate}
            transition={pageAnimation.transition}
        >
            {displayContent}
        </motion.div>
    );
};