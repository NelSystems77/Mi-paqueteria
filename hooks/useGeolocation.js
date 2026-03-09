// hooks/useGeolocation.js
// Hook personalizado para rastrear la ubicación del mensajero en tiempo real
// Actualiza Firebase automáticamente cuando el mensajero se mueve

import { useState, useEffect, useCallback } from 'react';
import { updateMessengerLocation } from '@/lib/firebase';

/**
 * Hook para rastrear la geolocalización del mensajero
 * @param {string} mensajeroId - ID del mensajero
 * @param {boolean} enabled - Si el rastreo está activo
 * @param {number} updateInterval - Intervalo de actualización en milisegundos (default: 10000 = 10s)
 * @returns {Object} Estado de la geolocalización
 */
export const useGeolocation = (mensajeroId, enabled = false, updateInterval = 10000) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('prompt');

  // Verificar soporte de geolocalización
  const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  /**
   * Actualizar la ubicación en Firebase
   */
  const updateLocation = useCallback(
    async (latitude, longitude) => {
      if (!mensajeroId) {
        console.warn('No se proporcionó ID de mensajero');
        return;
      }

      try {
        const result = await updateMessengerLocation(mensajeroId, latitude, longitude);
        
        if (!result.success) {
          console.error('Error actualizando ubicación en Firebase:', result.error);
        }
      } catch (err) {
        console.error('Error en updateLocation:', err);
      }
    },
    [mensajeroId]
  );

  /**
   * Manejar éxito al obtener posición
   */
  const handleSuccess = useCallback(
    (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      };

      setLocation(newLocation);
      setError(null);
      setLoading(false);

      // Actualizar en Firebase si está habilitado
      if (enabled) {
        updateLocation(newLocation.latitude, newLocation.longitude);
      }
    },
    [enabled, updateLocation]
  );

  /**
   * Manejar error al obtener posición
   */
  const handleError = useCallback((err) => {
    let errorMessage = 'Error desconocido al obtener ubicación';

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = 'Permiso de ubicación denegado. Por favor, habilita los permisos de ubicación en tu navegador.';
        setPermissionStatus('denied');
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = 'Información de ubicación no disponible.';
        break;
      case err.TIMEOUT:
        errorMessage = 'Tiempo de espera agotado al obtener ubicación.';
        break;
      default:
        errorMessage = err.message;
    }

    setError(errorMessage);
    setLoading(false);
    console.error('Error de geolocalización:', err);
  }, []);

  /**
   * Solicitar permiso de geolocalización
   */
  const requestPermission = useCallback(async () => {
    if (!isGeolocationSupported) {
      setError('La geolocalización no es compatible con este navegador');
      setLoading(false);
      return;
    }

    // Verificar permisos si está disponible
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(result.state);

        // Escuchar cambios en el permiso
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });
      } catch (err) {
        console.warn('No se pudo verificar el estado del permiso:', err);
      }
    }
  }, [isGeolocationSupported]);

  /**
   * Obtener la posición actual una vez
   */
  const getCurrentPosition = useCallback(() => {
    if (!isGeolocationSupported) {
      setError('La geolocalización no es compatible con este navegador');
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [isGeolocationSupported, handleSuccess, handleError]);

  /**
   * Iniciar rastreo continuo
   */
  useEffect(() => {
    if (!isGeolocationSupported || !enabled) {
      setLoading(false);
      return;
    }

    // Solicitar permiso
    requestPermission();

    // Obtener posición inicial
    getCurrentPosition();

    // Configurar watchPosition para rastreo continuo
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Configurar intervalo de actualización a Firebase
    const intervalId = setInterval(() => {
      if (location && enabled) {
        updateLocation(location.latitude, location.longitude);
      }
    }, updateInterval);

    // Cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    isGeolocationSupported,
    enabled,
    updateInterval,
    handleSuccess,
    handleError,
    requestPermission,
    getCurrentPosition,
    location,
    updateLocation
  ]);

  /**
   * Forzar actualización manual de la ubicación
   */
  const forceUpdate = useCallback(() => {
    if (location && mensajeroId) {
      updateLocation(location.latitude, location.longitude);
    } else {
      getCurrentPosition();
    }
  }, [location, mensajeroId, updateLocation, getCurrentPosition]);

  return {
    location,
    error,
    loading,
    permissionStatus,
    isSupported: isGeolocationSupported,
    forceUpdate,
    getCurrentPosition
  };
};

/**
 * Hook simplificado solo para obtener la posición actual (sin rastreo continuo)
 */
export const useCurrentPosition = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setError('Geolocalización no soportada');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return { position, error, loading, getPosition };
};

export default useGeolocation;
