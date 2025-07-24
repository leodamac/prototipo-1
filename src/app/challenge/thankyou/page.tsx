
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center">
            <Image src="/images/logo_light.png" alt="logo dark" width={250} height={250} className="m-4"/>

      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-4xl font-bold text-green-500">¡Gracias por participar!</h1>
        <Image src="/images/burro.png" alt="Burro" width={200} height={150} className="inline-block px-6 py-3 mt-4"/>
        
        <p className="text-gray-300">Tus resultados han sido guardados. Agradecemos tu tiempo y tus comentarios.</p>
        
        <Link href="/challenge"
           className="inline-block px-6 py-3 mt-4 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Volver al inicio del desafío
        </Link>
      </div>
      

    </div>
  );
}
