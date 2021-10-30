import { Injectable } from '@angular/core';
// import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { GameType, PlayerStats, ServerConfig, SinglePlayerConfig } from '@common';
import { BehaviorSubject, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '@app/services/session/session.service';
import { PlayerType } from '@app/classes/player/player-type';
import { environmentExt } from '@environmentExt';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

const localUrl = (call: string, id?: string) => `${environmentExt.apiUrl}game/${call}${id ? '/' + id : ''}`;

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

    constructor(
        private readonly playerService: PlayerService,
        // private readonly messaging: MessagingService,
        private readonly httpCLient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly socketService: SocketClientService,
    ) {
        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<void>();
    }

    async startSinglePlayer(config: SinglePlayerConfig): Promise<void> {
        this.sessionService.serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('init/single'), config).toPromise();
        this.socketService.join();

        await this.start();
    }

    async start(): Promise<void> {
        const startId = await this.httpCLient.get<string>(localUrl(`start/${this.sessionService.id}`)).toPromise();

        this.socketService.on('onTurn', (id: string) => {
            this.onNextTurn(id);
        });

        await this.playerService.refresh();
        this.gameRunning = true;
        this.onNextTurn(startId);
    }

    async reset() {
        this.skipTurnNb = 0;
        this.gameRunning = false;
        this.playerService.reset();

        await this.httpCLient.delete(localUrl(`stop/${this.sessionService.id}`)).toPromise();
    }

    emptyRackAndReserve() {
        // if (this.reserveService.length === 0 && (this.playerService.rack.length === 0 || this.virtualPlayerService.playerData.rack.length === 0)) {
        //     this.endGamePoint();
        //
        //     if (this.playerService.rack.length === 0) {
        //         this.playerService.playerData.score += this.playerRackPoint(this.virtualPlayerService.playerData.rack);
        //     } else {
        //         this.virtualPlayerService.playerData.score += this.playerRackPoint(this.playerService.rack);
        //     }
        //
        //     this.gameRunning = false;
        //     this.gameEnding.next();
        // }
    }

    skipTurnLimit() {
        // if (
        //     this.playerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN &&
        //     this.virtualPlayerService.playerData.skippedTurns > Constants.MAX_SKIP_TURN
        // ) {
        //     this.playerService.playerData.skippedTurns = 0;
        //     this.virtualPlayerService.playerData.skippedTurns = 0;
        //     this.endGamePoint();
        //     this.gameRunning = false;
        //     this.gameEnding.next();
        // }
    }

    endGamePoint() {
        // const finalScorePlayer = this.firstPlayerStats.points - this.playerRackPoint(this.playerService.rack);
        // const finalScoreVirtualPlayer = this.secondPlayerStats.points - this.playerRackPoint(this.virtualPlayerService.playerData.rack);
        //
        // this.firstPlayerStats.points = finalScorePlayer;
        // this.secondPlayerStats.points = finalScoreVirtualPlayer;
        //
        // if (finalScorePlayer < 0) {
        //     this.playerService.playerData.score = 0;
        //     this.firstPlayerStats.points = 0;
        // }
        //
        // if (finalScoreVirtualPlayer < 0) {
        //     this.virtualPlayerService.playerData.score = 0;
        //     this.secondPlayerStats.points = 0;
        // }
    }

    // playerRackPoint(rack: string[]): number {
    //     let playerPoint = 0;
    //     for (const letter of rack) {
    //         const currentLetterData = letterDefinitions.get(letter.toLowerCase());
    //         if (currentLetterData?.points === undefined) return -1;
    //         playerPoint += currentLetterData.points;
    //     }
    //     return playerPoint;
    // }

    sendRackInCommunication() {
        // this.messaging.send(
        //     'Fin de partie - lettres restantes',
        //     this.sessionService.gameConfig.firstPlayerName +
        //         ' : ' +
        //         this.playerService.rack +
        //         '\n' +
        //         this.sessionService.gameConfig.secondPlayerName +
        //         ' : ' +
        //         this.virtualPlayerService.playerData.rack,
        //     MessageType.System,
        // );
    }

    private async onNextTurn(id: string): Promise<void> {
        if (!this.gameRunning) return;

        // this.firstPlayerStats.points = this.playerService.playerData.score;
        // this.secondPlayerStats.points = this.virtualPlayerService.playerData.score;
        // this.firstPlayerStats.rackSize = this.playerService.rack.length;
        // this.secondPlayerStats.rackSize = this.virtualPlayerService.playerData.rack.length;

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
