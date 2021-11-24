import { Component, OnInit } from '@angular/core';

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
    status: GoalStatus;
}

const GOAL_LIST_TEST: GoalData[] = [
    { id: 'goal1', isGlobal: true, name: 'ceci est le test dun objectif 1', score: 20, status: GoalStatus.Pending },
    { id: 'goal2', isGlobal: true, name: 'ceci est le test dun objectif 2', score: 30, status: GoalStatus.Succeeded },
    { id: 'goal3', isGlobal: false, name: 'ceci est le test dun objectif 3', score: 20, status: GoalStatus.Failed },
];
@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent implements OnInit {
    publicObjectives: GoalData[] = [];
    privateObjectives: GoalData[] = [];
    displayedColumns: string[] = ['objectives', 'points', 'succeeded'];
    ngOnInit() {
        for (const goal of GOAL_LIST_TEST) {
            if (goal.isGlobal) {
                this.publicObjectives.push(goal);
            } else this.privateObjectives.push(goal);
        }
    }
}
