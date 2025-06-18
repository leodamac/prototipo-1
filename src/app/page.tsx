'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Bell, Scan, Moon, Sun, Check, Calendar, ShoppingCart, Users, Trash2, RefreshCw, X, GripVertical, Settings, Menu } from 'lucide-react';
import { format, subDays, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


interface Product {
  id: string;
  name: string;
  entryDate: Date;
  expirationDate: Date;
  price: number;
  stock: number;
  type: string;
  image: string;
  qrCode: string;
  barcode: string;
  supplierId: string;
}

interface Sale {
  id: string;
  productId: string;
  quantity: number;
  date: Date;
  type: 'sale' | 'disposal';
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  products: string[];
}

interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  date: Date;
  read: boolean;
}

interface DashboardWidget {
  id: string;
  type: 'sales-trend' | 'inventory-by-type' | 'recent-sales' | 'low-stock' | 'expiring-soon' | 'inventory-table';
  visible: boolean;
}

function SortableWidget({ widget, children }: { widget: DashboardWidget; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative bg-white dark:bg-gray-800 rounded shadow-lg dark:shadow-gray-900/30 p-4">
      <div className="absolute top-2 right-2 cursor-move z-10" {...attributes} {...listeners}>
        <GripVertical size={20} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" aria-label="Mover widget" />
      </div>
      {children}
    </div>
  );
}

export default function InventoryManager() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("darkMode");
      if (saved !== null) return saved === "true";
      return false; // Siempre claro por defecto
    }
    return false;
  });

  // Este efecto asegura que la clase dark solo esté si darkMode es true
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  // Este efecto limpia la clase dark en el primer render del cliente si no debe estar
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved === null || saved === "false") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scanError, setScanError] = useState(1);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [actionQuantity, setActionQuantity] = useState(1);
  const [selectedPeriod] = useState('7d');
  const [customDays] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Inicializar datos demo
  useEffect(() => {
    const demoProducts: Product[] = [
      { id: '1', name: 'Leche Entera', entryDate: subDays(new Date(), 5), expirationDate: addDays(new Date(), 2), price: 2.5, stock: 15, type: 'Lácteos', image: '', qrCode: 'QR001', barcode: 'BAR001', supplierId: '1' },
      { id: '2', name: 'Pan Integral', entryDate: subDays(new Date(), 2), expirationDate: addDays(new Date(), 3), price: 1.8, stock: 25, type: 'Panadería', image: '', qrCode: 'QR002', barcode: 'BAR002', supplierId: '2' },
      { id: '3', name: 'Manzanas', entryDate: subDays(new Date(), 7), expirationDate: addDays(new Date(), 10), price: 3.2, stock: 40, type: 'Frutas', image: '', qrCode: 'QR003', barcode: 'BAR003', supplierId: '3' },
      { id: '4', name: 'Yogurt Natural', entryDate: subDays(new Date(), 3), expirationDate: addDays(new Date(), 1), price: 1.5, stock: 8, type: 'Lácteos', image: '', qrCode: 'QR004', barcode: 'BAR004', supplierId: '1' },
      { id: '5', name: 'Cereal', entryDate: subDays(new Date(), 10), expirationDate: addDays(new Date(), 60), price: 4.5, stock: 30, type: 'Abarrotes', image: '', qrCode: 'QR005', barcode: 'BAR005', supplierId: '2' },
      { id: '6', name: 'Queso Fresco', entryDate: subDays(new Date(), 1), expirationDate: addDays(new Date(), 0), price: 5.0, stock: 5, type: 'Lácteos', image: '', qrCode: 'QR006', barcode: 'BAR006', supplierId: '1' },
    ];

    const demoSales: Sale[] = [];
    for (let i = 0; i < 30; i++) {
      demoSales.push({
        id: `venta-${i}`,
        productId: demoProducts[Math.floor(Math.random() * demoProducts.length)].id,
        quantity: Math.floor(Math.random() * 5) + 1,
        date: subDays(new Date(), Math.floor(Math.random() * 30)),
        type: Math.random() > 0.9 ? 'disposal' : 'sale'
      });
    }

    const demoSuppliers: Supplier[] = [
      { id: '1', name: 'Lácteos del Valle', contact: '555-0001', products: ['1', '4', '6'] },
      { id: '2', name: 'Panadería Central', contact: '555-0002', products: ['2', '5'] },
      { id: '3', name: 'Frutas Frescas', contact: '555-0003', products: ['3'] },
    ];

    setProducts(demoProducts);
    setSales(demoSales);
    setSuppliers(demoSuppliers);
  }, []);

  // Revisar productos próximos a caducar y stock bajo para notificaciones
  useEffect(() => {
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
    
    setNotifications(nuevasNotificaciones);
  }, [products]);

  const notificacionesNoLeidas = notifications.filter(n => !n.read).length;

  const manejarEscaneo = useCallback(() => {
    const aleatorio = Math.random() * 100;
    if (aleatorio < scanError) {
      alert('Error al escanear. Por favor, intente de nuevo o busque manualmente.');
      return;
    }
    
    const productoAleatorio = products[Math.floor(Math.random() * products.length)];
    setScannedProduct(productoAleatorio);
    setActionQuantity(1);
    setShowScanModal(true);
  }, [products, scanError]);

  const manejarAccionProducto = useCallback((accion: 'sell' | 'dispose' | 'restock') => {
    if (!scannedProduct) return;
    if (actionQuantity < 1) return;

    const productosActualizados = products.map(p => {
      if (p.id === scannedProduct.id) {
        let nuevoStock = p.stock;
        if (accion === 'sell' || accion === 'dispose') {
          nuevoStock = Math.max(0, p.stock - actionQuantity);
        } else if (accion === 'restock') {
          nuevoStock = p.stock + actionQuantity;
        }
        return { ...p, stock: nuevoStock };
      }
      return p;
    });
    
    setProducts(productosActualizados);
    
    if (accion === 'sell' || accion === 'dispose') {
      setSales([...sales, {
        id: `venta-${Date.now()}`,
        productId: scannedProduct.id,
        quantity: actionQuantity,
        date: new Date(),
        type: accion === 'sell' ? 'sale' : 'disposal'
      }]);
    }
    
    setShowScanModal(false);
    setScannedProduct(null);
  }, [scannedProduct, products, sales, actionQuantity]);

  const obtenerDiasPeriodo = useCallback(() => {
    switch (selectedPeriod) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '365d': return 365;
      case 'custom': return parseInt(customDays) || 7;
      default: return 7;
    }
  }, [selectedPeriod, customDays]);

  const datosTendenciaVentas = useMemo(() => {
    const dias = obtenerDiasPeriodo();
    const datos = [];
    
    for (let i = dias - 1; i >= 0; i--) {
      const fecha = startOfDay(subDays(new Date(), i));
      const finDia = endOfDay(fecha);
      const ventasDia = sales.filter(s => 
        s.type === 'sale' && 
        s.date >= fecha && 
        s.date <= finDia &&
        (filterType === 'all' || products.find(p => p.id === s.productId)?.type === filterType) &&
        (filterSupplier === 'all' || products.find(p => p.id === s.productId)?.supplierId === filterSupplier)
      );
      
      datos.push({
        fecha: format(fecha, 'dd/MM'),
        ventas: ventasDia.reduce((sum, s) => sum + s.quantity, 0)
      });
    }
    return datos;
  }, [sales, products, filterType, filterSupplier, obtenerDiasPeriodo]);

  const inventarioPorTipo = useMemo(() => {
    const mapaTipo = new Map<string, number>();
    
    products.forEach(p => {
      if (filterSupplier === 'all' || p.supplierId === filterSupplier) {
        mapaTipo.set(p.type, (mapaTipo.get(p.type) || 0) + p.stock);
      }
    });
    
    return Array.from(mapaTipo.entries()).map(([tipo, stock]) => ({
      tipo,
      stock
    }));
  }, [products, filterSupplier]);

  const ventasRecientes = useMemo(() => {
    return sales
      .filter(s => 
        s.type === 'sale' &&
        (filterType === 'all' || products.find(p => p.id === s.productId)?.type === filterType) &&
        (filterSupplier === 'all' || products.find(p => p.id === s.productId)?.supplierId === filterSupplier)
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
      .map(s => {
        const producto = products.find(p => p.id === s.productId);
        return {
          ...s,
          nombreProducto: producto?.name || 'Producto desconocido',
          precio: producto?.price || 0
        };
      });
  }, [sales, products, filterType, filterSupplier]);

  const productosStockBajo = useMemo(() => {
    return products
      .filter(p => 
        p.stock <= 10 &&
        (filterType === 'all' || p.type === filterType) &&
        (filterSupplier === 'all' || p.supplierId === filterSupplier)
      )
      .sort((a, b) => a.stock - b.stock);
  }, [products, filterType, filterSupplier]);

  const productosProximosCaducar = useMemo(() => {
    return products
      .filter(p => {
        const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
        return diasParaCaducar <= 3 && diasParaCaducar >= 0 &&
          (filterType === 'all' || p.type === filterType) &&
          (filterSupplier === 'all' || p.supplierId === filterSupplier);
      })
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }, [products, filterType, filterSupplier]);

  // Marcar notificaciones como leídas
  const marcarNotificacionesLeidas = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setShowNotifications(false);
  };

  // Productos filtrados para tablas
  const productosFiltrados = useMemo(() => {
    return products.filter(p => {
      const coincideBusqueda = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode.toLowerCase().includes(searchTerm.toLowerCase());
      const coincideTipo = filterType === 'all' || p.type === filterType;
      const coincideProveedor = filterSupplier === 'all' || p.supplierId === filterSupplier;
      return coincideBusqueda && coincideTipo && coincideProveedor;
    });
  }, [products, searchTerm, filterType, filterSupplier]);

  // Manejar reordenamiento de widgets
  const manejarDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);
      setWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Primero, añade estos hooks para manejar los clicks fuera
  const notificationsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Añade este useEffect para manejar clicks fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Para notificaciones
      if (notificationsRef.current && 
          !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      
      // Para el modal de escaneo
      if (modalRef.current && 
          !modalRef.current.contains(event.target as Node) && 
          showScanModal) {
        setShowScanModal(false);
        setScannedProduct(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showScanModal]);

  if (!isClient) {
    return null; // O un spinner de carga si lo prefieres
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

            {/* Navegación Desktop */}
            <nav className="hidden md:flex items-center gap-2">
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

            {/* Iconos de utilidad */}
            <div className="flex items-center gap-2">
              {/* Botón de menú hamburguesa */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label="Menú principal">
                <Menu size={24} aria-hidden="true" />
              </button>

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

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div ref={notificationsRef}>
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
                          <button 
                            onClick={marcarNotificacionesLeidas}
                            className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                            Marcar todas
                          </button>
                        </div>
                        
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No hay notificaciones
                          </p>
                        ) : (
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map(n => (
                              <li key={n.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                n.read ? 'opacity-75' : ''
                              }`}>
                                <div className="flex gap-3 items-start">
                                  {n.type === 'danger' && <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" />}
                                  {n.type === 'warning' && <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                                  {n.type === 'info' && <Bell className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                                  <div>
                                    <p className="text-gray-900 dark:text-gray-100 text-sm">{n.message}</p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {format(n.date, 'dd/MM/yyyy HH:mm')}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menú móvil */}
          {isMobileMenuOpen && (
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

      <main className="flex-grow p-4 max-w-7xl mx-auto w-full bg-gray-50 dark:bg-gray-900">
        {/* Botón de escaneo QR más prominente */}
        {activeTab === 'dashboard' && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
            <button 
              onClick={manejarEscaneo} 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              aria-label="Escanear producto">
              <Scan size={32} aria-hidden="true" />
              <span className="sr-only">Escanear producto</span>
            </button>

            {/* Botón de notificaciones en móvil */}
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
        )}

        {/* Contenido de pestañas */}
        {activeTab === 'dashboard' && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={manejarDragEnd}>
            <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {widgets.map(widget => widget.visible && (
                  <SortableWidget key={widget.id} widget={widget}>
                    {/* Widget de Tabla de Inventario */}
                    {widget.type === 'inventory-table' && (
                      <section aria-label="Tabla de inventario">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Package size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Inventario de Productos
                        </h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                          <div className="min-w-[800px] lg:min-w-full"> {/* Ancho mínimo en móvil, natural en desktop */}
                            <table className="w-full text-left text-sm">
                              <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                                <tr>
                                  <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Nombre</th>
                                  <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Stock</th>
                                  <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Días para caducar</th>
                                  <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                                </tr>
                              </thead>
                              <tbody>
                                {/* Mensaje cuando no hay productos */}
                                {products.length === 0 && (
                                  <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                      No hay productos en inventario
                                    </td>
                                  </tr>
                                )}
                                {/* Lista de productos */}
                                {products.map(p => {
                                  const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                                  const proveedor = suppliers.find(s => s.id === p.supplierId);
                                  return (
                                    <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <td className="p-2 text-gray-900 dark:text-gray-100">
                                        <div className="flex items-center gap-2">
                                          {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" />
                                          ) : (
                                            <Package size={20} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                          )}
                                          <span className="text-gray-900 dark:text-gray-100">{p.name}</span>
                                        </div>
                                      </td>
                                      <td className="p-2 text-gray-900 dark:text-gray-100">{p.stock}</td>
                                      <td className={`p-2 ${
                                        diasParaCaducar <= 1 
                                          ? 'text-red-600 dark:text-red-400 font-bold' 
                                          : diasParaCaducar <= 3 
                                          ? 'text-yellow-600 dark:text-yellow-400 font-semibold' 
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>
                                        {diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}
                                      </td>
                                      <td className="p-2 text-gray-900 dark:text-gray-100">{proveedor?.name || 'Desconocido'}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Widget de Ventas Recientes */}
                    {widget.type === 'recent-sales' && (
                      <section aria-label="Ventas recientes">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <ShoppingCart size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Últimas Ventas
                        </h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Cantidad</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Precio Unit.</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ventasRecientes.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No hay ventas recientes
                                  </td>
                                </tr>
                              ) : (
                                ventasRecientes.map(s => (
                                  <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{s.nombreProducto}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{s.quantity}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">${s.precio.toFixed(2)}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{format(s.date, 'dd/MM/yyyy')}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {/* Widget de Stock Bajo */}
                    {widget.type === 'low-stock' && (
                      <section aria-label="Productos con stock bajo">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <AlertTriangle size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Productos con Stock Bajo
                        </h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Stock</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Tipo</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosStockBajo.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No hay productos con stock bajo
                                  </td>
                                </tr>
                              )}
                              {productosStockBajo.map(p => {
                                const proveedor = suppliers.find(s => s.id === p.supplierId);
                                return (
                                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{p.name}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{p.stock}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{p.type}</td>
                                    <td className="p-2 text-gray-900 dark:text-gray-100">{proveedor?.name || 'Desconocido'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {/* Widget de Productos por Caducar */}
                    {widget.type === 'expiring-soon' && (
                      <section aria-label="Productos próximos a caducar">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Calendar size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Productos Próximos a Caducar
                        </h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Días para caducar</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Stock</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosProximosCaducar.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    No hay productos próximos a caducar
                                  </td>
                                </tr>
                              ) : (
                                productosProximosCaducar.map(p => {
                                  const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                                  const proveedor = suppliers.find(s => s.id === p.supplierId);
                                  return (
                                    <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                      <td className="p-2 text-gray-900 dark:text-gray-100">{p.name}</td>
                                      <td className={`p-2 ${
                                        diasParaCaducar <= 1 
                                          ? 'text-red-600 dark:text-red-400 font-bold' 
                                          : diasParaCaducar <= 3 
                                          ? 'text-yellow-600 dark:text-yellow-400 font-semibold' 
                                          : 'text-gray-900 dark:text-gray-100'
                                      }`}>
                                        {diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}
                                      </td>
                                      <td className="p-2 text-gray-900 dark:text-gray-100">{p.stock}</td>
                                      <td className="p-2 text-gray-900 dark:text-gray-100">{proveedor?.name || 'Desconocido'}</td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}

                    {/* Widget de Tendencia de Ventas */}
                    {widget.type === 'sales-trend' && isClient && (
                      <section aria-label="Tendencia de ventas">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <TrendingUp size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Tendencia de Ventas
                        </h3>
                        <div className="w-full" style={{ height: "250px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={datosTendenciaVentas}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                              <XAxis 
                                dataKey="fecha" 
                                className="text-gray-900 dark:text-gray-100" 
                              />
                              <YAxis 
                                className="text-gray-900 dark:text-gray-100"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgb(var(--bg-white))',
                                  borderColor: 'rgb(var(--border-gray-300))',
                                  color: 'rgb(var(--text-gray-900))'
                                }} 
                              />
                              <Legend />
                              <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                    )}

                    {/* Widget de Inventario por Tipo */}
                    {widget.type === 'inventory-by-type' && isClient && (
                      <section aria-label="Inventario por tipo">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Package size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                          Inventario por Tipo
                        </h3>
                        <div className="w-full" style={{ height: "250px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventarioPorTipo}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
                              <XAxis 
                                dataKey="tipo" 
                                className="text-gray-900 dark:text-gray-100"
                              />
                              <YAxis 
                                className="text-gray-900 dark:text-gray-100"
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgb(var(--bg-white))',
                                  borderColor: 'rgb(var(--border-gray-300))',
                                  color: 'rgb(var(--text-gray-900))'
                                }} 
                              />
                              <Legend />
                              <Bar dataKey="stock" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                    )}
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Pestaña Productos */}
        {activeTab === 'products' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Package size={28} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                Productos
              </h2>
              
              <div className="flex flex-wrap gap-2 items-center">
                {/* Input de búsqueda */}
                <input
                  type="text"
                  placeholder="Buscar producto, QR o código de barras"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  aria-label="Buscar producto, QR o código de barras"
                />

                {/* Select de tipo */}
                <select 
                  value={filterType} 
                  onChange={e => setFilterType(e.target.value)} 
                  className="rounded border border-gray-300 dark:border-gray-600 px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="Filtrar por tipo"
                >
                  <option value="all" className="text-gray-900 dark:text-gray-100">Todos los tipos</option>
                  {Array.from(new Set(products.map(p => p.type))).map(type => (
                    <option key={type} value={type} className="text-gray-900 dark:text-gray-100">{type}</option>
                  ))}
                </select>

                {/* Select de proveedor */}
                <select 
                  value={filterSupplier} 
                  onChange={e => setFilterSupplier(e.target.value)} 
                  className="rounded border border-gray-300 dark:border-gray-600 px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="Filtrar por proveedor"
                >
                  <option value="all" className="text-gray-900 dark:text-gray-100">Todos los proveedores</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id} className="text-gray-900 dark:text-gray-100">{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
              <div className="min-w-[800px] lg:min-w-full"> {/* Ancho mínimo en móvil, natural en desktop */}
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Nombre</th>
                      {compactView ? (
                        <>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Stock</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Días para caducar</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Fecha Entrada</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Fecha Expiración</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Precio</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Stock</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Tipo</th>
                          <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                        </>
                      )}
                      <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={compactView ? 4 : 8} className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No se encontraron productos
                        </td>
                      </tr>
                    ) : (
                      productosFiltrados.map(p => {
                        const proveedor = suppliers.find(s => s.id === p.supplierId);
                        const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                        return (
                          <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                                ) : (
                                  <Package size={24} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                )}
                                <span className="text-gray-900 dark:text-gray-100">{p.name}</span>
                              </div>
                            </td>
                            {compactView ? (
                              <>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{p.stock}</td>
                                <td className={`p-2 ${
                                  diasParaCaducar <= 1 
                                    ? 'text-red-600 dark:text-red-400 font-bold' 
                                    : diasParaCaducar <= 3 
                                    ? 'text-yellow-600 dark:text-yellow-400 font-semibold' 
                                    : 'text-gray-900 dark:text-gray-100'
                                }`}>
                                  {diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{format(p.entryDate, 'dd/MM/yyyy')}</td>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{format(p.expirationDate, 'dd/MM/yyyy')}</td>
                                <td className="p-2 text-gray-900 dark:text-gray-100">${p.price.toFixed(2)}</td>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{p.stock}</td>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{p.type}</td>
                                <td className="p-2 text-gray-900 dark:text-gray-100">{proveedor?.name || 'Desconocido'}</td>
                              </>
                            )}
                            <td className="p-2">
                              <button 
                                onClick={() => { setScannedProduct(p); setActionQuantity(1); setShowScanModal(true); }} 
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1"
                                aria-label={`Gestionar producto ${p.name}`}
                              >
                                <ShoppingCart size={16} aria-hidden="true" /> Gestionar
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Pestaña Ventas */}
        {activeTab === 'sales' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100">
              <ShoppingCart size={28} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
              Ventas
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Cantidad</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Tipo</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No hay registros de ventas o desechos
                      </td>
                    </tr>
                  ) : (
                    sales.map(s => {
                      const producto = products.find(p => p.id === s.productId);
                      return (
                        <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <td className="p-2 text-gray-900 dark:text-gray-100">
                            {producto?.name || 'Producto desconocido'}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-gray-100">
                            {s.quantity}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-gray-100">
                            {s.type === 'sale' ? 'Venta' : 'Desecho'}
                          </td>
                          <td className="p-2 text-gray-900 dark:text-gray-100">
                            {format(s.date, 'dd/MM/yyyy')}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pestaña Proveedores */}
        {activeTab === 'suppliers' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100">
              <Users size={28} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
              Proveedores
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      Nombre
                    </th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      Contacto
                    </th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                      Productos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No hay proveedores registrados
                      </td>
                    </tr>
                  ) : (
                    suppliers.map(s => (
                      <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="p-2 text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <Users size={20} className="text-gray-500 dark:text-gray-400" aria-hidden="true" />
                            {s.name}
                          </div>
                        </td>
                        <td className="p-2 text-gray-900 dark:text-gray-100">
                          {s.contact}
                        </td>
                        <td className="p-2 text-gray-900 dark:text-gray-100">
                          {s.products.length} producto{s.products.length !== 1 ? 's' : ''}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pestaña Configuraciones */}
        {activeTab === 'settings' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100"><Settings size={28} aria-hidden="true" /> Configuraciones</h2>
            <div className="max-w-md">
              <label htmlFor="scanError" className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">Probabilidad de error al escanear (%)</label>
              <input
                id="scanError"
                type="number"
                min={0}
                max={100}
                value={scanError}
                onChange={e => setScanError(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                aria-describedby="scanErrorHelp"
              />
              <small id="scanErrorHelp" className="text-gray-500 dark:text-gray-400">
                Ajusta la probabilidad de que el escaneo falle para probar la búsqueda manual.
              </small>

              <label htmlFor="darkModeToggle" className="block font-semibold mt-6 mb-2 text-gray-900 dark:text-gray-100">Modo Oscuro</label>
              <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" aria-pressed={darkMode} aria-label="Alternar modo oscuro">
                {darkMode ? 'Desactivar Modo Oscuro' : 'Activar Modo Oscuro'}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal de escaneo mejorado */}
      {showScanModal && scannedProduct && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60]" onClick={() => {
          setShowScanModal(false);
          setScannedProduct(null);
        }}>
          <div className="fixed inset-0 overflow-y-auto pt-16 sm:pt-20"> {/* Añadido padding-top para evitar el header */}
            <div className="flex min-h-full items-start justify-center p-4">
              <div 
                ref={modalRef}
                onClick={e => e.stopPropagation()} 
                className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-xl"
              >
                {/* Header del modal */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Scan size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    Producto Escaneado
                  </h3>
                  <button
                    onClick={() => { setShowScanModal(false); setScannedProduct(null); }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                    aria-label="Cerrar modal"
                  >
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>

                {/* Contenido del modal con scroll independiente */}
                <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  {/* Imagen y detalles en grid responsivo */}
                  <div className="grid sm:grid-cols-[180px,1fr] gap-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 mx-auto sm:mx-0">
                      {scannedProduct.image ? (
                        <img 
                          src={scannedProduct.image} 
                          alt={scannedProduct.name} 
                          className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border border-gray-200 dark:border-gray-700" 
                        />
                      ) : (
                        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Package size={48} className="text-gray-400 dark:text-gray-500" aria-hidden="true" />
                        </div>
                      )}
                    </div>

                    {/* Detalles del producto */}
                    <div className="space-y-3">
                      <div className="grid gap-2">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{scannedProduct.name}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">Entrada:</span><br />
                            {format(scannedProduct.entryDate, 'dd/MM/yyyy')}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">Expiración:</span><br />
                            {format(scannedProduct.expirationDate, 'dd/MM/yyyy')}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">Precio:</span><br />
                            ${scannedProduct.price.toFixed(2)}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">Stock:</span><br />
                            {scannedProduct.stock} unidades
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">Tipo:</span><br />
                            {scannedProduct.type}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">
                            <span className="font-medium">QR:</span><br />
                            {scannedProduct.qrCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer del modal con acciones */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Control de cantidad */}
                    <div className="flex items-center gap-2">
                      <label htmlFor="actionQuantity" className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                        Cantidad:
                      </label>
                      <input
                        id="actionQuantity"
                        type="number"
                        min={1}
                        max={10000}
                        value={actionQuantity}
                        onChange={e => setActionQuantity(Math.max(1, Math.min(10000, Number(e.target.value))))}
                        className="w-20 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2 sm:ml-auto">
                      <button 
                        onClick={() => manejarAccionProducto('sell')} 
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                        <Check size={18} aria-hidden="true" /> Vender
                      </button>
                      <button 
                        onClick={() => manejarAccionProducto('dispose')} 
                        className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                        <Trash2 size={18} aria-hidden="true" /> Desechar
                      </button>
                      <button 
                        onClick={() => manejarAccionProducto('restock')} 
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
                        <RefreshCw size={18} aria-hidden="true" /> Reabastecer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Gestor de Inventario - Prototipo
          </p>
        </div>
      </footer>

      {/* Panel de notificaciones móvil */}
      {showNotifications && (
        <div className="md:hidden fixed inset-x-4 bottom-24 z-50">
          <div 
            ref={notificationsRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto"
          >
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
              <button 
                onClick={marcarNotificacionesLeidas}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                Marcar todas
              </button>
            </div>
            
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500 dark:text-gray-400">
                No hay notificaciones
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map(n => (
                  <li key={n.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    n.read ? 'opacity-75' : ''
                  }`}>
                    <div className="flex gap-3 items-start">
                      {n.type === 'danger' && <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" />}
                      {n.type === 'warning' && <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                      {n.type === 'info' && <Bell className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                      <div>
                        <p className="text-gray-900 dark:text-gray-100 text-sm">{n.message}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {format(n.date, 'dd/MM/yyyy HH:mm')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
