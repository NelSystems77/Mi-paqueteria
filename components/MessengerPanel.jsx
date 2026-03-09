// components/MessengerPanel.jsx
// Panel del mensajero con rastreo automático de ubicación

'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getMessengerPackages, updatePackageStatus } from '@/lib/firebase';

const MessengerPanel = ({ mensajeroId, mensajeroNombre }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  // Hook de geolocalización con actualización cada 10 segundos
  const {
    location,
    error: geoError,
    loading: geoLoading,
    permissionStatus,
    forceUpdate
  } = useGeolocation(mensajeroId, trackingEnabled, 10000);

  // Cargar paquetes asignados al mensajero
  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true);
      const result = await getMessengerPackages(mensajeroId);
      
      if (result.success) {
        setPackages(result.data);
      }
      setLoading(false);
    };

    if (mensajeroId) {
      loadPackages();
      
      // Recargar cada 30 segundos
      const interval = setInterval(loadPackages, 30000);
      return () => clearInterval(interval);
    }
  }, [mensajeroId]);

  // Manejar cambio de estado del paquete
  const handleStatusChange = async (packageId, newStatus) => {
    const result = await updatePackageStatus(packageId, newStatus);
    
    if (result.success) {
      // Actualizar la lista local
      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === packageId ? { ...pkg, estado: newStatus } : pkg
        )
      );
    } else {
      alert('Error al actualizar el estado: ' + result.error);
    }
  };

  // Activar/desactivar rastreo
  const toggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Panel del Mensajero</h1>
          <p className="text-green-100 text-sm md:text-base">
            Bienvenido, {mensajeroNombre}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Panel de control de rastreo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Control de Rastreo GPS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Estado del rastreo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Estado del rastreo
                </p>
                <p className={`text-lg font-bold ${
                  trackingEnabled ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {trackingEnabled ? '✓ Activo' : '○ Inactivo'}
                </p>
              </div>
              <button
                onClick={toggleTracking}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  trackingEnabled
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {trackingEnabled ? 'Detener' : 'Iniciar'}
              </button>
            </div>

            {/* Ubicación actual */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Ubicación actual
              </p>
              {geoLoading ? (
                <p className="text-sm text-gray-500">Obteniendo ubicación...</p>
              ) : location ? (
                <div className="space-y-1">
                  <p className="text-xs text-gray-600">
                    Lat: {location.latitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-600">
                    Lng: {location.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Precisión: {location.accuracy?.toFixed(0)}m
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No disponible</p>
              )}
              
              {trackingEnabled && location && (
                <div className="mt-2 flex items-center text-xs text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Actualizando cada 10s
                </div>
              )}
            </div>
          </div>

          {/* Errores de geolocalización */}
          {geoError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex">
                <svg
                  className="w-5 h-5 text-red-500 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Error de Geolocalización
                  </p>
                  <p className="text-sm text-red-700">{geoError}</p>
                  {permissionStatus === 'denied' && (
                    <p className="text-xs text-red-600 mt-2">
                      Ve a la configuración de tu navegador y habilita los permisos
                      de ubicación para este sitio.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón de actualización manual */}
          {trackingEnabled && (
            <button
              onClick={forceUpdate}
              className="mt-4 w-full md:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              🔄 Actualizar ubicación ahora
            </button>
          )}
        </div>

        {/* Lista de paquetes asignados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Entregas Pendientes ({packages.length})
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando entregas...</p>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-gray-500 font-medium">
                No tienes entregas pendientes
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Las nuevas asignaciones aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Paquete #{pkg.id.slice(-6)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {pkg.destino?.direccion || 'Dirección no especificada'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pkg.estado === 'En camino'
                          ? 'bg-blue-100 text-blue-700'
                          : pkg.estado === 'Tu paquete será el próximo'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {pkg.estado}
                    </span>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {pkg.estado === 'En camino' && (
                      <button
                        onClick={() =>
                          handleStatusChange(pkg.id, 'Tu paquete será el próximo')
                        }
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Marcar como próximo
                      </button>
                    )}
                    
                    {pkg.estado === 'Tu paquete será el próximo' && (
                      <button
                        onClick={() => handleStatusChange(pkg.id, 'Entregado')}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ Marcar como entregado
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (pkg.destino?.coordenadas) {
                          const { latitude, longitude } = pkg.destino.coordenadas;
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
                            '_blank'
                          );
                        }
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      📍 Abrir en Maps
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessengerPanel;
