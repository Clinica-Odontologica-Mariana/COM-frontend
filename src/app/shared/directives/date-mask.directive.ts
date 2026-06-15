import { Directive, ElementRef, HostListener, inject, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appDateMask]',
})
export class DateMaskDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  constructor(@Optional() @Self() private readonly ngControl: NgControl | null) {}

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const maskedValue = this.mask(input.value);

    input.value = maskedValue;
    this.ngControl?.control?.setValue(maskedValue, { emitEvent: false });
  }

  private mask(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    if (digits.length > 4) {
      return `${day}/${month}/${year}`;
    }

    if (digits.length > 2) {
      return `${day}/${month}`;
    }

    return day;
  }
}
