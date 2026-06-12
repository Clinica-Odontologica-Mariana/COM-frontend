import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { GlobalSidebarComponent } from './shared/components/layout/global-sidebar/global-sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [ConfirmDialogComponent, GlobalSidebarComponent, ToastComponent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
