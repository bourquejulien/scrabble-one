/* eslint-disable @typescript-eslint/no-explicit-any */
export class BroadcastOperator {
    async fetchSockets() {
        return ['socket1', 'socket2'];
    }
}
export class RoomBroadcaster {
    emit(event: string, message: any) {
        return;
    }
}
export class SocketMock {
    id: number = 123;
    // eslint-disable-next-line @typescript-eslint/ban-types
    callbacks: Map<string, (...args: any) => {}> = new Map();
    on(event: string, callback: any): void {
        this.callbacks.set(event, callback);
    }

    triggerEndpoint(event: string, ...params: any) {
        const callback = this.callbacks.get(event);
        if (callback) {
            callback(...params);
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
        return new BroadcastOperator();
    }

    to(roomId: string) {
        return new RoomBroadcaster();
    }
}
