import React from 'react';

interface ConnectionStatusProps {
    state: 'connecting' | 'connected' | 'disconnected';
}

const STATUS_STYLES: Record<ConnectionStatusProps['state'], { dot: string; label: string }> = {
    connecting: { dot: 'bg-yellow-400 animate-pulse', label: 'Connecting' },
    connected: { dot: 'bg-emerald-400', label: 'Connected' },
    disconnected: { dot: 'bg-red-500', label: 'Disconnected' },
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ state }) => {
    const style = STATUS_STYLES[state];
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-sm text-gray-200">
            <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
            <span>{style.label}</span>
        </div>
    );
};
