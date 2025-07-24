import React from 'react';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import { Supplier } from '../types';

interface SupplierSectionProps {
  suppliers: Supplier[];
  setShowAddSupplierModal: (show: boolean) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export function SupplierSection({
  suppliers,
  setShowAddSupplierModal,
  onEditSupplier,
  onDeleteSupplier,
}: SupplierSectionProps) {
  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <Users size={28} className="text-gray-900 dark:text-gray-100" aria-hidden="true" />
          Proveedores
        </h2>

        <button
          onClick={() => setShowAddSupplierModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Añadir Proveedor
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto hidden md:block">
          <table className="table-auto w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Nombre</th>
                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Teléfono</th>
                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Email</th>
                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Productos</th>
                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              suppliers.map(s => (
                <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-2 text-gray-900 dark:text-gray-100 break-words">
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                      {s.name}
                    </div>
                  </td>
                  <td className="p-2 text-gray-900 dark:text-gray-100 break-words">
                    {s.phone ? (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">
                          {s.phone}
                        </a>
                        <a 
                          href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                          aria-label="Enviar mensaje por WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="text-green-600 hover:text-green-800 lucide-whatsapp" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12.001 2.001C6.475 2.001 2 6.476 2 12.001c0 1.748.454 3.45 1.31 4.95l-1.4 5.14c-.14.51.36.99.87.87l5.14-1.4c1.5.856 3.202 1.31 4.95 1.31 5.526 0 10.001-4.475 10.001-10.001S17.527 2.001 12.001 2.001zm3.217 13.217c-.19.34-.57.46-.88.34l-1.54-.77c-.3-.15-.65-.1-.9.12l-1.26 1.26c-.18.18-.4.27-.62.27-.22 0-.44-.09-.62-.27-.18-.18-.27-.4-.27-.62 0-.22.09-.44.27-.62l1.26-1.26c.22-.25.27-.6.12-.9l-.77-1.54c-.12-.31 0-.69.34-.88l2.42-1.21c.34-.17.74-.07.9.24l1.54.77c.3.15.65.1.9-.12l1.26-1.26c.18-.18.4-.27.62-.27.22 0 .44.09.62.27.18.18.27.4.27.62 0 .22-.09.44-.27.62l-1.26 1.26c-.22.25-.27.6-.12.9l.77 1.54c.12.31 0 .69-.34.88l-2.42 1.21z"/></svg>
                        </a>
                      </div>
                    ) : 'N/A'}
                  </td>
                  <td className="p-2 text-gray-900 dark:text-gray-100 break-words">
                    {s.email ? (
                      <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">
                        {s.email}
                      </a>
                    ) : 'N/A'}
                  </td>
                  <td className="p-2 text-gray-900 dark:text-gray-100 break-words">
                    {(s.Product || []).length} producto{(s.Product || []).length !== 1 ? 's' : ''}
                  </td>
                  <td className="p-2 text-gray-900 dark:text-gray-100 text-center break-words">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditSupplier(s)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        aria-label="Editar proveedor"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => onDeleteSupplier(s.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        aria-label="Eliminar proveedor"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4 p-4">
          {suppliers.length === 0 ? (
            <p className="p-4 text-center text-gray-500 dark:text-gray-400">
              No hay proveedores registrados
            </p>
          ) : (
            suppliers.map(s => (
              <div key={s.id} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 space-y-2 border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users size={20} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                  {s.name}
                </h3>
                <div className="text-gray-900 dark:text-gray-100"><span className="font-medium">Teléfono:</span> {s.phone ? (
                  <div className="inline-flex items-center gap-2">
                    <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">
                      {s.phone}
                    </a>
                    <a 
                      href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                      aria-label="Enviar mensaje por WhatsApp"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" className="lucide lucide-whatsapp text-green-600 hover:text-green-800" stroke="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.001 2.001C6.475 2.001 2 6.476 2 12.001c0 1.748.454 3.45 1.31 4.95l-1.4 5.14c-.14.51.36.99.87.87l5.14-1.4c1.5.856 3.202 1.31 4.95 1.31 5.526 0 10.001-4.475 10.001-10.001S17.527 2.001 12.001 2.001zm3.217 13.217c-.19.34-.57.46-.88.34l-1.54-.77c-.3-.15-.65-.1-.9.12l-1.26 1.26c-.18.18-.4.27-.62.27-.22 0-.44-.09-.62-.27-.18-.18-.27-.4-.27-.62 0-.22.09-.44.27-.62l1.26-1.26c.22-.25.27-.6.12-.9l-.77-1.54c-.12-.31 0-.69.34-.88l2.42-1.21c.34-.17.74-.07.9.24l1.54.77c.3.15.65.1.9-.12l1.26-1.26c.18-.18.4-.27.62-.27.22 0 .44.09.62.27.18.18.27.4.27.62 0 .22-.09.44-.27.62l-1.26 1.26c-.22.25-.27.6-.12.9l.77 1.54c.12.31 0 .69-.34.88l-2.42 1.21z"/></svg>
                    </a>
                  </div>
                ) : 'N/A'}</div>
                <div className="text-gray-900 dark:text-gray-100"><span className="font-medium">Email:</span> {s.email ? (
                  <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">
                    {s.email}
                  </a>
                ) : 'N/A'}</div>
                <p className="text-gray-900 dark:text-gray-100"><span className="font-medium">Productos:</span> {(s.Product || []).length} producto{(s.Product || []).length !== 1 ? 's' : ''}</p>
                
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={() => onEditSupplier(s)}
                    className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    aria-label="Editar proveedor"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => onDeleteSupplier(s.id)}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                    aria-label="Eliminar proveedor"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}