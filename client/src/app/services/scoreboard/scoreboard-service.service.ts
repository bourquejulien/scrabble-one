import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardServiceService {

  constructor() { }

  async displayClassicScores() : Promise<void> {
    // http request and formatting of output
  }

  async displayLogScores() : Promise<void> {
    // http request and formatting of output
  }
}
