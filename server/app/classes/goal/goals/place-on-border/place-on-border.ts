import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidatedWord, ValidationResponse } from '@app/classes/validation/validation-response';
import { GoalStatus } from '@common';
import { Goal } from '@app/classes/goal/goal';
import { Config } from '@app/config';

export class PlaceOnBorder extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'place-on-border',
            name: 'Former un mot de 2 lettres ou plus qui longe le plateau',
            score: 15,
            status: GoalStatus.Pending,
        });
    }

    private static isOnBorder(word: ValidatedWord): boolean {
        let isHorizontal = true;
        let isVertical = true;

        for (const { placement } of word.letters) {
            isHorizontal &&= placement.position.y % Config.GRID.GRID_SIZE === 0;
            isVertical &&= placement.position.x % Config.GRID.GRID_SIZE === 0;
        }

        return isHorizontal || isVertical;
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        for (const word of validationResponse.words) {
            if (PlaceOnBorder.isOnBorder(word)) {
                this.data.status = GoalStatus.Succeeded;
                return;
            }
        }
    }
}
