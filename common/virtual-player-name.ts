import { VirtualPlayerLevel } from './virtual-player-level';

export interface VirtualPlayerName {
    name: string;
    level: VirtualPlayerLevel;
    isReadonly: boolean;
}
