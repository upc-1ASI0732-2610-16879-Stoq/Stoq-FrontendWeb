// typescript
import {Component, inject} from '@angular/core';
import {SalesStore} from '../../../application/sales.store';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {CommonModule} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {KitResource} from '../../../../inventory/infrastructure/kit-response';
import {InventoryStore} from '../../../../inventory/application/inventory.store';
import {Kit} from '../../../../inventory/domain/model/kit.entity';

interface ViewProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-sales-tables',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, TranslatePipe, MatFormField, MatInput],
  templateUrl: './sales-tables.html',
  styleUrls: ['./sales-tables.css']
})
export class SalesTables {
  protected readonly store = inject(SalesStore);

  protected readonly inventoryStore = inject(InventoryStore);

  get availableKits() {
    return this.inventoryStore.kits().filter(kit => kit.isEnabled);
  }

  get products(): ViewProduct[] {
    const products = this.store.products();
    const batches = this.store.batches();

    const stockByProduct = new Map<string, number>();
    for (const b of batches) {
      const current = stockByProduct.get(b.productId) ?? 0;
      stockByProduct.set(b.productId, current + (b.quantity ?? 0));
    }

    return products.map(p => ({
      id: p.id,
      name: p.name,
      price: (p.unitPrice ?? 0),
      stock: stockByProduct.get(p.id) ?? 0
    }));
  }

  get kits(): KitResource[] {
    const kits = this.store.kits();

    return kits.map(k => ({
      id: k.id,
      name: k.name,
      items: k.products
    }));
  }


  cartItems = [
    {name: 'Item A', unitPrice: 4.9, quantity: 1, total: 4.9}
  ];

  get totalAmount():
    number {
    return this.cartItems.reduce((s, i) => s + i.total, 0);
  }

  getProductName(productId: string): string {
    const product = this.store.products().find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  }

  getTotalKitPrice(kit: Kit): number {
    return kit.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  }

  deleteItem(item: any
  ) {
    this.cartItems = this.cartItems.filter(i => i !== item);
  }

  cancelOrder() {
    this.cartItems = [];
  }

  saveOrder() {
    console.log('Guardar orden (no implementado)');
  }
}
