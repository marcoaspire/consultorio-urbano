import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface TopNavBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actionButtonText?: string;
  onActionClick?: () => void;
  onNewAnalysisClick?: () => void;
  isDetailView?: boolean;
  showBackButton?: boolean;
  backLabel?: string;
  onBackClick?: () => void;
  onBrandClick?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Buscar por ciudad, tipo o fecha...',
  actionButtonText = 'Nuevo Análisis',
  onActionClick,
  onNewAnalysisClick,
  isDetailView = false,
  showBackButton = false,
  backLabel = 'Volver a la Galería',
  onBackClick,
  onBrandClick,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
    } else {
      navigate('/');
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/');
    }
  };

  const handleNewClick = () => {
    if (onActionClick) {
      onActionClick();
    } else if (onNewAnalysisClick) {
      onNewAnalysisClick();
    } else {
      navigate('/nuevo');
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const displayBack = isDetailView || showBackButton;

  // Iniciales del usuario
  const userInitials = user
    ? `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase() || 'U'
    : '';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#051424]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo + Botón Volver opcional */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7bd0ff] to-[#ec6a06] p-[2px] flex items-center justify-center shadow-md shadow-[#7bd0ff]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#051424] rounded-[6px] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">
                  explore
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] tracking-tight leading-tight group-hover:text-[#7bd0ff] transition-colors">
                Navegación Analítica
              </span>
              <span className="font-['Inter'] text-[11px] text-[#909097] uppercase tracking-wider font-semibold">
                Consultorio Urbano
              </span>
            </div>
          </div>

          {/* Botón Volver */}
          {displayBack && (
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-1.5 text-xs font-['Inter'] font-medium text-[#bec6e0] hover:text-[#d4e4fa] hover:bg-white/5 py-1 px-2.5 rounded-lg border-l border-white/15 ml-2 sm:ml-4 pl-3 sm:pl-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              <span>{backLabel}</span>
            </button>
          )}
        </div>

        {/* Barra Central de Búsqueda */}
        {!isDetailView && onSearchChange && (
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#909097] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-[#1c2b3c]/80 hover:bg-[#1c2b3c] focus:bg-[#122131] border-b-2 border-[#273647] focus:border-[#7bd0ff] text-[#d4e4fa] placeholder-[#909097] font-['Inter'] text-sm py-2 pl-11 pr-9 rounded-t-md transition-all outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#909097] hover:text-[#d4e4fa] transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Controles de Acción y Usuario */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Botón de Acción Principal (+ Nuevo Análisis o Proyecto) */}
          {!isDetailView && (
            <button
              type="button"
              onClick={handleNewClick}
              className="flex items-center gap-2 bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-2 px-3.5 sm:px-4 rounded-md shadow-md shadow-[#ec6a06]/20 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="inline">{actionButtonText}</span>
            </button>
          )}

          {/* Menú de Usuario / Acceso */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated && user ? (
              /* Usuario Autenticado: Avatar con iniciales */
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-[#1c2b3c] hover:bg-[#273647] border border-[#7bd0ff]/40 flex items-center justify-center text-[#7bd0ff] font-['Montserrat'] font-bold text-xs shadow-sm transition-all cursor-pointer relative"
                title={`${user.firstname} ${user.lastname}`}
              >
                <span>{userInitials}</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#051424]" />
              </button>
            ) : (
              /* Usuario No Autenticado: Botón Acceso */
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 bg-[#122131] hover:bg-[#1c2b3c] border border-white/10 hover:border-[#7bd0ff]/50 text-[#bec6e0] hover:text-white font-['Inter'] font-medium text-xs py-2 px-3 sm:px-3.5 rounded-lg shadow-sm transition-all cursor-pointer"
                title="Iniciar Sesión o Registrarse"
              >
                <span className="material-symbols-outlined text-[18px] text-[#7bd0ff]">
                  account_circle
                </span>
                <span className="hidden sm:inline">Acceso</span>
              </button>
            )}

            {/* Dropdown flotante del usuario autenticado */}
            {userMenuOpen && isAuthenticated && user && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0d1c2d] border border-white/15 rounded-xl shadow-2xl p-4 space-y-3 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full bg-[#1c2b3c] border border-[#7bd0ff]/30 flex items-center justify-center text-[#7bd0ff] font-['Montserrat'] font-bold text-sm">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Montserrat'] font-bold text-xs text-[#d4e4fa] truncate">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="font-['Inter'] text-[11px] text-[#909097] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-['Inter'] text-red-300 hover:text-red-200 hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      logout
                    </span>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
