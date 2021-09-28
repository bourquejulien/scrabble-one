import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { PlayerType } from '@app/classes/player-type';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer-service/timer.service';
import { ConfirmQuitDialog } from './confirm-quit-dialog/confirm-quit-dialog';

interface ButtonConfig {
    color: string,
    class: string,
    routerLink?: string,
    click?: void,
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

    functionMap = new Map<string, void>([
        ['confirmQuit', this.confirmQuit()],
        ['toggleDrawer', this.toggleDrawer()]
    ]);

    constructor(gameService: GameService, timerService: TimerService, public dialog: MatDialog) {
        this.gameService = gameService;
        this.playerType = gameService.onTurn.getValue();
        this.timerService = timerService;
        gameService.onTurn.subscribe((e) => (this.playerType = e));
        //this.functionMap.set('confirmQuit', this.confirmQuit()).set('toggleDrawer', this.toggleDrawer());

        this.iconList = ['home', 'question_answer', 'logout', 'autorenew', 'settings'];
    }

    toggleDrawer() {
        console.log('entered toggle function');
        this.drawer.toggle();
    }

    confirmQuit(): void {
        const dialogRef = this.dialog.open(ConfirmQuitDialog);

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
            if (result === true) {
                // TODO: call endGame  
            }
        });

    }
}