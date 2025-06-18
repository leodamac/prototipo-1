'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, TrendingUp, AlertTriangle, Bell, Scan, Moon, Sun, Check, Calendar, ShoppingCart, Users, Eye, EyeOff, Trash2, RefreshCw, X, GripVertical, Settings } from 'lucide-react';
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
    <div ref={setNodeRef} style={style} className="relative bg-white dark:bg-gray-800 rounded shadow p-4">
      <div className="absolute top-2 right-2 cursor-move z-10" {...attributes} {...listeners}>
        <GripVertical size={20} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Mover widget" />
      </div>
      {children}
    </div>
  );
}

export default function InventoryManager() {
  const [darkMode, setDarkMode] = useState(false);
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

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans`}>      
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        <h1 className="text-xl font-bold flex items-center gap-2"><Package size={24} aria-hidden="true" /> Gestor de Inventario</h1>
        <nav className="flex items-center gap-4">
          <button onClick={() => setActiveTab('dashboard')} className={`px-3 py-1 rounded ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200 dark:hover:bg-blue-700'}`} aria-label="Ir al Panel Principal">Panel Principal</button>
          <button onClick={() => setActiveTab('products')} className={`px-3 py-1 rounded ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200 dark:hover:bg-blue-700'}`} aria-label="Ir a Productos">Productos</button>
          <button onClick={() => setActiveTab('sales')} className={`px-3 py-1 rounded ${activeTab === 'sales' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200 dark:hover:bg-blue-700'}`} aria-label="Ir a Ventas">Ventas</button>
          <button onClick={() => setActiveTab('suppliers')} className={`px-3 py-1 rounded ${activeTab === 'suppliers' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200 dark:hover:bg-blue-700'}`} aria-label="Ir a Proveedores">Proveedores</button>
          <button onClick={() => setActiveTab('settings')} className={`px-3 py-1 rounded ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-blue-200 dark:hover:bg-blue-700'}`} aria-label="Ir a Configuraciones">Configuraciones</button>
          <button onClick={() => setDarkMode(!darkMode)} aria-label="Alternar modo oscuro" className="p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition">
            {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
          </button>
          <button onClick={() => setShowNotifications(!showNotifications)} aria-label="Mostrar notificaciones" className="relative p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition">
            <Bell size={20} aria-hidden="true" />
            {notificacionesNoLeidas > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold animate-pulse" aria-label={`${notificacionesNoLeidas} notificaciones sin leer`}>{notificacionesNoLeidas}</span>
            )}
          </button>
        </nav>
      </header>

      {/* Notificaciones desplegables */}
      {showNotifications && (
        <div className="fixed top-16 right-4 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg z-50">
          <div className="flex justify-between items-center p-2 border-b border-gray-300 dark:border-gray-700">
            <h2 className="font-semibold">Notificaciones</h2>
            <button onClick={marcarNotificacionesLeidas} aria-label="Marcar todas como leídas" className="text-blue-600 hover:underline">Marcar todas</button>
          </div>
          {notifications.length === 0 && <p className="p-4 text-center text-gray-500">No hay notificaciones</p>}
          <ul>
            {notifications.map(n => (
              <li key={n.id} className={`p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${n.read ? 'opacity-60' : 'font-semibold'}`}>
                <div className="flex items-center gap-2">
                  {n.type === 'danger' && <AlertTriangle className="text-red-600" size={18} aria-hidden="true" />}
                  {n.type === 'warning' && <AlertTriangle className="text-yellow-500" size={18} aria-hidden="true" />}
                  {n.type === 'info' && <Bell className="text-blue-500" size={18} aria-hidden="true" />}
                  <span>{n.message}</span>
                </div>
                <small className="text-xs text-gray-500 dark:text-gray-400">{format(n.date, 'dd/MM/yyyy HH:mm')}</small>
              </li>
            ))}
          </ul>
        </div>
      )}

      <main className="p-4 max-w-7xl mx-auto">
        {/* Sección de escaneo siempre visible en dashboard con botón prominente y animado */}
        {activeTab === 'dashboard' && (
          <section className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><Scan size={28} aria-hidden="true" /> Escanear Producto</h2>
            <button onClick={manejarEscaneo} className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-pulse focus:outline-none focus:ring-4 focus:ring-blue-400 transition" aria-label="Escanear producto">
              <Scan size={32} aria-hidden="true" />
              <span className="sr-only">Escanear producto</span>
            </button>
          </section>
        )}

        {/* Contenido de pestañas */}
        {activeTab === 'dashboard' && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={manejarDragEnd}>
            <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {widgets.map(widget => widget.visible && (
                  <SortableWidget key={widget.id} widget={widget}>
                    {widget.type === 'inventory-table' && (
                      <section aria-label="Tabla de inventario">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Package size={20} aria-hidden="true" /> Inventario de Productos</h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Nombre</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Stock</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Días para caducar</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Proveedor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay productos en inventario</td></tr>
                              )}
                              {products.map(p => {
                                const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                                const proveedor = suppliers.find(s => s.id === p.supplierId);
                                let colorTexto = '';
                                if (diasParaCaducar <= 1) colorTexto = 'text-red-600 font-bold';
                                else if (diasParaCaducar <= 3) colorTexto = 'text-yellow-600 font-semibold';
                                else colorTexto = 'text-gray-900 dark:text-gray-100';
                                return (
                                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="p-2 flex items-center gap-2">
                                      {p.image ? <img src={p.image} alt={p.name} className="w-8 h-8 object-cover rounded" /> : <Package size={20} aria-hidden="true" />}
                                      {p.name}
                                    </td>
                                    <td className="p-2">{p.stock}</td>
                                    <td className={`p-2 ${colorTexto}`}>{diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}</td>
                                    <td className="p-2">{proveedor?.name || 'Desconocido'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                    {widget.type === 'sales-trend' && (
                      <section aria-label="Tendencia de ventas">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp size={20} aria-hidden="true" /> Tendencia de Ventas</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={datosTendenciaVentas} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="fecha" stroke={darkMode ? '#ddd' : '#333'} />
                            <YAxis stroke={darkMode ? '#ddd' : '#333'} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="ventas" stroke="#3b82f6" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </section>
                    )}
                    {widget.type === 'inventory-by-type' && (
                      <section aria-label="Inventario por tipo">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Package size={20} aria-hidden="true" /> Inventario por Tipo</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={inventarioPorTipo} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
                            <XAxis dataKey="tipo" stroke={darkMode ? '#ddd' : '#333'} />
                            <YAxis stroke={darkMode ? '#ddd' : '#333'} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="stock" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </section>
                    )}
                    {widget.type === 'recent-sales' && (
                      <section aria-label="Ventas recientes">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><ShoppingCart size={20} aria-hidden="true" /> Últimas Ventas</h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Cantidad</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Precio Unitario</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ventasRecientes.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay ventas recientes</td></tr>
                              )}
                              {ventasRecientes.map(s => (
                                <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <td className="p-2">{s.nombreProducto}</td>
                                  <td className="p-2">{s.quantity}</td>
                                  <td className="p-2">${s.precio.toFixed(2)}</td>
                                  <td className="p-2">{format(s.date, 'dd/MM/yyyy')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                    {widget.type === 'low-stock' && (
                      <section aria-label="Productos con stock bajo">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle size={20} aria-hidden="true" /> Productos con Stock Bajo</h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Stock</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Tipo</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Proveedor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosStockBajo.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay productos con stock bajo</td></tr>
                              )}
                              {productosStockBajo.map(p => {
                                const proveedor = suppliers.find(s => s.id === p.supplierId);
                                return (
                                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="p-2">{p.name}</td>
                                    <td className="p-2">{p.stock}</td>
                                    <td className="p-2">{p.type}</td>
                                    <td className="p-2">{proveedor?.name || 'Desconocido'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                    {widget.type === 'expiring-soon' && (
                      <section aria-label="Productos próximos a caducar">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Calendar size={20} aria-hidden="true" /> Productos Próximos a Caducar</h3>
                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Producto</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Días para caducar</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Stock</th>
                                <th className="p-2 border-b border-gray-300 dark:border-gray-600">Proveedor</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productosProximosCaducar.length === 0 && (
                                <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay productos próximos a caducar</td></tr>
                              )}
                              {productosProximosCaducar.map(p => {
                                const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                                const proveedor = suppliers.find(s => s.id === p.supplierId);
                                let colorTexto = '';
                                if (diasParaCaducar <= 1) colorTexto = 'text-red-600 font-bold';
                                else if (diasParaCaducar <= 3) colorTexto = 'text-yellow-600 font-semibold';
                                else colorTexto = 'text-gray-900 dark:text-gray-100';
                                return (
                                  <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <td className="p-2">{p.name}</td>
                                    <td className={`p-2 ${colorTexto}`}>{diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}</td>
                                    <td className="p-2">{p.stock}</td>
                                    <td className="p-2">{proveedor?.name || 'Desconocido'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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
              <h2 className="text-2xl font-semibold flex items-center gap-2"><Package size={28} aria-hidden="true" /> Productos</h2>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text"
                  placeholder="Buscar producto, QR o código de barras"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 w-full sm:w-64"
                  aria-label="Buscar producto, QR o código de barras"
                />
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="rounded border border-gray-300 dark:border-gray-600 px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" aria-label="Filtrar por tipo">
                  <option value="all">Todos los tipos</option>
                  {[...new Set(products.map(p => p.type))].map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select value={filterSupplier} onChange={e => setFilterSupplier(e.target.value)} className="rounded border border-gray-300 dark:border-gray-600 px-2 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" aria-label="Filtrar por proveedor">
                  <option value="all">Todos los proveedores</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <button onClick={() => setCompactView(!compactView)} aria-pressed={compactView} className="px-3 py-1 rounded border bg-blue-600 text-white hover:bg-blue-700 transition" aria-label="Alternar vista compacta">
                  {compactView ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Nombre</th>
                    {compactView ? (
                      <>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Stock</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Días para caducar</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Fecha Entrada</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Fecha Expiración</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Precio</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Stock</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Tipo</th>
                        <th className="p-2 border-b border-gray-300 dark:border-gray-600">Proveedor</th>
                      </>
                    )}
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.length === 0 && (
                    <tr><td colSpan={compactView ? 4 : 8} className="p-4 text-center text-gray-500">No se encontraron productos</td></tr>
                  )}
                  {productosFiltrados.map(p => {
                    const proveedor = suppliers.find(s => s.id === p.supplierId);
                    const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                    return (
                      <tr key={p.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="p-2 flex items-center gap-2">
                          {p.image ? <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" /> : <Package size={24} aria-hidden="true" />}
                          <span>{p.name}</span>
                        </td>
                        {compactView ? (
                          <>
                            <td className="p-2">{p.stock}</td>
                            <td className={`p-2 ${diasParaCaducar <= 1 ? 'text-red-600 font-bold' : diasParaCaducar <= 3 ? 'text-yellow-600 font-semibold' : 'text-gray-900 dark:text-gray-100'}`}>{diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2">{format(p.entryDate, 'dd/MM/yyyy')}</td>
                            <td className="p-2">{format(p.expirationDate, 'dd/MM/yyyy')}</td>
                            <td className="p-2">${p.price.toFixed(2)}</td>
                            <td className="p-2">{p.stock}</td>
                            <td className="p-2">{p.type}</td>
                            <td className="p-2">{proveedor?.name || 'Desconocido'}</td>
                          </>
                        )}
                        <td className="p-2 flex flex-wrap gap-1">
                          <button onClick={() => { setScannedProduct(p); setActionQuantity(1); setShowScanModal(true); }} aria-label={`Gestionar producto ${p.name}`} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1">
                            <ShoppingCart size={16} aria-hidden="true" /> Gestionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pestaña Ventas */}
        {activeTab === 'sales' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4"><ShoppingCart size={28} aria-hidden="true" /> Ventas</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Producto</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Cantidad</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Tipo</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay registros de ventas o desechos</td></tr>
                  )}
                  {sales.map(s => {
                    const producto = products.find(p => p.id === s.productId);
                    return (
                      <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <td className="p-2">{producto?.name || 'Producto desconocido'}</td>
                        <td className="p-2">{s.quantity}</td>
                        <td className="p-2 capitalize">{s.type === 'sale' ? 'Venta' : 'Desecho'}</td>
                        <td className="p-2">{format(s.date, 'dd/MM/yyyy')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pestaña Proveedores */}
        {activeTab === 'suppliers' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4"><Users size={28} aria-hidden="true" /> Proveedores</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                <thead className="bg-gray-200 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Nombre</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Contacto</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-600">Productos</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 && (
                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">No hay proveedores registrados</td></tr>
                  )}
                  {suppliers.map(s => (
                    <tr key={s.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.contact}</td>
                      <td className="p-2">{s.products.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pestaña Configuraciones */}
        {activeTab === 'settings' && (
          <section>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4"><Settings size={28} aria-hidden="true" /> Configuraciones</h2>
            <div className="max-w-md">
              <label htmlFor="scanError" className="block font-semibold mb-2">Probabilidad de error al escanear (%)</label>
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
              <small id="scanErrorHelp" className="text-gray-500 dark:text-gray-400">Ajusta la probabilidad de que el escaneo falle para probar la búsqueda manual.</small>

              <label htmlFor="darkModeToggle" className="block font-semibold mt-6 mb-2">Modo Oscuro</label>
              <button onClick={() => setDarkMode(!darkMode)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" aria-pressed={darkMode} aria-label="Alternar modo oscuro">
                {darkMode ? 'Desactivar Modo Oscuro' : 'Activar Modo Oscuro'}
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Modal de escaneo */}
      {showScanModal && scannedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="scanModalTitle">
          <div className="bg-white dark:bg-gray-800 rounded shadow-lg max-w-md w-full p-6 relative">
            <h3 id="scanModalTitle" className="text-xl font-semibold mb-4 flex items-center gap-2"><Scan size={24} aria-hidden="true" /> Producto Escaneado</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0">
                {scannedProduct.image ? (
                  <img src={scannedProduct.image} alt={scannedProduct.name} className="w-32 h-32 object-cover rounded" />
                ) : (
                  <Package size={64} className="text-gray-400" aria-hidden="true" />
                )}
              </div>
              <div className="flex-grow">
                <p><strong>Nombre:</strong> {scannedProduct.name}</p>
                <p><strong>Fecha de Entrada:</strong> {format(scannedProduct.entryDate, 'dd/MM/yyyy')}</p>
                <p><strong>Fecha de Expiración:</strong> {format(scannedProduct.expirationDate, 'dd/MM/yyyy')}</p>
                <p><strong>Precio:</strong> ${scannedProduct.price.toFixed(2)}</p>
                <p><strong>Stock:</strong> {scannedProduct.stock}</p>
                <p><strong>Tipo:</strong> {scannedProduct.type}</p>
                <p><strong>Código QR:</strong> {scannedProduct.qrCode}</p>
                <p><strong>Código de Barras:</strong> {scannedProduct.barcode}</p>

                <label htmlFor="actionQuantity" className="block mt-4 font-semibold">Cantidad:</label>
                <input
                  id="actionQuantity"
                  type="number"
                  min={1}
                  max={10000}
                  value={actionQuantity}
                  onChange={e => setActionQuantity(Math.max(1, Math.min(10000, Number(e.target.value))))}
                  className="w-24 rounded border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  aria-label="Cantidad para acción"
                />

                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => manejarAccionProducto('sell')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2" aria-label="Vender producto">
                    <Check size={20} aria-hidden="true" /> Vender
                  </button>
                  <button onClick={() => manejarAccionProducto('dispose')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2" aria-label="Desechar producto">
                    <Trash2 size={20} aria-hidden="true" /> Desechar
                  </button>
                  <button onClick={() => manejarAccionProducto('restock')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2" aria-label="Reabastecer producto">
                    <RefreshCw size={20} aria-hidden="true" /> Reabastecer
                  </button>
                  <button onClick={() => { setShowScanModal(false); setScannedProduct(null); }} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2" aria-label="Cerrar modal">
                    <X size={20} aria-hidden="true" /> Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Gestor de Inventario - Prototipo
      </footer>
    </div>
  );
}
