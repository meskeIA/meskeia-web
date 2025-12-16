'use client';

import { useState } from 'react';
import styles from './CalculadoraCocina.module.css';
import { MeskeiaLogo, Footer, ResultCard, EducationalSection, RelatedApps} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type TabActiva = 'conversor' | 'escalador' | 'tiempos' | 'sustitutos';

// ==================== DATOS DE CONVERSIÓN ====================

interface ConversionUnidad {
  nombre: string;
  aGramos: number; // Factor de conversión a gramos (o ml para líquidos)
  categoria: 'peso' | 'volumen' | 'temperatura';
}

const unidadesCocina: Record<string, ConversionUnidad> = {
  // Peso
  'gramos': { nombre: 'Gramos (g)', aGramos: 1, categoria: 'peso' },
  'kilogramos': { nombre: 'Kilogramos (kg)', aGramos: 1000, categoria: 'peso' },
  'onzas': { nombre: 'Onzas (oz)', aGramos: 28.3495, categoria: 'peso' },
  'libras': { nombre: 'Libras (lb)', aGramos: 453.592, categoria: 'peso' },
  // Volumen
  'mililitros': { nombre: 'Mililitros (ml)', aGramos: 1, categoria: 'volumen' },
  'litros': { nombre: 'Litros (L)', aGramos: 1000, categoria: 'volumen' },
  'tazas': { nombre: 'Tazas (cup)', aGramos: 240, categoria: 'volumen' },
  'cucharadas': { nombre: 'Cucharadas (tbsp)', aGramos: 15, categoria: 'volumen' },
  'cucharaditas': { nombre: 'Cucharaditas (tsp)', aGramos: 5, categoria: 'volumen' },
  'onzas-liquidas': { nombre: 'Onzas líquidas (fl oz)', aGramos: 29.5735, categoria: 'volumen' },
};

// Densidades aproximadas para conversión peso↔volumen
const densidadesIngredientes: Record<string, number> = {
  'agua': 1,
  'leche': 1.03,
  'aceite': 0.92,
  'harina': 0.53,
  'azucar': 0.85,
  'azucar-glass': 0.48,
  'sal': 1.2,
  'arroz': 0.75,
  'miel': 1.42,
  'mantequilla': 0.91,
  'cacao': 0.52,
  'avena': 0.4,
};

// ==================== DATOS DE TIEMPOS DE COCCIÓN ====================

interface TiempoCoccion {
  alimento: string;
  metodo: string;
  tiempo: string;
  temperatura?: string;
  notas?: string;
}

const tiemposCoccion: TiempoCoccion[] = [
  // Carnes
  { alimento: 'Pollo entero', metodo: 'Horno', tiempo: '1h 15min - 1h 30min', temperatura: '180°C', notas: 'Por cada 500g' },
  { alimento: 'Pechuga de pollo', metodo: 'Plancha', tiempo: '6-8 min por lado', notas: 'Fuego medio-alto' },
  { alimento: 'Pechuga de pollo', metodo: 'Horno', tiempo: '25-30 min', temperatura: '200°C' },
  { alimento: 'Muslos de pollo', metodo: 'Horno', tiempo: '35-45 min', temperatura: '200°C' },
  { alimento: 'Filete de ternera (poco hecho)', metodo: 'Plancha', tiempo: '2-3 min por lado', notas: 'Fuego alto' },
  { alimento: 'Filete de ternera (al punto)', metodo: 'Plancha', tiempo: '3-4 min por lado', notas: 'Fuego alto' },
  { alimento: 'Filete de ternera (muy hecho)', metodo: 'Plancha', tiempo: '5-6 min por lado', notas: 'Fuego medio' },
  { alimento: 'Costillas de cerdo', metodo: 'Horno', tiempo: '2h - 2h 30min', temperatura: '150°C', notas: 'Cocción lenta' },
  { alimento: 'Chuletas de cerdo', metodo: 'Plancha', tiempo: '4-5 min por lado', notas: 'Fuego medio-alto' },
  { alimento: 'Hamburguesa', metodo: 'Plancha', tiempo: '4-5 min por lado', notas: 'Fuego medio' },
  // Pescados
  { alimento: 'Salmón (filete)', metodo: 'Horno', tiempo: '12-15 min', temperatura: '200°C' },
  { alimento: 'Salmón (filete)', metodo: 'Plancha', tiempo: '3-4 min por lado', notas: 'Fuego medio' },
  { alimento: 'Merluza', metodo: 'Horno', tiempo: '15-20 min', temperatura: '180°C' },
  { alimento: 'Gambas/Langostinos', metodo: 'Plancha', tiempo: '2-3 min por lado', notas: 'Fuego alto' },
  { alimento: 'Mejillones', metodo: 'Vapor', tiempo: '5-7 min', notas: 'Hasta que se abran' },
  // Verduras
  { alimento: 'Patatas (enteras)', metodo: 'Hervir', tiempo: '20-30 min', notas: 'Según tamaño' },
  { alimento: 'Patatas (trozos)', metodo: 'Hervir', tiempo: '15-20 min' },
  { alimento: 'Patatas', metodo: 'Horno', tiempo: '45-60 min', temperatura: '200°C' },
  { alimento: 'Brócoli', metodo: 'Hervir', tiempo: '5-7 min', notas: 'Al dente' },
  { alimento: 'Brócoli', metodo: 'Vapor', tiempo: '5-6 min' },
  { alimento: 'Zanahorias (rodajas)', metodo: 'Hervir', tiempo: '8-10 min' },
  { alimento: 'Judías verdes', metodo: 'Hervir', tiempo: '8-12 min' },
  { alimento: 'Espárragos', metodo: 'Plancha', tiempo: '3-5 min', notas: 'Fuego medio-alto' },
  { alimento: 'Calabacín (rodajas)', metodo: 'Plancha', tiempo: '3-4 min por lado' },
  { alimento: 'Berenjena (rodajas)', metodo: 'Plancha', tiempo: '4-5 min por lado' },
  { alimento: 'Pimientos', metodo: 'Horno', tiempo: '30-40 min', temperatura: '200°C', notas: 'Para asar' },
  // Huevos
  { alimento: 'Huevo pasado por agua', metodo: 'Hervir', tiempo: '3-4 min', notas: 'Desde ebullición' },
  { alimento: 'Huevo mollet', metodo: 'Hervir', tiempo: '5-6 min', notas: 'Yema cremosa' },
  { alimento: 'Huevo duro', metodo: 'Hervir', tiempo: '10-12 min', notas: 'Desde ebullición' },
  { alimento: 'Huevo frito', metodo: 'Sartén', tiempo: '2-3 min', notas: 'Aceite caliente' },
  { alimento: 'Tortilla francesa', metodo: 'Sartén', tiempo: '2-3 min', notas: 'Fuego medio-alto' },
  // Pasta y arroz
  { alimento: 'Espaguetis', metodo: 'Hervir', tiempo: '8-10 min', notas: 'Al dente, ver paquete' },
  { alimento: 'Macarrones', metodo: 'Hervir', tiempo: '10-12 min', notas: 'Al dente, ver paquete' },
  { alimento: 'Arroz blanco', metodo: 'Hervir', tiempo: '15-18 min', notas: '2 partes agua x 1 arroz' },
  { alimento: 'Arroz integral', metodo: 'Hervir', tiempo: '40-45 min', notas: '2.5 partes agua' },
  // Legumbres
  { alimento: 'Lentejas', metodo: 'Hervir', tiempo: '25-30 min', notas: 'Sin remojo previo' },
  { alimento: 'Garbanzos', metodo: 'Hervir', tiempo: '1h 30min - 2h', notas: 'Con remojo previo 12h' },
  { alimento: 'Alubias', metodo: 'Hervir', tiempo: '1h - 1h 30min', notas: 'Con remojo previo 12h' },
];

// ==================== DATOS DE SUSTITUTOS ====================

interface Sustituto {
  ingrediente: string;
  sustitutos: {
    opcion: string;
    cantidad: string;
    notas?: string;
  }[];
}

const sustitutosIngredientes: Sustituto[] = [
  {
    ingrediente: 'Huevo (1 unidad)',
    sustitutos: [
      { opcion: 'Plátano maduro', cantidad: '1/2 plátano machacado', notas: 'Para repostería' },
      { opcion: 'Compota de manzana', cantidad: '60g', notas: 'Para bizcochos' },
      { opcion: 'Yogur', cantidad: '60g', notas: 'Para esponjosidad' },
      { opcion: 'Semillas de lino + agua', cantidad: '1 cda + 3 cdas agua', notas: 'Dejar reposar 5 min' },
      { opcion: 'Semillas de chía + agua', cantidad: '1 cda + 3 cdas agua', notas: 'Dejar reposar 15 min' },
      { opcion: 'Aquafaba', cantidad: '3 cucharadas', notas: 'Líquido de garbanzos cocidos' },
    ],
  },
  {
    ingrediente: 'Mantequilla (100g)',
    sustitutos: [
      { opcion: 'Aceite de oliva', cantidad: '80ml', notas: 'Sabor más intenso' },
      { opcion: 'Aceite de girasol', cantidad: '80ml', notas: 'Sabor neutro' },
      { opcion: 'Aceite de coco', cantidad: '100g', notas: 'Solidifica en frío' },
      { opcion: 'Puré de aguacate', cantidad: '100g', notas: 'Para repostería' },
      { opcion: 'Compota de manzana', cantidad: '100g', notas: 'Reduce grasa' },
      { opcion: 'Yogur griego', cantidad: '100g', notas: 'Para bizcochos' },
    ],
  },
  {
    ingrediente: 'Leche (1 taza / 240ml)',
    sustitutos: [
      { opcion: 'Bebida de almendras', cantidad: '240ml', notas: 'Sin azúcar preferible' },
      { opcion: 'Bebida de avena', cantidad: '240ml', notas: 'Cremosa, ideal repostería' },
      { opcion: 'Bebida de soja', cantidad: '240ml', notas: 'Alto contenido proteico' },
      { opcion: 'Leche de coco', cantidad: '240ml', notas: 'Sabor tropical' },
      { opcion: 'Agua + mantequilla', cantidad: '230ml agua + 15g mantequilla', notas: 'En caso de emergencia' },
    ],
  },
  {
    ingrediente: 'Nata para montar (200ml)',
    sustitutos: [
      { opcion: 'Leche de coco refrigerada', cantidad: '200ml (parte sólida)', notas: 'Enfriar lata 24h' },
      { opcion: 'Nata de anacardos', cantidad: '200ml', notas: 'Anacardos remojados batidos' },
      { opcion: 'Tofu sedoso batido', cantidad: '200g', notas: 'Para cremas, no montar' },
    ],
  },
  {
    ingrediente: 'Harina de trigo (100g)',
    sustitutos: [
      { opcion: 'Harina de almendra', cantidad: '100g', notas: 'Sin gluten, más densa' },
      { opcion: 'Harina de avena', cantidad: '100g', notas: 'Moler copos en batidora' },
      { opcion: 'Harina de arroz', cantidad: '100g', notas: 'Sin gluten, textura diferente' },
      { opcion: 'Maicena', cantidad: '50g', notas: 'Para espesar, no para masas' },
      { opcion: 'Harina de espelta', cantidad: '100g', notas: 'Contiene gluten, más digestiva' },
    ],
  },
  {
    ingrediente: 'Azúcar blanco (100g)',
    sustitutos: [
      { opcion: 'Azúcar moreno', cantidad: '100g', notas: 'Sabor a caramelo' },
      { opcion: 'Miel', cantidad: '75g', notas: 'Reducir líquidos de receta' },
      { opcion: 'Sirope de arce', cantidad: '75ml', notas: 'Reducir líquidos de receta' },
      { opcion: 'Stevia', cantidad: '2g (1/2 cdta)', notas: 'Muy concentrado' },
      { opcion: 'Eritritol', cantidad: '100g', notas: '70% dulzor del azúcar' },
      { opcion: 'Dátiles triturados', cantidad: '100g', notas: 'En repostería' },
    ],
  },
  {
    ingrediente: 'Levadura química (1 sobre / 16g)',
    sustitutos: [
      { opcion: 'Bicarbonato + limón', cantidad: '8g bicarbonato + 15ml limón', notas: 'Mezclar justo antes' },
      { opcion: 'Bicarbonato + vinagre', cantidad: '8g bicarbonato + 15ml vinagre', notas: 'Reacción inmediata' },
      { opcion: 'Bicarbonato + yogur', cantidad: '8g bicarbonato + 125g yogur', notas: 'Añadir yogur a la masa' },
    ],
  },
  {
    ingrediente: 'Queso parmesano (50g)',
    sustitutos: [
      { opcion: 'Levadura nutricional', cantidad: '30g', notas: 'Sabor similar, vegano' },
      { opcion: 'Queso curado de oveja', cantidad: '50g', notas: 'Sabor intenso' },
      { opcion: 'Queso pecorino', cantidad: '50g', notas: 'Más salado' },
    ],
  },
  {
    ingrediente: 'Caldo de pollo (1L)',
    sustitutos: [
      { opcion: 'Caldo de verduras', cantidad: '1L', notas: 'Vegetariano' },
      { opcion: 'Agua + pastilla de caldo', cantidad: '1L + 1 pastilla' },
      { opcion: 'Miso diluido', cantidad: '2 cdas miso + 1L agua', notas: 'Sabor umami' },
    ],
  },
  {
    ingrediente: 'Vino blanco para cocinar (100ml)',
    sustitutos: [
      { opcion: 'Caldo de pollo/verduras', cantidad: '100ml', notas: 'Sin alcohol' },
      { opcion: 'Zumo de limón + agua', cantidad: '25ml limón + 75ml agua', notas: 'Acidez similar' },
      { opcion: 'Vinagre de manzana + agua', cantidad: '15ml vinagre + 85ml agua' },
      { opcion: 'Zumo de uva blanca', cantidad: '100ml', notas: 'Sin alcohol, más dulce' },
    ],
  },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function CalculadoraCocinaPage() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('conversor');

  // Estado para conversor
  const [cantidadOrigen, setCantidadOrigen] = useState('');
  const [unidadOrigen, setUnidadOrigen] = useState('tazas');
  const [unidadDestino, setUnidadDestino] = useState('gramos');
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('harina');
  const [resultadoConversion, setResultadoConversion] = useState<string | null>(null);

  // Estado para escalador
  const [porcionesOriginales, setPorcionesOriginales] = useState('4');
  const [porcionesDeseadas, setPorcionesDeseadas] = useState('');
  const [ingredientesReceta, setIngredientesReceta] = useState('200g harina\n100g azúcar\n2 huevos\n150ml leche');
  const [resultadoEscalado, setResultadoEscalado] = useState<string | null>(null);

  // Estado para tiempos
  const [filtroTiempo, setFiltroTiempo] = useState('');
  const [metodoFiltro, setMetodoFiltro] = useState('todos');

  // Estado para sustitutos
  const [busquedaSustituto, setBusquedaSustituto] = useState('');

  // ==================== FUNCIONES ====================

  const convertirUnidades = () => {
    const cantidad = parseSpanishNumber(cantidadOrigen);
    if (isNaN(cantidad) || cantidad <= 0) {
      setResultadoConversion('Introduce una cantidad válida');
      return;
    }

    const origen = unidadesCocina[unidadOrigen];
    const destino = unidadesCocina[unidadDestino];

    if (!origen || !destino) {
      setResultadoConversion('Selecciona unidades válidas');
      return;
    }

    // Si ambas son del mismo tipo (peso o volumen), conversión directa
    if (origen.categoria === destino.categoria || origen.categoria === 'temperatura' || destino.categoria === 'temperatura') {
      const resultado = (cantidad * origen.aGramos) / destino.aGramos;
      setResultadoConversion(`${formatNumber(cantidad, 2)} ${origen.nombre} = ${formatNumber(resultado, 2)} ${destino.nombre}`);
    } else {
      // Necesitamos densidad del ingrediente
      const densidad = densidadesIngredientes[ingredienteSeleccionado] || 1;

      let resultado: number;
      if (origen.categoria === 'volumen' && destino.categoria === 'peso') {
        // ml a g: multiplicar por densidad
        const enMl = cantidad * origen.aGramos;
        const enG = enMl * densidad;
        resultado = enG / destino.aGramos;
      } else {
        // g a ml: dividir por densidad
        const enG = cantidad * origen.aGramos;
        const enMl = enG / densidad;
        resultado = enMl / destino.aGramos;
      }

      const ingredienteNombre = ingredienteSeleccionado.replace('-', ' ');
      setResultadoConversion(`${formatNumber(cantidad, 2)} ${origen.nombre} de ${ingredienteNombre} = ${formatNumber(resultado, 2)} ${destino.nombre}`);
    }
  };

  const escalarReceta = () => {
    const original = parseSpanishNumber(porcionesOriginales);
    const deseadas = parseSpanishNumber(porcionesDeseadas);

    if (isNaN(original) || isNaN(deseadas) || original <= 0 || deseadas <= 0) {
      setResultadoEscalado('Introduce valores válidos para las porciones');
      return;
    }

    const factor = deseadas / original;
    const lineas = ingredientesReceta.split('\n').filter(l => l.trim());

    const resultado = lineas.map(linea => {
      // Buscar números en la línea (incluyendo decimales con coma o punto)
      const match = linea.match(/^([\d.,]+)\s*(.+)$/);
      if (match) {
        const cantidadOriginal = parseSpanishNumber(match[1]);
        const resto = match[2];
        if (!isNaN(cantidadOriginal)) {
          const nuevaCantidad = cantidadOriginal * factor;
          // Formatear según si es entero o decimal
          const cantidadFormateada = nuevaCantidad % 1 === 0
            ? formatNumber(nuevaCantidad, 0)
            : formatNumber(nuevaCantidad, 1);
          return `${cantidadFormateada} ${resto}`;
        }
      }
      return linea; // Si no encuentra número, devolver línea original
    }).join('\n');

    setResultadoEscalado(resultado);
  };

  const tiemposFiltrados = tiemposCoccion.filter(t => {
    const coincideTexto = filtroTiempo === '' ||
      t.alimento.toLowerCase().includes(filtroTiempo.toLowerCase());
    const coincideMetodo = metodoFiltro === 'todos' ||
      t.metodo.toLowerCase() === metodoFiltro.toLowerCase();
    return coincideTexto && coincideMetodo;
  });

  const sustitutosFiltrados = sustitutosIngredientes.filter(s =>
    busquedaSustituto === '' ||
    s.ingrediente.toLowerCase().includes(busquedaSustituto.toLowerCase())
  );

  const metodosUnicos = [...new Set(tiemposCoccion.map(t => t.metodo))];

  // ==================== RENDER ====================

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Cocina</h1>
        <p className={styles.subtitle}>
          Convierte unidades, escala recetas, consulta tiempos y encuentra sustitutos
        </p>
      </header>

      {/* Tabs de navegación */}
      <nav className={styles.tabs}>
        <button
          className={`${styles.tab} ${tabActiva === 'conversor' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('conversor')}
        >
          Conversor
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'escalador' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('escalador')}
        >
          Escalador
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'tiempos' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('tiempos')}
        >
          Tiempos
        </button>
        <button
          className={`${styles.tab} ${tabActiva === 'sustitutos' ? styles.tabActiva : ''}`}
          onClick={() => setTabActiva('sustitutos')}
        >
          Sustitutos
        </button>
      </nav>

      <main className={styles.mainContent}>
        {/* ==================== TAB CONVERSOR ==================== */}
        {tabActiva === 'conversor' && (
          <section className={styles.tabPanel}>
            <h2 className={styles.sectionTitle}>Conversor de Unidades</h2>
            <p className={styles.sectionDesc}>
              Convierte entre unidades de peso y volumen. Para conversiones peso↔volumen, selecciona el ingrediente.
            </p>

            <div className={styles.conversorGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="cantidadOrigen">Cantidad</label>
                <input
                  type="text"
                  id="cantidadOrigen"
                  value={cantidadOrigen}
                  onChange={(e) => setCantidadOrigen(e.target.value)}
                  placeholder="ej: 2"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="unidadOrigen">De</label>
                <select
                  id="unidadOrigen"
                  value={unidadOrigen}
                  onChange={(e) => setUnidadOrigen(e.target.value)}
                  className={styles.select}
                >
                  <optgroup label="Volumen">
                    <option value="tazas">Tazas (cup)</option>
                    <option value="cucharadas">Cucharadas (tbsp)</option>
                    <option value="cucharaditas">Cucharaditas (tsp)</option>
                    <option value="mililitros">Mililitros (ml)</option>
                    <option value="litros">Litros (L)</option>
                    <option value="onzas-liquidas">Onzas líquidas (fl oz)</option>
                  </optgroup>
                  <optgroup label="Peso">
                    <option value="gramos">Gramos (g)</option>
                    <option value="kilogramos">Kilogramos (kg)</option>
                    <option value="onzas">Onzas (oz)</option>
                    <option value="libras">Libras (lb)</option>
                  </optgroup>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="unidadDestino">A</label>
                <select
                  id="unidadDestino"
                  value={unidadDestino}
                  onChange={(e) => setUnidadDestino(e.target.value)}
                  className={styles.select}
                >
                  <optgroup label="Peso">
                    <option value="gramos">Gramos (g)</option>
                    <option value="kilogramos">Kilogramos (kg)</option>
                    <option value="onzas">Onzas (oz)</option>
                    <option value="libras">Libras (lb)</option>
                  </optgroup>
                  <optgroup label="Volumen">
                    <option value="tazas">Tazas (cup)</option>
                    <option value="cucharadas">Cucharadas (tbsp)</option>
                    <option value="cucharaditas">Cucharaditas (tsp)</option>
                    <option value="mililitros">Mililitros (ml)</option>
                    <option value="litros">Litros (L)</option>
                    <option value="onzas-liquidas">Onzas líquidas (fl oz)</option>
                  </optgroup>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="ingrediente">Ingrediente (para peso↔volumen)</label>
                <select
                  id="ingrediente"
                  value={ingredienteSeleccionado}
                  onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                  className={styles.select}
                >
                  <option value="agua">Agua</option>
                  <option value="leche">Leche</option>
                  <option value="aceite">Aceite</option>
                  <option value="harina">Harina de trigo</option>
                  <option value="azucar">Azúcar</option>
                  <option value="azucar-glass">Azúcar glass</option>
                  <option value="sal">Sal</option>
                  <option value="arroz">Arroz</option>
                  <option value="miel">Miel</option>
                  <option value="mantequilla">Mantequilla</option>
                  <option value="cacao">Cacao en polvo</option>
                  <option value="avena">Avena</option>
                </select>
              </div>
            </div>

            <button onClick={convertirUnidades} className={styles.btnPrimary}>
              Convertir
            </button>

            {resultadoConversion && (
              <ResultCard
                title="Resultado"
                value={resultadoConversion}
                variant="highlight"
                icon="="
              />
            )}

            {/* Tabla de referencia rápida */}
            <div className={styles.tablaReferencia}>
              <h3>Equivalencias rápidas</h3>
              <div className={styles.equivalenciasGrid}>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 taza</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>240 ml</span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 cucharada</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>15 ml</span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 cucharadita</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>5 ml</span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 onza</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>28,35 g</span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 libra</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>453,6 g</span>
                </div>
                <div className={styles.equivalencia}>
                  <span className={styles.eqValor}>1 fl oz</span>
                  <span className={styles.eqIgual}>=</span>
                  <span className={styles.eqResultado}>29,57 ml</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ==================== TAB ESCALADOR ==================== */}
        {tabActiva === 'escalador' && (
          <section className={styles.tabPanel}>
            <h2 className={styles.sectionTitle}>Escalador de Recetas</h2>
            <p className={styles.sectionDesc}>
              Ajusta las cantidades de tu receta para más o menos porciones.
            </p>

            <div className={styles.escaladorGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="porcionesOriginales">Porciones de la receta original</label>
                <input
                  type="text"
                  id="porcionesOriginales"
                  value={porcionesOriginales}
                  onChange={(e) => setPorcionesOriginales(e.target.value)}
                  placeholder="ej: 4"
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="porcionesDeseadas">Porciones que quieres</label>
                <input
                  type="text"
                  id="porcionesDeseadas"
                  value={porcionesDeseadas}
                  onChange={(e) => setPorcionesDeseadas(e.target.value)}
                  placeholder="ej: 6"
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="ingredientesReceta">
                Ingredientes (un ingrediente por línea, empezando por la cantidad)
              </label>
              <textarea
                id="ingredientesReceta"
                value={ingredientesReceta}
                onChange={(e) => setIngredientesReceta(e.target.value)}
                placeholder="200g harina&#10;100g azúcar&#10;2 huevos&#10;150ml leche"
                className={styles.textarea}
                rows={8}
              />
            </div>

            <button onClick={escalarReceta} className={styles.btnPrimary}>
              Escalar Receta
            </button>

            {resultadoEscalado && (
              <div className={styles.resultadoEscalado}>
                <h3>Ingredientes escalados</h3>
                <pre className={styles.preResultado}>{resultadoEscalado}</pre>
              </div>
            )}
          </section>
        )}

        {/* ==================== TAB TIEMPOS ==================== */}
        {tabActiva === 'tiempos' && (
          <section className={styles.tabPanel}>
            <h2 className={styles.sectionTitle}>Tiempos de Cocción</h2>
            <p className={styles.sectionDesc}>
              Consulta tiempos orientativos de cocción para diferentes alimentos y métodos.
            </p>

            <div className={styles.filtrosGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="filtroTiempo">Buscar alimento</label>
                <input
                  type="text"
                  id="filtroTiempo"
                  value={filtroTiempo}
                  onChange={(e) => setFiltroTiempo(e.target.value)}
                  placeholder="ej: pollo, patatas, arroz..."
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="metodoFiltro">Método de cocción</label>
                <select
                  id="metodoFiltro"
                  value={metodoFiltro}
                  onChange={(e) => setMetodoFiltro(e.target.value)}
                  className={styles.select}
                >
                  <option value="todos">Todos los métodos</option>
                  {metodosUnicos.map(metodo => (
                    <option key={metodo} value={metodo.toLowerCase()}>{metodo}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.tablaTiempos}>
              <div className={styles.tablaHeader}>
                <span>Alimento</span>
                <span>Método</span>
                <span>Tiempo</span>
                <span>Temp./Notas</span>
              </div>
              {tiemposFiltrados.length > 0 ? (
                tiemposFiltrados.map((t, i) => (
                  <div key={i} className={styles.tablaRow}>
                    <span className={styles.alimento}>{t.alimento}</span>
                    <span className={styles.metodo}>{t.metodo}</span>
                    <span className={styles.tiempo}>{t.tiempo}</span>
                    <span className={styles.notas}>
                      {t.temperatura && <span className={styles.temperatura}>{t.temperatura}</span>}
                      {t.notas && <span>{t.notas}</span>}
                    </span>
                  </div>
                ))
              ) : (
                <p className={styles.sinResultados}>No se encontraron resultados para tu búsqueda</p>
              )}
            </div>
          </section>
        )}

        {/* ==================== TAB SUSTITUTOS ==================== */}
        {tabActiva === 'sustitutos' && (
          <section className={styles.tabPanel}>
            <h2 className={styles.sectionTitle}>Sustitutos de Ingredientes</h2>
            <p className={styles.sectionDesc}>
              Encuentra alternativas cuando te falte un ingrediente.
            </p>

            <div className={styles.inputGroup}>
              <label htmlFor="busquedaSustituto">Buscar ingrediente</label>
              <input
                type="text"
                id="busquedaSustituto"
                value={busquedaSustituto}
                onChange={(e) => setBusquedaSustituto(e.target.value)}
                placeholder="ej: huevo, mantequilla, leche..."
                className={styles.input}
              />
            </div>

            <div className={styles.sustitutosGrid}>
              {sustitutosFiltrados.map((s, i) => (
                <div key={i} className={styles.sustitutoCard}>
                  <h3 className={styles.ingredienteTitulo}>{s.ingrediente}</h3>
                  <ul className={styles.listaSustitutos}>
                    {s.sustitutos.map((sub, j) => (
                      <li key={j} className={styles.sustitutoItem}>
                        <strong>{sub.opcion}</strong>
                        <span className={styles.cantidad}>{sub.cantidad}</span>
                        {sub.notas && <em className={styles.notaSustituto}>{sub.notas}</em>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {sustitutosFiltrados.length === 0 && (
                <p className={styles.sinResultados}>No se encontraron sustitutos para tu búsqueda</p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Contenido educativo */}
      <EducationalSection
        title="Consejos de Cocina"
        subtitle="Trucos y equivalencias útiles"
        icon="👨‍🍳"
      >
        <div className={styles.educationalContent}>
          <section className={styles.conceptoSection}>
            <h2>Medidas sin báscula</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <h4>Con una cuchara sopera</h4>
                <ul>
                  <li>Harina: 10g</li>
                  <li>Azúcar: 15g</li>
                  <li>Aceite: 14g</li>
                  <li>Miel: 21g</li>
                </ul>
              </div>
              <div className={styles.tipCard}>
                <h4>Con un vaso de agua (200ml)</h4>
                <ul>
                  <li>Harina: 110g</li>
                  <li>Azúcar: 180g</li>
                  <li>Arroz: 180g</li>
                  <li>Leche: 200g</li>
                </ul>
              </div>
              <div className={styles.tipCard}>
                <h4>Temperaturas del horno</h4>
                <ul>
                  <li>Muy suave: 110-130°C</li>
                  <li>Suave: 140-170°C</li>
                  <li>Moderado: 180-190°C</li>
                  <li>Fuerte: 200-220°C</li>
                  <li>Muy fuerte: 230-260°C</li>
                </ul>
              </div>
              <div className={styles.tipCard}>
                <h4>Conversión °C a °F</h4>
                <ul>
                  <li>150°C = 300°F</li>
                  <li>180°C = 350°F</li>
                  <li>200°C = 400°F</li>
                  <li>220°C = 425°F</li>
                </ul>
                <p className={styles.formula}>°F = (°C × 9/5) + 32</p>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-cocina')} />

      <Footer appName="calculadora-cocina" />
    </div>
  );
}
