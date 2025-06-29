import React, { useRef, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Product, Supplier } from '../types';
import { Modal } from './common/Modal';
import { ProductFormFields } from './ProductFormFields';

interface AddProductModalProps {
  showAddProductModal: boolean;
  setShowAddProductModal: (show: boolean) => void;
  newProduct: Partial<Product>;
  setNewProduct: (product: Partial<Product>) => void;
  handleAddProduct: () => void;
  suppliers: Supplier[];
  editingProduct: Product | null;
  clearForm: () => void; // New prop to clear the form
  addProductError: string | null; // New prop for displaying errors
}

export function AddProductModal({
  showAddProductModal,
  setShowAddProductModal,
  newProduct,
  setNewProduct,
  handleAddProduct,
  suppliers,
  editingProduct,
  clearForm,
  addProductError,
}: AddProductModalProps) {

  const modalTitle = editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto';
  const buttonText = editingProduct ? 'Guardar Cambios' : 'Añadir Producto';

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    clearForm();
  };

  return (
    <Modal isOpen={showAddProductModal} onClose={handleCloseModal} title={modalTitle}>
      <ProductFormFields
        product={newProduct}
        setProduct={setNewProduct}
        suppliers={suppliers}
      />

      {addProductError && (
        <p className="text-red-500 text-sm text-center mb-4">{addProductError}</p>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
        <button
          onClick={handleCloseModal}
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
    </Modal>
  );
}