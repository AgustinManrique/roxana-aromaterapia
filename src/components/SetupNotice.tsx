import React from 'react';
import { AlertTriangle, Database, Settings } from 'lucide-react';

const SetupNotice = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const needsSetup = false; // Configuration completed

  if (!needsSetup) return null;

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Configuración de Base de Datos Requerida
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              Para que la tienda funcione completamente, necesitás configurar Supabase:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>Crear proyecto en <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">supabase.com</a></li>
              <li>Hacer clic en el botón "Supabase" en la configuración</li>
              <li>Configurar las variables de entorno</li>
            </ol>
            <div className="flex items-center space-x-2 text-xs">
              <Database className="w-4 h-4" />
              <span>Mientras tanto, podés explorar el diseño y funcionalidades básicas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupNotice;