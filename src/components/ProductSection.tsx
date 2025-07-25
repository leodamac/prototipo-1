
import React from 'react';
import Image from 'next/image';
import { Package, ShoppingCart, Plus, Edit, Trash2, Search, List, LayoutGrid, MoreVertical } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Product, Sale, Supplier } from '../types';

interface ProductSectionProps {
  products: Product[];
  suppliers: Supplier[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterSupplier: string;
  setFilterSupplier: (supplierId: string) => void;
  compactView: boolean;
  setShowAddProductModal: (show: boolean) => void;
  onDeleteProduct: (productId: string) => void;
  productDeleteError: string | null;
  setProductDeleteError: (error: string | null) => void;
  productDeleteSuccess: string | null;
  setProductDeleteSuccess: (success: string | null) => void;
  onManageStock: (product: Product) => void;
}

export function ProductSection({
  products,
  suppliers,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  filterSupplier,
  setFilterSupplier,
  compactView,
  setShowAddProductModal,
  onDeleteProduct,
  productDeleteError,
  setProductDeleteError,
  productDeleteSuccess,
  setProductDeleteSuccess,
  onManageStock,
}: ProductSectionProps) {

  const productosFiltrados = React.useMemo(() => {
    return products.filter(p => {
      const searchLower = searchTerm.toLowerCase();
      const coincideBusqueda = 
        p.name.toLowerCase().includes(searchLower) || 
        (p.qrCode && p.qrCode.toLowerCase().includes(searchLower)) || 
        (p.barcode && p.barcode.toLowerCase().includes(searchLower));
      
      const coincideTipo = filterType === 'all' || p.type === filterType;
      const coincideProveedor = filterSupplier === 'all' || p.supplierId === filterSupplier;
      
      return coincideBusqueda && coincideTipo && coincideProveedor;
    });
  }, [products, searchTerm, filterType, filterSupplier]);

  const getSupplierName = (supplierId: string | null | undefined) => {
    if (!supplierId) return 'Desconocido';
    return suppliers.find(s => s.id === supplierId)?.name || 'Desconocido';
  };

  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const toggleMenu = (productId: string) => {
    setOpenMenuId(openMenuId === productId ? null : productId);
  };

  const isValidUrl = (url: string | null | undefined) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  return (
    <section className="space-y-6">
      {/* Cabecera y Controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-100">
          <Package size={28} />
          Gestión de Productos
        </h2>
        <button
          onClick={() => setShowAddProductModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Añadir Producto
        </button>
      </div>

      {productDeleteError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {productDeleteError}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg onClick={() => setProductDeleteError(null)} className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {productDeleteSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Éxito!</strong>
          <span className="block sm:inline"> {productDeleteSuccess}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <svg onClick={() => setProductDeleteSuccess(null)} className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </span>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="p-4 bg-gray-800 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <label htmlFor="search-product" className="sr-only">Buscar producto</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              id="search-product"
              type="text"
              placeholder="Buscar por nombre, QR o código de barras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Filtro por Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500"
            title="Filtrar por tipo de producto"
          >
            <option value="all">Todos los Tipos</option>
            {Array.from(new Set(products.map(p => p.type))).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {/* Filtro por Proveedor */}
          <select
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 focus:ring-2 focus:ring-blue-500"
            title="Filtrar por proveedor"
          >
            <option value="all">Todos los Proveedores</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {/* Controles de Vista 
        <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-gray-400">Vista:</span>
            <button onClick={() => setCompactView(false)} className={`p-2 rounded-md ${!compactView ? 'bg-blue-900 text-blue-600' : 'text-gray-500 hover:bg-gray-700'}`} aria-label="Vista de lista">
                <List size={20} />
            </button>
            <button onClick={() => setCompactView(true)} className={`p-2 rounded-md ${compactView ? 'bg-blue-900 text-blue-600' : 'text-gray-500 hover:bg-gray-700'}`} aria-label="Vista de cuadrícula">
                <LayoutGrid size={20} />
            </button>
        </div>*/}
      </div>

      {/* Tabla de Productos */}
      <div className="bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto hidden md:block">
          <table className="table-auto w-full text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Producto</th>
                {!compactView && <th scope="col" className="px-6 py-3">Tipo</th>}
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                {!compactView && <th scope="col" className="px-6 py-3">Proveedor</th>}
                <th scope="col" className="px-6 py-3">Caducidad</th>
                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={compactView ? 5 : 7} className="py-8 text-center text-gray-400">
                  No se encontraron productos que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              productosFiltrados.map(p => {
                const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
                const caducidadColor = 
                  diasParaCaducar < 0 ? 'text-red-500 font-bold' :
                  diasParaCaducar <= 3 ? 'text-yellow-500 font-semibold' :
                  'text-gray-100';

                return (
                  <tr key={p.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                    <th scope="row" className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-3">
                        {isValidUrl(p.image) ? (
                          <Image src={p.image!} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                            <Package size={20} className="text-gray-500" />
                          </div>
                        )}
                        {p.name}
                      </div>
                    </th>
                    {!compactView && <td className="px-6 py-4 break-words text-gray-100">{p.type}</td>}
                    <td className="px-6 py-4 break-words text-gray-100">{p.stock} / {p.maxStock || 100}</td>
                    <td className="px-6 py-4 break-words text-gray-100">${p.price.toFixed(2)}</td>
                    {!compactView && <td className="px-6 py-4 break-words text-gray-100">{getSupplierName(p.supplierId)}</td>}
                    <td className={`px-6 py-4 break-words ${caducidadColor}`}>
                      {diasParaCaducar < 0 ? 'Caducado' : `${diasParaCaducar} días`}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Menú de acciones para pantallas pequeñas */}
                      <div className="md:hidden relative">
                        <button onClick={() => toggleMenu(p.id)} className="p-2 rounded-full hover:bg-gray-700" aria-label="Opciones del producto">
                          <MoreVertical size={20} />
                        </button>
                        {openMenuId === p.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-10 border border-gray-700">
                            <ul className="py-1 text-sm text-gray-200">
                              <li>
                                <button
                                  onClick={() => {
                                    onManageStock(p);
                                    toggleMenu(p.id);
                                  }}
                                  className="w-full text-left flex items-center gap-2 px-4 py-2 hover:bg-gray-600"
                                >
                                  <ShoppingCart size={16} /> Gestionar/Vender
                                </button>
                              </li>
                              <li>
                                <button
                                  onClick={() => { onDeleteProduct(p.id); toggleMenu(p.id); }}
                                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-900/50"
                                >
                                  <Trash2 size={16} /> Eliminar
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción para pantallas grandes */}
                      <div className="hidden md:flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onManageStock(p)}
                          className="p-2 text-blue-400 hover:text-blue-300"
                          aria-label="Gestionar o vender producto"
                        >
                          <ShoppingCart size={18} />
                        </button>
                        <button 
                          onClick={() => onDeleteProduct(p.id)} 
                          className="p-2 text-red-400 hover:text-red-300"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden space-y-4 p-4">
          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-400">
              No se encontraron productos que coincidan con los filtros.
            </p>
          ) : (
            productosFiltrados.map(p => {
              const diasParaCaducar = differenceInDays(p.expirationDate, new Date());
              const caducidadColor =
                diasParaCaducar < 0 ? 'text-red-500 font-bold' :
                diasParaCaducar <= 3 ? 'text-yellow-500 font-semibold' :
                'text-gray-100';

              return (
                <div key={p.id} className="bg-gray-700 rounded-lg shadow p-4 space-y-2 border border-gray-600">
                  <div className="flex items-center gap-3">
                    {isValidUrl(p.image) ? (
                      <Image src={p.image!} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <Package size={20} className="text-gray-500" />
                      </div>
                    )}
                    <h3 className="font-semibold text-gray-100">{p.name}</h3>
                  </div>
                  <p className="text-gray-100"><span className="font-medium">Tipo:</span> {p.type}</p>
                  <p className="text-gray-100"><span className="font-medium">Stock:</span> {p.stock} / {p.maxStock || 100}</p>
                  <p className="text-gray-100"><span className="font-medium">Precio:</span> ${p.price.toFixed(2)}</p>
                  <p className="text-gray-100"><span className="font-medium">Proveedor:</span> {getSupplierName(p.supplierId)}</p>
                  <p className={`text-gray-100 ${caducidadColor}`}><span className="font-medium">Caducidad:</span> {diasParaCaducar < 0 ? 'Caducado' : `${diasParaCaducar} días`}</p>
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-600">
                    <button 
                      onClick={() => onManageStock(p)}
                      className="p-2 text-blue-400 hover:text-blue-300"
                      aria-label="Gestionar o vender producto"
                    >
                      <ShoppingCart size={20} />
                    </button>
                    <button 
                      onClick={() => onDeleteProduct(p.id)} 
                      className="p-2 text-red-400 hover:text-red-300"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
