/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-vars */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class BroadcastOperator {
    private isFull = true;
    constructor(isFull: boolean) {
        this.isFull = isFull;
    }
    async fetchSockets() {
        if (this.isFull) {
            return ['socket3', 'socket2'];
        }
        return ['socket1'];
    }
    emit(event: string, message: any) {
        return;
    }
}
export class SocketMock {
    id = '123';
    rooms = {
        values: () => {
            return {
                next: () => {
                    return {
                        value: 'roomIdISuppose',
                    };
                },
            };
        },
    };
    // eslint-disable-next-line @typescript-eslint/ban-types
    callbacks: Map<string, (...args: any) => {}> = new Map();
    on(event: string, callback: any): void {
        this.callbacks.set(event, callback);
    }

    async triggerEndpoint(event: string, ...params: any) {
        const callback = this.callbacks.get(event);
        if (callback) {
            await callback(...params);
        }
    }

    // eslint-disable-next-line no-unused-vars -- Dummy call without any logic
    emit(event: string, ...params: any) {
        return;
    }

    close() {
        return;
    }

    in(roomId: string) {
        return new BroadcastOperator(roomId === 'full');
    }

    to(roomId: string) {
        return new BroadcastOperator(roomId === 'full');
    }

    join(roomId: string) {
        return;
    }

    leave() {
        return;
    }
}
