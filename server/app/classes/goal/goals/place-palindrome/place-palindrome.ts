import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidatedLetter, ValidationResponse } from '@app/classes/validation/validation-response';

const MIN_WORD_SIZE = 3;
const SCORE_MULTIPLIER = 3;

export class PlacePalindrome extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'place-palindrome',
                name: `Former un palindrome de ${MIN_WORD_SIZE} lettres ou plus`,
                score: -1,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlacePalindrome(ownerId);
    }

    private static isPalindrome(letters: ValidatedLetter[]): boolean {
        for (let i = 0; i < letters.length / 2; i++) {
            if (letters[i].placement.letter !== letters[letters.length - (i + 1)].placement.letter) {
                return false;
            }
        }

        return true;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (this.guard(id) || !validationResponse.isSuccess) {
            return;
        }

        for (const word of validationResponse.words) {
            if (word.letters.length >= MIN_WORD_SIZE && PlacePalindrome.isPalindrome(word.letters)) {
                this.successId = id;
                this.data.score = validationResponse.score * SCORE_MULTIPLIER;
                return;
            }
        }
    }
}
