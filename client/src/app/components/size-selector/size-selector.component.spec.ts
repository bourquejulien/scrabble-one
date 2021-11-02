import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIcon } from '@angular/material/icon';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { SizeSelectorComponent } from './size-selector.component';

const MAX_SIZE = 35;
const MIN_SIZE = 25;
const DEFAULT_SIZE = 30;

describe('SizeSelectorComponent', () => {
    let component: SizeSelectorComponent;
    let fixture: ComponentFixture<SizeSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SizeSelectorComponent, MatIcon],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SizeSelectorComponent);
        component = fixture.componentInstance;

        component.maxSize = MAX_SIZE;
        component.minSize = MIN_SIZE;
        component.size = DEFAULT_SIZE;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should increase until limit', () => {
        for (let i = 0; i < MAX_SIZE - DEFAULT_SIZE; i++) {
            component.increase();
        }
        expect(component.size).toEqual(MAX_SIZE);

        component.increase();
        expect(component.size).toEqual(MAX_SIZE);
    });

    it('should decrease until limit', () => {
        for (let i = 0; i < DEFAULT_SIZE - MIN_SIZE; i++) {
            component.decrease();
        }
        expect(component.size).toEqual(MIN_SIZE);

        component.decrease();
        expect(component.size).toEqual(MIN_SIZE);
    });

    afterAll(() => cleanStyles());
});
