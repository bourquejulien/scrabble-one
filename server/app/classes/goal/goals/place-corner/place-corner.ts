import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Goal } from '@app/classes/goal/goal';
import { GoalStatus, Vec2 } from '@common';
import { Config } from '@app/config';

export class PlaceCorner extends Goal implements PlacementNotifier {
    constructor() {
        super({
            id: 'place-corner',
            name: 'Placer une lettre dans un coin',
            score: 20,
            status: GoalStatus.Pending,
        });
    }

    private static isOnEdge(position: Vec2): boolean {
        return position.x % Config.GRID.GRID_SIZE === 0 && position.y % Config.GRID.GRID_SIZE == 0;
    }

    notifyPlacement(validationResponse: ValidationResponse): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        const success = validationResponse.placements.map((p) => PlaceCorner.isOnEdge(p.position)).reduce((prev, cur) => prev || cur);

        if (!success) {
            return;
        }

        this.data.status = GoalStatus.Succeeded;
    }
}
