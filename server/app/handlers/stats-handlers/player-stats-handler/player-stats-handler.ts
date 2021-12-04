import { ValidationResponse } from '@app/classes/validation/validation-response';
import { LETTER_DEFINITIONS, PlayerStats } from '@common';
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { PlayerStatsNotifier } from '@app/handlers/stats-handlers/player-stats-handler/player-stats-notifier';
import { Observable, Subject } from 'rxjs';

export class PlayerStatsHandler implements PlayerStatsNotifier {
    baseScore: number;
    scoreAdjustment: number;
    skippedTurns: number;
    rackScore: number;
    rackSize: number;

    private updateSubject: Subject<void>;

    constructor(private readonly goalHandler: GoalHandler, public id: string) {
        this.baseScore = 0;
        this.scoreAdjustment = 0;
        this.skippedTurns = 0;
        this.rackScore = 0;
        this.rackSize = 0;

        this.updateSubject = new Subject<void>();
    }

    private static computeRackScore(rack: string[]): number {
        let playerPoint = 0;

        for (const letter of rack) {
            const currentLetterData = LETTER_DEFINITIONS.get(letter.toLowerCase());
            playerPoint += currentLetterData?.points ?? 0;
        }

        return playerPoint;
    }

    notifyPlacement(validationData: ValidationResponse): void {
        if (!validationData.isSuccess) {
            return;
        }

        this.goalHandler.notifyStats(this.stats, this.id);

        this.baseScore += validationData.score;
        this.skippedTurns = 0;

        this.updateSubject.next();
        this.goalHandler.notifyPlacement(validationData, this.id);
    }

    notifySkip(): void {
        this.goalHandler.notifyStats(this.stats, this.id);

        this.skippedTurns++;
        this.goalHandler.notifySkip(this.id);
    }

    notifyExchange(): void {
        this.goalHandler.notifyStats(this.stats, this.id);

        this.skippedTurns = 0;
        this.goalHandler.notifyExchange(this.id);
    }

    notifyRackUpdate(rack: string[]): void {
        this.rackSize = rack.length;
        this.rackScore = PlayerStatsHandler.computeRackScore(rack);
        this.updateSubject.next();
    }

    get onUpdate(): Observable<void> {
        return this.updateSubject.asObservable();
    }

    get stats(): PlayerStats {
        const score = this.baseScore + this.scoreAdjustment + this.goalHandler.getScore(this.id);
        return { points: Math.max(0, score), rackSize: this.rackSize };
    }
}
