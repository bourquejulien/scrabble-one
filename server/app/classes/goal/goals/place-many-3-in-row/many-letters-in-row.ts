import { ExchangeNotifier } from '@app/classes/goal/goals/notifiers/exchange-notifier';
import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/goals/notifiers/skip-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';

const REWARDED_PLACEMENT_SIZE = 5;
const REWARDED_CONSECUTIVE_TURN = 3;

export class ManyLettersInRow extends Goal implements PlacementNotifier, ExchangeNotifier, SkipNotifier {
    private consecutiveTurnCount: number;

    constructor() {
        super({
            id: 'many-letters-in-row',
            name: `Placer ${REWARDED_PLACEMENT_SIZE} lettres du chevalet ou plus lors de ${REWARDED_CONSECUTIVE_TURN} tours consécutifs`,
            score: 50,
            status: GoalStatus.Pending,
        });

        this.consecutiveTurnCount = 0;
    }

    notifyExchange(): void {
        this.consecutiveTurnCount = 0;
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        this.consecutiveTurnCount = validationResponse.placements.length > REWARDED_PLACEMENT_SIZE ? this.consecutiveTurnCount + 1 : 0;

        if (this.consecutiveTurnCount < REWARDED_CONSECUTIVE_TURN) {
            return;
        }

        this.data.status = GoalStatus.Succeeded;
    }

    notifySkip(): void {
        this.consecutiveTurnCount = 0;
    }
}
