import { ExchangeNotifier } from '@app/classes/goal/goals/notifiers/exchange-notifier';
import { PlacementNotifier } from '@app/classes/goal/goals/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/goals/notifiers/skip-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Goal } from '@app/classes/goal/base-goal';
import { Observable, Subject } from 'rxjs';
import { GoalData } from '@common';

export abstract class GoalHandler implements PlacementNotifier, ExchangeNotifier, SkipNotifier {
    readonly goals: Goal[];
    protected readonly updateSubject: Subject<void>;

    constructor() {
        this.goals = [];
        this.updateSubject = new Subject<void>();
    }

    getGoalsData(id: string): GoalData[] {
        return this.goals.filter((g) => g.isOwner(id)).map((g) => g.getGoalData(id));
    }

    get onUpdate(): Observable<void> {
        return this.updateSubject.asObservable();
    }

    abstract start(ids: string[]): void;
    abstract notifyPlacement(validationResponse: ValidationResponse, id: string): void;
    abstract notifyExchange(id: string): void;
    abstract notifySkip(id: string): void;
}
