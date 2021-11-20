import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { goalGenerator } from '@app/classes/goal/goals/goal.decorator';

const MIN_SCORE = 15;
const MIN_LETTER_COUNT = 4;
const SCORE_MULTIPLIER = 2;

@goalGenerator
export class ShortWordHighScore extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'short-word-high-score',
                name: `Obtenir ${MIN_SCORE} points et plus en plaçant ${MIN_LETTER_COUNT} lettres ou moins en 1 tour`,
                score: -1,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new ShortWordHighScore(ownerId);
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        if (validationResponse.placements.length >= MIN_LETTER_COUNT && validationResponse.score >= MIN_SCORE) {
            this.successId = id;
            this.data.score = validationResponse.score * SCORE_MULTIPLIER;
        }
    }
}
