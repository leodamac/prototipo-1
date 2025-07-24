
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FinishChallengeModal } from '@/components/FinishChallengeModal';
import Image from 'next/image';

function ManualChallengeComponent() {
  const [time, setTime] = useState(0);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prevTime => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    setShowFinishModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md flex flex-col items-center justify-center bg-gray-800 rounded-2xl shadow-xl">
        <div className='flex flex-row items-center bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 text-center'>
        <div className="w-full h-full max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-white">Modo Manual</h1>
        <p className="text-gray-400">Estás realizando el inventario con cuaderno y lápiz. El tiempo corre.</p>
        <div className="text-6xl font-mono font-bold text-blue-400 bg-gray-700 rounded-lg p-4">
          {formatTime(time)}
        </div>
        
        </div>
        <div className='w-full max-w-md mx-auto'>
        <Image src="/images/tortuga.png" alt="Tortuga" width={250} height={250} className="scale-x-[-1]" />
        </div>
        </div>
        <button
          onClick={handleFinish}
          className="w-full py-3 px-4 border border-transparent rounded-b-2xl shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Finalizar Desafío
        </button>
      </div>            

      {showFinishModal && sessionId && (
        <FinishChallengeModal
          isOpen={showFinishModal}
          onClose={() => setShowFinishModal(false)}
          sessionId={sessionId}
        />
      )}
    </div>
  );
}

export default function ManualChallengePage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ManualChallengeComponent />
    </Suspense>
  );
}
