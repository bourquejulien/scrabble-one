import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { PlayerType } from '@app/classes/player-type';
import { ConfirmQuitDialogComponent } from '@app/components/confirm-quit-dialog/confirm-quit-dialog.component';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer-service/timer.service';

interface ButtonConfig {
    color: string;
    routerLink?: string;
}

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    @ViewChild('drawer', { static: true }) drawer: MatDrawer;

    gameService: GameService;
    timerService: TimerService;
    playerType: PlayerType;
    buttonConfig: ButtonConfig[] = [];
    iconList: string[];

    constructor(gameService: GameService, timerService: TimerService, public dialog: MatDialog) {
        this.gameService = gameService;
        this.playerType = gameService.onTurn.getValue();
        this.timerService = timerService;
        this.buttonConfig = [
            {
                color: 'warn',
                routerLink: '/',
            },
            {
                color: 'primary',
            },
            {
                color: 'warn',
            },
            {
                color: 'primary',
            },
            {
                color: 'warn',
            },
        ];
        this.iconList = ['home', 'question_answer', 'logout', 'autorenew', 'settings'];

        gameService.onTurn.subscribe((e) => (this.playerType = e));
    }

    toggleDrawer() {
        this.drawer.toggle();
    }

    callFunction(buttonIndex: number): void {
        switch (buttonIndex) {
            case 0:
                this.confirmQuit();
                break;
            case 1:
                this.toggleDrawer();
                break;
            default:
                break;
        }
    }

    confirmQuit(): void {
        const dialogRef = this.dialog.open(ConfirmQuitDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                // TODO: call endGame
            }
        });
    }
}
