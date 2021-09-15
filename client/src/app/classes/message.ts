export interface Message {
    body: string;
    messageType: 'Error' | 'Message' | 'UndoableAction' | 'Syntax' | 'Log';
    userId: number;
    timestamp: number;
}
