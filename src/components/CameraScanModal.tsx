import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Supplier } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from './common/Modal';
import { ProductScanResult } from './ProductScanResult';

interface CameraScanModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  suppliers: Supplier[];
  onProductScanned: (product: Product) => void;
  actionQuantity: number;
  setActionQuantity: (quantity: number) => void;
  onManageStock: (actionType: 'sale' | 'dispose' | 'restock') => void;
  onUpdateProduct: (product: Product) => void;
  onProductNotFound: (scannedCode: string) => void; // New prop
}

export function CameraScanModal({
  showModal,
  setShowModal,
  suppliers,
  onProductScanned,
  actionQuantity,
  setActionQuantity,
  onManageStock,
  onUpdateProduct,
  onProductNotFound
}: CameraScanModalProps) {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'ready' | 'scanning' | 'error' | 'no-camera'>('idle');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null); // Store the scanned code
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const handleRescan = useCallback(() => {
    setScannedProduct(null);
    setScanMessage(null);
    setScannedCode(null);
    setIsScanning(true);
  }, []);

  const handleClose = useCallback(async () => {
    setShowModal(false);
    setScannedProduct(null);
    setIsScanning(false);
    setSelectedCameraId(null);
    setAvailableCameras([]);
    setCameraStatus('idle');
    setScanMessage(null);
  }, [setShowModal]);

  // Effect to get cameras when modal opens
  useEffect(() => {
    if (showModal) {
      setCameraStatus('loading');
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          setAvailableCameras(cameras);
          const defaultCamera = cameras[0];
          setSelectedCameraId(defaultCamera.id); // Select the first camera by default
          setIsFrontCamera(defaultCamera.label.toLowerCase().includes('front') || defaultCamera.label.toLowerCase().includes('user') || defaultCamera.label.toLowerCase().includes('facing front'));
          setCameraStatus('ready');
        } else {
          setCameraStatus('no-camera');
        }
      }).catch(err => {
        console.error("Error getting cameras:", err);
        setCameraStatus('error');
      });
    }
  }, [showModal]);

  // Effect to start/stop scanner based on state changes
  useEffect(() => {
    const qrCodeReaderId = "qr-camera-reader";
    let currentHtml5QrCode: Html5Qrcode | null = null;

    if (showModal && selectedCameraId && cameraStatus === 'ready' && isScanning && !scannedProduct) {
      currentHtml5QrCode = new Html5Qrcode(qrCodeReaderId);
      html5QrCodeRef.current = currentHtml5QrCode; // Store the current instance

      const qrCodeSuccessCallback = (decodedText: string) => {
        setScanMessage(null);
        setScannedCode(null);

        const foundProduct = suppliers.flatMap(s => s.Product || []).find(p => p.qrCode === decodedText || p.barcode === decodedText);
        if (foundProduct) {
          setScannedProduct(foundProduct);
          onProductScanned(foundProduct);
          setIsScanning(false);
        } else {
          setScannedCode(decodedText);
          setScanMessage(`Producto con código "${decodedText}" no encontrado.`);
          setIsScanning(false);
        }
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      currentHtml5QrCode.start(
        selectedCameraId,
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          // console.warn("QR Code scanning error: ", errorMessage);
        }
      ).catch(err => {
        console.error("Failed to start scanner:", err);
        setCameraStatus('error');
        setIsScanning(false);
      });
    }

    return () => {
      // Cleanup function: stop the scanner when the effect re-runs or component unmounts
      if (currentHtml5QrCode && currentHtml5QrCode.isScanning) {
        currentHtml5QrCode.stop().catch(err => console.error("Cleanup: Failed to stop scanner", err));
      }
      html5QrCodeRef.current = null; // Clear the ref after stopping
    };
  }, [showModal, selectedCameraId, cameraStatus, suppliers, onProductScanned, scannedProduct, isScanning]);

  return (
    <Modal isOpen={showModal} onClose={handleClose} title={scannedProduct ? "Producto Encontrado" : "Escanear con Cámara"}>
      <div id="qr-camera-reader" style={{ width: "100%", display: isScanning ? 'block' : 'none', transform: isFrontCamera ? 'scaleX(-1)' : 'none' }}></div>

      {cameraStatus === 'loading' && <p className="text-center text-gray-500 dark:text-gray-400">Cargando cámaras...</p>}
      {cameraStatus === 'no-camera' && <p className="text-center text-red-500">No se encontraron cámaras.</p>}
      {cameraStatus === 'error' && <p className="text-center text-red-500">Error al acceder a la cámara. Asegúrate de haber otorgado los permisos.</p>}

      {scanMessage && <p className="text-center text-red-500 mt-2">{scanMessage}</p>}

      {isScanning && availableCameras.length > 1 && (
        <div className="mt-4">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cámara Actual: {availableCameras.find(c => c.id === selectedCameraId)?.label || 'N/A'}</label>
          <button
            onClick={() => {
              const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
              const nextIndex = (currentIndex + 1) % availableCameras.length;
              const nextCamera = availableCameras[nextIndex];
              setSelectedCameraId(nextCamera.id);
              setIsFrontCamera(nextCamera.label.toLowerCase().includes('front') || nextCamera.label.toLowerCase().includes('user') || nextCamera.label.toLowerCase().includes('facing front'));
              setScannedProduct(null); // Reset scanned product when camera changes
              setCameraStatus('ready'); // Set status to ready to trigger scanner restart
              setScanMessage(null); // Clear messages on camera change
              setScannedCode(null); // Clear scanned code on camera change
            }}
            className="mt-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md shadow-sm hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cambiar Cámara
          </button>
        </div>
      )}

      {!isScanning && scannedProduct && (
        <ProductScanResult
          product={scannedProduct}
          suppliers={suppliers}
          onUpdateProduct={onUpdateProduct}
          actionQuantity={actionQuantity}
          setActionQuantity={setActionQuantity}
          onManageStock={onManageStock}
        />
      )}

      {!isScanning && !scannedProduct && cameraStatus !== 'loading' && cameraStatus !== 'error' && cameraStatus !== 'no-camera' && (
        <div className="text-center p-4">
          {scanMessage && <p className="text-red-500 mb-2">{scanMessage}</p>}
          <p className="text-gray-500 dark:text-gray-400 mb-4">Listo para escanear. Asegúrate de que el código esté visible.</p>
          {scannedCode && (
            <button
              onClick={() => {
                onProductNotFound(scannedCode);
                handleClose();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors mt-2"
            >
              Añadir Producto con Código {scannedCode}
            </button>
          )}
          <button
            onClick={handleRescan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-2"
          >
            Escanear
          </button>
        </div>
      )}
    </Modal>
  );
}
