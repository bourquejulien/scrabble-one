import { Answer, Message, ServerGameConfig, SinglePlayerGameConfig } from '@common';
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

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(
        private readonly boardGeneratorService: BoardGeneratorService,
        private readonly sessionHandlingService: SessionHandlingService,
        private readonly dictionnaryService: DictionaryService,
    ) {
        this.clientMessages = [];
    }

    async startVirtualGame(gameConfig: SinglePlayerGameConfig): Promise<ServerGameConfig> {
        const board = this.boardGeneratorService.generateBoard();
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const boardHandler = new BoardHandler(board, this.boardGeneratorService.generateBoardValidator(board));
        const reserveHandler = new ReserveHandler();
        const humanPlayer = this.generateHumanPlayer(gameConfig, boardHandler, reserveHandler);
        const virtualPlayer = this.generateVirtualPlayer(gameConfig, boardHandler, reserveHandler);

        const sessionHandler = new SessionHandler(sessionInfo, boardHandler, reserveHandler, [humanPlayer, virtualPlayer]);

        this.sessionHandlingService.addHandler(sessionHandler);

        return sessionHandler.getServerConfig(humanPlayer.id);
    }

    async stopGame(id: string): Promise<Answer> {
        return {
            isSuccess: this.sessionHandlingService.removeHandler(id) != null,
            body: '',
        };
    }

    private generateHumanPlayer(gameConfig: SinglePlayerGameConfig, boardHandler: BoardHandler, reserveHandler: ReserveHandler): HumanPlayer {
        const playerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.playerName,
            isHuman: true,
        };

        return new HumanPlayer(playerInfo, boardHandler, reserveHandler);
    }

    private generateVirtualPlayer(gameConfig: SinglePlayerGameConfig, boardHandler: BoardHandler, reserveHandler: ReserveHandler): VirtualPlayer {
        const actionCallback = (action: Action): Action | null => action.execute();
        const playerInfo: PlayerInfo = {
            id: generateId(),
            name: gameConfig.virtualPlayerName,
            isHuman: false,
        };

        return new VirtualPlayer(playerInfo, this.dictionnaryService, boardHandler, reserveHandler, actionCallback);
    }
}
