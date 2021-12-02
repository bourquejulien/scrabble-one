import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Config } from '@app/config';
import { Vec2 } from '@common';

const GRID_MAX_POSITION = Config.GRID.GRID_SIZE - 1;

export class PlaceCorner extends BaseGoal implements PlacementNotifier {
    private constructor(ownerId: string) {
        super(
            {
                id: 'place-corner',
                name: 'Placer une lettre dans un coin',
                score: 20,
            },
            ownerId,
        );
    }

    static generate(ownerId: string): Goal {
        return new PlaceCorner(ownerId);
    }

    private static isOnEdge(position: Vec2): boolean {
        return position.x % GRID_MAX_POSITION === 0 && position.y % GRID_MAX_POSITION === 0;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (this.guard(id) || !validationResponse.isSuccess) {
            return;
        }

        const success = validationResponse.placements.map((p) => PlaceCorner.isOnEdge(p.position)).reduce((prev, cur) => prev || cur);

        if (!success) {
            return;
        }

        this.successId = id;
    }
}
