import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';

export class PlaceLetterTwice extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'place-letter-twice',
            // TODO Dans le mots ou les lettres placées?
            name: 'Placer un mot contenant au moins 2 fois la même lettre',
            score: 10,
            status: GoalStatus.Pending,
        });
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        const letters = new Set<string>();

        for (const { letter } of validationResponse.placements) {
            if (letters.has(letter)) {
                this.data.status = GoalStatus.Succeeded;
                return;
            }
        }
    }
}
