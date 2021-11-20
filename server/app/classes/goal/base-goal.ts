import { ExchangeNotifier } from '@app/classes/goal/goals/notifiers/exchange-notifier';
import { SkipNotifier } from '@app/classes/goal/goals/notifiers/skip-notifier';
import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { GoalDescription } from '@app/classes/goal/goal-description';
import { GoalData, GoalStatus } from '@common';

export type Goal = BaseGoal & (ExchangeNotifier | SkipNotifier | PlacementNotifier);

export abstract class BaseGoal {
    protected successId: string;
    protected constructor(readonly data: GoalDescription, protected readonly ownerId: string) {}

    isOwner(id: string) {
        return this.ownerId === '' || this.ownerId === id;
    }

    getGoalData(id: string): GoalData {
        return {
            id: this.data.id,
            isGlobal: this.ownerId === '',
            name: this.data.name,
            score: this.data.score,
            status: this.getStatus(id),
        };
    }

    get isCompleted(): boolean {
        return this.successId !== '';
    }

    private getStatus(id: string): GoalStatus {
        if (!this.isCompleted) {
            return GoalStatus.Pending;
        }

        return id === this.successId ? GoalStatus.Succeeded : GoalStatus.Failed;
    }
}
