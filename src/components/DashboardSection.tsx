import React, { useState } from 'react';
import { Package, TrendingUp, AlertTriangle, Bell, Scan, Moon, Sun, Check, Calendar, ShoppingCart, Users, Trash2, RefreshCw, X, GripVertical, Settings, Menu, Plus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, addDays, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Product, Sale, Supplier, Notification, DashboardWidget } from '../types';
import { SortableWidget } from './SortableWidget';
import { InventoryGauge } from './InventoryGauge';

import { Filter } from 'lucide-react';

// Tipos para el estado del filtro y las acciones del reducer
interface FilterState {
  filterType: string;
  filterSupplier: string;
  dateRange: string;
  selectedYear: number;
  filterProductName: string;
  filterMinPrice: number | '';
  filterMaxPrice: number | '';
  filterMinStock: number | '';
  filterMaxStock: number | '';
  filterEntryDateStart: string;
  filterEntryDateEnd: string;
  filterExpirationDateStart: string;
  filterExpirationDateEnd: string;
  filterQrBarcode: string;
  filterSaleQuantityMin: number | '';
  filterSaleQuantityMax: number | '';
  filterSaleDateStart: string;
  filterSaleDateEnd: string;
  filterSaleType: string;
}

type FilterAction =
  | { type: 'SET_FILTER_TYPE'; payload: string }
  | { type: 'SET_FILTER_SUPPLIER'; payload: string }
  | { type: 'SET_DATE_RANGE'; payload: string }
  | { type: 'SET_SELECTED_YEAR'; payload: number }
  | { type: 'SET_FILTER_PRODUCT_NAME'; payload: string }
  | { type: 'SET_FILTER_MIN_PRICE'; payload: number | '' }
  | { type: 'SET_FILTER_MAX_PRICE'; payload: number | '' }
  | { type: 'SET_FILTER_MIN_STOCK'; payload: number | '' }
  | { type: 'SET_FILTER_MAX_STOCK'; payload: number | '' }
  | { type: 'SET_FILTER_ENTRY_DATE_START'; payload: string }
  | { type: 'SET_FILTER_ENTRY_DATE_END'; payload: string }
  | { type: 'SET_FILTER_EXPIRATION_DATE_START'; payload: string }
  | { type: 'SET_FILTER_EXPIRATION_DATE_END'; payload: string }
  | { type: 'SET_FILTER_QR_BARCODE'; payload: string }
  | { type: 'SET_FILTER_SALE_QUANTITY_MIN'; payload: number | '' }
  | { type: 'SET_FILTER_SALE_QUANTITY_MAX'; payload: number | '' }
  | { type: 'SET_FILTER_SALE_DATE_START'; payload: string }
  | { type: 'SET_FILTER_SALE_DATE_END'; payload: string }
  | { type: 'SET_FILTER_SALE_TYPE'; payload: string };

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.payload };
    case 'SET_FILTER_SUPPLIER':
      return { ...state, filterSupplier: action.payload };
    case 'SET_DATE_RANGE':
      return { ...state, dateRange: action.payload };
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_FILTER_PRODUCT_NAME':
      return { ...state, filterProductName: action.payload };
    case 'SET_FILTER_MIN_PRICE':
      return { ...state, filterMinPrice: action.payload };
    case 'SET_FILTER_MAX_PRICE':
      return { ...state, filterMaxPrice: action.payload };
    case 'SET_FILTER_MIN_STOCK':
      return { ...state, filterMinStock: action.payload };
    case 'SET_FILTER_MAX_STOCK':
      return { ...state, filterMaxStock: action.payload };
    case 'SET_FILTER_ENTRY_DATE_START':
      return { ...state, filterEntryDateStart: action.payload };
    case 'SET_FILTER_ENTRY_DATE_END':
      return { ...state, filterEntryDateEnd: action.payload };
    case 'SET_FILTER_EXPIRATION_DATE_START':
      return { ...state, filterExpirationDateStart: action.payload };
    case 'SET_FILTER_EXPIRATION_DATE_END':
      return { ...state, filterExpirationDateEnd: action.payload };
    case 'SET_FILTER_QR_BARCODE':
      return { ...state, filterQrBarcode: action.payload };
    case 'SET_FILTER_SALE_QUANTITY_MIN':
      return { ...state, filterSaleQuantityMin: action.payload };
    case 'SET_FILTER_SALE_QUANTITY_MAX':
      return { ...state, filterSaleQuantityMax: action.payload };
    case 'SET_FILTER_SALE_DATE_START':
      return { ...state, filterSaleDateStart: action.payload };
    case 'SET_FILTER_SALE_DATE_END':
      return { ...state, filterSaleDateEnd: action.payload };
    case 'SET_FILTER_SALE_TYPE':
      return { ...state, filterSaleType: action.payload };
    default:
      return state;
  }
};

const initialFilterState: FilterState = {
  filterType: 'all',
  filterSupplier: 'all',
  dateRange: '7d',
  selectedYear: new Date().getFullYear(),
  filterProductName: '',
  filterMinPrice: '',
  filterMaxPrice: '',
  filterMinStock: '',
  filterMaxStock: '',
  filterEntryDateStart: '',
  filterEntryDateEnd: '',
  filterExpirationDateStart: '',
  filterExpirationDateEnd: '',
  filterQrBarcode: '',
  filterSaleQuantityMin: '',
  filterSaleQuantityMax: '',
  filterSaleDateStart: '',
  filterSaleDateEnd: '',
  filterSaleType: 'all',
};

const applyProductFilters = (product: Product, filters: any) => {
  const matchesProductName = filters.filterProductName === '' || product.name.toLowerCase().includes(filters.filterProductName.toLowerCase());
  const matchesMinPrice = filters.filterMinPrice === '' || product.price >= filters.filterMinPrice;
  const matchesMaxPrice = filters.filterMaxPrice === '' || product.price <= filters.filterMaxPrice;
  const matchesMinStock = filters.filterMinStock === '' || product.stock >= filters.filterMinStock;
  const matchesMaxStock = filters.filterMaxStock === '' || product.stock <= filters.filterMaxStock;
  const matchesEntryDateStart = filters.filterEntryDateStart === '' || (product.entryDate && new Date(product.entryDate) >= new Date(filters.filterEntryDateStart));
  const matchesEntryDateEnd = filters.filterEntryDateEnd === '' || (product.entryDate && new Date(product.entryDate) <= new Date(filters.filterEntryDateEnd));
  const matchesExpirationDateStart = filters.filterExpirationDateStart === '' || (product.expirationDate && new Date(product.expirationDate) >= new Date(filters.filterExpirationDateStart));
  const matchesExpirationDateEnd = filters.filterExpirationDateEnd === '' || (product.expirationDate && new Date(product.expirationDate) <= new Date(filters.filterExpirationDateEnd));
  const matchesQrBarcode = filters.filterQrBarcode === '' || (product.qrCode && product.qrCode.toLowerCase().includes(filters.filterQrBarcode.toLowerCase())) || (product.barcode && product.barcode.toLowerCase().includes(filters.filterQrBarcode.toLowerCase()));

  return (
    matchesProductName &&
    matchesMinPrice &&
    matchesMaxPrice &&
    matchesMinStock &&
    matchesMaxStock &&
    matchesEntryDateStart &&
    matchesEntryDateEnd &&
    matchesExpirationDateStart &&
    matchesExpirationDateEnd &&
    matchesQrBarcode &&
    (filters.filterType === 'all' || product.type === filters.filterType) &&
    (filters.filterSupplier === 'all' || product.supplierId === filters.filterSupplier)
  );
};

export function DashboardSection({
  products,
  sales,
  suppliers,
  widgets,
  setWidgets,
  isClient,
  defaultMaxStock,
}: {
  products: Product[];
  sales: Sale[];
  suppliers: Supplier[];
  widgets: DashboardWidget[];
  setWidgets: (widgets: DashboardWidget[]) => void;
  isClient: boolean;
  defaultMaxStock: number;
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filterState, dispatch] = React.useReducer(filterReducer, initialFilterState);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const notificacionesNoLeidas = 0; // This will be handled by the parent component or a global state

  const datosTendenciaVentas = React.useMemo(() => {
    let datos = [];
    
    const filteredSales = sales.filter(s => {
      const product = products.find(p => p.id === s.productId);
      if (!product) return false; // Skip if product not found

      const filters = {
        filterProductName: filterState.filterProductName,
        filterMinPrice: filterState.filterMinPrice,
        filterMaxPrice: filterState.filterMaxPrice,
        filterMinStock: filterState.filterMinStock,
        filterMaxStock: filterState.filterMaxStock,
        filterEntryDateStart: filterState.filterEntryDateStart,
        filterEntryDateEnd: filterState.filterEntryDateEnd,
        filterExpirationDateStart: filterState.filterExpirationDateStart,
        filterExpirationDateEnd: filterState.filterExpirationDateEnd,
        filterQrBarcode: filterState.filterQrBarcode,
        filterType: filterState.filterType,
        filterSupplier: filterState.filterSupplier
      };

      const matchesProduct = applyProductFilters(product, filters);

      const matchesSaleQuantityMin = filterState.filterSaleQuantityMin === '' || s.quantity >= filterState.filterSaleQuantityMin;
      const matchesSaleQuantityMax = filterState.filterSaleQuantityMax === '' || s.quantity <= filterState.filterSaleQuantityMax;
      const matchesSaleDateStart = filterState.filterSaleDateStart === '' || new Date(s.date) >= new Date(filterState.filterSaleDateStart);
      const matchesSaleDateEnd = filterState.filterSaleDateEnd === '' || new Date(s.date) <= new Date(filterState.filterSaleDateEnd);
      const matchesSaleType = filterState.filterSaleType === 'all' || s.type === filterState.filterSaleType;

      return (
        matchesProduct &&
        matchesSaleQuantityMin &&
        matchesSaleQuantityMax &&
        matchesSaleDateStart &&
        matchesSaleDateEnd &&
        matchesSaleType
      );
    });
    
    if (filterState.dateRange === 'year') {
      // Datos por mes para el año seleccionado
      for (let month = 0; month < 12; month++) {
        const fecha = new Date(filterState.selectedYear, month, 1);
        const finMes = new Date(filterState.selectedYear, month + 1, 0);
        
        const ventasMes = filteredSales.filter(s => 
          s.date >= fecha && 
          s.date <= finMes
        );
        
        datos.push({
          fecha: format(fecha, 'MMM yyyy'),
          ventas: ventasMes.reduce((sum, s) => sum + s.quantity, 0)
        });
      }
    } else {
      // Datos por día según el rango seleccionado
      const dias = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '365d': 365
      }[filterState.dateRange] ?? 7; // Valor por defecto 7 días

      for (let i = dias - 1; i >= 0; i--) {
        const fecha = startOfDay(subDays(new Date(), i));
        const finDia = endOfDay(fecha);
        
        const ventasDia = filteredSales.filter(s => 
          s.date >= fecha && 
          s.date <= finDia
        );
        
        datos.push({
          fecha: format(fecha, 'dd/MM'),
          ventas: ventasDia.reduce((sum, s) => sum + s.quantity, 0)
        });
      }
    }
    
    return datos;
  }, [sales, products, filterState]);

  const inventarioPorTipo = React.useMemo(() => {
    const mapaTipo = new Map<string, number>();
    
    products.forEach(p => {
      const filters = {
        filterProductName: filterState.filterProductName,
        filterMinPrice: filterState.filterMinPrice,
        filterMaxPrice: filterState.filterMaxPrice,
        filterMinStock: filterState.filterMinStock,
        filterMaxStock: filterState.filterMaxStock,
        filterEntryDateStart: filterState.filterEntryDateStart,
        filterEntryDateEnd: filterState.filterEntryDateEnd,
        filterExpirationDateStart: filterState.filterExpirationDateStart,
        filterExpirationDateEnd: filterState.filterExpirationDateEnd,
        filterQrBarcode: filterState.filterQrBarcode,
        filterType: filterState.filterType,
        filterSupplier: filterState.filterSupplier
      };

      if (applyProductFilters(p, filters)) {
        mapaTipo.set(p.type || 'Uncategorized', (mapaTipo.get(p.type || 'Uncategorized') || 0) + p.stock);
      }
    });
    
    return Array.from(mapaTipo.entries()).map(([tipo, stock]) => ({
      tipo,
      stock
    }));
  }, [products, filterState]);

  const ventasRecientes = React.useMemo(() => {
    return sales
      .filter(s => {
        const product = products.find(p => p.id === s.productId);
        if (!product) return false; // Skip if product not found

        const filters = {
          filterProductName: filterState.filterProductName,
          filterMinPrice: filterState.filterMinPrice,
          filterMaxPrice: filterState.filterMaxPrice,
          filterMinStock: filterState.filterMinStock,
          filterMaxStock: filterState.filterMaxStock,
          filterEntryDateStart: filterState.filterEntryDateStart,
          filterEntryDateEnd: filterState.filterEntryDateEnd,
          filterExpirationDateStart: filterState.filterExpirationDateStart,
          filterExpirationDateEnd: filterState.filterExpirationDateEnd,
          filterQrBarcode: filterState.filterQrBarcode,
          filterType: filterState.filterType,
          filterSupplier: filterState.filterSupplier
        };

        const matchesProduct = applyProductFilters(product, filters);

        const matchesSaleQuantityMin = filterState.filterSaleQuantityMin === '' || s.quantity >= filterState.filterSaleQuantityMin;
        const matchesSaleQuantityMax = filterState.filterSaleQuantityMax === '' || s.quantity <= filterState.filterSaleQuantityMax;
        const matchesSaleDateStart = filterState.filterSaleDateStart === '' || new Date(s.date) >= new Date(filterState.filterSaleDateStart);
        const matchesSaleDateEnd = filterState.filterSaleDateEnd === '' || new Date(s.date) <= new Date(filterState.filterSaleDateEnd);
        const matchesSaleType = filterState.filterSaleType === 'all' || s.type === filterState.filterSaleType;

        return (
          s.type === 'sale' &&
          matchesProduct &&
          matchesSaleQuantityMin &&
          matchesSaleQuantityMax &&
          matchesSaleDateStart &&
          matchesSaleDateEnd &&
          matchesSaleType
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(s => {
        const producto = products.find(p => p.id === s.productId);
        return {
          ...s,
          nombreProducto: producto?.name || 'Producto desconocido',
          price: producto?.price || 0
        };
      });
  }, [sales, products, filterState]);

  const productosStockBajo = React.useMemo(() => {
    return products
      .filter(p => {
        const filters = {
          filterProductName: filterState.filterProductName,
          filterMinPrice: filterState.filterMinPrice,
          filterMaxPrice: filterState.filterMaxPrice,
          filterMinStock: filterState.filterMinStock,
          filterMaxStock: filterState.filterMaxStock,
          filterEntryDateStart: filterState.filterEntryDateStart,
          filterEntryDateEnd: filterState.filterEntryDateEnd,
          filterExpirationDateStart: filterState.filterExpirationDateStart,
          filterExpirationDateEnd: filterState.filterExpirationDateEnd,
          filterQrBarcode: filterState.filterQrBarcode,
          filterType: filterState.filterType,
          filterSupplier: filterState.filterSupplier
        };

        return (
          p.stock < (p.minStock ?? 0) &&
          applyProductFilters(p, filters)
        );
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, filterState]);

  const productosProximosCaducar = React.useMemo(() => {
    return products.filter(p => {
      const dias = p.expirationDate ? differenceInDays(new Date(p.expirationDate), new Date()) : -1;
      const filters = {
        filterProductName: filterState.filterProductName,
        filterMinPrice: filterState.filterMinPrice,
        filterMaxPrice: filterState.filterMaxPrice,
        filterMinStock: filterState.filterMinStock,
        filterMaxStock: filterState.filterMaxStock,
        filterEntryDateStart: filterState.filterEntryDateStart,
        filterEntryDateEnd: filterState.filterEntryDateEnd,
        filterExpirationDateStart: filterState.filterExpirationDateStart,
        filterExpirationDateEnd: filterState.filterExpirationDateEnd,
        filterQrBarcode: filterState.filterQrBarcode,
        filterType: filterState.filterType,
        filterSupplier: filterState.filterSupplier
      };

      return (
        dias >= 0 && dias <= 7 &&
        applyProductFilters(p, filters)
      );
    });
  }, [products, filterState]);

  // Manejar reordenamiento de widgets
  const manejarDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = widgets.findIndex(w => w.id === active.id);
      const newIndex = widgets.findIndex(w => w.id === over?.id);
      setWidgets(arrayMove(widgets, oldIndex, newIndex));
    }
  };

  const ventasTotales = React.useMemo(() => {
    return sales
      .filter(s => {
        const product = products.find(p => p.id === s.productId);
        if (!product) return false; // Skip if product not found

        const filters = {
          filterProductName: filterState.filterProductName,
          filterMinPrice: filterState.filterMinPrice,
          filterMaxPrice: filterState.filterMaxPrice,
          filterMinStock: filterState.filterMinStock,
          filterMaxStock: filterState.filterMaxStock,
          filterEntryDateStart: filterState.filterEntryDateStart,
          filterEntryDateEnd: filterState.filterEntryDateEnd,
          filterExpirationDateStart: filterState.filterExpirationDateStart,
          filterExpirationDateEnd: filterState.filterExpirationDateEnd,
          filterQrBarcode: filterState.filterQrBarcode,
          filterType: filterState.filterType,
          filterSupplier: filterState.filterSupplier
        };

        const matchesProduct = applyProductFilters(product, filters);

        const matchesSaleQuantityMin = filterState.filterSaleQuantityMin === '' || s.quantity >= filterState.filterSaleQuantityMin;
        const matchesSaleQuantityMax = filterState.filterSaleQuantityMax === '' || s.quantity <= filterState.filterSaleQuantityMax;
        const matchesSaleDateStart = filterState.filterSaleDateStart === '' || new Date(s.date) >= new Date(filterState.filterSaleDateStart);
        const matchesSaleDateEnd = filterState.filterSaleDateEnd === '' || new Date(s.date) <= new Date(filterState.filterSaleDateEnd);
        const matchesSaleType = filterState.filterSaleType === 'all' || s.type === filterState.filterSaleType;

        return (
          s.type === 'sale' &&
          matchesProduct &&
          matchesSaleQuantityMin &&
          matchesSaleQuantityMax &&
          matchesSaleDateStart &&
          matchesSaleDateEnd &&
          matchesSaleType
        );
      })
      .reduce((total, s) => {
        const producto = products.find(p => p.id === s.productId);
        return total + (s.quantity * (producto?.price || 0));
      }, 0);
  }, [sales, products, filterState]);

  const porcentajeCrecimiento = React.useMemo(() => {
    // Calcular ventas del periodo actual vs anterior
    const periodoEnDias = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365,
      'year': 365
    }[filterState.dateRange] ?? 7; // Valor por defecto 7 días

    const filterSalesByCriteria = (salesToFilter: Sale[], startDate: Date, endDate: Date) => {
      return salesToFilter.filter(s => {
        const product = products.find(p => p.id === s.productId);
        if (!product) return false; // Skip if product not found

        const filters = {
          filterProductName: filterState.filterProductName,
          filterMinPrice: filterState.filterMinPrice,
          filterMaxPrice: filterState.filterMaxPrice,
          filterMinStock: filterState.filterMinStock,
          filterMaxStock: filterState.filterMaxStock,
          filterEntryDateStart: filterState.filterEntryDateStart,
          filterEntryDateEnd: filterState.filterEntryDateEnd,
          filterExpirationDateStart: filterState.filterExpirationDateStart,
          filterExpirationDateEnd: filterState.filterExpirationDateEnd,
          filterQrBarcode: filterState.filterQrBarcode,
          filterType: filterState.filterType,
          filterSupplier: filterState.filterSupplier
        };

        const matchesProduct = applyProductFilters(product, filters);

        const matchesSaleQuantityMin = filterState.filterSaleQuantityMin === '' || s.quantity >= filterState.filterSaleQuantityMin;
        const matchesSaleQuantityMax = filterState.filterSaleQuantityMax === '' || s.quantity <= filterState.filterSaleQuantityMax;
        const matchesSaleDateStart = filterState.filterSaleDateStart === '' || new Date(s.date) >= new Date(filterState.filterSaleDateStart);
        const matchesSaleDateEnd = filterState.filterSaleDateEnd === '' || new Date(s.date) <= new Date(filterState.filterSaleDateEnd);
        const matchesSaleType = filterState.filterSaleType === 'all' || s.type === filterState.filterSaleType;

        return (
          s.type === 'sale' &&
          s.date >= startDate &&
          s.date <= endDate &&
          matchesProduct &&
          matchesSaleQuantityMin &&
          matchesSaleQuantityMax &&
          matchesSaleDateStart &&
          matchesSaleDateEnd &&
          matchesSaleType
        );
      });
    };

    const ventasPeriodoActual = filterSalesByCriteria(sales, subDays(new Date(), periodoEnDias), new Date())
      .reduce((total, s) => {
        const producto = products.find(p => p.id === s.productId);
        return total + (s.quantity * (producto?.price || 0));
      }, 0);

    const ventasPeriodoAnterior = filterSalesByCriteria(sales, subDays(new Date(), periodoEnDias * 2), subDays(new Date(), periodoEnDias))
      .reduce((total, s) => {
        const producto = products.find(p => p.id === s.productId);
        return total + (s.quantity * (producto?.price || 0));
      }, 0);

    if (ventasPeriodoAnterior === 0) return 100;
    return ((ventasPeriodoActual - ventasPeriodoAnterior) / ventasPeriodoAnterior * 100).toFixed(1);
  }, [sales, products, filterState]);

  const productosCaducados = React.useMemo(() => {
    return products.filter(p => {
      const filters = {
        filterProductName: filterState.filterProductName,
        filterMinPrice: filterState.filterMinPrice,
        filterMaxPrice: filterState.filterMaxPrice,
        filterMinStock: filterState.filterMinStock,
        filterMaxStock: filterState.filterMaxStock,
        filterEntryDateStart: filterState.filterEntryDateStart,
        filterEntryDateEnd: filterState.filterEntryDateEnd,
        filterExpirationDateStart: filterState.filterExpirationDateStart,
        filterExpirationDateEnd: filterState.filterExpirationDateEnd,
        filterQrBarcode: filterState.filterQrBarcode,
        filterType: filterState.filterType,
        filterSupplier: filterState.filterSupplier
      };

      return (
        differenceInDays(p.expirationDate, new Date()) < 0 &&
        applyProductFilters(p, filters)
      );
    });
  }, [products, filterState]);

  const productosPorCaducar = React.useMemo(() => {
    return products.filter(p => {
      const dias = differenceInDays(p.expirationDate, new Date());
      const filters = {
        filterProductName: filterState.filterProductName,
        filterMinPrice: filterState.filterMinPrice,
        filterMaxPrice: filterState.filterMaxPrice,
        filterMinStock: filterState.filterMinStock,
        filterMaxStock: filterState.filterMaxStock,
        filterEntryDateStart: filterState.filterEntryDateStart,
        filterEntryDateEnd: filterState.filterEntryDateEnd,
        filterExpirationDateStart: filterState.filterExpirationDateStart,
        filterExpirationDateEnd: filterState.filterExpirationDateEnd,
        filterQrBarcode: filterState.filterQrBarcode,
        filterType: filterState.filterType,
        filterSupplier: filterState.filterSupplier
      };

      return (
        dias >= 0 && dias <= 7 &&
        applyProductFilters(p, filters)
      );
    });
  }, [products, filterState]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
        >
          <Filter size={20} className="mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Global Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Period
              </label>
              <label htmlFor="dashboard-date-range" className="sr-only">Period</label>
              <select
                id="dashboard-date-range"
                value={filterState.dateRange}
                onChange={(e) => dispatch({ type: 'SET_DATE_RANGE', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="365d">Last year</option>
                <option value="year">By year</option>
              </select>
            </div>

            {filterState.dateRange === 'year' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <label htmlFor="dashboard-year-select" className="sr-only">Year</label>
                <select
                  id="dashboard-year-select"
                  value={filterState.selectedYear}
                  onChange={(e) => dispatch({ type: 'SET_SELECTED_YEAR', payload: Number(e.target.value) })}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Type
              </label>
              <label htmlFor="filter-type-select" className="sr-only">Product Type</label>
              <select
                id="filter-type-select"
                value={filterState.filterType}
                onChange={(e) => dispatch({ type: 'SET_FILTER_TYPE', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All types</option>
                {Array.from(new Set(products.map(p => p.type))).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Supplier
              </label>
              <label htmlFor="filter-supplier-select" className="sr-only">Supplier</label>
              <select
                id="filter-supplier-select"
                value={filterState.filterSupplier}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SUPPLIER', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All suppliers</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* New Filters */}
            <div className="lg:col-span-2">
              <label htmlFor="filter-product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
              <input
                type="text"
                id="filter-product-name"
                value={filterState.filterProductName}
                onChange={(e) => dispatch({ type: 'SET_FILTER_PRODUCT_NAME', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search by name"
              />
            </div>

            <div>
              <label htmlFor="filter-min-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Price</label>
              <input
                type="number"
                id="filter-min-price"
                value={filterState.filterMinPrice}
                onChange={(e) => dispatch({ type: 'SET_FILTER_MIN_PRICE', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="filter-max-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Price</label>
              <input
                type="number"
                id="filter-max-price"
                value={filterState.filterMaxPrice}
                onChange={(e) => dispatch({ type: 'SET_FILTER_MAX_PRICE', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="filter-min-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Stock</label>
              <input
                type="number"
                id="filter-min-stock"
                value={filterState.filterMinStock}
                onChange={(e) => dispatch({ type: 'SET_FILTER_MIN_STOCK', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="filter-max-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Stock</label>
              <input
                type="number"
                id="filter-max-stock"
                value={filterState.filterMaxStock}
                onChange={(e) => dispatch({ type: 'SET_FILTER_MAX_STOCK', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="1000"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="filter-qr-barcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">QR / Barcode</label>
              <input
                type="text"
                id="filter-qr-barcode"
                value={filterState.filterQrBarcode}
                onChange={(e) => dispatch({ type: 'SET_FILTER_QR_BARCODE', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Search by QR or Barcode"
              />
            </div>

            <div>
              <label htmlFor="filter-entry-date-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Date (Start)</label>
              <input
                type="date"
                id="filter-entry-date-start"
                value={filterState.filterEntryDateStart}
                onChange={(e) => dispatch({ type: 'SET_FILTER_ENTRY_DATE_START', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="filter-entry-date-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Date (End)</label>
              <input
                type="date"
                id="filter-entry-date-end"
                value={filterState.filterEntryDateEnd}
                onChange={(e) => dispatch({ type: 'SET_FILTER_ENTRY_DATE_END', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="filter-expiration-date-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date (Start)</label>
              <input
                type="date"
                id="filter-expiration-date-start"
                value={filterState.filterExpirationDateStart}
                onChange={(e) => dispatch({ type: 'SET_FILTER_EXPIRATION_DATE_START', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="filter-expiration-date-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiration Date (End)</label>
              <input
                type="date"
                id="filter-expiration-date-end"
                value={filterState.filterExpirationDateEnd}
                onChange={(e) => dispatch({ type: 'SET_FILTER_EXPIRATION_DATE_END', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="filter-sale-quantity-min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sold Quantity (Min.)</label>
              <input
                type="number"
                id="filter-sale-quantity-min"
                value={filterState.filterSaleQuantityMin}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SALE_QUANTITY_MIN', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="filter-sale-quantity-max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sold Quantity (Max.)</label>
              <input
                type="number"
                id="filter-sale-quantity-max"
                value={filterState.filterSaleQuantityMax}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SALE_QUANTITY_MAX', payload: Number(e.target.value) })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="1000"
              />
            </div>

            <div>
              <label htmlFor="filter-sale-date-start" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Date (Start)</label>
              <input
                type="date"
                id="filter-sale-date-start"
                value={filterState.filterSaleDateStart}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SALE_DATE_START', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="filter-sale-date-end" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Date (End)</label>
              <input
                type="date"
                id="filter-sale-date-end"
                value={filterState.filterSaleDateEnd}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SALE_DATE_END', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="filter-sale-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Type</label>
              <select
                id="filter-sale-type"
                value={filterState.filterSaleType}
                onChange={(e) => dispatch({ type: 'SET_FILTER_SALE_TYPE', payload: e.target.value })}
                className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All types</option>
                <option value="sale">Sale</option>
                <option value="disposal">Disposal</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. Añadir el nuevo widget de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ventas Totales</h3>
            <ShoppingCart size={20} className="text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ${ventasTotales.toFixed(2)}
            </p>
            <p className="ml-1 text-sm text-green-600 dark:text-green-400">
              +{porcentajeCrecimiento}%
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            vs periodo anterior
          </p>
        </div>

        <div className="bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-700 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Productos Caducados</h3>
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {productosCaducados.length}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Última semana
          </p>
        </div>

        <div className="bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Por Caducar</h3>
            <Calendar size={20} className="text-yellow-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {productosPorCaducar.length}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Próximos 7 días
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Stock Bajo</h3>
            <Package size={20} className="text-orange-500" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              {productosStockBajo.length}
            </p>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Necesitan reposición
          </p>
        </div>
      </div>

      {/* Continuar con el DndContext y los widgets existentes */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={manejarDragEnd}>
        <SortableContext items={widgets.map(w => w.id)} strategy={verticalListSortingStrategy}>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {widgets.map(widget => widget.visible && (
              <SortableWidget 
                key={widget.id} 
                widget={widget}
              >
                {/* Widget de Medidor de Inventario */}
                {widget.type === 'inventory-table' && (
                  (() => {
                    const isFiltered = filterState.filterType !== 'all' || filterState.filterSupplier !== 'all';
                    const gaugeTitle = isFiltered ? "Inventario Filtrado" : "Nivel de Inventario General";
                    
                    const filteredProducts = products.filter(p =>
                      (filterState.filterType === 'all' || p.type === filterState.filterType) &&
                      (filterState.filterSupplier === 'all' || p.supplierId === filterState.filterSupplier)
                    );

                    const currentStock = filteredProducts.reduce((acc, p) => acc + p.stock, 0);
                    const maxStock = filteredProducts.reduce((acc, p) => acc + (p.maxStock || defaultMaxStock), 0);

                    return (
                      <section aria-label="Medidor de inventario">
                        <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <Package size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" />
                          {gaugeTitle}
                        </h3>
                        <InventoryGauge
                          currentStock={currentStock}
                          maxStock={maxStock}
                          isClient={isClient}
                        />
                      </section>
                    );
                  })()
                )}

                {/* Widget de Ventas Recientes */}
                {widget.type === 'recent-sales' && (
                  <section aria-label="Ventas recientes">
                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <ShoppingCart size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                      Últimas Ventas
                    </h3>
                    <div className="max-h-96">
                      <table className="table-auto w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center">Cantidad</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-right">Precio Unit.</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-right">Fecha</th>
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
                                <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{s.nombreProducto}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 text-center break-words">{s.quantity}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 text-right break-words">${s.price.toFixed(2)}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 text-right break-words">{format(s.date, 'dd/MM/yyyy')}</td>
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
                    <div className="max-h-96">
                      <table className="table-auto w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center">Stock</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Tipo</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                                <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{p.name}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 text-center break-words">{p.stock}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{p.type}</td>
                                <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{proveedor?.name || 'Desconocido'}</td>
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
                    <div className="max-h-96">
                      <table className="table-auto w-full text-left text-sm border border-gray-300 dark:border-gray-700 rounded">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Producto</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center">Días para caducar</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-center">Stock</th>
                            <th className="p-3 border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">Proveedor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                                  <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{p.name}</td>
                                  <td className={`p-3 text-center break-words ${
                                    diasParaCaducar <= 1 
                                      ? 'text-red-600 dark:text-red-400 font-bold' 
                                      : diasParaCaducar <= 3 
                                      ? 'text-yellow-600 dark:text-yellow-400 font-semibold' 
                                      : 'text-gray-900 dark:text-gray-100'
                                  }`}>
                                    {diasParaCaducar >= 0 ? `${diasParaCaducar} día${diasParaCaducar !== 1 ? 's' : ''}` : 'Caducado'}
                                  </td>
                                  <td className="p-3 text-gray-900 dark:text-gray-100 text-center break-words">{p.stock}</td>
                                  <td className="p-3 text-gray-900 dark:text-gray-100 break-words">{proveedor?.name || 'Desconocido'}</td>
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
                    <div className="flex flex-col gap-4">
                      <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <TrendingUp size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                        Tendencia de Ventas
                      </h3>

                      {/* Filtros */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                        <label htmlFor="dashboard-date-range" className="sr-only">Periodo</label>
                        <select
                          id="dashboard-date-range"
                          value={filterState.dateRange}
                          onChange={(e) => dispatch({ type: 'SET_DATE_RANGE', payload: e.target.value })}
                          className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="7d">Últimos 7 días</option>
                          <option value="30d">Últimos 30 días</option>
                          <option value="90d">Últimos 90 días</option>
                          <option value="365d">Último año</option>
                          <option value="year">Por año</option>
                        </select>

                        {filterState.dateRange === 'year' && (
                          <div>
                            <label htmlFor="dashboard-year-select-sales-trend" className="sr-only">Año</label>
                            <select
                              id="dashboard-year-select-sales-trend"
                              aria-label="Año"
                              value={filterState.selectedYear}
                              onChange={(e) => dispatch({ type: 'SET_SELECTED_YEAR', payload: Number(e.target.value) })}
                              className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            >
                              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <label htmlFor="sales-trend-filter-type" className="sr-only">Tipo de Producto</label>
                        <select
                          id="sales-trend-filter-type"
                          value={filterState.filterType}
                          onChange={(e) => dispatch({ type: 'SET_FILTER_TYPE', payload: e.target.value })}
                          className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">Todos los tipos</option>
                          {Array.from(new Set(products.map(p => p.type))).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>

                        <label htmlFor="inventory-by-type-filter-supplier" className="sr-only">Proveedor</label>
                        <select
                          id="inventory-by-type-filter-supplier"
                          value={filterState.filterSupplier}
                          onChange={(e) => dispatch({ type: 'SET_FILTER_SUPPLIER', payload: e.target.value })}
                          className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">Todos los proveedores</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Gráfico */}
                      <div className="w-full h-[300px] sm:h-[400px] lg:h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart 
                            data={datosTendenciaVentas}
                            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                          >
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
                                color: 'rgb(var(--text-gray-900))',
                                fontSize: '12px',
                                padding: '8px',
                                borderRadius: '4px'
                              }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="ventas" stroke="#3b82f6" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </section>
                )}

                {/* Widget de Inventario por Tipo */}
                {widget.type === 'inventory-by-type' && isClient && (
                  <section aria-label="Inventario por tipo">
                    <div className="flex flex-col gap-4">
                      <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Package size={20} className="text-gray-900 dark:text-gray-100" aria-hidden="true" /> 
                        Inventario por Tipo
                      </h3>

                      {/* Filtros */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label htmlFor="inventory-by-type-filter-supplier" className="sr-only">Proveedor</label>
                        <select
                          id="inventory-by-type-filter-supplier"
                          value={filterState.filterSupplier}
                          onChange={(e) => dispatch({ type: 'SET_FILTER_SUPPLIER', payload: e.target.value })}
                          className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="all">Todos los proveedores</option>
                          {suppliers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Gráfico */}
                      <div className="w-full h-[300px] sm:h-[400px] lg:h-[350px]">
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
                    </div>
                  </section>
                )}
              </SortableWidget>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </>
  );
}
