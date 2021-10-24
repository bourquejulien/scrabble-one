import { Answer } from '@app/classes/answer';
import { SessionInfo } from '@app/classes/session-info';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { BoardGeneratorService } from '@app/services/board/board-generator.service';
import { Message } from '@common';
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

    async startGame(sessionInfo: SessionInfo): Promise<Answer> {
        const board = this.boardGeneratorService.generateBoard();
        const id = generateId();

        const sessionHandler = new SessionHandler(id, sessionInfo, new BoardHandler(board, this.boardGeneratorService.generateBoardValidator(board)));

        this.sessionHandlingService.addHandler(sessionHandler);

        return {
            isSuccess: true,
            body: id,
        };
    }

    async stopGame(id: string): Promise<Answer> {
        return {
            isSuccess: this.sessionHandlingService.removeHandler(id) != null,
            body: '',
        };
    }
}
