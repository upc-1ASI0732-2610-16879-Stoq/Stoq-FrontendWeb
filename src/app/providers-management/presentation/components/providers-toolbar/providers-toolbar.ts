import {Component, inject} from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';

import {MatInput} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {MatFabButton} from '@angular/material/button';
import {ProviderFormDialog} from '../provider-form-dialog/provider-form-dialog';
import {MatDialog} from '@angular/material/dialog';
import {Provider} from '../../../../inventory/domain/model/provider.entity';
import {ProvidersStore} from '../../../application/providers.store';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-providers-toolbar',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatIconModule,
    TranslatePipe,
    MatFabButton,
    MatSnackBarModule
  ],
  templateUrl: './providers-toolbar.html',
  styleUrl: './providers-toolbar.css'
})
export class ProvidersToolbar {
  protected readonly store = inject(ProvidersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  searchTerm = '';

  applyFilters(): void {
    const normalizedSearchTerm = this.searchTerm.trim();

    this.store.applyFilter(normalizedSearchTerm);

    this.snackBar.open(
      normalizedSearchTerm
        ? this.translate.instant('providers-view.providers-toolbar.filter-applied')
        : this.translate.instant('providers-view.providers-toolbar.filter-cleared'),
      this.translate.instant('global.close'),
      {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: [
          'provider-feedback-snackbar',
          normalizedSearchTerm
            ? 'provider-feedback-snackbar-success'
            : 'provider-feedback-snackbar-neutral'
        ]
      }
    );
  }

  onCreate() {
    const ref = this.dialog.open(ProviderFormDialog, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'provider-form-dialog',
      disableClose: true,
      data: {}
    });

    ref.afterClosed().subscribe((created?: Provider) => {
      if (!created) return;
      this.store.addProvider(created);
    });
  }
}
