export const enum MessageType {
    SyntaxError,
    UndoableActionError,
    InvalidInputError,
    Log,
    Messaging,
}
export interface Message {
    body: string;
    messageType: MessageType;
    userId: number;
    timestamp: number;
}
