'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import styles from './DisclaimerCard.module.css';

export type DisclaimerVariant = 'financial' | 'general' | 'medical' | 'educational';
export type DisclaimerSeverity = 'critical' | 'high' | 'medium' | 'low';

interface DisclaimerCardProps {
  variant: DisclaimerVariant;
  severity?: DisclaimerSeverity;
  title?: string;
  children?: ReactNode;
  showTermsLink?: boolean;
  collapsible?: boolean;
  context?: string; // Para identificar en localStorage (ej: 'mortgage-guide')
}

const DEFAULT_TITLES: Record<DisclaimerVariant, string> = {
  financial: 'Información Importante sobre Herramientas Financieras',
  medical: 'Aviso Médico Importante',
  general: 'Información Importante',
  educational: 'Aviso Educativo',
};

const DEFAULT_ICONS: Record<DisclaimerVariant, string> = {
  financial: '⚠️',
  medical: '⚕️',
  general: 'ℹ️',
  educational: '📚',
};

export default function DisclaimerCard({
  variant,
  severity = 'high',
  title,
  children,
  showTermsLink = false,
  collapsible = false,
  context,
}: DisclaimerCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hasBeenRead, setHasBeenRead] = useState(false);

  // Cargar estado de localStorage si es collapsible
  useEffect(() => {
    if (collapsible && context) {
      const storageKey = `disclaimer_read_${context}`;
      const wasRead = localStorage.getItem(storageKey) === 'true';
      setHasBeenRead(wasRead);
      setIsExpanded(!wasRead); // Si ya fue leído, comienza colapsado
    }
  }, [collapsible, context]);

  const handleToggle = () => {
    if (collapsible) {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);

      // Marcar como leído cuando se colapsa por primera vez
      if (!newExpandedState && context && !hasBeenRead) {
        const storageKey = `disclaimer_read_${context}`;
        localStorage.setItem(storageKey, 'true');
        setHasBeenRead(true);
      }
    }
  };

  const displayTitle = title || DEFAULT_TITLES[variant];
  const icon = DEFAULT_ICONS[variant];

  // Classes dinámicas
  const cardClasses = [
    styles.disclaimerCard,
    styles[`variant-${variant}`],
    styles[`severity-${severity}`],
    !isExpanded && styles.collapsed,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} role={severity === 'critical' ? 'alert' : 'note'}>
      <div className={styles.header} onClick={collapsible ? handleToggle : undefined}>
        <div className={styles.titleWrapper}>
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
          <h3 className={styles.title}>{displayTitle}</h3>
        </div>
        {collapsible && (
          <button
            type="button"
            className={styles.toggleButton}
            aria-label={isExpanded ? 'Ocultar aviso' : 'Mostrar aviso'}
            aria-expanded={isExpanded}
          >
            <span aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {children || <DefaultContent variant={variant} />}

          {showTermsLink && (
            <p className={styles.termsLink}>
              Para más información, consulta nuestros{' '}
              <Link href="/terminos">Términos de Uso</Link> y{' '}
              <Link href="/privacidad">Política de Privacidad</Link>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Contenido por defecto según variante
function DefaultContent({ variant }: { variant: DisclaimerVariant }) {
  switch (variant) {
    case 'financial':
      return (
        <>
          <p>
            <strong>Esta herramienta es SOLO EDUCATIVA e INFORMATIVA.</strong>
          </p>
          <ul className={styles.list}>
            <li>
              <strong>✗ NO es asesoramiento financiero, legal o fiscal</strong> personalizado
            </li>
            <li>
              <strong>✗ NO reemplaza</strong> consultar con profesionales (banco, asesor, notario)
            </li>
            <li>
              <strong>✗ Los resultados son ESTIMACIONES</strong> basadas en los datos que introduces
            </li>
          </ul>
          <p className={styles.highlight}>
            <strong>Factores que pueden variar según tu caso:</strong>
          </p>
          <ul className={styles.list}>
            <li>Legislación (impuestos cambian por comunidad autónoma)</li>
            <li>Tipos de interés y comisiones específicas de tu banco</li>
            <li>Tu situación crediticia y laboral personal</li>
            <li>Gastos notariales y registrales de tu zona</li>
          </ul>
          <p className={styles.responsibility}>
            <strong>TÚ ERES RESPONSABLE</strong> de verificar esta información con profesionales
            cualificados ANTES de tomar decisiones financieras importantes.
          </p>
          <p className={styles.limitation}>
            meskeIA no se responsabiliza de decisiones basadas en estas herramientas.
          </p>
        </>
      );

    case 'medical':
      return (
        <>
          <p>
            <strong>Esta calculadora es SOLO INFORMATIVA y EDUCATIVA.</strong>
          </p>
          <ul className={styles.list}>
            <li>
              <strong>✗ NO es un dispositivo médico</strong>
            </li>
            <li>
              <strong>✗ NO realiza diagnósticos</strong>
            </li>
            <li>
              <strong>✗ NO sustituye</strong> la consulta médica profesional
            </li>
          </ul>
          <p className={styles.highlight}>
            <strong>SIEMPRE consulta con tu médico</strong> antes de tomar decisiones relacionadas
            con tu salud, dieta, ejercicio o tratamiento médico.
          </p>
          <p className={styles.emergency}>
            <strong>EMERGENCIAS MÉDICAS:</strong> En caso de síntomas graves, contacta
            inmediatamente con servicios de emergencia (112 en España).
          </p>
        </>
      );

    case 'educational':
      return (
        <>
          <p>
            <strong>Este contenido es educativo y orientativo.</strong>
          </p>
          <ul className={styles.list}>
            <li>Los resultados son estimaciones para fines de aprendizaje</li>
            <li>Verifica la información con fuentes oficiales cuando sea necesario</li>
            <li>Consulta con profesionales para aplicaciones prácticas importantes</li>
          </ul>
        </>
      );

    case 'general':
    default:
      return (
        <>
          <p>
            <strong>Esta herramienta proporciona resultados orientativos.</strong>
          </p>
          <p>
            Los resultados son estimaciones basadas en los datos introducidos y no constituyen
            asesoramiento profesional. Verifica la información con fuentes oficiales o profesionales
            cualificados.
          </p>
        </>
      );
  }
}
