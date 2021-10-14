/* eslint-disable dot-notation */
import { Message } from '@app/classes/message';
import { PlayerData } from '@app/classes/player-data';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Subject } from 'rxjs';
import { ExchangeAction } from './exchange-action';

const LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
const RACK_LENGTH = 7;

class ReserveServiceStub {
    letters = LETTERS.slice();
    lastLetter = '';

    drawLetter(): string {
        return this.letters.pop() ?? '';
    }

    putBackLetter(letter: string) {
        this.lastLetter = letter;
    }

    get length(): number {
        return this.letters.length;
    }
}

describe('ExchangeAction', () => {
    let reserveServiceStub: ReserveServiceStub;
    let exchangeAction: ExchangeAction;
    let playerData: PlayerData;
    let messagingServiceSpy: jasmine.SpyObj<MessagingService>;

    beforeEach(() => {
        messagingServiceSpy = jasmine.createSpyObj('MessagingService', ['subject', 'onMessage', 'send']);
        messagingServiceSpy['subject'] = new Subject<Message>();
        messagingServiceSpy.onMessage.and.returnValue(messagingServiceSpy['subject'].asObservable());
        reserveServiceStub = new ReserveServiceStub();
        playerData = { score: 0, skippedTurns: 0, rack: LETTERS.slice() };
        exchangeAction = new ExchangeAction(reserveServiceStub as unknown as ReserveService, messagingServiceSpy, playerData);
    });

    it('should return null', () => {
        spyOn(Math, 'random').and.returnValues(1 / RACK_LENGTH, 0);
        expect(exchangeAction.execute()).toBeNull();
    });

    it('should exchange expected letter count', () => {
        spyOn(Math, 'random').and.returnValues(1 / RACK_LENGTH, 0);

        exchangeAction.execute();

        expect(reserveServiceStub.letters.length).toEqual(LETTERS.length - 1);
        expect(reserveServiceStub.lastLetter).toEqual(LETTERS[0]);
    });

    it('should not exchange when reserve is empty', () => {
        spyOn(Math, 'random').and.returnValues(1 / RACK_LENGTH, 0);
        reserveServiceStub.letters = [];

        spyOn(reserveServiceStub, 'drawLetter');
        exchangeAction.execute();

        expect(reserveServiceStub.drawLetter).not.toHaveBeenCalled();
        expect(reserveServiceStub.lastLetter).toEqual('');
    });
});
