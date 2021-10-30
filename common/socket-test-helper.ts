/* eslint-disable @typescript-eslint/no-explicit-any */
export class BroadCastObject {
    fetchSockets() {
        return;
    }
}
export class SocketMock {
    // eslint-disable-next-line @typescript-eslint/ban-types
    callbacks: Map<string, (...args: any) => {}> = new Map();
    on(event: string, callback: any): void {
        this.callbacks.set(event, callback);
    }

    oppositeEndpointEmit(event: string, ...params: any) {
        const callback = this.callbacks.get(event);
        if (callback) {
            callback(params);
        }
    }

    // eslint-disable-next-line no-unused-vars -- Dummy call without any logic
    emit(event: string, ...params: any[]) {
        return;
    }

    close() {
        return;
    }

    async in(roomId: string): Promise<BroadCastObject> {
        return new BroadCastObject();
    }
}
