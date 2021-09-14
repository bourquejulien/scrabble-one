import { Message, MessageType } from '@app/classes/message';

export const MESSAGES: Message[] = [
    { body: 'Affichage débogage', messageType: MessageType.Log, timestamp: Date.now(), userId: 0 },
    { body: 'Entrée non permise', messageType: MessageType.InvalidInputError, timestamp: Date.now(), userId: 0 },
    { body: 'Joueur 1 vous souhaite le bonjour', messageType: MessageType.Messaging, timestamp: Date.now(), userId: 1 },
    { body: 'La grille ne vous permet pas cette action', messageType: MessageType.UndoableActionError, timestamp: Date.now(), userId: 0 },
];
