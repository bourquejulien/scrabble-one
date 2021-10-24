/* eslint-disable dot-notation -- reserve is private and we need access for the test */
/* eslint-disable no-unused-expressions -- Needed for chai library assertions */
/* eslint-disable @typescript-eslint/no-unused-expressions -- Needed for chai library assertions */
import { ReserveHandler } from '@app/handlers/reserve-handler/reserve-handler';
import { expect } from 'chai';
import * as sinon from 'sinon';

describe('ReserveHandler', () => {
    let letterToExchange: string;
    let reserveHandler: ReserveHandler;

    beforeEach(() => {
        letterToExchange = 'a';
        const mockReserve = ['a', 'a', 'a', 'b', 'b', 'c'];

        reserveHandler = new ReserveHandler();
        reserveHandler['reserve'] = mockReserve;
    });

    it('should be created', () => {
        expect(reserveHandler).to.be.ok;
    });

    it('should have added letter in reserve at the correct index', () => {
        reserveHandler.putBackLetter(letterToExchange);

        expect(reserveHandler['reserve'][3]).to.equal('a');
    });

    it('should increase length of reserve by one if letterToExchange successfully added', () => {
        const currentLength = reserveHandler.length;
        reserveHandler.putBackLetter(letterToExchange);

        expect(reserveHandler.length).to.equal(currentLength + 1);
    });

    it('should not add anything to reserve if empty letterToExchange', () => {
        const currentLength = reserveHandler.length;
        letterToExchange = '';

        reserveHandler.putBackLetter(letterToExchange);
        expect(reserveHandler.length).to.equal(currentLength);
    });

    it('should not affect reserve if trying to put back anything but a lower case letter', () => {
        const currentLength = reserveHandler.length;
        reserveHandler.putBackLetter('3');
        reserveHandler.putBackLetter('N');
        reserveHandler.putBackLetter('$');
        expect(reserveHandler.length).to.equal(currentLength);
    });

    it('should correctly put back and sort the reserve if trying to put back a letter that was not previously in the reserve', () => {
        const letterIndex = 4;
        reserveHandler['reserve'] = ['a', 'a', 'b', 'c', 'e'];
        reserveHandler.putBackLetter('d');
        expect(reserveHandler['reserve'][letterIndex]).to.equal('d');
    });

    it('should decrease length of reserve if letter successfully drawn', () => {
        const currentLength = reserveHandler.length;
        reserveHandler.drawLetter();

        expect(reserveHandler.length).to.equal(currentLength - 1);
    });

    it('should successfully return the drawn letter from reserve', () => {
        const mathStub = sinon.stub(Math, 'random').returns(3);
        expect(reserveHandler.drawLetter()).to.equal('b');
        sinon.assert.called(mathStub);
    });

    it('should return letter at first index in reserve', () => {
        const mathStub = sinon.stub(Math, 'random').returns(0);
        expect(reserveHandler.drawLetter()).to.equal('a');
        sinon.assert.called(mathStub);
    });

    it('should return letter at last index in reserve', () => {
        const mathStub = sinon.stub(Math, 'random').returns(1);
        expect(reserveHandler.drawLetter()).to.equal('c');
        sinon.assert.called(mathStub);
    });

    it('should return letter quantity if valid letter', () => {
        const firstLetterAndQuantity = 'A : 3';
        const secondLetterAndQuantity = 'B : 2';
        expect(reserveHandler.getLetterAndQuantity('a')).to.equal(firstLetterAndQuantity);
        expect(reserveHandler.getLetterAndQuantity('b')).to.equal(secondLetterAndQuantity);
    });

    it('should return reserve length', () => {
        expect(reserveHandler.length).to.equal(reserveHandler['reserve'].length);
    });

    it('should reset reserve to original length when resetReserve is called', () => {
        const reserveLength = 102;
        reserveHandler.reset();
        expect(reserveHandler.length).to.equal(reserveLength);
    });
});
