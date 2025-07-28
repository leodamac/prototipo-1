import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import { Sale, Product } from '../types';

interface SalesSectionProps {
  sales: Sale[];
  products: Product[];
}

export function SalesSection({
  sales,
  products,
}: SalesSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-gray-100">
        <ShoppingCart size={28} className="text-gray-100" aria-hidden="true" />
        Movimientos de Stock
      </h2>

      <div className="bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto hidden md:block">
          <table className="table-auto w-full text-left text-sm border border-gray-700 rounded">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2 border-b border-gray-600 text-gray-100">Producto</th>
                <th className="p-2 border-b border-gray-600 text-gray-100">Cantidad</th>
                <th className="p-2 border-b border-gray-600 text-gray-100">Tipo</th>
                <th className="p-2 border-b border-gray-600 text-gray-100">Fecha</th>
              </tr>
            </thead>
            <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-400">
                  No hay registros de ventas o desechos
                </td>
              </tr>
            ) : (
              sales.map(s => {
                const producto = products.find(p => p.id === s.productId);
                return (
                  <tr key={s.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-2 text-gray-100 break-words">
                      {producto?.name || 'Producto desconocido'}
                    </td>
                    <td className="p-2 text-gray-100 text-center break-words">
                      {s.quantity}
                    </td>
                    <td className="p-2 text-gray-100 break-words">
                      {s.type === 'sale' ? 'Venta' : 'Desecho'}
                    </td>
                    <td className="p-2 text-gray-100 text-right break-words">
                      {format(s.date, 'dd/MM/yyyy')}
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
          {sales.length === 0 ? (
            <p className="p-4 text-center text-gray-400">
              No hay registros de ventas o desechos
            </p>
          ) : (
            sales.map(s => {
              const producto = products.find(p => p.id === s.productId);
              return (
                <div key={s.id} className="bg-gray-700 rounded-lg shadow p-4 space-y-2 border border-gray-600">
                  <p className="text-gray-100"><span className="font-medium">Producto:</span> {producto?.name || 'Producto desconocido'}</p>
                  <p className="text-gray-100"><span className="font-medium">Cantidad:</span> {s.quantity}</p>
                  <p className="text-gray-100"><span className="font-medium">Tipo:</span> {s.type === 'sale' ? 'Venta' : 'Desecho'}</p>
                  <p className="text-gray-100"><span className="font-medium">Fecha:</span> {format(s.date, 'dd/MM/yyyy')}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
