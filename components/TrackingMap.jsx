// components/TrackingMap.jsx
// Componente de rastreo en tiempo real para clientes
// Muestra el mapa con la ubicación del mensajero y el destino del paquete

'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { subscribeToPackage } from '@/lib/firebase';

// Importar Leaflet dinámicamente para evitar errores de SSR
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

/**
 * Componente de Stepper para mostrar el progreso del paquete
 */
const ProgressStepper = ({ currentStatus }) => {
  const steps = [
    { id: 1, label: 'En espera', status: 'En espera' },
    { id: 2, label: 'En camino', status: 'En camino' },
    { id: 3, label: 'Próximo', status: 'Tu paquete será el próximo' },
    { id: 4, label: 'Entregado', status: 'Entregado' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full px-4 py-6 bg-white rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Estado de tu paquete
      </h3>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Círculo del paso */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  font-semibold text-sm transition-all duration-300
                  ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }
                  ${index === currentStepIndex ? 'ring-4 ring-blue-200' : ''}
                `}
              >
                {index < currentStepIndex ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <p
                className={`
                  mt-2 text-xs md:text-sm font-medium text-center
                  ${
                    index <= currentStepIndex
                      ? 'text-blue-600'
                      : 'text-gray-500'
                  }
                `}
              >
                {step.label}
              </p>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-1 flex-1 mx-2 transition-all duration-300
                  ${
                    index < currentStepIndex
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente principal de rastreo
 */
const TrackingMap = ({ packageId }) => {
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messengerIcon, setMessengerIcon] = useState(null);
  const [destinationIcon, setDestinationIcon] = useState(null);
  const mapRef = useRef(null);

  // Crear iconos personalizados cuando el componente se monte (solo en cliente)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const L = require('leaflet');

      // Icono del mensajero (azul)
      const messengerIconInstance = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Icono del destino (rojo)
      const destinationIconInstance = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      setMessengerIcon(messengerIconInstance);
      setDestinationIcon(destinationIconInstance);
    }
  }, []);

  // Suscribirse a los cambios del paquete en tiempo real
  useEffect(() => {
    if (!packageId) {
      setError('ID de paquete no proporcionado');
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPackage(packageId, (data) => {
      if (data) {
        setPackageData(data);
        setError(null);
      } else {
        setError('Paquete no encontrado');
      }
      setLoading(false);
    });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [packageId]);

  // Centrar el mapa en el mensajero cuando cambia su ubicación
  useEffect(() => {
    if (
      packageData?.ubicacionMensajero &&
      mapRef.current &&
      typeof window !== 'undefined'
    ) {
      const map = mapRef.current;
      const { latitude, longitude } = packageData.ubicacionMensajero;
      
      // Centrar el mapa suavemente en la nueva ubicación
      map.flyTo([latitude, longitude], 15, {
        duration: 1.5
      });
    }
  }, [packageData?.ubicacionMensajero]);

  // Obtener coordenadas del mensajero
  const getMessengerPosition = () => {
    if (packageData?.ubicacionMensajero) {
      return [
        packageData.ubicacionMensajero.latitude,
        packageData.ubicacionMensajero.longitude
      ];
    }
    return null;
  };

  // Obtener coordenadas del destino
  const getDestinationPosition = () => {
    if (packageData?.destino?.coordenadas) {
      return [
        packageData.destino.coordenadas.latitude,
        packageData.destino.coordenadas.longitude
      ];
    }
    return null;
  };

  // Calcular el centro del mapa
  const getMapCenter = () => {
    const messengerPos = getMessengerPosition();
    const destinationPos = getDestinationPosition();

    if (messengerPos) {
      return messengerPos;
    } else if (destinationPos) {
      return destinationPos;
    }
    // Default: Costa Rica (San José)
    return [9.9281, -84.0907];
  };

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando información del paquete...</p>
        </div>
      </div>
    );
  }

  // Renderizar error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-md">
          <div className="flex items-center mb-2">
            <svg
              className="w-6 h-6 text-red-500 mr-2"
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
            <h3 className="text-red-800 font-semibold">Error</h3>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const messengerPosition = getMessengerPosition();
  const destinationPosition = getDestinationPosition();
  const mapCenter = getMapCenter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Mi Paquetería</h1>
          <p className="text-blue-100 text-sm md:text-base">
            Rastreo en tiempo real - ID: {packageId}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stepper de progreso */}
        <ProgressStepper currentStatus={packageData.estado} />

        {/* Información del paquete */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 mb-1">
                Estado actual
              </h4>
              <p className="text-lg font-bold text-blue-600">
                {packageData.estado}
              </p>
            </div>
            
            {packageData.mensajeroNombre && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-1">
                  Mensajero asignado
                </h4>
                <p className="text-lg font-medium text-gray-800">
                  {packageData.mensajeroNombre}
                </p>
              </div>
            )}

            {packageData.destino?.direccion && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-500 mb-1">
                  Destino
                </h4>
                <p className="text-base text-gray-800">
                  {packageData.destino.direccion}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-[500px] md:h-[600px] relative">
            <MapContainer
              center={mapCenter}
              zoom={13}
              className="h-full w-full"
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Marcador del mensajero */}
              {messengerPosition && messengerIcon && (
                <Marker position={messengerPosition} icon={messengerIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-blue-600">
                        📦 {packageData.mensajeroNombre || 'Mensajero'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Ubicación actual
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Marcador del destino */}
              {destinationPosition && destinationIcon && (
                <Marker position={destinationPosition} icon={destinationIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold text-red-600">🎯 Destino</p>
                      <p className="text-sm text-gray-600">
                        {packageData.destino?.direccion || 'Dirección de entrega'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Línea de ruta entre mensajero y destino */}
              {messengerPosition && destinationPosition && (
                <Polyline
                  positions={[messengerPosition, destinationPosition]}
                  color="#3B82F6"
                  weight={3}
                  opacity={0.7}
                  dashArray="10, 10"
                />
              )}
            </MapContainer>

            {/* Indicador de actualización en tiempo real */}
            {messengerPosition && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-2 z-[1000]">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">En vivo</span>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        {!messengerPosition && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-yellow-800">
                El rastreo en vivo estará disponible una vez que el mensajero 
                comience el recorrido.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingMap;
