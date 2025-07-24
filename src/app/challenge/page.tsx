
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChallengeSession } from '@/types';

export default function ChallengePage() {
  const [participantName, setParticipantName] = useState('');
  const [participantLastName, setParticipantLastName] = useState('');
  const [participantRole, setParticipantRole] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [mode, setMode] = useState<'manual' | 'app'>('app');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleStartChallenge = async () => {
    if (!participantName.trim()) {
      setError('Por favor, ingresa tu nombre.');
      return;
    }

    if( !participantLastName.trim()) {
      setError('Por favor, ingresa tu apellido.');
      return;
    }

    if (!participantRole.trim()) {
      setError('Por favor, ingresa tu rol en ESPOL.');
      return;
    }
    if (!participantEmail.trim() || !/\S+@\S+\.\S+/.test(participantEmail) || participantPhone.trim() === '') {
      setError('Por favor, ingresa al menos tu correo electrónico o telefono.');
      return;
    }

    try {
      const res = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName, participantLastName, participantRole, participantEmail, participantPhone, mode }),
      });

      if (!res.ok) {
        throw new Error('Failed to start challenge session');
      }
      console.log('Challenge session started successfully');
      const session: ChallengeSession = await res.json();
      console.log('Session data:', session);
      
      // Store session in local storage to manage state across pages
      localStorage.setItem('challengeSession', JSON.stringify(session));

      if (mode === 'app') {
        router.push('/'); // Redirect to the main app
      } else {
        // For manual mode, we stay on a simplified page
        router.push(`/challenge/manual?session_id=${session.id}`);
      }
    } catch (err) {
      setError('No se pudo iniciar el desafío. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">

    <div className="flex flex-row items-center">
            <div className='flex flex-col items-center justify-center m-4'>
      <Image src="/images/logo_espol_antiguo.png" alt="Logo antiguo" width={200} height={150} className="opacity-75 brightness-200" />
          <p className='text-white '>1985</p>
      </div>


      <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
        
        <div className="flex justify-center">
            <Image src="https://images.squarespace-cdn.com/content/v1/55d9fb0ee4b0dfd798034243/d3813868-1672-4f15-89d7-27c6a35210c6/logos-i3lab-espol-reducido.png?format=1500w" alt="Logo Feria" width={200} height={100} />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Desafío Prototipo en Acción</h1>
        <div className='flex flex-row items-center justify-center space-x-4'>
            <div>
              <label htmlFor="participantName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
              <input
                id="participantName"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label htmlFor="participantLasName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Apellido</label>
              <input
                id="participantLastName"
                type="text"
                value={participantLastName}
                onChange={(e) => setParticipantLastName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
                placeholder="Tu apellido"
              />
            </div>
        </div>

        <div>
          <label htmlFor="participantRole" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol en espol</label>
          <input
            id="participantRole"
            type="text"
            value={participantRole}
            onChange={(e) => setParticipantRole(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            placeholder="Tu rol en la ESPOL (estudiante, docente, etc.)"
          />
        </div>

        <div>
          <label htmlFor="participantEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
          <input
            id="participantEmail"
            type="email"
            value={participantEmail}
            onChange={(e) => setParticipantEmail(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            placeholder="Tu correo electrónico"
          />
        </div>
        <div>
          <label htmlFor="participantPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
          <input
            id="participantPhone"
            type="tel"
            value={participantPhone}
            onChange={(e) => setParticipantPhone(e.target.value)}
            className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
            placeholder="Tu número de teléfono"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo de Desafío</label>
          <div className="mt-2 flex rounded-md shadow-sm">
            <button
              onClick={() => setMode('app')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-colors ${mode === 'app' ? 'bg-blue-600 text-white z-10 ring-2 ring-blue-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              Con la App
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-colors ${mode === 'manual' ? 'bg-blue-600 text-white z-10 ring-2 ring-blue-500' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
              Manual (Cuaderno)
            </button>
          </div>
        </div>

        <div className="text-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md">
          {mode === 'app' ? (
            <p className="text-gray-600 dark:text-gray-400">Al iniciar, serás redirigido a la aplicación para completar el inventario. ¡Mucha suerte!</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Al iniciar, solo se activará el cronómetro. Deberás realizar el inventario en tu cuaderno y presionar Finalizar cuando termines.</p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleStartChallenge}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          Iniciar Desafío
        </button>
      </div>
      <div className='flex flex-col items-center justify-center ml-7'>
      <Image src="/images/espol.png" alt="Llama" width={180} height={160} className="opacity-75 invert" />
          <p className='text-white pt-2'>2025</p>
      </div>
      </div>

      <Image src="/images/llama.png" alt="Llama" width={200} height={150} className="" />
    
    </div>
  );
}
