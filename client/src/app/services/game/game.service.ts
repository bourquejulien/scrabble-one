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
import { MessagingService } from '@app/services/messaging/messaging.service';
import { MessageType } from '@app/classes/message';
import { ReserveService } from '@app/services/reserve/reserve.service';

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
    gameRunning: boolean = false;
    skipTurnNb: number = 0;
    currentTurn: PlayerType = PlayerType.Local;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<void>;
    gameConfig: GameConfig = {
        gameType: '',
        playTime: TimeSpan.fromMinutesSeconds(1, 0),
        firstPlayerName: '',
        secondPlayerName: '',
    };

    constructor(
        private readonly playerService: PlayerService,
        private readonly virtualPlayerService: VirtualPlayerService,
        private readonly messaging: MessagingService,
        private readonly reserveService: ReserveService,
    ) {
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
        playerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
        virtualPlayerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
    }

    startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.currentTurn = this.randomizeTurn();
        this.gameRunning = true;

        this.virtualPlayerService.fillRack();
        this.playerService.fillRack(Constants.RACK_SIZE);
        this.nextTurn();
    }

    reset() {
        this.skipTurnNb = 0;
        this.gameRunning = false;
        this.virtualPlayerService.reset();
        this.playerService.reset();
        this.reserveService.reset();
    }

    nextTurn() {
        if (!this.gameRunning) return;

        this.emptyRackAndReserve();

        this.firstPlayerStats.points = this.playerService.points;
        this.secondPlayerStats.points = this.virtualPlayerService.playerData.score;
        this.firstPlayerStats.rackSize = this.playerService.rack.length;
        this.secondPlayerStats.rackSize = this.virtualPlayerService.playerData.rack.length;

        this.skipTurnLimit();

        if (this.currentTurn === PlayerType.Local) {
            this.onVirtualPlayerTurn();
        } else {
            this.onPlayerTurn();
        }
    }

    playerRackPoint(rack: string[]): number {
        let playerPoint = 0;
        for (const letter of rack) {
            const currentLetterData = letterDefinitions.get(letter.toLowerCase());
            if (currentLetterData?.points === undefined) {
                return -1;
            }
            playerPoint += currentLetterData.points;
        }
        return playerPoint;
    }

    emptyRackAndReserve() {
        if (this.reserveService.length === 0 && (this.playerService.length === 0 || this.virtualPlayerService.playerData.rack.length === 0)) {
            this.endGamePoint();
            if (this.playerService.length === 0) {
                this.playerService.points += this.playerRackPoint(this.virtualPlayerService.playerData.rack);
            } else {
                this.virtualPlayerService.playerData.score += this.playerRackPoint(this.playerService.rack);
            }
            this.gameRunning = false;
            this.gameEnding.next();
        }
    }

    endGamePoint() {
        if (this.firstPlayerStats.points - this.playerRackPoint(this.playerService.rack) < 0) {
            this.playerService.points = 0;
        }
        if (this.secondPlayerStats.points - this.playerRackPoint(this.virtualPlayerService.playerData.rack) < 0) {
            this.virtualPlayerService.playerData.score = 0;
        } else {
            this.firstPlayerStats.points -= this.playerRackPoint(this.playerService.rack);
            this.secondPlayerStats.points -= this.playerRackPoint(this.virtualPlayerService.playerData.rack);
        }
    }

    skipTurnLimit() {
        if (
            this.playerService.skipTurnNb === Constants.MAX_SKIP_TURN &&
            this.virtualPlayerService.playerData.skippedTurns === Constants.MAX_SKIP_TURN
        ) {
            this.playerService.skipTurnNb = 0;
            this.virtualPlayerService.playerData.skippedTurns = 0;
            this.endGamePoint();
            this.gameRunning = false;
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
                this.virtualPlayerService.playerData.rack,
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
