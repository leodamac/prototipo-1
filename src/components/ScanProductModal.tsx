import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Product, Supplier } from '../types';
import { format } from 'date-fns';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScanProductModalProps {
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  scannedProduct: Product | null;
  actionQuantity: number;
  setActionQuantity: (quantity: number) => void;
  manejarAccionProducto: (actionType: 'sell' | 'dispose' | 'restock') => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
  suppliers: Supplier[]; // Añadir suppliers para el selector
  onUpdateProduct: (product: Product) => void; // Nueva prop para actualizar producto
}

export function ScanProductModal({
  showScanModal,
  setShowScanModal,
  scannedProduct,
  actionQuantity,
  setActionQuantity,
  manejarAccionProducto,
  modalRef,
  suppliers,
  onUpdateProduct,
}: ScanProductModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product | null>(scannedProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedProduct(scannedProduct);
    setIsEditing(false); // Reset to view mode when product changes
    if (showScanModal && !scannedProduct) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }
  }, [scannedProduct, showScanModal]);

  useEffect(() => {
    if (isScanning && scannerRef.current) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        const foundProduct = suppliers.flatMap(s => s.products).find(p => p.qrCode === decodedText || p.barcode === decodedText);
        if (foundProduct) {
          setEditedProduct(foundProduct);
          setIsScanning(false); // Stop scanning
        } else {
          alert("Producto no encontrado. Intente de nuevo.");
          setIsScanning(true); // Continue scanning
        }
        html5QrcodeScanner.clear();
      };

      const onScanError = (errorMessage: string) => {
        // console.warn(errorMessage); // Log errors for debugging, but don't show to user
      };

      html5QrcodeScanner.render(onScanSuccess, onScanError);

      return () => {
        try {
          html5QrcodeScanner.clear();
        } catch (error) {
          console.error("Error clearing scanner: ", error);
        }
      };
    }
  }, [isScanning, suppliers, setShowScanModal]);

  if (!showScanModal) return null;

  const handleSave = () => {
    if (editedProduct) {
      onUpdateProduct(editedProduct);
      setIsEditing(false); // Go back to view mode after saving
    }
  };

  const handleCloseModal = () => {
    setShowScanModal(false);
    setEditedProduct(null);
    setIsEditing(false);
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-end items-center mb-4">
          <button
            onClick={handleCloseModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar modal"
          >
            <X size={24} />
          </button>
        </div>

        {isScanning ? (
          <div id="qr-reader" ref={scannerRef} className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-lg">
            Cargando escáner...
          </div>
        ) : (
          editedProduct ? (
            <>
              {/* Sección de Edición de Producto (contenido actual) */}
              <div className="space-y-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Editar Producto</h4>
                <div>
                  <label htmlFor="product-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Nombre</label>
                  <input
                    id="product-name"
                    type="text"
                    value={editedProduct.name}
                    onChange={e => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Nombre del producto"
                    title="Nombre del producto"
                  />
                </div>
                <div>
                  <label htmlFor="product-type" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Tipo</label>
                  <input
                    id="product-type"
                    type="text"
                    value={editedProduct.type}
                    onChange={e => setEditedProduct({ ...editedProduct, type: e.target.value })}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Tipo de producto"
                    title="Tipo de producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <label htmlFor="product-price" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Precio</label>
                    <input
                      id="product-price"
                      type="number"
                      value={editedProduct.price}
                      onChange={e => setEditedProduct({ ...editedProduct, price: parseFloat(e.target.value) })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      step="0.01"
                      placeholder="0.00"
                      title="Precio del producto"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-stock" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Stock</label>
                    <input
                      id="product-stock"
                      type="number"
                      value={editedProduct.stock}
                      onChange={e => setEditedProduct({ ...editedProduct, stock: parseInt(e.target.value) })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Cantidad en stock"
                      title="Cantidad de stock"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-max-stock" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Cap. Máx.</label>
                    <input
                      id="product-max-stock"
                      type="number"
                      value={editedProduct.maxStock || ''}
                      onChange={e => setEditedProduct({ ...editedProduct, maxStock: parseInt(e.target.value) })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Capacidad máxima de stock"
                      title="Capacidad máxima de stock"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-supplier" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Proveedor</label>
                  <select
                    id="product-supplier"
                    value={editedProduct.supplierId || ''}
                    onChange={e => setEditedProduct({ ...editedProduct, supplierId: e.target.value || null })}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    title="Seleccionar proveedor"
                  >
                    <option value="">Seleccionar Proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <label htmlFor="product-entry-date" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">F. Entrada</label>
                    <input
                      id="product-entry-date"
                      type="date"
                      value={editedProduct.entryDate ? format(new Date(editedProduct.entryDate), 'yyyy-MM-dd') : ''}
                      onChange={e => setEditedProduct({ ...editedProduct, entryDate: new Date(e.target.value) })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      title="Fecha de entrada"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-expiration-date" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">F. Expiración</label>
                    <input
                      id="product-expiration-date"
                      type="date"
                      value={editedProduct.expirationDate ? format(new Date(editedProduct.expirationDate), 'yyyy-MM-dd') : ''}
                      onChange={e => setEditedProduct({ ...editedProduct, expirationDate: new Date(e.target.value) })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      title="Fecha de expiración"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="product-image-url" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">URL Imagen</label>
                  <input
                    id="product-image-url"
                    type="text"
                    value={editedProduct.image || ''}
                    onChange={e => setEditedProduct({ ...editedProduct, image: e.target.value })}
                    className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="URL de la imagen del producto"
                    title="URL de la imagen del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div>
                    <label htmlFor="product-qr-code" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Código QR</label>
                    <input
                      id="product-qr-code"
                      type="text"
                      value={editedProduct.qrCode || ''}
                      onChange={e => setEditedProduct({ ...editedProduct, qrCode: e.target.value })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Código QR del producto"
                      title="Código QR del producto"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-barcode" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Código Barras</label>
                    <input
                      id="product-barcode"
                      type="text"
                      value={editedProduct.barcode || ''}
                      onChange={e => setEditedProduct({ ...editedProduct, barcode: e.target.value })}
                      className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      placeholder="Código de barras del producto"
                      title="Código de barras del producto"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
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
              </div>
            </>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Escanee un código QR o de barras para ver los detalles del producto.</p>
              <button
                onClick={() => setIsScanning(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
              >
                Reintentar Escaneo
              </button>
            </div>
          )
        )}

        {/* Sección de Acciones de Stock */}
        {editedProduct && (
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Acciones de Stock</h4>
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
                onClick={() => manejarAccionProducto('sell')}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Vender
              </button>
              <button
                onClick={() => manejarAccionProducto('dispose')}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Desechar
              </button>
              <button
                onClick={() => manejarAccionProducto('restock')}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Reponer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}