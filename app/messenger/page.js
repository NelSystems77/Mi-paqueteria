// app/messenger/page.js
// Página del panel del mensajero

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, onAuthChange, getUserRole } from '@/lib/firebase';
import MessengerPanel from '@/components/MessengerPanel';

export default function MessengerPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
        setUserId(user.uid);
        setUserName(user.displayName || user.email);
        
        if (role === 'mensajero') {
          setIsAuthenticated(true);
        } else {
          setError('No tienes permisos de mensajero');
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await loginUser(email, password);

    if (result.success) {
      if (result.role === 'mensajero') {
        setIsAuthenticated(true);
        setUserId(result.user.uid);
        setUserName(result.user.displayName || result.user.email);
      } else {
        setError('No tienes permisos de mensajero');
      }
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  // Panel del mensajero
  if (isAuthenticated && userId) {
    return <MessengerPanel mensajeroId={userId} mensajeroNombre={userName} />;
  }

  // Formulario de login
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🚴</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel del Mensajero
          </h1>
          <p className="text-gray-600">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mensajero@mipaqueteria.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Credenciales de prueba:</strong><br />
            mensajero1@mipaqueteria.com / Mensajero123!
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
