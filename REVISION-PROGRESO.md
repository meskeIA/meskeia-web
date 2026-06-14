# REVISION-PROGRESO.md — Lista maestra de revisión (todas las apps)

> Lista maestra **deduplicada por slug** (`url`), generada desde `data/applications.ts`.
> Total de apps: **999**. Cada app aparece UNA sola vez, agrupada bajo su **suite primaria** (primera suite declarada en `applications.ts`), pero la columna "Suites" muestra todas las suites a las que pertenece.

> **Cómo usar este archivo**: al revisar una suite, busca en la columna "Suites" las filas que la contengan (independientemente de bajo qué grupo estén listadas) y marca `[x]` las que ya se han revisado (sin importar en qué sesión/suite se hizo). Así una app revisada en una suite no se vuelve a revisar al auditar otra suite a la que también pertenece.

> **Plan**: 1-2 sesiones/día, ~16 apps/sesión (ritmo del piloto).

> **Regenerar este archivo**: `node scripts/update-revision-checklist.mjs` — preserva las marcas `[x]` existentes y añade apps nuevas que se hayan creado mientras tanto.

## Progreso global

- ✅ Revisadas: 127 / 999
- ⬜ Pendientes: 872 / 999

## Resumen por suite primaria

| Suite primaria | Nº apps |
|---|---|
| Accesibilidad e Inclusión (`accesibilidad`) | 18 |
| Cultura General (`cultura`) | 262 |
| Diseño y Contenido (`diseno`) | 45 |
| Estudiantes (`estudiantes`) | 244 |
| Finanzas e Inversión (`finanzas`) | 58 |
| Freelance y Autónomo (`freelance`) | 38 |
| Herramientas Técnicas (`tecnicas`) | 57 |
| Inmobiliaria y Hogar (`inmobiliaria`) | 46 |
| Juegos y Ocio (`juegos`) | 20 |
| Legal, Fiscal y Patrimonio (`legal-fiscal`) | 45 |
| Productividad (`productividad`) | 34 |
| Salud y Bienestar (`salud`) | 122 |
| Viajes y Turismo (`viajes`) | 10 |
| **Total** | **999** |

---

## Accesibilidad e Inclusión (`accesibilidad`) — 18 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Adaptador de Lectura para Dislexia | `/adaptador-dislexia/` | accesibilidad, salud, productividad, estudiantes |
| [x] | Calculadora de Contraste | `/contraste-colores/` | accesibilidad, diseno |
| [x] | Conversor Braille | `/conversor-braille/` | accesibilidad, cultura |
| [ ] | Conversor de Código Morse | `/conversor-morse/` | accesibilidad, cultura |
| [ ] | Convertidor de Subtítulos | `/convertidor-subtitulos/` | accesibilidad, diseno, tecnicas |
| [ ] | Ejercicios de Vocalización para Parkinson | `/ejercicios-vocalizacion/` | accesibilidad, salud |
| [ ] | Generador de Tarjetas de Comunicación | `/generador-tarjetas-comunicacion/` | accesibilidad, salud, productividad |
| [ ] | Guía de Respiración Consciente | `/guia-respiracion/` | accesibilidad, salud, productividad |
| [ ] | Historias Sociales Visuales | `/historias-sociales/` | accesibilidad, salud, productividad, estudiantes |
| [ ] | Lector de Texto en Voz Alta | `/lector-texto-voz/` | accesibilidad, salud, productividad, estudiantes |
| [ ] | Lupa Digital con Cámara | `/lupa-digital/` | accesibilidad, tecnicas, salud |
| [ ] | Planificador Visual de Rutinas | `/planificador-rutinas/` | accesibilidad, salud, productividad |
| [ ] | Recordatorio Visual de Medicación | `/recordatorio-medicacion/` | accesibilidad, salud, productividad |
| [ ] | Semáforo Emocional | `/semaforo-emocional/` | accesibilidad, salud, productividad, estudiantes |
| [ ] | Simulador de Baja Visión | `/simulador-baja-vision/` | accesibilidad, diseno |
| [x] | Simulador de Daltonismo | `/simulador-daltonismo/` | accesibilidad, diseno |
| [ ] | Tablero de Comunicación AAC | `/tablero-comunicacion/` | accesibilidad, salud, productividad |
| [ ] | Temporizador Visual | `/temporizador-visual/` | accesibilidad, salud, productividad |

## Cultura General (`cultura`) — 262 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | ¿Qué cerveza elegir? | `/que-cerveza-elegir/` | cultura, juegos |
| [ ] | ¿Qué vino elegir? | `/que-vino-elegir/` | cultura, juegos |
| [ ] | Análisis Decisión Reversible vs Irreversible | `/analisis-decision-reversible/` | cultura, productividad |
| [ ] | Anatomía de un Smartphone | `/visualizador-anatomia-smartphone/` | cultura, tecnicas |
| [ ] | Anatomía de un Vuelo | `/visualizador-anatomia-vuelo/` | cultura, tecnicas |
| [ ] | Anatomía de una Ciudad | `/visualizador-ciudad/` | cultura, tecnicas |
| [ ] | Asistente de Reclamaciones al Consumidor | `/asistente-reclamaciones/` | cultura, productividad |
| [ ] | Calculadora de Profundidad de Campo (DoF) | `/calculadora-profundidad-campo/` | cultura, tecnicas |
| [ ] | Calculadora Huella de Carbono | `/calculadora-huella-carbono/` | cultura, inmobiliaria |
| [ ] | Calculadora Regla 500 y NPF (Astrofotografía) | `/calculadora-regla-500-npf-astrofoto/` | cultura, tecnicas |
| [ ] | Checklist de Segunda Opinión | `/checklist-segunda-opinion/` | cultura, productividad |
| [ ] | Cifrado Clásico | `/cifrado-clasico/` | cultura |
| [ ] | Cifrado Playfair | `/cifrado-playfair/` | cultura |
| [ ] | Cifrado por Transposición | `/cifrado-transposicion/` | cultura |
| [ ] | Cifrado Vigenère | `/cifrado-vigenere/` | cultura |
| [ ] | Cinética Química: Arrhenius, Órdenes y Catalizadores | `/visualizador-cinetica-quimica/` | cultura, estudiantes, tecnicas |
| [ ] | Círculo de Quintas | `/visualizador-circulo-quintas/` | cultura, estudiantes |
| [ ] | Civilizaciones Precolombinas: Maya, Azteca e Inca | `/visualizador-historia/civilizaciones-precolombinas/` | cultura |
| [ ] | Colores del Cielo — Evolución 24h | `/visualizador-colores-cielo/` | cultura, diseno |
| [ ] | Cómo Funciona el Clima | `/visualizador-clima/` | cultura, estudiantes |
| [ ] | Cómo Funciona el GPS | `/visualizador-gps/` | cultura, tecnicas |
| [ ] | Cómo Funciona el WiFi | `/visualizador-como-funciona-wifi/` | cultura, tecnicas |
| [ ] | Cómo Funciona Internet en 60 Segundos | `/visualizador-internet-60-segundos/` | cultura, tecnicas |
| [ ] | Cómo Funciona tu Cerebro al Decidir | `/visualizador-sesgos-cognitivos/` | cultura |
| [ ] | Cómo Funciona una Elección | `/visualizador-sistema-electoral/` | cultura |
| [ ] | Cómo Funciona una Pantalla | `/visualizador-pantallas/` | cultura, tecnicas |
| [ ] | Cómo se Construye un Edificio | `/visualizador-construccion-edificio/` | cultura, tecnicas, inmobiliaria |
| [ ] | Cómo se Produce la Energía | `/visualizador-produccion-energia/` | cultura, tecnicas |
| [ ] | Comparador de Voces Narrativas | `/comparador-voces-narrativas/` | cultura, estudiantes |
| [ ] | Configurador Narrativo | `/configurador-narrativo/` | cultura, estudiantes |
| [ ] | Constelaciones del Cielo | `/constelaciones-del-cielo/` | cultura |
| [ ] | Constructor de Personaje | `/constructor-personaje/` | cultura, estudiantes |
| [ ] | Conversor Binario | `/conversor-binario/` | cultura, estudiantes |
| [ ] | Conversor Números Romanos | `/conversor-numeros-romanos/` | cultura |
| [ ] | Cronobiología: Relojes Circadianos, Cronotipos y Cronofarmacología | `/visualizador-cronobiologia/` | cultura, estudiantes, salud |
| [ ] | Cuánta Agua Gastas sin Saberlo | `/visualizador-agua-virtual/` | cultura, salud |
| [ ] | Cuánto Pesa una Decisión | `/visualizador-peso-decisiones/` | cultura, salud, finanzas |
| [ ] | Cuánto Tarda el Mundo | `/visualizador-escalas-tiempo/` | cultura |
| [ ] | Curso de Criptografía y Seguridad | `/curso-criptografia-seguridad/` | cultura, tecnicas |
| [ ] | De la Granja a tu Mesa | `/visualizador-cadena-alimentaria/` | cultura, salud |
| [ ] | Del Mercantilismo al Capitalismo de Plataformas: Historia del Capitalismo | `/visualizador-historia/historia-capitalismo/` | cultura |
| [ ] | Detector de Idioma | `/detector-idioma/` | cultura, productividad |
| [ ] | Detector de Sesgos Cognitivos | `/detector-sesgos-cognitivos/` | cultura, productividad |
| [ ] | Diagnóstico de Brecha IA | `/diagnostico-brecha-ia/` | cultura, productividad |
| [ ] | Economía Circular - De Lineal a Circular | `/visualizador-economia-circular/` | cultura, estudiantes |
| [ ] | El Ciclo de la Desinformación: Cómo se Propaga un Bulo | `/visualizador-desinformacion/` | cultura, diseno |
| [ ] | El Imperio Austro-Húngaro: La Última Gran Monarquía Multinacional | `/visualizador-historia/historia-austria-hungria/` | cultura |
| [ ] | El Imperio Persa Aqueménida: De Ciro a Alejandro | `/visualizador-historia/imperio-persa/` | cultura |
| [ ] | El Islam Clásico: Del Profeta a la Edad de Oro | `/visualizador-historia/historia-islam-clasico/` | cultura |
| [ ] | El Mapa de las Especias | `/visualizador-mapa-especias/` | cultura |
| [ ] | El Mapa de los Idiomas del Mundo | `/visualizador-idiomas-mundo/` | cultura, estudiantes |
| [ ] | El Mapa de tu Tiempo | `/visualizador-mapa-tiempo/` | cultura, productividad, freelance |
| [ ] | El Microbioma — Billones de Aliados en tu Interior | `/visualizador-microbioma/` | cultura, estudiantes, salud |
| [ ] | El Movimiento por los Derechos Humanos: Del Siglo de las Luces a la Agenda 2030 | `/visualizador-historia/historia-derechos-humanos/` | cultura |
| [ ] | El Mundo en 100 Personas | `/visualizador-mundo-100-personas/` | cultura |
| [ ] | El Peso de los Números | `/visualizador-peso-numeros/` | cultura, finanzas |
| [ ] | El Renacimiento: Del Humanismo a la Revolución Científica | `/visualizador-historia/renacimiento/` | cultura |
| [ ] | El Sistema Linfático — El Sistema Olvidado | `/visualizador-sistema-linfatico/` | cultura, estudiantes, salud |
| [ ] | El Viaje de tu Basura | `/visualizador-viaje-basura/` | cultura, salud |
| [ ] | El Viaje de un Paquete | `/visualizador-viaje-paquete/` | cultura, tecnicas |
| [ ] | El Viaje de una Ley | `/visualizador-proceso-legislativo/` | cultura |
| [ ] | Electroquímica: Pilas, Electrólisis y Baterías Li-ion | `/visualizador-electroquimica/` | cultura, estudiantes, tecnicas |
| [ ] | Epigenética: Metilación, Histonas e Imprinting | `/visualizador-epigenetica/` | cultura, estudiantes, salud |
| [ ] | Errores de Escritura Creativa | `/errores-escritura-creativa/` | cultura, estudiantes |
| [ ] | España Contemporánea: De las Guerras Napoleónicas a la Democracia | `/visualizador-historia/espana-contemporanea/` | cultura |
| [ ] | Estadística en la Vida Cotidiana - Probabilidad y Sesgos | `/visualizador-estadistica-cotidiana/` | cultura, estudiantes |
| [ ] | Estilos Arquitectónicos: Cronología del Griego Clásico a la Arquitectura Sostenible | `/visualizador-arquitectura-estilos/` | cultura, diseno |
| [ ] | Estilos y Movimientos Literarios | `/visualizador-estilos-literarios/` | cultura, estudiantes |
| [ ] | Estratificación Social: Clases, Gini, Movilidad y Teorías Sociológicas | `/visualizador-estratificacion-social/` | cultura, estudiantes |
| [ ] | Evaluador de Prompts | `/evaluador-prompts/` | cultura, productividad |
| [ ] | Evolución Humana - De los Primeros Homínidos al Homo Sapiens | `/visualizador-evolucion-humana/` | cultura, estudiantes |
| [ ] | Falacias Lógicas - Guía Visual de Errores de Razonamiento | `/visualizador-falacias-logicas/` | cultura, estudiantes |
| [ ] | Falsos Amigos Español-Inglés: Catálogo y Práctica | `/falsos-amigos-ingles/` | cultura, estudiantes |
| [ ] | Flujos Migratorios Globales: Mapa 2024 | `/visualizador-migracion-global/` | cultura |
| [ ] | Francia Contemporánea: De la Tercera República a Macron | `/visualizador-historia/historia-francia-contemporanea/` | cultura |
| [x] | Generador de Anagramas | `/generador-anagramas/` | cultura, juegos |
| [ ] | Generador de Íncipit | `/generador-incipit/` | cultura, estudiantes |
| [ ] | Generador de Poemas por Forma | `/generador-poemas/` | cultura, estudiantes |
| [ ] | Geopolítica de los Recursos - Petróleo, Litio y Tierras Raras | `/visualizador-geopolitica-recursos/` | cultura, estudiantes |
| [ ] | Grandes Géneros de la Novela | `/visualizador-generos-novela/` | cultura |
| [ ] | Guía de Aves Comunes | `/guia-aves-comunes/` | cultura, salud |
| [ ] | Guía de Comentario de Texto | `/guia-comentario-texto/` | cultura, estudiantes |
| [ ] | Guía de Estilos de Cerveza | `/guia-estilos-cerveza/` | cultura, juegos |
| [ ] | Guía de Maderas | `/guia-maderas/` | cultura, tecnicas |
| [ ] | Guía de Métrica y Estrofas | `/guia-metrica-estrofas/` | cultura, estudiantes |
| [ ] | Guía de Tejidos y Fibras | `/guia-tejidos-fibras/` | cultura, tecnicas |
| [ ] | Guía de Tipos de Arroz | `/guia-tipos-arroz/` | cultura, salud |
| [ ] | Guía de Tipos de Pan | `/guia-tipos-pan/` | cultura, salud |
| [ ] | Guía de Tipos de Pasta | `/guia-tipos-pasta/` | cultura, salud |
| [ ] | Guía de Varietales de Vino | `/guia-varietales-vino/` | cultura, juegos |
| [ ] | Guía de Vinagres del Mundo | `/guia-vinagres-mundo/` | cultura, salud |
| [ ] | Hipertensión — Qué le Ocurre al Cuerpo con la Presión Alta | `/visualizador-hipertension/` | cultura, estudiantes, salud |
| [ ] | Historia de África: De Berlín a la Potencia Emergente | `/visualizador-historia/historia-africa/` | cultura |
| [ ] | Historia de Alemania: Del Imperio al Motor de Europa | `/visualizador-historia/historia-alemania/` | cultura |
| [ ] | Historia de América Latina: De las Independencias al Siglo XXI | `/visualizador-historia/historia-america-latina/` | cultura |
| [ ] | Historia de Argentina: De la Revolución de Mayo a la Argentina Contemporánea | `/visualizador-historia/argentina/` | cultura, estudiantes |
| [ ] | Historia de Australia: De los Aborígenes al Commonwealth del Siglo XXI | `/visualizador-historia/australia/` | cultura, estudiantes |
| [ ] | Historia de Bizancio: Del Traslado de Roma a la Caída de Constantinopla | `/visualizador-historia/historia-bizancio/` | cultura |
| [ ] | Historia de Brasil: Del Imperio a la República del Siglo XXI | `/visualizador-historia/brasil-moderno/` | cultura, estudiantes |
| [ ] | Historia de Canadá: De la Nueva Francia al Estado Multicultural | `/visualizador-historia/canada/` | cultura, estudiantes |
| [ ] | Historia de Centroamérica: De la Independencia al Corredor de la Migración | `/visualizador-historia/centroamerica/` | cultura, estudiantes |
| [ ] | Historia de Chile: De la Independencia a la Chile Contemporánea | `/visualizador-historia/chile/` | cultura, estudiantes |
| [ ] | Historia de Colombia: De la Independencia al Proceso de Paz | `/visualizador-historia/colombia/` | cultura, estudiantes |
| [ ] | Historia de Corea: De los Tres Reinos a la Península Dividida | `/visualizador-historia/corea/` | cultura, estudiantes |
| [ ] | Historia de Cuba: De la Guerra de los Diez Años a la Cuba Contemporánea | `/visualizador-historia/cuba/` | cultura, estudiantes |
| [ ] | Historia de Escandinavia: De los Vikingos al Estado del Bienestar | `/visualizador-historia/escandinavia/` | cultura, estudiantes |
| [ ] | Historia de Internet: Cronología de ARPANET a la IA Generativa | `/visualizador-historia/internet/` | cultura, tecnicas |
| [ ] | Historia de Italia: Del Risorgimento al Motor de la Cultura Europea | `/visualizador-historia/historia-italia/` | cultura |
| [ ] | Historia de Japón: De la Corte Imperial a la Restauración Meiji | `/visualizador-historia/japon/` | cultura |
| [ ] | Historia de la Agricultura: De la Revolución Neolítica a la Agricultura de Precisión | `/visualizador-historia/historia-agricultura/` | cultura |
| [ ] | Historia de la Antigua Grecia: Del Período Oscuro a Roma | `/visualizador-historia/grecia/` | cultura |
| [ ] | Historia de la Antigua Roma: De Rómulo a la Caída del Imperio | `/visualizador-historia/roma/` | cultura |
| [ ] | Historia de la Arquitectura Española: Del Románico al Guggenheim | `/visualizador-historia/arquitectura-espanola/` | cultura, tecnicas |
| [ ] | Historia de la Arquitectura Moderna: Del Crystal Palace a la IA | `/visualizador-historia/historia-arquitectura-moderna/` | cultura |
| [ ] | Historia de la Astronomía: De Stonehenge al Telescopio James Webb | `/visualizador-historia/astronomia/` | cultura |
| [ ] | Historia de la Aviación: De los Hermanos Wright a la Aviación Eléctrica | `/visualizador-historia/aviacion/` | cultura, tecnicas |
| [ ] | Historia de la Banca: De los Medici al Fintech y las Criptomonedas | `/visualizador-historia/banca/` | cultura, finanzas |
| [ ] | Historia de la Cartografía: De los Primeros Mapas al GPS y los SIG | `/visualizador-historia/cartografia/` | cultura, estudiantes |
| [ ] | Historia de la China Moderna: De la República a la Superpotencia | `/visualizador-historia/historia-china-moderna/` | cultura |
| [ ] | Historia de la Ciencia Española: De Al-Ándalus al CERN | `/visualizador-historia/historia-ciencia-espanola/` | cultura |
| [ ] | Historia de la Danza: De los Rituales Egipcios al Breaking Olímpico | `/visualizador-historia/danza/` | cultura |
| [ ] | Historia de la Economía Mundial: Del Crack del 29 al Siglo XXI | `/visualizador-historia/historia-economia-mundial/` | cultura, finanzas |
| [ ] | Historia de la Educación: De la Academia de Platón al Aula Digital | `/visualizador-historia/historia-educacion/` | cultura |
| [ ] | Historia de la Electricidad: De Faraday a las Redes Inteligentes | `/visualizador-historia/historia-electricidad/` | cultura, tecnicas |
| [ ] | Historia de la Energía: Del Fuego Prehistórico a la Fusión Nuclear | `/visualizador-historia/energia/` | cultura, tecnicas |
| [ ] | Historia de la Estadística: Del Censo Babilónico al Big Data e IA | `/visualizador-historia/estadistica/` | cultura, estudiantes |
| [ ] | Historia de la Ética: De Sócrates a la Inteligencia Artificial | `/visualizador-historia/historia-etica/` | cultura |
| [ ] | Historia de la Exploración: De los Fenicios a las Misiones a Marte | `/visualizador-historia/exploracion/` | cultura |
| [ ] | Historia de la Filosofía: Corrientes desde los Presocráticos al Posmodernismo | `/visualizador-filosofia/` | cultura |
| [ ] | Historia de la Física: De los Griegos a la Física de Cuerdas | `/visualizador-historia/fisica/` | cultura |
| [ ] | Historia de la Fotografía: Del Daguerrotipo a la IA Generativa | `/visualizador-historia/fotografia/` | cultura |
| [ ] | Historia de la Gastronomía: Del Fuego Neolítico a la IA Culinaria | `/visualizador-historia/gastronomia/` | cultura |
| [ ] | Historia de la Higiene y la Salud Pública: De Mohenjo-daro a la OMS | `/visualizador-historia/higiene-salud-publica/` | cultura, estudiantes |
| [ ] | Historia de la India: Del Imperio Maurya a la Superpotencia Tecnológica | `/visualizador-historia/historia-india/` | cultura |
| [ ] | Historia de la Inteligencia Artificial: De Turing a GPT | `/visualizador-historia/historia-inteligencia-artificial/` | cultura, tecnicas |
| [ ] | Historia de la Medicina Contemporánea: De Pasteur a las Vacunas mRNA | `/visualizador-historia/historia-medicina-contemporanea/` | cultura, salud |
| [ ] | Historia de la Medicina: Cronología de Hipócrates a la Medicina de Precisión | `/visualizador-historia/medicina/` | cultura |
| [ ] | Historia de la Moda Española: De los Reyes Católicos a Inditex | `/visualizador-historia/moda-espanola/` | cultura, diseno |
| [ ] | Historia de la Moda: Del Renacimiento a la Moda Sostenible | `/visualizador-historia/moda/` | cultura, juegos |
| [ ] | Historia de la Música Popular: Del Blues al Streaming | `/visualizador-historia/historia-musica-popular/` | cultura, juegos |
| [ ] | Historia de la Prensa: De Gutenberg al Periodismo Digital e IA | `/visualizador-historia/prensa/` | cultura, tecnicas |
| [ ] | Historia de la Psicología: De Platón a la IA Terapéutica | `/visualizador-historia/psicologia/` | cultura, salud |
| [ ] | Historia de la Publicidad: De Gutenberg a la IA Generativa | `/visualizador-historia/publicidad/` | cultura, diseno |
| [ ] | Historia de la Química: De la Alquimia a la Química Computacional | `/visualizador-historia/quimica/` | cultura |
| [ ] | Historia de la Radio: De Marconi al Podcast con IA | `/visualizador-historia/radio/` | cultura, tecnicas |
| [ ] | Historia de la República Dominicana: De la Independencia al Caribe del Siglo XXI | `/visualizador-historia/republica-dominicana/` | cultura, estudiantes |
| [ ] | Historia de la Robótica: De Čapek a la IA Encarnada | `/visualizador-historia/robotica/` | cultura, tecnicas |
| [ ] | Historia de la Televisión: De Baird a la TV con IA | `/visualizador-historia/television/` | cultura, tecnicas |
| [ ] | Historia de la Vejez y la Longevidad: De la Antigüedad a la Ciencia Longevity | `/visualizador-historia/vejez-longevidad/` | cultura, estudiantes |
| [ ] | Historia de la Vivienda: De las Primeras Construcciones a la Crisis de Asequibilidad | `/visualizador-historia/vivienda/` | cultura, estudiantes |
| [ ] | Historia de las Constituciones y la Democracia: De la Magna Carta al Siglo XXI | `/visualizador-historia/historia-constituciones/` | cultura |
| [ ] | Historia de las Criptomonedas y Blockchain: De Bitcoin al Mercado Institucional | `/visualizador-historia/criptomonedas/` | cultura, tecnicas |
| [ ] | Historia de las Epidemias: Cronología, Mortalidad y Legado Médico | `/visualizador-historia/epidemias/` | cultura, salud |
| [ ] | Historia de las Especias y las Rutas Comerciales: De Arabia a los Mercados Globales | `/visualizador-historia/especias-rutas-comerciales/` | cultura, estudiantes |
| [ ] | Historia de las Matemáticas: De Babilonia a la IA Matemática | `/visualizador-historia/matematicas/` | cultura |
| [ ] | Historia de las Redes Sociales: De SixDegrees a la Era de la IA Social | `/visualizador-historia/redes-sociales/` | cultura, tecnicas |
| [ ] | Historia de los Aztecas: De Aztlán a la Caída de Tenochtitlan | `/visualizador-historia/azteca/` | cultura, estudiantes |
| [ ] | Historia de los Derechos Humanos: Cronología de la Magna Carta a los Derechos Digitales | `/visualizador-derechos-humanos/` | cultura |
| [ ] | Historia de los Descubrimientos Científicos: De Arquímedes al CRISPR | `/visualizador-historia/historia-descubrimientos-cientificos/` | cultura |
| [ ] | Historia de los Diccionarios y Enciclopedias: De los Escribas a Wikipedia | `/visualizador-historia/diccionarios-enciclopedias/` | cultura, estudiantes |
| [ ] | Historia de los Estados Unidos: De las Colonias a la Superpotencia | `/visualizador-historia/historia-eeuu/` | cultura |
| [ ] | Historia de los Idiomas del Mundo: De las Primeras Lenguas al Inglés Global | `/visualizador-historia/idiomas-mundo/` | cultura, estudiantes |
| [ ] | Historia de los Mayas: De las Primeras Aldeas al Fin del Mundo Clásico | `/visualizador-historia/maya/` | cultura, estudiantes |
| [ ] | Historia de los Olmecas: La Civilización Madre de Mesoamérica | `/visualizador-historia/olmeca/` | cultura, estudiantes |
| [ ] | Historia de los Ordenadores: De Babbage a la IA Cuántica | `/visualizador-historia/ordenadores/` | cultura, tecnicas |
| [ ] | Historia de los Países Bajos: De los Frisios a la Holanda Moderna | `/visualizador-historia/paises-bajos/` | cultura, estudiantes |
| [ ] | Historia de los Toltecas: El Imperio de Tula y la Leyenda de Quetzalcóatl | `/visualizador-historia/tolteca/` | cultura, estudiantes |
| [ ] | Historia de los Viajes Espaciales: De Gagarin a Starship | `/visualizador-historia/viajes-espaciales/` | cultura, tecnicas |
| [ ] | Historia de los Videojuegos Españoles: De la Edad de Oro a Metroid Dread | `/visualizador-historia/videojuegos-espanoles/` | cultura, juegos |
| [ ] | Historia de los Videojuegos Japoneses: De Nintendo a los Gacha | `/visualizador-historia/historia-videojuegos-japoneses/` | cultura, juegos |
| [ ] | Historia de los Videojuegos: De Pong a la IA Generativa | `/visualizador-historia/videojuegos/` | cultura, juegos |
| [ ] | Historia de Mesopotamia: La Cuna de la Civilización | `/visualizador-historia/mesopotamia/` | cultura |
| [ ] | Historia de México: Del Grito de Dolores a la México Contemporánea | `/visualizador-historia/mexico-moderno/` | cultura, estudiantes |
| [ ] | Historia de Perú: De la Independencia al Perú Contemporáneo | `/visualizador-historia/peru/` | cultura, estudiantes |
| [ ] | Historia de Polonia: Del Bautismo de Mieszko I a la Polonia Contemporánea | `/visualizador-historia/polonia/` | cultura, estudiantes |
| [ ] | Historia de Puerto Rico: De la Colonia Española al Estado Libre Asociado | `/visualizador-historia/puerto-rico/` | cultura, estudiantes |
| [ ] | Historia de Rusia: De Rurik al Siglo XXI | `/visualizador-historia/historia-rusia/` | cultura |
| [ ] | Historia de Silicon Valley: Del Garaje de HP a la Era de la IA | `/visualizador-historia/silicon-valley/` | cultura, tecnicas |
| [ ] | Historia de Uruguay: De la Independencia a la Democracia Plena | `/visualizador-historia/uruguay/` | cultura, estudiantes |
| [ ] | Historia de Venezuela: Del Libertador a la Venezuela Contemporánea | `/visualizador-historia/venezuela/` | cultura, estudiantes |
| [ ] | Historia del Antiguo Egipto: De los Faraones a Cleopatra | `/visualizador-historia/egipto/` | cultura |
| [ ] | Historia del Automóvil: De Benz al Coche Eléctrico Autónomo | `/visualizador-historia/automocion/` | cultura, tecnicas |
| [ ] | Historia del Azúcar: De Papua Nueva Guinea a la Crisis Global de Salud | `/visualizador-historia/azucar/` | cultura, estudiantes |
| [ ] | Historia del Chocolate: Del Cacao Sagrado de los Mayas a la Industria Global | `/visualizador-historia/chocolate/` | cultura, estudiantes |
| [ ] | Historia del Cine: De los Lumière a la Inteligencia Artificial | `/visualizador-historia/cine/` | cultura |
| [ ] | Historia del Clima: De la Última Glaciación a la Emergencia Climática | `/visualizador-historia/clima/` | cultura, tecnicas |
| [ ] | Historia del Comercio Mundial: De Mesopotamia al E-Commerce Global | `/visualizador-historia/historia-comercio/` | cultura |
| [ ] | Historia del Cómic: De Töpffer a la IA Generativa | `/visualizador-historia/comics/` | cultura, juegos |
| [ ] | Historia del Deporte: De los Juegos Olímpicos Griegos a los eSports | `/visualizador-historia/deporte/` | cultura, juegos |
| [ ] | Historia del Derecho: De Hammurabi al Derecho Digital | `/visualizador-historia/historia-derecho/` | cultura |
| [ ] | Historia del Fútbol: De las FA Rules al Fútbol Global | `/visualizador-historia/historia-futbol/` | cultura, juegos |
| [ ] | Historia del Imperio Inca: Del Lago Titicaca al Tawantinsuyu | `/visualizador-historia/inca/` | cultura, estudiantes |
| [ ] | Historia del Imperio Mongol: De Gengis Kan a la Dinastía Yuan | `/visualizador-historia/mongol/` | cultura |
| [ ] | Historia del Imperio Otomano: De Osmán a Atatürk | `/visualizador-historia/otomano/` | cultura |
| [ ] | Historia del Japón Moderno: De Meiji al Siglo XXI | `/visualizador-historia/historia-japon-moderno/` | cultura |
| [ ] | Historia del Ocio: Del Circo Romano al Streaming Global | `/visualizador-historia/historia-ocio/` | cultura |
| [ ] | Historia del Oriente Medio: De Sykes-Picot al Siglo XXI | `/visualizador-historia/historia-oriente-medio/` | cultura |
| [ ] | Historia del Pensamiento Político: De Platón al Populismo del Siglo XXI | `/visualizador-historia/historia-pensamiento-politico/` | cultura |
| [ ] | Historia del Periodismo: De la Acta Diurna a la IA Generativa | `/visualizador-historia/historia-periodismo/` | cultura, estudiantes |
| [ ] | Historia del Reino Unido: De la Conquista Normanda al Brexit | `/visualizador-historia/historia-reino-unido/` | cultura |
| [ ] | Historia del Sudeste Asiático: De Angkor al ASEAN del Siglo XXI | `/visualizador-historia/sudeste-asiatico/` | cultura, estudiantes |
| [ ] | Historia del Teatro: Del Teatro Griego al Teatro Digital | `/visualizador-historia/teatro/` | cultura |
| [ ] | Historia del Teléfono: De Bell al 5G y la IA Conversacional | `/visualizador-historia/telefono/` | cultura, tecnicas |
| [ ] | Historia del Trabajo: De la Esclavitud Antigua al Teletrabajo del Siglo XXI | `/visualizador-historia/historia-trabajo/` | cultura |
| [ ] | Historia del Tren: Del Vapor al AVE y el Maglev | `/visualizador-historia/tren/` | cultura, tecnicas |
| [ ] | Historia del Turismo: Del Grand Tour al Turismo Sostenible | `/visualizador-historia/historia-turismo/` | cultura |
| [ ] | Historia del Urbanismo: De Uruk a la Ciudad Inteligente | `/visualizador-historia/urbanismo/` | cultura, estudiantes |
| [ ] | Historia Económica de España: Del Imperio Colonial a Europa | `/visualizador-historia/economia-espana/` | cultura, finanzas |
| [ ] | Instrumentos Musicales | `/instrumentos-musicales/` | cultura |
| [ ] | La Conquista de América: Choque de Civilizaciones | `/visualizador-historia/historia-conquista-america/` | cultura |
| [ ] | La Edad Media Europea: De la Caída de Roma a Constantinopla | `/visualizador-historia/edad-media-europea/` | cultura |
| [ ] | La Era Vikinga: Expansión, Comercio y Exploración (793-1100) | `/visualizador-historia/historia-vikingos/` | cultura |
| [ ] | La España Antigua: De Tartessos a Hispania Romana | `/visualizador-historia/espana-antigua/` | cultura, estudiantes |
| [ ] | La España de los Austrias: Del Imperio Universal al Ocaso | `/visualizador-historia/espana-austrias/` | cultura |
| [ ] | La España de los Borbones: De Utrecht a Bayona | `/visualizador-historia/espana-borbones/` | cultura |
| [ ] | La España Medieval: De los Visigodos a los Reyes Católicos | `/visualizador-historia/espana-medieval/` | cultura |
| [ ] | La Evolución de la Escritura | `/visualizador-historia-escritura/` | cultura, estudiantes |
| [ ] | La Evolución del Dinero | `/visualizador-historia-dinero/` | cultura, finanzas |
| [ ] | La Guerra Fría: De Yalta a la Caída del Muro (1945-1989) | `/visualizador-historia/historia-guerra-fria/` | cultura, tecnicas |
| [ ] | La Ilustración: De Newton a la Revolución Francesa | `/visualizador-historia/ilustracion/` | cultura |
| [ ] | La Inflamación — Aliada y Enemiga del Cuerpo | `/visualizador-inflamacion/` | cultura, estudiantes, salud |
| [ ] | La Primera Guerra Mundial: De Sarajevo al Tratado de Versalles | `/visualizador-historia/primera-guerra-mundial/` | cultura |
| [ ] | La Reforma Protestante: De Lutero a la Paz de Westfalia | `/visualizador-historia/la-reforma/` | cultura |
| [ ] | La Revolución Francesa: De la Bastilla a Waterloo | `/visualizador-historia/revolucion-francesa/` | cultura |
| [ ] | La Segunda Guerra Mundial: De la Invasión de Polonia a Hiroshima | `/visualizador-historia/segunda-guerra-mundial/` | cultura |
| [ ] | La Unión Europea: De las Cenizas de la Guerra a la Integración | `/visualizador-historia/historia-union-europea/` | cultura |
| [ ] | Las Cruzadas: De Clermont a la Caída de Acre | `/visualizador-historia/las-cruzadas/` | cultura |
| [ ] | Las Grandes Dinastías Chinas: De Qin a la República | `/visualizador-historia/china-dinastias/` | cultura |
| [ ] | Las Guerras Napoleónicas: Europa en Llamas (1799-1815) | `/visualizador-historia/guerras-napoleonicas/` | cultura, estudiantes |
| [ ] | Los Números de la Música | `/visualizador-matematicas-musica/` | cultura, estudiantes |
| [ ] | Los Números del Océano | `/visualizador-oceano/` | cultura, estudiantes |
| [ ] | Mapa de Automatización Personal | `/mapa-automatizacion-personal/` | cultura, productividad |
| [ ] | Microbiología: Bacterias, Crecimiento y Tres Dominios de la Vida | `/visualizador-microbiologia/` | cultura, estudiantes, salud |
| [ ] | Minerales del Mundo | `/minerales-del-mundo/` | cultura |
| [ ] | Movimientos Artísticos: Historia del Arte desde el Románico hasta el Arte Digital | `/visualizador-arte-movimientos/` | cultura |
| [ ] | Movimientos Literarios: Cronología de la Épica Griega al Posmodernismo | `/visualizador-literatura-movimientos/` | cultura |
| [ ] | Movimientos Musicales: Cronología del Gregoriano a la Música Electrónica | `/visualizador-musica-movimientos/` | cultura |
| [ ] | Narratología Visual | `/visualizador-narratologia/` | cultura, estudiantes |
| [ ] | Orientador de Escritura Creativa | `/orientador-escritura-creativa/` | cultura, productividad |
| [ ] | Osteoporosis — El Ciclo de Remodelado Óseo | `/visualizador-osteoporosis/` | cultura, estudiantes, salud |
| [x] | Países del Mundo | `/paises-del-mundo/` | cultura, viajes |
| [ ] | Pirámide de Población: España 1950-2100 | `/visualizador-piramide-poblacion/` | cultura, estudiantes |
| [ ] | Portugal y el Ultramar: El Primer Imperio Global | `/visualizador-historia/historia-portugal-ultramar/` | cultura |
| [ ] | Prehistoria: De los Primeros Homínidos a las Primeras Ciudades | `/visualizador-historia/historia-prehistoria/` | cultura |
| [ ] | Puntos de Inflexión Climáticos - Tipping Points | `/visualizador-cambio-climatico-tipping-points/` | cultura, estudiantes |
| [ ] | Quiz de Literatura Universal | `/quiz-literatura-universal/` | cultura, estudiantes |
| [ ] | Quiz de Métrica y Estrofas | `/quiz-metrica-estrofas/` | cultura, estudiantes |
| [ ] | Quiz: Mitos y Realidades de la Ciencia | `/quiz-mitos-ciencia/` | cultura, estudiantes |
| [ ] | Recursos Literarios | `/visualizador-recursos-literarios/` | cultura, estudiantes |
| [ ] | Revoluciones Industriales: Cronología de la Máquina de Vapor a la Industria 5.0 | `/visualizador-revoluciones-industriales/` | cultura, tecnicas |
| [ ] | Selector de Tipo de Alojamiento | `/selector-tipo-alojamiento/` | cultura, productividad |
| [x] | Simulador de Balance de Blancos (2500K-10000K) | `/simulador-balance-blancos/` | cultura, tecnicas |
| [x] | Simulador de Fotografía: Triángulo de Exposición | `/simulador-fotografia/` | cultura, tecnicas |
| [ ] | Termodinámica Química: ΔG, Equilibrio y Le Chatelier | `/visualizador-termodinamica-quimica/` | cultura, estudiantes, tecnicas |
| [ ] | Test de Dependencia Tecnológica | `/test-dependencia-tecnologica/` | cultura, productividad |
| [ ] | Test de Pensamiento de Grupo | `/test-pensamiento-grupo/` | cultura, productividad |
| [ ] | Test: ¿Qué tipo de lector eres? | `/test-tipo-lector/` | cultura |
| [ ] | Transpositor de Acordes | `/transpositor-acordes/` | cultura, estudiantes |
| [ ] | Urbanismo: Modelos Urbanos, Densidad, Movilidad y Sostenibilidad | `/visualizador-urbanismo/` | cultura, tecnicas |
| [ ] | Visualizador de Escalas Musicales | `/visualizador-escalas-musicales/` | cultura, estudiantes |
| [ ] | Visualizador de Estructuras Narrativas | `/visualizador-estructuras-narrativas/` | cultura, estudiantes |
| [ ] | Visualizador de Focales Fotográficas (14/24/50/85/200 mm) | `/visualizador-focales-fotografia/` | cultura, tecnicas |

## Diseño y Contenido (`diseno`) — 45 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Analizador de Densidad SEO | `/analizador-densidad-seo/` | diseno |
| [ ] | Analizador de Títulos SEO | `/analizador-titulos-seo/` | diseno |
| [ ] | Analizador GEO/AEO | `/analizador-geo/` | diseno |
| [x] | Calculadora de Aspectos | `/calculadora-aspectos/` | diseno |
| [ ] | Calculadora de Legibilidad | `/calculadora-legibilidad/` | diseno |
| [ ] | Calculadora Tiempo de Lectura | `/calculadora-tiempo-lectura/` | diseno |
| [ ] | Comparador de Textos | `/comparador-textos/` | diseno, productividad |
| [ ] | Compresor de Imágenes por Lotes | `/compresor-imagenes/` | diseno |
| [ ] | Contador de Palabras | `/contador-palabras/` | diseno, productividad |
| [ ] | Conversor Base64 | `/conversor-base64/` | diseno, tecnicas |
| [ ] | Conversor de Colores | `/conversor-colores/` | diseno |
| [ ] | Conversor de Imágenes | `/conversor-imagenes/` | diseno, productividad |
| [ ] | Conversor Markdown-HTML | `/conversor-markdown-html/` | diseno |
| [x] | Creador de Paletas | `/creador-paletas/` | diseno |
| [ ] | Creador de Thumbnails YouTube | `/creador-thumbnails/` | diseno |
| [ ] | Curso de Emprendimiento | `/curso-emprendimiento/` | diseno, cultura |
| [ ] | Curso de Empresa Familiar | `/curso-empresa-familiar/` | diseno, cultura |
| [ ] | Curso de Estrategia Empresarial | `/curso-estrategia-empresarial/` | diseno, cultura |
| [ ] | Curso de Marketing Digital 2025 | `/curso-marketing-digital/` | diseno, cultura |
| [x] | Curso de Negociación Exitosa | `/curso-negociacion/` | diseno, cultura |
| [x] | Curso de Optimización para IAs (GEO/AEO) | `/curso-optimizacion-ia/` | diseno, cultura |
| [ ] | Editor EXIF | `/editor-exif/` | diseno, tecnicas |
| [ ] | Generador de Avatares | `/generador-avatares/` | diseno |
| [ ] | Generador de Carruseles | `/generador-carruseles/` | diseno |
| [ ] | Generador de Códigos de Barras | `/generador-codigos-barras/` | diseno, productividad |
| [ ] | Generador de Códigos QR | `/generador-qr/` | diseno, productividad |
| [ ] | Generador de Enlaces UTM | `/generador-utm/` | diseno |
| [x] | Generador de Gradientes | `/generador-gradientes/` | diseno |
| [ ] | Generador de Hashtags | `/generador-hashtags/` | diseno |
| [ ] | Generador de Iconos PWA | `/generador-iconos/` | diseno |
| [ ] | Generador de Meta Descripciones | `/generador-meta-descripciones/` | diseno |
| [ ] | Generador de Nombres | `/generador-nombres-empresa/` | diseno, freelance |
| [ ] | Generador de Palabras Clave | `/generador-palabras-clave/` | diseno |
| [ ] | Generador de Schema Markup | `/generador-schema-markup/` | diseno |
| [ ] | Generador de Sombras | `/generador-sombras/` | diseno |
| [ ] | Generador de Tipografías | `/generador-tipografias/` | diseno |
| [ ] | Generador Imágenes OG | `/generador-og-images/` | diseno |
| [ ] | Generador Lorem Ipsum | `/generador-lorem-ipsum/` | diseno |
| [x] | Playground SQL | `/playground-sql/` | diseno, estudiantes |
| [ ] | Recortador de Audio | `/recortador-audio/` | diseno, productividad |
| [ ] | Selector de Canal de Venta | `/selector-canal-venta/` | diseno, freelance |
| [x] | Simulador de Puertas Lógicas | `/simulador-puertas-logicas/` | diseno, estudiantes |
| [ ] | Validador JSON | `/validador-json/` | diseno, tecnicas |
| [ ] | Validador RegEx | `/validador-regex/` | diseno, tecnicas |
| [x] | Visualizador de Algoritmos | `/visualizador-algoritmos/` | diseno, estudiantes |

## Estudiantes (`estudiantes`) — 244 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Adaptaciones de las Plantas — Hábitats Extremos y Carnívoras | `/visualizador-adaptaciones-plantas/` | estudiantes, cultura, salud |
| [ ] | ADN y Código Genético - De la Doble Hélice a la Proteína | `/visualizador-adn-codigo-genetico/` | estudiantes, cultura |
| [ ] | Agujeros Negros: Anatomía, Hawking y Espaguetización | `/visualizador-agujeros-negros/` | estudiantes, cultura |
| [ ] | Álgebra Lineal: Vectores, Transformaciones y Eigenvalores | `/visualizador-algebra-lineal/` | estudiantes, tecnicas |
| [ ] | Alzheimer y Parkinson: Mecanismo Neurobiológico | `/visualizador-alzheimer-parkinson/` | estudiantes, cultura, salud |
| [ ] | Anatomía de una Flor - De la Polinización al Fruto | `/visualizador-anatomia-flor/` | estudiantes, cultura |
| [ ] | Arquitectura del Computador — CPU, Ciclo FDE y Jerarquía de Memoria | `/visualizador-arquitectura-computador/` | estudiantes, tecnicas |
| [ ] | Biomas Terrestres: Clima, Fauna y Conservación | `/visualizador-biomas-terrestres/` | estudiantes, cultura |
| [ ] | Biomoléculas - Los 4 Ingredientes de la Vida | `/visualizador-biomoleculas/` | estudiantes, cultura |
| [ ] | Cadenas de Suministro Globales: JIT, Disrupciones y Reshoring | `/visualizador-cadenas-suministro/` | estudiantes, cultura, productividad |
| [ ] | Calculadora Álgebra Abstracta | `/calculadora-algebra-abstracta/` | estudiantes |
| [x] | Calculadora de Álgebra Booleana | `/calculadora-algebra-booleana/` | estudiantes, tecnicas |
| [ ] | Calculadora de Cálculo | `/calculadora-calculo/` | estudiantes |
| [ ] | Calculadora de Distribuciones | `/calculadora-distribuciones/` | estudiantes |
| [ ] | Calculadora de Ecuaciones | `/algebra-ecuaciones/` | estudiantes |
| [x] | Calculadora de Electricidad | `/calculadora-electricidad/` | estudiantes |
| [x] | Calculadora de Geometría | `/calculadora-geometria/` | estudiantes |
| [x] | Calculadora de Movimiento | `/calculadora-movimiento/` | estudiantes |
| [x] | Calculadora de Notas | `/calculadora-notas/` | estudiantes |
| [ ] | Calculadora de Probabilidad | `/calculadora-probabilidad/` | estudiantes |
| [ ] | Calculadora de Sistemas Numéricos | `/calculadora-sistemas-numericos/` | estudiantes, tecnicas |
| [ ] | Calculadora de Trigonometría | `/calculadora-trigonometria/` | estudiantes |
| [x] | Calculadora Estadística | `/calculadora-estadistica/` | estudiantes |
| [x] | Calculadora Matemática Avanzada | `/calculadora-matematica/` | estudiantes |
| [ ] | Calculadora MCD y MCM | `/calculadora-mcd-mcm/` | estudiantes |
| [ ] | Calculadora Teoría de Colas | `/calculadora-teoria-colas/` | estudiantes |
| [ ] | Calculadora Teoría de Números | `/calculadora-teoria-numeros/` | estudiantes |
| [ ] | Cálculo Visual: Límites, Derivadas e Integrales | `/visualizador-calculo-visual/` | estudiantes, tecnicas |
| [ ] | Cáncer: Biología Molecular, Hallmarks e Inmunoterapia | `/visualizador-cancer/` | estudiantes, cultura, salud |
| [ ] | Caos y Mariposa: El Atractor de Lorenz | `/visualizador-caos-mariposa/` | estudiantes, cultura, tecnicas |
| [ ] | Capas de la Tierra - Del Suelo al Núcleo | `/visualizador-capas-tierra/` | estudiantes, cultura |
| [ ] | Cartografía y Proyecciones - Por qué Todos los Mapas Mienten | `/visualizador-cartografia-proyecciones/` | estudiantes, cultura |
| [ ] | Ciclo de Replicación Viral: Cómo se Reproducen los Virus | `/visualizador-ciclo-viral/` | estudiantes, cultura, salud |
| [ ] | Ciclo del Carbono Completo: Reservorios y Flujos | `/visualizador-ciclo-carbono-completo/` | estudiantes, cultura |
| [ ] | Ciclo del Nitrógeno: Fijación, Nitrificación y Ciclos Biogeoquímicos | `/visualizador-ciclo-nitrogeno/` | estudiantes, cultura |
| [ ] | Ciclo Menstrual: Fases y Hormonas | `/visualizador-ciclo-menstrual/` | estudiantes, salud |
| [ ] | Circuitos Electrónicos: R-L-C, Transistor y Puertas Lógicas | `/visualizador-circuitos-electronicos/` | estudiantes, tecnicas |
| [ ] | Combinatoria: Permutaciones, Pascal y Binomio de Newton | `/visualizador-combinatoria/` | estudiantes, tecnicas |
| [ ] | Cómo Funciona la Probabilidad | `/visualizador-probabilidad/` | estudiantes, cultura |
| [ ] | Computación Cuántica - Qubits, Puertas y Algoritmo de Shor | `/visualizador-computacion-cuantica/` | estudiantes, cultura, tecnicas |
| [ ] | Conjugador de Verbos Español | `/conjugador-verbos/` | estudiantes |
| [x] | Contador de Sílabas | `/contador-silabas/` | estudiantes |
| [ ] | Conversor IEEE 754 | `/conversor-ieee754/` | estudiantes, tecnicas |
| [ ] | Cosmología: Composición del Universo y su Destino | `/visualizador-cosmologia/` | estudiantes, cultura |
| [ ] | Creador de Flashcards | `/creador-flashcards/` | estudiantes |
| [ ] | CRISPR-Cas9: Mecanismo, Edición Genómica y Bioética | `/visualizador-crispr-cas9/` | estudiantes, cultura |
| [ ] | Cuadro de Punnett: Genética Mendeliana | `/simulador-punnett/` | estudiantes |
| [ ] | Curso de Introducción a la Teoría Política | `/curso-teoria-politica/` | estudiantes, cultura |
| [ ] | Curso de Pensamiento Científico | `/curso-pensamiento-cientifico/` | estudiantes |
| [x] | Curso de Pensamiento Sistémico | `/curso-pensamiento-sistemico/` | estudiantes, cultura |
| [ ] | Curso de Redacción Académica | `/curso-redaccion-academica/` | estudiantes |
| [ ] | De dónde Viene tu Camiseta | `/visualizador-origen-camiseta/` | estudiantes, cultura |
| [ ] | Diabetes: Mecanismo Biológico de Insulina y Glucagón | `/visualizador-diabetes-mecanismo/` | estudiantes, cultura, salud |
| [ ] | Digestión y Nutrientes - De la Comida a la Célula | `/visualizador-digestion-nutrientes/` | estudiantes, cultura, salud |
| [ ] | Ecosistemas - El Flujo de Energía | `/visualizador-ecosistema/` | estudiantes, cultura |
| [ ] | Ecuaciones Diferenciales: Campos de Dirección y Lotka-Volterra | `/visualizador-ecuaciones-diferenciales/` | estudiantes, tecnicas |
| [ ] | Efecto Doppler: De las Sirenas al Redshift de Galaxias | `/visualizador-efecto-doppler/` | estudiantes, cultura |
| [ ] | El Árbol de la Vida Animal | `/visualizador-arbol-vida/` | estudiantes, cultura |
| [ ] | El Carbono: Diamante, Grafeno y la Molécula de la Vida | `/visualizador-carbono/` | estudiantes, cultura |
| [ ] | El Ciclo del Agua - El Viaje Infinito de cada Gota | `/visualizador-ciclo-agua/` | estudiantes, cultura |
| [ ] | El Efecto Invernadero - Del Equilibrio al Cambio Climático | `/visualizador-efecto-invernadero/` | estudiantes, cultura |
| [ ] | El Espectro Electromagnético - De Radio a Gamma | `/visualizador-espectro-electromagnetico/` | estudiantes, cultura |
| [ ] | El Hidrógeno: Del Big Bang a la Pila de Combustible | `/visualizador-hidrogeno/` | estudiantes, cultura |
| [ ] | El Niño y La Niña: ENSO Explicado | `/visualizador-el-nino/` | estudiantes, cultura |
| [ ] | El Oído y el Equilibrio - De la Vibración al Cerebro | `/visualizador-oido-equilibrio/` | estudiantes, cultura, salud |
| [ ] | El Ojo Humano y la Visión - De la Córnea al Cerebro | `/visualizador-ojo-humano-vision/` | estudiantes, cultura, salud |
| [ ] | El Oro: Por Qué la Relatividad Explica su Color y su Nobleza | `/visualizador-oro/` | estudiantes, cultura |
| [ ] | El Reino Fungi — Ascomicetos, Basidiomicetos y Ciclo de Vida | `/visualizador-reino-fungi/` | estudiantes, cultura |
| [ ] | El Reino Vegetal: de las Algas a las Angiospermas | `/visualizador-reino-vegetal/` | estudiantes, cultura |
| [ ] | El Silicio: De la Arena al Chip y la Ley de Moore | `/visualizador-silicio/` | estudiantes, cultura, tecnicas |
| [ ] | El Sistema Endocrino - Glándulas, Hormonas y Feedback | `/visualizador-sistema-endocrino/` | estudiantes, cultura, salud |
| [ ] | El Sistema Inmune - Tu Ejército Invisible | `/visualizador-sistema-inmune/` | estudiantes, cultura, salud |
| [ ] | El Sistema Nervioso - Neuronas, Sinapsis y Neurotransmisores | `/visualizador-sistema-nervioso/` | estudiantes, cultura, salud |
| [ ] | El Sistema Respiratorio - Del Aire al Alvéolo | `/visualizador-sistema-respiratorio/` | estudiantes, cultura, salud |
| [ ] | El Sistema Solar en Números | `/visualizador-sistema-solar/` | estudiantes, cultura |
| [ ] | El Viaje de tu Comida | `/visualizador-viaje-comida/` | estudiantes, salud, cultura |
| [ ] | Electricidad Doméstica - Tu Cuadro Eléctrico Explicado | `/visualizador-electricidad-domestica/` | estudiantes, cultura |
| [ ] | Electromagnetismo - Campo Eléctrico, Magnético e Inducción | `/visualizador-electromagnetismo/` | estudiantes, cultura, tecnicas |
| [ ] | Embriogénesis: Fecundación, Segmentación y Organogénesis | `/visualizador-embriogenesis/` | estudiantes, salud |
| [ ] | Energía Nuclear - Fisión, Fusión y Comparativa | `/visualizador-energia-nuclear/` | estudiantes, cultura, tecnicas |
| [ ] | Enlaces Químicos - Cómo se Unen los Átomos | `/visualizador-enlaces-quimicos/` | estudiantes, cultura |
| [ ] | Entrenador Tablas Multiplicar | `/tablas-multiplicar/` | estudiantes |
| [ ] | Enzimas del Cuerpo Humano - Catalizadores de la Vida | `/visualizador-enzimas-cuerpo-humano/` | estudiantes, cultura, salud |
| [ ] | Estadística Avanzada | `/estadistica-avanzada/` | estudiantes |
| [ ] | Estadística Inferencial: p-valor, Errores y Confianza | `/visualizador-estadistica-inferencial/` | estudiantes, tecnicas |
| [ ] | Estados de la Materia | `/visualizador-estados-materia/` | estudiantes, cultura |
| [ ] | Estructura del Átomo - Partículas, Orbitales e Isótopos | `/visualizador-estructura-atomo/` | estudiantes, cultura |
| [ ] | Estructuras Cristalinas 3D - Celdas Unitarias Rotables | `/visualizador-estructuras-cristalinas/` | estudiantes, cultura |
| [ ] | Estructuras de Mercado: Monopolio, Oligopolio y Competencia | `/visualizador-estructuras-mercado/` | estudiantes, cultura |
| [ ] | Evolución Molecular: Relojes, Filogenética y Kimura | `/visualizador-evolucion-molecular/` | estudiantes, cultura |
| [ ] | Exoplanetas: Tránsito, Zona Habitable y Kepler | `/visualizador-exoplanetas/` | estudiantes, cultura |
| [ ] | Fases de la Luna y Eclipses | `/visualizador-fases-luna-eclipses/` | estudiantes, cultura |
| [ ] | Fenómenos Meteorológicos - Del Cielo a la Tierra | `/visualizador-fenomenos-meteorologicos/` | estudiantes, cultura |
| [ ] | Fibonacci en la Naturaleza | `/visualizador-fibonacci-naturaleza/` | estudiantes, cultura |
| [ ] | Fósiles y Tiempo Geológico | `/visualizador-fosiles-tiempo-geologico/` | estudiantes, cultura |
| [ ] | Funciones que Gobiernan el Mundo | `/visualizador-funciones-mundo/` | estudiantes, cultura |
| [ ] | Generador de Horarios de Estudio | `/generador-horarios-estudio/` | estudiantes |
| [ ] | Geometría Analítica: Cónicas e Hipérbolas | `/visualizador-geometria-analitica/` | estudiantes, tecnicas |
| [ ] | Geometría Fractal - Autosimilitud e Infinito | `/visualizador-geometria-fractales/` | estudiantes, cultura |
| [ ] | Geopolítica Energética: Flujos, Dependencias e Infraestructuras | `/visualizador-geopolitica-energetica/` | estudiantes, cultura, tecnicas |
| [ ] | Germinación - De la Semilla a la Planta | `/visualizador-germinacion/` | estudiantes, cultura |
| [x] | Glosario de Física y Química | `/glosario-fisica-quimica/` | estudiantes |
| [ ] | Glosario de Programación | `/glosario-programacion/` | estudiantes, tecnicas |
| [ ] | Inferencia Bayesiana | `/inferencia-bayesiana/` | estudiantes |
| [ ] | La Célula por Dentro - Animal vs Vegetal | `/visualizador-celula/` | estudiantes, cultura, salud |
| [ ] | La Escala del Universo | `/visualizador-escala-universo/` | estudiantes, cultura |
| [ ] | La Fotosíntesis - De la Luz Solar a la Vida | `/visualizador-fotosintesis/` | estudiantes, cultura |
| [ ] | La Historia de la Humanidad en un Reloj | `/visualizador-historia-reloj/` | estudiantes, cultura |
| [ ] | La Sangre - Componentes, Grupos y Coagulación | `/visualizador-sangre-componentes/` | estudiantes, cultura, salud |
| [ ] | La Tabla Periódica en tu Vida | `/visualizador-tabla-periodica/` | estudiantes, cultura |
| [ ] | La Vida de una Estrella | `/visualizador-vida-estrella/` | estudiantes, cultura |
| [ ] | Las 3 Leyes de Newton | `/visualizador-leyes-newton/` | estudiantes, cultura |
| [ ] | Las Estaciones del Año - 23,5° que lo Cambian Todo | `/visualizador-estaciones-ano/` | estudiantes, cultura |
| [ ] | Las Fuerzas Invisibles del Día a Día | `/visualizador-fuerzas-invisibles/` | estudiantes, cultura |
| [ ] | Lógica Proposicional: Tablas de Verdad, Karnaugh y Formas Normales | `/visualizador-logica-proposicional/` | estudiantes, tecnicas |
| [ ] | Máquinas Simples - Cómo Multiplicar tu Fuerza | `/visualizador-maquinas-simples/` | estudiantes, cultura |
| [ ] | Matrices - El Lenguaje de las Transformaciones | `/visualizador-matrices/` | estudiantes, cultura |
| [ ] | Mecánica Cuántica - Dualidad, Incertidumbre y Efecto Túnel | `/visualizador-mecanica-cuantica/` | estudiantes, cultura, tecnicas |
| [ ] | Mecánica de Fluidos: Reynolds, Magnus y Bernoulli | `/visualizador-mecanica-fluidos/` | estudiantes, tecnicas |
| [ ] | Mercado Inmobiliario: Burbuja, Precios y Accesibilidad | `/visualizador-mercado-inmobiliario/` | estudiantes, cultura, inmobiliaria, finanzas |
| [ ] | Metamorfosis - La Transformación más Radical | `/visualizador-metamorfosis/` | estudiantes, cultura |
| [ ] | Minerales y Gemas - Escala de Mohs y Piedras Preciosas | `/visualizador-minerales-gemas/` | estudiantes, cultura |
| [ ] | Mitosis y Meiosis - La Danza de los Cromosomas | `/visualizador-mitosis-meiosis/` | estudiantes, cultura |
| [ ] | Modelos Epidemiológicos: SIR, SEIR y Rₜ | `/visualizador-modelos-epidemiologicos/` | estudiantes, salud, cultura |
| [ ] | Motor de Combustión: Ciclo Otto y Por Qué Desperdicia el 70% | `/visualizador-motor-combustion/` | estudiantes, cultura |
| [ ] | Motor Eléctrico: Campo Magnético Rotante y Regeneración | `/visualizador-motor-electrico/` | estudiantes, cultura, tecnicas |
| [ ] | Músculos y Movimiento - Del Sarcómero a la Articulación | `/visualizador-musculos-movimiento/` | estudiantes, cultura, salud |
| [ ] | Números Complejos: El Plano de Argand | `/visualizador-numeros-complejos/` | estudiantes, tecnicas |
| [ ] | Números Primos - De Eratóstenes a la Criptografía | `/visualizador-numeros-primos/` | estudiantes, cultura |
| [ ] | Océanos y Corrientes - AMOC, Corriente del Golfo y Acidificación | `/visualizador-oceanos-corrientes/` | estudiantes, cultura |
| [ ] | Oferta, Demanda y por qué Suben los Precios | `/visualizador-oferta-demanda/` | estudiantes, finanzas, cultura |
| [ ] | Óptica - El Viaje de la Luz | `/visualizador-optica/` | estudiantes, cultura |
| [ ] | Óptica Ondulatoria: Young, Difracción y Polarización | `/visualizador-optica-ondulatoria/` | estudiantes, tecnicas |
| [ ] | Orientador de Tipo de Oposición | `/orientador-tipo-oposicion/` | estudiantes, productividad |
| [ ] | Partículas Subatómicas: Modelo Estándar y Higgs | `/visualizador-particulas-subatomicas/` | estudiantes, cultura |
| [ ] | pH: Ácidos y Bases - La Escala de la Química Cotidiana | `/visualizador-ph-acidos-bases/` | estudiantes, cultura |
| [ ] | Planificador de Estudio para Oposiciones | `/planificador-estudio-oposiciones/` | estudiantes, productividad |
| [ ] | Plegamiento de Proteínas: Estructura y Enfermedades | `/visualizador-proteinas-plegamiento/` | estudiantes, cultura |
| [ ] | Polímeros y Materiales: Plásticos, Propiedades y Reciclaje | `/visualizador-polimeros-materiales/` | estudiantes, tecnicas |
| [ ] | Química Orgánica: Grupos Funcionales y Reacciones Interactivas | `/visualizador-quimica-organica/` | estudiantes, cultura, tecnicas |
| [ ] | Quiz Biología Molecular — ADN, ARN, Replicación y Traducción | `/quiz-biologia-molecular/` | estudiantes, cultura |
| [ ] | Quiz Complejidad Algorítmica — Big O, Ordenación y Estructuras de Datos | `/quiz-complejidad-algoritmos/` | estudiantes, tecnicas |
| [ ] | Quiz de Conceptos Financieros | `/quiz-conceptos-financieros/` | estudiantes, finanzas |
| [x] | Quiz Figuras Retóricas | `/quiz-figuras-retoricas/` | estudiantes, juegos |
| [ ] | Quiz Geografía de España | `/quiz-geografia-espana/` | estudiantes |
| [ ] | Quiz Historia de España | `/quiz-historia-espana/` | estudiantes |
| [ ] | Quiz Países y Capitales | `/quiz-paises-capitales/` | estudiantes, juegos |
| [ ] | Quiz Reinos de la Naturaleza | `/quiz-reinos-naturaleza/` | estudiantes, juegos |
| [x] | Quiz Símbolos Químicos | `/quiz-simbolos-quimicos/` | estudiantes |
| [ ] | Quiz Tabla Periódica | `/quiz-tabla-periodica/` | estudiantes, juegos |
| [ ] | Quiz: Clasifica 40 Plantas — ¿Musgo, Helecho o Angiosperma? | `/quiz-tipos-plantas/` | estudiantes, juegos |
| [ ] | Radioactividad: Desintegración, Vida Media y Datación | `/visualizador-radioactividad/` | estudiantes, cultura |
| [ ] | Reacciones Químicas - Cuando los Átomos Cambian de Pareja | `/visualizador-reacciones-quimicas/` | estudiantes, cultura |
| [ ] | Redes de Computadoras: TCP/IP, DNS, Routing y CDN | `/visualizador-redes-computadoras/` | estudiantes, tecnicas |
| [ ] | Regímenes Políticos: Tipología y Características Estructurales | `/visualizador-regimenes-politicos/` | estudiantes, cultura |
| [ ] | Reino Animal: Vertebrados, Invertebrados y Árbol Filogenético | `/visualizador-reino-animal/` | estudiantes, cultura |
| [ ] | Relatividad Especial - Dilatación del Tiempo y E=mc² | `/visualizador-relatividad-especial/` | estudiantes, cultura, tecnicas |
| [ ] | Relatividad General: Curvatura del Espacio-Tiempo | `/visualizador-relatividad-general/` | estudiantes, cultura |
| [ ] | Respiración Celular - La Central Energética | `/visualizador-respiracion-celular/` | estudiantes, cultura |
| [ ] | Selección Natural - El Motor de la Evolución | `/visualizador-seleccion-natural/` | estudiantes, cultura |
| [ ] | Selector de Carrera Universitaria | `/selector-carrera-universitaria/` | estudiantes, productividad |
| [ ] | Selector de Formación Postgrado | `/selector-formacion-postgrado/` | estudiantes, productividad |
| [ ] | Selector de Idioma | `/selector-idioma/` | estudiantes, cultura |
| [ ] | Selector de Método de Estudio | `/selector-metodo-estudio/` | estudiantes, productividad |
| [ ] | Series y Convergencia: Taylor, Criterios y π | `/visualizador-series-convergencia/` | estudiantes, tecnicas |
| [x] | Simulador Circuitos Eléctricos | `/simulador-circuitos-electricos/` | estudiantes, tecnicas |
| [x] | Simulador de Algoritmos de Grafos (BFS, DFS, Dijkstra, A*) | `/simulador-grafos/` | estudiantes, tecnicas |
| [x] | Simulador de Algoritmos de Ordenación | `/simulador-ordenacion/` | estudiantes, tecnicas |
| [ ] | Simulador de Árboles BST y AVL | `/simulador-arboles-bst-avl/` | estudiantes, tecnicas |
| [x] | Simulador de Autómatas Finitos DFA y NFA | `/simulador-automatas-finitos/` | estudiantes, tecnicas |
| [x] | Simulador de Campo Eléctrico | `/simulador-campo-electrico/` | estudiantes |
| [ ] | Simulador de Cifrado César | `/simulador-cifrado-cesar/` | estudiantes |
| [ ] | Simulador de Cinética Química: Ecuación de Arrhenius | `/simulador-cinetica-arrhenius/` | estudiantes |
| [ ] | Simulador de Colisiones — Elásticas e Inelásticas | `/simulador-colisiones/` | estudiantes, cultura |
| [x] | Simulador de Conservación de la Energía | `/simulador-conservacion-energia/` | estudiantes |
| [ ] | Simulador de Deriva Genética y Selección | `/simulador-deriva-genetica/` | estudiantes |
| [ ] | Simulador de Derivadas: Pendiente de la Tangente | `/simulador-derivada-pendiente/` | estudiantes |
| [ ] | Simulador de Distribución Normal | `/simulador-distribucion-normal/` | estudiantes |
| [x] | Simulador de Ecosistema: Cadena Trófica | `/simulador-ecosistema-trofico/` | estudiantes |
| [ ] | Simulador de Elasticidad Precio de la Demanda | `/simulador-elasticidad-precio/` | estudiantes |
| [x] | Simulador de Equilibrio Químico (Le Chatelier) | `/simulador-equilibrio-quimico/` | estudiantes |
| [ ] | Simulador de Estequiometría: Reactivo Limitante | `/simulador-estequiometria/` | estudiantes |
| [x] | Simulador de Física | `/simulador-fisica/` | estudiantes |
| [ ] | Simulador de Fluidos: Ecuación de Bernoulli | `/simulador-fluidos-bernoulli/` | estudiantes |
| [ ] | Simulador de Fotosíntesis: Factores Limitantes | `/simulador-fotosintesis-factores/` | estudiantes |
| [ ] | Simulador de Gas Ideal y Termodinámica | `/simulador-gas-ideal/` | estudiantes |
| [x] | Simulador de Genética Mendeliana | `/simulador-genetica/` | estudiantes, salud |
| [ ] | Simulador de Hashing y Colisiones | `/simulador-hashing-colisiones/` | estudiantes |
| [ ] | Simulador de Integrales: Área bajo la Curva | `/simulador-integral-area/` | estudiantes |
| [x] | Simulador de Intervalos de Confianza | `/simulador-intervalos-confianza/` | estudiantes |
| [ ] | Simulador de K-Means Clustering | `/simulador-kmeans/` | estudiantes, tecnicas |
| [ ] | Simulador de la Curva de Phillips | `/simulador-curva-phillips/` | estudiantes |
| [x] | Simulador de Lentes Ópticas: Trazado de Rayos | `/simulador-lentes-opticas/` | estudiantes |
| [x] | Simulador de Máquina de Turing | `/simulador-maquina-turing/` | estudiantes, tecnicas |
| [ ] | Simulador de Mitosis y Meiosis | `/simulador-mitosis-meiosis/` | estudiantes |
| [x] | Simulador de Movimiento Circular | `/simulador-movimiento-circular/` | estudiantes |
| [x] | Simulador de Oferta y Demanda | `/simulador-oferta-demanda/` | estudiantes |
| [ ] | Simulador de Ondas e Interferencia | `/simulador-ondas-interferencia/` | estudiantes |
| [ ] | Simulador de Péndulo Simple y MAS | `/simulador-pendulo/` | estudiantes |
| [x] | Simulador de Planificación de Procesos en CPU | `/simulador-planificador-procesos/` | estudiantes, tecnicas |
| [ ] | Simulador de Proyectiles 2D | `/simulador-proyectiles/` | estudiantes |
| [x] | Simulador de Reacciones Químicas | `/simulador-reacciones-quimicas/` | estudiantes, tecnicas |
| [ ] | Simulador de Recursión y Pila de Llamadas | `/simulador-recursion/` | estudiantes, tecnicas |
| [ ] | Simulador de Reemplazo de Páginas | `/simulador-reemplazo-paginas/` | estudiantes, tecnicas |
| [ ] | Simulador de Regresión Lineal y Logística | `/simulador-regresion/` | estudiantes, tecnicas |
| [ ] | Simulador de SQL JOIN Visual | `/simulador-sql-join/` | estudiantes, tecnicas |
| [ ] | Simulador de Test de Hipótesis | `/simulador-test-hipotesis/` | estudiantes |
| [x] | Simulador de Titulación Ácido-Base | `/simulador-titulacion/` | estudiantes |
| [ ] | Simulador de Transformaciones de Funciones | `/simulador-funciones-transformaciones/` | estudiantes |
| [ ] | Simulador del Ciclo de Carnot | `/simulador-termodinamica-carnot/` | estudiantes |
| [x] | Simulador del Círculo Trigonométrico | `/simulador-trigonometria-circulo-unitario/` | estudiantes |
| [ ] | Simulador del Handshake TCP | `/simulador-tcp-handshake/` | estudiantes |
| [ ] | Simulador del Multiplicador del Gasto | `/simulador-multiplicador-gasto/` | estudiantes |
| [ ] | Simulador del Potencial de Acción Neuronal | `/simulador-potencial-accion/` | estudiantes |
| [ ] | Simulador del Problema de Monty Hall | `/simulador-monty-hall/` | estudiantes |
| [ ] | Simulador del Teorema Central del Límite | `/simulador-teorema-central-limite/` | estudiantes |
| [ ] | Simulador del Teorema de Bayes | `/simulador-teorema-bayes/` | estudiantes |
| [ ] | Simulador Depredador-Presa (Lotka-Volterra) | `/simulador-lotka-volterra/` | estudiantes |
| [ ] | Simulador Masa-Resorte (MAS) | `/simulador-mas-resorte/` | estudiantes |
| [ ] | Simulador VSEPR de Geometría Molecular | `/simulador-vsepr/` | estudiantes |
| [x] | Sistema de Pensiones: Reparto, Demografía y Reformas | `/visualizador-sistema-pensiones/` | estudiantes, cultura, finanzas |
| [ ] | Sistemas Circulatorios - Del Corazón de 2 al de 4 Cámaras | `/visualizador-sistemas-circulatorios/` | estudiantes, cultura |
| [ ] | Sistemas Operativos: Procesos, Scheduling, Memoria y Ficheros | `/visualizador-sistemas-operativos/` | estudiantes, tecnicas |
| [ ] | Sonido y Ondas - Frecuencia, Amplitud y Decibelios | `/visualizador-sonido-ondas/` | estudiantes, cultura |
| [ ] | Superconductividad: Efecto Meissner y Pares de Cooper | `/visualizador-superconductividad/` | estudiantes, tecnicas |
| [x] | Tabla Periódica Interactiva | `/tabla-periodica/` | estudiantes |
| [ ] | Tectónica de Placas | `/visualizador-tectonica-placas/` | estudiantes, cultura |
| [ ] | Tendencias de la Tabla Periódica | `/visualizador-tabla-periodica-interactiva/` | estudiantes, cultura |
| [ ] | Tendencias de la Tabla Periódica | `/simulador-tabla-periodica-tendencias/` | estudiantes |
| [ ] | Teoría de Grafos: Dijkstra, Königsberg y Redes | `/visualizador-teoria-grafos/` | estudiantes, tecnicas |
| [ ] | Teoría de Juegos: Dilema del Prisionero y Nash | `/visualizador-teoria-juegos/` | estudiantes, cultura, productividad |
| [ ] | Teoría de la Información: Entropía de Shannon, Huffman y Compresión | `/visualizador-teoria-informacion/` | estudiantes, tecnicas |
| [ ] | Terremotos y Tsunamis: De la Falla al Impacto | `/visualizador-terremotos-tsunamis/` | estudiantes, cultura |
| [ ] | Tipos de Desempleo: Friccional, Estructural y Cíclico | `/visualizador-desempleo-tipos/` | estudiantes, cultura |
| [ ] | Tipos de Rocas - El Ciclo que Nunca se Detiene | `/visualizador-tipos-rocas/` | estudiantes, cultura |
| [ ] | Topología: Superficies, Nudos y Homeomorfismos | `/visualizador-topologia/` | estudiantes |
| [ ] | Transferencia de Calor - Conducción, Convección y Radiación | `/visualizador-termodinamica/` | estudiantes, cultura |
| [ ] | Transformada de Fourier: Señales y Frecuencias | `/visualizador-transformada-fourier/` | estudiantes, tecnicas |
| [ ] | Transporte en las Plantas - Agua que Sube sin Motor | `/visualizador-transporte-plantas/` | estudiantes, cultura |
| [ ] | Trigonometría: Círculo Unitario y Funciones | `/visualizador-trigonometria/` | estudiantes, tecnicas |
| [ ] | Tu ADN en Números | `/visualizador-adn-numeros/` | estudiantes, cultura |
| [x] | Visualizador de Estructuras de Datos | `/visualizador-estructuras-datos/` | estudiantes, diseno |
| [ ] | Visualizador de Volúmenes 3D: Esfera, Cubo, Cilindro, Cono y Pirámide | `/visualizador-volumenes/` | estudiantes, cultura |
| [ ] | Vuelo de Avión: El Gran Mito de Bernoulli | `/visualizador-vuelo-avion/` | estudiantes, cultura |

## Finanzas e Inversión (`finanzas`) — 58 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | ¿Cuánto tardo en ahorrar? | `/estimador-tiempo-ahorro/` | finanzas, estudiantes |
| [x] | Anatomía de una Nómina | `/visualizador-anatomia-nomina/` | finanzas, cultura |
| [ ] | Burbuja Especulativa: Las 5 Fases de Minsky | `/visualizador-burbuja-especulativa/` | finanzas, cultura |
| [ ] | Calculadora de Descuentos | `/calculadora-descuentos/` | finanzas, productividad |
| [x] | Calculadora de Propinas | `/calculadora-propinas/` | finanzas, productividad, viajes |
| [ ] | Checklist Coberturas de Seguros | `/checklist-coberturas-seguros/` | finanzas, cultura |
| [ ] | Ciclo Económico - Expansión, Recesión y Curva de Rendimientos | `/visualizador-ciclo-economico/` | finanzas, cultura, estudiantes |
| [ ] | Comercio Internacional - Ventaja Comparativa y Aranceles | `/visualizador-comercio-internacional/` | finanzas, cultura, estudiantes |
| [ ] | Cómo Funciona un Banco | `/visualizador-como-funciona-banco/` | finanzas, cultura, estudiantes |
| [ ] | Comparador Compra Vehículos | `/comparador-vehiculos/` | finanzas, inmobiliaria |
| [ ] | Comparador Eléctrico vs Combustión | `/comparador-electrico/` | finanzas, inmobiliaria |
| [ ] | Comparador Tipos de Seguros | `/comparador-tipos-seguros/` | finanzas, cultura |
| [ ] | Control de Gastos | `/control-gastos/` | finanzas |
| [ ] | Curso Decisiones de Inversión | `/curso-decisiones-inversion/` | finanzas, cultura |
| [ ] | Desigualdad de la Riqueza - Curva de Lorenz y Coeficiente Gini | `/visualizador-desigualdad-riqueza/` | finanzas, cultura, estudiantes |
| [ ] | Deuda Pública - Bonos, Prima de Riesgo y Sostenibilidad | `/visualizador-deuda-publica/` | finanzas, cultura |
| [ ] | El Dinero y el Tiempo | `/visualizador-dinero-y-tiempo/` | finanzas, cultura, freelance |
| [ ] | El Mapa de tu Dinero Mensual | `/visualizador-mapa-dinero-mensual/` | finanzas, cultura, freelance |
| [ ] | El Precio Real de las Cosas | `/visualizador-precio-real-cosas/` | finanzas, cultura, freelance |
| [ ] | El Viaje de tus Impuestos | `/visualizador-viaje-impuestos/` | finanzas, cultura, freelance |
| [ ] | Estimación de Deducción por Maternidad IRPF | `/estimacion-deduccion-maternidad/` | finanzas, legal-fiscal |
| [ ] | Estimador Coste Real a Plazos | `/estimador-coste-plazos/` | finanzas |
| [x] | Estimador de Cartera de Inversión | `/estimador-cartera-inversion/` | finanzas |
| [ ] | Estimador de Deuda | `/estimador-deuda/` | finanzas |
| [ ] | Estimador de Inflación | `/estimador-inflacion/` | finanzas |
| [ ] | Estimador de Infraseguro | `/estimador-infraseguro/` | finanzas, inmobiliaria |
| [ ] | Estimador de Inversiones | `/estimador-inversiones/` | finanzas |
| [ ] | Estimador FIRE | `/estimador-fire/` | finanzas, legal-fiscal |
| [ ] | Estimador Fondo de Emergencia | `/estimador-fondo-emergencia/` | finanzas |
| [ ] | Estimador Interés Compuesto | `/estimador-interes-compuesto/` | finanzas |
| [ ] | Estimador TIR-VAN | `/estimador-tir-van/` | finanzas, freelance, estudiantes |
| [ ] | Fondo de Inversión: Por Dentro | `/visualizador-fondo-inversion/` | finanzas |
| [ ] | Guía Reclamar Seguro Coche | `/guia-reclamar-seguro-coche/` | finanzas, cultura |
| [ ] | Inflación: Por Qué Suben los Precios | `/visualizador-inflacion/` | finanzas, cultura, estudiantes |
| [ ] | Juego de Presupuesto Mensual | `/juego-presupuesto-mensual/` | finanzas, estudiantes, juegos |
| [ ] | Las 6 Clases de Activos — Rentabilidad, Riesgo y Correlación | `/visualizador-tipos-activos/` | finanzas, estudiantes, cultura |
| [ ] | Mercados Financieros - Bolsa, Órdenes y Activos | `/visualizador-mercados-financieros/` | finanzas, cultura |
| [ ] | Orientador Regla 50/30/20 | `/orientador-regla-50-30-20/` | finanzas |
| [ ] | Orientador Seguro de Vida | `/orientador-seguro-vida/` | finanzas, legal-fiscal |
| [ ] | Quiz Conceptos de Inversión — Sharpe, Beta, Duration y TER | `/quiz-conceptos-inversion/` | finanzas, estudiantes |
| [ ] | Seguros y Riesgo: Prima Actuarial, Pool de Riesgo y Mutualización | `/visualizador-seguros-riesgo/` | finanzas, cultura |
| [ ] | Selector de Coche Nuevo o Usado | `/selector-coche-nuevo-usado/` | finanzas, inmobiliaria |
| [ ] | Selector de Cuenta Bancaria | `/selector-cuenta-bancaria/` | finanzas |
| [x] | Selector de Plan de Pensiones | `/selector-plan-pensiones/` | finanzas, freelance |
| [ ] | Selector de Seguro de Coche | `/selector-seguro-coche/` | finanzas, tecnicas |
| [ ] | Selector de Seguro de Vida | `/selector-seguro-vida/` | finanzas, salud |
| [ ] | Selector de Tipo de Ahorro | `/selector-tipo-ahorro/` | finanzas, productividad |
| [x] | Selector de Tipo de Hipoteca | `/selector-tipo-hipoteca/` | finanzas, inmobiliaria |
| [ ] | Selector de Tipo de Inversión | `/selector-inversiones/` | finanzas |
| [ ] | Selector de Tipo de Préstamo | `/selector-tipo-prestamo/` | finanzas, inmobiliaria |
| [ ] | Selector de Tipo de Vehículo | `/selector-vehiculo/` | finanzas, inmobiliaria, productividad |
| [ ] | Simulador de Paga y Ahorro | `/simulador-paga-ahorro/` | finanzas, estudiantes |
| [ ] | Simulador Sesgos del Inversor | `/simulador-sesgos-inversor/` | finanzas, cultura |
| [x] | Test de Perfil Inversor | `/test-perfil-inversor/` | finanzas |
| [ ] | Test de Tolerancia al Riesgo Detallado | `/test-tolerancia-riesgo-detallado/` | finanzas |
| [ ] | Tipos de Interés BCE - Transmisión Monetaria | `/visualizador-tipos-interes-bce/` | finanzas, cultura, estudiantes |
| [ ] | Tu Jubilación en Perspectiva | `/visualizador-jubilacion-perspectiva/` | finanzas, cultura |
| [x] | Tu Sueldo al Desnudo | `/visualizador-sueldo-neto/` | finanzas, freelance, cultura |

## Freelance y Autónomo (`freelance`) — 38 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Auditoría de Propuesta de Valor | `/auditoria-propuesta-valor/` | freelance, diseno |
| [x] | Calculadora de IVA | `/calculadora-iva/` | freelance, productividad |
| [x] | Calculadora de Precio por Proyecto Freelance | `/calculadora-precio-por-proyecto/` | freelance, productividad |
| [ ] | Calculadora de Presupuestos | `/calculadora-presupuestos/` | freelance |
| [ ] | Calculadora de Productividad | `/calculadora-productividad/` | freelance, productividad |
| [ ] | Checklist Cambio de Régimen Fiscal Autónomo | `/checklist-cambio-regimen-autonomo/` | freelance |
| [ ] | Checklist VeriFactu - Facturación Electrónica | `/checklist-preparar-verifactu/` | freelance, legal-fiscal |
| [x] | Conversor de Horarios | `/conversor-horarios/` | freelance, productividad, viajes |
| [ ] | Diagnóstico de Modelo de Negocio | `/diagnostico-modelo-negocio/` | freelance, finanzas |
| [ ] | El Ciclo de Vida de un Proyecto Freelance | `/visualizador-ciclo-vida-freelance/` | freelance, cultura |
| [ ] | Estimador Break-Even | `/estimador-break-even/` | freelance |
| [ ] | Estimador ROI Marketing | `/estimador-roi-marketing/` | freelance, diseno |
| [ ] | Estructura de Costes del Autónomo | `/visualizador-estructura-costes-autonomo/` | freelance, finanzas, cultura |
| [ ] | Generador de Facturas | `/generador-facturas/` | freelance |
| [ ] | Lista de Tareas | `/lista-tareas/` | freelance, productividad |
| [ ] | Mapa de Dependencia de Clientes | `/mapa-dependencia-clientes/` | freelance, productividad |
| [ ] | Mapa de Riesgo del Emprendedor | `/mapa-riesgo-emprendedor/` | freelance, finanzas |
| [ ] | Mi IP y Conexión | `/mi-ip/` | freelance, tecnicas |
| [ ] | Notas | `/notas/` | freelance, productividad |
| [ ] | Orientador Contratos Mercantiles | `/orientador-contrato-mercantil/` | freelance, tecnicas |
| [ ] | Orientador de Ayudas para Autónomos y Pymes | `/orientador-ayudas-autonomos-pymes/` | freelance, legal-fiscal |
| [ ] | Orientador de Diversificación de Clientes | `/orientador-diversificacion-clientes/` | freelance, productividad |
| [ ] | Orientador Facturación y Retenciones | `/orientador-facturacion-retencion/` | freelance, finanzas |
| [x] | Orientador Tarifa Freelance | `/orientador-tarifa-freelance/` | freelance |
| [ ] | Planificador Cash Flow | `/planificador-cashflow/` | freelance |
| [ ] | Planificador de Vacaciones para Autónomos | `/planificador-vacaciones-autonomo/` | freelance, productividad |
| [ ] | Planificador Trimestral para Autónomos | `/planificador-trimestres-freelance/` | freelance, productividad |
| [ ] | Selector de Financiación Empresarial | `/selector-financiacion-empresa/` | freelance, finanzas |
| [ ] | Selector de Forma Jurídica | `/selector-forma-juridica/` | freelance, finanzas |
| [ ] | Selector de Modelo de Negocio | `/selector-modelo-negocio/` | freelance, finanzas, productividad |
| [ ] | Selector de Tipo de Contrato | `/selector-contrato-trabajo/` | freelance, productividad |
| [x] | Selector Régimen Fiscal Autónomo | `/selector-regimen-fiscal-autonomo/` | freelance, finanzas |
| [ ] | Simulador de Colchón de Emergencia Freelance | `/simulador-colchon-emergencia-freelance/` | freelance, finanzas |
| [ ] | Temporizador Pomodoro | `/temporizador-pomodoro/` | freelance, productividad, estudiantes |
| [ ] | Test de Salud de tu Negocio Freelance | `/test-salud-negocio-freelance/` | freelance, productividad |
| [ ] | Test de Validación de Idea | `/test-validacion-idea/` | freelance, cultura |
| [ ] | Time Tracker | `/time-tracker/` | freelance, productividad |
| [ ] | Tipos de Cliente Freelance | `/visualizador-tipos-cliente-freelance/` | freelance, cultura |

## Herramientas Técnicas (`tecnicas`) — 57 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Afinador de Instrumentos | `/afinador-instrumentos/` | tecnicas, cultura |
| [ ] | Algoritmos de Ordenación: Visualizador Paso a Paso | `/visualizador-algoritmos-ordenacion/` | tecnicas, estudiantes |
| [x] | Analizador de Espectro | `/analizador-espectro/` | tecnicas |
| [ ] | Árbol de Decisión Interactivo | `/arbol-decision-ia/` | tecnicas, estudiantes, cultura |
| [ ] | Asistentes de Código IA 2026: Claude Code vs Copilot vs Gemini | `/comparador-asistentes-codigo/` | tecnicas, productividad |
| [ ] | Base de Datos Relacional: Tablas, JOIN e Índices | `/visualizador-base-datos-relacional/` | tecnicas, estudiantes |
| [ ] | Blockchain - Cadena de Bloques y Contratos Inteligentes | `/visualizador-blockchain/` | tecnicas, cultura, estudiantes |
| [ ] | Buscador de Palabras por Patrón | `/buscador-palabras-patron/` | tecnicas, cultura, juegos, productividad |
| [ ] | Calculadora DDT — Temperatura de la Masa (Desired Dough Temperature) | `/calculadora-temperatura-masa/` | tecnicas |
| [ ] | Calculadora de Ángulo de Campo (FOV) para Vídeo | `/calculadora-fov-video/` | tecnicas, diseno |
| [ ] | Calculadora de Bitrate y Tamaño de Vídeo | `/calculadora-bitrate-video/` | tecnicas, diseno |
| [ ] | Calculadora de Cámara Lenta (Slow Motion) | `/calculadora-camara-lenta/` | tecnicas, diseno |
| [ ] | Calculadora de Filtro ND para Vídeo | `/calculadora-filtro-nd-video/` | tecnicas, diseno |
| [ ] | Calculadora de Ganache de Chocolate | `/calculadora-ganache/` | tecnicas, cultura |
| [ ] | Calculadora de Hidratación del Pan | `/calculadora-hidratacion-pan/` | tecnicas, cultura |
| [ ] | Calculadora de Puntos del Azúcar | `/calculadora-puntos-azucar/` | tecnicas, cultura |
| [ ] | Calculadora de Resistencias para LED | `/calculadora-resistencias-led/` | tecnicas, estudiantes |
| [ ] | Calculadora de Subredes IP | `/calculadora-subredes/` | tecnicas, estudiantes |
| [ ] | Calculadora de Sustitución de Gelatina | `/calculadora-gelatina/` | tecnicas |
| [ ] | Calculadora de Sustitución de Levadura por Masa Madre | `/calculadora-masa-madre/` | tecnicas, cultura |
| [ ] | Calculadora Regla de los 180° para Vídeo | `/calculadora-regla-180-video/` | tecnicas, diseno |
| [ ] | Cifrado AES | `/cifrado-aes/` | tecnicas |
| [ ] | Codificador Base64 | `/codificador-base64/` | tecnicas |
| [ ] | Cómo Funcionan los LLMs - Tokens, Embeddings y Atención | `/visualizador-llm-funcionamiento/` | tecnicas, cultura, estudiantes |
| [ ] | Comparador de IAs 2026: ChatGPT vs Claude vs Gemini y más | `/visualizador-comparador-ia/` | tecnicas, cultura, productividad |
| [ ] | Comparador de Velocidad de Almacenamiento: HDD vs SSD vs NVMe vs USB | `/comparador-velocidad-almacenamiento/` | tecnicas, cultura |
| [ ] | Constructor de Prompts Guiado | `/constructor-prompts/` | tecnicas, productividad |
| [ ] | Contador Manual (Tally Counter) | `/contador-manual/` | tecnicas, productividad |
| [ ] | Conversor de Unidades RF | `/conversor-unidades-rf/` | tecnicas |
| [ ] | Criptografía - AES, RSA, ECDSA, SHA-256 y TLS | `/visualizador-criptografia/` | tecnicas, cultura, estudiantes |
| [ ] | Desarrolladores — Servidor MCP de meskeIA | `/developers/` | tecnicas |
| [x] | Diapasón Digital (La 440Hz) | `/diapason/` | tecnicas, cultura |
| [ ] | Escalador de Recetas | `/escalador-recetas/` | tecnicas, productividad |
| [ ] | Espejo Digital | `/espejo/` | tecnicas |
| [ ] | Extractor de Audio de Vídeo | `/extractor-audio-video/` | tecnicas, productividad |
| [ ] | Generador de .gitignore | `/generador-gitignore/` | tecnicas, diseno |
| [ ] | Generador de Contraseñas | `/generador-contrasenas/` | tecnicas |
| [ ] | Generador de Hashes | `/generador-hashes/` | tecnicas |
| [ ] | Generador de Ondas y Visualizador | `/generador-ondas/` | tecnicas, estudiantes |
| [x] | Generador de Tonos de Audio | `/generador-tonos/` | tecnicas |
| [ ] | IDEs con IA 2026: Cursor vs Windsurf vs VS Code vs Zed vs JetBrains | `/comparador-ides-ia/` | tecnicas, productividad |
| [ ] | Impacto de la IA en los Sectores - Automatización y Empleos | `/visualizador-impacto-ia-sectores/` | tecnicas, cultura, estudiantes |
| [ ] | Luxómetro / Fotómetro | `/luxometro/` | tecnicas |
| [ ] | Nivel de Burbuja Digital | `/nivel-burbuja/` | tecnicas |
| [ ] | Porcentaje del Panadero (Baker's Percentage) | `/calculadora-porcentaje-panadero/` | tecnicas, cultura |
| [ ] | Prueba de Cámara Web | `/prueba-camara/` | tecnicas |
| [ ] | Prueba de Micrófono | `/prueba-microfono/` | tecnicas |
| [ ] | Redes Neuronales e IA - Cómo Aprende una Inteligencia Artificial | `/visualizador-ia-redes-neuronales/` | tecnicas, cultura, estudiantes |
| [ ] | Selector de Auriculares | `/selector-auriculares/` | tecnicas, productividad |
| [ ] | Selector de Movilidad Urbana | `/selector-movilidad-urbana/` | tecnicas, productividad |
| [ ] | Selector de Portátil y PC | `/selector-portatil/` | tecnicas, productividad |
| [ ] | Selector de Smartphone | `/selector-smartphone/` | tecnicas, productividad |
| [ ] | Selector de Tablet | `/selector-tablet/` | tecnicas, estudiantes |
| [ ] | Selector de Tipo de Televisión | `/selector-tipo-television/` | tecnicas, productividad |
| [ ] | Selector de Vehículo Eléctrico | `/selector-vehiculo-electrico/` | tecnicas, finanzas |
| [ ] | Sonómetro / Decibelímetro | `/sonometro/` | tecnicas |
| [ ] | Tokenizador Visual de IA | `/tokenizador-ia/` | tecnicas, productividad |

## Inmobiliaria y Hogar (`inmobiliaria`) — 46 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [x] | Amortización Anticipada Hipoteca | `/amortizacion-hipoteca/` | inmobiliaria, finanzas |
| [x] | Calculadora Consumo Combustible | `/calculadora-combustible/` | inmobiliaria, finanzas, viajes |
| [x] | Calculadora de Cocina | `/calculadora-cocina/` | inmobiliaria, cultura |
| [ ] | Calculadora de Eficiencia Energética | `/calculadora-eficiencia-energetica/` | inmobiliaria, finanzas |
| [ ] | Calculadora de Gasto Energético | `/calculadora-gasto-energetico/` | inmobiliaria, finanzas |
| [ ] | Calculadora de Materiales de Construcción | `/calculadora-materiales-construccion/` | inmobiliaria |
| [x] | Calculadora de Pintura | `/calculadora-pintura/` | inmobiliaria |
| [ ] | Calculadora de Piscinas | `/calculadora-piscinas/` | inmobiliaria |
| [ ] | Calculadora de Suscripciones | `/calculadora-suscripciones/` | inmobiliaria, finanzas |
| [ ] | Calculadora Roommates | `/calculadora-roommates/` | inmobiliaria, finanzas |
| [ ] | Estimación de Ahorro Hídrico | `/estimacion-ahorro-hidrico/` | inmobiliaria, finanzas |
| [ ] | Estimación de Certificación Energética | `/estimacion-certificacion-energetica/` | inmobiliaria, tecnicas |
| [ ] | Estimador Actualización Alquiler 2026 | `/estimador-actualizacion-alquiler/` | inmobiliaria, legal-fiscal |
| [x] | Estimador Compraventa Inmobiliaria | `/estimador-compraventa-inmueble/` | inmobiliaria, finanzas |
| [ ] | Estimador Coste Vivienda | `/estimador-coste-vivienda/` | inmobiliaria, finanzas |
| [x] | Estimador de Hipoteca | `/estimador-hipoteca/` | inmobiliaria, finanzas |
| [x] | Estimador de Préstamos | `/estimador-prestamos/` | inmobiliaria, finanzas |
| [ ] | Estimador Gastos de Comunidad | `/estimador-gastos-comunidad/` | inmobiliaria, finanzas |
| [ ] | Estimador Reformas del Hogar | `/estimador-reformas-hogar/` | inmobiliaria, finanzas |
| [ ] | Etiqueta DGT y Zonas de Bajas Emisiones | `/etiqueta-dgt/` | inmobiliaria, productividad |
| [ ] | Golden Hour - Hora Dorada | `/golden-hour/` | inmobiliaria, diseno |
| [ ] | Guía de Productos de Limpieza del Hogar | `/guia-productos-limpieza/` | inmobiliaria, salud |
| [ ] | Lista de Compras | `/lista-compras/` | inmobiliaria, productividad |
| [ ] | Orientador Alquiler por Habitaciones | `/orientador-alquiler-habitaciones/` | inmobiliaria, legal-fiscal |
| [ ] | Orientador Alquiler vs Compra | `/orientador-alquiler-vs-compra/` | inmobiliaria, finanzas |
| [ ] | Orientador Aval ICO Vivienda | `/orientador-aval-ico/` | inmobiliaria, finanzas, legal-fiscal |
| [ ] | Orientador Ayudas Primera Vivienda en Zona Rural 2026 | `/orientador-ayuda-vivienda-rural/` | inmobiliaria, finanzas |
| [ ] | Orientador Deducción IRPF Obras Energéticas | `/orientador-deduccion-obras-energeticas/` | inmobiliaria, finanzas, legal-fiscal |
| [ ] | Planificador de Menú Semanal | `/planificador-menu/` | inmobiliaria, salud |
| [ ] | Planificador de Mudanzas | `/planificador-mudanzas/` | inmobiliaria, productividad |
| [x] | Rentabilidad de Inversión en Alquiler | `/calculadora-rentabilidad-alquiler/` | inmobiliaria, finanzas |
| [ ] | Selector de Alquiler o Compra | `/selector-alquiler-vs-compra/` | inmobiliaria, finanzas |
| [ ] | Selector de Energía para el Hogar | `/selector-energia-hogar/` | inmobiliaria, tecnicas |
| [ ] | Selector de Estilo de Decoración | `/selector-estilo-decoracion/` | inmobiliaria, productividad |
| [ ] | Selector de Seguro de Hogar | `/selector-seguro-hogar/` | inmobiliaria, finanzas |
| [ ] | Selector de Sistema de Calefacción | `/selector-calefaccion/` | inmobiliaria, finanzas, productividad |
| [ ] | Selector de Tarifa Eléctrica | `/selector-tarifa-electrica/` | inmobiliaria, tecnicas |
| [ ] | Selector de Tipo de Vivienda | `/selector-tipo-vivienda/` | inmobiliaria |
| [ ] | Selector de Zona de Residencia | `/selector-zona-residencia/` | inmobiliaria, productividad |
| [ ] | Simulador Bono Joven Alquiler | `/simulador-bono-joven-alquiler/` | inmobiliaria, finanzas, legal-fiscal |
| [ ] | Simulador de Ahorro con Placas Solares | `/simulador-placas-solares/` | inmobiliaria, tecnicas, finanzas |
| [ ] | Simulador de Subvenciones para Rehabilitación Energética | `/simulador-subvenciones-rehabilitacion/` | inmobiliaria, finanzas |
| [ ] | Simulador Gastos Compra Nave Industrial | `/simulador-gastos-compraventa-nave-industrial/` | inmobiliaria, legal-fiscal, freelance |
| [x] | Simulador Gastos Compraventa Garaje | `/simulador-gastos-compraventa-garaje/` | inmobiliaria, legal-fiscal |
| [x] | Simulador Gastos Compraventa Trastero | `/simulador-gastos-compraventa-trastero/` | inmobiliaria, legal-fiscal |
| [ ] | Tu Electricidad al Desnudo | `/visualizador-factura-electrica/` | inmobiliaria, cultura |

## Juegos y Ocio (`juegos`) — 20 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [x] | Cara o Cruz | `/cara-o-cruz/` | juegos |
| [x] | Generador de Lotería | `/generador-loteria/` | juegos |
| [x] | Guía de Cócteles Clásicos | `/guia-cocteles/` | juegos, cultura |
| [x] | Juego 2048 | `/juego-2048/` | juegos |
| [x] | Juego Asteroids | `/juego-asteroids/` | juegos |
| [x] | Juego de Memoria | `/juego-memoria/` | juegos |
| [x] | Juego del Ahorcado | `/juego-ahorcado/` | juegos, estudiantes |
| [x] | Juego Piedra Papel Tijera | `/juego-piedra-papel-tijera/` | juegos |
| [x] | Juego Platform Runner | `/juego-platform-runner/` | juegos |
| [x] | Juego Puzzle Matemático | `/juego-puzzle-matematico/` | juegos, estudiantes |
| [x] | Juego Space Invaders | `/juego-space-invaders/` | juegos |
| [x] | Juego Sudoku | `/juego-sudoku/` | juegos |
| [x] | Juego Tres en Raya | `/juego-tres-en-raya/` | juegos |
| [x] | Juego Wordle | `/juego-wordle/` | juegos |
| [x] | Metrónomo Online | `/metronomo/` | juegos, cultura |
| [x] | Quiz Verbos Irregulares Inglés | `/quiz-verbos-irregulares/` | juegos, estudiantes |
| [x] | Radio meskeIA | `/radio-meskeia/` | juegos |
| [x] | Ruleta Aleatoria | `/ruleta-aleatoria/` | juegos |
| [x] | Test de Velocidad de Escritura | `/test-velocidad-escritura/` | juegos, productividad |
| [x] | Tirador de Dados | `/tirador-dados/` | juegos |

## Legal, Fiscal y Patrimonio (`legal-fiscal`) — 45 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [x] | Asistente Alta Autónomo | `/asistente-alta-autonomo/` | legal-fiscal, freelance |
| [ ] | Asistente Constitución Asociación | `/asistente-constitucion-asociacion/` | legal-fiscal |
| [ ] | Asistente Constitución Sociedad | `/asistente-constitucion-sociedad/` | legal-fiscal, freelance |
| [x] | Calendario Fiscal Emprendedor | `/calendario-fiscal-emprendedor/` | legal-fiscal, freelance |
| [ ] | Checklist Declaración de la Renta 2026 | `/checklist-declaracion-renta/` | legal-fiscal, finanzas, freelance |
| [x] | Comparador Autónomo vs SL | `/comparador-autonomo-vs-sl/` | legal-fiscal, freelance |
| [ ] | Comparador de Formas Jurídicas | `/comparador-formas-juridicas/` | legal-fiscal, freelance |
| [ ] | Declaración Renta Persona Fallecida | `/declaracion-renta-fallecidos/` | legal-fiscal, finanzas |
| [ ] | Estimador de Complemento a Mínimos | `/estimador-complemento-minimos/` | legal-fiscal, finanzas |
| [ ] | Estimador de Costas Judiciales | `/estimador-costas-judiciales/` | legal-fiscal |
| [ ] | Estimador de Costes de Divorcio | `/estimador-costes-divorcio/` | legal-fiscal |
| [x] | Estimador de Cuota de Autónomo | `/estimador-cuota-autonomo/` | legal-fiscal, freelance |
| [x] | Estimador de Legítimas | `/estimador-legitimas/` | legal-fiscal, finanzas |
| [x] | Estimador de Sueldo Neto | `/estimador-sueldo-neto/` | legal-fiscal, freelance |
| [x] | Estimador Impuesto de Donaciones | `/estimador-impuesto-donaciones/` | legal-fiscal |
| [x] | Estimador Impuesto de Sucesiones | `/estimador-impuesto-sucesiones/` | legal-fiscal |
| [ ] | Estimador IRPF | `/estimador-irpf/` | legal-fiscal |
| [x] | Estimador IRPF Pensionista | `/estimador-irpf-pensionista/` | legal-fiscal, finanzas |
| [x] | Estimador Pensión de Viudedad | `/estimador-pension-viudedad/` | legal-fiscal, finanzas |
| [ ] | Estimador Plusvalía Municipal (IIVTNU) | `/estimador-plusvalia-municipal/` | legal-fiscal, inmobiliaria |
| [ ] | Estimador Plusvalías IRPF | `/estimador-plusvalias-irpf/` | legal-fiscal, finanzas |
| [ ] | Estimador SMI 2026 | `/estimador-smi/` | legal-fiscal, finanzas |
| [ ] | Guía de Plazos Legales | `/plazos-legales/` | legal-fiscal |
| [ ] | Guía para Gestionar una Herencia | `/guia/herencias/` | legal-fiscal |
| [ ] | Impuestos en el Divorcio | `/impuestos-divorcio/` | legal-fiscal, finanzas |
| [ ] | Optimizador de Rentas 60+ | `/optimizador-rentas-60/` | legal-fiscal, finanzas |
| [x] | Orientación para Tramitar una Herencia | `/orientacion-tramitacion-herencias/` | legal-fiscal |
| [ ] | Orientador de Ayudas y Prestaciones para Personas y Familias | `/orientador-ayudas-personas-familias/` | legal-fiscal, finanzas |
| [ ] | Orientador de Becas y Ayudas al Estudio | `/orientador-becas-ayudas-estudio/` | legal-fiscal, estudiantes |
| [x] | Orientador de Gastos Deducibles | `/orientador-gastos-deducibles/` | legal-fiscal, freelance |
| [ ] | Orientador de Intereses de Demora | `/orientador-intereses-demora/` | legal-fiscal, freelance |
| [ ] | Orientador de Justicia Gratuita | `/orientador-justicia-gratuita/` | legal-fiscal |
| [x] | Orientador de Trámites de Jubilación | `/orientador-tramites-jubilacion/` | legal-fiscal, finanzas |
| [ ] | Orientador Límite Conjunto IRPF-Patrimonio | `/orientador-limite-conjunto-patrimonio/` | legal-fiscal, finanzas |
| [ ] | Orientador Visa Nómada Digital | `/requisitos-nomada-digital/` | legal-fiscal, freelance |
| [x] | Planificador de Ahorro para la Jubilación | `/planificador-ahorro-jubilacion/` | legal-fiscal, finanzas |
| [x] | Simulador de Jubilación Pública | `/simulador-jubilacion-publica/` | legal-fiscal, finanzas |
| [ ] | Simulador del Mito del Tramo Superior IRPF | `/simulador-mito-tramo-superior/` | legal-fiscal, finanzas |
| [x] | Simulador Desglose de Nómina (Bruto a Neto) | `/simulador-desglose-nomina/` | legal-fiscal, finanzas |
| [x] | Simulador Heredar Vivienda (ISD + Plusvalía + IRPF) | `/simulador-heredar-vivienda/` | legal-fiscal, inmobiliaria |
| [ ] | Simulador Módulos vs Estimación Directa Autónomos | `/simulador-modulos-vs-directa/` | legal-fiscal, freelance |
| [ ] | Simulador Plan de Pensiones IRPF: Aporte vs Rescate | `/simulador-renta-plan-pensiones/` | legal-fiscal, finanzas |
| [x] | Simulador Visual de Tramos IRPF 2025 | `/simulador-irpf-tramos/` | legal-fiscal, finanzas |
| [ ] | Test Obligación Declarar Renta 2025 | `/test-obligado-declarar-renta/` | legal-fiscal, finanzas, freelance |
| [x] | Verificador del Complemento por Brecha de Género | `/verificador-complemento-brecha-genero/` | legal-fiscal, finanzas |

## Productividad (`productividad`) — 34 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Auditoría de Energía Semanal | `/auditoria-energia-semanal/` | productividad, salud |
| [ ] | Auditoría de Habilidades vs Mercado | `/auditoria-habilidades-mercado/` | productividad, cultura |
| [ ] | Auditoría de Reuniones | `/auditoria-reuniones/` | productividad, freelance |
| [ ] | Calculadora Costes Teletrabajo | `/calculadora-costes-teletrabajo/` | productividad, finanzas, freelance |
| [ ] | Calculadora de Fechas | `/calculadora-fechas/` | productividad |
| [ ] | Calculadora de Porcentajes | `/calculadora-porcentajes/` | productividad, estudiantes |
| [ ] | Calculadora Regla de Tres | `/calculadora-regla-de-tres/` | productividad, estudiantes |
| [ ] | Checklist Pre-Mortem | `/checklist-pre-mortem/` | productividad, freelance |
| [ ] | Conversor de Formatos | `/conversor-formatos/` | productividad |
| [ ] | Conversor de Tallas | `/conversor-tallas/` | productividad |
| [ ] | Conversor de Texto | `/conversor-texto/` | productividad |
| [x] | Conversor de Unidades | `/conversor-unidades/` | productividad, viajes |
| [ ] | Cronómetro y Temporizador | `/cronometro/` | productividad |
| [ ] | Diagnóstico de Comunicación Interna | `/diagnostico-comunicacion-interna/` | productividad, freelance |
| [ ] | Diagnóstico de Estancamiento Profesional | `/diagnostico-estancamiento-profesional/` | productividad, cultura |
| [ ] | Diagnóstico de Multitarea | `/diagnostico-multitarea/` | productividad |
| [ ] | Diagnóstico Explotación vs Exploración | `/diagnostico-explotacion-exploracion/` | productividad, freelance |
| [ ] | Generador de Actas de Reunión | `/generador-actas/` | productividad |
| [ ] | Generador de Firmas Email | `/generador-firma-email/` | productividad |
| [ ] | Limpiador de Texto | `/limpiador-texto/` | productividad |
| [x] | Lista de Equipaje | `/lista-equipaje/` | productividad, viajes |
| [ ] | Mapa de Compromisos vs Capacidad | `/mapa-compromisos-capacidad/` | productividad, freelance |
| [ ] | Mapa de Decisiones Urgentes vs Importantes | `/mapa-decisiones-urgentes-importantes/` | productividad, freelance |
| [ ] | Matriz Eisenhower | `/matriz-eisenhower/` | productividad, freelance |
| [ ] | Planificador de Boda | `/planificador-boda/` | productividad, inmobiliaria |
| [ ] | Planificador de Turnos | `/planificador-turnos/` | productividad |
| [ ] | Selector de Método de Productividad | `/selector-herramienta-productividad/` | productividad, freelance |
| [ ] | Selector de Modalidad de Trabajo | `/selector-modalidad-trabajo/` | productividad, freelance |
| [ ] | Selector de Vacaciones | `/selector-vacaciones/` | productividad, salud |
| [ ] | Test de Delegación Efectiva | `/test-delegacion-efectiva/` | productividad, freelance |
| [ ] | Test de Ritmo Vital | `/test-ritmo-vital/` | productividad, salud |
| [ ] | Test de Síndrome del Impostor | `/test-sindrome-impostor/` | productividad, salud |
| [ ] | Test Madurez Digital | `/test-madurez-digital/` | productividad, tecnicas, diseno |
| [ ] | Toma de Decisiones: Sistemas 1 y 2 de Kahneman | `/visualizador-toma-decisiones/` | productividad, cultura |

## Salud y Bienestar (`salud`) — 122 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [ ] | Acetilcolina: El Primer Neurotransmisor Descubierto | `/visualizador-acetilcolina/` | salud, cultura, estudiantes |
| [ ] | Adaptación del Hogar | `/adaptacion-hogar/` | salud, legal-fiscal, inmobiliaria |
| [ ] | ADN Polimerasa - La Máquina que Copia tu Genoma | `/visualizador-adn-polimerasa/` | salud, cultura, estudiantes |
| [ ] | Adrenalina: La Hormona de la Supervivencia | `/visualizador-adrenalina/` | salud, cultura, estudiantes |
| [ ] | Anestesia: Cómo se Apaga y Enciende la Consciencia | `/visualizador-anestesia/` | salud, cultura, estudiantes |
| [ ] | Antibióticos: Cómo Matan Bacterias y la Resistencia | `/visualizador-antibioticos/` | salud, cultura, estudiantes |
| [ ] | Aspirina, Paracetamol e Ibuprofeno: Comparativa de los 3 Analgésicos | `/visualizador-analgesicos/` | salud, cultura, estudiantes |
| [ ] | Aspirina: Cómo Funciona el Fármaco más Universal | `/visualizador-aspirina/` | salud, cultura, estudiantes |
| [ ] | ATP Sintasa - El Motor Molecular que te da Energía | `/visualizador-atp-sintasa/` | salud, cultura, estudiantes |
| [ ] | Ayuno Intermitente: Fases Metabólicas y Autofagia | `/visualizador-ayuno-intermitente/` | salud |
| [ ] | Calculadora de 1RM — Repetición Máxima | `/calculadora-1rm-gimnasio/` | salud, tecnicas |
| [ ] | Calculadora de Alimentación Mascotas | `/calculadora-alimentacion-mascotas/` | salud |
| [ ] | Calculadora de Calorías | `/calculadora-calorias-ejercicio/` | salud |
| [ ] | Calculadora de Estadística Médica | `/calculadora-estadistica-medica/` | salud, estudiantes |
| [ ] | Calculadora de Hidratación | `/calculadora-hidratacion/` | salud |
| [ ] | Calculadora de Macros | `/calculadora-macros/` | salud |
| [ ] | Calculadora de Pace de Running | `/calculadora-pace-running/` | salud, tecnicas |
| [ ] | Calculadora de Porciones | `/calculadora-porciones/` | salud |
| [ ] | Calculadora de Potencia en Ciclismo (W/kg y VAM) | `/calculadora-potencia-ciclismo/` | salud, tecnicas |
| [ ] | Calculadora de Sueño | `/calculadora-sueno/` | salud |
| [ ] | Calculadora de Zonas Cardíacas (Karvonen) | `/calculadora-zonas-cardiacas/` | salud, tecnicas |
| [ ] | Calculadora Edad Mascotas | `/calculadora-edad-mascotas/` | salud |
| [ ] | Calculadora SWOLF — Eficiencia en Natación | `/calculadora-swolf-natacion/` | salud, tecnicas |
| [x] | Calculadora Tamaño Adulto Cachorro | `/calculadora-tamano-adulto-perro/` | salud |
| [ ] | Calculadora Zonas de Entrenamiento — FC por Zona y Karvonen | `/calculadora-zonas-entrenamiento/` | salud |
| [ ] | Catalasa - La Enzima más Rápida del Cuerpo | `/visualizador-catalasa/` | salud, cultura, estudiantes |
| [ ] | Cerebro y Emociones - Amígdala, Neurotransmisores y Regulación | `/visualizador-cerebro-emociones/` | salud, estudiantes, cultura |
| [ ] | Checklist de Trámites de Dependencia | `/checklist-tramites-dependencia/` | salud, legal-fiscal |
| [ ] | Chequeos Médicos Preventivos | `/planificador-chequeos-medicos/` | salud, legal-fiscal |
| [ ] | Ciclo Cardíaco - Sístole, Diástole y ECG | `/visualizador-corazon-ciclo-cardiaco/` | salud, estudiantes, cultura |
| [ ] | Cómo el Cuerpo Mantiene el Equilibrio | `/visualizador-sistemas-equilibrio/` | salud, estudiantes |
| [ ] | Cómo Envejece tu Cuerpo | `/visualizador-envejecimiento-cuerpo/` | salud, cultura |
| [ ] | Cómo Funciona el Dolor — Nocicepción y Tipos | `/visualizador-como-funciona-el-dolor/` | salud, estudiantes |
| [ ] | Cómo Funciona una Vacuna | `/visualizador-vacunas/` | salud, cultura, estudiantes |
| [ ] | Cómo Piensa tu Cerebro | `/visualizador-cerebro/` | salud, cultura, estudiantes |
| [ ] | Cómo se Descubre un Medicamento | `/visualizador-desarrollo-farmaco/` | salud, cultura |
| [ ] | Cortisol - La Hormona del Estrés en tu Cuerpo | `/visualizador-cortisol/` | salud, cultura |
| [x] | Curso de Nutrición | `/curso-nutrisalud/` | salud, cultura |
| [ ] | Diario Emocional Visual | `/diario-emocional/` | salud |
| [ ] | Dopamina - El Sistema de Recompensa del Cerebro | `/visualizador-dopamina/` | salud, cultura, estudiantes |
| [ ] | El Hierro: Hemoglobina, Absorción y Anemia Ferropénica | `/visualizador-hierro/` | salud, cultura, estudiantes |
| [ ] | El Hígado - Detoxificación y Metabolismo | `/visualizador-higado/` | salud, estudiantes, cultura |
| [ ] | El Magnesio: 300 Reacciones Enzimáticas y Déficit Silencioso | `/visualizador-magnesio/` | salud, cultura, estudiantes |
| [ ] | El Riñón y la Filtración - Nefrona y Formación de Orina | `/visualizador-rinon-filtracion/` | salud, estudiantes, cultura |
| [ ] | Endorfinas - Los Opioides que Fabrica tu Cuerpo | `/visualizador-endorfinas/` | salud, cultura, estudiantes |
| [ ] | Envejecimiento Celular - Telómeros, Senescencia y Hallmarks | `/visualizador-envejecimiento-celular/` | salud, estudiantes, cultura |
| [ ] | Estimación de Baja Maternal y Paternal | `/estimacion-baja-maternal/` | salud, productividad |
| [ ] | Estimación de Deducción IRPF por Discapacidad | `/estimacion-deduccion-discapacidad/` | salud, finanzas, legal-fiscal |
| [ ] | Estimación de Prestación por Nacimiento | `/estimacion-prestacion-nacimiento/` | salud, finanzas |
| [ ] | Estimación de Prestaciones por Dependencia | `/estimacion-prestaciones-dependencia/` | salud, legal-fiscal, finanzas |
| [ ] | Estimador de Riesgo de Osteoporosis | `/estimador-riesgo-osteoporosis/` | salud, legal-fiscal |
| [ ] | Estrógenos - Las Hormonas del Ciclo y la Salud Ósea | `/visualizador-estrogenos/` | salud, cultura, estudiantes |
| [ ] | Farmacocinética - Cómo Viaja un Fármaco por el Cuerpo | `/visualizador-farmacocinetica/` | salud, estudiantes, cultura |
| [ ] | GABA: El Gran Freno del Sistema Nervioso | `/visualizador-gaba/` | salud, cultura, estudiantes |
| [ ] | Guía Cuidado de Mascotas | `/guia-cuidado-mascota/` | salud, cultura |
| [ ] | Guía de Aditivos E Alimentarios | `/aditivos-e-alimentarios/` | salud, cultura |
| [ ] | Guía de Cortes de Carne | `/guia-cortes-carne/` | salud, cultura |
| [ ] | Guía de Especias | `/guia-especias/` | salud, cultura |
| [ ] | Guía de Frutas Exóticas | `/guia-frutas-exoticas/` | salud, cultura |
| [ ] | Guía de Frutos Secos | `/guia-frutos-secos/` | salud, cultura |
| [ ] | Guía de Hierbas Aromáticas | `/guia-hierbas-aromaticas/` | salud, cultura |
| [ ] | Guía de Infusiones | `/guia-infusiones/` | salud, cultura |
| [ ] | Guía de Insectos del Jardín | `/guia-insectos-jardin/` | salud, cultura |
| [ ] | Guía de Plantas de Interior | `/guia-plantas-interior/` | salud, cultura |
| [ ] | Guía de Quesos | `/guia-quesos/` | salud, cultura |
| [ ] | Guía de Razas de Gatos | `/guia-razas-gatos/` | salud, cultura |
| [ ] | Guía de Razas de Perros | `/guia-razas-perros/` | salud, cultura |
| [ ] | Guía de Setas | `/guia-setas/` | salud, cultura |
| [ ] | Guía de Superalimentos | `/guia-superalimentos/` | salud, cultura |
| [ ] | Guía del Aceite de Oliva | `/guia-aceite-oliva/` | salud, cultura |
| [ ] | Guía del Café | `/guia-cafe/` | salud, cultura |
| [ ] | Guía del Té | `/guia-te/` | salud, cultura |
| [ ] | Huesos del Cuerpo Humano | `/huesos-cuerpo-humano/` | salud, cultura |
| [ ] | Ibuprofeno: Inhibidor COX con Efecto Antiinflamatorio | `/visualizador-ibuprofeno/` | salud, cultura, estudiantes |
| [ ] | Índice Glucémico vs. Carga Glucémica: La Paradoja de la Sandía | `/visualizador-indice-glucemico/` | salud, cultura, estudiantes |
| [ ] | Insulina y Glucosa - Cómo Regula tu Cuerpo el Azúcar | `/visualizador-insulina-glucosa/` | salud, cultura, estudiantes |
| [ ] | La Cicatrización - Las 4 Fases de Reparación de Heridas | `/visualizador-cicatrizacion/` | salud, estudiantes, cultura |
| [ ] | La Huella de lo que Comes | `/visualizador-huella-alimentos/` | salud, cultura |
| [ ] | La Piel - Capas, Funciones y Cicatrización | `/visualizador-piel/` | salud, estudiantes, cultura |
| [ ] | Lactasa - La Enzima que Revolucionó la Historia Humana | `/visualizador-lactasa/` | salud, cultura, estudiantes |
| [ ] | Lo que Cuesta Enfermarse | `/visualizador-coste-sanidad/` | salud, cultura |
| [ ] | Melatonina - La Hormona del Reloj Interno | `/visualizador-melatonina/` | salud, cultura, estudiantes |
| [ ] | Metabolismo del Alcohol: El Acetaldehído Multi-Órgano | `/visualizador-metabolismo-alcohol/` | salud, cultura |
| [ ] | Orientador Colesterol | `/orientador-colesterol/` | salud, legal-fiscal |
| [ ] | Orientador Grado de Dependencia | `/orientador-grado-dependencia/` | salud, legal-fiscal |
| [ ] | Orientador Grado de Discapacidad | `/orientador-discapacidad/` | salud, legal-fiscal |
| [ ] | Orientador IMC | `/orientador-imc/` | salud |
| [ ] | Orientador Medicamentos Mascotas | `/orientador-medicamentos-mascotas/` | salud |
| [ ] | Orientador Percentiles Infantiles | `/orientador-percentiles/` | salud |
| [ ] | Orientador Tensión Arterial | `/orientador-tension-arterial/` | salud, legal-fiscal |
| [ ] | Oxitocina - La Hormona del Vínculo Social | `/visualizador-oxitocina/` | salud, cultura, estudiantes |
| [ ] | Paracetamol: Cómo Actúa en el Sistema Nervioso Central | `/visualizador-paracetamol/` | salud, cultura, estudiantes |
| [ ] | Planificador de Gastos del Primer Año del Bebé | `/planificador-gastos-bebe/` | salud, finanzas |
| [ ] | Planificador de Mascota | `/planificador-mascota/` | salud |
| [ ] | Planificador de Turnos de Cuidadores | `/planificador-turnos-cuidadores/` | salud, productividad |
| [ ] | Planificador Embarazo y Bebé | `/planificador-embarazo/` | salud |
| [ ] | Predictor de Tiempos de Running | `/calculadora-tiempos-running/` | salud, tecnicas |
| [ ] | Qué Pasa Cuando Duermes | `/visualizador-ciclos-sueno/` | salud, cultura |
| [ ] | Residencia vs Cuidado en Casa | `/residencia-vs-cuidado-en-casa/` | salud, legal-fiscal, finanzas |
| [ ] | Seguimiento Ciclo Menstrual y Fertilidad | `/seguimiento-ciclo-menstrual/` | salud |
| [ ] | Seguimiento de Hábitos | `/seguimiento-habitos/` | salud, productividad |
| [ ] | Selector de Actividades según Movilidad | `/selector-actividades-movilidad/` | salud, legal-fiscal |
| [ ] | Selector de Dieta | `/selector-dieta/` | salud |
| [ ] | Selector de Ejercicio | `/selector-ejercicio/` | salud, productividad |
| [ ] | Selector de Gestión del Estrés | `/selector-gestion-estres/` | salud, productividad |
| [ ] | Selector de Mascota | `/selector-mascota/` | salud, productividad |
| [ ] | Selector de Seguro de Salud | `/selector-seguro-salud/` | salud, finanzas |
| [ ] | Selector de Tipo de Gimnasio | `/selector-tipo-gimnasio/` | salud, productividad |
| [ ] | Serotonina: Mucho Más que la Hormona de la Felicidad | `/visualizador-serotonina/` | salud, cultura, estudiantes |
| [ ] | Telomerasa - La Enzima de la Inmortalidad Celular | `/visualizador-telomerasa/` | salud, cultura, estudiantes |
| [ ] | Test de Bienestar WHO-5 | `/test-bienestar-who5/` | salud |
| [ ] | Test de Burnout Laboral | `/test-burnout-laboral/` | salud, productividad |
| [ ] | Test de Estilo Parental | `/test-estilo-parental/` | salud |
| [ ] | Test de Fragilidad (Escala FRAIL) | `/test-fragilidad/` | salud, legal-fiscal |
| [ ] | Test de Hábitos Saludables | `/test-habitos-saludables/` | salud |
| [ ] | Test de Zarit — Sobrecarga del Cuidador | `/test-zarit-cuidador/` | salud |
| [ ] | Testosterona - La Hormona del Rendimiento | `/visualizador-testosterona/` | salud, cultura, estudiantes |
| [ ] | Tiroides - La Glándula que Regula tu Metabolismo | `/visualizador-tiroides/` | salud, cultura, estudiantes |
| [ ] | Tu Cuerpo en Números | `/visualizador-cuerpo-numeros/` | salud, cultura, estudiantes |
| [ ] | Vitamina B12: Ciclo de Metilación y Factor Intrínseco | `/visualizador-vitamina-b12/` | salud, cultura, estudiantes |
| [ ] | Vitamina D: La Vitamina que Actúa como Hormona | `/visualizador-vitamina-d/` | salud, cultura, estudiantes |
| [ ] | Vitaminas y Minerales | `/vitaminas-minerales/` | salud, cultura |

## Viajes y Turismo (`viajes`) — 10 apps

| Estado | Nombre | URL | Suites |
|---|---|---|---|
| [x] | Comparador de Coste de Vida | `/comparador-coste-vida/` | viajes, finanzas |
| [x] | Comparador de Transporte para Viajes | `/comparador-transporte-viaje/` | viajes, tecnicas |
| [x] | Conversor de Divisas | `/conversor-divisas/` | viajes, finanzas |
| [x] | Enchufes por País | `/enchufes-por-pais/` | viajes, tecnicas |
| [x] | Guía de Seguro de Viaje | `/guia-seguro-viaje/` | viajes, finanzas |
| [x] | Información del Tiempo | `/informacion-tiempo/` | viajes |
| [x] | Organizador de Documentos de Viaje | `/checklist-documentos-viaje/` | viajes, productividad |
| [x] | Orientador de Jet Lag | `/orientador-jet-lag/` | viajes, salud |
| [x] | Planificador de Itinerario | `/planificador-itinerario/` | viajes, productividad |
| [x] | Presupuesto de Viaje | `/presupuesto-viaje/` | viajes, finanzas |

