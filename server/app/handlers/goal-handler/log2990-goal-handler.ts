import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/goals/notifiers/skip-notifier';
import { ExchangeNotifier } from '@app/classes/goal/goals/notifiers/exchange-notifier';

export class Log2990GoalHandler extends GoalHandler {
    notifyExchange(id: string): void {
        this.goals
            .map((g) => g as ExchangeNotifier)
            .filter((n) => n.notifyExchange !== undefined)
            .forEach((n) => n.notifyExchange(id));

        this.updateSubject.next();
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        this.goals
            .map((g) => g as PlacementNotifier)
            .filter((n) => n.notifyPlacement !== undefined)
            .forEach((n) => n.notifyPlacement(validationResponse, id));

        this.updateSubject.next();
    }

    notifySkip(id: string): void {
        this.goals
            .map((g) => g as SkipNotifier)
            .filter((n) => n.notifySkip !== undefined)
            .forEach((n) => n.notifySkip(id));

        this.updateSubject.next();
    }
}
