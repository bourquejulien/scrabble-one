import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlayerStats } from '@common';
import { SkipNotifier } from '@app/classes/goal/notifiers/skip-notifier';
import { StatsNotifier } from '@app/classes/goal/notifiers/stats-notifier';

export class SkipWithAdvantage extends BaseGoal implements SkipNotifier, StatsNotifier {
    private readonly isEligible: Set<string>;
    private readonly lastStats: Map<string, PlayerStats>;

    private constructor(ownerId: string) {
        super(
            {
                id: 'skip-with-advantage',
                name: 'Passer son tour et encore être encore en avance au prochain tour',
                score: 15,
            },
            ownerId,
        );

        this.isEligible = new Set<string>();
        this.lastStats = new Map<string, PlayerStats>();
    }

    static generate(ownerId: string): Goal {
        return new SkipWithAdvantage(ownerId);
    }

    notifySkip(id: string): void {
        if (this.guard(id)) {
            return;
        }

        this.isEligible.delete(id);

        if (this.isInAdvance(id)) {
            this.isEligible.add(id);
        }
    }

    notifyStats(stats: PlayerStats, id: string): void {
        this.lastStats.set(id, stats);

        if (this.guard(id) || !this.isEligible.has(id) || !this.isInAdvance(id)) {
            this.isEligible.delete(id);
            return;
        }

        this.successId = id;
    }

    private isInAdvance(id: string): boolean {
        const playerStats = this.lastStats.get(id);

        if (playerStats === undefined) {
            return false;
        }

        for (const { points } of this.lastStats.values()) {
            if (points >= playerStats.points) {
                return false;
            }
        }

        return true;
    }
}
