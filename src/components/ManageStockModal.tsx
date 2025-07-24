import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import { Product, Sale } from '../types';
import { MinusCircle, PlusCircle, ShoppingCart, Trash2, Package } from 'lucide-react';

interface ManageStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateProduct: (product: Product) => void;
  onSaleCreated: (sale: Sale) => void;
}

const ManageStockModal: React.FC<ManageStockModalProps> = ({ isOpen, onClose, product, onUpdateProduct, onSaleCreated }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError(null);
      setSuccess(null);
      setIsSubmitting(false);
    }
  }, [isOpen, product]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity(0);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleApiCall = async (apiCall: () => Promise<Response>, successMessage: string, isSale: boolean = false) => {
    if (!product || quantity <= 0) {
      setError("La cantidad debe ser mayor que cero.");
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await apiCall();
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Ocurrió un error en la operación.');
      }
      
      if (isSale) {
        const newSale = await res.json();
        onSaleCreated(newSale);
        // We also need to update the product stock in the UI
        const updatedProduct = { ...product, stock: product.stock - newSale.quantity };
        onUpdateProduct(updatedProduct);
      } else {
        const updatedProduct = await res.json();
        onUpdateProduct(updatedProduct);
      }

      setSuccess(successMessage);
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSell = () => {
    if (quantity > product!.stock) {
      setError("No puedes vender más stock del disponible.");
      return;
    }
    const apiCall = () => fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product!.id,
        quantity,
        type: 'sale',
        unitPrice: product!.price,
      }),
    });
    handleApiCall(apiCall, 'Venta registrada con éxito!', true);
  };

  const handleDispose = () => {
    if (quantity > product!.stock) {
      setError("No puedes desechar más stock del disponible.");
      return;
    }
    const apiCall = () => fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product!.id,
        quantity,
        type: 'disposal',
        unitPrice: product!.price,
      }),
    });
    handleApiCall(apiCall, 'Desecho registrado con éxito!', true);
  };

  const handleAddStock = () => {
    const newStock = product!.stock + quantity;
    if (product!.maxStock && newStock > product!.maxStock) {
      setError(`El stock no puede superar el máximo de ${product!.maxStock}.`);
      return;
    }
    const apiCall = () => fetch(`/api/products/${product!.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, stock: newStock }),
    });
    handleApiCall(apiCall, 'Stock añadido con éxito!');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestionar Stock del Producto">
      {product ? (
        <div className="p-4 space-y-6 bg-gray-800 rounded-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-100 mb-2">{product.name}</h3>
            <p className="text-gray-300">Stock Actual: {product.stock} / {product.maxStock || 'N/A'}</p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <label htmlFor="quantity-input" className="text-lg font-medium text-gray-200">Cantidad a Modificar</label>
            <div className="flex items-center space-x-4">
              <button
                onClick={decrementQuantity}
                className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400"
                aria-label="Disminuir cantidad"
                disabled={isSubmitting || quantity <= 1}
              >
                <MinusCircle size={24} />
              </button>
              <input
                id="quantity-input"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-32 text-center text-3xl font-bold border-2 border-gray-600 rounded-lg py-2 bg-gray-700 text-gray-100 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                min="1"
                disabled={isSubmitting}
              />
              <button
                onClick={incrementQuantity}
                className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400"
                aria-label="Aumentar cantidad"
                disabled={isSubmitting || (product.maxStock ? (product.stock + quantity) >= product.maxStock : false)}
              >
                <PlusCircle size={24} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-center text-sm mt-4">{error}</p>}
          {success && <p className="text-green-500 text-center text-sm mt-4">{success}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <button
              onClick={handleSell}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              disabled={isSubmitting || quantity > product.stock || quantity <= 0}
            >
              <ShoppingCart size={20} />
              Vender
            </button>
            <button
              onClick={handleDispose}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg shadow-md hover:bg-yellow-600 transition-colors disabled:bg-gray-400"
              disabled={isSubmitting || quantity > product.stock || quantity <= 0}
            >
              <Trash2 size={20} />
              Desechar
            </button>
            <button
              onClick={handleAddStock}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
              disabled={isSubmitting || quantity <= 0 || (product.maxStock ? (product.stock + quantity) > product.maxStock : false)}
            >
              <Package size={20} />
              Añadir Stock
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-300 text-center p-4">No se ha seleccionado ningún producto.</p>
      )}
    </Modal>
  );
};

export default ManageStockModal;
