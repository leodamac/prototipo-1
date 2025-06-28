import { Bell, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';
import { Notification } from '../types';

interface NotificationPanelProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notifications: Notification[];
  marcarNotificacionesLeidas: () => void;
  notificationsRef: React.RefObject<HTMLDivElement | null>;
}

export function NotificationPanel({
  showNotifications,
  setShowNotifications,
  notifications,
  marcarNotificacionesLeidas,
  notificationsRef,
}: NotificationPanelProps) {
  if (!showNotifications) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={() => setShowNotifications(false)}>
      <div ref={notificationsRef} className="w-80 max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
          <button
            onClick={() => setShowNotifications(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Cerrar notificaciones"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <button
            onClick={marcarNotificacionesLeidas}
            className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm text-left"
          >
            Marcar todas como leídas
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="p-4 text-center text-gray-500 dark:text-gray-400">
            No hay notificaciones
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map(n => (
              <li
                key={n.id}
                className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  n.read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex gap-3 items-start">
                  {n.type === 'danger' && <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" />}
                  {n.type === 'warning' && <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />}
                  {n.type === 'info' && <Bell className="text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                  <div>
                    <p className="text-gray-900 dark:text-gray-100 text-sm">{n.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(n.date, 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
