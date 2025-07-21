import React, { useState, useEffect } from 'react';
import { Product, Supplier } from '../types';
import { format } from 'date-fns';
import Image from 'next/image';

interface ProductFormFieldsProps {
  product: Partial<Product>;
  setProduct: (product: Partial<Product>) => void;
  suppliers: Supplier[];
  onImageSelected?: (file: File | null) => void; // New prop
}

export function ProductFormFields({
  product,
  setProduct,
  suppliers,
  onImageSelected,
}: ProductFormFieldsProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Reset selected file when product changes (e.g., when editing a different product)
    if (product.id) {
      setSelectedFile(null);
    }
  }, [product.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onImageSelected?.(file);
    } else {
      setSelectedFile(null);
      onImageSelected?.(null);
    }
  };

  return (
    <div className="space-y-3 mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
      {/* Existing fields */}

      <div>
        <label htmlFor="product-image-upload" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Imagen del Producto</label>
        <input
          id="product-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          title="Subir imagen del producto"
        />
        {selectedFile && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Archivo seleccionado: {selectedFile.name}</p>
        )}
        {product.image && !selectedFile && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Imagen actual:</p>
            <Image src={product.image} alt="Current product image" width={100} height={100} className="rounded-md object-cover" />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="product-image-url" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">URL Imagen (Opcional)</label>
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
