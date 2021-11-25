import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { GoalService } from '@app/services/goal/goal.service';
import { GoalStatus } from '@common';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent implements OnInit, OnDestroy {
    @ViewChild('tablePublic', { static: false }) private tablePublic!: ElementRef<MatTable<Element>>;
    @ViewChild('tablePrivate', { static: false }) private tablePrivate!: ElementRef<MatTable<Element>>;
    displayedColumns: string[] = ['objectives', 'points', 'succeeded'];

    constructor(readonly goalService: GoalService) {}

    ngOnInit() {
        this.goalService.goalData.subscribe(() => this.updateTables());
    }
    ngOnDestroy() {
        this.goalService.goalData.unsubscribe();
    }
    private updateTables() {
        this.tablePublic.nativeElement.renderRows();
        this.tablePrivate.nativeElement.renderRows();
    }

    get goalStatus(): typeof GoalStatus {
        return GoalStatus;
    }
}
