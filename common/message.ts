export enum MessageType {
    Message,
    Log,
    Error,
    System,
}

export interface Message {
    title: string;
    body: string;
    messageType: MessageType;
    userId: string;
}
