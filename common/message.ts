export enum MessageType {
    Message,
    Command,
    Debug,
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
