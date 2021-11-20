import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidatedLetter, ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';

const MIN_WORD_SIZE = 3;
const SCORE_MULTIPLIER = 3;

export class PlacePalindrome extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'place-palindrome',
            name: `Former un palindrome de ${MIN_WORD_SIZE} lettres ou plus`,
            score: -1,
            status: GoalStatus.Pending,
        });
    }

    private static isPalindrome(letters: ValidatedLetter[]): boolean {
        for (let i = 0; i < letters.length / 2; i++) {
            if (letters[i] !== letters[letters.length - i]) {
                return false;
            }
        }

        return true;
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        for (const word of validationResponse.words) {
            if (word.letters.length >= MIN_WORD_SIZE && PlacePalindrome.isPalindrome(word.letters)) {
                this.data.status = GoalStatus.Succeeded;
                this.data.score = validationResponse.score * SCORE_MULTIPLIER;
                return;
            }
        }
    }
}
