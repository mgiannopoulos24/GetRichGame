import { useCallback, useEffect, useRef, useState } from 'react';

import type { ServerMessage } from '@/types/ws';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';

interface UseWebSocketOptions {
    roomId: string;
    nickname: string;
    onMessage?: (message: ServerMessage) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 1500;

const cleanBaseUrl = (url: string) => url.replace(/\/$/, '');

const getWsUrl = (roomId: string, nickname: string): string => {
    const protocol = cleanBaseUrl(API_BASE_URL).startsWith('https') ? 'wss:' : 'ws:';
    const hostAndPort = cleanBaseUrl(API_BASE_URL).replace(/^https?:\/\//, '');
    return `${protocol}//${hostAndPort}/api/v1/ws/game/?room_id=${roomId}&nickname=${encodeURIComponent(
        nickname,
    )}`;
};

export const useWebSocket = ({ roomId, nickname, onMessage }: UseWebSocketOptions) => {
    const wsRef = useRef<WebSocket | null>(null);
    const onMessageRef = useRef(onMessage);
    const reconnectRef = useRef<number>(0);
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const reconnectTimerRef = useRef<number | null>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');

    const clearReconnectTimer = useCallback(() => {
        if (reconnectTimerRef.current !== null) {
            window.clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    const connect = useCallback(() => {
        if (!roomId) {
            setConnectionState('disconnected');
            return;
        }
        clearReconnectTimer();
        setConnectionState('connecting');

        const ws = new WebSocket(getWsUrl(roomId, nickname));
        wsRef.current = ws;

        ws.onopen = () => {
            reconnectRef.current = 0;
            setConnectionState('connected');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data) as ServerMessage;
                onMessageRef.current?.(data);
            } catch (error) {
                console.error('Failed to parse websocket message', error);
            }
        };

        ws.onclose = () => {
            setConnectionState('disconnected');
            if (reconnectRef.current >= MAX_RECONNECT_ATTEMPTS) {
                return;
            }
            reconnectRef.current += 1;
            reconnectTimerRef.current = window.setTimeout(() => {
                connect();
            }, RECONNECT_DELAY_MS);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [clearReconnectTimer, nickname, roomId]);

    useEffect(() => {
        connect();
        return () => {
            clearReconnectTimer();
            wsRef.current?.close();
        };
    }, [clearReconnectTimer, connect]);

    const send = useCallback((payload: object) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(payload));
        }
    }, []);

    return { connectionState, send };
};
