import { Message } from '@app/message';
import { Service } from 'typedi';
import { BoardService } from '@app/services/board/board.service';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SessionInfo } from '@app/classes/session-info';
import { RequestAnswer } from '@app/classes/request-answer';
import { generateId } from '@app/classes/id';

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(private readonly boardService: BoardService, private readonly sessionHandlingService: SessionHandlingService) {
        this.clientMessages = [];
    }

    async startGame(sessionInfo: SessionInfo): Promise<RequestAnswer> {
        sessionInfo.id = generateId();
        this.sessionHandlingService.addHandler(sessionInfo, this.boardService.generateBoard());
        return {
            isSuccess: true,
            message: '',
        };
    }

    async stopGame(id: string): Promise<RequestAnswer> {
        return {
            isSuccess: this.sessionHandlingService.removeHandler(id) != null,
            message: '',
        };
    }
}
