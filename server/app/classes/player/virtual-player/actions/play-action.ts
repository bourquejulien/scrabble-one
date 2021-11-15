import { Action } from '@app/classes/player/virtual-player/actions/action';
import { Play } from '@app/classes/virtual-player/play';
import { ValidatedWord } from '@app/classes/validation/validation-response';
import { Config } from '@app/config';

export abstract class PlayAction implements Action {
    private static getRowLetter(position: number): string {
        return String.fromCharCode('A'.charCodeAt(0) + position);
    }

    private static formatWord(word: ValidatedWord): string {
        const outputs = word.letters.map((validatedLetter) => {
            const letter = validatedLetter.placement.letter.toUpperCase();
            return validatedLetter.isNew ? `<b>${letter}</b>` : letter;
        });

        outputs.push(` (${word.score})`);

        return outputs.join('');
    }

    protected formatPlays(plays: Play[]): string {
        const outputs: string[] = [];

        plays.sort((a, b) => b.score - a.score);

        for (const play of plays) {
            outputs.push(this.formatPlay(play));
            outputs.push('\n\n\n');
        }

        return outputs.slice(0, -1).join('');
    }

    protected formatPlay(play: Play): string {
        const outputs = play.placements.map((p) => `${PlayAction.getRowLetter(p.position.y)}${p.position.x + 1}:${p.letter.toUpperCase()} `);
        outputs.push(`(${play.score})\n`);

        for (const word of play.words) {
            outputs.push(PlayAction.formatWord(word));
            outputs.push('\n');
        }

        if (play.placements.length === Config.RACK_SIZE) {
            outputs.push('Bingo! (50)');
            outputs.push('\n');
        }

        return outputs.slice(0, -1).join('');
    }

    abstract execute(): Action | null;
}
