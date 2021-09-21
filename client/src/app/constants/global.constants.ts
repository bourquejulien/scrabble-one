import { Dictionary } from './dictionary.constants';
import { Grid } from './grid.constants';
import { Reserve } from './reserve.constants';

export class Constants {
    static readonly grid = new Grid();
    static readonly dictionary = new Dictionary();
    static readonly reserve = new Reserve();
}
