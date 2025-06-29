import React from 'react';
import { Plus, X } from 'lucide-react';
import { Product, Supplier } from '../types';

interface AddProductModalProps {
  showAddProductModal: boolean;
  setShowAddProductModal: (show: boolean) => void;
  newProduct: Partial<Product>;
  setNewProduct: (product: Partial<Product>) => void;
  handleAddProduct: () => void;
  suppliers: Supplier[];
  editingProduct: Product | null;
}

export function AddProductModal({
  showAddProductModal,
  setShowAddProductModal,
  newProduct,
  setNewProduct,
  handleAddProduct,
  suppliers,
  editingProduct,
}: AddProductModalProps) {
  if (!showAddProductModal) return null;

  const modalTitle = editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto';
  const buttonText = editingProduct ? 'Guardar Cambios' : 'Añadir Producto';

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60]">
      <div className="fixed inset-0 overflow-y-auto pt-16 sm:pt-20">
        <div className="flex min-h-full items-start justify-center p-4">
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {modalTitle}
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Nombre del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Tipo
                </label>
                <input
                  type="text"
                  value={newProduct.type}
                  onChange={e => setNewProduct({ ...newProduct, type: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Tipo de producto (ej. Lácteo, Fruta)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={e => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Capacidad Máxima de Stock
                </label>
                <input
                  type="number"
                  value={newProduct.maxStock}
                  onChange={e => setNewProduct({ ...newProduct, maxStock: parseInt(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Proveedor
                </label>
                <select
                  value={newProduct.supplierId || ''}
                  onChange={e => setNewProduct({ ...newProduct, supplierId: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  title="Seleccionar proveedor">
                  <option value="">Seleccionar Proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Fecha de Entrada
                </label>
                <input
                  type="date"
                  value={newProduct.entryDate ? new Date(newProduct.entryDate).toISOString().split('T')[0] : ''}
                  onChange={e => setNewProduct({ ...newProduct, entryDate: new Date(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  title="Fecha de entrada del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  value={newProduct.expirationDate ? new Date(newProduct.expirationDate).toISOString().split('T')[0] : ''}
                  onChange={e => setNewProduct({ ...newProduct, expirationDate: new Date(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  title="Fecha de expiración del producto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  URL de Imagen (Opcional)
                </label>
                <input
                  type="text"
                  value={newProduct.image || ''}
                  onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Código QR (Opcional)
                </label>
                <input
                  type="text"
                  value={newProduct.qrCode || ''}
                  onChange={e => setNewProduct({ ...newProduct, qrCode: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="QR001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Código de Barras (Opcional)
                </label>
                <input
                  type="text"
                  value={newProduct.barcode || ''}
                  onChange={e => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="BAR001"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
