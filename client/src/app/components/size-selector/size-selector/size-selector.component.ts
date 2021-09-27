import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-size-selector',
    templateUrl: './size-selector.component.html',
    styleUrls: ['./size-selector.component.scss'],
})
export class SizeSelectorComponent {
    @Input() minSize: number;
    @Input() maxSize: number;
    @Input() size: number;
    @Output() sizeUpdated = new EventEmitter<number>();

    increase() {
        if (this.size < this.maxSize) {
            this.size++;
        } else {
            this.size = this.maxSize;
        }
        this.sizeUpdated.emit(this.size);
    }

    decrease() {
        if (this.size > this.minSize) {
            this.size--;
        } else {
            this.size = this.minSize;
        }
        this.sizeUpdated.emit(this.size);
    }
}
