import { Injectable } from '@angular/core';
import { GoalData } from '@app/components/objectives/objectives.component';

export enum GoalStatus {
    Succeeded,
    Failed,
    Pending,
}

const GOAL_LIST_TEST: GoalData[] = [
    { id: 'goal1', isGlobal: true, name: 'ceci est le test dun objectif 1', score: 20, status: GoalStatus.Pending },
    { id: 'goal2', isGlobal: true, name: 'ceci est le test dun objectif 2', score: 30, status: GoalStatus.Succeeded },
    { id: 'goal3', isGlobal: false, name: 'ceci est le test dun objectif 3', score: 20, status: GoalStatus.Failed },
];

@Injectable({
    providedIn: 'root',
})
export class GoalService {
    publicObjectives: GoalData[];
    privateObjectives: GoalData[];
    constructor() {
        this.publicObjectives = [];
        this.privateObjectives = [];
    }

    updateObjectives() {
        this.publicObjectives = [];
        this.privateObjectives = [];
        for (const goal of GOAL_LIST_TEST) {
            if (goal.isGlobal) {
                this.publicObjectives.push(goal);
            } else this.privateObjectives.push(goal);
        }
    }
}
