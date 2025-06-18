import { createContext, useContext, useState, ReactNode } from 'react';
import { 
    Product, 
    Sale, 
    Supplier, 
    Notification, 
    InventoryState, 
    ProductAction 
} from '../types/inventory';

interface InventoryContextType extends InventoryState {
    // Métodos para productos
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (productId: string) => void;
    handleProductAction: (action: ProductAction) => void;

    // Métodos para ventas
    addSale: (sale: Sale) => void;
    updateSale: (sale: Sale) => void;
    deleteSale: (saleId: string) => void;

    // Métodos para proveedores
    addSupplier: (supplier: Supplier) => void;
    updateSupplier: (supplier: Supplier) => void;
    deleteSupplier: (supplierId: string) => void;

    // Métodos para notificaciones
    addNotification: (notification: Notification) => void;
    markNotificationAsRead: (notificationId: string) => void;
    clearNotifications: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [widgets, setWidgets] = useState<DashboardWidget[]>([]);

    // Implementación de métodos para productos
    const addProduct = (product: Product) => {
        setProducts(prev => [...prev, product]);
    };

    const updateProduct = (product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    };

    const deleteProduct = (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const handleProductAction = (action: ProductAction) => {
        const product = products.find(p => p.id === action.productId);
        if (!product) return;

        switch (action.type) {
            case 'sell':
            case 'dispose':
                updateProduct({
                    ...product,
                    stock: product.stock - action.quantity
                });
                if (action.type === 'sell') {
                    addSale({
                        id: crypto.randomUUID(),
                        productId: product.id,
                        quantity: action.quantity,
                        date: new Date(),
                        type: 'sale'
                    });
                }
                break;
            case 'restock':
                updateProduct({
                    ...product,
                    stock: product.stock + action.quantity
                });
                break;
        }
    };

    // Implementación de métodos para ventas
    const addSale = (sale: Sale) => {
        setSales(prev => [...prev, sale]);
    };

    const updateSale = (sale: Sale) => {
        setSales(prev => prev.map(s => s.id === sale.id ? sale : s));
    };

    const deleteSale = (saleId: string) => {
        setSales(prev => prev.filter(s => s.id !== saleId));
    };

    // Implementación de métodos para proveedores
    const addSupplier = (supplier: Supplier) => {
        setSuppliers(prev => [...prev, supplier]);
    };

    const updateSupplier = (supplier: Supplier) => {
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
    };

    const deleteSupplier = (supplierId: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
    };

    // Implementación de métodos para notificaciones
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [...prev, notification]);
    };

    const markNotificationAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <InventoryContext.Provider value={{
            products,
            sales,
            suppliers,
            notifications,
            widgets,
            addProduct,
            updateProduct,
            deleteProduct,
            handleProductAction,
            addSale,
            updateSale,
            deleteSale,
            addSupplier,
            updateSupplier,
            deleteSupplier,
            addNotification,
            markNotificationAsRead,
            clearNotifications
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (context === undefined) {
        throw new Error('useInventory debe usarse dentro de un InventoryProvider');
    }
    return context;
};