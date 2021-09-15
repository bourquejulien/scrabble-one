import { Message } from '@app/classes/message';

export const MESSAGES: Message[] = [
    { body: 'Affichage débogage', messageType: 'Log', timestamp: Date.now(), userId: 0 },
    { body: 'Entrée non permise', messageType: 'Log', timestamp: Date.now(), userId: 0 },
    { body: 'Joueur 1 vous souhaite le bonjour', messageType: 'Log', timestamp: Date.now(), userId: 1 },
    { body: 'La grille ne vous permet pas cette action', messageType: 'UndoableAction', timestamp: Date.now(), userId: 0 },
];
