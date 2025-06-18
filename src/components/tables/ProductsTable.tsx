import { useMemo } from 'react';
import { DataTable } from './DataTable';
import { Product } from '../../types/inventory';
import { formatDate } from '../../utils/dateHelpers';
import { useInventory } from '../../context/InventoryContext';

export const ProductsTable = () => {
  const { products } = useInventory();

  const columns = useMemo(() => [
    { 
      header: 'Nombre', 
      accessor: 'name' as const
    },
    { 
      header: 'Stock', 
      accessor: 'stock' as const,
      render: (value: number) => (
        <span className={value <= 5 ? 'text-red-500' : ''}>
          {value}
        </span>
      )
    },
    { 
      header: 'Precio', 
      accessor: 'price' as const,
      render: (value: number) => `$${value.toFixed(2)}`
    },
    { 
      header: 'Fecha Vencimiento', 
      accessor: 'expirationDate' as const,
      render: (value: Date) => formatDate(value)
    },
    { 
      header: 'Tipo', 
      accessor: 'type' as const
    }
  ], []);

  return (
    <DataTable<Product>
      data={products}
      columns={columns}
    />
  );
};