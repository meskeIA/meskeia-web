'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraGelatina.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularSustitucionGelatina,
  type TipoGelatina,
  type ResultadoSustitucionGelatina,
} from '@/lib/calculadoras/cocina';

interface OpcionGelatina {
  tipo: TipoGelatina;
  nombre: string;
  bloom: string;
  descripcion: string;
  esEstandar?: boolean;
  admiteHojas: boolean;
}

const OPCIONES_GELATINA: OpcionGelatina[] = [
  {
    tipo: 'hoja_bronce',
    nombre: 'Hoja de Bronce',
    bloom: '120 bloom',
    descripcion: 'La más débil en hojas. Poco frecuente fuera de hostelería.',
    admiteHojas: true,
  },
  {
    tipo: 'hoja_plata',
    nombre: 'Hoja de Plata',
    bloom: '160 bloom',
    descripcion: 'Uso profesional en cocina de restaurante.',
    admiteHojas: true,
  },
  {
    tipo: 'hoja_oro',
    nombre: 'Hoja de Oro',
    bloom: '200 bloom',
    descripcion: 'La más habitual en supermercados. Referencia estándar.',
    esEstandar: true,
    admiteHojas: true,
  },
  {
    tipo: 'hoja_platino',
    nombre: 'Hoja de Platino',
    bloom: '250 bloom',
    descripcion: 'Alta resistencia. Para mousses y gelatinas de presentación.',
    admiteHojas: true,
  },
  {
    tipo: 'polvo_200',
    nombre: 'Polvo 200 bloom',
    bloom: '200 bloom',
    descripcion: 'Equivalente a hoja de oro. Un sobre comercial ≈ 10 g.',
    admiteHojas: false,
  },
  {
    tipo: 'polvo_250',
    nombre: 'Polvo 250 bloom',
    bloom: '250 bloom',
    descripcion: 'Versión profesional de alto rendimiento.',
    admiteHojas: false,
  },
  {
    tipo: 'agar_agar',
    nombre: 'Agar-Agar',
    bloom: 'Vegetal',
    descripcion: 'Gelificante de algas. Comportamiento diferente a la gelatina animal.',
    admiteHojas: false,
  },
];

function formatCantidad(g: number): string {
  if (g < 1) return `${Math.round(g * 100) / 100} g`;
  return `${Math.round(g * 10) / 10} g`;
}

export default function CalculadoraGelatinaPage() {
  const [tipoOrigen, setTipoOrigen] = useState<TipoGelatina>('hoja_oro');
  const [unidad, setUnidad] = useState<'gramos' | 'hojas'>('gramos');
  const [cantidad, setCantidad] = useState<string>('5');
  const [resultado, setResultado] = useState<ResultadoSustitucionGelatina | null>(null);

  const opcionActual = OPCIONES_GELATINA.find(o => o.tipo === tipoOrigen)!;
  const unidadEfectiva: 'gramos' | 'hojas' = opcionActual.admiteHojas ? unidad : 'gramos';

  const calcular = useCallback(() => {
    const num = parseFloat(cantidad.replace(',', '.'));
    if (isNaN(num) || num <= 0) return;
    const res = calcularSustitucionGelatina(tipoOrigen, num, unidadEfectiva);
    setResultado(res);
  }, [tipoOrigen, cantidad, unidadEfectiva]);

  const handleTipoChange = (tipo: TipoGelatina) => {
    setTipoOrigen(tipo);
    setResultado(null);
    const nueva = OPCIONES_GELATINA.find(o => o.tipo === tipo)!;
    if (!nueva.admiteHojas && unidad === 'hojas') {
      setUnidad('gramos');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🧪 Calculadora de Sustitución de Gelatina</h1>
        <p className={styles.subtitle}>
          Convierte entre gelatina en hoja (bronce, plata, oro, platino),
          en polvo y agar-agar con equivalencias precisas por bloom strength
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tipo de gelatina de origen</h2>

          <div className={styles.tiposGrid} role="radiogroup" aria-label="Tipo de gelatina">
            {OPCIONES_GELATINA.map(opcion => (
              <button
                key={opcion.tipo}
                className={`${styles.tipoBtn} ${tipoOrigen === opcion.tipo ? styles.tipoBtnActivo : ''} ${opcion.esEstandar ? styles.tipoBtnEstandar : ''}`}
                onClick={() => handleTipoChange(opcion.tipo)}
                role="radio"
                aria-checked={tipoOrigen === opcion.tipo}
                aria-label={`${opcion.nombre} — ${opcion.bloom}`}
              >
                <span className={styles.tipoBtnNombre}>{opcion.nombre}</span>
                <span className={styles.tipoBtnBloom}>{opcion.bloom}</span>
                {opcion.esEstandar && (
                  <span className={styles.tipoBtnBadge}>★ estándar</span>
                )}
              </button>
            ))}
          </div>

          <p className={styles.tipoDescripcion}>{opcionActual.descripcion}</p>

          {/* Selector de unidad */}
          <div className={styles.unidadRow}>
            <span className={styles.unidadLabel}>Unidad:</span>
            <div className={styles.unidadBtns}>
              <button
                className={`${styles.unidadBtn} ${unidadEfectiva === 'gramos' ? styles.unidadBtnActivo : ''}`}
                onClick={() => setUnidad('gramos')}
                aria-pressed={unidadEfectiva === 'gramos'}
              >
                Gramos
              </button>
              <button
                className={`${styles.unidadBtn} ${unidadEfectiva === 'hojas' ? styles.unidadBtnActivo : ''} ${!opcionActual.admiteHojas ? styles.unidadBtnDisabled : ''}`}
                onClick={() => opcionActual.admiteHojas && setUnidad('hojas')}
                disabled={!opcionActual.admiteHojas}
                aria-pressed={unidadEfectiva === 'hojas'}
                aria-disabled={!opcionActual.admiteHojas}
                title={!opcionActual.admiteHojas ? 'Esta presentación no se vende en hojas' : ''}
              >
                Hojas
              </button>
            </div>
          </div>

          {/* Input cantidad */}
          <div className={styles.cantidadRow}>
            <label className={styles.cantidadLabel} htmlFor="cantidad-input">
              Cantidad:
            </label>
            <div className={styles.cantidadGroup}>
              <input
                id="cantidad-input"
                type="number"
                min="0.1"
                step="0.1"
                value={cantidad}
                onChange={e => { setCantidad(e.target.value); setResultado(null); }}
                className={styles.cantidadInput}
                aria-label={`Cantidad en ${unidadEfectiva}`}
              />
              <span className={styles.cantidadUnidad}>
                {unidadEfectiva === 'hojas' ? 'hojas' : 'gramos'}
              </span>
            </div>
          </div>

          <button
            onClick={calcular}
            className={styles.btnPrimary}
            aria-label="Calcular equivalencias de gelatina"
          >
            Calcular equivalencias
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {!resultado && (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon} aria-hidden="true">⚗️</span>
              <p>Selecciona el tipo de gelatina, la cantidad y pulsa <strong>Calcular equivalencias</strong></p>
            </div>
          )}

          {resultado && (
            <div className={styles.resultadoWrapper}>
              {/* Resumen origen */}
              <div className={styles.origenCard}>
                <h3 className={styles.origenTitulo}>Tienes</h3>
                <p className={styles.origenValor}>
                  {unidadEfectiva === 'hojas' && resultado.origen.hojas !== undefined
                    ? `${resultado.origen.hojas} ${resultado.origen.hojas === 1 ? 'hoja' : 'hojas'}`
                    : formatCantidad(resultado.origen.cantidad_g)
                  }
                  {unidadEfectiva === 'gramos' && resultado.origen.hojas !== undefined && (
                    <span className={styles.origenHojas}> ≈ {resultado.origen.hojas} hojas</span>
                  )}
                </p>
                <p className={styles.origenNombre}>{resultado.origen.nombre}</p>
                <p className={styles.origenNotas}>{resultado.origen.notas}</p>
              </div>

              {/* Advertencia agar */}
              {resultado.advertencia_agar && (
                <div className={styles.warningBox} role="alert">
                  <span aria-hidden="true">⚠️</span> {resultado.advertencia_agar}
                </div>
              )}

              {/* Tabla de equivalencias */}
              <h3 className={styles.equivalenciasTitulo}>Equivalencias</h3>
              <div className={styles.equivalenciasGrid}>
                {resultado.equivalentes.map(equiv => (
                  <div
                    key={equiv.tipo}
                    className={`${styles.equipCard} ${equiv.tipo === 'hoja_oro' ? styles.equipCardDestacado : ''} ${equiv.tipo === 'agar_agar' ? styles.equipCardAgar : ''}`}
                  >
                    <div className={styles.equipHeader}>
                      <span className={styles.equipNombre}>{equiv.nombre}</span>
                      {equiv.tipo === 'hoja_oro' && (
                        <span className={styles.equipBadge}>★ más habitual</span>
                      )}
                    </div>
                    <div className={styles.equipValores}>
                      <span className={styles.equipGramos}>{formatCantidad(equiv.cantidad_g)}</span>
                      {equiv.hojas !== undefined && (
                        <span className={styles.equipHojas}>≈ {equiv.hojas} hojas</span>
                      )}
                    </div>
                    <p className={styles.equipNotas}>{equiv.notas}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <EducationalSection
        title="📚 Todo sobre la gelatina en repostería"
        subtitle="Bloom strength, tipos de hoja, agar-agar e hidratación correcta"
      >
        <section className={styles.guideSection}>
          <h2>Qué es el bloom strength y por qué importa</h2>
          <p>
            El <strong>bloom strength</strong> (o grado bloom) mide la rigidez del gel que forma
            una gelatina. Se mide con un texturómetro y expresa la fuerza necesaria para hundir
            un émbolo 4 mm en una gelatina al 6,67% a 10°C. A mayor valor bloom, más firme es
            el gel y menor cantidad de gelatina se necesita para obtener la misma textura.
          </p>
          <p>
            Esta calculadora usa la fórmula estándar de conversión basada en el bloom:
            para obtener la misma firmeza, la cantidad de gelatina varía inversamente proporcional
            al bloom. Así, una hoja de bronce (120 bloom) necesita más gramos que una de platino
            (250 bloom) para gelatinizar el mismo volumen de líquido.
          </p>

          <h2>Los 4 tipos de hoja y sus pesos</h2>
          <p>
            Aunque todas se llaman "hoja de gelatina", su peso y poder gelificante varían:
          </p>
          <ul>
            <li><strong>Bronce (120 bloom):</strong> hoja de ~1,7 g. La más débil y menos frecuente.</li>
            <li><strong>Plata (160 bloom):</strong> hoja de ~2,3 g. Uso habitual en hostelería.</li>
            <li><strong>Oro (200 bloom):</strong> hoja de ~2,5 g. La estándar en supermercados europeos. Cuando una receta dice "una hoja de gelatina" sin especificar, generalmente se refiere a esta.</li>
            <li><strong>Platino (250 bloom):</strong> hoja de ~1,7 g. Muy firme. Ideal para mousses que deben mantener la forma varias horas.</li>
          </ul>
          <p>
            El hecho de que la hoja de platino pese menos que la de oro pero tenga mayor poder
            gelificante puede ser contraintuitivo: lo que importa no es el peso sino el bloom.
          </p>

          <h2>Diferencias entre gelatina animal y agar-agar vegetal</h2>
          <p>
            La gelatina animal (de colágeno, generalmente porcino o bovino) y el agar-agar
            (polisacárido extraído de algas rojas) comparten el propósito de gelificar líquidos,
            pero su comportamiento es muy diferente:
          </p>
          <ul>
            <li><strong>Temperatura de gelificación:</strong> la gelatina gelifica en nevera (~4°C); el agar-agar gelifica a temperatura ambiente (30–40°C) y aguanta más calor.</li>
            <li><strong>Punto de fusión:</strong> la gelatina se funde en boca (37°C), de ahí la textura melosa de las panna cottas; el agar-agar no se funde en boca y da una textura más firme y quebradiza.</li>
            <li><strong>Adecuado para veganos:</strong> el agar-agar sí, la gelatina animal no.</li>
            <li><strong>Compatibilidad con frutas ácidas:</strong> la piña, el kiwi, la papaya y el mango frescos contienen enzimas proteolíticas que impiden que la gelatina animal gelificase. El agar-agar no tiene este problema (aunque la acidez puede reducir su poder gelificante).</li>
          </ul>

          <h2>Cómo hidratar la gelatina correctamente</h2>
          <p>
            El error más común es añadir gelatina directamente a un líquido muy caliente sin
            hidratarla antes. El proceso correcto:
          </p>
          <ol>
            <li><strong>Hojas:</strong> sumergir en agua <em>fría</em> durante 5–10 minutos hasta que estén blandas. Escurrir el exceso de agua y añadir al líquido caliente (no hirviendo, idealmente 50–80°C) removiendo bien.</li>
            <li><strong>Polvo:</strong> espolvorear sobre 5 partes de agua fría (sin remover) y dejar reposar 5 minutos para que "florezca". Luego fundir al baño maría o en el microondas a baja potencia.</li>
            <li><strong>Agar-agar:</strong> disolver directamente en el líquido <em>frío</em> removiendo bien y llevar a ebullición durante 1–2 minutos. Si no hierve, no gelificará correctamente.</li>
          </ol>
          <p>
            Por encima de 60°C la gelatina ya está completamente fundida. Por encima de 80–90°C
            de forma prolongada puede perder capacidad gelificante. Nunca añadas gelatina a
            líquidos hirviendo.
          </p>

          <h2>Por qué el agar-agar no sustituye 1:1 a la gelatina</h2>
          <p>
            Aunque esta calculadora ofrece equivalencias matemáticas entre agar-agar y gelatina,
            hay diferencias estructurales que van más allá de la cantidad:
          </p>
          <ul>
            <li>El agar-agar produce una textura <strong>más firme, más quebradiza</strong> y con menos "rebote".</li>
            <li><strong>No se funde en boca</strong>: las panna cottas y gelatinas de fruta pierden la textura melosa característica.</li>
            <li>Aguanta temperaturas ambiente sin derretirse: ventaja para postres de verano.</li>
            <li>En preparaciones ácidas (pH bajo) puede perder poder gelificante.</li>
            <li>El ratio de conversión aproximado es 1 g de agar-agar ≈ 5 g de gelatina en polvo 200 bloom, pero el resultado final no es idéntico en textura.</li>
          </ul>
          <p>
            Para recetas donde la textura melosa es clave (panna cotta, gelatinas de consumo
            directo, postres que deben fundirse en boca), el agar-agar no es un sustituto
            perfecto aunque sea equivalente en poder gelificante.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-gelatina')} />
      <ShareCard appName="calculadora-gelatina" />
      <Footer appName="calculadora-gelatina" />
    </div>
  );
}
