import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EndGameWinner } from '@app/classes/end-game-winner';
import { PlayerType } from '@app/classes/player/player-type';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { PlayerService } from '@app/services/player/player.service';
import { RackService } from '@app/services/rack/rack.service';
import { SessionService } from '@app/services/session/session.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GameType, MessageType, ServerConfig, SessionStats, SinglePlayerConfig } from '@common';
import { environmentExt } from '@environment-ext';
import { BehaviorSubject, Subject } from 'rxjs';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    stats: SessionStats;
    currentTurn: PlayerType;
    onTurn: BehaviorSubject<PlayerType>;
    gameEnding: Subject<EndGameWinner>;
    opponentQuiting: Subject<boolean>;

    private gameRunning: boolean;

    constructor(
        private readonly playerService: PlayerService,
        private httpCLient: HttpClient,
        private readonly sessionService: SessionService,
        private readonly rackService: RackService,
        private readonly socketService: SocketClientService,
        private readonly messagingService: MessagingService,
    ) {
        this.stats = {
            localStats: { points: 0, rackSize: 0 },
            remoteStats: { points: 0, rackSize: 0 },
        };

        this.onTurn = new BehaviorSubject<PlayerType>(PlayerType.Local);
        this.gameEnding = new Subject<EndGameWinner>();
        this.opponentQuiting = new Subject<boolean>();
        this.socketService.on('opponentQuit', () => this.opponentQuiting.next(true));
        this.socketService.on('onTurn', async (id: string) => this.onNextTurn(id));
        this.socketService.on('endGame', async (winnerId: string) => this.endGame(winnerId));
        this.socketService.on('stats', (sessionStats: SessionStats) => this.refresh(sessionStats));
        this.currentTurn = PlayerType.Local;
        this.gameRunning = false;
    }

    async startSinglePlayer(config: SinglePlayerConfig): Promise<void> {
        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'init/single'), config).toPromise();
        this.socketService.join(serverConfig.id);
        await this.start(serverConfig);
    }

    async start(serverConfig: ServerConfig): Promise<void> {
        this.sessionService.serverConfig = serverConfig;
        this.gameRunning = true;
        this.onNextTurn(serverConfig.startId);
    }

    async reset() {
        this.gameRunning = false;
        this.playerService.reset();
        this.socketService.reset();
    }

    private async onNextTurn(id: string): Promise<void> {
        if (!this.gameRunning) return;

        let playerType: PlayerType;

        if (id === this.sessionService.id) {
            playerType = PlayerType.Local;
        } else {
            playerType = this.sessionService.gameConfig.gameType === GameType.SinglePlayer ? PlayerType.Virtual : PlayerType.Remote;
        }

        if (this.currentTurn === playerType) {
            return;
        }

        this.currentTurn = playerType;
        this.onTurn.next(this.currentTurn);
    }

    private async endGame(winnerId: string) {
        let winner: EndGameWinner;

        if (winnerId === '') {
            winner = EndGameWinner.Draw;
        } else {
            winner = winnerId === this.sessionService.id ? EndGameWinner.Local : EndGameWinner.Remote;
        }

        this.gameEnding.next(winner);

        this.messagingService.send(
            'Fin de partie - lettres restantes',
            this.sessionService.gameConfig.firstPlayerName + ' : ' + this.rackService.rack,
            MessageType.System,
        );
    }

    private refresh(sessionStats: SessionStats): void {
        this.stats = sessionStats;
    }
}
