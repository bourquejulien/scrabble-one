import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    availableRooms: string[] = [];
    constructor(private readonly socket: SocketClientService, private router: Router) {}

    ngOnInit(): void {
        this.socket.socketClient.on('availableRooms', (availableRooms: string[]) => {
            this.availableRooms = availableRooms;
        });
        this.socket.socketClient.emit('getRooms');
    }

    join(roomId?: string) {
        this.socket.socketClient.emit('joinRoom', roomId);
        this.router.navigate(['game']);
    }
}
