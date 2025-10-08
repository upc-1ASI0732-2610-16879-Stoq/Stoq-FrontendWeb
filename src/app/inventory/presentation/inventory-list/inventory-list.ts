import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { RestockingDialogComponent } from '../restocking-dialog/restocking-dialog';

@Component({
  selector: 'app-inventory-list',
  templateUrl: './inventory-list.html',
  styleUrls: ['./inventory-list.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule],
})
export class InventoryListComponent {
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);

  protected t(key: string): string {
    return this.translate.instant(key);
  }

  openRestockingDialog(): void {
    const dialogRef = this.dialog.open(RestockingDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      panelClass: 'restocking-dialog',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Datos de reposición:', result);
        // Aquí puedes manejar los datos guardados
      }
    });
  }
}

