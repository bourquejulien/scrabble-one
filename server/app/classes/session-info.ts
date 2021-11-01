import { GameType } from '@common';

export interface SessionInfo {
    id: string;
    playTimeMs: number;
    gameType: GameType;
}
