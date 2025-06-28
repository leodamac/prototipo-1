import React from 'react';
import { Settings } from 'lucide-react';

interface SettingsSectionProps {
  scanError: number;
  setScanError: (error: number) => void;
  defaultMaxStock: number;
  setDefaultMaxStock: (stock: number) => void;
}

export function SettingsSection({
  scanError,
  setScanError,
  defaultMaxStock,
  setDefaultMaxStock,
}: SettingsSectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100"><Settings size={28} aria-hidden="true" /> Configuraciones</h2>
      <div className="space-y-6 max-w-md">
        <div>
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
        </div>
        <div>
          <label htmlFor="defaultMaxStock" className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">Capacidad Máxima de Stock por Defecto</label>
          <input
            id="defaultMaxStock"
            type="number"
            min={1}
            value={defaultMaxStock}
            onChange={e => setDefaultMaxStock(Math.max(1, Number(e.target.value)))}
            className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            aria-describedby="defaultMaxStockHelp"
          />
          <small id="defaultMaxStockHelp" className="text-gray-500 dark:text-gray-400">
            Establece la capacidad de stock por defecto para los nuevos productos.
          </small>
        </div>
      </div>
    </section>
  );
}
