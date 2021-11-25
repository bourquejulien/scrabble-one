import { GameMode, Score } from '@common';

export interface EndGameData {
    gameMode: GameMode;
    scores: Score[];
}
