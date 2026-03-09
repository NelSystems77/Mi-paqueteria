# 🔧 Solución de Problemas Comunes

## ✅ Problema Resuelto: "Por qué no despliega la aplicación?"

**Causa**: Faltaban los archivos de Next.js App Router

**Solución**: Ya se agregaron los archivos necesarios:
- ✅ `app/layout.js` - Layout raíz (obligatorio)
- ✅ `app/page.js` - Página principal
- ✅ `app/tracking/page.js` - Página de rastreo
- ✅ `app/admin/page.js` - Panel de admin
- ✅ `app/messenger/page.js` - Panel de mensajero

---

## 🚀 Pasos para Que Funcione Ahora

### 1. Asegúrate de tener la estructura completa

```
mi-paqueteria/
├── app/                    ← ✅ NUEVO
│   ├── layout.js          ← ✅ NUEVO
│   ├── page.js            ← ✅ NUEVO
│   ├── tracking/
│   │   └── page.js        ← ✅ NUEVO
│   ├── admin/
│   │   └── page.js        ← ✅ NUEVO
│   └── messenger/
│       └── page.js        ← ✅ NUEVO
├── components/
├── lib/
├── hooks/
├── public/
├── styles/
└── ...
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Verifica el archivo .env.local

Asegúrate de tener `.env.local` con tus credenciales:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mi-paqueteria-36c91.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mi-paqueteria-36c91
# ... etc
```

### 4. Ejecuta el servidor

```bash
npm run dev
```

### 5. Abre el navegador

Ve a: `http://localhost:3000`

Deberías ver la página principal con las 3 opciones:
- 👨‍💼 Administrador
- 🚴 Mensajero
- 👤 Cliente

---

## 🐛 Problemas Comunes

### Error: "Cannot find module '@/components/TrackingMap'"

**Causa**: Los archivos no están en las ubicaciones correctas

**Solución**:
```bash
# Verifica que existan estos archivos:
ls components/TrackingMap.jsx
ls components/MessengerPanel.jsx
ls lib/firebase.js
ls hooks/useGeolocation.js
```

---

### Error: "Module not found: Can't resolve '@/styles/globals.css'"

**Causa**: Falta el archivo de estilos

**Solución**:
```bash
# Verifica que exista:
ls styles/globals.css

# Si no existe, verifica que esté en el proyecto descargado
```

---

### Error: "Firebase: Error (auth/invalid-api-key)"

**Causa**: Las credenciales de Firebase son incorrectas

**Solución**:
1. Ve a Firebase Console
2. Project Settings > General > Your apps
3. Copia las credenciales correctas
4. Actualiza `.env.local`
5. Reinicia el servidor: `npm run dev`

---

### La página carga pero no muestra el mapa

**Causa**: Problema con Leaflet en SSR

**Solución**: Ya está solucionado con dynamic import en `TrackingMap.jsx`

Si aún tienes problemas:
```bash
npm install leaflet react-leaflet
```

---

### Error: "Hydration failed"

**Causa**: Diferencia entre renderizado del servidor y cliente

**Solución**: Ya está manejado con `'use client'` en los componentes necesarios

---

### No aparece nada en el mapa

**Causa**: No hay paquetes con ubicación del mensajero

**Solución**:
1. Crea un paquete en Firestore
2. Asígnalo a un mensajero
3. El mensajero debe activar el rastreo GPS
4. La ubicación se actualizará automáticamente

---

### Error al iniciar sesión como admin

**Verificaciones**:

1. **Usuario existe en Authentication**:
   - Firebase Console > Authentication > Users
   - Debe existir: `admin@nelsystems.com`

2. **Documento existe en Firestore**:
   - Firebase Console > Firestore > usuarios
   - Debe existir documento con UID del admin
   - Campo `role` debe ser `"admin"`

3. **Contraseña correcta**:
   - `123456789AiXmDy` (exactamente así)

---

### Error al iniciar sesión como mensajero

**Verificaciones**:

1. **Usuario existe**:
   - Email: `mensajero1@mipaqueteria.com`
   - Password: `Mensajero123!`

2. **Documentos existen**:
   - `usuarios/[UID]` con `role: "mensajero"`
   - `mensajeros/[UID]` con todos los campos

---

### El rastreo GPS no funciona

**Verificaciones**:

1. **Permisos del navegador**:
   - El navegador debe tener permisos de ubicación
   - Chrome/Firefox preguntarán al activar el rastreo
   - Acepta los permisos

2. **HTTPS requerido**:
   - En producción, DEBES usar HTTPS
   - En desarrollo (localhost) funciona sin HTTPS

3. **Navegador compatible**:
   - Chrome, Firefox, Safari, Edge modernos
   - No funciona en navegadores antiguos

---

### La ubicación no se actualiza en tiempo real

**Verificaciones**:

1. **Firebase onSnapshot funcionando**:
   - Abre la consola del navegador (F12)
   - Busca errores de Firebase

2. **El mensajero activó el rastreo**:
   - En el panel del mensajero debe estar el botón "Detener" (no "Iniciar")
   - Debe aparecer "Actualizando cada 10s"

3. **Reglas de Firestore correctas**:
   - Verifica que las reglas permitan lecturas
   - Ve a Firestore > Reglas

---

## 🔍 Comandos de Diagnóstico

### Verificar estructura del proyecto

```bash
# Ver todos los archivos importantes
ls -R app/ components/ lib/ hooks/ public/ styles/
```

### Verificar dependencias

```bash
# Ver versiones instaladas
npm list next react firebase leaflet
```

### Ver logs de desarrollo

```bash
# Ejecutar con logs detallados
npm run dev -- --verbose
```

### Limpiar caché

```bash
# Si algo no funciona, limpia el caché
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

---

## 📞 Si Nada Funciona

1. **Descarga nuevamente el proyecto** desde los archivos generados
2. **Verifica que tengas todos los archivos** listados en la estructura
3. **Elimina y reinstala dependencias**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
4. **Verifica tu versión de Node.js**:
   ```bash
   node --version  # Debe ser >= 18.0.0
   ```

---

## ✅ Checklist de Verificación

Antes de preguntar por problemas, verifica:

- [ ] Tengo Node.js 18+ instalado
- [ ] Ejecuté `npm install`
- [ ] Tengo el archivo `.env.local` con credenciales correctas
- [ ] Firebase está configurado (Authentication + Firestore)
- [ ] Usuario admin creado en Firebase
- [ ] Reglas de Firestore publicadas
- [ ] Todos los archivos de `app/` existen
- [ ] El servidor se ejecuta sin errores (`npm run dev`)
- [ ] No hay errores en la consola del navegador

---

## 🎯 Verificación Rápida

```bash
# Ejecuta esto en la terminal:
echo "Verificando estructura..."
test -f app/layout.js && echo "✅ layout.js" || echo "❌ Falta layout.js"
test -f app/page.js && echo "✅ page.js" || echo "❌ Falta page.js"
test -f lib/firebase.js && echo "✅ firebase.js" || echo "❌ Falta firebase.js"
test -f .env.local && echo "✅ .env.local" || echo "❌ Falta .env.local"
```

Si todos tienen ✅, tu proyecto está completo.
