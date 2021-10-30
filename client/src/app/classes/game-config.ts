import { TimeSpan } from './time/timespan';
import { GameType } from '@common';

export interface GameConfig {
    gameType: GameType;
    playTime: TimeSpan;
    firstPlayerName: string;
    secondPlayerName: string;
}
