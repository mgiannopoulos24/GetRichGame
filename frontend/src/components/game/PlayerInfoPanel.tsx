import React from 'react';

import type { RoomPlayer } from '@/types/ws';

interface PlayerInfoPanelProps {
    players: RoomPlayer[];
    currentPlayerIndex: number;
}

export const PlayerInfoPanel: React.FC<PlayerInfoPanelProps> = ({
    players,
    currentPlayerIndex,
}) => {
    return (
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <p className="mb-3 text-sm text-gray-400">Players</p>
            <div className="space-y-2">
                {players.map((player, index) => (
                    <div
                        key={player.nickname}
                        className="flex items-center justify-between rounded border border-gray-700 px-3 py-2"
                    >
                        <span className="font-medium">
                            {player.nickname} {index === currentPlayerIndex ? '(Current)' : ''}
                        </span>
                        <span className="text-sm text-emerald-300">${player.balance ?? 0}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
