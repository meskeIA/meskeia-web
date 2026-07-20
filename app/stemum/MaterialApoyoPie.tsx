import Link from 'next/link';
import { materialDeDisciplina } from '@/data/stemum';
import styles from './StemumHome.module.css';

/**
 * Enlace al pie de una página de disciplina hacia su material de apoyo.
 *
 * Va al pie y no en la parrilla a propósito: las páginas de disciplina prometen
 * simuladores manipulables en tiempo real, y una tabla de consulta rompería esa
 * promesa si se mezclara con las tarjetas.
 *
 * No renderiza nada si la disciplina aún no tiene material, así que se puede
 * dejar puesto en las seis páginas sin que aparezca una frase coja.
 */
export default function MaterialApoyoPie({
  disciplina,
  pregunta,
}: {
  disciplina: string;
  pregunta: string;
}) {
  const material = materialDeDisciplina(disciplina);
  if (material.length === 0) return null;

  return (
    <p className={styles.apoyoPie}>
      {pregunta}{' '}
      {material.map((m, i, arr) => (
        <span key={m.slug}>
          <Link href={`/${m.slug}`} className={styles.link}>{m.titulo}</Link>
          {i < arr.length - 2 ? ', ' : i === arr.length - 2 ? ' y ' : ''}
        </span>
      ))}
      {' '}en{' '}
      <Link href="/material-apoyo" className={styles.link}>Material de apoyo</Link>.
    </p>
  );
}
