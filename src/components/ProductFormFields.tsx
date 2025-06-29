import React from 'react';
import { Product, Supplier } from '../types';
import { format } from 'date-fns';

interface ProductFormFieldsProps {
  product: Partial<Product>;
  setProduct: (product: Partial<Product>) => void;
  suppliers: Supplier[];
}

export function ProductFormFields({
  product,
  setProduct,
  suppliers,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
      <div>
        <label htmlFor="product-name" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Nombre</label>
        <input
          id="product-name"
          type="text"
          value={product.name || ''}
          onChange={e => setProduct({ ...product, name: e.target.value })}
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
          value={product.type || ''}
          onChange={e => setProduct({ ...product, type: e.target.value })}
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
            value={product.price || ''}
            onChange={e => setProduct({ ...product, price: parseFloat(e.target.value) })}
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
            value={product.stock || ''}
            onChange={e => setProduct({ ...product, stock: parseInt(e.target.value) })}
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
            value={product.maxStock || ''}
            onChange={e => setProduct({ ...product, maxStock: parseInt(e.target.value) })}
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
          value={product.supplierId || ''}
          onChange={e => setProduct({ ...product, supplierId: e.target.value || null })}
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
            value={product.entryDate ? format(new Date(product.entryDate), 'yyyy-MM-dd') : ''}
            onChange={e => setProduct({ ...product, entryDate: new Date(e.target.value) })}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            title="Fecha de entrada"
          />
        </div>
        <div>
          <label htmlFor="product-expiration-date" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">F. Expiración</label>
          <input
            id="product-expiration-date"
            type="date"
            value={product.expirationDate ? format(new Date(product.expirationDate), 'yyyy-MM-dd') : ''}
            onChange={e => setProduct({ ...product, expirationDate: new Date(e.target.value) })}
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
          value={product.image || ''}
          onChange={e => setProduct({ ...product, image: e.target.value })}
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
            value={product.qrCode || ''}
            onChange={e => setProduct({ ...product, qrCode: e.target.value })}
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
            value={product.barcode || ''}
            onChange={e => setProduct({ ...product, barcode: e.target.value })}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Código de barras del producto"
            title="Código de barras del producto"
          />
        </div>
      </div>
    </div>
  );
}
