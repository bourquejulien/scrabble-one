import { TimeSpan } from './time/timespan';

export interface GameConfig {
    gameType: string;
    playTime: TimeSpan;
    firstPlayerName: string;
    secondPlayerName: string;
}
