/**
 * Lista de aplicaciones IMPLEMENTADAS en meskeIA Next.js
 *
 * IMPORTANTE: Esta lista debe coincidir con las carpetas en app/
 * Solo añadir URLs cuando la app esté realmente creada
 *
 * Actualizado: 2026-02-06
 */

export const implementedAppsUrls = [
  // Finanzas (apps universales, sin normativa española)
  "/estimador-inflacion/",
  "/visualizador-dinero-y-tiempo/",
  "/visualizador-sueldo-neto/",
  "/visualizador-anatomia-nomina/",
  "/visualizador-viaje-impuestos/",
  "/visualizador-envejecimiento-cuerpo/",
  "/visualizador-precio-real-cosas/",
  "/visualizador-jubilacion-perspectiva/",
  "/visualizador-mapa-tiempo/",
  "/visualizador-sesgos-cognitivos/",
  "/visualizador-huella-alimentos/",
  "/visualizador-factura-electrica/",
  "/visualizador-escalas-tiempo/",
  "/estimador-tir-van/",
  "/control-gastos/",
  "/estimador-interes-compuesto/",
  "/estimador-hipoteca/",
  "/estimador-compraventa-inmueble/", // Gastos de compraventa: ITP/IVA, notaría, registro, plusvalía
  "/estimador-prestamos/",           // Compara sistemas francés, alemán, americano
  "/amortizacion-hipoteca/",         // Amortización anticipada: reducir cuota vs plazo
  "/orientador-deduccion-obras-energeticas/", // Orientador deducciones IRPF 20/40/60% por obras mejora energética vivienda
  "/simulador-jubilacion-publica/",     // Simulador completo: edad, pensión, anticipada y parcial (unifica 4 apps)
  "/planificador-ahorro-jubilacion/",    // Planificador completo: brecha, ahorro, plan pensiones y proyección (unifica 3 apps)
  "/estimador-irpf-pensionista/",       // IRPF pensionista: reducción RRT, mínimo personal edad, pensión neta mensual
  "/adaptacion-hogar/",                 // Checklist adaptaciones del hogar: costes, prioridades y ayudas públicas
  "/residencia-vs-cuidado-en-casa/",    // Comparativa costes residencia / SAD / cuidador en casa
  "/estimador-riesgo-osteoporosis/",    // Test validado (FRAX/IOF) de riesgo de osteoporosis
  "/estimador-pension-viudedad/",        // Estimador Pensión de Viudedad: 52/60/70%, base reguladora, mínimos garantizados
  "/estimador-legitimas/",              // Estimador de Legítimas: herencia forzosa por CCAA (CC + 6 derechos forales)
  "/optimizador-rentas-60/",            // Optimizador de Rentas 60+: estrategia IRPF pensión + PP + ahorro + alquiler
  "/test-fragilidad/",                  // Test de Fragilidad (Escala FRAIL): 5 ítems, 3 niveles (robusto/pre-frágil/frágil)
  "/orientador-grado-dependencia/",     // Orientador Grado de Dependencia BVD: Grado I/II/III + prestaciones SAAD
  "/estimacion-prestaciones-dependencia/", // Estimación prestaciones SAAD por grado: cuantías, servicios, copago
  "/planificador-turnos-cuidadores/",      // Planificador de turnos de cuidadores: calendario semanal con reparto equitativo
  "/test-zarit-cuidador/",                 // Test de Zarit: escala 22 ítems sobrecarga del cuidador
  "/estimacion-deduccion-discapacidad/",   // Estimación deducción IRPF por discapacidad: mínimos personales y familiares
  "/checklist-tramites-dependencia/",      // Checklist trámites dependencia: 6 fases, documentación, plazos
  "/diario-emocional/",                     // Diario emocional visual: registro ánimo diario, patrones, localStorage
  "/test-bienestar-who5/",                 // Test bienestar WHO-5: escala OMS 5 preguntas, 4 niveles, recursos ayuda
  "/planificador-estudio-oposiciones/",     // Planificador estudio oposiciones: distribuir temas, repasos espaciados
  "/orientador-tipo-oposicion/",           // Orientador tipo oposición: test 8 preguntas, 16 oposiciones, filtrado por perfil
  "/simulador-paga-ahorro/",               // Simulador paga y ahorro: gestión paga semanal/mensual, objetivos visuales
  "/juego-presupuesto-mensual/",           // Juego presupuesto mensual: 3 perfiles, 6 escenarios, lecciones financieras
  "/estimador-tiempo-ahorro/",             // ¿Cuánto tardo en ahorrar?: objetivo + ahorro mensual = plazo
  "/quiz-conceptos-financieros/",          // Quiz 15 preguntas: ahorro, inflación, inversión, deuda, presupuesto
  "/selector-actividades-movilidad/",      // Selector actividades según movilidad: test 8 preguntas, 20 actividades, 4 niveles
  "/estimador-complemento-minimos/",      // Estimador complemento a mínimos: pensiones mínimas SS por tipo, edad, situación
  "/estimador-costas-judiciales/",        // Estimador costas judiciales: abogado, procurador, tasas, peritos
  "/estimador-costes-divorcio/",          // Estimador costes divorcio: mutuo acuerdo vs contencioso
  "/orientador-justicia-gratuita/",       // Orientador justicia gratuita: requisitos IPREM, prestaciones
  "/estimador-inversiones/",
  "/test-perfil-inversor/",
  "/estimador-cartera-inversion/",    // Monte Carlo, Sharpe, volatilidad
  "/calculadora-suscripciones/",      // Control de suscripciones recurrentes
  "/calculadora-roommates/",          // División gastos piso compartido
  "/estimador-fondo-emergencia/",   // Cuánto ahorrar como colchón de seguridad
  "/orientador-regla-50-30-20/",     // Distribución presupuesto 50/30/20
  "/estimador-fire/",               // Independencia financiera, retiro anticipado
  "/orientador-alquiler-vs-compra/", // Análisis alquiler vs compra vivienda
  "/estimador-coste-plazos/",       // Coste real financiación a plazos, TAE oculta
  "/estimador-deuda/",              // Método bola de nieve vs avalancha
  "/comparador-vehiculos/",           // Comparador: contado vs financiación vs renting vs leasing
  "/estimador-coste-vivienda/",     // Coste real mensual de mantener vivienda
  "/orientador-seguro-vida/",          // Necesidades de seguro de vida para proteger a la familia
  "/comparador-tipos-seguros/",         // Guía educativa: tipos de seguros vida, auto, hogar, salud
  "/checklist-coberturas-seguros/",     // Qué seguros necesitas según tu perfil
  "/estimador-infraseguro/",          // Regla proporcional: cuánto cobras si tienes infraseguro
  "/guia-reclamar-seguro-coche/",       // Guía: cuándo reclamar al seguro del coche
  "/asistente-reclamaciones/",          // Asistente reclamaciones consumidor: derechos, plazos, OMIC

  // Calculadoras y Utilidades (14 implementadas)
  "/calculadora-propinas/",
  "/calculadora-iva/",
  "/calculadora-descuentos/",
  "/calculadora-porcentajes/",
  "/calculadora-fechas/",
  "/calculadora-regla-de-tres/",
  "/calculadora-cocina/",
  "/lista-compras/",
  "/conversor-tallas/",
  "/calculadora-gasto-energetico/",
  "/calculadora-pintura/",           // Calcular litros de pintura
  "/calculadora-combustible/",       // Consumo L/100km y coste viajes
  "/calculadora-edad-mascotas/",     // Edad perros/gatos en años humanos
  "/planificador-boda/",             // Wedding planner: checklist, presupuesto, timeline
  "/planificador-mudanzas/",         // Mudanza: tareas, inventario, presupuesto
  "/estimador-reformas-hogar/",    // Reformas: presupuesto estimado por tipo y m²
  "/calculadora-huella-carbono/",    // Huella de carbono personal

  // Matemáticas y Estadística (13 implementadas)
  "/algebra-ecuaciones/",            // Calculadora de Ecuaciones
  "/calculadora-mcd-mcm/",
  "/calculadora-probabilidad/",
  "/calculadora-estadistica/",
  "/estadistica-avanzada/",
  "/calculadora-distribuciones/",    // Distribuciones: Normal, Poisson, Exponencial, etc.
  "/inferencia-bayesiana/",          // Teorema de Bayes, tests diagnósticos
  "/calculadora-matematica/",
  "/calculadora-geometria/",
  "/calculadora-calculo/",
  "/calculadora-trigonometria/",
  "/calculadora-teoria-numeros/",
  "/calculadora-algebra-abstracta/",
  "/calculadora-teoria-colas/",

  // Herramientas de Productividad (16 implementadas)
  "/time-tracker/",
  "/calculadora-productividad/",  // Productividad real: ingresos por hora efectiva
  "/matriz-eisenhower/",          // Matriz urgente/importante para priorizar tareas
  "/planificador-turnos/",
  "/notas/",
  "/generador-contrasenas/",
  "/generador-gitignore/",        // Plantillas .gitignore para Node, Python, Java, React+
  "/lista-tareas/",
  "/cronometro/",
  "/temporizador-pomodoro/",       // Técnica Pomodoro con estadísticas
  "/conversor-horarios/",
  "/generador-qr/",
  "/generador-codigos-barras/",
  "/informacion-tiempo/",
  "/generador-firma-email/",
  "/lista-equipaje/",              // Checklist personalizado de viaje
  "/conversor-divisas/",           // Conversor de divisas con tipos BCE (30+ divisas, actualización diaria)
  "/presupuesto-viaje/",           // Calculadora de presupuesto de viaje con división de gastos en grupo
  "/enchufes-por-pais/",          // Qué enchufe y adaptador necesitas en cada país (60+ países)
  "/comparador-coste-vida/",      // Coste de vida en 55+ ciudades del mundo: alquiler, comida, transporte e internet
  "/generador-actas/",             // Generador de actas de reunión profesionales
  "/prueba-camara/",               // Test de webcam con captura de fotos
  "/prueba-microfono/",            // Test de micrófono con grabación de audio
  "/luxometro/",                   // Luxómetro/fotómetro para medir intensidad de luz
  "/golden-hour/",                 // Calculadora hora dorada y azul para fotografía
  "/sonometro/",                   // Sonómetro/decibelímetro para medir nivel de ruido
  "/metronomo/",                   // Metrónomo online con tap tempo
  "/mi-ip/",                       // IP pública, geolocalización, ISP, conexión
  "/analizador-espectro/",         // Analizador de espectro de audio FFT
  "/nivel-burbuja/",               // Nivel de burbuja digital + inclinómetro
  "/contador-manual/",             // Tally counter digital múltiple
  "/diapason/",                    // Diapasón digital La 440Hz
  "/generador-tonos/",             // Generador de frecuencias de audio
  "/afinador-instrumentos/",       // Afinador cromático para instrumentos
  "/lupa-digital/",                // Lupa digital con zoom y filtros
  "/espejo/",                      // Espejo digital con cámara frontal

  // Texto y Documentos (14 implementadas)
  "/contador-palabras/",
  "/conversor-texto/",
  "/limpiador-texto/",
  "/comparador-textos/",
  "/conversor-markdown-html/",
  "/conversor-morse/",
  "/conversor-numeros-romanos/",
  "/detector-idioma/",
  "/conversor-binario/",
  "/conversor-braille/",
  "/generador-anagramas/",
  "/generador-lorem-ipsum/",    // Generador de texto de prueba
  "/contador-silabas/",         // Separar y contar sílabas en español
  "/conversor-formatos/",       // JSON, CSV, Excel, XML, YAML
  "/conjugador-verbos/",        // Conjugador de verbos español con irregulares
  "/tablas-multiplicar/",       // Entrenador tablas multiplicar gamificado

  // Criptografía y Seguridad (7 implementadas)
  "/cifrado-clasico/",          // César + ROT13 + Atbash
  "/cifrado-vigenere/",         // Cifrado polialfabético con clave
  "/cifrado-transposicion/",    // Columnas, Rail Fence, Escítala
  "/cifrado-playfair/",         // Matriz 5x5, digramas
  "/cifrado-aes/",              // AES-256 GCM/CBC moderno
  "/generador-hashes/",         // MD5, SHA-256, SHA-512
  "/codificador-base64/",       // Base64, URL encode, Hexadecimal

  // Juegos y Entretenimiento (15 implementadas)
  "/test-velocidad-escritura/",
  "/juego-piedra-papel-tijera/",
  "/juego-tres-en-raya/",
  "/juego-memoria/",
  "/juego-2048/",
  "/juego-wordle/",
  "/juego-sudoku/",
  "/juego-puzzle-matematico/",
  "/radio-meskeia/",
  "/juego-asteroids/",          // Arcade clásico espacial
  "/juego-space-invaders/",     // Arcade clásico de invasores
  "/juego-platform-runner/",    // Juego de plataformas
  "/ruleta-aleatoria/",         // Ruleta personalizable para sorteos
  "/generador-loteria/",        // Números para Primitiva, Euromillones, Bonoloto
  "/cara-o-cruz/",              // Lanza moneda con animación y estadísticas
  "/tirador-dados/",            // Dados virtuales para rol y juegos de mesa

  // Salud y Bienestar (15 implementadas)
  "/orientador-imc/",
  "/orientador-colesterol/",         // Colesterol: ratios, Friedewald, riesgo cardiovascular
  "/calculadora-calorias-ejercicio/",
  "/calculadora-macros/",             // Macronutrientes: proteínas, carbos, grasas según objetivo
  "/calculadora-hidratacion/",
  "/calculadora-sueno/",
  "/seguimiento-habitos/",
  "/planificador-menu/",
  "/calculadora-porciones/",
  "/test-habitos-saludables/",
  "/planificador-embarazo/",         // Planificador embarazo: FPP, checklist, compras, vacunas
  "/estimacion-prestacion-nacimiento/",  // Estimación prestación SS por nacimiento: cuantía, duración, requisitos
  "/estimacion-baja-maternal/",          // Estimación baja maternal/paternal: 16 semanas, distribución, extras
  "/planificador-gastos-bebe/",          // Planificador gastos primer año bebé: 10 categorías, 3 niveles
  "/estimacion-deduccion-maternidad/",   // Estimación deducción maternidad IRPF: 1.200€ + guardería
  "/test-estilo-parental/",              // Test estilo parental: Baumrind, 4 estilos, autoconocimiento
  "/planificador-mascota/",          // Planificador mascota: cachorro/gatito, checklist, compras, vacunas
  "/calculadora-alimentacion-mascotas/", // Alimentación perros/gatos: raciones, tóxicos, transición pienso
  "/orientador-medicamentos-mascotas/", // Medicamentos mascotas: antiparasitarios, frecuencia, síntomas
  "/calculadora-tamano-adulto-perro/",   // Predicción peso adulto cachorros
  "/orientador-percentiles/",       // Percentiles peso/talla infantil OMS

  // Herramientas Web y Tecnología (6 implementadas)
  "/validador-json/",
  "/conversor-base64/",
  "/generador-utm/",
  "/validador-regex/",
  "/conversor-imagenes/",
  "/compresor-imagenes/",       // Compresor de imágenes por lotes sin límites
  "/recortador-audio/",        // Recortador de audio con fade in/out
  "/extractor-audio-video/",   // Extractor de audio de vídeo (AVI, MP4 → MP3/WAV) — procesamiento local
  "/generador-ondas/",         // Generador de ondas y visualizador de audio
  "/generador-iconos/",
  "/editor-exif/",             // Editor EXIF: visualiza y elimina metadatos de fotos

  // Creatividad y Diseño (7 implementadas)
  "/calculadora-aspectos/",
  "/conversor-colores/",
  "/generador-gradientes/",
  "/generador-sombras/",
  "/contraste-colores/",
  "/creador-paletas/",
  "/generador-tipografias/",
  "/creador-thumbnails/",           // Creador de thumbnails para YouTube
  "/generador-og-images/",          // Imágenes OG para redes sociales 1200x630

  // Emprendimiento y Negocios (7 implementadas) - Apps España-específicas movidas
  "/orientador-tarifa-freelance/",
  "/estimador-break-even/",
  "/estimador-roi-marketing/",
  "/planificador-cashflow/",
  "/generador-nombres-empresa/",
  "/generador-facturas/",           // Facturas para autónomos con IVA/IRPF
  "/calculadora-presupuestos/",     // Presupuestos profesionales para clientes
  "/generador-carruseles/",         // Carruseles para Instagram/LinkedIn
  "/selector-modelo-negocio/",      // Test para elegir modelo de negocio (tienda, e-commerce, servicios, SaaS, marketplace)

  // Física y Química (7 implementadas)
  "/conversor-unidades/",
  "/conversor-unidades-rf/",        // dBm, Watts, VSWR, longitud de onda
  "/calculadora-movimiento/",
  "/simulador-fisica/",            // Simulador visual: caída libre, péndulo, proyectiles, ondas, resorte
  "/calculadora-electricidad/",
  "/glosario-fisica-quimica/",
  "/tabla-periodica/",

  // Campus Digital (9 implementadas)
  "/calculadora-notas/",
  "/creador-flashcards/",
  "/generador-horarios-estudio/",
  "/curso-emprendimiento/",
  "/curso-decisiones-inversion/",
  "/curso-nutrisalud/",
  "/curso-teoria-politica/",
  "/curso-pensamiento-cientifico/",
  "/curso-pensamiento-sistemico/",   // Curso Pensamiento Sistémico (20 capítulos)
  "/curso-empresa-familiar/",
  "/curso-negociacion/",
  "/curso-optimizacion-ia/",        // Curso GEO/AEO: optimización para IAs (6 capítulos)
  "/curso-marketing-digital/",      // Curso Marketing Digital 2025 (30 capítulos)
  "/curso-estrategia-empresarial/", // Curso Estrategia Empresarial (10 capítulos)
  "/curso-criptografia-seguridad/", // Curso Criptografía y Seguridad (15 capítulos)
  "/curso-redaccion-academica/",    // Curso Redacción Académica (13 capítulos)
  "/guia-cuidado-mascota/",         // Guía Cuidado de Mascotas (8 capítulos)

  // SEO & Marketing (9 implementadas)
  "/generador-meta-descripciones/",
  "/analizador-densidad-seo/",
  "/generador-palabras-clave/",
  "/generador-hashtags/",
  "/analizador-titulos-seo/",
  "/calculadora-legibilidad/",
  "/calculadora-tiempo-lectura/",
  "/generador-schema-markup/",
  "/analizador-geo/",                // Optimización contenido para IAs (GEO/AEO)

  // Referencia y Cultura General (6 implementadas)
  "/paises-del-mundo/",             // Buscador de países: banderas, capitales, monedas, idiomas
  "/minerales-del-mundo/",          // Guía de 50 minerales: composición, dureza, usos, curiosidades
  "/huesos-cuerpo-humano/",         // Guía de 206 huesos: nombre latino, tipo, región, articulaciones
  "/constelaciones-del-cielo/",     // Guía de 32 constelaciones: zodiaco, estrellas, mitología
  "/instrumentos-musicales/",       // Guía de 45 instrumentos: cuerda, viento, percusión, teclado
  "/vitaminas-minerales/",          // Guía de 30 nutrientes: vitaminas y minerales esenciales

  // Informática y Programación (9 implementadas)
  "/visualizador-algoritmos/",      // Visualiza algoritmos de ordenación paso a paso
  "/playground-sql/",               // Editor SQL interactivo con ejercicios
  "/simulador-puertas-logicas/",    // Puertas lógicas, tablas de verdad, circuitos digitales
  "/glosario-programacion/",        // Diccionario términos programación: 100+ conceptos A-Z
  "/calculadora-sistemas-numericos/", // Binario, octal, decimal, hex + operaciones bit a bit
  "/calculadora-subredes/",         // Subredes IP: CIDR, máscara, broadcast, rango de hosts
  "/visualizador-estructuras-datos/", // Arrays, pilas, colas, listas enlazadas, árboles BST
  "/conversor-ieee754/",            // Decimal a IEEE 754: signo, exponente, mantisa (32/64 bits)
  "/calculadora-algebra-booleana/", // Álgebra booleana: mapas de Karnaugh, SOP/POS, tablas de verdad

  // Biomedicina y Ciencias de la Salud (2 implementadas)
  "/simulador-genetica/",           // Simulador de genética mendeliana con Punnett
  "/calculadora-estadistica-medica/", // Estadística médica: sensibilidad, especificidad, VPP, VPN, OR, RR, NNT


  // Creatividad y Diseño (1 implementada)
  "/generador-avatares/",           // Genera avatares únicos desde nombre/texto

  // Guías (7 implementadas)
  "/guia/comprar-casa/",            // Guía para comprar vivienda en España
  "/guia/freelance/",               // Guía para trabajar como freelance/autónomo
  "/guia/invertir/",                // Guía para empezar a invertir
  "/guia/ahorrar-dinero/",          // Guía para ahorrar dinero y salir de deudas
  "/guia/vivir-sano/",              // Guía para vivir más sano: nutrición, sueño, hábitos
  "/guia/comprar-coche/",           // Guía para comprar un coche en España
  "/guia/montar-negocio/",          // Guía para montar un negocio o emprender
  "/guia/pensar-mejor/",            // Guía de reflexión profesional: 14 herramientas en 3 capítulos

  // Nuevas apps (2026-02-19)
  "/calculadora-rentabilidad-alquiler/", // ROI inversión inmobiliaria: rentabilidad bruta/neta, cash flow, payback
  "/seguimiento-ciclo-menstrual/",       // Ciclo menstrual: ventana fértil, ovulación, próximas fechas (cálculo local)
  "/estimador-gastos-comunidad/",      // Gastos comunidad propietarios: reparto igual o por coeficiente

  // Nuevas apps (2026-02-23)
  "/juego-ahorcado/",                    // Juego del ahorcado en español: 4 categorías, 100% local
  "/checklist-documentos-viaje/",        // Checklist documentos de viaje: España, Europa, internacional
  "/orientador-jet-lag/",                 // Calculadora jet lag: diferencia horaria, días adaptación, recomendaciones
  "/quiz-paises-capitales/",             // Quiz geografía: capitales, países por capital, identificar banderas
  "/quiz-verbos-irregulares/",           // Quiz verbos irregulares inglés: 75 verbos A1-B2, opción múltiple
  "/quiz-figuras-retoricas/",            // Quiz figuras retóricas: 27 figuras ESO/Bach/Selectividad con feedback educativo
  "/quiz-reinos-naturaleza/",            // Quiz Reinos de la Naturaleza: 43 organismos sorprendentes, clasificación por grupos
  "/guia-seguro-viaje/",                 // Coberturas recomendadas por destino/tipo de viaje + checklist 12 puntos
  "/planificador-itinerario/",           // Organiza días y actividades de viaje con horarios y notas
  "/orientador-tension-arterial/",      // Clasificación ESH/ESC 2018: TAM, presión de pulso e historial local
  "/planificador-chequeos-medicos/",     // Chequeos preventivos por edad/sexo: referencia Ministerio Sanidad y SEMFyC

  // Apps de Accesibilidad (2026-03-13)
  "/adaptador-dislexia/",               // Adaptador visual de textos para personas con dislexia
  "/temporizador-visual/",              // Temporizador con círculo de colores para autismo/discapacidad cognitiva
  "/guia-respiracion/",                 // Técnicas de respiración consciente con guía visual animada
  "/lector-texto-voz/",                 // Lector TTS con resaltado de palabras en tiempo real
  "/tablero-comunicacion/",             // Tablero AAC con símbolos visuales y voz para personas no verbales
  "/ejercicios-vocalizacion/",          // Ejercicios de vocalización para Parkinson con medidor de voz en tiempo real
  "/planificador-rutinas/",             // Planificador visual de rutinas con pictogramas para autismo y TDAH
  "/generador-tarjetas-comunicacion/",  // Crea e imprime tarjetas pictográficas para AAC y comunicación aumentativa
  "/semaforo-emocional/",               // Regulación emocional visual con tres estados y estrategias adaptadas
  "/recordatorio-medicacion/",          // Gestión visual de medicamentos con pictogramas y horarios por toma
  "/historias-sociales/",               // Historias sociales visuales para preparar situaciones nuevas (técnica Carol Gray)

  // Legal y Fiscal - Fase 1 (orientación, bajo riesgo)
  "/plazos-legales/",                   // Guía orientativa de plazos de prescripción y caducidad en España
  "/comparador-formas-juridicas/",      // Comparador orientativo: autónomo, SL, cooperativa, asociación, CB
  "/asistente-constitucion-asociacion/", // Asistente para generar documentos orientativos de constitución de asociación
  "/estimador-cuota-autonomo/",         // Estimador cuota RETA por ingresos reales 2025
  "/estimador-smi/",                     // Estimador SMI 2026: neto, atrasos retroactivos y comparativa por provincia
  "/estimador-sueldo-neto/",            // Estimador sueldo neto ↔ bruto con IRPF y SS 2025
  "/orientador-gastos-deducibles/",     // Orientador gastos deducibles autónomo IRPF+IVA
  "/calendario-fiscal-emprendedor/",    // Calendario fiscal obligaciones autónomos y sociedades 2025
  "/asistente-alta-autonomo/",          // Asistente orientativo para darse de alta como autónomo
  "/estimador-irpf/",                   // Estimador orientativo cuota IRPF 2025 con tramos y mínimos
  "/estimador-plusvalias-irpf/",        // Estimador ganancias patrimoniales base del ahorro IRPF 2025
  "/comparador-autonomo-vs-sl/",        // Comparador fiscal autónomo vs sociedad limitada
  "/estimador-impuesto-sucesiones/",    // Estimador ISD sucesiones 17 CCAA (estatal + Cataluña + forales)
  "/estimador-impuesto-donaciones/",    // Estimador ISD donaciones 17 CCAA (estatal + Cataluña + forales)
  "/asistente-constitucion-sociedad/",       // Checklist SL/SLU/SA + formulario datos + costes estimados
  "/orientacion-tramitacion-herencias/", // Checklist interactivo + timeline + plazos + costes herencias
  "/guia/herencias/",                   // Guía landing page: journey hereditario con 4 herramientas
  "/estimador-plusvalia-municipal/",    // Estimador IIVTNU método objetivo y real — RDL 26/2021
  "/orientador-intereses-demora/",      // Orientador interés comercial (Ley 3/2004) e interés legal (CC)
  "/test-obligado-declarar-renta/",         // Test obligación declarar Renta 2025: 7 preguntas, umbrales IRPF, varios pagadores, IMV
  "/checklist-declaracion-renta/",          // Checklist documentos declaración renta 2026 por perfil (asalariado/autónomo/pensionista/inversor/arrendador)
  "/orientador-alquiler-habitaciones/",   // Orientador alquiler por habitaciones zona tensionada: techo renta, SERPAVI, municipios
  "/estimador-actualizacion-alquiler/",   // Calculadora IRAV/IPC para actualización de renta de alquiler según Ley de Vivienda 2023
  "/requisitos-nomada-digital/",            // Orientador elegibilidad Visa Nómada Digital (Ley 28/2022 de Startups)
  "/quiz-simbolos-quimicos/",               // Quiz símbolos químicos — 85 elementos, 3 dificultades, 2 modos
  "/test-burnout-laboral/",                 // Test orientativo burnout laboral — 15 preguntas, 3 dimensiones
  "/orientador-discapacidad/",              // Orientador grado discapacidad — test funcional RD 888/2022
  "/simulador-bono-joven-alquiler/",        // Simulador Bono Joven Alquiler — requisitos + cálculo ahorro
  "/orientador-aval-ico/",                  // Orientador Aval ICO Vivienda — checklist primera vivienda
  "/calculadora-costes-teletrabajo/",       // Calculadora Costes Teletrabajo — ahorro vs oficina
  "/quiz-historia-espana/",                 // Quiz Historia de España — 81 preguntas, 3 niveles
  "/quiz-geografia-espana/",               // Quiz Geografía de España — 75 preguntas, provincias, ríos, CCAA
  "/test-madurez-digital/",                // Test Madurez Digital — 15 preguntas, 5 perfiles, recomendaciones

  // Nuevas apps hogar y bricolaje (2026-03-23)
  "/calculadora-materiales-construccion/",  // Azulejos, pintura, tarima y mortero con desperdicio y coste
  "/calculadora-eficiencia-energetica/",   // Ahorro y amortización: aislamiento, ventanas y bomba de calor
  "/calculadora-piscinas/",                // Volumen + dosis cloro, pH, alguicida y sal

  // Asesor vehículo (2026-03-26)
  "/selector-calefaccion/",                  // Test 10 preguntas: aerotermia, bomba de calor, gas, pellet o eléctrico
  "/selector-portatil/",                     // Test 10 preguntas: formato, OS, gama y modelos de referencia
  "/selector-smartphone/",                   // Test 10 preguntas: iOS/Android, gama y modelos de referencia
  "/selector-vehiculo/",                     // Test 9 preguntas: segmento + motorización + costes anuales comparados
  "/selector-mascota/",                      // Test 10 preguntas: perro, gato, roedor, pez, pájaro o reptil
  "/selector-seguro-salud/",                 // Test 10 preguntas: sanidad pública, complementario o seguro completo
  "/selector-alquiler-vs-compra/",           // Test 10 preguntas: situación vital, estabilidad, horizonte — ¿alquilar o comprar?
  "/selector-dieta/",                        // Test 10 preguntas: mediterránea, vegetariana, vegana, cetogénica, DASH, ayuno
  "/selector-ejercicio/",                    // Test 10 preguntas: gimnasio, running, natación, ciclismo, yoga, casa
  "/selector-seguro-hogar/",                 // Test 10 preguntas: cobertura básica, estándar o completa
  "/selector-zona-residencia/",              // Test 10 preguntas: ciudad grande, ciudad media, rural o costa
  "/selector-tipo-vivienda/",               // Test 10 preguntas: piso, casa unifamiliar, ático, estudio o compartido

  "/selector-coche-nuevo-usado/",             // Test 10 preguntas: nuevo, seminuevo o segunda mano

  // Herramientas de decisión de vehículo (2026-03-27)
  "/comparador-electrico/",               // Break-even eléctrico vs gasolina, MOVES III, proyección 10 años
  "/etiqueta-dgt/",                       // Etiqueta DGT (CERO/ECO/C/B) + acceso ZBE 7 ciudades

  // Herramientas de forma jurídica (2026-03-28)
  "/selector-forma-juridica/",            // Test 10 preguntas: ¿autónomo o sociedad limitada?

  // Herramientas de ahorro y jubilación (2026-03-28)
  "/selector-plan-pensiones/",            // Test 10 preguntas: individual, empleo, EPSV, diversificar o ninguno
  "/selector-tipo-ahorro/",              // Test 10 preguntas: cuenta remunerada, depósito, fondo indexado o combinación
  "/selector-inversiones/",             // Test 10 preguntas: fondos indexados, acciones, renta fija, inmobiliario o pensiones

  // Herramientas de tecnología de hogar (2026-03-28)
  "/selector-tipo-television/",           // Test 10 preguntas: OLED, QLED/Mini-LED, LED IPS o LED VA

  // Selectores tercera tanda (2026-03-28)
  "/selector-vacaciones/",               // Test 10 preguntas: playa, montaña, ciudad, aventura, organizado
  "/selector-contrato-trabajo/",         // Test 10 preguntas: indefinido, temporal, autónomo, prácticas, funcionario
  "/selector-tipo-prestamo/",            // Test 10 preguntas: personal, hipotecario, consumo, línea crédito, microcrédito
  "/selector-energia-hogar/",            // Test 10 preguntas: gas, eléctrico/bomba calor, aerotermia, biomasa, solar
  "/simulador-placas-solares/",          // Simulador ahorro placas solares: producción, autoconsumo, amortización
  "/selector-tarifa-electrica/",         // Selector PVPC o mercado libre: test 10 preguntas + estimación coste
  "/estimacion-ahorro-hidrico/",         // Estimación ahorro hídrico: 10 hábitos, litros y euros ahorrados
  "/simulador-subvenciones-rehabilitacion/", // Subvenciones rehabilitación energética: Next Generation + IRPF
  "/estimacion-certificacion-energetica/",   // Estimación letra energética (A-G): 8 factores orientativos
  "/selector-carrera-universitaria/",    // Test 10 preguntas: ciencias/ingeniería, salud, humanidades, tecnología, arte/diseño
  "/selector-herramienta-productividad/", // Test 10 preguntas: GTD, Pomodoro, Kanban, Timeboxing, Inbox Zero
  "/selector-seguro-vida/",              // Test 10 preguntas: temporal, ahorro/vida entera, mixto o ninguno por ahora
  "/selector-formacion-postgrado/",      // Test 10 preguntas: máster, FP superior, bootcamp, oposiciones, certificación
  "/selector-seguro-coche/",             // Test 10 preguntas: terceros básico, terceros ampliado, todo riesgo c/s franquicia
  "/selector-idioma/",                   // Test 10 preguntas: inglés, francés, alemán, portugués, chino/japonés
  "/selector-estilo-decoracion/",        // Test 10 preguntas: minimalista, clásico, industrial, nórdico, mediterráneo
  "/selector-vehiculo-electrico/",       // Test 10 preguntas: BEV, PHEV, HEV, moto eléctrica, esperar
  "/selector-metodo-estudio/",           // Test 10 preguntas: repetición espaciada, mapas mentales, proyectos, Pomodoro, clases
  "/selector-tipo-hipoteca/",            // Test 10 preguntas: fija, variable, mixta, hipoteca verde
  "/selector-cuenta-bancaria/",          // Test 10 preguntas: corriente, nómina, joven, ahorro/remunerada, sin cambio
  "/selector-modalidad-trabajo/",        // Test 10 preguntas: presencial, remoto, híbrido, coworking, nómada digital
  "/selector-canal-venta/",              // Test 10 preguntas: marketplace, plataforma sectorial, tienda propia, RRSS, directa
  "/selector-regimen-fiscal-autonomo/",  // Test 10 preguntas: módulos, directa simplificada, directa normal, SL
  "/selector-movilidad-urbana/",         // Test 10 preguntas: coche, transporte público, moto, bici/patinete, combinación
  "/selector-gestion-estres/",           // Test 10 preguntas: meditación, ejercicio, terapia, hobbies, desconexión digital
  "/selector-tipo-alojamiento/",         // Test 10 preguntas: hotel, apartamento, hostel, camping/glamping, casa rural
  "/selector-tablet/",                   // Test 10 preguntas: Android, iPad, Windows, eReader, sin tablet
  "/selector-financiacion-empresa/",     // Test 10 preguntas: autofinanciación, préstamo, inversores, crowdfunding, subvenciones
  "/selector-tipo-gimnasio/",            // Test 10 preguntas: tradicional, CrossFit, yoga/pilates, casa, aire libre
  "/selector-auriculares/",              // Test 10 preguntas: in-ear TWS, over-ear ANC, deportivos, gaming, cable

  // Apps de reflexión (2026-04-02)
  "/diagnostico-explotacion-exploracion/", // Reflexión: explotación vs exploración (March, 1991) — 10 preguntas, perfil + acciones
  "/auditoria-reuniones/",               // Reflexión: auditoría de reuniones — eficiencia + cultura, 10 preguntas, perfil + acciones
  "/mapa-decisiones-urgentes-importantes/", // Reflexión: urgente vs importante (Eisenhower) — visión + filtro, 10 preguntas, perfil + acciones
  "/test-delegacion-efectiva/",            // Reflexión: delegación efectiva (Hersey-Blanchard) — acompañamiento + autonomía, 10 preguntas, perfil + acciones
  "/diagnostico-comunicacion-interna/",    // Reflexión: comunicación interna — velocidad + profundidad, 10 preguntas, perfil + acciones
  "/checklist-pre-mortem/",                // Reflexión: pre-mortem (Gary Klein) — anticipación + acción, 10 preguntas, perfil + acciones
  "/diagnostico-brecha-ia/",               // Reflexión: brecha IA — criterio propio + aprovechamiento IA, 10 preguntas, perfil + acciones
  "/evaluador-prompts/",                   // Reflexión: prompt engineering — calidad instrucciones + procesamiento salida, 10 preguntas, perfil + acciones
  "/test-dependencia-tecnologica/",        // Reflexión: dependencia tecnológica — autonomía real + adaptabilidad, 10 preguntas, perfil + acciones
  "/mapa-automatizacion-personal/",        // Reflexión: automatización personal — automatización rutinario + protección creativo, 10 preguntas, perfil + acciones
  "/diagnostico-estancamiento-profesional/", // Reflexión: estancamiento profesional — desafío + habilidad (Csikszentmihalyi), 10 preguntas, perfil + acciones
  "/mapa-dependencia-clientes/",            // Reflexión: dependencia clientes — concentración + diversificación, 10 preguntas, perfil + acciones
  "/auditoria-habilidades-mercado/",       // Reflexión: habilidades vs mercado — relevancia + actualización, 10 preguntas, perfil + acciones
  "/test-sindrome-impostor/",              // Reflexión: síndrome del impostor — autoexigencia + reconocimiento (Clance), 10 preguntas, perfil + acciones
  "/test-ritmo-vital/",                    // Reflexión: ritmo vital — urgencia + presencia (kletskassa), 10 preguntas, perfil + acciones
  "/auditoria-energia-semanal/",           // Reflexión: energía semanal — desgaste + recarga (Loehr/Schwartz), 10 preguntas, perfil + acciones
  "/diagnostico-multitarea/",              // Reflexión: multitarea — fragmentación + foco (context-switching), 10 preguntas, perfil + acciones
  "/mapa-compromisos-capacidad/",          // Reflexión: compromisos vs capacidad — carga + capacidad, 10 preguntas, perfil + acciones
  "/detector-sesgos-cognitivos/",          // Reflexión: sesgos cognitivos — automatismo + deliberación (Kahneman), 10 preguntas, perfil + acciones
  "/analisis-decision-reversible/",        // Reflexión: decisión reversible/irreversible — parálisis + prudencia (Bezos), 10 preguntas, perfil + acciones
  "/test-pensamiento-grupo/",              // Reflexión: pensamiento de grupo — conformidad + disidencia (Janis), 10 preguntas, perfil + acciones
  "/checklist-segunda-opinion/",           // Reflexión: segunda opinión — certeza + cuestionamiento (red team), 10 preguntas, perfil + acciones
  "/diagnostico-modelo-negocio/",          // Reflexión: modelo negocio — propuesta + sostenibilidad (BMC), 10 preguntas, perfil + acciones
  "/test-validacion-idea/",                // Reflexión: validación idea — asunción + validación (Lean Startup), 10 preguntas, perfil + acciones
  "/mapa-riesgo-emprendedor/",             // Reflexión: riesgo emprendedor — exposición + preparación, 10 preguntas, perfil + acciones
  "/auditoria-propuesta-valor/",           // Reflexión: propuesta de valor — encaje + comunicación (Osterwalder), 10 preguntas, perfil + acciones
  "/declaracion-renta-fallecidos/",        // Guía interactiva IRPF fallecidos: obligación, borrador, documentación, devolución herederos
];

/**
 * Función helper para verificar si una app está implementada
 */
export const isAppImplemented = (url: string): boolean => {
  return implementedAppsUrls.includes(url);
};

/**
 * Total de apps implementadas (para contadores)
 */
export const TOTAL_IMPLEMENTED_APPS = implementedAppsUrls.length;
