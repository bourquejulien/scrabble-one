import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { cleanStyles } from '@app/classes/helpers/cleanup.helper';
import { AppMaterialModule } from '@app/modules/material.module';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { HealthService } from '@app/services/health/health.service';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
class StubHealthService {
    isHealthy: boolean = true;

    async isServerOk(): Promise<void> {
        if (this.isHealthy) {
            return Promise.resolve();
        } else {
            throw new Error();
        }
    }
}

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    // let stubbedHealthService: StubHealthService;
    // let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, AppMaterialModule],
            declarations: [MainPageComponent],
            providers: [{ provide: HealthService, useClass: StubHealthService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        // router = TestBed.inject(Router);
        // stubbedHealthService = TestBed.inject(HealthService) as unknown as StubHealthService;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should go to error page', async () => {
    //     stubbedHealthService.isHealthy = false;
    //     const spy = spyOn(router, 'navigate');
    //
    //     component.ngOnInit();
    //
    //     expect(spy).toHaveBeenCalled();
    // });

    afterAll(() => cleanStyles());
});
