// components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/', icon: '🏠', label: 'Inicio' },
    { path: '/feed', icon: '📰', label: 'Feed' },
    { path: '/explore', icon: '🔍', label: 'Explorar' },
    { path: '/notifications', icon: '🔔', label: 'Notificaciones', badge: 3 },
    { path: '/messages', icon: '💬', label: 'Mensajes', badge: 12 },
    { path: '/profile', icon: '👤', label: 'Perfil' },
    { path: '/settings', icon: '⚙️', label: 'Configuración' },
  ];

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-[10vh]' : 'w-[40vh]'
      } fixed top-0 left-0 h-[85vh] flex flex-col bg-gray-50 border-r border-gray-200 sticky transition-all duration-300 md:min-h-[85vh]`}
    >
      {/* Botón toggle */}
      <button

        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full h-6 bg-blue-600 text-white flex items-center ${isCollapsed ? 'justify-center ' : 'justify-left gap-3 px-6'} text-xs hover:text-xm`}
      >
        {isCollapsed ? "☰" : "✕"}
      </button>

      {/* Navegación */}
      <nav className="py-5">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200
                  ${isActive ? 'bg-purple-100 text-purple-600 border-r-4 border-purple-600' : ''}
                  ${isCollapsed ? 'justify-center px-2' : ''}
                `}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
