import { Component } from '@angular/core';
import { MessagingService } from '@app/services/messaging/messaging.service';

@Component({
    selector: 'app-waiting-room-page',
    templateUrl: './waiting-room-page.component.html',
    styleUrls: ['./waiting-room-page.component.scss'],
})
export class WaitingRoomPageComponent {
    rooms: string[] = [];
    constructor(private readonly messagingService: MessagingService) {
        this.rooms = messagingService.rooms;
    }

    join(roomId: string) {
        this.messagingService.joinRoom(roomId);
    }
}
