import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarComponent } from './toolbar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TimePipe } from '@app/classes/time/time.pipe';

describe('ToolbarComponent', () => {
    let component: ToolbarComponent;
    let fixture: ComponentFixture<ToolbarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ToolbarComponent, TimePipe],
            imports: [HttpClientTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
