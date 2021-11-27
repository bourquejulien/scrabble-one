/*
eslint-disable no-unused-vars,
@typescript-eslint/no-empty-function
-- Note to Kevin:
-- This interface disables goal handling in classic game made.
-- It is used in order to reduce code complexity.
-- Functions are empty since it is the desired behavior of the class.
-- Thanks!
*/
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
