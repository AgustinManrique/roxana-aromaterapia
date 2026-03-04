import React, { useState, useEffect } from 'react';
import { User, LogIn, UserPlus, LogOut, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  
  // Settings form state
  const [settingsFullName, setSettingsFullName] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { user, userProfile, isAdmin, signIn, signUp, signOut, refreshProfile } = useAuth();

  // Listen for openAuthModal events from other components (e.g., CheckoutForm)
  useEffect(() => {
    const handleOpenAuthModal = (e: CustomEvent) => {
      const mode = e.detail?.mode || 'login';
      setAuthMode(mode);
      setShowAuthModal(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => {
      window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    };
  }, []);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    // Email validation
    if (!email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!validateEmail(email)) {
      errors.email = 'Ingresa un email válido';
    }

    // Password validation
    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (!validatePassword(password)) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Additional validations for registration
    if (authMode === 'register') {
      if (!fullName.trim()) {
        errors.fullName = 'El nombre completo es requerido';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'El nombre debe tener al menos 2 caracteres';
      }

      if (!confirmPassword.trim()) {
        errors.confirmPassword = 'Confirma tu contraseña';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (authMode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        // Register new user - NEVER auto sign in
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: fullName.trim()
            }
          }
        });

        if (error) {
          console.error('Registration error:', error);
          throw error;
        }

        // Supabase returns a user with empty identities when email already exists
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError('Ya existe una cuenta con este email. Intenta iniciar sesión o recuperar tu contraseña.');
          return;
        }

        // Show confirmation message for successful registration
        if (data.user) {
          setError('');
          setRegistrationSuccess(true);
          // Auto-hide success message after 8 seconds
          setTimeout(() => {
            setRegistrationSuccess(false);
            setShowAuthModal(false);
            resetForm();
          }, 8000);
          return;
        }
      }

      if (authMode === 'login') {
        setShowAuthModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Authentication error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        error: error
      });
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Email o contraseña incorrectos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.');
      } else if (error.message.includes('User already registered') || error.message.includes('already been registered')) {
        setError('Ya existe una cuenta con este email. ¿Quieres iniciar sesión en su lugar?');
      } else if (error.message.includes('email address is already registered')) {
        setError('Este email ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.');
      } else if (error.message.includes('duplicate key value violates unique constraint')) {
        setError('Ya existe una cuenta con este email.');
      } else if (error.message.includes('User already registered')) {
        setError('Ya existe una cuenta con este email');
      } else if (error.message.includes('Signup is disabled')) {
        setError('El registro de nuevos usuarios está deshabilitado');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Debes confirmar tu email antes de continuar');
      } else if (error.message.includes('Password should be at least 6 characters')) {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else if (error.message.includes('Unable to validate email address')) {
        setError('Email inválido');
      } else if (error.message.includes('Email rate limit exceeded')) {
        setError('Demasiados intentos. Espera unos minutos antes de intentar nuevamente');
      } else if (error.message.includes('Invalid email')) {
        setError('El formato del email no es válido');
      } else if (error.message.includes('Weak password')) {
        setError('La contraseña es muy débil. Usa al menos 6 caracteres con letras y números');
      } else {
        setError(authMode === 'login' 
          ? `Error al iniciar sesión: ${error.message}` 
          : `Error al crear cuenta: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setError('');
    setValidationErrors({});
    setRegistrationSuccess(false);
  };

  const resetAuthModal = () => {
    setShowAuthModal(false);
    resetForm();
    setAuthMode('login');
  };

  const switchAuthMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
    resetForm();
  };

  const openSettingsModal = () => {
    setSettingsFullName(userProfile?.full_name || '');
    setSettingsPhone(userProfile?.phone || '');
    setSettingsError('');
    setShowSettingsModal(true);
    setIsOpen(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');

    try {
      if (!settingsFullName.trim()) {
        setSettingsError('El nombre completo es requerido');
        return;
      }

      if (settingsFullName.trim().length < 2) {
        setSettingsError('El nombre debe tener al menos 2 caracteres');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: settingsFullName.trim(),
          phone: settingsPhone.trim() || null
        })
        .eq('id', user?.id);

      if (error) throw error;

      setShowSettingsModal(false);
      setSettingsFullName('');
      setSettingsPhone('');
      
      // Refresh the auth context to get updated profile
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSettingsError('Error al actualizar el perfil');
    } finally {
      setSettingsLoading(false);
    }
  };

  const resetSettingsModal = () => {
    setShowSettingsModal(false);
    setSettingsFullName('');
    setSettingsPhone('');
    setSettingsError('');
  };

  const handleForgotPassword = () => {
    setShowAuthModal(false);
    setShowForgotPassword(true);
    setForgotEmail(email); // Pre-fill with current email if any
    setForgotMessage('');
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');

    try {
      if (!forgotEmail.trim()) {
        setForgotMessage('Por favor ingresa tu email');
        return;
      }

      if (!validateEmail(forgotEmail)) {
        setForgotMessage('Por favor ingresa un email válido');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;

      setForgotMessage('✅ Te hemos enviado un email con las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada.');
    } catch (error) {
      console.error('Reset password error:', error);
      setForgotMessage(`Error: ${error.message}`);
    } finally {
      setForgotLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotMessage('');
  };

  return (
    <>
      {/* User Menu Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors relative"
          aria-label="Menú de usuario"
        >
          <User className="w-5 h-5" />
          {user && (
            <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full"></span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
              {user ? (
                // Logged in menu
                <div className="p-4">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {userProfile?.full_name || user.email}
                    </p>
                    {userProfile?.full_name && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    )}
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs rounded-full">
                        ✅ Administrador
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('showOrderHistory'));
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Mis Pedidos</span>
                    </button>
                    <button 
                      onClick={openSettingsModal}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              ) : (
                // Not logged in menu
                <div className="p-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión</span>
                    </button>
                    <button
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Crear Cuenta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h3>
                <button
                  onClick={resetAuthModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {registrationSuccess && (
                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                        ¡Registro exitoso! 🎉
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Te hemos enviado un email de confirmación a <strong>{email}</strong>. 
                        Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        💡 No olvides revisar la carpeta de spam si no lo encuentras
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <form onSubmit={handleAuth} className="space-y-4">
                {/* Full Name - Only for registration */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        validationErrors.fullName ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {validationErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.fullName}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      validationErrors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="roxanaaromaterapia@gmail.com"
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      validationErrors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password - Only for registration */}
                {authMode === 'register' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        validationErrors.confirmPassword ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Repite tu contraseña"
                    />
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || registrationSuccess}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Procesando...' : 
                   registrationSuccess ? '✅ Registro Exitoso' :
                   authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>

              </form>

              <div className="mt-4 text-center">
                {authMode === 'login' && !registrationSuccess && (
                  <button
                    onClick={handleForgotPassword}
                    className="text-sm text-orange-500 hover:text-orange-600 mb-2 block"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
                {!registrationSuccess && (
                  <button
                    onClick={switchAuthMode}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    {authMode === 'login' 
                      ? '¿No tienes cuenta? Crear una' 
                      : '¿Ya tienes cuenta? Iniciar sesión'
                    }
                  </button>
                )}
                {registrationSuccess && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Esta ventana se cerrará automáticamente en unos segundos...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configuración del Perfil
                </h3>
                <button
                  onClick={resetSettingsModal}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {settingsError && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-lg text-sm">
                  {settingsError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    El email no se puede modificar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsFullName}
                    onChange={(e) => setSettingsFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={settingsPhone}
                    onChange={(e) => setSettingsPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="+54 9 221 436 3284"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {settingsLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={resetSettingsModal}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recuperar Contraseña
                </h3>
                <button
                  onClick={resetForgotPassword}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                Ingresa tu email y te enviaremos las instrucciones para restablecer tu contraseña.
              </p>

              {forgotMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  forgotMessage.startsWith('✅') 
                    ? 'bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                }`}>
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Enviando...' : 'Enviar Email'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForgotPassword}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    resetForgotPassword();
                    setShowAuthModal(true);
                    setAuthMode('login');
                  }}
                  className="text-sm text-orange-500 hover:text-orange-600"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserMenu;