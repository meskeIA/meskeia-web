'use client';

import { useState, useMemo } from 'react';
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
