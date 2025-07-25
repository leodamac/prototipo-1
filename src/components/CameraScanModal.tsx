import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Sale, Supplier } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import { Modal } from './common/Modal';
import { ProductScanResult } from './ProductScanResult';
import ManageStockModal from './ManageStockModal';

interface CameraScanModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  onUpdateProduct: (product: Product) => void;
  onProductNotFound: (scannedCode: string) => void;
  onManageStock: (product: Product) => void;
  onSaleCreated: (sale: Sale) => void;
}

export function CameraScanModal({
  showModal,
  setShowModal,
  products,
  suppliers,
  onUpdateProduct,
  onProductNotFound,
  onManageStock,
  onSaleCreated,
}: CameraScanModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'loading' | 'ready' | 'scanning' | 'error' | 'no-camera'>('idle');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null); // Store the scanned code
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  const handleRescan = useCallback(() => {
    setScanMessage(null);
    setScannedCode(null);
    setIsScanning(true);
  }, []);

  const stopHtml5Qrcode = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        console.log("Scanner stopped.");
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        html5QrCodeRef.current = null;
      }
    }
  }, []);

  const handleClose = useCallback(async () => {
    await stopHtml5Qrcode();
    setShowModal(false);
    setIsScanning(false);
    setSelectedCameraId(null);
    setAvailableCameras([]);
    setCameraStatus('idle');
    setScanMessage(null);
    setScannedCode(null);
  }, [setShowModal, stopHtml5Qrcode]);

  useEffect(() => {
    if (showModal) {
      setScanMessage(null);
      setScannedCode(null);
      setCameraStatus('loading');
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          setAvailableCameras(cameras);
          const rearCamera = cameras.find(camera =>
            camera.label.toLowerCase().includes('trasera') ||
            camera.label.toLowerCase().includes('back') ||
            camera.label.toLowerCase().includes('environment') ||
            camera.label.toLowerCase().includes('rear')
          );

          const defaultCamera = rearCamera || cameras[0];
          setSelectedCameraId(defaultCamera.id);
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

  useEffect(() => {
    const qrCodeReaderId = "qr-camera-reader";

    if (showModal && selectedCameraId && cameraStatus === 'ready' && isScanning) {
      if (!html5QrCodeRef.current || !html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeReaderId);
      }

      const qrCodeSuccessCallback = (decodedText: string) => {
        console.log("Scanned text:", decodedText);
        console.log("Suppliers data:", suppliers);
        setScanMessage(null);
        setScannedCode(null);

        const foundProduct = products.find(p => p.qrCode === decodedText || p.barcode === decodedText);
        if (foundProduct) {
          onManageStock(foundProduct);
          handleClose();
        } else {
          setScannedCode(decodedText);
          setScanMessage(`Producto con código "${decodedText}" no encontrado.`);
          setIsScanning(false);
        }
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCodeRef.current.start(
        selectedCameraId,
        config,
        qrCodeSuccessCallback,
        (errorMessage) => {
          console.warn("QR Code scanning error: ", errorMessage);
        }
      ).catch(err => {
        console.error("Failed to start scanner:", err);
        setCameraStatus('error');
        setIsScanning(false);
      });
    }

    return () => {
      stopHtml5Qrcode();
    };
  }, [showModal, selectedCameraId, cameraStatus, suppliers, isScanning, stopHtml5Qrcode, products, onManageStock, handleClose]);

  return (
    <Modal isOpen={showModal} onClose={handleClose} title="Escanear con Cámara">
      <div id="qr-camera-reader" style={{ width: "100%", display: isScanning ? 'block' : 'none', transform: isFrontCamera ? 'scaleX(-1)' : 'none' }}></div>

      {cameraStatus === 'loading' && <p className="text-center text-gray-400">Cargando cámaras...</p>}
      {cameraStatus === 'no-camera' && <p className="text-center text-red-500">No se encontraron cámaras.</p>}
      {cameraStatus === 'error' && <p className="text-center text-red-500">Error al acceder a la cámara. Asegúrate de haber otorgado los permisos.</p>}

      

      {isScanning && availableCameras.length > 1 && (
        <div className="flex flex-col mt-4">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-300">Cámara Actual: {availableCameras.find(c => c.id === selectedCameraId)?.label || 'N/A'}</label>
          <button
            onClick={async () => {
              await stopHtml5Qrcode();

              const currentIndex = availableCameras.findIndex(c => c.id === selectedCameraId);
              const nextIndex = (currentIndex + 1) % availableCameras.length;
              const nextCamera = availableCameras[nextIndex];
              setSelectedCameraId(nextCamera.id);
              setIsFrontCamera(nextCamera.label.toLowerCase().includes('front') || nextCamera.label.toLowerCase().includes('user') || nextCamera.label.toLowerCase().includes('facing front'));
              setCameraStatus('ready');
              setScanMessage(null);
              setScannedCode(null);
            }}
            className="mt-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cambiar Cámara
          </button>
        </div>
      )}

      {!isScanning && cameraStatus !== 'loading' && cameraStatus !== 'error' && cameraStatus !== 'no-camera' && (
        <div className="text-center p-4">
          {scanMessage && <p className="text-red-500 mb-2">{scanMessage}</p>}
          <p className="text-gray-400 mb-4">Listo para escanear. Asegúrate de que el código esté visible.</p>
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