import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidatedWord, ValidationResponse } from '@app/classes/validation/validation-response';
import { Config } from '@app/config';

const GRID_MAX_POSITION = Config.GRID.GRID_SIZE - 1;

export class PlaceOnBorder extends BaseGoal implements PlacementNotifier {
    constructor(ownerId: string) {
        super(
            {
                id: 'place-on-border',
                name: 'Former un mot de 2 lettres ou plus qui longe les extrémités du plateau de jeu',
                score: 15,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlaceOnBorder(ownerId);
    }

    private static isOnBorder(word: ValidatedWord): boolean {
        let isHorizontal = true;
        let isVertical = true;

        for (const { placement } of word.letters) {
            isHorizontal &&= placement.position.y % GRID_MAX_POSITION === 0;
            isVertical &&= placement.position.x % GRID_MAX_POSITION === 0;
        }

        return isHorizontal || isVertical;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (this.guard(id) || !validationResponse.isSuccess) {
            return;
        }

        for (const word of validationResponse.words) {
            if (PlaceOnBorder.isOnBorder(word)) {
                this.successId = id;
                return;
            }
        }
    }
}
