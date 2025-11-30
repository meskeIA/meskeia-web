# Mapeo Completo de Apps meskeIA

**Fecha**: 2025-11-30
**Total apps**: 122
**Objetivo**: Analizar cada app para determinar categorías múltiples y posibles reorganizaciones

---

## Resumen Ejecutivo

### Estadísticas por Verbo/Acción

| Prefijo URL | Cantidad | Acción |
|-------------|----------|--------|
| `calculadora-` | 42 | Calcular |
| `generador-` | 18 | Generar/Crear |
| `conversor-` | 14 | Convertir |
| `simulador-` | 5 | Simular |
| `juego-` | 8 | Jugar |
| `cifrado-` | 5 | Cifrar |
| `curso-` | 4 | Aprender |
| `validador-` | 2 | Validar |
| `analizador-` | 2 | Analizar |
| `planificador-` | 2 | Planificar |
| `creador-` | 2 | Crear |
| `test-` | 3 | Evaluar |
| `lista-` | 2 | Organizar |
| Otros | 13 | Varios |

### Apps Claramente Multi-Categoría (28 apps)

Estas apps pertenecen genuinamente a 2+ categorías:

| App | Categoría Actual | También pertenece a |
|-----|------------------|---------------------|
| Calculadora IVA | Calculadoras | Finanzas, Emprendimiento |
| Calculadora Cocina | Calculadoras | Hogar, Salud |
| Lista de Compras | Calculadoras | Hogar, Productividad |
| Gasto Energético | Calculadoras | Hogar, Finanzas |
| Conversor Unidades | Física/Química | Calculadoras, Cocina |
| Temporizador Pomodoro | Productividad | Salud, Estudio |
| Generador QR | Productividad | Web/Tecnología, Marketing |
| Generador Códigos Barras | Productividad | Emprendimiento, Web |
| Generador Firma Email | Productividad | Emprendimiento, Marketing |
| Time Tracker | Productividad | Emprendimiento, Freelance |
| Conversor Horarios | Productividad | Viajes, Internacional |
| Información Tiempo | Productividad | Viajes, Día a día |
| Generador Contraseñas | Productividad | Seguridad, Web |
| Test Velocidad Escritura | Juegos | Productividad, Estudio |
| Curso Decisiones Inversión | Campus | Finanzas |
| Curso Emprendimiento | Campus | Emprendimiento |
| Curso NutriSalud | Campus/Salud | (duplicado actual) |
| Planificador Menú | Salud | Hogar, Cocina |
| Calculadora Porciones | Salud | Cocina |
| Generador UTM | Web/Tecnología | Marketing, SEO |
| Conversor Imágenes | Web/Tecnología | Diseño |
| Conversor Markdown | Texto | Web/Desarrollo |
| Conversor Binario | Texto | Web/Desarrollo, Criptografía |
| Generador Lorem Ipsum | Texto | Diseño, Desarrollo |
| Conversor Morse | Texto | Nostálgico/Histórico |
| Conversor Braille | Texto | Accesibilidad |
| Conversor Números Romanos | Texto | Nostálgico/Histórico |
| Simulador Gastos Deducibles | Emprendimiento | Fiscalidad |

---

## Categorías Propuestas (Nueva Estructura)

### Opción A: Mantener 14 + Añadir 4 nuevas

**Nuevas categorías sugeridas:**

1. **🏠 Hogar y Vida Doméstica**
   - Calculadora de Cocina
   - Lista de Compras
   - Gasto Energético
   - Planificador Menú
   - Calculadora Porciones

2. **🕰️ Nostálgico / Histórico**
   - Conversor Morse
   - Conversor Braille
   - Conversor Números Romanos
   - Cifrados Clásicos (César, Vigenère, Playfair, Transposición)

3. **✈️ Viajes e Internacional**
   - Conversor Horarios
   - Información del Tiempo
   - Conversor de Tallas (EU/UK/US)

4. **📊 Fiscalidad (separar de Finanzas)**
   - Simulador IRPF
   - Calculadora IVA
   - Calculadora Plusvalías
   - Donaciones (Cataluña + Nacional)
   - Sucesiones (Cataluña + Nacional)
   - Gastos Deducibles

### Opción B: Reorganizar en 12 categorías por ACCIÓN

1. **Calcular** - Todas las calculadoras
2. **Convertir** - Todos los conversores
3. **Generar** - Todos los generadores
4. **Simular** - Simuladores financieros
5. **Cifrar** - Criptografía completa
6. **Aprender** - Cursos y educativo
7. **Jugar** - Juegos
8. **Planificar** - Menús, horarios, tareas
9. **Analizar** - SEO, estadísticas
10. **Validar** - JSON, RegEx, contraste
11. **Diseñar** - Colores, tipografías, sombras
12. **Organizar** - Listas, notas, hábitos

---

## Mapeo Detallado por App (122 apps)

### FINANZAS Y FISCALIDAD (16 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 1 | Simulador Hipoteca | /simulador-hipoteca/ | Simular | Hogar, Banco | ❌ |
| 2 | Calculadora Jubilación | /calculadora-jubilacion/ | Calcular | Futuro, Ahorro | ❌ |
| 3 | Calculadora Inversiones | /calculadora-inversiones/ | Calcular | Ahorro, Bolsa | ❌ |
| 4 | Interés Compuesto | /interes-compuesto/ | Calcular | Ahorro, Inversión | ❌ |
| 5 | Test Perfil Inversor | /test-perfil-inversor/ | Evaluar | Inversión | ❌ |
| 6 | Control de Gastos | /control-gastos/ | Organizar | Hogar, Personal | ⚠️ Hogar |
| 7 | Simulador IRPF | /simulador-irpf/ | Simular | Fiscal | ⚠️ Fiscalidad |
| 8 | Donaciones Cataluña | /calculadora-donaciones-cataluna/ | Calcular | Fiscal | ⚠️ Fiscalidad |
| 9 | Donaciones Nacional | /calculadora-donaciones-nacional/ | Calcular | Fiscal | ⚠️ Fiscalidad |
| 10 | Sucesiones Cataluña | /calculadora-sucesiones-cataluna/ | Calcular | Fiscal | ⚠️ Fiscalidad |
| 11 | Sucesiones Nacional | /calculadora-sucesiones-nacional/ | Calcular | Fiscal | ⚠️ Fiscalidad |
| 12 | TIR-VAN | /calculadora-tir-van/ | Calcular | Inversión, Negocio | ⚠️ Emprendimiento |
| 13 | Plusvalías IRPF | /calculadora-plusvalias-irpf/ | Calcular | Fiscal, Inversión | ⚠️ Fiscalidad |
| 14 | Simulador Préstamos | /simulador-prestamos/ | Simular | Banco | ❌ |
| 15 | Amortización Hipoteca | /amortizacion-hipoteca/ | Calcular | Hogar, Banco | ⚠️ Hogar |
| 16 | Calculadora Inflación | /calculadora-inflacion/ | Calcular | Economía | ❌ |

**Observaciones Finanzas:**
- 6 apps son claramente FISCALES (IRPF, IVA, donaciones, sucesiones, plusvalías)
- 2 apps también aplican a HOGAR (Control gastos, Amortización)
- 1 app también aplica a EMPRENDIMIENTO (TIR-VAN)

---

### CALCULADORAS Y UTILIDADES (10 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 17 | Calculadora Propinas | /calculadora-propinas/ | Calcular | Restaurante, Social | ❌ |
| 18 | Calculadora IVA | /calculadora-iva/ | Calcular | Fiscal, Negocio | ✅ Fiscalidad, Emprendimiento |
| 19 | Calculadora Descuentos | /calculadora-descuentos/ | Calcular | Compras, Ahorro | ⚠️ Hogar |
| 20 | Calculadora Porcentajes | /calculadora-porcentajes/ | Calcular | Matemáticas, General | ❌ |
| 21 | Regla de Tres | /calculadora-regla-de-tres/ | Calcular | Matemáticas, Estudio | ⚠️ Matemáticas |
| 22 | Calculadora Fechas | /calculadora-fechas/ | Calcular | Tiempo, Planificación | ❌ |
| 23 | Conversor Tallas | /conversor-tallas/ | Convertir | Compras, Viajes | ✅ Viajes |
| 24 | Calculadora Cocina | /calculadora-cocina/ | Convertir | Hogar, Recetas | ✅ Hogar, Salud |
| 25 | Lista de Compras | /lista-compras/ | Organizar | Hogar, Supermercado | ✅ Hogar |
| 26 | Gasto Energético | /calculadora-gasto-energetico/ | Calcular | Hogar, Ahorro | ✅ Hogar, Finanzas |

**Observaciones Calculadoras:**
- Esta categoría ES un cajón de sastre
- 4 apps pertenecen claramente a HOGAR
- 1 app es más de MATEMÁTICAS (Regla de Tres)
- 1 app es FISCAL (IVA)

---

### MATEMÁTICAS Y ESTADÍSTICA (11 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 27 | Calculadora Probabilidad | /calculadora-probabilidad/ | Calcular | Estudio | ❌ |
| 28 | MCD y MCM | /calculadora-mcd-mcm/ | Calcular | Estudio | ❌ |
| 29 | Calculadora Estadística | /calculadora-estadistica/ | Calcular | Estudio, Datos | ❌ |
| 30 | Matemática Avanzada | /calculadora-matematica/ | Calcular | Estudio | ❌ |
| 31 | Ecuaciones | /algebra-ecuaciones/ | Resolver | Estudio | ❌ |
| 32 | Geometría | /calculadora-geometria/ | Calcular | Estudio | ❌ |
| 33 | Cálculo | /calculadora-calculo/ | Calcular | Estudio | ❌ |
| 34 | Trigonometría | /calculadora-trigonometria/ | Calcular | Estudio | ❌ |
| 35 | Teoría de Números | /calculadora-teoria-numeros/ | Calcular | Estudio | ❌ |
| 36 | Álgebra Abstracta | /calculadora-algebra-abstracta/ | Calcular | Estudio | ❌ |
| 37 | Teoría de Colas | /calculadora-teoria-colas/ | Calcular | Estudio, Negocio | ⚠️ Emprendimiento |

**Observaciones Matemáticas:**
- Categoría muy cohesiva, casi todas son para ESTUDIO
- Teoría de Colas tiene aplicación en NEGOCIO (optimización)

---

### FÍSICA Y QUÍMICA (5 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 38 | Calculadora Movimiento | /calculadora-movimiento/ | Calcular | Estudio | ❌ |
| 39 | Tabla Periódica | /tabla-periodica/ | Consultar | Estudio | ❌ |
| 40 | Glosario Física/Química | /glosario-fisica-quimica/ | Aprender | Estudio | ⚠️ Campus |
| 41 | Calculadora Electricidad | /calculadora-electricidad/ | Calcular | Estudio, Hogar | ⚠️ Hogar |
| 42 | Conversor Unidades | /conversor-unidades/ | Convertir | General, Cocina | ✅ Calculadoras, Cocina |

**Observaciones Física/Química:**
- Conversor de Unidades es MUY general, debería estar más accesible
- Calculadora Electricidad tiene uso doméstico (instalaciones)

---

### HERRAMIENTAS DE PRODUCTIVIDAD (11 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 43 | Notas | /notas/ | Organizar | Trabajo, Personal | ❌ |
| 44 | Temporizador Pomodoro | /temporizador-pomodoro/ | Gestionar | Trabajo, Estudio | ✅ Salud, Campus |
| 45 | Lista de Tareas | /lista-tareas/ | Organizar | Trabajo, Personal | ❌ |
| 46 | Cronómetro | /cronometro/ | Medir | General | ❌ |
| 47 | Conversor Horarios | /conversor-horarios/ | Convertir | Viajes, Trabajo | ✅ Viajes |
| 48 | Información Tiempo | /informacion-tiempo/ | Consultar | Viajes, Día a día | ✅ Viajes |
| 49 | Generador Contraseñas | /generador-contrasenas/ | Generar | Seguridad | ✅ Seguridad |
| 50 | Generador QR | /generador-qr/ | Generar | Marketing, Web | ✅ Web, Marketing |
| 51 | Generador Códigos Barras | /generador-codigos-barras/ | Generar | Negocio, Inventario | ✅ Emprendimiento |
| 52 | Generador Firma Email | /generador-firma-email/ | Generar | Trabajo, Marketing | ✅ Emprendimiento, Marketing |
| 53 | Time Tracker | /time-tracker/ | Registrar | Trabajo, Freelance | ✅ Emprendimiento |

**Observaciones Productividad:**
- Es la categoría más heterogénea
- 7 de 11 apps pertenecen también a otras categorías
- Mezcla: tiempo, generadores, consultas, organización

---

### JUEGOS Y ENTRETENIMIENTO (9 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 54 | Test Velocidad Escritura | /test-velocidad-escritura/ | Evaluar | Productividad, Estudio | ✅ Productividad |
| 55 | Radio meskeIA | /radio-meskeia/ | Escuchar | Ocio | ❌ |
| 56 | Wordle | /juego-wordle/ | Jugar | Ocio, Idiomas | ⚠️ Idiomas |
| 57 | Sudoku | /juego-sudoku/ | Jugar | Ocio, Mental | ❌ |
| 58 | Tres en Raya | /juego-tres-en-raya/ | Jugar | Ocio | ❌ |
| 59 | Memoria | /juego-memoria/ | Jugar | Ocio, Mental | ❌ |
| 60 | Piedra Papel Tijera | /juego-piedra-papel-tijera/ | Jugar | Ocio | ❌ |
| 61 | 2048 | /juego-2048/ | Jugar | Ocio, Mental | ❌ |
| 62 | Puzzle Matemático | /juego-puzzle-matematico/ | Jugar | Ocio, Matemáticas | ⚠️ Matemáticas |

**Observaciones Juegos:**
- Categoría bastante cohesiva
- Test Velocidad más de productividad que juego
- Wordle podría estar en "Idiomas" si existiera

---

### CAMPUS DIGITAL (5 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 63 | Calculadora Notas | /calculadora-notas/ | Calcular | Estudio | ❌ |
| 64 | Generador Horarios Estudio | /generador-horarios-estudio/ | Planificar | Estudio | ❌ |
| 65 | Creador Flashcards | /creador-flashcards/ | Crear | Estudio, Memorizar | ❌ |
| 66 | Curso Decisiones Inversión | /curso-decisiones-inversion/ | Aprender | Finanzas | ✅ Finanzas |
| 67 | Curso Emprendimiento | /curso-emprendimiento/ | Aprender | Negocio | ✅ Emprendimiento |

**Observaciones Campus:**
- Los cursos tienen doble pertenencia clara
- ¿Debería existir esta categoría o integrar con otras?

---

### SALUD & BIENESTAR (9 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 68 | Calculadora IMC | /calculadora-imc/ | Calcular | Salud | ❌ |
| 69 | Calculadora Calorías | /calculadora-calorias-ejercicio/ | Calcular | Ejercicio | ❌ |
| 70 | Calculadora Hidratación | /calculadora-hidratacion/ | Calcular | Salud | ❌ |
| 71 | Calculadora Sueño | /calculadora-sueno/ | Calcular | Bienestar | ❌ |
| 72 | Curso NutriSalud | /curso-nutrisalud/ | Aprender | Nutrición | ⚠️ Ya está en Campus también |
| 73 | Seguimiento Hábitos | /seguimiento-habitos/ | Registrar | Bienestar | ❌ |
| 74 | Planificador Menú | /planificador-menu/ | Planificar | Cocina, Hogar | ✅ Hogar |
| 75 | Calculadora Porciones | /calculadora-porciones/ | Medir | Cocina | ✅ Hogar, Cocina |
| 76 | Test Hábitos | /test-habitos/ | Evaluar | Bienestar | ❌ |

**Observaciones Salud:**
- 2 apps relacionadas con COCINA/HOGAR
- NutriSalud duplicado (está en Campus también)

---

### HERRAMIENTAS WEB Y TECNOLOGÍA (5 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 77 | Validador JSON | /validador-json/ | Validar | Desarrollo | ❌ |
| 78 | Generador Iconos PWA | /generador-iconos/ | Generar | Desarrollo | ❌ |
| 79 | Generador UTM | /generador-utm/ | Generar | Marketing | ✅ Marketing, SEO |
| 80 | Validador RegEx | /validador-regex/ | Validar | Desarrollo | ❌ |
| 81 | Conversor Imágenes | /conversor-imagenes/ | Convertir | Diseño, Web | ✅ Diseño |

**Observaciones Web:**
- Categoría muy técnica (desarrolladores)
- UTM es más de MARKETING
- Conversor Imágenes también es de DISEÑO

---

### TEXTO Y DOCUMENTOS (12 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 82 | Contador Palabras | /contador-palabras/ | Analizar | Escritura, SEO | ⚠️ SEO |
| 83 | Conversor Texto | /conversor-texto/ | Convertir | Escritura | ❌ |
| 84 | Limpiador Texto | /limpiador-texto/ | Limpiar | Escritura | ❌ |
| 85 | Comparador Textos | /comparador-textos/ | Comparar | Escritura, Desarrollo | ⚠️ Desarrollo |
| 86 | Conversor Markdown | /conversor-markdown-html/ | Convertir | Desarrollo | ✅ Desarrollo |
| 87 | Conversor Morse | /conversor-morse/ | Convertir | Histórico | ✅ Nostálgico |
| 88 | Conversor Números Romanos | /conversor-numeros-romanos/ | Convertir | Histórico | ✅ Nostálgico |
| 89 | Detector Idioma | /detector-idioma/ | Detectar | Idiomas | ⚠️ Idiomas |
| 90 | Conversor Binario | /conversor-binario/ | Convertir | Desarrollo | ✅ Desarrollo, Criptografía |
| 91 | Conversor Braille | /conversor-braille/ | Convertir | Accesibilidad | ✅ Accesibilidad |
| 92 | Generador Anagramas | /generador-anagramas/ | Generar | Juegos, Idiomas | ⚠️ Juegos |
| 93 | Generador Lorem Ipsum | /generador-lorem-ipsum/ | Generar | Desarrollo, Diseño | ✅ Desarrollo, Diseño |

**Observaciones Texto:**
- Categoría muy diversa
- 3 apps son claramente NOSTÁLGICAS (Morse, Romanos, Braille)
- 3 apps son más de DESARROLLO
- Anagramas podría ser JUEGO

---

### CRIPTOGRAFÍA Y SEGURIDAD (7 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 94 | Cifrado Clásico | /cifrado-clasico/ | Cifrar | Histórico | ✅ Nostálgico |
| 95 | Cifrado Vigenère | /cifrado-vigenere/ | Cifrar | Histórico | ✅ Nostálgico |
| 96 | Cifrado Transposición | /cifrado-transposicion/ | Cifrar | Histórico | ✅ Nostálgico |
| 97 | Cifrado Playfair | /cifrado-playfair/ | Cifrar | Histórico | ✅ Nostálgico |
| 98 | Cifrado AES | /cifrado-aes/ | Cifrar | Seguridad real | ❌ |
| 99 | Generador Hashes | /generador-hashes/ | Generar | Desarrollo, Seguridad | ⚠️ Desarrollo |
| 100 | Codificador Base64 | /codificador-base64/ | Codificar | Desarrollo | ✅ Desarrollo |

**Observaciones Criptografía:**
- 4 cifrados son HISTÓRICOS/NOSTÁLGICOS (educativos)
- Solo AES es seguridad real
- Hashes y Base64 son más de DESARROLLO

---

### CREATIVIDAD Y DISEÑO (7 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 101 | Conversor Colores | /conversor-colores/ | Convertir | Diseño, Desarrollo | ❌ |
| 102 | Calculadora Contraste | /contraste-colores/ | Validar | Accesibilidad | ✅ Accesibilidad |
| 103 | Generador Gradientes | /generador-gradientes/ | Generar | Diseño, Desarrollo | ❌ |
| 104 | Generador Sombras | /generador-sombras/ | Generar | Diseño, Desarrollo | ❌ |
| 105 | Calculadora Aspectos | /calculadora-aspectos/ | Calcular | Redes Sociales, Diseño | ⚠️ Marketing |
| 106 | Generador Tipografías | /generador-tipografias/ | Generar | Diseño, Desarrollo | ❌ |
| 107 | Creador Paletas | /creador-paletas/ | Crear | Diseño | ❌ |

**Observaciones Diseño:**
- Categoría cohesiva
- Calculadora Aspectos tiene uso en MARKETING (redes sociales)
- Contraste es de ACCESIBILIDAD

---

### EMPRENDIMIENTO Y NEGOCIOS (6 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 108 | Tarifa Freelance | /calculadora-tarifa-freelance/ | Calcular | Freelance | ❌ |
| 109 | Break-Even | /calculadora-break-even/ | Calcular | Negocio | ❌ |
| 110 | Planificador Cash Flow | /planificador-cashflow/ | Planificar | Negocio, Finanzas | ⚠️ Finanzas |
| 111 | ROI Marketing | /calculadora-roi-marketing/ | Calcular | Marketing | ✅ Marketing |
| 112 | Generador Nombres | /generador-nombres-empresa/ | Generar | Startup | ❌ |
| 113 | Gastos Deducibles | /simulador-gastos-deducibles/ | Simular | Fiscal, Autónomo | ✅ Fiscalidad |

**Observaciones Emprendimiento:**
- 2 apps son claramente FISCALES
- 1 app es de MARKETING
- Solapamiento significativo con Finanzas

---

### SEO & MARKETING (8 apps)

| # | App | URL | Verbo | Contextos | Multi-cat? |
|---|-----|-----|-------|-----------|------------|
| 114 | Meta Descripciones | /generador-meta-descripciones/ | Generar | SEO | ❌ |
| 115 | Analizador Densidad | /analizador-densidad-seo/ | Analizar | SEO | ❌ |
| 116 | Palabras Clave | /generador-palabras-clave/ | Generar | SEO | ❌ |
| 117 | Generador Hashtags | /generador-hashtags/ | Generar | Redes Sociales | ⚠️ Marketing |
| 118 | Analizador Títulos | /analizador-titulos-seo/ | Analizar | SEO | ❌ |
| 119 | Calculadora Legibilidad | /calculadora-legibilidad/ | Calcular | Escritura, SEO | ⚠️ Texto |
| 120 | Tiempo de Lectura | /calculadora-tiempo-lectura/ | Calcular | Escritura, SEO | ⚠️ Texto |
| 121 | Schema Markup | /generador-schema-markup/ | Generar | SEO, Desarrollo | ⚠️ Desarrollo |

**Observaciones SEO:**
- Categoría nueva y cohesiva
- 2 apps (Legibilidad, Tiempo Lectura) también de TEXTO
- Hashtags es más redes sociales que SEO puro

---

## Nuevas Categorías Sugeridas

Basándome en el análisis, estas serían las categorías nuevas más justificadas:

### 1. 🏠 Hogar y Vida Doméstica (8 apps)

| App | Viene de |
|-----|----------|
| Calculadora Cocina | Calculadoras |
| Lista de Compras | Calculadoras |
| Gasto Energético | Calculadoras |
| Planificador Menú | Salud |
| Calculadora Porciones | Salud |
| Control de Gastos | Finanzas |
| Amortización Hipoteca | Finanzas |
| Calculadora Electricidad | Física |

### 2. 🕰️ Nostálgico y Educativo Histórico (8 apps)

| App | Viene de |
|-----|----------|
| Conversor Morse | Texto |
| Conversor Braille | Texto |
| Conversor Números Romanos | Texto |
| Cifrado Clásico (César) | Criptografía |
| Cifrado Vigenère | Criptografía |
| Cifrado Transposición | Criptografía |
| Cifrado Playfair | Criptografía |
| Tabla Periódica | Física |

### 3. 📋 Fiscalidad Española (8 apps)

| App | Viene de |
|-----|----------|
| Simulador IRPF | Finanzas |
| Calculadora IVA | Calculadoras |
| Calculadora Plusvalías | Finanzas |
| Donaciones Cataluña | Finanzas |
| Donaciones Nacional | Finanzas |
| Sucesiones Cataluña | Finanzas |
| Sucesiones Nacional | Finanzas |
| Gastos Deducibles | Emprendimiento |

### 4. ✈️ Viajes e Internacional (3 apps)

| App | Viene de |
|-----|----------|
| Conversor Horarios | Productividad |
| Información del Tiempo | Productividad |
| Conversor Tallas | Calculadoras |

---

## Resumen de Decisiones Pendientes

### Preguntas para decidir:

1. **¿Crear nuevas categorías o usar multi-categoría?**
   - Si creamos Hogar, Fiscalidad, Nostálgico → movemos apps
   - Si usamos multi-categoría → apps aparecen en varios sitios

2. **¿Qué hacer con "Calculadoras y Utilidades"?**
   - Es un cajón de sastre
   - Opciones: eliminarla y redistribuir, o renombrarla a "Día a día"

3. **¿Qué hacer con "Productividad"?**
   - Muy heterogénea (generadores, tiempo, organización)
   - Opciones: dividirla o aceptar que es "trabajo/oficina"

4. **¿Los cursos van en Campus o en su tema?**
   - Curso Inversión → ¿Campus o Finanzas?
   - Curso Emprendimiento → ¿Campus o Emprendimiento?
   - Curso NutriSalud → ¿Campus o Salud? (actualmente duplicado)

5. **¿Separar Fiscalidad de Finanzas?**
   - Finanzas = dinero personal (hipoteca, inversiones, ahorro)
   - Fiscalidad = impuestos españoles (IRPF, IVA, sucesiones)

---

## Próximos Pasos Recomendados

1. **Decisión conceptual**: ¿Qué modelo seguimos?
   - A) Categorías únicas (mover apps)
   - B) Multi-categoría (apps en varios sitios)
   - C) Híbrido (categorías + tags visibles)

2. **Si elegimos B o C**: Implementar campo `categories: string[]`

3. **Revisar nombres de URLs**: Apps sin prefijo estándar
   - `/notas/` → `/organizador-notas/`
   - `/cronometro/` → `/temporizador-cronometro/`
   - `/interes-compuesto/` → `/calculadora-interes-compuesto/`
   - `/radio-meskeia/` → `/reproductor-radio/`

4. **Definir lista maestra de "contextos"** (si vamos por tags):
   - hogar, trabajo, estudio, ocio, viajes, desarrollo, diseño, etc.

