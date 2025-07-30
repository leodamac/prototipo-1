'use client';

import React, { useState, useEffect } from 'react';
import ChallengeResultCard from '../../components/ChallengeResultCard';
import { Modal } from '../../components/common/Modal';

interface ChallengeSession {
  id: string;
  participantName: string;
  participantLastName?: string | null;
  participantRole?: string | null;
  mail?: string | null;
  telephone?: string | null;
  challengeType?: string | null;
  mode?: string | null;
  startTime: string;
  endTime?: string | null;
  comments?: string | null;
}

const ChallengeResultsPage = () => {
  const [sessions, setSessions] = useState<ChallengeSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChallengeSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/challenge-results');
        if (!response.ok) {
          throw new Error('Failed to fetch challenge sessions');
        }
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const openModal = (session: ChallengeSession, index: number) => {
    setSelectedSession(session);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedSession(null);
  };

  const showNext = () => {
    const nextIndex = (currentIndex + 1) % sessions.length;
    setCurrentIndex(nextIndex);
    setSelectedSession(sessions[nextIndex]);
  };

  const showPrev = () => {
    const prevIndex = (currentIndex - 1 + sessions.length) % sessions.length;
    setCurrentIndex(prevIndex);
    setSelectedSession(sessions[prevIndex]);
  };

  if (isLoading) {
    return <div className="text-center py-10">Cargando resultados...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Resultados de Desafíos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session, index) => (
          <div 
            key={session.id} 
            className="bg-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-300"
            onClick={() => openModal(session, index)}
          >
            <h3 className="text-xl font-semibold text-purple-300">{session.participantName} {session.participantLastName}</h3>
            <p className="text-gray-400">{session.challengeType || 'Desafío General'}</p>
            <p className="text-sm text-gray-500">{new Date(session.startTime).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={selectedSession !== null}
        onClose={closeModal}
        title={`Resultados de: ${selectedSession?.participantName} ${selectedSession?.participantLastName || ''}`}
        className="min-w-full max-w-full m-10 sm:max-w-4xl sm:max-h-screen">
          {selectedSession && (
              <div className="relative w-full p-4 max-h-[80vh] overflow-y-auto">
                <ChallengeResultCard session={selectedSession} />
                <div className="flex justify-between mt-4 sticky bottom-0 bg-gray-800 py-2">
                    <button onClick={showPrev} className="bg-blue-500 text-white py-2 px-4 rounded">Anterior</button>
                    <button onClick={showNext} className="bg-blue-500 text-white py-2 px-4 rounded">Siguiente</button>
                </div>
              </div>
          )}
      </Modal>
    </div>
  );
};

export default ChallengeResultsPage;
