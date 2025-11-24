# 🐛 Bugs Conocidos - meskeIA Next.js Migration

## 🔴 CRÍTICO: conversor-divisas - Error en Producción

**Estado**: 🔴 PENDIENTE DE RESOLUCIÓN

**Fecha**: 2025-11-24

**Descripción**:
La app `conversor-divisas` funciona correctamente en localhost (`npm run dev`) pero falla en producción con el error:
```
TypeError: Cannot convert undefined or null to object
    at Object.keys (<anonymous>)
    at E (3257a6554fbddb72.js:1:17289)
```

**Apps Afectadas**:
- ❌ conversor-divisas

**Apps NO Afectadas** (funcionan correctamente en producción):
- ✅ calculadora-cocina
- ✅ lista-compras
- ✅ calculadora-fechas (pendiente de migrar)
- ✅ conversor-tallas (pendiente de migrar)
- ✅ regla-de-tres (pendiente de migrar)

**Entorno**:
- Next.js: 16.0.3
- Modo: Static Site Generation (SSG)
- basePath: `/beta`
- Output: `export`

**Código Problemático**:
```typescript
// conversor-divisas/page.tsx (líneas 26-62)
const currencies: Record<string, string> = {
  'EUR': 'Euro',
  'USD': 'Dólar estadounidense',
  // ... 33 monedas total
};

// Línea ~115
Object.keys(currencies).map((code) => ( ... ))
```

**Causa Probable**:
El minificador de Next.js en modo producción está alterando el objeto `currencies` de forma que causa `Object.keys()` falle. Posiblemente relacionado con:
- SSG hydration mismatch
- Minificación agresiva de objetos grandes
- Bug de Next.js 16 con Turbopack

**Intentos de Solución** (todos FALLIDOS):
1. ✅ Mover `currencies` dentro del componente (no fuera)
2. ✅ Añadir guards `if (!isClient)`
3. ✅ Rebuild limpio después de reiniciar PC
4. ✅ Verificar basePath configurado correctamente
5. ✅ Eliminar cache (.next y out)
6. ✅ Verificar que el HTML tiene rutas `/beta/` correctas

**Workaround Temporal**:
Ninguno. La app queda NO funcional en producción.

**Siguiente Pasos Sugeridos** (para más adelante):
1. Refactorizar `currencies` a un archivo JSON externo importado
2. Usar `useMemo()` para cachear el objeto currencies
3. Probar con Next.js 15 (downgrade temporal)
4. Reportar bug a Next.js GitHub si se confirma que es un issue del framework
5. Usar `getStaticProps()` en lugar de cliente-side hydration

**Archivos Relevantes**:
- `app/conversor-divisas/page.tsx` (líneas 26-62, 115)
- `app/conversor-divisas/ConversorDivisas.module.css`
- `out/_next/static/chunks/3257a6554fbddb72.js` (minificado)

**Logs de Error Completos**:
```
✅ Theme-color actualizado: #2E86AB (light)
eedb9000a64f9525.js:1 TypeError: Cannot convert undefined or null to object
    at Object.keys (<anonymous>)
    at E (3257a6554fbddb72.js:1:17289)
    at 3257a6554fbddb72.js:1:19593
    at Array.map (<anonymous>)
    at i (3257a6554fbddb72.js:1:19585)
    at av (eedb9000a64f9525.js:1:63226)
    at oX (eedb9000a64f9525.js:1:83499)
    at io (eedb9000a64f9525.js:1:94931)
    at sc (eedb9000a64f9525.js:1:137952)
    at eedb9000a64f9525.js:1:137797
```

---

## ⚠️ OTROS BUGS CONOCIDOS

### Advertencia: `themeColor` en metadata

**Estado**: ⚠️ CONOCIDO - NO CRÍTICO

**Descripción**:
```
⚠ Unsupported metadata themeColor is configured in metadata export in /calculadora-porcentajes.
Please move it to viewport export instead.
```

**Impacto**: Ninguno. Es solo una advertencia de deprecación de Next.js 16.

**Solución**: Mover `themeColor` de metadata a viewport export en todas las apps (tarea futura).

---

## 📋 Checklist de Debugging (para conversor-divisas)

Cuando retomes este bug:

- [ ] Extraer `currencies` a `lib/currencies.json` e importar como módulo
- [ ] Usar `useMemo()` para cachear currencies
- [ ] Probar con `JSON.stringify()` + `JSON.parse()` para clonar el objeto
- [ ] Revisar si hay otros objetos grandes que funcionen correctamente (comparar con calculadora-cocina)
- [ ] Probar desactivar minificación temporalmente en `next.config.ts`
- [ ] Verificar si el error ocurre también con solo 5 monedas (en lugar de 33)
- [ ] Buscar en GitHub Issues de Next.js: "Object.keys undefined SSG"
- [ ] Contactar soporte de Vercel/Next.js si el bug persiste

---

**Última actualización**: 2025-11-24
**Actualizado por**: Claude Code (Session 6)
