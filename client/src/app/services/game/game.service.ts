import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PlayerStats } from '@app/classes/player/player-stats';
import { PlayerType } from '@app/classes/player/player-type';
import { Constants } from '@app/constants/global.constants';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { GameType, LETTER_DEFINITIONS, MessageType, ServerConfig, SinglePlayerConfig } from '@common';
import { environmentExt } from '@environmentExt';
import { BehaviorSubject, Subject } from 'rxjs';

const localUrl = (call: string, id?: string) => `${environmentExt.apiUrl}game/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    firstPlayerStats: PlayerStats;
    secondPlayerStats: PlayerStats;
    gameRunning: boolean;
    skipTurnNb: number;
    currentTurn: PlayerType;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<void>;

    constructor(
        private readonly playerService: PlayerService,
        private readonly virtualPlayerService: VirtualPlayerService,
        private readonly reserveService: ReserveService,
        private readonly messaging: MessagingService,
        private readonly httpCLient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly socketService: SocketClientService,
    ) {
        this.firstPlayerStats = {
            points: 0,
            rackSize: 0,
        };
        this.secondPlayerStats = {
            points: 0,
            rackSize: 0,
        };
        this.gameRunning = false;
        this.skipTurnNb = 0;
        this.currentTurn = PlayerType.Local;
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
    }

    private static randomizeTurn(): PlayerType {
        const HALF = 0.5;
        return Math.random() < HALF ? PlayerType.Local : PlayerType.Virtual;
    }

    async startSinglePlayer(config: SinglePlayerConfig) {
        this.sessionService.serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('init/single'), config).toPromise();
        this.socketService.join();

        const startId = await this.httpCLient.get<string>(localUrl(`start/${this.sessionService.id}`)).toPromise();

        this.handleTurnCompletion();

        await this.startGame();
        this.onNextTurn(startId);
    }

    async startGame() {
        await this.playerService.refresh();

        this.currentTurn = GameService.randomizeTurn();
        this.gameRunning = true;
    }

    async reset() {
        this.skipTurnNb = 0;
        this.gameRunning = false;
        this.virtualPlayerService.reset();
        this.playerService.reset();

        await this.httpCLient.delete(localUrl(`stop/${this.sessionService.id}`)).toPromise();
    }

    emptyRackAndReserve() {
        const isReserveEmpty = this.reserveService.length === 0;
        const isRackEmpty = this.playerService.rack.length === 0;
        const isVirtualRackEmpty = this.virtualPlayerService.playerData.rack.length === 0;

        if (isReserveEmpty && (isRackEmpty || isVirtualRackEmpty)) {
            this.endGamePoint();

            if (isRackEmpty) {
                this.playerService.playerData.score += this.playerRackPoint(this.virtualPlayerService.playerData.rack);
            } else {
                this.virtualPlayerService.playerData.score += this.playerRackPoint(this.playerService.rack);
            }

            this.gameRunning = false;
            this.gameEnding.next();
        }
    }

    sendRackInCommunication() {
        this.messaging.send(
            'Fin de partie - lettres restantes',
            this.sessionService.gameConfig.firstPlayerName +
                ' : ' +
                this.playerService.rack +
                '\n' +
                this.sessionService.gameConfig.secondPlayerName +
                ' : ' +
                this.virtualPlayerService.playerData.rack,
            MessageType.System,
        );
    }

    private playerRackPoint(rack: string[]): number {
        let playerPoint = 0;
        for (const letter of rack) {
            const currentLetterData = LETTER_DEFINITIONS.get(letter.toLowerCase());

            if (currentLetterData?.points === undefined) {
                return -1;
            }

            playerPoint += currentLetterData.points;
        }
        return playerPoint;
    }

    private endGamePoint() {
        const finalScorePlayer = this.firstPlayerStats.points - this.playerRackPoint(this.playerService.rack);
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

    private skipTurnLimit() {
        const isPlayerSkipMaxTurns = this.playerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN;
        const isVirtualSkipMaxTurns = this.virtualPlayerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN;

        if (isPlayerSkipMaxTurns && isVirtualSkipMaxTurns) {
            this.playerService.playerData.skippedTurns = 0;
            this.virtualPlayerService.playerData.skippedTurns = 0;
            this.endGamePoint();
            this.gameRunning = false;
            this.gameEnding.next();
        }
    }

    private handleTurnCompletion() {
        this.socketService.socketClient.on('onTurn', (id: string) => {
            this.onNextTurn(id);
        });
    }

    private async onNextTurn(id: string): Promise<void> {
        if (!this.gameRunning) return;

        this.firstPlayerStats.points = this.playerService.playerData.score;
        this.secondPlayerStats.points = this.virtualPlayerService.playerData.score;
        this.firstPlayerStats.rackSize = this.playerService.rack.length;
        this.secondPlayerStats.rackSize = this.virtualPlayerService.playerData.rack.length;

        this.emptyRackAndReserve();
        this.skipTurnLimit();

        let playerType: PlayerType;

        if (id === this.sessionService.id) {
            playerType = PlayerType.Local;
        } else {
            playerType = this.sessionService.gameConfig.gameType === GameType.SinglePlayer ? PlayerType.Virtual : PlayerType.Remote;
        }

        if (this.currentTurn === playerType) {
            return;
        }

        await this.playerService.refresh();

        this.currentTurn = playerType;
        this.onTurn.next(this.currentTurn);
    }
}
