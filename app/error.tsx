'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar error en consola (podría enviarse a servicio de monitoreo)
    console.error('❌ Error global capturado:', error);
    console.error('Stack:', error.stack);
    if (error.digest) {
      console.error('Digest:', error.digest);
    }
  }, [error]);

  return (
    <>
      <MeskeiaLogo />

      <div
        className="container-md"
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-4xl) var(--spacing-md)',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {/* Icono de error */}
        <div style={{
          fontSize: '4rem',
          marginBottom: 'var(--spacing-lg)',
          filter: 'grayscale(0.5)',
        }}>
          ⚠️
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: '2rem',
          marginBottom: 'var(--spacing-md)',
          color: 'var(--text-primary)',
        }}>
          Algo salió mal
        </h1>

        {/* Descripción */}
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: 'var(--spacing-xl)',
          lineHeight: '1.6',
        }}>
          Ha ocurrido un error inesperado. No te preocupes, tus datos están seguros.
          Puedes intentar recargar la aplicación.
        </p>

        {/* Información técnica (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <details style={{
            marginBottom: 'var(--spacing-xl)',
            textAlign: 'left',
            background: 'var(--bg-secondary)',
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <summary style={{
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-sm)',
            }}>
              🔍 Detalles técnicos (desarrollo)
            </summary>
            <pre style={{
              fontSize: '0.85rem',
              overflow: 'auto',
              padding: 'var(--spacing-sm)',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
            }}>
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Button
            onClick={reset}
            variant="primary"
          >
            🔄 Intentar de nuevo
          </Button>

          <Button
            onClick={() => window.location.href = '/'}
            variant="secondary"
          >
            🏠 Volver al inicio
          </Button>
        </div>

        {/* Mensaje adicional */}
        <p style={{
          marginTop: 'var(--spacing-xl)',
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
        }}>
          Si el problema persiste, por favor{' '}
          <a
            href="https://github.com/meskeia/feedback/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--primary)',
              textDecoration: 'underline',
            }}
          >
            repórtalo aquí
          </a>.
        </p>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}
