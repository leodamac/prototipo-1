import React from 'react';
import { X } from 'lucide-react';
import { Product, Supplier } from '../types';

interface DashboardFilterPanelProps {
  showFilterPanel: boolean;
  setShowFilterPanel: (show: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  dateRange: string;
  setDateRange: (range: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterSupplier: string;
  setFilterSupplier: (supplierId: string) => void;
  filterProductName: string;
  setFilterProductName: (name: string) => void;
  filterMinPrice: number | '';
  setFilterMinPrice: (price: number | '') => void;
  filterMaxPrice: number | '';
  setFilterMaxPrice: (price: number | '') => void;
  filterMinStock: number | '';
  setFilterMinStock: (stock: number | '') => void;
  filterMaxStock: number | '';
  setFilterMaxStock: (stock: number | '') => void;
  filterEntryDateStart: string;
  setFilterEntryDateStart: (date: string) => void;
  filterEntryDateEnd: string;
  setFilterEntryDateEnd: (date: string) => void;
  filterExpirationDateStart: string;
  setFilterExpirationDateStart: (date: string) => void;
  filterExpirationDateEnd: string;
  setFilterExpirationDateEnd: (date: string) => void;
  filterQrBarcode: string;
  setFilterQrBarcode: (code: string) => void;
  filterSaleQuantityMin: number | '';
  setFilterSaleQuantityMin: (quantity: number | '') => void;
  filterSaleQuantityMax: number | '';
  setFilterSaleQuantityMax: (quantity: number | '') => void;
  filterSaleDateStart: string;
  setFilterSaleDateStart: (date: string) => void;
  filterSaleDateEnd: string;
  setFilterSaleDateEnd: (date: string) => void;
  filterSaleType: string;
  setFilterSaleType: (type: string) => void;
}

export function DashboardFilterPanel({
  showFilterPanel,
  setShowFilterPanel,
  products,
  suppliers,
  dateRange,
  setDateRange,
  selectedYear,
  setSelectedYear,
  filterType,
  setFilterType,
  filterSupplier,
  setFilterSupplier,
  filterProductName,
  setFilterProductName,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  filterMinStock,
  setFilterMinStock,
  filterMaxStock,
  setFilterMaxStock,
  filterEntryDateStart,
  setFilterEntryDateStart,
  filterEntryDateEnd,
  setFilterEntryDateEnd,
  filterExpirationDateStart,
  setFilterExpirationDateStart,
  filterExpirationDateEnd,
  setFilterExpirationDateEnd,
  filterQrBarcode,
  setFilterQrBarcode,
  filterSaleQuantityMin,
  setFilterSaleQuantityMin,
  filterSaleQuantityMax,
  setFilterSaleQuantityMax,
  filterSaleDateStart,
  setFilterSaleDateStart,
  filterSaleDateEnd,
  setFilterSaleDateEnd,
  filterSaleType,
  setFilterSaleType,
}: DashboardFilterPanelProps) {

  if (!showFilterPanel) return null;

  const handleClearFilters = () => {
    setDateRange('7d');
    setSelectedYear(new Date().getFullYear());
    setFilterType('all');
    setFilterSupplier('all');
    setFilterProductName('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterMinStock('');
    setFilterMaxStock('');
    setFilterEntryDateStart('');
    setFilterEntryDateEnd('');
    setFilterExpirationDateStart('');
    setFilterExpirationDateEnd('');
    setFilterQrBarcode('');
    setFilterSaleQuantityMin('');
    setFilterSaleQuantityMax('');
    setFilterSaleDateStart('');
    setFilterSaleDateEnd('');
    setFilterSaleType('all');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] md:relative md:bg-transparent md:backdrop-blur-none md:z-auto">
      <div className="fixed right-0 top-0 h-full w-full max-w-xs bg-gray-800 shadow-lg p-6 overflow-y-auto md:relative md:max-w-none md:h-auto md:shadow-none md:p-0">
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h3 className="text-lg font-semibold text-gray-100">Filtros</h3>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="text-gray-400 hover:text-gray-200"
            aria-label="Cerrar filtros"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Filtros de Producto */}
          <div>
            <h4 className="text-md font-semibold text-gray-100 mb-3">Filtros de Producto</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter-product-name" className="block text-sm font-medium text-gray-300 mb-1">Nombre de Producto</label>
                <input
                  id="filter-product-name"
                  type="text"
                  value={filterProductName}
                  onChange={(e) => setFilterProductName(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  placeholder="Buscar por nombre"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="filter-min-price" className="block text-sm font-medium text-gray-300 mb-1">Precio Mínimo</label>
                  <input
                    id="filter-min-price"
                    type="number"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(Number(e.target.value))}
                    className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="filter-max-price" className="block text-sm font-medium text-gray-300 mb-1">Precio Máximo</label>
                  <input
                    id="filter-max-price"
                    type="number"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(Number(e.target.value))}
                    className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="filter-min-stock" className="block text-sm font-medium text-gray-300 mb-1">Stock Mínimo</label>
                  <input
                    id="filter-min-stock"
                    type="number"
                    value={filterMinStock}
                    onChange={(e) => setFilterMinStock(Number(e.target.value))}
                    className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="filter-max-stock" className="block text-sm font-medium text-gray-300 mb-1">Stock Máximo</label>
                  <input
                    id="filter-max-stock"
                    type="number"
                    value={filterMaxStock}
                    onChange={(e) => setFilterMaxStock(Number(e.target.value))}
                    className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                    placeholder="1000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="filter-product-type" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Producto</label>
                <select
                  id="filter-product-type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  aria-label="Tipo de Producto"
                  title="Tipo de Producto"
                >
                  <option value="all">Todos los tipos</option>
                  {Array.from(new Set(products.map(p => p.type))).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-supplier" className="block text-sm font-medium text-gray-300 mb-1">Proveedor</label>
                <select
                  id="filter-supplier"
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Proveedor"
                  aria-label="Proveedor"
                >
                  <option value="all">Todos los proveedores</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-qr-barcode" className="block text-sm font-medium text-gray-300 mb-1">Código QR / Barras</label>
                <input
                  id="filter-qr-barcode"
                  type="text"
                  value={filterQrBarcode}
                  onChange={(e) => setFilterQrBarcode(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  placeholder="Buscar por QR o Barras"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Fecha de Producto */}
          <div>
            <h4 className="text-md font-semibold text-gray-100 mb-3">Fechas de Producto</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter-entry-date-start" className="block text-sm font-medium text-gray-300 mb-1">Fecha Entrada (Inicio)</label>
                <input
                  id="filter-entry-date-start"
                  type="date"
                  value={filterEntryDateStart}
                  onChange={(e) => setFilterEntryDateStart(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Entrada (Inicio)"
                  placeholder="Selecciona fecha de inicio"
                />
              </div>
              <div>
                <label htmlFor="filter-entry-date-end" className="block text-sm font-medium text-gray-300 mb-1">Fecha Entrada (Fin)</label>
                <input
                  id="filter-entry-date-end"
                  type="date"
                  value={filterEntryDateEnd}
                  onChange={(e) => setFilterEntryDateEnd(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Entrada (Fin)"
                  placeholder="Selecciona fecha de fin"
                />
              </div>
              <div>
                <label htmlFor="filter-expiration-date-start" className="block text-sm font-medium text-gray-300 mb-1">Fecha Caducidad (Inicio)</label>
                <input
                  id="filter-expiration-date-start"
                  type="date"
                  value={filterExpirationDateStart}
                  onChange={(e) => setFilterExpirationDateStart(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Caducidad (Inicio)"
                  placeholder="Selecciona fecha de inicio"
                />
              </div>
              <div>
                <label htmlFor="filter-expiration-date-end" className="block text-sm font-medium text-gray-300 mb-1">Fecha Caducidad (Fin)</label>
                <input
                  id="filter-expiration-date-end"
                  type="date"
                  value={filterExpirationDateEnd}
                  onChange={(e) => setFilterExpirationDateEnd(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Caducidad (Fin)"
                  placeholder="Selecciona fecha de fin"
                />
              </div>
            </div>
          </div>

          {/* Filtros de Venta */}
          <div>
            <h4 className="text-md font-semibold text-gray-100 mb-3">Filtros de Venta</h4>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter-sale-quantity-min" className="block text-sm font-medium text-gray-300 mb-1">Cantidad Vendida (Mín.)</label>
                <input
                  id="filter-sale-quantity-min"
                  type="number"
                  value={filterSaleQuantityMin}
                  onChange={(e) => setFilterSaleQuantityMin(Number(e.target.value))}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                    placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="filter-sale-quantity-max" className="block text-sm font-medium text-gray-300 mb-1">Cantidad Vendida (Máx.)</label>
                <input
                  id="filter-sale-quantity-max"
                  type="number"
                  value={filterSaleQuantityMax}
                  onChange={(e) => setFilterSaleQuantityMax(Number(e.target.value))}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  placeholder="1000"
                  title="Cantidad Vendida (Máx.)"
                />
              </div>
              <div>
                <label htmlFor="filter-sale-date-start" className="block text-sm font-medium text-gray-300 mb-1">Fecha Venta (Inicio)</label>
                <input
                  id="filter-sale-date-start"
                  type="date"
                  value={filterSaleDateStart}
                  onChange={(e) => setFilterSaleDateStart(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Venta (Inicio)"
                  placeholder="Selecciona fecha de inicio"
                />
              </div>
              <div>
                <label htmlFor="filter-sale-date-end" className="block text-sm font-medium text-gray-300 mb-1">Fecha Venta (Fin)</label>
                <input
                  id="filter-sale-date-end"
                  type="date"
                  value={filterSaleDateEnd}
                  onChange={(e) => setFilterSaleDateEnd(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Fecha Venta (Fin)"
                  placeholder="Selecciona fecha de fin"
                />
              </div>
              <div>
                <label htmlFor="filter-sale-type" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Venta</label>
                <select
                  id="filter-sale-type"
                  value={filterSaleType}
                  onChange={(e) => setFilterSaleType(e.target.value)}
                  className="w-full rounded border border-gray-600 px-3 py-2 bg-gray-700 text-gray-100"
                  title="Tipo de Venta"
                  aria-label="Tipo de Venta"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="sale">Venta</option>
                  <option value="disposal">Desecho</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Limpiar Filtros
          </button>
          <button
            onClick={() => setShowFilterPanel(false)}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}