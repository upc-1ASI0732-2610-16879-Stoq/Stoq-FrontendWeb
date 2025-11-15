import { Injectable, signal, computed } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ProviderReport } from '../domain/model/provider-report.entity';
import { StockReport } from '../domain/model/stock-report.entity';
import { ExpiringProductReport } from '../domain/model/expiring-product-report.entity';
import { LowStockReport } from '../domain/model/low-stock-report.entity';
import { ProductsApi } from '../../inventory/infrastructure/products-api';
import { ProvidersApi } from '../../providers-management/infrastructure/providers-api';
import { StockApi } from '../../inventory/infrastructure/stock-api';
import { RestockingApi } from '../../inventory/infrastructure/restocking-api';
import { CategoryApi, CategoryResource } from '../../inventory/infrastructure/category-api';
import { Product } from '../../inventory/domain/model/product.entity';
import { Provider } from '../../inventory/domain/model/provider.entity';
import { StockResource } from '../../inventory/infrastructure/stock-response';
import { Restocking } from '../../inventory/domain/model/restocking.entity';
import { Category } from '../../inventory/domain/model/category.entity';

/**
 * Store for managing reports state and operations.
 * @remarks
 * This service orchestrates reports use cases and manages reports state.
 */
@Injectable({
  providedIn: 'root'
})
export class ReportsStore {
  private readonly providersReportSignal = signal<ProviderReport[]>([]);
  private readonly stockReportSignal = signal<StockReport[]>([]);
  private readonly expiringProductsReportSignal = signal<ExpiringProductReport[]>([]);
  private readonly lowStockReportSignal = signal<LowStockReport[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly providersReport = this.providersReportSignal.asReadonly();
  readonly stockReport = this.stockReportSignal.asReadonly();
  readonly expiringProductsReport = this.expiringProductsReportSignal.asReadonly();
  readonly lowStockReport = this.lowStockReportSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  readonly hasProvidersReport = computed(() => this.providersReport().length > 0);
  readonly hasStockReport = computed(() => this.stockReport().length > 0);
  readonly hasExpiringProductsReport = computed(() => this.expiringProductsReport().length > 0);
  readonly hasLowStockReport = computed(() => this.lowStockReport().length > 0);

  constructor(
    private productsApi: ProductsApi,
    private providersApi: ProvidersApi,
    private stockApi: StockApi,
    private restockingApi: RestockingApi,
    private categoryApi: CategoryApi
  ) {}

  /**
   * Loads all reports data.
   */
  loadReportsData(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    // Load all necessary data in parallel using forkJoin
    forkJoin({
      products: this.productsApi.getProducts(),
      providers: this.providersApi.getProviders(),
      stock: this.stockApi.getStock(),
      restockings: this.restockingApi.getRestockings(),
      categories: this.categoryApi.getAll()
    }).subscribe({
      next: ({ products, providers, stock, restockings, categories }) => {
        // Convert CategoryResource[] to Category[]
        const categoryEntities = (categories as CategoryResource[]).map(
          cat => new Category({ id: cat.id, name: cat.name })
        );

        this.generateReports(
          products as Product[],
          providers as Provider[],
          stock as StockResource[],
          restockings as Restocking[],
          categoryEntities
        );
        this.loadingSignal.set(false);
      },
      error: (err: any) => {
        this.errorSignal.set(this.formatError(err, 'Error loading reports data'));
        this.loadingSignal.set(false);
      }
    });
  }

  /**
   * Generates all reports from the loaded data.
   */
  private generateReports(
    products: Product[],
    providers: Provider[],
    stock: StockResource[],
    restockings: Restocking[],
    categories: Category[]
  ): void {
    // Generate providers report
    this.generateProvidersReport(products, providers);

    // Generate stock report
    this.generateStockReport(products, stock, providers, categories);

    // Generate expiring products report
    this.generateExpiringProductsReport(products, stock, restockings, providers, categories);

    // Generate low stock report
    this.generateLowStockReport(products, stock, providers, categories);
  }

  /**
   * Generates the providers report.
   */
  private generateProvidersReport(products: Product[], providers: Provider[]): void {
    const productCountByProvider = new Map<string, number>();

    products.forEach(product => {
      const count = productCountByProvider.get(product.providerId) || 0;
      productCountByProvider.set(product.providerId, count + 1);
    });

    const providersReport = providers.map(provider => {
      return new ProviderReport({
        id: provider.id,
        firstName: provider.firstName,
        lastName: provider.lastName,
        phoneNumber: provider.phoneNumber,
        email: provider.email,
        ruc: provider.ruc,
        productCount: productCountByProvider.get(provider.id) || 0
      });
    });

    this.providersReportSignal.set(providersReport);
  }

  /**
   * Generates the stock report.
   */
  private generateStockReport(
    products: Product[],
    stock: StockResource[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const stockMap = new Map(stock.map(s => [s.productId, s]));

    const stockReport = products
      .filter(product => product.isActive)
      .map(product => {
        const stockData = stockMap.get(product.id);
        return new StockReport({
          id: stockData?.id || `stock-${product.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          currentStock: stockData?.currentStock || 0,
          minStock: product.minStock,
          unitPrice: product.unitPrice,
          lastUpdated: stockData?.lastUpdated || new Date().toISOString().split('T')[0],
          providerName: providerMap.get(product.providerId)
        });
      });

    this.stockReportSignal.set(stockReport);
  }

  /**
   * Generates the expiring products report.
   */
  private generateExpiringProductsReport(
    products: Product[],
    stock: StockResource[],
    restockings: Restocking[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const stockMap = new Map(stock.map(s => [s.productId, s]));

    // Get latest restocking for each product (only those with valid expiration dates)
    const latestRestockingByProduct = new Map<string, { expirationDate: string; lot: string }>();

    restockings.forEach(restocking => {
      // Skip restockings without valid expiration dates
      if (!restocking.expirationDate || restocking.expirationDate.trim() === '') {
        return;
      }

      const expirationDate = new Date(restocking.expirationDate);
      if (isNaN(expirationDate.getTime())) {
        return; // Skip invalid dates
      }

      restocking.items.forEach(item => {
        const existing = latestRestockingByProduct.get(item.productId);
        // Compare by expiration date to get the most recent expiration
        if (!existing || new Date(restocking.expirationDate) > new Date(existing.expirationDate)) {
          latestRestockingByProduct.set(item.productId, {
            expirationDate: restocking.expirationDate,
            lot: restocking.lot || '-'
          });
        }
      });
    });

    // Get all products with expiration dates (no time restriction)
    const expiringProducts = products
      .filter(product => {
        const restockingData = latestRestockingByProduct.get(product.id);
        if (!restockingData) return false;

        // Include all products with expiration dates, regardless of when they expire
        const expirationDate = new Date(restockingData.expirationDate);
        return !isNaN(expirationDate.getTime()); // Valid date check
      })
      .map(product => {
        const restockingData = latestRestockingByProduct.get(product.id)!;
        const stockData = stockMap.get(product.id);

        return new ExpiringProductReport({
          id: `expiring-${product.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          expirationDate: restockingData.expirationDate,
          currentStock: stockData?.currentStock || 0,
          lot: restockingData.lot,
          providerName: providerMap.get(product.providerId)
        });
      })
      .sort((a, b) => {
        const dateA = new Date(a.expirationDate).getTime();
        const dateB = new Date(b.expirationDate).getTime();
        return dateA - dateB;
      });

    this.expiringProductsReportSignal.set(expiringProducts);
  }

  /**
   * Generates the low stock report.
   */
  private generateLowStockReport(
    products: Product[],
    stock: StockResource[],
    providers: Provider[],
    categories: Category[]
  ): void {
    const providerMap = new Map(providers.map(p => [p.id, `${p.firstName} ${p.lastName}`]));
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const stockMap = new Map(stock.map(s => [s.productId, s]));

    const lowStockProducts = products
      .filter(product => {
        const stockData = stockMap.get(product.id);
        const currentStock = stockData?.currentStock || 0;
        return currentStock <= product.minStock && product.isActive;
      })
      .map(product => {
        const stockData = stockMap.get(product.id);
        const currentStock = stockData?.currentStock || 0;

        return new LowStockReport({
          id: `low-stock-${product.id}`,
          productId: product.id,
          productName: product.name,
          categoryName: categoryMap.get(product.categoryId) || '-',
          currentStock: currentStock,
          minStock: product.minStock,
          unitPrice: product.unitPrice,
          providerName: providerMap.get(product.providerId),
          stockDifference: product.minStock - currentStock
        });
      })
      .sort((a, b) => {
        // Sort by stock difference (most critical first)
        return b.stockDifference - a.stockDifference;
      });

    this.lowStockReportSignal.set(lowStockProducts);
  }

  /**
   * Refreshes reports data.
   */
  refresh(): void {
    this.loadReportsData();
  }

  /**
   * Formats error messages for display.
   */
  private formatError(error: any, defaultMessage: string): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return defaultMessage;
  }
}

