
'use client';

import React from 'react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-green-500">¡Gracias por participar!</h1>
        <p className="text-gray-700 dark:text-gray-300">Tus resultados han sido guardados. Agradecemos tu tiempo y tus comentarios.</p>
        <Link href="/challenge"
           className="inline-block px-6 py-3 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Volver al inicio del desafío
        </Link>
      </div>
    </div>
  );
}
