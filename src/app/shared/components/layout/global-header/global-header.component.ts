import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="fixed top-0 left-0 right-0 z-50 bg-[#F8F5F2] border-b border-[#E5DCD5]"
      style="box-shadow: 0px 1px 2px 0px #E7E5E47F"
    >
      <div class="flex justify-between items-center px-6 py-4">
        <div class="flex items-center justify-between w-full lg:hidden">
          <button
            (click)="toggleMenu()"
            class="p-1 rounded-full text-[#8C6255]"
            aria-label="Abrir Menu"
          >
            <svg
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z" fill="#8C6255" />
            </svg>
          </button>
          <a routerLink="/" class="ml-auto">
            <img
              src="/Logo_clinica.svg"
              alt="Dra. Mariana Dias"
              class="h-8 w-auto object-contain"
            />
          </a>
        </div>

        <a routerLink="/" class="hidden lg:flex items-center">
          <img src="/Logo_clinica.svg" alt="Dra. Mariana Dias" class="w-35 h-16 object-fill" />
        </a>

        <nav class="hidden lg:flex shrink-0 items-center gap-8">
          <a
            routerLink="/"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link text-stone-600 text-lg transition-colors duration-200 relative group hover:text-[#7C5145]"
          >
            Sobre
            <span
              class="absolute -bottom-1 left-0 w-0 h-px bg-[#7C5145] transition-all duration-200 group-hover:w-full"
            ></span>
          </a>

          <a
            routerLink="/atendimento"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link text-stone-600 text-lg transition-colors duration-200 relative group hover:text-[#7C5145]"
          >
            Atendimento
            <span
              class="absolute -bottom-1 left-0 w-0 h-px bg-[#7C5145] transition-all duration-200 group-hover:w-full"
            ></span>
          </a>

          <a
            routerLink="/"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            class="nav-link text-stone-600 text-lg transition-colors duration-200 relative group hover:text-[#7C5145]"
          >
            Unidades
            <span
              class="absolute -bottom-1 left-0 w-0 h-px bg-[#7C5145] transition-all duration-200 group-hover:w-full"
            ></span>
          </a>
        </nav>

        <button
          class="hidden lg:flex items-center bg-[#7C5145] text-white py-3 px-6 rounded-xl hover:bg-[#6b4539] transition-colors duration-200"
        >
          <span class="text-base">Entrar</span>
        </button>
      </div>
    </header>

    @if (isMenuOpen()) {
      <div
        class="lg:hidden fixed inset-0 z-50 bg-black/30"
        (click)="toggleMenu()"
        aria-hidden="true"
      ></div>

      <aside
        class="lg:hidden fixed top-0 left-0 z-60 h-full w-72 bg-[#F8F5F2] flex flex-col"
        style="box-shadow: 38px 25px 50px 0px rgba(0,0,0,0.25)"
      >
        <div class="flex flex-col h-full p-8">
          <div class="mb-8">
            <span class="text-[#8C6255] text-xl font-serif leading-7"
              >Clínica Dra. Mariana Dias</span
            >
          </div>

          <nav class="flex flex-col gap-2 flex-1" aria-label="Menu principal">
            <a
              routerLink="/"
              routerLinkActive
              #rlaInicio="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="toggleMenu()"
              class="flex items-center gap-4 px-4 py-4 rounded-lg transition-colors hover:bg-[#EDE9E6]"
              [class.border-l-4]="rlaInicio.isActive"
              [class.border-[#8C6255]]="rlaInicio.isActive"
              [class.bg-[#F5F5F4]]="rlaInicio.isActive"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 6V0H18V6H10ZM0 10V0H8V10H0ZM10 18V8H18V18H10ZM0 18V12H8V18H0ZM2 8H6V2H2V8ZM12 16H16V10H12V16ZM12 4H16V2H12V4ZM2 16H6V14H2V16Z"
                  [attr.fill]="rlaInicio.isActive ? '#8C6255' : '#57534E'"
                />
              </svg>
              <span
                class="text-base font-serif leading-6"
                [class.text-[#8C6255]]="rlaInicio.isActive"
                [class.text-[#57534E]]="!rlaInicio.isActive"
              >
                Início
              </span>
            </a>

            <a
              routerLink="/"
              routerLinkActive
              #rlaUnid="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="toggleMenu()"
              class="flex items-center gap-3 px-4 py-4 rounded-lg transition-colors hover:bg-[#EDE9E6]"
              [class.border-l-4]="rlaUnid.isActive"
              [class.border-[#8C6255]]="rlaUnid.isActive"
              [class.bg-[#F5F5F4]]="rlaUnid.isActive"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.16667 6.66664H7.5V4.99998H9.16667V3.33331H10.8333V4.99998H12.5V6.66664H10.8333V8.33331H9.16667V6.66664ZM3.33333 19.1666C3.11232 19.1666 2.90036 19.0788 2.74408 18.9226C2.5878 18.7663 2.5 18.5543 2.5 18.3333V5.83331C2.5 5.6123 2.5878 5.40033 2.74408 5.24405C2.90036 5.08777 3.11232 4.99998 3.33333 4.99998H5.075C5.27086 3.8354 5.87307 2.77791 6.7747 2.01525C7.67634 1.25259 8.81907 0.834106 10 0.834106C11.1809 0.834106 12.3237 1.25259 13.2253 2.01525C14.1269 2.77791 14.7291 3.8354 14.925 4.99998H16.6667C16.8877 4.99998 17.0996 5.08777 17.2559 5.24405C17.4122 5.40033 17.5 5.6123 17.5 5.83331V18.3333C17.5 18.5543 17.4122 18.7663 17.2559 18.9226C17.0996 19.0788 16.8877 19.1666 16.6667 19.1666H3.33333ZM10.8333 17.5V14.1666H9.16667V17.5H10.8333ZM6.66667 5.83331C6.66667 6.49258 6.86216 7.13705 7.22843 7.68521C7.59471 8.23337 8.1153 8.66062 8.72439 8.91291C9.33348 9.1652 10.0037 9.23121 10.6503 9.10259C11.2969 8.97398 11.8908 8.65651 12.357 8.19033C12.8232 7.72416 13.1407 7.13021 13.2693 6.48361C13.3979 5.83701 13.3319 5.16679 13.0796 4.5577C12.8273 3.94861 12.4001 3.42802 11.8519 3.06174C11.3037 2.69547 10.6593 2.49998 10 2.49998C9.11594 2.49998 8.2681 2.85117 7.64298 3.47629C7.01786 4.10141 6.66667 4.94925 6.66667 5.83331ZM4.16667 17.5H7.5V13.3333C7.5 13.1123 7.5878 12.9003 7.74408 12.7441C7.90036 12.5878 8.11232 12.5 8.33333 12.5H11.6667C11.8877 12.5 12.0996 12.5878 12.2559 12.7441C12.4122 12.9003 12.5 13.1123 12.5 13.3333V17.5H15.8333V6.66664H14.925C14.7291 7.83122 14.1269 8.88871 13.2253 9.65137C12.3237 10.414 11.1809 10.8325 10 10.8325C8.81907 10.8325 7.67634 10.414 6.7747 9.65137C5.87307 8.88871 5.27086 7.83122 5.075 6.66664H4.16667V17.5Z"
                  [attr.fill]="rlaUnid.isActive ? '#8C6255' : '#57534E'"
                />
              </svg>
              <span
                class="text-base font-serif leading-6"
                [class.text-[#8C6255]]="rlaUnid.isActive"
                [class.text-[#57534E]]="!rlaUnid.isActive"
              >
                Unidades
              </span>
            </a>

            <a
              routerLink="/atendimento"
              routerLinkActive
              #rlaAtend="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="toggleMenu()"
              class="flex items-center gap-4 px-4 py-4 rounded-lg transition-colors hover:bg-[#EDE9E6]"
              [class.border-l-4]="rlaAtend.isActive"
              [class.border-[#8C6255]]="rlaAtend.isActive"
              [class.bg-[#F5F5F4]]="rlaAtend.isActive"
            >
              <svg
                width="27"
                height="18"
                viewBox="0 0 27 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.97187 0C1.33316 0 0 1.35702 0 3.02469C0 4.5359 1.09952 5.78274 2.52316 6.00359V8.42588C2.52316 8.46158 2.53549 8.4914 2.54221 8.52367C2.00991 8.70752 1.6259 9.21392 1.6259 9.8168V16.6252C1.6259 17.3787 2.22898 17.9951 2.97187 17.9951C3.71267 17.9951 4.318 17.3787 4.318 16.6252V9.81664C4.318 9.21376 3.9311 8.70736 3.40168 8.52351C3.40873 8.49124 3.42042 8.46158 3.42042 8.42572V6.00359C4.8455 5.7829 5.9439 4.53834 5.9439 3.02469C5.9439 1.35881 4.6093 0 2.97187 0ZM3.42042 16.6288C3.42042 16.8793 3.21768 17.0855 2.97187 17.0855C2.72525 17.0855 2.52316 16.8793 2.52316 16.6288V9.82039C2.52316 9.57004 2.72525 9.3637 2.97187 9.3637C3.21784 9.3637 3.42042 9.57004 3.42042 9.82039V16.6288ZM2.97187 5.13715C1.82783 5.13715 0.897262 4.19004 0.897262 3.02567C0.897262 1.8613 1.82783 0.914188 2.97187 0.914188C4.11494 0.914188 5.04664 1.8613 5.04664 3.02567C5.04664 4.19004 4.11591 5.13715 2.97187 5.13715ZM2.96835 1.39646C2.54029 1.39646 2.13802 1.56695 1.83568 1.87515C1.5327 2.18385 1.36823 2.59359 1.36823 3.03105C1.37015 3.92812 2.09094 4.65863 2.97347 4.65863H2.97539C3.40409 4.65781 3.80411 4.487 4.10774 4.17831C4.41024 3.86847 4.57535 3.45954 4.57535 3.02388C4.5723 2.12713 3.85376 1.39646 2.96835 1.39646ZM3.47086 3.53451C3.33859 3.66963 3.16115 3.7446 2.97187 3.74542C2.58257 3.7446 2.26549 3.42303 2.26549 3.02926C2.26373 2.83661 2.3374 2.657 2.47111 2.51862C2.60387 2.38351 2.78178 2.30951 2.97283 2.30951C3.36133 2.30951 3.67504 2.6319 3.676 3.02567C3.6784 3.2175 3.60474 3.3976 3.47086 3.53451ZM9.27384 1.76905C9.11866 1.57281 8.8357 1.5425 8.64273 1.70125L6.2874 3.64192C6.11957 3.78029 6.07313 4.01923 6.17418 4.21286L7.50398 6.738V8.42963C7.50398 8.46516 7.51663 8.49548 7.52271 8.5271C6.99169 8.71078 6.60672 9.21832 6.60672 9.82039V16.6288C6.60672 17.3833 7.21076 17.9985 7.95253 17.9985C8.69381 17.9985 9.2985 17.3833 9.2985 16.6288V9.82039C9.2985 9.21832 8.91288 8.71078 8.3825 8.5271C8.38987 8.49548 8.40124 8.46516 8.40124 8.42963V6.62391C8.40124 6.54894 8.3825 6.47429 8.34663 6.40861L7.13822 4.11442L9.2053 2.41317C9.40035 2.25116 9.42869 1.96528 9.27384 1.76905ZM8.40124 16.6288C8.40124 16.8793 8.1985 17.0855 7.95253 17.0855C7.70591 17.0855 7.50398 16.8793 7.50398 16.6288V9.82039C7.50398 9.57004 7.70591 9.3637 7.95253 9.3637C8.1985 9.3637 8.40124 9.57004 8.40124 9.82039V16.6288ZM13.3169 8.52628C13.3244 8.49238 13.3358 8.46337 13.3358 8.42784V2.28343C13.3358 2.03211 13.1337 1.82658 12.8872 1.82658H10.9801C10.7327 1.82658 10.5316 2.03227 10.5316 2.28343C10.5316 2.53525 10.7327 2.73996 10.9801 2.73996H12.4384V3.80474H10.9801C10.7327 3.80474 10.5316 4.01027 10.5316 4.26143C10.5316 4.51324 10.7327 4.71795 10.9801 4.71795H12.4384V8.42767C12.4384 8.46321 12.4508 8.49238 12.4573 8.52612C11.9261 8.7098 11.5409 9.21653 11.5409 9.81746V16.6259C11.5409 17.3823 12.1451 17.9958 12.8871 17.9958C13.6282 17.9958 14.2329 17.3821 14.2329 16.6259V9.81746C14.2338 9.21669 13.8482 8.71078 13.3169 8.52628ZM13.3366 16.6288C13.3366 16.8793 13.1337 17.0855 12.888 17.0855C12.6413 17.0855 12.4395 16.8793 12.4395 16.6288V9.82039C12.4395 9.57004 12.6414 9.3637 12.888 9.3637C13.1337 9.3637 13.3366 9.57004 13.3366 9.82039V16.6288ZM18.3265 8.52628C18.3353 8.49238 18.3459 8.46337 18.3459 8.42784V2.28343C18.3459 2.03211 18.1433 1.82658 17.8972 1.82658H15.9904C15.7432 1.82658 15.5417 2.03227 15.5417 2.28343V5.82218C15.5417 6.074 15.7432 6.27871 15.9904 6.27871H17.4485V8.42767C17.4485 8.46321 17.4606 8.49238 17.4667 8.52612C16.9357 8.7098 16.5511 9.21653 16.5511 9.81746V16.6259C16.5511 17.3823 17.1559 17.9958 17.897 17.9958C18.6402 17.9958 19.2428 17.3821 19.2428 16.6259V9.81746C19.2432 9.21669 18.8596 8.71078 18.3265 8.52628ZM17.4485 2.73996V3.6724H16.439V2.73996H17.4485ZM16.4391 5.3655V4.58544H17.4486V5.3655H16.4391ZM18.3459 16.6288C18.3459 16.8793 18.1433 17.0855 17.8972 17.0855C17.6499 17.0855 17.4485 16.8793 17.4485 16.6288V9.82039C17.4485 9.57004 17.6499 9.3637 17.8972 9.3637C18.1433 9.3637 18.3459 9.57004 18.3459 9.82039V16.6288ZM27 15.8672C27 15.8148 26.9933 15.7663 26.9774 15.7192L26.4602 3.82316C26.448 3.57917 26.2525 3.38652 26.0115 3.38652H25.188L25.1896 1.44585C25.1896 1.32459 25.1425 1.20724 25.0589 1.12265C24.9752 1.0361 24.861 0.989324 24.7411 0.989324H22.498C22.2496 0.989324 22.0493 1.19403 22.0493 1.44601L22.0472 3.38668H21.1866C20.9448 3.38668 20.7496 3.57933 20.7379 3.8243L20.2546 15.8256C20.2546 15.8274 20.2546 15.829 20.2546 15.831V17.5433C20.2546 17.7946 20.4549 18 20.7032 18H26.5354C26.7825 18 26.9841 17.7946 26.9841 17.5433V15.9576C26.9896 15.925 27 15.8963 27 15.8672ZM22.9445 1.90253H24.2909V3.32899H22.9445V1.90253ZM21.6164 4.29973H25.5807L26.0659 15.4106H21.1692L21.6164 4.29973ZM21.1499 17.0855V16.3237H26.0854V17.0855H21.1499Z"
                  [attr.fill]="rlaAtend.isActive ? '#8C6255' : '#57534E'"
                />
              </svg>
              <span
                class="text-base font-serif leading-6"
                [class.text-[#8C6255]]="rlaAtend.isActive"
                [class.text-[#57534E]]="!rlaAtend.isActive"
              >
                Atendimento
              </span>
            </a>

            <a
              routerLink="/"
              routerLinkActive
              #rlaAdmin="routerLinkActive"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="toggleMenu()"
              class="flex items-center gap-4 px-4 py-4 rounded-lg transition-colors hover:bg-[#EDE9E6]"
              [class.border-l-4]="rlaAdmin.isActive"
              [class.border-[#8C6255]]="rlaAdmin.isActive"
              [class.bg-[#F5F5F4]]="rlaAdmin.isActive"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 16V9H5V16H3ZM9 16V9H11V16H9ZM0 20V18H20V20H0ZM15 16V9H17V16H15ZM0 7V5L10 0L20 5V7H0ZM4.45 5H10H15.55H4.45ZM4.45 5H15.55L10 2.25L4.45 5Z"
                  [attr.fill]="rlaAdmin.isActive ? '#8C6255' : '#57534E'"
                />
              </svg>
              <span
                class="text-base font-serif leading-6"
                [class.text-[#8C6255]]="rlaAdmin.isActive"
                [class.text-[#57534E]]="!rlaAdmin.isActive"
              >
                Acesso Administrativo
              </span>
            </a>
          </nav>
        </div>
      </aside>
    }
  `,
  styles: [
    `
      a.active-link {
        color: #7c5145 !important;
        font-weight: 700;
      }
      a.active-link span {
        width: 100% !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalHeaderComponent {
  isMenuOpen = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }
}
