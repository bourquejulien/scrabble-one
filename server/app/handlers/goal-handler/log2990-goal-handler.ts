import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/goals/notifiers/skip-notifier';
import { ExchangeNotifier } from '@app/classes/goal/goals/notifiers/exchange-notifier';
import { GOAL_GENERATORS, GoalGenerator } from '@app/classes/goal/goals/goal-generator-list';

const PRIVATE_GOAL_COUNT = 1;
const PUBLIC_GOAL_COUNT = 2;

export class Log2990GoalHandler extends GoalHandler {
    private static getAndRetrieveGenerator(generators: GoalGenerator[]): GoalGenerator {
        const index = Math.floor(Math.random() * generators.length);
        return generators.splice(index, 1)[0];
    }

    start(ids: string[]): void {
        const generators = GOAL_GENERATORS.slice();

        // Adding global goals
        this.addGoals(generators, PUBLIC_GOAL_COUNT, '');

        // Adding goals for each player
        for (const id of ids) {
            this.addGoals(generators, PRIVATE_GOAL_COUNT, id);
        }

        this.updateSubject.next();
    }

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

    private addGoals(generators: GoalGenerator[], count: number, id: string): void {
        [...Array(count).keys()]
            .map(() => Log2990GoalHandler.getAndRetrieveGenerator(generators))
            .map((gen) => gen.generate(id))
            .forEach((goal) => this.goals.push(goal));
    }
}
