import { Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string;
    message: BehaviorSubject<string>;

    constructor() {
        this.title = 'LOG2990';
        this.message = new BehaviorSubject<string>('');
    }
}
