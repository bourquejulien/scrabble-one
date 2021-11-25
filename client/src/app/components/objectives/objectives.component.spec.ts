/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CdkTable } from '@angular/cdk/table';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoalData, GoalStatus } from '@common';
import { ObjectivesComponent } from './objectives.component';
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const SCORE_LIST = [0, 10, 20, 30];
const GOALS_TEST: GoalData[] = [
    { id: '0', name: 'test1', isGlobal: true, score: SCORE_LIST[0], status: GoalStatus.Pending },
    { id: '1', name: 'test2', isGlobal: true, score: SCORE_LIST[1], status: GoalStatus.Failed },
    { id: '2', name: 'test3', isGlobal: false, score: SCORE_LIST[2], status: GoalStatus.Succeeded },
    { id: '3', name: 'test4', isGlobal: false, score: SCORE_LIST[3], status: GoalStatus.Failed },
];

export class MatTableMock {
    renderRows() {
        // Does Nothing
    }
}
describe('ObjectivesComponent', () => {
    let component: ObjectivesComponent;
    let fixture: ComponentFixture<ObjectivesComponent>;
    let matSnackSpy: jasmine.SpyObj<MatSnackBar>;
    let matTableMock: MatTableMock;
    beforeEach(async () => {
        matTableMock = new MatTableMock();
        matSnackSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        await TestBed.configureTestingModule({
            declarations: [ObjectivesComponent],
            providers: [
                { provide: MatSnackBar, useValue: matSnackSpy },
                { provide: CdkTable, useValue: matTableMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectivesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updateTables', () => {
        const spy = spyOn<any>(component, 'updateTables');
        component.goalService.goalData.next(GOALS_TEST);
        expect(spy).toHaveBeenCalled();
    });

    it('should call renderRows', () => {
        const spy = spyOn<any>(matTableMock, 'renderRows');
        component.goalService.goalData.next(GOALS_TEST);
        expect(spy).toHaveBeenCalled();
    });

    it('should return typeof GoalStatus', () => {
        expect(component.goalStatus).toEqual(GoalStatus);
    });
});
