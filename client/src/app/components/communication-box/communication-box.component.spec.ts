import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandsService } from '@app/services/commands/commands.service';
import { CommunicationBoxComponent } from './communication-box.component';
@Injectable({
    providedIn: 'root',
})
class FakeCommandsService {
    parseInput(): boolean {
        return true;
    }
}

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
            providers: [{ provide: CommandsService, useClass: FakeCommandsService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
