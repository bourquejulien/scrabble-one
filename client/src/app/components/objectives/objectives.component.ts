import { Component, OnInit } from '@angular/core';
import { GoalService, GoalStatus } from '@app/services/goal/goal.service';

export interface GoalData {
    id: string;
    isGlobal: boolean;
    name: string;
    score: number;
    status: GoalStatus;
}

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent implements OnInit {
    // @ViewChild('tablePublic', { static: false }) private tablePublic!: ElementRef<MatTable<Element>>;
    // @ViewChild('tablePrivate', { static: false }) private tablePrivate!: ElementRef<MatTable<Element>>;
    displayedColumns: string[] = ['objectives', 'points', 'succeeded'];
    constructor(readonly goalService: GoalService) {}
    ngOnInit() {
        this.goalService.updateObjectives();
    }
}
