import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalFooterComponent } from './shared/components/layout/global-footer/global-footer.component';
import { GlobalHeaderComponent } from './shared/components/layout/global-header/global-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GlobalFooterComponent, GlobalHeaderComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
