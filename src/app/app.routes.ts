import { Routes } from '@angular/router';
import { Layout } from './shared/presentation/components/layout/layout';
import { DashboardComponent } from './dashboard/presentation/views/dashboard/dashboard';
import { InventoryListComponent } from './inventory/presentation/inventory-list/inventory-list';
import { PersonalAdministrationComponent } from './personal-administration/presentation/personal-administration/personal-administration';
import { ProviderComponent } from './shared/presentation/views/provider/provider';
import { SalesComponent } from './shared/presentation/views/sales/sales';
import { NotFound } from './shared/presentation/views/not-found/not-found';
import { ReportsComponent } from './reports/presentation/views/reports/reports';
import { SettingsComponent } from './settings/presentation/views/settings/settings';
import { authGuard } from './auth/infrastructure/auth-guard';
import { roleGuard } from './auth/infrastructure/role-guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/presentation/views/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '404',
    component: NotFound
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'inventory',
        component: InventoryListComponent
      },
      {
        path: 'inventario',
        component: InventoryListComponent
      },
      {
        path: 'reportes',
        component: ReportsComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'configuracion',
        component: SettingsComponent
      },
      {
        path: 'proveedores',
        component: ProviderComponent
      },
      {
        path: 'venta',
        component: SalesComponent
      },
      {
        path: 'perfil',
        component: PersonalAdministrationComponent,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full'
  }
];
