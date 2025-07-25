
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/common/Modal';
import Image from 'next/image';

interface FinishChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function FinishChallengeModal({ isOpen, onClose, sessionId }: FinishChallengeModalProps) {
  const [comments, setComments] = useState('');
  const [type, setType] = useState<'apoyo' | 'retroalimentacion'>('retroalimentacion');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleConfirmFinish = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/challenge/${sessionId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments, type }),
      });

      if (!res.ok) {
        throw new Error('Failed to update challenge session');
      }

      localStorage.removeItem('challengeSession');
      onClose();
      router.push('/challenge/thankyou');

    } catch (err) {
      setError('No se pudo finalizar el desafío. Inténtalo de nuevo.');
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Desafío">

        <p className="text-gray-300">¿Estás seguro de que quieres finalizar el desafío? Esta acción no se puede deshacer.</p>
              <div className="flex flex-col place-content-center  p-4 space-y-4">

<div className="flex flex-col space-y-2">
  <div className="flex justify-center space-x-4">
    <button
      type="button"
      onClick={() => setType('apoyo')}
      className={`px-3 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        type === 'apoyo'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      Apoyo
    </button>
    <button
      type="button"
      onClick={() => setType('retroalimentacion')}
      className={`px-3 py-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
        type === 'retroalimentacion'
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      Retroalimentación
    </button>
  </div>
  <label htmlFor="comments" className="block text-sm font-medium text-gray-300">
    Retroalimentación sobre la app
  </label>
  <textarea
    id="comments"
    value={comments}
    onChange={(e) => setComments(e.target.value)}
    rows={4}
    className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-100"
    placeholder={'¿Qué podrías comentar sobre la experiencia de nuestra aplicación?'}
  />
</div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmFinish}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Finalizando...' : 'Confirmar y Finalizar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
