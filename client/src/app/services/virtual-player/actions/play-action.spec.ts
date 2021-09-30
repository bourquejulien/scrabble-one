/* eslint-disable max-classes-per-file */
import { PlayerData } from '@app/classes/player-data';
import { TimeSpan } from '@app/classes/time/timespan';
import { Play } from '@app/classes/virtual-player/play';
import { PlayGenerator } from '@app/classes/virtual-player/play-generator';
import { BoardService } from '@app/services/board/board.service';
import { TimerService } from '@app/services/timer/timer.service';
import { PlaceAction } from './place-action';
import { PlayAction } from './play-action';

class TimerServiceStub {
    time = TimeSpan.fromSeconds(0);
}

class PlayGeneratorStub {
    orderedPlays: Play[] = [{ score: 0, letters: [] }];
    canGenerate = false;
    generateNext(): boolean {
        return this.canGenerate;
    }
}

describe('PlayAction', () => {
    let boardService: BoardService;
    let timerServiceStub: TimerServiceStub;
    let playGeneratorStub: PlayGeneratorStub;
    let playerData: PlayerData;
    let playAction: PlayAction;

    beforeEach(() => {
        boardService = jasmine.createSpyObj('BoardService', ['lookupLetters']);
        timerServiceStub = new TimerServiceStub();
        playGeneratorStub = new PlayGeneratorStub();
        playerData = { score: 0, rack: [] };

        playAction = new PlayAction(boardService, timerServiceStub as TimerService, playGeneratorStub as unknown as PlayGenerator, playerData);
    });

    it('should return null when no words are generated', () => {
        playGeneratorStub.orderedPlays = [];
        expect(playAction.execute()).toBeNull();
    });

    it('should return PlaceAction instance when words are generated', () => {
        spyOn(Math, 'random').and.returnValue(0);

        const nextAction = playAction.execute();

        expect(playAction.execute()).toBeInstanceOf(PlaceAction);
        // eslint-disable-next-line dot-notation -- Access to private property needed for testing
        expect((nextAction as PlaceAction)['play']).toEqual(playGeneratorStub.orderedPlays[0]);
    });
});
