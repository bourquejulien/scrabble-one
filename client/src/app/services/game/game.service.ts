import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { letterDefinitions } from '@app/classes/letter';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    firstPlayerPoints: number = 0;
    secondPlayerPoints: number = 0;
    skipTurnNb: number = 0;
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<void>;
    gameConfig: GameConfig = {
        gameType: '',
        playTime: TimeSpan.fromSeconds(0),
        firstPlayerName: '',
        secondPlayerName: '',
    };

    constructor(
        private readonly playerService: PlayerService,
        private readonly virtualPlayerService: VirtualPlayerService,
        public dialog: MatDialog,
    ) {
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
        playerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
        virtualPlayerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
    }

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.currentTurn = this.randomizeTurn();

        this.virtualPlayerService.fillRack();
        this.playerService.fillRack(Constants.MIN_SIZE);
        this.nextTurn();
    }

    resetGame() {
        this.virtualPlayerService.points = 0;
        this.playerService.points = 0;
        this.playerService.emptyRack();
        this.virtualPlayerService.emptyRack();
        this.playerService.resetReserveNewGame();
        this.playerService.resetBoard();
    }

    nextTurn() {
        this.emptyRackAndReserve();
        this.skipTurnLimit();
        this.firstPlayerPoints = this.playerService.points;
        this.secondPlayerPoints = this.virtualPlayerService.points;
        // TODO Use an interface for services
        if (this.currentTurn === PlayerType.Local) {
            this.onVirtualPlayerTurn();
        } else {
            this.onPlayerTurn();
        }
    }

    playerRackPoint(rack: string[]): number {
        let playerPoint = 0;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < rack.length; i++) {
            const letter = rack[i];
            const currentLetterData = letterDefinitions.get(letter.toLowerCase());
            if (currentLetterData?.points === undefined) {
                return -1;
            }
            playerPoint += currentLetterData.points;
        }
        return playerPoint;
    }

    emptyRackAndReserve() {
        if (this.playerService.reserveContent() === 0 && this.playerService.length === 0 && this.virtualPlayerService.length === 0) {
            this.gameEnding.next();
        }
    }

    skipTurnLimit() {
        if (this.playerService.skipTurnNb + this.virtualPlayerService.skipTurnNb === Constants.MAX_SKIP_TURN) {
            this.gameEnding.next();
        }
    }

    // endGame() {
    //     const dialogRef = this.dialog.open(EndGameComponent);
    //     dialogRef.afterClosed().subscribe((result) => {
    //         if (result === true) {
    //             this.resetGame();
    //         }
    //     });
    // }

    private handleTurnCompletion(playerType: PlayerType) {
        if (playerType !== this.currentTurn) {
            return;
        }

        this.nextTurn();
    }

    private onPlayerTurn() {
        this.currentTurn = PlayerType.Local;
        this.onTurn.next(this.currentTurn);
        this.playerService.startTurn(this.gameConfig.playTime);
    }

    private onVirtualPlayerTurn() {
        this.currentTurn = PlayerType.Virtual;
        this.onTurn.next(this.currentTurn);
        this.virtualPlayerService.startTurn();
    }

    private randomizeTurn(): PlayerType {
        const HALF = 0.5;
        return Math.random() < HALF ? PlayerType.Local : PlayerType.Virtual;
    }
}
