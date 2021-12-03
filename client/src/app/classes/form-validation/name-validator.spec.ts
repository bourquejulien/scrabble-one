/* eslint-disable @typescript-eslint/no-explicit-any */
import { NameValidator } from './name-validator';

const NAMES = ['Jean', 'RenÉéÎîÉéÇçÏï', 'moulon', 'Jo', 'Josiannnnnnnnnnne', 'Jean123', 'A1', 'Alphonse', ''];

describe('NameValidator', () => {
    let validator: NameValidator;

    beforeEach(() => {
        validator = new NameValidator();
    });

    it('should create an instance', () => {
        expect(validator).toBeTruthy();
    });

    it('should not contains any error', () => {
        validator.name = NAMES[0];
        validator.validate();
        expect(validator.errors).toEqual([]);
    });

    it('should not contains any error', () => {
        validator.name = NAMES[1];
        validator.validate();
        expect(validator.errors).toEqual([]);
    });

    it('should have error for minimum length', () => {
        validator.name = NAMES[3];
        validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit contenir au moins 3 caractères.\n']);
    });

    it('should have error for maximum length', () => {
        validator.name = NAMES[4];
        validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit au maximum contenir 16 lettres.\n']);
    });

    it('should have error for not having name', () => {
        validator.validate();
        expect(validator.errors).toEqual(['*Un nom doit être entré.\n']);
    });

    it('should have error for not containing only letters', () => {
        validator.name = NAMES[5];
        validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit seulement être composé de lettres.\n']);
    });

    it('should have error for not containing only letters and minimum length', () => {
        validator.name = NAMES[6];
        validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit contenir au moins 3 caractères.\n', '*Le nom doit seulement être composé de lettres.\n']);
    });

    it('should reset form data when reset function called', () => {
        validator.name = NAMES[6];
        validator.errors.push('ERROR');
        validator.reset();
        expect(validator.errors.length).toBe(0);
        expect(validator.name).toBe('');
    });

    it('should return if name isValid', () => {
        validator.name = NAMES[0];
        expect(validator.isValid).toBe(true);
    });
});
