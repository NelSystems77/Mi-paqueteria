// app/admin/page.js
// Página del panel de administración

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, onAuthChange, getUserRole } from '@/lib/firebase';

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
        if (role === 'admin') {
          setIsAuthenticated(true);
        } else {
          setError('No tienes permisos de administrador');
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
      if (result.role === 'admin') {
        setIsAuthenticated(true);
      } else {
        setError('No tienes permisos de administrador');
      }
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  // Panel de administrador (simplificado por ahora)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold">Panel de Administrador</h1>
            <p className="text-purple-100 text-sm md:text-base">
              Sistema de gestión de paquetes y mensajeros
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Bienvenido, Administrador
            </h2>
            <p className="text-gray-600 mb-4">
              El panel completo de administración está en desarrollo. Por ahora puedes:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Gestionar paquetes desde Firebase Console
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Asignar mensajeros manualmente
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Monitorear entregas en tiempo real
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-800">
                <strong>Próximos pasos:</strong> Implementa los componentes de gestión de paquetes,
                asignación de mensajeros y dashboard de monitoreo usando las funciones de 
                <code className="mx-1 px-2 py-1 bg-blue-100 rounded">lib/firebase.js</code>
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de login
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👨‍💼</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Panel de Administrador
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
              placeholder="admin@nelsystems.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Credenciales de prueba:</strong><br />
            admin@nelsystems.com / 123456789AiXmDy
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
