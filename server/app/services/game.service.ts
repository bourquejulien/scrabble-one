import { Answer } from '@app/classes/answer';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { Message, ServerGameConfig, VirtualGameConfig } from '@common';
import { Service } from 'typedi';
import { SessionHandler } from '@app/handlers/session-handler/session-handler';
import { generateId } from '@app/classes/id';
import { BoardHandler } from '@app/handlers/board-handler/board-handler';

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(private readonly boardGeneratorService: BoardGeneratorService, private readonly sessionHandlingService: SessionHandlingService) {
        this.clientMessages = [];
    }

    async startVirtualGame(gameConfig: VirtualGameConfig): Promise<ServerGameConfig> {
        const board = this.boardGeneratorService.generateBoard();
        const sessionInfo = {
            id: generateId(),
            playTimeMs: gameConfig.playTimeMs,
            gameType: gameConfig.gameType,
        };

        const sessionHandler = new SessionHandler(sessionInfo, new BoardHandler(board, this.boardGeneratorService.generateBoardValidator(board)), []);

        return this.startGame(sessionHandler);
    }

    async stopGame(id: string): Promise<Answer> {
        return {
            isSuccess: this.sessionHandlingService.removeHandler(id) != null,
            body: '',
        };
    }

    private async startGame(sessionHandler: SessionHandler): Promise<ServerGameConfig> {
        this.sessionHandlingService.addHandler(sessionHandler);

        return sessionHandler.serverConfig;
    }
}
