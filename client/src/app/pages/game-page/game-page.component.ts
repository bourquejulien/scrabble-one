import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { PlayerType } from '@app/classes/player-type';
import { ConfirmQuitDialogComponent } from '@app/components/confirm-quit-dialog/confirm-quit-dialog.component';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';

export enum Icon {
    Logout = 'exit_to_app',
    Message = 'question_answer',
    Skip = 'block',
}

interface ButtonConfig {
    color: string;
    routerLink?: string;
    icon: Icon;
    hover: string;
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
                icon: Icon.Logout,
                hover: 'Quitter la partie',
            },
            {
                color: 'primary',
                icon: Icon.Message,
                hover: 'Ouvrir/Fermer la boite de communication',
            },
            {
                color: 'warn',
                icon: Icon.Skip,
                hover: 'Passer son tour',
            },
        ];
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
            case 2:
                this.gameService.nextTurn();
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
