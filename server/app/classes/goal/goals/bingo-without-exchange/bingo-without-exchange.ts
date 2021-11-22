import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { BaseGoal, Goal } from '@app/classes/goal/base-goal';
import { Placement } from '@common';
import { ExchangeNotifier } from '@app/classes/goal/notifiers/exchange-notifier';
import { Config } from '@app/config';

export class BingoWithoutExchange extends BaseGoal implements PlacementNotifier, ExchangeNotifier {
    private readonly hasExchanged: Set<string>;

    private constructor(ownerId: string) {
        super(
            {
                id: 'bingo-without-exchange',
                name: 'Réaliser un Bingo sans avoir échangé de lettre au préalable',
                score: 30,
            },
            ownerId,
        );
        this.hasExchanged = new Set<string>();
    }

    static generate(ownerId: string): Goal {
        return new BingoWithoutExchange(ownerId);
    }

    private static isBingo(placements: Placement[]): boolean {
        return placements.length === Config.RACK_SIZE;
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        if (!validationResponse.isSuccess || this.isCompleted) {
            return;
        }

        if (BingoWithoutExchange.isBingo(validationResponse.placements) && !this.hasExchanged.has(id)) {
            this.successId = id;
        }
    }

    notifyExchange(id: string): void {
        this.hasExchanged.add(id);
    }
}
