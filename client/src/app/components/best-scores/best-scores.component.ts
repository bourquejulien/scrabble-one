import { Component } from '@angular/core';
import { ScoreboardService } from '@app/services/scoreboard/scoreboard.service';
import { Score } from '@common';

const COLLECTION_NAME_CLASSIC = 'classic';
const COLLECTION_NAME_LOG = 'log';
@Component({
  selector: 'app-best-scores',
  templateUrl: './best-scores.component.html',
  styleUrls: ['./best-scores.component.scss'],
})
export class BestScoresComponent {
  classicBoardData: Score[];
  logBoardData: Score[];

  constructor(private scoreboardService: ScoreboardService) {
    this.initBoards();
  }

  async initBoards(): Promise<void> {
    this.classicBoardData = await this.scoreboardService.displayScores(COLLECTION_NAME_CLASSIC);
    this.logBoardData = await this.scoreboardService.displayScores(COLLECTION_NAME_LOG);
  }
}
