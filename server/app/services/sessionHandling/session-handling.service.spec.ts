/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
import { expect } from 'chai';
import { SessionHandlingService } from './session-handling.service';

describe('SessionHandlingService', () => {
    let service: SessionHandlingService;

    before(() => {
        service = new SessionHandlingService();
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });
});
