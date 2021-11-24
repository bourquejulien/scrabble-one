import { ValidationResponse } from '@app/classes/validation/validation-response';

export interface PlacementNotifier {
    notifyPlacement(validationResponse: ValidationResponse, id: string): void;
}
