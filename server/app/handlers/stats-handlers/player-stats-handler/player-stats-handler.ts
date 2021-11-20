import { ValidationResponse } from '@app/classes/validation/validation-response';
import { LETTER_DEFINITIONS, PlayerStats } from '@common';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';

export class PlayerStatsHandler implements PlayerStatsNotifier{
    baseScore: number;
    scoreAdjustment: number;
    skippedTurns: number;
    // TODO gros hack
    rack: string[];

    constructor(private readonly goalHandler: GoalHandler, rack: string[], readonly id: string) {
        this.baseScore = 0;
        this.scoreAdjustment = 0;
        this.skippedTurns = 0;
    }

    notifyPlacement(validationData: ValidationResponse): void {
        if (!validationData.isSuccess) {
            return;
        }

        this.baseScore += validationData.score;
        this.skippedTurns = 0;

        this.goalHandler.notifyPlacement(validationData, this.id);
    }

    notifySkip(): void {
        this.skippedTurns++;
        this.goalHandler.notifySkip(this.id);
    }

    notifyExchange(): void {
        this.skippedTurns = 0;
        this.goalHandler.notifyExchange(this.id);
    }

    rackPoints(): number {
        let playerPoint = 0;
        for (const letter of this.rack) {
            const currentLetterData = LETTER_DEFINITIONS.get(letter.toLowerCase());
            playerPoint += currentLetterData?.points ?? 0;
        }

        return playerPoint;
    }

    get stats(): PlayerStats {
        return { points: Math.max(0, this.baseScore + this.scoreAdjustment), rackSize: this.rack.length };
    }
}
