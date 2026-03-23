import React from 'react';

import type { BoardTile, RoomPlayer } from '@/types/ws';

interface GameBoardProps {
    board: BoardTile[];
    players: RoomPlayer[];
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, players }) => {
    return (
        <div className="grid grid-cols-8 gap-1 rounded-lg border border-gray-700 bg-gray-900/60 p-2">
            {board.map((tile) => {
                const onTile = players.filter((player) => player.position === tile.index);
                return (
                    <div
                        key={tile.index}
                        className="min-h-20 rounded border border-gray-700 bg-gray-800 p-2 text-xs"
                    >
                        <p className="font-semibold text-gray-200">{tile.name}</p>
                        <p className="text-[11px] text-gray-400">{tile.type}</p>
                        {tile.price > 0 ? (
                            <p className="text-[11px] text-emerald-300">${tile.price}</p>
                        ) : null}
                        <div className="mt-1 flex flex-wrap gap-1">
                            {onTile.map((player) => (
                                <span
                                    key={`${tile.index}-${player.nickname}`}
                                    className="rounded bg-indigo-500/30 px-1.5 py-0.5 text-[10px] text-indigo-200"
                                >
                                    {player.nickname}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
