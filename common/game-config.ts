export interface SinglePlayerGameConfig {
    gameType: string;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
}

export interface MultiplayerGameConfig {
    gameType: string;
    playTimeMs: number;
    playerName: string;
}

export interface ServerGameConfig {
    id: string,
    gameType: string,
    playTimeMs: number,
    firstPlayerName: string,
    secondPlayerName: string,
}
