import React from 'react';

interface ChallengeResultCardProps {
  session: {
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
  };
}

const ChallengeResultCard: React.FC<ChallengeResultCardProps> = ({ session }) => {
  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (start: string, end: string | null | undefined) => {
    if (!end) return 'N/A';
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const copyToClipboard = () => {
    const summary = `
--- Resumen del Desafío ---
Participante: ${session.participantName} ${session.participantLastName || ''}
Rol: ${session.participantRole || 'N/A'}
Email: ${session.mail || 'N/A'}
Teléfono: ${session.telephone || 'N/A'}
---
Tipo de Desafío: ${session.challengeType || 'N/A'}
Modo: ${session.mode || 'N/A'}
Inicio: ${formatDateTime(session.startTime)}
Fin: ${session.endTime ? formatDateTime(session.endTime) : 'N/A'}
Duración: ${calculateDuration(session.startTime, session.endTime)}
---
Comentarios:
${session.comments || 'Sin comentarios.'}
    `;
    navigator.clipboard.writeText(summary.trim());
    alert('¡Resultados copiados al portapapeles!');
  };

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto font-mono border-2 border-purple-500">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-purple-300">Resultados de: {session.participantName} {session.participantLastName}</h2>
        <button onClick={copyToClipboard} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
          Copiar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 p-3 rounded">
          <p className="font-semibold text-purple-400">Rol:</p>
          <p>{session.participantRole || 'No especificado'}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="font-semibold text-purple-400">Contacto:</p>
          <p>Email: {session.mail || 'No especificado'}</p>
          <p>Teléfono: {session.telephone || 'No especificado'}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="font-semibold text-purple-400">Tipo de Desafío:</p>
          <p>{session.challengeType || 'No especificado'}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="font-semibold text-purple-400">Modo de Juego:</p>
          <p>{session.mode || 'No especificado'}</p>
        </div>
      </div>

      <div className="bg-gray-700 p-3 rounded mb-4">
        <p className="font-semibold text-purple-400">Duración:</p>
        <div className="flex justify-between">
          <span><span className="font-bold">Inicio:</span> {formatDateTime(session.startTime)}</span>
          <span><span className="font-bold">Fin:</span> {session.endTime ? formatDateTime(session.endTime) : 'En curso'}</span>
        </div>
        <p className="text-center mt-2"><span className="font-bold">Tiempo Total:</span> {calculateDuration(session.startTime, session.endTime)}</p>
      </div>

      <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
        <h3 className="text-lg font-semibold text-purple-400 mb-2">Comentarios y Observaciones</h3>
        <p className="text-gray-300 whitespace-pre-wrap">{session.comments || 'No se dejaron comentarios.'}</p>
      </div>
    </div>
  );
};

export default ChallengeResultCard;
