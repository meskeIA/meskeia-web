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
  "/visualizador-peso-numeros/",
  "/visualizador-mundo-100-personas/",
  "/visualizador-mapa-dinero-mensual/",
  "/visualizador-peso-decisiones/",
  "/visualizador-internet-60-segundos/",
  "/visualizador-como-funciona-banco/",
  "/visualizador-probabilidad/",
  "/visualizador-funciones-mundo/",
  "/visualizador-fuerzas-invisibles/",
  "/visualizador-escala-universo/",
  "/visualizador-oferta-demanda/",
  "/visualizador-viaje-comida/",
  "/visualizador-adn-numeros/",
  "/visualizador-historia-reloj/",
  "/visualizador-origen-camiseta/",
  "/visualizador-coste-sanidad/",
  "/visualizador-agua-virtual/",
  "/visualizador-historia-dinero/",
  "/visualizador-sistema-electoral/",
  "/visualizador-idiomas-mundo/",
  "/visualizador-ciclos-sueno/",
  "/visualizador-ciudad/",
  "/visualizador-desarrollo-farmaco/",
  "/visualizador-proceso-legislativo/",
  "/visualizador-vida-estrella/",
  "/visualizador-vacunas/",
  "/visualizador-viaje-basura/",
  "/visualizador-anatomia-smartphone/",
  "/visualizador-cuerpo-numeros/",
  "/visualizador-matematicas-musica/",
  "/visualizador-construccion-edificio/",
  "/visualizador-historia-escritura/",
  "/visualizador-anatomia-vuelo/",
  "/visualizador-mapa-especias/",
  "/visualizador-clima/",
  "/visualizador-produccion-energia/",
  "/visualizador-oceano/",
  "/visualizador-cerebro/",
  "/visualizador-fibonacci-naturaleza/",
  "/visualizador-sistema-solar/",
  "/visualizador-cadena-alimentaria/",
  "/visualizador-pantallas/",
  "/visualizador-viaje-paquete/",
  "/visualizador-tabla-periodica/",
  "/visualizador-gps/",
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
  "/test-tolerancia-riesgo-detallado/", // Test 20 preguntas en 5 dimensiones: horizonte, capacidad, emoción, experiencia, objetivos
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
  "/orientador-contrato-mercantil/",     // Qué tipo de contrato mercantil necesitas y cláusulas esenciales
  "/orientador-facturacion-retencion/",  // Retenciones IRPF en facturas: porcentaje, cuándo aplica, modelo 111
  "/checklist-cambio-regimen-autonomo/", // Pasos para cambiar de módulos a estimación directa: plazos y trámites
  "/comparador-transporte-viaje/", // Comparador avión, tren, autobús y coche: coste, tiempo, CO₂ y equipaje
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
  "/simulador-baja-vision/",
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
  "/simulador-circuitos-electricos/", // Serie, paralelo, Ley de Ohm, potencia — hasta 6 resistencias
  "/simulador-reacciones-quimicas/",  // Estequiometría y reactivo limitante — 20 reacciones reales con cálculos numéricos
  "/simulador-puertas-logicas/",    // Puertas lógicas, tablas de verdad, circuitos digitales
  "/simulador-sesgos-inversor/",    // 8 escenarios para detectar sesgos cognitivos del inversor: aversión pérdidas, manada, confirmación...
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
  "/quiz-tabla-periodica/",                 // Quiz Tabla Periódica — 40+ preguntas sobre grupos, períodos, propiedades y curiosidades
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
  "/visualizador-como-funciona-wifi/",     // Explicador visual: ondas, 2.4/5 GHz, propagación, canales WiFi
  "/visualizador-matrices/",               // Explicador visual: matrices, operaciones, transformaciones 2D
  "/visualizador-reacciones-quimicas/",    // Explicador visual: tipos reacciones, balanceo ecuaciones, átomos
  "/visualizador-celula/",                 // Explicador visual: célula animal vs vegetal, orgánulos clickables
  "/visualizador-fotosintesis/",           // Explicador visual: fotosíntesis paso a paso, Calvin, datos escala
  "/visualizador-leyes-newton/",           // Explicador visual: 3 leyes de Newton, F=ma, simulaciones
  "/visualizador-tabla-periodica-interactiva/", // Explicador visual: tendencias tabla periódica, mapas de calor
  "/visualizador-optica/",                 // Explicador visual: reflexión, refracción, lentes, prisma
  "/visualizador-estados-materia/",        // Explicador visual: sólido, líquido, gas, plasma, partículas animadas
  "/visualizador-tectonica-placas/",       // Explicador visual: placas tectónicas, bordes, Richter, volcanes
  "/visualizador-mitosis-meiosis/",        // Explicador visual: división celular, cromosomas animados, crossing-over
  "/visualizador-capas-tierra/",           // Explicador visual: corteza, manto, núcleo, ondas sísmicas
  "/visualizador-tipos-rocas/",            // Explicador visual: ígneas, sedimentarias, metamórficas, ciclo rocas
  "/visualizador-arbol-vida/",             // Explicador visual: árbol filogenético, 11 grupos animales
  "/visualizador-anatomia-flor/",          // Explicador visual: partes flor, polinización, frutos, semillas
  "/visualizador-ciclo-agua/",             // Explicador visual: ciclo hidrológico, distribución agua, tiempos residencia
  "/visualizador-respiracion-celular/",    // Explicador visual: glucólisis, Krebs, cadena transporte, ATP
  "/visualizador-metamorfosis/",           // Explicador visual: completa, incompleta, anfibio, fases animadas
  "/visualizador-transporte-plantas/",     // Explicador visual: xilema, floema, estomas, capilaridad
  "/visualizador-ecosistema/",             // Explicador visual: pirámide trófica, regla 10%, ciclos biogeoquímicos
  "/visualizador-fosiles-tiempo-geologico/", // Explicador visual: eras geológicas, extinciones, datación fósiles
  "/visualizador-biomoleculas/",           // Explicador visual: carbohidratos, lípidos, proteínas, ácidos nucleicos
  "/visualizador-germinacion/",            // Explicador visual: semilla, 6 fases germinación, factores
  "/visualizador-sistemas-circulatorios/", // Explicador visual: corazones 2-4 cámaras, sangre fría/caliente
  "/visualizador-enlaces-quimicos/",       // Explicador visual: iónico, covalente, metálico, electrones animados
  "/visualizador-fases-luna-eclipses/",    // Explicador visual: fases lunares, eclipses, mareas
  "/visualizador-seleccion-natural/",      // Explicador visual: evolución, Darwin vs Lamarck, poblaciones
  "/visualizador-sistema-inmune/",         // Explicador visual: 3 defensas, anticuerpos, vacunas
  "/visualizador-termodinamica/",          // Explicador visual: conducción, convección, radiación
  "/visualizador-electricidad-domestica/", // Explicador visual: cuadro eléctrico, diferencial, REBT, circuitos
  "/visualizador-ph-acidos-bases/",        // Explicador visual: escala pH, ácidos, bases, neutralización
  "/visualizador-estaciones-ano/",         // Explicador visual: inclinación 23,5°, solsticios, horas de luz
  "/visualizador-maquinas-simples/",       // Explicador visual: palanca, polea, plano inclinado, ventaja mecánica
  "/visualizador-sonido-ondas/",           // Explicador visual: frecuencia, amplitud, decibelios, armónicos
  "/visualizador-efecto-invernadero/",     // Explicador visual: mecanismo invernadero, CO₂, escenarios, soluciones
  "/visualizador-geometria-fractales/",    // Explicador visual: Sierpinski, Koch, Mandelbrot, naturaleza
  "/visualizador-numeros-primos/",         // Explicador visual: criba Eratóstenes, Ulam, RSA, criptografía
  "/visualizador-sistema-nervioso/",       // Explicador visual: neurona, sinapsis, SNC/SNP, neurotransmisores
  "/visualizador-sistemas-equilibrio/",   // Explicador visual: vestibular, visual, propioceptivo, mareo
  "/visualizador-microbioma/",            // Explicador visual: microbiota intestinal, eje intestino-cerebro, factores
  "/visualizador-sistema-linfatico/",    // Explicador visual: drenaje, inmunidad, órganos linfáticos, flujo linfa
  "/visualizador-osteoporosis/",         // Explicador visual: remodelado óseo, osteoblastos vs osteoclastos, densidad
  "/visualizador-hipertension/",         // Explicador visual: etapas PA, daño arterial, órganos diana
  "/visualizador-como-funciona-el-dolor/", // Explicador visual: nocicepción, 4 fases, tipos, sensibilización central
  "/visualizador-inflamacion/",           // Explicador visual: 5 signos, aguda vs crónica, células, factores
  "/visualizador-sistema-endocrino/",      // Explicador visual: glándulas, hormonas, feedback, eje HPA
  "/visualizador-digestion-nutrientes/",   // Explicador visual: macronutrientes, digestión bioquímica, vitaminas
  "/visualizador-minerales-gemas/",        // Explicador visual: escala Mohs, gemas preciosas, formación
  "/visualizador-estructuras-cristalinas/", // Explicador visual 3D: celdas unitarias rotables, BCC/FCC/HCP, CSS 3D
  "/visualizador-espectro-electromagnetico/", // Explicador visual: 7 bandas EM, radio a gamma, energía y peligro
  "/visualizador-estructura-atomo/",       // Explicador visual: protones, neutrones, Bohr vs orbitales, isótopos
  "/visualizador-cartografia-proyecciones/", // Explicador visual: Mercator vs Peters, distorsiones, coordenadas
  "/visualizador-enzimas-cuerpo-humano/",  // Explicador visual: 13 enzimas, llave-cerradura, pH/temperatura, cofactores
  "/visualizador-sangre-componentes/",     // Explicador visual: tubo centrifugado, ABO/Rh, coagulación, análisis
  "/visualizador-adn-codigo-genetico/",    // Explicador visual: doble hélice, transcripción, codones, CRISPR
  "/visualizador-fenomenos-meteorologicos/", // Explicador visual: nubes, precipitaciones, rayos, huracanes, DANA
  "/visualizador-ojo-humano-vision/",      // Explicador visual: anatomía ojo, conos/bastones, defectos visuales
  "/visualizador-sistema-respiratorio/",   // Explicador visual: pulmones, alvéolos, intercambio O₂/CO₂, espirometría
  "/visualizador-musculos-movimiento/",    // Explicador visual: sarcómero, actina/miosina, articulaciones
  "/visualizador-oido-equilibrio/",        // Explicador visual: cóclea, canales semicirculares, equilibrio
  "/visualizador-ciclo-vida-freelance/",   // Explicador visual: fases proyecto freelance, tiempo facturable
  "/visualizador-estructura-costes-autonomo/", // Explicador visual: cascada ingresos a neto autónomo
  "/visualizador-tipos-cliente-freelance/", // Explicador visual: 6 tipos relación cliente-freelance
  "/test-salud-negocio-freelance/",        // Test 5 dimensiones salud negocio freelance + radar chart
  "/calculadora-precio-por-proyecto/",     // Precio proyecto freelance: horas, complejidad, imprevistos
  "/checklist-preparar-verifactu/",        // Checklist VeriFactu facturación electrónica 2027
  "/planificador-vacaciones-autonomo/",    // Impacto económico vacaciones autónomo
  "/simulador-colchon-emergencia-freelance/", // Meses de supervivencia sin ingresos
  "/planificador-trimestres-freelance/",    // Planificador 4 trimestres fiscales autónomo
  "/orientador-diversificacion-clientes/",  // Índice HHI concentración cartera clientes
  "/visualizador-piel/",                    // Explicador visual: capas piel, funciones, cicatrización, fototipos
  "/visualizador-higado/",                  // Explicador visual: detoxificación, metabolismo, síntesis proteínas, bilis
  "/visualizador-rinon-filtracion/",        // Explicador visual: nefrona, filtración glomerular, reabsorción, SRAA
  "/visualizador-farmacocinetica/",         // Explicador visual ADME: absorción, distribución, metabolismo, excreción
  "/visualizador-cicatrizacion/",           // Explicador visual: 4 fases cicatrización, células, tipos herida, factores
  "/visualizador-ia-redes-neuronales/",     // Explicador visual: perceptrón, capas, backpropagation, tipos de redes
  "/visualizador-energia-nuclear/",         // Explicador visual: fisión, fusión, reactores, comparativa CO₂
  "/visualizador-mercados-financieros/",    // Explicador visual: libro órdenes, activos, índices, participantes
  "/visualizador-cambio-climatico-tipping-points/", // Explicador visual: 9 tipping points, retroalimentaciones, cascadas
  "/visualizador-deuda-publica/",           // Explicador visual: bonos soberanos, prima de riesgo, sostenibilidad
  "/visualizador-envejecimiento-celular/",  // Explicador visual: telómeros, hallmarks aging, senescencia, reloj Horvath
  "/visualizador-cerebro-emociones/",       // Explicador visual: amígdala, neurotransmisores, circuitos, regulación
  "/visualizador-blockchain/",              // Explicador visual: cadena bloques, PoW vs PoS, contratos inteligentes
  "/visualizador-criptografia/",            // Explicador visual: AES/RSA/ECDSA, SHA-256, firma digital, TLS
  "/visualizador-tipos-interes-bce/",       // Explicador visual: ciclo tipos BCE, cadena transmisión, hipotecas, bolsa
  "/visualizador-relatividad-especial/",    // Explicador visual: dilatación tiempo, contracción longitud, E=mc², gemelos
  "/visualizador-mecanica-cuantica/",       // Explicador visual: dualidad, incertidumbre, Schrödinger, efecto túnel
  "/visualizador-corazon-ciclo-cardiaco/", // Explicador visual: sístole, diástole, válvulas, ECG, gasto cardíaco
  "/visualizador-electromagnetismo/",      // Explicador visual: campo eléctrico, magnético, inducción Faraday, espectro EM
  "/visualizador-computacion-cuantica/",   // Explicador visual: qubits, puertas cuánticas, paralelismo, amenaza RSA
  "/visualizador-oceanos-corrientes/",     // Explicador visual: AMOC, corriente del Golfo, acidificación, zonas muertas
  "/visualizador-llm-funcionamiento/",     // Explicador visual: tokens, embeddings, atención transformers, temperatura
  "/visualizador-ciclo-economico/",        // Explicador visual: 4 fases ciclo, indicadores leading/lagging, yield curve
  "/visualizador-comercio-internacional/", // Explicador visual: ventaja comparativa, balanza, tipos cambio, aranceles
  "/visualizador-falacias-logicas/",       // 12 falacias en 5 familias, detector interactivo, constructor de argumentos
  "/visualizador-evolucion-humana/",       // Timeline 8 homínidos, comparativa anatómica, mapa Out of Africa
  "/visualizador-economia-circular/",      // Lineal vs circular SVG, pirámide 7R, datos reciclaje España, casos reales
  "/visualizador-cortisol/",              // Curva circadiana, estrés agudo/crónico, 8 sistemas corporales, 20 hábitos
  "/visualizador-geopolitica-recursos/",  // Recursos estratégicos: top productores, dependencia UE, conflictos, proyección 2040
  "/visualizador-desigualdad-riqueza/",   // Curva de Lorenz interactiva, Gini, efecto acumulación, políticas redistributivas
  "/visualizador-impacto-ia-sectores/",   // Automatización por sector, empleos en riesgo/emergentes, timeline IA, habilidades futuro
  "/visualizador-estadistica-cotidiana/", // Bayes, regresión media, paradoja Simpson, sesgo supervivencia, ley grandes números
  "/visualizador-insulina-glucosa/",      // Curva glucosa, mecanismo insulina celular, índice glucémico, insulinorresistencia
  "/visualizador-tiroides/",              // Eje HPT con feedback animado, T3/T4, hipo vs hiper, 8 factores
  "/visualizador-oxitocina/",             // 10 situaciones, mapa corporal, oxitocina vs vasopresina, 6 datos ciencia
  "/visualizador-dopamina/",              // Circuito recompensa 4 pasos, 8 contextos, Parkinson, 10 moduladores
  "/visualizador-testosterona/",          // Eje HPG toggle hombre/mujer, curva vital, 8 sistemas, 10 moduladores
  "/visualizador-estrogenos/",            // E1/E2/E3, ciclo 28 días, 7 sistemas, estrógenos en hombres, menopausia
  "/visualizador-melatonina/",            // Curva circadiana vs cortisol, simulador luz, por edad/estación, jet lag
  "/visualizador-endorfinas/",            // Mito runner's high (anandamida), 3 tipos, 8 activadores, vs opioides externos
  "/visualizador-lactasa/",              // Hidrólisis lactosa 3 pasos, 65% adultos, persistencia lactásica, mecanismo intolerancia
  "/visualizador-catalasa/",             // 40M reacciones/s, experimento hígado crudo/cocinado, daño oxidativo, 6 usos industriales
  "/visualizador-atp-sintasa/",          // Motor F0F1 animado, quimiosmosis 4 pasos, calculadora ATP diario, 4 inhibidores
  "/visualizador-adn-polimerasa/",       // Horquilla replicación 5 pasos, fidelidad 10⁻⁹, PCR + COVID, 5 polimerasas eucariotas
  "/visualizador-telomerasa/",           // Acortamiento telómeros, telomerasa repara, paradoja cáncer 90%, longevidad
  "/visualizador-aspirina/",             // COX-1/COX-2 irreversible, 4 efectos, timeline 120 años, comparativa coxibs
  "/visualizador-antibioticos/",         // 5 mecanismos, bacteriostático vs bactericida, 3 resistencias, virus vs bacteria
  "/visualizador-analgesicos/",            // Comparativa 3 analgésicos: aspirina+paracetamol+ibuprofeno, tabla 12 características, 5 escenarios
  "/visualizador-paracetamol/",            // Mecanismo SNC, NAPQI metabolismo hepático, umbral toxicidad, perfiles de población
  "/visualizador-ibuprofeno/",             // COX-1/COX-2 reversible, selectividad, efectos gástrico/renal, caso Vioxx
  "/visualizador-anestesia/",            // 3 tipos, 5 componentes general, GABA-A+NMDA, 3 teorías consciencia, BIS
  "/visualizador-serotonina/",           // 90% intestino, síntesis triptófano, 4 funciones, mecanismo SSRI 2-4 semanas
  "/visualizador-gaba/",                 // Balance GABA/glutamato, GABA-A vs GABA-B, 5 moduladores alostéricos
  "/visualizador-adrenalina/",           // Neurotransmisor+hormona, cascada 8 pasos, receptores α/β, EpiPen, estrés
  "/visualizador-acetilcolina/",         // UNM, parasimpático, nicotínico vs muscarínico, AChE, Alzheimer, Botox
  "/visualizador-vitamina-d/",           // Síntesis solar 5 pasos, VDR en 37 tejidos, niveles ng/mL, paradoja España
  "/visualizador-vitamina-b12/",         // Ciclo metilación, factor intrínseco, 5 grupos riesgo, síntomas neurológicos
  "/visualizador-hierro/",               // Donut distribución corporal, hemo vs no hemo, hepcidina, espectro ferropénico
  "/visualizador-magnesio/",             // 300 reacciones, equilibrio Ca/Mg músculo, NMDA, déficit silencioso
  "/visualizador-carbono/",              // 4 alótropos, ciclo del carbono Gt C/año, química orgánica, C-14 slider
  "/visualizador-silicio/",              // Bandas energía, dopado N/P, unión P-N, 7 pasos arena→chip, Ley de Moore
  "/visualizador-hidrogeno/",            // Distribución cósmica, fusión pp, pila PEM, 5 colores H₂, densidad energética
  "/visualizador-oro/",                  // Relatividad efecto, configuración 6s, nobleza química, electrónica, AuNP medicina
  "/visualizador-ayuno-intermitente/",   // Fases metabólicas hora a hora, autofagia, tipos de protocolo, contraindicaciones
  "/visualizador-metabolismo-alcohol/",  // ADH→acetaldehído→ALDH2, multi-órgano, variante ALDH2*2, cerebro GABA/NMDA
  "/visualizador-indice-glucemico/",     // IG vs Carga Glucémica, paradoja sandía, tabla 26 alimentos, fibra, curva glucosa
  "/visualizador-vuelo-avion/",          // Mito Bernoulli vs ángulo de ataque, slider, stall, vuelo invertido, 4 fuerzas
  "/visualizador-motor-combustion/",     // Ciclo Otto SVG, slider compresión, Sankey energía, comparativa eléctrico
  "/visualizador-motor-electrico/",      // Campo magnético rotante, inversor IGBT, regeneración 15-25%, comparativa 8 aspectos
  "/visualizador-efecto-doppler/",       // Ondas comprimidas/expandidas, slider velocidad, radar/ecografía/SONAR, redshift cósmico
  "/visualizador-el-nino/",              // Circulación Walker, El Niño/La Niña, teleconexiones, SOI/ONI, timeline ENSO
  "/visualizador-ciclo-carbono-completo/", // 5 reservorios, flujos Gt C/año, perturbación humana, slider emisiones, soluciones
  "/visualizador-terremotos-tsunamis/",  // Fallas, ondas P/S, Richter vs Mercalli, propagación tsunamis, DART
  "/visualizador-inflacion/",            // 3 causas mecánicas, espiral salarios-precios, sesgos IPC, BCE transmisión
  "/visualizador-burbuja-especulativa/", // 5 fases Minsky, 5 casos históricos, 6 sesgos, checklist alerta
  "/visualizador-fondo-inversion/",      // NAV, activa vs indexada, SPIVA, slider comisiones 30 años, diversificación
  "/visualizador-toma-decisiones/",      // Sistema 1/2 Kahneman, fatiga decisional, 4 heurísticos, nudges y arquitectura elección
  "/visualizador-algoritmos-ordenacion/", // Burbuja/Inserción/Quicksort/Mergesort animados, Big O, guía de cuándo usar
  "/visualizador-base-datos-relacional/", // Tablas FK/PK, 4 tipos JOIN, índices B-Tree, ACID, SQL vs NoSQL
  "/visualizador-piramide-poblacion/",    // Pirámide España 1950→2100 animada, tasa dependencia, edad mediana, INE/EUROSTAT
  "/visualizador-desinformacion/",        // Ciclo bulo 4 etapas, 6 sesgos cognitivos, 5 pasos verificación, DSA 2023
  "/visualizador-migracion-global/",      // Mapa SVG 6 regiones, 7 flujos UNHCR 2024, refugiados vs migrantes, push/pull
  "/visualizador-calculo-visual/",        // Canvas 2D: límites, tangente derivada, área Riemann integral — 3 funciones con sliders
  "/visualizador-numeros-complejos/",     // Plano Argand SVG, operaciones geométricas, forma polar, Euler e^(iπ)+1=0, apps
  "/visualizador-teoria-juegos/",         // Dilema prisionero interactivo, Nash, suma cero, tragedia comunes, 4 apps reales
  "/visualizador-ciclo-viral/",            // 6 etapas ciclo replicación, ADN vs ARN vs retrovirus, latencia, evasión inmune
  "/visualizador-diabetes-mecanismo/",    // Páncreas SVG alfa/beta, ciclo insulina-glucagón, tipo 1/2/gestacional, HbA1c molecular
  "/visualizador-alzheimer-parkinson/",   // APP/Aβ/Tau (Alzheimer), α-sinucleína/Lewy/circuito dopaminérgico (Parkinson)
  "/visualizador-cancer/",               // Oncogenes/supresores, 6 hallmarks Hanahan&Weinberg, PD-1/PD-L1 inmunoterapia
  "/visualizador-sistema-pensiones/",      // Reparto vs capitalización, slider ratio 1975-2050, reformas timeline, AIREF proyecciones
  "/visualizador-mercado-inmobiliario/",   // Oferta/demanda SVG, burbuja 2008, ratio precio/renta 6 ciudades, accesibilidad generacional
  "/visualizador-desempleo-tipos/",        // 4 tipos desempleo, NAIRU, curva Beveridge, histórico España vs UE, políticas activas/pasivas
  "/visualizador-ciclo-menstrual/",        // Gráfico SVG 4 hormonas×28 días, 4 fases clicables, SOP, anticonceptivos
  "/visualizador-proteinas-plegamiento/", // 4 niveles estructura SVG, funnel energético, 6 tipos funcionales, 4 enfermedades mal plegamiento
  "/visualizador-relatividad-general/",   // Malla SVG espacio-tiempo deformada, mass slider, geodésicas, LIGO, GPS
  "/visualizador-caos-mariposa/",         // Atractor Lorenz Canvas 2D, 7000 pasos, dos trayectorias divergentes, efecto mariposa
  "/visualizador-superconductividad/",    // Efecto Meissner CSS animado, pares de Cooper, 8 materiales, Tc slider
  "/visualizador-transformada-fourier/",  // Síntesis señal Canvas, espectro SVG, señales preconfiguradas, epiciclos animados
  "/visualizador-teoria-grafos/",         // Dijkstra animado, Königsberg SVG, detector propiedades, 4 grafos predefinidos
  "/visualizador-topologia/",             // 5 superficies SVG, genus selector, nudos topológicos, tabla Euler
  "/visualizador-estadistica-inferencial/", // p-valor SVG, errores tipo I/II, 100 IC simulados, potencia estadística
  // EJE A — Matemáticas fundamentos visuales (Roadmap v4, 2026-04-30)
  "/visualizador-trigonometria/",           // Círculo unitario animado, gráficas con sliders, tabla ángulos notables, identidades
  "/visualizador-geometria-analitica/",     // Cónicas SVG (elipse/parábola/hipérbola/circunferencia), ecuaciones canónicas, polares
  "/visualizador-algebra-lineal/",          // Vectores 2D, transformaciones lineales, determinante como área, eigenvalores
  "/visualizador-combinatoria/",            // Permutaciones, triángulo de Pascal, binomio de Newton, principio multiplicación
  "/visualizador-ecuaciones-diferenciales/", // Campo de direcciones, Lotka-Volterra, enfriamiento Newton, circuito RC
  "/visualizador-series-convergencia/",     // Taylor/Maclaurin, criterios convergencia, π con Leibniz/Nilakantha/Wallis
  // EJE B — Física: óptica ondulatoria y electrónica (Roadmap v4, 2026-04-30)
  "/visualizador-mecanica-fluidos/",        // Reynolds laminar/turbulento, Magnus, Bernoulli correcto, Mach, cavitación
  "/visualizador-optica-ondulatoria/",      // Doble rendija Young, difracción sinc², polarización Malus, coherencia láser
  "/visualizador-circuitos-electronicos/",  // R/L/C impedancia, RC carga/descarga, transistor BJT, puertas lógicas, chip
  "/visualizador-particulas-subatomicas/",  // Modelo Estándar 17 partículas, Feynman, Higgs, LHC, materia-antimateria
  // EJE C — Química orgánica y nuclear (Roadmap v4, 2026-04-30)
  "/visualizador-quimica-organica/",        // 8 grupos funcionales, 4 reacciones, aromaticidad Hückel, isomería cis/trans/óptica
  "/visualizador-radioactividad/",          // α/β/γ comparativa, ley desintegración N(t)=N₀e^(-λt), carbono-14, dosis Sv/Gy
  "/visualizador-polimeros-materiales/",    // Adición vs condensación, Tm/Tg, termoplásticos/termoestables, 7 códigos reciclaje
  "/visualizador-cosmologia/",              // Tarta SVG universo, timeline Big Bang, curva a(t), geometría, 4 destinos
  "/visualizador-agujeros-negros/",         // Anatomía SVG clicable, calc. Schwarzschild, espaguetización, Hawking
  "/visualizador-exoplanetas/",             // Tránsito animado + curva luz, wobble, zona Goldilocks, scatter 5500+
  "/visualizador-epigenetica/",             // Nucleosoma SVG, slider CpG, histonas clicables, imprinting IGF2/H19
  "/visualizador-evolucion-molecular/",     // Mutaciones ADN, reloj molecular, árbol filogenético, pseudogenes/ERVs
  "/visualizador-modelos-epidemiologicos/", // Simulador SIR/SEIR, curvas Euler, Rₜ, comparativa 5 enfermedades
  "/visualizador-termodinamica-quimica/",   // ΔH SVG + catalizador slider, ΔG=ΔH-TΔS, Kₑq, Le Chatelier Haber
  "/visualizador-cinetica-quimica/",        // Perfil Ea SVG, Arrhenius k vs T, órdenes 0/1/2, 5 factores velocidad
  "/visualizador-electroquimica/",          // Daniell SVG animada, serie electroquímica, electrólisis, Li-ion
  "/visualizador-geopolitica-energetica/",  // Flujos UE SVG, mix mundial 2010-2023, infraestructuras, renovables
  "/visualizador-cadenas-suministro/",      // Smartphone 40 países, JIT vs JIC, 5 disrupciones, reshoring
  "/visualizador-regimenes-politicos/",     // Matriz 8×6, espectro 2 ejes, evolución siglos, 5 transiciones
  // EJE D — Biología: reino animal, embriogénesis, microbiología, cronobiología, CRISPR, biomas (Roadmap v4, 2026-04-30)
  "/visualizador-reino-animal/",          // Vertebrados 5 clases SVG, invertebrados 7 phyla, comparativa sistemas, filogenético
  "/visualizador-embriogenesis/",         // Fecundación slider 5 pasos, segmentación día 1-14, gastrulación 3 capas, organogénesis
  "/visualizador-microbiologia/",         // Morfologías SVG clicables, curva logística, Gram+/Gram-, 3 dominios vida
  "/visualizador-cronobiologia/",         // Reloj CLOCK/BMAL1 SVG, Zeitgebers, cronotipos alondra/búho, cronofarmacología
  "/visualizador-crispr-cas9/",           // Mecanismo slider 6 pasos SVG, NHEJ vs HDR, 6 enfermedades, bioética He Jiankui
  "/visualizador-biomas-terrestres/",     // 7 biomas selector, climograma Walter-Lieth, latitudinal, conservación
  // EJE E — Tecnología y computación (Roadmap v4, 2026-04-30)
  "/visualizador-logica-proposicional/",  // Tablas de verdad AND/OR/NOT/XOR, evaluador fórmulas, Karnaugh SVG, FNC/FND
  "/visualizador-teoria-informacion/",    // Entropía Shannon sliders, Huffman animado, Shannon-Hartley, compresión formatos
  "/visualizador-redes-computadoras/",    // TCP/IP encapsulamiento, DNS resolución paso a paso, routing BGP, CDN latencia
  "/visualizador-sistemas-operativos/",   // Estados proceso SVG, Gantt scheduling, paginación page faults, sistema ficheros
  // EJE F — Sociedad, economía y cultura (Roadmap v4, 2026-04-30)
  "/visualizador-estructuras-mercado/",   // Competencia perfecta, monopolio, oligopolio, colusión, pérdida de bienestar
  "/visualizador-seguros-riesgo/",        // Tipos de seguro, cálculo prima actuarial, pool de riesgo, mutualización
  "/visualizador-historia/epidemias/",    // 10 epidemias históricas, cronología SVG, mortalidad comparativa, patógenos
  "/visualizador-urbanismo/",             // Modelos urbanos Burgess/Hoyt, densidad ciudades, movilidad, ciudad sostenible
  "/visualizador-estratificacion-social/", // Pirámide/diamante/7 clases, Gini/Lorenz, movilidad intergeneracional, teorías
  "/visualizador-ciclo-nitrogeno/",       // Ciclo completo SVG, microorganismos clave, Haber-Bosch, ciclos biogeoquímicos
  "/visualizador-arte-movimientos/",      // 15 movimientos artísticos, timeline scrollable, contexto histórico paralelo
  // Cronologías culturales (2026-04-30)
  "/visualizador-musica-movimientos/",    // 14 movimientos musicales, gregoriano→electrónica, compositores, obras icónicas
  "/visualizador-filosofia/",             // 16 corrientes filosóficas, años a.C., filósofos, conceptos, pregunta central
  "/visualizador-literatura-movimientos/", // 15 movimientos literarios, épica griega→posmodernismo, autores, géneros
  "/visualizador-arquitectura-estilos/",  // 16 estilos arquitectónicos, griego clásico→sostenible, edificios icónicos
  // Cronologías culturales Grupo 2 (2026-04-30)
  "/visualizador-historia/medicina/",     // 14 períodos médicos, Hipócrates→medicina precisión IA, años a.C.
  "/visualizador-historia/internet/",     // 14 hitos, ARPANET 1969→IA generativa, 6 eras digitales
  "/visualizador-derechos-humanos/",      // 13 movimientos, Magna Carta 1215→derechos digitales, 6 eras
  "/visualizador-revoluciones-industriales/", // 13 fases, preindustrial 1400→Industria 5.0 IA
  // Cronologías Ciencia — Grupo 3 (2026-05-01)
  "/visualizador-historia/fisica/",          // 14 períodos, griegos→física de cuerdas, años a.C.
  "/visualizador-historia/quimica/",         // 14 períodos, alquimia→química computacional, años a.C.
  "/visualizador-historia/matematicas/",     // 14 períodos, Babilonia→IA matemática, años a.C.
  "/visualizador-historia/astronomia/",      // 14 períodos, Stonehenge→James Webb, años a.C.
  // Cronologías Cultura Popular — Grupo 4 (2026-05-01)
  // MIGRADO a /visualizador-historia/cine/ — ver sección de historias dinámicas
  "/visualizador-historia/videojuegos/",    // 14 períodos, Pong→IA generativa en juegos
  "/visualizador-historia/moda/",           // 14 períodos, Edad Media→moda sostenible
  "/visualizador-historia/exploracion/",    // 14 períodos, fenicios→exploración espacial, años a.C.
  // Herramientas de Referencia (2026-05-02)
  "/visualizador-comparador-ia/",           // Guía comparativa: ChatGPT, Claude, Gemini, Copilot, Mistral, Perplexity
  // Cronologías Sociedad y Cultura — Grupo 6 (2026-05-02)
  "/visualizador-historia/economia-espana/", // 14 períodos, economía medieval→Next Generation EU
  "/visualizador-historia/gastronomia/",     // 14 períodos, neolítico -10000→IA culinaria, años a.C.
  "/visualizador-historia/deporte/",         // 14 períodos, Olimpia -776→eSports e IA deportiva, años a.C.
  // Cronologías Artes y Mente — Grupo 5 (2026-05-02)
  "/visualizador-historia/psicologia/",    // 14 períodos, filosofía griega→neurociencia e IA clínica, años a.C.
  "/visualizador-historia/fotografia/",    // 14 períodos, daguerrotipo 1826→IA generativa imagen
  "/visualizador-historia/teatro/",        // 14 períodos, teatro griego→teatro digital e inmersivo, años a.C.
  "/visualizador-historia/danza/",         // 14 períodos, danza ritual -3000→breaking olímpico y danza digital, años a.C.
  // Cronologías Tendencias España — Roadmap v7 EJE A (2026-05-02)
  "/visualizador-historia/energia/",       // 14 períodos, biomasa prehistórica -15000→fusión nuclear, 9 categorías energéticas
  "/visualizador-historia/clima/",         // 14 períodos, última glaciación -15000→emergencia climática, paleoclimatología
  "/visualizador-historia/aviacion/",      // 14 períodos, Wright 1900→aviación eléctrica e IA, 10 categorías
  "/visualizador-historia/comics/",        // 14 períodos, Töpffer 1827→IA generativa en cómics, 14 estilos

  // Cronologías Tendencias España — Roadmap v8 EJE A (2026-05-02)
  "/visualizador-historia/radio/",               // 14 períodos, Marconi 1895→Radio IA y podcasting, 10 categorías
  "/visualizador-historia/television/",          // 14 períodos, Baird 1926→TV interactiva con IA, 10 categorías
  "/visualizador-historia/robotica/",            // 14 períodos, Čapek 1920→AGI encarnada, 10 categorías
  "/visualizador-historia/publicidad/",          // 14 períodos, Gutenberg 1450→IA generativa publicitaria, 10 categorías
  "/visualizador-historia/videojuegos-espanoles/", // 14 períodos, Edad de Oro 1983→Metroid Dread y Blasphemous

  // Cronologías Tendencias España — Roadmap v8 EJE B (2026-05-02)
  "/visualizador-historia/ordenadores/",         // 14 períodos, Babbage 1820→IA generativa y computación cuántica
  "/visualizador-historia/tren/",                // 14 períodos, Trevithick 1804→AVE, Maglev e hidrógeno
  "/visualizador-historia/viajes-espaciales/",   // 14 períodos, Tsiolkovski 1903→Starship y Artemis

  // Cronologías Tecnologías del Cotidiano — Roadmap v9 EJE A (2026-05-03)
  "/visualizador-historia/automocion/",          // 13 períodos, Benz 1885→coche eléctrico autónomo
  "/visualizador-historia/telefono/",            // 13 períodos, Bell 1876→5G e IA conversacional
  "/visualizador-historia/prensa/",              // 14 períodos, Gutenberg 1450→periodismo digital e IA

  // Cronologías Cultura y Estilo — Roadmap v9 EJE B (2026-05-03)
  "/visualizador-historia/arquitectura-espanola/", // 13 períodos, Románico s.XI→Guggenheim y arquitectura paramétrica
  "/visualizador-historia/moda-espanola/",         // 13 períodos, Reyes Católicos→Balenciaga, Loewe e Inditex
  "/visualizador-historia/banca/",                 // 13 períodos, Medici 1397→fintech y criptomonedas

  // Sistema dinámico de Historias — Ruta /visualizador-historia/[slug]/ (2026-05-03)
  "/visualizador-historia/grecia/",               // Grecia Clásica -1100→-146 a.C., 12 hitos, 6 eras
  "/visualizador-historia/roma/",                 // Antigua Roma -753→476 d.C., 10 hitos, 6 eras
  "/visualizador-historia/egipto/",              // Antiguo Egipto -3100→-30 a.C., 10 hitos, 6 eras
  "/visualizador-historia/mesopotamia/",         // Mesopotamia -3500→-539 a.C., 10 hitos, 6 eras
  "/visualizador-historia/otomano/",             // Imperio Otomano 1299→1922, 10 hitos, 6 eras
  "/visualizador-historia/mongol/",              // Imperio Mongol 1206→1368, 10 hitos, 6 eras
  "/visualizador-historia/revolucion-francesa/", // Revolución Francesa 1789→1815, 10 hitos, 6 eras
  "/visualizador-historia/imperio-persa/",       // Imperio Persa Aqueménida -550→-330, 10 hitos, 6 eras
  "/visualizador-historia/japon/",               // Historia de Japón 710→1868, 10 hitos, 6 eras
  "/visualizador-historia/china-dinastias/",     // Grandes Dinastías Chinas -221→1912, 10 hitos, 6 eras
  "/visualizador-historia/primera-guerra-mundial/", // Primera Guerra Mundial 1914→1919, 10 hitos, 6 eras
  "/visualizador-historia/segunda-guerra-mundial/", // Segunda Guerra Mundial 1939→1945, 10 hitos, 6 eras
  "/visualizador-historia/civilizaciones-precolombinas/", // Civilizaciones Precolombinas 250→1532, 10 hitos, 6 eras
  "/visualizador-historia/espana-medieval/",     // España Medieval 409→1492, 10 hitos, 6 eras
  "/visualizador-historia/edad-media-europea/",  // Edad Media Europea 476→1453, 10 hitos, 6 eras
  "/visualizador-historia/renacimiento/",         // El Renacimiento 1397→1600, 10 hitos, 6 eras
  "/visualizador-historia/la-reforma/",           // La Reforma Protestante 1517→1648, 10 hitos, 6 eras
  "/visualizador-historia/las-cruzadas/",         // Las Cruzadas 1095→1291, 10 hitos, 6 eras
  "/visualizador-historia/ilustracion/",          // La Ilustración 1687→1789, 10 hitos, 6 eras
  "/visualizador-historia/cine/",                 // Historia del Cine 1895→presente, 10 hitos, 6 eras (migrado)

  // Temáticas Adicionales — Roadmap v10 EJE C (2026-05-04)
  "/visualizador-historia/historia-descubrimientos-cientificos/", // Descubrimientos Científicos -250→presente
  "/visualizador-historia/historia-india/",                       // Historia India -321→presente
  "/visualizador-historia/historia-bizancio/",                    // Historia Bizancio 330→1453
  "/visualizador-historia/historia-videojuegos-japoneses/",       // Videojuegos Japoneses 1983→presente

  // Períodos y Temas Globales — Roadmap v10 EJE B (2026-05-04)
  "/visualizador-historia/historia-guerra-fria/",    // Guerra Fría 1945→1989, 10 hitos, 6 eras
  "/visualizador-historia/historia-america-latina/", // América Latina 1810→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-electricidad/",   // Historia Electricidad 1831→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-ciencia-espanola/", // Ciencia Española s.X→presente, 10 hitos, 6 eras

  // Grandes Potencias y Naciones — Roadmap v10 EJE A (2026-05-04)
  "/visualizador-historia/historia-eeuu/",        // Historia EE.UU. 1607→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-rusia/",       // Historia Rusia 862→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-reino-unido/", // Historia Reino Unido 1066→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-vikingos/",    // Era Vikinga 793→1100, 10 hitos, 6 eras

  // Grandes Temas Siglo XX-XXI — Roadmap v11 EJE B (2026-05-04)
  "/visualizador-historia/historia-derechos-humanos/",      // Derechos Humanos 1789→presente
  "/visualizador-historia/historia-medicina-contemporanea/", // Medicina Contemporánea 1865→presente
  "/visualizador-historia/historia-economia-mundial/",       // Economía Mundial 1929→presente
  "/visualizador-historia/historia-inteligencia-artificial/", // IA 1950→presente

  // Naciones Pendientes — Roadmap v11 EJE A (2026-05-04)
  "/visualizador-historia/historia-china-moderna/",  // China Moderna 1912→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-japon-moderno/",  // Japón Moderno 1868→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-oriente-medio/",  // Oriente Medio 1916→presente, 10 hitos, 6 eras
  "/visualizador-historia/historia-africa/",          // África 1884→presente, 10 hitos, 6 eras

  // Apps específicas de referencia (2026-05-03)
  "/aditivos-e-alimentarios/",                     // Guía 90 aditivos E: código, categoría, origen, función, alimentos
  "/guia-especias/",                               // Directorio 65 especias: sabor, intensidad, usos, origen, combinaciones, conservación
  "/guia-infusiones/",                             // Directorio 55 plantas para infusión: usos tradicionales, preparación, contraindicaciones
  "/guia-cafe/",                                   // Directorio 38 orígenes de café: especie, altitud, notas de sabor, procesado, cosecha y preparación
  "/guia-te/",                                     // Directorio 40 variedades de té: familia, origen, temperatura, tiempo de infusión y nivel de cafeína
  "/guia-quesos/",                                 // Directorio 55 quesos del mundo: tipo de leche, maduración, notas de sabor, maridaje y D.O.
  "/guia-aceite-oliva/",                           // Directorio 32 variedades de aceite de oliva: país, perfil, intensidad, usos y D.O.
  "/guia-cocteles/",                               // Directorio 45 cócteles clásicos: ingredientes, método, copa, graduación y origen
  "/guia-plantas-interior/",                       // Directorio 40 plantas de interior: luz, riego, toxicidad para mascotas y cuidados
  "/guia-setas/",                                  // Directorio 40 setas: comestibilidad, hábitat, temporada, identificación y avisos de seguridad
  "/guia-superalimentos/",                         // Directorio 40 superalimentos: nutrientes, beneficios, cómo consumirlos y contraindicaciones
  "/guia-cortes-carne/",                           // Directorio 45 cortes de carne: animal, terneza, método de cocción y temperatura ideal
  "/guia-varietales-vino/",                        // Directorio 40 varietales de uva: tipo, cuerpo, taninos, acidez, temperatura de servicio y maridaje
  "/guia-estilos-cerveza/",                        // Directorio 40 estilos de cerveza: IBU, ABV, color EBC, fermentación, temperatura y maridaje
  "/guia-tipos-pan/",                              // Directorio 35 tipos de pan del mundo: harina, fermentación, textura, acompañamientos y curiosidades
  "/guia-tipos-pasta/",                            // Directorio 40 tipos de pasta italianos: forma, región, tiempo de cocción y salsa ideal
  "/guia-tipos-arroz/",                            // Directorio 30 variedades de arroz del mundo: tipo de grano, almidón, región y uso culinario
  "/guia-vinagres-mundo/",                         // Directorio 25 vinagres del mundo: origen, acidez, intensidad y maridaje
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
