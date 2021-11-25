/* eslint-disable no-unused-vars,@typescript-eslint/no-empty-function -- This interface disables goal handling, parameters are useless */ // TODO
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';
import { PlayerStats } from '@common';

export class DisabledGoalHandler extends GoalHandler {
    start(ids: string[]): void {}
    notifyExchange(id: string): void {}
    notifyPlacement(validationResponse: ValidationResponse, id: string): void {}
    notifySkip(id: string): void {}
    notifyStats(stats: PlayerStats, id: string): void {}
}
