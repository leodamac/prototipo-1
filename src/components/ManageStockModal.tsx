import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { Product } from '../types';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface ManageStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateProduct: (product: Product) => void;
}

const ManageStockModal: React.FC<ManageStockModalProps> = ({ isOpen, onClose, product, onUpdateProduct }) => {
  const [newStock, setNewStock] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setNewStock(product.stock);
      setError(null);
      setSuccess(null);
    }
  }, [product]);

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setNewStock(value);
    }
  };

  const incrementStock = () => {
    if (product && newStock < (product.maxStock || Infinity)) {
      setNewStock(prev => prev + 1);
    }
  };

  const decrementStock = () => {
    if (newStock > 0) {
      setNewStock(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    if (!product) return;

    setError(null);
    setSuccess(null);

    try {
      const updatedProduct = { ...product, stock: newStock };
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update stock');
      }

      const data = await res.json();
      onUpdateProduct(data);
      setSuccess('Stock actualizado con éxito!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating stock:', err);
      setError(err.message || 'Error al actualizar el stock.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Stock del Producto">
      {product ? (
        <div className="p-4 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{product.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">Tipo: {product.type}</p>
            <p className="text-gray-600 dark:text-gray-300">Precio: ${product.price.toFixed(2)}</p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">Stock Actual: {product.stock} / {product.maxStock || 'N/A'}</p>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={decrementStock}
                className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Disminuir stock"
              >
                <MinusCircle size={24} />
              </button>
              <input
                type="number"
                value={newStock}
                onChange={handleStockChange}
                className="w-32 text-center text-3xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="0"
                max={product.maxStock || 99999}
              />
              <button
                onClick={incrementStock}
                className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
                aria-label="Aumentar stock"
              >
                <PlusCircle size={24} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-center text-sm mt-4">{success}</p>}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 text-center p-4">No se ha seleccionado ningún producto para gestionar el stock.</p>
      )}
    </Modal>
  );
};

export default ManageStockModal;
