// Datos de guías educativas generados automáticamente
// Total de guías: 91

export interface Guide {
  slug: string;
  title: string;
  url: string;
}

export interface GuidesByCategory {
  [category: string]: Guide[];
}

export const guidesByCategory: GuidesByCategory = {
  "Calculadoras y Utilidades": [
    { slug: "calculadora-cocina", title: "Conversor de Cocina 2025", url: "/guias/calculadoras-y-utilidades/calculadora-cocina" },
    { slug: "calculadora-fechas", title: "Calculadora de Fechas 2025", url: "/guias/calculadoras-y-utilidades/calculadora-fechas" },
    { slug: "calculadora-porcentajes", title: "Calculadora de Porcentajes 2025", url: "/guias/calculadoras-y-utilidades/calculadora-porcentajes" },
    { slug: "calculadora-propinas", title: "Calculadora de Propinas 2025", url: "/guias/calculadoras-y-utilidades/calculadora-propinas" },
    { slug: "calculadora-simple", title: "Calculadora Simple 2025", url: "/guias/calculadoras-y-utilidades/calculadora-simple" },
    { slug: "conversor-divisas", title: "Conversor de Divisas 2025", url: "/guias/calculadoras-y-utilidades/conversor-divisas" },
    { slug: "conversor-tallas", title: "Conversor de Tallas 2025", url: "/guias/calculadoras-y-utilidades/conversor-tallas" },
    { slug: "conversor-unidades", title: "Conversor de Unidades 2025", url: "/guias/calculadoras-y-utilidades/conversor-unidades" },
    { slug: "lista-compras", title: "Lista de Compras 2025", url: "/guias/calculadoras-y-utilidades/lista-compras" },
    { slug: "regla-de-tres", title: "Regla de Tres 2025", url: "/guias/calculadoras-y-utilidades/regla-de-tres" },
  ],
  "Campus Digital": [
    { slug: "calculadora-notas", title: "Calculadora de Notas 2025", url: "/guias/campus-digital/calculadora-notas" },
    { slug: "creador-flashcards", title: "Creador de Flashcards 2025", url: "/guias/campus-digital/creador-flashcards" },
    { slug: "curso-decisiones-inversion", title: "Curso Decisiones de Inversión 2025", url: "/guias/campus-digital/curso-decisiones-inversion" },
    { slug: "curso-emprendimiento", title: "Curso de Emprendimiento 2025", url: "/guias/campus-digital/curso-emprendimiento" },
    { slug: "generador-horarios-estudio", title: "Generador de Horarios de Estudio 2025", url: "/guias/campus-digital/generador-horarios-estudio" },
  ],
  "Creatividad y Diseño": [
    { slug: "calculadora-aspectos", title: "Calculadora de Aspectos de Imagen 2025", url: "/guias/creatividad-y-diseno/calculadora-aspectos" },
    { slug: "contraste-colores", title: "Contraste de Colores 2025", url: "/guias/creatividad-y-diseno/contraste-colores" },
    { slug: "convertidor-colores", title: "Convertidor de Colores 2025", url: "/guias/creatividad-y-diseno/convertidor-colores" },
    { slug: "creador-paletas", title: "Creador de Paletas 2025", url: "/guias/creatividad-y-diseno/creador-paletas" },
    { slug: "generador-gradientes", title: "Generador de Gradientes 2025", url: "/guias/creatividad-y-diseno/generador-gradientes" },
    { slug: "generador-sombras", title: "Generador de Sombras 2025", url: "/guias/creatividad-y-diseno/generador-sombras" },
    { slug: "generador-tipografias", title: "Generador de Tipografías 2025", url: "/guias/creatividad-y-diseno/generador-tipografias" },
  ],
  "Emprendimiento y Negocios": [
    { slug: "calculadora-roi-marketing", title: "Calculadora de ROI de Marketing 2025", url: "/guias/emprendimiento-y-negocios/calculadora-roi-marketing" },
    { slug: "calculadora-tarifa-freelance", title: "Calculadora de Tarifa Freelance 2025", url: "/guias/emprendimiento-y-negocios/calculadora-tarifa-freelance" },
    { slug: "generador-nombres-empresa", title: "Generador de Nombres de Empresa 2025", url: "/guias/emprendimiento-y-negocios/generador-nombres-empresa" },
    { slug: "margen-equilibrio", title: "Margen de Equilibrio (Break-Even) 2025", url: "/guias/emprendimiento-y-negocios/margen-equilibrio" },
    { slug: "planificador-cashflow", title: "Planificador de Cash Flow 2025", url: "/guias/emprendimiento-y-negocios/planificador-cashflow" },
    { slug: "simulador-gastos-deducibles", title: "Simulador de Gastos Deducibles 2025", url: "/guias/emprendimiento-y-negocios/simulador-gastos-deducibles" },
  ],
  "Finanzas y Fiscalidad": [
    { slug: "calculadora-inversiones", title: "Calculadora de Inversiones 2025", url: "/guias/finanzas-y-fiscalidad/calculadora-inversiones" },
    { slug: "calculadora-jubilacion", title: "Calculadora de Jubilación 2025", url: "/guias/finanzas-y-fiscalidad/calculadora-jubilacion" },
    { slug: "control-gastos-mensual", title: "Control de Gastos Mensual 2025", url: "/guias/finanzas-y-fiscalidad/control-gastos-mensual" },
    { slug: "impuesto-donaciones", title: "Impuesto de Donaciones 2025", url: "/guias/finanzas-y-fiscalidad/impuesto-donaciones" },
    { slug: "impuesto-donaciones-nacional", title: "Impuesto de Donaciones Nacional 2025", url: "/guias/finanzas-y-fiscalidad/impuesto-donaciones-nacional" },
    { slug: "impuesto-sucesiones", title: "Impuesto de Sucesiones 2025", url: "/guias/finanzas-y-fiscalidad/impuesto-sucesiones" },
    { slug: "impuesto-sucesiones-nacional", title: "Impuesto de Sucesiones Nacional 2025", url: "/guias/finanzas-y-fiscalidad/impuesto-sucesiones-nacional" },
    { slug: "interes-compuesto", title: "Interés Compuesto 2025", url: "/guias/finanzas-y-fiscalidad/interes-compuesto" },
    { slug: "simulador-hipoteca", title: "Simulador de Hipoteca 2025", url: "/guias/finanzas-y-fiscalidad/simulador-hipoteca" },
    { slug: "simulador-irpf", title: "Simulador IRPF 2025", url: "/guias/finanzas-y-fiscalidad/simulador-irpf" },
    { slug: "tir-van", title: "TIR y VAN 2025", url: "/guias/finanzas-y-fiscalidad/tir-van" },
  ],
  "Física y Química": [
    { slug: "calculadora-electricidad", title: "Calculadora Eléctrica 2025", url: "/guias/fisica-y-quimica/calculadora-electricidad" },
    { slug: "calculadora-movimiento", title: "Calculadora de Movimiento 2025", url: "/guias/fisica-y-quimica/calculadora-movimiento" },
    { slug: "formulas-quimicas", title: "Fórmulas Químicas 2025", url: "/guias/fisica-y-quimica/formulas-quimicas" },
    { slug: "glosario-fisica-quimica", title: "Glosario de Física y Química 2025", url: "/guias/fisica-y-quimica/glosario-fisica-quimica" },
    { slug: "tabla-periodica", title: "Tabla Periódica Interactiva 2025", url: "/guias/fisica-y-quimica/tabla-periodica" },
  ],
  "Herramientas de Productividad": [
    { slug: "conversor-horarios", title: "⏰ Conversor de Horarios Mundial: Guía Completa 2025", url: "/guias/herramientas-de-productividad/conversor-horarios" },
    { slug: "cronometro-temporizador", title: "Cronómetro y Temporizador 2025", url: "/guias/herramientas-de-productividad/cronometro-temporizador" },
    { slug: "cuaderno-digital", title: "Cuaderno Digital 2025", url: "/guias/herramientas-de-productividad/cuaderno-digital" },
    { slug: "generador-codigos-barras", title: "📊 Generador de Códigos de Barras: Guía Completa 2025", url: "/guias/herramientas-de-productividad/generador-codigos-barras" },
    { slug: "generador-codigos-qr", title: "Generador de Códigos QR 2025", url: "/guias/herramientas-de-productividad/generador-codigos-qr" },
    { slug: "generador-contrasenas", title: "Generador de Contraseñas 2025", url: "/guias/herramientas-de-productividad/generador-contrasenas" },
    { slug: "generador-texto", title: "Generador de Texto 2025", url: "/guias/herramientas-de-productividad/generador-texto" },
    { slug: "horario-mundial", title: "Horario Mundial 2025", url: "/guias/herramientas-de-productividad/horario-mundial" },
    { slug: "informacion-tiempo", title: "Información del Tiempo 2025", url: "/guias/herramientas-de-productividad/informacion-tiempo" },
    { slug: "lista-tareas", title: "Gestor de Tareas 2025", url: "/guias/herramientas-de-productividad/lista-tareas" },
  ],
  "Herramientas Web y Tecnología": [
    { slug: "acortador-url", title: "Acortador de URLs 2025", url: "/guias/herramientas-web-y-tecnologia/acortador-url" },
    { slug: "conversor-base64", title: "Conversor Base64 2025", url: "/guias/herramientas-web-y-tecnologia/conversor-base64" },
    { slug: "conversor-imagenes", title: "Conversor de Imágenes 2025", url: "/guias/herramientas-web-y-tecnologia/conversor-imagenes" },
    { slug: "generador-hash", title: "Generador de Hash 2025", url: "/guias/herramientas-web-y-tecnologia/generador-hash" },
    { slug: "validador-json", title: "Validador JSON 2025", url: "/guias/herramientas-web-y-tecnologia/validador-json" },
    { slug: "validador-regex", title: "Validador de Regex 2025", url: "/guias/herramientas-web-y-tecnologia/validador-regex" },
  ],
  "Juegos y Entretenimiento": [
    { slug: "juego-2048", title: "Juego 2048 2025", url: "/guias/juegos-y-entretenimiento/juego-2048" },
    { slug: "juego-memoria", title: "Juego de Memoria 2025", url: "/guias/juegos-y-entretenimiento/juego-memoria" },
    { slug: "piedra-papel-tijera", title: "Piedra Papel Tijera 2025", url: "/guias/juegos-y-entretenimiento/piedra-papel-tijera" },
    { slug: "puzzle-matematico", title: "Puzzle Matemático 2025", url: "/guias/juegos-y-entretenimiento/puzzle-matematico" },
    { slug: "radio-meskeia", title: "Radio meskeIA 2025", url: "/guias/juegos-y-entretenimiento/radio-meskeia" },
    { slug: "sudoku-clasico", title: "Sudoku Clásico 2025", url: "/guias/juegos-y-entretenimiento/sudoku-clasico" },
    { slug: "tres-en-raya", title: "Tres en Raya 2025", url: "/guias/juegos-y-entretenimiento/tres-en-raya" },
    { slug: "wordle-espanol", title: "Wordle Español 2025", url: "/guias/juegos-y-entretenimiento/wordle-espanol" },
  ],
  "Matemáticas y Estadística": [
    { slug: "algebra-abstracta", title: "Álgebra Abstracta 2025", url: "/guias/matematicas-y-estadistica/algebra-abstracta" },
    { slug: "algebra", title: "Calculadora de Álgebra 2025", url: "/guias/matematicas-y-estadistica/algebra" },
    { slug: "calculadora-estadistica", title: "Calculadora de Estadística 2025", url: "/guias/matematicas-y-estadistica/calculadora-estadistica" },
    { slug: "calculadora-matematica", title: "Calculadora Matemática 2025", url: "/guias/matematicas-y-estadistica/calculadora-matematica" },
    { slug: "calculo", title: "Cálculo Diferencial e Integral 2025", url: "/guias/matematicas-y-estadistica/calculo" },
    { slug: "geometria", title: "Geometría 2025", url: "/guias/matematicas-y-estadistica/geometria" },
    { slug: "grafico-funciones", title: "Gráfico de Funciones 2025", url: "/guias/matematicas-y-estadistica/grafico-funciones" },
    { slug: "investigacion-operativa", title: "Investigación Operativa 2025", url: "/guias/matematicas-y-estadistica/investigacion-operativa" },
    { slug: "matriz", title: "Matriz 2025", url: "/guias/matematicas-y-estadistica/matriz" },
    { slug: "probabilidad", title: "Probabilidad 2025", url: "/guias/matematicas-y-estadistica/probabilidad" },
    { slug: "teoria-numeros", title: "Teoría de Números 2025", url: "/guias/matematicas-y-estadistica/teoria-numeros" },
    { slug: "trigonometria", title: "Trigonometría 2025", url: "/guias/matematicas-y-estadistica/trigonometria" },
  ],
  "Salud & Bienestar": [
    { slug: "calculadora-calorias-ejercicio", title: "Calculadora de Calorías por Ejercicio 2025", url: "/guias/salud-y-bienestar/calculadora-calorias-ejercicio" },
    { slug: "calculadora-hidratacion", title: "Calculadora de Hidratación 2025", url: "/guias/salud-y-bienestar/calculadora-hidratacion" },
    { slug: "calculadora-sueno", title: "Calculadora de Sueño 2025", url: "/guias/salud-y-bienestar/calculadora-sueno" },
    { slug: "evaluador-salud", title: "Evaluador de Salud 2025", url: "/guias/salud-y-bienestar/evaluador-salud" },
    { slug: "indice-masa-corporal", title: "Índice de Masa Corporal (IMC) 2025", url: "/guias/salud-y-bienestar/indice-masa-corporal" },
    { slug: "nutrisalud", title: "NutriSalud 2025", url: "/guias/salud-y-bienestar/nutrisalud" },
  ],
  "Texto y Documentos": [
    { slug: "comparador-textos", title: "Comparador de Textos 2025", url: "/guias/texto-y-documentos/comparador-textos" },
    { slug: "contador-palabras", title: "Contador de Palabras 2025", url: "/guias/texto-y-documentos/contador-palabras" },
    { slug: "conversor-texto", title: "Conversor de Texto 2025", url: "/guias/texto-y-documentos/conversor-texto" },
    { slug: "convertidor-markdown-html", title: "Markdown a HTML 2025", url: "/guias/texto-y-documentos/convertidor-markdown-html" },
    { slug: "limpiador-texto", title: "Limpiador de Texto 2025", url: "/guias/texto-y-documentos/limpiador-texto" },
  ],
};

// Obtener total de guías
export const getTotalGuidesCount = (): number => {
  return Object.values(guidesByCategory).reduce((total, guides) => total + guides.length, 0);
};

// Obtener guías por categoría
export const getGuidesByCategory = (categoryName: string): Guide[] => {
  return guidesByCategory[categoryName] || [];
};
