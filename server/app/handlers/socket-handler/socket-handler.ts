import { SocketService } from '@app/services/socket-service';
import { Message } from '@common';

export class SocketHandler {
    private id: string;

    constructor(private readonly socketService: SocketService) {}

    sendData<T>(event: string, data?: T): void {
        this.socketService.send<T>(event, this.id, data);
    }

    sendMessage(message: Message): void {
        this.sendData<Message>('message', message);
    }

    set sessionId(sessionId: string) {
        this.id = sessionId;
    }
}
