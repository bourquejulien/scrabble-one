import { GameType } from './game-type';
import { GameMode } from './game-mode';

export interface SinglePlayerConfig {
    gameType: GameType;
    gameMode: GameMode;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
    isRandomBonus: boolean;
}

export interface MultiplayerCreateConfig {
    gameType: GameType;
    gameMode: GameMode;
    playTimeMs: number;
    playerName: string;
    isRandomBonus: boolean;
}

export interface MultiplayerJoinConfig {
    sessionId: string;
    playerName: string;
}

export interface ConvertConfig {
    id: string;
    virtualPlayerName: string;
}

export interface AvailableGameConfig {
    id: string;
    playTimeMs: number;
    waitingPlayerName: string;
    isRandomBonus: boolean;
}

export interface ServerConfig {
    id: string;
    startId: string;
    gameType: GameType;
    gameMode: GameMode;
    playTimeMs: number;
    firstPlayerName: string;
    secondPlayerName: string;
}
