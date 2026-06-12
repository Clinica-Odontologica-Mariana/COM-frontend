import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { MedicalRecordApi } from '../../../medical-records/api/medical-record.api';
import {
  MedicalRecordDTO,
  PatientDTO,
} from '../../../medical-records/models/patient-record.models';

const HEALTH_CONDITIONS = [
  'Hipertensão',
  'Diabetes',
  'Alergia a Medicação',
  'Cardiopatias',
  'Fumante',
  'Gestante',
] as const;

function cpfValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value ?? '').replace(/\D/g, '');
  if (!v) return null;
  if (v.length !== 11) return { cpf: true };
  return null;
}

@Component({
  selector: 'app-edit-patient',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div style="font-family: 'Manrope', sans-serif">
      <!-- Sticky top header -->
      <header
        class="sticky top-0 z-10 flex items-center justify-between px-8 py-6"
        style="background: rgba(249,249,249,0.85); backdrop-filter: blur(10px)"
      >
        <div class="flex flex-col gap-1">
          <nav class="flex items-center gap-2 text-xs uppercase tracking-[1.2px]">
            <a routerLink="/medical-records" class="text-[#78716C] hover:text-[#7C5145]"
              >Pacientes</a
            >
            <span class="text-[#78716C]">›</span>
            <span class="font-bold text-[#7C5145]">Editar Cadastro</span>
          </nav>
          <h1
            class="text-3xl font-bold text-[#7C5145] leading-9"
            style="font-family: 'Noto Serif', serif"
          >
            Editar Paciente
          </h1>
        </div>
        <div class="flex items-center gap-3">
          <a
            routerLink="/medical-records"
            class="rounded-xl px-6 py-2 text-base font-bold text-[#78716C] transition hover:bg-[#EFE7E3]"
            >Cancelar</a
          >
          <button
            type="button"
            (click)="submit()"
            [disabled]="saving()"
            class="rounded-xl bg-[#7C5145] px-8 py-2 text-base font-bold text-white shadow-[0_10px_15px_-3px_rgba(124,81,69,0.2),0_4px_6px_-4px_rgba(124,81,69,0.2)] transition hover:bg-[#6B4439] disabled:opacity-60"
          >
            {{ saving() ? 'Salvando...' : 'Salvar Registro' }}
          </button>
        </div>
      </header>

      @if (loadError()) {
        <div class="mx-auto max-w-5xl px-8 py-6">
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ loadError() }}
          </div>
        </div>
      }

      @if (saveError()) {
        <div class="mx-auto max-w-5xl px-8 py-6">
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ saveError() }}
          </div>
        </div>
      }

      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="mx-auto max-w-5xl px-8 pb-20 pt-6 space-y-6"
      >
        <!-- Section 1: Dados Pessoais + Foto -->
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start">
          <!-- Personal data card -->
          <section
            class="flex-1 rounded-3xl bg-[#F3F3F3] p-8 space-y-8"
            style="border: 1px solid rgba(231,229,228,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.05)"
          >
            <div class="flex items-center gap-4">
              <div class="grid h-10 w-10 place-items-center rounded-full bg-[rgba(152,105,92,0.2)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif">
                Dados Pessoais
              </h2>
            </div>

            @if (loading()) {
              <div class="space-y-4">
                @for (_ of [1, 2, 3, 4]; track $index) {
                  <div class="h-14 animate-pulse rounded-xl bg-[#E2D8D4]"></div>
                }
              </div>
            } @else {
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- Nome Completo -->
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >Nome Completo</label
                  >
                  <input
                    formControlName="fullName"
                    type="text"
                    placeholder="Ex: Ana Silva Oliveira"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>

                <!-- CPF -->
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >CPF</label
                  >
                  <input
                    formControlName="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>

                <!-- Data de Nascimento -->
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >Data de Nascimento</label
                  >
                  <input
                    formControlName="birthDate"
                    type="date"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>

                <!-- Profissão -->
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >Profissão</label
                  >
                  <input
                    formControlName="notes"
                    type="text"
                    placeholder="Ocupação atual"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>
              </div>

              <!-- Gênero -->
              <div class="flex flex-col gap-1">
                <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                  >Gênero</label
                >
                <div class="mt-2 grid grid-cols-3 gap-4">
                  @for (opt of genderOptions; track opt.value) {
                    <label
                      class="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-3 transition"
                      [class.bg-[#E2E2E2]]="form.get('gender')?.value !== opt.value"
                      [class.bg-[#7C5145]]="form.get('gender')?.value === opt.value"
                    >
                      <input
                        type="radio"
                        formControlName="gender"
                        [value]="opt.value"
                        class="hidden"
                      />
                      <span
                        class="text-sm font-medium"
                        [class.text-[#1A1C1C]]="form.get('gender')?.value !== opt.value"
                        [class.text-white]="form.get('gender')?.value === opt.value"
                        >{{ opt.label }}</span
                      >
                    </label>
                  }
                </div>
              </div>
            }
          </section>

          <!-- Photo card -->
          <section
            class="flex w-full flex-col items-center justify-center rounded-3xl px-8 py-16 lg:w-72"
            style="background: rgba(124,81,69,0.05); border: 1px solid rgba(124,81,69,0.1)"
          >
            <div class="relative">
              <div
                class="grid h-32 w-32 place-items-center rounded-full"
                style="background: #F9F9F9; border: 4px solid #FFFFFF; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-10 w-10 text-[#D6D3D1]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
                  />
                </svg>
              </div>
              <button
                type="button"
                class="absolute bottom-0 right-0 grid h-10 w-10 place-items-center rounded-full bg-[#7C5145] text-white shadow-lg transition hover:bg-[#6B4439]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
            <div class="mt-6 text-center">
              <p class="text-lg font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif">
                Foto do Paciente
              </p>
              <p class="mt-1 text-sm leading-relaxed text-[#78716C]">
                Arquivos JPG ou PNG, máximo 2MB. Recomendado para identificação clínica rápida.
              </p>
            </div>
          </section>
        </div>

        <!-- Section 2: Anamnese Inicial -->
        <section
          class="rounded-3xl bg-[#F3F3F3] p-8 space-y-10"
          style="border: 1px solid rgba(231,229,228,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.05)"
        >
          <div class="flex items-center gap-4">
            <div class="grid h-10 w-10 place-items-center rounded-full bg-[rgba(105,89,74,0.1)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-[#69594A]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 class="text-xl font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif">
              Anamnese Inicial
            </h2>
          </div>

          <div class="relative space-y-10 pl-12">
            <!-- Timeline vertical line -->
            <div class="absolute left-5 top-12 bottom-0 w-px bg-[#E7E5E4]"></div>

            <!-- Motivo da consulta -->
            <div class="relative">
              <div
                class="absolute -left-12 top-1 grid h-10 w-10 place-items-center rounded-full"
                style="background: #F9F9F9; border: 2px solid #69594A"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-3 w-3 text-[#69594A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p class="text-base font-bold text-[#1A1C1C]">Qual o motivo principal da consulta?</p>
              <textarea
                formControlName="generalObservations"
                rows="4"
                placeholder="Descreva as queixas e expectativas do paciente..."
                class="mt-2 w-full rounded-xl bg-[#F9F9F9] px-4 py-4 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none resize-none focus:ring-2 focus:ring-[#7C5145]/30"
              ></textarea>
            </div>

            <!-- Condições de saúde -->
            <div class="relative">
              <div
                class="absolute -left-12 top-1 grid h-10 w-10 place-items-center rounded-full bg-[#EEEEEE]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#69594A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p class="text-base font-bold text-[#1A1C1C]">Condições de saúde e Histórico</p>
              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                @for (cond of healthConditions; track cond) {
                  <label
                    class="flex cursor-pointer items-center gap-3 rounded-xl bg-[#EEEEEE] px-3 py-3 transition hover:bg-[#E2D8D4]"
                  >
                    <input
                      type="checkbox"
                      [checked]="isConditionChecked(cond)"
                      (change)="toggleCondition(cond)"
                      class="h-4 w-4 rounded border-[#D6D3D1] accent-[#7C5145]"
                    />
                    <span class="text-sm text-[#1A1C1C]">{{ cond }}</span>
                  </label>
                }
              </div>
            </div>

            <!-- Medicamentos -->
            <div class="relative">
              <div
                class="absolute -left-12 top-1 grid h-10 w-10 place-items-center rounded-full bg-[#EEEEEE]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#69594A]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.153-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <p class="text-base font-bold text-[#1A1C1C]">Uso contínuo de medicamentos?</p>
              <textarea
                formControlName="continuousMedications"
                rows="3"
                placeholder="Liste medicamentos ou suplementos..."
                class="mt-2 w-full rounded-xl bg-[#F9F9F9] px-4 py-4 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none resize-none focus:ring-2 focus:ring-[#7C5145]/30"
              ></textarea>
            </div>
          </div>
        </section>

        <!-- Section 3: Contato + Localização -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <!-- Contato -->
          <section
            class="rounded-3xl bg-[#F3F3F3] p-8 space-y-6"
            style="border: 1px solid rgba(231,229,228,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.05)"
          >
            <div class="flex items-center gap-4">
              <div class="grid h-10 w-10 place-items-center rounded-full bg-[rgba(152,105,92,0.2)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif">
                Contato
              </h2>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col gap-1">
                <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                  >WhatsApp / Telefone</label
                >
                <div class="flex items-center gap-3 rounded-xl bg-[#EEEEEE] px-4 py-4.25">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 shrink-0 text-[#A8A29E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <input
                    formControlName="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    class="flex-1 bg-transparent text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                  >E-mail</label
                >
                <input
                  formControlName="email"
                  type="email"
                  placeholder="paciente@exemplo.com"
                  class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                />
              </div>

              <div class="flex items-center justify-between rounded-xl bg-[#EEEEEE] px-4 py-4">
                <div>
                  <p class="text-sm font-semibold text-[#1A1C1C]">Notificações</p>
                  <p class="text-xs text-[#78716C]">
                    Enviar lembretes de consulta via WhatsApp automaticamente.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="toggleNotifications()"
                  class="relative h-6 w-11 rounded-full transition"
                  [class.bg-[#7C5145]]="notifications()"
                  [class.bg-[#D6D3D1]]="!notifications()"
                >
                  <span
                    class="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                    [class.translate-x-5]="notifications()"
                    [class.translate-x-0.5]="!notifications()"
                  ></span>
                </button>
              </div>
            </div>
          </section>

          <!-- Localização -->
          <section
            class="rounded-3xl bg-[#F3F3F3] p-8 space-y-6"
            style="border: 1px solid rgba(231,229,228,0.2); box-shadow: 0 1px 2px rgba(0,0,0,0.05)"
          >
            <div class="flex items-center gap-4">
              <div class="grid h-10 w-10 place-items-center rounded-full bg-[rgba(152,105,92,0.2)]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#7C5145]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 class="text-xl font-bold text-[#1A1C1C]" style="font-family: 'Noto Serif', serif">
                Localização
              </h2>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >CEP</label
                  >
                  <input
                    formControlName="cep"
                    type="text"
                    placeholder="00000-000"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >Logradouro</label
                  >
                  <input
                    formControlName="street"
                    type="text"
                    placeholder="Rua, Avenida, Praça..."
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                  >Bairro</label
                >
                <input
                  formControlName="neighborhood"
                  type="text"
                  placeholder="Nome do bairro"
                  class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                />
              </div>

              <div class="grid grid-cols-[1fr_auto] gap-4">
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >Cidade</label
                  >
                  <input
                    formControlName="city"
                    type="text"
                    placeholder="São Paulo"
                    class="rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="px-1 text-xs font-bold uppercase tracking-[0.6px] text-[#78716C]"
                    >UF</label
                  >
                  <input
                    formControlName="state"
                    type="text"
                    maxlength="2"
                    placeholder="SP"
                    class="w-20 rounded-xl bg-[#EEEEEE] px-4 py-4.25 text-base text-[#1A1C1C] placeholder-[#A8A29E] outline-none focus:ring-2 focus:ring-[#7C5145]/30 uppercase"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditPatientComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(MedicalRecordApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private patientId = '';
  private medicalRecordId = '';

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly loadError = signal<string | undefined>(undefined);
  protected readonly saveError = signal<string | undefined>(undefined);
  protected readonly notifications = signal(true);
  protected readonly selectedConditions = signal<Set<string>>(new Set());

  protected readonly healthConditions = HEALTH_CONDITIONS;
  protected readonly genderOptions = [
    { value: 'F', label: 'Feminino' },
    { value: 'M', label: 'Masculino' },
    { value: 'O', label: 'Outro' },
  ];

  protected readonly form = this.fb.group({
    fullName: ['', Validators.required],
    cpf: ['', [Validators.required, cpfValidator]],
    birthDate: ['', Validators.required],
    notes: [''],
    gender: [''],
    phone: [''],
    email: ['', Validators.email],
    cep: [''],
    street: [''],
    neighborhood: [''],
    city: [''],
    state: [''],
    generalObservations: [''],
    continuousMedications: [''],
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.patientId = params.get('id') ?? '';
      this.loadData();
    });
  }

  private loadData(): void {
    this.loading.set(true);
    this.loadError.set(undefined);

    forkJoin({
      patient: this.api.getPatient(this.patientId),
      record: this.api.getMedicalRecord(this.patientId),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ patient, record }) => {
          this.medicalRecordId = record.id;
          this.patchForm(patient, record);
          this.loading.set(false);
        },
        error: () => {
          this.loadError.set('Não foi possível carregar os dados do paciente.');
          this.loading.set(false);
        },
      });
  }

  private patchForm(patient: PatientDTO, record: MedicalRecordDTO): void {
    this.form.patchValue({
      fullName: patient.fullName,
      cpf: patient.cpf,
      birthDate: patient.birthDate ? patient.birthDate.slice(0, 10) : '',
      notes: patient.notes ?? '',
      phone: patient.phone,
      email: patient.email,
      generalObservations: record.generalObservations ?? '',
      continuousMedications: record.continuousMedications ?? '',
    });

    if (record.chronicConditions) {
      const conditions = record.chronicConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      this.selectedConditions.set(new Set(conditions));
    }
  }

  protected isConditionChecked(cond: string): boolean {
    return this.selectedConditions().has(cond);
  }

  protected toggleCondition(cond: string): void {
    const current = new Set(this.selectedConditions());
    if (current.has(cond)) {
      current.delete(cond);
    } else {
      current.add(cond);
    }
    this.selectedConditions.set(current);
  }

  protected toggleNotifications(): void {
    this.notifications.set(!this.notifications());
  }

  protected submit(): void {
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(undefined);

    const v = this.form.getRawValue();
    const chronicConditions = [...this.selectedConditions()].join(', ');

    forkJoin({
      patient: this.api.updatePatient(this.patientId, {
        fullName: v.fullName ?? '',
        cpf: v.cpf ?? '',
        birthDate: v.birthDate ?? '',
        phone: v.phone ?? '',
        email: v.email ?? '',
        notes: v.notes ?? null,
      }),
      record: this.api.updateMedicalRecord(this.medicalRecordId, {
        chronicConditions: chronicConditions || null,
        generalObservations: v.generalObservations ?? null,
        continuousMedications: v.continuousMedications ?? null,
      }),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.router.navigate(['/medical-records', this.patientId]);
        },
        error: () => {
          this.saveError.set('Erro ao salvar os dados. Tente novamente.');
          this.saving.set(false);
        },
      });
  }
}
