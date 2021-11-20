import { GameMode, GameType } from '@common';

export interface SessionInfo {
    id: string;
    playTimeMs: number;
    gameMode: GameMode;
    gameType: GameType;
}
