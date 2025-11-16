# 🧪 Guía de Pruebas - Radio meskeIA v3.0

## 📋 Checklist de Verificación

Antes de hacer commit, verifica CADA punto de esta lista.

---

## 1️⃣ VERIFICAR CONSOLA DEL NAVEGADOR

### Abrir DevTools
1. Presiona **F12**
2. Ve a la pestaña **Console**

### Verificar mensajes de inicio
Debes ver exactamente:
```
📻 Radio meskeIA v3.0 - Sistema estable con HLS
✅ Función mostrarNotificacion: true
✅ hls.js cargado: Sí
✅ Soporte HLS nativo: Sí (o No, dependiendo del navegador)
🔧 Notificaciones centelleantes: CORREGIDO
```

**✅ Resultado esperado**: Todos los mensajes aparecen correctamente

**❌ Si falla**: La caché no se limpió, presiona `Ctrl + Shift + R`

---

## 2️⃣ PROBAR EMISORAS NORMALES (MP3/AAC)

### Emisoras a probar:
1. **Los 40 Principales**
2. **Cadena SER**
3. **Cadena 100**
4. **Europa FM**
5. **Rock FM** ⭐ (Nueva en v3.0)
6. **Kiss FM** ⭐ (Nueva en v3.0)

### Pasos:
- Haz clic en cada tarjeta
- Espera 2-3 segundos
- Verifica que se escucha audio
- Verifica que el nombre aparece en el reproductor

**✅ Resultado esperado**: Se reproducen sin problemas

**❌ Si falla**: Anota qué emisora falla (puede ser problema de la emisora, no de la app)

---

## 3️⃣ PROBAR EMISORAS HLS (.m3u8)

### Emisoras HLS a probar:
1. **Radio Nacional (RNE)** - Formato HLS
2. **Radio 3 (RNE)** - Formato HLS
3. **COPE** - Formato HLS

### Pasos:
1. Haz clic en **Radio Nacional (RNE)**
2. Abre **DevTools → Console**
3. Busca mensajes de hls.js
4. Espera 3-5 segundos (HLS tarda más en cargar)
5. Verifica que se escucha audio

**✅ Resultado esperado**: Se reproducen correctamente (puede tardar 3-5s)

**❌ Si falla**:
- Verifica en consola: "✅ hls.js cargado: Sí"
- Si dice "No", revisa conexión a internet (CDN de jsDelivr)

---

## 4️⃣ PROBAR NOTIFICACIONES (CRÍTICO)

### Test de emisora fallida:

**IMPORTANTE**: Este es el test MÁS CRÍTICO que debes hacer.

### Pasos:
1. Abre **DevTools → Network**
2. Filtra por "media" o "audio"
3. Haz clic en una emisora que **NO funcione** (puede ser cualquiera de Radio Browser API)
4. **Observa atentamente** el comportamiento de la notificación

### ✅ Comportamiento CORRECTO (v3.0):
```
1. Aparece UNA sola notificación roja en la parte superior
2. El mensaje dice: "❌ No se pudo reproducir esta emisora. Intenta con otra."
3. La notificación NO centellea
4. La notificación NO se duplica
5. La notificación desaparece automáticamente en 3 segundos
```

### ❌ Comportamiento INCORRECTO (v2.1):
```
1. Aparecen MÚLTIPLES notificaciones simultáneas
2. Las notificaciones parpadean continuamente
3. Las notificaciones NO desaparecen
4. Solo se detienen al hacer clic en otra emisora
```

**Si ves el comportamiento INCORRECTO**: La caché antigua sigue activa. Haz:
1. `Ctrl + Shift + R` (recarga dura)
2. Cierra TODAS las pestañas del navegador
3. Cierra completamente el navegador
4. Abre de nuevo y prueba

---

## 5️⃣ PROBAR CONTROLES DEL REPRODUCTOR

### Play/Pause
- Haz clic en el botón central grande
- Verifica que cambia entre ▶️ y ⏸️
- Verifica que la música se pausa/reanuda

### Stop
- Haz clic en el botón ⏹️
- Verifica que se detiene completamente
- Verifica que vuelve a "Selecciona una emisora"

### Volumen
- Mueve el slider de volumen
- Verifica que el audio cambia de intensidad
- Pon volumen a 0 y verifica que no se escucha

### Mute
- Haz clic en el botón 🔊
- Verifica que cambia a 🔇
- Verifica que el audio se silencia
- Haz clic de nuevo y verifica que vuelve el sonido

**✅ Resultado esperado**: Todos los controles funcionan correctamente

---

## 6️⃣ PROBAR FAVORITOS

### Añadir a favoritos
1. Haz clic en el corazón 🤍 de una tarjeta
2. Verifica que cambia a ❤️
3. Ve a la pestaña **⭐ Favoritos**
4. Verifica que la emisora aparece

### Quitar de favoritos
1. Haz clic en el corazón ❤️
2. Verifica que cambia a 🤍
3. Recarga la pestaña de favoritos
4. Verifica que desapareció

### Persistencia
1. Añade 2-3 favoritos
2. Cierra la pestaña del navegador
3. Abre de nuevo Radio meskeIA
4. Ve a **⭐ Favoritos**
5. Verifica que siguen ahí

**✅ Resultado esperado**: Los favoritos se guardan y persisten

---

## 7️⃣ PROBAR BÚSQUEDA

### Búsqueda por nombre
1. Escribe "BBC" en el campo de búsqueda
2. Haz clic en 🔍 Buscar
3. Espera a que cargue
4. Verifica que aparecen emisoras con "BBC" en el nombre

### Filtro por país
1. Selecciona "United Kingdom" en el filtro de país
2. Haz clic en 🔍 Buscar
3. Verifica que aparecen emisoras del Reino Unido

### Filtro por género
1. Selecciona "rock" en el filtro de género
2. Haz clic en 🔍 Buscar
3. Verifica que aparecen emisoras de rock

**✅ Resultado esperado**: La búsqueda funciona correctamente

---

## 8️⃣ VERIFICAR ANALYTICS

### Verificar envío de datos
1. Abre **DevTools → Network**
2. Filtra por "guardar-uso"
3. Recarga la página
4. Busca la petición a `guardar-uso.php`
5. Haz clic derecho → **Copy as cURL**
6. Pega en un editor de texto
7. Busca el payload

### Verificar formato correcto
El payload debe tener:
```json
{
  "aplicacion": "radio-meskeia",
  "navegador": "Mozilla/5.0...",
  "sistema_operativo": "Win32",
  "resolucion": "1920x1080",  ← DEBE SER UN NÚMERO, NO [object Object]
  "tipo_dispositivo": "escritorio",
  "es_recurrente": false
}
```

**✅ Resultado esperado**: `resolucion` tiene formato `WIDTHxHEIGHT`

**❌ Si falla**: Aparece `[object Object]x[object Object]`

---

## 9️⃣ PROBAR RESPONSIVIDAD (MÓVIL)

### Modo responsive en DevTools
1. Presiona `Ctrl + Shift + M` (modo responsive)
2. Selecciona "iPhone 12 Pro" o similar
3. Verifica que:
   - Logo se ve correctamente
   - Reproductor se adapta
   - Tarjetas se ven en columna
   - Footer no tapa contenido
   - Controles son accesibles

**✅ Resultado esperado**: Todo responsive sin scroll horizontal

---

## 🔟 VERIFICAR RENDIMIENTO

### Memory Leaks (Fugas de memoria)
1. Abre **DevTools → Performance**
2. Haz clic en **Record**
3. Reproduce 3-4 emisoras diferentes
4. Haz clic en **Stop**
5. Revisa el gráfico de memoria

**✅ Resultado esperado**: La memoria NO crece indefinidamente

**❌ Si falla**: Puede haber un leak en hls.js (verifica que se llama `destroy()`)

---

## 📝 CHECKLIST FINAL

Antes de hacer commit, marca cada ítem:

- [ ] Consola muestra v3.0 correctamente
- [ ] hls.js está cargado
- [ ] Los 40 Principales funciona
- [ ] Cadena SER funciona
- [ ] Rock FM funciona
- [ ] Kiss FM funciona
- [ ] Radio Nacional (HLS) funciona
- [ ] Radio 3 (HLS) funciona
- [ ] COPE (HLS) funciona
- [ ] **Notificaciones NO centellan** (CRÍTICO)
- [ ] Notificación aparece UNA sola vez
- [ ] Notificación desaparece en 3s
- [ ] Play/Pause funciona
- [ ] Stop funciona
- [ ] Volumen funciona
- [ ] Mute funciona
- [ ] Favoritos se guardan
- [ ] Favoritos persisten al recargar
- [ ] Búsqueda funciona
- [ ] Analytics envía `resolucion` correcta
- [ ] Responsive funciona en móvil
- [ ] No hay fugas de memoria

---

## ⚠️ SI ALGÚN TEST FALLA

### Problema: Sigo viendo v2.1 en consola
**Solución**:
```
1. Ctrl + Shift + R (recarga dura)
2. Cierra TODAS las pestañas
3. Cierra el navegador completamente
4. Abre de nuevo
```

### Problema: hls.js no está cargado
**Solución**:
```
1. Verifica conexión a internet
2. Abre DevTools → Network
3. Busca "hls.js" en la lista
4. Si está en rojo (404), el CDN de jsDelivr está caído
5. Espera unos minutos o cambia de CDN
```

### Problema: Notificaciones siguen centelleando
**Solución**:
```
1. Verifica que la versión sea 3.0 (en consola)
2. Si es 2.1, limpia caché manualmente:
   - Chrome: Ctrl + Shift + Delete
   - Selecciona "Imágenes y archivos en caché"
   - Borrar datos
3. Cierra navegador completamente
4. Abre de nuevo
```

### Problema: Emisoras HLS no funcionan
**Solución**:
```
1. Verifica en consola si hls.js está cargado
2. Si no está, hay problema de red
3. Si está, puede ser problema de la emisora (URLs pueden cambiar)
4. Prueba con navegador diferente (Safari tiene soporte HLS nativo)
```

---

## 🎯 CRITERIO DE ÉXITO

**La aplicación está lista para commit si**:
1. ✅ TODAS las emisoras funcionan (al menos 8 de 10)
2. ✅ Notificaciones NO centellan (CRÍTICO)
3. ✅ Analytics envía datos correctos
4. ✅ No hay errores en consola
5. ✅ Controles funcionan correctamente

**SI hay problemas persistentes**:
- Documenta qué falla exactamente
- Anota en qué navegador
- Anota qué versión aparece en consola
- NO hacer commit hasta resolverlo

---

© 2025 meskeIA - Guía de Testing v3.0
