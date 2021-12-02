import { FormControl, ValidatorFn, Validators } from '@angular/forms';

const ERRORS: Map<string, string> = new Map([
    ['minlength', '*Le nom doit contenir au moins 3 caractères.\n'],
    ['maxlength', '*Le nom doit au maximum contenir 16 lettres.\n'],
    ['required', '*Un nom doit être entré.\n'],
    ['containsOnlyLetters', '*Le nom doit seulement être composé de lettres.\n'],
]);

const MAX_SIZE_NAME = 16;
const MIN_SIZE_NAME = 3;

export class NameValidator {
    name: string;
    errors: string[];

    private readonly validationFunction: ValidatorFn[];

    constructor() {
        this.name = '';
        this.errors = [];
        this.validationFunction = [
            Validators.required,
            Validators.minLength(MIN_SIZE_NAME),
            Validators.maxLength(MAX_SIZE_NAME),
            NameValidator.validateName as ValidatorFn,
        ];
    }

    private static validateName(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        const validateName = playerName === undefined || playerName === null || playerName === '';
        if (validateName) {
            return null;
        }

        for (let index = 0; index < playerName.length; index++) {
            if (!/[a-zA-ZÉéÎîÉéÇçÏï]/.test(playerName.charAt(index))) {
                return { ['containsOnlyLetters']: true };
            }
        }

        return null;
    }

    validate(): void {
        const control = new FormControl(this.name, this.validationFunction);

        this.errors.length = 0;

        const errors = control.errors;
        if (errors !== null && errors !== undefined) {
            this.errors.push(...Object.keys(errors).map((e) => ERRORS.get(e) ?? ''));
        }
    }

    reset(): void {
        this.errors.length = 0;
        this.name = '';
    }

    get isValid(): boolean {
        return this.errors.length === 0;
    }
}
