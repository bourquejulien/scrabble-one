import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';
import { Vec2 } from '@app/classes/vec2';

@Component({
  selector: 'app-rack',
  templateUrl: './rack.component.html',
  styleUrls: ['./rack.component.scss']
})

export class RackComponent implements OnInit {
  @ViewChild('canvas', { static: false })
  // should replace by player service rack after the merge 
  rack = ['A', 'B', 'C'];
  myCanvas: ElementRef<HTMLCanvasElement>;
  context: CanvasRenderingContext2D | null;


  constructor(/**private playerService: PlayerService */) {}

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    if (this.context !== null)
      this.context = this.myCanvas.nativeElement.getContext('2d');
    this.drawLetter();
  }

  retrievePoints(letter: string): number {
    let currentLetterData = letterDefinitions.get(letter);

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

  drawLetter() {
    if (this.context === null) {
      return;
    }

    const startPosition: Vec2 = { x: 175, y: 100 };
    const step = 20;
    this.context.font = '20px system-ui';
    for (let i = 0; i < this.rack.length; i++) {
      this.context.fillText(this.rack[i], startPosition.x + step * i, startPosition.y);
    }
  }
}

