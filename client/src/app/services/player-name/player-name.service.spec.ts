/* eslint-disable dot-notation */
import { fakeAsync, TestBed } from '@angular/core/testing';

import { PlayerNameService } from './player-name.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VirtualPlayerLevel, VirtualPlayerName } from '@common';
import { environmentExt } from '@environment-ext';

const localUrl = (call: string, param: string) => `${environmentExt.apiUrl}admin/${call}/${param}`;

const VIRTUAL_PLAYER_NAME: VirtualPlayerName = {
    name: 'Gérard',
    level: VirtualPlayerLevel.Expert,
    isReadonly: false,
};

describe('PlayerNameService', () => {
    let service: PlayerNameService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });

        httpMock = TestBed.inject(HttpTestingController);
        service = TestBed.inject(PlayerNameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should retrieve player names', () => {
        expect(service['virtualPlayerNames'].length).toBe(0);

        service.retrievePlayerNames().then(() => {
            expect(service['virtualPlayerNames'].length).toBe(1);
        });

        const requests = httpMock.match(localUrl('playername', ''));
        requests[0].flush([]);
        requests[1].flush([VIRTUAL_PLAYER_NAME]);
    });

    it('should not set players if none', () => {
        expect(service['virtualPlayerNames'].length).toBe(0);

        service.retrievePlayerNames().then(() => {
            expect(service['virtualPlayerNames'].length).toBe(1);
        });

        const requests = httpMock.match(localUrl('playername', ''));
        requests[0].flush([]);
    });

    it('should add player name', fakeAsync(() => {
        expect(service['virtualPlayerNames'].length).toBe(0);

        const NAME = 'Maurice';
        const LEVEL = VirtualPlayerLevel.Easy;

        service.addPlayerName(NAME, LEVEL);

        const request = httpMock.expectOne(localUrl('playername/set', LEVEL));
        request.flush([VIRTUAL_PLAYER_NAME]);
        expect(request.request.body).toEqual({ name: NAME });
        expect(service['virtualPlayerNames'].length).toBe(1);
    }));

    it('should update player name', fakeAsync(() => {
        const OLD_NAME = 'Maurice1';
        const NEW_NAME = 'Maurice2';

        service.updatePlayerName(OLD_NAME, NEW_NAME);

        const request = httpMock.expectOne(localUrl('playername', 'rename'));
        request.flush([VIRTUAL_PLAYER_NAME]);
        expect(request.request.body).toEqual([OLD_NAME, NEW_NAME]);
        expect(service['virtualPlayerNames'].length).toBe(1);
    }));

    it('should remove player name', fakeAsync(() => {
        const NAME = 'Maurice';

        service.removePlayerName(NAME);

        const request = httpMock.expectOne(localUrl('playername', NAME));
        request.flush([VIRTUAL_PLAYER_NAME]);
        expect(service['virtualPlayerNames'].length).toBe(1);
    }));
});
