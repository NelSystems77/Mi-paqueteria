# Mi Paquetería - Sistema Logístico PWA

Sistema completo de rastreo logístico en tiempo real desarrollado como Progressive Web App (PWA) con React, Next.js y Firebase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
![React](https://img.shields.io/badge/React-18.x-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-10.x-orange)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Características Principales

- ✅ **Rastreo en Tiempo Real**: Seguimiento de paquetes y mensajeros mediante Firebase Realtime
- ✅ **PWA Instalable**: Compatible con iOS y Android
- ✅ **Geolocalización Automática**: Actualización GPS del mensajero cada 10 segundos
- ✅ **Mapas Interactivos**: Integración con Leaflet.js para visualización
- ✅ **Sistema de Roles**: Admin, Mensajero y Cliente
- ✅ **Diseño Responsivo**: Mobile-first con Tailwind CSS
- ✅ **Offline-Ready**: Service Workers para funcionamiento sin conexión
- ✅ **Arquitectura Modular**: Código limpio y escalable

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

```
Frontend:
├── React 18.x
├── Next.js 14.x (App Router)
├── Tailwind CSS 3.x
└── Leaflet.js (Mapas)

Backend:
├── Firebase Authentication
├── Cloud Firestore (Realtime Database)
└── Firebase Storage

PWA:
├── Service Workers
├── Web App Manifest
└── Cache API
```

### Estructura de Directorios

```
mi-paqueteria/
├── app/                      # Next.js App Router
│   ├── layout.js            # Layout principal
│   ├── page.js              # Página de inicio
│   ├── admin/               # Panel de administración
│   ├── messenger/           # Panel del mensajero
│   └── tracking/            # Búsqueda y rastreo
├── components/              # Componentes React
│   ├── TrackingMap.jsx     # Mapa de rastreo en tiempo real
│   ├── MessengerPanel.jsx  # Panel del mensajero
│   └── AdminDashboard.jsx  # Dashboard administrativo
├── hooks/                   # Custom Hooks
│   └── useGeolocation.js   # Hook de geolocalización
├── lib/                     # Librerías y utilidades
│   └── firebase.js         # Configuración y funciones Firebase
├── public/                  # Recursos estáticos
│   ├── manifest.json       # Web App Manifest
│   ├── icons/              # Iconos PWA
│   └── sw.js               # Service Worker
├── styles/                  # Estilos globales
├── next.config.js          # Configuración Next.js
└── package.json            # Dependencias
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18.x o superior
- npm o yarn
- Cuenta de Firebase (Plan Blaze recomendado)
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/mi-paqueteria.git
cd mi-paqueteria
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Firebase

#### a) Crear Proyecto en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto llamado "mi-paqueteria"
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password)
   - **Cloud Firestore**
   - **Firebase Storage** (opcional)

#### b) Obtener Credenciales

1. En Firebase Console, ve a **Project Settings** > **General**
2. Desplázate hasta "Your apps" y crea una **Web App**
3. Copia las credenciales de configuración

#### c) Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# App Configuration
NEXT_PUBLIC_APP_NAME=Mi Paquetería
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### 4. Estructura de Firestore

Crea las siguientes colecciones en Firestore:

#### Colección: `usuarios`
```javascript
{
  uid: "user_id_123",
  email: "admin@nelsystems.com",
  role: "admin", // admin | mensajero | cliente
  nombre: "Administrador",
  createdAt: timestamp
}
```

#### Colección: `paquetes`
```javascript
{
  id: "auto_generated",
  estado: "En espera", // En espera | En camino | Tu paquete será el próximo | Entregado
  mensajeroId: "mensajero_id_123",
  mensajeroNombre: "Juan Pérez",
  destino: {
    direccion: "Calle Principal 123, San José",
    coordenadas: new GeoPoint(9.9281, -84.0907)
  },
  ubicacionMensajero: new GeoPoint(9.9300, -84.0920),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Colección: `mensajeros`
```javascript
{
  id: "mensajero_id_123",
  nombre: "Juan Pérez",
  email: "juan@mensajeros.com",
  telefono: "+506 8888-8888",
  ubicacion: new GeoPoint(9.9281, -84.0907),
  activo: true,
  lastUpdate: timestamp
}
```

### 5. Reglas de Seguridad de Firestore

Configura las reglas de seguridad en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper para verificar rol
    function hasRole(role) {
      return isSignedIn() && 
             get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.role == role;
    }
    
    // Usuarios
    match /usuarios/{userId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
    
    // Paquetes
    match /paquetes/{packageId} {
      allow read: if isSignedIn();
      allow create: if hasRole('admin');
      allow update: if hasRole('admin') || hasRole('mensajero');
      allow delete: if hasRole('admin');
    }
    
    // Mensajeros
    match /mensajeros/{mensajeroId} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin') || 
                     (hasRole('mensajero') && request.auth.uid == mensajeroId);
    }
  }
}
```

### 6. Crear Usuario Administrador

Usa Firebase Console Authentication para crear el usuario admin:

```
Email: admin@nelsystems.com
Password: 123456789AiXmDy
```

Luego, crea manualmente el documento en Firestore `usuarios/{uid}`:

```javascript
{
  email: "admin@nelsystems.com",
  role: "admin",
  nombre: "Administrador Sistema",
  createdAt: serverTimestamp()
}
```

## 💻 Desarrollo

### Modo Desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

### Build para Producción

```bash
npm run build
npm run start
# o
yarn build
yarn start
```

## 📱 Instalación como PWA

### iOS (Safari)

1. Abre la app en Safari
2. Toca el botón "Compartir" (cuadrado con flecha)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma el nombre y toca "Añadir"

### Android (Chrome)

1. Abre la app en Chrome
2. Toca el menú (tres puntos)
3. Selecciona "Añadir a pantalla de inicio"
4. Confirma la instalación

## 🎯 Uso del Sistema

### Panel de Administrador

**URL**: `/admin`  
**Credenciales**: `admin@nelsystems.com` / `123456789AiXmDy`

**Funcionalidades**:
- Crear y gestionar paquetes
- Asignar paquetes a mensajeros
- Ver todos los paquetes en tiempo real
- Cambiar estados de entrega
- Monitorear ubicaciones de mensajeros

### Panel del Mensajero

**URL**: `/messenger`

**Funcionalidades**:
- Ver entregas asignadas
- Activar/desactivar rastreo GPS
- Actualizar estado de paquetes
- Navegar al destino (Google Maps)
- Actualización automática de ubicación cada 10s

**Uso del Rastreo GPS**:

```jsx
// El hook se activa automáticamente
const { location, error, loading } = useGeolocation(
  mensajeroId,
  trackingEnabled,
  10000 // Actualizar cada 10 segundos
);
```

### Panel del Cliente (Rastreo)

**URL**: `/tracking?id={packageId}`

**Funcionalidades**:
- Búsqueda por ID de paquete
- Mapa en tiempo real con ubicación del mensajero
- Indicador de progreso (Stepper)
- Actualización automática sin recargar

**Integración**:

```jsx
import TrackingMap from '@/components/TrackingMap';

<TrackingMap packageId="paquete_id_123" />
```

## 🔧 Componentes Principales

### TrackingMap.jsx

Mapa de rastreo en tiempo real con suscripción a Firebase:

```jsx
import TrackingMap from '@/components/TrackingMap';

<TrackingMap packageId="abc123" />
```

**Props**:
- `packageId`: ID del paquete a rastrear (requerido)

**Características**:
- Auto-centrado en el mensajero
- Actualización en tiempo real sin recargar
- Indicador de progreso
- Marcadores animados
- Línea de ruta

### MessengerPanel.jsx

Panel del mensajero con control de GPS:

```jsx
import MessengerPanel from '@/components/MessengerPanel';

<MessengerPanel 
  mensajeroId="mensajero_123" 
  mensajeroNombre="Juan Pérez" 
/>
```

**Props**:
- `mensajeroId`: ID del mensajero (requerido)
- `mensajeroNombre`: Nombre del mensajero (requerido)

## 🪝 Custom Hooks

### useGeolocation

Hook para rastreo GPS automático:

```javascript
import { useGeolocation } from '@/hooks/useGeolocation';

const MyComponent = () => {
  const {
    location,        // { latitude, longitude, accuracy, timestamp }
    error,           // String de error (si hay)
    loading,         // Boolean de carga
    permissionStatus, // 'granted' | 'denied' | 'prompt'
    forceUpdate,     // Función para actualizar manualmente
    getCurrentPosition // Función para obtener posición una vez
  } = useGeolocation(
    mensajeroId,     // ID del mensajero
    true,            // Activar rastreo
    10000            // Intervalo de actualización (ms)
  );

  return (
    <div>
      {location && (
        <p>Lat: {location.latitude}, Lng: {location.longitude}</p>
      )}
    </div>
  );
};
```

## 🔥 Funciones Firebase

### Autenticación

```javascript
import { loginUser, logoutUser, onAuthChange } from '@/lib/firebase';

// Login
const result = await loginUser('email@example.com', 'password');

// Logout
await logoutUser();

// Observar cambios de autenticación
onAuthChange((user) => {
  if (user) {
    console.log('Usuario autenticado:', user);
  }
});
```

### Gestión de Paquetes

```javascript
import {
  createPackage,
  getPackage,
  getAllPackages,
  assignPackageToMessenger,
  updatePackageStatus
} from '@/lib/firebase';

// Crear paquete
await createPackage({
  destino: {
    direccion: "Calle 123",
    coordenadas: { latitude: 9.93, longitude: -84.09 }
  }
});

// Asignar a mensajero
await assignPackageToMessenger('pkg_123', 'mensajero_123', 'Juan');

// Actualizar estado
await updatePackageStatus('pkg_123', 'Entregado');
```

### Tiempo Real (onSnapshot)

```javascript
import { subscribeToPackage } from '@/lib/firebase';

// Suscribirse a cambios
const unsubscribe = subscribeToPackage('pkg_123', (packageData) => {
  console.log('Paquete actualizado:', packageData);
  setPackage(packageData);
});

// Cleanup
return () => unsubscribe();
```

## 🎨 Personalización de Estilos

El proyecto usa Tailwind CSS. Para personalizar:

1. Edita `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',    // Azul principal
        secondary: '#10B981',  // Verde secundario
      }
    }
  }
}
```

2. Los componentes usan clases de Tailwind directamente

## 🔒 Seguridad

### Mejores Prácticas Implementadas

1. **Variables de Entorno**: Credenciales en `.env.local`
2. **Reglas de Firestore**: Validación por roles
3. **Headers de Seguridad**: Configurados en `next.config.js`
4. **HTTPS**: Requerido en producción
5. **Autenticación**: Firebase Authentication

### Checklist de Despliegue

- [ ] Cambiar credenciales de admin
- [ ] Configurar dominio personalizado
- [ ] Habilitar HTTPS
- [ ] Revisar reglas de Firestore
- [ ] Configurar CORS si es necesario
- [ ] Habilitar backup de Firestore

## 🚀 Despliegue

### Vercel (Recomendado)

1. Sube el código a GitHub
2. Conecta el repositorio en [Vercel](https://vercel.com)
3. Configura las variables de entorno
4. Deploy automático

### Otras Opciones

- **Netlify**: Compatible con Next.js
- **Firebase Hosting**: Integración nativa
- **AWS Amplify**: Escalabilidad empresarial

## 📊 Monitoreo

### Firebase Console

- **Analytics**: Uso y comportamiento
- **Performance**: Tiempos de carga
- **Crashlytics**: Errores en producción

### Logs

```javascript
// Los errores se registran en console.error
// Configura Sentry o LogRocket para producción
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **NelSystems** - Desarrollo inicial - [nelsystems.com](https://nelsystems.com)

## 🙏 Agradecimientos

- React y Next.js por el framework
- Firebase por el backend
- Leaflet por los mapas
- Tailwind CSS por los estilos

## 📞 Soporte

Para soporte o consultas:
- Email: soporte@nelsystems.com
- Issues: [GitHub Issues](https://github.com/tu-usuario/mi-paqueteria/issues)

---

**Desarrollado con ❤️ por NelSystems**
