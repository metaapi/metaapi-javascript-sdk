import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})

export class FieldComponent {
  @Input() value?: string;
  @Output() valueChange = new EventEmitter<string>();

  @Input() label?: string;
  @Input() disabled?: boolean;

  onInput = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    this.valueChange.emit(value);
  }
}
