import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { JoinServerConfig, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, SinglePlayerConvertConfig } from '@common';
import { environmentExt } from '@environmentExt';
import { HttpClient } from '@angular/common/http';
import { GameService } from '@app/services/game/game.service';
import { Observable, Subject } from 'rxjs';
import { Constants } from '@app/constants/global.constants';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private availableRooms: string[];
    private readonly hasJoined: Subject<JoinServerConfig>;

    private pendingRoomId: string;

    constructor(
        private readonly socketService: SocketClientService,
        private readonly gameService: GameService,
        private readonly httpCLient: HttpClient,
    ) {
        this.availableRooms = [];
        this.hasJoined = new Subject<JoinServerConfig>();
        this.pendingRoomId = '';

        this.socketService.on('availableRooms', (rooms: string[]) => (this.availableRooms = rooms));
        this.socketService.on('onJoin', async (joinServerConfig: JoinServerConfig) => this.onTurn(joinServerConfig));
    }

    init(): void {
        this.pendingRoomId = '';
    }

    async create(createConfig: MultiplayerCreateConfig): Promise<void> {
        const id = await this.httpCLient.put<string>(localUrl('game', 'init/multi'), createConfig).toPromise();
        this.socketService.join(id);

        this.pendingRoomId = id;
    }

    async abort(): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        await this.httpCLient.delete<string>(localUrl('game', 'stop', this.pendingRoomId)).toPromise();

        this.socketService.reset();
        this.pendingRoomId = '';
    }

    async toSinglePlayer(): Promise<void> {
        if (this.pendingRoomId == null) {
            return;
        }

        const config: SinglePlayerConvertConfig = {
            id: this.pendingRoomId,
            name: Constants.BOT_NAMES[Math.floor(Constants.BOT_NAMES.length * Math.random())],
        };

        const joinServerConfig = await this.httpCLient.put<JoinServerConfig>(localUrl('game', 'convert'), config).toPromise();
        await this.onTurn(joinServerConfig);
    }

    async join(id: string): Promise<void> {
        const joinConfig: MultiplayerJoinConfig = {
            sessionId: id,
            playerName: 'test', // TODO
        };

        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'join'), joinConfig).toPromise();
        this.socketService.join(serverConfig.id);
        const startId = await this.httpCLient.get<string>(localUrl('game', 'start', serverConfig.id)).toPromise();

        await this.gameService.start(serverConfig, startId);
    }

    refresh(): void {
        this.socketService.send('getRooms');
    }

    get rooms(): string[] {
        return this.availableRooms;
    }

    get onGameFull(): Observable<JoinServerConfig> {
        return this.hasJoined.asObservable();
    }

    private async onTurn(joinServerConfig: JoinServerConfig): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        await this.gameService.start(joinServerConfig.serverConfig, joinServerConfig.startId);
        this.hasJoined.next(joinServerConfig);
        this.pendingRoomId = '';
    }
}
