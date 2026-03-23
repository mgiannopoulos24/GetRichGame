import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

interface RoomListItem {
    room_id: string;
    player_count: number;
    max_players: number;
    status: string;
}

interface RoomListResponse {
    count: number;
    page: number;
    page_size: number;
    results: RoomListItem[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const AllRooms: React.FC = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/v1/rooms/?page=1&page_size=20`);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                const data = (await response.json()) as RoomListResponse;
                setRooms(data.results);
            } catch (error) {
                console.error('Failed to fetch rooms', error);
            } finally {
                setLoading(false);
            }
        };
        void fetchRooms();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 px-4 py-8 text-gray-100">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-6 text-3xl font-bold">All Rooms</h1>
                {loading ? <p className="text-gray-400">Loading rooms...</p> : null}
                {!loading && rooms.length === 0 ? (
                    <p className="text-gray-400">No open rooms right now.</p>
                ) : null}
                <div className="space-y-3">
                    {rooms.map((room) => (
                        <div
                            key={room.room_id}
                            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4"
                        >
                            <div>
                                <p className="font-semibold">Room {room.room_id}</p>
                                <p className="text-sm text-gray-400">
                                    {room.player_count}/{room.max_players} players - {room.status}
                                </p>
                            </div>
                            <Button onClick={() => navigate(`/room/${room.room_id}`)}>Join</Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
