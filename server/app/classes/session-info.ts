export interface PlayerInfo {
    name: string;
    isVirtual: boolean;
}

export interface SessionInfo {
    playerInfo: PlayerInfo[];
}
