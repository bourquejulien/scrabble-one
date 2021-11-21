import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';

export class PlaceLetterTwice extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'place-letter-twice',
                // TODO Dans le mots ou les lettres placées?
                name: 'Placer un mot contenant au moins 2 fois la même lettre',
                score: 10,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlaceLetterTwice(ownerId);
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        const letters = new Set<string>();

        for (const { letter } of validationResponse.placements) {
            if (letters.has(letter)) {
                this.successId = id;
                return;
            }

            letters.add(letter);
        }
    }
}
