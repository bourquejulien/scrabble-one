import { Component, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { NavigationStart, Router } from '@angular/router';
import { ConfirmQuitDialogComponent } from '@app/components/confirm-quit-dialog/confirm-quit-dialog.component';
import { EndGameComponent } from '@app/components/end-game/end-game.component';
import { GameService } from '@app/services/game/game.service';
import { TimerService } from '@app/services/timer/timer.service';
import { PlayerType } from '@common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
export class GamePageComponent implements OnDestroy {
    @ViewChild('drawer', { static: true }) drawer: MatDrawer;

    gameService: GameService;
    timerService: TimerService;
    playerType: PlayerType;
    buttonConfig: ButtonConfig[] = [];
    iconList: string[];
    isOpen: boolean = true;
    route: Router;
    private readonly pageChange: Subscription;

    private onTurnSubscription: Subscription;
    private gameEndingSubscription: Subscription;

    constructor(gameService: GameService, timerService: TimerService, public dialog: MatDialog, router: Router) {
        this.route = router;
        this.gameService = gameService;
        this.playerType = gameService.onTurn.getValue();
        this.timerService = timerService;
        this.buttonConfig = [
            {
                color: 'warn',
                icon: Icon.Logout,
                hover: 'Quitter la partie',
                routerLink: '/',
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

        this.gameEndingSubscription = gameService.gameEnding.subscribe(() => this.endGame());
        this.onTurnSubscription = gameService.onTurn.subscribe((e) => (this.playerType = e));

        this.pageChange = router.events.pipe(filter((event): event is NavigationStart => event instanceof NavigationStart)).subscribe(() => {
            this.confirmQuit();
        });
    }

    ngOnDestroy(): void {
        this.gameEndingSubscription.unsubscribe();
        this.onTurnSubscription.unsubscribe();
        this.pageChange.unsubscribe();
    }

    toggleDrawer(): void {
        this.drawer.toggle();
        this.isOpen = !this.isOpen;
    }

    callFunction(buttonIndex: number): void {
        switch (buttonIndex) {
            case 1:
                this.toggleDrawer();
                break;
            case 2:
                this.gameService.skipTurn();
                break;
        }
    }

    confirmQuit(): void {
        const dialogRef = this.dialog.open(ConfirmQuitDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.route.navigate(['home']);
                this.gameService.reset();
                return;
            }
            this.route.navigate(['game']);
        });
    }

    endGame() {
        this.gameService.sendRackInCommunication();
        const dialogRef = this.dialog.open(EndGameComponent);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.gameService.reset();
            }
        });
    }
}
