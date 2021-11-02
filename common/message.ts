export enum MessageType {
    Message,
    Command = 1,
    Log,
    Error,
    System,
}

export interface Message {
    title: string;
    body: string;
    messageType: MessageType;
    fromId: string;
}
