import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toggler',
  templateUrl: './toggler.component.html',
  styleUrls: ['./toggler.component.scss']
})
export class TogglerComponent {
  @Input() activeItem?: string | null;
  @Input() className?: string;
  @Input() onClickHandler?: (value: string) => void;
  @Input() items?: string[];
  @Input() name?: string;
}
