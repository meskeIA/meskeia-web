# 🔄 Cómo Limpiar la Caché del Navegador

Si ves un `alert()` bloqueante en lugar de las notificaciones elegantes, es porque tu navegador tiene la versión antigua en caché.

## ✅ Solución Rápida

### Windows
1. **Chrome/Edge**: Presiona `Ctrl + Shift + R`
2. **Firefox**: Presiona `Ctrl + F5`

### Mac
1. **Chrome/Safari**: Presiona `Cmd + Shift + R`
2. **Firefox**: Presiona `Cmd + Shift + R`

## 📋 Método Completo

1. **Cierra TODAS las pestañas** del navegador
2. **Cierra completamente** el navegador
3. **Abre de nuevo** el navegador
4. **Navega a la aplicación**: `file:///C:/Users/jaceb/meskeia-web/radio-meskeia/index.html`
5. **Presiona F12** para abrir DevTools
6. **Ve a Console** y verifica que aparezca:
   ```
   📻 Radio meskeIA v2.1 - Sistema de notificaciones sin alert()
   ✅ Función mostrarNotificacion: true
   ❌ alert() NO está en el código
   ```

## ✅ Verificación

Si ves estos mensajes en la consola, **tienes la versión correcta** y NO verás alerts bloqueantes.

Las notificaciones aparecerán como banners elegantes en la parte superior con:
- ❌ Color rojo para errores
- ⚠️ Color azul para información
- ✅ Se cierran automáticamente después de 3 segundos

## 🚫 Si el Problema Persiste

1. **Limpia la caché manualmente**:
   - Chrome: `Configuración > Privacidad y seguridad > Borrar datos de navegación`
   - Selecciona "Imágenes y archivos en caché"
   - Presiona "Borrar datos"

2. **Modo Incógnito**:
   - Abre una ventana de incógnito
   - Carga la aplicación ahí (sin caché)

3. **Última opción**:
   - Usa un navegador diferente

---

© 2025 meskeIA - Radio meskeIA v2.1
