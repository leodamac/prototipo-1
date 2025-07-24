import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Supplier } from '../types';
import { Modal } from './common/Modal'; // Import Modal component

interface AddSupplierModalProps {
  showAddSupplierModal: boolean;
  setShowAddSupplierModal: (show: boolean) => void;
  newSupplier: Partial<Supplier>;
  setNewSupplier: (supplier: Partial<Supplier>) => void;
  handleAddSupplier: () => Promise<void>; // handleAddSupplier now returns a Promise<void>
  editingSupplier: Supplier | null;
  clearForm: () => void;
  supplierError: string | null; // New prop for displaying errors
  setSupplierError: (error: string | null) => void; // New prop to set error
  supplierSuccess: string | null; // New prop for displaying success
  setSupplierSuccess: (success: string | null) => void; // New prop to set success
}

export function AddSupplierModal({
  showAddSupplierModal,
  setShowAddSupplierModal,
  newSupplier,
  setNewSupplier,
  handleAddSupplier,
  editingSupplier,
  clearForm,
  supplierError,
  setSupplierError,
  supplierSuccess,
  setSupplierSuccess,
}: AddSupplierModalProps) {
  const modalTitle = editingSupplier ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor';
  const buttonText = editingSupplier ? 'Guardar Cambios' : 'Añadir Proveedor';

  const handleCloseModal = () => {
    setShowAddSupplierModal(false);
    clearForm();
    setSupplierError(null); // Clear error on close
    setSupplierSuccess(null); // Clear success on close
  };

  const handleSaveClick = async () => {
    setSupplierError(null); // Clear previous errors
    setSupplierSuccess(null); // Clear previous success

    const name = newSupplier.name?.trim();
    const phone = newSupplier.phone?.trim();
    const email = newSupplier.email?.trim();
  
    if (!name) {
      setSupplierError('El nombre del proveedor no puede estar vacío.');
      return;
    }
    if (!phone && !email) {
      setSupplierError('Debe proporcionar al menos un teléfono o un correo electrónico.');
      return;
    }

    try {
      await handleAddSupplier();
      setSupplierSuccess(editingSupplier ? 'Proveedor actualizado con éxito!' : 'Proveedor añadido con éxito!');
    } catch (error: any) {
      setSupplierError(error.message || 'Error desconocido al guardar el proveedor.');
    }
  };

  return (
    <Modal isOpen={showAddSupplierModal} onClose={handleCloseModal} title={modalTitle}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-1">
            Nombre del Proveedor
          </label>
          <input
            type="text"
            value={newSupplier.name || ''}
            onChange={e => {
              setNewSupplier({ ...newSupplier, name: e.target.value });
              setSupplierError(null); // Clear error on change
            }}
            className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
            placeholder="Nombre del proveedor"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-1">
            Teléfono
          </label>
          <input
            type="text"
            value={newSupplier.phone || ''}
            onChange={e => {
              setNewSupplier({ ...newSupplier, phone: e.target.value });
              setSupplierError(null); // Clear error on change
            }}
            className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
            placeholder="Ej: +1234567890"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={newSupplier.email || ''}
            onChange={e => {
              setNewSupplier({ ...newSupplier, email: e.target.value });
              setSupplierError(null); // Clear error on change
            }}
            className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
            placeholder="Ej: proveedor@ejemplo.com"
          />
        </div>
        {supplierError && (
          <p className="text-red-500 text-sm text-center">{supplierError}</p>
        )}
        {supplierSuccess && (
          <p className="text-green-500 text-sm text-center">{supplierSuccess}</p>
        )}
      </div>

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
