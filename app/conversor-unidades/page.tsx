'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import styles from './ConversorUnidades.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice } from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de categorías
type Categoria = 'longitud' | 'masa' | 'temperatura' | 'area' | 'volumen' | 'tiempo' | 'velocidad' | 'datos' | 'quimica' | 'presion' | 'energia' | 'fuerza' | 'potencia';

interface UnidadConversion {
  nombre: string;
  simbolo: string;
  factor: number; // Factor respecto a la unidad base
}

// Datos de conversión
const CONVERSIONES: Record<Categoria, { base: string; unidades: Record<string, UnidadConversion> }> = {
  longitud: {
    base: 'm',
    unidades: {
      km: { nombre: 'Kilómetro', simbolo: 'km', factor: 1000 },
      m: { nombre: 'Metro', simbolo: 'm', factor: 1 },
      cm: { nombre: 'Centímetro', simbolo: 'cm', factor: 0.01 },
      mm: { nombre: 'Milímetro', simbolo: 'mm', factor: 0.001 },
      mi: { nombre: 'Milla', simbolo: 'mi', factor: 1609.344 },
      yd: { nombre: 'Yarda', simbolo: 'yd', factor: 0.9144 },
      ft: { nombre: 'Pie', simbolo: 'ft', factor: 0.3048 },
      in: { nombre: 'Pulgada', simbolo: 'in', factor: 0.0254 },
      nm: { nombre: 'Milla náutica', simbolo: 'nmi', factor: 1852 },
    }
  },
  masa: {
    base: 'kg',
    unidades: {
      t: { nombre: 'Tonelada', simbolo: 't', factor: 1000 },
      kg: { nombre: 'Kilogramo', simbolo: 'kg', factor: 1 },
      g: { nombre: 'Gramo', simbolo: 'g', factor: 0.001 },
      mg: { nombre: 'Miligramo', simbolo: 'mg', factor: 0.000001 },
      lb: { nombre: 'Libra', simbolo: 'lb', factor: 0.453592 },
      oz: { nombre: 'Onza', simbolo: 'oz', factor: 0.0283495 },
      st: { nombre: 'Stone', simbolo: 'st', factor: 6.35029 },
    }
  },
  temperatura: {
    base: 'C',
    unidades: {
      C: { nombre: 'Celsius', simbolo: '°C', factor: 1 },
      F: { nombre: 'Fahrenheit', simbolo: '°F', factor: 1 },
      K: { nombre: 'Kelvin', simbolo: 'K', factor: 1 },
    }
  },
  area: {
    base: 'm2',
    unidades: {
      km2: { nombre: 'Kilómetro cuadrado', simbolo: 'km²', factor: 1000000 },
      ha: { nombre: 'Hectárea', simbolo: 'ha', factor: 10000 },
      m2: { nombre: 'Metro cuadrado', simbolo: 'm²', factor: 1 },
      cm2: { nombre: 'Centímetro cuadrado', simbolo: 'cm²', factor: 0.0001 },
      mi2: { nombre: 'Milla cuadrada', simbolo: 'mi²', factor: 2589988.11 },
      ac: { nombre: 'Acre', simbolo: 'ac', factor: 4046.8564 },
      ft2: { nombre: 'Pie cuadrado', simbolo: 'ft²', factor: 0.092903 },
    }
  },
  volumen: {
    base: 'L',
    unidades: {
      m3: { nombre: 'Metro cúbico', simbolo: 'm³', factor: 1000 },
      L: { nombre: 'Litro', simbolo: 'L', factor: 1 },
      mL: { nombre: 'Mililitro', simbolo: 'mL', factor: 0.001 },
      gal: { nombre: 'Galón (US)', simbolo: 'gal', factor: 3.78541 },
      qt: { nombre: 'Cuarto (US)', simbolo: 'qt', factor: 0.946353 },
      pt: { nombre: 'Pinta (US)', simbolo: 'pt', factor: 0.473176 },
      floz: { nombre: 'Onza fluida (US)', simbolo: 'fl oz', factor: 0.0295735 },
      cm3: { nombre: 'Centímetro cúbico', simbolo: 'cm³', factor: 0.001 },
    }
  },
  tiempo: {
    base: 's',
    unidades: {
      yr: { nombre: 'Año', simbolo: 'año', factor: 31536000 },
      mo: { nombre: 'Mes (30 días)', simbolo: 'mes', factor: 2592000 },
      wk: { nombre: 'Semana', simbolo: 'sem', factor: 604800 },
      d: { nombre: 'Día', simbolo: 'd', factor: 86400 },
      h: { nombre: 'Hora', simbolo: 'h', factor: 3600 },
      min: { nombre: 'Minuto', simbolo: 'min', factor: 60 },
      s: { nombre: 'Segundo', simbolo: 's', factor: 1 },
      ms: { nombre: 'Milisegundo', simbolo: 'ms', factor: 0.001 },
    }
  },
  velocidad: {
    base: 'ms',
    unidades: {
      ms: { nombre: 'Metro/segundo', simbolo: 'm/s', factor: 1 },
      kmh: { nombre: 'Kilómetro/hora', simbolo: 'km/h', factor: 0.277778 },
      mph: { nombre: 'Milla/hora', simbolo: 'mph', factor: 0.44704 },
      kn: { nombre: 'Nudo', simbolo: 'kn', factor: 0.514444 },
      fts: { nombre: 'Pie/segundo', simbolo: 'ft/s', factor: 0.3048 },
      c: { nombre: 'Velocidad de la luz', simbolo: 'c', factor: 299792458 },
    }
  },
  datos: {
    base: 'B',
    unidades: {
      TB: { nombre: 'Terabyte', simbolo: 'TB', factor: 1099511627776 },
      GB: { nombre: 'Gigabyte', simbolo: 'GB', factor: 1073741824 },
      MB: { nombre: 'Megabyte', simbolo: 'MB', factor: 1048576 },
      KB: { nombre: 'Kilobyte', simbolo: 'KB', factor: 1024 },
      B: { nombre: 'Byte', simbolo: 'B', factor: 1 },
      bit: { nombre: 'Bit', simbolo: 'bit', factor: 0.125 },
      Tib: { nombre: 'Tebibit', simbolo: 'Tib', factor: 137438953472 },
      Gib: { nombre: 'Gibibit', simbolo: 'Gib', factor: 134217728 },
    }
  },
  quimica: {
    base: 'mol',
    unidades: {
      mol: { nombre: 'Mol', simbolo: 'mol', factor: 1 },
      mmol: { nombre: 'Milimol', simbolo: 'mmol', factor: 0.001 },
      umol: { nombre: 'Micromol', simbolo: 'μmol', factor: 0.000001 },
      nmol: { nombre: 'Nanomol', simbolo: 'nmol', factor: 0.000000001 },
      kmol: { nombre: 'Kilomol', simbolo: 'kmol', factor: 1000 },
      NA: { nombre: 'Número Avogadro', simbolo: 'NA', factor: 6.02214076e23 },
    }
  },
  presion: {
    base: 'Pa',
    unidades: {
      Pa: { nombre: 'Pascal', simbolo: 'Pa', factor: 1 },
      kPa: { nombre: 'Kilopascal', simbolo: 'kPa', factor: 1000 },
      MPa: { nombre: 'Megapascal', simbolo: 'MPa', factor: 1000000 },
      bar: { nombre: 'Bar', simbolo: 'bar', factor: 100000 },
      atm: { nombre: 'Atmósfera', simbolo: 'atm', factor: 101325 },
      psi: { nombre: 'PSI', simbolo: 'psi', factor: 6894.76 },
      mmHg: { nombre: 'mm de Mercurio', simbolo: 'mmHg', factor: 133.322 },
      torr: { nombre: 'Torr', simbolo: 'Torr', factor: 133.322 },
    }
  },
  energia: {
    base: 'J',
    unidades: {
      J: { nombre: 'Julio', simbolo: 'J', factor: 1 },
      kJ: { nombre: 'Kilojulio', simbolo: 'kJ', factor: 1000 },
      cal: { nombre: 'Caloría', simbolo: 'cal', factor: 4.184 },
      kcal: { nombre: 'Kilocaloría', simbolo: 'kcal', factor: 4184 },
      Wh: { nombre: 'Vatio-hora', simbolo: 'Wh', factor: 3600 },
      kWh: { nombre: 'Kilovatio-hora', simbolo: 'kWh', factor: 3600000 },
      eV: { nombre: 'Electronvoltio', simbolo: 'eV', factor: 1.60218e-19 },
      BTU: { nombre: 'BTU', simbolo: 'BTU', factor: 1055.06 },
    }
  },
  fuerza: {
    base: 'N',
    unidades: {
      N: { nombre: 'Newton', simbolo: 'N', factor: 1 },
      kN: { nombre: 'Kilonewton', simbolo: 'kN', factor: 1000 },
      dyn: { nombre: 'Dina', simbolo: 'dyn', factor: 0.00001 },
      lbf: { nombre: 'Libra-fuerza', simbolo: 'lbf', factor: 4.44822 },
      kgf: { nombre: 'Kilogramo-fuerza', simbolo: 'kgf', factor: 9.80665 },
      gf: { nombre: 'Gramo-fuerza', simbolo: 'gf', factor: 0.00980665 },
    }
  },
  potencia: {
    base: 'W',
    unidades: {
      W: { nombre: 'Vatio', simbolo: 'W', factor: 1 },
      kW: { nombre: 'Kilovatio', simbolo: 'kW', factor: 1000 },
      MW: { nombre: 'Megavatio', simbolo: 'MW', factor: 1000000 },
      hp: { nombre: 'Caballo de fuerza', simbolo: 'hp', factor: 745.7 },
      CV: { nombre: 'Caballo de vapor', simbolo: 'CV', factor: 735.5 },
      BTUh: { nombre: 'BTU/hora', simbolo: 'BTU/h', factor: 0.293071 },
    }
  }
};

const CATEGORIAS_INFO: Record<Categoria, { nombre: string; icono: string }> = {
  longitud: { nombre: 'Longitud', icono: '📏' },
  masa: { nombre: 'Masa', icono: '⚖️' },
  temperatura: { nombre: 'Temperatura', icono: '🌡️' },
  area: { nombre: 'Área', icono: '📐' },
  volumen: { nombre: 'Volumen', icono: '🧪' },
  tiempo: { nombre: 'Tiempo', icono: '⏱️' },
  velocidad: { nombre: 'Velocidad', icono: '🚀' },
  datos: { nombre: 'Datos', icono: '💾' },
  quimica: { nombre: 'Química', icono: '⚗️' },
  presion: { nombre: 'Presión', icono: '🔵' },
  energia: { nombre: 'Energía', icono: '⚡' },
  fuerza: { nombre: 'Fuerza', icono: '💪' },
  potencia: { nombre: 'Potencia', icono: '🔌' },
};

export default function ConversorUnidadesPage() {
  const [categoria, setCategoria] = useState<Categoria>('longitud');
  const [valor, setValor] = useState('1');
  const [unidadOrigen, setUnidadOrigen] = useState('m');
  const [unidadDestino, setUnidadDestino] = useState('km');

  // Estados para código HTML exportable
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [htmlExpanded, setHtmlExpanded] = useState(false);

  // Actualizar unidades al cambiar categoría
  const handleCategoriaChange = (cat: Categoria) => {
    setCategoria(cat);
    const unidades = Object.keys(CONVERSIONES[cat].unidades);
    setUnidadOrigen(unidades[0]);
    setUnidadDestino(unidades[1] || unidades[0]);
    setValor('1');
  };

  // Conversión de temperatura (especial)
  const convertirTemperatura = (val: number, desde: string, hasta: string): number => {
    // Primero convertir a Celsius
    let celsius: number;
    switch (desde) {
      case 'F':
        celsius = (val - 32) * 5 / 9;
        break;
      case 'K':
        celsius = val - 273.15;
        break;
      default:
        celsius = val;
    }

    // Luego convertir de Celsius al destino
    switch (hasta) {
      case 'F':
        return celsius * 9 / 5 + 32;
      case 'K':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  // Calcular resultado
  const resultado = useMemo(() => {
    const num = parseSpanishNumber(valor);
    if (isNaN(num)) return null;

    if (categoria === 'temperatura') {
      return convertirTemperatura(num, unidadOrigen, unidadDestino);
    }

    const unidades = CONVERSIONES[categoria].unidades;
    const factorOrigen = unidades[unidadOrigen]?.factor || 1;
    const factorDestino = unidades[unidadDestino]?.factor || 1;

    // Convertir a base y luego a destino
    const enBase = num * factorOrigen;
    return enBase / factorDestino;
  }, [valor, categoria, unidadOrigen, unidadDestino]);

  // Obtener todas las conversiones para mostrar tabla
  const todasConversiones = useMemo(() => {
    const num = parseSpanishNumber(valor);
    if (isNaN(num)) return [];

    const unidades = CONVERSIONES[categoria].unidades;
    const factorOrigen = unidades[unidadOrigen]?.factor || 1;

    if (categoria === 'temperatura') {
      return Object.entries(unidades).map(([key, unidad]) => ({
        key,
        ...unidad,
        valor: convertirTemperatura(num, unidadOrigen, key)
      }));
    }

    const enBase = num * factorOrigen;

    return Object.entries(unidades).map(([key, unidad]) => ({
      key,
      ...unidad,
      valor: enBase / unidad.factor
    }));
  }, [valor, categoria, unidadOrigen]);

  // Intercambiar unidades
  const intercambiar = () => {
    setUnidadOrigen(unidadDestino);
    setUnidadDestino(unidadOrigen);
  };

  // Función para generar código HTML exportable de la tabla de equivalencias
  const generarCodigoHTML = useCallback(() => {
    if (todasConversiones.length === 0) {
      setHtmlCode('');
      return;
    }

    const nombreCategoria = CATEGORIAS_INFO[categoria].nombre;
    const unidadOrigenNombre = unidadesActuales[unidadOrigen]?.nombre || '';
    const num = parseSpanishNumber(valor);

    let codigo = '<!-- Tabla de Equivalencias generada con meskeIA -->\n\n';
    codigo += '<div class="tabla-equivalencias">\n';
    codigo += `  <h2>Equivalencias de ${nombreCategoria}</h2>\n`;
    codigo += `  <p class="origen">Valor origen: ${formatNumber(num, 4)} ${unidadesActuales[unidadOrigen]?.simbolo}</p>\n`;
    codigo += '  <table>\n';
    codigo += '    <thead>\n';
    codigo += '      <tr>\n';
    codigo += '        <th>Unidad</th>\n';
    codigo += '        <th>Símbolo</th>\n';
    codigo += '        <th>Valor Equivalente</th>\n';
    codigo += '      </tr>\n';
    codigo += '    </thead>\n';
    codigo += '    <tbody>\n';

    todasConversiones.forEach((conv) => {
      codigo += '      <tr>\n';
      codigo += `        <td>${conv.nombre}</td>\n`;
      codigo += `        <td>${conv.simbolo}</td>\n`;
      codigo += `        <td>${formatNumber(conv.valor, 6)}</td>\n`;
      codigo += '      </tr>\n';
    });

    codigo += '    </tbody>\n';
    codigo += '  </table>\n';
    codigo += '</div>\n\n';
    codigo += '<style>\n';
    codigo += '.tabla-equivalencias {\n';
    codigo += '  max-width: 800px;\n';
    codigo += '  margin: 2rem auto;\n';
    codigo += '  padding: 1.5rem;\n';
    codigo += '  background: #ffffff;\n';
    codigo += '  border: 1px solid #e5e5e5;\n';
    codigo += '  border-radius: 12px;\n';
    codigo += '  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias h2 {\n';
    codigo += '  text-align: center;\n';
    codigo += '  color: #2E86AB;\n';
    codigo += '  margin-bottom: 1rem;\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias .origen {\n';
    codigo += '  text-align: center;\n';
    codigo += '  color: #666666;\n';
    codigo += '  margin-bottom: 1.5rem;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias table {\n';
    codigo += '  width: 100%;\n';
    codigo += '  border-collapse: collapse;\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias th,\n';
    codigo += '.tabla-equivalencias td {\n';
    codigo += '  padding: 0.75rem;\n';
    codigo += '  text-align: left;\n';
    codigo += '  border-bottom: 1px solid #e5e5e5;\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias th {\n';
    codigo += '  background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);\n';
    codigo += '  color: white;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '}\n';
    codigo += '.tabla-equivalencias td:last-child {\n';
    codigo += '  text-align: right;\n';
    codigo += '  font-family: "Courier New", monospace;\n';
    codigo += '  font-weight: 600;\n';
    codigo += '}\n';
    codigo += '</style>';

    setHtmlCode(codigo);
  }, [todasConversiones, categoria, valor, unidadOrigen]);

  // Efecto para generar código HTML automáticamente
  useEffect(() => {
    generarCodigoHTML();
  }, [generarCodigoHTML]);

  // Función para copiar código HTML al portapapeles
  const copiarCodigo = () => {
    navigator.clipboard.writeText(htmlCode);
  };

  const unidadesActuales = CONVERSIONES[categoria].unidades;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🔄 Conversor de Unidades Científico</h1>
        <p className={styles.subtitle}>
          13 categorías de conversión: longitud, masa, temperatura, presión, energía y más
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de categorías */}
        <div className={styles.configPanel}>
          <h2 className={styles.sectionTitle}>Categoría</h2>

          <div className={styles.categoriasGrid}>
            {(Object.keys(CATEGORIAS_INFO) as Categoria[]).map((cat) => (
              <button
                key={cat}
                className={`${styles.categoriaBtn} ${categoria === cat ? styles.categoriaActiva : ''}`}
                onClick={() => handleCategoriaChange(cat)}
              >
                <span className={styles.categoriaIcono}>{CATEGORIAS_INFO[cat].icono}</span>
                <span className={styles.categoriaNombre}>{CATEGORIAS_INFO[cat].nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Panel de conversión */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.sectionTitle}>
            {CATEGORIAS_INFO[categoria].icono} Conversión de {CATEGORIAS_INFO[categoria].nombre}
          </h2>

          <div className={styles.conversionBox}>
            {/* Origen */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Valor de entrada</label>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className={styles.input}
                placeholder="Ingresa un valor"
              />
              <select
                value={unidadOrigen}
                onChange={(e) => setUnidadOrigen(e.target.value)}
                className={styles.select}
              >
                {Object.entries(unidadesActuales).map(([key, unidad]) => (
                  <option key={key} value={key}>
                    {unidad.nombre} ({unidad.simbolo})
                  </option>
                ))}
              </select>
            </div>

            {/* Botón intercambiar */}
            <button onClick={intercambiar} className={styles.btnIntercambiar}>
              ⇄
            </button>

            {/* Destino */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Resultado</label>
              <div className={styles.resultadoBox}>
                {resultado !== null ? formatNumber(resultado, 6) : '-'}
              </div>
              <select
                value={unidadDestino}
                onChange={(e) => setUnidadDestino(e.target.value)}
                className={styles.select}
              >
                {Object.entries(unidadesActuales).map(([key, unidad]) => (
                  <option key={key} value={key}>
                    {unidad.nombre} ({unidad.simbolo})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fórmula */}
          {resultado !== null && (
            <div className={styles.formulaBox}>
              <p className={styles.formula}>
                {formatNumber(parseSpanishNumber(valor), 4)} {unidadesActuales[unidadOrigen]?.simbolo} = {formatNumber(resultado, 6)} {unidadesActuales[unidadDestino]?.simbolo}
              </p>
            </div>
          )}

          {/* Tabla de todas las conversiones */}
          <div className={styles.tablaSection}>
            <h3>Equivalencias rápidas</h3>
            <div className={styles.tablaWrapper}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th>Unidad</th>
                    <th>Símbolo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {todasConversiones.map((conv) => (
                    <tr
                      key={conv.key}
                      className={conv.key === unidadDestino ? styles.filaResaltada : ''}
                    >
                      <td>{conv.nombre}</td>
                      <td>{conv.simbolo}</td>
                      <td className={styles.valorTabla}>
                        {formatNumber(conv.valor, 6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECCIONES PROFESIONALES ==================== */}

      {/* 1. HTML Code Exportable */}
      {htmlCode && (
        <section className={styles.htmlSection}>
          <div className={styles.htmlHeader}>
            <div>
              <h2>📋 Exportar Tabla de Equivalencias</h2>
              <p className={styles.htmlSubtitle}>
                Copia el código HTML para usar la tabla de conversión en tu web, blog o documento
              </p>
            </div>
            <button
              onClick={() => setHtmlExpanded(!htmlExpanded)}
              className={styles.btnToggleCode}
              aria-label={htmlExpanded ? 'Ocultar código HTML' : 'Mostrar código HTML'}
            >
              {htmlExpanded ? '▲ Ocultar' : '▼ Mostrar'} código
            </button>
          </div>

          {htmlExpanded && (
            <div className={styles.codeContainer}>
              <pre className={styles.codeBlock}>
                <code>{htmlCode}</code>
              </pre>
              <button
                onClick={copiarCodigo}
                className={styles.btnCopyCode}
                aria-label="Copiar código HTML al portapapeles"
              >
                📋 Copiar código
              </button>
            </div>
          )}
        </section>
      )}

      {/* 2. Tabla Comparativa: Sistemas de Unidades */}
      <section className={styles.comparativaSection}>
        <h2>⚖️ Comparativa de Sistemas de Unidades</h2>
        <p className={styles.comparativaSubtitle}>
          Principales diferencias entre el Sistema Internacional (SI), el Sistema Imperial y otros sistemas especializados:
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Magnitud</th>
                <th>Sistema Internacional (SI)</th>
                <th>Sistema Imperial</th>
                <th>Ejemplo Cotidiano</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Longitud</strong></td>
                <td>Metro (m)</td>
                <td>Pie (ft), Pulgada (in), Milla (mi)</td>
                <td>1 metro ≈ 3,28 pies | 1 pulgada = 2,54 cm</td>
              </tr>
              <tr>
                <td><strong>Masa</strong></td>
                <td>Kilogramo (kg)</td>
                <td>Libra (lb), Onza (oz), Stone (st)</td>
                <td>1 kg ≈ 2,2 libras | 1 libra = 454 gramos</td>
              </tr>
              <tr>
                <td><strong>Temperatura</strong></td>
                <td>Celsius (°C), Kelvin (K)</td>
                <td>Fahrenheit (°F)</td>
                <td>Agua hierve: 100°C = 212°F = 373K</td>
              </tr>
              <tr>
                <td><strong>Volumen</strong></td>
                <td>Litro (L), Metro cúbico (m³)</td>
                <td>Galón (gal), Pinta (pt), Onza fl (fl oz)</td>
                <td>1 galón US ≈ 3,78 litros</td>
              </tr>
              <tr>
                <td><strong>Velocidad</strong></td>
                <td>Metro/segundo (m/s), km/h</td>
                <td>Milla/hora (mph), Pie/segundo (ft/s)</td>
                <td>100 km/h ≈ 62 mph | Límite urbano: 50 km/h ≈ 31 mph</td>
              </tr>
              <tr>
                <td><strong>Presión</strong></td>
                <td>Pascal (Pa), Bar</td>
                <td>PSI (libra/pulgada²)</td>
                <td>Neumáticos: 2,5 bar ≈ 36 PSI</td>
              </tr>
              <tr>
                <td><strong>Energía</strong></td>
                <td>Julio (J), Kilovatio-hora (kWh)</td>
                <td>BTU, Caloría (cal)</td>
                <td>Factura luz: 1 kWh = 3.600.000 J</td>
              </tr>
              <tr>
                <td><strong>Potencia</strong></td>
                <td>Vatio (W), Kilovatio (kW)</td>
                <td>Caballo de fuerza (hp)</td>
                <td>Motor coche: 100 CV ≈ 74 kW</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Casos de Uso Reales */}
      <section className={styles.escenariosSection}>
        <h2>💡 Casos de Uso: ¿Cuándo necesitas convertir unidades?</h2>
        <p className={styles.escenariosSubtitle}>
          5 situaciones cotidianas donde las conversiones de unidades son imprescindibles:
        </p>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🍳</span>
              <h3>Cocina Internacional</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>
Receta americana: 2 cups de harina, 1 lb de azúcar, horno a 350°F
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Conversiones:</strong> 2 cups ≈ 473 ml | 1 lb ≈ 454 g | 350°F ≈ 177°C.
              Las recetas internacionales usan medidas diferentes según el país de origen.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>✈️</span>
              <h3>Viajes a Estados Unidos</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>
Alquiler coche: Límite 55 mph, autonomía 30 mpg, tanque 15 gal
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Conversiones:</strong> 55 mph ≈ 88 km/h | 30 mpg ≈ 12,75 km/L | 15 gal ≈ 57 L.
              Necesitas convertir velocidades, consumos y capacidades para entender señales y costes.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🔬</span>
              <h3>Laboratorio Científico</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>
Experimento: 25 µL de reactivo, presión 1,5 bar, temperatura 298 K
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Conversiones:</strong> 25 µL = 0,025 mL | 1,5 bar = 150.000 Pa | 298 K = 25°C.
              La ciencia requiere precisión absoluta y unidades SI estándar para reproducibilidad.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏗️</span>
              <h3>Construcción e Ingeniería</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>
Planos: Habitación 12'×15', altura 8', área 1.200 ft²
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Conversiones:</strong> 12'×15' ≈ 3,66×4,57 m | 8' ≈ 2,44 m | 1.200 ft² ≈ 111 m².
              Planos de origen anglosajón usan pies, pero construcción local necesita metros.
            </p>
          </div>

          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🏃</span>
              <h3>Deportes y Fitness</h3>
            </div>
            <div className={styles.escenarioExample}>
              <p>Situación:</p>
              <code>
Entrenamiento: Correr 5K en 25 min, ritmo 5 min/km, objetivo 150 lbs
              </code>
            </div>
            <p className={styles.escenarioTip}>
              <strong>Conversiones:</strong> 5K = 5.000 m | Ritmo 5 min/km = 12 km/h | 150 lbs ≈ 68 kg.
              Apps deportivas usan diferentes unidades según región; necesitas estandarizar para comparar.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className={styles.faqSection}>
        <h2>❓ Preguntas Frecuentes sobre Conversión de Unidades</h2>

        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <h3>¿Por qué existen diferentes sistemas de unidades?</h3>
            <p>
              Históricamente, cada civilización desarrolló sus propias unidades basadas en patrones locales
              (pie = longitud del pie del rey, pulgada = grosor del pulgar). El <strong>Sistema Internacional (SI)</strong>
              se creó en 1960 para estandarizar mundialmente, pero países como Estados Unidos mantienen el Sistema Imperial
              por inercia cultural e infraestructura existente.
            </p>
            <p>
              <strong>Dato curioso:</strong> En 1999, la NASA perdió la sonda Mars Climate Orbiter (327 millones de dólares)
              porque un equipo usó libras-fuerza y otro newtons. Este error de conversión hizo que la sonda se estrellara.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Qué sistema es más preciso: SI o Imperial?</h3>
            <p>
              Ambos sistemas son igualmente precisos si se usan correctamente. La diferencia está en la <strong>practicidad</strong>:
            </p>
            <ul>
              <li><strong>SI (métrico):</strong> Base decimal (potencias de 10) → Más fácil para cálculos mentales</li>
              <li><strong>Imperial:</strong> Conversiones irregulares (12 pulgadas = 1 pie, 3 pies = 1 yarda) → Más complejo</li>
            </ul>
            <p>
              <strong>Ejemplo:</strong> Convertir 5,3 km a metros es trivial (5.300 m). Convertir 5,3 millas a pies requiere:
              5,3 × 5.280 = 27.984 pies. El SI simplifica operaciones científicas y educativas.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Qué es la temperatura absoluta y por qué se usa Kelvin?</h3>
            <p>
              <strong>Kelvin (K)</strong> es la escala absoluta de temperatura donde 0 K = <strong>cero absoluto</strong>
              (-273,15°C), el punto teórico donde las partículas dejan de moverse. No puede haber temperaturas negativas en Kelvin.
            </p>
            <p>
              Se usa en ciencia porque las ecuaciones físicas (gases ideales, termodinámica, espectroscopía) requieren
              una escala absoluta sin valores negativos. <strong>Celsius y Fahrenheit son escalas relativas</strong>
              basadas en puntos de congelación/ebullición del agua, no en propiedades fundamentales.
            </p>
            <div className={styles.faqTip}>
              💡 <strong>Conversión fácil:</strong> K = °C + 273,15 | Temperatura ambiente: ~20°C = ~293 K
            </div>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Masa y peso son lo mismo?</h3>
            <p>
              <strong>No.</strong> Son conceptos diferentes que a menudo se confunden:
            </p>
            <ul>
              <li><strong>Masa:</strong> Cantidad de materia (kg, g, lb). No cambia con la gravedad.</li>
              <li><strong>Peso:</strong> Fuerza gravitatoria sobre la masa (N, kgf, lbf). Varía según gravedad.</li>
            </ul>
            <p>
              <strong>Ejemplo:</strong> Un astronauta de 70 kg tiene la misma masa en la Tierra y en la Luna, pero su peso
              es 6 veces menor en la Luna (gravedad lunar = 1/6 terrestre). En la Tierra pesa ~686 N, en la Luna ~114 N.
            </p>
            <p>
              Cuando decimos "peso 70 kg", técnicamente estamos hablando de masa. El peso correcto sería 686 N (70 kg × 9,8 m/s²).
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Cómo se convierte presión de neumáticos (bar a PSI)?</h3>
            <p>
              La presión de neumáticos se mide en <strong>bar (Europa)</strong> o <strong>PSI (USA/UK)</strong>:
            </p>
            <p>
              <strong>Conversión:</strong> 1 bar = 14,5 PSI | 1 PSI = 0,069 bar
            </p>
            <p>
              <strong>Ejemplo práctico:</strong> Manual del coche recomienda 2,5 bar → Gasolinera USA mide en PSI →
              Necesitas inflar a 2,5 × 14,5 = <strong>36 PSI</strong>
            </p>
            <div className={styles.faqTip}>
              💡 <strong>Referencia rápida:</strong> 2,0 bar ≈ 29 PSI | 2,5 bar ≈ 36 PSI | 3,0 bar ≈ 44 PSI
            </div>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Byte y bit son lo mismo en almacenamiento de datos?</h3>
            <p>
              <strong>No.</strong> 1 Byte = 8 bits. Esta confusión es común en velocidades de internet:
            </p>
            <ul>
              <li><strong>Velocidad de conexión:</strong> Se mide en <strong>Mbps (Megabits por segundo)</strong></li>
              <li><strong>Velocidad de descarga real:</strong> Se mide en <strong>MB/s (Megabytes por segundo)</strong></li>
            </ul>
            <p>
              <strong>Ejemplo:</strong> Contratas fibra de 100 Mbps. Tu descarga máxima real será:
              100 Mbps ÷ 8 = <strong>12,5 MB/s</strong>. Una película de 2 GB tardará: 2.000 MB ÷ 12,5 MB/s = 160 segundos (2min 40s).
            </p>
            <p>
              <strong>Tip:</strong> Divide Mbps entre 8 para saber tu descarga real en MB/s.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Por qué la velocidad de la luz es una constante universal?</h3>
            <p>
              La velocidad de la luz en el vacío (<strong>c = 299.792.458 m/s</strong>) es la velocidad máxima del universo
              según la Teoría de la Relatividad de Einstein. Ningún objeto con masa puede alcanzarla.
            </p>
            <p>
              <strong>Consecuencias prácticas:</strong>
            </p>
            <ul>
              <li>Es la base para definir el metro: 1 m = distancia que recorre la luz en 1/299.792.458 segundos</li>
              <li>Limita las comunicaciones espaciales: señal a Marte tarda 3-22 minutos (según distancia)</li>
              <li>GPS necesita ajustar relatividad: los satélites "ven" el tiempo diferente a nosotros</li>
            </ul>
            <div className={styles.faqTip}>
              💡 <strong>Escala humana:</strong> La luz tarda ~0,13 segundos en dar la vuelta a la Tierra
            </div>
          </div>
        </div>
      </section>

      {/* 5. Guía Paso a Paso */}
      <section className={styles.guiaSection}>
        <h2>🗺️ Guía Paso a Paso: Cómo Convertir Unidades Correctamente</h2>
        <p className={styles.escenariosSubtitle}>
          Sigue estos 6 pasos para convertir cualquier magnitud física sin errores:
        </p>

        <div className={styles.stepGuide}>
          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>📊 Identifica la magnitud física</h3>
              <p>
                Antes de convertir, asegúrate de conocer <strong>qué tipo de magnitud</strong> estás midiendo:
              </p>
              <ul>
                <li><strong>Longitud:</strong> Distancia, altura, ancho (metro, pie, pulgada)</li>
                <li><strong>Masa:</strong> Cantidad de materia (kilogramo, libra, gramo)</li>
                <li><strong>Tiempo:</strong> Duración (segundo, hora, año)</li>
                <li><strong>Temperatura:</strong> Grado de calor (Celsius, Fahrenheit, Kelvin)</li>
                <li><strong>Magnitudes derivadas:</strong> Velocidad (m/s), presión (Pa), energía (J), etc.</li>
              </ul>
              <p>
                <strong>Ejemplo:</strong> "100" sin unidad no significa nada. ¿100 metros? ¿100 millas? ¿100°C? Define siempre la magnitud.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>🔍 Elige las unidades de origen y destino</h3>
              <p>
                Determina claramente cuál es tu <strong>unidad de partida</strong> y cuál es tu <strong>objetivo</strong>:
              </p>
              <ul>
                <li><strong>Origen:</strong> La unidad en la que tienes el valor actualmente</li>
                <li><strong>Destino:</strong> La unidad a la que quieres convertir</li>
              </ul>
              <p>
                <strong>Ejemplo:</strong> Tienes "5 millas" (origen) y quieres saber cuántos "kilómetros" (destino) son.
              </p>
              <div className={styles.stepExample}>
                💡 <strong>Tip:</strong> Verifica que ambas unidades midan la misma magnitud. No puedes convertir metros (longitud) a kilogramos (masa).
              </div>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>⚙️ Aplica el factor de conversión</h3>
              <p>
                Usa el <strong>factor de conversión</strong> apropiado. Hay 3 métodos:
              </p>
              <ul>
                <li><strong>Método directo:</strong> Multiplica por el factor (ej: millas × 1,609 = km)</li>
                <li><strong>Método de unidades base:</strong> Convierte a unidad SI base (metro, kg, segundo) y luego al destino</li>
                <li><strong>Usar herramientas:</strong> Calculadoras científicas o conversores online (este)</li>
              </ul>
              <p>
                <strong>Ejemplo:</strong> Convertir 5 millas a km → 5 × 1,609344 = 8,04672 km
              </p>
              <div className={styles.stepExample}>
                📐 <strong>Importante:</strong> Para magnitudes derivadas (m², m³, km/h), ajusta el exponente del factor.
              </div>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>✅ Verifica que el resultado tenga sentido</h3>
              <p>
                Haz una <strong>comprobación de cordura</strong> (sanity check):
              </p>
              <ul>
                <li><strong>Orden de magnitud:</strong> ¿El resultado es razonable? (100 km no pueden ser 2 millas)</li>
                <li><strong>Mayor/menor:</strong> ¿Unidad destino más grande → número menor? (1 km = 1.000 m → número baja)</li>
                <li><strong>Casos conocidos:</strong> Compara con referencias (1 pulgada ≈ 2,5 cm, 1 kg ≈ 2,2 lb)</li>
              </ul>
              <p>
                <strong>Ejemplo:</strong> Si conviertes 10 kg a libras y obtienes 0,45 lb, algo está mal (debería ser ~22 lb).
                Revisa si usaste el factor correcto o si dividiste en lugar de multiplicar.
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>🎯 Redondea apropiadamente</h3>
              <p>
                El número de decimales depende del <strong>contexto</strong>:
              </p>
              <ul>
                <li><strong>Uso cotidiano:</strong> 1-2 decimales (ej: "mi peso es 68,5 kg")</li>
                <li><strong>Construcción/ingeniería:</strong> 2-3 decimales (ej: "pared de 3,75 m")</li>
                <li><strong>Ciencia/laboratorio:</strong> 4-6 decimales (ej: "presión 1,013250 bar")</li>
              </ul>
              <p>
                <strong>Regla de oro:</strong> No pongas más decimales de los que tenía el valor original. Si mides "5 millas"
                (sin decimales), el resultado "8,04672 km" es excesivo → Redondea a "8 km" o "8,0 km".
              </p>
            </div>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepNumber}>6</div>
            <div className={styles.stepContent}>
              <h3>📝 Documenta la conversión</h3>
              <p>
                Si usas la conversión en informes, proyectos o comunicaciones profesionales:
              </p>
              <ul>
                <li><strong>Muestra ambas unidades:</strong> "5 millas (8,05 km)" → Ayuda a lectores de diferentes regiones</li>
                <li><strong>Especifica el factor usado:</strong> "Convertido con 1 milla = 1,609 km"</li>
                <li><strong>Indica precisión:</strong> "Valor aproximado" vs "Valor exacto"</li>
              </ul>
              <p>
                <strong>Ejemplo en informe:</strong> "La distancia recorrida fue de 42,195 km (26,219 millas), según factor
                de conversión 1 km = 0,621371 millas."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mejores Prácticas */}
      <section className={styles.tipsSection}>
        <h2>✨ Mejores Prácticas para Convertir Unidades</h2>
        <p className={styles.escenariosSubtitle}>
          6 consejos profesionales para dominar las conversiones de unidades:
        </p>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🧠</span>
            <h3>Memoriza Factores Comunes</h3>
            <p>
              Algunos factores de conversión aparecen constantemente. Memoriza los más útiles:
            </p>
            <ul>
              <li>1 pulgada = 2,54 cm (exacto)</li>
              <li>1 milla ≈ 1,6 km</li>
              <li>1 libra ≈ 0,45 kg</li>
              <li>1 galón US ≈ 3,8 L</li>
              <li>1 pie ≈ 30 cm</li>
            </ul>
            <p>
              Con estos 5 factores puedes hacer cálculos mentales rápidos en viajes, recetas y compras.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔢</span>
            <h3>Usa Calculadora Científica</h3>
            <p>
              Para magnitudes derivadas (m², m³, m/s²), necesitas potencias:
            </p>
            <p>
              <strong>Ejemplo:</strong> Convertir 5 km² a m² no es 5 × 1.000 = 5.000 m² (incorrecto).
              Es 5 × (1.000)² = 5 × 1.000.000 = <strong>5.000.000 m²</strong> (correcto).
            </p>
            <p>
              Calculadoras científicas (o conversores especializados) manejan automáticamente exponentes cuadrados y cúbicos.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🌡️</span>
            <h3>Temperatura es Especial</h3>
            <p>
              Temperatura NO se convierte multiplicando. Necesitas fórmulas:
            </p>
            <ul>
              <li>°C a °F: (°C × 9/5) + 32</li>
              <li>°F a °C: (°F - 32) × 5/9</li>
              <li>°C a K: °C + 273,15</li>
            </ul>
            <p>
              <strong>Error común:</strong> "20°C × 1,8 = 36°F" (incorrecto). Correcto: (20 × 9/5) + 32 = 68°F.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <h3>Cuidado con Dimensiones Múltiples</h3>
            <p>
              Para área (m²) y volumen (m³), el factor se eleva al cuadrado o cubo:
            </p>
            <p>
              <strong>Área:</strong> 1 m² = (100 cm)² = 10.000 cm² (no 100 cm²)<br />
              <strong>Volumen:</strong> 1 m³ = (100 cm)³ = 1.000.000 cm³ (no 100 cm³)
            </p>
            <p>
              Este error es frecuente en construcción y científicos novatos.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <h3>Redondeo Apropiado por Contexto</h3>
            <p>
              No uses 10 decimales si no aportan información:
            </p>
            <ul>
              <li><strong>Receta:</strong> "250 ml" (sin decimales)</li>
              <li><strong>GPS:</strong> "Coordenadas: 40,4168° N" (4 decimales)</li>
              <li><strong>Laboratorio:</strong> "25,00 µL" (2 decimales, precisión pipeta)</li>
            </ul>
            <p>
              Demasiados decimales dan <strong>falsa sensación de precisión</strong>.
            </p>
          </div>

          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🏢</span>
            <h3>Respeta el Contexto Profesional</h3>
            <p>
              Cada industria tiene preferencias:
            </p>
            <ul>
              <li><strong>Aviación:</strong> Altura en pies, velocidad en nudos</li>
              <li><strong>Medicina:</strong> Dosis en mg/kg, presión en mmHg</li>
              <li><strong>Programación:</strong> Tamaños en bytes, velocidad en Mbps</li>
              <li><strong>Construcción España:</strong> Todo en sistema métrico (m, m², m³)</li>
            </ul>
            <p>
              Adapta tus conversiones al estándar de tu sector para evitar confusiones.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Warning Box - Errores Comunes */}
      <section className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <h2>Errores Comunes al Convertir Unidades</h2>
        </div>

        <ul className={styles.warningList}>
          <li>
            <strong>1. Confundir masa con peso</strong><br />
            Masa (kg) es cantidad de materia, peso (N) es fuerza gravitatoria. Decir "peso 70 kg" es incorrecto técnicamente
            (debería ser "masa 70 kg" o "peso 686 N"). En el día a día se confunden, pero en física y ciencia la distinción es crítica.
          </li>

          <li>
            <strong>2. Olvidar elevar al cuadrado/cubo en área/volumen</strong><br />
            1 km² ≠ 1.000 m². Correcto: 1 km² = (1.000 m)² = 1.000.000 m². Este error provoca errores masivos en
            presupuestos de construcción, valoraciones inmobiliarias y cálculos de materiales.
          </li>

          <li>
            <strong>3. Mezclar sistemas sin criterio</strong><br />
            "Coche de 5 metros que hace 30 mpg" (millas por galón). Incoherente. Estandariza: O todo SI (5 m, 12 km/L)
            o todo Imperial (16,4 ft, 30 mpg). Mezclar sistemas genera confusión y errores de interpretación.
          </li>

          <li>
            <strong>4. Convertir temperatura como magnitud lineal</strong><br />
            20°C × 2 ≠ 40°F. Temperatura no es proporcional directa. Usa fórmulas: (20 × 9/5) + 32 = 68°F.
            Duplicar °C no duplica °F ni K. Este error es muy común en conversiones internacionales de recetas.
          </li>

          <li>
            <strong>5. Confundir bytes con bits (almacenamiento/velocidad)</strong><br />
            100 Mbps (megabits/segundo) ≠ 100 MB/s (megabytes/segundo). Velocidad real: 100 Mbps ÷ 8 = 12,5 MB/s.
            Operadores venden en Mbps (número más grande), pero descargas se miden en MB/s.
          </li>

          <li>
            <strong>6. Confundir velocidad con rapidez/celeridad</strong><br />
            Velocidad es vectorial (incluye dirección), rapidez es escalar (solo magnitud). "100 km/h hacia el norte"
            (velocidad) vs "100 km/h" (rapidez). En física teórica importa; en vida cotidiana se usan intercambiablemente.
          </li>

          <li>
            <strong>7. Confundir presión con fuerza</strong><br />
            Presión es fuerza por unidad de área: P = F/A. 100 N (fuerza) aplicados en 1 m² = 100 Pa (presión).
            Mismos 100 N en 0,1 m² = 1.000 Pa. No son lo mismo. Común en neumática e hidráulica.
          </li>

          <li>
            <strong>8. Confundir energía con potencia</strong><br />
            Energía (J, kWh) es cantidad total. Potencia (W, kW) es energía por tiempo. Una bombilla de 60 W encendida
            1 hora consume 60 Wh = 0,06 kWh. Confundirlos causa errores en facturas eléctricas y eficiencia energética.
          </li>
        </ul>
      </section>

      {/* ==================== FIN SECCIONES PROFESIONALES ==================== */}

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Quieres aprender más sobre conversión de unidades?"
        subtitle="Descubre conceptos clave, el Sistema Internacional y consejos prácticos"
      >
        <section className={styles.guideSection}>
          <h2>Sistemas de Unidades</h2>
          <p className={styles.introParagraph}>
            Existen dos sistemas principales de medición: el Sistema Internacional (SI) usado mundialmente
            para ciencia y la mayoría de países, y el Sistema Imperial usado principalmente en Estados Unidos
            y Reino Unido para algunas medidas cotidianas.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Sistema Internacional (SI)</h4>
              <p>
                Es el sistema decimal basado en potencias de 10. Las unidades base son: metro (longitud),
                kilogramo (masa), segundo (tiempo), ampere (corriente), kelvin (temperatura), mol (cantidad)
                y candela (intensidad luminosa).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Prefijos Métricos</h4>
              <p>
                kilo (k) = 10³, mega (M) = 10⁶, giga (G) = 10⁹, tera (T) = 10¹².
                mili (m) = 10⁻³, micro (μ) = 10⁻⁶, nano (n) = 10⁻⁹.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Temperatura</h4>
              <p>
                Celsius: agua congela a 0°C y hierve a 100°C.
                Fahrenheit: agua congela a 32°F y hierve a 212°F.
                Kelvin: cero absoluto a 0K (-273,15°C).
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>Consejos Prácticos</h4>
              <p>
                1 pulgada ≈ 2,54 cm. 1 milla ≈ 1,6 km. 1 libra ≈ 0,45 kg.
                1 galón US ≈ 3,78 litros. 1 pie ≈ 30 cm.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-unidades')} />

      <Footer appName="conversor-unidades" />
    </div>
  );
}
