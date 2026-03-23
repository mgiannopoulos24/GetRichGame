import React, { useEffect, useState } from 'react';

interface TurnTimerProps {
    turnDeadline: string;
}

const getSecondsLeft = (deadline: string) =>
    Math.max(0, Math.floor((new Date(deadline).getTime() - Date.now()) / 1000));

export const TurnTimer: React.FC<TurnTimerProps> = ({ turnDeadline }) => {
    const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsLeft(turnDeadline));

    useEffect(() => {
        setSecondsLeft(getSecondsLeft(turnDeadline));
        const interval = window.setInterval(() => {
            setSecondsLeft(getSecondsLeft(turnDeadline));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [turnDeadline]);

    return (
        <div className="rounded-lg border border-gray-700 bg-gray-900/60 p-4">
            <p className="text-sm text-gray-400">Turn Timer</p>
            <p className="mt-2 text-xl font-bold text-amber-300">{secondsLeft}s</p>
        </div>
    );
};
