import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Message } from '@app/classes/message';

import { CommunicationBoxComponent } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommunicationBoxComponent],
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

    it('should send a command and receive a message', () => {
        const message: Message = {
            title: "Capsule d'aide",
            body: "Vous avez appelé à l'aide!",
            messageType: 'Log',
            timestamp: Date.now(),
            userId: 1,
        };
        component.send('!aide');
        expect(component.messages).toContain(message);
    });
});
