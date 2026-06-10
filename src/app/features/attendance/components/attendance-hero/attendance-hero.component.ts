import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-attendance-hero',
  imports: [],
  template: `
    <section class="bg-white px-6 pt-12 pb-28 md:px-12 md:pt-0 md:pb-0 md:bg-[#F9F9F9]">
      <div class="flex flex-col gap-8 md:hidden">
        <div class="flex flex-col gap-4">
          <h1 class="text-[#714A3E] text-5xl font-serif leading-tight tracking-tight">
            Uma jornada de cuidado, onde você estiver.
          </h1>
          <p class="text-[#635D58] text-lg leading-relaxed">
            O atendimento odontológico móvel traz a precisão clínica para o conforto do seu
            ambiente, eliminando barreiras e proporcionando uma experiência humanizada e exclusiva.
          </p>
        </div>

        <div class="relative w-full">
          <img
            src="/home/hero.png"
            alt="Atendimento odontológico humanizado"
            class="w-full h-64 object-cover rounded-2xl"
          />
          <div class="mx-4 -mt-8 relative py-6 px-6 rounded-lg bg-[#8C6255]">
            <p class="text-white text-lg font-serif leading-relaxed">
              "A saúde bucal começa com a confiança e o conforto do paciente."
            </p>
          </div>
        </div>
      </div>

      <div class="hidden md:flex items-center gap-16 mb-32">
        <div class="flex flex-1 flex-col items-start pt-0.5 pr-12">
          <span class="text-[#69594A] text-xs mb-8 font-bold uppercase tracking-widest">
            Excelência em Odontologia
          </span>
          <div class="flex flex-col items-start self-stretch mb-8">
            <h1 class="text-[#7C5145] text-6xl lg:text-7xl font-serif leading-tight">
              Uma jornada de<br />cuidado, onde<br />você estiver.
            </h1>
          </div>
          <p class="text-[#514440] text-xl leading-relaxed">
            Redefinindo a experiência odontológica através de um atendimento itinerante e
            humanizado, unindo a precisão clínica ao conforto do seu lar ou de nossas unidades
            parceiras.
          </p>
        </div>

        <div class="flex flex-1 flex-col items-start relative">
          <img
            src="/home/hero.png"
            alt="Atendimento odontológico humanizado"
            class="w-full h-140 lg:h-175 object-cover rounded-4xl"
          />
          <div
            class="absolute -bottom-8 -left-8 py-9 px-7.75 rounded-xl bg-white max-w-70"
            style="box-shadow: 0px 4px 6px #0000001A"
          >
            <p class="text-[#7C5145] text-lg font-serif italic">
              "A saúde bucal começa com a confiança e o conforto do paciente."
            </p>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceHeroComponent {}
