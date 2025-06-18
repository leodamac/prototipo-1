export interface Product {
    id: string;
    name: string;
    entryDate: Date;
    expirationDate: Date;
    price: number;
    stock: number;
    type: string;
    image: string;
    qrCode: string;
    barcode: string;
    supplierId: string;
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
    contact: string;
    products: string[];
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

// Tipos adicionales para filtros y búsquedas
export type FilterType = 'all' | 'food' | 'beverage' | 'cleaning' | 'other';
export type DateRangeType = '7d' | '30d' | '90d' | '365d' | 'year';

// Interfaces para estados
export interface InventoryState {
    products: Product[];
    sales: Sale[];
    suppliers: Supplier[];
    notifications: Notification[];
    widgets: DashboardWidget[];
}

// Interfaces para acciones
export interface ProductAction {
    type: 'sell' | 'dispose' | 'restock';
    quantity: number;
    productId: string;
}