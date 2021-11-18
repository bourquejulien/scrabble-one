import { ValidationResponse } from '@app/classes/validation/validation-response';

export class PlayerStatsHandler {
    baseScore: number;
    scoreAdjustment: number;
    skippedTurns: number;

    constructor() {}

    onPlace(validationData: ValidationResponse): void {
        if (!validationData.isSuccess) {
            return;
        }
        this.baseScore += validationData.score;
        this.skippedTurns = 0;
    }

    onSkip(): void {
        this.skippedTurns++;
    }

    onExchange(): void {
        this.skippedTurns = 0;
    }

    get points(): number {
        return Math.max(0, this.baseScore + this.scoreAdjustment);
    }
}
