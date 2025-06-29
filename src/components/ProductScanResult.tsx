import React, { useState, useEffect } from 'react';
import { Product, Sale, Supplier } from '../types';
import { ProductFormFields } from './ProductFormFields';
import ManageStockModal from './ManageStockModal';

interface ProductScanResultProps {
  product: Product;
  suppliers: Supplier[];
  onManageStock: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onSaleCreated: (sale: Sale) => void; 
}

export function ProductScanResult({
  product,
  suppliers,
  onManageStock,
  onUpdateProduct,
  onSaleCreated,
}: ProductScanResultProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState<Product>(product);

  // Update editedProduct when the product prop changes (e.g., new scan result)
  useEffect(() => {
    setEditedProduct(product);
    setIsEditing(false); // Reset editing state when product changes
  }, [product]);

  const handleSave = () => {
    // This component no longer handles product updates directly.
    // The parent component (ScanProductModal) should handle saving changes
    // if editing is allowed and needs to persist.
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
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
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
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={() => onManageStock(product)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Gestionar Stock
          </button>
        </div>
      </div>

      
    </>
  );
}