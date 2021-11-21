import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { Vec2 } from '@common';
import { Config } from '@app/config';

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
        return position.x % Config.GRID.GRID_SIZE === 0 && position.y % Config.GRID.GRID_SIZE === 0;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        const success = validationResponse.placements.map((p) => PlaceCorner.isOnEdge(p.position)).reduce((prev, cur) => prev || cur);

        if (!success) {
            return;
        }

        this.successId = id;
    }
}
