import React from 'react';

interface GameLogProps {
    entries: string[];
}

export const GameLog: React.FC<GameLogProps> = ({ entries }) => {
    return (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <p className="mb-3 text-sm text-gray-400">Game Log</p>
            <ul className="space-y-2 text-sm text-gray-200">
                {entries.length ? (
                    entries
                        .slice()
                        .reverse()
                        .map((entry, index) => <li key={`${index}-${entry}`}>{entry}</li>)
                ) : (
                    <li className="text-gray-500">No events yet.</li>
                )}
            </ul>
        </div>
    );
};
