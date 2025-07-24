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
  handleAddProduct: () => Promise<void>; // handleAddProduct now returns a Promise<void>
  suppliers: Supplier[];
  editingProduct: Product | null;
  clearForm: () => void;
  addProductError: string | null;
  setAddProductError: (error: string | null) => void; // New prop to set error
  addProductSuccess: string | null; // New prop for displaying success
  setAddProductSuccess: (success: string | null) => void; // New prop to set success
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
  setAddProductError,
  addProductSuccess,
  setAddProductSuccess,
}: AddProductModalProps) {

  const modalTitle = editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto';
  const buttonText = editingProduct ? 'Guardar Cambios' : 'Añadir Producto';

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    clearForm();
    setAddProductError(null); // Clear error on close
    setAddProductSuccess(null); // Clear success on close
  };

  const handleSaveClick = async () => {
    setAddProductError(null); // Clear previous errors
    setAddProductSuccess(null); // Clear previous success
    try {
      await handleAddProduct();
      setAddProductSuccess(editingProduct ? 'Producto actualizado con éxito!' : 'Producto añadido con éxito!');
      // No cerramos el modal inmediatamente para que el usuario vea el mensaje de éxito
      // El modal se cerrará después de un breve retraso o cuando el usuario lo cierre manualmente
    } catch (error: any) {
      setAddProductError(error.message || 'Error desconocido al guardar el producto.');
    }
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
      {addProductSuccess && (
        <p className="text-green-500 text-sm text-center mb-4">{addProductSuccess}</p>
      )}

      <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
        <button
          onClick={handleCloseModal}
          className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          onClick={handleSaveClick}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}