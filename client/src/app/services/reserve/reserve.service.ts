import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Injectable({
    providedIn: 'root',
})
export class ReserveService {
    private reserve: string[];

    constructor(private readonly socketService: SocketClientService) {
        this.reset();
        this.socketService.on('reserve', (reserve: string[]) => this.refresh(reserve));
    }

    reset(): void {
        this.reserve = [];
    }

    getLetterAndQuantity(letterToUpdate: string): string {
        const firstIndex = this.reserve.indexOf(letterToUpdate);
        const lastIndex = this.reserve.lastIndexOf(letterToUpdate);

        if (lastIndex && firstIndex === -1) {
            return `${letterToUpdate.toUpperCase()} : 0`;
        }

        const currentQuantity = lastIndex - firstIndex + 1;
        return `${letterToUpdate.toUpperCase()} : ${currentQuantity}`;
    }

    get length(): number {
        return this.reserve.length;
    }

    private refresh(reserve: string[]): void {
        this.reserve = reserve;
    }
}
