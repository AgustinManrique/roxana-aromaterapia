import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Starting auth callback process');
        console.log('Current URL:', window.location.href);
        
        // Handle the auth callback
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setMessage('Error al confirmar tu cuenta. Intenta nuevamente.');
          setLoading(false);
          return;
        }
        
        console.log('Session data:', session);
        
        if (session?.user) {
          const user = session.user;
          console.log('User confirmed:', user.id);
          
          // Check if profile exists, if not create it
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();
          
          console.log('Existing profile:', existingProfile);
          
          if (!existingProfile) {
            console.log('Creating new profile for user:', user.id);
            // Create profile for new user
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || ''
              }]);
            
            if (profileError) {
              console.error('Error creating profile:', profileError);
            } else {
              console.log('Profile created successfully');
            }
          }
          
          setMessage('¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.');
          // Redirect to home after 3 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          console.log('No session found, checking URL parameters');
          
          // Check if we have auth parameters in URL
          const urlParams = new URLSearchParams(window.location.search);
          const tokenHash = urlParams.get('token_hash');
          const type = urlParams.get('type');
          
          console.log('URL params:', { tokenHash: !!tokenHash, type });
          
          if (tokenHash && type === 'signup') {
            setMessage('Procesando confirmación de cuenta...');
            
            // Try to verify the token
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'signup'
            });
            
            if (error) {
              console.error('Token verification error:', error);
              setMessage('Error al confirmar tu cuenta. El enlace puede haber expirado.');
            } else if (data.user) {
              console.log('Token verified successfully:', data.user.id);
              setMessage('¡Cuenta confirmada exitosamente! Ya puedes iniciar sesión.');
              
              // Create profile if needed
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single();
              
              if (!existingProfile) {
                await supabase
                  .from('profiles')
                  .insert([{
                    id: data.user.id,
                    email: data.user.email || '',
                    full_name: data.user.user_metadata?.full_name || ''
                  }]);
              }
              
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
            }
          } else {
            setMessage('Enlace de confirmación inválido o expirado.');
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setMessage('Error inesperado. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <img 
            src="/logo.png" 
            alt="Roxana Aromaterapia Logo" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white">Roxana</span>
            <span className="text-2xl font-light text-orange-500 ml-1">Aromaterapia</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Confirmando tu cuenta...</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmación de Cuenta
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {message}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Ir a la Tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;