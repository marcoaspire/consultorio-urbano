import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

interface AuthScreenProps {
  initialTab?: 'login' | 'register';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialTab = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();

  // Tab activo: 'login' o 'register'
  const urlTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    urlTab === 'register' || initialTab === 'register' ? 'register' : 'login'
  );

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Estados para Registro
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Estados de carga y mensajes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Ruta de redirección después del login
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';

  const handleSwitchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      setSuccessMessage('¡Bienvenido! Redirigiendo a la plataforma...');
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 700);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
            : err.message
          : 'Error al iniciar sesión.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regFirstName.trim() || !regLastName.trim()) {
      setErrorMessage('Por favor ingresa tu nombre y apellido.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe contener al menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstname: regFirstName.trim(),
        lastname: regLastName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      setSuccessMessage(
        '¡Cuenta creada exitosamente! Iniciando sesión en la plataforma...'
      );
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message.includes('already registered')
            ? 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
            : err.message
          : 'Error al crear la cuenta.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#051424] text-[#d4e4fa] font-['Inter'] min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Fondo Cartográfico Satelital Ambient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="w-full h-full bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBgRiNyiXbY2TitZXm80wuuxH05cNnznktvAZU3UrOEKL3M_8YisTHgWZpwIBhyBL7ZQzKk4pbdNYggtMAQbajprH0W7_RGQ2YcMvFGiL_Za8l5hPAFRZo5nf40tQhxeo0OLdQK0cKlxqnayZEbGX4p0ceITU4oKXTlqTGqoc6UO_fGtds33WplbBWIMM6EnvGtRQ2O4QpNYd81kDVKE2_kBqXQE-I_DFFjoIPwLgSazHJpUDkVwoc')",
          }}
        />
        {/* Gradientes envolventes de legibilidad según DESIGN.md */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-[#051424]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#051424] via-transparent to-[#051424]" />
      </div>

      {/* Botón flotante para regresar al inicio */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="absolute top-5 left-5 z-20 flex items-center gap-1.5 text-xs text-[#c6c6cd] hover:text-[#d4e4fa] bg-[#051424]/70 hover:bg-[#122131] border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md transition-all cursor-pointer"
        title="Volver a la Galería"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>Volver al inicio</span>
      </button>

      {/* Contenedor Principal de la Tarjeta */}
      <main className="relative z-10 w-full max-w-[440px] my-auto">
        {/* Brand Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#7bd0ff] to-[#ec6a06] p-[2px] mb-3 shadow-lg shadow-[#7bd0ff]/20">
            <div className="w-full h-full bg-[#051424] rounded-[10px] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#7bd0ff] text-[28px]">
                analytics
              </span>
            </div>
          </div>
          <h1 className="font-['Montserrat'] font-bold text-2xl md:text-3xl text-[#d4e4fa] tracking-tight">
            Navegación Analítica
          </h1>
          <p className="font-['Inter'] text-xs text-[#c6c6cd] mt-1.5 tracking-wide">
            Plataforma de Análisis Geoespacial Avanzado
          </p>
        </div>

        {/* Tarjeta Glassmorphism */}
        <div className="glass-panel rounded-xl shadow-2xl overflow-hidden border border-white/15 backdrop-blur-xl bg-[#122131]/85">
          {/* Selector de Pestañas (Acceso | Crear Cuenta) */}
          <div className="flex border-b border-white/10">
            <button
              type="button"
              onClick={() => handleSwitchTab('login')}
              className={`flex-1 py-3.5 text-xs font-['Inter'] font-semibold text-center transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'text-[#bec6e0] border-b-2 border-[#7bd0ff] bg-[#273647]/30'
                  : 'text-[#c6c6cd] hover:text-[#d4e4fa] hover:bg-[#273647]/10 border-b-2 border-transparent'
              }`}
            >
              Acceso
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('register')}
              className={`flex-1 py-3.5 text-xs font-['Inter'] font-semibold text-center transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'text-[#bec6e0] border-b-2 border-[#7bd0ff] bg-[#273647]/30'
                  : 'text-[#c6c6cd] hover:text-[#d4e4fa] hover:bg-[#273647]/10 border-b-2 border-transparent'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          <div className="p-7">
            {/* Mensajes de Alerta de Error */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-red-400 text-[18px] shrink-0 mt-0.5">
                  error
                </span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Mensajes de Éxito */}
            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px] shrink-0 mt-0.5">
                  check_circle
                </span>
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Formulario de Login (Acceso) */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                {/* Correo Electrónico */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="login-email"
                    className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-4 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="login-password"
                      className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                    >
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Para restablecer tu contraseña, contacta al administrador del sistema o revisa tu bandeja de correo.'
                        )
                      }
                      className="text-[11px] text-[#7bd0ff] hover:underline cursor-pointer"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-10 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] hover:text-[#d4e4fa] cursor-pointer"
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showLoginPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Botón Iniciar Sesión */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 w-full bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-3 rounded-lg shadow-md shadow-[#ec6a06]/25 transition-all duration-200 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Validando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                {/* Pie de Cambio a Registro */}
                <p className="text-center text-xs text-[#c6c6cd] mt-3 font-['Inter']">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('register')}
                    className="text-[#7bd0ff] font-semibold hover:underline cursor-pointer"
                  >
                    Crear Cuenta
                  </button>
                </p>
              </form>
            ) : (
              /* Formulario de Registro (Crear Cuenta) */
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                {/* Nombre y Apellido */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reg-firstname"
                      className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                    >
                      Nombre <span className="text-[#ec6a06]">*</span>
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                        person
                      </span>
                      <input
                        id="reg-firstname"
                        type="text"
                        required
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Nombre"
                        className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-3 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="reg-lastname"
                      className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                    >
                      Apellido <span className="text-[#ec6a06]">*</span>
                    </label>
                    <input
                      id="reg-lastname"
                      type="text"
                      required
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Apellido"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] px-4 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reg-email"
                    className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                  >
                    Correo Electrónico <span className="text-[#ec6a06]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                      mail
                    </span>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="usuario@empresa.com"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-4 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reg-password"
                    className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                  >
                    Contraseña <span className="text-[#ec6a06]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="reg-password"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-10 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] hover:text-[#d4e4fa] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reg-confirm-password"
                    className="text-[11px] font-semibold text-[#c6c6cd] uppercase tracking-wider font-['Inter']"
                  >
                    Confirmar Contraseña <span className="text-[#ec6a06]">*</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] text-[18px] pointer-events-none">
                      lock
                    </span>
                    <input
                      id="reg-confirm-password"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="w-full bg-[#1c2b3c] border-b-2 border-[#273647] focus:border-[#7bd0ff] rounded-t text-[#d4e4fa] text-xs font-['Inter'] pl-10 pr-10 py-3 focus:outline-none focus:bg-[#273647] transition-colors placeholder-[#909097]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c6c6cd] hover:text-[#d4e4fa] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showRegConfirmPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Botón Registrarse */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 w-full bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-3 rounded-lg shadow-md shadow-[#ec6a06]/25 transition-all duration-200 active:scale-[0.98] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <>
                      <span>Registrarse</span>
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                {/* Pie de Cambio a Login */}
                <p className="text-center text-xs text-[#c6c6cd] mt-3 font-['Inter']">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('login')}
                    className="text-[#7bd0ff] font-semibold hover:underline cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
