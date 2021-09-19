import { Component, OnInit } from '@angular/core';
//import { PlayerService } from '@app/services/player.service';
import { letterDefinitions } from '@app/classes/letter';

@Component({
  selector: 'app-rack',
  templateUrl: './rack.component.html',
  styleUrls: ['./rack.component.scss']
})
export class RackComponent implements OnInit {
  // should replace by player service rack after the merge 
  rack = ['A', 'B', 'C'];

  constructor(/**private playerService: PlayerService */) {}

  ngOnInit(): void {
    for (let letter of this.rack)
      this.drawLetterTile(letter);
  }

  retrievePoints(letter: string): number {
    let currentLetterData = letterDefinitions.get(letter);

    // it wont let me just do a return... so i put -1 so we can use it in checks later (-1 means there was a problem)
    if (currentLetterData?.points === undefined)
      return -1;

    return currentLetterData.points;
  }

  updaterack(): void {
    this.rack.pop();
  }

  drawLetterTile(letter: string): void {
    /*if (this.retrievePoints(letter) === -1)
      return;

    let cvs = document.getElementsByTagName('canvas');
    //var canvas = document.getElementById('letter') as HTMLCanvasElement;
    let ctx = cvs.getContext('2d');

    if (ctx === null) {
      return;
    }

    ctx.strokeRect(50, 50, 50, 50);

*/
  }

  /**
   * for each letter in rack, retrieve points then create tile component
   */
}
