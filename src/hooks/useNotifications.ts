import { useCallback } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product } from '../types/inventory';

export const useNotifications = () => {
  const { products, addNotification } = useInventory();

  const checkLowStock = useCallback((product: Product) => {
    if (product.stock <= 5) {
      addNotification({
        id: crypto.randomUUID(),
        message: `Stock bajo para ${product.name}`,
        type: 'warning',
        date: new Date(),
        read: false
      });
    }
  }, [addNotification]);

  const checkExpirationDate = useCallback((product: Product) => {
    const daysUntilExpiration = Math.ceil(
      (product.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration <= 7) {
      addNotification({
        id: crypto.randomUUID(),
        message: `${product.name} caduca en ${daysUntilExpiration} días`,
        type: 'danger',
        date: new Date(),
        read: false
      });
    }
  }, [addNotification]);

  return { checkLowStock, checkExpirationDate };
};