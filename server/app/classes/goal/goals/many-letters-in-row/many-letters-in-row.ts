import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { ExchangeNotifier } from '@app/classes/goal/notifiers/exchange-notifier';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/notifiers/skip-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';

const REWARDED_PLACEMENT_SIZE = 5;
const REWARDED_CONSECUTIVE_TURN = 3;

export class ManyLettersInRow extends BaseGoal implements PlacementNotifier, ExchangeNotifier, SkipNotifier {
    private consecutiveTurnCount: Map<string, number>;

    constructor(ownerId: string) {
        super(
            {
                id: 'many-letters-in-row',
                name: `Placer ${REWARDED_PLACEMENT_SIZE} lettres du chevalet ou plus lors de ${REWARDED_CONSECUTIVE_TURN} tours consécutifs`,
                score: 50,
            },
            ownerId,
        );

        this.consecutiveTurnCount = new Map<string, number>();
    }

    static generate(ownerId: string): Goal {
        return new ManyLettersInRow(ownerId);
    }

    notifyExchange(id: string): void {
        this.consecutiveTurnCount.set(id, 0);
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (this.guard(id) || !validationResponse.isSuccess) {
            return;
        }

        let currentTurnCount = this.consecutiveTurnCount.get(id) ?? 0;
        currentTurnCount = validationResponse.placements.length > REWARDED_PLACEMENT_SIZE ? currentTurnCount + 1 : 0;

        if (currentTurnCount < REWARDED_CONSECUTIVE_TURN) {
            this.consecutiveTurnCount.set(id, currentTurnCount);
            return;
        }

        this.consecutiveTurnCount.clear();
        this.successId = id;
    }

    notifySkip(id: string): void {
        this.consecutiveTurnCount.set(id, 0);
    }
}
