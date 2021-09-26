import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-size-selector',
    templateUrl: './size-selector.component.html',
    styleUrls: ['./size-selector.component.scss'],
})
export class SizeSelectorComponent implements OnInit {
    @Input() minSize: number;
    @Input() maxSize: number;
    @Input() size: number;
    @Output() sizeUpdated = new EventEmitter<number>();

    ngOnInit(): void {
        if (this.size < this.minSize || this.size > this.maxSize) {
            this.size = this.minSize + (this.maxSize - this.minSize) / 2;
        }
    }

    increase() {
        if (this.size >= this.maxSize) {
            this.size = this.maxSize;
        } else {
            this.size++;
        }
        this.sizeUpdated.emit(this.size);
    }

    decrease() {
        if (this.size <= this.minSize) {
            this.size = this.minSize;
        } else {
            this.size--;
        }
        this.sizeUpdated.emit(this.size);
    }
}
