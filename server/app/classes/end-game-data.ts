import { GameMode, Score } from '@common';

export interface EndGameData {
    winnerScore: Score;
    isWinnerHuman: boolean;
    gameMode: GameMode;
}
