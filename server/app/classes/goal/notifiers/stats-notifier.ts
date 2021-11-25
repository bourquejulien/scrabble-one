import { PlayerStats } from '@common';

export interface StatsNotifier {
    notifyStats(stats: PlayerStats, id: string): void;
}
