import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { CreateEvolutionComponent } from './create-evolution.component';

describe('CreateEvolutionComponent', () => {
  let fixture: ComponentFixture<CreateEvolutionComponent>;
  let component: CreateEvolutionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEvolutionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEvolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('form is invalid when note is empty', () => {
    const form = (component as unknown as { form: { invalid: boolean } }).form;
    expect(form.invalid).toBe(true);
  });

  it('form is invalid when note is shorter than 3 characters', () => {
    const form = (
      component as unknown as {
        form: { controls: { note: { setValue: (v: string) => void; invalid: boolean } } };
      }
    ).form;
    form.controls.note.setValue('ab');
    expect(form.controls.note.invalid).toBe(true);
  });

  it('form is valid when note has at least 3 characters', () => {
    const form = (
      component as unknown as {
        form: { controls: { note: { setValue: (v: string) => void; valid: boolean } } };
      }
    ).form;
    form.controls.note.setValue('Paciente evoluindo bem.');
    expect(form.controls.note.valid).toBe(true);
  });

  it('emits saved event with note payload on valid submit', () => {
    const form = (
      component as unknown as {
        form: { controls: { note: { setValue: (v: string) => void } }; invalid: boolean };
      }
    ).form;
    form.controls.note.setValue('Evolução clínica registrada.');

    const savedSpy = vi.fn();
    fixture.componentRef.setInput('saving', false);
    component.saved.subscribe(savedSpy);

    (component as unknown as { submit: () => void }).submit();

    expect(savedSpy).toHaveBeenCalledWith({ note: 'Evolução clínica registrada.' });
  });

  it('does not emit saved event when form is invalid', () => {
    const savedSpy = vi.fn();
    component.saved.subscribe(savedSpy);

    (component as unknown as { submit: () => void }).submit();

    expect(savedSpy).not.toHaveBeenCalled();
  });

  it('emits closed event when backdrop is clicked', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);

    const backdrop = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(event, 'target', { value: backdrop });
    Object.defineProperty(event, 'currentTarget', { value: backdrop });
    backdrop.dispatchEvent(event);

    expect(closedSpy).toHaveBeenCalled();
  });

  it('marks all fields as touched on invalid submit to show error messages', () => {
    const form = (
      component as unknown as {
        form: { controls: { note: { touched: boolean } }; markAllAsTouched: () => void };
      }
    ).form;

    (component as unknown as { submit: () => void }).submit();

    expect(form.controls.note.touched).toBe(true);
  });
});
