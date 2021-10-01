import { Action } from './action';

export class SkipAction implements Action {
    execute(): Action | null {
        return null;
    }
}
