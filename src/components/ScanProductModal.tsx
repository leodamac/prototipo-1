import React, { useState, useEffect, useCallback } from 'react';
import { Product, Sale, Supplier } from '../types';
import Image from 'next/image';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from './common/Modal';
import { ProductScanResult } from './ProductScanResult';
import ManageStockModal from './ManageStockModal';

interface ScanProductModalProps {
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  
  onProductNotFound: (scannedCode: string) => void;
  onManageStock: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onSaleCreated: (sale: Sale) => void;
}

export function ScanProductModal({
  showScanModal,
  setShowScanModal,
  products,
  suppliers,
  
  onProductNotFound,
  onManageStock,
  onUpdateProduct,
  onSaleCreated,
}: ScanProductModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);

  const handleCloseModal = useCallback(() => {
    setShowScanModal(false);
    setIsScanning(false);
    setSelectedImage(null);
    setScanMessage(null);
    setScannedCode(null);
  }, [setShowScanModal]);

  const handleScan = useCallback(async () => {
    if (!selectedImage) return;

    setScanMessage(null); // Clear previous messages
    setScannedCode(null); // Clear previous scanned code

    const html5QrCode = new Html5Qrcode("qr-reader", { verbose: false });
    try {
      const result = await html5QrCode.scanFileV2(selectedImage, false);
      const decodedText = result.decodedText;
      console.log("Scanned text (image):", decodedText);
      const foundProduct = products.find(p => p.qrCode === decodedText || p.barcode === decodedText);
      if (foundProduct) {
        onManageStock(foundProduct);
        handleCloseModal();
      } else {
        setScannedCode(decodedText);
        setScanMessage(`Producto con código "${decodedText}" no encontrado.`);
        setIsScanning(false);
      }
    } catch (err) {
      console.error("Error during image scan:", err);
      setScanMessage("No se pudo escanear la imagen. Asegúrate de que el código sea claro y visible.");
    } finally {
      setSelectedImage(null);
    }
  }, [selectedImage, products, onManageStock, handleCloseModal]);

  return (
    <Modal isOpen={showScanModal} onClose={handleCloseModal} title="Escanear Producto">
      <div id="qr-reader" className="hidden"></div>
      {isScanning ? (
        <div className="flex flex-col items-center justify-center">
          {selectedImage ? (
            <div className="w-full min-h-[50vh] bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 rounded-lg mb-4">
              <Image src={URL.createObjectURL(selectedImage)} alt="Selected for scan" width={500} height={500} className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-full min-h-[50vh] bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400 rounded-lg mb-4 p-4">
              <p>Haga clic en el botón de abajo para seleccionar una imagen y escanear un código de barras o QR.</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition-colors cursor-pointer mt-2"
          >
            {selectedImage ? 'Cambiar Imagen' : 'Escanear desde Imagen'}
          </label>
          {selectedImage && (
            <button
              onClick={handleScan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-2"
            >
              Procesar Imagen
            </button>
          )}
          {scanMessage && <p className="text-center text-red-500 mt-2">{scanMessage}</p>}
          {scannedCode && (
            <button
              onClick={() => {
                onProductNotFound(scannedCode);
                handleCloseModal();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors mt-2"
            >
              Añadir Producto con Código {scannedCode}
            </button>
          )}
        </div>
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
      )}
    </Modal>
  );
}