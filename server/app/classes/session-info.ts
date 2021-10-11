export interface PlayerInfo {
    name: string;
    id: string;
    isVirtual: boolean;
}

export interface SessionInfo {
    id: string;
    playerInfo: PlayerInfo[];
}
