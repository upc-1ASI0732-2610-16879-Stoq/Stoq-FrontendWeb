import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardStats } from '../domain/model/dashboard-stats.entity';
import { MonthlyIncome } from '../domain/model/monthly-income.entity';
import { ProductSales } from '../domain/model/product-sales.entity';
import { Notification } from '../domain/model/notification.entity';
import { DashboardResponse } from './dashboard-response';
import { environment } from '../../../environments/environment';

/**
 * Service for handling dashboard API calls.
 * @remarks
 * This service manages communication with the dashboard backend.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly apiUrl = environment.platformProviderApiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Gets dashboard statistics.
   * @returns An Observable of DashboardStats.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`).pipe(
      map(response => new DashboardStats({
        productsInInventory: response.stats.productsInInventory,
        monthlyIncome: response.stats.monthlyIncome,
        salesThisMonth: response.stats.salesThisMonth,
        productsWithAlerts: response.stats.productsWithAlerts
      }))
    );
  }

  /**
   * Gets monthly income data for charts.
   * @returns An Observable of MonthlyIncome array.
   */
  getMonthlyIncome(): Observable<MonthlyIncome[]> {
    return this.http.get<{monthlyIncome: any[]}>(`${this.apiUrl}/dashboard`).pipe(
      map(response => response.monthlyIncome.map(item => new MonthlyIncome(item)))
    );
  }

  /**
   * Gets product sales data for charts.
   * @returns An Observable of ProductSales array.
   */
  getProductSales(): Observable<ProductSales[]> {
    return this.http.get<{productSales: any[]}>(`${this.apiUrl}/dashboard`).pipe(
      map(response => response.productSales.map(item => new ProductSales(item)))
    );
  }

  /**
   * Gets notifications for the dashboard.
   * @returns An Observable of Notification array.
   */
  getNotifications(): Observable<Notification[]> {
    return this.http.get<{notifications: any[]}>(`${this.apiUrl}/dashboard`).pipe(
      map(response => response.notifications.map(item => new Notification(item)))
    );
  }
}

