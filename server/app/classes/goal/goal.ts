import { GoalData, GoalStatus } from '@common';

export abstract class Goal {
    readonly data: GoalData;

    protected constructor(data: GoalData) {
        this.data = data;
    }

    get isCompleted(): boolean {
        return this.data.status !== GoalStatus.Pending;
    }
}
