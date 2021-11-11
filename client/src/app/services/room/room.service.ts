import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '@app/constants/global.constants';
import { GameService } from '@app/services/game/game.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { AvailableGameConfig, ConvertConfig, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig } from '@common';
import { environmentExt } from '@environment-ext';
import { Observable, Subject } from 'rxjs';

const localUrl = (base: string, call: string, id?: string) => `${environmentExt.apiUrl}${base}/${call}${id ? '/' + id : ''}`;

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    private readonly joinedSubject: Subject<ServerConfig>;
    private readonly roomSubject: Subject<AvailableGameConfig[]>;

    private pendingRoomId: string;

    constructor(private socketService: SocketClientService, private readonly gameService: GameService, private readonly httpCLient: HttpClient) {
        this.joinedSubject = new Subject<ServerConfig>();
        this.roomSubject = new Subject<AvailableGameConfig[]>();

        this.pendingRoomId = '';

        this.socketService.on('availableRooms', (rooms: AvailableGameConfig[]) => this.roomSubject.next(rooms));
        this.socketService.on('onJoin', async (serverConfig: ServerConfig) => this.onTurn(serverConfig));
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

        this.socketService.reset();
        this.pendingRoomId = '';
    }

    async toSinglePlayer(): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        const config: ConvertConfig = {
            id: this.pendingRoomId,
            virtualPlayerName: Constants.BOT_NAMES[Math.floor(Constants.BOT_NAMES.length * Math.random())],
            gameHadBegun: false,
        };

        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'convert'), config).toPromise();
        await this.onTurn(serverConfig);
    }

    async join(joinConfig: MultiplayerJoinConfig): Promise<boolean> {
        const serverConfig = await this.httpCLient.put<ServerConfig>(localUrl('game', 'join'), joinConfig).toPromise();
        await this.gameService.start(serverConfig);
        return true;
    }

    refresh(): void {
        this.socketService.send('getRooms');
    }

    get onAvailable(): Observable<AvailableGameConfig[]> {
        return this.roomSubject.asObservable();
    }

    get onGameFull(): Observable<ServerConfig> {
        return this.joinedSubject.asObservable();
    }

    private async onTurn(serverConfig: ServerConfig): Promise<void> {
        if (this.pendingRoomId === '') {
            return;
        }

        await this.gameService.start(serverConfig);
        this.joinedSubject.next(serverConfig);
        this.pendingRoomId = '';
    }
}
