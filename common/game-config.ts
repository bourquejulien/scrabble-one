export interface SinglePlayerConfig {
    gameType: string;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
}

export interface MultiplayerCreateConfig {
    gameType: string;
    playTimeMs: number;
    playerName: string;
}

export interface MultiplayerJoinConfig {
    sessionId: string;
    playerName: string;
}

export interface ServerConfig {
    id: string,
    gameType: string,
    playTimeMs: number,
    firstPlayerName: string,
    secondPlayerName: string,
}
