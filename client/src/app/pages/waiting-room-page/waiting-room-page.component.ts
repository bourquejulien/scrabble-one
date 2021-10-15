import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent implements OnInit {
    availableRooms: string[] = [];
    constructor(private readonly messagingService: MessagingService, private router: Router) {}

    ngOnInit(): void {
        this.messagingService.socketClient.on('availableRooms', (availableRooms: string[]) => {
            this.availableRooms = availableRooms;
        });
        this.messagingService.socketClient.emit('getRooms');
    }

    join(roomId?: string) {
        this.messagingService.socketClient.emit('joinRoom', roomId);
        this.router.navigate(['game']);
    }
}
