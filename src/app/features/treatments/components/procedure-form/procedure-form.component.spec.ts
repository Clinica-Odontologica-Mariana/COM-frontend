import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import { ProcedureFormComponent } from './procedure-form.component';
import { OdontogramGridComponent } from '../odontogram-grid/odontogram-grid.component';
import { MaterialsTableComponent } from '../materials-table/materials-table.component';
import { ConfirmDeleteModalComponent } from '../../../../shared/components/feedback/confirm-delete-modal/confirm-delete-modal.component';
import { TreatmentService } from '../../services/treatment.service';
import { Procedure } from '../../models/treatment.model';
import { TreatmentPlanItemDto } from '../../data/dto/treatment-plan.dto';

// ── stub child components ─────────────────────────────────────────────────────

@Component({ selector: 'app-odontogram-grid', template: '', standalone: true })
class StubOdontogramGrid {
  toothStates = input<Record<number, string>>({});
  readonly = input<boolean>(false);
  toothToggled = output<number>();
}

@Component({ selector: 'app-materials-table', template: '', standalone: true })
class StubMaterialsTable {
  materials = input<unknown[]>([]);
  readonly = input<boolean>(false);
  removeItem = output<number>();
  quantityChange = output<{ index: number; delta: number }>();
}

@Component({ selector: 'app-confirm-delete-modal', template: '', standalone: true })
class StubConfirmDeleteModal {
  open = input<boolean>(false);
  title = input<string>('');
  description = input<string>('');
  confirmLabel = input<string>('');
  cancelLabel = input<string>('');
  confirm = output<void>();
  cancel = output<void>();
}

// ── factory data ──────────────────────────────────────────────────────────────

const mockItem: TreatmentPlanItemDto = {
  id: 'item-1',
  treatmentPlanId: 'plan-1',
  procedureId: null,
  toothNumber: 18,
  description: 'Extração',
  estimatedPrice: 300,
  status: 'PENDING',
  sortOrder: 1,
  completedAt: null,
  createdAt: '2024-01-01T10:00:00Z',
};

const existingProcedure: Procedure = {
  id: 'item-1',
  ids: ['item-1'],
  name: 'Extração de Siso',
  type: 'Cirurgia',
  startDate: '01/01/2024',
  endDate: '',
  value: 300,
  teeth: [18],
  materials: [],
  status: 'pending',
  subtitle: 'Cirurgia — 1 dente',
};

// ── setup ─────────────────────────────────────────────────────────────────────

describe('ProcedureFormComponent', () => {
  let fixture: ComponentFixture<ProcedureFormComponent>;
  let component: ProcedureFormComponent;
  let service: Record<string, ReturnType<typeof vi.fn>>;
  let navigateSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    service = {
      createProcedureItem: vi.fn().mockReturnValue(of(mockItem)),
      updateProcedureItem: vi.fn().mockReturnValue(of(mockItem)),
      deleteProcedureItem: vi.fn().mockReturnValue(of(undefined)),
    };

    await TestBed.configureTestingModule({
      imports: [ProcedureFormComponent],
      providers: [
        { provide: TreatmentService, useValue: service },
        provideRouter([]),
      ],
    })
      .overrideComponent(ProcedureFormComponent, {
        remove: {
          imports: [OdontogramGridComponent, MaterialsTableComponent, ConfirmDeleteModalComponent],
        },
        add: {
          imports: [StubOdontogramGrid, StubMaterialsTable, StubConfirmDeleteModal],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ProcedureFormComponent);
    component = fixture.componentInstance;

    const router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true) as ReturnType<typeof vi.fn>;

    fixture.componentRef.setInput('treatmentId', 'plan-1');
    fixture.componentRef.setInput('patientId', 'pat-1');
    fixture.componentRef.setInput('patientName', 'Maria Silva');
    fixture.componentRef.setInput('patientCode', 'PAC-001');
    fixture.detectChanges();
  });

  // ── form validation ─────────────────────────────────────────────────────────

  describe('form validation', () => {
    it('is invalid when name and value are empty', () => {
      expect(component['form'].invalid).toBe(true);
    });

    it('is valid when name, type and value are filled', () => {
      component['form'].controls.name.setValue('Restauração');
      component['form'].controls.type.setValue('Cirurgia');
      component['form'].controls.value.setValue('150,00');
      expect(component['form'].valid).toBe(true);
    });

    it('does not call service when form is invalid on save', () => {
      component['onSave']();
      expect(service['createProcedureItem']).not.toHaveBeenCalled();
    });

    it('marks all controls as touched on invalid submit', () => {
      component['onSave']();
      expect(component['form'].controls.name.touched).toBe(true);
      expect(component['form'].controls.value.touched).toBe(true);
    });
  });

  // ── create flow ─────────────────────────────────────────────────────────────

  describe('create flow (isEdit=false)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isEdit', false);
      // existingProcedure defaults to null — do NOT call setInput here or detectChanges
      // would run ngOnChanges and form.reset() after the setValue calls below.
      fixture.detectChanges();
      component['form'].controls.name.setValue('Limpeza');
      component['form'].controls.type.setValue('Outros');
      component['form'].controls.value.setValue('100,00');
    });

    it('calls createProcedureItem with parsed payload', () => {
      component['onSave']();
      expect(service['createProcedureItem']).toHaveBeenCalledWith('plan-1', {
        description: 'Limpeza',
        estimatedPrice: 100,
        status: 'APPROVED',
        toothNumber: undefined,
      });
    });

    it('navigates back to treatment after successful save', async () => {
      component['onSave']();
      await new Promise((r) => setTimeout(r, 0));
      expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 'pat-1']);
    });

    it('sets saveError signal on API failure', async () => {
      service['createProcedureItem'].mockReturnValue(throwError(() => new Error('fail')));
      component['onSave']();
      await new Promise((r) => setTimeout(r, 0));
      expect(component['saveError']()).toBeTruthy();
      expect(component['saving']()).toBe(false);
    });
  });

  // ── edit flow ───────────────────────────────────────────────────────────────

  describe('edit flow (isEdit=true)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isEdit', true);
      fixture.componentRef.setInput('existingProcedure', existingProcedure);
      fixture.detectChanges();
    });

    it('populates form from existingProcedure via ngOnChanges', () => {
      expect(component['form'].controls.name.value).toBe('Extração de Siso');
      expect(component['form'].controls.type.value).toBe('Cirurgia');
    });

    it('populates selectedTeeth from existingProcedure', () => {
      expect(component['selectedTeeth']()).toEqual([18]);
    });

    it('populates selectedStatus from existingProcedure', () => {
      expect(component['selectedStatus']()).toBe('pending');
    });

    it('calls updateProcedureItem (not create) on save', () => {
      component['form'].controls.value.setValue('300,00');
      component['onSave']();
      expect(service['updateProcedureItem']).toHaveBeenCalledWith('item-1', expect.any(Object));
      expect(service['createProcedureItem']).not.toHaveBeenCalled();
    });

    it('resets form when existingProcedure becomes null', () => {
      fixture.componentRef.setInput('existingProcedure', null);
      fixture.detectChanges();
      expect(component['form'].controls.name.value).toBe('');
      expect(component['selectedTeeth']()).toEqual([]);
    });
  });

  // ── delete flow ─────────────────────────────────────────────────────────────

  describe('delete flow', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isEdit', true);
      fixture.componentRef.setInput('existingProcedure', existingProcedure);
      fixture.detectChanges();
    });

    it('opens delete confirm modal', () => {
      component['openDeleteConfirm']();
      expect(component['deleteConfirmOpen']()).toBe(true);
    });

    it('calls deleteProcedureItem with procedure id on confirm', () => {
      component['openDeleteConfirm']();
      component['onDeleteConfirmed']();
      expect(service['deleteProcedureItem']).toHaveBeenCalledWith('item-1');
    });

    it('navigates back after successful delete', async () => {
      component['openDeleteConfirm']();
      component['onDeleteConfirmed']();
      await new Promise((r) => setTimeout(r, 0));
      expect(navigateSpy).toHaveBeenCalledWith(['/treatments', 'pat-1']);
    });

    it('sets saveError on delete failure', async () => {
      service['deleteProcedureItem'].mockReturnValue(throwError(() => new Error('fail')));
      component['openDeleteConfirm']();
      component['onDeleteConfirmed']();
      await new Promise((r) => setTimeout(r, 0));
      expect(component['saveError']()).toBeTruthy();
    });
  });

  // ── value formatting ────────────────────────────────────────────────────────

  describe('formatValue', () => {
    it('normalizes Brazilian comma-decimal input on blur', () => {
      component['form'].controls.value.setValue('1.500,75');
      component['formatValue']();
      // The function parses then re-formats back to pt-BR: 1500.75 → "1500,75"
      expect(component['form'].controls.value.value).toBe('1500,75');
    });

    it('does nothing when value is empty', () => {
      component['form'].controls.value.setValue('');
      component['formatValue']();
      expect(component['form'].controls.value.value).toBe('');
    });
  });

  // ── tooth toggling ──────────────────────────────────────────────────────────

  describe('tooth toggling', () => {
    it('adds tooth when not in selectedTeeth', () => {
      component['onToothToggled'](11);
      expect(component['selectedTeeth']()).toContain(11);
    });

    it('removes tooth when already selected', () => {
      component['onToothToggled'](11);
      component['onToothToggled'](11);
      expect(component['selectedTeeth']()).not.toContain(11);
    });
  });
});
