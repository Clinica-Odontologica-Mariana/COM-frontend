import { Directive, ElementRef, HostListener, inject, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appCurrencyMask]',
})
export class CurrencyMaskDirective {
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
    const digits = value.replace(/\D/g, '');
    const amount = Number(digits || '0') / 100;

    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
