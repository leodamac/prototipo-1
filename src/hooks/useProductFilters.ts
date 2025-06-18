import { useMemo, useState } from 'react';
import { Product } from '../types/inventory';

export const useProductFilters = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterSupplier, setFilterSupplier] = useState('all');
    const [compactView, setCompactView] = useState(false);

    const applyFilters = (products: Product[]) => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || product.type === filterType;
            const matchesSupplier = filterSupplier === 'all' || product.supplierId === filterSupplier;

            return matchesSearch && matchesType && matchesSupplier;
        });
    };

    return {
        searchTerm,
        setSearchTerm,
        filterType,
        setFilterType,
        filterSupplier,
        setFilterSupplier,
        compactView,
        setCompactView,
        applyFilters
    };
};