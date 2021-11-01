import { GameType } from './game-type';

export interface SinglePlayerConfig {
    gameType: GameType;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
    isRandomBonus: boolean;
}

export interface SinglePlayerConvertConfig {
    id: string;
    name: string;
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
    startId: string,
    gameType: GameType,
    playTimeMs: number,
    firstPlayerName: string,
    secondPlayerName: string,
}
