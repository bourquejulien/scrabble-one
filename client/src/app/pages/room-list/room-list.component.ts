import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';

@Component({
  selector: 'app-room-list',
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {
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
