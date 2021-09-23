/* eslint-disable no-restricted-imports */
import { TestBed } from '@angular/core/testing';
import { FakePlayerService } from '../player/mock-player.service.spec';
import { PlayerService } from '../player/player.service';
import { CommandsService } from './commands.service';

describe('CommandsService', () => {
    let service: CommandsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: PlayerService, useClass: FakePlayerService }],
        });
        service = TestBed.inject(CommandsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
