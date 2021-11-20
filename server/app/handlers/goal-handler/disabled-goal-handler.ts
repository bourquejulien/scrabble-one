/* eslint-disable no-unused-vars -- This interface disables goal handling, parameters are useless */ // TODO
import { GoalHandler } from '@app/handlers/goal-handler/goal-handler';
import { ValidationResponse } from '@app/classes/validation/validation-response';

export class DisabledGoalHandler extends GoalHandler {
    notifyExchange(id: string): void {
        // Does nothing
    }

    notifyPlacement(validationResponse: ValidationResponse, id: string): void {
        // Does nothing
    }

    notifySkip(id: string): void {
        // Does nothing
    }
}
