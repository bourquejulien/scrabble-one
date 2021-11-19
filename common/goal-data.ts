export enum GoalStatus {
    Succeeded,
    Failed,
    Pending,
}

export interface GoalData {
    name: string;
    score: number;
    status: GoalStatus;
}
