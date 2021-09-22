export interface Message {
    title: string;
    body: string;
    messageType: 'UserMessage' | 'ActionError' | 'SyntaxError' | 'InputError' | 'Log';
    userId: number;
    timestamp: number;
}
