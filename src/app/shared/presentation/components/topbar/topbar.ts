import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { DashboardStore } from '../../../../dashboard/application/dashboard.store';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    TranslateModule
  ],
  templateUrl: './topbar.html',
  styleUrls: ['./topbar.css']
})
export class TopbarComponent {
  private router = inject(Router);
  private translate = inject(TranslateService);
  protected dashboardStore = inject(DashboardStore);

  /**
   * The dashboard view already renders its own full notifications panel
   * (and a mobile trigger), so the topbar's notification bell/dropdown
   * is hidden there to avoid showing two notification UIs at once.
   */
  showNotifications = true;

  constructor() {
    this.showNotifications = !this.router.url.includes('/dashboard');

    this.router.events.subscribe(() => {
      this.showNotifications = !this.router.url.includes('/dashboard');
    });
  }

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  getNotificationCount(): number {
    return this.dashboardStore.notifications().length;
  }

  getNotifications() {
    return this.dashboardStore.notifications();
  }

  getNotificationMessage(notification: any): string {
    return this.translate.instant(`dashboard.notificationMessages.${notification.title}`, notification.data);
  }
}
