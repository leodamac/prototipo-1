
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface InventoryGaugeProps {
  currentStock: number;
  maxStock: number;
  isClient: boolean;
}

const getPathColor = (percentage: number) => {
  if (percentage < 20) return '#ef4444'; // Rojo
  if (percentage < 60) return '#f59e0b'; // Amarillo
  return '#22c55e'; // Verde
};

export function InventoryGauge({ currentStock, maxStock, isClient }: InventoryGaugeProps) {
  if (!isClient) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
      </div>
    );
  }

  const percentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
  const data = [
    { name: 'Stock', value: currentStock },
    { name: 'Capacidad Restante', value: maxStock - currentStock },
  ];

  const pathColor = getPathColor(percentage);

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            <Cell key="stock-cell" fill={pathColor} />
            <Cell key="remaining-cell" fill="#e5e7eb" />
            <Label
              value={`${percentage.toFixed(0)}%`}
              position="center"
              dy={-10}
              className="text-3xl font-bold fill-gray-900 dark:fill-gray-100"
            />
            <Label
              value="Capacidad Total"
              position="center"
              dy={20}
              className="text-sm fill-gray-500 dark:fill-gray-400"
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
