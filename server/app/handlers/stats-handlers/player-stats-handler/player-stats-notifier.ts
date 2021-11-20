import { ValidationResponse } from '@app/classes/validation/validation-response';

export interface PlayerStatsNotifier {
    notifyPlacement(validationData: ValidationResponse): void;
    notifySkip(): void;
    notifyExchange(): void;
    notifyRackUpdate(rack: string[]): void;
}
