import { SocketService } from '@app/services/socket/socket-service';
import { Message } from '@common';
import { SocketHandlerGenerator } from '@app/handlers/socket-handler/socket-handler-generator';

export class SocketHandler implements SocketHandlerGenerator {
    constructor(private readonly socketService: SocketService, private readonly id: string) {}

    sendData<T>(event: string, data?: T, id?: string): void {
        this.socketService.send<T>(event, id ?? this.id, data);
    }

    sendMessage(message: Message, id?: string): void {
        this.sendData<Message>('message', message, id);
    }

    generate(id: string): SocketHandler {
        return new SocketHandler(this.socketService, id);
    }
}
