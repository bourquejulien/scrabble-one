import { Injectable } from '@angular/core';
import { GameConfig } from '@app/classes/game-config';
import { letterDefinitions } from '@common';
import { MessageType } from '@app/classes/message';
import { PlayerType } from '@app/classes/player-type';
import { PlayerStats } from '@app/classes/player/player-stats';
import { TimeSpan } from '@app/classes/time/timespan';
import { Constants } from '@app/constants/global.constants';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '@environment';
import { HttpClient } from '@angular/common/http';

const localUrl = (call: string, id?: string) => `${environment.serverUrl}/game${call}${id ? '/' + id : ''}`;

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
        private readonly httpCLient: HttpClient,
    ) {
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
        playerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
        virtualPlayerService.turnComplete.subscribe((e) => this.handleTurnCompletion(e));
    }

    private static randomizeTurn(): PlayerType {
        const HALF = 0.5;
        return Math.random() < HALF ? PlayerType.Local : PlayerType.Virtual;
    }

    async startGame(gameConfig: GameConfig) {
        this.gameConfig = gameConfig;
        this.currentTurn = GameService.randomizeTurn();
        this.gameRunning = true;

        await this.httpCLient.put(localUrl('start'), { playerInfo: [] });

        this.playerService.fillRack(Constants.RACK_SIZE);
        this.nextTurn();
    }

    async reset() {
        this.skipTurnNb = 0;
        this.gameRunning = false;
        this.virtualPlayerService.reset();
        this.playerService.reset();
        this.reserveService.reset();

        await this.httpCLient.delete(localUrl('end'));
    }

    nextTurn() {
        if (!this.gameRunning) return;

        this.firstPlayerStats.points = this.playerService.playerData.score;
        this.secondPlayerStats.points = this.virtualPlayerService.playerData.score;
        this.firstPlayerStats.rackSize = this.playerService.playerData.rack.length;
        this.secondPlayerStats.rackSize = this.virtualPlayerService.playerData.rack.length;

        this.emptyRackAndReserve();
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
            if (currentLetterData?.points === undefined) return -1;
            playerPoint += currentLetterData.points;
        }
        return playerPoint;
    }

    emptyRackAndReserve() {
        if (
            this.reserveService.length === 0 &&
            (this.playerService.playerData.rack.length === 0 || this.virtualPlayerService.playerData.rack.length === 0)
        ) {
            this.endGamePoint();

            if (this.playerService.playerData.rack.length === 0) {
                this.playerService.playerData.score += this.playerRackPoint(this.virtualPlayerService.playerData.rack);
            } else {
                this.virtualPlayerService.playerData.score += this.playerRackPoint(this.playerService.playerData.rack);
            }

            this.gameRunning = false;
            this.gameEnding.next();
        }
    }

    endGamePoint() {
        const finalScorePlayer = this.firstPlayerStats.points - this.playerRackPoint(this.playerService.playerData.rack);
        const finalScoreVirtualPlayer = this.secondPlayerStats.points - this.playerRackPoint(this.virtualPlayerService.playerData.rack);

        this.firstPlayerStats.points = finalScorePlayer;
        this.secondPlayerStats.points = finalScoreVirtualPlayer;

        if (finalScorePlayer < 0) {
            this.playerService.playerData.score = 0;
            this.firstPlayerStats.points = 0;
        }

        if (finalScoreVirtualPlayer < 0) {
            this.virtualPlayerService.playerData.score = 0;
            this.secondPlayerStats.points = 0;
        }
    }

    skipTurnLimit() {
        if (
            this.playerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN &&
            this.virtualPlayerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN
        ) {
            this.playerService.playerData.skippedTurns = 0;
            this.virtualPlayerService.playerData.skippedTurns = 0;
            this.endGamePoint();
            this.gameRunning = false;
            this.gameEnding.next();
        }
    }

    skipTurn() {
        if (this.playerService.playerData.skippedTurns < 3) {
            this.playerService.playerData.skippedTurns++;
        }

        this.nextTurn();
    }

    sendRackInCommunication() {
        this.messaging.send(
            'Fin de partie - lettres restantes',
            this.gameConfig.firstPlayerName +
                ' : ' +
                this.playerService.playerData.rack +
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
        this.virtualPlayerService.startTurn(this.gameConfig.playTime);
    }
}
