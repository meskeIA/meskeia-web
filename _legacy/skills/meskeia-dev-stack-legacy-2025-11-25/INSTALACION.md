# 📦 Instalación de meskeIA Development Stack Skill

## ✅ Verificación de Instalación

La skill ya está instalada en:
```
C:\Users\jaceb\.claude\skills\meskeia-dev-stack\
```

### Verificar que Claude Code la detecta

1. Abre Claude Code (VS Code)
2. Pregunta a Claude: **"¿Qué skills están disponibles?"**
3. Deberías ver: `meskeia-dev-stack`

---

## 🧪 Prueba Rápida

Para verificar que la skill funciona correctamente:

### Test 1: Generación Automática

Pide a Claude:
```
"Crea una aplicación web simple para gestionar tareas"
```

**Resultado esperado:**
- ✅ Paleta #2E86AB aplicada
- ✅ Logo meskeIA incluido
- ✅ Footer oficial incluido
- ✅ Responsive móvil (@media max-width: 768px)
- ✅ Formato español en JavaScript
- ✅ Sin preguntar si aplicar meskeIA

### Test 2: Proyecto Flask

Pide a Claude:
```
"Genera un proyecto Flask para una API REST"
```

**Resultado esperado:**
- ✅ Archivo .env creado
- ✅ .gitignore incluye .env
- ✅ Localización española configurada
- ✅ API keys NO hardcodeadas
- ✅ Comentarios en español

### Test 3: Validación Automática

Después de generar código, pregunta:
```
"Valida este proyecto con los estándares meskeIA"
```

**Resultado esperado:**
- ✅ Checklist completo mostrado
- ✅ Puntuación de cumplimiento
- ✅ Sugerencias de mejora (si aplica)

---

## 🔄 Si la Skill NO Aparece

1. **Verificar ubicación**:
   ```bash
   ls -la "C:\Users\jaceb\.claude\skills"
   ```

2. **Reiniciar Claude Code**:
   - Cerrar VS Code completamente
   - Volver a abrir
   - Esperar 5 segundos
   - Preguntar de nuevo: "¿Qué skills están disponibles?"

3. **Verificar SKILL.md**:
   ```bash
   cat "C:\Users\jaceb\.claude\skills\meskeia-dev-stack\SKILL.md"
   ```
   Debe contener el frontmatter YAML con `name:` y `description:`

---

## 📁 Estructura Correcta

Tu instalación debe verse así:

```
C:\Users\jaceb\.claude\skills\meskeia-dev-stack\
├── SKILL.md                    ✅ (OBLIGATORIO - Claude lee este archivo)
├── README.md                   ✅
├── INSTALACION.md              ✅ (Este archivo)
├── templates/
│   ├── base.html               ✅
│   ├── flask_app.py            ✅
│   └── manifest.json           ✅
├── snippets/
│   ├── logo.html               ✅
│   ├── footer.html             ✅
│   ├── localization.js         ✅
│   ├── env.example             ✅
│   └── .gitignore              ✅
└── validators/
    └── checklist.json          ✅
```

---

## 🎯 ¿Cómo Funciona?

### Activación Automática

La skill se activa cuando escribes frases como:
- "Crea una aplicación web..."
- "Genera un proyecto Flask..."
- "Haz una página HTML..."
- "Desarrolla una PWA..."

### Modo Silencioso

La skill opera **sin anunciar**:
- ❌ NO dice "voy a aplicar meskeIA"
- ❌ NO pide confirmación
- ✅ DIRECTAMENTE genera con estándares

### Validación Integrada

Después de generar código, Claude verifica MENTALMENTE:
```
[✓] Paleta oficial
[✓] Logo/footer oficiales
[✓] Responsive móvil
[✓] Formato español
[✓] API keys seguras
```

Si falta algo, **auto-corrige inmediatamente**.

---

## 🚀 Uso Avanzado

### Invocar Manualmente (Opcional)

Aunque se activa automáticamente, puedes forzar su uso:

```
"Usa la skill meskeIA-dev-stack para esta app"
```

### Desactivar Temporalmente

Si necesitas generar código sin estándares meskeIA:

```
"Genera código básico sin aplicar skills"
```

---

## 🆘 Solución de Problemas

### Problema: Claude no aplica la skill

**Solución 1**: Menciona "aplicación web" explícitamente
```
"Crea una aplicación web para..."  ✅
vs.
"Crea un script Python..."         ❌ (no es web)
```

**Solución 2**: Invócala manualmente
```
"Usa meskeIA-dev-stack para generar..."
```

### Problema: Falta responsive móvil

**Solución**: La skill lo incluye automáticamente. Si falta:
```
"Añade responsive móvil con @media max-width: 768px"
```

### Problema: API keys hardcodeadas

**Solución**: La skill las detecta. Si aparecen:
```
"Mueve las API keys a .env"
```

---

## 📊 Validador Externo (Opcional)

Para validación manual profunda, ejecuta:

```bash
python "C:\Users\jaceb\Mis Desarrollos\Agentes\validar_proyecto.py" .
```

Esto ejecuta el validador Python completo que verifica:
- Paleta meskeIA correcta
- Logo oficial (no imagen externa)
- Footer oficial
- Formato español en código
- API keys NO hardcodeadas

---

## 🎓 Próximos Pasos

1. **Prueba la skill** con un proyecto simple
2. **Verifica el resultado** con el checklist
3. **Úsala en proyectos reales**
4. **Disfruta del 100% cumplimiento automático**

---

© 2025 meskeIA - Development Stack Skill
