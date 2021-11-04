import { SocketHandler } from '@app/handlers/socket-handler/socket-handler';

export interface SocketHandlerGenerator {
    generate(id: string): SocketHandler;
}
