/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketMock } from '@app/classes/helpers/socket-test-helper';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { GoalData, GoalStatus } from '@common';
import { GoalService } from './goal.service';

describe('GoalService', () => {
    let service: GoalService;
    let matSnackSpy: jasmine.SpyObj<MatSnackBar>;
    let socketServiceSpyObj: jasmine.SpyObj<SocketClientService>;
    let socketClient: SocketMock;
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    const SCORE_LIST = [0, 10, 20, 30];
    const GOALS_TEST: GoalData[] = [
        { id: '0', name: 'test1', isGlobal: true, score: SCORE_LIST[0], status: GoalStatus.Pending },
        { id: '1', name: 'test2', isGlobal: true, score: SCORE_LIST[1], status: GoalStatus.Failed },
        { id: '2', name: 'test3', isGlobal: false, score: SCORE_LIST[2], status: GoalStatus.Succeeded },
        { id: '3', name: 'test4', isGlobal: false, score: SCORE_LIST[3], status: GoalStatus.Failed },
    ];
    beforeEach(() => {
        socketClient = new SocketMock();
        matSnackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        socketServiceSpyObj = jasmine.createSpyObj('SocketClientService', ['on', 'reset', 'send'], { socketClient });
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketServiceSpyObj },
                { provide: MatSnackBar, useValue: matSnackSpy },
            ],
        });
        service = TestBed.inject(GoalService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should parse well public from private objectives', () => {
        const EXPECTED_PRIVATE: GoalData[] = [{ id: '2', name: 'test3', isGlobal: false, score: SCORE_LIST[2], status: GoalStatus.Succeeded }];
        const EXPECTED_PUBLIC: GoalData[] = [
            { id: '0', name: 'test1', isGlobal: true, score: SCORE_LIST[0], status: GoalStatus.Pending },
            { id: '1', name: 'test2', isGlobal: true, score: SCORE_LIST[1], status: GoalStatus.Failed },
        ];
        service['updateObjectives'](GOALS_TEST);
        expect(service.publicObjectives).toEqual(EXPECTED_PUBLIC);
        expect(service.privateObjectives).toEqual(EXPECTED_PRIVATE);
    });

    it('should pop a snackBar', () => {
        service['updateObjectives'](GOALS_TEST);
        expect(matSnackSpy['open']).toHaveBeenCalled();
    });
    /*
    it('should call updateObjectives on socket', () => {
        const GOALS_TEST_CHANGED: GoalData[] = [
            { id: '0', name: 'test1', isGlobal: true, score: SCORE_LIST[0], status: GoalStatus.Pending },
            { id: '2', name: 'test3', isGlobal: false, score: SCORE_LIST[2], status: GoalStatus.Succeeded },
        ];
        const spy = spyOn<any>(service, 'updateObjectives');
        socketClient.triggerEndpoint('goals', GOALS_TEST_CHANGED);
        expect(service.privateObjectives).toEqual([{ id: '0', name: 'test1', isGlobal: true, score: SCORE_LIST[0], status: GoalStatus.Pending }]);
        expect(spy).toHaveBeenCalledWith(GOALS_TEST_CHANGED);
    });
    */
});
