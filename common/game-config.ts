import { GameType } from './game-type';

export interface SinglePlayerConfig {
    gameType: GameType;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
}

export interface MultiplayerCreateConfig {
    gameType: GameType;
    playTimeMs: number;
    playerName: string;
}

export interface MultiplayerJoinConfig {
    sessionId: string;
    playerName: string;
}

export interface ServerConfig {
    id: string,
    gameType: GameType,
    playTimeMs: number,
    firstPlayerName: string,
    secondPlayerName: string,
}
