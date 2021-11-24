import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidatedLetter, ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';

export class PlaceLetterTwice extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'place-letter-twice',
                name: 'Placer un mot contenant 2 fois la même lettre',
                score: 10,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlaceLetterTwice(ownerId);
    }

    private static isLetterDuplication(validatedLetters: ValidatedLetter[]): boolean {
        const letters = new Set<string>();

        for (const { placement } of validatedLetters) {
            if (letters.has(placement.letter)) {
                return true;
            }

            letters.add(placement.letter);
        }

        return false;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        for (const { letters } of validationResponse.words) {
            if (PlaceLetterTwice.isLetterDuplication(letters)) {
                this.successId = id;
                return;
            }
        }
    }
}
