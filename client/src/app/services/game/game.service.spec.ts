/* eslint-disable max-classes-per-file -- Needs many stubbed classes in order to test*/
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlayerType } from '@app/classes/player-type';
import { Subject } from 'rxjs';
import { PlayerService } from '@app/services/player/player.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { GameService } from './game.service';

@Injectable({
    providedIn: 'root',
})
export class MockPlayerService {
    turnComplete: Subject<PlayerType> = new Subject();
}

@Injectable({
    providedIn: 'root',
})
export class MockVirtualPlayerService {
    turnComplete: Subject<PlayerType> = new Subject();
}

describe('GameService', () => {
    let service: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: VirtualPlayerService, useClass: MockVirtualPlayerService },
                { provide: PlayerService, useClass: MockPlayerService },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
