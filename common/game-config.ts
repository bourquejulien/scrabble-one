import { DictionaryMetadata } from './dictionary-metadata';
import { GameType } from './game-type';
import { GameMode } from './game-mode';
import { VirtualPlayerLevel } from './virtual-player-level';

export interface SinglePlayerConfig {
    gameType: GameType;
    gameMode: GameMode;
    virtualPlayerLevel: VirtualPlayerLevel;
    playTimeMs: number;
    playerName: string;
    virtualPlayerName: string;
    isRandomBonus: boolean;
    dictionary: DictionaryMetadata;
}

export interface MultiplayerCreateConfig {
    gameType: GameType;
    gameMode: GameMode;
    playTimeMs: number;
    playerName: string;
    isRandomBonus: boolean;
    dictionary: DictionaryMetadata;
}

export interface MultiplayerJoinConfig {
    sessionId: string;
    playerName: string;
}

export interface ConvertConfig {
    id: string;
    virtualPlayerName: string;
    virtualPlayerLevel: VirtualPlayerLevel;
}

export interface AvailableGameConfig {
    id: string;
    gameMode: GameMode;
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
