import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';

const MIN_SCORE = 15;
const MIN_LETTER_COUNT = 4;
const SCORE_MULTIPLIER = 2;

export class ShortWordHighScore extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'short-word-high-score',
            name: `Obtenir ${MIN_SCORE} points et plus en plaçant ${MIN_LETTER_COUNT} lettres ou moins en 1 tour`,
            score: -1,
            status: GoalStatus.Pending,
        });
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        if (validationResponse.placements.length >= MIN_LETTER_COUNT && validationResponse.score >= MIN_SCORE) {
            this.data.status = GoalStatus.Succeeded;
            this.data.score = validationResponse.score * SCORE_MULTIPLIER;
        }
    }
}
