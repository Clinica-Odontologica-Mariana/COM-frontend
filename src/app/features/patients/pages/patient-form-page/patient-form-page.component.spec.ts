import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PatientFormPageComponent } from './patient-form-page.component';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../../../core/services/toast.service';

type PatientFormPageHarness = {
  form: FormGroup;
  onSubmit(): void;
  onPhotoSelected(event: Event): void;
  photoPreview(): string | undefined;
};

function asHarness(component: PatientFormPageComponent): PatientFormPageHarness {
  return component as unknown as PatientFormPageHarness;
}

describe('PatientFormPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFormPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('blocks submit with invalid CPF', () => {
    const fixture = TestBed.createComponent(PatientFormPageComponent);
    const harness = asHarness(fixture.componentInstance);

    harness.form.patchValue({
      fullName: 'Test User',
      cpf: '123.456.789-01',
      email: 'valid@exemplo.com',
    });
    harness.onSubmit();

    expect(harness.form.invalid).toBe(true);
    expect(harness.form.controls['cpf'].hasError('invalidCpf')).toBe(true);
  });

  it('rejects invalid photo type', () => {
    const fixture = TestBed.createComponent(PatientFormPageComponent);
    const harness = asHarness(fixture.componentInstance);
    const toast = TestBed.inject(ToastService);
    const errorSpy = vi.spyOn(toast, 'error');

    const input = document.createElement('input');
    const file = new File(['content'], 'photo.gif', { type: 'image/gif' });
    Object.defineProperty(input, 'files', { value: [file] });

    harness.onPhotoSelected({ target: input } as unknown as Event);

    expect(errorSpy).toHaveBeenCalledWith('A foto deve ser JPG ou PNG.');
    expect(harness.photoPreview()).toBeUndefined();
  });

  it('calls create on valid submit', () => {
    const fixture = TestBed.createComponent(PatientFormPageComponent);
    const harness = asHarness(fixture.componentInstance);
    const service = TestBed.inject(PatientService);
    const createSpy = vi.spyOn(service, 'create');

    harness.form.patchValue({
      fullName: 'Valid Patient',
      cpf: '529.982.247-25',
      birthDate: '1990-05-10',
      email: 'valid@exemplo.com',
    });

    harness.onSubmit();

    expect(createSpy).toHaveBeenCalled();
  });
});
