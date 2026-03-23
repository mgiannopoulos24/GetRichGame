import React from 'react';

interface DicePanelProps {
    dice: [number, number];
}

export const DicePanel: React.FC<DicePanelProps> = ({ dice }) => {
    return (
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <p className="mb-2 text-sm text-gray-400">Dice</p>
            <div className="flex items-center gap-3">
                <div className="rounded bg-gray-800 px-3 py-2 text-2xl font-bold">{dice[0]}</div>
                <div className="rounded bg-gray-800 px-3 py-2 text-2xl font-bold">{dice[1]}</div>
                <span className="text-sm text-gray-300">Total: {dice[0] + dice[1]}</span>
            </div>
        </div>
    );
};
