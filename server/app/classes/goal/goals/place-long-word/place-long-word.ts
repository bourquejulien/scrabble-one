import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';

const WORD_SIZE = 8;

export class PlaceLongWord extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'place-long-word',
            // TODO Reformulation
            name: `Former un mot de ${WORD_SIZE} lettres ou plus`,
            score: 20,
            status: GoalStatus.Pending,
        });
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        for (const word of validationResponse.words) {
            if (word.letters.length > WORD_SIZE) {
                this.data.status = GoalStatus.Succeeded;
                return;
            }
        }
    }
}
