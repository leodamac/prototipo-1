export interface Product {
  id: string;
  name: string;
  entryDate: Date;
  expirationDate: Date;
  price: number;
  stock: number;
  minStock?: number; // Añadido para el stock mínimo
  maxStock?: number; // Añadido para la capacidad máxima de stock
  type: string;
  image: string | null;
  qrCode: string | null;
  barcode: string | null;
  supplierId: string | null;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  date: Date;
  type: 'sale' | 'disposal';
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  products: Product[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  date: Date;
  read: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'sales-trend' | 'inventory-by-type' | 'recent-sales' | 'low-stock' | 'expiring-soon' | 'inventory-table';
  visible: boolean;
}
