export interface Action {
    execute(): Action | null;
}
