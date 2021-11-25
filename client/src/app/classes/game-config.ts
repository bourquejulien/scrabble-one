import { GameMode, GameType } from '@common';
import { TimeSpan } from './time/timespan';

export interface GameConfig {
    gameType: GameType;
    gameMode: GameMode;
    playTime: TimeSpan;
    firstPlayerName: string;
    secondPlayerName: string;
}
