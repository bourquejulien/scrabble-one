import { PlayerType } from '../client/src/app/classes/player/player-type';

export enum MessageType {
    Message,
    Log,
    Error,
    System,
    Game,
}

export interface Message {
    title: string;
    body: string;
    messageType: MessageType;
    userId: PlayerType;
}
