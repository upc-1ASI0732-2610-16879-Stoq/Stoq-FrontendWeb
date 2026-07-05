import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { InventoryStore } from '../../application/inventory.store';
import { Product } from '../../domain/model/product.entity';
import { TranslatePipe } from '@ngx-translate/core';

import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-product-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, TranslatePipe],
  templateUrl: './new-product-dialog.html',
  styleUrls: ['./new-product-dialog.css'],
})
export class NewProductDialogComponent {
  protected readonly store = inject(InventoryStore);
  private dialogRef = inject(MatDialogRef<NewProductDialogComponent>);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data) {
      this.form = {
        name: data.name,
        description: data.description ?? '',
        categoryId: data.categoryId,
        providerId: data.providerId,
        minStock: data.minStock,
        unitPrice: data.unitPrice,
        isActive: data.isActive ?? true
      };
    }
  }

  form = {
    name: '',
    description: '',
    categoryId: '',
    providerId: '',
    minStock: 0,
    unitPrice: '' as string | number,
    isActive: true
  };


  get isValid(): boolean {
    const price = Number(String(this.form.unitPrice).replace(',', '.'));
    return (
      this.form.name.trim().length > 0 &&
      !!this.form.categoryId &&
      !!this.form.providerId &&
      Number(this.form.minStock) >= 0 &&
      !isNaN(price) && price >= 0
    );
  }

  cancel() { this.dialogRef.close(false); }

  save() {
    const unitPrice = Number(String(this.form.unitPrice).replace(',', '.'));

    const product = new Product({
      id: this.data ? this.data.id : '',
      name: this.form.name.trim(),
      description: this.form.description.trim(),
      categoryId: this.form.categoryId,
      providerId: String(this.form.providerId),
      minStock: Number(this.form.minStock),
      unitPrice,
      isActive: this.form.isActive
    });

    if (this.data) {
      this.store.updateProduct(product);
    } else {
      this.store.addProduct(product);
    }

    this.dialogRef.close(true);
  }
}
