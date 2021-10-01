import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { PlayerType } from '@app/classes/player-type';
import { PlayerStats } from '@app/classes/player/player-stats';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { letterDefinitions } from '@app/classes/letter';
import { MatDialog } from '@angular/material/dialog';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { MessageType } from '@app/classes/message';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    firstPlayerStats: PlayerStats = {
        points: 0,
        rackSize: 0,
    };
    secondPlayerStats: PlayerStats = {
        points: 0,
        rackSize: 0,
    };
    endGame: boolean = false;
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
        private readonly messaging: MessagingService,
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
        this.skipTurnNb = 0;
        this.playerService.skipTurnNb = 0;
        this.virtualPlayerService.skipTurnNb = 0;
        this.virtualPlayerService.points = 0;
        this.playerService.points = 0;
        this.endGame = false;
        this.playerService.emptyRack();
        this.virtualPlayerService.emptyRack();
        this.playerService.resetReserveNewGame();
        this.playerService.resetBoard();
    }

    nextTurn() {
        if (!this.endGame) {
            this.emptyRackAndReserve();
            this.skipTurnLimit();
            this.firstPlayerStats.points = this.playerService.points;
            this.secondPlayerStats.points = this.virtualPlayerService.points;
            this.firstPlayerStats.rackSize = this.playerService.rack.length;
            this.secondPlayerStats.rackSize = this.virtualPlayerService.rack.length;
            // TODO Use an interface for services
            if (this.currentTurn === PlayerType.Local) {
                this.onVirtualPlayerTurn();
            } else {
                this.onPlayerTurn();
            }
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
        if (this.playerService.reserveContent() === 0 && (this.playerService.length === 0 || this.virtualPlayerService.length === 0)) {
            this.endGamePoint();
            if (this.playerService.length === 0) {
                this.playerService.points += this.playerRackPoint(this.virtualPlayerService.rack);
            } else {
                this.virtualPlayerService.points += this.playerRackPoint(this.playerService.rack);
            }
            this.endGame = true;
            this.gameEnding.next();
        }
    }

    endGamePoint() {
        if (this.firstPlayerStats.points - this.playerRackPoint(this.playerService.rack) < 0) {
            this.playerService.points = 0;
        }
        if (this.secondPlayerStats.points - this.playerRackPoint(this.virtualPlayerService.rack) < 0) {
            this.virtualPlayerService.points = 0;
        } else {
            this.firstPlayerStats.points -= this.playerRackPoint(this.playerService.rack);
            this.secondPlayerStats.points -= this.playerRackPoint(this.virtualPlayerService.rack);
        }
    }

    skipTurnLimit() {
        if (this.playerService.skipTurnNb === Constants.MAX_SKIP_TURN && this.virtualPlayerService.skipTurnNb === Constants.MAX_SKIP_TURN) {
            this.playerService.skipTurnNb = 0;
            this.virtualPlayerService.skipTurnNb = 0;
            this.endGamePoint();
            this.endGame = true;
            this.gameEnding.next();
        }
    }

    skipTurn() {
        if (this.playerService.skipTurnNb < 3) {
            this.playerService.skipTurnNb++;
        }
        this.nextTurn();
    }

    sendRackInCommunication() {
        this.messaging.send(
            'Fin de partie - lettres restantes',
            this.gameConfig.firstPlayerName +
                ' : ' +
                this.playerService.rack +
                ' ' +
                this.gameConfig.secondPlayerName +
                ' : ' +
                this.virtualPlayerService.rack,
            MessageType.System,
        );
    }

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
