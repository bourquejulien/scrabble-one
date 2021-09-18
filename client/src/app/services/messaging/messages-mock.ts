import { Message } from '@app/classes/message';

export const MESSAGES: Message[] = [
    { title: '', body: 'Salut!', messageType: 'UserMessage', timestamp: Date.now(), userId: 0 },
    { title: '', body: 'Hey!', messageType: 'UserMessage', timestamp: Date.now(), userId: 1 },
    { title: '', body: 'Bonne chance!', messageType: 'UserMessage', timestamp: Date.now(), userId: 1 },
    { title: '', body: 'Merci, à toi aussi', messageType: 'UserMessage', timestamp: Date.now(), userId: 0 },
    {
        title: 'Capsule daide',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ',
        messageType: 'Log',
        timestamp: Date.now(),
        userId: 0,
    },
];
