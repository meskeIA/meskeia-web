'use client';

import { useState } from 'react';
import styles from './VisualizadorPesoNumeros.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Datos: escalas numéricas
// ─────────────────────────────────────────────

interface Escala {
  id: string;
  cifra: number;
  etiqueta: string;
  icono: string;
  color: string;
  equivalencias: string[];
  tiempoContar: string; // cuánto tardarías en contar 1 por segundo
  pilaMonedas: string; // altura de la pila en monedas de 1€
}

const ESCALAS: Escala[] = [
  {
    id: 'mil',
    cifra: 1000,
    etiqueta: 'Mil (1.000 €)',
    icono: '💵',
    color: '#27ae60',
    equivalencias: [
      'Una compra grande de supermercado para un mes',
      '2 noches de hotel en una ciudad española',
      'La reparación media de un coche',
      '~70 horas de trabajo al salario mínimo',
    ],
    tiempoContar: '17 minutos',
    pilaMonedas: '2,3 metros (como una puerta alta)',
  },
  {
    id: 'diez-mil',
    cifra: 10000,
    etiqueta: 'Diez mil (10.000 €)',
    icono: '💰',
    color: '#2E86AB',
    equivalencias: [
      'Un coche usado en buen estado',
      '~6 meses de alquiler en Madrid',
      'Un año de universidad privada',
      'El ahorro anual medio de un hogar español',
    ],
    tiempoContar: '2 horas y 47 minutos',
    pilaMonedas: '23 metros (como un edificio de 7 pisos)',
  },
  {
    id: 'cien-mil',
    cifra: 100000,
    etiqueta: 'Cien mil (100.000 €)',
    icono: '🏦',
    color: '#48A9A6',
    equivalencias: [
      'Un piso pequeño en una ciudad mediana',
      'Un sueldo bruto de ~3.300 €/mes durante 30 años de ahorro',
      '50 años de café diario a 1,80 €',
      '~3 años de sueldo medio español (antes de impuestos)',
    ],
    tiempoContar: '1 día, 3 horas y 47 minutos',
    pilaMonedas: '230 metros (como una torre de 60 pisos)',
  },
  {
    id: 'millon',
    cifra: 1000000,
    etiqueta: 'Un millón (1.000.000 €)',
    icono: '💎',
    color: '#9b59b6',
    equivalencias: [
      'Un piso céntrico en Madrid o Barcelona',
      '~33 años de sueldo medio español bruto',
      '4.000 iPhones',
      'Vivir 40 años gastando 2.083 € al mes',
    ],
    tiempoContar: '11 días y 14 horas (contando sin parar)',
    pilaMonedas: '2,3 km (del centro de Madrid a Atocha)',
  },
  {
    id: 'cien-millones',
    cifra: 100000000,
    etiqueta: 'Cien millones (100.000.000 €)',
    icono: '🏙️',
    color: '#e67e22',
    equivalencias: [
      'El precio de un rascacielos pequeño',
      'El presupuesto anual de un municipio de ~30.000 habitantes',
      '~3.300 años de sueldo medio español',
      '500 pisos de 200.000 €',
    ],
    tiempoContar: '3 años, 2 meses y 10 días',
    pilaMonedas: '230 km (Madrid a Toledo y vuelta, por los aires)',
  },
  {
    id: 'mil-millones',
    cifra: 1000000000,
    etiqueta: 'Mil millones (1.000.000.000 €)',
    icono: '🌍',
    color: '#e74c3c',
    equivalencias: [
      'La fortuna de una persona ultrarica (top 500 España)',
      '~33.000 años de sueldo medio español',
      'Construir un hospital de última generación',
      '200 años de presupuesto de un pueblo de 5.000 habitantes',
    ],
    tiempoContar: '31 años y 9 meses',
    pilaMonedas: '2.300 km (Madrid a Estocolmo en línea recta)',
  },
  {
    id: 'billon',
    cifra: 1000000000000,
    etiqueta: 'Un billón (1.000.000.000.000 €)',
    icono: '🌌',
    color: '#34495e',
    equivalencias: [
      'Aproximadamente el 70% del PIB de España (~1,4 billones)',
      'La deuda pública española (~1,6 billones)',
      '~33 millones de años de sueldo medio',
      '5 millones de pisos de 200.000 €',
    ],
    tiempoContar: '31.710 años (más que toda la civilización humana)',
    pilaMonedas: '2,3 millones de km (6 veces la distancia a la Luna)',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorPesoNumerosPage() {
  const [escalaActiva, setEscalaActiva] = useState<string>(ESCALAS[3].id); // Empieza en "millón"

  const escala = ESCALAS.find(s => s.id === escalaActiva)!;

  // Barra proporcional: el billón es el 100%
  const maxCifra = ESCALAS[ESCALAS.length - 1].cifra;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Peso de los Números</h1>
          <p className={styles.subtitle}>¿Qué significa realmente un millón? ¿Y un billón? Comparaciones que hacen tangibles las grandes cifras</p>
        </header>

        <LegalNotice />

        {/* Selector de escala */}
        <div className={styles.escalasNav}>
          {ESCALAS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.escalaBtn} ${escalaActiva === s.id ? styles.escalaActiva : ''}`}
              onClick={() => setEscalaActiva(s.id)}
              style={{ borderColor: escalaActiva === s.id ? s.color : undefined }}
              aria-pressed={escalaActiva === s.id}
            >
              <span className={styles.escalaBtnIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.escalaBtnTexto}>{s.cifra >= 1000000000 ? formatNumber(s.cifra / 1000000000, 0) + ' MM' : s.cifra >= 1000000 ? formatNumber(s.cifra / 1000000, 0) + ' M' : formatNumber(s.cifra, 0)}</span>
            </button>
          ))}
        </div>

        {/* Cifra principal */}
        <div className={styles.cifraPrincipal} style={{ borderLeftColor: escala.color }}>
          <span className={styles.cifraIcono} aria-hidden="true">{escala.icono}</span>
          <div>
            <h2 className={styles.cifraTitulo} style={{ color: escala.color }}>{escala.etiqueta}</h2>
            <p className={styles.cifraNumero}>{formatNumber(escala.cifra, 0)} €</p>
          </div>
        </div>

        {/* Equivalencias */}
        <div className={styles.equivalencias}>
          <h3 className={styles.seccionTitulo}>¿Qué puedes hacer con {formatNumber(escala.cifra, 0)} €?</h3>
          <div className={styles.equivGrid}>
            {escala.equivalencias.map((eq, i) => (
              <div key={i} className={styles.equivCard}>
                <span className={styles.equivNum}>{i + 1}</span>
                <p className={styles.equivTexto}>{eq}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Datos curiosos */}
        <div className={styles.datosGrid}>
          <div className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">⏱️</span>
            <span className={styles.datoLabel}>Contar 1 por segundo</span>
            <span className={styles.datoValor} style={{ color: escala.color }}>{escala.tiempoContar}</span>
          </div>
          <div className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">🪙</span>
            <span className={styles.datoLabel}>Pila de monedas de 1 €</span>
            <span className={styles.datoValor} style={{ color: escala.color }}>{escala.pilaMonedas}</span>
          </div>
        </div>

        {/* Barra de escala visual */}
        <div className={styles.barraEscala}>
          <h3 className={styles.seccionTitulo}>Proporción visual (escala logarítmica)</h3>
          {ESCALAS.map(s => {
            const logPct = (Math.log10(s.cifra) / Math.log10(maxCifra)) * 100;
            return (
              <div key={s.id} className={styles.barraItem}>
                <span className={styles.barraLabel}>{s.icono} {s.cifra >= 1000000000000 ? '1 billón' : s.cifra >= 1000000000 ? formatNumber(s.cifra / 1000000000, 0) + ' mil M' : s.cifra >= 1000000 ? formatNumber(s.cifra / 1000000, 0) + ' M' : formatNumber(s.cifra, 0)}</span>
                <div className={styles.barraFondo}>
                  <div
                    className={styles.barra}
                    style={{
                      width: `${logPct}%`,
                      backgroundColor: s.id === escalaActiva ? s.color : '#ccc',
                    }}
                  />
                </div>
              </div>
            );
          })}
          <p className={styles.barraNota}>Nota: si esta escala fuera lineal (no logarítmica), la barra de 1.000 € sería invisible — un millonésimo de píxel.</p>
        </div>

        <div className={styles.insight}>
          <p>
            El cerebro humano no está diseñado para comprender diferencias entre millones y miles de millones.
            <strong> Un millón de segundos son 11 días. Mil millones de segundos son 31 años.</strong>
            La diferencia entre &quot;mucho&quot; y &quot;muchísimo&quot; es mayor de lo que intuimos.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más perspectiva → <a href="/visualizador-escalas-tiempo/">Cuánto Tarda el Mundo</a> · <a href="/visualizador-viaje-impuestos/">El Viaje de tus Impuestos</a>
        </div>

        <EducationalSection
          title="Los números que gobiernan el mundo"
          subtitle="Por qué importa entender las escalas"
          defaultOpen={false}
        >
          <h3>El billón español vs el billón americano</h3>
          <p>
            En español, un billón = un millón de millones (10¹²). En inglés, &quot;one billion&quot; =
            mil millones (10⁹). Cuando lees &quot;a billion dollar company&quot;, son mil millones,
            no un billón. Esta confusión causa malentendidos constantes en la prensa.
          </p>

          <h3>La deuda pública: un número que no procesamos</h3>
          <p>
            España debe ~1,6 billones de euros. ¿Cómo visualizarlo? Si repartieras esa deuda entre
            todos los españoles (47 millones), cada persona debería ~34.000 €. Cada bebé nace con
            esa deuda. Y cada año se pagan ~38.000 millones solo en intereses.
          </p>

          <h3>La riqueza extrema: números sin contexto</h3>
          <p>
            Las fortunas de los ultraricos se miden en miles de millones. Si alguien tiene 100.000
            millones de euros y gastara 1 millón al día, tardaría <strong>274 años</strong> en quedarse
            sin nada — sin contar que su dinero genera más dinero mientras duerme.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> las equivalencias son orientativas y usan precios medios de 2025.
            La deuda pública y el PIB son datos aproximados que cambian cada trimestre.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-peso-numeros')} />
        <ShareCard appName="visualizador-peso-numeros" />
        <Footer appName="visualizador-peso-numeros" />
      </div>
    </>
  );
}
