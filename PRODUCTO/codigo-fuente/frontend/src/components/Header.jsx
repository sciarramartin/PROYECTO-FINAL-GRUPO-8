// components/Header.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = true;

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-md sticky top-0 z-50 h-[15vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo y nombre */}
        <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-sm font-bold text-blue-600 shadow-md">
            logo
          </div>
          <span className="text-xl font-bold text-white">MiRedSocial</span>
        </Link>

        {/* Menú usuario */}
        {isLoggedIn && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
            >
              <span className="text-lg">👤</span>
              <span className="text-xs">▼</span>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-10 animate-fadeIn">
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>👤</span> Mi Perfil
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>⚙️</span> Configuración
                  </Link>
                  <Link
                    to="/privacy"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <span>🔒</span> Privacidad
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span>🚪</span> Cerrar Sesión
                  </button>
                </div>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setIsDropdownOpen(false)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;