import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { TreatmentService } from './treatment.service';
import { ApiResponse } from '../../../core/models/api-response.model';
import {
  TreatmentPlanDto,
  TreatmentPlanItemDto,
  PatientDto,
  ClinicalProcedureDto,
} from '../data/dto/treatment-plan.dto';

// ── helpers ───────────────────────────────────────────────────────────────────

function wrap<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

const PLAN: TreatmentPlanDto = {
  id: 'plan-1',
  patientId: 'pat-1',
  medicalRecordId: 'rec-1',
  title: 'Plano A',
  status: 'ACTIVE',
  notes: null,
  totalAmount: 500,
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const ITEM: TreatmentPlanItemDto = {
  id: 'item-1',
  treatmentPlanId: 'plan-1',
  procedureId: 'cp-1',
  toothNumber: 18,
  description: 'Extração',
  estimatedPrice: 300,
  status: 'PENDING',
  sortOrder: 1,
  completedAt: null,
  createdAt: '2024-01-01T10:00:00Z',
};

const PATIENT: PatientDto = {
  id: 'pat-1',
  fullName: 'Maria Silva',
  cpf: null,
  phone: null,
  email: null,
};

const CP: ClinicalProcedureDto = {
  id: 'cp-1',
  name: 'Extração de Siso',
  category: 'Cirurgia',
};

const PAGE_DTO = {
  content: [PATIENT],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 200,
};

// ── setup ─────────────────────────────────────────────────────────────────────

describe('TreatmentService', () => {
  let service: TreatmentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TreatmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── getTreatment ────────────────────────────────────────────────────────────

  describe('getTreatment', () => {
    it('fetches plan, items, patient, medical-record, odontogram and clinical procedures', async () => {
      const result$ = firstValueFrom(service.getTreatment('plan-1'));

      httpMock.expectOne('/api/v1/treatment-plans/plan-1').flush(wrap(PLAN));
      httpMock.expectOne('/api/v1/treatment-plans/plan-1/items').flush(wrap([ITEM]));
      httpMock.expectOne('/api/v1/clinical-procedures/cp-1').flush(wrap(CP));
      httpMock.expectOne('/api/v1/patients/pat-1').flush(wrap(PATIENT));
      httpMock.expectOne('/api/v1/medical-records/by-patient/pat-1').flush(wrap(null));
      httpMock.expectOne('/api/v1/odontogram-entries/by-patient/pat-1').flush(wrap([]));

      const data = await result$;
      expect(data.id).toBe('plan-1');
      expect(data.patient.name).toBe('Maria Silva');
      expect(data.procedures).toHaveLength(1);
      expect(data.procedures[0].name).toBe('Extração de Siso');
      expect(data.procedures[0].teeth).toEqual([18]);
    });

    it('skips clinical-procedure request when items have no procedureId', async () => {
      const itemNoProc = { ...ITEM, procedureId: null };
      const result$ = firstValueFrom(service.getTreatment('plan-1'));

      httpMock.expectOne('/api/v1/treatment-plans/plan-1').flush(wrap(PLAN));
      httpMock.expectOne('/api/v1/treatment-plans/plan-1/items').flush(wrap([itemNoProc]));
      // no clinical-procedures request expected
      httpMock.expectOne('/api/v1/patients/pat-1').flush(wrap(PATIENT));
      httpMock.expectOne('/api/v1/medical-records/by-patient/pat-1').flush(wrap(null));
      httpMock.expectOne('/api/v1/odontogram-entries/by-patient/pat-1').flush(wrap([]));

      const data = await result$;
      expect(data.procedures[0].name).toBe('Extração');
    });

    it('propagates error to the caller when plan fetch fails', async () => {
      const result$ = firstValueFrom(service.getTreatment('plan-1'));

      // forkJoin fires both concurrently; flush items first so it's consumed,
      // then error the plan — forkJoin propagates the error to caller.
      httpMock.expectOne('/api/v1/treatment-plans/plan-1/items').flush(wrap([]));
      httpMock.expectOne('/api/v1/treatment-plans/plan-1').flush('Not found', {
        status: 404,
        statusText: 'Not Found',
      });

      await expect(result$).rejects.toThrow();
    });

    it('deduplicates repeated procedureIds before fetching clinical procedures', async () => {
      const item2 = { ...ITEM, id: 'item-2', procedureId: 'cp-1' };
      const result$ = firstValueFrom(service.getTreatment('plan-1'));

      httpMock.expectOne('/api/v1/treatment-plans/plan-1').flush(wrap(PLAN));
      httpMock.expectOne('/api/v1/treatment-plans/plan-1/items').flush(wrap([ITEM, item2]));
      // only ONE request for cp-1 (deduplicated)
      httpMock.expectOne('/api/v1/clinical-procedures/cp-1').flush(wrap(CP));
      httpMock.expectOne('/api/v1/patients/pat-1').flush(wrap(PATIENT));
      httpMock.expectOne('/api/v1/medical-records/by-patient/pat-1').flush(wrap(null));
      httpMock.expectOne('/api/v1/odontogram-entries/by-patient/pat-1').flush(wrap([]));

      const data = await result$;
      expect(data.procedures).toHaveLength(2);
    });
  });

  // ── getTreatmentList ────────────────────────────────────────────────────────

  describe('getTreatmentList', () => {
    it('fetches patients then their treatment plans and items', async () => {
      const result$ = firstValueFrom(service.getTreatmentList());

      httpMock
        .expectOne((req) => req.url === '/api/v1/patients' && req.params.get('size') === '200')
        .flush(wrap(PAGE_DTO));
      httpMock
        .expectOne('/api/v1/treatment-plans/by-patient/pat-1')
        .flush(wrap([PLAN]));
      httpMock
        .expectOne('/api/v1/treatment-plans/plan-1/items')
        .flush(wrap([ITEM]));

      const list = await result$;
      expect(list).toHaveLength(1);
      expect(list[0].id).toBe('plan-1');
      expect(list[0].patientName).toBe('Maria Silva');
      expect(list[0].procedureCount).toBe(1);
      expect(list[0].completedCount).toBe(0);
    });

    it('returns empty list when patient page is empty', async () => {
      const result$ = firstValueFrom(service.getTreatmentList());

      httpMock
        .expectOne((req) => req.url === '/api/v1/patients')
        .flush(wrap({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 200 }));

      const list = await result$;
      expect(list).toEqual([]);
    });

    it('propagates top-level error to caller', async () => {
      const result$ = firstValueFrom(service.getTreatmentList());

      httpMock
        .expectOne((req) => req.url === '/api/v1/patients')
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      await expect(result$).rejects.toThrow();
    });
  });

  // ── createProcedureItem ─────────────────────────────────────────────────────

  describe('createProcedureItem', () => {
    it('POSTs to the correct endpoint with mapped payload', async () => {
      const result$ = firstValueFrom(
        service.createProcedureItem('plan-1', {
          description: 'Restauração',
          estimatedPrice: 200,
          status: 'PENDING',
          toothNumber: 21,
        }),
      );

      const req = httpMock.expectOne('/api/v1/treatment-plans/plan-1/items');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        description: 'Restauração',
        estimatedPrice: 200,
        status: 'PENDING',
        toothNumber: 21,
      });
      req.flush(wrap(ITEM));

      await result$;
    });

    it('defaults estimatedPrice to 0 and toothNumber to null when omitted', async () => {
      const result$ = firstValueFrom(
        service.createProcedureItem('plan-1', { description: 'Consulta' }),
      );

      const req = httpMock.expectOne('/api/v1/treatment-plans/plan-1/items');
      expect(req.request.body.estimatedPrice).toBe(0);
      expect(req.request.body.toothNumber).toBeNull();
      req.flush(wrap(ITEM));

      await result$;
    });
  });

  // ── updateProcedureItem ─────────────────────────────────────────────────────

  describe('updateProcedureItem', () => {
    it('PUTs to the correct endpoint', async () => {
      const result$ = firstValueFrom(
        service.updateProcedureItem('item-1', {
          description: 'Extração atualizada',
          estimatedPrice: 350,
          status: 'APPROVED',
          toothNumber: 18,
        }),
      );

      const req = httpMock.expectOne('/api/v1/treatment-plans/items/item-1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.description).toBe('Extração atualizada');
      req.flush(wrap(ITEM));

      await result$;
    });
  });

  // ── deleteProcedureItem ─────────────────────────────────────────────────────

  describe('deleteProcedureItem', () => {
    it('sends DELETE to the correct endpoint', async () => {
      const result$ = firstValueFrom(service.deleteProcedureItem('item-1'));

      const req = httpMock.expectOne('/api/v1/treatment-plans/items/item-1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      await result$;
    });
  });

  // ── completeProcedure ───────────────────────────────────────────────────────

  describe('completeProcedure', () => {
    it('sends PATCH to the complete endpoint', async () => {
      const result$ = firstValueFrom(service.completeProcedure('item-1'));

      const req = httpMock.expectOne('/api/v1/treatment-plans/items/item-1/complete');
      expect(req.request.method).toBe('PATCH');
      req.flush(null);

      await result$;
    });
  });

  // ── startProcedure ──────────────────────────────────────────────────────────

  describe('startProcedure', () => {
    it('sends PUT with status APPROVED', async () => {
      const result$ = firstValueFrom(service.startProcedure('item-1', 'Extração de Siso'));

      const req = httpMock.expectOne('/api/v1/treatment-plans/items/item-1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.status).toBe('APPROVED');
      expect(req.request.body.description).toBe('Extração de Siso');
      req.flush(null);

      await result$;
    });

    it('sends null description when value is empty or whitespace', async () => {
      const result$ = firstValueFrom(service.startProcedure('item-1', '   '));

      const req = httpMock.expectOne('/api/v1/treatment-plans/items/item-1');
      expect(req.request.body.description).toBeNull();
      req.flush(null);

      await result$;
    });
  });

  // ── updateNotes ─────────────────────────────────────────────────────────────

  describe('updateNotes', () => {
    it('GETs the plan then PUTs with updated notes preserving all existing fields', async () => {
      const result$ = firstValueFrom(service.updateNotes('plan-1', 'Nova observação'));

      const getReq = httpMock.expectOne('/api/v1/treatment-plans/plan-1');
      expect(getReq.request.method).toBe('GET');
      getReq.flush(wrap(PLAN));

      const putReq = httpMock.expectOne('/api/v1/treatment-plans/plan-1');
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body.notes).toBe('Nova observação');
      expect(putReq.request.body.title).toBe('Plano A');
      expect(putReq.request.body.status).toBe('ACTIVE');
      expect(putReq.request.body.totalAmount).toBe(500);
      putReq.flush(null);

      await result$;
    });
  });
});
