'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Package, Bell, Scan, Moon, Sun, Menu, ShoppingCart, Users } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Product, Sale, Supplier, Notification, DashboardWidget } from '../types';

import { AddProductModal } from '../components/AddProductModal';
import { AddSupplierModal } from '../components/AddSupplierModal';
import { ScanProductModal } from '../components/ScanProductModal';
import { NotificationPanel } from '../components/NotificationPanel';
import { DashboardSection } from '../components/DashboardSection';
import { ProductSection } from '../components/ProductSection';
import { SalesSection } from '../components/SalesSection';
import { SupplierSection } from '../components/SupplierSection';
import { SettingsSection } from '../components/SettingsSection';

import { id } from 'date-fns/locale';

export default function InventoryManager() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) return saved === "true";
      return false; // Siempre claro por defecto
    }
    return false;
  });

  // Este efecto asegura que la clase dark solo esté si darkMode es true y la persiste
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Inicializa el modo oscuro basado en localStorage al cargar el componente
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [showMainMenu, setShowMainMenu] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scanError, setScanError] = useState(1);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [actionQuantity, setActionQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [compactView, setCompactView] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
      return 100; // Valor por defecto inicial
    }
    return 100;
  });

  useEffect(() => {
    localStorage.setItem("defaultMaxStock", String(defaultMaxStock));
  }, [defaultMaxStock]);
  const [dateRange, setDateRange] = useState('7d'); // '7d', '30d', '90d', '365d', 'year'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Fetch data from API
  useEffect(() => {
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
    fetchData();
  }, []);

  // Revisar productos próximos a caducar y stock bajo para notificaciones
  useEffect(() => {
    const generateNotifications = async () => {
      const nuevasNotificaciones: Notification[] = [];
      
      products.forEach(producto => {
        const diasParaCaducar = differenceInDays(producto.expirationDate, new Date());
        
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
      
      // For simplicity, we're not persisting these auto-generated notifications yet.
      // In a real app, you'd likely have a backend process for this or persist them here.
      setNotifications(nuevasNotificaciones);
    };
    if (products.length > 0) { // Only generate if products are loaded
      generateNotifications();
    }
  }, [products]);

  

  

  

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddOrUpdateProduct = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProduct,
            price: parseFloat(newProduct.price as any),
            stock: parseInt(newProduct.stock as any),
            maxStock: newProduct.maxStock ? parseInt(newProduct.maxStock as any) : defaultMaxStock,
            entryDate: newProduct.entryDate ? new Date(newProduct.entryDate) : new Date(),
            expirationDate: newProduct.expirationDate ? new Date(newProduct.expirationDate) : null,
          }),
        });
        if (!res.ok) throw new Error('Failed to update product');
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
        console.log('Producto actualizado:', updatedProduct);
      } else {
        // Add new product
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newProduct,
            price: parseFloat(newProduct.price as any),
            stock: parseInt(newProduct.stock as any),
            maxStock: newProduct.maxStock ? parseInt(newProduct.maxStock as any) : defaultMaxStock,
            entryDate: newProduct.entryDate ? new Date(newProduct.entryDate) : new Date(),
            expirationDate: newProduct.expirationDate ? new Date(newProduct.expirationDate) : null,
          }),
        });
        if (!res.ok) throw new Error('Failed to add product');
        const addedProduct = await res.json();
        setProducts(prev => [...prev, {
          ...addedProduct,
          entryDate: new Date(addedProduct.entryDate),
          expirationDate: addedProduct.expirationDate ? new Date(addedProduct.expirationDate) : undefined,
        }]);
        console.log('Producto añadido:', addedProduct);
      }
      setShowAddProductModal(false);
      setNewProduct({
        name: '', type: '', price: 0, stock: 0, supplierId: '', image: '', qrCode: '', barcode: '',
      });
      setEditingProduct(null); // Clear editing state
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }
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
          entryDate: updatedProduct.entryDate ? new Date(updatedProduct.entryDate) : new Date(),
          expirationDate: updatedProduct.expirationDate ? new Date(updatedProduct.expirationDate) : null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const data = await res.json();
      setProducts(prev => prev.map(p => (p.id === data.id ? data : p)));
      console.log('Producto actualizado desde modal de escaneo:', data);
    } catch (error) {
      console.error('Error al actualizar producto desde modal de escaneo:', error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete product');
        setProducts(prev => prev.filter(p => p.id !== productId));
        console.log('Producto eliminado:', productId);
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    phone: '',
    email: '',
    Product: [],
  });
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierValidationError, setSupplierValidationError] = useState<string | null>(null);

  const handleAddOrUpdateSupplier = async () => {
    setSupplierValidationError(null);

    const name = newSupplier.name?.trim();
    const phone = newSupplier.phone?.trim();
    const email = newSupplier.email?.trim();
  
    const id_supplier = editingSupplier ? editingSupplier.id : Math.floor(Math.random() * 1000000) + 1; // Generar un ID aleatorio si es nuevo

    if (!name) {
      setSupplierValidationError('El nombre del proveedor no puede estar vacío.');
      return;
    }
    if (!phone && !email) {
      setSupplierValidationError('Debe proporcionar al menos un teléfono o un correo electrónico.');
      return;
    }

    try {
      const supplierData = { name, phone, email ,id: id_supplier };

      if (editingSupplier) {
        const res = await fetch(`/api/suppliers/${editingSupplier.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        });
        if (!res.ok) throw new Error('Failed to update supplier');
        const updatedSupplier = await res.json();
        updatedSupplier.Product = editingSupplier.Product;
        setSuppliers(prev => prev.map(s => (s.id === updatedSupplier.id ? updatedSupplier : s)));
      } else {
        const res = await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData),
        });
        if (!res.ok) throw new Error('Failed to add supplier');
        const addedSupplier = await res.json();
        setSuppliers(prev => [...prev, addedSupplier]);
      }

      setShowAddSupplierModal(false);
      setNewSupplier({ name: '', phone: '', email: '', Product: [] });
      setEditingSupplier(null);

    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      setSupplierValidationError('Error al guardar el proveedor. Intente de nuevo.');
    }
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
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        console.log('Proveedor eliminado:', supplierId);
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
  };

  const manejarAccionProducto = async (actionType: 'sell' | 'dispose' | 'restock') => {
    if (!scannedProduct) return;

    let updatedProduct: Product = { ...scannedProduct };
    let newSale: Partial<Sale> = {};

    try {
      if (actionType === 'restock') {
        updatedProduct.stock += actionQuantity;
      } else if (actionType === 'sell') {
        if (scannedProduct.stock < actionQuantity) {
          console.error('Not enough stock for this sale.');
          // Optionally, show a user-facing error
          return;
        }
        updatedProduct.stock -= actionQuantity;
        newSale = {
          productId: scannedProduct.id,
          quantity: actionQuantity,
          date: new Date(),
        };
      } else if (actionType === 'dispose') {
        if (scannedProduct.stock < actionQuantity) {
          console.error('Not enough stock to dispose.');
          // Optionally, show a user-facing error
          return;
        }
        updatedProduct.stock -= actionQuantity;
      }

      // Update product stock
      const resProduct = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!resProduct.ok) throw new Error('Failed to update product stock');
      setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
      console.log(`Stock de ${updatedProduct.name} actualizado a ${updatedProduct.stock}`);

      // Record sale if applicable
      if (actionType === 'sell') {
        const resSale = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSale),
        });
        if (!resSale.ok) throw new Error('Failed to record sale');
        const addedSale = await resSale.json();
        setSales(prev => [...prev, { ...addedSale, date: new Date(addedSale.date) }]);
        console.log(`Venta de ${actionQuantity} unidades de ${updatedProduct.name} registrada.`);
      }
    } catch (error) {
      console.error('Error al manejar acción de producto:', error);
    } finally {
      setShowScanModal(false);
      setScannedProduct(null);
      setActionQuantity(1); // Reset quantity
    }
  };

  const manejarEscaneo = () => {
    setScannedProduct(null); // Reset scanned product before opening scanner
    setShowScanModal(true);
    setActionQuantity(1); // Reset quantity
  };

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    type: '',
    price: 0,
    stock: 0,
    maxStock: defaultMaxStock, // Usar el valor por defecto configurable
    supplierId: '',
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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && 
          !modalRef.current.contains(event.target as Node) && 
          showScanModal) {
        setShowScanModal(false);
        setScannedProduct(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (showNotifications) {
          setShowNotifications(false);
        }
        if (showScanModal) {
          setShowScanModal(false);
          setScannedProduct(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showScanModal, showNotifications]);

  // Efecto para controlar el scroll del body cuando un modal/panel está abierto
  useEffect(() => {
    if (showNotifications || showScanModal || showAddProductModal || showAddSupplierModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = ''; // Limpiar al desmontar
    };
  }, [showNotifications, showScanModal, showAddProductModal, showAddSupplierModal]);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y título */}
            <h1 className="text-xl font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Package size={24} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
              Red Vida
            </h1>

            {/* Botón de regreso al menú principal (visible cuando no estamos en el menú) */}
            {!showMainMenu && (
              <button
                onClick={() => setShowMainMenu(true)}
                className="px-3 py-1 rounded transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
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
                  className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label="Menú principal">
                  <Menu size={24} aria-hidden="true" />
                </button>
              )}

              {/* Iconos solo en desktop */}
              <div className="hidden md:flex items-center gap-2">
                <button 
                  type='button' 
                  onClick={() => setDarkMode(!darkMode)} 
                  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  aria-label="Alternar modo oscuro">
                  {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    aria-label="Mostrar notificaciones">
                    <Bell size={20} aria-hidden="true" />
                    {notificacionesNoLeidas > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 dark:bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
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
            <nav className="hidden md:flex items-center gap-2 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <button onClick={() => setActiveTab('dashboard')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}>
                Panel
              </button>
              <button onClick={() => setActiveTab('products')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}>
                Productos
              </button>
              <button onClick={() => setActiveTab('sales')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'sales' 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}>
                Ventas
              </button>
              <button onClick={() => setActiveTab('suppliers')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'suppliers' 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}>
                Proveedores
              </button>
              <button onClick={() => setActiveTab('settings')} 
                className={`px-3 py-1 rounded transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                    : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                }`}>
                Configuración
              </button>
            </nav>
          )}

          {/* Menú móvil (visible solo si no estamos en el menú principal) */}
          {isMobileMenuOpen && !showMainMenu && (
            <nav className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex flex-col gap-2">
                {/* Enlaces de navegación */}
                <button onClick={() => {setActiveTab('dashboard'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}>
                  Panel
                </button>
                <button onClick={() => {setActiveTab('products'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'products' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}>
                  Productos
                </button>
                <button onClick={() => {setActiveTab('sales'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'sales' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}>
                  Ventas
                </button>
                <button onClick={() => {setActiveTab('suppliers'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'suppliers' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}>
                  Proveedores
                </button>
                <button onClick={() => {setActiveTab('settings'); setIsMobileMenuOpen(false);}} 
                  className={`px-3 py-2 rounded transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-blue-600 dark:bg-blue-500 text-white' 
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}>
                  Configuración
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className={`flex-grow p-4 lg:p-6 xl:p-8 max-w-[2000px] mx-auto w-full ${showMainMenu ? 'flex flex-col justify-center items-center' : ''}`}>
        {showMainMenu ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-6 h-full place-items-center">
            {/* Tarjeta de Productos */}
            <button
              onClick={() => { setActiveTab('products'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700"
            >
              <Package size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Productos</span>
            </button>

            {/* Tarjeta de Ventas */}
            <button
              onClick={() => { setActiveTab('sales'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-gray-700"
            >
              <ShoppingCart size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Ventas</span>
            </button>

            {/* Tarjeta de Datos Estadísticos (Dashboard) */}
            <button
              onClick={() => { setActiveTab('dashboard'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-700"
            >
              <Bell size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Datos Estadísticos</span>
            </button>

            {/* Tarjeta de Contactar Proveedores */}
            <button
              onClick={() => { setActiveTab('suppliers'); setShowMainMenu(false); }}
              className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-700"
            >
              <Users size={48} className="lg:text-7xl" />
              <span className="mt-3 text-xl font-semibold text-center">Contactar Proveedores</span>
            </button>
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
                setCompactView={setCompactView}
                setShowAddProductModal={setShowAddProductModal}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                setScannedProduct={setScannedProduct}
                setShowScanModal={setShowScanModal}
                setActionQuantity={setActionQuantity}
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

        {/* Botón de escaneo QR más prominente (siempre visible) */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
          <button 
            onClick={manejarEscaneo} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            aria-label="Escanear producto">
            <Scan size={32} aria-hidden="true" />
            <span className="sr-only">Escanear producto</span>
          </button>

          {/* Botón de notificaciones en móvil (siempre visible) */}
          <div className="md:hidden">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all relative"
              aria-label="Ver notificaciones">
              <Bell size={24} aria-hidden="true" />
              {notificacionesNoLeidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 dark:bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>
          </div>

          {/* Botón de tema */}
          <div className="md:hidden">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              aria-label="Cambiar tema">
              {darkMode ? <Sun size={24} aria-hidden="true" /> : <Moon size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Modal para añadir proveedor */}
        <AddSupplierModal
        showAddSupplierModal={showAddSupplierModal}
        setShowAddSupplierModal={setShowAddSupplierModal}
        newSupplier={newSupplier}
        setNewSupplier={setNewSupplier}
        handleAddSupplier={handleAddOrUpdateSupplier}
        editingSupplier={editingSupplier}
      />

        <ScanProductModal
        showScanModal={showScanModal}
        setShowScanModal={setShowScanModal}
        scannedProduct={scannedProduct}
        actionQuantity={actionQuantity}
        setActionQuantity={setActionQuantity}
        manejarAccionProducto={manejarAccionProducto}
        modalRef={modalRef}
        suppliers={suppliers}
        onUpdateProduct={handleUpdateProduct}
      />
      </main>

      <footer className="mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
