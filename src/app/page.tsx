'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Package, Bell, Scan, Menu, ShoppingCart, Users, Camera, Image as ImageIcon, X} from 'lucide-react';
import Image from 'next/image';
import { differenceInDays, startOfDay } from 'date-fns';
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Product, Sale, Supplier, Notification, DashboardWidget, ChallengeSession } from '../types';
import { AddProductModal } from '../components/AddProductModal';
import { AddSupplierModal } from '../components/AddSupplierModal';
import { ScanProductModal } from '../components/ScanProductModal';
import { CameraScanModal } from '../components/CameraScanModal';
import { NotificationPanel } from '../components/NotificationPanel';
import { DashboardSection } from '../components/DashboardSection';
import { ProductSection } from '../components/ProductSection';
import { SalesSection } from '../components/SalesSection';
import { SupplierSection } from '../components/SupplierSection';
import { SettingsSection } from '../components/SettingsSection';
import ManageStockModal from '../components/ManageStockModal';
import { FinishChallengeModal } from '@/components/FinishChallengeModal';
import { ProductScanResult } from '@/components/ProductScanResult';
import { Modal } from '@/components/common/Modal';
import { ChallengeHandler } from '@/components/ChallengeHandler';
import { Suspense } from 'react';

function InventoryManagerContent() {
  const [showMainMenu, setShowMainMenu] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scanError, setScanError] = useState(1);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCameraScanModal, setShowCameraScanModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showManageStockModal, setShowManageStockModal] = useState(false);
  const [productToManageStock, setProductToManageStock] = useState<Product | null>(null);
  const [productToShowDetails, setProductToShowDetails] = useState<Product | null>(null);
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [actionQuantity, setActionQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [compactView, setCompactView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    Product: [],
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: '1', type: 'inventory-table', visible: true },
    { id: '2', type: 'sales-trend', visible: true },
    { id: '3', type: 'inventory-by-type', visible: true },
    { id: '4', type: 'recent-sales', visible: true },
    { id: '5', type: 'low-stock', visible: true },
    { id: '6', type: 'expiring-soon', visible: true }
  ]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [defaultMaxStock, setDefaultMaxStock] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("defaultMaxStock");
      if (saved !== null) return parseInt(saved, 10);
      return 50;
    }
    return 50;
  });

  const [challengeSession, setChallengeSession] = useState<ChallengeSession | null>(null);
  const [showFinishChallengeModal, setShowFinishChallengeModal] = useState(false);
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [finishedChallenge, setFinishedChallenge] = useState(false);

  useEffect(() => {
    localStorage.setItem("defaultMaxStock", String(defaultMaxStock));
  }, [defaultMaxStock]);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // router.push('/?challenge_mode=true'); // Redirect to the main app
  // get params from URL
  useEffect(() => {
    // Obtener challengeSession del localStorage
    const storedSession = localStorage.getItem('challengeSession');
    setChallengeSession(storedSession ? JSON.parse(storedSession) : null);

    // Obtener challenge_mode de la URL
    const params = new URLSearchParams(window.location.search);
    const challengeModeParam = params.get('challenge_mode');
    setIsChallengeMode(challengeModeParam === 'true');
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchData = async () => {
    try {
      const [productsRes, salesRes, suppliersRes, notificationsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/sales'),
        fetch('/api/suppliers'),
        fetch('/api/notifications'),
      ]);

      const productsData = await productsRes.json();
      const salesData = await salesRes.json();
      const suppliersData = await suppliersRes.json();
      const notificationsData = await notificationsRes.json();

      setProducts(productsData.map((p: any) => ({
          ...p,
          entryDate: new Date(p.entryDate),
          expirationDate: new Date(p.expirationDate),
          type: p.type ? p.type.trim().toLowerCase() : p.type, // Normalizar el tipo de producto
        })));
      setSales(salesData.map((s: any) => ({
        ...s,
        date: new Date(s.date),
      })));
      setSuppliers(suppliersData);
      setNotifications(notificationsData.map((n: any) => ({
        ...n,
        date: new Date(n.date),
      })));
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const generateNotifications = async () => {
      const nuevasNotificaciones: Notification[] = [];
      
      products.forEach(producto => {
        const diasParaCaducar = differenceInDays(startOfDay(producto.expirationDate), startOfDay(new Date()));
        
        if (diasParaCaducar <= 3 && diasParaCaducar > 0) {
          nuevasNotificaciones.push({
            id: `exp-${producto.id}`,
            message: `${producto.name} caduca en ${diasParaCaducar} día${diasParaCaducar > 1 ? 's' : ''}`,
            type: 'warning',
            date: new Date(),
            read: false
          });
        } else if (diasParaCaducar <= 0) {
          nuevasNotificaciones.push({
            id: `expired-${producto.id}`,
            message: `${producto.name} ha caducado`,
            type: 'danger',
            date: new Date(),
            read: false
          });
        }
        
        if (producto.stock <= 10) {
          nuevasNotificaciones.push({
            id: `stock-${producto.id}`,
            message: `${producto.name} tiene stock bajo (${producto.stock} unidad${producto.stock !== 1 ? 'es' : ''})`,
            type: 'info',
            date: new Date(),
            read: false
          });
        }
      });
      
      setNotifications(nuevasNotificaciones);
    };
    if (products.length > 0) {
      generateNotifications();
    }
  }, [products]);

  const [addProductError, setAddProductError] = useState<string | null>(null);
  const [addProductSuccess, setAddProductSuccess] = useState<string | null>(null);

  const handleAddOrUpdateProduct = async () => {
    setAddProductError(null);
    setAddProductSuccess(null);
    try {
      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProduct,
            price: parseFloat(String(newProduct.price)),
            stock: parseInt(String(newProduct.stock), 10),
            maxStock: newProduct.maxStock ? parseInt(String(newProduct.maxStock), 10) : defaultMaxStock,
            entryDate: newProduct.entryDate ? newProduct.entryDate.toISOString() : new Date().toISOString(),
            expirationDate: newProduct.expirationDate ? newProduct.expirationDate.toISOString() : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            qrCode: newProduct.qrCode || null,
            barcode: newProduct.barcode || null,
            image: newProduct.image || null,
          }),
        });
        if (!res.ok) throw new Error('Failed to update product');
        await fetchData(); // Refrescar datos
        console.log('Producto actualizado:', await res.json());
        setAddProductSuccess('Producto actualizado con éxito!');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProduct,
            price: parseFloat(String(newProduct.price)),
            stock: parseInt(String(newProduct.stock), 10),
            maxStock: newProduct.maxStock ? parseInt(String(newProduct.maxStock), 10) : defaultMaxStock,
            entryDate: newProduct.entryDate ? newProduct.entryDate.toISOString() : new Date().toISOString(),
            expirationDate: newProduct.expirationDate ? newProduct.expirationDate.toISOString() : new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            qrCode: newProduct.qrCode || null,
            barcode: newProduct.barcode || null,
            image: newProduct.image || null,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json();
          if (errorData.code === '23505' && errorData.detail.includes('qrCode')) {
            throw new Error('Ya existe un producto con este código QR/Barras.');
          } else {
            throw new Error('Failed to add product');
          }
        }
        await fetchData(); // Refrescar datos
        console.log('Producto añadido:', await res.json());
        setAddProductSuccess('Producto añadido con éxito!');
      }
      // No cerramos el modal aquí, se cierra desde AddProductModal después de mostrar el mensaje de éxito
      setNewProduct({
        name: '', type: '', price: 0, stock: 0, supplierId: '', image: '', qrCode: '', barcode: '',
      });
      setEditingProduct(null); // Clear editing state
    } catch (error: any) {
      console.error('Error al guardar producto:', error);
      setAddProductError(error.message || 'Error desconocido al guardar el producto.');
      throw error; // Re-throw to be caught by AddProductModal
    }
  };

  const clearAddProductForm = () => {
    setNewProduct({
      name: '', type: '', price: 0, stock: 0, supplierId: null, image: '', qrCode: '', barcode: '',
      entryDate: new Date(),
      expirationDate: undefined,
    });
    setEditingProduct(null);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const res = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedProduct,
          price: parseFloat(updatedProduct.price as any),
          stock: parseInt(updatedProduct.stock as any),
          maxStock: updatedProduct.maxStock ? parseInt(updatedProduct.maxStock as any) : defaultMaxStock,
          entryDate: updatedProduct.entryDate ? updatedProduct.entryDate.toISOString() : new Date().toISOString(),
          expirationDate: updatedProduct.expirationDate ? updatedProduct.expirationDate.toISOString() : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const data = await res.json();
      setProducts(prev => prev.map(p => (p.id === data.id ? data : p)));
    } catch (error) {
    }
  };

  const [productDeleteError, setProductDeleteError] = useState<string | null>(null);
  const [productDeleteSuccess, setProductDeleteSuccess] = useState<string | null>(null);

  const handleDeleteProduct = async (productId: string) => {
    setProductDeleteError(null);
    setProductDeleteSuccess(null);
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete product');
        await fetchData(); // Refrescar datos
        console.log('Producto eliminado:', productId);
        setProductDeleteSuccess('Producto eliminado con éxito!');
      } catch (error: any) {
        console.error('Error al eliminar producto:', error);
        setProductDeleteError(error.message || 'Error desconocido al eliminar el producto.');
      }
    }
  };

  const [supplierValidationError, setSupplierValidationError] = useState<string | null>(null);
  const [supplierError, setSupplierError] = useState<string | null>(null);
  const [supplierSuccess, setSupplierSuccess] = useState<string | null>(null);

  const handleAddOrUpdateSupplier = async () => {
    setSupplierValidationError(null);
    setSupplierError(null);
    setSupplierSuccess(null);

    const name = newSupplier.name?.trim();
    const phone = newSupplier.phone?.trim();
    const email = newSupplier.email?.trim();
  
    if (!name) {
      setSupplierError('El nombre del proveedor no puede estar vacío.');
      throw new Error('Validation Error');
    }
    if (!phone && !email) {
      setSupplierError('Debe proporcionar al menos un teléfono o un correo electrónico.');
      throw new Error('Validation Error');
    }

    try {
      const supplierData = { name, phone, email};

      if (editingSupplier) {
        const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        });
        if (!res.ok) throw new Error('Failed to update supplier');
        await fetchData(); // Refrescar datos
        setSupplierSuccess('Proveedor actualizado con éxito!');
      } else {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        });
        if (!res.ok) throw new Error('Failed to add supplier');
        await fetchData(); // Refrescar datos
        setSupplierSuccess('Proveedor añadido con éxito!');
      }

      // No cerramos el modal aquí, se cierra desde AddSupplierModal después de mostrar el mensaje de éxito
      setNewSupplier({ name: '', phone: '', email: '', Product: [] });
      setEditingSupplier(null);

    } catch (error: any) {
      console.error('Error al guardar proveedor:', error);
      if (error.message !== 'Validation Error') {
        setSupplierError(error.message || 'Error desconocido al guardar el proveedor.');
      }
      throw error; // Re-throw to be caught by AddSupplierModal
    }
  };

  const clearAddSupplierForm = () => {
    setNewSupplier({ name: '', phone: '', email: '', Product: [] });
    setEditingSupplier(null);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier(supplier);
    setShowAddSupplierModal(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        const res = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete supplier');
        await fetchData(); // Refrescar datos
        console.log('Proveedor eliminado:', supplierId);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleSaleCreated = (newSale: Sale) => {
    setSales(prev => [newSale, ...prev]);
  };

  const handleManageStock = (product: Product) => {
    setProductToShowDetails(product);
    setShowProductDetailsModal(true);
  };

    const handleManageProduct = (product: Product) => {
    setProductToManageStock(product);
    setShowManageStockModal(true);
  };

  const manejarEscaneo = () => {
    setScannedProduct(null);
    setShowScanModal(true);
    setActionQuantity(1);
  };

  const handleProductScannedAndShowDetails = (product: Product, sourceModal: 'scan' | 'camera') => {
    setProductToShowDetails(product);
    setShowProductDetailsModal(true);
    if (sourceModal === 'scan') {
      setShowScanModal(false);
    } else if (sourceModal === 'camera') {
      setShowCameraScanModal(false);
    }
  };

  const handleProductNotFound = (scannedCode: string) => {
    setShowScanModal(false);
    setShowCameraScanModal(false);
    setNewProduct(prev => ({ ...prev, qrCode: scannedCode, barcode: scannedCode }));
    setShowAddProductModal(true);
  };

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
            type: '',
    price: 0,
    stock: 0,
    maxStock: defaultMaxStock, // Usar el valor por defecto configurable
    supplierId: null,
    image: '',
    qrCode: '',
    barcode: '',
    entryDate: new Date(),
    expirationDate: undefined,
  });

  const marcarNotificacionesLeidas = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const notificacionesNoLeidas = notifications.filter(n => !n.read).length;

  const manejarDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);
      setWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showNotifications || showScanModal || showAddProductModal || showAddSupplierModal || showManageStockModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Limpiar al desmontar
    };
  }, [showNotifications, showScanModal, showAddProductModal, showAddSupplierModal, showManageStockModal]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <h1 className="text-xl font-bold flex items-center gap-2 text-blue-400">
              <Package size={24} className="text-blue-400" aria-hidden="true" />
              FreshCode
            </h1>

            {/* Botón de regreso al menú principal (visible cuando no estamos en el menú) */}
            {!showMainMenu && (
              <button
                onClick={() => setShowMainMenu(true)}
                className="px-3 py-1 rounded transition-colors text-blue-400 hover:bg-gray-700"
              >
                Volver al Menú
              </button>
            )}

            {/* Iconos de utilidad */}
            <div className="flex items-center gap-2">
              {/* Botón de menú hamburguesa (solo en móvil, si estamos en una sección) */}
              {!showMainMenu && (
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded hover:bg-gray-700 text-gray-300"
                  aria-label="Menú principal">
                  <Menu size={24} aria-hidden="true" />
                </button>
              )}

              {/* Iconos solo en desktop */}
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded hover:bg-gray-700 text-gray-300"
                    aria-label="Mostrar notificaciones">
                    <Bell size={20} aria-hidden="true" />
                    {notificacionesNoLeidas > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                        {notificacionesNoLeidas}
                      </span>
                    )}
                  </button>
              </div>
              </div>
            </div>
          </div>

          {/* Navegación Desktop (visible solo si no estamos en el menú principal) */}
          {!showMainMenu && (
            <nav className="hidden md:flex items-center gap-2 mt-4 border-t border-gray-700 pt-4">
              <button onClick={() => setActiveTab('dashboard')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-400 hover:bg-gray-700'
                }`}>
                Panel
              </button>
              <button onClick={() => setActiveTab('products')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-400 hover:bg-gray-700'
                }`}>
                Productos
              </button>
              <button onClick={() => setActiveTab('sales')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'sales' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-400 hover:bg-gray-700'
                }`}>
                Movimientos
              </button>
              <button onClick={() => setActiveTab('suppliers')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'suppliers' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-400 hover:bg-gray-700'
                }`}>
                Proveedores
              </button>
              <button onClick={() => setActiveTab('settings')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-blue-400 hover:bg-gray-700'
                }`}>
                Configuración
              </button>
            </nav>
          )}

          {/* Menú móvil (visible solo si no estamos en el menú principal) */}
          {isMobileMenuOpen && !showMainMenu && (
            <nav className="md:hidden py-4 border-t border-gray-700 mt-4">
              <div className="flex flex-col gap-2">
                {/* Enlaces de navegación */}
                <button onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-400 hover:bg-gray-700'
                  }`}>
                  Panel
                </button>
                <button onClick={() => {setActiveTab('products'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'products' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-400 hover:bg-gray-700'
                  }`}>
                  Productos
                </button>
                <button onClick={() => {setActiveTab('sales'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'sales' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-400 hover:bg-gray-700'
                  }`}>
                  Movimientos
                </button>
                <button onClick={() => {setActiveTab('suppliers'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'suppliers' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-400 hover:bg-gray-700'
                  }`}>
                  Proveedores
                </button>
                <button onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-blue-400 hover:bg-gray-700'
                  }`}>
                  Configuración
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className={` flex-grow p-4 lg:p-6 xl:p-8 max-w-[2000px] mx-auto w-full ${showMainMenu ? 'flex flex-col justify-center items-center' : 'overflow-y-auto'}`}>
        {showMainMenu ? (
          <div className="flex flex-col items-center justify-center gap-6 h-full">
          <Image src="/images/logo_dark.png" alt="Productos Icon Dark" width={512} height={512} className="lg:w-7xl lg:h-7xl" priority />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 h-full place-items-center">
              
            {/* Tarjeta de Productos */}
            <button
              onClick={() => { setActiveTab('products'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-blue-600 hover:bg-gray-700"
            >

              <Package size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Productos</span>
            </button>

            {/* Tarjeta de Ventas */}
            <button
              onClick={() => { setActiveTab('sales'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-green-600 hover:bg-gray-700"
            >

              <ShoppingCart size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Movimientos</span>
            </button>

            {/* Tarjeta de Datos Estadísticos (Dashboard) */}
            <button
              onClick={() => { setActiveTab('dashboard'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-purple-600 hover:bg-gray-700"
            >

              <Bell size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Datos Estadísticos</span>
            </button>

            {/* Tarjeta de Contactar Proveedores */}
            <button
              onClick={() => { setActiveTab('suppliers'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-orange-600 hover:bg-gray-700"
            >
              <Users size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Contactar Proveedores</span>
            </button>
          </div>

          </div>
        ) : (
          <>
            {/* Contenido de la sección activa */}
            {activeTab === 'dashboard' && (
              <DndContext sensors={sensors} onDragEnd={manejarDragEnd}>
                <DashboardSection
                  products={products}
                  sales={sales}
                  suppliers={suppliers}
                  widgets={widgets}
                  setWidgets={setWidgets}
                  isClient={isClient}
                  defaultMaxStock={defaultMaxStock}
                />
              </DndContext>
            )}

            {activeTab === 'products' && (
              <ProductSection
                products={products}
                suppliers={suppliers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
                filterSupplier={filterSupplier}
                setFilterSupplier={setFilterSupplier}
                compactView={compactView}
                setShowAddProductModal={setShowAddProductModal}
                onDeleteProduct={handleDeleteProduct}
                productDeleteError={productDeleteError}
                setProductDeleteError={setProductDeleteError}
                productDeleteSuccess={productDeleteSuccess}
                setProductDeleteSuccess={setProductDeleteSuccess}
                onManageStock={handleManageStock}
              />
            )}

            {activeTab === 'sales' && (
              <SalesSection
                sales={sales}
                products={products}
              />
            )}

            {activeTab === 'suppliers' && (
              <SupplierSection
                suppliers={suppliers}
                setShowAddSupplierModal={setShowAddSupplierModal}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsSection
                scanError={scanError}
                setScanError={setScanError}
                defaultMaxStock={defaultMaxStock}
                setDefaultMaxStock={setDefaultMaxStock}
              />
            )}
          </>
        )}

        {/* Speed Dial para Escaneo */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
          {showScanMenu && (
            <div className="flex flex-col items-center gap-4 mb-2 transition-all duration-300">
              {/* Opción Escanear con Cámara */}
              <div className="flex items-center gap-2">
                <span className="bg-gray-700 text-sm text-gray-200 px-3 py-1 rounded-md shadow-lg">Escanear con Cámara</span>
                <button 
                  onClick={() => {
                    setShowCameraScanModal(true);
                    setShowScanMenu(false);
                  }} 
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all"
                  aria-label="Escanear con cámara">
                  <Camera size={24} aria-hidden="true" />
                </button>
              </div>

              {/* Opción Escanear desde Imagen */}
              <div className="flex items-center gap-2">
                <span className="bg-gray-700 text-sm text-gray-200 px-3 py-1 rounded-md shadow-lg">Escanear desde Imagen</span>
                <button 
                  onClick={() => {
                    manejarEscaneo();
                    setShowScanMenu(false);
                  }} 
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transform hover:scale-105 transition-all"
                  aria-label="Escanear desde imagen">
                                    <ImageIcon size={24} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Botón Principal del Speed Dial */}
          <button 
            onClick={() => {//setShowScanMenu(!showScanMenu)
                    setShowCameraScanModal(true);
                    setShowScanMenu(false);
                  }  
            } 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            aria-label={showScanMenu ? "Cerrar menú de escaneo" : "Abrir menú de escaneo"}>
            {showScanMenu ? <X size={32} /> : <Scan size={32} />}
          </button>
        </div>

        {/* Botones de Notificaciones */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-4 md:hidden">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all relative ${notificacionesNoLeidas > 0 ? 'bg-red-900/50 text-red-300' : 'bg-gray-800 text-gray-300'}`}
            aria-label="Ver notificaciones">
            <Bell size={24} aria-hidden="true" className={`${(notificacionesNoLeidas>0)?"text-amber-400":"text-gray-300"}`} />
            {notificacionesNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                {notificacionesNoLeidas}
              </span>
            )}
          </button>

          
        </div>

        {challengeSession && isChallengeMode && (
        <div className="hover group relative">
          <div className="fixed bottom-24 md:bottom-6 left-7 z-50">
            <button
              onClick={() => {
                setShowFinishChallengeModal(true);
                setFinishedChallenge(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              aria-label="Finalizar Desafío"
            >
              <X size={32} />
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span>Terminar Desafío</span>
              <svg className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2" width="12" height="6" viewBox="0 0 12 6">
                <polygon points="6,0 12,6 0,6" fill="#ffffff" />
              </svg>
            </div>
          </div>
        </div>
        )}

        {/* Modal para añadir proveedor */}
      <AddSupplierModal
        showAddSupplierModal={showAddSupplierModal}
        setShowAddSupplierModal={setShowAddSupplierModal}
        newSupplier={newSupplier}
        setNewSupplier={setNewSupplier}
        handleAddSupplier={handleAddOrUpdateSupplier}
        editingSupplier={editingSupplier}
        clearForm={clearAddSupplierForm}
        supplierError={supplierError}
        setSupplierError={setSupplierError}
        supplierSuccess={supplierSuccess}
        setSupplierSuccess={setSupplierSuccess}
      />

      <AddProductModal
        showAddProductModal={showAddProductModal}
        setShowAddProductModal={setShowAddProductModal}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleAddProduct={handleAddOrUpdateProduct}
        suppliers={suppliers}
        editingProduct={editingProduct}
        clearForm={clearAddProductForm}
        addProductError={addProductError}
        setAddProductError={setAddProductError}
        addProductSuccess={addProductSuccess}
        setAddProductSuccess={setAddProductSuccess}
      />

      <ScanProductModal
          showScanModal={showScanModal}
          setShowScanModal={setShowScanModal}
          products={products}
          suppliers={suppliers}
          onProductNotFound={handleProductNotFound}
          onUpdateProduct={handleProductUpdated}
          onSaleCreated={handleSaleCreated}
          onManageStock={handleManageProduct }
      />

      <CameraScanModal
        showModal={showCameraScanModal}
        setShowModal={setShowCameraScanModal}
        products={products}
        suppliers={suppliers}
        onUpdateProduct={handleProductUpdated}
        onProductNotFound={handleProductNotFound}
        onManageStock={ handleManageProduct }
        onSaleCreated={handleSaleCreated}
        manejarEscaneoArchivo={setShowScanModal}
      />

      {showManageStockModal && productToManageStock && (
        <ManageStockModal
          isOpen={showManageStockModal}
          onClose={() => setShowManageStockModal(false)}
          product={productToManageStock}
          onUpdateProduct={handleProductUpdated}
          onSaleCreated={handleSaleCreated} 
        />
      )}

      {showProductDetailsModal && productToShowDetails && (
        <Modal
          isOpen={showProductDetailsModal}
          onClose={() => setShowProductDetailsModal(false)}
          title="Detalles del Producto"
        >
          <ProductScanResult
            product={productToShowDetails}
            suppliers={suppliers}
            onManageStock={(product) => {
              setProductToManageStock(product);
              setShowManageStockModal(true);
              setShowProductDetailsModal(false); // Close details modal when opening manage stock
            }}
            onUpdateProduct={handleUpdateProduct}
            onSaleCreated={handleSaleCreated}
          />
        </Modal>
      )}

      {challengeSession && showFinishChallengeModal && isChallengeMode && (
        <FinishChallengeModal
          isOpen={showFinishChallengeModal}
          onClose={() => setShowFinishChallengeModal(false)}
          sessionId={challengeSession.id}
        />
      )}
      </main>

      <footer className="mt-auto bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Gestor de Inventario - Prototipo
          </p>
        </div>
      </footer>

      <NotificationPanel
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notifications={notifications}
        marcarNotificacionesLeidas={marcarNotificacionesLeidas}
        notificationsRef={notificationsRef}
      />

      
    </div>
  );
}

export default function InventoryManager() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryManagerContent />
    </Suspense>
  );
}
