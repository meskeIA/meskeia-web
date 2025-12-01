'use client';

import { useState } from 'react';
import styles from './CalculadoraFechaParto.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

export default function CalculadoraFechaPartoPage() {
  const [fechaUltimaRegla, setFechaUltimaRegla] = useState('');
  const [resultado, setResultado] = useState<{
    fechaParto: Date;
    semanasActuales: number;
    diasRestantes: number;
    trimestre: number;
    fechaConcepcion: Date;
  } | null>(null);

  const calcular = () => {
    if (!fechaUltimaRegla) return;

    const fur = new Date(fechaUltimaRegla);
    const hoy = new Date();

    // Fecha probable de parto: FUR + 280 días (40 semanas)
    const fechaParto = new Date(fur);
    fechaParto.setDate(fechaParto.getDate() + 280);

    // Fecha estimada de concepción: FUR + 14 días
    const fechaConcepcion = new Date(fur);
    fechaConcepcion.setDate(fechaConcepcion.getDate() + 14);

    // Semanas actuales de gestación
    const diasTranscurridos = Math.floor((hoy.getTime() - fur.getTime()) / (1000 * 60 * 60 * 24));
    const semanasActuales = Math.floor(diasTranscurridos / 7);

    // Días restantes hasta la fecha de parto
    const diasRestantes = Math.floor((fechaParto.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

    // Trimestre actual
    let trimestre = 1;
    if (semanasActuales >= 13 && semanasActuales < 27) {
      trimestre = 2;
    } else if (semanasActuales >= 27) {
      trimestre = 3;
    }

    setResultado({
      fechaParto,
      semanasActuales: Math.max(0, semanasActuales),
      diasRestantes: Math.max(0, diasRestantes),
      trimestre,
      fechaConcepcion,
    });
  };

  const formatearFecha = (fecha: Date): string => {
    return fecha.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const limpiar = () => {
    setFechaUltimaRegla('');
    setResultado(null);
  };

  // Obtener fecha máxima (hoy) y mínima (hace 42 semanas aprox)
  const hoy = new Date().toISOString().split('T')[0];
  const fechaMinima = new Date();
  fechaMinima.setDate(fechaMinima.getDate() - 294);
  const fechaMinimaStr = fechaMinima.toISOString().split('T')[0];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora Fecha de Parto</h1>
        <p className={styles.subtitle}>
          Calcula tu fecha probable de parto (FPP) y semanas de gestación
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Datos del embarazo</h2>

          <div className={styles.inputGroup}>
            <label>Fecha de última regla (FUR)</label>
            <input
              type="date"
              value={fechaUltimaRegla}
              onChange={(e) => setFechaUltimaRegla(e.target.value)}
              min={fechaMinimaStr}
              max={hoy}
              className={styles.input}
            />
            <span className={styles.hint}>
              Primer día de tu última menstruación
            </span>
          </div>

          <div className={styles.botones}>
            <button onClick={calcular} className={styles.btnPrimary}>
              Calcular
            </button>
            <button onClick={limpiar} className={styles.btnSecondary}>
              Limpiar
            </button>
          </div>

          {/* Info sobre el cálculo */}
          <div className={styles.infoCalculo}>
            <h4>ℹ️ ¿Cómo se calcula?</h4>
            <p>
              La fecha probable de parto se calcula sumando <strong>280 días</strong> (40 semanas)
              a la fecha de tu última regla, según la regla de Naegele.
            </p>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              {/* Fecha probable de parto */}
              <div className={styles.resultadoPrincipal}>
                <span className={styles.resultadoIcon}>👶</span>
                <div className={styles.resultadoFecha}>
                  {formatearFecha(resultado.fechaParto)}
                </div>
                <div className={styles.resultadoLabel}>
                  Fecha Probable de Parto (FPP)
                </div>
              </div>

              {/* Progreso del embarazo */}
              <div className={styles.progresoEmbarazo}>
                <div className={styles.progresoInfo}>
                  <span>Semana {resultado.semanasActuales} de 40</span>
                  <span>{Math.round((resultado.semanasActuales / 40) * 100)}%</span>
                </div>
                <div className={styles.progresoBar}>
                  <div
                    className={styles.progresoFill}
                    style={{ width: `${Math.min((resultado.semanasActuales / 40) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Detalles */}
              <div className={styles.detalles}>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Trimestre actual</span>
                  <span className={styles.detalleValor}>
                    {resultado.trimestre}º trimestre
                  </span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Semanas de gestación</span>
                  <span className={styles.detalleValor}>
                    {resultado.semanasActuales} semanas
                  </span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Días restantes</span>
                  <span className={styles.detalleValor}>
                    {resultado.diasRestantes} días
                  </span>
                </div>
                <div className={styles.detalleItem}>
                  <span className={styles.detalleLabel}>Fecha estimada de concepción</span>
                  <span className={styles.detalleValor}>
                    {resultado.fechaConcepcion.toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>

              {/* Trimestres info */}
              <div className={styles.trimestres}>
                <div className={`${styles.trimestreCard} ${resultado.trimestre === 1 ? styles.activo : ''}`}>
                  <strong>1er Trimestre</strong>
                  <span>Semanas 1-12</span>
                </div>
                <div className={`${styles.trimestreCard} ${resultado.trimestre === 2 ? styles.activo : ''}`}>
                  <strong>2º Trimestre</strong>
                  <span>Semanas 13-26</span>
                </div>
                <div className={`${styles.trimestreCard} ${resultado.trimestre === 3 ? styles.activo : ''}`}>
                  <strong>3er Trimestre</strong>
                  <span>Semanas 27-40</span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🤰</span>
              <p>Introduce la fecha de tu última regla para calcular</p>
            </div>
          )}
        </div>
      </div>

      {/* DISCLAIMER - SIEMPRE VISIBLE */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Médico Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> basada en la regla de Naegele.
          La fecha probable de parto es solo una aproximación; solo el 5% de los bebés nacen en su fecha estimada.
        </p>
        <p>
          <strong>Esta herramienta NO sustituye el seguimiento médico profesional.</strong> Consulta siempre con
          tu ginecólogo/a o matrona para un control adecuado del embarazo. Los profesionales de salud utilizan
          ecografías y otros métodos para determinar con mayor precisión la edad gestacional.
        </p>
      </div>

      <Footer appName="calculadora-fecha-parto" />
    </div>
  );
}
