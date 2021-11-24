import { ExchangeNotifier } from '@app/classes/goal/notifiers/exchange-notifier';
import { PlacementNotifier } from '@app/classes/goal/notifiers/placement-notifier';
import { SkipNotifier } from '@app/classes/goal/notifiers/skip-notifier';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { Goal } from '@app/classes/goal/base-goal';
import { Observable, Subject } from 'rxjs';
import { GoalData, GoalStatus, PlayerStats } from '@common';
import { StatsNotifier } from '@app/classes/goal/notifiers/stats-notifier';

export abstract class GoalHandler implements PlacementNotifier, ExchangeNotifier, SkipNotifier, StatsNotifier {
    readonly goals: Goal[];
    protected readonly updateSubject: Subject<void>;

    constructor() {
        this.goals = [];
        this.updateSubject = new Subject<void>();
    }

    getGoalsData(id: string): GoalData[] {
        return this.goals.filter((g) => g.isOwner(id)).map((g) => g.getGoalData(id));
    }

    getScore(id: string): number {
        return this.getGoalsData(id)
            .filter((d) => d.status === GoalStatus.Succeeded)
            .map((d) => d.score)
            .reduce((prev, cur) => prev + cur, 0);
    }

    get onUpdate(): Observable<void> {
        return this.updateSubject.asObservable();
    }

    abstract start(ids: string[]): void;
    abstract notifyPlacement(validationResponse: ValidationResponse, id: string): void;
    abstract notifyExchange(id: string): void;
    abstract notifySkip(id: string): void;
    abstract notifyStats(stats: PlayerStats, id: string): void;
}
