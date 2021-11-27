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
        this.updateSize(Math.min(this.size + 1, this.maxSize));
    }

    decrease() {
        this.updateSize(Math.max(this.size - 1, this.minSize));
    }

    private updateSize(size: number) {
        this.size = size;
        this.sizeUpdated.emit(size);
    }
}
