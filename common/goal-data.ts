export enum GoalStatus {
    Succeeded,
    Failed,
    Pending,
}

export interface GoalData {
    id: string;
    isGlobal: boolean;
    name: string;
    score: number;
    scoreDescription?: string;
    status: GoalStatus;
}
