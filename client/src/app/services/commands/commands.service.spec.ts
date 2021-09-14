import { TestBed } from '@angular/core/testing';

import { CommandsService } from './commands.service';

describe('CommandsService', () => {
    let service: CommandsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommandsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // TODO: invalid command syntax - placer
    // TODO: valid command syntax - placer
    // TODO: valid command syntax but place returns errors - placer
    // TODO: invalid command syntax - message
    // TODO: invalid command syntax - aide
    // TODO: invalid command syntax - debug
    // TODO: invalid command syntax - reserve
});
