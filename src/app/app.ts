import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';

@Component({
  selector: 'app-root',
  imports: [GlobalFooterComponent, GlobalSidebarComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
