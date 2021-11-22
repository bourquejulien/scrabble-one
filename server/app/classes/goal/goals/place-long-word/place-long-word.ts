import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';

const WORD_SIZE = 8;

export class PlaceLongWord extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'place-long-word',
                name: `Former un mot composé de ${WORD_SIZE} lettres ou plus`,
                score: 20,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlaceLongWord(ownerId);
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        for (const word of validationResponse.words) {
            if (word.letters.length >= WORD_SIZE) {
                this.successId = id;
                return;
            }
        }
    }
}
