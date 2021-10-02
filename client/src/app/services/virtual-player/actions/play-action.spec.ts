/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { Message } from '@app/classes/message';
import { PlayerData } from '@app/classes/player-data';
import { TimeSpan } from '@app/classes/time/timespan';
import { Play } from '@app/classes/virtual-player/play';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { BoardService } from '@app/services/board/board.service';
import { MessagingService } from '@app/services/messaging/messaging.service';
import { TimerService } from '@app/services/timer/timer.service';
import { Subject } from 'rxjs';
import { PlaceAction } from './place-action';
import { PlayAction } from './play-action';

class TimerServiceStub {
    time = TimeSpan.fromSeconds(1);
}

class PlayGeneratorStub {
    orderedPlays: Play[] = [{ score: 0, letters: [] }];
    canGenerate = false;
    gotCalled = false;
    generateNext(): boolean {
        this.gotCalled = true;
        return this.canGenerate;
    }
}

describe('PlayAction', () => {
    let boardService: BoardService;
    let messagingServiceSpy: jasmine.SpyObj<MessagingService>;
    let timerServiceStub: TimerServiceStub;
    let playGeneratorStub: PlayGeneratorStub;
    let playerData: PlayerData;
    let playAction: PlayAction;

    beforeEach(() => {
        boardService = jasmine.createSpyObj('BoardService', ['lookupLetters']);
        messagingServiceSpy = jasmine.createSpyObj('MessagingService', ['subject', 'onMessage', 'send']);
        messagingServiceSpy['subject'] = new Subject<Message>();
        messagingServiceSpy.onMessage.and.returnValue(messagingServiceSpy['subject'].asObservable());
        timerServiceStub = new TimerServiceStub();
        playGeneratorStub = new PlayGeneratorStub();
        playerData = { score: 0, skippedTurns: 0, rack: [] };

        playAction = new PlayAction(
            boardService,
            timerServiceStub as TimerService,
            playGeneratorStub as unknown as PlayGenerator,
            playerData,
            messagingServiceSpy,
        );
    });
    it('should return null when no words are generated', () => {
        playGeneratorStub.orderedPlays = [];
        expect(playAction.execute()).toBeNull();
    });

    it('should return 0 to 0 score range interval if no math is found', () => {
        spyOn(Math, 'random').and.returnValue(1);
        // eslint-disable-next-line dot-notation -- Need to access private method for testing
        expect(playAction['getScoreRange']()).toEqual({ min: 0, max: 0 });
    });

    it('should not generate word when no time is left', () => {
        timerServiceStub.time = TimeSpan.fromMilliseconds(0);
        playAction.execute();

        expect(playGeneratorStub.gotCalled).toBeFalse();
    });

    it('should return PlaceAction instance when words are generated', () => {
        spyOn(Math, 'random').and.returnValue(0);

        const nextAction = playAction.execute();

        expect(playAction.execute()).toBeInstanceOf(PlaceAction);
        // eslint-disable-next-line dot-notation -- Access to private property needed for testing
        expect((nextAction as PlaceAction)['play']).toEqual(playGeneratorStub.orderedPlays[0]);
    });
});
