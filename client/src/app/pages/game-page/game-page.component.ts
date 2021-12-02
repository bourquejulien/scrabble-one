import { LocationStrategy } from '@angular/common';
import { Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { EndGameWinner } from '@app/classes/end-game-winner';
import { PlayerType } from '@app/classes/player/player-type';
import { ConfirmQuitDialogComponent } from '@app/components/confirm-quit-dialog/confirm-quit-dialog.component';
import { EndGameComponent } from '@app/components/end-game/end-game.component';
import { OpponentQuitComponent } from '@app/components/opponent-quit/opponent-quit.component';
import { CommandsService } from '@app/services/commands/commands.service';
import { GameService } from '@app/services/game/game.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { GameMode } from '@common';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { Subscription } from 'rxjs';

export enum Icon {
    Logout = 'exit_to_app',
    Message = 'question_answer',
    Skip = 'cached',
    Dark = 'dark_mode',
}

interface ButtonConfig {
    color: string;
    icon: Icon;
    hover: string;
    action: () => void;
}

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnDestroy {
    @ViewChild('drawer', { static: true }) drawer: MatDrawer;
    @HostBinding('class') cssClassName = '';
    playerType: PlayerType;
    buttonConfig: ButtonConfig[];
    iconList: string[];
    isOpen: boolean;

    private onTurnSubscription: Subscription;
    private gameEndingSubscription: Subscription;
    private opponentQuitSubscription: Subscription;
    constructor(
        readonly gameService: GameService,
        readonly sessionService: SessionService,
        readonly reserveService: ReserveService,
        readonly commandService: CommandsService,
        readonly socketClientService: SocketClientService,
        private readonly dialog: MatDialog,
        private readonly router: Router,
        location: LocationStrategy,
        elementRef: ElementRef,
    ) {
        this.isOpen = true;
        // Overrides back button behavior
        // Reference: https://stackoverflow.com/a/56354475
        history.pushState(null, '', window.location.href);
        location.onPopState(() => {
            if (elementRef.nativeElement.offsetParent != null) {
                this.confirmQuit();
                history.pushState(null, '', window.location.href);
            }
        });

        this.playerType = gameService.onTurn.getValue();
        this.buttonConfig = [
            {
                color: 'primary',
                icon: Icon.Dark,
                hover: 'Activer le mode sombre',
                action: () => this.toggleDarkMode(),
            },
            {
                color: 'accent',
                icon: Icon.Logout,
                hover: 'Quitter la partie',
                action: () => this.confirmQuit(),
            },
            {
                color: 'primary',
                icon: Icon.Message,
                hover: 'Ouvrir/Fermer la boite de communication',
                action: () => this.toggleDrawer(),
            },
            {
                color: 'warn',
                icon: Icon.Skip,
                hover: 'Passer son tour',
                action: async () => this.commandService.parseInput('!passer'),
            },
        ];
        this.opponentQuitSubscription = gameService.opponentQuiting.subscribe(() => this.opponentQuit());
        this.gameEndingSubscription = gameService.gameEnding.subscribe((winner) => this.endGame(winner));
        this.onTurnSubscription = gameService.onTurn.subscribe((e) => (this.playerType = e));
    }

    ngOnDestroy(): void {
        this.gameEndingSubscription.unsubscribe();
        this.onTurnSubscription.unsubscribe();
        this.opponentQuitSubscription.unsubscribe();
    }

    toggleDrawer(): void {
        this.drawer.toggle();
        this.isOpen = !this.isOpen;
    }

    toggleDarkMode(): void {
        const darkMode = 'darkMode';
        if (this.cssClassName === darkMode) {
            this.cssClassName = '';
        } else {
            this.cssClassName = 'darkMode';
        }
    }

    endGame(winner: EndGameWinner) {
        const dialogRef = this.dialog.open(EndGameComponent, { panelClass: 'end-game-dialog', data: { winner } });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.gameService.reset();
            }
        });
    }

    opponentQuit() {
        this.dialog.open(OpponentQuitComponent);
    }

    private confirmQuit(): void {
        const dialogRef = this.dialog.open(ConfirmQuitDialogComponent);

        dialogRef.afterClosed().subscribe((result) => {
            if (!result) {
                return;
            }
            this.gameService.reset();
            this.router.navigate(['home']);
        });
    }

    get gameMode(): typeof GameMode {
        return GameMode;
    }
}
