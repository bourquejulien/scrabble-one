import { Message } from '@app/message';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SessionInfo } from '@app/classes/session-info';
import { RequestAnswer } from '@app/classes/request-answer';
import { generateId } from '@app/classes/id';
import { BoardHandlingService } from '@app/services/validation/board-handling.service';
import { Service } from 'typedi';

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(private readonly boardHandlingService: BoardHandlingService, private readonly sessionHandlingService: SessionHandlingService) {
        this.clientMessages = [];
    }

    async startGame(sessionInfo: SessionInfo): Promise<RequestAnswer> {
        sessionInfo.id = generateId();
        this.sessionHandlingService.addHandler(sessionInfo, this.boardHandlingService.generateBoard());
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
