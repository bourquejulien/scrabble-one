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

    it('should not contains any error', async () => {
        validator.name = NAMES[0];
        await validator.validate();
        expect(validator.errors).toEqual([]);
    });

    it('should not contains any error', async () => {
        validator.name = NAMES[1];
        await validator.validate();
        expect(validator.errors).toEqual([]);
    });

    it('should have error for lower letter', async () => {
        validator.name = NAMES[2];
        await validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit débuter par une majuscule.\n']);
    });

    it('should have error for minimum length', async () => {
        validator.name = NAMES[3];
        await validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit contenir au moins 3 caractères.\n']);
    });

    it('should have error for maximum length', async () => {
        validator.name = NAMES[4];
        await validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit au maximum contenir 16 lettres.\n']);
    });

    it('should have error for not having name', async () => {
        await validator.validate();
        expect(validator.errors).toEqual(['*Un nom doit être entré.\n']);
    });

    it('should have error for not containing only letters', async () => {
        validator.name = NAMES[5];
        await validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit seulement être composé de lettres.\n']);
    });

    it('should have error for not containing only letters and minimum length', async () => {
        validator.name = NAMES[6];
        await validator.validate();
        expect(validator.errors).toEqual(['*Le nom doit contenir au moins 3 caractères.\n', '*Le nom doit seulement être composé de lettres.\n']);
    });
});
