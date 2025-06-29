import React, { useState, useEffect } from 'react';
import { Product, Supplier } from '../types';
import { ProductFormFields } from './ProductFormFields';

interface ProductScanResultProps {
  product: Product;
  suppliers: Supplier[];
  onUpdateProduct: (product: Product) => void;
  actionQuantity: number;
  setActionQuantity: (quantity: number) => void;
  onManageStock: (actionType: 'sale' | 'dispose' | 'restock') => void;
}

export function ProductScanResult({
  product,
  suppliers,
  onUpdateProduct,
  actionQuantity,
  setActionQuantity,
  onManageStock
}: ProductScanResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  // Update editedProduct when the product prop changes (e.g., new scan result)
  useEffect(() => {
    setEditedProduct(product);
    setIsEditing(false); // Reset editing state when product changes
  }, [product]);

  const handleSave = () => {
    onUpdateProduct(editedProduct);
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Editar Producto</h4>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isEditing ? 'Ocultar' : 'Ver/Ocultar'}
        </button>
      </div>
      {isEditing && (
        <>
          <ProductFormFields
            product={editedProduct}
            setProduct={(partialProduct) => setEditedProduct(prev => ({ ...prev, ...partialProduct }))}
            suppliers={suppliers}
          />
          <div className="flex gap-2 justify-end mt-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </>
      )}
      <div className="space-y-3 mt-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Gestionar Stock</h4>
        <div>
          <label htmlFor="action-quantity" className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
            Cantidad
          </label>
          <input
            id="action-quantity"
            type="number"
            min={1}
            value={actionQuantity}
            onChange={e => setActionQuantity(Number(e.target.value))}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => onManageStock('sale')}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Vender
          </button>
          <button
            onClick={() => onManageStock('dispose')}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Desechar
          </button>
          <button
            onClick={() => onManageStock('restock')}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Reponer
          </button>
        </div>
      </div>
    </>
  );
}