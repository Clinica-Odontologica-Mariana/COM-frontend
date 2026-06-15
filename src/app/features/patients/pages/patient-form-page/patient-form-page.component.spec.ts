import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormGroup } from '@angular/forms';
import { NEVER, of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { PatientFormPageComponent } from './patient-form-page.component';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Patient } from '../../models/patient.model';

type PatientFormPageHarness = {
  form: FormGroup;
  onSubmit(): void;
  onPhotoSelected(event: Event): void;
  photoPreview(): string | undefined;
};

function asHarness(component: PatientFormPageComponent): PatientFormPageHarness {
  return component as unknown as PatientFormPageHarness;
}

const mockPatient: Patient = {
  id: '1',
  registrationNumber: '1',
  status: 'active',
  fullName: 'Valid Patient',
  cpf: '529.982.247-25',
  birthDate: '1990-05-10',
  profession: '',
  gender: 'other',
  chiefComplaint: '',
  healthConditions: [],
  continuousMedications: '',
  phone: '',
  email: 'valid@exemplo.com',
  whatsappReminders: false,
  address: { zipCode: '', street: '', neighborhood: '', city: '', state: '' },
};

describe('PatientFormPageComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientFormPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClientTesting(),
      ],
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
    const createSpy = vi.spyOn(service, 'create').mockReturnValue(NEVER);

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
