// lib/firebase.js
// Configuración centralizada de Firebase y funciones helper para la PWA logística

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
// IMPORTANTE: Reemplaza estos valores con tu configuración real de Firebase Console
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "TU_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "tu-proyecto.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "tu-proyecto-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "tu-proyecto.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Inicializar Firebase (evitar múltiples instancias)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Iniciar sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Usuario autenticado
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      role: await getUserRole(userCredential.user.uid)
    };
  } catch (error) {
    console.error("Error en login:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cerrar sesión del usuario actual
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error en logout:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener el rol del usuario desde Firestore
 * @param {string} uid - ID del usuario
 * @returns {Promise<string>} Rol del usuario (admin, mensajero, cliente)
 */
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', uid));
    return userDoc.exists() ? userDoc.data().role : 'cliente';
  } catch (error) {
    console.error("Error obteniendo rol:", error);
    return 'cliente';
  }
};

/**
 * Observador de cambios en la autenticación
 * @param {Function} callback - Función a ejecutar cuando cambia el estado
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ============================================
// FUNCIONES PARA PAQUETES (CRUD)
// ============================================

/**
 * Crear un nuevo paquete
 * @param {Object} packageData - Datos del paquete
 * @returns {Promise<Object>} Resultado de la operación
 */
export const createPackage = async (packageData) => {
  try {
    const packageRef = await addDoc(collection(db, 'paquetes'), {
      ...packageData,
      estado: 'En espera',
      mensajeroId: null,
      mensajeroNombre: null,
      ubicacionMensajero: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      id: packageRef.id,
      message: 'Paquete creado exitosamente'
    };
  } catch (error) {
    console.error("Error creando paquete:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener un paquete por ID
 * @param {string} packageId - ID del paquete
 * @returns {Promise<Object>} Datos del paquete
 */
export const getPackage = async (packageId) => {
  try {
    const packageDoc = await getDoc(doc(db, 'paquetes', packageId));
    
    if (!packageDoc.exists()) {
      return {
        success: false,
        error: 'Paquete no encontrado'
      };
    }
    
    return {
      success: true,
      data: {
        id: packageDoc.id,
        ...packageDoc.data()
      }
    };
  } catch (error) {
    console.error("Error obteniendo paquete:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtener todos los paquetes (para admin)
 * @param {string} estado - Filtrar por estado (opcional)
 * @returns {Promise<Array>} Lista de paquetes
 */
export const getAllPackages = async (estado = null) => {
  try {
    let q = collection(db, 'paquetes');
    
    if (estado) {
      q = query(q, where('estado', '==', estado));
    }
    
    const querySnapshot = await getDocs(q);
    const packages = [];
    
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: packages
    };
  } catch (error) {
    console.error("Error obteniendo paquetes:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Asignar paquete a un mensajero
 * @param {string} packageId - ID del paquete
 * @param {string} mensajeroId - ID del mensajero
 * @param {string} mensajeroNombre - Nombre del mensajero
 * @returns {Promise<Object>} Resultado de la operación
 */
export const assignPackageToMessenger = async (packageId, mensajeroId, mensajeroNombre) => {
  try {
    await updateDoc(doc(db, 'paquetes', packageId), {
      mensajeroId,
      mensajeroNombre,
      estado: 'En camino',
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Paquete asignado exitosamente'
    };
  } catch (error) {
    console.error("Error asignando paquete:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar el estado de un paquete
 * @param {string} packageId - ID del paquete
 * @param {string} nuevoEstado - Nuevo estado del paquete
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updatePackageStatus = async (packageId, nuevoEstado) => {
  try {
    await updateDoc(doc(db, 'paquetes', packageId), {
      estado: nuevoEstado,
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Estado actualizado exitosamente'
    };
  } catch (error) {
    console.error("Error actualizando estado:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// FUNCIONES PARA MENSAJEROS
// ============================================

/**
 * Obtener paquetes asignados a un mensajero
 * @param {string} mensajeroId - ID del mensajero
 * @returns {Promise<Array>} Lista de paquetes asignados
 */
export const getMessengerPackages = async (mensajeroId) => {
  try {
    const q = query(
      collection(db, 'paquetes'),
      where('mensajeroId', '==', mensajeroId),
      where('estado', 'in', ['En camino', 'Tu paquete será el próximo'])
    );
    
    const querySnapshot = await getDocs(q);
    const packages = [];
    
    querySnapshot.forEach((doc) => {
      packages.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: packages
    };
  } catch (error) {
    console.error("Error obteniendo paquetes del mensajero:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Actualizar ubicación del mensajero en tiempo real
 * @param {string} mensajeroId - ID del mensajero
 * @param {number} latitude - Latitud
 * @param {number} longitude - Longitud
 * @returns {Promise<Object>} Resultado de la operación
 */
export const updateMessengerLocation = async (mensajeroId, latitude, longitude) => {
  try {
    // Actualizar ubicación en la colección de mensajeros
    await updateDoc(doc(db, 'mensajeros', mensajeroId), {
      ubicacion: new GeoPoint(latitude, longitude),
      lastUpdate: serverTimestamp()
    });
    
    // Actualizar ubicación en todos los paquetes asignados
    const packagesQuery = query(
      collection(db, 'paquetes'),
      where('mensajeroId', '==', mensajeroId),
      where('estado', 'in', ['En camino', 'Tu paquete será el próximo'])
    );
    
    const packagesSnapshot = await getDocs(packagesQuery);
    
    const updatePromises = packagesSnapshot.docs.map((packageDoc) =>
      updateDoc(doc(db, 'paquetes', packageDoc.id), {
        ubicacionMensajero: new GeoPoint(latitude, longitude),
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
    return {
      success: true,
      message: 'Ubicación actualizada exitosamente'
    };
  } catch (error) {
    console.error("Error actualizando ubicación:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ============================================
// FUNCIONES DE TIEMPO REAL (onSnapshot)
// ============================================

/**
 * Escuchar cambios en tiempo real de un paquete
 * @param {string} packageId - ID del paquete
 * @param {Function} callback - Función a ejecutar cuando hay cambios
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToPackage = (packageId, callback) => {
  const unsubscribe = onSnapshot(
    doc(db, 'paquetes', packageId),
    (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error en suscripción al paquete:", error);
      callback(null);
    }
  );
  
  return unsubscribe;
};

/**
 * Escuchar cambios en tiempo real de la ubicación del mensajero
 * @param {string} mensajeroId - ID del mensajero
 * @param {Function} callback - Función a ejecutar cuando hay cambios
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToMessengerLocation = (mensajeroId, callback) => {
  const unsubscribe = onSnapshot(
    doc(db, 'mensajeros', mensajeroId),
    (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.ubicacion) {
          callback({
            latitude: data.ubicacion.latitude,
            longitude: data.ubicacion.longitude,
            lastUpdate: data.lastUpdate
          });
        }
      }
    },
    (error) => {
      console.error("Error en suscripción a ubicación:", error);
    }
  );
  
  return unsubscribe;
};

/**
 * Escuchar cambios en todos los paquetes (para admin)
 * @param {Function} callback - Función a ejecutar cuando hay cambios
 * @returns {Function} Función para cancelar la suscripción
 */
export const subscribeToAllPackages = (callback) => {
  const unsubscribe = onSnapshot(
    collection(db, 'paquetes'),
    (snapshot) => {
      const packages = [];
      snapshot.forEach((doc) => {
        packages.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(packages);
    },
    (error) => {
      console.error("Error en suscripción a paquetes:", error);
    }
  );
  
  return unsubscribe;
};

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Calcular distancia entre dos coordenadas (fórmula de Haversine)
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};

// Exportar instancias
export { auth, db };
