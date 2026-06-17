import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { TreatmentData } from '../../models/treatment.model';
import { ProcedureFormComponent } from '../../components/procedure-form/procedure-form.component';

@Component({
  selector: 'app-create-procedure-page',
  imports: [ProcedureFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (treatment()) {
      <app-procedure-form
        [treatmentId]="treatment()!.id"
        [patientId]="id()"
        [patientName]="treatment()!.patient.name"
        [patientCode]="'ID: #PAC-' + treatment()!.patient.id.slice(0, 4).toUpperCase()"
        [isEdit]="false"
        [existingProcedure]="null"
      />
    }
  `,
})
export class CreateProcedurePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private treatmentService = inject(TreatmentService);
  private platformId = inject(PLATFORM_ID);

  protected id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  private _data = signal<TreatmentData | null>(null);
  protected treatment = computed<TreatmentData | null>(() => this._data());

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.treatmentService.getTreatmentByPatient(this.id()).subscribe((data) => this._data.set(data));
    }
  }
}
