export enum MessageType {
    Message,
    Log,
    Error,
}
export interface Message {
    title: string;
    body: string;
    messageType: MessageType;
    userId: number;
    timestamp: number;
}
