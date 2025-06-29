import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Supplier } from '../types';

interface AddSupplierModalProps {
  showAddSupplierModal: boolean;
  setShowAddSupplierModal: (show: boolean) => void;
  newSupplier: Partial<Supplier>;
  setNewSupplier: (supplier: Partial<Supplier>) => void;
  handleAddSupplier: () => void;
  editingSupplier: Supplier | null;
  clearForm: () => void; // New prop to clear the form
}

export function AddSupplierModal({
  showAddSupplierModal,
  setShowAddSupplierModal,
  newSupplier,
  setNewSupplier,
  handleAddSupplier,
  editingSupplier,
  clearForm,
}: AddSupplierModalProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAddSupplierModal(false);
        clearForm();
      }
    }

    if (showAddSupplierModal) {
      setValidationError(null); // Reset error when modal opens
      if (!editingSupplier) {
        setNewSupplier({ name: '', phone: '', email: '', Product: [] }); // Reset form for new supplier
      }
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddSupplierModal, editingSupplier, setNewSupplier, setShowAddSupplierModal, clearForm]);

  if (!showAddSupplierModal) return null;

  const handleCloseModal = () => {
    setShowAddSupplierModal(false);
    clearForm();
  };

  const handleAddSupplierClick = () => {
    if (!newSupplier.name || newSupplier.name.trim() === '') {
      setValidationError('El nombre del proveedor no puede estar vacío.');
      return;
    }
    if (!newSupplier.phone && !newSupplier.email) {
      setValidationError('Debe ingresar al menos un teléfono o un correo electrónico para el proveedor.');
      return;
    }
    setValidationError(null);
    handleAddSupplier();
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60]">
      <div className="fixed inset-0 overflow-y-auto pt-16 sm:pt-20">
        <div className="flex min-h-full items-start justify-center p-4">
          <div
            className="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-xl"
            ref={modalRef} // Add ref here
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {editingSupplier ? 'Editar Proveedor' : 'Añadir Nuevo Proveedor'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Nombre del Proveedor
                </label>
                <input
                  type="text"
                  value={newSupplier.name}
                  onChange={e => {
                    setNewSupplier({ ...newSupplier, name: e.target.value });
                    setValidationError(null); // Clear error on change
                  }}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={newSupplier.phone || ''}
                  onChange={e => {
                    setNewSupplier({ ...newSupplier, phone: e.target.value });
                    setValidationError(null); // Clear error on change
                  }}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: +1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={newSupplier.email || ''}
                  onChange={e => {
                    setNewSupplier({ ...newSupplier, email: e.target.value });
                    setValidationError(null); // Clear error on change
                  }}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Ej: proveedor@ejemplo.com"
                />
              </div>
              {validationError && (
                <p className="text-red-500 text-sm">{validationError}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSupplierClick}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingSupplier ? 'Guardar Cambios' : 'Añadir Proveedor'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
