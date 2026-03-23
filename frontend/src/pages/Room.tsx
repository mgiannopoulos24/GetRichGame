import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { ActionPanel } from '@/components/game/ActionPanel';
import { DicePanel } from '@/components/game/DicePanel';
import { GameBoard } from '@/components/game/GameBoard';
import { GameLog } from '@/components/game/GameLog';
import { PlayerInfoPanel } from '@/components/game/PlayerInfoPanel';
import { TurnTimer } from '@/components/game/TurnTimer';
import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/lobby/ConnectionStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { RoomStatePayload, ServerMessage } from '@/types/ws';

const AVATAR_COLOR_CLASSES: Record<string, string> = {
    orange: 'bg-orange-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    red: 'bg-red-400',
    purple: 'bg-purple-400',
    yellow: 'bg-yellow-400',
};

export const Room: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [roomState, setRoomState] = useState<RoomStatePayload | null>(null);
    const [readyPlayers, setReadyPlayers] = useState<Record<string, boolean>>({});
    const [startingGame, setStartingGame] = useState(false);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

    const nickname = useMemo(() => {
        const existingNickname = localStorage.getItem('getrich_nickname');
        if (existingNickname) return existingNickname;
        const generated = `guest-${Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')}`;
        localStorage.setItem('getrich_nickname', generated);
        return generated;
    }, []);

    const handleMessage = (message: ServerMessage) => {
        if (message.type === 'room_state') {
            setRoomState(message.game_state);
            return;
        }
        if (message.type === 'game_state') {
            setRoomState(message.game_state);
            return;
        }
        if (message.type === 'player_joined') {
            setRoomState(message.game_state);
            toast.success(`${message.player.nickname} joined the room`);
            return;
        }
        if (message.type === 'player_left') {
            setRoomState(message.game_state);
            toast.info(`${message.player.nickname} left the room`);
            return;
        }
        if (message.type === 'error') {
            toast.error(message.message);
        }
    };

    const { connectionState, send } = useWebSocket({
        roomId: roomId ?? '',
        nickname,
        onMessage: handleMessage,
    });

    const toggleReady = () => {
        setReadyPlayers((prev) => ({ ...prev, [nickname]: !prev[nickname] }));
        send({ message: `${nickname} toggled ready` });
    };

    const allPlayersReady =
        !!roomState?.players.length &&
        roomState.players.every((player) => readyPlayers[player.nickname]);

    const copyRoomLink = async () => {
        if (!roomId) return;
        await navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
        toast.success('Room link copied');
    };

    const handleStartGame = async () => {
        if (!roomId) return;
        setStartingGame(true);
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/game/${roomId}/start/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = (await response.json()) as {
                game_state?: RoomStatePayload;
                detail?: string;
            };
            if (!response.ok) {
                throw new Error(data.detail ?? `HTTP ${response.status}`);
            }
            if (data.game_state) {
                setRoomState(data.game_state);
            }
            toast.success('Game started');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to start game';
            toast.error(message);
        } finally {
            setStartingGame(false);
        }
    };

    const handleGameAction = (actionType: string) => {
        send({ type: actionType });
    };

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 text-gray-100">
            <div className="mx-auto max-w-4xl rounded-xl border border-gray-700 bg-gray-800 p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Lobby - Room {roomId}</h1>
                    <ConnectionStatus state={connectionState} />
                </div>

                <p className="mb-4 text-sm text-gray-400">
                    You are <span className="font-semibold text-gray-200">{nickname}</span>
                </p>

                <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                    <p className="text-sm text-gray-300">
                        Players: {roomState?.player_count ?? 0}/{roomState?.max_players ?? 0}
                    </p>
                    <div className="mt-3 space-y-2">
                        {roomState?.players.map((player) => (
                            <div
                                key={player.nickname}
                                className="flex items-center justify-between rounded-md border border-gray-700 px-3 py-2"
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className={`h-3 w-3 rounded-full ${AVATAR_COLOR_CLASSES[player.avatar_color] ?? 'bg-gray-400'}`}
                                    />
                                    {player.nickname}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {readyPlayers[player.nickname] ? 'Ready' : 'Not ready'}
                                </span>
                            </div>
                        )) ?? <p className="text-gray-500">Waiting for players...</p>}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button onClick={toggleReady}>
                        {readyPlayers[nickname] ? 'Unready' : 'Ready up'}
                    </Button>
                    <Button variant="outline" onClick={copyRoomLink}>
                        Copy room link
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={!allPlayersReady || startingGame}
                        onClick={handleStartGame}
                    >
                        Start Game
                    </Button>
                </div>

                {roomState?.board?.length ? (
                    <div className="mt-8 space-y-4">
                        <GameBoard board={roomState.board} players={roomState.players} />
                        <div className="grid gap-4 md:grid-cols-2">
                            <DicePanel dice={roomState.dice} />
                            <TurnTimer turnDeadline={roomState.turn_deadline} />
                            <PlayerInfoPanel
                                players={roomState.players}
                                currentPlayerIndex={roomState.current_player_index}
                            />
                            <ActionPanel
                                onAction={handleGameAction}
                                disabled={
                                    roomState.players[roomState.current_player_index]?.nickname !==
                                    nickname
                                }
                            />
                        </div>
                        <GameLog entries={roomState.log} />
                    </div>
                ) : null}
            </div>
        </div>
    );
};
