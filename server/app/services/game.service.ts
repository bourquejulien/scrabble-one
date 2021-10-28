import { Answer, Message, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, SinglePlayerConfig } from '@common';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { Service } from 'typedi';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { generateId } from '@app/classes/id';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { PlayerInfo } from '@app/classes/player-info';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { SocketService } from '@app/services/socket-service';
import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(
        private readonly boardGeneratorService: BoardGeneratorService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly dictionnaryService: DictionaryService,
        private readonly socketService: SocketService,
    ) {
        this.clientMessages = [];
    }

    async startSinglePlayer(gameConfig: SinglePlayerConfig): Promise<ServerConfig> {
        const board = this.boardGeneratorService.generateBoard();
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const boardHandler = new BoardHandler(board, this.boardGeneratorService.generateBoardValidator(board));
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new SocketHandler(this.socketService));

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const virtualPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.virtualPlayerName,
            isHuman: false,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);
        this.addVirtualPlayer(virtualPlayerInfo, sessionHandler);

        sessionHandler.start();

        this.sessionHandlingService.addHandler(sessionHandler);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async startMultiplayer(gameConfig: MultiplayerCreateConfig): Promise<ServerConfig> {
        const board = this.boardGeneratorService.generateBoard();
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const boardHandler = new BoardHandler(board, this.boardGeneratorService.generateBoardValidator(board));
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new SocketHandler(this.socketService));

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);

        this.sessionHandlingService.addHandler(sessionHandler);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async joinMultiplayer(gameConfig: MultiplayerJoinConfig): Promise<ServerConfig | null> {
        const sessionHandler = this.sessionHandlingService.getHandlerBySessionId(gameConfig.sessionId);

        if (sessionHandler == null || sessionHandler.sessionData.isStarted) {
            return null;
        }

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);

        sessionHandler.start();

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async stopGame(id: string): Promise<Answer> {
        return {
            isSuccess: this.sessionHandlingService.removeHandler(id) != null,
            body: '',
        };
    }

    private addHumanPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): HumanPlayer {
        const humanPlayer = new HumanPlayer(playerInfo);
        sessionHandler.addPlayer(humanPlayer);

        return humanPlayer;
    }

    private addVirtualPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): VirtualPlayer {
        const actionCallback = (action: Action): Action | null => action.execute();
        const virtualPlayer = new VirtualPlayer(playerInfo, this.dictionnaryService, actionCallback);

        sessionHandler.addPlayer(virtualPlayer);

        return virtualPlayer;
    }
}
