import { generateId } from '@app/classes/id';
import { Service } from 'typedi';
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { PlayerInfo } from '@app/classes/player-info';
import { HumanPlayer } from '@app/classes/player/human-player/human-player';
import { Action } from '@app/classes/player/virtual-player/actions/action';
import { VirtualPlayer } from '@app/classes/player/virtual-player/virtual-player';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { SessionHandlingService } from '@app/services/sessionHandling/session-handling.service';
import { SocketService } from '@app/services/socket/socket-service';
import { ConvertConfig, GameType, MultiplayerCreateConfig, MultiplayerJoinConfig, ServerConfig, SinglePlayerConfig } from '@common';
import { VirtualPlayerExpert } from '@app/classes/player/virtual-player/virtual-player-expert/virtual-player-expert';
import * as logger from 'winston';
import { PlayerHandler } from '@app/handlers/player-handler/player-handler';
import { DictionaryService } from '@app/services/dictionary/dictionary.service';
import { DictionaryHandler } from '@app/handlers/dictionary-handler/dictionary-handler';

@Service()
export class GameService {
    constructor(
        private readonly boardGeneratorService: BoardGeneratorService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly dictionaryService: DictionaryService,
        private readonly socketService: SocketService,
    ) {}

    async initSinglePlayer(gameConfig: SinglePlayerConfig): Promise<ServerConfig> {
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };
        const words = this.dictionaryService.getWords(gameConfig.dictionary);
        const dictionaryHandler = new DictionaryHandler(words);
        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus, dictionaryHandler);
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), this.socketService);

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
        this.sessionHandlingService.addHandler(sessionHandler);

        sessionHandler.start();

        logger.info(`Single player game: ${sessionHandler.sessionInfo.id} initialised`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async initMultiplayer(gameConfig: MultiplayerCreateConfig): Promise<string> {
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const words = this.dictionaryService.getWords(gameConfig.dictionary);
        const dictionaryHandler = new DictionaryHandler(words);
        const boardHandler = this.boardGeneratorService.generateBoardHandler(gameConfig.isRandomBonus, dictionaryHandler);
        const reserveHandler = new ReserveHandler();

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, new PlayerHandler(), this.socketService);

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);

        this.sessionHandlingService.addHandler(sessionHandler);

        logger.info(`Multiplayer game: ${sessionHandler.sessionInfo.id} initialised`);

        return humanPlayer.id;
    }

    async joinMultiplayer(gameConfig: MultiplayerJoinConfig): Promise<ServerConfig | null> {
        const sessionHandler = this.sessionHandlingService.getHandlerBySessionId(gameConfig.sessionId);
        const waitingPlayer = sessionHandler?.players[0];

        if (sessionHandler == null || waitingPlayer == null || sessionHandler.sessionData.isStarted) {
            return null;
        }

        const humanPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        const humanPlayer = this.addHumanPlayer(humanPlayerInfo, sessionHandler);
        this.sessionHandlingService.updateEntries(sessionHandler);
        sessionHandler.start();

        this.socketService.send('onJoin', sessionHandler.sessionInfo.id, sessionHandler.getServerConfig(waitingPlayer.id));

        logger.info(`Multiplayer game: ${sessionHandler.sessionInfo.id} joined by ${humanPlayerInfo.id}`);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async convert(convertConfig: ConvertConfig): Promise<ServerConfig | null> {
        const handler = this.sessionHandlingService.getHandlerByPlayerId(convertConfig.id);

        if (handler == null || handler.sessionData.isStarted || handler.sessionInfo.gameType !== GameType.Multiplayer) {
            logger.warn(`Cannot convert game to single player mode - playerId: ${convertConfig.id}`);
            return null;
        }

        const virtualPlayerInfo: PlayerInfo = {
            id: generateId(),
            name: convertConfig.virtualPlayerName,
            isHuman: false,
        };

        handler.sessionInfo.gameType = GameType.SinglePlayer;
        this.addVirtualPlayer(virtualPlayerInfo, handler);
        this.sessionHandlingService.updateEntries(handler);

        handler.start();

        logger.info(`Game converted: ${handler.sessionInfo.id}`);

        return handler.getServerConfig(convertConfig.id);
    }

    async abandon(id: string): Promise<boolean> {
        const handler = this.sessionHandlingService.getHandlerByPlayerId(id);

        if (handler == null) {
            logger.warn(`Failed to stop game: ${id}`);
            return false;
        }

        if (handler.sessionInfo.gameType === GameType.Multiplayer && handler.sessionData.isActive) {
            handler.abandonGame(id);
            logger.info(`Game abandoned: ${id}`);
        } else {
            handler.dispose();
            this.sessionHandlingService.removeHandler(id);
            logger.info(`Game disposed: ${id}`);
        }

        return true;
    }

    private addHumanPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): HumanPlayer {
        const humanPlayer = new HumanPlayer(playerInfo);
        sessionHandler.addPlayer(humanPlayer);

        return humanPlayer;
    }

    private addVirtualPlayer(playerInfo: PlayerInfo, sessionHandler: SessionHandler): VirtualPlayer {
        const actionCallback = (action: Action): Action | null => action.execute();

        const virtualPlayer = new VirtualPlayerExpert(sessionHandler.boardHandler.dictionaryHandler, playerInfo, actionCallback);

        sessionHandler.addPlayer(virtualPlayer);

        return virtualPlayer;
    }
}
