import { GameType } from './game-type';

export interface SinglePlayerConfig {
    gameType: GameType;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
    isRandomBonus: boolean;
}

export interface MultiplayerCreateConfig {
    gameType: GameType;
    playTimeMs: number;
    playerName: string;
    isRandomBonus: boolean;
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

export interface JoinServerConfig {
    startId: string,
    serverConfig: ServerConfig,
}
