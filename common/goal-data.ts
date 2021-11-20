export enum GoalStatus {
    Succeeded,
    Failed,
    Pending,
}

export interface GoalData {
    id: string
    name: string;
    score: number;
    status: GoalStatus;
}
