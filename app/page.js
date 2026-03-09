// app/page.js
// Página de inicio - Selector de roles y acceso rápido

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [packageId, setPackageId] = useState('');

  const handleTrackPackage = (e) => {
    e.preventDefault();
    if (packageId.trim()) {
      router.push(`/tracking?id=${packageId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
            📦 Mi Paquetería
          </h1>
          <p className="text-blue-100 text-center mt-2">
            Sistema de rastreo logístico en tiempo real
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Sección de rastreo rápido */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🔍 Rastrea tu Paquete
            </h2>
            <p className="text-gray-600">
              Ingresa el ID de tu paquete para ver su ubicación en tiempo real
            </p>
          </div>

          <form onSubmit={handleTrackPackage} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                placeholder="Ej: PKG-2024-00001"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
              >
                Rastrear
              </button>
            </div>
          </form>
        </div>

        {/* Selector de roles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Admin */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
              <div className="text-center">
                <div className="text-5xl mb-3">👨‍💼</div>
                <h3 className="text-2xl font-bold text-white">Administrador</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Gestiona paquetes, asigna mensajeros y monitorea entregas
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Crear y asignar paquetes
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Monitorear mensajeros
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dashboard en tiempo real
                </li>
              </ul>
              <button
                onClick={() => router.push('/admin')}
                className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Acceder
              </button>
            </div>
          </div>

          {/* Card Mensajero */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="text-center">
                <div className="text-5xl mb-3">🚴</div>
                <h3 className="text-2xl font-bold text-white">Mensajero</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Gestiona tus entregas y actualiza tu ubicación en tiempo real
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Ver entregas asignadas
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Rastreo GPS automático
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Actualizar estados
                </li>
              </ul>
              <button
                onClick={() => router.push('/messenger')}
                className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Acceder
              </button>
            </div>
          </div>

          {/* Card Cliente */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
              <div className="text-center">
                <div className="text-5xl mb-3">👤</div>
                <h3 className="text-2xl font-bold text-white">Cliente</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                Rastrea tus paquetes y observa su ubicación en tiempo real
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Rastreo en tiempo real
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mapa interactivo
                </li>
                <li className="flex items-center text-sm text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Estado de entrega
                </li>
              </ul>
              <button
                onClick={() => router.push('/tracking')}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Rastrear Paquete
              </button>
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold mb-2">Tiempo Real</h4>
              <p className="text-sm text-blue-100">
                Actualización automática sin recargar la página
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-bold mb-2">PWA Instalable</h4>
              <p className="text-sm text-blue-100">
                Funciona como app nativa en iOS y Android
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
              <div className="text-4xl mb-3">🗺️</div>
              <h4 className="font-bold mb-2">Mapas Interactivos</h4>
              <p className="text-sm text-blue-100">
                Visualiza la ubicación exacta del mensajero
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-lg border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-white">
          <p className="text-sm text-blue-100">
            © 2024 Mi Paquetería - Desarrollado por NelSystems
          </p>
        </div>
      </footer>
    </div>
  );
}
