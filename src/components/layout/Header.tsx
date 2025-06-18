import { useInventory } from '../../context/InventoryContext';
import { useDarkMode } from '../../hooks/useDarkMode';

export const Header = () => {
  const { notifications } = useInventory();
  const [darkMode, setDarkMode] = useDarkMode();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg px-4 py-2">
      <nav className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Inventory Manager</h1>
        
        <div className="flex items-center gap-4">
          <button 
            className="relative p-2"
            onClick={() => setShowNotifications(true)}
          >
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <BellIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2"
          >
            {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
          </button>
        </div>
      </nav>
    </header>
  );
};