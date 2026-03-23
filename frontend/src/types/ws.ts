export interface RoomPlayer {
    nickname: string;
    avatar_color: string;
    position?: number;
    balance?: number;
    owned_properties?: number[];
    in_jail?: boolean;
    jail_cards?: number;
}

export interface BoardTile {
    index: number;
    name: string;
    type: string;
    price: number;
    rent: number;
    owner: string | null;
    color_group: string | null;
}

export interface RoomStatePayload {
    room_id: string;
    status: string;
    max_players: number;
    host: string;
    players: RoomPlayer[];
    player_count: number;
    board: BoardTile[];
    current_player_index: number;
    dice: [number, number];
    phase: string;
    log: string[];
    turn_deadline: string;
}

export type ServerMessage =
    | { type: 'room_state'; room_id: string; game_state: RoomStatePayload }
    | { type: 'game_state'; game_state: RoomStatePayload }
    | { type: 'player_joined'; player: RoomPlayer; game_state: RoomStatePayload }
    | { type: 'player_left'; player: Pick<RoomPlayer, 'nickname'>; game_state: RoomStatePayload }
    | { type: 'echo'; client_message: string; server_response: string }
    | { type: 'status'; message: string }
    | { type: 'error'; code: string; message: string };
