export enum MessageType {
    Message,
    RemoteMessage,
    Command,
    Log,
    Error,
    System,
}

export interface Message {
    title: string;
    body: string;
    messageType: MessageType;
    fromId?: string;
}
