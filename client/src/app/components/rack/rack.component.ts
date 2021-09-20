import { Component, OnInit } from '@angular/core';
import { letterDefinitions } from '@app/classes/letter';

@Component({
  selector: 'app-rack',
  templateUrl: './rack.component.html',
  styleUrls: ['./rack.component.scss']
})
export class RackComponent implements OnInit {
  rack = ['A', 'B', 'C'];

  constructor() {}

  ngOnInit(): void {
  }


  retrievePoints(letter: string): number {
    let currentLetterData = letterDefinitions.get(letter);

    if (currentLetterData?.points === undefined)
      return -1;

    return currentLetterData.points;
  }
}
