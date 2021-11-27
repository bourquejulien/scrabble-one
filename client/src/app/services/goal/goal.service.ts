import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GoalData, GoalStatus } from '@common';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GoalService {
    publicObjectives: GoalData[];
    privateObjectives: GoalData[];
    goalData: Subject<GoalData[]> = new Subject<GoalData[]>();
    sentSnackBar: string[];
    constructor(socketService: SocketClientService, private snackBar: MatSnackBar) {
        this.publicObjectives = [];
        this.privateObjectives = [];
        this.sentSnackBar = [];
        socketService.on('goals', (goals: GoalData[]) => this.updateObjectives(goals));
    }

    updateObjectives(goals: GoalData[]) {
        this.publicObjectives = [];
        this.privateObjectives = [];
        for (const goal of goals) {
            if (this.isOpponentSucceeded(goal)) {
                this.sentSnackBar.push(goal.id);
                const message = `Votre adversaire a complété l'objectif: "${goal.name} lui rapportant un total de ${goal.score}"`;
                this.snackBar.open(message, "D'accord");
            } else if (goal.isGlobal) {
                this.publicObjectives.push(goal);
            } else if (!this.sentSnackBar.includes(goal.id)) {
                this.privateObjectives.push(goal);
            }
        }
    }

    private isOpponentSucceeded(goal: GoalData): boolean {
        return !goal.isGlobal && goal.status === GoalStatus.Failed && !this.sentSnackBar.includes(goal.id);
    }
}
