import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  @Input() disabled?: boolean;
  @Input() done?: boolean;

  @Input() onSubmit?: () => void;
  @Input() onReset?: () => void;
}
