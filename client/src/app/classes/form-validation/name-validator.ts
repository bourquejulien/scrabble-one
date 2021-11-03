import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

const ERRORS: Map<string, string> = new Map([
    ['minlength', '*Le nom doit contenir au moins 3 caractères.\n'],
    ['maxlength', '*Le nom doit au maximum contenir 16 lettres.\n'],
    ['required', '*Un nom doit être entré.\n'],
    ['containsOnlyLetters', '*Le nom doit seulement être composé de lettres.\n'],
    ['startsWithLowerLetter', '*Le nom doit débuter par une majuscule.\n'],
]);

const MAX_SIZE_NAME = 16;
const MIN_SIZE_NAME = 3;

export class NameValidator {
    name: string;

    private static validateName(control: FormControl): { [key: string]: boolean } | null {
        // We make sure that player name is considered as a string
        const playerName = control.value as string;
        if (playerName !== undefined && playerName !== null && playerName !== '') {
            for (let index = 0; index < playerName.length; index++) {
                if (!/[a-zA-ZÉéÎîÉéÇçÏï]/.test(playerName.charAt(index))) {
                    return { ['containsOnlyLetters']: true };
                }
            }

            const firstLetter = playerName[0];
            if (firstLetter !== firstLetter.toUpperCase()) {
                return { ['startsWithLowerLetter']: true };
            }
        }
        return null;
    }

    get isValid(): boolean {
        return this.errors.length === 0;
    }

    get errors(): string[] {
        const nameForm = new FormGroup({
            control: new FormControl(this.name, [
                Validators.required,
                Validators.minLength(MIN_SIZE_NAME),
                Validators.maxLength(MAX_SIZE_NAME),
                NameValidator.validateName as ValidatorFn,
            ]),
        });

        if (nameForm.valid) {
            return [];
        } else {
            const errors = nameForm.get('control')?.errors;
            if (errors !== null && errors !== undefined) {
                return Object.keys(errors).map((e) => ERRORS.get(e) ?? '');
            }
            return [''];
        }
    }
}
