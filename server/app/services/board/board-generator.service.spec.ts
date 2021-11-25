/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* import { expect } from 'chai';
import { createSandbox, createStubInstance } from 'sinon';
import { DictionaryService } from '@app/handlers/dictionary-handler/dictionary-handler.service';
import { BoardGeneratorService } from './board-generator.service';
import { Bonus } from '@common';

describe('BoardHandlingService', () => {
    let service: BoardGeneratorService;

    beforeEach(() => {
        const dictionaryServiceStub = createStubInstance(DictionaryService);
        service = new BoardGeneratorService(dictionaryServiceStub as unknown as DictionaryService);
    });

    it('should be created', () => {
        expect(service).to.be.ok;
    });

    it('should generate a BoardHandler', () => {
        const bonusHandler = service.generateBoardHandler(false);
        expect(service.generateBoardHandler(false)).to.be.ok;
        expect(bonusHandler.isRandomBonus).to.be.false;
    });

    it('should generate a random BoardHandler', () => {
        const randomBonusHandler = service.generateBoardHandler(true);
        expect(randomBonusHandler).to.be.ok;
        expect(randomBonusHandler.isRandomBonus).to.be.true;
    });

    it('should keep random position in same place', () => {
        const randomBonusHandler = service.generateBoardHandler(true);
        const bonusHandler = service.generateBoardHandler(false);
        expect(randomBonusHandler.isRandomBonus).to.be.true;
        expect(bonusHandler.isRandomBonus).to.be.false;

        const size = randomBonusHandler.immutableBoard.size;

        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                if (randomBonusHandler.immutableBoard.getSquare({ x, y }).bonus === Bonus.None) {
                    expect(bonusHandler.immutableBoard.getSquare({ x, y }).bonus === Bonus.None);
                } else {
                    expect(bonusHandler.immutableBoard.getSquare({ x, y }).bonus !== Bonus.None);
                }
            }
        }
    });
    it('should shuffleBonuses but not find wanted bonus', () => {
        const stubInitBank = createSandbox()
            .stub(service, 'initializeBonusBank' as any)
            .returns([]);
        service['retrieveBonuses'](true);
        expect(stubInitBank.calledOnce).to.be.true;
    });
}); */
