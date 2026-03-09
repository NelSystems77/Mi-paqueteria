// app/tracking/page.js
// Página de rastreo de paquetes para clientes

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import TrackingMap from '@/components/TrackingMap';

function TrackingContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('id');

  if (!packageId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Rastreo de Paquetes
            </h2>
            <p className="text-gray-600 mb-6">
              Por favor, ingresa el ID de tu paquete en la URL
            </p>
            <p className="text-sm text-gray-500 bg-gray-100 p-3 rounded-lg font-mono">
              /tracking?id=TU_ID_DE_PAQUETE
            </p>
            <a
              href="/"
              className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Inicio
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <TrackingMap packageId={packageId} />;
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Cargando rastreo...</p>
          </div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
