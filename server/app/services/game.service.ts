import { Message } from '@app/message';
import { SessionHandlingService } from '@app/services/session-handling.service';
import { SessionInfo } from '@app/classes/session-info';
import { Answer } from '@app/classes/answer';
import { BoardHandlingService } from '@app/services/validation/board-handling.service';
import { Service } from 'typedi';

@Service()
export class GameService {
    clientMessages: Message[];

    constructor(private readonly boardHandlingService: BoardHandlingService, private readonly sessionHandlingService: SessionHandlingService) {
        this.clientMessages = [];
    }

    async startGame(sessionInfo: SessionInfo): Promise<Answer> {
        const id = this.sessionHandlingService.addHandler(sessionInfo, this.boardHandlingService.generateBoard());
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
